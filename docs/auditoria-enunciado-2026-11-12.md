# Auditoría del enunciado — UberClone Conductor (2026-11-12)

Alcance: contraste de `docs/UberClone — Versión Conductor.pdf` con el repositorio (solo lectura; no se leyó ningún `.env`). Estados: **Cumplido**, **Parcial**, **Omitido (documentado)** (solo si está en `docs/omisiones-y-limites.md`) y **No encontrado**. Nada está validado en el celular: todo lo que sigue es evidencia estática (código y pruebas `scripts/tests/*.mjs`).

## 1. Registro (3 pestañas)

| Requisito | Estado | Evidencia |
|---|---|---|
| Nombre solo letras/espacios, máx. 50 | Cumplido | `src/utils/validators.js` (validación de nombre) |
| Cédula 6–10 dígitos; celular 10 dígitos | Cumplido | `src/utils/validators.js` |
| Fecha de nacimiento, mayor de 18 | Cumplido | `isAdultBirthDate` en `src/utils/validators.js` |
| Género (lista), correo, idioma ES/EN, foto de perfil | Cumplido | `src/screens/registration/PersonalDataScreen.js`, `src/context/RegistrationFormContext.js`, `PhotoField.js` + `src/services/cloudinary.js` |
| Vehículo: categoría, placa ABC123 en mayúsculas, marca/modelo ≤30, año de 4 dígitos ≤ año actual, color | Cumplido | `validators.js` (`normalizePlate`, regex `^[A-Z]{3}\d{3}$`), `VehicleScreen.js` |
| Capacidad, XL ≥ 6 | Cumplido | `isValidCapacity` en `validators.js` |
| Foto del vehículo con placa visible | Parcial | Se exige la foto y el rótulo lo pide (`src/constants/labels.js:620`), pero no hay verificación de que la placa se vea (imposible sin visión por computador; es solo una indicación) |
| Licencia (número, foto, vencimiento) y SOAT | Cumplido | `src/utils/documentValidators.js`, `DocumentsScreen.js` |
| Revisión técnico-mecánica según el año del vehículo | Parcial | `requiresTechnicalReview` exige revisión desde 5 años de antigüedad (`TECHNICAL_REVIEW_MIN_AGE_YEARS = 5`); **el umbral es invención nuestra**, no consta en el enunciado ni en omisiones |
| Correo de Mercado Pago | Cumplido | `DocumentsScreen.js`, `RegistrationFormContext.js` |
| Casilla de términos con la comisión visible | Cumplido | `DocumentsScreen.js` (CheckboxField con `{percent}` de `commissionPercent`) |
| «Enviar» solo con las tres pestañas completas | Cumplido | `DocumentsScreen.js` (`canSubmit = isRegistrationValid && ...`, `disabled={!canSubmit}`) |
| Errores bajo el campo, sin `Alert` | Cumplido | `FieldError.js`, `errorFor` en las pantallas; `grep Alert src` sin resultados |
| Sin datos de tarjeta ni bancarios | Cumplido | Solo se guarda el correo de cobros |
| Estados de cuenta | Cumplido | `src/constants/accountStatus.js` (LOADING/PENDING/APPROVED/ERROR), `src/navigation/sessionGate.js` (`decideGateRoute`); la disponibilidad exige cuenta aprobada |

## 2. Pantallas y estados del viaje

| Requisito | Estado | Evidencia |
|---|---|---|
| Siete pantallas (inicio, solicitud, viaje activo, resumen, ganancias, historial, perfil/configuración) | Cumplido | `src/screens/home`, `trip/TripRequestScreen.js`, `TripActiveScreen.js`, `TripSummaryScreen.js`, `main/EarningsScreen.js`, `HistoryScreen.js`, `ProfileScreen.js`, `SettingsScreen.js` |
| Estados `accepted`, `driver_arriving`, `in_progress`, `completed`, `paid`, `cancelled` con esos nombres | Cumplido | `src/constants/tripStatus.js`, `src/services/trip/tripMachine.js` |
| Estado `requested` (y `rejected`) | Omitido (documentado) | `docs/omisiones-y-limites.md`, cobertura §3: el pasajero es simulado. Hay además un estado extra, `driver_arrived`, que el enunciado no nombra |
| Hooks obligatorios `useDriverLocation`, `useTripRequests`, `useEarnings` | Cumplido | `src/hooks/useDriverLocation.js` (limpieza en el efecto), `useTripRequests.js`, `useEarnings.js` (useMemo); además `useCallback`/`useMemo` en `IncomingRequestCard.js` y los contextos |
| Cuenta regresiva de 15 s en la solicitud | Parcial | RF-11 la declara; el simulado vive 30 s (`src/config/passengerApi.js:15-17`, `MOCK_REQUEST_TTL_MS`), documentado en la cobertura §3; el valor real que muestra la tarjeta no se verificó en dispositivo |
| AsyncStorage solo para preferencias/sesión | Cumplido | Único uso: persistencia de Firebase Auth (`src/services/firebase.js:11,25`) |
| Último estado de disponibilidad guardado en AsyncStorage | **No encontrado** | `AvailabilityContext` usa `useState(false)` solo en memoria; `buildSessionResetDeps.js:8` afirma que la app no tiene claves propias; **no aparece en omisiones** |
| Geolocalización | Parcial | Funciona con `expo-location` (`src/services/location/gpsLocationSource.js`, `distanceInterval` 10 m), no con `@react-native-community/geolocation`; la sustitución no está en la tabla de Sustituciones |
| Firestore en tiempo real | Cumplido | `driverLocationPublisher.js`, `driverLocationWriter.js`, suscripciones en `tripPaymentSubscription` |
| FCM | Omitido (documentado) | Omisiones fila 1 |
| Directions / Google Maps | Omitido (documentado) como sustitución | OSRM y MapLibre (Sustituciones, D-82) |

## 3. Cobro (pasarela)

| Requisito | Estado | Evidencia |
|---|---|---|
| Flujo de seis pasos app → backend → pasarela → webhook/sync → Firestore → app | Cumplido (estático) | `src/services/trip/paymentsClient.js` (`/payments/checkout`, `/payments/sync`), `backend/src/routes/payments.js:118-119`, `webhooks.js:104,117`, `firestore.js:45-68` (marca `paid` y `paymentStatus` solo desde el backend, idempotente) |
| Seguridad: token con `verifyIdToken`, límite de peticiones, secretos solo en el backend, monto tomado del viaje en Firestore | Cumplido | `backend/src/auth.js:21`, `middleware.js` (rateLimit 429), `backend/src/chargeAmount.js`; sin secretos en `src/` (grep) |
| `.env.example` sin valores | Parcial | Existe en la raíz y en `backend/`, sin valores; **a la raíz le falta `EXPO_PUBLIC_BACKEND_URL`** (solo se menciona en el comentario del de `backend/`) |
| Efectivo y saldo | Cumplido | `src/utils/earnings.js` (`computeBalance`), pruebas `balance.test.mjs` |
| Verificación real de la pasarela | No verificado | Mercado Pago no pudo probarse; backend nunca arrancado por HTTP (documentado en Límites) |

## 4. Tarifa y ganancias

| Requisito | Estado | Evidencia |
|---|---|---|
| `calculateFare` pura | Cumplido | `src/utils/fare.js` (devuelve `{fare, commission, driverEarnings}`) |
| 8,5 km y 22 min = 19.200 / 26.900 | Cumplido | `scripts/tests/fare.test.mjs:8-9` (19200/3840/15360 y 26900/5380/21520) |
| `commissionRate` y `pricing.js` | Cumplido | `src/config/pricing.js` (0,2; base 3500; 1200/km; 250/min; mínimo 6000; multiplicadores 1,0/1,4/1,8); se guarda por viaje en `tripRecord.js` |
| Clave de categoría `economy` | Parcial | Se usa `economico`; difiere del enunciado |
| Seis métricas (viajes, bruto, comisión, propinas, neto, promedio) para Hoy/Semana/Mes | Cumplido | `src/utils/earnings.js` (`computeMetrics`), `earnings.test.mjs`; semana desde el lunes en hora de Colombia |
| Propinas con valor real | Omitido (documentado) | Omisiones fila 4: siempre 0 hasta que exista `tip` |

## 5. Historial

| Requisito | Estado | Evidencia |
|---|---|---|
| `FlatList` | Cumplido | `src/screens/main/HistoryScreen.js:103` |
| Filtros Hoy/Semana/Mes/Rango y método de pago | Cumplido (Rango solo Android, documentado) | `src/components/HistoryFilters.js`, `historyFilters.test.mjs` |
| Paginación | Cumplido | `src/services/tripRepository.js:59-84` (`TRIPS_PAGE_SIZE = 20`, cursor `startAfter`), `historyQuery.test.mjs` |
| Estado vacío | Cumplido | `HistoryScreen.js` (`ListEmptyComponent`) |
| Detalle con ruta, duración, distancia, comisión | Cumplido (estático) | `TripDetailScreen.js`, `tripDetailView.js`, `tripDetailView.test.mjs`; la ruta es la simplificada guardada |
| Detalle con propina y calificación | Omitido (documentado) | Omisiones filas 4 y 5: «Sin propina» y sin calificación |

## 6. Modelo de datos `trips`

| Campo del enunciado | Real (`src/services/trip/tripRecord.js`) | Estado |
|---|---|---|
| `driverId` | `driverId` | Cumplido |
| `passengerId` | No existe (`passengerName` plano) | No encontrado |
| `origin` / `destination` como `{lat, lng, address}` | `originLabel` / `destinationLabel` (texto); `route` simplificada | Parcial (la forma plana está contemplada en el documento de requisitos, pero sin lat/lng de origen y destino) |
| `status`, `category`, `fare`, `commission`, `distanceKm`, `durationMin` | Presentes | Cumplido |
| `category` = `economy|xl|premium` | `economico|xl|premium` | Parcial |
| `tip`, `rating` | No se guardan | Omitido (documentado), filas 4 y 5 |
| `completedAt` | `finishedAt` (+ `startedAt`, `createdAt`) | Parcial (nombre distinto) |
| `paymentId`, `paymentMethod`, `paymentStatus` | Presentes; `paymentId` y el paso a `paid` los escribe el backend | Cumplido |
| Colección `trips` de primer nivel | `drivers/{uid}/trips` (subcolección) | Parcial, no documentado como desviación |

## 7. Sección 7 (tecnología) y sección 8–9 (entrega)

| Requisito | Estado | Evidencia |
|---|---|---|
| FCM, Firestore tiempo real, geolocalización obligatorios | Parcial | Ver sección 2: FCM omitido (documentado) |
| Bitácora de IA | Parcial | `docs/AI_LOG.md`: 60 entradas, casi todas con campos pendientes (ver sección 8) |
| README con sección «Uso de IA» y `.env.example` | Cumplido | `README.md:81` («Uso de IA»), `README.md:32` (Variables de entorno) |
| PDF de la bitácora y video | Omitido (documentado) | Pasos manuales del humano (cobertura §8, §9) |
| Idioma ES/EN | Omitido (documentado) | Omisiones fila 3: se guarda `language`, la interfaz solo está en español |

## 8. Marcadores `// AI-assisted: see docs/AI_LOG.md #N`

- Archivos de `src/` y `backend/src` (versionados + los dos nuevos sin versionar): **162 de 162 tienen al menos un marcador**. Lista de archivos sin marcador: **ninguna**. Los dos archivos sin versionar (`backend/src/chargeAmount.js`, `src/services/passengerApi/simulatedFeedback.js`) también lo traen (1 cada uno).
- Ejemplos de archivos con más marcadores: `src/constants/labels.js` (36), `src/screens/trip/TripRequestScreen.js` (20), `TripSummaryScreen.js` (19), `tripController.js` (18), `HomeScreen.js` (16), `RegistrationFormContext.js` (15), `TripActiveScreen.js` (14). Los 162 con su cuenta salen de `grep -c "AI-assisted: see docs/AI_LOG.md"` por archivo.
- Limitación: el contador no valida que el número `#N` exista ni que corresponda al cambio. Los `.gitkeep` no cuentan.

## 9. Campos vacíos en `docs/AI_LOG.md`

Se recorrieron las 60 entradas (la «#N» de la plantilla se excluye). Conteos por coincidencia literal con vacío o «(pendiente…)»:

- **Aprendizaje** pendiente o vacío: **59 de 60**.
- **Verificación** pendiente o vacía: **8** por coincidencia literal; una lectura más amplia (contenido que contiene «pendiente») sube la cifra hacia 20.
- **Prompt textual**: 1 con «(pendiente: lo pega Anderson)» (#1). El resto tiene el texto en líneas siguientes.
- **Resumen** y **Archivos y commit**: no se pueden contar con precisión con una búsqueda por línea; la lectura amplia marca 16 y 5 respectivamente (por ejemplo #33 y #51/#52/#54/#55 en Archivos).
- Estimado honesto: la bitácora no se puede entregar tal cual; «Aprendizaje» y varias «Verificación» las completa Anderson (regla de bitácora de AGENTS.md).

## 10. Huecos ordenados (impacto alto a bajo; esfuerzo entre paréntesis)

1. Último estado de disponibilidad en AsyncStorage, exigido y ausente (bajo esfuerzo, impacto medio-alto por ser explícito en el enunciado).
2. Bitácora de IA incompleta: Aprendizaje 59/60 y varias Verificación vacías; PDF pendiente (esfuerzo del humano, impacto alto en la nota).
3. `tip` y `rating` ausentes en `trips` y sin pantalla de calificación (esfuerzo medio, impacto alto).
4. Modelo `trips` distinto al enunciado: sin `passengerId`, sin `origin/destination` con lat/lng/address, `completedAt` vs `finishedAt`, `economico` vs `economy`, subcolección en lugar de `trips` (esfuerzo medio-alto, impacto medio; conviene documentarlo en omisiones si no se cambia).
5. Prueba en dispositivo ausente en todo (A, B, C sin evidencia), pasarela de Mercado Pago sin probar y backend nunca arrancado por HTTP (humano; impacto alto).
6. FCM omitido (documentado; esfuerzo alto, impacto medio).
7. Direcciones legibles: no hay geocodificación inversa (no existe Nominatim en `src` ni en `backend/src`); origen/destino vienen del simulado (esfuerzo bajo-medio, impacto medio).
8. Idioma ES/EN sin selector (documentado; esfuerzo medio, impacto bajo-medio).
9. `.env.example` raíz sin `EXPO_PUBLIC_BACKEND_URL` (esfuerzo trivial, impacto bajo).
10. Sustitución `expo-location` por `@react-native-community/geolocation` sin documentar; umbral de 5 años de la revisión técnico-mecánica sin respaldo en el enunciado; cuenta regresiva de 15 s vs 30 s del simulado; estados `requested`/`rejected` ausentes (documentado); foto con placa sin comprobar (esfuerzo bajo, impacto bajo, pero hay que declararlo).
11. iOS sin verificar; filtro «Rango» solo en Android (documentado).

## 11. Cobertura por las tareas A, B, C y D

| Tarea | Cubre | NO cubre |
|---|---|---|
| A (calificación y propina simuladas; campos `tip` y `rating` en `trips`) | Hueco 3 en lo funcional del simulado; el archivo `src/services/passengerApi/simulatedFeedback.js` ya existe sin versionar y `contract.js`/`mappers.js` están modificados | No convierte el feedback en datos reales (sigue siendo simulado, hay que decirlo); no añade `passengerId`, lat/lng, `completedAt` ni `economy` (hueco 4); no valida en celular; hay que actualizar las omisiones filas 4 y 5 |
| B (direcciones con Nominatim) | Hueco 7 | No cambia el modelo (sigue en etiquetas planas sin lat/lng de origen y destino salvo que se guarden); depende de la red y de los términos de uso públicos de Nominatim; hay que documentarlo como sustitución |
| C (README) | Parte del hueco 9 si se añade `EXPO_PUBLIC_BACKEND_URL`; resumen honesto de límites | No resuelve la bitácora, la prueba en celular, ni los huecos 1, 3, 4, 6 |
| D (marcadores AI) | Ya se cumple en lo contable: 162/162 archivos con marcador | No completa los campos de `docs/AI_LOG.md` (hueco 2); los marcadores no prueban por sí solos que el `#N` sea correcto |

**No cubiertos por A–D (se listan, no se implementan):** disponibilidad en AsyncStorage (1), bitácora y PDF (2), diferencias del modelo `trips` (4), prueba en dispositivo y pasarelas (5), FCM (6), idioma (8), y las sustituciones y umbrales sin documentar (10).

## Estado final tras las tareas A a D (2026-11-12)
- **Propina y calificación:** implementadas como simuladas (D-124); cumple en lo estático, **No verificado en dispositivo**. Requiere publicar la regla `validTrip()` (BLOQUEANTE, `docs/seguridad.md`).
- **Direcciones reales:** implementadas con Nominatim (D-125); **No verificado en dispositivo**.
- **README y `.env.example`:** completados (stack, entorno por nombre, túnel, cómo probar, seguridad, desviaciones); `EXPO_PUBLIC_BACKEND_URL` agregado.
- **Marcas de IA:** 162 de 162 archivos de `src/` y `backend/src/` con marca; ninguno sin mapear.
- **Siguen omitidos:** FCM, selector de idioma y pagos divididos.
