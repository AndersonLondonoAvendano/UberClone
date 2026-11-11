# Ronda 1 — Flujo del viaje (T-43, T-44, T-45)

- Fecha: 2026-11-10 (prompt #43). Auditor: design-auditor.
- Tipo: **estática** (lectura del código contra `DESIGN.md`, `src/theme/tokens.js`, `docs/diseno/direccion.md` y `docs/diseno/rubrica.md`). No hay capturas del celular ni del arnés.
- Pantallas: `src/screens/trip/TripRequestScreen.js`, `src/screens/trip/TripActiveScreen.js`, `src/screens/trip/TripSummaryScreen.js`; componentes `src/components/PrimaryButton.js`, `src/components/SecondaryButton.js`, `src/components/map/TripMap.js`.
- Guía cargada por el agente principal: skill frontend-design (estructura visual como información, una cosa memorable por pantalla, voz activa y misma acción con el mismo nombre, errores que dicen qué pasó y cómo arreglarlo, piso accesible AA/foco/44 pt, sin mayúsculas sostenidas ni adornos genéricos). Ninguna regla de la skill choca con el proyecto; no se descarta nada.

## Estado por capa

| Capa | Resultado |
|---|---|
| A | `check-constitution`: 23 errores, todos C21 de trazabilidad de requisitos sin tarea (línea base, ajenos a estas pantallas), 0 advertencias. Grep de hex/rgba en los seis archivos: 0. Arnés `visual-audit` no ejecutado: las tres pantallas dependen de `TripContext`, `AvailabilityContext` y MapLibre, que el arnés no renderiza. |
| B (Taste) | **Sin nota**: no hay capturas. No se redondea ni se estima. |
| C (Impeccable) | **Sin nota** por la misma razón. Lectura estática: sin P0; los tres hallazgos de abajo serían P1/P2. |
| D (UI UX Pro Max) | Parcial por lectura: contraste OK, 44 pt OK, estado con texto OK; jerarquía y estados deshabilitados con hallazgos. |
| E (celular) | Pendiente (checkpoint 2). El mapa, la atribución real sobre las teselas, la cámara y los puntos solo se juzgan aquí. |

## Lo que ya cumple
- Solo tokens: colores, `type.*`, `space`, `radius`, `touch`, `opacity`, `borderWidth` salen de `tokens.js`; sin hex ni tamaños de texto sueltos. Los números de pintura del mapa (`ROUTE_LINE_WIDTH`, `DRIVER_DOT_*`) viven en `src/config/map.js`, fuera de los tokens (ver cola).
- Contraste AA: todos los pares usados están en la tabla de `DESIGN.md` — text/surface 16.76, text/bg 15.30, textMuted/surface 7.29, textMuted/bg 6.66, onPrimary/primary 6.08 (4.95 pulsado), danger/surface 6.54 (botón «Cancelar viaje», avisos de error), danger/bg 5.97 (cuenta regresiva urgente sobre el fondo del `ScrollView`). La atribución usa textMuted sobre surface (7.29) a 12 pt.
- La cuenta regresiva comunica el tiempo con la cifra escrita («Vence en 8 s») y con `accessibilityLabel` en frase completa; el rojo es refuerzo, no el único canal.
- Avisos con texto: «Ruta aproximada: …», errores de ubicación, de reporte, de cancelación y de mapa explican qué pasó y qué revisar, con su «Reintentar».
- Táctil: `PrimaryButton` y `SecondaryButton` con `minHeight: touch.controlHeight` (48) y separación `touch.gap` (8); etiqueta y estado accesibles (`accessibilityState.disabled`).
- Atribución del mapa: siempre en pantalla como texto sobre el mapa (`TripMap.js:206-208`), con OpenFreeMap, OpenMapTiles, OpenStreetMap y OSRM.
- Encabezado: el mismo `ScreenHeader` sin botón inicial en las tres pantallas. «Volver a Inicio» se llama igual en todo el flujo.

## Hallazgos de la ronda (máximo tres)

### 1. (Alta) El dato vivo no manda: la cuenta regresiva y la ganancia están por debajo del resto
- Dónde: `TripRequestScreen.js:241-247` y `:359-367` (cuenta regresiva); `TripRequestScreen.js:236`, `:293-294` y `:347-350`; `TripSummaryScreen.js:328`, `:349-350` y `:388-391` (fila «Tu ganancia»).
- Qué se ve (por lectura, sin captura): la cuenta regresiva es `type.title` (20) en `color.text`, sin barra de progreso, y va al final del `ScrollView`, después de una tarjeta de unas diez filas; en un teléfono pequeño queda fuera de la vista justo cuando más importa. En la tarjeta y en el resumen ninguna cifra usa `type.display`; la fila «Tu ganancia», marcada como `strong`, aplica `type.label` (14/500) sobre `type.body` (16/400): la cifra destacada se dibuja **más pequeña** que las demás.
- Regla incumplida: `DESIGN.md` «Temporizador de solicitud: cifra `type.display` en `color.primary` con cifras tabulares y barra de progreso»; «Los importes, tiempos y distancias son tipografía grande con cifras tabulares»; «Elemento propio del producto: la franja de tarifa en vivo»; dirección «el único color va en el dato vivo»; frontend-design «una sola cosa memorable por pantalla».
- Corrección: sacar la cuenta regresiva del `ScrollView` y fijarla encima de los botones (o bajo el encabezado), en `[type.display, type.numeric]` con `color.primary` y una barra de progreso de `View` que avance con `transform`/ancho y respete «reducir movimiento». En la tarjeta y en el resumen, «Tu ganancia» como cifra `type.display` + `type.numeric` en `color.primary` (la franja propia); tarifa y comisión siguen en `type.body`. Si se quiere solo un énfasis de peso, usar `type.title`, nunca `type.label`.
- **Conflicto de especificación (al spec-author):** T-43 pide «en rojo los últimos 10 s» y `DESIGN.md` dice `color.primary` sin excepción; además `color.danger` está reservado a «Error, rechazo, pago rechazado». Por precedencia manda `DESIGN.md` hasta que se registre en el patrón del temporizador: «los últimos 10 s en `color.danger` (danger/bg 5.97, danger/surface 6.54), con la cifra siempre escrita». El contraste del rojo ya cumple; lo que falta es la regla escrita.

### 2. (Media) Líneas que decoran: bordes de tarjeta, divisores y bordes superiores donde manda el escalón de tono
- Dónde: tarjeta con borde `TripRequestScreen.js:316-318` y `TripSummaryScreen.js:369-371`; divisor `TripRequestScreen.js:225` y `:328-331`, `TripSummaryScreen.js:321` y `:373-376`; borde superior de la barra de acciones `TripRequestScreen.js:373-374`, `TripSummaryScreen.js:400-401` y del panel `TripActiveScreen.js:221-222`. La tarjeta usa `radius.lg` (`TripRequestScreen.js:318`, `TripSummaryScreen.js:371`).
- Regla incumplida: `DESIGN.md` «`color.border` es un límite de componente, no un separador decorativo. Para separar superficies se usa el escalón de tono `bg` → `surface`, sin líneas»; `borderWidth.thin` «no se usa como separador decorativo ni como línea entre superficies»; `radius.md` es de tarjetas y `radius.lg` de hojas inferiores; frontend-design «bordes y divisores deben codificar algo». Aquí el borde no delimita un control: la tarjeta blanca ya se separa del fondo gris.
- Corrección: quitar `borderWidth`/`borderColor` de las tarjetas y de las barras de acciones (superficie sobre `bg` basta); reemplazar el divisor por un salto de `space[4]` entre el bloque de lugares y el bloque de cifras (o una etiqueta de sección en `type.caption`, que sí codifica algo); tarjeta con `radius.md`. El panel de `TripActive` sí es una hoja sobre el mapa: `radius.lg` en las esquinas superiores y la sombra nativa permitida en «Elevación», en lugar de la línea.

### 3. (Media) «Iniciar viaje» y «Finalizar viaje» deshabilitados sin decir por qué a quien mira
- Dónde: `TripActiveScreen.js:165-181` (botón con `disabled={!atPickup || working}` y `!atDestination`), razón solo en `accessibilityHint` (`labels.trip.startRideHint`, `finishRideHint`).
- Qué pasa: durante todo el tramo el botón principal se ve como un teal a media opacidad (`opacity.disabled`) y la única acción plena del panel es «Cancelar viaje» en rojo. La razón («Disponible al llegar al punto de recogida») solo la oye un lector de pantalla; quien mira no sabe qué espera la app.
- Regla incumplida: `DESIGN.md` «Una sola acción principal por pantalla» (la principal no debe parecer rota); frontend-design «el botón dice lo que pasa» y piso accesible (el estado no puede depender de una pista oculta); el `opacity.disabled` está definido para campos bloqueados (T-31), no para explicar una espera.
- Corrección: mostrar la razón como texto visible bajo el botón en `type.caption`/`color.textMuted` mientras está deshabilitado (reutilizar `startRideHint`/`finishRideHint`), o retener el botón principal hasta la llegada y mostrar en su lugar la fase y el restante. Al llegar, anunciar el cambio (ya hay `accessibilityLiveRegion` en la fase). Si se mantiene el botón atenuado, registrar en `DESIGN.md` el uso de `opacity.disabled` para botones.

## En cola (no se exigen en esta ronda; se revisan en la ronda 2 o en el celular)
- (Media, capa E) Cámara: `CAMERA_ANIMATION_MS = 600` (`src/config/map.js`, usado en `TripMap.js:163`) supera los 250 ms de «Movimiento» y no consulta `AccessibilityInfo.isReduceMotionEnabled`. Puede ser una excepción razonable para seguir al conductor, pero debe quedar escrita en `DESIGN.md` o respetar «reducir movimiento».
- (Media, capa E) Puntos del mapa: conductor en `color.primary` y destino en `color.success` (`TripMap.js:123-134`) se distinguen solo por color, sin etiqueta; `success` está reservado a «Disponible/aprobado». Juzgar en el celular; probablemente pide una etiqueta de texto o un tamaño/forma distinta.
- (Baja) `Notice` acepta `tone="warning"` pero no aplica ningún estilo (`TripActiveScreen.js:196-199`); el aviso de ruta aproximada queda en `color.text`. Aceptable porque el texto dice «Ruta aproximada», pero el parámetro miente.
- (Baja) Mensajes: `errorGeneric` «Algo salió mal. Inténtalo de nuevo.» no dice qué pasó; `errorExpired` «La solicitud ya no está disponible.» y `expired` «La solicitud venció» nombran distinto el mismo hecho.
- (Baja) `styles.muted` es `type.body` en Solicitud y Viaje activo y `type.caption` en Resumen (`TripSummaryScreen.js:392-395`): mismo nombre, dos tamaños.
- (Baja) Filas no interactivas con `minHeight: touch.min` (`TripRequestScreen.js:337`, `TripSummaryScreen.js:382`): el token táctil usado como espaciado.
- (Baja, registro) Valores de pintura del mapa fuera de los tokens (`src/config/map.js`): no son hex ni tipografía; conviene que `DESIGN.md` diga que la pintura del mapa vive en `config/map.js` con colores de `color.*`.

## Campo Diseño
T-43, T-44 y T-45: **Pendiente** (ronda 1 estática con tres hallazgos; falta la evidencia en el celular del checkpoint 2). El hallazgo 1 incluye un conflicto de especificación que va al spec-author.
