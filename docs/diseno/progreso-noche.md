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
