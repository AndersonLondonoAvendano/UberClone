# Ronda 1 de auditoría de diseño: cierre de la spec 002 (T-130)

Fecha: 2026-11-12. Tipo: estática, por lectura del código (sin capturas del celular). Auditor: design-auditor. Tareas: T-110, T-119, T-121, T-123, T-124, T-126. Ronda 1 de 2 como máximo.

## Capas

| Capa | Resultado |
|---|---|
| A automática | Sin hex ni números sueltos en los archivos revisados (lectura); los scripts no se ejecutaron en esta ronda. |
| B Taste | Sin nota: no hay capturas. No se presenta ninguna captura del arnés como del celular. |
| C Impeccable | Sin nota: no hay capturas. |
| D UI UX Pro Max | Por lectura: objetivos >= 44, tokens, texto en el estado, contraste de tonos (pares de DESIGN.md). Hay tres hallazgos medios. |
| E celular | Pendiente. Todo lo de mapa, botón «Mi ubicación», atribución y 200 % de fuente: **No verificado en dispositivo**. |

## Lo que ya cumple

- Tokens cerrados en las pantallas revisadas; `Card`, `Chip`, `DataRow` e `Icon` compartidos.
- `MyLocationButton`: 44x44 (`touch.min`), `radius.full`, `elevation.card`, icono decorativo y etiqueta de accesibilidad.
- Tarjeta del saldo y pista: el texto envuelve y no hay `numberOfLines` que lo corte (T-124).
- Chip «Cobro simulado»: texto más icono, tono neutro con par `onPrimarySoft`/neutro adecuado; no depende del color (T-123).
- Panel de cobro: un solo mensaje a la vez, prioridad clara, verde solo con éxito real, una región `polite` (T-119).
- Mensajes de error de pagos por clase de error, en voz activa (T-126).
- Detalle: mapa de 240 pt, tarjeta «Ruta no disponible», chip de estado con texto, `DataRow`, botón Atrás de 44 con etiqueta que nombra el destino, `TripListItem` con `onOpen` y pista (T-110).

## Hallazgos de la ronda (máximo tres)

### H1 (medio) T-110: el mapa de solo lectura bloquea su propio «Reintentar»

- Dónde: `src/screens/main/TripDetailScreen.js:59-74` y `src/components/map/TripMap.js:125-132`.
- Qué se ve (por lectura): el contenedor lleva `pointerEvents="none"` y `accessible`. Sin red, `TripMap` pinta el cuadro de error con el botón «Reintentar» (`trip-map-retry`); ese botón no recibe toques y, por ser `accessible`, el lector de pantalla lo agrupa y no lo anuncia.
- Regla incumplida: rúbrica, estados de error con salida (no dejar un control muerto); objetivo táctil operable.
- Corrección: añadir a `TripMap` una prop de solo lectura (por ejemplo `interactive={false}`) que aplique `pointerEvents="none"` únicamente al `MapLibreMap`, y quitar `pointerEvents` y `accessible` del contenedor (dejar la etiqueta `routeA11y` solo sobre el mapa). Comprobar que el cuadro de error cabe en 240 pt a 200 %.

### H2 (medio) T-121: la atribución larga y el botón «Mi ubicación» se pisan

- Dónde: `src/components/map/TripMap.js:171-186` y `src/screens/home/HomeScreen.js:138-141`.
- Qué se ve (por lectura): la atribución (unos 95 caracteres) va abajo a la izquierda sin el inset inferior y con `right: undefined`; a 200 % ocupa un bloque alto. El botón se dibuja encima, a la derecha y con `bottom: insets.bottom + space[4]`, y la tapa.
- Regla incumplida: contenido legal legible, sin solapamientos; consistencia de márgenes con safe area.
- Corrección: en `TripMap` añadir un margen derecho reservado (por ejemplo `attributionInsetRight` = `touch.min + space[3] + space[2]`) y sumar el inset inferior; mantener el botón por encima de la atribución. Verificar en el celular a 200 %.

### H3 (medio) T-119 y T-126: «Pago rechazado» sale en ámbar y su chip en rojo

- Dónde: `src/services/trip/chargePanel.js:57` (`CHARGE_TONE.WARNING` para `cardRejected`) frente a `src/screens/trip/TripSummaryScreen.js:71-75` (`CHIP_LOOK`: rechazado en `danger`).
- Qué se ve (por lectura): dos señales de tono distinto para el mismo estado, y el mensaje solo dice «Pago rechazado» sin indicar qué hacer.
- Regla incumplida: coherencia de tono por estado (D-83, el estado no depende solo del color) y mensaje que orienta la acción.
- Corrección: usar tono `danger` en el mensaje y un texto como «Pago rechazado. Toca «Reintentar pago»». CA-002-98 pide literalmente «Pago rechazado» con «Reintentar pago»: la ampliación del texto puede requerir confirmación del spec-author.

## En cola (menores, no bloquean)

- Detalle: la atribución queda arriba y cubre la ruta; usar `attributionAtBottom` (`TripDetailScreen.js:67`).
- Detalle: la fecha es solo `type.caption` (`TripDetailScreen.js:123`); falta jerarquía frente al estado.
- `PAYMENT_CHIP` duplicado en `TripListItem.js:21` y `tripDetailView.js`; mover a un solo módulo.
- `TripListItem.js:73`: icono de destino en `color.danger`; el rojo se reserva para error (D-83), usar `color.text` o `primary`.
- Fila del Historial sin indicio de toque (sin chevron), solo la pista de accesibilidad.
- Inicio: el `devPanel` (solo `SHOW_DEV_TOOLS`) también solapa botón y atribución.
- «Mi ubicación» no da respuesta cuando no hay posición.
- Pista del saldo en `type.caption` (`EarningsScreen.js:143-146`); sugerida `type.small`.
- A 200 %, `netValue` y `earningsValue` (`type.display`) pueden partir una cifra larga; acotar con `maxFontSizeMultiplier` o ajustar el tamaño.
- El selector de periodo puede partir «semana» a 200 % con el icono de seleccionado.
- Mensajes informativos del panel de cobro son `Text` suelto, no tarjeta como los demás tonos.
- `paymentServiceError`: los mensajes de sin red, tiempo agotado y fallo del servidor son casi iguales salvo el título.
- `paymentCardNote` es un texto largo en 12 pt.

## Campo Diseño

| Tarea | Veredicto |
|---|---|
| T-124 | Aprobado condicionado a celular (sin hallazgos medios) |
| T-123 | Aprobado condicionado a celular (sin hallazgos medios) |
| T-110 | Pendiente (H1) |
| T-121 | Pendiente (H2) |
| T-119 | Pendiente (H3) |
| T-126 | Pendiente (depende de H3: los textos de error son claros, el tono del rechazo no) |

Ronda 2 (última permitida): verificar H1 a H3 tras la corrección del implementer y revisar la cola.
