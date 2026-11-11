# Auditoría de diseño estática — rediseño del prompt #53

Estado de toda la evidencia visual: **No verificado en dispositivo**. Auditoría por lectura de código; no hay capturas ni celular. Los hallazgos citan archivo:línea en lugar de captura. No sustituye la capa E.

## Alcance
Áreas B (Inicio, solicitud entrante), C (viaje activo, resumen, mapa), D (Ganancias, Historial, Perfil, Configuración), E (registro: campos, selector, fecha, casilla, foto, avisos, ScreenState) y pase A2 (AppDrawerContent, AppTabBar). Fuentes: DESIGN.md, guía de estilo, tokens, componentes y pantallas. Contraste: se toman como verificados los 26 pares de la guía (0 fallas; margen más bajo success/bg 4.54).

## Veredicto
**Aprobado en lo estático, con reservas.** Sin hallazgos de severidad alta. Cinco medios y varios bajos. Todo lo visual queda pendiente de la capa E.

## Hallazgos
Nota: la regla del proyecto es máximo tres problemas por ronda; aquí se listan todos por ser auditoría estática única, ordenados por severidad. Los tres primeros son los que recomiendo corregir antes de la capa E.

### Media
1. **Selector y fecha no anuncian su valor.** `src/components/registration/SelectField.js:21` y `DateField.js:37`: `accessibilityLabel={label}` reemplaza el texto visible, así que un lector de pantalla dice la etiqueta pero no el valor elegido. Regla: el estado/valor no debe depender solo de lo visual. Corrección: `accessibilityValue={{ text: valor }}` o incluir el valor en la etiqueta.
2. **Etiqueta de pestaña truncada al 200 %.** `src/navigation/AppTabBar.js:119`: `numberOfLines={1}` con etiqueta de 14 px en un tercio del ancho cortará "Documentos"/"Vehículo". Regla 5 (texto sin recorte al escalar). Corrección: permitir 2 líneas o acortar etiquetas.
3. **Acción principal del viaje activo puede quedar bajo el pliegue al 200 %.** `src/screens/trip/TripActiveScreen.js:38,296`: el panel con la acción vive en un ScrollView con `maxHeight` del 65 % de la ventana. Regla 6 y escalado: con texto grande el botón y las confirmaciones se desplazan y el mapa se reduce. Corrección: fijar la acción fuera del scroll, como en TripRequestScreen.
4. **Cuenta regresiva anunciada cada segundo.** `src/screens/trip/TripRequestScreen.js:357`: `accessibilityLiveRegion` "assertive" mientras es urgente genera ruido continuo. Corrección: anunciar solo en umbrales (10 s, 5 s).
5. **Selector de fecha solo Android.** `src/components/registration/DateField.js:3,8,21` usa `DateTimePickerAndroid`; el proyecto apunta a iOS y Android. Fuera del alcance visual: derivar al spec-author/implementer.

### Baja
6. Pista de progreso no urgente casi invisible: `TripRequestScreen.js:421,517` usa `color.bg` sobre `surface` (~1.1:1). El texto lleva el significado, pero conviene `primarySoft` como en IncomingRequestCard.
7. Menú: `AppDrawerContent.js:273-276` `itemPressed` (surfaceMuted) se aplica después de `itemActive`; la píldora activa se vuelve gris al pulsar. Además `numberOfLines={1}` en vehículo/placa (líneas 92, 97) trunca al 200 %, y el avatar (línea 79) no tiene `accessibilityLabel`.
8. SelectField (`SelectField.js:39`): hoja sin velo y sin relleno inferior de área segura; el marcador de posición repite la etiqueta.
9. PhotoField: la vista previa no tiene `accessibilityLabel`; "Eliminar foto" es destructivo sin confirmación.
10. FieldError sin `accessibilityLiveRegion`/rol: los errores nuevos no se anuncian.
11. TripSummaryScreen.js:326 y TripMap.js:134 usan `caption` 12 px para notas/atribución; es el tamaño mínimo y se ve pequeño. El mapa no tiene descripción accesible (mapa: No verificado en dispositivo).
12. ScreenState.js:90-95: el botón Reintentar no tiene estado deshabilitado/cargando ni `accessibilityState`; permite toques repetidos.
13. Ganancias, Historial, Perfil y Configuración: sin hallazgos de contraste ni de objetivos táctiles. `iconSize.sm` (16) está declarado pero no se usa en ninguna parte: sin incumplimiento; considerar retirarlo de los tokens (decisión de DESIGN.md).
14. `PlaceholderScreen.js` panel de desarrollo (solo `SHOW_DEV_TOOLS`): opciones con subrayado como único indicador de selección más `accessibilityState`; sin impacto en producción.

## Aciertos
- Ningún estado depende solo del color: Chip con texto, íconos junto a texto, subrayado y barra en navegación, FieldError con ícono, selección de periodo con marca y texto.
- Objetivos táctiles ≥ 44 (botones 48; casilla de 24 con fila de 44; periodos con `minHeight` 44).
- Movimiento reducido respetado; solo opacidad/transform.
- Tokens usados de forma consistente; sin hex sueltos en pantallas revisadas (los de sombra están en tokens).
- Estados de carga, vacío y error cubiertos con ScreenState en Ganancias, Historial y Perfil; deshabilitado con `opacity.disabled` y `accessibilityState` en formularios de registro.
- Íconos solo en 20/24; marcadores del mapa distinguidos por forma (aro vs punto).

## Pendiente (capa E, celular)
Todo lo visual: jerarquía real, espaciado, sombras, mapa, escalado al 200 %, pulsado y foco. No verificado en dispositivo.
