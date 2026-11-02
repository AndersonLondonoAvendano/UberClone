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

### D-23 — Pull Requests con un solo integrante · PARADA (P-09)
Situación: F1 §9 pide PRs revisados y el equipo es de una persona.
Decisión pendiente: cómo cumplir "revisados".
Alternativa: PR autorrevisado con checklist, o revisión externa.

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

