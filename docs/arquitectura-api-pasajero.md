# Arquitectura — API del pasajero (puerto y adaptador)

> **SUPUESTO hasta recibir la API real.** Todavía no se conocen la forma ni el funcionamiento de la API que simula al pasajero. Este documento fija el contrato **interno** de la app (D-78). Cuando llegue la API real se escribe su adaptador sin tocar pantallas ni hooks.

Decisiones relacionadas: D-76 (comisión 0.20 en `pricing.js`), D-77 (sin FCM; tiempo real detrás del contrato), D-78 (este contrato), D-79 (mapa obligatorio). Requisitos: RF-10 a RF-13, RF-20 a RF-23, RNF-03 (`useTripRequests`).

## 1. Estructura de carpetas

```
src/services/passengerApi/
  index.js             puerto: elige el adaptador y reexporta las 6 operaciones
  contract.js          documentación JSDoc de modelos, operaciones y errores (+ validadores ligeros)
  mockPassengerApi.js  adaptador simulado (activo por defecto)
  httpPassengerApi.js  adaptador real (esqueleto hasta conocer la API)
  mappers.js           ÚNICO archivo que conoce la forma de la API real
src/config/passengerApi.js   constante PASSENGER_API_MODE = 'mock' | 'http'
```

| Archivo | Qué hace | Qué NO hace |
|---|---|---|
| `index.js` | Lee `PASSENGER_API_MODE` y exporta las operaciones del adaptador elegido | Lógica de negocio o red |
| `contract.js` | Define con JSDoc `TripRequest`, `Trip`, `TripStatus`, `PassengerApiError` y los códigos de error; exporta las constantes de estado y error | Llamar a nada |
| `mockPassengerApi.js` | Genera solicitudes con la forma interna, cerca de la posición real del conductor; simula tiempos, vencimiento y "ya tomada" | Conocer HTTP o la forma real |
| `httpPassengerApi.js` | `fetch` contra `EXPO_PUBLIC_PASSENGER_API_URL`, sondeo o suscripción según lo que ofrezca la API; normaliza errores | Dar forma a los datos (eso lo hace `mappers.js`) |
| `mappers.js` | `toTripRequest(raw)`, `toTrip(raw)`, `fromTripStatus(status)`, `fromLocation(loc)`, `toPassengerApiError(raw)` | Red, estado, interfaz |

Las pantallas (`TripRequestScreen`, `TripActiveScreen`, `TripSummaryScreen`) y los hooks (`useTripRequests`, `useDriverLocation`) importan **solo** de `src/services/passengerApi` (el `index.js`), nunca de un adaptador.

## 2. Modelos internos

### TripRequest
| Campo | Tipo | Nota |
|---|---|---|
| `id` | string | id de la solicitud |
| `passenger` | `{ name: string, rating?: number }` | calificación opcional (1 a 5) |
| `origin` | `{ lat: number, lng: number, address: string }` | recogida |
| `destination` | `{ lat: number, lng: number, address: string }` | destino |
| `distanceKm` | number | distancia del viaje (origen a destino) |
| `durationMin` | number | duración estimada |
| `category` | `'economico' \| 'xl' \| 'premium'` | mismos valores que el registro (`registrationOptions.js`, RF-06) |
| `paymentMethod` | `'card' \| 'cash'` | RF-10 lo exige en la tarjeta; el mock lo inventa |
| `createdAt` | number (ms epoch) | |
| `expiresAt` | number (ms epoch) | `createdAt + 15 000` (RF-11) |

La tarifa estimada y la ganancia neta **no** vienen de la API: la app las calcula (sección 6).

### Trip
| Campo | Tipo | Nota |
|---|---|---|
| `id` | string | igual al `id` de la solicitud aceptada, salvo que la API asigne otro |
| `request` | TripRequest | copia de la solicitud |
| `status` | TripStatus | ver abajo |
| `acceptedAt`, `pickedUpAt?`, `completedAt?`, `cancelledAt?` | number | marcas de tiempo |

`TripStatus` está alineado con RF-13:

| Estado interno | Cuándo |
|---|---|
| `accepted` | el conductor aceptó |
| `driver_arriving` | el conductor va hacia el pasajero (el recorrido en el mapa) |
| `in_progress` | «Pasajero a bordo»: la ruta cambia al destino |
| `completed` | el conductor finaliza |
| `cancelled` | el conductor o el pasajero cancela |

`requested`, `rejected` y `paid` de RF-13 pertenecen a la solicitud o al pago (rebanada C), no al viaje activo. Si la API los envía, `mappers.js` los traduce o los ignora.

## 3. Operaciones del contrato

Todas devuelven `Promise` salvo `subscribeToRequests`. Todas rechazan **solo** con `PassengerApiError`.

| Operación | Firma | Semántica |
|---|---|---|
| `subscribeToRequests` | `(onRequest: (req: TripRequest) => void, onError?: (e) => void) => unsubscribe` | Entrega solicitudes nuevas mientras el conductor está Disponible. La función que devuelve se llama en la limpieza del `useEffect` (RF-09, RNF-02). |
| `acceptRequest` | `(requestId) => Promise<Trip>` | Devuelve el viaje en `accepted`. Puede fallar con `EXPIRED` o `ALREADY_TAKEN`. |
| `rejectRequest` | `(requestId) => Promise<void>` | Rechazo manual o automático al llegar a 0 (RF-11). |
| `reportTripStatus` | `(tripId, status: TripStatus) => Promise<Trip>` | `driver_arriving` → `in_progress` → `completed`. |
| `cancelTrip` | `(tripId) => Promise<Trip>` | Pasa a `cancelled`. |
| `reportDriverLocation` | `(tripId, { lat, lng, timestamp }) => Promise<void>` | Para que el pasajero vea al conductor. **Límite de frecuencia** en el llamador (ver `arquitectura-mapa-recorrido.md` §6). Los errores de red se descartan en silencio y se reintenta en el siguiente punto. |

### Errores normalizados
`PassengerApiError { code, message, cause? }`, con `code` igual a uno de:

| Código | Cuándo | Qué muestra la app |
|---|---|---|
| `NETWORK` | sin conexión, tiempo de espera agotado o 5xx | `ScreenState kind="error"` con `onRetry` |
| `EXPIRED` | la solicitud venció antes de aceptar | aviso «La solicitud venció» y se vuelve a esperar |
| `ALREADY_TAKEN` | otro conductor la tomó | aviso «Otro conductor tomó el viaje» |
| `UNAUTHORIZED` | 401/403 o sesión inválida | error sin reintento automático |

Los textos van en `labels.js` (tarea de la rebanada B).

## 4. Selector y configuración
- **Selector:** una constante en código, `PASSENGER_API_MODE = 'mock'` en `src/config/passengerApi.js`. No es variable de entorno ni secreto, y se cambia a `'http'` el día que llegue la API.
- **URL base:** variable `EXPO_PUBLIC_PASSENGER_API_URL`. En `.env.example` va solo el **nombre**, nunca un valor. Si la API exige una clave secreta, esa clave **no** va en la app: se intermedia con el backend Express (RNF-05).

## 5. El mock
- Reemplaza el botón «Simular solicitud (provisional)» (`src/constants/labels.js`, clave `startTrip`). Al ponerse Disponible, el mock emite una solicitud cada N segundos (constante, por ejemplo entre 10 y 20 s), de a una a la vez.
- Genera datos con la **forma interna** (sección 2) y coordenadas **reales cercanas** a la posición actual del conductor: el origen a 300–1500 m y el destino a 2–8 km, con desplazamientos aleatorios de lat/lng. La dirección es un texto genérico («Calle cercana (simulada)»), porque la geocodificación inversa queda fuera de alcance. `distanceKm` y `durationMin` se aproximan por distancia en línea recta × 1,3 y una velocidad media de 25 km/h.
- Simula los casos de error con una probabilidad baja configurable: `ALREADY_TAKEN` y `EXPIRED`, este último si se acepta después de `expiresAt`.
- `reportDriverLocation` y `reportTripStatus` del mock solo registran en memoria (y en `console` en modo desarrollo).

## 6. Tarifa y comisión
- Se calculan **en la app** con la función pura `calculateFare({ distanceKm, durationMin, category, tip })` de la spec 004 (RF-20 a RF-22), con los parámetros de `src/config/pricing.js` y `COMMISSION_RATE = 0.20` (D-76).
- La tarjeta de solicitud (RF-10) muestra la tarifa estimada y la ganancia neta calculadas con `distanceKm` y `durationMin` del `TripRequest`. El cierre del viaje usa la misma función (RF-20).
- Si la API real enviara su propia tarifa, se ignora para la ganancia del conductor y se registra como dato informativo (decisión a confirmar cuando llegue).

## 7. El día que llegue la API real

**Cambia (lista corta):**
1. `mappers.js`: traducir la forma real a `TripRequest`/`Trip` y los estados.
2. `httpPassengerApi.js`: rutas, método, sondeo o suscripción, y la traducción de códigos HTTP a errores normalizados.
3. `PASSENGER_API_MODE = 'http'` y el valor de `EXPO_PUBLIC_PASSENGER_API_URL` en el `.env` local de Anderson.
4. Si hace falta autenticación secreta: una ruta intermediaria en `backend/`.

**No cambia nunca:**
- Las pantallas de viaje, los hooks y la navegación.
- Los modelos internos `TripRequest`/`Trip` y los nombres de estados.
- Las 6 firmas del contrato y los códigos de error.
- `calculateFare` y `pricing.js`.
- El módulo de ruta (`src/services/routing/*`) y la fuente de posición.
- `mockPassengerApi.js`, que se conserva para demos y pruebas sin red.
