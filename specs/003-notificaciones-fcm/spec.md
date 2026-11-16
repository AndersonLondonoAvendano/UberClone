# Spec 003 — Notificaciones push de solicitudes (FCM, Android)

Estado: Borrador (propuesta de `spec-author`; no aprobada). Los RF-67… y RNF-21… de esta spec ya figuran en `docs/requisitos.md` como «Propuesta» y las decisiones D-126…D-138 están en `docs/decisiones.md` (sección «Decisiones — notificaciones FCM (D-126…D-138)»); ninguna pasa a «Vigente» sin la aprobación de Anderson. Informe base: `docs/fcm/investigacion.md` (esta spec no lo contradice).
Fuente de la obligación: PDF §7 / R-113 «FCM (`@react-native-firebase/messaging`) obligatoria: notificar solicitudes con app en segundo plano» (`docs/plan-cierre-entrega-2026-11-16.md`, brecha G-04).
Revisión 1b (2026-11-16): se retiran la colección `drivers/{uid}/fcmTokens` y la copia de `calculateFare` (D-132 rechazada) y el temporizador de 30 s (D-136 rechazada); se incorporan D-131 (colección raíz `pushTokens`), D-137 y D-138. Si esta spec se aprueba y luego cambia, planes, tema y tareas pueden quedar desactualizados. **El `plan.md` y las tareas T-167…T-195 fueron regenerados en la revisión 1b con el diseño vigente (`pushTokens`, una sola `calculateFare`, ventana de 15 s).**
No contradice D-93…D-125. Lo que cambia respecto de ellas, declarado: (a) `resetSession` (D-98, D-104) recibe un paso nuevo entre la espera de guardados y `signOut`; los resultados `trip-in-progress`, `trip-save-pending` y `sign-out-failed` no cambian; (b) D-85 cita un temporizador de 30 s que D-137 corrige a 15 s (el texto de D-85 no se reescribe aquí).

## 0. Qué ya existe (verificado en el código)

- Las solicitudes entran solo con la app abierta: `useTripRequests` suscribe a `subscribeToRequests` solo mientras `enabled` (`src/hooks/useTripRequests.js:30-52`) y entrega cada solicitud a `createPendingRequestGate().offer()` (`:46`). `docs/omisiones-y-limites.md` declara FCM omitido (omisión 1, fila §7).
- `createPendingRequestGate` (`src/services/trip/pendingRequest.js:12`): `offer` devuelve EXPIRED si `expiresAt` no es número o ya pasó (`:32-33`) y BUSY si hay otra vigente; NO deduplica por `id` (tras liberar o expirar, el mismo `id` podría ofrecerse otra vez).
- `isValidTripRequest` (`src/services/passengerApi/contract.js:91`) exige id, pasajero, origen/destino con dirección, distancia, duración, categoría, método de pago y `expiresAt > createdAt` (`:108-111`).
- La disponibilidad vive solo en memoria (`useState`, `src/context/AvailabilityContext.js:34`); `watching = isAvailable && !onTrip` (`:63`); la posición se publica solo con la app viva (`:95-97`). No existe tarea de fondo ni servicio en primer plano; salir de la app no pone al conductor «No disponible».
- `HomeScreen` abre `TripRequest` solo si `pendingRequest && isAvailable && !onTrip` y Home está enfocada (`src/screens/home/HomeScreen.js:93-104`), con `announcedIdRef` contra reanuncio.
- `RootNavigator` ofrece una sola pantalla por rama (`pickScreen`); los proveedores Availability/Trip viven dentro de `MainDrawer`, no en la raíz.
- Estado de cuenta: campo `accountStatus` de `drivers/{uid}` (`src/services/driverRepository.js:20`), `ACCOUNT_STATUS` en `src/constants/accountStatus.js`.
- `resetSession` (D-98, `src/services/session/resetSession.js`): hasTripInProgress → discardPendingRequest → publishFinalState (acotado 5 s) → stopLocation → releaseSubscriptions → clearContexts → clearOwnStorage (`:86`) → espera de guardados `waitForTripSaveQueue` (`:90-98`, acotada 8 s; si vence devuelve `trip-save-pending` sin cerrar sesión) → signOut (`:101`) → `sign-out-failed` si falla. `clearOwnStorage` es no-op por defecto (`src/services/session/buildSessionResetDeps.js:34`) porque «la app no tiene claves propias de AsyncStorage» (`:8`).
- Backend: `createGuard` (IP → token Firebase → límite por usuario), `createRateLimiter`, `createRequestLogger` y `ERRORS` genéricos en `backend/src/middleware.js` (`ERRORS.rateLimited` ya existe, `:30`); `createApp({ auth, store, mp, config, registry, log })` en `backend/src/app.js:16`; patrón de rutas `route(name)` en `backend/src/routes/payments.js:108-120`; `createTripStore(db)` con `db` inyectado (`backend/src/firestore.js`); `USER_RATE_LIMIT = {max: 20, windowMs: 60000}` (`backend/src/config.js:9`); `BODY_LIMIT = '2kb'` (`:8`). `backend/src/admin.js` exporta hoy solo `{ adminAuth, db }` (devuelve `initAdmin`); `backend/src/server.js` lo desestructura en `:25` y llama a `createApp` en `:40`.
- La tarifa: UNA sola `calculateFare` en `src/utils/fare.js:35` (R-084, R-067). El backend no la tiene y no debe tenerla (D-132 rechazada).
- `SHOW_DEV_TOOLS = false` (`src/constants/devTools.js:7`).
- Temporizador hoy: `MOCK_REQUEST_TTL_MS = 30000` (`src/config/passengerApi.js:17`); el conteo sale de `request.expiresAt` (`src/components/IncomingRequestCard.js:238`, `src/screens/trip/TripRequestScreen.js:113`). Contradice RF-11 (15 s; `docs/requisitos.md:25`) y la D-85 (`docs/decisiones.md:518`; el temporizador de 30 s, «prompt #43», se menciona en `:520`). Brecha G-06; lo resuelve D-137.
- Direcciones: geocodificador inverso existente con fallback (`src/services/geocoding/reverseGeocode.js`, `requestAddresses.js`; D-125).
- `google-services.json`, `backend/secrets/` y `firestore.rules` ya están en `.gitignore` (D-24, `docs/decisiones.md:126`: archivos de Firebase fuera de Git).
- `scripts/dependencies.json` ya lista `@react-native-firebase/app` y `@react-native-firebase/messaging` como propuestas; `expo-notifications` no está en ninguna lista.
- Firestore: solo hay reglas para colecciones explícitas; «todo lo demás está cerrado» (`docs/seguridad.md`). Una colección raíz `pushTokens` queda negada a los clientes y solo la escribe el Admin SDK: no hacen falta reglas nuevas ni índices manuales (D-131).

## 1. Objetivo y porqué

Avisar al conductor de una solicitud de viaje con la app en segundo plano o cerrada, mediante FCM, y llevarlo a la pantalla de solicitud al tocar el aviso. Porqué: el PDF §7 lo pide como obligatorio (R-113) y hoy el conductor solo ve solicitudes con la app abierta. Como el pasajero no existe (D-86/mock), el disparador es una solicitud simulada enviada por el backend a los dispositivos del propio conductor. La notificación no lleva tarifa ni direcciones: la app las calcula y resuelve al abrir (D-132, D-138).

### Fuera de alcance
- iOS: solo se documenta (no hay APNs ni cuenta Apple); límite en `docs/omisiones-y-limites.md`.
- Ubicación en segundo plano y servicio en primer plano.
- Pagos divididos.
- Pasajero real, programación de viajes, notificaciones distintas de «solicitud».
- Reglas de Firestore nuevas e índices manuales.
- Una segunda implementación de `calculateFare` (D-132 rechazada).

## 2. Requisitos

### Cliente (Android)
- **[RF-67]** (R-113; D-126) El sistema SHALL ofrecer en `src/services/notifications/` una interfaz propia (permiso, registro/baja de token, mensaje en primer plano, notificación abierta incluyendo «abierta desde cerrada», refresco de token, canal) con un adaptador `@react-native-firebase/messaging` y otro intercambiable (`expo-notifications`) y uno falso para pruebas. Ninguna pantalla importa el SDK directamente. Solo Android.
- **[RF-68]** (R-113; D-129) El sistema SHALL crear el canal «solicitudes» con importancia alta antes de que llegue cualquier notificación que lo nombre (FCM: «The app must create a channel with this channel ID before any notification with this channel ID is received», https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages).
- **[RF-69]** (R-113) Cuando el conductor active las notificaciones en Android 13+, el sistema SHALL mostrar antes una explicación en pantalla (sin `Alert`) y solo entonces solicitar `POST_NOTIFICATIONS`. En Android ≤12 no hay solicitud.
- **[RF-70]** Mientras el permiso esté denegado, el sistema SHALL mostrar el estado «Notificaciones bloqueadas» con un botón que abre los ajustes del sistema, y SHALL NOT registrar token.
- **[RF-71]** El sistema SHALL ofrecer en Configuración una sección «Notificaciones» con un interruptor «Avisos de solicitudes» y un botón «Enviar solicitud de prueba». El estado del interruptor es la preferencia `notificationsEnabled` en AsyncStorage (RNF-04). El botón de prueba solo está habilitado con interruptor activo, permiso concedido y red.
- **[RF-72]** Cuando `notificationsEnabled` sea verdadero, haya sesión y cuenta aprobada, el sistema SHALL registrar el token del dispositivo en el backend al iniciar sesión y en cada `onTokenRefresh`. Cuando sea falso, SHALL darlo de baja.
- **[RF-73]** (D-98, D-104, D-134) `resetSession` SHALL incluir un paso «dar de baja las notificaciones» con este orden exacto: … → clearContexts → clearOwnStorage (sin cambios) → espera de guardados `waitForTripSaveQueue` (si vence: `trip-save-pending` y NO se cambia nada de lo siguiente) → **paso nuevo: `unregisterToken` + borrar el token local (`deleteToken`) + borrar `notificationsEnabled`** → signOut. Va justo antes de `signOut` para que el ID token siga vigente. Si el reset aborta antes (`trip-in-progress`, `trip-save-pending`) la sesión continúa y el token registrado, el token local y `notificationsEnabled` quedan intactos. Si `signOut` falla (`sign-out-failed`), la app SHALL restaurar `notificationsEnabled` y volver a registrar el token en el reintento o al resolver el estado (mejor esfuerzo). Los resultados `trip-in-progress`, `trip-save-pending` y `sign-out-failed` de D-93…D-106 no cambian.
- **[RF-74]** (D-134) `notificationsEnabled` es la primera clave propia de AsyncStorage de la app y se borra SOLO dentro del paso de RF-73 (junto con la baja del token), no en `clearOwnStorage`, que sigue siendo no-op. Así otro conductor en el mismo celular parte de «apagado». Se actualiza el comentario de `buildSessionResetDeps.js:8`.
- **[RF-75]** (D-135) Con la app en primer plano, el mensaje SHALL entrar al flujo existente de solicitudes (compuerta `createPendingRequestGate`) sin duplicados: SHALL deduplicar por `requestId` (incluidos ids ya liberados o vencidos, con un conjunto acotado de ids vistos).
- **[RF-76]** (D-133) Cuando el conductor toque la notificación con la app en segundo plano o cerrada, el sistema SHALL guardar una «intención pendiente» en memoria con el uid destino (`targetUid` del mensaje), `requestId`, `expiresAt`, categoría, distancia, duración y coordenadas (sin tarifa ni direcciones), y consumirla UNA vez, después de resolver sesión y estado de cuenta, dentro de la rama MAIN. SHALL descartarla si el uid de la sesión actual difiere del uid destino, en `resetSession` y al iniciar sesión otro conductor. SHALL ignorarla sin sesión, con cuenta no aprobada o con viaje en curso. Un segundo toque sobre el mismo `requestId` no la repite.
- **[RF-77]** (R-041, RF-11; D-137) El sistema SHALL distinguir dos tiempos. (a) **Validez de la notificación**: la solicitud enviada por FCM vale ≈90 s desde el envío (`expiresAt` y `ttl`). Si al tocar la notificación ya pasó `expiresAt`, SHALL mostrar «La solicitud expiró» sin posibilidad de aceptar. (b) **Ventana de decisión**: 15 s que empiezan cuando la solicitud se MUESTRA en pantalla; en 0 se rechaza (RF-11). La ventana nace al mostrarse, venga la solicitud del mock o de una notificación, y el comportamiento es el mismo en ambos orígenes. Este requisito declara el qué; cómo se cambia el origen del conteo lo decide el plan.
- **[RF-78]** (D-130, con matiz) La notificación SHALL poder abrir la solicitud aunque `isAvailable` sea falso en memoria (proceso cerrado). Lectura conservadora: al consumir la intención con `notificationsEnabled`, cuenta aprobada y sin viaje, la app SHALL poner «Disponible» solo si el conductor lo confirma en la propia pantalla de solicitud; no se publica disponibilidad desde el segundo plano. El aviso sin depender de «Disponible» aplica al endpoint de **prueba**; un sistema real solo avisaría a un conductor disponible (límite declarado). Al abrir, la app calcula la tarifa con `calculateFare` y resuelve las direcciones con el geocodificador existente y su fallback (D-132, D-138).

### Backend
- **[RF-79]** (D-127, D-128, D-131) El backend SHALL exponer `POST /notifications/register` (registrar) y `POST /notifications/unregister` (dar de baja; ENCARGO S2, 2026-11-16, sustituye a `POST/DELETE /notifications/token`), autenticados con el mismo `guard` (token de Firebase), que escriben con el Admin SDK en la colección raíz `pushTokens/{hash}` (hash = SHA-256 del token) los campos `uid`, `token`, `platform` (`android`) y `updatedAt`. El `uid` sale del token de sesión, nunca del cuerpo. Varios dispositivos por uid; sin duplicados (mismo hash = mismo documento). El campo `token` SHALL ser un texto no vacío de a lo sumo 512 caracteres (un token FCM mide ≈160-170; `BODY_LIMIT` real es `'2kb'`, `backend/src/config.js:8`); si no, 400 genérico. Cableado declarado: `createApp` (`backend/src/app.js:16`) cambia de firma y recibe `messaging` inyectable; `backend/src/admin.js` SHALL exportar `messaging` explícitamente junto a `adminAuth` y `db`; `backend/src/server.js` lo recibe (`:25`) y lo pasa a `createApp` (`:40`). Sin `messaging`, el servidor arranca, `/health` funciona y las rutas de envío responden un error genérico (como hoy sin pasarela de pago).
- **[RF-80]** (D-131) Registrar un token T SHALL reasignarlo al uid que llama en una TRANSACCIÓN (si existía bajo otro uid, deja de pertenecerle), de modo que el token del uid anterior no reciba mensajes del siguiente conductor. Dar de baja SHALL borrar el documento solo si pertenece al uid que llama; si no existe o es de otro uid, responde igual (sin revelar titularidad).
- **[RF-81]** (D-130) El backend SHALL exponer `POST /notifications/test-request` (mismo `guard`, cuenta con `accountStatus = approved`) que envía SOLO a los tokens del uid que llama, obtenidos con `where('uid', '==', uid)` sobre `pushTokens` (sin consultas `collectionGroup`, sin índices manuales). El cuerpo admite únicamente `delaySeconds` entero 0–60; todo lo demás se ignora. Sin tokens: error genérico «sin dispositivos».
- **[RF-82]** (D-132, D-138) El servidor SHALL construir una plantilla fija de solicitud simulada con categoría, distancia, duración, coordenadas de origen y destino, `requestId` único y `expiresAt` ≈90 s desde el envío. La plantilla NO contiene tarifa ni direcciones y el backend NO calcula tarifas (una sola `calculateFare`, en la app). El cliente no aporta tokens, textos, coordenadas ni importes.
- **[RF-83]** (D-132, D-137, D-138) El mensaje FCM SHALL llevar `notification` (título «Nueva solicitud de viaje», cuerpo con categoría, distancia y duración, p. ej. «Económico · 3,2 km · 9 min», sin tarifa ni direcciones) y `data` (`type`, `requestId`, `targetUid`, `expiresAt`, `category`, `distanceKm`, `durationMin` y coordenadas de origen y destino; valores en texto, que es lo que admite FCM), `android.priority` «high», `android.ttl` ≈90 s en formato duración con sufijo «s» (p. ej. «90s»; máximo 4 semanas) y `android.notification.channel_id` «solicitudes». Sin datos personales reales. Fuente: https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages.
- **[RF-84]** (D-131) El backend SHALL enviar con `sendEachForMulticast` en lotes de a lo sumo 500 tokens, revisar `resp.success` de cada respuesta POR ÍNDICE (el `BatchResponse` trae una respuesta por token en el mismo orden que la entrada) y borrar de `pushTokens` solo los tokens cuyo error sea UNREGISTERED (HTTP 404, «remove this registration token from the app server»). La limpieza es de nuestro backend: la documentación oficial no dice que el SDK limpie tokens. Fuentes: https://firebase.google.com/docs/cloud-messaging/send/admin-sdk, https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messaging.md#messagingsendeachformulticast (orden y máximo de 500) y https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode.md.txt (UNREGISTERED).
- **[RF-85]** Límite por usuario propio para `test-request` (propuesta 5 por minuto, más estricto que `USER_RATE_LIMIT`), usando `ERRORS.rateLimited` ya existente (`backend/src/middleware.js:30`; ninguna edición a `middleware.js`); excedido → 429 genérico. Errores genéricos y registros sin secretos, tokens, cuerpos ni correos (`createRequestLogger`).

### No funcionales
- **[RNF-21]** Seguridad: ninguna credencial en el cliente; la cuenta de servicio solo en `backend/secrets`; `google-services.json` ignorado por git (D-24); sin reglas nuevas de Firestore ni índices manuales (lo confirma `docs/seguridad.md`).
- **[RNF-22]** Textos en `src/constants/labels.js`; tokens de diseño; sin `Alert`; `SHOW_DEV_TOOLS` permanece `false` (el botón de prueba es de producto, no de desarrollo).
- **[RNF-23]** Accesibilidad: áreas táctiles ≥48 dp, `accessibilityLabel`/`accessibilityRole`/`accessibilityState` en interruptor y botones, estados no solo por color.
- **[RNF-24]** Lógica pura (elegibilidad, plantilla, dedupe, expiración y ventana de decisión, intención con uid) separada y probada con `node:test` y dependencias inyectadas; el paso de baja de `resetSession` se prueba como el resto.
- **[RNF-25]** Dependencias solo de `scripts/dependencies.json`; cambios de dependencias y `app.json` (plugins `@react-native-firebase/app` y `/messaging` en ese orden, `android.googleServicesFile`) se describen aquí y se hacen en Fase 2 con autorización. El README explica cómo obtener `google-services.json`.

## 3. Decisiones (D-126…D-138 en `docs/decisiones.md`; esta spec no las reescribe)

- **D-126** (Aprobada, sujeta al spike S1) Cliente `@react-native-firebase/app` + `messaging` 27.1.1; plan B `expo-notifications` detrás de la misma interfaz.
- **D-127** (Propuesta) Disparo vía endpoint autenticado del backend que envía solo a los dispositivos del llamante.
- **D-128** (Propuesta, ajustada por D-131) Tokens escritos solo por el backend.
- **D-129** (Propuesta) Canal «solicitudes» con `messaging_android_notification_channel_id` en `firebase.json`; si S1 no deja importancia alta, `expo-notifications` solo para el canal.
- **D-130** (Aprobada con matiz) FCM no depende de ubicación ni de `isAvailable` en el endpoint de prueba; un sistema real solo avisaría a un conductor disponible. Alternativa descartada: «Disponible» automático.
- **D-131** (Aprobada con cambio de diseño) Colección raíz `pushTokens/{hash}`; reasignación en transacción; `where('uid','==',uid)`; sin `collectionGroup`, índices manuales ni reglas nuevas; `drivers/{uid}/fcmTokens` se elimina.
- **D-132** (RECHAZADA) No se copia `calculateFare`; payload y cuerpo sin tarifa; la app calcula al abrir.
- **D-133** (Propuesta) Intención pendiente en la rama MAIN, ligada al uid destino.
- **D-134** (Propuesta) Paso de baja en `resetSession` tras `waitForTripSaveQueue` y antes de `signOut`; `notificationsEnabled` y token local se borran ahí; tope 3 s.
- **D-135** (Propuesta) Dedupe por `requestId` con conjunto de ids vistos.
- **D-136** (RECHAZADA) Mantener 30 s; sustituida por D-137.
- **D-137** (Propuesta) Decisión de 15 s desde que se muestra; validez de la notificación ≈90 s; corrige D-85 y la contradicción con RF-11 (G-06).
- **D-138** (Propuesta) La notificación y el payload llevan solo coordenadas; la app resuelve la dirección al abrir (D-125) con su fallback.

## 4. Criterios de aceptación

Formato: Dado/Cuando/Entonces. «Cómo se verifica» entre paréntesis. Los números CA-003-01…18 se conservan; CA-003-13 cambia de sentido (D-132) y CA-003-19… son nuevos.

- **CA-003-01** [RF-67] Dado el módulo de notificaciones, cuando se busca en `src/` un import de `@react-native-firebase` fuera de `src/services/notifications/`, entonces no hay ninguno. (grep)
- **CA-003-02** [RF-68] Dado un dispositivo Android, cuando llega un mensaje al canal «solicitudes», entonces aparece como aviso emergente. (No verificado en dispositivo, tarea por asignar: S1/lista de comprobación T-192)
- **CA-003-03** [RF-69, RF-70] Dado Android 13+ sin permiso, cuando se activa el interruptor, entonces se explica y luego se solicita; si se niega, se ve «Notificaciones bloqueadas» con acceso a ajustes y no se registra token. (Lógica por `node:test`; diálogo del sistema: No verificado en dispositivo)
- **CA-003-04** [RF-71, RF-74] Dado el interruptor, cuando se activa y se reinicia la app, entonces sigue activo; tras cerrar sesión queda apagado. (`node:test` del almacenamiento; reinicio: No verificado en dispositivo)
- **CA-003-05** [RF-72] Dado un login con cuenta aprobada e interruptor activo, entonces el token queda registrado; con interruptor apagado se da de baja. (prueba con adaptador falso y backend falso)
- **CA-003-06** [RF-73] Dado un cierre de sesión, entonces el orden de pasos es el de RF-73 (`waitForTripSaveQueue` → baja + borrado de token local y de `notificationsEnabled` → `signOut`) y una baja que falla no impide `signOut`. (`node:test` como `resetSession`; prueba prevista en T-185)
- **CA-003-07** [RF-73] Dado `sign-out-failed` tras la baja, cuando se reintenta, entonces se restaura `notificationsEnabled` y se vuelve a registrar el token. (`node:test`; T-185)
- **CA-003-08** [RF-75] Dado el mismo `requestId` recibido dos veces (también tras liberarse), entonces la compuerta lo ofrece una vez. (`node:test`)
- **CA-003-09** [RF-76, RF-77] Dado un toque con sesión y cuenta aprobada, entonces se abre la solicitud; sin sesión, cuenta no aprobada o viaje en curso se ignora; doble toque no duplica. (`node:test` de la resolución; apertura real: No verificado en dispositivo)
- **CA-003-10** [RF-79, RF-80] Dado un token registrado bajo el uid A, cuando el uid B lo registra, entonces A deja de tenerlo y la reasignación se hace con una transacción. (prueba del backend con `db` falso transaccional)
- **CA-003-11** [RF-79] Dado un registro sin cabecera válida, entonces 401 genérico; el `uid` del cuerpo se ignora. (prueba del backend)
- **CA-003-12** [RF-81] Dado `delaySeconds` fuera de 0–60 o no entero, entonces 400 genérico; cuenta no aprobada → error genérico; sin tokens → error genérico; el envío va solo a tokens cuyo `uid` es el del llamante. (prueba del backend)
- **CA-003-13** [RF-82, RF-83] (sustituye a la antigua prueba de paridad, D-132) La plantilla y el mensaje no contienen tarifa ni direcciones; sí categoría, distancia, duración, coordenadas, `requestId` y `expiresAt`; y no existe `calculateFare` en `backend/src`. (prueba del armado + grep)
- **CA-003-14** [RF-83] El mensaje contiene título, cuerpo, `data` (con `targetUid`), `android.priority` «high», `android.ttl` en formato «90s» y `channel_id` «solicitudes», y ningún dato personal. (prueba del armado)
- **CA-003-15** [RF-84] Dado un envío a varios tokens con un fallo UNREGISTERED en un índice, entonces se borra de `pushTokens` solo el token de ese índice; otros errores no borran; más de 500 tokens se envían en lotes de a lo sumo 500. (prueba con mensajería falsa)
- **CA-003-16** [RF-85] Superado el límite, 429 genérico con `ERRORS.rateLimited`; los registros no contienen tokens, cuerpos ni correos; `middleware.js` no se modifica. (prueba + grep + `git diff` del archivo)
- **CA-003-17** [RNF-21, RNF-25] `check-constitution` pasa; `git ls-files` no contiene `google-services.json`, `backend/secrets` ni `firestore.rules` (D-24). (script)
- **CA-003-18** [RF-67] La demo completa (app en segundo plano → aviso → toque → solicitud) funciona en el celular. (No verificado en dispositivo, tarea por asignar: T-193)
- **CA-003-19** [RF-73, RF-74] Dado `trip-save-pending` (la espera de guardados vence), entonces no se llama a `unregisterToken`, no se borra el token local ni `notificationsEnabled`, y la sesión continúa; y dado el orden normal, el borrado ocurre después de `waitForTripSaveQueue` y antes de `signOut`, y `clearOwnStorage` no toca `notificationsEnabled`. (`node:test` con dependencias falsas que registran el orden; prueba prevista en T-185)
- **CA-003-20** [RF-73] Dada una baja que nunca responde, entonces a los 3 s `signOut` se ejecuta igual; dada una baja que rechaza, `signOut` se ejecuta igual. (`node:test` con reloj falso; T-185)
- **CA-003-21** [RF-76] Dada una intención con uid destino A, cuando la sesión actual es B (tras `resetSession` o al iniciar sesión B), entonces se descarta y no abre nada. (`node:test`)
- **CA-003-22** [RF-79] Dado `token` vacío, no texto o de más de 512 caracteres, entonces 400 genérico; de 512 o menos, aceptado. (prueba del backend)
- **CA-003-23** [RF-79] Dado `createApp` con `messaging` inyectado, entonces las rutas `/notifications/*` usan ese objeto; sin él, error genérico y `/health` responde; `admin.js` exporta `messaging`. (prueba del backend + grep)
- **CA-003-24** [RF-81] El backend no contiene `collectionGroup` ni `drivers/{uid}/fcmTokens`; los dispositivos de un uid se listan con `where('uid','==',uid)`. (grep + prueba con `db` falso)
- **CA-003-25** [RF-80] Dada una baja de un token que pertenece a otro uid, entonces no se borra y la respuesta es igual a la de un token inexistente. (prueba del backend)
- **CA-003-26** [RF-77] Dado un toque con `expiresAt` ya pasado, entonces se muestra «La solicitud expiró» y no se puede aceptar. (`node:test`; pantalla: No verificado en dispositivo)
- **CA-003-27** [RF-77] Validez frente a decisión: dada una solicitud de prueba, su `expiresAt` y `ttl` equivalen a ≈90 s desde el envío, y la ventana de decisión es de 15 s. (prueba del armado + prueba de la constante)
- **CA-003-28** [RF-77] Dada una solicitud mostrada en el segundo t, entonces su ventana vence en t+15 s aunque `expiresAt` sea posterior, y en 0 se rechaza. (`node:test` con reloj falso)
- **CA-003-29** [RF-77] Dadas la misma solicitud por mock y por notificación, entonces la ventana de decisión se comporta igual (15 s desde mostrarse). (`node:test`)
- **CA-003-30** [RF-78] Dada una intención con coordenadas, cuando se abre, entonces la tarifa sale de `calculateFare` y la dirección del geocodificador existente; si este falla se usa su fallback, nunca una dirección del mensaje. (`node:test` con geocodificador falso; pantalla: No verificado en dispositivo)

### Criterios de diseño
- **CA-003-D1** [RNF-22] Textos de la sección, permisos, estados y «La solicitud expiró» están en `labels.js`; sin `Alert` ni colores sueltos. (grep + auditoría)
- **CA-003-D2** [RNF-23] Interruptor y botones ≥48 dp, con `accessibilityLabel`; estado «bloqueado» con texto además de color. (auditoría; lectura con lector de pantalla: No verificado en dispositivo)
- **CA-003-D3** [RNF-22] La sección «Notificaciones» sigue el estilo de Configuración existente y el botón de prueba es visible con `SHOW_DEV_TOOLS=false`. (auditoría)

## 5. Casos límite

- Token vencido/inválido: borrado por RF-84; el siguiente `onTokenRefresh` registra el nuevo.
- Permiso denegado: sin token; estado con enlace a ajustes; el interruptor no queda «activo» engañoso.
- Cambio de cuenta: baja antes de `signOut`; si falla o vence, el registro del nuevo uid reasigna el token en transacción (RF-80) y `deleteToken` local invalida el viejo.
- Solicitud vencida: «La solicitud expiró»; el `ttl` ≈90 s limita avisos tardíos.
- Solicitud válida pero tocada tarde: si no pasó `expiresAt` se muestra y se decide en 15 s desde que aparece, aunque queden más de 15 s de validez.
- App cerrada: lo entrega el sistema; el toque usa la intención pendiente. Fabricantes que matan procesos: límite documentado (FR-7).
- Sin red: el botón de prueba se deshabilita; el registro de token reintenta al volver la red; la baja en `resetSession` falla en silencio y no bloquea (3 s).
- Varios dispositivos: se envía a todos los del uid; el dedupe evita doble tarjeta en uno solo.
- Notificación duplicada: dedupe por `requestId` (RF-75).
- Toque con sesión vencida: la intención espera a que se resuelva el estado; sin sesión se descarta y se ve el login.
- Toque de la notificación de un conductor con otro conductor en sesión: la intención se descarta (RF-76).
- Doble toque: una sola apertura.
- Viaje en curso: la intención se ignora.
- `Disponible` falso al tocar (proceso muerto): ver D-130.
- Geocodificador sin respuesta: se usa su fallback (D-125, D-138).
- Más de 500 tokens de un uid: lotes de 500 (no esperable aquí).

## Seguridad
Abuso del endpoint: guard + límite propio + 0–60 s + plantilla fija + solo tokens del llamante. Suplantación de uid: el uid sale del ID token. Colección `pushTokens` cerrada a los clientes (reglas por defecto). Payload sin datos personales, sin tarifa ni direcciones (`targetUid` es un identificador opaco de la propia cuenta). Errores genéricos. Sin secretos en registros. Cuenta de servicio no leída. Token FCM tratado como secreto: nunca registrado completo (solo los primeros 8 caracteres y su longitud, en `__DEV__`, por instrucción de Anderson en S1). El cambio de reglas, si alguno, solo como texto en `docs/seguridad.md` (no lo toca esta spec).

## Accesibilidad
Ver RNF-23 y CA-003-D2. El aviso del sistema usa título y cuerpo legibles por TalkBack.

## 6. No encontrado y riesgos abiertos
- Un `calculateFare` en `backend/src`: no existe y no se crea (D-132).
- Reglas de Firestore e índices manuales para tokens: no hacen falta (D-131).
- Dedupe por id en la compuerta actual (se agrega).
- Verificación de `onNotificationOpenedApp` / `getInitialNotification` en RN Firebase 27.1.1: se ejercita en el spike S1.
- Un mínimo de `firebase-admin` para HTTP v1: se confirma en S2 con un envío real.
- **Riesgo abierto:** la guía de FCM marca `token` como deprecado a favor de `fid` y el overload de tokens de `sendEachForMulticast` como obsoleto; con `firebase-admin` 13.10.0 instalada se usa `tokens`. Se confirma en S2 (https://firebase.google.com/docs/cloud-messaging/send/admin-sdk).
- El código de error equivalente a UNREGISTERED en el Admin SDK de Node se confirma en S2.
- `uid` destino en `data` (`targetUid`): necesario para RF-76; es una propuesta de esta revisión (ver pregunta 6).

## 7. Qué debe aprobar el equipo
Estado de las decisiones (`docs/decisiones.md`): D-126 Aprobada, sujeta al spike; D-130 Aprobada con matiz; D-131 Aprobada con cambio de diseño; D-132 y D-136 RECHAZADAS; D-127, D-128, D-129, D-133, D-134, D-135, D-137 y D-138 en «Propuesta» (las aprueba Anderson al aprobar esta spec).
- Aprobar la spec revisada (Estado «Borrador» hasta entonces) y, con ella, D-127…D-129, D-133…D-135, D-137 y D-138.
- `plan.md` y tareas T-167…T-195 regenerados en la revisión 1b; pendientes de la puerta de Fase 2 de Anderson.
- En Fase 2: cambios en `scripts/dependencies.json` y `app.json`; actualizar `docs/omisiones-y-limites.md` (FCM deja de estar omitido; iOS sigue sin cubrir), README (obtención de `google-services.json`) y `docs/seguridad.md` (no hay reglas nuevas ni índices manuales).
- Pasos manuales del humano: build nativo, `google-services.json`, habilitar la API de Cloud Messaging V1, prueba en celular.

### Preguntas abiertas para Anderson
1. ¿`ttl` y `expiresAt` de ≈90 s (D-137) o prefieres otro valor?
2. ¿Límite de 5 pruebas por minuto?
3. ¿Si S1 falla, apruebas el plan B `expo-notifications` (agregarlo a `scripts/dependencies.json`)?
4. ¿Tras `sign-out-failed` se restaura `notificationsEnabled` y se re-registra el token (RF-73)? Lectura conservadora propuesta: sí.
5. ¿Dar de baja un token ajeno responde igual que uno inexistente (RF-80)? Lectura conservadora propuesta: sí.
6. ¿Se acepta `targetUid` en `data` para ligar la intención al uid (RF-76)? Es un identificador de la propia cuenta, no un dato personal.
7. ¿El cambio de origen del conteo de 15 s (D-137) y la corrección de la cita de D-85 van en una tarea de la Fase 2 de esta spec o aparte?

### Resolución de preguntas abiertas (Fase 2, S1, 2026-11-16; las resuelve el agente principal por encargo de Anderson, recomendaciones documentadas)
- **P6 `targetUid` en `data`:** se acepta. Es el identificador de la propia cuenta, no un dato personal; sin él la app no puede ligar la intención al uid (RF-76, D-133).
- **Validez de 30 s del mock:** con D-137 (aprobada) deja de aplicar. La validez del mock sigue siendo un dato aparte (≥15 s) y la ventana de decisión es de 15 s, separada de la validez (T-194, T-195).
- **Numeración T-194/T-195:** se conserva. Llevan números finales para no mover T-185, T-190, T-192 y T-193, que la spec cita por número; se ejecutan justo después de T-177 y antes de S4 (plan §2).
- **DP-62:** se conserva como está en el plan (`pushOffered`; aceptar en la pantalla de solicitud es la confirmación; no se publica disponibilidad desde segundo plano), coherente con D-130 aprobada con matiz.
- **Código de token no registrado en el Admin SDK de Node:** `messaging/registration-token-not-registered` (`MessagingClientErrorCode.REGISTRATION_TOKEN_NOT_REGISTERED`, verificado en `backend/node_modules/firebase-admin/lib/utils/error.js:811-812`; el prefijo `messaging/` lo añade el SDK). Equivale a UNREGISTERED (HTTP 404) de la guía v1 (https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode.md.txt). La página https://firebase.google.com/docs/reference/admin/error-handling no lista la cadena de Node; solo UNREGISTERED. Se borra el token solo con este código; `invalid-registration-token` y los demás no borran sin prueba en S2 (CA-003-15).

## 8. Trazabilidad

| Requisito | Fuente | Criterios |
|---|---|---|
| RF-67 | PDF §7 / R-113, G-04; D-126 | CA-003-01, 18 |
| RF-68 | R-113; D-129; investigación §2 | CA-003-02 |
| RF-69, RF-70 | R-113; Android 13+ | CA-003-03 |
| RF-71 | ENCARGO (decisión 6), RNF-04 | CA-003-04 |
| RF-72 | R-113 | CA-003-05 |
| RF-73 | D-98, D-104, D-134 | CA-003-06, 07, 19, 20 |
| RF-74 | ENCARGO (decisión 6), RNF-04; D-134 | CA-003-04, 19 |
| RF-75 | R-113; D-135; pendingRequest.js | CA-003-08 |
| RF-76 | R-113; D-133 | CA-003-09, 21 |
| RF-77 | R-113; R-041; RF-11; D-137 | CA-003-09, 26, 27, 28, 29 |
| RF-78 | R-113; D-130, D-132, D-138 | CA-003-30 |
| RF-79 | ENCARGO (decisión 3); D-127, D-128, D-131 | CA-003-10, 11, 22, 23 |
| RF-80 | D-131 | CA-003-10, 25 |
| RF-81 | ENCARGO (decisión 2); D-130, D-131 | CA-003-12, 24 |
| RF-82 | ENCARGO (decisión 2); R-084, R-067; D-132, D-138 | CA-003-13 |
| RF-83 | ENCARGO (decisión 5); D-137, D-138 | CA-003-13, 14 |
| RF-84 | ENCARGO (decisión 5); D-131; FCM ErrorCode | CA-003-15 |
| RF-85 | ENCARGO (decisión 2); middleware.js | CA-003-16 |
| RNF-21, RNF-25 | Constitución; C15; D-24 | CA-003-17 |
| RNF-22, RNF-23 | DESIGN.md; ENCARGO (decisión 9) | CA-003-D1…D3 |
| RNF-24 | Constitución (pruebas) | CA-003-06, 08, 19…21, 28 |

### Tareas finales de verificación (S6)
- **T-190 (verificación estática total)** verifica: RF-67, RF-68 (configuración), RF-70 a RF-76, RF-79 a RF-85, RNF-21, RNF-22, RNF-24, RNF-25; CA-003-01, 05 a 17, 19 a 25, 27 a 30, CA-003-D1.
- **T-192 (lista de comprobación en dispositivo)** verifica, con marca «No verificado en dispositivo» hasta tener evidencia: RF-68, RF-69, RF-70, RF-71, RF-74, RF-76, RF-77, RF-78, RNF-23; CA-003-02, 03, 04, 09, 26, 30, CA-003-D2.
- **T-193 (demo final, STOP-4)** verifica: RF-67 de extremo a extremo, RF-72, RF-77 (ventana de 15 s desde mostrarse y expiración al tocar), RF-78, RF-81 a RF-84 con envío real; CA-003-18 y repite en el celular CA-003-26 y 28.
