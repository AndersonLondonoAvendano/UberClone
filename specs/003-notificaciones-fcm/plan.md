# Plan — Spec 003: Notificaciones push FCM (solicitud de viaje, Android)

Estado: Borrador de plan, regenerado el 2026-11-16 tras la revisión 1b de la spec; pendiente de revisión de Anderson (puerta de la Fase 2). Spec: `specs/003-notificaciones-fcm/spec.md` (Estado «Borrador»; ver §0). Investigación: `docs/fcm/investigacion.md`. Tareas: T-167 a T-195 en `docs/backlog.md`.
Precedencia: ENCARGO > constitución > decisiones > spec y diseño > plan > tarea. Este plan no edita spec, decisiones ni progress.
Diseño retirado y eliminado de este plan: `fcmTokenOwners` y `drivers/{uid}/fcmTokens` (D-131 los sustituye), `collectionGroup`, `backend/src/fare.js` y su prueba de paridad (D-132 RECHAZADA; R-084, R-067), dirección fija en la notificación (DP-60 anterior; D-138), temporizador de 30 s (D-136 RECHAZADA) y la edición condicional de `backend/src/middleware.js`.

## 0. Compuertas antes de la primera tarea (las decide Anderson, no el planner)

| ID | Compuerta | Por qué |
|---|---|---|
| G1 | La spec 003 pasa a «Aprobada» en `docs/progress.md` (hoy «Borrador»). | Requisito de arranque del planner/implementer. |
| G2 | D-126, D-127, D-128, D-129, D-133, D-134, D-135, D-137 y D-138 pasan a «Vigente» (D-130 y D-131 ya «Aprobada» con matiz/cambio; D-132 y D-136 RECHAZADAS) y D-126 reemplaza explícitamente a D-77 («sin FCM», `docs/decisiones.md:459-464`), a la parte de D-52 que fija el SDK JS como única dependencia de Firebase (`:305`) y a D-85 en su cifra de 30 s (`:518`; D-137 la corrige a 15 s). D-24 (`docs/decisiones.md:126`) figura hoy «Propuesta»: se cita tal cual y su estado lo resuelve Anderson; el plan solo la usa para «`google-services.json` fuera de Git». | C15: ninguna dependencia fuera de `scripts/dependencies.json` sin decisión Vigente; D-77 y D-52 siguen Vigente y chocan con RN Firebase. |
| G3 | Los IDs RF-67 a RF-85, RNF-21 a RNF-25 y la fila de la spec 003 existen en `docs/requisitos.md` (ya están; el planner solo llena la columna «Tareas»). | C21/C22 (trazabilidad). |
| G4 | Paso manual M1 de Anderson (§9) hecho: app Android registrada en Firebase, `google-services.json` en la raíz. | T-167 no compila sin él. |

## 1. Rebanadas y dependencias

| Rebanada | Contenido | Tareas | Horas | Depende de | Punto de control |
|---|---|---|---|---|---|
| S1 | Spike nativo/config: dependencias, `app.json`, `firebase.json`, handler en `index.js`, token en log seguro, canal; compuerta RN Firebase vs plan B | T-167 a T-170 (T-170 solo condicional) | 3,5 (tope 3 h de spike; +1,5 si plan B) | G1 a G4 | STOP-1 (T-169) |
| S2 | Backend: cableado de `messaging` (admin, `createApp`, `server`), plantilla sin tarifa ni direcciones, `pushTokens` con transacción, `POST/DELETE /notifications/token`, `POST /notifications/test-request`, límite propio, lotes ≤500 y limpieza UNREGISTERED | T-171 a T-176 | 6,0 | G1, G2 (no depende de S1) | Sin dispositivo (estático); el envío real se confirma en STOP-2 |
| S3 | Cliente: dedupe, ventana de decisión de 15 s (D-137), lógica pura (payload→solicitud, elegibilidad, intención con uid), adopción en el mock, servicio de notificaciones, cliente del backend, entrada de push y puente | T-177 a T-183, T-194, T-195 | 9,25 | S1 (T-169), S2 (T-175) | — |
| S4 | Sesión y preferencias: `notificationsEnabled`, paso de baja en `resetSession` (D-134), registro al iniciar sesión y en refresh | T-184 a T-186 | 3,75 | S3, S2 | STOP-2 (T-186) |
| S5 | UI de Configuración, botón de prueba y auditoría | T-187 a T-189 | 2,75 | S4 | STOP-3 (T-189) |
| S6 | Verificación estática total, documentación, lista de comprobación y demo final | T-190 a T-193 | 3,0 | S1 a S5 | STOP-4 (T-193) |
| Total | | T-167 a T-195 (29 tareas; T-170 condicional) | ≈ 28,25 h (más el tiempo de Anderson en el celular); +1,5 h con plan B = 29,75 h | | 4 puntos de parada |

Orden de ejecución: S1 → S2 → S3 → S4 → S5 → S6. Dentro de S3: T-177, T-194, T-195, T-178, T-179, T-180, T-181, T-182, T-183. T-194 y T-195 llevan los números finales para no mover T-185, T-190, T-192 y T-193, que la spec cita por número (§8); su lugar de ejecución es justo después de T-177 y antes de S4 (D-137 exige la ventana antes de S4). Ningún trabajo de S3 empieza antes de la decisión de T-169.

## 2. Qué se conserva (no se toca salvo lo indicado)

- `createPendingRequestGate` (`src/services/trip/pendingRequest.js:12`): conserva `offer/release/get/dispose`; gana un conjunto acotado de ids vistos (T-177). Su temporizador sigue vencido en `expiresAt` (validez, D-137).
- Suscripción de solicitudes (`src/hooks/useTripRequests.js:30-52`): el camino del mock/HTTP no cambia; el push es una entrada nueva a la misma compuerta (T-182). La dirección se resuelve con `resolveRequestAddresses(request)` (`useTripRequests.js:43-44`, D-125) y su fallback; no se toca.
- Orden y resultados de `resetSession` (D-93 a D-106): `trip-in-progress`, `trip-save-pending` y `sign-out-failed` no cambian; solo se inserta un paso (T-185). `clearOwnStorage` (`resetSession.js:86`, no-op en `buildSessionResetDeps.js:34`) NO cambia.
- Backend: `createGuard`, `createRateLimiter`, `ERRORS` (incluido `ERRORS.rateLimited`, `backend/src/middleware.js:30`) y `createRequestLogger` se reutilizan SIN editar `middleware.js`; `USER_RATE_LIMIT` (`backend/src/config.js:9`) no cambia; `BODY_LIMIT = '2kb'` (`:8`).
- Sin reglas nuevas ni índices (D-131): `pushTokens` es una colección raíz que solo escribe el Admin SDK. `firestore.rules` no se toca.
- Una sola `calculateFare` (`src/utils/fare.js:35`); el backend no tiene fórmula de tarifa.
- `SHOW_DEV_TOOLS=false` permanece; el botón de prueba es de producto. Sin `Alert`.
- Expo SDK 57 con React Navigation (no Expo Router): la rama MAIN es `src/navigation/MainDrawer.js` (el `AvailabilityProvider` envuelve el drawer en `:93-97`).

## 3. Decisiones del plan (DP-NN; continúan tras DP-58 de la spec 002)

- **DP-59 Estructura de `src/services/notifications/`.** `index.js` (interfaz pública; elige adaptador por constante), `adapters/rnFirebaseAdapter.js`, `adapters/expoNotificationsAdapter.js` (solo plan B), `adapters/fakeAdapter.js`, `constants.js`, `safeLog.js` (token reducido a 6 caracteres), `pushRequest.js`, `eligibility.js`, `pendingIntent.js`, `notificationsApi.js`, `preference.js`, `registration.js`. Solo el adaptador importa `@react-native-firebase` (CA-003-01).
- **DP-60 Solicitud desde `data` (reemplaza la DP-60 retirada).** El `data` trae `type`, `requestId`, `targetUid`, `expiresAt`, `category`, `distanceKm`, `durationMin` y coordenadas de origen y destino (todo texto). `pushRequest.parse(data, { now })` completa una solicitud que pasa `isValidTripRequest` (`src/services/passengerApi/contract.js:91`) con pasajero ficticio, `paymentMethod` `cash`, `createdAt` = `now` y, en origen y destino, `address = MOCK_ADDRESS` (`src/config/passengerApi.js:33`) junto con las coordenadas del mensaje. Nunca usa una dirección del mensaje (no existe). Con `MOCK_ADDRESS` el almacén `requestAddresses.js` (`needsLookup`, `:22-26`) ya la geocodifica (D-125) y usa el placeholder como fallback. La tarifa NO viaja: la tarjeta y la pantalla la calculan con `calculateFare` desde distancia, duración y categoría (CA-003-30).
- **DP-61 Aceptar una solicitud de push con el mock.** `acceptRequest` del mock lanza `EXPIRED` si el id no es el pendiente (`mockPassengerApi.js:155-166`). Se añade `adoptRequest(request)` al mock y `adoptPushRequest` al puerto, con `not_supported` en HTTP. `TripRequestScreen` acepta sin cambios.
- **DP-62 D-130 en la práctica.** Una solicitud de push se ofrece aunque `isAvailable` sea falso: `AvailabilityContext` gana `pushOffered` y el efecto de `HomeScreen.js:92-104` pasa a `(isAvailable || pushOffered)`. Aceptar en la pantalla de solicitud es la confirmación; no se llama `setAvailable(true)` y no se publica disponibilidad desde el segundo plano. Anderson ratifica esta lectura (duda 2).
- **DP-63 Dedupe (D-135).** La compuerta guarda un conjunto acotado (50 ids, orden de inserción) en `offer`; un id ya visto devuelve `OFFER_RESULT.DUPLICATE` aunque haya sido liberado o vencido.
- **DP-64 Intención pendiente con uid (D-133).** `pendingIntent.js` (estado en memoria, fuera de React) guarda `{ targetUid, requestId, expiresAt, category, distanceKm, durationMin, origin, destination }`, sin tarifa ni direcciones. Funciones: `set(intent)` (ignora un `requestId` ya consumido), `take(currentUid)` (devuelve y borra; si `currentUid` difiere de `targetUid`, descarta y devuelve `null`), `reset()`. `reset()` se llama desde `resetSession` (T-185) y `take` con otro uid descarta al iniciar sesión otro conductor (CA-003-21). `NotificationsBridge` (hijo del `AvailabilityProvider`, rama MAIN) la consume UNA vez con sesión, cuenta aprobada y sin viaje. Si `expiresAt` ya pasó: «La solicitud expiró» en Inicio (clave de `labels.js`, región `polite`, sin `Alert`, sin aceptar; CA-003-26).
- **DP-65 `pushTokens` y transacción (D-131; reemplaza a la DP-65 retirada).** Colección raíz `pushTokens/{sha256(token)}` con `{ uid, token, platform: 'android', updatedAt }`; solo Admin SDK. `register(uid, token)` usa `db.runTransaction`: lee el documento y lo sobrescribe con el uid que llama (reasigna si era de otro). `unregister(uid, token)` en transacción: borra solo si `uid` coincide; inexistente o ajeno responden igual. `listForUid(uid)` usa `where('uid','==',uid)`. Sin `collectionGroup`, sin índices manuales, sin reglas. `token` válido: texto no vacío de ≤512 caracteres (el cuerpo real está limitado a `'2kb'`).
- **DP-66 Cableado de `messaging` (RF-79; reemplaza a la DP-66 de paridad).** `backend/src/admin.js` exporta `messaging` junto a `adminAuth` y `db` (hoy `{ adminAuth, db }`, `admin.js:11`); `server.js` lo desestructura (`:25`) y lo pasa a `createApp` (`:40`); `createApp` (`app.js:16`) cambia de firma a `{ …, messaging }`. Sin `messaging` el servidor arranca, `/health` responde y las rutas de envío devuelven error genérico (como hoy sin pasarela de pago) (CA-003-23).
- **DP-67 Plantilla y mensaje (RF-82, RF-83).** `payload.js` (puro): `buildTestRequest({ now, idFactory })` → categoría, distancia, duración, coordenadas de origen y destino, `requestId` único, `targetUid` (lo pasa el handler), `expiresAt = now + 90 s`; SIN tarifa ni direcciones. `buildMessage(token, request)` → `notification` (título «Nueva solicitud de viaje», cuerpo «Económico · 3,2 km · 9 min»), `data` en texto, `android: { priority: 'high', ttl: '90s', notification: { channelId: 'solicitudes' } }` (nombres del Admin SDK; el equivalente REST es `channel_id`, https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages; se confirma en S2). Constantes en `config.js`: `FCM_TTL_MS = 90000`, `FCM_TTL = '90s'`, `FCM_CHANNEL_ID`, `TEST_REQUEST_MAX_DELAY_S = 60`.
- **DP-68 Envío y limpieza (RF-84).** Envío con `messaging.sendEachForMulticast` en lotes de ≤500 tokens; recorrer `resp.responses` POR ÍNDICE (mismo orden que la entrada) y borrar de `pushTokens` solo los índices con `success === false` cuyo error sea UNREGISTERED (404; en el Admin SDK, `messaging/registration-token-not-registered`; se confirma en S2). Otros errores no borran. Fuentes: https://firebase.google.com/docs/cloud-messaging/send/admin-sdk y https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode.md.txt. Riesgo abierto: la guía marca `token` como deprecado a favor de `fid`; con `firebase-admin` 13.10.0 se usa `tokens`; se confirma en S2. `delaySeconds` con temporizador inyectable; el endpoint responde 202 `{ scheduled: true }` (si el proceso se reinicia, el aviso se pierde: límite).
- **DP-69 Límite propio (RF-85).** Un segundo `createRateLimiter` con `TEST_REQUEST_RATE_LIMIT = { max: 5, windowMs: 60000 }` en `config.js`, por uid tras el `guard`; excedido → `ERRORS.rateLimited` (429 genérico). `middleware.js` no se edita (CA-003-16, `git diff`).
- **DP-70 Cliente del backend.** `notificationsApi.js` como `src/services/trip/paymentsClient.js` (URL de `src/config/backend.js`, ID token en `Authorization`); nunca envía `uid`; sin registrar cuerpos ni tokens.
- **DP-71 Botón de prueba.** Llama `requestTestNotification({ delaySeconds: 10 })`; habilitado solo con interruptor activo, permiso concedido y red (RF-71).
- **DP-72 Canal (D-129).** `firebase.json` con `messaging_android_notification_channel_id` = `solicitudes`; si S1 no da heads-up, `expo-notifications` solo para el canal (§8, con D-129 Vigente).
- **DP-73 Logs seguros.** El token solo con `safeLog.maskToken` (6 caracteres); el backend no imprime tokens, cuerpos ni correos.
- **DP-74 Pruebas.** `scripts/tests/*.test.mjs`, `node --test`, `src/` por `./helpers/registerSrcLoader.mjs`, `backend/` por import relativo; dependencias inyectadas.
- **DP-75 Baja en `resetSession` (D-134, RF-73, RF-74).** Paso nuevo `unregisterNotifications` entre la espera de guardados (`waitForTripSaveQueue`, `resetSession.js:90-98`) y `signOut` (`:101`), con tope `NOTIFICATION_UNREGISTER_TIMEOUT_MS = 3000` (Promise.race con temporizador inyectable). El paso hace `unregisterToken` en el backend + `deleteToken` local + borrado de `notificationsEnabled`. Su fallo o vencimiento nunca bloquea `signOut`. Con `trip-in-progress` o `trip-save-pending` el paso no corre y nada se borra. `sign-out-failed` deja una marca para restaurar `notificationsEnabled` y re-registrar (T-186; mejor esfuerzo). `clearOwnStorage` sigue no-op y no toca la clave. Se actualiza el comentario de `buildSessionResetDeps.js:8` («la app no tiene claves propias de AsyncStorage») para nombrar `notificationsEnabled` y decir que la borra el paso de baja, no `clearOwnStorage`. `pendingIntent.reset()` se llama también aquí. Las pruebas viven en T-185 (CA-003-06, 07, 19, 20).
- **DP-76 Dos tiempos (D-137, RF-77; reemplaza «temporizador 30 s»).** (a) Validez ≈90 s: `expiresAt` del mensaje y `ttl`; la compuerta conserva su temporizador en `expiresAt`. (b) Ventana de decisión 15 s: constante `REQUEST_DECISION_WINDOW_MS = 15000` en `src/config/passengerApi.js`. Módulo puro `src/services/trip/decisionWindow.js`: `markShown(requestId, now)` sella `shownAt` al primer mostrado por id (cambiar de pestaña no reinicia) y `decisionDeadline(request, now)` = `min(shownAt + 15 s, request.expiresAt)`. `secondsUntil`/`requestTotalSeconds` (`requestPresentation.js:26,:29`) y los dos consumidores (`IncomingRequestCard.js:238-239`, `TripRequestScreen.js:93,:113`) pasan a ese deadline. Igual para mock y push (CA-003-29). `MOCK_REQUEST_TTL_MS = 30000` (`passengerApi.js:17`) se conserva como VALIDEZ del mock (≥ 15 s) con comentario que cita D-137; no es la ventana de decisión. Al llegar a 0 se usa el rechazo existente (RF-11).
- **DP-77 Tarifa y dirección al abrir (RF-78, CA-003-30).** Sin cambios en `calculateFare` ni en el geocodificador; `pushRequest.parse` solo deja el placeholder y las coordenadas; la prueba de CA-003-30 comprueba que el geocodificador falso recibe las coordenadas, que un fallo deja `MOCK_ADDRESS` y que ninguna dirección procede del mensaje.

## 4. Archivos → responsabilidad → requisitos

### Cliente

| Archivo | Responsabilidad | Requisitos |
|---|---|---|
| `index.js` (existente) | `setBackgroundMessageHandler` antes de `registerRootComponent`; apertura inicial a `pendingIntent` | RF-67, RF-76 |
| `app.json`, `firebase.json` (nuevo), `.gitignore`, `scripts/dependencies.json` | plugins, canal, `google-services.json` ignorado, dependencias (§8) | RNF-25, RNF-21, RF-68 |
| `src/services/notifications/index.js`, `adapters/*.js`, `constants.js`, `safeLog.js` | interfaz, adaptadores (rnFirebase, expoNotifications plan B, fake), canal | RF-67, RF-68, RF-69, RF-70 |
| `src/services/notifications/pushRequest.js`, `eligibility.js`, `pendingIntent.js` | lógica pura con uid destino | RF-75 a RF-78, RNF-24 |
| `src/services/notifications/notificationsApi.js` | cliente de `/notifications/*` | RF-72, RF-81 |
| `src/services/notifications/preference.js` | `notificationsEnabled` | RF-71, RF-74 |
| `src/services/notifications/registration.js` | registro, refresh, baja al apagar, reintento tras `sign-out-failed` | RF-72, RF-73 |
| `src/services/trip/pendingRequest.js` | ids vistos, `DUPLICATE` | RF-75 |
| `src/services/trip/decisionWindow.js` (nuevo), `requestPresentation.js`, `src/config/passengerApi.js` | ventana de decisión de 15 s desde que se muestra | RF-77 |
| `src/components/IncomingRequestCard.js`, `src/screens/trip/TripRequestScreen.js` | cuentan hacia el deadline de la ventana | RF-77 |
| `src/services/passengerApi/mockPassengerApi.js`, `index.js`, `httpPassengerApi.js` | `adoptRequest` / `adoptPushRequest` | RF-78 |
| `src/context/AvailabilityContext.js`, `src/hooks/useTripRequests.js`, `src/screens/home/HomeScreen.js` | `offerPushRequest`, `pushOffered`, aviso de expirada | RF-75, RF-77, RF-78 |
| `src/navigation/NotificationsBridge.js` (nuevo), `MainDrawer.js` | primer plano y consumo de intención en MAIN | RF-75, RF-76, RF-77 |
| `src/services/session/resetSession.js`, `buildSessionResetDeps.js`, `src/context/useSessionReset.js` | paso de baja (DP-75) | RF-73, RF-74 |
| `src/screens/main/SettingsScreen.js`, `src/components/settings/NotificationsSection.js`, `src/constants/labels.js` | sección «Notificaciones» | RF-69, RF-70, RF-71, RNF-22, RNF-23 |

### Backend

| Archivo | Responsabilidad | Requisitos |
|---|---|---|
| `backend/src/admin.js`, `server.js`, `app.js` | `messaging` exportado, recibido y pasado a `createApp` | RF-79 |
| `backend/src/config.js` | constantes FCM y límite de pruebas | RF-83, RF-85 |
| `backend/src/notifications/payload.js` | plantilla y mensaje | RF-82, RF-83 |
| `backend/src/notifications/tokenStore.js` | `pushTokens`, transacción, `where('uid','==',uid)`, borrado de obsoletos | RF-79, RF-80, RF-81, RF-84 |
| `backend/src/routes/notifications.js` | rutas `POST/DELETE /notifications/token` y `POST /notifications/test-request` | RF-79, RF-81, RF-84, RF-85 |

### Pruebas y documentos

`scripts/tests/`: `backendNotificationPayload`, `backendTokenStore`, `backendNotificationsRoutes`, `backendMessagingWiring`, `pendingRequestDedupe`, `decisionWindow`, `pushRequest`, `notificationEligibility`, `pendingIntent`, `mockAdoptRequest`, `notificationsApi`, `notificationPreference`, `resetSessionUnregister`, `notificationRegistration`, `notificationSafeLog`, `notificationPermissionState`. Documentos: `README.md`, `docs/seguridad.md`, `docs/omisiones-y-limites.md`, `docs/checklist-dispositivo-fcm.md` (nuevo).

## 5. Contratos (descriptivos)

- **Interfaz de notificaciones:** `getPermissionState()` → `granted | denied | undetermined | not_required`; `requestPermission()`; `registerToken()` → token o `null`; `unregisterToken()`; `deleteToken()` local; `onForegroundMessage(cb)`, `onNotificationOpened(cb)` (incluye mensaje inicial), `onTokenRefresh(cb)`; cada `on…` devuelve su cancelación.
- **`pushRequest.parse(data, { now })`** → `{ ok: true, request }` o `{ ok: false, reason }` (`not-a-request`, `invalid`, `expired`).
- **`eligibility.resolveIntent(intent, { session, accountApproved, onTrip, now })`** → `open` | `expired` | `ignore`.
- **`pendingIntent`:** `set(intent)`, `take(currentUid)`, `reset()`.
- **`decisionWindow`:** `markShown(id, now)`, `decisionDeadline(request, now)`, `REQUEST_DECISION_WINDOW_MS = 15000`.
- **Gate:** `offer(request)` → `offered | busy | expired | duplicate`.
- **Backend `POST /notifications/token`:** `{ token }` texto no vacío ≤512; 200 `{ ok: true }`; 400 genérico; 401 por el `guard`. `DELETE` idempotente.
- **Backend `POST /notifications/test-request`:** `{ delaySeconds? }` entero 0–60; 202 `{ scheduled: true }`; 400 genérico; error genérico sin cuenta aprobada, sin tokens o sin `messaging`; 429 (`ERRORS.rateLimited`) al superar 5 por minuto.
- **`createApp({ auth, store, mp, config, registry, log, messaging })`**; `admin.js` exporta `{ adminAuth, db, messaging }`.
- **Mensaje FCM:** DP-67; `data.type = 'trip_request'`.

## 6. Pruebas, dispositivo y puntos de parada

| Rebanada | Pruebas automáticas | En el celular («No verificado en dispositivo» hasta confirmar) |
|---|---|---|
| S1 | `safeLog` | compila, arranca, token en log, mensaje de la consola en segundo plano con heads-up. **STOP-1** |
| S2 | payload, `pushTokens` con transacción, rutas, 401, 400, 429, lotes ≤500, limpieza UNREGISTERED por índice, cableado `messaging`, grep `collectionGroup` y `calculateFare` ausentes | envío real desde S4 |
| S3 | dedupe, ventana de decisión, parseo, elegibilidad, intención con uid, adopción en mock, cliente HTTP, geocodificador falso | primer plano entra a la tarjeta; el toque abre la solicitud; «La solicitud expiró» |
| S4 | preferencia, orden y tope de la baja (todos los resultados), reintento, registro/baja | reinicio mantiene el interruptor; otro conductor no recibe avisos del anterior. **STOP-2** |
| S5 | estado de la sección | diálogo del sistema, bloqueado, 200 %, lector de pantalla. **STOP-3** |
| S6 | toda la suite, `check-constitution`, greps | demo CA-003-18. **STOP-4** |

Puntos de parada (el humano construye; el agente espera «Pega aquí el resultado de la prueba en el celular: <resultado>»):
- **STOP-1 (T-169):** recompilar, abrir, copiar 6 caracteres del token, enviar un mensaje desde la consola de Firebase con la app en segundo plano.
- **STOP-2 (T-186):** con el backend alcanzable, iniciar sesión con interruptor activo, enviar la solicitud de prueba con la app en segundo plano y confirmar aviso, toque y solicitud con ventana de 15 s desde mostrarse; cerrar sesión y entrar con otro conductor (la intención del anterior se descarta).
- **STOP-3 (T-189):** capturas normal y 200 %, estado bloqueado y aviso de expirada.
- **STOP-4 (T-193):** demo completa y lista `docs/checklist-dispositivo-fcm.md`.

## 7. Mapa CA → implementación

| CA | Tareas | Evidencia |
|---|---|---|
| CA-003-01 | T-168, T-180, T-190 | grep |
| CA-003-02 | T-167, T-169, T-192 | celular |
| CA-003-03 | T-180, T-187, T-192 | `node:test` + celular |
| CA-003-04 | T-184, T-187, T-192 | `node:test` + celular |
| CA-003-05 | T-186 | `node:test` |
| CA-003-06, 07 | T-185, T-186 | `node:test` (prueba en T-185) |
| CA-003-08 | T-177 | `node:test` |
| CA-003-09 | T-178, T-183, T-192 | `node:test` + celular |
| CA-003-10 | T-173 | `db` falso transaccional |
| CA-003-11 | T-174 | backend |
| CA-003-12 | T-175 | backend |
| CA-003-13 | T-172, T-176 | armado + grep |
| CA-003-14 | T-172 | armado |
| CA-003-15 | T-175 | mensajería falsa |
| CA-003-16 | T-175, T-190 | prueba + grep + `git diff` |
| CA-003-17 | T-167, T-190 | `check-constitution`, `git ls-files` |
| CA-003-18 | T-193 | celular |
| CA-003-19, 20 | T-185 | `node:test` con dependencias falsas y reloj falso |
| CA-003-21 | T-178, T-183, T-185 | `node:test` |
| CA-003-22 | T-174 | backend |
| CA-003-23 | T-171, T-174 | backend + grep |
| CA-003-24 | T-173, T-176 | grep + `db` falso |
| CA-003-25 | T-173 | backend |
| CA-003-26 | T-178, T-183, T-192 | `node:test` + celular |
| CA-003-27 | T-172, T-194 | armado + constante |
| CA-003-28, 29 | T-194, T-195 | `node:test` con reloj falso |
| CA-003-30 | T-178, T-182, T-192 | `node:test` + celular |
| CA-003-D1, D2, D3 | T-187, T-188, T-189 | grep + auditoría |

Trazabilidad de requisitos: RF-67 → T-168, T-180, T-193; RF-68 → T-167, T-168, T-169; RF-69, RF-70 → T-180, T-187; RF-71 → T-184, T-187, T-188; RF-72 → T-181, T-186; RF-73 → T-185, T-186; RF-74 → T-184, T-185; RF-75 → T-177, T-182, T-183; RF-76 → T-178, T-183; RF-77 → T-178, T-183, T-194, T-195, T-189; RF-78 → T-178, T-179, T-182; RF-79 → T-171, T-173, T-174; RF-80 → T-173; RF-81 → T-173, T-175; RF-82, RF-83 → T-171, T-172; RF-84, RF-85 → T-175; RNF-21 → T-167, T-190; RNF-22, RNF-23 → T-187, T-188, T-189; RNF-24 → T-177, T-178, T-185, T-190, T-194; RNF-25 → T-167, T-191. Ningún requisito queda sin tarea.

Listas de las tareas finales (spec §8): T-190, T-192 y T-193 verifican exactamente los RF/CA que la spec les asigna (ver cada tarea).

## 8. Cambios descritos (sin aplicar; los hace T-167 con autorización)

`scripts/dependencies.json`: mover `@react-native-firebase/app` y `@react-native-firebase/messaging` de «proposed» a «allowed», versión exacta 27.1.1; `expo-notifications` solo pasa a «allowed» si se activa el plan B o DP-72, con decisión Vigente. `firebase-admin` del backend no cambia (13.10.0). Instalación con `npx expo install` y verificación con `npm ls`; el build nativo lo hace Anderson.

`app.json`: añadir en `expo.plugins`, en este orden, `"@react-native-firebase/app"` y `"@react-native-firebase/messaging"` y en `expo.android` `googleServicesFile` = `"./google-services.json"`; `android.package` debe coincidir con el del archivo de Firebase. `.gitignore`: `google-services.json` ya figura (`:46`, D-24, «Propuesta»); solo se verifica.

## 9. Pasos manuales de Anderson

- **M1 (antes de T-167):** registrar la app Android en Firebase con el `android.package` de `app.json`; colocar `google-services.json` en la raíz (fuera de git); habilitar «Firebase Cloud Messaging API (V1)»; la cuenta de servicio ya está en `backend/secrets` (no se lee aquí).
- **M2 (STOP-1):** `npx expo run:android`; copiar 6 caracteres del token; «Send test message» desde Firebase con la app en segundo plano.
- **M3 (STOP-2):** iniciar el backend, comprobar `EXPO_PUBLIC_BACKEND_URL`, iniciar sesión, activar el interruptor, aceptar el permiso, pulsar «Enviar solicitud de prueba», pasar a segundo plano 10 s; tocar el aviso; repetir con la app cerrada; cerrar sesión y entrar con otra cuenta.
- **M4 (STOP-3 y 4):** capturas en 100 % y 200 %; denegar el permiso y ver «Notificaciones bloqueadas»; tocar un aviso pasados ≈90 s («La solicitud expiró»).
- Confirmar llegada: heads-up «Nueva solicitud de viaje»; al tocarlo, la solicitud con 15 s desde que aparece; el backend no imprime tokens.

## 10. Riesgos, plan B y líneas de corte

| ID | Riesgo | Mitigación | Tarea |
|---|---|---|---|
| FR-1 | RN Firebase sin probar con SDK 57 / RN 0.86 | Spike con tope de 3 h; plan B | T-169, T-170 |
| FR-2 | Falla de Gradle | `prebuild --clean`; `expo-doctor` | T-167 |
| FR-3 | `google-services.json` ausente o con otro `package_name` | M1 | T-167 |
| FR-4 | API V1 sin habilitar (403) | M1; error genérico | T-175 |
| FR-5 | Canal sin heads-up | DP-72 | T-169 |
| FR-6 | Android 13+ sin permiso | explicación y estado bloqueado | T-187 |
| FR-7 | Ahorro de batería mata procesos | límite documentado | T-191 |
| FR-8 | Token obsoleto | limpieza UNREGISTERED (RF-84) | T-175 |
| FR-9 | Dependencia fuera de la lista | §8 con G2 | T-167 |
| FR-10 | `token` deprecado a favor de `fid` en la guía; código de error equivalente a UNREGISTERED en Node | confirmar con un envío real en S2 y ajustar | T-175 |
| R-1 | D-77/D-52 siguen Vigente | G2 | antes de T-167 |
| R-2 | Transacción de `pushTokens` y titularidad | `db` falso transaccional | T-173 |
| R-3 | `delaySeconds` se pierde si el backend se reinicia | límite documentado | T-191 |
| R-4 | La solicitud de push es simulada | límite documentado | T-191 |
| R-5 | Cambio del efecto de Inicio (DP-62) rompe la tarjeta del mock | prueba y revisión; camino sin `pushOffered` igual | T-182 |
| R-6 | Cambiar el origen del conteo (DP-76) altera el mock | prueba `decisionWindow`; el mock conserva validez ≥15 s | T-194, T-195 |
| R-7 | Paso nuevo en `resetSession` rompe el cierre de sesión | prueba de todos los resultados; tope de 3 s | T-185 |

**Plan B (`expo-notifications` ~57.0.25 con `getDevicePushTokenAsync()`):** se activa si al cierre de S1 fallan compilación, arranque o `getToken()` sin diagnóstico en 3 h, o la llegada en segundo plano falla por RN Firebase. Solo cambia el adaptador (T-170).

**Líneas de corte** (en este orden): 1) auditoría en una sola ronda y T-192 reducido; 2) `delaySeconds: 0` en el botón de prueba; 3) reintento tras `sign-out-failed` (CA-003-07, queda como límite); 4) caché de intenciones consumidas; 5) pulido de `docs/omisiones-y-limites.md`. No se recorta: S1, S2, registro/baja de token, `resetSession` (RF-73), dedupe (RF-75), ventana de decisión (RF-77) ni la demo final.

## 11. Estimación

S1 3,5 h; S2 6,0 h; S3 9,25 h; S4 3,75 h; S5 2,75 h; S6 3,0 h. Total ≈ 28,25 h (antes 23,25 h: suben S2 por el cableado y la transacción, S3 por la ventana de decisión y la intención con uid, S4 por la prueba de `resetSession`); +1,5 h con plan B = 29,75 h; más el tiempo de Anderson en el celular en los cuatro puntos de parada.

## 12. Verificación de las referencias de este plan

Citas comprobadas con lectura/grep el 2026-11-16: `pendingRequest.js:12`, `contract.js:91`, `useTripRequests.js:43-44` (el comentario D-125 está en `:43` y la llamada `resolveRequestAddresses(request)` en `:44`), `HomeScreen.js:92-104`, `mockPassengerApi.js:155-166`, `MainDrawer.js:93-97`, `buildSessionResetDeps.js:8` y `:34`, `resetSession.js:86`, `:90-98`, `:101`, `middleware.js:30`, `app.js:16`, `server.js:25` y `:40`, `admin.js:11`, `config.js:8-9`, `requestAddresses.js:22-26`, `passengerApi.js:17` y `:33`, `requestPresentation.js:26` y `:29`, `IncomingRequestCard.js:238-239`, `TripRequestScreen.js:93` y `:113`, `fare.js:35`; `docs/decisiones.md`: D-24 `:126`, D-52 `:305`, D-77 `:459-464`, D-85 `:518`, D-130…D-138 `:758-786`.
