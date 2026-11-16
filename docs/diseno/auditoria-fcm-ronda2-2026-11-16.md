# Auditoría de diseño — spec 003 FCM, S5 / STOP-3, pasada posterior al pulido (2026-11-16)

Auditor: design-auditor (distinto del implementer). Alcance: contador «Vence en N s» rediseñado (D-150), O-09, O-11 y el addendum de `auditoria-fcm-2026-11-16.md`.
Numeración: el informe anterior ya cerró «Ronda 2» (mismo día). Esta es la **tercera pasada** sobre S5, así que aplica la regla de escalada: no redondeo la nota; lo que falta lo decide Anderson con capturas.

## Evidencia y límites

- Capa E: Anderson validó en el celular (2026-11-16 12:51, build de desarrollo) **solo por su declaración textual**: interruptor visible y funcional, chip «Activadas» informativo, tarjeta emergente, pantalla de solicitud y notificación de prueba. No hay capturas (`docs/fcm/capturas/` no existe). No juzgo píxeles.
- Esa declaración demuestra que los controles existen y funcionan; **no** demuestra el aspecto nuevo (contador sin bloque, borde del botón, anuncios, fuente al 200 %).
- Revisión estática: código de `IncomingRequestCard.js`, `TripRequestScreen.js`, `PrimaryButton.js`, `NotificationsSection.js` y `tokens.js`; contrastes recalculados con la fórmula WCAG sobre los tokens. Skills aplicadas: frontend-design (jerarquía deliberada, sin decoración, restraint) y reglas de impeccable / ui-ux-pro-max (AA, 44 dp, estado no solo por color, acción primaria dominante, tope de fuente). Ninguna choca con el proyecto.

## Contrastes recalculados (coinciden con el implementer)

| Par | Ratio | Umbral | Resultado |
|---|---|---|---|
| Texto `primary` sobre `surface` (contador normal) | 6,08:1 | 4,5:1 | Cumple |
| Texto `danger` sobre `surface` (contador urgente) | 6,54:1 | 4,5:1 | Cumple |
| Barra `primary` sobre pista `primarySoft` | 5,12:1 | 3:1 | Cumple |
| Barra `danger` sobre pista `primarySoft` | 5,50:1 | 3:1 | Cumple |
| Borde `border` sobre `surfaceMuted` (O-09) | 3,65:1 | 3:1 | Cumple (antes 1,40:1) |
| Borde `border` sobre `bg` (O-09) | 3,45:1 | 3:1 | Cumple |
| Texto `textMuted` sobre `surfaceMuted` (botón inactivo) | 6,83:1 | 4,5:1 | Cumple |

Nota: la pista `primarySoft` sobre `surface` es 1,19:1; la pista sola casi no se ve, pero el dato lo da el número y el relleno de la barra (5,12:1). No es defecto.

## Veredicto por punto (revisión estática)

- (a) Contador. Sin relleno, sin radio de botón, sin sombra: deja de parecer botón. «Aceptar» sigue siendo el único control relleno (`PrimaryButton`, 48 dp, `elevation.card`) y la jerarquía de acción primaria se mantiene. Tamaño constante (sin salto de layout al volverse urgente), `maxFontSizeMultiplier={maxFontScale}` (1,5) en el texto, grupo `accessible` con etiqueta y región viva aparte que solo anuncia a 10, 5 y 0 s: correcto. Tope 1,5 está dentro de lo pedido (130–150 %); queda por debajo del 200 % de WCAG 1.4.4 para ese texto, decisión consciente documentada en `tokens.js`. Observaciones H-1 y H-2 abajo.
- (b) O-09: contraste de borde correcto (3,65:1 y 3,45:1); el botón inactivo se lee como botón inactivo. Falta verlo.
- (c) O-11: chip informativo no pulsable, `accessibilityValue.text` con el texto del chip, `busy` en el estado, solo la pista atenuada. Correcto en código; riesgo de doble anuncio en H-3.
- (d) Addendum: coherente con el código; no contradice el informe anterior.

## Hallazgos para el implementer (máximo tres)

1. **H-1 — severidad MEDIA — El estado urgente se distingue solo por matiz.** `IncomingRequestCard.js:536-538,549-551` y `TripRequestScreen.js:580-582,593-595`: al llegar a 10 s, texto y barra pasan de `primary` a `danger`. Las dos luminancias son casi iguales (6,08 y 6,54:1), así que la diferencia depende del tono (mal para daltonismo rojo-verde y para visión baja). Lo único no cromático es el número que baja y la barra que se acorta, que no marcan «ahora es urgente». Regla: estado no solo por color (DESIGN.md regla 2 de la guía de estilo; WCAG 1.4.1). Corrección: en urgente, mostrar un `Icon` (`alarm-outline`, `iconSize.md`) a la izquierda del texto en la misma fila, o poner la barra con altura `space[2]` solo en urgente (mismo bloque `countdown`, sin cambiar el alto total reservando `minHeight`). Preferible el icono: es texto + icono + color, sin salto.
2. **H-2 — severidad BAJA — El contador normal usa el mismo teal que «Aceptar» y es más grande.** `countdownText`: `type.title` (20 px) en `color.primary` sobre un botón con etiqueta de 16 px. Sin relleno ya no parece botón, pero compite en tamaño y en tono con la acción. Corrección condicional: si en el celular el ojo va primero al contador, pasar el texto normal a `color.text` (17:1 aprox.) y dejar el teal solo en el relleno de la barra. No cambiar antes de ver la captura.
3. **H-3 — severidad BAJA — Posible doble anuncio en el interruptor.** `NotificationsSection.js:141-151`: el `Pressable role="switch"` ya expone `accessibilityValue.text = chipLabel` y además contiene una vista con `accessibilityLiveRegion="polite"` con el mismo texto del chip. En TalkBack puede leerse dos veces («Activando…» como valor y como región). Corrección: probar con TalkBack; si se repite, quitar la región viva y dejar el valor (el estado `busy` cambia y Android lo anuncia), o al revés, pero no ambos.

## Veredicto de esta pasada

- Estático (capas A y C parcial, D por lectura): cumple; sin hallazgos altos. H-1 es el único punto que pediría corregir antes de aprobar el contador.
- Capa B (crítica sobre capturas) y capa E del aspecto nuevo: **no evaluables sin capturas**. No redondeo la nota.
- Escalada (tercera pasada): Anderson decide (1) si aplica H-1, y (2) manda las capturas pedidas: tarjeta y pantalla de solicitud con contador normal y urgente, botón de prueba inactivo (borde), interruptor ocupado con TalkBack, y tarjeta al 200 % de fuente, en `docs/diseno/auditorias/capturas/`.

## Estado de Diseño (campo de T-189)

- **Aprobado (parcial, por declaración de Anderson en el celular, no por píxeles):** interruptor de Notificaciones con chip informativo «Activadas» funcionando; tarjeta emergente y pantalla de solicitud operativas.
- **Pendiente de dispositivo (revisión estática hecha):** contador rediseñado (D-150), O-09, O-11 y sus anuncios, fuente al 200 %, H-1, H-2, H-3.

Diseño: Aprobado parcial; resto Pendiente de dispositivo
