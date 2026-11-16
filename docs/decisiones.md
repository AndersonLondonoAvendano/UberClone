# Decisiones

Estados: Vigente (solo la pone Anderson) · Propuesta · PARADA (el equipo la dejó pendiente a propósito; no se pregunta, se registra).

## Vigentes [ENCARGO 2026-10-26]

### D-01 — Backend Node/Express · Vigente
Situación: F1 §4 exige un backend que guarde la llave secreta de la pasarela.
Decisión: Node.js/Express.
Alternativa: Cloud Functions.

### D-02 — Development build, sin Expo Go · Vigente
Situación: se usan módulos nativos (Firebase, mapas, geolocalización).
Decisión: development build (`expo-dev-client`).
Alternativa: Expo Go (descartada).

### D-03 — Pruebas en celular físico desde la primera pantalla · Vigente
Situación: mapas, ubicación, FCM y pagos no se validan en simulador/web.
Decisión: todo CA de dispositivo se prueba en celular real.
Alternativa: emulador.

### D-04 — Equipo unipersonal · Vigente
Situación: un solo integrante, Anderson Londoño Avendaño, decide todo.
Decisión: sin roles repartidos; Anderson aprueba cada fase.
Alternativa: —

## Propuestas

### D-05 — Base de datos Firestore · Propuesta
Situación: F1 §7 admite Firestore `onSnapshot` o Mongo Change Streams.
Decisión: Firestore.
Alternativa: MongoDB con Change Streams.

### D-06 — El backend recalcula la tarifa · Propuesta
Situación: F1 §4 dice que la app envía `tripId` y monto al backend.
Decisión: el backend recalcula con `calculateFare` desde los datos del viaje e ignora el monto del cliente.
Alternativa: confiar en el monto (inseguro).

### D-07 — Solicitudes simuladas · PARADA (P-01)
Situación: la app de pasajero no existe.
Decisión pendiente: propuesta de partida, un script o seed crea las solicitudes.
Alternativa: app de pasajero mínima.

### D-08 — El checkout se abre en la app del conductor · Propuesta
Situación: F1 §4 dice "la app abre el checkout" sin decir cuál app.
Decisión: la app del conductor.
Alternativa: app del pasajero.

### D-09 — Pasarela Mercado Pago · PARADA (P-03)
Situación: F1 §4 recomienda Mercado Pago o Stripe en modo prueba.
Decisión pendiente: propuesta de partida, Mercado Pago Checkout Pro.
Alternativa: Stripe en modo prueba.

### D-10 — Estados adicionales y sin cancelar · Propuesta
Situación: F1 §3 menciona rechazo/vencimiento y `rejected` no está en la lista de estados.
Decisión: se añade `rejected`; `accepted`→`driver_arriving` es automático; no hay botón de cancelar.
Alternativa: botón de cancelar para el conductor.

### D-11 — Navegación · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27). Incluye el criterio derivado de RNF-11 de la spec 000 (comprobación de estado del backend).
Situación: RF-30 pide Stack + Tabs + Drawer.
Decisión: Stack raíz con la rama Registro (Tabs) y la rama Principal (Drawer con Stack de viaje), esta última solo para cuentas Aprobadas.
Alternativa: Drawer raíz.

### D-12 — Tarifa mínima · Propuesta
Situación: el orden de multiplicador, redondeo y mínima no está explícito.
Decisión: mínima aplicada tras multiplicador y redondeo, validada con el ejemplo de F1 §5.
Alternativa: mínima antes del multiplicador.

### D-13 — Revisión técnico-mecánica · PARADA (P-04)
Situación: F1 §2 dice "si aplica según el año del vehículo" sin regla.
Decisión pendiente: propuesta de partida, obligatoria siempre hasta que haya regla.
Alternativa: exigir solo para vehículos de más de N años.

### D-14 — Placa solo de carro · Propuesta
Situación: el formato `ABC123` es de carro en Colombia.
Decisión: no se admite formato de moto.
Alternativa: admitir `ABC12D`.

### D-15 — i18n ES/EN completo · Propuesta
Situación: F1 §2 exige idioma ES/EN.
Decisión: toda la interfaz traducida, no solo el selector. Actualización de Anderson (2026-10-27, ver D-29): sin `expo-localization` ni librerías de i18n; diccionario propio ES/EN con contexto. D-15 sigue en Propuesta.
Alternativa: solo preferencia guardada.

### D-16 — JavaScript · Propuesta
Situación: F1 nombra `pricing.js`.
Decisión: JavaScript.
Alternativa: TypeScript.

### D-17 — Rúbrica no encontrada · PARADA (P-04)
Situación: F1 §9 anuncia la rúbrica y no la trae.
Decisión pendiente: se trabaja sin pesos hasta que el equipo la consiga.
Alternativa: —

### D-18 — Cachear Distance Matrix; OSRM como contingencia · Propuesta
Situación: RNF-08 limita las llamadas.
Decisión: cachear resultados; OSRM/OpenRouteService si se agota el presupuesto.
Alternativa: sin caché.

### D-19 — Documentos de trabajo en Git · PARADA (P-10)
Situación: `docs/`, `specs/`, `.claude/` son documentos de trabajo SDD.
Decisión pendiente: versionarlos o ignorarlos; decidir antes del primer push.
Alternativa: —

### D-20 — Modo ahorro desactivado · Propuesta
Situación: presupuesto de tokens sin definir (P-08).
Decisión: desactivado por defecto.
Alternativa: activarlo.

### D-21 — Sin CodeGraphContext · Propuesta
Situación: hay MCPs de grafo de código disponibles en el entorno.
Decisión: no se usan en el flujo del proyecto.
Alternativa: adoptarlos.

### D-22 — Cómo se crea el proyecto Expo en T-01 · Propuesta
Situación: la raíz ya contiene un scaffold (App.js, app.json, package.json con expo ~57.0.31 y react-native 0.86.3, index.js, assets/). Esta estructura SDD convive con él.
Decisión: lo decide el planner; opciones: conservar el scaffold y ajustarlo, o regenerar en carpeta temporal y fusionar sin destruir la estructura SDD.
Alternativa: `create-expo-app` en subcarpeta.

### D-23 — Pull Requests con un solo integrante · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-04).
Situación: F1 §9 pide PRs revisados y el equipo es de una persona; no hay nadie más que pueda revisar.
Decisión: los Pull Requests se revisan por autorrevisión, con `.github/pull_request_template.md` como lista de verificación obligatoria (sin `.env` ni claves en el diff, marcas `AI-assisted` presentes en el código nuevo, bitácora de IA actualizada, `check-constitution` sin errores nuevos frente a la línea base, probado en el celular). Anderson la completa antes de fusionar cada PR.
Alternativa: revisión externa (no aplicable: equipo de una persona).

### D-24 — Archivos de Firebase fuera de Git · Propuesta
Situación: `google-services.json` y `GoogleService-Info.plist` contienen identificadores del proyecto.
Decisión: fuera de Git (ya en `.gitignore`); el README explica cómo generarlos.
Alternativa: versionarlos.

### D-25 — Dirección visual A «Tablero» y tokens · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: Anderson eligió la dirección A «Tablero» entre tres propuestas (A Tablero, B Carretera, C Noche). Los contrastes WCAG de la paleta A se calcularon con un script temporal fuera del proyecto. Los textos pasan 4.5:1; los componentes (primario y borde) pasan 3:1.
Decisión: adoptar la dirección A (neutros fríos, un acento teal `#006D77` sobre el dato vivo, superficies planas, tipografía del sistema con cifras tabulares, escala de 4, radios, táctil ≥ 44 px) y reescribir DESIGN.md con sus tokens. Las direcciones B y C quedan descartadas (C además contradice D-26).
Alternativa: B «Carretera» (amarillo con texto negro; el primario no llega a 3:1 como límite de componente) o C «Noche» (tema oscuro, exigiría revisar D-26).

### D-28 — Cómo se consultaron las skills de diseño · Reemplazada por D-37
Aprobada por Anderson (2026-10-27) y registrada por el agente principal; reemplazada por D-37 el 2026-10-27 (aprobada por Anderson, registrada por el agente principal).
Situación: en la sesión que eligió la dirección A, la herramienta Skill no cargó `design-taste-frontend` (taste-skill), `impeccable` ni `ui-ux-pro-max` (respuesta «Unknown skill»), aunque los plugins figuran instalados y habilitados (`claude plugin list`).
Decisión: dejar constancia de que las tres skills se consultaron leyendo su `SKILL.md` del caché de plugins, no con la herramienta Skill, y que `draw.mjs` de Taste no se ejecutó (está pensado para pantallas de escritorio y no tiene un tipo de producto de movilidad); las tres direcciones fueron redactadas por el agente principal apoyándose en las reglas de `references/app-screens.md`. Tampoco corrieron los scripts de Impeccable ni de UI UX Pro Max. Esto no equivale a «skills cargadas»: las rondas de diseño siguen sujetas a P4 y a la regla de que el agente principal las cargue con Skill cuando estén disponibles.
Alternativa: repetir la elección de dirección cuando las skills carguen con Skill y se pueda ejecutar el flujo completo.

### D-26 — Solo tema claro · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: el scaffold declara `userInterfaceStyle: "light"` y F1 no menciona modo oscuro.
Decisión: solo tema claro; sin modo oscuro.
Alternativa: tema claro y oscuro.

### D-27 — Estado compartido con `useContext` · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: RNF-02 admite `useContext` o Redux; Redux no está en `scripts/dependencies.json`.
Decisión: `useContext` (sin dependencia nueva). La estructura concreta la decide el planner.
Alternativa: Redux (requeriría decisión Vigente para la dependencia, C15).

### D-29 — Dependencias de navegación, íconos e i18n · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: RF-30 exige Stack + Tabs + Drawer y las librerías están en `proposed` de `scripts/dependencies.json`. DESIGN.md pide íconos sin emoji; D-15 pide ES/EN completo.
Decisión:
- Navegación: se permiten `@react-navigation/native`, `native-stack`, `bottom-tabs` y `drawer` y sus dependencias obligatorias, incluidas `react-native-reanimated` y `react-native-gesture-handler` solo si el Drawer las exige según la documentación vigente. El plan fija la lista exacta; se instala con `npx expo install`. No se añade nada a `scripts/dependencies.json` hasta que el plan la confirme.
- Íconos: `@expo/vector-icons` solo si ya está en `package.json`; si no, texto y formas de `View`.
- i18n: sin `expo-localization` ni librerías; diccionario propio ES/EN con contexto (actualiza D-15).
Alternativa: añadir `expo-localization` y una librería de íconos (descartadas).

### D-30 — Amplía D-29: dependencias de navegación y express en backend · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: el plan de la spec 000 muestra que el Drawer y la navegación exigen `react-native-screens`, `react-native-safe-area-context` y `react-native-worklets`, que D-29 no nombraba, y el backend (RNF-11) necesita `express`.
Decisión: además de lo permitido en D-29, se permiten `react-native-screens`, `react-native-safe-area-context` y `react-native-worklets` (instalados con `npx expo install`), y `express` solo dentro de `backend/`. `scripts/dependencies.json` pasa estas dependencias a `allowed` y añade la lista aparte `backend` con `express`.
Alternativa: no ampliar D-29 (el Drawer no funcionaría).

### D-31 — Identificador de la app · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: el development build necesita `android.package` e `ios.bundleIdentifier`.
Decisión: `com.andersonlondono.uberclone` para Android e iOS.
Alternativa: otro identificador (cambiarlo después obliga a reinstalar el build).

### D-32 — Expo SDK 57 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: V-02 (parte del SDK): el SDK 58 es el estable actual (15-oct-2026) y el scaffold usa el 57, que sigue recibiendo parches. La compatibilidad de Firebase, mapas y geolocalización con 57 y 58 sigue pendiente (V-02 parte 2).
Decisión: el proyecto se queda en SDK 57 (expo ~57.0.31). No se cambia de SDK sin nueva decisión de Anderson.
Alternativa: subir a SDK 58.

### D-33 — Build de Android local con Android Studio · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: el development build (RNF-12) debe instalarse en el celular Android de Anderson (P-05).
Decisión: camino local con Android Studio (JDK, SDK de Android, depuración USB) y `npx expo run:android`, que ejecuta Anderson. Sin EAS por ahora; si se necesitara, requiere nueva decisión.
Alternativa: EAS en la nube (`eas build --profile development`).

### D-34 — Permitir `expo-system-ui` para cumplir D-26 en lo nativo · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27). Propuesta por el agente principal a pedido de Anderson. Anderson la pidió como «D-33», pero D-33 ya es el build local de Android; se numera D-34.
Situación: la prueba de T-01 en el celular Android (en modo oscuro) mostró fondo gris oscuro y texto negro casi ilegible: `userInterfaceStyle: "light"` de `app.json` no se aplica en nativo sin `expo-system-ui`. D-26 (solo tema claro) no se cumple en el dispositivo.
Decisión propuesta: permitir `expo-system-ui` (instalada con `npx expo install`) para que el modo claro se fuerce también en lo nativo. Su instalación es una excepción de T-02, nombrada en la tarea. Ya está en `allowed` de `scripts/dependencies.json`; hasta T-02 no se instala.
Alternativa: no instalarla y fijar el fondo y el texto con los tokens de DESIGN.md en cada pantalla (la app se vería bien, pero la barra de navegación y el color de fondo nativo seguirían los del sistema).

### D-35 — Excepción nombrada: hex del `adaptiveIcon` en `app.json` · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: `app.json` conserva `#E6F4FE` (fondo del `adaptiveIcon`, del scaffold), que no pertenece a la paleta de DESIGN.md; JSON no admite tokens.
Decisión: se acepta como excepción nombrada, solo en ese campo, hasta la tarea del icono real (que lo sustituirá por un valor de la paleta o por la imagen definitiva).
Alternativa: cambiarlo ya a `#F3F5F4` (`color.bg`).

### D-36 — Cifras tabulares como token `type.numeric` · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: DESIGN.md exige `fontVariant: ['tabular-nums']` en importes, tiempos y distancias y `src/theme/tokens.js` no lo trae.
Decisión: se añade el token `type.numeric` en `src/theme/tokens.js` (`{ fontVariant: ['tabular-nums'] }`), para componer con `type.*`. Lo añade una tarea, no el agente principal; el planner lo incorpora al contrato del plan §5 y lo asigna.
Alternativa: aplicar `tabular-nums` inline en cada componente.

### D-37 — Las skills de diseño se cargan con la herramienta Skill (reemplaza a D-28) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: D-28 dejó constancia de que las skills de diseño no cargaban con la herramienta Skill y se consultaban leyendo su `SKILL.md`. En esta sesión la herramienta Skill las lista con los nombres `impeccable:impeccable`, `taste-skill:design-taste-frontend` y `ui-ux-pro-max:ui-ux-pro-max`.
Decisión: desde T-05 y en toda tarea visual o auditoría de diseño (P3, P4), el agente principal carga esas tres skills con la herramienta Skill y pasa al subagente solo las reglas que aplican; lo que choque con DESIGN.md se descarta y se informa. Si alguna no carga, el agente principal lo dice y no lo presenta como cargada (se anota la alternativa usada, p. ej. leer su `SKILL.md`). Lo ya hecho bajo D-28 (T-02 y la elección de la dirección A) no se rehace.
Alternativa: seguir leyendo los `SKILL.md` (D-28).

### D-38 — Panel provisional de estados en `App.js` (T-05) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27). PROVISIONAL.
Situación: T-05 crea `ScreenState`, pero hasta T-06 a T-10 ninguna pantalla lo monta, así que Anderson no puede verlo en el celular.
Decisión: durante T-05, `App.js` monta `AppStateProvider` y un panel provisional (`src/components/DevStatePanel.js`) que usa `useAppState()` y muestra `ScreenState` con un selector de estado (Cargando, Vacío, Error) siempre visible, también desde `loading` (que no tiene `btn-retry`). `testID` del selector: `first-force-loading|empty|error`. Añade a `labels.js` solo las claves `forceState.legend|loading|empty|error`, que luego reutiliza T-06; la clave `forceState.content` la añade T-06. Los textos del panel salen de `labels.js`, sin literales.
Retiro: la tarea T-10 (reemplaza `App.js` por el navegador raíz) debe borrar `DevStatePanel.js` y dejar `App.js` sin el panel; el selector de estados de cada pantalla lo cubre `PlaceholderScreen` (T-06, plan DP-09).
Ampliación en T-06 (instrucción de Anderson, prompt #14, punto 4; registrada por el agente principal): T-06 amplía `DevStatePanel.js` para que monte `PlaceholderScreen name="first"` (cuyo selector definitivo `first-force-content|loading|empty|error` reemplaza al del panel) y alterne el encabezado entre `leading="drawer"` y `leading="back"`; `App.js` NO se toca en T-06. Lo sigue retirando T-10 (borra `DevStatePanel.js`).
Alternativa: no tocar `App.js` y esperar a T-07 para ver `ScreenState` en el celular.

### D-39 — Token `opacity.pressed` = 0.9 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: la verificación de T-05 encontró `PRESSED_OPACITY = 0.85` suelto en `ScreenState.js`; DESIGN.md no definía una opacidad de pulsado y con 0.85 el contraste del botón pulsado queda en 4.50:1 sobre `bg` y 4.47:1 sobre `surface` (por debajo de 4.5 sobre `surface`). Cálculo con un script temporal fuera del proyecto (relleno y texto del botón mezclados con el fondo): 0.88 → 4.78:1, 0.90 → 4.95:1, 0.92 → 5.18:1, 0.94 → 5.39:1.
Decisión: se crea el token `opacity.pressed` = 0.9 en `src/theme/tokens.js` y se documenta en DESIGN.md. Contraste del botón primario pulsado: 4.98:1 sobre `bg` y 4.95:1 sobre `surface` sin redondear (4.95:1 y 4.93:1 con canales de 8 bits; corrección del 2026-10-27: la primera cifra citada, 4.95 sobre `bg`, era 4.98) (margen de 0.45 sobre el mínimo de 4.5). `ScreenState` lo usa en lugar de `PRESSED_OPACITY`. Lo implementa T-06 (no el agente principal), que amplía `tokens.js` y `ScreenState.js`; el spec-author documenta el token en DESIGN.md.
Alternativa: 0.92 (más margen, pulsado menos perceptible) o dejar el valor suelto.

### D-40 — Mensaje del estado vacío y notas para T-12 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27).
Situación: DESIGN.md pide que el estado vacío diga qué falta y qué hacer; el mensaje actual de `labels.states.empty.message` («Cuando haya información, la verás en esta pantalla.») solo dice qué falta. Además, la prueba de T-05 dejó dos observaciones.
Decisión: el mensaje del estado vacío se corrige dentro de T-06 (no antes), en `labels.js`, para decir qué falta y qué hacer, sin referirse a controles que no existan. El marco tenue del estado vacío (solo el escalón de tono `surface` sobre `bg`, 1.09:1) y el `accessibilityLabel` de carga (en el contenedor, sin `accessible`) no cambian en T-06: quedan anotados para la auditoría T-12.
Alternativa: corregir el marco y el `accessibilityLabel` ahora.

### D-41 — `App.js` provisional con las pestañas del registro (T-07) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #15, punto 5). PROVISIONAL.
Situación: para que Anderson vea las pestañas del registro y compruebe CA-000-09 en el celular antes de que exista el navegador raíz (T-10), T-07 necesita tocar `App.js`.
Decisión: durante T-07, `App.js` monta `AppStateProvider`, `NavigationContainer` y `RegistrationTabs` (las tres pestañas, cada una un `PlaceholderScreen`) en lugar de `DevStatePanel`. `DevStatePanel.js` NO se borra: lo borra T-10 (D-38). La función del panel provisional se conserva así: el selector de estado de cada pantalla (`<pantalla>-force-*`, en `PlaceholderScreen`) y `DevAccountSwitch` (`dev-account-*`) están siempre visibles, también cuando el estado elegido es `loading`; `DevStatePanel` deja de montarse desde `App.js` pero su archivo sigue en el repositorio hasta T-10. Para no duplicar la zona segura inferior dentro de las pestañas, T-07 añade a `PlaceholderScreen` un prop opcional de bordes seguros (por defecto los de antes).
Retiro: T-10 reemplaza `App.js` por el navegador raíz (con la rama Registro de `RegistrationTabs`), borra `DevStatePanel.js` y retira el montaje provisional de T-07.
Alternativa: no tocar `App.js` y esperar a T-10 para ver las pestañas.

### D-42 — Token de ancho de borde `borderWidth.thin` = 1 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #16, punto 3a).
Situación: el campo compartido de T-07 usaba la constante suelta `FIELD_BORDER_WIDTH = 1` porque DESIGN.md no define un token de ancho de borde (hueco, como pasó con la opacidad en D-39).
Decisión: se añade el token `borderWidth.thin` = 1 en `src/theme/tokens.js` (siguiendo la convención de categorías en singular con claves por uso o tamaño: `radius.sm`, `opacity.pressed`) y se documenta en DESIGN.md como el ancho del borde de componente (campos y controles con límite `color.border`). El campo debe usarlo en lugar de `FIELD_BORDER_WIDTH`. Lo implementa el implementer dentro de T-07 (corrección tras la prueba del celular); el spec-author lo documenta en DESIGN.md.
Alternativa: dejar la constante con nombre en el campo.

### D-43 — Tema de navegación con `primary` = `color.text` · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #16, punto 3b).
Situación: el implementer de T-07 mapeó `theme.colors.primary` a `color.text` en lugar de `color.primary` (el verifier lo consideró aceptable: no cambia nada visible porque las etiquetas de las pestañas llevan sus propios colores, y cumple DESIGN.md «el acento no se reparte por el chrome»).
Decisión: se acepta `primary` = `color.text` en el tema de `NavigationContainer`.
Alternativa: `color.primary`.

### D-44 — `DevAccountSwitch` oculto con el selector local fuera de «Contenido» · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #16, punto 3c).
Situación: `DevAccountSwitch` va como `children` de `PlaceholderScreen` en Datos personales, así que desaparece cuando el selector local no está en «Contenido».
Decisión: se deja como está hasta T-10 (que retira los paneles provisionales).
Alternativa: moverlo fuera de `children` (cambio mayor en `PlaceholderScreen`).

### D-45 — Diagnóstico TEMPORAL de medidas de pantalla en Datos personales · Retirado (2026-10-27)
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #16, punto 2).
Situación: la barra de pestañas de T-07 queda fuera de pantalla por abajo en el celular Android y las causas posibles (a a e del prompt #16) no se distinguen solo leyendo código.
Decisión: se añade un componente temporal `LayoutDiagnostic` (en `PersonalDataScreen`, como parte de `children`) que muestra las medidas reales: insets, dimensiones de ventana y pantalla, posición y alto de la escena y alto medido de la barra. Es TEMPORAL: se retira cuando Anderson confirme en el celular que la barra se ve (D-46), y no se entrega.
Alternativa: corregir sin medir.

### D-46 — Barra de pestañas propia con la API `tabBar` (corrección del defecto de T-07) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #16, punto 2; Anderson eligió esta opción entre tres).
Situación: causa raíz del defecto (con evidencia medida en el celular, 2026-10-27): `RegistrationTabs` pasaba `tabBarStyle: { height: 'auto' }` (idea del implementer de T-07, aceptada sin medir en dispositivo). En `BottomTabBar.js` de `@react-navigation/bottom-tabs` 7.21.0 el contenido de la barra es `bottomContent: { flex: 1, flexDirection: 'row' }`; con el contenedor en altura automática, `flex: 1` (base 0) colapsa a 0 y la barra mide solo su `paddingBottom` (el inset inferior). El diagnóstico mostró `tab bar height (measured)` = 14.9 = `insets.bottom` = 14.9, ventana = pantalla = marco inicial = 832 dp, y la barra empieza en 832 − 14.9 = 817.1 dp ≈ y 1571 px de 1600, que es donde asoma el fragmento de «Datos». Hipótesis descartadas: (a) edge-to-edge: los insets llegan (T 34.1, B 14.9) y la ventana ocupa toda la pantalla; (b) alto raíz mayor que la ventana: ventana = pantalla = marco inicial = 832; (c) `SafeAreaProvider`: hay uno solo y los insets son coherentes con los iniciales; (e) el contenido no empuja la barra (la escena es `absoluteFill` en un contenedor `overflow: hidden`).
Decisión: se elimina `height: 'auto'` y los ajustes de `tabBarStyle`/`tabBarItemStyle`/`tabBarIcon`/`tabBarIconSize` de `RegistrationTabs` y se usa la prop oficial `tabBar` con un componente propio (`AppTabBar`): barra `color.surface` en el flujo, `paddingBottom` = inset inferior, fila de `Pressable` con `minHeight: touch.controlHeight`, separación de 8 entre pestañas, sin sombra ni borde, activa por peso y subrayado, sin ícono, con `testID` y accesibilidad de las opciones; la altura sale del contenido y crece con la escala de texto. El diagnóstico D-45 se mantiene hasta que Anderson confirme en el celular que la barra se ve, y se retira entonces.
Alternativa: barra de la librería con altura numérica calculada, o con la altura por defecto (49 + inset; no crece con el texto, incumple CA-000-D3).

Retiro de D-45 (2026-10-27, prompt #17): Anderson probó la barra propia en el celular (captura `9.png`: las tres pestañas completas sobre la línea de gestos y «tab bar height (measured)» = 62.9 = 14.9 + 48) y pidió retirar el diagnóstico. Se borra `src/components/LayoutDiagnostic.js` y su montaje en `PersonalDataScreen`.

### D-47 — `App.js` provisional con acceso simulado a Registro o Principal (T-08) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #18, punto 6). PROVISIONAL.
Situación: para que Anderson vea el Stack del viaje (T-08) en el celular antes del navegador raíz (T-10), `App.js` debe mostrarlo; hoy (D-41) solo monta `RegistrationTabs`.
Decisión: durante T-08, `App.js` sigue montando `AppStateProvider` y `NavigationContainer`, y muestra `RegistrationTabs` mientras la cuenta simulada NO sea «Aprobado» y el `TripStack` cuando `accountStatus` sea `approved` (se cambia con `DevAccountSwitch`: «Aprobado»). Es solo una vista previa: no hay pantalla de carga ni de error de arranque, no cierra CA-000-13 ni CA-000-14 y no sustituye al acceso por cuenta de T-10. Para poder volver a Registro desde el Home, el `HomeScreen` de T-08 monta también `DevAccountSwitch` (provisional). Retiro: T-10 reemplaza `App.js` por el navegador raíz con las ramas reales y borra el montaje de vista previa; los `DevAccountSwitch` los retiran las specs 001 y 008.
Alternativa: mostrar solo el `TripStack` (se perdería la vista de las pestañas hasta T-10) o esperar a T-10.

### D-48 — `home.startTrip` = «Simular solicitud (provisional)»: entrada provisional de desarrollo · Vigente (actualizada el 2026-10-27)
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #18, punto 3).
Situación: `docs/requisitos.md` no trae un literal para el botón de entrada al flujo del viaje; el F1 original no está en el repositorio.
Decisión: `labels.home.startTrip` = «Iniciar viaje» se usa marcado como PROVISIONAL en `labels.js` (comentario `provisional`); T-08 no puede cerrar (Validada) con ese texto como definitivo: antes, Anderson lo confirma contra F1 §3 o lo cambia. Los demás textos de T-08 usan el literal de F1 (vía `docs/requisitos.md`) cuando existe: «Solicitud entrante» (RF-10), «Viaje en curso» (RF-12) y «Cobro y resumen» (RF-14).
Alternativa: fijarlo ya.

Actualización de D-48 (2026-10-27, prompt #19; aprobada por Anderson, registrada por el agente principal): Anderson comprobó F1 (el PDF del cuaderno): F1 §3 NO contiene el texto «Iniciar viaje»; la pantalla Inicio es el mapa con el interruptor Disponible / No disponible, y la solicitud entrante llega cuando un pasajero pide el viaje. Los literales «Solicitud entrante», «Viaje en curso» y «Cobro y resumen» sí coinciden con F1 §3. Decisión: `labels.home.startTrip` pasa de «Iniciar viaje» a «Simular solicitud (provisional)». Es una entrada provisional de desarrollo y se reemplaza cuando se resuelva P-01 (simulador de solicitudes, que sigue APARCADA y no se resuelve ahora); el botón se retira con P-01 o con la spec correspondiente. Se cambia el texto visible y la documentación que lo mencionaba; el `testID` `home-start-trip` no está fijado en DESIGN.md (lo fijó el plan de la spec 000) y se CONSERVA tal cual para no romper pruebas ni referencias. Con esto T-08 ya puede cerrarse (Validada con Diseño Pendiente).

Ampliación de D-47 en T-09 (2026-10-27, prompt #19, punto 5; aprobada por Anderson, registrada por el agente principal): la vista previa provisional de `App.js` muestra, cuando la cuenta simulada es «Aprobado», el `MainDrawer` (que contiene el Stack del viaje como Home) en lugar del `TripStack` solo; con cualquier otro estado sigue mostrando `RegistrationTabs`. Sigue siendo provisional y lo reemplaza T-10 (navegador raíz con las ramas reales).

### D-49 — Hallazgos de T-09: plan, T-13 y spec 008 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #20, punto 2).
Decisión: (a) `src/navigation/AppDrawerContent.js` se añade al plan de T-09 (plan.md y backlog). (b) El panel del Drawer sin desplazamiento (un `View` fijo: con la escala de texto máxima y una pantalla baja podrían no caber las cuatro entradas), el overlay `rgba(0,0,0,0.5)` y el radio 16 en Android de la librería (no son tokens) pasan a la auditoría de diseño T-13, anotados allí. (c) «Perfil» y «Configuración» no tienen literal F1 propio (RF-29 dice «Perfil y configuración» como una pantalla; RF-30 y la spec 000 listan cuatro destinos): los resuelve la spec 008 (perfil y configuración); queda anotado.
Alternativa: resolver (b) y (c) dentro de T-09.

### D-50 — `DevAccountSwitch` también en las pantallas de arranque (carga y error) de T-10 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-10-27, prompt #20, punto 5). PROVISIONAL.
Situación: el simulador de cuenta es hoy la única forma de cambiar de rama en el celular, y vive dentro de Registro (Datos personales), Inicio y Configuración. Con el navegador raíz de T-10, si la cuenta simulada pasa a `loading` (la carga simulada, sin reintento: hallazgo de T-04) o a `error`, Registro y Principal se desmontan y el simulador desaparecería, dejando la prueba sin salida.
Decisión: las pantallas de arranque de carga y de error de T-10 muestran, debajo de `ScreenState`, el `DevAccountSwitch` (provisional) para poder volver a otra rama; el error mantiene además `btn-retry`. Lo retiran las specs 001 y 008 junto con los demás `DevAccountSwitch` (cuando el estado de la cuenta sea el real), y lo comprueba la lista de cierre de la spec 009 (ningún `dev-account-*` en el código entregado).
Alternativa: retirar el simulador y probar el cambio de rama de otra forma (no hay otra en el celular).

### D-51 — Entrega parcial 2026-11-05: se aplazan T-12 y T-13, se prioriza el registro funcional (spec 001) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24).
Situación: la profesora confirmó una entrega parcial para el jueves 2026-11-05, con alcance concreto (Pestañas 1 y 2 del registro totalmente funcionales con Firestore y fotos reales; Pestaña 3 mínima; envío que deja la cuenta «Pendiente de aprobación»). T-12 y T-13 (auditoría de diseño de la spec 000) auditarían, entre otras cosas, el contenido de las tres pestañas de Registro (T-07) que la spec 001 va a reemplazar; auditar ahora ese contenido sería trabajo perdido.
Decisión: T-12 y T-13 quedan en `docs/backlog.md` como Pendiente (Estado sin cambio), con todos los hallazgos de diseño ya anotados (`docs/backlog.md`, listas de T-12 y T-13) conservados para cuando se ejecuten. No se invoca al `design-auditor`. Se prioriza especificar y planificar el registro funcional (spec 001-registro-conductor) para cumplir la entrega del jueves. El campo `Diseño` de T-02, T-05 a T-10 sigue «Pendiente»; la spec 000 sigue «Planificada» (no se cierra) hasta que T-12, T-13 y T-14 (ya Validada) completen sus tareas.
Alternativa: ejecutar T-12/T-13 ahora sobre el contenido actual de las pestañas y repetir la auditoría después del registro funcional (doble trabajo, descartado por el tiempo disponible).
Ampliada (Anderson, 2026-11-01, prompt #25, punto 2f): T-29 (auditoría de diseño propia de la spec 001-registro-conductor, recomendada por el planner) queda aplazada por el mismo motivo y con la misma condición que T-12/T-13: el campo `Diseño` de T-21, T-22, T-24, T-25 y T-26 sigue «Pendiente» hasta que se ejecute.

### D-52 — Firestore con el SDK de JavaScript (`firebase`), no `@react-native-firebase` · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4a).
Situación: evita generar y versionar `google-services.json`/`GoogleService-Info.plist` (ya excluidos por D-24) y una configuración nativa de Firebase adicional; el SDK JS corre sobre fetch/WebSocket puro, sin módulo nativo propio. RIESGO señalado por el agente principal antes de especificar: las versiones recientes de `firebase` (v10+) usan "package.json exports", que a veces choca con la resolución de Metro bajo Expo. Mitigación: antes de fijar la versión en `scripts/dependencies.json`, la tarea de instalación debe verificar la guía oficial vigente de Expo para Firebase JS SDK (https://docs.expo.dev/guides/using-firebase/) para la versión de SDK de Expo del proyecto, y fijar una versión de `firebase` compatible o el ajuste de `metro.config.js` que haga falta.
Decisión: Firestore vía SDK JS (paquete `firebase`). Reglas de seguridad de Firestore restringidas por `uid` (nada abierto a todos ni a `request.auth == null`).
Alternativa: `@react-native-firebase` (requiere configuración nativa y una recompilación distinta; se descarta por el tiempo disponible hasta el jueves).

### D-53 — Identidad: Firebase Auth anónimo, `uid` = `driverId` · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4b).
Situación: F1 no exige correo/contraseña para el conductor en esta etapa; la autenticación anónima es la opción más simple y rápida de implementar para el jueves. RIESGO señalado por el agente principal: si se desinstala la app o se limpian los datos, Firebase genera un `uid` anónimo nuevo y se pierde el acceso al documento anterior sin forma de recuperarlo. Para un taller de un solo dispositivo es aceptable; queda anotado como limitación conocida, no como error, y como caso límite en la spec 001.
Decisión: Firebase Auth anónimo; el `uid` resultante es el `driverId` y la clave del documento del conductor en Firestore. `AsyncStorage` solo guarda preferencias de sesión (RNF-04), nunca datos sensibles.
Alternativa: correo/contraseña (más robusto frente a la pérdida del `uid`, pero más lento de implementar para el jueves; queda anotada como mejora futura, no descartada para siempre).

### D-54 — Fotos con Cloudinary, upload preset sin firma, subida directa desde la app · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4c).
Situación: RNF-05 exige que llaves/secretos vivan solo en el backend; un upload preset "unsigned" de Cloudinary está diseñado para ser público (no es un secreto equivalente a una API key privada), así que subir directo desde la app no viola RNF-05. RNF-07 ya recomendaba Cloudinary.
Decisión: Cloudinary con upload preset sin firma; el nombre de la nube y del preset son variables de entorno PÚBLICAS de Expo (prefijo `EXPO_PUBLIC_`), con los NOMBRES (nunca los valores) en `.env.example`. Sin SDK nativo de Cloudinary: `fetch`/`FormData` contra su API REST de subida sin firma.
Alternativa: subir las fotos a través del backend (añade un salto de red y complejidad sin necesidad real, porque el preset sin firma ya es seguro para uso en cliente).

### D-55 — Pestaña 3 (Documentos) mínima para la entrega del 2026-11-05 · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4d).
Situación: alcance confirmado por la profesora vía Anderson: para esta entrega bastan el correo de Mercado Pago y el checkbox de términos con el porcentaje de comisión visible; licencia, SOAT y revisión técnico-mecánica (resto de RF-07) quedan pendientes.
Decisión: Documentos, en esta entrega, valida solo el correo de Mercado Pago (formato) y el checkbox de términos (bloqueante si no está marcado, con la comisión visible). Licencia, SOAT y revisión técnico-mecánica quedan como pendientes anotados en `docs/requisitos.md`/`docs/backlog.md`, ligados a P-04 (sigue aparcada) y a una tarea futura (de esta spec o de una spec propia, a decidir cuando se resuelva P-04).
Alternativa: implementar también licencia/SOAT/RTM ahora (se descarta por el tiempo disponible).

### D-56 — Listas desplegables con `Modal` + `FlatList`, sin dependencia nativa · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4e).
Situación: evita instalar `@react-native-picker/picker` (código nativo, exige recompilar) justo antes de una entrega con poco margen; además permite estilos 100 % con los tokens de `DESIGN.md`.
Decisión: los campos de selección (categoría del vehículo, color, género, idioma) usan un `Modal` con `FlatList` propio, sin dependencia nueva.
Alternativa: `@react-native-picker/picker` (UI nativa del sistema; se descarta por el tiempo y por salirse de los tokens).

### D-57 — Estado de cuenta real vía Firestore (`accountStatus` con `onSnapshot`) · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4f).
Situación: hasta ahora `accountStatus` es simulado en memoria (`AppStateContext`, T-04) con `DevAccountSwitch` (D-38, D-47, D-50) como única forma de cambiarlo en el celular. F1 §2 dice que «Aprobado» se simula cambiando el campo en la base de datos.
Decisión: el documento del conductor en Firestore tiene el campo `accountStatus`; se escucha con `onSnapshot` (limpieza en el retorno del `useEffect`, regla C11). El planner debe decidir y nombrar en el plan la tarea exacta que reemplaza el simulador por esta lectura real (propuesta del agente principal: la tarea que conecta el envío del registro con Firestore, porque ahí nace el documento real); hasta esa tarea, `DevAccountSwitch` sigue siendo necesario para probar las ramas sin un conductor real todavía registrado, y se retira junto con él (specs 001 y 008, ya anotado en D-38/D-47/D-50 y en `docs/backlog.md`). «Aprobado» se simula cambiando el campo `accountStatus` manualmente en la consola de Firestore (F1 §2).
Alternativa: mantener el simulador en paralelo a la cuenta real (duplica la lógica de estado; se descarta).

### D-58 — El backend Express no se toca en esta entrega · Vigente
Aprobada por Anderson, registrada por el agente principal (2026-11-01, prompt #24, punto 4g).
Situación: el registro funcional (Firestore directo + Cloudinary directo desde la app) no necesita backend: no crea preferencias de pago ni usa llaves secretas en esta etapa.
Decisión: `backend/` queda sin cambios para esta entrega.
Alternativa: ninguna necesaria (no aplica).

### D-59 — Validación en el celular agrupada en tres puntos de control para el registro funcional · Vigente
Propuesta por el agente principal (2026-11-01, prompt #24, punto 7); aprobada por Anderson (2026-11-01, prompt #25, punto 2e). Se aplica: AGENTS.md P1 ajustado (ver abajo).
Situación: el ciclo P1 de `AGENTS.md` ("Prompts del ciclo") espera, por tarea, "Pega aquí el resultado de la prueba en el celular" antes de autorizar la siguiente, y cierra con "no hagas commit ni empieces la siguiente". Agrupar la prueba de Anderson en tres puntos (Pestaña 1; Pestañas 2 y 3; envío completo y estado Pendiente) en vez de una por tarea choca con esa frase exacta de P1 y, en el límite, con la regla rápida "Una tarea a la vez" de `AGENTS.md`/`CLAUDE.md` si se interpreta como "una tarea a la vez incluida su prueba en el celular". No choca con `docs/constitution.md` §8 (que no fija "una prueba por tarea", solo que lo que depende del celular queda "No verificado" hasta que Anderson confirme), ni con las reglas de `verifier.md` (que ya exige un verifier distinto por tarea, independiente del punto de control del celular).
Decisión propuesta: dentro de la cadena de tareas de la spec 001 (y solo ahí, mientras dure la entrega del 2026-11-05), el agente principal puede implementar y verificar (estático, con script propio y `check-constitution`) varias tareas dependientes en secuencia sin pedir la prueba de Anderson entre cada una, agrupando la evidencia de dispositivo en tres puntos: (1) tras Pestaña 1 funcional; (2) tras Pestañas 2 y 3 funcionales; (3) tras el envío completo con Firestore y el estado Pendiente. Cada tarea sigue teniendo su propio verifier (distinto del implementer) y su propio Estado en `docs/backlog.md`, que puede llegar a "Implementada" sin "Validada" mientras espera el punto de control correspondiente; una tarea no pasa a "Validada" sin su evidencia de celular. Si una tarea de un grupo falla en el punto de control, se detiene ahí (no se sigue agrupando hacia adelante) y se diagnostica antes de continuar. Ajusta textualmente la frase de P1 en `AGENTS.md` ("Espera… no empieces la siguiente") para admitir esta excepción nombrada por spec y por fecha límite.
Alternativa: mantener una prueba por tarea (más lento, pero sin ajustar ninguna regla); o un único punto de control al final (más rápido, pero si algo falla en Pestaña 1 se descubre después de construir todo lo demás encima).

### D-60 — Sin documento `drivers/{uid}`: se trata como «no registrado», no como error · Vigente
Propuesta por el spec-author (2026-11-01) al escribir la spec 001-registro-conductor; aprobada por Anderson (2026-11-01, prompt #25, punto 2a).
Situación: un `uid` anónimo recién creado (primera vez que abre la app) no tiene todavía documento en `drivers/{uid}`; D-57 escucha ese documento con `onSnapshot`, y una lectura sin documento no es, por sí sola, un fallo de red ni de permisos.
Decisión: la ausencia del documento se interpreta como «cuenta no registrada todavía» y muestra la rama de Registro (D-11), no el estado de error; el estado de error queda solo para fallos reales de lectura (red o permisos).
Alternativa: tratar la ausencia de documento como un error hasta que exista (obligaría a un estado de error permanente para todo conductor nuevo).

### D-61 — «Nombre: solo letras» incluye tildes y la ñ · Vigente
Propuesta por el spec-author (2026-11-01) al escribir la spec 001-registro-conductor; aprobada por Anderson (2026-11-01, prompt #25, punto 2a).
Situación: RF-05 exige que el nombre tenga como máximo 50 caracteres, "solo letras y espacios"; F1 §2 no aclara si "letras" incluye el alfabeto español completo (á, é, í, ó, ú, ñ, Ñ, ü) o solo a-z/A-Z sin diacríticos, y los conductores son hispanohablantes.
Decisión (lectura más conservadora, la que no rechaza nombres reales): "letras" incluye las letras del alfabeto español con sus diacríticos (á, é, í, ó, ú, ü, ñ, Ñ) y espacios; excluye dígitos, signos de puntuación y otros símbolos.
Alternativa: restringir a a-z/A-Z sin diacríticos (rechazaría nombres colombianos comunes).

### D-62 — «Correo con `@` y dominio»: se exige al menos un punto en la parte del dominio · Vigente
Propuesta por el spec-author (2026-11-01) al escribir la spec 001-registro-conductor; aprobada por Anderson (2026-11-01, prompt #25, punto 2a).
Situación: RF-05 y RF-07 (correo de Mercado Pago) piden "correo con `@` y dominio"; F1 §2 no da el patrón exacto.
Decisión (lectura conservadora): se exige la forma `algo@dominio.algo` (texto, arroba, texto, punto, texto); un valor como `a@b` (sin punto) se considera inválido. Se aplica igual al correo personal (RF-05) y al de Mercado Pago (RF-07).
Alternativa: aceptar cualquier texto con una sola `@` sin exigir punto en el dominio (más permisivo, admitiría dominios incompletos).

### D-63 — Opciones del desplegable de género · Vigente
Propuesta por el spec-author (2026-11-01) al escribir la spec 001-registro-conductor; aprobada por Anderson (2026-11-01, prompt #25, punto 2a).
Situación: RF-05 exige género por desplegable, pero F1 §2 no enumera las opciones.
Decisión (conservadora, cerrada y mínima): Femenino, Masculino, Otro, Prefiero no decir.
Alternativa: solo Femenino/Masculino (más restrictiva; podría excluir conductores).

### D-64 — Opciones del desplegable de color del vehículo · Vigente
Propuesta por el spec-author (2026-11-01) al escribir la spec 001-registro-conductor; aprobada por Anderson (2026-11-01, prompt #25, punto 2a).
Situación: RF-06 exige color por desplegable, pero F1 §2 no enumera las opciones.
Decisión (conservadora, incluye un catch-all para no excluir ningún color real): Blanco, Negro, Gris, Plata, Rojo, Azul, Verde, Amarillo, Otro.
Alternativa: campo de texto libre en lugar de desplegable (RF-06 pide explícitamente desplegable, así que se descarta).

### D-65 — Promover `firebase`, `@react-native-async-storage/async-storage`, `expo-image-picker` y `@react-native-community/datetimepicker` a `allowed` · Vigente
Propuesta por el planner (2026-11-01) al escribir `specs/001-registro-conductor/plan.md`; aprobada por Anderson (2026-11-01, prompt #25, punto 2b).
Situación: `scripts/dependencies.json` no tiene `firebase` en ninguna lista; `@react-native-async-storage/async-storage`, `expo-image-picker` y `@react-native-community/datetimepicker` están en `proposed`, que solo da WARN (C15), no autoriza instalar sin una decisión Vigente.
Decisión propuesta: añadir `firebase` y mover esas tres dependencias de `proposed` a `allowed` en `scripts/dependencies.json`, para que T-15 (instalación conjunta) pueda ejecutarse. `@react-native-picker/picker` y `@react-native-firebase/*` quedan donde están (no se usan, D-52 y D-56 ya los descartan).
Alternativa: dejarlas en `proposed` y que el implementer instale bajo la "excepción nombrada" de la tarea, sin tocar `scripts/dependencies.json` (menos trazable; se descarta, el patrón ya usado en T-01/T-02 fue promover con decisión Vigente).

### D-66 — Declarar `@firebase/auth` directo en `package.json`, versión exacta · Vigente
Propuesta por el agente principal (2026-11-02, prompt #26, punto 3); aprobada por Anderson (2026-11-02, prompt #27, punto 1).
Situación: `src/services/firebase.js` importa `initializeAuth`, `getReactNativePersistence`, `onAuthStateChanged` y `signInAnonymously` de `@firebase/auth` directamente (no de `firebase/auth`, que no declara la condición `"react-native"` para esa subruta). `@firebase/auth` llegaba solo como dependencia transitiva de `firebase`, invisible para `check-constitution` (C15 solo mira `package.json`) y para cualquiera que lea ese archivo esperando ver todo lo que el código usa.
Decisión: `"@firebase/auth": "1.13.8"` (versión exacta, igual a la que `firebase@^13.1.0` ya fija internamente) añadido a `package.json` → `dependencies`, y promovido a `allowed` en `scripts/dependencies.json`. Verificado con `npm ls @firebase/auth`: una sola copia deduplicada, sin cambios de versión resuelta; `npm install` no instaló nada nuevo (ya estaba en `node_modules`); `check-constitution` y `npx expo-doctor` siguen limpios tras el cambio. Cambio solo de JavaScript/metadatos: no exige recompilar. Riesgo documentado: si en el futuro se actualiza `firebase` a una versión que fije una versión distinta de `@firebase/auth`, hay que actualizar también este pin a mano, o npm podría anidar una copia duplicada en vez de fallar; revisar en cada actualización de `firebase`.
Alternativa: no declararlo y, en su lugar, añadir una regla nueva a `check-constitution` que compare los imports reales de `src/` contra `package.json` para cualquier paquete con scope (`@algo/paquete`). Queda anotada como mejora de herramienta futura, no aplicada ahora.

### D-67 — Instrumentación TEMPORAL de diagnóstico en `cloudinary.js` · Retirada (2026-11-02)
Aprobada por Anderson (2026-11-02, prompt #28, punto 3).
Situación: el checkpoint 1 confirmó que la subida de fotos a Cloudinary falla tanto por cámara como por galería con el mensaje genérico "No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo." (el `catch` de `fetch()`, sin parámetro, descartaba el error real). Una prueba manual con `curl.exe` contra el mismo cloud name/preset del `.env` funcionó, así que la cuenta/preset/variables son válidos y la causa está en el código de la app o en cómo React Native/Android arma la petición.
Decisión: `src/services/cloudinary.js` añade `diagLog(step, details)` (función local, `console.warn` con el prefijo `[cloudinary diag]`), que registra SOLO: si `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`/`EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` llegan con valor (booleano, nunca el valor), el esquema de la URI local (`file`/`content`, nunca la ruta completa), que se está enviando, el tiempo transcurrido y el error real (`name`/`message`) si `fetch()` rechaza, el estado HTTP y el `error.message` de Cloudinary si la respuesta no es 2xx, y el éxito final. Nunca imprime valores de entorno, tokens, URLs completas con credenciales, `uid` ni contenido de documentos. La retira **T-19** en cuanto la subida funcione y Anderson lo confirme en el celular (checkpoint, no antes).
Alternativa: depurar sin instrumentación, solo por lectura de código (se descarta: el síntoma —ambas vías de foto fallan igual, con un `catch` que ya descartaba el error real— no se puede diagnosticar con certeza sin ver qué pasa en el dispositivo real).
Retirada (2026-11-02, prompt #29): la instrumentación cumplió su propósito (diagnóstico de D-68) y Anderson autorizó retirarla de inmediato, al mismo tiempo que se aplica la opción C, sin esperar la confirmación en el celular que esta decisión exigía originalmente. Si la opción C fallara, Anderson copia la salida de Metro para un nuevo diagnóstico (sin la instrumentación, el único dato disponible sería el mensaje de `CloudinaryUploadError` que ve en la UI más cualquier error nativo no capturado).

### D-68 — Causa raíz de "Unsupported FormDataPart implementation" y elección de la opción C (base64) para `cloudinary.js` · Vigente
Aprobada por Anderson (2026-11-02, prompt #29).
Situación: el checkpoint 1 (D-67) capturó en el log real del celular, para cámara y galería: `[cloudinary diag] fetch-rejected {"elapsedMs": 5, "errorMessage": "Unsupported FormDataPart implementation", "errorName": "Error"}`, con `env` (`hasCloudName`/`hasUploadPreset` ambos `true`) y `uri` (`scheme: file`) correctos y un rechazo en 5 ms (no es un timeout de red). Investigación (búsqueda web y lectura de un issue de la comunidad, appwrite/sdk-for-react-native#115, con el mismo mensaje exacto): Expo SDK 57 (`expo: ~57.0.31`, la versión real de este proyecto) instala su propio `fetch` global (`expo/src/winter/fetch`); su codificador de `multipart/form-data` (`convertFormData.ts`) solo acepta partes de tipo string, `Blob` o un objeto con `.bytes()`, y rechaza explícitamente la forma clásica de React Native `{ uri, type, name }` que usaba `cloudinary.js` para describir el archivo.
Decisión: se descarta la **opción A** (`EXPO_PUBLIC_USE_RN_FETCH=1`, revertir el `fetch` global al de React Native) porque cambiaría el `fetch` de TODA la app, incluidas las llamadas de Firebase Auth/Firestore (hoy funcionando), sin ninguna confirmación de la comunidad de que funcione en Android (el issue donde se propone no tiene comentarios). Se adopta la **opción C**: `PhotoField.js` pide a `expo-image-picker` el resultado con `base64: true` y `quality: 0.7`; `cloudinary.js` construye la parte `file` del `FormData` como el string `data:<mime>;base64,<datos>` (el `mime` sale de `assets[0].mimeType` del picker; si no viene, se usa `image/jpeg`), enviado junto con `upload_preset` como parte de texto, sin fijar `Content-Type` a mano. Se rechaza con un mensaje claro, antes de intentar la subida, un base64 que supere ~8 MB; el base64 vive solo en memoria durante la llamada (no se guarda en el contexto, en `AsyncStorage` ni en Firestore — solo la `secure_url` resultante — y nunca se imprime en consola). Sin dependencias nuevas y sin recompilación nativa (es un cambio solo de JavaScript). La **opción B** (`expo-file-system`, un objeto `File` con `.bytes()`) queda como plan de respaldo si C falla por tamaño o memoria del dispositivo; requeriría instalar una dependencia nueva (hoy ausente del proyecto, confirmado por `npm ls`/lectura de `package.json`) y, por ser un módulo nativo, probablemente una recompilación (`npx expo run:android`).
Alternativa: opción A (descartada por el riesgo sobre el `fetch` global de Firebase, sin confirmación en Android) u opción B (dependencia nueva + recompilación probable; se deja como respaldo, no como plan principal).

### D-69 — Instrumentación TEMPORAL de forma de carga en `driverRepository.js` · Retirada (2026-11-02)
Propuesta por el agente principal (2026-11-02, prompt #32, punto 3); aprobada por Anderson (2026-11-02, prompt #32, punto 3).
Situación: el checkpoint 2 (Paso 4) confirmó que `submitDriverRegistration` recibe de la consola de Firestore "Missing or insufficient permissions" (permission-denied) en el 100% de los intentos, con la colección `drivers` permanentemente vacía. El diagnóstico por lectura de código (comparación campo por campo de `firestore.rules` contra la carga real) ya identificó la hipótesis de causa raíz (`vehicle.year`/`vehicle.capacity` llegan como `string`, no `number`), pero Anderson pidió una confirmación independiente desde el propio dispositivo, sin usar Rules Playground ni Emulator Suite (no disponibles en su consola).
Decisión: `src/services/driverRepository.js` añade `shapeOf(obj)` (función local) y un `console.warn('[TEMP][D-69] submitDriverRegistration payload shape', …)` justo antes del `setDoc()`, que registra SOLO: la lista de claves de `personalData`, `vehicle` y `documents`, con el `typeof` de cada valor (y `string(len=N)` en vez del texto para los campos de tipo string). Nunca imprime valores, correos, URLs ni el `uid`. Se retira en cuanto Anderson confirme en el celular que la corrección del envío (conversión de `year`/`capacity` a número, pendiente de su aprobación) funciona; si la corrección se aplica en otra tarea, esa misma tarea retira esta instrumentación como parte de su cierre.
Alternativa: depurar solo con la hipótesis de lectura de código, sin instrumentación en el dispositivo (se descarta porque Anderson pidió explícitamente la confirmación de la forma real de la carga en el celular antes de tocar reglas o código de envío).
Retirada (2026-11-02, prompt #34, punto 2): el checkpoint 3 confirmó en el celular que el envío ya funciona con D-70 aplicado (documento creado en `drivers/{uid}` con `year`/`capacity` como `number`). `shapeOf(obj)` y el `console.warn('[TEMP][D-69] …')` se retiraron de `src/services/driverRepository.js` (cambio confirmado como una eliminación pura, sin tocar el resto del archivo); barrido del repositorio sin más marcas `TEMPORARY`/`[TEMP]` vigentes y `check-constitution` sin regresión (36 error(es)/0 advertencia(s) antes y después).

### D-70 — Corrección del `permission-denied`: conversión de `year`/`capacity` en código, no en reglas · Vigente
Propuesta por el agente principal (2026-11-02, prompt #33, punto 1); aprobada por Anderson (2026-11-02, prompt #33, punto 1).
Situación: D-69 confirmó en el celular que `vehicle.year`/`vehicle.capacity` llegan a `submitDriverRegistration` como `string`, mientras `firestore.rules`' `validVehicle(data)` exige `data.year is number && data.capacity is number`, causando el `permission-denied` en el 100% de los envíos. `isValidVehicleYear`/`isValidCapacity` (`src/utils/validators.js`) ya convierten internamente con `Number(value)` solo para su propio chequeo, sin mutar el valor almacenado.
Decisión: la corrección es en el CÓDIGO del cliente, no en `firestore.rules`. `RegistrationFormContext.js` construye, justo antes de llamar a `submitDriverRegistration` dentro de `submitRegistration`, un objeto `vehicle` separado con `year`/`capacity` convertidos a entero mediante las mismas reglas que ya usan `isValidVehicleYear`/`isValidCapacity` (nunca enviar `NaN`, `Infinity`, decimal ni vacío; si la conversión no produce un entero válido, se aborta el envío sin llamar a Firestore y sin instrumentación nueva de datos reales). El estado `vehicle` del contexto NO se muta (sigue en `string`, porque `VehicleScreen.js` lo usa en `TextField`s controlados y `isVehicleValid` lo revalida en cada render). `firestore.rules` no se toca: ni `validVehicle`, ni ninguna otra condición, ni la regla que impide la autoaprobación (`resource.data.accountStatus != 'approved'`).
Alternativa: relajar `firestore.rules` para aceptar `year`/`capacity` como string o con coerción (se descarta: Anderson prefiere mantener el tipado estricto de las reglas como contrato de datos, y corregir el origen del dato en el cliente).

### D-71 — Recorte de espacios al inicio/fin antes de validar y guardar · Vigente
Propuesta por el agente principal (2026-11-02, prompt #34, punto 3a); aprobada por Anderson (2026-11-02, prompt #34, punto 3a).
Situación: el checkpoint 3 confirmó que `drivers/{uid}.personalData.fullName` se guardó como «Anderson Londoño » (espacio final). Causa raíz: `FULL_NAME_PATTERN` en `src/utils/validators.js` incluye `\s` en su clase de caracteres, así que una cadena con espacio final o inicial sigue pasando `isValidFullName`. `isValidBrandOrModel` tiene una inconsistencia menor relacionada: compara `value.trim().length >= 1` (recortado) contra `value.length <= 30` (sin recortar).
Decisión: el recorte ocurre SOLO en la frontera de envío, dentro de `submitRegistration` (`RegistrationFormContext.js`), replicando el mismo patrón ya usado por D-70 para `year`/`capacity`: se construye un payload separado con `fullName`, `email`, `brand`, `model` y `mercadoPagoEmail` recortados (`String.prototype.trim()`) justo antes de llamar a `submitDriverRegistration`, sin mutar el estado vivo del formulario (los `TextField` controlados siguen mostrando el valor tal cual lo escribe el conductor, espacios intermedios incluidos, para no romper la escritura de nombres de varias palabras). NO se recorta en cada pulsación (`setPersonalDataField`/`setVehicleField`/`setDocumentsField`): a diferencia de `normalizePlate` (que sí corre en cada cambio porque una placa nunca debe llevar espacios internos), recortar en cada tecla impediría escribir un nombre con espacio intermedio pendiente de la siguiente palabra. Además, `isValidFullName` (`validators.js`) valida contra `value.trim()` en vez del valor crudo, e `isValidBrandOrModel` recorta también para el límite máximo de 30, sin cambiar la firma pública de ninguna de las dos funciones.
Alternativa: recortar en cada `onChange` de los campos de texto (se descarta: rompería la escritura de nombres compuestos, ver ejemplo "Anderson " + "Londoño" en el análisis previo).

### D-72 — Mensaje de confirmación de envío y formulario bloqueado mientras la cuenta está pendiente · Vigente
Propuesta por el agente principal (2026-11-02, prompt #34, punto 3b); aprobada por Anderson (2026-11-02, prompt #34, punto 3b).
Situación: el checkpoint 3 confirmó que tras un envío correcto no aparece ningún mensaje de éxito (los datos simplemente quedan visibles en las pestañas), y que mientras `accountStatus` es `pending` el formulario sigue pareciendo editable y «Enviar registro» no se deshabilita, pese a que un segundo envío no debería alentarse.
Decisión: (1) un texto nuevo en `labels.js` («Registro enviado. Tu cuenta está pendiente de aprobación.») se muestra en `DocumentsScreen.js` cuando `submitState === 'success'`, con un `testID` nuevo del contrato de `DESIGN.md` (`documents-submit-success`); (2) mientras `accountStatus === 'pending'` (leído de `useAppState()`, el mismo valor que ya resuelve `AppStateContext.js` vía `listenToDriverAccount`), las tres pantallas de pestañas muestran un aviso nuevo («Pendiente de aprobación», texto nuevo en `labels.js`) y el botón «Enviar registro» queda deshabilitado junto con la validación existente (`canSubmit = isRegistrationValid && !isSubmitting && accountStatus !== 'pending'`), sin `Alert` y sin dependencia nueva. Alcance mínimo explícito: esta decisión NO deshabilita cada campo individualmente (`TextField`/`SelectField`/`DateField`/`CheckboxField`/`PhotoField` no tienen hoy una prop de solo-lectura); el aviso visible más el botón de envío deshabilitado ya comunican que no se debe ni se puede reenviar, sin ampliar el cambio a los cinco componentes compartidos.
Alternativa: añadir una prop `editable`/`disabled` a los cinco componentes de campo y deshabilitar cada uno mientras `pending` (se descarta por ahora: amplía el alcance de T-31 de "medio" a tocar cinco componentes compartidos sin que F1 lo exija explícitamente; queda como mejora futura si Anderson lo pide tras ver el resultado mínimo).
Ampliada (2026-11-04, prompt #36, punto 2): la prueba en el celular confirmó que, tras enviar, los campos de las 3 pestañas seguían editables. Anderson pidió exactamente la alternativa descartada arriba; se adopta en D-74, que añade la prop a los cinco componentes compartidos.

### D-73 — Precarga de datos ya guardados en Firestore cuando la cuenta está pendiente · Vigente
Propuesta por el agente principal (2026-11-02, prompt #34, punto 3c); aprobada por Anderson (2026-11-02, prompt #34, punto 3c) con la condición explícita de que cupiera en una tarea pequeña, sin dependencias nuevas y sin cambiar reglas; el agente principal evaluó la condición (ver T-32) y confirma que se cumple.
Situación: el checkpoint 3 confirmó que al volver `accountStatus` a `pending` después de `approved`, la app regresa sola a las pestañas de registro, pero no precarga los datos (`personalData`/`vehicle`/`documents`) que ya existen en `drivers/{uid}`; el conductor vería el formulario vacío aunque ya hubiera enviado datos válidos.
Decisión: una función nueva de lectura única (no un listener persistente) en `driverRepository.js` (`getDriverRegistration(uid)`, usando `getDoc` de `firebase/firestore`, ya instalado — sin dependencia nueva) que devuelve `{ personalData, vehicle, documents } | null`. `RegistrationFormContext.js` la llama en un `useEffect` propio con `[driverId]` como dependencia, una sola vez al resolverse, sin sustituir ni modificar `listenToDriverAccount` (que sigue devolviendo solo `accountStatus`, para no afectar a `AppStateContext.js` ni a `DevAccountSwitch.js`) y sin volver a sobrescribir el formulario después de la carga inicial (para no pisar una edición en curso si el documento cambiara por otra vía mientras la pantalla está abierta). Conversión inversa a la del envío: `vehicle.year`/`vehicle.capacity` de `number` a `string` (para los `TextField` controlados); `personalData.birthDate` de cadena ISO a `Date` (inverso de `toIsoDateString`); `documents.commissionRate` del documento se ignora (no es parte de `INITIAL_DOCUMENTS`). No se cambian las reglas de Firestore: `allow read: if isOwner()` ya permite al dueño leer su documento completo.
Alternativa: ampliar `listenToDriverAccount` para que entregue el documento completo en vez de solo `accountStatus` (se descarta: obligaría a tocar `AppStateContext.js` y `DevAccountSwitch.js`, que solo esperan un string, ampliando el riesgo sin necesidad); o un `onSnapshot` persistente para la precarga (se descarta: un listener en vivo podría sobrescribir el formulario mientras el conductor edita, si el documento cambia por otra vía con la pantalla abierta).

### D-74 — Bloqueo de los cinco campos de formulario tras enviar o al precargar un registro existente (prop `disabled`) · Vigente
Propuesta por el agente principal (2026-11-04, prompt #36, punto 2); aprobada por Anderson (2026-11-04, prompt #36, punto 2) al pedir la corrección de T-31.
Situación: la prueba en el celular (2026-11-04) confirmó que, tras pulsar «Enviar registro», aparece el mensaje de confirmación (D-72) y el botón se deshabilita, pero los campos de las 3 pestañas siguen siendo editables; D-72 había identificado y descartado "por ahora" exactamente este caso como mejora futura condicionada a que Anderson la pidiera tras ver el resultado mínimo.
Decisión: se adopta la alternativa que D-72 dejó pendiente. `RegistrationFormContext.js` lee `accountStatus` de `useAppState()` (además de `driverId`, que ya leía) y deriva un único valor `isLocked = accountStatus === ACCOUNT_STATUS.PENDING || submitState === 'success'`, expuesto en el valor del contexto; ninguna pantalla calcula su propia bandera. Los cinco componentes compartidos (`TextField`, `SelectField`, `DateField`, `PhotoField`, `CheckboxField`) reciben una prop nueva `disabled` (por defecto `false`, sin romper otros usos): `TextField` la traduce a `editable={!disabled}` más `accessibilityState={{ disabled: !!disabled }}` explícito (RN no deriva ese estado de `editable` por sí solo); los otros cuatro la pasan como `disabled` al `Pressable` que abre su interacción (selector, selector de fecha, cámara/galería, casilla), que ya fusiona `disabled` dentro de `accessibilityState` y bloquea `onPress`. Los cinco aplican además un estilo atenuado nuevo con el token `opacity.disabled` (0.5, ver DESIGN.md «Opacidad»). Las tres pantallas de registro pasan `disabled={isLocked}` a cada instancia de campo, sin tocar el aviso «Pendiente de aprobación» ni el mensaje de confirmación (D-72), ni `canSubmit`/el botón «Enviar registro» (sin cambios). Por qué cubre los cuatro casos pedidos: (a) con `accountStatus !== 'pending'` y `submitState !== 'success'` (registro nuevo, documento inexistente) `isLocked` es `false` y todo sigue editable; (b) un envío exitoso pone `submitState` en `'success'`, bloqueando aunque `accountStatus` tarde en reflejar `pending`; (c) un envío fallido deja `submitState` en `'error'` y `accountStatus` sin cambiar, así que `isLocked` sigue `false` y el formulario queda editable para reintentar; (d) la precarga de un registro existente (D-73) ocurre con la cuenta ya en `pending`, así que `isLocked` es `true` desde que se resuelve `accountStatus`, sin necesidad de lógica propia de precarga. No se cambian las reglas de Firestore ni el payload de envío.
Alternativa: una bandera independiente por pantalla (p. ej. `isAccountPending` ya existente en cada una) en vez de un valor único en el contexto (se descarta: Anderson pidió explícitamente "un único valor derivado en el contexto... no una bandera por pantalla", y tres banderas locales podrían desincronizarse entre sí).

### D-75 — Limitación conocida: quitar una foto no borra la URL anterior en Cloudinary (foto huérfana) · Propuesta
Propuesta por el spec-author (2026-11-05, prompt #38, punto 1), a pedido de Anderson (punto 2, tercera viñeta del mismo prompt).
Situación: D-54 fija la subida de fotos a Cloudinary con un upload preset sin firma, en subida directa desde la app, sin paso por el backend. Un preset sin firma solo admite subir; borrar o reemplazar un recurso ya subido exige una llamada firmada con la API secret de Cloudinary, que D-54 y RNF-05 mantienen fuera de la app (solo vive en `backend/.env`, y esta spec no toca `backend/`, D-58). CA-001-31 (quitar una foto ya cargada) solo puede vaciar la URL guardada en el documento del conductor; no puede pedirle a Cloudinary que borre el archivo correspondiente.
Decisión: se acepta que, al quitar una foto ya subida (CA-001-31), la foto anterior queda huérfana en la cuenta de Cloudinary (sigue ocupando espacio y cuota, pero deja de ser accesible desde cualquier documento `drivers/{uid}` una vez quitada su URL); no se implementa borrado en Cloudinary en esta entrega.
Alternativa: mover el borrado a una ruta del backend Express, firmada con la API secret (fuera de la app), para que sí borre el recurso en Cloudinary al quitar una foto; se descarta por ahora porque amplía el alcance a `backend/` (fuera de alcance de esta spec, D-58) y por el tiempo disponible hasta la entrega.


### D-76 — Comisión como fracción 0.20 con una sola fuente en `src/config/pricing.js` · Vigente
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2a); aprobada por Anderson (2026-11-10, prompt #40, punto 2a).
Situación: hoy la comisión vive como `COMMISSION_RATE_PERCENT = 20` en `src/context/RegistrationFormContext.js`, y se envía como número entero dentro de `documents.commissionRate`. RF-21 manda que los parámetros de tarifa estén en `src/config/pricing.js`, y la spec 004 (función pura `calculateFare`) necesita la tasa como multiplicador. Con dos representaciones (20 y 0.20) se pueden cometer errores de un factor 100.
Decisión: la tasa se representa como fracción `0.20` en un único lugar, `src/config/pricing.js`. El registro (casilla de términos, RF-07) y `calculateFare` la leen de ahí, y la interfaz la muestra formateada como «20 %». Cada viaje guarda `commissionRate: 0.20` (RF-23). Los documentos de prueba de `drivers/{uid}` que hoy tienen `20` se reenvían desde la app tras el cambio. No hace falta migración ni cambio de reglas, porque las reglas solo exigen que `commissionRate` sea `number`.
Alternativa: mantener el entero 20 y dividir entre 100 en `calculateFare`. Se descarta porque dejaría dos convenciones y contradice la fuente única de RF-21.

### D-77 — Sin @react-native-firebase ni FCM: un solo SDK web de Firebase y tiempo real detrás del contrato · Vigente
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2b); aprobada por Anderson (2026-11-10, prompt #40, punto 2b).
Situación: RNF-06 (F1 §7) nombra FCM (`@react-native-firebase/messaging`) como servicio obligatorio. Adoptarlo exige un segundo SDK nativo de Firebase, archivos `google-services.json` y `GoogleService-Info.plist`, y otro build nativo, con solo dos días hasta la entrega. La app ya usa el SDK web `firebase` (D-52/53) con `onSnapshot`.
Decisión: no se adopta `@react-native-firebase/*` ni FCM. Se usa un solo SDK, el web `firebase` ya instalado. Las solicitudes entrantes y los cambios de estado llegan en tiempo real con `onSnapshot`, o por sondeo si la API del pasajero es HTTP, siempre detrás del contrato `passengerApi` (D-78). Las pantallas nunca saben qué mecanismo se usa.
**Desviación consciente de F1:** F1 tiene precedencia sobre `decisiones.md` y RNF-06 exige FCM. Esta decisión deja RNF-06 parcialmente sin cubrir (sin notificaciones push con la app cerrada), y se presenta en la sustentación como recorte por tiempo. Va a las preguntas pendientes de Anderson con la profesora.
Alternativa: integrar `@react-native-firebase/app` y `messaging` en el build único de la rebanada 0. Se descarta por el riesgo de romper el build (configuración nativa adicional) y porque la demo se hace con la app en primer plano.

### D-78 — Contrato de la API del pasajero con patrón puerto y adaptador · Vigente
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2c); aprobada por Anderson (2026-11-10, prompt #40, punto 2c).
Situación: la app consumirá una API que simula al pasajero, pero todavía no se conocen su forma ni su funcionamiento. Las pantallas de viaje (solicitud, viaje activo, resumen) deben construirse ya, sin rehacerlas cuando llegue la API real.
Decisión: las pantallas y los hooks hablan solo con un puerto (`src/services/passengerApi/index.js`) que expone las operaciones de `docs/arquitectura-api-pasajero.md`: `subscribeToRequests`, `acceptRequest`, `rejectRequest`, `reportTripStatus`, `cancelTrip` y `reportDriverLocation`, con modelos internos `TripRequest` y `Trip` y errores normalizados. Hay dos adaptadores, `mockPassengerApi.js` (activo hasta recibir la API) y `httpPassengerApi.js`, que se eligen con una constante. Solo `mappers.js` conoce la forma de la API real. El documento queda marcado «SUPUESTO hasta recibir la API real».
Alternativa: llamar a la API directamente desde las pantallas cuando llegue. Se descarta porque obligaría a rehacer las pantallas y no permite construir ni demostrar nada antes de conocer la API.

### D-79 — Mapa obligatorio con recorrido en tiempo real y un único build nativo hoy (rebanada 0) · Vigente
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2d); aprobada por Anderson (2026-11-10, prompt #40, punto 2d).
Situación: la profesora exige como obligatorio que la app muestre un mapa con la ruta por calles desde el conductor hasta el pasajero y el marcador del conductor avanzando en tiempo real. RF-08, RF-12 y RNF-06 ya mencionaban mapa y geolocalización. Cada dependencia nativa nueva exige un build nativo, que hace Anderson y tarda.
Decisión: el mapa con recorrido en tiempo real pasa a ser obligatorio y forma parte de la ruta mínima viable. Todas las dependencias nativas necesarias (`@maplibre/maplibre-react-native` y `expo-location` desde la modificación de D-82 del 2026-11-10; ver `docs/arquitectura-mapa-recorrido.md`) entran en un ÚNICO build nativo que Anderson hace HOY (rebanada 0), con un spike de criterio de éxito claro: el mapa se ve y la ubicación llega. Después del build no se añaden dependencias nativas en los dos días. Si el build falla, se activa el Plan B del documento de arquitectura del mapa.
Alternativa: construir primero la lógica y hacer el build al final. Se descarta porque un fallo nativo descubierto el último día no tendría margen de corrección.

### D-80 — `firestore.rules` sigue local e ignorado por Git; las reglas se publican en la consola de Firebase · Vigente
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2e); aprobada por Anderson (2026-11-10, prompt #40, punto 2e).
Situación: T-27 creó `firestore.rules` en la raíz y los documentos (DP-12 del plan de 001, backlog, progress) dicen que «vive en el repo». En la práctica el archivo está en `.gitignore`: es una copia local y las reglas vigentes se publican a mano en la consola de Firebase. Quien clone el repo no lo encontrará.
Decisión: `firestore.rules` sigue local e ignorado por Git. Las reglas efectivas son las publicadas en la consola de Firebase. La política se describe en palabras en `docs/seguridad.md` (solo el dueño lee y crea su documento; `accountStatus` debe ser `pending` al crear; sin edición cuando la cuenta está aprobada; sin borrado), y el README enlaza a ese documento. Se corrigen las menciones «en el repo» de `docs/progress.md`, `docs/backlog.md` y `specs/001-registro-conductor/plan.md`. Al ampliar las reglas (colección `trips`, ubicación), Anderson actualiza la consola y `docs/seguridad.md`.
Alternativa: versionar `firestore.rules`. Se descarta por decisión de Anderson; el texto de las reglas no contiene secretos, pero se prefiere que la fuente de verdad sea la consola.

### D-81 — Ningún secreto se versiona; el mapa no necesita clave · Vigente
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2f); aprobada por Anderson (2026-11-10, prompt #40, punto 2f). **Actualizada por Anderson (2026-11-10, prompt #41, punto 1b):** al descartar Google Maps (D-82) ya no hay clave de mapa.
Situación: la versión original de esta decisión preveía una clave de Google Maps para Android leída por un `app.config.js`. Con MapLibre y las teselas de OpenFreeMap (D-82) el mapa no necesita clave ni registro, y OSRM tampoco.
Decisión: se mantiene la regla general: cualquier secreto va solo en `.env` (local, ignorado) y `.env.example` lleva solo nombres, nunca valores. Ningún agente lee ni escribe valores de `.env`. El mapa no añade variables de entorno: las URL del estilo de OpenFreeMap y del servidor OSRM son públicas y viven como constantes en `src/config/`. No se crea `app.config.js`: basta con `app.json`, porque ningún plugin necesita leer `process.env`. Si en el futuro un proveedor exige una clave secreta, se intermedia con el backend Express (RNF-05).
Alternativa: conservar la variable y el `app.config.js` previstos por si se vuelve a Google. Se descarta porque añade configuración sin uso.

### D-82 — Mapa open source: `@maplibre/maplibre-react-native` + OpenFreeMap y `expo-location` en la lista permitida · Vigente MODIFICADA
Propuesta por el agente principal (2026-11-10, prompt #40, punto 2) con `react-native-maps`; **modificada y aprobada por Anderson (2026-11-10, prompt #41, punto 1a y 1c)**.
Situación: CLAUDE.md prohíbe instalar dependencias fuera de `scripts/dependencies.json`. La propuesta original movía `react-native-maps` a «allowed», pero Google Maps exige una cuenta de facturación y una clave dentro del APK, y Anderson no puede o no quiere asumirlo.
Decisión: se **descarta** `react-native-maps` (se retira también de «proposed»). Se permiten **solo** `@maplibre/maplibre-react-native` (11.x; peer deps verificadas: react ≥ 19.1, react-native ≥ 0.80, expo ≥ 54) y `expo-location`, instaladas con `npx expo install` (resultado: ^11.5.1 y ~57.0.23). El mapa usa teselas de OpenFreeMap, con estilo `https://tiles.openfreemap.org/styles/liberty` y `positron` como alternativa, sin clave ni registro. La posición viene de `expo-location` y las rutas por calles de OSRM, como ya definía el plan. Atribución visible: «© OpenMapTiles», «Data from OpenStreetMap» (el botón de MapLibre no se oculta) y la de OSRM/OSM. Se conserva el Plan B de `docs/arquitectura-mapa-recorrido.md` §9 con sus criterios de activación, adaptados a «no cargan las teselas» en lugar de «falla la clave». `@react-native-community/geolocation` queda en «proposed» y no se usa, porque `expo-location` es el módulo recomendado por Expo; es una desviación menor del nombre que da RNF-06.
En el mismo prompt Anderson **aprueba el plan de entrega** (`docs/plan-entrega-final.md`) para las rebanadas 0, A y B.
Alternativa: `react-native-maps` con Google (propuesta original). Se descarta por la facturación y la clave en el APK. `expo-maps` se descarta por estar en alfa y usar Google Maps en Android.

### D-83 — Botón «Pasajero a bordo», cuenta regresiva en `color.primary` y cierre completo del viaje · Vigente
Propuesta por el agente principal (2026-11-10, prompt #44, puntos 3, 4 y 5); aprobada por Anderson (2026-11-10, prompt #44).
Situación: el verifier rechazó T-44 porque al completar un viaje el estado final nunca llegaba a `driverLocations` y no se podía aceptar otro viaje: solo la publicación con regulador escribía `tripStatus`, y la fuente de ubicación se detenía antes; el mock conservaba su viaje activo y `onTrip` seguía en `true`. Además, el botón «Iniciar viaje» no describía lo que hace el conductor y la cuenta regresiva en rojo pequeña se leía como alarma, no como información.
Decisión:
1. **Estado final y reposo.** Al completar, cancelar, salir por falla o apagar Disponible a mitad de viaje, el controlador escribe UNA vez en `driverLocations/{uid}` el `tripStatus` final (`completed` o `cancelled`), fuera del regulador, con `PUBLISH_STATUS_MAX_ATTEMPTS` reintentos y un tiempo máximo por intento, sin bloquear la interfaz. Al volver a Inicio, `endTrip` escribe el valor de reposo `DRIVER_LOCATION_IDLE_STATUS` (`'idle'`), libera el viaje en el adaptador (`releaseTrip`) y pone `onTrip` en `false` siempre, de modo que el conductor puede aceptar otro viaje.
2. **`finish()` nunca se bloquea.** Cada intento de reportar tiene tiempo máximo (`REPORT_ATTEMPT_TIMEOUT_MS`) y la operación completa también (`FINISH_TIMEOUT_MS`). Toda falla muestra un texto con «Reintentar» y una salida segura «Salir del viaje» con confirmación; si el pasajero ya cerró el viaje (`INVALID_STATE` sobre `completed`), no hay reintento y solo queda la salida. La pantalla del viaje nunca queda sin salida.
3. **Textos y énfasis.** El botón del punto de recogida se llama «Pasajero a bordo» (describe el hecho, no una orden) y el final «Finalizar viaje». La cuenta regresiva de la solicitud va fija sobre los botones, en `type.display` y `color.primary`, con una barra que se vacía; en los últimos 10 s el bloque se rellena con `color.primary` y texto `onPrimary`. **Nunca rojo**: el rojo (`color.danger`) queda reservado a errores y a cancelar. «Tu ganancia» usa el mismo tratamiento (display, primary) en la tarjeta y en el resumen. Un botón deshabilitado muestra en texto por qué («Llega al punto de recogida para continuar»). Solo existe un texto para el vencimiento: «La solicitud venció»; al vencer se rechaza la solicitud en silencio.
4. **Umbral de llegada:** 25 m (`ARRIVAL_THRESHOLD_M`), como se implementó en T-44; se corrige el documento de arquitectura que decía 30 m.
Alternativa: escribir el estado final desde la pantalla al navegar. Se descarta porque el desmontaje no garantiza que la promesa termine y porque la lógica del viaje debe vivir en el controlador, que es verificable sin React.

### D-84 — Diagnóstico `[DIAG-LOC]` de las solicitudes que dejan de llegar tras un viaje (instrumentación RETIRADA) · Vigente
Propuesta por el agente principal y ordenada por Anderson (2026-11-10, prompt #45, punto 2).
Situación: en el checkpoint 3, tras terminar o cancelar un viaje, Inicio muestra «Obteniendo tu ubicación…», el botón de simular solicitud responde `not_subscribed`, apagar y encender Disponible no recupera el servicio y solo reiniciar la app lo hace. Un script fuera del proyecto (mini runtime de React, reloj y GPS falsos, el código real de `src/`) ejecutó el ciclo completo —aceptar, finalizar, cancelar a mitad, apagar y encender— y NO reprodujo el defecto (17 comprobaciones en PASS), así que la causa no se prueba solo por lectura.
Decisión: `src/utils/diagLoc.js` (`diagLoc(step, details)`, `console.warn` con prefijo `[DIAG-LOC]`) y llamadas en `AvailabilityContext` (isAvailable, onTrip, watching, estado de ubicación, si hay posición), `TripContext` (inicio y fin de viaje), `useDriverLocation` (efecto, inicio, primera posición, error, limpieza), `useTripRequests` (suscripción y baja) y el mock (suscripción, baja con indicador de dueño, resultado de simular). Registra SOLO booleanos, estados y nombres de paso; nunca coordenadas, `uid` ni datos personales. Cada bloque lleva la marca `AI-assisted: #45`.
Alternativa: corregir a ciegas con endurecimiento (reinicio de la fuente al alternar Disponible). Se descarta como primer paso porque sin la causa no se sabe si la corrección repara el síntoma; se aplicará de todos modos como refuerzo una vez conocida.
Causa raíz (prompt #45, a partir del log real de Anderson): tras `completed` no aparece ningún `[DIAG-LOC] trip end`, así que `endTrip` nunca corrió y `onTrip` quedó en `true` (`watching` en `false`, sin suscripción: de ahí `not_subscribed` y que alternar Disponible no sirviera). Las pantallas del viaje volvían con `navigation.navigate('Home')`; en React Navigation 7 `navigate` ya no retrocede a la pantalla existente, sino que empuja un segundo `Home` (el aviso de nombres duplicados `Main > Home > Home`), y `TripSummary`/`TripActive` seguían montadas, por lo que su desmontaje —donde se llama a `endTrip`— nunca ocurría. Corrección: `navigation.popTo('Home')` en las tres pantallas. Menor de T-44: el reintento de `pump` se detiene si cambió la cabeza de la cola (el temporizador `later` ya se libera en `dispose`).
Causa raíz definitiva (confirmada por Anderson en el celular, 2026-11-10, prompt #46): en React Navigation 7 `navigate('Home')` ya no retrocede, empuja un segundo `Home`; las pantallas del viaje quedaban montadas y `endTrip`, que se ejecuta al desmontarlas, no corría. Corrección: `navigation.popTo('Home')` en `TripActiveScreen`, `TripRequestScreen` y `TripSummaryScreen`, más que el bucle de reintentos de `pump` en `tripController` se detenga cuando la cabeza de la cola cambió. Validado por declaración de Anderson (fuente simulada, SHOW_DEV_TOOLS=true): finalizar, cancelar a mitad y apagar y encender Disponible, repetido varias veces, y llega otra solicitud sola cada vez.
Lección: el diagnóstico estático y el script que simulaba el desmontaje de la pantalla de resumen NO reprodujeron el defecto, porque suponían que el desmontaje ocurría; lo encontró el log del dispositivo. Ante un defecto que solo aparece en el celular, instrumentar y leer el log real antes de endurecer a ciegas.
Retirada (2026-11-10, prompt #46): se eliminó `src/utils/diagLoc.js` y todas las llamadas `diagLoc(...)` de `AvailabilityContext`, `TripContext`, `useDriverLocation`, `useTripRequests` y `mockPassengerApi`; `grep` de `diagLoc|DIAG-LOC` en `src/` no encuentra nada. Sin cambio de comportamiento. La decisión deja de ser provisional.
`navigate()` revisados en todo el proyecto: `AppDrawerContent` y `AppTabBar` (`CommonActions.navigate` entre rutas del drawer/tab, sin pila que duplicar), `HomeScreen` hacia `TripRequest` (Home es la raíz de la pila y las pantallas del viaje ahora salen con `popTo`) y hacia `MapTest` (pantalla del drawer, solo en desarrollo); `MapTestScreen` usa `goBack()`; los `replace` de `TripRequest` → `TripActive` → `TripSummary` no apilan; no hay `BackHandler` ni `beforeRemove`. Sin otros casos de riesgo real: no se cambió nada más.

### D-85 — Solicitud entrante como tarjeta inferior fuera de Inicio · Vigente
Propuesta por el agente principal y aprobada por Anderson (2026-11-10, prompt #47).
Situación: con Disponible activo y el conductor en Perfil, Historial u otra pantalla del drawer, `HomeScreen` abre `TripRequest` aunque Inicio no esté enfocado: la pantalla lo saca de donde estaba o la solicitud queda oculta detrás. Hallazgo SDD: RF-10 define solo el contenido de la solicitud, RF-11 el temporizador (30 s, prompt #43) y T-43 la tarjeta a pantalla completa; ningún RF/CA de F1 ni del plan define cómo se presenta fuera de Inicio. No estaba contemplado y no entra en conflicto: en Inicio sigue a pantalla completa y esto lo extiende (T-54).
Decisión: una función pura `decideRequestPresentation(currentRoute, onTrip, accountStatus, hasRequest)` → `'fullscreen'|'card'|'none'` decide la presentación. Un componente superpuesto (`IncomingRequestCard`), montado una vez en `MainDrawer` dentro de los providers, muestra la tarjeta inferior fuera de Inicio, con aceptar, rechazar, «Ver detalle» y «✕» (oculta sin rechazar). El contexto existente es la fuente única de la solicitud pendiente y la cuenta regresiva se calcula desde `expiresAt`. Al vencer, la tarjeta se retira con un aviso y no se navega. Las salidas de `TripRequest` usan `goBack` si hay pantalla previa y `popTo('Home')` si no. Sin tarjeta durante un viaje, en Startup/registro ni con cuenta no aprobada, y una solicitud a la vez.
Justificación: no interrumpir al conductor sin que pierda la solicitud; una sola fuente de verdad; navegación sin pantallas duplicadas (D-84, React Navigation 7); sin dependencias nuevas ni cambios nativos.
Alternativas descartadas: notificación local (requiere dependencia o código nativo); pantalla completa siempre (saca al conductor de su pantalla); bottom-sheet de librería (dependencia nueva).
Consecuencias y riesgos: el efecto de `HomeScreen` debe ceñirse a Inicio enfocado para no duplicar la presentación; el vencimiento no navega, por lo que `TripRequest` abierta desde otra pantalla debe volver al origen; la tarjeta no debe tapar la barra de pestañas (verificar en el celular).
Actualización (prompt #48, 2026-11-10) — pantalla oculta: el drawer mantiene montada `TripRequest` al cambiar de pestaña; si la tarjeta resuelve la solicitud mientras tanto, una `TripRequest` oculta rechazaba de nuevo y a los 2,5 s ejecutaba `leave()` (sacaba `TripActive` y cambiaba de pestaña). Regla: **una pantalla oculta nunca actúa sobre una solicitud**. `TripRequest` condiciona a `useIsFocused` el temporizador, el rechazo silencioso, `leave()`, la navegación a `TripActive` y el rechazo al desmontar; las salidas ocurridas sin foco se difieren hasta recuperarlo; una solicitud ya liberada no se rechaza otra vez. La tarjeta acepta con `StackActions.replace` sobre la ruta `TripRequest` abierta (si la hay) y `TripStack` usa `getId` por `requestId`, así no quedan pantallas duplicadas ni una `TripRequest` vieja reutilizada. Auditoría de otros puntos: el efecto de `HomeScreen` ya se ciñe a Inicio enfocado y `TripActive` no reacciona a la solicitud; no hay otro lugar donde una pantalla oculta actúe sobre una solicitud resuelta. Límites conocidos (no se corrigen): iOS ignora `accessibilityLiveRegion` en el aviso de vencimiento; la tarjeta puede tapar el pie de otras pantallas (mitigado: va encima con margen y el contenido se desplaza).
Ajustes de diseño de la tarjeta: botones y «✕» fuera del scroll (siempre visibles con texto grande) y barra de cuenta regresiva con borde de tokens.
Actualización (prompt #49, 2026-11-10) — simplificación aprobada por Anderson («apruebo esta simplificación»): los dos rechazos (#47 y #48) tienen la misma causa, más de una pantalla de solicitud viva, y se eliminan por construcción. (a) Se quita «Ver detalle» y toda la lógica de volver a la pestaña de origen (`originRoute`, `findOpenRequestRoute`, textos y accesibilidad); la tarjeta conserva «Aceptar», «Rechazar» y «✕». Los pasos del checklist que mencionaban «Ver detalle» (puntos 1 a 9 del prompt #48) se validaron en el celular antes de quitarlo y quedan como evidencia histórica. (b) Solo puede existir UNA `TripRequest` (identificador fijo con `getId`) y solo la abre `HomeScreen` cuando la solicitud llega con Inicio enfocado. (c) Mientras haya una `TripRequest` abierta (incluso oculta tras otra pestaña) la tarjeta no se muestra (`decideRequestPresentation` devuelve `'none'` con `requestScreenOpen`), y el deslizamiento del drawer se bloquea (`swipeEnabled`) mientras esté abierta. (d) Si la solicitud se resuelve por cualquier vía con la `TripRequest` oculta, esta se cierra sola dentro de su propia pila, sin cambiar de pestaña, sin aviso y sin rechazar. (e) Se conserva: `TripRequest` solo actúa con foco, botones fijos fuera del scroll y barra de progreso con tokens. Interpretación de (b): la solicitud que llega con otra pestaña en foco se muestra solo como tarjeta; no se promueve a pantalla completa. Consecuencia aceptada: una solicitud pendiente con la `TripRequest` oculta espera a que Inicio recupere el foco.

### D-86 — Viajes guardados en la subcolección `drivers/{uid}/trips/{tripId}` · Vigente
Propuesta por el agente principal y aprobada por Anderson (2026-11-11, prompt #50).
Decisión: cada viaje cerrado se guarda en `drivers/{uid}/trips/{tripId}`, con el id del viaje como id del documento. Guardar es idempotente: se lee antes (`getDoc`) y solo se escribe si no existe, porque la regla no permite actualizar. Solo el dueño lee; solo el dueño con la cuenta aprobada crea; no hay edición ni borrado. La tasa de comisión no se guarda por documento: vive en `pricing.js` y el monto de comisión sí se guarda (ajuste a RF-23).
Justificación: la regla de lectura es trivial (el id de la ruta es el `uid`), la consulta no necesita índice compuesto y un viaje no puede duplicarse por reintentos.
Alternativas descartadas: colección raíz `trips` con `driverId` (la regla de lectura requiere una consulta filtrada y más superficie); permitir `update` (abre la puerta a editar montos).
Consecuencias: sin publicar la regla, guardar falla con permiso denegado y la app muestra el error con salida segura. La regla no está publicada: la pega Anderson (`docs/seguridad.md`).

### D-87 — No se guardan coordenadas · Vigente
Propuesta por el agente principal y aprobada por Anderson (2026-11-11, prompt #50).
Decisión: el documento del viaje guarda solo texto de origen y destino, distancia, duración, montos y fechas. Ni la regla ni el mapeo admiten campos de ubicación.
Justificación: privacidad (los recorridos son datos sensibles) y menor superficie. Consecuencia: el historial no dibuja la ruta (RF-27 parcial).

### D-88 — Montos en COP enteros · Vigente
Propuesta por el agente principal y aprobada por Anderson (2026-11-11, prompt #50).
Decisión: `fare`, `commission` y `driverEarnings` son enteros (RF-22, múltiplos de 100) y la regla exige `commission + driverEarnings == fare`. Los viajes cancelados guardan 0. Las propinas no existen en el modelo: los totales de Ganancias no las incluyen.
Justificación: sin errores de coma flotante y coherencia entre lo mostrado y lo guardado.

### D-89 — El cobro es SIMULADO · Vigente
Propuesta por el agente principal y aprobada por Anderson (2026-11-11, prompt #50).
Decisión: no hay pasarela real (P-03). «Confirmar cobro» solo guarda el viaje; el método de pago (`transfer` para tarjeta, `cash`, `none` para cancelados) se registra pero no se cobra nada. Esto se dice en la pantalla de resumen, en Configuración y en el README.
Justificación: honestidad con la persona usuaria y alcance del taller.

### D-90 — Rediseño visual de toda la app · Vigente
Propuesta por el agente principal; encargada por Anderson (2026-11-11, prompt #51).
Decisión: rediseño solo de estilos, layout y presentación, por áreas A–G, con tokens ampliados sin renombrar, componentes compartidos (Card, Chip, DataRow), sombras suaves en reposo, esqueletos de carga y movimiento sutil que respeta reducir movimiento. Sin cambios de lógica, textos, testID ni etiquetas de accesibilidad. Reemplaza en DESIGN.md la prohibición de sombras en reposo y de separadores con línea.
Justificación: coherencia, jerarquía y legibilidad; la revisión visual final es en el celular.

### D-91 — Íconos Ionicons y fuente Inter · Vigente
Propuesta por el agente principal; encargada por Anderson (2026-11-11, prompt #52).
Decisión: se permiten solo tres paquetes para presentación: `@expo/vector-icons` (solo Ionicons, único componente `src/components/Icon.js`, siempre decorativo y junto a un texto), `@expo-google-fonts/inter` (pesos 400/500/600/700 como familias en los tokens de tipografía) y `expo-font`. La fuente se carga con `useFonts` en `App.js` con espera máxima de 3 s; si falla o tarda, la app sigue con la fuente del sistema y ningún estilo depende de ella. Es el único cambio no estético en el archivo raíz.
Justificación: identidad visual y legibilidad con riesgo acotado.
Plan de reversa: quitar los usos de `Icon` (volver a íconos dibujados con View), quitar `useInterReady` de `App.js` y los tres paquetes de `package.json`; las familias en los tokens son inofensivas sin la fuente (cae al sistema). Los tres paquetes quedaron en `scripts/dependencies.json` (lista `allowed`) por aprobación de Anderson en el prompt #53 (D-91); check-constitution volvió a 13 errores. Pendiente para Anderson: el build nativo.

### D-92 — Auditoría de diseño solo estática del rediseño · Vigente
Propuesta por el agente principal; encargada por Anderson (2026-11-11, prompt #53).
Decisión: las áreas B a E del rediseño (Inicio, viaje, ganancias/historial/perfil/configuración, registro) y el pase del menú lateral y las pestañas de registro se auditan solo en lo estático, por lectura de código y contraste calculado. El campo Diseño de las tareas con interfaz que estaba en «Pendiente» pasa a «Auditado en lo estático; pendiente de revisión visual en el celular». No equivale a «Aprobado».
Justificación: no hay dispositivo en esta sesión; la puerta visual la sigue cerrando Anderson en el celular.
Plan de reversa: devolver el campo a «Pendiente»; el informe queda en docs/diseno/auditoria-estatica-53.md.

### D-93 — Firebase Auth con correo y contraseña reemplaza el acceso anónimo · Vigente (por encargo, prompt #54; Anderson ratifica)
Situación: D-53 usa sesión anónima; reinstalar pierde la cuenta y RF-29 (F1 §3) pide cierre de sesión.
Decisión: proveedor correo/contraseña de Firebase Auth; `uid` sigue siendo `driverId`; D-53 queda Reemplazada. Requiere que Anderson habilite el proveedor en la consola (paso manual).
Alternativa: mantener el acceso anónimo (descartada: sin cuentas recuperables ni cierre de sesión significativo).
Impacto: CA-001-22 y CA-001-23 de la spec 001, la política 1 de `docs/seguridad.md` y la nota de Configuración quedan desactualizadas (no las edita esta spec).

### D-94 — «Varias sesiones» = varias cuentas en el mismo teléfono, una activa a la vez · Vigente (por encargo, prompt #54; Anderson ratifica)
Situación: el SDK JS de Firebase Auth mantiene un solo usuario activo por instancia.
Decisión: se entiende «varias sesiones» como varias cuentas de conductor que se turnan en el mismo dispositivo; «Cambiar de cuenta» = `resetSession` + volver a Iniciar sesión; no se guardan credenciales de otras cuentas. Se documenta en README y arquitectura.
Alternativa: varias instancias de Auth o tokens guardados para cambio instantáneo (descartada: complejidad y riesgo con credenciales).

### D-95 — Sin verificación de correo (riesgo aceptado) · Vigente (por encargo, prompt #54; Anderson ratifica)
Situación: verificar el correo añade pantallas, estados y dependencia del buzón; hay una entrega con fecha límite.
Decisión: no se exige verificación; cualquiera puede crear una cuenta con un correo ajeno. El riesgo se mitiga porque la cuenta no opera hasta la aprobación manual (RF-04). Se documenta en README y `docs/seguridad.md`.
Alternativa: exigir verificación antes del registro (descartada por alcance).

### D-96 — Mensajes de autenticación que no revelan si un correo existe · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: (a) iniciar sesión: credenciales erróneas, correo sin cuenta y credencial inválida → «Correo o contraseña incorrectos»; (b) mensajes específicos solo para red caída, demasiados intentos y, al crear, correo ya en uso (esta última revela la existencia por diseño, es lo que se pidió); (c) recuperar contraseña: respuesta neutra siempre que el envío no falle por red o límite; (d) cualquier otro código → mensaje genérico de «no se pudo, inténtalo de nuevo»; (e) el código crudo de Firebase nunca se muestra. La configuración «protección contra enumeración de correos» de la consola de Firebase cambia qué códigos llegan; el mapeo cubre ambas variantes.
Alternativa: mostrar el mensaje exacto de Firebase (descartada: filtra información).

### D-97 — Cuentas anónimas heredadas: cerrar sesión, sin migración · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: al detectar un usuario anónimo se cierra su sesión y se muestra Iniciar sesión; los datos de `drivers/{uid-anónimo}` quedan inaccesibles (como al reinstalar, D-53). Solo hay datos de prueba.
Alternativa: vincular el usuario anónimo a correo/contraseña (descartada: alcance y datos solo de prueba).

### D-98 — Un solo procedimiento de reinicio de sesión (`resetSession`) · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: seis pasos en el orden del requisito RF-37, con bloqueo si hay viaje en curso, espera máxima de 5 s para publicar el estado final y `signOut` siempre al final. Por qué ese orden: la publicación y las suscripciones necesitan la sesión viva (las reglas exigen autenticación); si `signOut` fuera antes, los listeners fallarían con permiso denegado y la publicación final se perdería.
Alternativa: limpiar por separado en cada pantalla (descartada: se olvidan pasos y se filtran datos entre cuentas).

### D-99 — Reglas exigen proveedor `password` y se publican después de validar la app · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: `drivers`, `driverLocations` y `trips` exigen `request.auth != null` y proveedor `password`; orden: (1) validar la app en el celular con las reglas actuales, (2) publicar reglas, (3) repetir la prueba. El proveedor anónimo se deja habilitado hasta terminar las pruebas de denegación (CA-002-35) y luego Anderson decide si lo apaga.
Alternativa: publicar primero (descartada: un fallo de la app se confundiría con un fallo de reglas).

### D-100 — Marcador de auto: glifo teñido con el color registrado, insignia blanca, tokens y función pura · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: glifo Ionicons de auto vía `Icon.js`, tintado con el token del color del vehículo, dentro de una insignia circular `color.surface` con borde `color.border`; un token por valor de color; `otro`/desconocido → `color.primary`; el contraste de la silueta contra la insignia debe ser de al menos 3:1 para los nueve valores (los colores claros —blanco, plata, amarillo— usan el tono visible más cercano que cumpla, y los hex de los tokens y sus razones se calculan y documentan en la guía de estilo al implementar). Sin dependencias ni consultas nuevas.
Alternativa: imagen PNG del auto por color (descartada: activos nuevos); punto con color (descartada: no comunica «auto»).
Pregunta abierta para Anderson: cómo se representa «Blanco» (hoy propuesto: gris muy oscuro suficiente para 3:1, por lo que Blanco y Plata podrían parecerse); alternativa: cambiar el fondo de la insignia para los claros.

### D-101 — La cuenta regresiva anuncia solo umbrales (10, 5 y 0 s) en `polite` · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: la región viva se conserva; el texto anunciado solo cambia al llegar a esos tres valores. El tiempo restante sigue legible como texto en pantalla.
Alternativa: quitar la región viva (descartada: se pierde el aviso de vencimiento).

### D-102 — Correo de la cuenta en Configuración; «Cambiar de cuenta» usa el mismo procedimiento · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: el correo de la cuenta (enmascarado) se muestra en Configuración, sección «Cuenta», junto a las dos acciones (no en Perfil, para no mezclarlo con el correo personal y el de Mercado Pago). «Cerrar sesión» y «Cambiar de cuenta» ejecutan `resetSession`; solo cambian el texto de la confirmación y el aviso inicial de Iniciar sesión.
Alternativa: mostrarlo en Perfil (posible; lo decide Anderson).

### D-103 — Reglas de los campos de la cuenta · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: correo recortado (sin espacios al inicio y al fin), con el mismo patrón `algo@dominio.algo` de D-62; contraseña de mínimo 8 caracteres, sin máximo propio, sin recortar ni normalizar, con confirmación; el correo de la cuenta es independiente del correo personal del registro (no se precarga ni se sincroniza).
Alternativa: precargar el correo del registro con el de la cuenta (descartada: cambia la spec 001 sin necesidad).

### D-104 — Cerrar sesión en el registro y espera de guardado de viaje · Vigente (por encargo, prompt #54; Anderson ratifica)
Decisión: (1) un componente único `AccountActions` ofrece la sección Cuenta de Configuración (correo enmascarado, «Cerrar sesión», «Cambiar de cuenta») y, en las tres pestañas de registro y el aviso de cuenta pendiente, solo «Cerrar sesión» como botón secundario con confirmación en pantalla que avisa que lo no enviado se pierde; ambos usan el mismo `resetSession`. (2) Antes de `signOut`, `resetSession` espera hasta 8 s (`TRIP_SAVE_DRAIN_TIMEOUT_MS`) a que termine el guardado de viaje en curso (cola `services/trip/saveQueue.js`); si no termina devuelve `trip-save-pending` sin cerrar sesión, y la pantalla ofrece «Reintentar» o «Cerrar sesión de todos modos» (con confirmación; opción `skipTripSaveWait`). Un viaje en curso sigue bloqueando siempre.
Alternativa: cerrar sesión sin esperar el guardado (descartada: puede perder el último viaje).

### D-105 — Botón «Cerrar sesión» en la pantalla de error de estado de cuenta · Vigente (Anderson, 2026-11-11)
Decisión: la variante `error` de `StartupScreen` (ruta ERROR del gate) añade un botón secundario «Cerrar sesión» reutilizando `AccountActions` con `variant="registration"` (confirmación en pantalla, sin `Alert`, mismo `useSessionReset`; testIDs `auth-*`). No aparece en la variante de carga. Evita que el conductor quede sin salida cuando falla la lectura del estado de cuenta.
Alternativa: solo «Reintentar» (descartada: sin salida si el error persiste).

### D-106 — Guardado fallido del resumen del viaje: pendiente de la rebanada de pagos · Vigente (Anderson, 2026-11-11; enlazada a la rebanada de pagos)
Decisión: el guardado fallido del resumen del viaje (`SAVE.ERROR`) que no entra en la cola de guardado se deja PENDIENTE y enlazado a la rebanada de pagos, que redefine cuándo se guarda el viaje (se creará al completarlo, con estado de pago pendiente). No se implementa ahora (T-72 no lo toca).
Alternativa: encolar ya el guardado fallido (descartada: se rediseña con pagos).

### D-107 — Pago de prueba real con Mercado Pago Checkout Pro reemplaza el cobro simulado · Vigente (por encargo, prompt #55; Anderson ratifica)
Situación: D-89 declaraba el cobro SIMULADO y D-58 dejaba el backend sin cambios; el enunciado (§4) pide preferencia con llave secreta en el backend, confirmación por webhook o sincronización y escucha en tiempo real.
Decisión: Checkout Pro en modo de prueba (credenciales y tarjetas de prueba, nunca dinero real) con backend Express y firebase-admin. D-89 queda Reemplazada y D-58 queda Modificada (el backend deja de estar intacto solo para esta rebanada). Tarjeta: solo el backend escribe el resultado; efectivo: el conductor, con la regla estrecha de D-108. La pantalla y el README dicen que es pago de prueba. `firebase-admin` se añade a la lista `backend` de `scripts/dependencies.json` (aprobado por el prompt #55). El valor `transfer` de `paymentMethod` pasa a `mercadopago` (datos antiguos de prueba, sin migración). CA-002-39 vale solo para R1 a R4.
Alternativa: mantener el cobro simulado (descartada: incumple §4 del enunciado).

### D-108 — Modelo de estados y escritores del viaje; regla estrecha de efectivo · Vigente (por encargo, prompt #55; Anderson ratifica)
Decisión: el viaje nace al completar con `status: 'completed'`, `paymentStatus: 'pending'` y `paymentMethod` `'mercadopago'` o `'cash'`; `paymentStatus` toma `approved`, `pending` o `rejected`; `status` toma `completed`, `paid` o `cancelled`. Escritores: tarjeta, solo el backend; efectivo, el conductor dueño aprobado, únicamente `paymentMethod`, `paymentStatus` y `status`, de `pending`/`completed` a `paid`, y solo si ya era `cash`. Sin otras ediciones ni borrados. Por qué: el conductor no debe poder declararse pagado un viaje de tarjeta.
Alternativa: que la app marque todo (descartada: falsificable).
Impacto: reglas nuevas en `docs/seguridad.md`; Anderson las publica tras validar (D-99).

### D-109 — El backend toma el monto del documento del viaje; límite aceptado · Vigente (por encargo, prompt #55; Anderson ratifica)
Situación: el enunciado dice enviar `tripId` y monto al backend. El monto sale de una tarifa calculada por la app y el pasajero es simulado.
Decisión: el backend lee el monto del documento del viaje del `uid` autenticado y exige monto positivo y menor que un tope. Límite aceptado y documentado: un conductor modificado podría escribir un monto distinto al crear el viaje; no se resuelve sin un servidor de tarifas y un pasajero real, fuera de alcance.
Alternativa: recalcular la tarifa en el backend (descartada: requeriría ruta y reglas de tarifa en servidor).

### D-110 — Ruta planeada simplificada guardada en el viaje · Vigente (por encargo, prompt #55; Anderson ratifica)
Situación: D-87 prohíbe coordenadas y por eso el historial no dibuja la ruta; el enunciado pide ruta dibujada en el detalle.
Decisión: se guarda una ruta planeada (no el recorrido real) de máximo 40 puntos con 4 decimales (unos 11 m), solo en `route` del documento del viaje; no se guarda posición real alguna. D-87 queda Modificada solo en ese punto; origen y destino siguen como texto.
Alternativa: no guardar nada (descartada: incumple §6); recorrido real (descartada: privacidad).
Impacto: la regla de viajes admite `route` con validación de tamaño y tipo.

### D-111 — Política de viajes antiguos: «Cobro simulado» · Propuesta (Anderson aprueba; R11, RF-54)
Situación: los viajes guardados antes de los pagos reales no tienen `paymentMethod` ni `paymentStatus` y se mostraban como «Pago sin estado».
Decisión: un viaje sin método Y sin estado de pago se presenta como «Cobro simulado» (chip neutro). Las métricas de Ganancias los incluyen (por `status` completed o paid); `computeBalance` los excluye, porque no hay efectivo cobrado que descontar; el filtro de método los muestra solo en «Todos», no en Tarjeta ni Efectivo.
Alternativa: contarlos como efectivo o tarjeta (descartada: inventa un método de pago); ocultarlos (descartada: pierde ganancias históricas).
Impacto: `src/services/trip/legacyTrip.js`, `earnings`, `balance` e `historyQuery`; pruebas en `scripts/tests/`. CA-002-94, CA-002-95 y CA-002-106.

### D-112 — Regla única del panel de cobro · Propuesta (Anderson aprueba; R11, RF-56)
Situación: «Cobro y resumen» podía mostrar varios mensajes a la vez (guardado, servicio, estado del pago) y mensajes del servicio en viajes en efectivo.
Decisión: una función pura (`chargePanel`) devuelve una sola salida (un mensaje, tono, chip y botones) con la prioridad error de guardado > error del servicio > informativo > éxito. El error del servicio solo se muestra tras una acción del usuario; el efectivo nunca llama al backend de pagos; el tono de éxito solo con pago aprobado o efectivo cobrado. La pantalla pinta solo lo que la función devuelve.
Alternativa: mensajes independientes por fuente (descartada: se contradicen).
Impacto: `src/services/trip/chargePanel.js` y `TripSummaryScreen`. CA-002-96 a CA-002-100.

### D-113 — Clasificación de errores del cliente de pagos en ocho clases · Propuesta (Anderson aprueba; R11, RF-57)
Decisión: `paymentsClient` clasifica cada fallo en `notConfigured`, `offline`, `timeout`, `sessionExpired` (401 o 403), `notFound` (404), `serverError` (5xx), `invalidResponse` o `providerError`. Cada clase tiene un mensaje propio en `labels.js` que nunca incluye la URL ni el token.
Alternativa: un solo mensaje genérico de error (descartada: no ayuda a corregir la causa).
Impacto: `src/services/trip/paymentsClient.js`, `paymentActions` y `labels.js`. CA-002-101 y CA-002-102.

### D-114 — Mapa de solo lectura en el detalle del viaje · Propuesta (Anderson aprueba; R9, RF-49)
Decisión: el detalle de viaje usa `TripMap` con `interactive=false`: dibuja la ruta simplificada guardada (D-110) sin gestos de mapa, para no competir con el desplazamiento de la pantalla. Sin `route`, muestra «Ruta no disponible» en lugar del mapa. Sin propina ni calificación en los datos: «Sin propina» y se omite la calificación.
Alternativa: mapa interactivo (descartada: atrapa el desplazamiento y no aporta al historial).
Impacto: `TripMap`, `TripDetailScreen` y `tripDetailView`. CA-002-106.

### D-115 — Texto ampliado del pago rechazado · Propuesta (pendiente de confirmación de spec-author y Anderson)
Situación: CA-002-98 fija el mensaje del pago rechazado; en pantalla se muestra con una indicación para actuar.
Decisión: el mensaje del estado rechazado se amplía a «Pago rechazado. Toca “Reintentar pago”.», lo que amplía el texto de CA-002-98. Hasta que se confirme, la spec no cambia.
Alternativa: dejar solo «Pago rechazado.» (descartada por ahora: no dice qué hacer).
Impacto: `labels.js` y `chargePanel`; si Anderson lo aprueba, P5 sobre CA-002-98.

### D-116 — Stripe Checkout Sessions alojado en el navegador como segunda pasarela de prueba · Vigente (ratificada por Anderson 2026-11-12; R12, RF-61)
Situación: Mercado Pago no permite a Anderson crear cuentas de prueba, así que el cobro con tarjeta (D-107) no se puede validar de punta a punta.
Decisión: se añade Stripe Checkout Sessions (página de pago alojada por Stripe, abierta en el navegador del teléfono) en modo de prueba. La Checkout Session crea internamente el PaymentIntent; el backend no lo crea por separado. Mercado Pago queda sin cambios.
Alternativa: PaymentSheet de Stripe (descartada: requiere un módulo nativo, dependencia nueva y una build nativa nueva, que hace el humano y no hay tiempo); PaymentIntent propio con formulario en la app (descartada: la app tocaría datos de tarjeta).
Consecuencia: el flujo de la app sigue siendo «abrir URL, volver, verificar», igual que con Mercado Pago. Impacto: `backend/` (módulo de Stripe y rutas), `paymentsClient`, `chargePanel`. CA-002-109 a CA-002-129.

### D-117 — Pasarelas como proveedores intercambiables tras una interfaz · Vigente (ratificada por Anderson 2026-11-12; R12, RF-61, RF-62)
Situación: con dos pasarelas, el código no debe duplicar la lógica de viaje, estado y seguridad.
Decisión: cada pasarela implementa la misma interfaz (crear cobro, consultar estado, validar que el pago corresponde al viaje). El backend informa cuáles están configuradas con `GET /payments/providers` (solo booleanos, exige ID token) y la app muestra un botón por cada una configurada. `POST /payments/checkout` y `/payments/sync` reciben el proveedor y delegan.
Alternativa: rutas y pantallas separadas por pasarela (descartada: duplica defensas y pruebas); elegir la pasarela por variable de entorno única (descartada: no permite tener las dos para comparar).
Impacto: `backend/src/routes/payments.js`, módulos por proveedor, `paymentsClient`. CA-002-109, CA-002-110, CA-002-122.

### D-118 — El pasajero decide «tarjeta» o «efectivo»; el conductor elige la pasarela al cobrar · Vigente (ratificada por Anderson 2026-11-12; R12, RF-61)
Situación: D-108 fija los escritores del viaje y el método `mercadopago` se escribe al crear el viaje. Con dos pasarelas, la pasarela real se conoce al cobrar.
Decisión: el pasajero simulado sigue decidiendo solo «tarjeta» o «efectivo». Al crear el viaje con tarjeta, la app escribe el valor que ya escribe hoy (`mercadopago`; las reglas de Firestore no cambian al crear). El conductor elige la pasarela al pulsar cobrar; el backend escribe `paymentMethod` como `mercadopago` o `stripe` con firebase-admin, solo mientras el pago no esté aprobado; con pago aprobado el método no cambia nunca. Efectivo nunca llama al backend de pagos.
Alternativa: que la app escriba `stripe` (descartada: obliga a republicar reglas antes de validar y deja al cliente decidir un campo de pago); método genérico `card` más campo `provider` (descartada: rompe Historial, saldo y reglas ya validados).
Impacto: `docs/seguridad.md` y `firestore.rules` local admiten `stripe`; publicar reglas solo cuando el backend cambie el método. CA-002-110, CA-002-114, CA-002-129.

### D-119 — Solo credenciales de prueba de Stripe: el backend rechaza claves live · Vigente (ratificada por Anderson 2026-11-12; R12, RNF-20)
Situación: el taller es de prueba; una clave de producción cargada por error cobraría dinero real.
Decisión: si la clave secreta empieza por `sk_live_` o `rk_live_`, el backend la trata como no configurada (Stripe queda desactivada, con aviso sin imprimir la clave) y `npm run doctor` lo reporta como ERROR. Solo se aceptan `sk_test_` y `rk_test_`.
Alternativa: aceptar cualquier clave (descartada: riesgo de cobro real); detener el arranque (descartada: Mercado Pago debe seguir funcionando).
Impacto: configuración del backend y doctor. CA-002-120, CA-002-121.

### D-120 — Webhook de Stripe opcional; camino principal «Verificar pago» · Vigente (ratificada por Anderson 2026-11-12; R12, RF-61)
Situación: el webhook exige URL pública y registrar un endpoint en Stripe, lo que Anderson puede no tener a tiempo.
Decisión: el camino principal es «Verificar pago» y la verificación automática al volver a primer plano, que reconsultan la Checkout Session a Stripe. El webhook `/webhooks/stripe` existe, pero es opcional: sin `STRIPE_WEBHOOK_SECRET` responde error genérico y no aplica nada. Si está, verifica la firma y reconsulta la sesión; nunca confía en el cuerpo.
Alternativa: webhook obligatorio (descartada: bloquea la validación sin URL pública); sin webhook (descartada: pierde la confirmación si la app no vuelve a primer plano).
Impacto: `backend/src/routes/webhooks.js`. CA-002-115, CA-002-116.

### D-121 — Convención del método de pago: «card» del contrato se guarda como 'mercadopago' («tarjeta, pasarela por definir») · Vigente (Anderson, orden #59, 2026-11-12; R12, RF-62)
Situación: la solicitud simulada llegaba con 'mercadopago', así que la app nombraba una pasarela antes de elegirla y mostraba el botón de Mercado Pago aunque solo Stripe estuviera configurada.
Decisión: (1) el contrato del pasajero simulado emite 'card' o 'cash' (mappers.js es el único que conoce la forma de la API; lee 'mercadopago' heredado como 'card'). (2) Al crear el registro del viaje, 'card' se guarda como 'mercadopago' (valor que aceptan las reglas publicadas) y significa «tarjeta, pasarela por definir». (3) Una pasarela está elegida solo cuando el viaje tiene `paymentId`; entonces el backend cambia `paymentMethod` al proveedor elegido (firebase-admin). (4) Los botones de cobro salen solo de GET /payments/providers y el proveedor enviado a POST /payments/checkout es el del botón pulsado. (5) Las etiquetas dicen «Tarjeta» mientras no haya pasarela elegida (función pura `paymentGateway.js`).
Alternativa: guardar 'card' (descartada: las reglas publicadas no lo aceptan y no se republican); derivar el botón de trip.paymentMethod (descartada: causó el hallazgo).
Consecuencia: filtros del Historial, saldo, ganancias y recibos usan el valor guardado y no cambian. Impacto: `src/services/passengerApi/*`, `tripRecord`, `paymentGateway`, `chargePanel`, backend `/payments/checkout`, `firestore.rules` local (create solo 'cash' y 'mercadopago').

### D-122 — Perfil editable acotado: solo nombre, celular, color del vehículo y correo de cobros · Vigente (Anderson, orden #60, 2026-11-12; RF-66)
Situación: el Perfil era de solo lectura; el conductor necesita corregir datos de contacto y el color de su auto sin pasar por soporte.
Decisión: son EDITABLES nombre, celular, color del vehículo y correo de cobros. Son SOLO LECTURA placa, marca y modelo, año, categoría, estado de la cuenta y los documentos, con el texto visible «Para cambiar estos datos contacta a soporte.». Motivo: placa, categoría y documentos fueron la base de la aprobación manual y la categoría afecta la tarifa; cambiarlos exigiría una nueva aprobación (fuera de alcance).
Alternativa: editar todo (descartada: obliga a re-aprobar); no editar nada (descartada: contacto desactualizado).
Impacto: `ProfileScreen`, `driverRepository.updateDriverProfile` (solo cuatro rutas con punto), regla de Firestore de actualización acotada en `docs/seguridad.md` (la publica Anderson a mano, D-80). RF-63 a RF-66.

### D-123 — «Correo de cobros» neutro: solo cambian etiqueta y ayuda, no el campo de Firestore · Vigente (Anderson, orden #60, 2026-11-12; RF-66)
Situación: el campo se llama «Correo de Mercado Pago» pero el cobro real con Stripe no lo usa; el nombre promete algo que no ocurre.
Decisión: etiqueta «Correo de cobros» y ayuda «Correo asociado a tu cuenta de la pasarela de pagos. Solo informativo en esta versión.» en registro, Perfil y Configuración. NO se renombra `documents.mercadoPagoEmail` (sin migración ni cambio de reglas). Sin «Stripe» en la etiqueta. Los textos visibles de «Mercado Pago» que hablan de la pasarela real no se tocan; solo los que hablan del correo.
Alternativa: renombrar el campo (descartada: migración y reglas); nombrar «Stripe» (descartada: el correo no se usa en su checkout).
Impacto: `labels.js`, `DocumentsScreen`, Perfil. RF-66.

### D-124 — Propina y calificación SIMULADAS al terminar el viaje; comisión solo sobre la tarifa · Vigente (Anderson, orden a70c, 2026-11-12; RF-39, RF-40)
Situación: el enunciado pide propina y calificación en el detalle y en Ganancias, pero el pasajero es simulado y no entrega ninguna.
Decisión: la API simulada genera al terminar el viaje una propina (≈40 % de los viajes, múltiplos de 500 entre 500 y 5.000 COP) y una calificación entera de 1 a 5 (5 al 45 %, 4 al 35 %, 3 al 14 %, 1 o 2 al 6 %). `commission = fare × tasa` (solo sobre la tarifa); `driverEarnings = fare − commission + tip`; por tanto `commission + driverEarnings == fare + tip`. Tarjeta: el backend cobra `fare + tip` leído del documento del viaje (nunca del cuerpo de la petición). Efectivo: el conductor recibe tarifa y propina y el saldo solo descuenta la comisión. Los viajes antiguos sin calificación muestran «Sin calificación». Campos nuevos `tip` y `rating` en el documento (`TRIP_DOC_KEYS`); la regla `validTrip()` cambia y la publica Anderson a mano (D-80).
Alternativa: comisión también sobre la propina (descartada: la propina es del conductor); no simular (descartada: el detalle y Ganancias quedarían vacíos).
Impacto: `simulatedFeedback.js`, `mockPassengerApi`, `mappers`, `tripRecord`, `tripDetailView`, `earnings`, `backend/src/chargeAmount.js` y proveedores de cobro, `TripSummaryScreen`, `TripDetailScreen`, `docs/seguridad.md` (BLOQUEANTE antes de probar en el celular). Implementada, pendiente de dispositivo.

### D-125 — Direcciones reales del pasajero con geocodificación inversa de Nominatim · Vigente (Anderson, orden a70c, 2026-11-12; RF-24)
Situación: las solicitudes simuladas traen coordenadas pero no direcciones legibles.
Decisión: resolver origen y destino con Nominatim (OpenStreetMap) en segundo plano: máximo 1 petición por segundo (1100 ms entre llamadas), `User-Agent` «UberCloneConductor-ProyectoDeClase/1.0», caché por coordenadas a 4 decimales (solo aciertos), tiempo límite de 4 s, sin bloquear la pantalla. Mientras llega: «Buscando dirección…»; si falla: «Calle cercana (simulada)». Se guarda en `originLabel` y `destinationLabel` (sin cambiar `TRIP_DOC_KEYS` ni las reglas). Privacidad: solo salen coordenadas de prueba, ningún dato personal.
Alternativa: Google Geocoding (descartada: D-82, sin claves de Google); direcciones inventadas fijas (descartada: no reflejan el mapa).
Impacto: `src/config/geocoding.js`, `src/services/geocoding/`, `useRequestAddresses`, `useTripRequests`, `TripRequestScreen`, `TripActiveScreen`, `TripSummaryScreen`, `TripContext`. Implementada, pendiente de dispositivo.

Nota: D-93 reemplaza a D-53 (acceso anónimo). Origen: spec specs/002-funcionalidad-final/spec.md §3.


## Decisiones — notificaciones FCM (D-126…D-138)

Origen: `specs/003-notificaciones-fcm/spec.md` §3 e informe `docs/fcm/investigacion.md`. Anderson resolvió D-126…D-136 el 2026-11-16 (prompt #63, Fase 1b). D-137 y D-138 son nuevas y quedan «Propuesta» hasta que Anderson apruebe la spec.

### D-126 — Cliente FCM con RN Firebase y plan B expo-notifications · Vigente (Anderson, 2026-11-16; R-113; spike S1/STOP-1 validado en dispositivo el 2026-11-16; plan B descartado)
Decisión: `@react-native-firebase/app` + `messaging` 27.1.1; spike S1 de 3 h máximo como puerta. Pasó a «Vigente» al confirmarse el spike (STOP-1: compiló, hubo token y permiso, y una notificación de la consola llegó en segundo plano y abrió la app; el heads-up de la solicitud sigue pendiente, DP-72, S3). Si hubiera fallado, plan B `expo-notifications` detrás de la misma interfaz `src/services/notifications/`. Reemplaza a D-77 y una cláusula de D-52 (declarado en el plan, G2). Compatible con D-24 (archivos de Firebase fuera de Git).
Alternativa: omitir FCM (descartada: el PDF §7 lo marca obligatorio).

### D-127 — Disparo desde endpoint autenticado del backend · Aprobada, salvo objeción de Anderson (2026-11-16)
Decisión: el backend envía solo a los dispositivos del llamante, con el middleware `createGuard` existente.

### D-128 — Tokens por dispositivo, solo escritos por backend · Aprobada, salvo objeción de Anderson (2026-11-16; ajustada por D-131)
Decisión: ningún cliente lee ni escribe tokens; los escribe solo el Admin SDK. Dónde se guardan lo fija D-131 (colección raíz `pushTokens`).

### D-129 — Canal «solicitudes» · Aprobada, salvo objeción de Anderson (2026-11-16)
Decisión: `messaging_android_notification_channel_id` en `firebase.json`; si S1 no deja importancia alta, añadir `expo-notifications` solo para crear el canal.

### D-130 — «Disponible» en segundo plano · Aprobada con matiz (Anderson, 2026-11-16)
Decisión: FCM no depende de ubicación ni de `isAvailable`. Matiz: esto aplica al endpoint de **prueba**, porque no es una solicitud real. En un sistema real solo recibiría el aviso un conductor disponible. La app no publica disponibilidad ni ubicación en segundo plano (límite documentado); al tocar el aviso el conductor decide en pantalla.
Alternativa: poner «Disponible» automáticamente (descartada: solo el conductor decide su disponibilidad).

### D-131 — Titularidad del token con colección raíz `pushTokens` · Aprobada con cambio de diseño (Anderson, 2026-11-16)
Decisión: sin consultas `collectionGroup` (exigen un índice creado a mano). Colección raíz `pushTokens/{hash}` con `{uid, token, platform, updatedAt}`, id = SHA-256 del token, escrita solo por el backend; el cliente no la lee ni la escribe. Las reglas publicadas la deniegan por defecto: **no hacen falta reglas nuevas ni índices manuales**. Para listar los dispositivos de un uid se usa `where('uid', '==', uid)` sobre `pushTokens` (índice de un solo campo, automático); `drivers/{uid}/fcmTokens` se elimina. Al registrar un token, el backend lo reasigna al uid actual en una **transacción** (se quita del uid anterior).
Alternativa: `collectionGroup` por `token` (descartada: índice manual).

### D-132 — Copia de `calculateFare` en el backend · RECHAZADA (Anderson, 2026-11-16; R-084, R-067)
Decisión: el PDF exige UNA sola función `calculateFare`. No se copia al backend ni hay prueba de paridad. El payload y el cuerpo de la notificación NO llevan tarifa: llevan categoría, distancia, duración, coordenadas, `requestId` y `expiresAt`. La app calcula la tarifa al abrir con la función única de `src/utils/fare.js`.

### D-133 — Intención pendiente en la rama MAIN · Aprobada, salvo objeción de Anderson (2026-11-16; se liga al uid, ver hallazgo 2)
Decisión: intención de navegación en memoria, consumida en la rama MAIN (donde existen los proveedores), no en la raíz. Guarda el uid destino y se descarta si el uid actual no coincide, en `resetSession` y al iniciar sesión otro conductor.

### D-134 — Baja de token en resetSession y clave propia · Aprobada, salvo objeción de Anderson (2026-11-16; corregida por el hallazgo 1)
Decisión: `notificationsEnabled` y el token local se borran JUNTO con la baja del token, DESPUÉS de la espera de guardados (`waitForTripSaveQueue`) y justo antes de `signOut`, con tope corto de 3 s que nunca bloquea el cierre de sesión; si la espera falla y la sesión continúa, nada de eso cambia. `clearOwnStorage` deja de ser el lugar de esa clave.

### D-135 — Dedupe por requestId · Aprobada, salvo objeción de Anderson (2026-11-16)
Decisión: conjunto de ids vistos en la compuerta de solicitud pendiente (la compuerta no deduplica por id).

### D-136 — Mantener el temporizador en 30 s · RECHAZADA (Anderson, 2026-11-16)
Sustituida por D-137.

### D-137 — Temporizador de decisión de 15 s y separación validez/decisión · Aprobada (Anderson, 2026-11-16; Anderson ordenó el diseño el 2026-11-16; R-041; G-06)
Situación: `MOCK_REQUEST_TTL_MS = 30000` (`src/config/passengerApi.js:17`) y la D-85 (decisiones.md:520, «temporizador (30 s, prompt #43)») contradicen `docs/requisitos.md:25` (RF-11: 15 s, en 0 se rechaza) y el PDF.
Decisión: el temporizador de decisión pasa a **15 s**, ratificado aquí, y se corrige la cita de D-85. Se separan dos tiempos: (a) **validez de la notificación**: `ttl` y `expiresAt` ≈ 90 s desde el envío; (b) **ventana de decisión**: 15 s que empiezan cuando la solicitud se MUESTRA en pantalla, venga del mock o de la notificación. Si al tocar la notificación ya pasó `expiresAt`, se muestra «La solicitud expiró» sin posibilidad de aceptar.
Impacto: spec, plan y criterios; en Fase 2 una tarea cambia el origen del conteo (de `expiresAt` de la solicitud a la hora de mostrado).

### D-138 — Dirección no viaja en la notificación · Aprobada (Anderson, 2026-11-16; hallazgo 4; D-125)
Decisión: la notificación y el payload llevan solo coordenadas; la app resuelve la dirección al abrir con el geocodificador existente (D-125) y su fallback.

### D-139 — Canal Android «solicitudes» mediante plugin de configuración local · Vigente (Anderson, 2026-11-16; prompt S3+S4; DP-72)
Decisión: NO se usa `expo-notifications` (su servicio de Firebase entra en conflicto con el de RN Firebase). Un plugin local `plugins/withRequestsChannel.js` (sin dependencias nuevas; importa de `expo/config-plugins`) usa `withMainApplication` para insertar en `MainApplication.onCreate` la creación idempotente del canal `solicitudes` (`IMPORTANCE_HIGH`, nombre «Solicitudes de viaje», descripción corta, sonido y vibración por defecto). Es tolerante a que el canal ya exista (`createNotificationChannel` es idempotente y el plugin no duplica el bloque si ya está) y falla en el prebuild con un mensaje claro si no encuentra el punto de inserción; nunca en silencio. El backend ya envía `channelId: 'solicitudes'`; `firebase.json` conserva el canal por defecto de RN Firebase.
Plan B: si el plugin no logra aplicar el cambio, se avisa a Anderson con el diagnóstico (no se edita `android/` a mano).
Estado en dispositivo: **No verificado en dispositivo** (aviso emergente, STOP-2).

### D-140 — Reglas del cliente para solicitudes por notificación · Vigente (Anderson, 2026-11-16; prompt S3+S4)
Decisión: (1) El temporizador de decisión es de 15 s y empieza cuando la solicitud se MUESTRA, tanto del mock como de una notificación (D-137; la constante vive solo en `src/config/passengerApi.js`). La contradicción entre `decisiones.md` D-85 («30 s», prompt #43) y `docs/requisitos.md` RF-11 («15 s») se resuelve a favor de RF-11 por D-137; la cita de D-85 queda superada. (2) La validez de la notificación es `expiresAt` (≈ 90 s); si ya pasó al abrir se muestra «La solicitud expiró» y no se puede aceptar. (3) La dirección se resuelve en la app con el geocodificador (D-125) y su fallback. (4) La tarifa se calcula con `calculateFare` (R-084), nunca viaja en el payload. (5) Elegibilidad: solo se atiende con sesión, cuenta aprobada, sin viaje en curso y `targetUid` igual al uid actual; en otro caso se ignora sin mensajes.

### D-141 — Controlador de registro de token y baja al cerrar sesión con restauración · Vigente (Anderson, 2026-11-16; prompt S4; T-184, T-185, T-186; D-131, D-134)
Decisión: `registration.js` es un controlador puro (adaptador, backend, preferencia y `pendingIntent` inyectados) enlazado en `NotificationsBridge` (rama MAIN, por uid y cuenta aprobada). En `resetSession` el paso `unregisterNotifications` borra primero lo local (intención y `notificationsEnabled`) y luego da de baja en el backend y borra el token local en paralelo, con tope de 3 s; así un vencimiento no deja la preferencia atrás. Si `signOut` falla tras ese paso, `restoreNotifications` repone la preferencia y vuelve a registrar (mejor esfuerzo). Con `trip-in-progress` o `trip-save-pending` el paso no corre y nada cambia.
Impacto: `resetSession.js` (claves nuevas en `steps`, resultados sin cambio), `buildSessionResetDeps.js` (solo pasa las dependencias nuevas; el plan decía «sin cambios» en T-184).

### D-142 — Orden de la oferta por notificación: compuerta primero, adopción después · Vigente (Anderson, 2026-11-16; prompt S4; hallazgo del verifier de S3; D-135)
Decisión: `offerPushThroughGate` (`src/services/trip/pushOffer.js`) consulta la compuerta antes de adoptar la solicitud en el mock; un duplicado nunca toca el mock y, si el adaptador rechaza una solicitud ya ofrecida, se libera el hueco de la compuerta.

### D-143 — Números del `data` de la notificación: solo decimales estrictos · Vigente (Anderson, 2026-11-16; prompt S4; hallazgo del verifier de S3)
Decisión: `pushRequest.js` acepta únicamente `^[+-]?\d+(\.\d+)?$`; `0x10`, `1e1`, espacios y puntos sueltos se rechazan en vez de corregirse.

### D-144 — Sección mínima de Notificaciones en Configuración adelantada a S4 · Vigente (Anderson, 2026-11-16; prompt S4)
Decisión: para poder probar STOP-2 se entrega ya una sección funcional mínima en Configuración (interruptor con explicación previa, mensaje y enlace a ajustes si el permiso está denegado o bloqueado, botón de prueba con retraso de 0 a 60 s, estados en línea, sin `Alert`). El diseño final y la auditoría siguen en T-187/T-189; el campo Diseño no se toca.
Impacto: `src/components/settings/NotificationsSection.js`, `SettingsScreen.js`, `labels.notifications`, `testRequest.js`.
