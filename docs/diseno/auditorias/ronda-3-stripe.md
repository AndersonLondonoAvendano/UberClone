<!-- AI-assisted: design-auditor, ronda 3 (R12 Stripe, T-156) -->
# Ronda 3 (estática): botones por pasarela, mensaje sin pasarela y detalle (T-147, T-150)

Fecha: 2026-11-12. Tipo: auditoría ESTÁTICA por código. No hay capturas del celular ni del arnés (el arnés no renderiza pagos). Cubre capa A (lectura) y D (checklist por código); las capas B, C y E quedan pendientes de capturas. Nada de lo de abajo es captura del celular.
Archivos leídos: `src/screens/trip/TripSummaryScreen.js`, `src/services/trip/chargePanel.js`, `src/components/SecondaryButton.js`, `src/components/DataRow.js`, `src/constants/labels.js`, `src/theme/tokens.js`, `src/services/trip/tripDetailView.js`, spec CA-002-122/124/127, inventario T-134.

## Puntos juzgados

| # | Punto | Resultado | Evidencia |
|---|---|---|---|
| 1 | Estilos cerrados: sin hex sueltos, solo tokens | Pasa (verificado por código) | Grep de `#hex` en `TripSummaryScreen.js` y `TripDetailScreen.js`: 0; estilos con `color`, `space`, `type`, `iconSize` (TripSummaryScreen.js:48, 435-521). |
| 2 | Componentes del sistema (Card, Chip, DataRow, Icon, SecondaryButton) e Inter | Pasa | TripSummaryScreen.js:24-31; `type.*` usa Inter por peso (tokens.js:40-58). |
| 3 | Textos en `labels.js`, sin literales | Pasa | `chargeProvider`, `retryProvider`, `noGateway`, `cardPendingGeneric`, `cardRejectedChoose` (labels.js:189-209); `methods.stripe` (labels.js:321). |
| 4 | Objetivo táctil 48 dp | Pasa | SecondaryButton.js:28 `minHeight: touch.controlHeight` (48, tokens.js:67); `gap: space[2]` entre botones (TripSummaryScreen.js:482). |
| 5 | Ajuste a 200 %, rótulo largo sin corte | Pasa por código; No verificado en dispositivo | Botón sin altura fija, solo `minHeight`; el `Text` no tiene `numberOfLines` (SecondaryButton.js:21, 43-47); 0 `numberOfLines` en la pantalla; `lineHeight` de tokens escala con el texto. Rótulo de 40 caracteres («Reintentar pago con Stripe (tarjeta de prueba)», labels.js:196) se parte en varias líneas. Falta verlo a 200 %. |
| 6 | Detalle: «Tarjeta (Stripe)» sin corte | Pasa por código; No verificado en dispositivo | `DataRow` envuelve y `flexShrink: 1` en etiqueta y valor (DataRow.js:31-41); sin `numberOfLines`. |
| 7 | Contraste por tokens | Pasa | Botón: `color.text` sobre `color.surface`, borde `color.border` #77847F (DESIGN.md:27); mensajes con pares `on*Soft` (TripSummaryScreen.js:74-76, 491-505); nota en `textMuted` #4A5A54. Estado deshabilitado a `opacity.disabled` 0.5 es exento. Contraste real de pantalla: No verificado en dispositivo. |
| 8 | Rol y nombre accesibles | Pasa | SecondaryButton.js:13-14 `accessibilityRole="button"` y `accessibilityLabel={label}`; cada botón con `testID` único (TripSummaryScreen.js:338). |
| 9 | Una sola región `polite` | Pasa | Mensaje único (TripSummaryScreen.js:367/372). Las otras regiones (`saving` 350, `unavailable` 357, `loading` 315) son excluyentes con el mensaje: `showMessage` exige `saved && !paymentLoading` (190) y `saving`/`unavailable` solo existen antes de guardar. Los botones no crean regiones nuevas. Anuncio real con TalkBack: No verificado en dispositivo. |
| 10 | Sin `Alert` | Pasa | Grep: solo un comentario (TripSummaryScreen.js:13). |
| 11 | Mensaje «No hay una pasarela de pago configurada» | Pasa con reserva | Tono `INFO` (chargePanel.js:100) no tiene entrada en `MESSAGE_LOOK` (TripSummaryScreen.js:73-77), así que se pinta como `Text` plano `type.body` sin icono ni Card (372-374). Coherente con «sin botones» y sin alarma, pero es el único mensaje de estado sin icono; sin la captura no se sabe si se lee como mensaje o como texto suelto. |
| 12 | Jerarquía de dos botones secundarios | Coherente por código; confirmar en captura | Son alternativas pares, ambas `SecondaryButton`, sin primario dentro de la tarjeta; el único primario de la pantalla es «Volver a Inicio» fijo abajo (TripSummaryScreen.js:403). No hay competencia entre los dos cobros, pero con el cobro pendiente el elemento más fuerte de la pantalla es la salida, no el cobro. Lo mismo ocurría con un solo botón; no es regresión. |
| 13 | Dos botones «Cobrar con…» con `disabled` común mientras uno procesa | Pasa | `disabled={actionBusy}` (341); el activo cambia a «Procesando…» (339). |

## Hallazgos (máximo tres)

### H1 (medio, contenido del panel): el texto de cobro nombra Mercado Pago aunque el viaje sea de Stripe
- Dónde: TripSummaryScreen.js:142-149 y 300. `paymentText` se calcula con `payment` (método de la solicitud) y siempre usa `labels.trip.paymentTransfer` («Transferencia a tu cuenta de Mercado Pago ({email})»), mientras el panel ya usa `method` del viaje guardado (170).
- Regla incumplida: coherencia de contenido y RF-62 (el panel no debe nombrar una pasarela que no es la del viaje); CA-002-124 pide mensaje genérico con Stripe.
- Corrección: cuando `method === SAVED_PAYMENT.STRIPE` (o con Stripe configurada y sin elegir), usar un texto sin pasarela de `labels.js` (por ejemplo «El pago se cobra con tarjeta.») en lugar de `paymentTransfer`. Va al `implementer`; el diseño del texto lo decide el spec-author.
- Captura que lo confirma: resumen de un viaje pagado con Stripe (T-147).

### H2 (bajo): «Procesando…» se anuncia dos veces en el botón ocupado
- Dónde: TripSummaryScreen.js:339 y 342. El `label` (y por tanto `accessibilityLabel`) pasa a «Procesando…» y el `accessibilityHint` repite «Procesando…».
- Regla incumplida: etiquetado accesible sin redundancia (RNF-19).
- Corrección: dejar el hint solo en `undefined` y conservar el cambio de rótulo, o conservar el rótulo y dejar el hint. No es nuevo de R12 (viene de T-97), pero ahora aplica a dos botones.

### H3 (bajo, a confirmar en captura): mensaje sin pasarela sin icono ni Card
- Ver punto 11. Si en la captura se lee como texto suelto, darle tono `warning` o `info` con Card e icono (añadir `INFO` a `MESSAGE_LOOK`, `chargePanel.js:13`). Es una decisión de spec (CA-002-122 no fija el tono); si se cambia, devolver al spec-author.

## Decisión del campo Diseño
- T-147: se mantiene **Pendiente**. Motivos: H1 es juzgable por código y falla; además faltan las capturas del celular (capa E) para 200 %, anuncio `polite`, jerarquía y el mensaje sin pasarela.
- T-150: se mantiene **Pendiente**. El texto cumple por código (puntos 3, 6) pero «sin corte a 200 %» es **No verificado en dispositivo** y la rúbrica exige la capa E para aprobar.
- No se editó `docs/backlog.md` (ambas líneas ya dicen Pendiente). Ronda 1 de 3 para esta pantalla en R12; no se escala.

## Capturas que pedir a Anderson (development build, `docs/diseno/auditorias/capturas/`)
1. Resumen con tarjeta pendiente y las dos pasarelas configuradas: dos botones visibles (T-147).
2. La misma pantalla con tamaño de texto del sistema al máximo (200 %): rótulo «Cobrar con Stripe (tarjeta de prueba)» partido en líneas, sin corte (T-147).
3. Resumen con ninguna pasarela configurada: mensaje «No hay una pasarela de pago configurada» y «Verificar pago».
4. Resumen de un viaje pagado con Stripe (para H1) y el rechazado con los dos botones «Reintentar…».
5. Detalle de un viaje de Stripe en historial, normal y a 200 %: «Tarjeta (Stripe)» (T-150).
6. Opcional: TalkBack recorriendo los dos botones; anotar si el mensaje se anuncia una sola vez.
