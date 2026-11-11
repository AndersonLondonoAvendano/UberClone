# Progreso nocturno del rediseño (prompt #51)

## Área A — sistema de diseño
- Cambios: tokens (paleta semántica con variantes suaves, escala tipográfica, espaciado, radios, elevaciones, movimiento), ScreenHeader (barra elevada, botón píldora con ícono de View), ScreenState (esqueleto Animated con reduce-motion, tarjetas vacío/error), PrimaryButton, SecondaryButton y nuevos Chip, Card, DataRow.
- Verificador (distinto del implementador): APROBADO en lo estático.
- Auditor: contrastes de texto todos ≥ 4.5:1. Ajustes aplicados: borderSubtle y skeleton más oscuros, elevation.card 0.1/3, header con numberOfLines, botón primario deshabilitado sin sombra. Pendiente para el celular: fuerza visual de bordes y sombras, escala de fuente al 200 %, legibilidad del botón deshabilitado (opacity.disabled es requisito del encargo).
- Círculo gris con engranaje de las capturas: es el botón de herramientas del dev client de Expo, no forma parte de la app (prompt #52, punto 2). No se toca. El control de cabecera de la app es «Menú»/«Atrás» (ícono más texto).
- Documentos: DESIGN.md (sección D-90), decisiones.md D-90, guia-de-estilo.md.
- Commit: denegado por el entorno (5 intentos); plan B. Snapshot: C:/Users/Anderson/AppData/Local/Temp/claude/61b338d813ee33a9/121bee4b-017c-42ee-8411-2c066cec5af9/scratchpad/area-A-snapshot ; parche: C:/Users/Anderson/AppData/Local/Temp/claude/61b338d813ee33a9/121bee4b-017c-42ee-8411-2c066cec5af9/scratchpad/area-A-acumulado.patch
- Falta: áreas B–G.

## Área A2 — íconos, fuente Inter, menú lateral y pestañas de registro (prompt #52)
- Cambios: Icon.js (Ionicons, decorativo), tokens fontFamily (Inter 400/500/600/700) e iconSize, carga de Inter con useFonts en App.js (máx. 3 s, salida segura a fuente del sistema, aislado y comentado), menú lateral nuevo (cabecera de marca con foto con borde, nombre, vehículo, placa y disponibilidad; ítems con ícono contorno/relleno, píldora suave y barra de acento; pie con nombre y versión), pestañas de registro con ícono y píldora activa con subrayado (no solo color), ScreenHeader con Icon, banner «pendiente de aprobación» en estilo suave de aviso.
- Verificador (distinto): APROBADO en lo estático. Inventario: solo ganancias (fontFamily, iconSize, Icon.js). Contraste: todos los pares nuevos ya cubiertos por los 26 verificados (0 fallos).
- Hallazgos pendientes: constantes locales AVATAR_SIZE/ACCENT_WIDTH/SHAPE_SIZE a tokens (barrido H); auditor de diseño aún no ejecutado para A2; no se añadió la marca «completo» en pestañas (requeriría texto nuevo en labels.js); C15 reporta 3 errores por las dependencias de Inter/íconos/expo-font que no están en scripts/dependencies.json (decisión de Anderson); app.json ya incluía el plugin "expo-font" por el `npx expo install` previo.
- check-constitution: 16 errores (13 + 3 C15), 0 advertencias.
- Snapshot: C:/Users/Anderson/AppData/Local/Temp/claude/61b338d813ee33a9/121bee4b-017c-42ee-8411-2c066cec5af9/scratchpad/area-A2-snapshot ; parche: C:/Users/Anderson/AppData/Local/Temp/claude/61b338d813ee33a9/121bee4b-017c-42ee-8411-2c066cec5af9/scratchpad/area-A2-acumulado.patch (commit denegado).
- No verificado en dispositivo: carga real de Inter, aspecto del menú y pestañas, texto al 200 %.
- Falta: áreas B–H, D-91 en decisiones.md.

## Área B — Inicio y solicitud (prompt #53)

- **Qué cambió:** AvailabilitySwitch (tarjeta, Chip de estado con texto, insignia con ícono, pulgar animado con reduce-motion), aviso de Home como Card de peligro con ícono, IncomingRequestCard (elevación, ícono de cerrar, Card de marca para tarifa y ganancia, error en Card de peligro, barra de progreso) y TripRequestScreen (Card, íconos de origen y destino, filas DataRow, ganancia propia destacada, estado expirada con ícono). Token nuevo: `badgeSize`.
- **Veredicto:** APROBADO por verifier distinto del implementer (estático). check-constitution: 13 errores, 0 advertencias. Inventario: solo ganancia de `badgeSize`.
- **Hallazgos menores (no bloquean):** helper local `Row` cambió su prop `numeric` por `last`; el estilo `caption` de IncomingRequestCard usa `onPrimarySoft` y solo es válido dentro de la tarjeta de dinero.
- **Incidente:** el implementer ejecutó `expo lint` (prohibido) e instaló eslint; se restauraron package.json y package-lock.json desde HEAD y se borró eslint.config.js. Quedan carpetas de eslint en node_modules (no versionadas).
- **Commit:** denegado; copia en `scratchpad/area-B-snapshot` y `scratchpad/area-B-acumulado.patch`.
- **Falta:** prueba en el celular (switch, aviso de error, tarjeta inferior, pantalla de solicitud con fuente grande).

## Área C — Viaje activo y resumen (prompt #53)

- **Qué cambió:** TripActiveScreen (Chip de fase, distancia y tiempo restantes en type.display, avisos y confirmaciones como Card con ícono y texto, «Reintentar» visible, panel con elevación y ScrollView con alto máximo), TripSummaryScreen (ganancia en Card de marca, filas DataRow, nota de cobro simulado con ícono, éxito y errores como Card con ícono, confirmación de salida visible) y TripMap (conductor = punto relleno, destino = anillo; distinguibles por forma). Token nuevo: `mapMarker`.
- **Veredicto:** APROBADO por verifier distinto del implementer (estático). check-constitution: 13 errores, 0 advertencias. Inventario: solo ganancia de `mapMarker`.
- **Hallazgos menores (no bloquean):** `PANEL_MAX_SHARE = 0.65` suelto en TripActiveScreen (podría ir a tokens); `mapMarker` duplica 8/3 de `config/map.js`; contenido del ScrollView sin re-indentar; con fuente máxima el botón principal puede requerir scroll (probar en celular). El `testID` `trip-active-phase` pasó de Text a View (Chip); no lo usa ningún script ni documento de pruebas.
- **Commit:** no se intentó de nuevo tras la denegación del Área B; copia en `scratchpad/area-C-snapshot` y `scratchpad/area-C-acumulado.patch`.
- **No se agregó reduce-motion al mapa:** la cámara ya usaba `easeTo` y no existía lógica previa; agregarla sería lógica.
- **Falta:** prueba en el celular (chip de fase, marcadores, «Ruta aproximada» con «Reintentar», cancelar, resumen y cobro, fuente máxima).

## Área D — Ganancias, Historial, Perfil y Configuración (prompt #53)

- **Qué cambió:** Ganancias (selector de periodo con borde, check y texto más fuerte en el activo; total neto en Card de marca con type.display; viajes en Card con insignia), Historial (Card con Chip de estado con texto, ruta en dos filas con ícono, ganancia destacada, «Sin cobro» en cancelados), Perfil (avatar con borde y `avatarSize`, nombre y Chip de categoría, grupos con DataRow) y Configuración (Card, DataRow, notas con ícono). Sin tokens nuevos. No hay barras en Ganancias: no existen datos por periodo ya calculados y no se calculó nada nuevo.
- **Veredicto:** APROBADO por verifier distinto del implementer (estático). check-constitution: 13 errores, 0 advertencias. Inventario: solo `labels.history.route` deja de usarse, aprobado (los textos de origen y destino siguen visibles y el `accessibilityLabel` del ítem ya los incluye).
- **Hallazgos menores para Anderson:** (1) en Perfil sin foto, el texto visible «Sin foto» pasó a ser un ícono y el texto solo queda como `accessibilityLabel`; si se exige el texto visible hay que restituirlo; (2) el nombre y la categoría aparecen dos veces en Perfil (cabecera y campo); (3) `labels.history.route` queda huérfano en `labels.js`.
- **Ajustes míos:** corregí un espacio faltante entre `testID` y `style` en HistoryScreen y normalicé a CRLF los cuatro archivos.
- **Commit:** no se reintentó tras la denegación del Área B; copia en `scratchpad/area-D-snapshot` y `scratchpad/area-D-acumulado.patch`.
- **Falta:** prueba en el celular (selector de periodo, historial con viaje cancelado, perfil con y sin foto y nombre largo, fuente máxima).

## Área E — Registro (solo presentación)

- **Implementado:** campos con reposo, foco (borde grueso de marca), error (borde de peligro más ícono y texto) y deshabilitado; selector y fecha con chevron y calendario; casilla con check; foto enmarcada con botón «Quitar foto» visible bajo el marco; avisos «pendiente» como tarjeta con ícono; botón de envío de Documentos con el aspecto del primario; estados vacío y error con ícono. Token añadido: `photoPreviewHeight`.
- **Verificación estática:** `check-constitution` 13 errores y 0 advertencias (los esperados); inventario solo con adiciones; archivos en CRLF; verifier distinto del implementer: **Aprobada** (0 críticos, 0 mayores, 3 menores).
- **Menores:** (1) comentario preexistente «plan §7» en SelectField; (2) comentario huérfano al final de los estilos de ScreenState; (3) en la foto subiendo, el indicador y el texto pueden anunciarse dos veces con lector de pantalla.
- **Decisiones del implementer:** el botón de envío de Documentos no usa `PrimaryButton`, porque su `accessibilityLabel` seguiría al texto y el original lo fija en `submit`; el aviso «pendiente» queda duplicado en las tres pantallas (extraerlo es trabajo aparte); el fondo del modal del selector sigue transparente porque no hay token de scrim.
- **Commit:** denegado, no se reintentó; copia en `scratchpad/area-E-snapshot` y `scratchpad/area-E-acumulado.patch`.
- **Falta:** prueba en el celular (foco y error sin salto de layout, modal del selector, fuente al 200 %, lector de pantalla en foto y avisos).

## Área F — Barrido final (sin cambios de código)

- **Hex y colores sueltos en `src/` fuera de `tokens.js`:** 0 hallazgos.
- **Tamaños de fuente, pesos y espaciados numéricos fuera de tokens:** 0 hallazgos.
- **Tamaños de ícono literales:** 0 hallazgos (todos usan `iconSize`).
- **`numberOfLines`:** solo en `ScreenHeader` (1 y 2) y en drawer y pestañas, donde hay riesgo real de desborde.
- **Barra de estado:** `App.js` usa `StatusBar style="dark"`, coherente con `userInterfaceStyle: light`.
- **Zonas seguras y relleno inferior:** las pantallas de viaje, inicio y arranque usan `SafeAreaView`; la solicitud entrante suma `insets.bottom`; el registro suma la altura del teclado.
- **Pressables sin estado pulsado:** solo `DevAccountSwitch` y los botones de forzado de `PlaceholderScreen`, que son controles de desarrollo; no se tocan.
- **Cierre:** al no encontrar desvíos, no hubo implementer ni snapshot para el Área F; el contenido no verificable sin celular (escala al 200 %, ritmo vertical real) queda en la lista de prueba del celular.
