# Auditoría de diseño — spec 003 notificaciones FCM, S5 (T-187…T-189)

Fecha: 2026-11-16. Ronda 1 de 3. Auditor: design-auditor.
Método: lectura de código. No existen capturas (`docs/fcm/capturas/` no existe) y el arnés web no muestra Firebase, permisos ni mapas. Todo lo visual queda **pendiente de dispositivo** (capa E). Contrastes marcados "estimado" se calcularon a mano con los tokens; no son medición sobre captura.
Reglas de diseño aplicadas: DESIGN.md, guía de estilo del proyecto (manda sobre cualquier estética genérica) y los principios de la skill de diseño frontend (decisiones deliberadas, jerarquía tipográfica, sin decoración, copy claro en voz activa, errores que explican cómo resolver; base accesible y foco visible). Ninguna regla de la skill choca con el proyecto.
Alcance: solo presentación. No se toca la lógica de D-133…D-146.

Regla del auditor: máximo tres problemas por ronda. Por eso hay tres hallazgos de esta ronda (F-01…F-03) y el resto va como observaciones para la ronda 2 (O-01…O-08), sin numerarlas como bloqueos.

## Capa A / C: lo que el código ya cumple

- Tokens: ninguno de los tres archivos usa colores, espaciados ni radios sueltos (todo sale de `src/theme/tokens.js`).
- Sin emojis. Iconos con `Icon` en la tarjeta y la pantalla; en el paso del retraso se usan los glifos de texto "−" y "+" (ver O-06).
- Temporizador: la etiqueta `accessibilityLabel` del contador se actualiza cada segundo pero NO es región viva; la región viva `announcer` solo anuncia vía `countdownAnnouncement` (10, 5 y 0 s). Correcto en la tarjeta (`IncomingRequestCard.js:340-354`) y en la pantalla (`TripRequestScreen.js:361-377`).
- Cada estado de la sección es en línea, sin `Alert`.

## Hallazgos de esta ronda

### F-01 — severidad ALTA — El interruptor de Notificaciones no se ve como interruptor
Archivo: `src/components/settings/NotificationsSection.js:115-130`.
Captura: no hay; lo reporta Anderson en el celular ("Avisos de solicitudes" + chip "Activadas/Desactivadas", sin interruptor visible). Coincide con el código: el `Pressable role="switch"` contiene solo `Text` + `Chip`.
Regla incumplida: affordance (un control debe parecer un control); consistencia con `AvailabilitySwitch.js:62-75`, que sí dibuja pista y pulgar (`styles.track`/`styles.thumb`, 56 × 32 px) y mantiene el chip con el texto del estado; DESIGN.md: el estado nunca solo por color ni solo por chip.
Corrección pedida:
1. Dibujar una pista con pulgar a la derecha de la fila, con los mismos valores de `AvailabilitySwitch` (`THUMB_SIZE = space[5]`, `TRACK_WIDTH = space[6] + space[5]`, `TRACK_PADDING = space[1]`, `radius.full`; encendido `color.success`, apagado `color.border`; pulgar `color.surface`). Preferible extraer ese trozo a un componente compartido `SwitchTrack` en `src/components/` y que lo usen ambos (sin cambiar el comportamiento de `AvailabilitySwitch`). Alternativa válida: el `Switch` nativo de React Native con `trackColor={{ false: color.border, true: color.success }}`, `thumbColor={color.surface}`, dentro del mismo `Pressable`.
2. Mantener el `Pressable` de la fila como único objetivo táctil: `accessibilityRole="switch"`, `accessibilityState={{ checked: enabled, disabled: busy }}`, `minHeight: touch.controlHeight` (48 dp ya cumplido). Si se usa `Switch` nativo, ponerle `accessible={false}` y `importantForAccessibility="no-hide-descendants"` para que no se anuncie doble.
3. El chip pasa a ser solo informativo y queda bajo la etiqueta (apilado como en `AvailabilitySwitch.js:69-72`), no como único indicador. Si el estado es de carga (`busy`), el chip dice un texto propio ("Activando…" o "Desactivando…", nuevos en `labels.notifications`) y la pista se ve atenuada con `opacity.disabled`.
4. Respetar reducir movimiento igual que `AvailabilitySwitch` (`AccessibilityInfo.isReduceMotionEnabled`).
Estados a cubrir al verificar (pendiente de dispositivo): activado, desactivado, cargando (`busy`), bloqueado/denegado (pista apagada + caja con "Notificaciones bloqueadas" y botón a ajustes), sin red.

### F-02 — severidad MEDIA — Botón "Enviar solicitud de prueba" deshabilitado sin contraste y sin saber cómo habilitarlo
Archivo: `src/components/settings/NotificationsSection.js:200-205` y `src/components/PrimaryButton.js:41-46`.
Problema: el estado por defecto del botón es deshabilitado (permiso aún no concedido). `PrimaryButton` deshabilitado usa `opacity.disabled` (0,5) sobre `color.primary`: texto blanco sobre un teal aclarado, contraste estimado ≈ 2,4:1, por debajo de AA (4,5:1). Los controles inactivos están exentos del criterio 1.4.3, pero la rúbrica del proyecto pide texto legible y esta pantalla es de comprobación: el usuario debe poder leer por qué no puede pulsarlo. La razón sí existe (`testNeedsOn`, `NotificationsSection.js:170`) pero va en `type.caption` (12 px) arriba del paso de retraso, lejos del botón.
Regla: contraste AA del texto; errores y bloqueos que explican cómo resolver; jerarquía (la causa va junto al control).
Corrección pedida:
1. Estado deshabilitado propio (en `PrimaryButton` con prop o estilo local en la sección): fondo `color.surfaceMuted`, borde `borderWidth.thin` `color.borderSubtle`, texto `color.textMuted` (≈ 7:1 sobre `surfaceMuted`, estimado), sin `opacity.disabled`, sin sombra. Así se lee y es claramente distinto del botón activo.
2. Mover el texto `testNeedsOn` justo debajo del botón, con `type.small` y `color.textMuted`, y hacerlo región `polite` solo cuando cambie `enabled`. Mantener `testBody` (también `type.small`) cuando esté habilitado. Subir `muted` de `type.caption` a `type.small` (14 px): 12 px con color atenuado es el mínimo débil de la guía.
3. Botón habilitado: sin cambios de color; el estado "Enviando…" (`loading`) añade `accessibilityState.busy`.
4. Retraso 0–60 s: `StepButton` ya cumple 48 dp (`touch.controlHeight`) y desactiva en los extremos; pedir además `accessibilityValue={{ min: 0, max: 60, now: delaySeconds, text: labels.notifications.delayValue(delaySeconds) }}` en el valor y que el valor no sea región `polite` por cada pulsación repetida (`NotificationsSection.js:185`: anunciar con la etiqueta basta, quitar `accessibilityLiveRegion` del número).

### F-03 — severidad MEDIA — Tarjeta emergente: nombre largo, fuente al 200 % y objetivo del cierre
Archivo: `src/components/IncomingRequestCard.js:273-291` (cabecera), `:432-437` (`close`), `:259-260`.
Captura: no hay; **pendiente de dispositivo** (fuente al 200 % y nombres largos).
Problemas:
1. `title` ("Nueva solicitud de {nombre}") no tiene `numberOfLines`; la cabecera queda FUERA del `ScrollView` (comentario #48), así que un nombre largo o la fuente al 200 % crecen la cabecera y empujan el contenido y los botones; el tope `maxHeight` (70 % de la ventana) comprime solo el `ScrollView`, que podría quedar casi sin alto.
2. Ninguna línea del proyecto fija `maxFontSizeMultiplier`: el texto escala sin tope (comportamiento correcto para accesibilidad, no se debe usar `allowFontScaling={false}`), pero los dos bloques críticos de la tarjeta deben tener tope razonable para no romper la acción.
3. `styles.close` usa `touch.min` (44) en lugar de `touch.controlHeight` (48); el encargo pide ≥ 48 dp.
4. El contador de la tarjeta usa `type.label` 14 px (`countdownText`, `:512-516`) mientras la pantalla completa usa `type.display`; y la tarjeta no tiene estado urgente en los últimos 10 s (la pantalla sí, `TripRequestScreen.js:278, 539-550`). El temporizador pierde jerarquía justo cuando importa.
Corrección pedida:
1. `title`: `numberOfLines={2}` y `ellipsizeMode="tail"`; poner el nombre en el componente de texto de la cabecera con `maxFontSizeMultiplier={1.5}` y mantener `accessibilityLabel` con el nombre completo (así el lector de pantalla lo lee entero aunque se corte). Lo mismo en `TripRequestScreen.js:313` (`trip-request-passenger`, `numberOfLines={2}`).
2. `countdownText`, importes (`net`, `fareValue`) y botones: `maxFontSizeMultiplier={1.5}` en los textos de importes y del contador (los botones son compartidos: decidir en `PrimaryButton`/`SecondaryButton` con 1,5 y mantener `minHeight` 48, el botón crece, no se recorta). Documentar el valor como token (`type.maxScale` o constante local con comentario) en vez de repetir el número.
3. `close`: `width/height: touch.controlHeight`.
4. Contador de la tarjeta: `type.title` + `type.numeric` en los últimos 10 s con el mismo patrón urgente de la pantalla completa (fondo `color.primary`, texto `color.onPrimary`, relleno `color.onPrimary`), en lugar de solo el texto de 14 px. Sin rojo (regla de la pantalla).

## Observaciones para la ronda 2 (no bloquean ahora)

- O-01 (media) — `NotificationsSection.js:144-164`: los errores se pintan solo como texto rojo (`color.danger` sobre `color.bg`, ≈ 5,5:1 estimado, cumple) y para el estado bloqueado se repiten dos textos rojos ("Notificaciones bloqueadas" más `blocked`). Usar el mismo patrón que `IncomingRequestCard.js:355-362` (`Card variant="status" tone="danger"` con `Icon alert-circle` y `color.onDangerSoft`) y mostrar un solo mensaje por causa. Pendiente de dispositivo. Además `blockedTitle` aparece también con el permiso solo denegado (DENIED, reintentable): afinar el texto o mostrar `denied` en ese caso.
- O-02 (media) — Estado de carga: con `busy` el interruptor solo baja a `opacity.disabled`; no hay texto ni indicador. Cubierto por el punto 3 de F-01; si no se cubre allí, añadir `ActivityIndicator` con `color.primary`.
- O-03 (media) — Mensajes de solicitud vencida inconsistentes: `labels.trip.expired = 'La solicitud venció'` (`labels.js:121`) y `labels.trip.pushExpired = 'La solicitud expiró'` (`:123`); el contador dice "Vence en…". Unificar al verbo "venció" y decir qué hacer: "La solicitud venció. Te avisaremos cuando llegue otra." Cambiar `pushExpired` (nadie en `scripts/tests` busca "expiró" de la solicitud; solo `mockPassengerApi.js:172` y `mappers.js:115` usan "venció"). Comentarios en `eligibility.js:3` y `NotificationsBridge.js:5` mencionan "expiró"; actualizarlos.
- O-04 (baja) — Aviso de vencida de la tarjeta (`IncomingRequestCard.js:250-255`): la región `polite` se monta con el texto ya puesto; en Android los lectores a veces no anuncian contenido que aparece con la vista. Pendiente de dispositivo; si no se anuncia, montar la región vacía y poner el texto en el siguiente ciclo. Fuente `type.body` sobre `color.text` con `color.surface`: contraste alto, sin cambio.
- O-05 (baja) — Barra de progreso (`IncomingRequestCard.js:347`, `TripRequestScreen.js:370`): es decorativa dentro de un grupo ya etiquetado; añadir `importantForAccessibility="no-hide-descendants"` al `track` o dejarla como está (el grupo `accessible` ya oculta los hijos). No es bloqueo.
- O-06 (baja) — Glifos "−" y "+" en `StepButton` (`NotificationsSection.js:231`): usar `Icon` (`remove`, `add`) para cumplir "iconos con `Icon.js`"; verificar que `Icon.js` tenga esos nombres.
- O-07 (baja) — `NotificationsSection.js:253`: `divider` con `marginVertical: space[2]` correcto; el `subsection` ("Solicitud de prueba") compite con `section` (20 vs 18 px, mismo peso): aceptable; confirmar en captura.
- O-08 (baja) — Éxito de la prueba (`styles.success`, `color.success` 14 px sobre `color.bg`, ≈ 4,6:1 estimado, justo en el límite): usar `color.onSuccessSoft` si se mantiene sobre `bg`.

## Aviso de navegación "Main > Home, Main > Home > Home": dictamen del renombre

Causa confirmada: el Drawer registra `Home` (`MainDrawer.js:78`) cuyo componente es `TripStack`, y `TripStack` registra a su vez `Home` (`TripStack.js:27`). Son dos pantallas con el mismo nombre anidadas; React Navigation avisa (es un aviso, no un error; no hay fallo funcional hoy).

Todas las referencias a `Home` como NOMBRE de ruta (resultado de buscar en `src/`, `scripts/`, `App.js`, `app.json`):

| Referencia | Se refiere a | Cambia con el renombre del Drawer |
|---|---|---|
| `MainDrawer.js:56` `useState('Home')` | Drawer | Sí |
| `MainDrawer.js:72` `initialRouteName="Home"` | Drawer | Sí |
| `MainDrawer.js:78` `<Drawer.Screen name="Home">` | Drawer | Sí (el renombre) |
| `requestPresentation.js:16` `HOME_ROUTE = 'Home'` y `:25` | Drawer (`currentRoute` viene de `route.name` del Drawer, `MainDrawer.js:63`) | Sí |
| `HomeScreen.js:100` `decideRequestPresentation('Home', …)` | Drawer (literal duplicado) | Sí: usar la constante exportada |
| `IncomingRequestCard.js:212` `navigate('Home', { screen: 'TripActive' })` | Drawer (navega desde el Drawer hacia el stack anidado) | Sí |
| `TripStack.js:26-27` `initialRouteName="Home"` y `<Stack.Screen name="Home">` | Stack | No |
| `TripRequestScreen.js:137`, `TripActiveScreen.js:89,131,145`, `TripSummaryScreen.js:123` `popTo('Home')` | Stack (`navigation` del stack) | No |
| `AppDrawerContent.js:31,116-138` | El panel no lista Home; compara con nombres de los ítems listados | No (ver nota) |
| Deep links / `linking` | `App.js:67` es `NavigationContainer` sin `linking`; `app.json` sin `scheme` ni `intentFilters` | No existe |
| `scripts/tests/*` | Ninguna prueba menciona `Home`, `decideRequestPresentation` ni `MainDrawer` | No hay pruebas que se rompan, pero tampoco que cubran el cambio |

Notas: (1) `decideRequestPresentation` descarta rutas que empiecen por `Trip` (`TRIP_ROUTE_PREFIX`); el nuevo nombre del Drawer NO debe empezar por `Trip`. (2) El flujo de notificaciones no navega por nombre: pasa por la solicitud pendiente de `AvailabilityContext` (`NotificationsBridge.js`, `intentFlow.js`), no por `Home`. (3) `AppDrawerContent` usa `state.routes[state.index].name`; con el Drawer renombrado el foco en el ítem Inicio no está listado, igual que hoy.

**Dictamen: SEGURO, riesgo BAJO.** Renombrar solo el Drawer (el Stack se queda en `Home`, así `popTo('Home')` de las tres pantallas no se toca). Nombre propuesto: `MainHome` (identificador en inglés; el Drawer personaliza el contenido y el nombre no se muestra al usuario). `Inicio` también sirve pero mezcla idioma de identificadores; el dictamen recomienda `MainHome`.
Cambios exactos:
1. `src/services/trip/requestPresentation.js`: `HOME_ROUTE = 'MainHome'` y exportarlo (`export const DRAWER_HOME_ROUTE`).
2. `src/navigation/MainDrawer.js:56, 72, 78`: usar la constante.
3. `src/screens/home/HomeScreen.js:100`: usar la constante en lugar de `'Home'`.
4. `src/components/IncomingRequestCard.js:212`: `navigate(DRAWER_HOME_ROUTE, { screen: 'TripActive' })`.
5. Actualizar comentarios que dicen "Home" como ruta (`MainDrawer.js:10`, `requestPresentation.js:4`).
Pruebas que lo cubrirían (hoy no existen; pedirlas como parte del cambio):
- Pura: `decideRequestPresentation(DRAWER_HOME_ROUTE, false, 'approved', true)` devuelve `fullscreen`; con `'Profile'` devuelve `card`; con `'Home'` (nombre del Stack) devuelve `card`, para fijar que el nombre viejo ya no cuenta.
- Estática: una prueba que lea `MainDrawer.js` y `TripStack.js` y compruebe que los nombres de `Drawer.Screen` y `Stack.Screen` no se repiten (guarda contra el aviso) y que `initialRouteName` del Drawer coincide con la constante.
- Dispositivo (capa E): con una solicitud en otra pantalla del Drawer, aceptar desde la tarjeta debe abrir `TripActive`; y desde `TripActive`, "Volver a Inicio" debe regresar a la pantalla de inicio sin dejar una segunda pila.
Si el implementer no quiere el cambio en esta fase, queda como límite menor documentable en `docs/omisiones-y-limites.md`: el aviso aparece solo en desarrollo, no afecta al comportamiento y no cambia con la versión de React Navigation 7. Mi recomendación es hacerlo (cuatro líneas) pero no es condición de aprobación del diseño.

## Tabla de hallazgos

| Id | Severidad | Archivo:línea | Resumen | Evidencia | Corregido |
|---|---|---|---|---|---|
| F-01 | Alta | `NotificationsSection.js:115-130` | Sin pista/pulgar; el chip es el único indicador del estado | Reporte de Anderson + código; capturas pendientes de dispositivo | Corregido (ronda 1): `SwitchTrack` compartido, fila con rol switch, chip informativo con «Activando…/Desactivando…». Pendiente de dispositivo |
| F-02 | Media | `NotificationsSection.js:170,200-205`; `PrimaryButton.js:41-46` | Botón de prueba deshabilitado ≈ 2,4:1 y su causa en 12 px lejos del botón; paso de retraso sin valor accesible | Código; contraste estimado | Corregido (ronda 1): `PrimaryButton quietDisabled`, causa bajo el botón en `type.small`, `accessibilityValue` y sin región viva en el valor. Pendiente de dispositivo |
| F-03 | Media | `IncomingRequestCard.js:273-291,432-437,512-516` | Nombre largo y 200 % sin límite, cierre de 44 dp, contador de 14 px sin estado urgente | Código; pendiente de dispositivo | Corregido (ronda 1): 2 líneas con etiqueta completa, `maxFontScale` 1,5, cierre 48 dp, contador `type.title` con patrón urgente. Pendiente de dispositivo |
| O-01…O-08 | Media/Baja | ver sección de observaciones | Errores sin icono, carga sin texto, "venció"/"expiró", live region del aviso, etc. | Código | Aplicadas O-01, O-02, O-06, O-08; O-03 abierta para Anderson (no se cambió); O-04, O-05, O-07 sin cambio (dependen de captura) |
| N-01 | Baja | `MainDrawer.js:78` / `TripStack.js:27` | Aviso "Main > Home, Main > Home > Home": renombrar el Drawer a `MainHome` (seguro) o documentar | Código; sin pruebas hoy | Corregido: Drawer renombrado a `MainHome` (`HOME_ROUTE`); prueba `drawerRouteNames.test.mjs`. Pendiente de dispositivo |

## Ronda 2 de 3 (2026-11-16)

Método: lectura del código corregido (`SwitchTrack.js`, `AvailabilitySwitch.js`, `PrimaryButton.js`, `SecondaryButton.js`, `IncomingRequestCard.js`, `NotificationsSection.js`, `tokens.js`, `labels.js`, `TripRequestScreen.js`, `Chip.js`, `Icon.js`) y contrastes calculados con la fórmula WCAG sobre los tokens. No hay capturas del arnés ni del celular: todo lo que depende de render real queda **pendiente de dispositivo**.

### Hallazgos de la ronda 1

| Id | ¿Resuelto en código? | Evidencia |
|---|---|---|
| F-01 (alta) | Sí | `NotificationsSection.js:136-153`: `Pressable role="switch"` con `checked`, `disabled` y `busy`; `SwitchTrack` a la derecha, chip bajo la etiqueta con «Activando…/Desactivando…» (`labels.js:439-440`), pista atenuada con `opacity.disabled` en `busy`. `SwitchTrack.js` usa los mismos valores que pedí (24, 56, 4, `radius.full`, `success`/`border`, pulgar `surface`) y respeta reducir movimiento. `AvailabilitySwitch` lo reutiliza sin cambio de aspecto. La pista es `View` sin rol propio: no hay doble anuncio. Pendiente de dispositivo: ver la pista, el deslizamiento y los estados cargando/bloqueado. |
| F-02 (media) | Sí | `PrimaryButton quietDisabled` (`PrimaryButton.js:27,57-67`): `surfaceMuted`, borde `thin` `borderSubtle`, texto `textMuted`, sin sombra ni opacidad; `busy` en `accessibilityState`. `testNeedsOn` va justo bajo el botón (`:236-240`), región polite que solo existe cuando `!enabled`, en `type.small` (`muted` subió de `caption` a `small`). `accessibilityValue` min/max/now/text en el valor del retraso y sin región viva en el número. |
| F-03 (media) | Sí | Título a 2 líneas con `ellipsizeMode="tail"`, `maxFontSizeMultiplier={maxFontScale}` y `accessibilityLabel` con el nombre completo (`IncomingRequestCard.js:281-290`); cierre `touch.controlHeight` (48); `maxFontScale = 1.5` documentado como token (`tokens.js:66`) y aplicado a importes, contador y a los dos botones compartidos; contador de la tarjeta en `type.title` con patrón urgente. En `TripRequestScreen.js:313` el nombre tiene `numberOfLines={2}` y `ellipsizeMode`. |

### Contrastes calculados (WCAG, sobre tokens; no son medición sobre captura)

| Elemento | Par | Ratio | Umbral | Resultado |
|---|---|---|---|---|
| Botón `quietDisabled`, texto | `textMuted` #4A5A54 sobre `surfaceMuted` #F6F8F7 | 6,83:1 | 4,5:1 | Cumple |
| Botón `quietDisabled`, borde y relleno | `borderSubtle` sobre `bg` 1,40:1; `surfaceMuted` sobre `bg` 1,06:1 | 1,40:1 | 3:1 (UI) | No cumple, pero es control inactivo (exento de 1.4.11); ver O-09 |
| Causa `testNeedsOn` | `textMuted` sobre `bg` #EEF2F1 | 6,46:1 | 4,5:1 | Cumple |
| Chip neutro (Desactivadas) | `text` sobre `surfaceMuted` | > 14:1 (alto) | 4,5:1 | Cumple |
| Chip éxito (Activadas) | `onSuccessSoft` sobre `successSoft` | 6,78:1 | 4,5:1 | Cumple |
| Contador urgente, texto | `onPrimary` sobre `primary` | 6,08:1 | 4,5:1 (y 3:1 por ser 20 px semibold) | Cumple |
| Contador no urgente, texto | `primary` sobre `surface` | 6,08:1 | 4,5:1 | Cumple |
| Barra urgente: relleno sobre pista | `onPrimary` sobre `primary` | 6,08:1 | 3:1 | Cumple |
| Pista encendida sobre fondo | `success` sobre `bg` | 4,54:1 | 3:1 | Cumple |
| Pista apagada sobre fondo / sobre tarjeta | `border` sobre `bg` / `surface` | 3,45:1 / 3,90:1 | 3:1 | Cumple |
| Pulgar sobre pista | `surface` sobre `success` / `border` | 5,13:1 / 3,90:1 | 3:1 | Cumple |
| Éxito de la prueba (O-08) | `onSuccessSoft` sobre `bg` | 6,97:1 | 4,5:1 | Cumple (antes ≈ 4,6:1) |
| Error de la prueba | `danger` sobre `bg` | 5,79:1 | 4,5:1 | Cumple |
| Error en tarjeta | `onDangerSoft` sobre `dangerSoft` | 7,51:1 | 4,5:1 | Cumple |

Corrección a mi ronda 1: la estimación de 2,4:1 del botón deshabilitado era de la versión con opacidad; el estado nuevo pasa de 6,83:1 en el texto.

### Valores sueltos, emojis e iconos

- Colores, espaciados, radios, opacidades y anchos de borde: todos desde `tokens.js` en `SwitchTrack`, `AvailabilitySwitch`, `PrimaryButton`, `SecondaryButton`, `NotificationsSection` y los estilos nuevos de `IncomingRequestCard`. Sin hex ni px sueltos en lo corregido. Las constantes locales previas de la tarjeta (`ENTRANCE_OFFSET`, `MAX_HEIGHT_RATIO`) son de animación y proporción, preexistentes y con nombre; las acepto.
- Emojis: ninguno. «…» en «Activando…» es puntuación, no emoji.
- Iconos: todos con `Icon.js` (Ionicons). `remove`, `add`, `close`, `alert-circle` son nombres válidos del conjunto; los glifos «−» y «+» ya no existen (O-06 resuelta).

### Desviación del implementer: contador con `type.title` y relleno constante desde el inicio

Yo pedí `type.title` + `type.numeric` y el patrón urgente "en los últimos 10 s". El implementer hizo lo mismo en tipografía y color, pero con relleno `space[2]/space[3]` y `borderRadius` constantes desde el primer segundo (solo cambian los colores al llegar a 10 s). Dictamen: **aceptable, y mejor que lo pedido**. Razones: (1) evita que la tarjeta crezca 16 px justo cuando el conductor decide, un salto de layout en el peor momento; (2) coincide con `TripRequestScreen.js:532-538`, que también mantiene relleno constante, así que el patrón es el mismo en las dos presentaciones; (3) el texto sigue siendo `type.title` (20 px) frente a 28 px de la pantalla completa, proporcionado a una tarjeta compacta y con tope `maxFontScale`; (4) el contraste urgente es 6,08:1. Coste: en estado no urgente el bloque lleva relleno sobre fondo `surface` igual al de la tarjeta, es decir, algo de aire extra invisible; trivial. Cambio de estado por color más barra, no solo por color (el número cambia cada segundo y el anuncio es por voz), cumple DESIGN.md.

### Observaciones de la ronda 1

- O-01 resuelta (Card `danger` con icono, un mensaje por causa; `denied` ya no usa el título de bloqueado).
- O-02 resuelta (texto «Activando…/Desactivando…» y pista atenuada).
- O-03 **abierta** (media, copy): `labels.js:121` «venció» frente a `:123` «expiró». El implementer la dejó a decisión de Anderson. Es una incoherencia de voz en un camino raro (abrir una notificación ya vencida), sin impacto funcional, pero la lista de la ronda 1 la rotuló media.
- O-04, O-05, O-07: sin cambio, dependen de captura o de lector de pantalla; pendiente de dispositivo.
- O-06 y O-08 resueltas.
- N-01 (renombre del Drawer a `MainHome`): resuelto en código; la prueba `drawerRouteNames.test.mjs` existe. No revisé su ejecución; pendiente de dispositivo el flujo aceptar desde la tarjeta y "Volver a Inicio".

### Observaciones nuevas (no bloquean)

- O-09 (baja): el botón `quietDisabled` queda casi invisible como forma (relleno 1,06:1 y borde 1,40:1 sobre `bg`); se lee por el texto (6,83:1) y por la causa debajo. Como control inactivo está exento de AA de UI. Si en el celular se ve "perdido", subir el borde a `color.border` con `borderWidth.thin`.
- O-10 (baja): `TripRequestScreen.js` no aplica `maxFontSizeMultiplier` a contador ni importes (solo la tarjeta). La pantalla tiene desplazamiento y la acción fija; revisar con fuente al 200 % en el celular antes de decidir.
- O-11 (baja): en la fila del interruptor, con `busy` se atenúa solo la pista (`dimmed`); el texto y el chip no. Es coherente (el chip dice «Activando…»), solo confirmarlo en captura.

### Dictamen de la ronda 2

F-01, F-02 y F-03 están resueltos a nivel de código y contraste. No quedan hallazgos altos. Queda abierta una observación de severidad media (O-03, copy «venció»/«expiró») y la capa E completa (ver interruptor, tarjeta con nombre largo y fuente 200 %, contador urgente, botón deshabilitado, aviso de Home) sigue **pendiente de dispositivo**; las capas B y D no se pueden cerrar sin capturas. No se rechaza el trabajo: la corrección es fiel y en un punto superior a lo pedido.

Para pasar a Aprobado hacen falta: (1) que Anderson decida O-03 (unificar a «venció» en `pushExpired`, o registrarla como límite en `docs/omisiones-y-limites.md` y yo la bajo a baja); (2) capturas del celular en `docs/diseno/auditorias/capturas/` de interruptor activado/desactivado/cargando/bloqueado, botón de prueba deshabilitado y habilitado, tarjeta normal y urgente, y tarjeta con nombre largo a fuente 200 %. Si todo coincide con este informe, es la ronda 3 y cierre.

## Estado

Capas: A parcial por lectura (tokens, iconos, sin emojis: cumple); B pendiente (sin capturas); C parcial por lectura; D pendiente; E pendiente de dispositivo.

Diseño: Pendiente (ronda 2: F-01, F-02, F-03 resueltos en código; abiertos O-03 (media) y capa E pendiente de dispositivo)

## Addendum 2026-11-16 (implementer, pulido de la spec 003, AI_LOG #64; no es veredicto del auditor)

Estado: Implementada, **No verificado en dispositivo**. No se toca el campo Diseño; la ronda siguiente la decide el design-auditor.
- O-03: resuelta. Un solo texto, «La solicitud expiró» (`labels.trip.expired`, `mappers.js`, `mockPassengerApi.js`) (D-151).
- O-09: `PrimaryButton` con `quietDisabled` usa borde `color.border` (antes `borderSubtle`, 1,40:1) para que se lea la forma.
- O-10: `maxFontSizeMultiplier={maxFontScale}` en la cuenta regresiva (tarjeta y pantalla), el monto de ganancias y la tarifa de la solicitud.
- O-11: el interruptor ocupado expone `accessibilityValue` con el texto del chip y una región viva «polite»; el chip no se atenúa y solo la pista queda atenuada. Falta confirmarlo en captura.
- A2 (cuenta regresiva sin bloque relleno, D-150): contrastes calculados: texto `primary` sobre `surface` 6,08:1; texto `danger` sobre `surface` 6,54:1; barra `primary` sobre pista `primarySoft` 5,12:1; barra `danger` sobre la pista 5,50:1 (mínimo 3:1 para barras).
