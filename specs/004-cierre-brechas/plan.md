# Plan — Spec 004 Cierre de brechas, lote L1

Estado: **Propuesta de `planner` (2026-11-16)**. La spec 004 sigue en Borrador: ninguna tarea se implementa hasta que Anderson la marque «Aprobada» en `docs/progress.md`.
Tareas T-196 a T-215 (siguiente libre tras T-195). Sin dependencias nuevas, sin tocar `.env`, secretos ni `google-services.json`.

## 0. Hallazgos del código real (corrigen rutas de la spec)

- Las rutas reales son `src/services/passengerApi/` (no `passenger/`), `src/services/routing/osrmRouting.js`, `src/services/tripRepository.js` (no `trip/`), `src/utils/fare.js`.
- La tarifa NO viaja en la solicitud: la calculan en vivo `IncomingRequestCard.js:53`, `TripRequestScreen.js:78`, `TripSummaryScreen.js:84` y `tripRecord.js:89` con `distanceKm`/`durationMin`. Por tanto «tarifa después» significa que `distanceKm`/`durationMin` ya son finales ANTES de que la solicitud llegue a esas pantallas.
- Mock: `buildRequest` (`mockPassengerApi.js:98-121`) es síncrono y `emit` (`:140-156`) devuelve el enum `REQUEST_NOW_RESULT`; hay que insertar la espera de OSRM sin romper ese contrato ni los tests `mockAdoptRequest`/`pushOffer`.
- Push: `parsePushRequest` y `requestFromIntent` (`pushRequest.js:81-107`) son puros y síncronos; `distanceKm`/`durationMin` vienen del texto del mensaje (plantilla del servidor). Llegan por `onForegroundMessage` (`notifications/index.js:46`) y por `intentFlow.js:47` (`offer` síncrono → `useTripRequests.offerPushRequest`, `:79-101`).
- `osrmRouting.js` usa `ROUTE_TIMEOUT_MS = 8000` fijo (`config/routing.js:10`) y devuelve `distanceM`/`durationS`; no admite timeout propio.
- Ganancias: `useTrips` → `listenToTrips` (orderBy `finishedAt`, límite 200) solo lo usa `EarningsScreen.js:26`; `periodRange` y `computePeriodTotals` miden por `finishedAt` (`utils/earnings.js:24-42`). El Historial usa `fetchTripsPage` por `createdAt` (otro hook, `useTripHistory`).
- `TripActiveScreen.js`: `:69` ya devuelve limpieza; `:80` y `:94` no crean suscripciones (`setOptions` y un `navigation.replace` protegido por `leavingRef`). Lectura previa, a confirmar en T-206.
- `package.json` solo tiene `start`, `android`, `ios`; el loader es `scripts/tests/helpers/registerSrcLoader.mjs`. Hay más de 60 archivos de prueba, no 40: el CA-004-14 se lee como «todos pasan», con el conteo observado.
- `gpsLocationSource.js:71-76` usa `distanceInterval = GPS_DISTANCE_INTERVAL_M (10)` y `useDriverLocation` ya acota con `LOCATION_THROTTLE_MS/M` (`config/location.js:16-17`).
- `docs/seguridad.md`: `validTrip()` en `:205`, advertencia «NO publicada» en `:295`.
- `check-constitution` C21/C22 solo reconocen IDs `RF|RNF|ENT` de `docs/requisitos.md`; los `RC-nn` no existen allí. Cada tarea cita su `RC-nn` más un ancla provisional existente (RNF-24, RNF-25, RF-39, RF-54). Anderson debe decidir si da de alta los RC como RF (spec §9); hasta entonces el ancla evita falsos errores de C21/C22 y no sustituye al requisito real.

## 1. Archivos → responsabilidad → requisitos

| Archivo | Responsabilidad | Requisitos |
|---|---|---|
| `src/services/routing/routeMetrics.js` (nuevo) | Resolver puro con inyección: una llamada OSRM por par, caché acotada, deduplicación en vuelo, timeout, respaldo con marca `estimated` | RC-01, RC-02, RC-03 |
| `src/services/routing/osrmRouting.js`, `src/config/routing.js` | Parámetro opcional `timeoutMs` y constante `ROUTE_METRICS_TIMEOUT_MS` | RC-01, RC-02 |
| `src/services/passengerApi/mockPassengerApi.js` | Espera las métricas antes de emitir; respaldo = cálculo actual | RC-01, RC-02, RC-03 |
| `src/services/notifications/pushRequest.js`, `src/hooks/useTripRequests.js`, `src/services/notifications/intentFlow.js`, `src/components/NotificationsBridge.js` | Afinar métricas de la solicitud push antes de ofrecerla; respaldo = valores del mensaje | RC-01, RC-02, RC-03 |
| `src/services/tripRepository.js`, `src/utils/earnings.js`, `src/hooks/useTrips.js` o hook nuevo, `src/screens/main/EarningsScreen.js` | Lectura por rango de `finishedAt` para hoy/semana/mes | RC-04 |
| `docs/seguridad.md` | Texto de índice (ninguno) y lista de comprobación de `validTrip()` | RC-04, RC-08 |
| `src/screens/trip/TripActiveScreen.js` | Solo lectura (informe) | RC-05 |
| `package.json`, `README.md` | Script `test` | RC-06 |
| `src/services/location/gpsLocationSource.js` (condicional) | `timeInterval` | RC-07 |

## 2. Contratos (firmas)

```
// routeMetrics.js
createRouteMetrics({ fetchRoute, now, timeoutMs, cacheMax }) =>
  { resolve(origin, destination, fallback) => Promise<{ distanceKm, durationMin, estimated }> }
// origin/destination: { lat, lng }; fallback: { distanceKm, durationMin }. Nunca rechaza.
// osrmRouting.js
fetchOsrmRoute(from, to, { timeoutMs = ROUTE_TIMEOUT_MS } = {})
// pushRequest.js
refineRequestMetrics(request, resolver) => Promise<request>   // copia con distanceKm/durationMin finales (+ estimated)
// tripRepository.js
fetchTripsInRange(uid, { start, end, pageSize = 500, maxDocs = 5000 }) => Promise<{ trips, truncated }>
fetchTripsInRangeWith(fns, tripsCollection, opts)             // versión inyectable para pruebas
```

## 3. Decisiones técnicas

1. **Resolver único e inyectable.** Un módulo puro en `routing/`; mock y push lo comparten. Caché clave = `lat,lng` redondeados a 5 decimales de origen y destino; máximo 50 entradas (la más antigua sale); la promesa en vuelo se comparte (dos solicitudes con el mismo par = una llamada). Timeout 2500 ms (constante en `config/routing.js`); el de 8000 ms de la ruta del mapa no cambia.
2. **Validez de OSRM.** Distancia y duración finitas y > 0; si no, respaldo. `distanceKm` se redondea a 1 decimal y `durationMin = max(1, round(durationS/60))`, igual que hoy. Ejemplo CA-004-01: 8500 m / 1320 s → 8,5 km / 22 min → `calculateFare` 19.200 y 26.900.
3. **`estimated` solo interno.** Campo opcional `estimated: true` en la solicitud; `isValidTripRequest` no rechaza claves extra (`contract.js:91-113`); no se muestra ni se guarda en el viaje.
4. **Mock.** `emit` reserva el turno (cuenta como `BUSY`) mientras espera las métricas; al volver comprueba que el suscriptor siga siendo el mismo y que no haya `pending`, y solo entonces crea `pending`, el temporizador de vencimiento (`createdAt` y `expiresAt` tomados al emitir, no antes) y llama a `onRequest`. `requestNow` conserva sus cuatro resultados.
5. **Push.** El refinamiento se hace antes de ofrecer: `offerPushRequest` pasa a asíncrono y `intentFlow.evaluate` y `NotificationsBridge` esperan su resultado (se actualizan sus pruebas `intentFlow`, `pushOffer`, `pendingRequestDedupe`). Si el vencimiento ocurre durante la espera, se descarta como hoy («expiró»). `mappers.js` no se toca: el refinamiento opera sobre el modelo interno ya mapeado.
6. **Ganancias (B2).** Campo de orden y rango: `finishedAt`, el mismo de `computePeriodTotals`. Consulta `orderBy('finishedAt','desc')` + `where finishedAt >= inicio` + `where finishedAt < fin` en UNA sola colección y un solo campo: usa el índice de campo único automático, NO exige índice compuesto ni cambio de reglas (`read` ya solo exige la sesión del dueño). `docs/seguridad.md` lo dice con ese texto. Rango = desde el menor entre inicio de semana e inicio de mes hasta ahora; páginas de 500 con `startAfter`, tope duro 5000 documentos (si se alcanza, `truncated: true`, sin romper). Lectura única (`getDocs`) al enfocar/reintentar, no `onSnapshot`. El Historial (`fetchTripsPage`, `createdAt`, 20 por página) no se toca.
7. **Saldo.** El saldo con la plataforma (`computeBalance`) también usa los 200 de `listenToTrips`; queda FUERA de RC-04. Se reporta a Anderson, no se cambia.
8. **Script `test`.** `node --import ./scripts/tests/helpers/registerSrcLoader.mjs --test scripts/tests/*.test.mjs` (comillas dobles solo si hacen falta); el glob lo expande Node, no el shell, para que funcione igual en PowerShell y `cmd`. Se confirma la versión de Node instalada antes de fijarlo.
9. **`timeInterval` (B5).** Es opción solo de Android en `watchPositionAsync`; se lee la doc versionada de Expo 57 antes de decidir. Si cambia la frecuencia efectiva respecto de lo validado en dispositivo (`distanceInterval` 10 m + throttle 5 s/20 m), no se toca y se reporta (RC-07 lo permite).
10. **Reglas (B6).** Solo texto en `docs/seguridad.md`; no se asume publicada (estado NO VERIFICADO hasta la prueba de Anderson).

## 4. Diseño

Ninguna tarea cambia pantallas, textos ni tokens (la tarjeta y Ganancias muestran los mismos campos con datos distintos). `Diseño: N/A` en todas; no hay tarea de auditoría. Si T-203 llegara a cambiar el aspecto de Ganancias (p. ej. un aviso de truncado), pasa a visual y exige auditoría.

## 5. Mapa CA → implementación

| CA | Tareas |
|---|---|
| CA-004-01, 02, 03, 04, 05 | T-196 (resolver), T-197 (mock con `calculateFare` contado), T-200 |
| CA-004-06 | T-198, T-199, T-200 |
| CA-004-07 | T-200 (`grep` y `check-constitution`) |
| CA-004-08 | T-201 (Anderson, «No verificado en dispositivo») |
| CA-004-09, 10 | T-202, T-204 |
| CA-004-11 | T-203, T-204 |
| CA-004-12 | T-205 (Anderson) |
| CA-004-13 | T-206, T-207 |
| CA-004-14, 15 | T-208, T-209 |
| CA-004-16 | T-210, T-211 (+ dispositivo si se tocó) |
| CA-004-17 | T-212, T-213 |
| CA-004-18 | T-214 (Anderson) |

## 6. Orden

B1: T-196 → T-197, T-198 → T-199 → T-200 → T-201. B2: T-202 → T-203 → T-204 → T-205. B3: T-206 → T-207. B4: T-208 → T-209. B5: T-210 → T-211. B6: T-212 → T-213 → T-214. Cierre: T-215. Las rebanadas B2 a B6 son independientes de B1 y entre sí.
