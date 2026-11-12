# Plan 002 — Funcionalidad final (solicitud, accesibilidad, marcador de auto, cuenta y sesión)

Spec: `specs/002-funcionalidad-final/spec.md` (estado en la spec: Borrador; el encargo de Anderson, prompt #54, autoriza R1 a R4 y él ratifica después. Este plan se escribe bajo ese encargo y NO sustituye la aprobación: si Anderson cambia la spec, el plan se rehace por P5).
Requisitos: RF-31 a RF-38, RNF-14 a RNF-17 (extiende RF-29, RNF-04). Criterios: CA-002-01 a CA-002-40, CA-002-D1 a D6.
Decisiones propuestas que usa: D-93 a D-103 (viven en la spec; el agente principal las registra en `docs/decisiones.md`).
Precedencia: ENCARGO > constitución > decisiones > spec/diseño > este plan > tareas.
Estado del plan: recién escrito, pendiente de revisión de Anderson. Las tareas T-55 a T-76 son las de R1 a R4 (estado propio en el backlog). El lote final R5 a R10 (RF-39 a RF-52, RNF-18/19, CA-002-41 a 90, D-107 a D-110) se planifica en la sección 8 con T-77 a T-117, todas Pendiente; esa adición de la spec sigue sin aprobar y sus decisiones D-107 a D-110 son Propuesta. Las restricciones de la línea de «Restricciones de ejecución» (backend sin cambios, cero dependencias) rigen R1 a R4; el lote final las sustituye por la sección 8.
Numeración: T-50 a T-53 siguen reservadas (README, bitácora, video, cierre; `docs/plan-entrega-final.md`) y T-54 es la última en uso, por eso este plan empieza en T-55.
Restricciones de ejecución: congelar código el jueves 2026-11-12 12:00; una rebanada = un commit local (lo hace el humano); cero dependencias nuevas (CA-002-40); `backend/` sin cambios (CA-002-39); builds nativos los hace el humano.

## 0. Rebanadas, orden y dependencias

| Rebanada | Tareas | Depende de | Independiente de |
|---|---|---|---|
| S1 R1 solicitud sin scroll | T-55, T-56 | — | S2, S3, S4 |
| S2 R2 accesibilidad | T-57, T-58, T-59, T-60 | T-60 va después de T-55 y T-56 (mismos archivos; es orden de edición, no lógica) | S3, S4 |
| S3 R3 marcador de auto | T-61, T-62 | — | S1, S2, S4 |
| S4a R4a servicio y lógica pura | T-63, T-64, T-65 | — | S1, S2, S3 |
| S4b R4b puerta y pantallas | T-66, T-67, T-68, T-69 | S4a | S1, S2, S3 |
| S4c R4c cierre de sesión | T-70, T-71, T-72 | S4b | S1, S2, S3 |
| S4d R4d documentación | T-73, T-74 | S4c (describe lo construido) | — |
| Auditorías de diseño | T-75 (R1, R2, R3), T-76 (R4) | T-75 tras S1+S2+S3; T-76 tras T-71 | — |

Cadena S4: S4a -> S4b -> S4c -> S4d. Orden sugerido si falta tiempo antes del jueves: S4a-S4c primero (riesgo alto y dependencias), S1 después, S3 y S2 al final. Punto de control en dispositivo agrupado según D-59 si Anderson lo mantiene vigente: uno tras S1+S2+S3 y uno tras S4c (checklist en T-74).

## 1. Qué ya existe y se conserva
- `RootNavigator.js` (`ROOT_SCREEN`, `pickScreen` pura, un único `Stack.Screen` por estado), `StartupScreen`, `AppStateContext` (contrato `driverId, driverProfile, accountStatus, retryAccountStatus, simulateAccountStatus, demoValue, setDemoValue`), `AvailabilityContext`, `TripContext` (montados en `MainDrawer`), `RegistrationFormContext` (montado en `RegistrationTabs`), `src/services/firebase.js` (`auth` con persistencia AsyncStorage, `db`), `driverRepository`, `driverLocationPublisher`, `trip/driverLocationWriter`, `trip/pendingRequest`, `trip/tripController`, `utils/mask.js` (`maskEmail`), `utils/validators.js`, `registration/TextField`, `PrimaryButton`, `SecondaryButton`, `Card`, `DataRow`, `ScreenState`, `Icon`.
- La spec 002 NO crea contexto nuevo de autenticación (ver DP-03): extiende `AppStateContext`.

## 2. Decisiones técnicas del plan (DP-NN; no sustituyen `docs/decisiones.md`)
- **DP-01 (lógica pura aparte de Firebase y de React).** Todo lo verificable con script vive en módulos sin imports de `react-native`, Firebase ni contextos: `src/utils/authErrors.js`, `src/utils/authValidators.js`, `src/utils/vehicleColor.js`, `src/services/session/resetSession.js` (dependencias inyectadas) y `pickScreen` ampliada. Los scripts del verifier los importan tal cual.
- **DP-02 (red solo en `src/services/`).** Las llamadas a Firebase Auth viven en `src/services/authService.js`; las pantallas no importan `firebase/auth` ni `@firebase/auth` (constitución §3).
- **DP-03 (la puerta de autenticación vive en `AppStateContext`).** Se añade `authStatus` (`'loading' | 'signedOut' | 'signedIn'`) y `authUser` ligero (`{ uid, email }`, sin tokens) al valor del contexto; `driverId` pasa a ser `authUser?.uid`. El contexto deja de llamar `ensureAnonymousUser()` y se suscribe a `onAuthStateChanged` (vía `authService.listenToAuthState`); solo con `signedIn` abre `listenToDriverAccount(uid)`. Razón: es el único consumidor de `ensureAnonymousUser` y evita un segundo contexto.
- **DP-04 (sesión anónima heredada, D-97).** En el primer `onAuthStateChanged` con `user.isAnonymous === true` se llama `signOut` y se trata como `signedOut` sin mostrar error ni migrar. Solo se lee `isAnonymous` (CA-002-37).
- **DP-05 (`pickScreen` ampliada, sin romper la firma).** `pickScreen(accountStatus, authStatus)`: `authStatus` `'loading'` -> carga; `'signedOut'` -> `ROOT_SCREEN.AUTH`; `'signedIn'` -> la lógica actual por `accountStatus`. Se añade `ROOT_SCREEN.AUTH`. La llamada con un solo argumento sigue válida solo en pruebas antiguas: el segundo parámetro por defecto es `'signedIn'`.
- **DP-06 (`AuthStack` propio).** Stack nativo con tres rutas (`Login`, `SignUp`, `ForgotPassword`) en `src/navigation/AuthStack.js`, montado por `RootNavigator` en la rama AUTH. No usa Expo Router (el proyecto usa React Navigation).
- **DP-07 (cadena de construcción para que el proyecto siga arrancando).** Las pantallas de autenticación se crean ANTES de la puerta: T-66 (Login), T-67 (Crear cuenta), T-68 (Recuperar) quedan sin enlazar a la app; T-69 conecta la puerta y retira la dependencia de `ensureAnonymousUser`. El `AuthStack` nace en T-66 solo con `Login`; T-67 añade `SignUp` y `login-link-signup`; T-68 añade `ForgotPassword` y `login-link-forgot`. Así ninguna tarea navega a una ruta inexistente.
- **DP-08 (componentes de formulario de autenticación).** Se reutiliza `registration/TextField` (testID, error, `accessibilityLabel`). Se añaden `src/components/auth/PasswordField.js` (campo + botón mostrar/ocultar de 44 x 44, etiqueta según estado, `autoComplete`/`textContentType`) y `src/components/auth/AuthFormError.js` (ícono + texto en región viva `polite`). Ambos nacen en T-66 y los reutilizan T-67 y T-68.
- **DP-09 (foco al primer error, D-103).** Cada pantalla guarda refs de sus campos y, tras un intento de envío inválido, llama `focus()` sobre el primero con error; el orden lo da una función pura `firstInvalidField(errors, order)` en `authValidators.js`.
- **DP-10 (anti doble envío).** `submitting` en estado local; el botón se deshabilita y el manejador sale temprano si ya está enviando (CA-002-34). La contraseña vive solo en estado local de la pantalla y se pone en `''` en el desmontaje (`useEffect` cleanup) y tras el éxito (CA-002-33).
- **DP-11 (`resetSession` con dependencias inyectadas, D-98).** `createSessionReset(deps)` devuelve `resetSession()` async. `deps`: `hasTripInProgress()`, `discardPendingRequest()`, `setUnavailableAndPublishFinal()`, `stopLocation()`, `releaseSubscriptions()`, `clearContexts()`, `clearOwnStorage()`, `signOut()`, `now`/`timeout` inyectables y `finalPublishTimeoutMs` (por defecto 5000). Resultado: `{ ok: true } | { ok: false, reason: 'TRIP_IN_PROGRESS' | 'SIGN_OUT_FAILED' }`. El paso 3 usa una carrera con el tiempo límite: un fallo o vencimiento NO detiene los pasos 4 a 6.
- **DP-12 (cableado real en un hook, no en el servicio).** `src/context/useSessionReset.js` arma las dependencias reales a partir de `useAvailability()`, `useTrip()`, `useAppState()` y el formulario de registro, y las pasa a `createSessionReset`. Se usa solo desde Configuración, que vive dentro de `MainDrawer` (providers montados). Los contextos se desmontan solos al cambiar la rama a AUTH; el paso 5 además los limpia explícitamente por si el cambio de rama se retrasa.
- **DP-13 (almacenamiento propio).** Un `grep` de `AsyncStorage` en `src/` decide qué claves propias existen; `clearOwnStorage` borra solo las claves propias (nunca la persistencia de Firebase). Si no hay claves propias, el paso queda como función vacía documentada y la tarea lo anota (CA-002-31).
- **DP-14 (accesibilidad de la cuenta regresiva, D-101).** El texto accesible de la región viva se calcula con una función pura `countdownAnnouncement(secondsLeft)` (devuelve texto solo para 10, 5 y 0, si no `null`/valor anterior). Cualquier región `assertive` ligada al contador pasa a `polite`.
- **DP-15 (marcador de auto).** Función pura `vehicleColorToken(colorValue)` en `src/utils/vehicleColor.js` que devuelve un color de `tokens.vehicleColor` (nueve entradas + `otro`/desconocido -> `color.primary`). `CarMarker` (`src/components/map/CarMarker.js`) dibuja la insignia circular con `Icon` (Ionicons `car`) teñido; `TripMap` lo monta con el componente de marcador/anotación de vista de `@maplibre/maplibre-react-native` ya instalado (el implementer confirma el nombre exportado en la versión instalada leyendo `node_modules`, sin dependencias nuevas). El color llega por prop `vehicleColor` desde `TripActiveScreen`, que lo toma de `driverProfile` ya cargado (sin consulta nueva, CA-002-14). La capa de círculo `DRIVER_PAINT` se retira cuando el marcador lo sustituye. Rotación: fuera de alcance (opcional en la spec).
- **DP-16 (ruta de la documentación de sesiones).** El encargo nombra `docs/arquitectura/sesiones`; el repositorio usa archivos planos `docs/arquitectura-*.md`. Se crea `docs/arquitectura-sesiones.md`. Anderson puede renombrarlo.
- **DP-17 (publicación de reglas, D-99).** El plan solo prepara el texto en `docs/seguridad.md`; NINGUNA tarea publica reglas ni toca la consola. El orden y quién publica quedan escritos (CA-002-36).
- **DP-18 (pruebas).** Sin framework de pruebas en el proyecto: la verificación es por scripts temporales fuera del proyecto (carpeta de scratchpad) contra los módulos puros reales y `node scripts/check-constitution.mjs`. Ninguna tarea añade carpeta de pruebas.

## 3. Archivos -> responsabilidad -> requisitos
Marca: (E) existente que se modifica, (N) nuevo.

| Archivo | Responsabilidad | Requisitos | Tarea |
|---|---|---|---|
| `src/screens/trip/TripRequestScreen.js` (E) | Precio primero, botones fijos fuera del desplazable; cuenta regresiva polite en umbrales | RF-31, RNF-14 iv | T-55, T-60 |
| `src/components/IncomingRequestCard.js` (E) | Igual para la tarjeta sobre otras pantallas | RF-31, RNF-14 iv | T-56, T-60 |
| `src/components/registration/SelectField.js`, `DateField.js`, `PhotoField.js` (E) | Valor en la etiqueta accesible; limpieza de comentario; un solo anuncio del indicador de subida | RNF-14 i, vi | T-57 |
| `src/navigation/AppTabBar.js`, `AppDrawerContent.js` (E), `src/components/ScreenState.js` (E), `src/constants/labels.js` (E) | Etiquetas completas con fuente 200 %; fondo de entrada activa al presionar; comentario huérfano; clave `history.route` | RNF-14 ii, v, vi | T-58 |
| `src/screens/trip/TripActiveScreen.js` (E) | Acción principal fija bajo el panel desplazable; pasa el color del auto a `TripMap` | RNF-14 iii, RF-32 | T-59, T-62 |
| `src/theme/tokens.js` (E), `docs/diseno/guia-de-estilo.md` (E), `src/utils/vehicleColor.js` (N) | Tokens `vehicleColor`, función pura, contrastes anotados | RF-32 | T-61 |
| `src/components/map/CarMarker.js` (N), `src/components/map/TripMap.js` (E) | Marcador de auto en el mapa | RF-32 | T-62 |
| `src/utils/authErrors.js` (N), `src/utils/authValidators.js` (N), `src/constants/labels.js` (E) | Mapeo de errores y validación puros; textos | RF-33, RF-34, RF-35, RNF-15 | T-63 |
| `src/services/authService.js` (N) | Alta, acceso, recuperación, cierre, suscripción a sesión (envuelve `auth`) | RF-33 a RF-37, RNF-15 | T-64 |
| `src/services/session/resetSession.js` (N) | Procedimiento de cierre de 6 pasos con dependencias inyectadas | RF-37, RNF-04 | T-65 |
| `src/components/auth/PasswordField.js`, `AuthFormError.js`, `src/navigation/AuthStack.js`, `src/screens/auth/LoginScreen.js` (N), `src/constants/labels.js` (E) | Pantalla Iniciar sesión | RF-34, RNF-15, RNF-17 | T-66 |
| `src/screens/auth/SignUpScreen.js` (N), `AuthStack.js`, `LoginScreen.js`, `labels.js` (E) | Pantalla Crear cuenta | RF-33, RNF-15, RNF-17 | T-67 |
| `src/screens/auth/ForgotPasswordScreen.js` (N), `AuthStack.js`, `LoginScreen.js`, `labels.js` (E) | Pantalla Recuperar contraseña | RF-35, RNF-15, RNF-17 | T-68 |
| `src/context/AppStateContext.js`, `src/navigation/RootNavigator.js`, `src/screens/startup/StartupScreen.js` (E) | Puerta de autenticación y cierre de anónimas heredadas | RF-36 | T-69 |
| `src/context/useSessionReset.js` (N), `AvailabilityContext.js`, `TripContext.js`, `RegistrationFormContext.js` (E) | Cableado real y limpieza de contextos | RF-37, RNF-04 | T-70 |
| `src/screens/main/SettingsScreen.js` (E), `labels.js` (E) | Sección Cuenta: correo enmascarado, Cerrar sesión, Cambiar de cuenta, confirmación | RF-37 | T-71 |
| `DevAccountSwitch.js` (borrar), `firebase.js`, `AppStateContext.js`, `HomeScreen.js`, `PersonalDataScreen.js`, `SettingsScreen.js`, `StartupScreen.js` (E) | Retiro de paneles y de `ensureAnonymousUser` | RF-38 | T-72 |
| `docs/seguridad.md` (E) | Texto de reglas y orden de publicación | RNF-16 | T-73 |
| `README.md` (E), `docs/arquitectura-sesiones.md` (N), `docs/checklist-dispositivo-sesiones.md` (N) | Flujo de sesión, D-94, D-95, consola, checklist | RNF-17, ENT-02 | T-74 |

## 4. Contratos (firmas)
```
// src/utils/authErrors.js
mapAuthError(context: 'login' | 'signup' | 'reset', error: { code?: string } | undefined) -> { kind: string, message: string, field?: 'email' | 'password' }
// nunca devuelve el código crudo; mensajes desde labels.auth.*

// src/utils/authValidators.js
validateEmail(value) -> string | null          // recorta, patrón D-62
validatePassword(value) -> string | null       // >= 8, sin recortar
validatePasswordConfirmation(password, confirmation) -> string | null
validateLogin({ email, password }) -> { email?, password? }
validateSignUp({ email, password, confirmation }) -> { email?, password?, confirmation? }
firstInvalidField(errors, order) -> string | null
passwordRequirements(password) -> [{ id, met: boolean }]

// src/services/authService.js
signUpWithEmail(email, password) -> Promise<{ uid }>
signInWithEmail(email, password) -> Promise<{ uid }>
sendPasswordReset(email) -> Promise<void>
signOutUser() -> Promise<void>
listenToAuthState(onUser: ({ uid, email, isAnonymous } | null) => void, onError) -> unsubscribe
// los errores se relanzan tal cual (con .code) para que mapAuthError los traduzca

// src/services/session/resetSession.js
createSessionReset(deps) -> () => Promise<{ ok: true } | { ok: false, reason: 'TRIP_IN_PROGRESS' | 'SIGN_OUT_FAILED' }>

// src/navigation/RootNavigator.js
pickScreen(accountStatus, authStatus = 'signedIn') -> ROOT_SCREEN.*

// src/utils/vehicleColor.js
vehicleColorToken(colorValue) -> string   // color de tokens.vehicleColor o color.primary

// src/utils/ (o labels) countdown
countdownAnnouncement(secondsLeft) -> string | null
```

## 5. Sección Diseño
- Tareas visuales: T-55, T-56, T-57 (solo accesibilidad, sin cambio visual), T-58, T-59, T-62, T-66, T-67, T-68, T-71. Cubiertas por T-75 (R1, R2, R3) y T-76 (R4). T-60 y T-61 no cambian lo visible salvo el contraste, que T-75 revisa.
- Solo tokens de `DESIGN.md`/`tokens.js`; componentes compartidos; Ionicons vía `Icon.js` junto a texto; 44 x 44 y separación de 8; error con ícono y texto en región `polite`; sin `Alert`; 200 % de fuente sin recortes; teclado sin tapar campo, error ni botón.
- El contraste 3:1 del marcador por color se anota en `docs/diseno/guia-de-estilo.md` (T-61).
- Estado "No verificado en dispositivo" para todo lo que solo se ve en el celular, hasta que Anderson lo confirme.

## 6. Mapa CA -> implementación
| CA | Tarea(s) |
|---|---|
| CA-002-01 a 05 | T-55 (pantalla), T-56 (tarjeta) |
| CA-002-06 | T-55, T-56 (diff sin cambios de `labels.js`, testID ni lógica) |
| CA-002-07, 12 | T-57, T-58 |
| CA-002-08, 11 | T-58 |
| CA-002-09 | T-59 |
| CA-002-10 | T-60 |
| CA-002-13, 16 | T-61 |
| CA-002-14, 15, 17, 18, 19 | T-62 |
| CA-002-20, 21 | T-63 (validación), T-67 (pantalla) |
| CA-002-22 | T-63 |
| CA-002-23 | T-66 |
| CA-002-24 | T-63, T-68 |
| CA-002-25, 26 | T-69 |
| CA-002-27 | T-71 |
| CA-002-28, 29, 30, 32 | T-65 (script) y T-70/T-71 (manual) |
| CA-002-31 | T-65, T-70 |
| CA-002-33, 34 | T-66, T-67, T-68 (y revisión en T-64) |
| CA-002-35, 36 | T-73 |
| CA-002-37 | T-72 |
| CA-002-38 | T-74 |
| CA-002-39, 40 | todas (verificación transversal; ninguna tarea toca `backend/`, `package.json` ni `scripts/dependencies.json`) |
| CA-002-D1, D3, D4, D5 | T-66, T-67, T-68, T-71; auditoría T-76 |
| CA-002-D2 | T-66, T-67, T-68 |
| CA-002-D6 | T-66 a T-71; `check-constitution` (C05) |

## 7. Riesgos y puntos abiertos para Anderson
- **Spec en Borrador.** Se planifica bajo el encargo del prompt #54; las decisiones D-93 a D-103 aún no están en `docs/decisiones.md`.
- **Pestañas de registro y cuenta pendiente sin salida.** Cerrar sesión se pide en Configuración (RF-37), pero esa pantalla solo existe en la rama principal; un usuario nuevo en la rama Registro (o con cuenta pendiente) no tiene cómo cambiar de cuenta. La spec no lo cubre; decidir si se añade una salida o se acepta (lo veo al probar con la cuenta A).
- **Plazo.** 22 tareas hasta el jueves 12:00 es ajustado; el orden sugerido de §0 prioriza R4.
- **Marcador.** Si el componente de anotación de MapLibre instalado no admite una vista nativa con `Icon`, el implementer se detiene y reporta antes de cambiar de enfoque (no se añade librería).
- **Numeración de carpeta 002.** Convive con `002-disponibilidad-ubicacion`; lo decide Anderson.

## 8. Lote final R5 a R10 (T-77 a T-117)

Fuente: spec 002 (adición R5 a R10) y `docs/analisis-brechas-2026-11-11.md` §5. Detalle de cada tarea en `docs/backlog.md` (sección «Spec 002 — Lote final»). T-73 y T-74 conservan su contenido y se ejecutan en F6; T-75 y T-76 siguen siendo las auditorías de R1 a R4.

### 8.1 Rebanadas y orden obligatorio
| Rebanada | Tareas | Qué deja | Punto de control |
|---|---|---|---|
| F1a | T-77, T-78 | guarda de fecha («NaN:NaN») y ayudante de pruebas puras | - |
| F1b | T-79, T-80 | política de publicación solo Disponible; Inicio con mapa completo y tarjeta flotante | A |
| F2 | T-81 a T-84 | licencia, SOAT y técnico-mecánica (≥5 años), `DateField`, Cloudinary, texto de reglas | A (tras T-83) |
| F4c | T-85 a T-89 | backend: config, auth, Firestore, Mercado Pago, `/health`, `/payments/checkout`, `/payments/sync`, `/webhooks/mercadopago` | - |
| F4a | T-90, T-91 | `docs/pagos.md` y texto de reglas de `trips` | - |
| F4d | T-92 a T-98 | ruta simplificada, modelo del viaje, servicio de pagos, Cobro y resumen, efectivo, método en la solicitud | B |
| F4e | T-99, T-100 | saldo puro y su pantalla | B |
| F3a | T-101 a T-106 | rangos en hora de Colombia, paginación, gráfica, filtros, Historial | - |
| F3b | T-107, T-108 | métricas puras con el ejemplo del enunciado y `useEarnings` | - |
| F3c | T-109, T-110 | detalle con la ruta planeada (D-110) | C |
| F5 | T-111 | `docs/omisiones-y-limites.md` | - |
| Auditorías | T-112, T-113, T-114 | diseño de R5/R7, R8 y R9 | - |
| F6 | T-73, T-74, T-115, T-116, T-117 | reglas de contraseña, README y arquitectura, grep cero, revisión de `TripActiveScreen`, `progress.md` y C23 | - |

Puntos de control de dispositivo (D-59): A tras T-83 (Inicio, «NaN:NaN», documentos); B tras T-98 y T-100 (tarjeta de prueba, efectivo, método en solicitud, saldo); C tras T-110 (Historial, filtros, paginación, gráfica, detalle, Ganancias y saldo). Una falla detiene la cadena.

### 8.2 Decisiones técnicas del lote (DP-19 en adelante; no sustituyen `docs/decisiones.md`)
- **DP-19 Compuerta de F4c.** T-85 no empieza hasta que D-107 sea Vigente (reemplaza D-89 y modifica D-58, hoy Vigentes) y Anderson apruebe `firebase-admin` en `scripts/dependencies.json` (constitución C15). Es la única edición de dependencias del lote; la app no cambia `package.json`.
- **DP-20 Backend inyectable.** `createApp({ auth, store, mp, config })`; `firebase-admin` solo en `initAdmin`; Mercado Pago por `fetch` nativo; límite de peticiones, cuerpo máximo y CORS cerrado escritos a mano (solo `express` está permitido). Las pruebas del backend son scripts con fakes fuera del proyecto (DP-18).
- **DP-21 Pruebas puras del lado app.** Lo puro de `src/` lleva pruebas en `scripts/tests/*.test.mjs`, que cargan una copia `.mjs` temporal del módulo con `scripts/tests/_load.mjs` (el `package.json` raíz no declara `"type": "module"`). Esto añade una carpeta de scripts al repositorio; si Anderson prefiere mantener DP-18 estricto (scripts solo fuera del proyecto), esas pruebas pasan al scratchpad sin cambiar las tareas.
- **DP-22 Modelo del viaje (D-108).** `status` `completed`/`paid`/`cancelled`, `paymentStatus` `pending`/`approved`/`rejected`, `paymentMethod` `mercadopago`/`cash`; solo el backend escribe lo de tarjeta; la app solo escribe efectivo con la regla estrecha (T-95); valores heredados (`transfer`, `none`) se leen como «No disponible» sin ofrecer cobro.
- **DP-23 Monto (D-109).** El backend toma el importe del documento del viaje, nunca del cuerpo; límite aceptado documentado en `docs/pagos.md`.
- **DP-24 Ruta planeada (D-110).** `simplifyRoute` (≤40 puntos, 4 decimales) en el cierre del viaje; sin ruta se guarda sin ella; el detalle dibuja o dice «Ruta no disponible»; sin llamadas de ruta nuevas.
- **DP-25 Historial.** Consulta por `createdAt` descendente con `limit(20)`/`startAfter` y rango solo sobre `createdAt` (sin índice compuesto); el filtro de método va en el cliente; periodos en UTC−5 (T-101).
- **DP-26 Gráfica sin librería.** Barras con `View` y tokens; agrupación pura en `src/utils/chartData.js`.
- **DP-27 Reglas de Firestore.** Solo se escribe el texto (T-84, T-91, T-73); Anderson las publica tras validar la app (D-80, D-99) y antes del punto de control B.

### 8.3 Archivos -> responsabilidad -> requisitos
| Archivo | Responsabilidad | Requisitos | Tarea |
|---|---|---|---|
| `src/utils/format.js`, `labels.js` | guarda de fecha y texto neutro | RF-40 | T-77 |
| `scripts/tests/_load.mjs`, `scripts/tests/*.test.mjs` | pruebas puras con `node` | RF-40 y los de cada módulo | T-78 y siguientes |
| `src/services/locationPolicy.js`, `useDriverLocation.js` | cuándo seguir y cuándo publicar | RF-39 | T-79 |
| `HomeScreen.js`, `home/HomeFloatingCard.js` | mapa completo y tarjeta flotante | RF-39, RNF-19 | T-80 |
| `utils/documentValidators.js`, `RegistrationFormContext.js`, `driverRepository.js` | validación y mapeo de `documents` | RF-41 | T-81, T-82 |
| `DocumentsScreen.js`, `DateField.js` | pestaña 3 | RF-41, RNF-19 | T-83 |
| `docs/seguridad.md` | texto de reglas `drivers.documents` y `trips` | RF-41, RF-42, RNF-16 | T-84, T-91 |
| `backend/src/config.js`, `.env.example`, `.gitignore`, `dependencies.json` | configuración y secretos | RF-43, RNF-18 | T-85 |
| `backend/src/auth.js`, `firestore.js` | token y transacción idempotente | RF-43 | T-86 |
| `backend/src/mercadopago.js` | cliente MP, firma y mapeo de estados | RF-43 | T-87 |
| `backend/src/app.js`, `routes/payments.js`, `middleware.js`, `server.js` | `/health`, checkout, sync y defensas | RF-43, RNF-18 | T-88 |
| `backend/src/routes/webhooks.js` | webhook verificado e idempotente | RF-43 | T-89 |
| `docs/pagos.md`, `docs/omisiones-y-limites.md` | documentación del pago de prueba y de las omisiones | RF-43, RF-51 | T-90, T-111 |
| `services/trip/simplifyRoute.js`, `tripRecord.js`, `tripController.js`, `tripRepository.js` | ruta simplificada y modelo del viaje | RF-42, RF-52 | T-92, T-93 |
| `services/trip/paymentView.js`, `paymentsService.js`, `hooks/useTripPayment.js`, `TripSummaryScreen.js` | cobro, estados y acciones | RF-42, RF-44 | T-94 a T-97 |
| `IncomingRequestCard.js`, `TripRequestScreen.js` | método de pago visible | RF-45 | T-98 |
| `utils/earnings.js`, `hooks/useEarnings.js`, `EarningsScreen.js` | saldo y métricas | RF-46, RF-50 | T-99, T-100, T-107, T-108 |
| `utils/dateRanges.js`, `chartData.js`, `components/BarChart.js`, `history/*`, `HistoryScreen.js`, `useTrips.js` | Historial, filtros, paginación y gráfica | RF-47, RF-48 | T-101 a T-106 |
| `services/trip/tripDetailView.js`, `TripDetailScreen.js` | detalle con ruta | RF-49 | T-109, T-110 |

### 8.4 Contratos (firmas)
- `locationPolicy({ available, accountApproved, permissionGranted, focused }) -> { track, publish }`
- `validateExpiry(value, now) -> { valid, error? }`; `requiresTechnicalReview(vehicleYear, currentYear) -> { required, reason }`; `validateLicenseNumber(value)`
- `createApp({ auth, store, mp, config })`; `createAuth(adminAuth).verifyToken(header) -> uid`; `createTripStore(db).getTrip(uid, tripId)`, `.applyPayment(uid, tripId, payment)`; `createMercadoPagoClient({ accessToken, fetch }).createPreference(...)`, `.getPayment(id)`, `.verifySignature({ headers, dataId, secret })`; `mapPaymentStatus(status) -> 'approved'|'pending'|'rejected'`
- Rutas: `GET /health`, `POST /payments/checkout {tripId}`, `POST /payments/sync {tripId}`, `POST /webhooks/mercadopago`
- `simplifyRoute(points, maxPoints = 40) -> [[lat, lng], ...] | null`; `paymentView(trip) -> { chip, actions }`
- `requestCheckoutUrl(tripId)`, `syncPayment(tripId)`, `confirmCashPayment(driverId, tripId)`
- `periodBounds(period, now)`, `validateRange(start, end)`, `groupNetEarnings(trips, period, range)`, `barScale(groups)`, `computeBalance(trips)`, `computeMetrics(trips, period, now)`, `tripDetailView(trip)`
- `useTrips(filter) -> { trips, loadMore, hasMore, loading, error }`; `useEarnings(trips)`; `useTripPayment(tripId)`

### 8.5 Diseño
Tareas visuales: T-80, T-83, T-96, T-97, T-98, T-100, T-104, T-105, T-106, T-108, T-110. Cubiertas por las auditorías T-112 (T-80, T-83), T-113 (T-96, T-97, T-98) y T-114 (T-100, T-104, T-105, T-106, T-108, T-110). Todas con `Diseño: Pendiente`. Reglas comunes: solo tokens y componentes compartidos, objetivos de 48 dp en Inicio y 44 x 44 en el resto, fuente al 200 %, área segura, sin `Alert`, estados con texto e ícono, «reducir movimiento».

### 8.6 Mapa CA -> implementación
| CA | Tareas |
|---|---|
| CA-002-41, 44, 45, 46 | T-79, T-80 |
| CA-002-42, 43 | T-79 |
| CA-002-47, 48, 49 | T-77, T-78 |
| CA-002-50, 53, 54, 56 | T-83 |
| CA-002-51, 52 | T-81 |
| CA-002-53, 54, 55 | T-82 |
| CA-002-57 | T-84 |
| CA-002-58, 60, 77 | T-92, T-93 |
| CA-002-59 | T-91 |
| CA-002-61, 62, 64, 66, 68 | T-86, T-87, T-88 |
| CA-002-63, 64, 65 | T-87, T-89 |
| CA-002-67 | T-85, T-90 |
| CA-002-69 a 73 | T-94, T-95, T-96, T-97 |
| CA-002-74 | T-98 |
| CA-002-75, 76 | T-99, T-100 |
| CA-002-78, 81 | T-102, T-106 |
| CA-002-79, 80 | T-101, T-105 |
| CA-002-82 | T-106 |
| CA-002-83, 84, 85 | T-103, T-104 |
| CA-002-86 | T-109, T-110 |
| CA-002-87, 88, 89 | T-107, T-108 |
| CA-002-90 | T-111 |
| CA-002-D7 a D10 | T-80, T-83, T-96 a T-98, T-100, T-104 a T-106, T-110; auditorías T-112 a T-114 |
| CA-002-37, 39, 40 (cierre) | T-115 |

### 8.7 Riesgos y puntos abiertos
- **Adición R5 a R10 sin aprobar y D-107 a D-110 en Propuesta.** T-85 a T-91 y T-93 dependen de que D-107 sea Vigente; hoy D-58 y D-89 (que D-107 reemplaza) siguen Vigentes.
- **`firebase-admin`** exige aprobación de Anderson y edición de `scripts/dependencies.json` (T-85).
- **Pasos manuales de Anderson para B:** `backend/.env` y `backend/secrets/`, credenciales y tarjetas de prueba de Mercado Pago, exponer `PUBLIC_BASE_URL`, publicar las reglas (T-84, T-91).
- **Plazo.** 41 tareas nuevas; el orden de §8.1 deja lo más visible (A) y el pago (B) primero; si falta tiempo, F3 y F5 son lo recortable.
- **Pruebas en el repositorio (DP-21).** Decidir si `scripts/tests/` se acepta.
- **Brechas de documentación.** RF-39 a RF-52 y RNF-18/19 no figuran aún en `docs/requisitos.md` (solo en la spec); la matriz ya los traza.
- **T-77** ya tiene un cambio sin confirmar en `src/utils/format.js`; se revisa, no se duplica.
- **Ejemplo del enunciado.** Si `calculateFare` no da 15.360 / 21.520 netos, T-107 se detiene y reporta.
