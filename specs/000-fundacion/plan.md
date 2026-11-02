# Plan 000 — Fundación

Spec: `specs/000-fundacion/spec.md` (Aprobada por Anderson, 2026-10-27). Estado del plan: **Aprobado por Anderson (2026-10-27), registrado por el agente principal. Spec 000 Planificada. T-01, T-02 y T-03 VALIDADAS (T-01 y T-02 con evidencia de dispositivo Android; T-03 con prueba automatizada). T-04 En curso (autorizada por Anderson, 2026-10-27). T-14 (`type.numeric`) y la barra de estado en T-10 aprobadas por Anderson el 2026-10-27, registrado por el agente principal.** SDK 57 Vigente (D-32); dependencias D-29 y D-30; identificador D-31; D-11 Vigente.
Requisitos: RNF-01, RNF-02, RNF-11, RNF-12, RNF-13, RF-30. Criterios: CA-000-01 a CA-000-15, CA-000-D1 a D3.
Precedencia: ENCARGO > constitución > decisiones > spec/diseño > este plan > tareas.

## 1. Decisiones técnicas del plan (numeradas; no sustituyen a `docs/decisiones.md`)
- **DP-01 (D-22, scaffold).** Se conserva el scaffold y se ajusta (`App.js`, `app.json`, `package.json`); no se regenera. Motivo: ya trae `expo ~57.0.31`, `react-native 0.86.3`, `index.js` con `registerRootComponent`, assets e íconos; regenerar arriesga la estructura SDD. Se queda `index.js` → `App.js`.
- **DP-02 (D-11, D-29, D-22).** React Navigation puro (`@react-navigation/*`). **No** se usa `expo-router` (queda en `proposed`, sin decisión). Estructura: Stack raíz (`native-stack`) con rama **Registro** (`bottom-tabs`: Datos personales, Vehículo, Documentos) y rama **Principal** (`drawer`: Home, Perfil, Historial, Ganancias, Configuración) cuyo Home es un **Stack del viaje** (`native-stack`). D-11 sigue Propuesta en `decisiones.md`; Anderson aprobó la spec 000 completa, que la incluye (CA-000-13 vale por eso).
- **DP-03 (JavaScript, D-16 Propuesta).** Todo en `.js`; sin `tsc`.
- **DP-04 (encabezado propio).** `headerShown: false` en los stacks; un componente `ScreenHeader` pinta título, `nav-open-drawer` o `nav-back` con tokens y área táctil ≥ 44. Así los `testID` y los tokens se controlan en un solo lugar.
- **DP-05 (acceso por cuenta).** El Stack raíz declara pantallas condicionales según `accountStatus`: `loading` → pantalla de carga (`state-loading`); `error` → `state-error` + `btn-retry`; `pending` (cualquier no Aprobada) → rama Registro; `approved` → rama Principal. No existe ruta a la rama Principal si no está Aprobada. El cambio en caliente (Aprobada ↔ no Aprobada) cambia la rama sin pantallas intermedias equivocadas.
- **DP-06 (estado compartido, D-27).** Un solo `AppStateContext` (`useContext`) con valor memoizado (`useMemo`/`useCallback`). Contiene: `accountStatus`, `retryAccountStatus()`, `simulateAccountStatus(value)` y `demoValue`/`setDemoValue` (el valor de la prueba CA-000-09). Hook de acceso `useAppState()`.
- **DP-07 (estado de cuenta simulado).** `resolveAccountStatus` simula la lectura con un `setTimeout` liberado en el retorno del `useEffect` (C11 / CA-000-08). Valor inicial configurable en una constante (`pending`). El campo real llega con la spec 001; aquí solo se simula.
- **DP-08 (panel de simulación temporal).** `DevAccountSwitch` (botones para Pendiente de aprobación / Aprobado / Error / Cargando) aparece en el Registro y en Configuración para demostrar CA-000-13, 14 y el cambio en caliente. Se marca como provisional: la spec 001/008 lo retira. Usa `testID` `dev-account-<valor>`. Montaje (T-07): una sola vez, como `children` del `PlaceholderScreen` de `PersonalDataScreen` (no repetido en las tres pestañas); siempre visible, también con `loading` seleccionado (T-04: `loading` no tiene `btn-retry`); botones de ≥ 44 con `accessibilityState.selected` según `accountStatus`; llama `simulateAccountStatus(value)`. En T-07 solo marca el estado simulado: el cambio de rama lo hace T-10.
- **DP-09 (estados forzados).** `PlaceholderScreen` incluye un selector provisional de estado (`<pantalla>-force-content|loading|empty|error`) para CA-000-15. Se retira cuando cada pantalla tenga datos reales.
- **DP-10 (sin i18n en 000).** La spec 000 no exige i18n (D-15 pertenece a 001/008). Los textos de navegación y estados se centralizan en `src/constants/labels.js` (español) para que el diccionario ES/EN propio con contexto de D-29 los sustituya sin tocar las pantallas. No se escribe i18n aquí (no hay requisito en esta spec). Quién amplía el archivo: DP-17.
- **DP-11 (sin íconos).** `@expo/vector-icons` no está en `package.json`: texto y formas de `View` (D-29). El botón del Drawer es texto «Menú» (más tres barras de `View` opcionales); atrás es «Atrás» con chevron de `View`. Sin emoji.
- **DP-12 (tabs, corregido por D-46).** `bottom-tabs` con `headerShown: false`, `sceneStyle` (fondo `color.bg`), `tabBarButtonTestID` (`tab-personal-data`, `tab-vehicle`, `tab-documents`) y `tabBarAccessibilityLabel`, y la barra la pinta un componente propio `AppTabBar` pasado en la prop `tabBar`. La barra ya NO usa `tabBarStyle` ni `height: 'auto'`. Causa del defecto: en `BottomTabBar.js` (7.21.0) el contenido es `{ flex: 1, flexDirection: 'row' }`; con el contenedor en altura automática `flex: 1` colapsa a 0 y la barra medía solo su `paddingBottom` (14.9 = inset inferior), quedando fuera de pantalla. `AppTabBar`: fondo `color.surface` en el flujo, `paddingBottom` = inset inferior, fila de `Pressable` con `minHeight` 48, separación 8, activa por peso + subrayado (no relleno de acento, DESIGN.md Patrones/Navegación), sin ícono, sombra ni borde, oculta con el teclado, altura por contenido (crece con la escala de texto). Lección: nunca `flex` ni `height` fijo en un contenedor de altura automática con una fila interna. `LayoutDiagnostic` (D-45) es TEMPORAL y se retira cuando Anderson confirme en el celular que la barra se ve. El implementer verifica las props reales en `node_modules/@react-navigation/bottom-tabs` (^7.21.0) y no las inventa. `NavigationContainer` lleva un `theme` solo con tokens (D-41). Las pantallas del Registro pasan `safeEdges={['top']}` a `PlaceholderScreen` para no duplicar la zona segura inferior con la barra.
- **DP-13 (drawer).** `drawerContent` propio con 4 entradas (`drawer-profile`, `drawer-history`, `drawer-earnings`, `drawer-settings`); Home existe como pantalla pero no se lista. `backBehavior: 'initialRoute'`: desde un destino, atrás vuelve a Home; en Home, atrás de Android sigue el comportamiento estándar (cerrar el Drawer si está abierto; si no, salir de la app sin perder estado de cuenta, que vive en memoria; punto a observar en T-11). Con el Drawer abierto, el botón físico de atrás lo cierra (comportamiento estándar; punto a observar en el celular en T-09). Apertura (T-09): el Drawer se abre con `navigation.dispatch(DrawerActions.openDrawer())` (`DrawerActions` de `@react-navigation/native`, verificado en `routers`/`core`/`native` instalados): la acción que el Stack anidado no maneja sube al Drawer, así `HomeScreen` abre el Drawer sin `getParent()` ni `useNavigation()`. Entradas del `drawerContent`: `Pressable` con `accessibilityRole="button"`, `minHeight: touch.controlHeight`, separación `touch.gap`, activa por peso + subrayado; elegir una entrada navega y cierra el Drawer. Sin `flex`/`height` fijo en entradas ni listas (lección de T-07). Sin dependencias nuevas ni recompilación: el Drawer y sus peers ya están en el build.
- **DP-14 (backend).** CommonJS, `express` único dependiente. `GET /health` → `200` con `{ "status": "ok", "service": "uber-clone-backend", "uptime": <segundos> }`. Puerto `process.env.PORT` o `3001`. Si el puerto está ocupado (`EADDRINUSE`) imprime un mensaje claro y sale con código 1. No lee `.env` ni exige secretos (CA-000-07). `dotenv` no se instala (spec 005).
- **DP-15 (`package.json` y `app.json`).** `start` pasa a `expo start --dev-client`; se elimina el script `web` (no hay `react-native-web`; el arnés visual no renderiza esta app, ver §5). `android`/`ios` quedan como `expo run:*` que ejecuta el humano. Para el build, `app.json` necesita `android.package` e `ios.bundleIdentifier`: se propone `com.andersonlondono.uberclone` (Anderson confirma o cambia en T-01). `userInterfaceStyle: "light"` y `orientation: "portrait"` se conservan (D-26). El nombre del paquete queda fijo una vez instalado el build.
- **DP-16 (errores y límites).** La app no llama al backend en esta spec (casos límite de "backend caído"). Sin `Alert`. Ningún `setInterval`/`watchPosition`/`onSnapshot` en la spec; el único `setTimeout` (DP-07) se libera.
- **DP-17 (textos: cada tarea amplía `labels.js`).** `src/constants/labels.js` ya existe (T-02, Validada, no se reabre). Cada tarea de T-05 a T-10 que necesite una clave nueva la AÑADE a ese archivo (que figura en su campo Archivos) sin renombrar ni borrar claves existentes; ninguna pantalla ni componente lleva texto literal. Reparto de claves nuevas: T-05 (`forceState.legend|loading|empty|error`, D-38), T-06 (`placeholder`, `forceState.content`, `a11y.openDrawer`, `a11y.back`), T-07 (`a11y.tabs`, `devAccount`, `demo`), T-08 (`home`, `trip`), T-09 (`a11y.drawerItems`). T-10 reutiliza claves existentes (`states.*`, `actions.retry`); T-05 solo añade `forceState.*` (sin renombrar ni borrar). T-04 no tiene interfaz ni textos.
- **DP-18 (D-36, `type.numeric`).** La tarea nueva **T-14** (depende solo de T-02) añade a `src/theme/tokens.js` el token `type.numeric = { fontVariant: ['tabular-nums'] }`, que se compone con otro `type.*` (`style={[type.display, type.numeric]}`). Se eligió una tarea nueva y no ampliar una visual porque T-02 está Validada y no se reabre, ninguna pantalla de la spec 000 muestra importes, tiempos ni distancias (las consumen las specs de solicitudes, viaje, cobro y ganancias), y una tarea de un solo objetivo y un archivo cumple «una tarea a la vez». El token queda disponible para que lo consuman esas specs; aquí solo se verifica su valor y que `tokens.js` siga sin otros hex ni tamaños.
- **DP-20 (panel provisional de T-05, D-38).** Para que T-05 sea verificable en el celular antes de T-06, `src/components/DevStatePanel.js` se monta en `App.js` durante T-05: usa `useAppState` y muestra `ScreenState` con un selector `first-force-loading|empty|error`; T-05 añade `forceState.legend|loading|empty|error` a `labels.js`. Es provisional: T-10 quita el montaje de `App.js` y BORRA el archivo (T-10 depende de T-05, sin ciclos); el selector definitivo por pantalla es el de `PlaceholderScreen` (T-06, DP-09). Al terminar T-10 no queda ningún `first-force-*` en el código.
- **DP-21 (T-08, vista previa y Stack del viaje; D-47, D-48).** `TripStack` (`native-stack`, ya instalado) con `headerShown: false` (DP-04); cada pantalla es un `PlaceholderScreen`. `App.js` queda PROVISIONAL con un componente interno que lee `useAppState()` (solo un hijo del provider puede) y alterna `RegistrationTabs` / `TripStack`; T-10 lo reemplaza por `RootNavigator`. Una acción principal por pantalla (`color.primary`, `color.onPrimary`, `touch.controlHeight`); vuelta desde el resumen con `popToTop()` (Home es la raíz del stack). El hallazgo `tabPress` sin `data.behavior` (T-07) no afecta: el Stack del viaje es el Home del Drawer (DP-02), no vive dentro de una pestaña; aplicaría solo si una spec futura anida un Stack en una pestaña (anotado en T-12). `home.startTrip` («Simular solicitud (provisional)») es una entrada provisional de desarrollo (D-48 actualizada: F1 §3 no contiene «Iniciar viaje»); no bloquea el cierre de T-08 y se retira con P-01 (simulador de solicitudes, APARCADA) o con la spec de solicitudes; el `testID` `home-start-trip` se conserva. «Pasajero a bordo» (RF-12) y «Disponible/No disponible» (RF-08) no se usan: llegan con 003/004.
- **DP-22 (T-10, navegador raíz; D-47, D-49, D-50).** `RootNavigator` es un `native-stack` con rutas CONDICIONALES por `accountStatus` (patrón de React Navigation: la ruta de la rama equivocada no existe, DP-05), `headerShown: false` y `animation: 'none'` (prop verificada en los tipos de `native-stack` instalado; el cambio de rama no es un avance del usuario; `'fade'` es la alternativa). `loading` y `error` usan `StartupScreen` (`src/screens/startup/StartupScreen.js`), que debajo de `ScreenState` monta `DevAccountSwitch` (D-50, provisional): sin él, con la cuenta simulada en `loading` (sin reintento, hallazgo de T-04) o `error`, Registro y Principal se desmontan y no habría forma de cambiar de rama en el celular. `App.js` queda con un solo `NavigationContainer` SIN `key` por rama; se borran `PreviewNavigator`, `pickBranch` (D-47) y `DevStatePanel.js` (D-38). `AppDrawerContent.js` (D-49 a) forma parte de T-09. Sin temporizadores nuevos (CA-000-08 se revalida con C11). Inventario de provisionales y quién los retira: `docs/backlog.md`, «Inventario de provisionales».
- **DP-19 (barra de estado, hallazgo del celular Android).** En la prueba de Anderson, reloj e iconos de la barra de estado se ven claros sobre el fondo claro y casi no se leen. Se corrige en **T-10**: es la única tarea que monta el árbol raíz en `App.js`, así una sola declaración de `expo-status-bar` (ya en `allowed`, no es dependencia nueva) cubre las tres ramas (carga/error, Registro, Principal). Se descartó T-06 porque `ScreenHeader` no está en las pantallas de carga y error ni se monta una vez. El implementer NO adivina la API: verifica en `node_modules/expo-status-bar` (tipos y README) y en la documentación vigente de SDK 57 qué prop fija iconos oscuros (hoy se espera `style="dark"`, sin verificar) y si en Android con borde a borde el fondo bajo la barra lo pinta la app (superficie `color.bg`/`color.surface` detrás de la barra) o la prop de fondo de la librería. Se comprueba con captura del celular; hasta que Anderson la pegue: «No verificado en dispositivo». ACTUALIZACIÓN (2026-10-27): API verificada en `node_modules/expo-status-bar/build/types.d.ts` (v57.0.1): `style?: 'auto'|'inverted'|'light'|'dark'`, `animated?`, `hidden?`, `hideTransitionAnimation?`; NO existe `backgroundColor`. Se usa `style="dark"` (texto e iconos oscuros). Con borde a borde (`edgeToEdgeEnabled=true`) el fondo bajo la barra lo pintan las pantallas (`color.bg` con zona segura superior). El módulo nativo Android de `expo-status-bar` ya está compilado en el build de Anderson: sin recompilar.

## 2. Versión de Expo (decisión pendiente para Anderson, V-02)
Verificado contra la documentación vigente de Expo (2026-10-27): SDK 58 es el estable actual (15-oct-2026; React Native 0.88, React 19.3.0, Node ≥ 22.13). El scaffold usa SDK 57 (expo ~57.0.31, RN 0.86.3, React 19.2.3), versión anterior que sigue recibiendo parches. La nueva Expo Go solo soportará SDK 58, pero este proyecto usa development build (RNF-12) y no depende de ella.
**El plan se escribe para SDK 57 (lo que existe). No se cambia de SDK sin decisión de Anderson.**

| | Quedarse en 57 | Subir a 58 |
|---|---|---|
| A favor | Nada que migrar; el scaffold ya instalado funciona; menos tiempo antes de T-01 | Versión estable actual; más margen de parches durante el semestre; alineada con Node ≥ 22.13 y React Native 0.88 |
| Riesgos | Versión anterior: dejará de recibir parches antes; librerías nativas futuras (`@react-native-firebase`, `react-native-maps`, geolocalización) pueden dejar de soportar 57 | Migrar añade trabajo a T-01 (`npx expo install --fix`, `expo-doctor`, notas de cambios) antes de tener nada corriendo; ruptura de APIs que mi conocimiento no cubre; la compatibilidad de firebase/maps/geolocalización con 58 tampoco está verificada |
| Cuándo conviene | Si la fecha límite (P-07) es corta | Si se decide antes de T-01, porque después cambia el build nativo |

La decisión debe tomarse **antes de T-01** (cambiar de SDK obliga a reconstruir el development build). Compatibilidad de `@react-native-firebase`, `react-native-maps` y geolocalización con 57 y con 58: **pendiente, no verificada** (V-02); la verificarán las specs que las usen.

## 3. Dependencias propuestas (lista exacta; nada se añade a `scripts/dependencies.json` hasta que Anderson confirme)
Excepción nombrada: **T-01 es la única tarea que instala dependencias en la app**, todas con `npx expo install`, antes del primer build nativo, para que el development build ya incluya todo el código nativo (si se instalara después habría que reconstruirlo).

| Paquete | Por qué | Registro hoy |
|---|---|---|
| `expo-dev-client` | RNF-12 | allowed |
| `@react-navigation/native` | núcleo | proposed, nombrado en D-29 |
| `@react-navigation/native-stack` | Stack raíz y del viaje | proposed, D-29 |
| `@react-navigation/bottom-tabs` | Tabs del registro | proposed, D-29 |
| `@react-navigation/drawer` | Drawer | proposed, D-29 |
| `react-native-screens` | obligatoria de la navegación | proposed; **D-29 no la nombra** |
| `react-native-safe-area-context` | obligatoria de la navegación | proposed; **D-29 no la nombra** |
| `react-native-gesture-handler` | solo porque el Drawer la exige | proposed, D-29 |
| `react-native-reanimated` | solo porque el Drawer la exige | proposed, D-29 |
| `react-native-worklets` | exigida por reanimated (comando de Expo citado por la documentación vigente) | **no está en ninguna lista** |
| `express` (solo `backend/package.json`, T-03) | RNF-11 | **no está en ninguna lista** |

Comandos de T-01 (a confirmar contra la documentación vigente):
```
npx expo install expo-dev-client
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-worklets
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/drawer
```
(La guía de React Navigation 7.x usa `npm install` para los `@react-navigation/*`; `npx expo install` lo acepta y es la regla del proyecto. Las dependencias transitivas, p. ej. `@react-navigation/elements`, llegan solas y no se instalan aparte.)

**Verificaciones que T-01 debe hacer contra la documentación vigente (NO verificadas por el planner):** (a) qué exige exactamente reanimated en SDK 57 para Babel: si `babel-preset-expo` ya incluye el plugin de worklets o hace falta un `babel.config.js` con `react-native-worklets/plugin` (si hace falta, ese archivo también lo toca T-01); (b) si reanimated y gesture-handler requieren pasos extra (p. ej. `import 'react-native-gesture-handler'` al inicio de `index.js`, `GestureHandlerRootView`); (c) que las versiones resueltas por `npx expo install` correspondan a SDK 57; (d) `npx expo-doctor` limpio. Si algo contradice este plan, el implementer se detiene y lo reporta.

**Conflictos con C15 que Anderson debe resolver al confirmar:**
1. C15 considera aprobado un paquete `proposed` solo si un bloque «Vigente» de `decisiones.md` lo nombra. D-29 no nombra `react-native-screens`, `react-native-safe-area-context` ni `react-native-worklets`: C15 daría WARN (los dos primeros) y ERROR (worklets, ausente del registro) hasta que haya una decisión Vigente que los nombre (ampliar D-29 o crear una nueva; el planner no edita decisiones).
2. Al confirmar el plan pasarían de `proposed` a `allowed`: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@react-navigation/drawer`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`, `react-native-reanimated`. Se añadirían a `allowed`: `react-native-worklets` y `express` (backend). Siguen en `proposed`: `expo-router` (no se usa) y `expo-localization` (D-29 la descarta). No se mueve nada ahora.

## 4. Árbol de `src/` y archivos → responsabilidad → requisitos
```
index.js                      punto de entrada (T-01 puede añadir el import de gesture-handler)
App.js                        T-01 primera pantalla; T-05 monta DevStatePanel (D-38); T-07 PROVISIONAL monta NavigationContainer > RegistrationTabs en lugar del panel, conservando los providers (D-41); T-08 PROVISIONAL: componente interno que muestra RegistrationTabs si accountStatus != approved y TripStack si approved (D-47); T-09 PROVISIONAL: la rama approved monta MainDrawer en lugar de TripStack (D-47 ampliada); T-10 monta providers + RootNavigator y retira ambos montajes
app.json, package.json        T-01 identificadores, scripts, dependencias
babel.config.js               solo si T-01 verifica que hace falta (reanimated)
src/theme/tokens.js           T-02 colores, tipografía, espaciado, radios, tamaños táctiles; T-14 añade type.numeric (D-36)   (RF-30, CA-D2)
src/constants/labels.js       T-02 textos de navegación y estados; T-06 a T-09 añaden sus claves (DP-17)   (RF-30)
src/constants/accountStatus.js T-04 valores de estado de cuenta                                 (RF-30, D-11)
src/context/AppStateContext.js T-04 provider, useAppState, simulación con limpieza             (RNF-02, CA-08/09)
src/components/ScreenState.js  T-05 variantes loading/empty/error + btn-retry                  (RF-30, CA-15)
src/components/DevStatePanel.js T-05 panel provisional montado en App.js; T-06 lo amplía (monta PlaceholderScreen name="first" + selector first-leading-drawer|back); T-10 lo BORRA (D-38, DP-20)   (CA-15)
src/components/ScreenHeader.js T-06 título + nav-open-drawer / nav-back                        (RF-30, CA-D1)
src/components/PlaceholderScreen.js T-06 marco screen-<name> + selector provisional de estado; T-07 añade el prop opcional safeEdges (D-41)  (RF-30, CA-15)
src/components/DevAccountSwitch.js T-07 panel provisional dev-account-*                        (CA-13/14)
src/navigation/RegistrationTabs.js T-07 (usa la prop tabBar, D-46)                              (RF-30, CA-10)
src/navigation/AppTabBar.js    T-07 barra propia (D-46)                                         (RF-30, CA-10)
src/components/LayoutDiagnostic.js T-07 TEMPORAL (D-45), se retira al confirmar la barra en el celular
src/screens/registration/*.js  T-07 PersonalData, Vehicle, Documents
src/screens/home/HomeScreen.js T-08 (PlaceholderScreen name="home"; home-start-trip, texto provisional «Simular solicitud (provisional)»; monta DevAccountSwitch provisional, D-47); T-09 solo añade onLeadingPress que abre el Drawer; src/screens/trip/*.js T-08 TripRequest, TripActive, TripSummary (leading back, una acción principal)
src/navigation/TripStack.js    T-08 native-stack Home > TripRequest > TripActive > TripSummary, headerShown false (DP-04); sin dependencias nuevas   (RF-30, CA-12, D1, D3)
src/navigation/MainDrawer.js   T-09 Drawer con Home = TripStack, drawerContent propio de 4 entradas + src/screens/main/*.js Profile, History, Earnings, Settings (PlaceholderScreen leading drawer; Settings muestra demoValue y DevAccountSwitch) (CA-11, CA-09, D1, D3)
src/navigation/AppDrawerContent.js T-09 drawerContent propio del Drawer: título + cuatro entradas drawer-* (D-49 a)   (CA-11, D1, D3)
src/navigation/RootNavigator.js T-10 native-stack con pantallas condicionales por accountStatus (loading / error / pending → RegistrationTabs / approved → MainDrawer), headerShown false, animation 'none'   (CA-13/14)
src/screens/startup/StartupScreen.js T-10 pantallas de arranque de carga y error: ScreenState + DevAccountSwitch debajo (D-50, provisional), raíz screen-startup   (CA-13/14)
App.js                        T-10 providers + import reanimated + NAVIGATION_THEME + StatusBar (expo-status-bar, style="dark", una vez, DP-19) + NavigationContainer sin key + RootNavigator; borra PreviewNavigator, pickBranch y DevStatePanel.js
backend/package.json, backend/src/app.js, backend/src/server.js   T-03                          (RNF-11, CA-06/07)
```
No existe `src/services/` en esta spec (la app no llama al backend; C10 no aplica).

## 5. Contratos (firmas)
```js
// src/theme/tokens.js
export const color = { bg, surface, border, text, textMuted, primary, onPrimary, success, warning, danger };
export const type  = { display, title, body, label, caption, numeric };   // display..caption: { fontSize, lineHeight, fontWeight }
// type.numeric = { fontVariant: ['tabular-nums'] }  (D-36, lo añade T-14). Solo cifras: se compone, no se usa solo:
//   <Text style={[type.display, type.numeric]}>  para importes, tiempos y distancias (DESIGN.md).
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 };
export const radius = { sm: 8, md: 12, lg: 20, full: 999 };
export const touch = { min: 44, controlHeight: 48, gap: 8 };
export const borderWidth = { thin: 1 };   // D-42, ancho del borde de componente (campos)
// src/navigation/AppTabBar.js (D-46): prop `tabBar` de bottom-tabs
export function AppTabBar({ state, descriptors, navigation, insets }): JSX.Element;
export const opacity = { pressed: 0.9 };   // D-39, lo añade T-06; ScreenState lo usa en el botón pulsado (4.95:1 sobre bg y surface)

// src/constants/accountStatus.js
export const ACCOUNT_STATUS = { LOADING: 'loading', PENDING: 'pending', APPROVED: 'approved', ERROR: 'error' };

// src/context/AppStateContext.js
export function AppStateProvider({ children }): JSX.Element;
export function useAppState(): {
  accountStatus: string, retryAccountStatus: () => void,
  simulateAccountStatus: (value: string) => void,
  demoValue: string, setDemoValue: (v: string) => void,
};

// src/navigation/AppDrawerContent.js (T-09, D-49 a): prop `drawerContent` del Drawer
export function AppDrawerContent({ state, navigation }): JSX.Element; // título labels.drawer.title + 4 entradas drawer-profile|history|earnings|settings (Home no se lista); elegir navega y cierra

// src/navigation/RootNavigator.js (T-10)
export function RootNavigator(): JSX.Element; // lee accountStatus de useAppState(); Stack.Screen condicionales: loading → Startup(kind loading), error → Startup(kind error), approved → Main (MainDrawer), otro → Registration (RegistrationTabs); screenOptions { headerShown: false, animation: 'none' }

// src/screens/startup/StartupScreen.js (T-10, D-50)
export function StartupScreen({ kind }): JSX.Element; // kind: 'loading' | 'error'; raíz testID screen-startup (SafeAreaView top+bottom, fondo color.bg, margen lateral space[4]); ScreenState + onRetry = retryAccountStatus solo en error; DevAccountSwitch debajo (provisional)

// src/components/ScreenState.js
export function ScreenState({ kind, onRetry }): JSX.Element; // kind: 'loading' | 'empty' | 'error'; testID state-<kind>; error muestra btn-retry

// src/components/ScreenHeader.js
export function ScreenHeader({ title, leading, onLeadingPress }): JSX.Element; // leading: 'drawer' (nav-open-drawer) | 'back' (nav-back) | null; área táctil ≥ 44; onLeadingPress opcional (sin él el botón se pinta y no hace nada; sin acoplar a navegación)

// src/components/PlaceholderScreen.js
export function PlaceholderScreen({ name, title, leading, onLeadingPress, children, safeEdges = ['top', 'bottom'] }): JSX.Element; // safeEdges (T-07, D-41): bordes de SafeAreaView; dentro de pestañas ['top']; raíz testID screen-<name>; selector <name>-force-content|loading|empty|error; reintento LOCAL (pasa a loading), no usa el contexto (D-38)
```
`testID` fijados por esta spec: `tab-personal-data|vehicle|documents`, `drawer-profile|history|earnings|settings`, `nav-open-drawer`, `nav-back`, `state-loading|empty|error`, `btn-retry`, `screen-<name>`; propios: `home-start-trip`, `personal-data-field-shared`, `dev-account-<valor>`, `<name>-force-<estado>`. Cambiarlos es cambiar un contrato.

Claves de `src/constants/labels.js` (existentes de T-02: `appName`, `tabs.*`, `drawer.*`, `nav.openDrawer|back`, `states.loading|empty|error.title|message`, `actions.retry`). Claves NUEVAS y la tarea que las añade (DP-17):
```js
// T-05 (D-38, panel provisional)
forceState:  { legend: 'Estado de la pantalla (prueba)', loading: 'Cargando', empty: 'Vacío', error: 'Error' },
// T-06 (solo AÑADE content dentro de forceState; no renombra ni borra)
placeholder: { body: 'Pantalla marcador. Su contenido llega con su spec.' },
forceState:  { content: 'Contenido' },   // se fusiona con las claves de T-05

a11y: { openDrawer: 'Abrir menú', back: 'Volver a la pantalla anterior' },
// T-07
a11y.tabs: { personalData: 'Pestaña Datos personales', vehicle: 'Pestaña Vehículo', documents: 'Pestaña Documentos' },
devAccount: { title: 'Simulador de cuenta (provisional)', loading: 'Cargando', pending: 'Pendiente de aprobación', approved: 'Aprobado', error: 'Error' },
demo: { sharedFieldLabel: 'Valor de prueba compartido', sharedValueLabel: 'Valor escrito en Datos personales', sharedValueEmpty: 'Todavía no escribiste nada' },
// T-08 (contrato de pantallas: export function TripStack(): JSX.Element; export function HomeScreen({ navigation }); TripRequestScreen|TripActiveScreen|TripSummaryScreen({ navigation }). Rutas: Home, TripRequest, TripActive, TripSummary. TripSummary vuelve con navigation.popToTop())
home: { startTrip: 'Simular solicitud (provisional)' }, // PROVISIONAL (D-48 actualizada): entrada de desarrollo, F1 §3 no trae «Iniciar viaje»; se retira con P-01 o la spec de solicitudes
trip: { requestTitle: 'Solicitud entrante', activeTitle: 'Viaje en curso', summaryTitle: 'Cobro y resumen', continue: 'Continuar', backToHome: 'Volver al inicio' },
// T-09 (contrato: export function MainDrawer(): JSX.Element; rutas Home (= TripStack), Profile, History, Earnings, Settings; ProfileScreen|HistoryScreen|EarningsScreen|SettingsScreen({ navigation }). Apertura desde cualquier pantalla: navigation.dispatch(DrawerActions.openDrawer()), DrawerActions de @react-navigation/native; HomeScreen solo añade onLeadingPress, TripStack no cambia)
a11y.drawerItems: { profile: 'Ir a Perfil', history: 'Ir a Historial', earnings: 'Ir a Ganancias', settings: 'Ir a Configuración' },
```
(Los textos son propuesta del planner, aprobados por Anderson salvo los que F1 §3 ya fije con otro literal; `devAccount.pending|approved` y `trip.requestTitle|summaryTitle` se alinean con F1 vía requisitos.md RF-04, RF-10 y RF-14; `home.startTrip` es provisional de desarrollo (D-48 actualizada). Anderson puede ajustarlos al revisar. `a11y` es un solo objeto que T-06, T-07 y T-09 van ampliando.)

## 6. Diseño
Dirección A «Tablero» (D-25), solo tema claro (D-26). Solo tokens de `DESIGN.md`:
- Navegación en `color.surface`; texto `color.text`/`color.textMuted`; destino activo con peso y texto, no relleno de acento. `color.primary` solo en el dato vivo/acción principal (`home-start-trip`, texto provisional «Simular solicitud (provisional)»).
- Barra de estado del sistema: iconos y reloj oscuros sobre `color.bg`/`color.surface` (DP-19, T-10). El hex `#E6F4FE` del `adaptiveIcon` de `app.json` es excepción nombrada (D-35) hasta la tarea del ícono real; no se trata como hallazgo de CA-000-D2.
- Cifras (importes, tiempos, distancias): `type.*` compuesto con `type.numeric` (D-36); ninguna pantalla de esta spec las muestra.
- Pares de color únicamente los de la tabla de contraste. Sin hex, tamaños ni fuentes sueltos fuera de `src/theme/tokens.js` (CA-D2).
- Área táctil ≥ 44 × 44, separación ≥ 8, controles de 48 que crecen con la escala del texto sin altura fija que corte (CA-D1, CA-D3).
- Estados: tres variantes reconocibles; error con `btn-retry`; vacío conserva su marco y dice qué hacer.
- Sin íconos de librería ni emoji; sin movimiento propio (las transiciones por defecto de los navegadores; reducir movimiento: el plan no añade animaciones).
- **Límite del arnés:** `scripts/visual-audit.mjs` abre una URL en Chromium y esta app no tiene destino web (sin `react-native-web`, no se añade). Las auditorías de diseño (T-12, T-13) se apoyan en capturas del celular de Anderson (capa E) y en revisión de código; la capa A del arnés se declara no aplicable y no se presenta como captura del celular.
- Diseño de cada tarea visual: `Diseño: Pendiente` hasta su auditoría (T-12 o T-13).

## 7. Mapa CA → implementación
| CA | Tareas | Cómo se comprueba |
|---|---|---|
| CA-000-01 | T-01 | Anderson, celular. No verificado en dispositivo |
| CA-000-02 | T-01 (primera pantalla), T-11 (navegación) | Anderson, por plataforma (P-05) |
| CA-000-03 | T-01 (y cada tarea que toque dependencias) | `check-constitution` C15/C16 |
| CA-000-04 | T-01 | Anderson, celular |
| CA-000-05 | T-01, T-11 | revisión de `progress.md` + C25 |
| CA-000-06 / 07 | T-03 | script temporal fuera del proyecto: arranca sin `.env`, GET `/health` |
| CA-000-08 | T-04; T-10 lo revalida (no añade temporizadores) | C11 y revisión de código (único `setTimeout` con limpieza) |
| CA-000-09 | T-04, T-07 (Vehículo), T-09 (Configuración), T-11 | Anderson escribe en `personal-data-field-shared` y lo ve en Vehículo/Configuración. Se cierra con la lectura en Configuración (T-09, manual); hasta entonces esa parte: No verificado en dispositivo |
| CA-000-10 | T-07 | Anderson |
| CA-000-11 | T-09 (manual: abrir con «Menú» y con el gesto de borde, cuatro entradas, volver a Home, atrás físico); T-10 lo integra | Anderson. No verificado en dispositivo hasta su confirmación |
| CA-000-12 | T-08 (TripStack; verificación manual en el celular, No verificado en dispositivo; vista previa en App.js, D-47) | Anderson |
| CA-000-13, CA-000-14 | T-10 (`RootNavigator` + `StartupScreen`, DP-22); T-11 repite el recorrido | Anderson, manual con el simulador `DevAccountSwitch` (también en las pantallas de arranque, D-50). T-10 también deja la barra de estado legible (DP-19), captura del celular. No verificado en dispositivo hasta su confirmación |
| CA-000-15 | T-05 (panel provisional, DP-20), T-06 (`PlaceholderScreen` con `first-force-content|loading|empty|error` en el panel; mensaje de vacío D-40), T-07/T-08/T-09 (cada pantalla); T-10 retira el panel y no toca el criterio | Anderson o captura |
| CA-000-D1 | T-06, T-07, T-08 (nav-back y botón principal de las pantallas del viaje), T-09 + T-12/T-13 | revisión de `testID` y medidas; capa D |
| CA-000-D2 | T-02, T-06 (`opacity.pressed` = 0.9, D-39; `ScreenState` sin número suelto), T-14 (`type.numeric`, D-36) + todas las visuales (la barra de estado oscura sobre `color.bg`/`color.surface` la cubre T-10, DP-19) + T-12/T-13 | verifier + C-reglas de §11. El texto de la spec lista solo `type.display` a `type.caption`: `type.numeric` es una adición del plan (D-36), no un cambio de la spec |
| CA-000-D3 | T-07, T-08 (botón principal y títulos del viaje crecen con la escala), T-09 + T-11 | Anderson aumenta la escala de texto |

## 8. Riesgos y puntos abiertos para Anderson
1. **SDK 57 vs 58** (§2): decidir antes de T-01.
2. **D-11 sigue Propuesta** en `decisiones.md`; el plan la sigue por aprobación de la spec. Conviene pasarla a Vigente.
3. **Plataforma del celular (P-05) sin resolver.** Entorno Windows 11: iOS no se compila localmente (necesita macOS o `eas build` con cuenta de Apple Developer, que ejecuta el humano). Android requiere Android Studio/SDK y depuración USB. Si solo hay una plataforma, la otra queda "No verificado en dispositivo" (CA-000-02).
4. **Lista de dependencias y registro** (§3): confirmar la lista, ampliar D-29 (o decisión nueva) para `react-native-screens`, `react-native-safe-area-context` y `react-native-worklets`, y añadir `express` a `allowed`.
5. Identificadores `com.andersonlondono.uberclone` (DP-15): confirmar.
6. Plugin de Babel de reanimated en SDK 57: sin verificar (T-01).
7. Reanimated/worklets exigen la nueva arquitectura de RN; en 0.86 es la única, pero no se verificó el detalle.
8. Atrás de Android en la raíz de Home sale de la app (comportamiento estándar); si Anderson quiere otra cosa, es un cambio de la spec.
9. Paneles provisionales (`DevAccountSwitch`, selector de estado forzado) viven en la app entregable hasta que 001/008 los retiren.
10. Ningún `.env`, ningún secreto en esta spec.
11. API de `expo-status-bar` en SDK 57: VERIFICADA en los tipos instalados (sin `backgroundColor`; `style="dark"`). Comportamiento visual borde a borde en el celular: sin verificar hasta la captura de Anderson (T-10, DP-19).
12. Orden sugerido de T-14: antes de las tareas visuales (P2 con T-03/T-05); no bloquea a ninguna de esta spec, bloquea a T-12 (la auditoría revisa los tokens finales) y a las specs futuras que muestren cifras.
