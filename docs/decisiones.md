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

