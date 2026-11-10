# Arquitectura — Mapa y recorrido del conductor en tiempo real

Estado: propuesta técnica para la rebanada 0 y la B (D-79). Requisito de la profesora (obligatorio): mostrar en un mapa la ruta **por calles** desde la posición del conductor (Y) hasta la del pasajero (X), y el marcador del conductor avanzando por ella en tiempo real hasta llegar a X.
Requisitos: RF-08, RF-09, RF-12, RNF-03 (`useDriverLocation`), RNF-06 (mapa y geolocalización), RNF-07 (OSRM/ORS), RNF-08, RNF-10.
Proyecto: `expo` ~57.0.31, `react-native` 0.86.3, development build (RNF-12). Evidencia consultada el 2026-11-10; lo marcado **(no verificado)** no se pudo confirmar en documentación oficial.

## 1. Biblioteca de mapa

| Opción | Estado en SDK 57 | Veredicto |
|---|---|---|
| **`react-native-maps`** | Documentada en la referencia del SDK 57 (página «MapView»), versión empaquetada **1.27.2**. Se instala con `npx expo install react-native-maps`. Plugin de configuración propio. Funciona en development build; no requiere `prebuild` manual porque el plugin configura lo nativo. | **Recomendada** |
| `expo-maps` (~57.0.4) | En **alfa** según su página del SDK 57. En iOS usa Apple Maps y en Android Google Maps. No funciona en Expo Go. API distinta y con cambios esperables. | Descartada por ser alfa |
| WebView + Leaflet | `react-native-webview` está en «proposed». Evita la clave de Google, pero el rendimiento y el marcador animado dependen de puentear mensajes. | Solo como parte del Plan B (§9) |

**Configuración de `react-native-maps` (doc SDK 57):**
- Plugin: `["react-native-maps", { "androidGoogleMapsApiKey": "...", "iosGoogleMapsApiKey": "..." }]`.
- La documentación advierte que `process.env.X` escrito dentro de `app.json` es **texto literal**. Por eso hace falta `app.config.js` (D-81).
- **Android:** exige una clave de Google con **«Maps SDK for Android»** habilitado, restringida a «Android apps» con el paquete `com.andersonlondono.uberclone` y la huella **SHA-1** del certificado con que se firma el build. Para el build local de depuración, esa huella sale de `android/app/debug.keystore`, por ejemplo con `cd android && ./gradlew signingReport`. Esto es práctica estándar de Android, **(no verificado en la doc de Expo)**. Hay que reconstruir tras cada cambio del plugin.
- **iOS:** sin `provider`, usa Apple Maps y **no necesita clave**. Con `provider={PROVIDER_GOOGLE}` necesita `iosGoogleMapsApiKey`. Se propone Apple Maps en iOS (sin clave) y Google en Android. El build de iOS queda condicionado a que Anderson tenga Mac o cuenta de EAS **(no verificado para este equipo)**.
- **Costo:** la página de precios de Google indica que el SKU «Maps SDK» móvil **sin map ID** es gratuito e ilimitado. El «Dynamic Maps» con map ID cuesta 10.000 cargas gratis al mes y luego USD 7 por 1.000, así que **no** se usa map ID. Google Cloud pide una **cuenta de facturación** asociada al proyecto para emitir claves de Maps **(no verificado textualmente en las páginas consultadas; es la práctica conocida)**. RNF-08 pide una alerta de presupuesto.

## 2. Ruta por calles: comparación de proveedores

| | **OSRM (servidor demo)** | **OpenRouteService** | **Google (Routes API)** |
|---|---|---|---|
| Clave | No (la wiki del servidor demo no la menciona) **(no verificado que nunca la exija)** | Sí (cuenta gratuita) | Sí, más facturación |
| Costo | Gratis | Gratis en el plan Standard | Compute Routes Essentials: 10.000 al mes gratis y luego USD 5 por 1.000 |
| Límites | **Máx. 1 petición por segundo**, uso «razonable» y no comercial, sin garantía ni SLA, user agent válido y atribución a OpenStreetMap obligatoria | Directions: **2.000/día y 40/min**; al exceder, 403 (diario) o 429 (por minuto) | Cuotas por proyecto |
| Estado | Activo, pero sin garantías | Aviso de cierre del endpoint `api.openrouteservice.org` en nov. 2026 **(no verificado)** | **Directions API es «Legacy»**: según su página, desde octubre de 2026 no se puede habilitar en proyectos nuevos. RF-12 la nombra, pero el reemplazo es Routes API. |
| Petición | `GET https://router.project-osrm.org/route/v1/driving/{lngY},{latY};{lngX},{latX}?overview=full&geometries=geojson` (orden **lng,lat**) | `POST /v2/directions/driving-car/geojson` con la clave en la cabecera | `POST routes.googleapis.com/directions/v2:computeRoutes` con máscara de campos |
| Respuesta | `code:"Ok"`, `routes[0].distance` (m), `routes[0].duration` (s), `routes[0].geometry` | GeoJSON o polilínea codificada de precisión 1e5 | `routes[0].polyline.encodedPolyline`, `distanceMeters`, `duration` |
| Decodificar | Con `geometries=geojson`: **nada**, un arreglo `[lng,lat]` que se invierte a `{latitude, longitude}`. Con `polyline` o `polyline6` se usa el algoritmo de polilínea de Google con precisión 1e5 o 1e6. | Con el endpoint `/geojson`: nada | Polilínea codificada de precisión 1e5: decodificador de unas 25 líneas, sin dependencia |
| Clave expuesta en la app | No aplica | Sí, salvo que pase por el backend | Sí, salvo que pase por el backend |

**Recomendación para la demo:** **OSRM demo con `geometries=geojson`**. Es gratis, no necesita clave ni facturación, y no requiere decodificar nada.
- **Una sola petición por tramo:** al aceptar (Y→X) y al pulsar «Pasajero a bordo» (X→destino). **Nunca** una por posición, para respetar 1 petición por segundo. Se añade atribución «© OpenStreetMap» visible sobre el mapa.
- **Respaldo 1:** OpenRouteService, con la clave detrás del backend Express si se usa.
- **Respaldo 2 (sin red):** el generador local `straightLineRoute` interpola 20–50 puntos entre Y y X. No va por calles, pero garantiza que la demo nunca se quede en blanco, y se marca en pantalla como «Ruta aproximada».
- RF-12 queda cubierto en lo funcional con otro proveedor. Es una desviación del nombre «Google Directions» que se justifica porque esa API ya no puede habilitarse en proyectos nuevos.

**Aislamiento:** `src/services/routing/`
```
index.js           getRoute(from, to) -> Promise<{ coordinates: {latitude,longitude}[], distanceM, durationS, provider }>
osrmRouting.js     adaptador OSRM (por defecto)
orsRouting.js      adaptador ORS (opcional; vacío hasta usarlo)
straightLine.js    respaldo local sin red
```
- Una constante `ROUTING_PROVIDER = 'osrm'` en `src/config/routing.js` elige el adaptador.
- Si el proveedor falla, `index.js` devuelve el error normalizado (`ROUTE_FAILED`), y la pantalla ofrece reintentar o usar la ruta aproximada.
- Las pantallas nunca construyen URLs de enrutamiento.

## 3. Fuente de posición del conductor (intercambiable)

Interfaz común en `src/services/location/`:
```
index.js            watchDriverPosition(onPosition, onError, { route? }) -> unsubscribe
gpsSource.js        GPS real con expo-location
simulatedSource.js  recorre la polilínea de la ruta
```
Una constante `LOCATION_SOURCE = 'simulated' | 'gps'` (en `src/config/location.js`) elige la fuente. Ambas entregan `{ lat, lng, heading?, speed?, timestamp }`.

1. **GPS real (`expo-location`).** El paquete está en la referencia del SDK 57: la página indica ~57.0.23 y el `bundledNativeModules.json` local ~57.0.22. `npx expo install expo-location` resuelve la versión compatible.
   - Permiso: `requestForegroundPermissionsAsync()`, con el estado comparado contra `'granted'`.
   - Seguimiento: `watchPositionAsync({ accuracy: Accuracy.High, timeInterval: 2000, distanceInterval: 5 }, callback, errorHandler)`, que devuelve una suscripción con `.remove()`.
   - Solo funciona en **primer plano**. `timeInterval` solo tiene efecto en Android.
   - El plugin `expo-location` acepta `locationWhenInUsePermission` (texto del permiso en iOS, en español) e `isAndroidBackgroundLocationEnabled` (por defecto `false`, se deja así).
   - Android: el plugin añade `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION` **(lista exacta no verificada textualmente)**.
2. **Simulada.** Recibe la polilínea de `getRoute` y emite una posición cada 1 s, avanzando a una velocidad constante configurable (por defecto 40 km/h, con un multiplicador de demo ×2 o ×4) e interpolando entre vértices. Sirve para la demo y el video sin salir de casa. También simula el arranque con la posición real del GPS si está disponible, o con una posición fija de Medellín si no.

`useDriverLocation` (RNF-03) envuelve la fuente: se suscribe en `useEffect` y llama a `unsubscribe` en la limpieza al pasar a No disponible o al salir (RF-09).

## 4. Comportamiento en pantalla (`TripActiveScreen`, estado `driver_arriving`)
- **Marcadores:** pasajero en X (origen de la solicitud) y conductor en su posición actual, con el ícono rotado según `heading` si existe. En `in_progress`, el marcador de destino reemplaza al del pasajero.
- **Polilínea:** la ruta de `getRoute` (con `Polyline` de `react-native-maps`, coherente con RNF-10). Se recorta opcionalmente la parte ya recorrida.
- **Cámara:** sigue al conductor con `animateCamera` en cada posición, con un límite de una animación por segundo. Al cargar la ruta, `fitToCoordinates` encuadra Y y X.
- **Tiempo y distancia restantes:**
  - Distancia: la distancia sobre la polilínea desde el punto más cercano al conductor hasta X, calculada con haversine sobre los vértices, sin red.
  - Tiempo: la distancia restante por `durationS / distanceM` de la ruta.
- **Llegada:** si la distancia en línea recta a X es **≤ 30 m** (constante `ARRIVAL_THRESHOLD_M`), se muestra «Llegaste» y se habilita «Pasajero a bordo», que llama a `reportTripStatus(id, 'in_progress')` y pide la ruta X→destino. Llegar al destino con el mismo umbral habilita «Finalizar viaje» (`completed`).
- **Errores (con `ScreenState` existente):**
  - Sin permiso de ubicación → `kind="error"` con texto que lleva a Ajustes, y `onRetry` vuelve a pedir el permiso.
  - GPS perdido (no llega posición en 15 s) → aviso no bloqueante; el mapa conserva la última posición.
  - Ruta fallida → `kind="error"` con `onRetry`, más el botón secundario «Usar ruta aproximada».
  - Carga inicial → `kind="loading"`.

## 5. Estados del viaje en la pantalla
`accepted` → (ruta Y→X cargada) `driver_arriving` → (≤ 30 m y «Pasajero a bordo») `in_progress` → (≤ 30 m del destino y «Finalizar») `completed` → `TripSummaryScreen`. `cancelled` es posible desde `accepted`, `driver_arriving` e `in_progress`.

## 6. Publicación de la posición
- `reportDriverLocation(tripId, …)` se llama **como máximo cada 5 s, y solo si el conductor se movió ≥ 20 m** desde el último envío, con un regulador en el hook. Siempre se envía en los cambios de estado.
- Disponible sin viaje (RF-09): la escritura en Firestore (`drivers/{uid}` o `driverLocations/{uid}`, a definir en la rebanada B junto con su regla) sigue el mismo límite de 5 s y 20 m. Eso son como máximo unas 720 escrituras por hora en movimiento continuo, dentro de la cuota gratuita diaria de Firestore para una demo.
- Si la escritura falla, no hay reintentos en cola: se descarta y se envía la siguiente.

## 7. Rendimiento, batería y segundo plano
- `Accuracy.High` solo durante un viaje. Disponible sin viaje usa `Accuracy.Balanced` y `distanceInterval: 20`.
- Al pasar la app a segundo plano (`AppState` distinto de `active`) se detienen la suscripción de GPS, la fuente simulada y las animaciones de cámara. Se reanudan al volver.
- **La ubicación en segundo plano real queda fuera de alcance.** Exigiría `expo-task-manager`, `startLocationUpdatesAsync`, permiso «siempre» y servicio en primer plano en Android. F1 no lo exige y no entra en el build de hoy.

## 8. Build único de hoy: dependencias y pasos manuales

**Dependencias nativas (instala Anderson con `npx expo install`, tras aprobar D-82):**
| Paquete | Versión (doc SDK 57) | Plugin |
|---|---|---|
| `react-native-maps` | 1.27.2 | `react-native-maps` con `androidGoogleMapsApiKey` leído de `process.env` |
| `expo-location` | ~57.0.22 o 57.0.23 (la que resuelva `expo install`) | `expo-location` con `locationWhenInUsePermission` en español |

Sin otras dependencias nativas. El decodificador de polilínea no hace falta con GeoJSON, la llamada a OSRM usa `fetch`, y FCM queda fuera (D-77).

**Pasos manuales de Anderson (hoy, en orden):**
1. Aprobar D-82 y mover `react-native-maps` a «allowed» y añadir `expo-location` en `scripts/dependencies.json`.
2. En Google Cloud Console: elegir o crear el proyecto, asociar la cuenta de facturación, habilitar **Maps SDK for Android** y crear una clave de API.
3. Obtener el SHA-1 del keystore de depuración (`cd android && ./gradlew signingReport`, o `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android`). Si `android/` aún no existe, se genera en el primer `npx expo run:android` y la restricción se completa después.
4. Restringir la clave: «Android apps» con `com.andersonlondono.uberclone` y el SHA-1, y en API restrictions solo «Maps SDK for Android». Crear una alerta de presupuesto, por ejemplo de USD 1.
5. Escribir el valor en su `.env` local con el nombre `GOOGLE_MAPS_ANDROID_API_KEY`. La IA solo añade el nombre a `.env.example`.
6. Con la tarea de código T-35 ya hecha (`app.config.js` y plugins), ejecutar `npx expo install react-native-maps expo-location` y luego `npx expo run:android`.
7. Spike (T-36): abrir la pantalla de prueba y confirmar que se ven el mapa con calles, el punto azul o marcador en la posición real, y una polilínea OSRM dibujada entre dos puntos.

## 9. Plan B si el mapa nativo no compila a tiempo
- **Criterio de activación:** el build de la rebanada 0 sigue fallando a las **3 horas** de empezar, o el mapa aparece gris o en blanco por la clave tras dos intentos de corregir la restricción.
- **Plan B1 (sin clave):** el mismo `TripActiveScreen` con un componente `RouteView` que recibe la misma interfaz de datos (`route.coordinates`, `driverPosition`, `pickup`, `remaining`). En lugar de `MapView`, dibuja la polilínea y los marcadores en un lienzo SVG proyectado (equirectangular local) sobre fondo neutro, con «Mapa no disponible» y la atribución de OSM. `react-native-svg` está en el SDK, pero **no** en `dependencies.json` y sería otra dependencia nativa **(no verificado si ya viene en el build actual)**. La alternativa sin dependencias son `View` posicionados en absoluto para marcadores y segmentos.
- **Plan B2:** si `expo-location` sí compila pero `react-native-maps` no, se mantiene el GPS real y solo cambia la vista.
- Todo lo demás (contrato, routing, fuente de posición, estados) no cambia, porque el mapa solo es la capa de presentación. El Plan B cumple a medias el requisito de la profesora (hay recorrido por calles y avance en tiempo real, pero sin mapa base) y debe declararse honestamente en el README y el video.

## Fuentes
- https://docs.expo.dev/versions/v57.0.0/sdk/map-view/
- https://docs.expo.dev/versions/v57.0.0/sdk/location/
- https://docs.expo.dev/versions/v57.0.0/sdk/maps/
- https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server
- https://map.project-osrm.org/about.html
- http://project-osrm.org/docs/v5.24.0/api/
- https://openrouteservice.org/plans/
- https://giscience.github.io/openrouteservice/frequently-asked-questions
- https://giscience.github.io/openrouteservice/api-reference/
- https://developers.google.com/maps/documentation/directions/overview
- https://developers.google.com/maps/billing-and-pricing/pricing
- https://developers.google.com/maps/billing-and-pricing/sku-details/maps.md.txt
- https://developers.google.com/maps/billing-and-pricing/sku-details/routes.md.txt
