# Plan — Spec 007 Solicitudes automáticas por FCM mientras el conductor está «Disponible»
<!-- AI-assisted: see AI_LOG.md #70 -->

Estado: **Borrador** (planner; la spec 007 sigue en Borrador, Anderson ordenó continuar sin esperar aprobación, `AI_LOG.md` #70, y eso no es aprobación formal). Tareas T-273 a T-278, lote L4, en `docs/backlog.md`. D-197 ya existe en `docs/decisiones.md`; este plan no la duplica. Las decisiones DT-n de abajo son locales del plan, no decisiones del proyecto.

## 0. Hallazgos del código real
- Backend: `backend/src/routes/notifications.js` (`createNotificationsHandlers`: `register`, `unregister`, `testRequest`, `close`; mapa `pending` uid→temporizador; `sendToUid` lee tokens, arma `buildTestRequest`, envía por lotes y retira tokens caducados; `testRequest` exige `drivers/{uid}.accountStatus === 'approved'`, si no `ERRORS.invalid`, sin tokens `ERRORS.notFound`); guard en `createGuard` (límite por IP y por usuario); `app.js` recibe el seam `notifications` y expone `closeNotifications()`; `server.js` lo llama al apagar; `config.js` guarda constantes y `loadConfig(env)`.
- Pruebas del backend: `scripts/tests/backend*.test.mjs` con `node --test` (`npm test`), helper `scripts/tests/helpers/notificationsFakes.mjs` (`createFakeDb`, `createFakeMessaging`, `createFakeTimers`, `startApp`). Ahí se prueba todo el backend.
- App: `src/services/notifications/notificationsApi.js` (`createNotificationsApi`, `post` privado, errores OFFLINE/RATE_LIMITED/NO_DEVICES/SESSION/SERVER), cableado en `notificationsService.js`; `registration.js` + `registrationRuntime.js` (estado `enabled`, `status` idle/registered/failed, `subscribe`); `src/context/AvailabilityContext.js` (`isAvailable`, `onTrip`, `watching`, `useTripRequests({ enabled: watching })`, `AppState`); `src/hooks/useTripRequests.js` (suscribe al simulador solo con `enabled`; `offerPushRequest` funciona sin suscripción); `mockPassengerApi.js` emite cada 10–20 s (`MOCK_EMIT_MIN_MS=10000`).
- `NotificationsBridge.js` y la recepción (D-133/D-146, D-135, D-137) no se tocan: la solicitud del servidor llega por el mismo camino que «Solicitud de prueba» (RA-15, RA-16).

## 1. Enfoque
Cuatro rebanadas: S1 backend (T-273, T-274), S2 app (T-275, T-276), S3 documentación (T-277), S4 prueba en celular (T-278). No hay texto de UI nuevo, no hay dependencias nuevas, no se toca `firestore.rules`, `app.json` ni nativo.

## 2. Archivos → responsabilidad → requisitos
| Archivo | Responsabilidad | Requisitos |
|---|---|---|
| `backend/src/notifications/generator.js` (nuevo) | Generador puro en memoria por uid, con reloj, `random`, `setTimeout`, `clearTimeout`, `send`, `isEligible` inyectados | RA-01, 02, 03, 05, 10, 11, 12 |
| `backend/src/config.js` | Constantes y lectura de variables `AUTO_REQUEST_*` con valores por defecto seguros | RA-04 |
| `backend/src/routes/notifications.js` | Handler `availability`; `unregister` y `close` cancelan el generador | RA-06, 07, 10, 11, 19 |
| `backend/src/app.js`, `backend/src/server.js` | Ruta `POST /notifications/availability` con el guard existente; cierre del generador al apagar | RA-06, RA-10 |
| `backend/.env.example` | Solo nombres de las variables | RA-04, RA-17 |
| `src/services/notifications/notificationsApi.js` | `reportAvailability(available)` con tiempo de espera propio de 5 s | RA-08, 09, 18 |
| `src/services/notifications/requestSource.js` (nuevo) | Función pura `chooseRequestSource` | RA-13, 14 |
| `src/services/notifications/availabilityReporter.js` (nuevo) | Reporta cambios, latido, confirmación; sin ubicación ni registro de datos | RA-08, 09, 13, 18 |
| `src/hooks/useRequestSource.js` (nuevo) | Une reportador, registro de notificaciones y estado de disponibilidad; devuelve la fuente | RA-13, 14 |
| `src/context/AvailabilityContext.js` | `useTripRequests({ enabled: source === 'mock' })` en lugar de `watching` | RA-13, 15 |
| `README.md`, `docs/omisiones-y-limites.md` | Variables, tres límites, sin escrituras a Firestore | RA-04, 17, 19 |

## 3. Contratos
- `POST /notifications/availability`, cabecera `Authorization: Bearer <ID token>`, cuerpo `{ available: boolean }`. Respuesta 200 `{ active: boolean }`. Errores como los demás endpoints: 401, 429, `ERRORS.invalid` (cuerpo inválido o cuenta no aprobada con `available: true`), `ERRORS.notFound` (`available: true` sin tokens).
- `createAvailabilityGenerator({ now, random, setTimeout, clearTimeout, send, isEligible, config })` → `{ report(uid, available): boolean, cancel(uid), close(), has(uid) }`. `send(uid)` y `isEligible(uid)` son asíncronas y las aporta el handler.
- `config`: `{ firstMinMs, firstMaxMs, nextMinMs, nextMaxMs, maxPerSession, heartbeatMaxMs }`.
- Variables: `AUTO_REQUEST_FIRST_MIN_S` (15), `AUTO_REQUEST_FIRST_MAX_S` (30), `AUTO_REQUEST_NEXT_MIN_S` (60), `AUTO_REQUEST_NEXT_MAX_S` (120), `AUTO_REQUEST_MAX_PER_SESSION` (10), `AUTO_REQUEST_HEARTBEAT_MAX_MIN` (30). Un valor ausente, no numérico o fuera de orden vuelve al valor por defecto.
- `createNotificationsApi(...).reportAvailability(available)` → `{ ok: true, active: boolean }` o `{ ok: false, error }`.
- `chooseRequestSource({ available, onTrip, notificationsReady, backendConfirmed })` → `'none' | 'server' | 'mock'`.
- `createAvailabilityReporter({ api, now, setTimeout, clearTimeout, onConfirmedChange })` → `{ update({ effective, foreground }), foreground(), stop() }`.

## 4. Decisiones técnicas
- **DT-1 Una entrada por uid.** `{ timer, count, lastReportAt, capped }`. Un `report(uid, true)` con entrada existente solo refresca `lastReportAt`: no crea temporizador ni reinicia `count` (RA-05). `report(uid, false)`, `cancel` y `close` borran la entrada y cancelan el temporizador. Con el tope alcanzado la entrada queda marcada hasta un `false` (RA-03).
- **DT-2 El disparo revisa de nuevo.** Al vencer, el temporizador vuelve a comprobar cuenta aprobada, tokens y latido (`now - lastReportAt <= heartbeatMaxMs`); si algo falla, borra la entrada y no envía (RA-10, 11). Un envío que lanza se captura y se programa el siguiente (RA-12). Una solicitud vencida o rechazada cuenta para el tope igual.
- **DT-3 Intervalos.** Primer envío en [firstMin, firstMax]; siguientes en [nextMin, nextMax]; `delay = min + floor(random * (max - min + 1))` en ms, con `random` en [0, 1) (extremos alcanzables en la prueba).
- **DT-4 Latido de la app: cada 5 min** con la app en primer plano y disponibilidad efectiva, y al volver a primer plano, con **mínimo 60 s entre reportes de latido** (los cambios de estado no esperan ese tope). 5 min deja 6 latidos de margen frente al máximo de 30 min. En segundo plano la app no reporta; el generador del servidor sigue hasta el máximo de 30 min y se detiene solo (conductores fantasma acotados).
- **DT-5 Regla de fuente única.** Fuente = `none` si no está disponible o hay viaje; `server` solo si disponible, sin viaje, notificaciones listas (registro `enabled` y `registered`) y `backendConfirmed`; `mock` en cualquier otro caso disponible sin viaje. `backendConfirmed` se vuelve verdadero solo con una respuesta 200 `active: true` al último reporte `true`, y se vuelve falso al instante al dejar de ser efectiva la disponibilidad, al perder el registro o ante cualquier reporte fallido (sin espera). Cuando la confirmación se pierde estando disponible, el mock arranca y se intenta un `available: false` de mejor esfuerzo. Garantía del camino normal (sin ventana de doble fuente): el mock se detiene solo con la confirmación y el servidor tarda al menos 15 s tras el reporte en enviar; el tiempo de espera de la respuesta (5 s) y la primera emisión del mock (≥ 10 s) hacen que el mock quede desuscrito antes de que el servidor envíe. Al volver el servidor tras una caída, la confirmación llega primero, el mock se detiene y el servidor envía ≥ 15 s después. No hay ventana en el camino normal; los casos de abajo se documentan.
- **DT-6 Límite residual (se documenta, no se oculta).** Si el servidor procesó el reporte pero la respuesta se pierde, el mock queda activo mientras el servidor genera; el `available: false` de mejor esfuerzo y el máximo de 30 min lo acotan. Mismo efecto si el teléfono pierde alcance del backend con el generador activo. El dedupe por `requestId` (D-135) no cubre dos fuentes distintas.
- **DT-7 Cuenta no aprobada.** `available: true` de cuenta no aprobada responde `ERRORS.invalid` (igual que `testRequest`); `available: false` se acepta siempre (permite detener).
- **DT-8 Privacidad.** El cuerpo es solo `{available}`; el backend ignora cualquier campo extra y toma el uid únicamente del ID token; ningún `console.*` nuevo imprime token, uid ni cuerpo, solo códigos fijos (RA-18). El estado vive solo en memoria: cero lecturas extra por reporte salvo las ya existentes de aprobación/tokens, y cero escrituras (RA-19).
- **DT-9 Un solo generador por uid.** Con dos dispositivos del mismo uid, `send` usa todos los tokens del uid. La baja de token (`unregister`) cancela el generador del uid solo si ya no quedan tokens; si queda otro dispositivo, el generador sigue (el siguiente disparo reevalúa tokens).

## 5. Diseño
N/A: no hay texto de UI nuevo, ni pantallas ni componentes nuevos. Por eso no hay tarea de auditoría de diseño. Si el implementer necesitara un texto, se detiene y lo informa (módulo de idioma con paridad es/en, sin `Alert`).

## 6. Mapa CA → implementación y prueba
| CA | Implementación | Prueba |
|---|---|---|
| CA-007-01, 02, 03, 05, 10 | `generator.js` | `scripts/tests/backendAutoRequestGenerator.test.mjs` (T-273) |
| CA-007-04 (no disponible, tope, latido vencido, token eliminado) | `generator.js` | mismo archivo (T-273) |
| CA-007-04 (cierre de sesión/baja de token, notificaciones desactivadas, cierre del backend), CA-007-06, 07, 08, 09, 11 | `routes/notifications.js`, `app.js`, `server.js` | `scripts/tests/backendAutoRequests.test.mjs` (T-274) |
| CA-007-04 (viaje en curso, no disponible desde la app) | `availabilityReporter.js`, `requestSource.js` | `availabilityReporter.test.mjs` (T-276) |
| CA-007-12 | `availabilityReporter.js` | `scripts/tests/availabilityReporter.test.mjs` (T-276) |
| CA-007-13 | `requestSource.js` | `scripts/tests/requestSource.test.mjs` (T-275) |
| CA-007-14 | sin cambios en recepción | `npm test` en T-274 y T-276 |
| CA-007-15 | README, `.env.example`, omisiones | T-277 (lectura y búsqueda) |
| CA-007-16 | código nuevo de T-273 a T-276 | prueba estática en `scripts/tests/availabilityPrivacy.test.mjs` (T-276) |
| CA-007-17 | todas | `git diff` sin `package.json`, `firestore.rules`, `app.json`; `node scripts/check-constitution.mjs` (base de 14 errores) en cada tarea |
| STOP-8 (a)–(i) | todo | T-278, **No verificado en dispositivo** |
