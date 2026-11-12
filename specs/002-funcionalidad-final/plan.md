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

## 9. Lote de cierre nocturno R11 (T-118 a T-133, más T-109 y T-110 ajustadas)
Origen: ENCARGO del prompt #57. La spec sigue en Borrador y R11 en Propuesta: este plan se escribe bajo el encargo y no sustituye la aprobación de Anderson. Todas las tareas quedan «Pendiente». Ninguna instala dependencias.

### 9.1 Rebanadas y orden de ejecución
| Rebanada | Tareas | Requisitos |
|---|---|---|
| G1a módulo puro del panel de cobro | T-118 | RF-56 |
| G1b pantalla de cobro con el módulo | T-119 | RF-56, RNF-19 |
| G1c mapa de Inicio (H-1) | T-120, T-121 | RF-53, RNF-19 |
| G1d viajes antiguos (H-2) y pista del saldo (H-3) | T-122, T-123, T-124 | RF-54, RF-55, RNF-19 |
| G2a clasificación de errores de pago | T-125, T-126 | RF-57 |
| G2b diagnóstico del backend | T-127, T-128 | RF-58, RNF-18 |
| G2c guía rápida de pagos | T-129 | RF-59 |
| G3a/G3b detalle del viaje con ruta guardada | T-109, T-110 (existentes, ajustadas) | RF-49, RF-54 |
| Auditoría de diseño | T-130 | RNF-19 |
| G4a/G4b/G4c cierre | T-131, T-132, T-133 | RF-60, RNF-17 |

Orden: T-118, T-119, T-120, T-121, T-122, T-123, T-124, T-125, T-126, T-127, T-128, T-129, T-109, T-110, T-130, T-131, T-132, T-133. T-109 y T-110 conservan su número pero dependen de T-122 y T-123 (números mayores): se ejecutan después de T-129, no en su posición numérica original.

### 9.2 Decisiones técnicas
- **DP-28.** `chargePanel` es una función pura `(método, estado de pago, error de guardado, error del servicio, acción del usuario) -> mensaje único`; la pantalla solo pinta. Prioridad: guardado > servicio > informativo > éxito.
- **DP-29.** El error del servicio solo se muestra tras una acción del usuario (Cobrar, Verificar, Reintentar); la verificación silenciosa al montar no lo activa. En efectivo no hay backend ni mensajes del servicio.
- **DP-30.** El tono de éxito solo con `approved` o efectivo cobrado; «viaje guardado» nunca es éxito.
- **DP-31.** Constantes del mapa (zoom de barrio, encuadre de Colombia) solo en `src/config/map.js`; la decisión de cámara vive en `cameraPolicy` puro. `TripMap` recibe un modo `centerOnce` para Inicio; `follow` del viaje no cambia.
- **DP-32.** «Reducir movimiento» se lee con `AccessibilityInfo.isReduceMotionEnabled` (ya incluido en React Native), sin dependencias.
- **DP-33.** «Viaje antiguo» = faltan `paymentMethod` y `paymentStatus` a la vez; con uno solo no lo es. Chip neutro «Cobro simulado». Política: métricas lo incluyen, saldo lo excluye, filtro de método no lo muestra (solo «Todos»).
- **DP-34.** `PAYMENTS_ERROR` pasa a ocho clases (`notConfigured`, `offline`, `timeout`, `sessionExpired`, `notFound`, `serverError`, `invalidResponse`, `providerError`); el cliente sigue sin lanzar. T-125 mantiene el comportamiento visible; los mensajes por clase llegan en T-126. Ningún mensaje incluye URL, token ni cabeceras.
- **DP-35.** `doctor` recibe `env`, `fs`, `loadAdmin`, `fetchFn`, `nodeVersion` y `log` inyectados: no lee `.env` ni `backend/secrets/` en las pruebas, imprime nombres de variables y nunca valores, y sin red los pasos de red salen ERROR sin detener los demás.
- **DP-36.** La guía rápida y el checklist no contienen secretos; remiten a `docs/pagos.md` para los pasos de red.

### 9.3 Archivos → responsabilidad → requisitos
| Archivo | Responsabilidad | Requisitos | Tarea |
|---|---|---|---|
| `src/services/trip/chargePanel.js` | tabla de estados y mensaje único | RF-56 | T-118, T-126 |
| `scripts/tests/chargePanel.test.mjs` | pruebas del módulo | RF-56 | T-118, T-126 |
| `src/screens/trip/TripSummaryScreen.js` | pinta `chargePanel` | RF-56, RNF-19 | T-119 |
| `src/config/map.js` | constantes de zoom y Colombia | RF-53 | T-120 |
| `src/services/map/cameraPolicy.js` y su prueba | decisión de centrado y recentrado | RF-53 | T-120 |
| `src/components/map/TripMap.js` | centra una vez | RF-53 | T-121 |
| `src/components/map/MyLocationButton.js` | botón 44 x 44 | RF-53, RNF-19 | T-121 |
| `src/screens/home/HomeScreen.js` | monta el botón | RF-53 | T-121 |
| `src/services/trip/legacyTrip.js` y pruebas | viaje antiguo y chip | RF-54 | T-122 |
| `src/components/TripListItem.js` | chip en la lista | RF-54 | T-123 |
| `src/screens/main/EarningsScreen.js` | pista del saldo a varias líneas | RF-55 | T-124 |
| `src/services/trip/paymentsClient.js` y su prueba | ocho clases de error | RF-57 | T-125 |
| `src/constants/labels.js` | textos del lote | RF-53 a RF-57 | T-118, T-120, T-122, T-126 |
| `backend/scripts/doctor.mjs`, `backend/package.json`, `scripts/tests/doctor.test.mjs` | diagnóstico | RF-58, RNF-18 | T-127, T-128 |
| `docs/pagos-guia-rapida.md` | guía de pagos | RF-59 | T-129 |
| `src/services/trip/tripDetailView.js`, `TripDetailScreen.js` | detalle con ruta guardada o «Ruta no disponible» | RF-49, RF-54 | T-109, T-110 |
| `docs/checklist-manana-jueves.md`, `docs/guion-video.md`, `README.md` | cierre | RF-60 | T-131, T-132, T-133 |

### 9.4 Contratos
- `chargePanel({ method, paymentStatus, saveError, serviceError, userActed }) -> { message, tone, chip, actions, live }`
- `shouldCenterOnFirstFix({ alreadyCentered, position }) -> boolean`; `recenterAction({ position, reduceMotion }) -> { center, zoom, duration } | null`
- `isLegacySimulatedTrip(trip) -> boolean`; `legacyPaymentChip(trip) -> { label, tone } | null`
- `createPaymentsClient(...)` sin cambios de firma; resultado `{ ok: false, error: PAYMENTS_ERROR.* }`
- `runDoctor({ env, fs, loadAdmin, fetchFn, nodeVersion, log }) -> { results }`

### 9.5 Diseño
Tareas visuales: T-119, T-121, T-123, T-124, T-126 (auditadas en T-130) y T-110 (en T-114). Reglas: tokens, `Icon`, `Chip`, 44 x 44, 200 % de fuente, una región `polite`, sin `Alert`, textos en `labels.js`, reducir movimiento.

### 9.6 Mapa CA → implementación
| CA | Tareas |
|---|---|
| CA-002-91, 92, 93 | T-120, T-121 |
| CA-002-94 | T-122, T-123, T-109, T-110 |
| CA-002-95 | T-122 |
| CA-002-96 a 100 | T-118, T-119 |
| CA-002-101 | T-125 |
| CA-002-102 | T-126 |
| CA-002-103, 104 | T-127, T-128 |
| CA-002-105 | T-129 |
| CA-002-106 | T-109, T-110 |
| CA-002-107 | T-131, T-133 |
| CA-002-108 | T-132, T-133 |
| CA-002-D11 | T-121, T-130 |
| CA-002-D12 | T-124, T-130 |

### 9.7 Riesgos y puntos abiertos
- Spec Borrador y R11 Propuesta: sin aprobación propia de Anderson.
- T-109/T-110 con dependencia hacia un número mayor (orden en §9.1).
- T-121, T-110 y otras tareas de pantalla quedan «No verificado en dispositivo» hasta que Anderson confirme.
- `progress.md` y `decisiones.md` no los escribe el planner (T-133 los asigna a otros).
- `docs/omisiones-y-limites.md` no se leyó completo al planificar.

## 10. Stripe como segunda pasarela de prueba (R12; T-134 a T-156)
Origen: P5 sobre la adición R12 (ENCARGO; RF-61, RF-62, RNF-20; D-116 a D-120; CA-002-109 a CA-002-129). La spec y R12 siguen en Propuesta y D-116 a D-120 en Propuesta: este plan se escribe bajo el encargo y no sustituye la aprobación de Anderson; ninguna tarea se ejecuta sin ella. Todas las tareas quedan «Pendiente». Ninguna instala dependencias: Stripe se consume con `fetch` nativo y `node:crypto` (CA-002-128). Aviso P5: los planes y tareas de R8 y R11 (T-85 a T-97, T-118 a T-130) quedan parcialmente desactualizados en lo que tocan (`chargePanel`, `paymentActions`, `paymentsClient`, `TripSummaryScreen`, `backend/src/*`).
Decisión de Anderson implícita en el encargo: al crear el viaje con tarjeta la app sigue escribiendo `paymentMethod = 'mercadopago'` (D-118, lectura conservadora); el backend lo sobrescribe a `stripe` al crear el cobro de Stripe y solo mientras el pago no esté aprobado. El mensaje pendiente con dos pasarelas (CA-002-124) es propuesta por confirmar.

### 10.1 Rebanadas y orden de ejecución
| Rebanada | Tareas | Requisitos |
|---|---|---|
| Inventario previo de `testID`, accesibilidad y `labels.js` | T-134 | RNF-19, RF-62 |
| S1 backend: interfaz de proveedor, registro, monto, estado, cliente y firma de Stripe | T-135, T-136, T-137 | RF-61, RNF-20 |
| S2 backend: configuración, almacén, rutas, webhook, página de retorno | T-138, T-139, T-140, T-141, T-142 | RF-61, RNF-20 |
| S3 diagnóstico | T-143 | RNF-20 (RF-58) |
| S4 app: cliente, vista y panel de cobro, acciones, pantalla, verificación | T-144, T-145, T-146, T-147, T-148 | RF-62, RNF-19 |
| S5 app: Historial, detalle y saldo | T-149, T-150 | RF-62 |
| S6 reglas | T-151 | RF-61 |
| S7 documentos | T-152, T-153, T-154 | RF-61, RF-62, RNF-20 |
| S8 verificación estática, inventario posterior y auditoría de diseño | T-155, T-156 | RNF-19, RF-62, RNF-20 |

Orden: T-134 a T-156 en orden numérico. Cada tarea deja el proyecto arrancando y las pruebas existentes de R8 y R11 sin cambiar aserciones (CA-002-126). Corte mínimo si falta tiempo: T-134 a T-142 y T-144 a T-148 (cobro de Stripe de punta a punta), después T-156; T-143, T-149 a T-155 pueden esperar.

### 10.2 Decisiones técnicas (DP-37 en adelante; no sustituyen `docs/decisiones.md`)
- **DP-37 Interfaz de proveedor (D-117).** Un proveedor es `{ id, createCheckout({ tripId, uid, trip, currency, publicBaseUrl }) -> { url }, getPaymentState({ tripId, uid, trip, currency }) -> { status: 'approved'|'pending'|'rejected', id } | null }`; `null` significa «no hay pago que corresponda a este viaje». El registro (`providers/registry.js`) expone `get(id)`, `isConfigured(id)` y `flags()` (`{ mercadopago: boolean, stripe: boolean }`). El adaptador de Mercado Pago envuelve `createMercadoPagoClient` sin modificar `backend/src/mercadopago.js`.
- **DP-38 Monto de Stripe.** Según https://docs.stripe.com/currencies las monedas son de dos decimales salvo ISK, HUF, TWD y UGX; COP no está en las excepciones, así que `unit_amount = pesos × 100` (10 000 COP = 1 000 000; **inferido, no hay fila explícita de COP en la página**) y el mínimo listado es 0.50 COP (50 unidades), que `fare` entero ≥ 1 cumple. Tope: el de `config.maxAmountCop`. Función pura `toStripeUnitAmount(fareCop, { currency, copPerUsd }) -> { amount, currency } | null` (null para no enteros, 0, negativos, sobre el tope o configuración inválida). Respaldo no activo por defecto: `STRIPE_CURRENCY=usd` con `STRIPE_COP_PER_USD` (número positivo obligatorio con usd, si falta Stripe queda no configurada): `amount = round(fare × 100 / copPerUsd)`, mínimo 50 centavos. Que la cuenta de Anderson soporte COP **no está confirmado**.
- **DP-39 Transporte.** `fetch` nativo, tiempo de espera 10 s, `Authorization: Basic base64(<clave>:)` (la forma documentada; `Bearer` no está confirmado en la página leída), `Content-Type: application/x-www-form-urlencoded` con notación de corchetes (`line_items[0][price_data][unit_amount]`), un `encodeForm` puro. Errores: `StripeError(status)` sin mensaje, URL ni cabeceras (como `MercadoPagoError`).
- **DP-40 Sesión de cobro.** `POST /v1/checkout/sessions` con `mode=payment`, un `line_items` (moneda en minúsculas, nombre «Viaje UberClone (pago de prueba)», cantidad 1), `client_reference_id=<tripId>`, `metadata[tripId]` y `metadata[uid]`, `success_url` y `cancel_url` = `<PUBLIC_BASE_URL>/payments/return`, `expires_at` a 30 minutos (mínimo permitido). No se depende de `payment_intent_data[metadata]` (no confirmado). `Idempotency-Key` = `uc-<tripId>-<cubeta de 60 s>`: un doble toque no crea dos sesiones y un reintento posterior sí (la misma clave con parámetros distintos da error y se conserva 24 h).
- **DP-41 Estado de la sesión.** `GET /v1/checkout/sessions/{id}?expand[]=payment_intent` (la expansión sigue la convención general de la API; **no confirmada en la página leída**). Función pura `mapStripeSession(session, { tripId, expectedAmount, expectedCurrency }) -> { status, id, matches }`: `payment_status === 'paid'` → approved; `status === 'expired'` → rejected; `payment_intent.last_payment_error` presente sin pago → rejected; resto → pending. `matches` exige `client_reference_id === tripId`, `amount_total === expectedAmount` y `currency === expectedCurrency`; si no coincide el adaptador devuelve `null`. Con Checkout el pagador reintenta dentro de la misma página, así que un rechazo con tarjeta de prueba suele verse como `pending`: no es un fallo (documentarlo en la guía).
- **DP-42 Sincronización por proveedor.** `sync` ignora cualquier `provider` del cuerpo: reconsulta con el proveedor que indica `trip.paymentMethod` (CA-002-123). `checkout` toma `provider` del cuerpo; si falta usa `mercadopago` (compatibilidad con las pruebas de R8); valores no configurados o desconocidos devuelven `ERRORS.invalid` sin detalle.
- **DP-43 Método de pago del viaje.** `store.setPaymentMethod(uid, tripId, method)` en transacción: solo `mercadopago|stripe`, solo si el viaje está `completed` y sin `approved`/`paid`; se invoca después de crear la sesión con éxito (si Stripe falla no se cambia el método). `store.applyPayment` gana un cuarto argumento opcional `provider` (por defecto `mercadopago`) y exige `trip.paymentMethod === provider`: un webhook de una pasarela nunca aprueba un viaje de la otra.
- **DP-44 Configuración.** `loadConfig(env, { allowNoProvider = false })`: por defecto conserva el error si falta `MP_ACCESS_TOKEN` (pruebas de R8 intactas); `server.js` pasa `allowNoProvider: true`. Se añade `config.providers = { mercadopago: { accessToken, webhookSecret } | null, stripe: { secretKey, webhookSecret, currency, copPerUsd } | null }`, sin quitar `mpAccessToken` ni `webhookSecret`. Variables nuevas (solo nombres): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`, `STRIPE_COP_PER_USD`. Claves que empiezan por `sk_live_` o `rk_live_`, o que no empiezan por `sk_test_`/`rk_test_`, dejan Stripe en `null` con un aviso fijo que no contiene la clave (D-119). `FIREBASE_SERVICE_ACCOUNT_PATH` y `PUBLIC_BASE_URL` siguen obligatorios.
- **DP-45 Webhook de Stripe (D-120).** `app.use('/webhooks/stripe', express.raw({ type: () => true, limit: BODY_LIMIT }))` registrado antes de `express.json`; el manejador recibe `Buffer`. Verificación: `t=` y `v1=` de `Stripe-Signature` (varias `v1` válidas, `v0` ignorada), carga `<t>.<cuerpo crudo>`, HMAC-SHA256 con `whsec_…`, `timingSafeEqual`, tolerancia 300 s (`SIGNATURE_TOLERANCE_SEC`). Sin secreto, sin cabecera o firma mala: `ERRORS.unauthorized`. Con firma válida solo se toma de `data.object.id` el identificador `cs_…` (patrón estricto) de eventos `checkout.session.*`, se reconsulta la sesión y se aplica como `sync`; otros tipos de evento, viaje inexistente o método distinto de `stripe` responden `{ received: true }` sin aplicar.
- **DP-46 Página de retorno (CA-002-117).** `GET /payments/return` devuelve HTML fijo (constante, sin interpolación, `Cache-Control: no-store`, `Content-Type: text/html; charset=utf-8`) que dice que se puede volver a la app; sin `tripId`, monto ni parámetros. Pasa por el límite de IP. Que Stripe acepte una `success_url` `http` de túnel local **no está confirmado**: con `PUBLIC_BASE_URL` https no hay problema.
- **DP-47 Contrato de `chargePanel` ampliado.** Entra `providers` (`{ mercadopago, stripe }` booleanos, o `undefined` si aún no se conoce) y `method` acepta `stripe` como tarjeta. Sale lo mismo más `chargeProviders: string[]` (pasarelas con botón «Cobrar») y `noGateway: boolean`. Con `providers` indefinido el resultado es idéntico al actual (pruebas de R11 intactas). Mensaje único (H-4, D-112): sin ninguna pasarela y viaje con tarjeta pendiente o rechazado → «No hay una pasarela de pago configurada» (tono informativo, sin botones de cobro ni reintento; «Verificar pago» se conserva); solo Mercado Pago → literal de CA-002-98; Stripe configurada (sola o con Mercado Pago) y pendiente → «Viaje guardado. Falta el pago con tarjeta.» (por confirmar). Aprobado, rechazado y errores no cambian.
- **DP-48 Acciones en la app.** `paymentActions.run(action, { uid, tripId, provider })`: `CHARGE`/`RETRY` envían `provider` (obligatorio, si falta es error `failed`); `VERIFY` envía `provider` = `paymentMethod` del documento del viaje, no el último botón. `paymentsClient`: `getProviders() -> { ok, providers: { mercadopago, stripe } }` (GET con ID token, solo booleanos), `requestCheckoutUrl(tripId, provider)`, `syncPayment(tripId, provider)`. La carga de pasarelas no genera mensaje propio: si falla, `providers` queda indefinido y el panel actúa como hoy (CA-002-124). La URL de Stripe debe empezar por `https://` como la de Mercado Pago.
- **DP-49 Nombre de pasarela en detalle.** `labels.history.detail.methods` pasa a `{ mercadopago: 'Tarjeta (Mercado Pago)', stripe: 'Tarjeta (Stripe)', cash: 'Efectivo' }`; el filtro «Tarjeta» (`HISTORY_METHOD.CARD`, valor `mercadopago`) incluye ambos en `filterByMethod`. `computeBalance` y `earnings` tratan `stripe` igual que `mercadopago`. La lista (`TripListItem`) no muestra método hoy; no se añade. Cambia el texto esperado de una aserción de `tripDetailView.test.mjs` para `mercadopago` (consecuencia de CA-002-125, a confirmar por Anderson).
- **DP-50 Diagnóstico.** `runDoctor` suma una línea por pasarela: Stripe llama `GET https://api.stripe.com/v1/balance` con la clave (401 = clave inválida; 403 = permisos). Línea de Mercado Pago pasa de FALTA a AVISO si Stripe sí está configurada; es ERROR/FALTA solo si ninguna lo está. Clave `sk_live_`/`rk_live_`: ERROR sin llamar a la red. `STRIPE_WEBHOOK_SECRET` ausente: AVISO (opcional). Nunca imprime valores.

### 10.3 Archivos → responsabilidad → requisitos
| Archivo | Responsabilidad | Requisitos | Tarea |
|---|---|---|---|
| `docs/diseno/auditorias/stripe-inventario.md` (nuevo) | inventario de `testID`, roles, etiquetas y `labels.js` antes y después | RNF-19 | T-134, T-155 |
| `backend/src/providers/registry.js`, `backend/src/providers/mercadopago.js` | interfaz, registro y adaptador de Mercado Pago | RF-61 | T-135 |
| `backend/src/stripe.js` (monto, estado, firma, cliente) | lógica de Stripe | RF-61, RNF-20 | T-136, T-137 |
| `backend/src/providers/stripe.js` | adaptador de Stripe | RF-61 | T-137 |
| `scripts/tests/stripeCore.test.mjs`, `scripts/tests/backendProviders.test.mjs` | pruebas con fakes | RF-61, RNF-20 | T-135 a T-137 |
| `backend/src/config.js`, `backend/src/server.js`, `backend/.env.example` | proveedores opcionales, claves live rechazadas, arranque sin pasarelas | RF-61, RNF-20 | T-138 |
| `backend/src/firestore.js` | `setPaymentMethod`, `applyPayment` por proveedor | RF-61 | T-139 |
| `backend/src/routes/payments.js` | `GET /payments/providers`, `checkout` y `sync` por proveedor | RF-61 | T-140 |
| `backend/src/routes/webhooks.js`, `backend/src/app.js` | `/webhooks/stripe` con cuerpo crudo | RF-61, RNF-20 | T-141 |
| `backend/src/routes/return.js` (nuevo), `backend/src/app.js` | página estática de retorno | RF-61 | T-142 |
| `backend/scripts/doctor.mjs`, `scripts/tests/doctor.test.mjs` | línea por pasarela | RNF-20 | T-143 |
| `src/services/trip/paymentsClient.js`, `src/services/paymentsService.js` | `getProviders`, proveedor en checkout y sync | RF-62 | T-144 |
| `src/services/trip/tripRecord.js`, `paymentView.js`, `chargePanel.js`, `src/constants/labels.js` | `stripe` como tarjeta, mensaje y botones por pasarela | RF-62 | T-145 |
| `src/services/trip/paymentActions.js`, `src/hooks/useChargeProviders.js` (nuevo) | proveedor en acciones; carga silenciosa de pasarelas | RF-62 | T-146 |
| `src/screens/trip/TripSummaryScreen.js`, `src/constants/labels.js` | botones «Cobrar con …» y mensaje sin pasarela | RF-62, RNF-19 | T-147 |
| `src/screens/trip/TripSummaryScreen.js` | verificación con el proveedor del viaje | RF-62 | T-148 |
| `src/utils/historyQuery.js`, `src/utils/earnings.js` | filtro «Tarjeta» y saldo con `stripe` | RF-62 | T-149 |
| `src/services/trip/tripDetailView.js`, `src/constants/labels.js` | nombre de la pasarela en el detalle | RF-62 | T-150 |
| `docs/seguridad.md`, `firestore.rules` | `stripe` permitido; backend único escritor del método | RF-61 | T-151 |
| `docs/pagos-stripe-guia.md`, `docs/pagos-guia-rapida.md`, `docs/checklist-manana-jueves.md`, `docs/guion-video.md`, `docs/omisiones-y-limites.md`, `README.md` | documentos | RF-61, RF-62, RNF-20 | T-152 a T-154 |

### 10.4 Contratos (firmas)
- `createProviderRegistry({ mercadopago, stripe }) -> { get(id), isConfigured(id), flags() }`
- `toStripeUnitAmount(fareCop, { currency = 'cop', copPerUsd } = {}) -> { amount, currency } | null`
- `mapStripeSession(session, { tripId, expectedAmount, expectedCurrency }) -> { status, id, matches }`
- `verifyStripeSignature({ rawBody, header, secret, now = Date.now(), toleranceSec = 300 }) -> boolean`
- `encodeForm(object) -> string`
- `createStripeClient({ secretKey, fetch }) -> { createCheckoutSession({ tripId, uid, amount, currency, successUrl, cancelUrl, idempotencyKey }) -> { id, url }, getCheckoutSession(id) -> object }`
- `createTripStore(db).setPaymentMethod(uid, tripId, method) -> { applied, paymentMethod }`; `applyPayment(uid, tripId, payment, provider = 'mercadopago')`
- `GET /payments/providers -> { mercadopago: boolean, stripe: boolean }`; `POST /payments/checkout { tripId, provider } -> { url }`; `POST /payments/sync { tripId } -> { paymentStatus }`; `POST /webhooks/stripe` (cuerpo crudo) `-> { received: true }`; `GET /payments/return -> HTML estático`
- `paymentsClient.getProviders() -> { ok: true, providers } | { ok: false, error }`; `requestCheckoutUrl(tripId, provider)`; `syncPayment(tripId, provider)`
- `chargePanel({ method, paymentStatus, saveError, serviceError, writeError, userActed, providers }) -> { message, tone, chip, actions, live, chargeProviders, noGateway }`
- `createPaymentActions(...).run(action, { uid, tripId, provider })`

### 10.5 Diseño
Tareas visuales: T-147 (botones y mensaje del panel) y T-148 (sin cambio visual, comportamiento), T-150 (texto del detalle). Auditoría en T-156 con el `design-auditor`: dos botones de cobro (48 dp, rol y nombre), rótulo largo «Cobrar con Stripe (tarjeta de prueba)» a 200 % en varias líneas sin corte, una sola región `polite` (sin mensajes extra por los botones), tokens y `labels.js`, sin `Alert`. `SecondaryButton` ya tiene rol `button` y nombre; si su altura mínima no llega a 48 dp o no admite varias líneas, T-147 lo señala al `implementer` en vez de modificarlo en silencio. El inventario de `testID`/`accessibility*`/`labels` se toma antes (T-134) y después (T-155) y se compara: ningún `testID` ni etiqueta existente desaparece o cambia (salvo la excepción de DP-49).

### 10.6 Mapa CA → implementación
| CA | Tareas |
|---|---|
| CA-002-109 | T-135, T-138, T-140 |
| CA-002-110 | T-139, T-140 |
| CA-002-111 | T-137, T-140 |
| CA-002-112 | T-136 |
| CA-002-113 | T-136, T-137 |
| CA-002-114 | T-139, T-140, T-141 |
| CA-002-115 | T-137, T-141 |
| CA-002-116 | T-141 |
| CA-002-117 | T-142 |
| CA-002-118 | T-140, T-141, T-142 |
| CA-002-119 | T-138, T-142 |
| CA-002-120 | T-138, T-143 |
| CA-002-121 | T-143 |
| CA-002-122 | T-145, T-147 |
| CA-002-123 | T-144, T-146, T-148 |
| CA-002-124 | T-145, T-147 |
| CA-002-125 | T-149, T-150 |
| CA-002-126 | T-135, T-139, T-140, T-155 |
| CA-002-127 | T-134, T-147, T-155, T-156 |
| CA-002-128 | T-137, T-155 |
| CA-002-129 | T-139, T-151 |

### 10.7 Riesgos y puntos abiertos
- Spec, R12 y D-116 a D-120 en Propuesta: sin aprobación de Anderson.
- COP con dos decimales es una inferencia de la página de monedas, y que la cuenta de Anderson acepte COP no está confirmado: `STRIPE_CURRENCY=usd` + `STRIPE_COP_PER_USD` es el respaldo (solo prueba; la conversión es la tasa que Anderson escribe, no una cotización).
- La expansión `expand[]=payment_intent`, `payment_intent_data[metadata]` y `Authorization: Bearer` no están confirmados en las páginas leídas: el plan usa Basic, no depende de `payment_intent_data` y trata la expansión como mejora (sin ella un rechazo se ve como pendiente).
- `loadConfig` por defecto sigue exigiendo `MP_ACCESS_TOKEN` para no tocar las pruebas de R8; el arranque sin pasarelas se activa solo desde `server.js` (DP-44).
- CA-002-125 cambia el texto de una aserción de `tripDetailView.test.mjs` (DP-49).
- Mensaje pendiente con dos pasarelas por confirmar (CA-002-124).
- `firestore.rules` y publicación: el backend usa firebase-admin, que ignora las reglas; publicar solo si Anderson quiere que la regla admita `stripe` (paso manual, T-151).
- Un webhook requiere URL pública y registrar el endpoint en Stripe (CLI `stripe listen` para pruebas); es opcional (D-120).
- Las tareas de pantalla (T-147, T-148, T-150) quedan «No verificado en dispositivo» hasta que Anderson confirme; el cobro real de Stripe en el navegador también.
- ~60 minutos es ajustado para 23 tareas: estimación honesta de 5 a 10 minutos por tarea de backend o de lógica y 10 a 15 por tarea de pantalla (2 a 3 horas en total); el corte mínimo está en §10.1.
