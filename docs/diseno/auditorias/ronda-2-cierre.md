# Ronda 2 de auditoría de diseño: cierre de la spec 002 (T-130)

Fecha: 2026-11-12. Tipo: estática, por lectura del código (sin capturas del celular). Auditor: design-auditor. Tareas: T-110, T-119, T-121, T-126. Ronda 2 de 2 (última permitida). Parte de `docs/diseno/auditorias/ronda-1-cierre.md`.

## Capas

| Capa | Resultado |
|---|---|
| A automática | Sin hex ni números sueltos en las líneas revisadas (lectura); los scripts no se ejecutaron en esta ronda. |
| B Taste, C Impeccable | Sin nota: no hay capturas. No se presenta ninguna captura del arnés como del celular. |
| D UI UX Pro Max | Por lectura: H1 a H3 resueltos; sin hallazgos nuevos medios. |
| E celular | Pendiente. Mapa, botón «Mi ubicación», atribución y 200 % de fuente: **No verificado en dispositivo**. |

## Verificación de los hallazgos de la ronda 1

| Hallazgo | Estado | Evidencia (lectura) |
|---|---|---|
| H1 (T-110) | Resuelto | `TripMap.js:51` añade `interactive = true` y `mapA11yLabel`. Con `interactive={false}` (`TripMap.js:167-173`) solo el contenedor del mapa lleva `pointerEvents="none"` y la etiqueta; el cuadro de error (`TripMap.js:129-135`) se devuelve antes y no hereda ese bloqueo, así que «Reintentar» recibe toques y lector. `TripDetailScreen.js:59-71` pasa `interactive={false}`, `mapA11yLabel={labels.history.detail.routeA11y}` y `attributionAtBottom`; el `View` externo ya no lleva `pointerEvents` ni `accessible`. |
| H2 (T-121) | Resuelto | `TripMap.js:161-163` suma `attributionInsetBottom` a `space[2]` y aplica `right` si `attributionInsetRight > 0`. `HomeScreen.js:116` pasa `attributionInsetRight={ATTRIBUTION_INSET_RIGHT}` y `attributionInsetBottom={insets.bottom}`; `HomeScreen.js:164` define `space[3] + touch.min + space[2]` (tokens, sin números sueltos). La atribución reserva el lado del botón. |
| H3 (T-119, T-126) | Resuelto | `chargePanel.js:57` usa `CHARGE_TONE.ERROR` para `cardRejected`, igual que el chip `danger` de `TripSummaryScreen`. `labels.js:195`: «Pago rechazado. Toca “Reintentar pago”.» (orienta la acción). Nota: el texto amplía el literal de CA-002-98; el agente principal debe confirmar con el spec-author. |

Sin hallazgos nuevos en esta ronda.

## Cola de menores (no bloquea; pendiente para el celular y la entrega)

Se mantiene la cola de la ronda 1, sin cambios de estado salvo que no se verificó su corrección:

- Detalle: la fecha es solo `type.caption` (`TripDetailScreen.js`); falta jerarquía frente al estado. (La atribución ya va abajo con `attributionAtBottom`.)
- `PAYMENT_CHIP` duplicado en `TripListItem.js` y `tripDetailView.js`; unificar en un módulo.
- `TripListItem.js`: icono de destino en `color.danger`; el rojo se reserva para error (D-83).
- Fila del Historial sin indicio de toque (sin chevron).
- Inicio: el `devPanel` (solo `SHOW_DEV_TOOLS`) también solapa botón y atribución.
- «Mi ubicación» no da respuesta cuando no hay posición.
- Pista del saldo en `type.caption` (`EarningsScreen.js`); sugerida `type.small`.
- A 200 %, `netValue` y `earningsValue` (`type.display`) pueden partir una cifra larga.
- El selector de periodo puede partir «semana» a 200 % con el icono de seleccionado.
- Mensajes informativos del panel de cobro son `Text` suelto, no tarjeta.
- `paymentServiceError`: mensajes de sin red, tiempo agotado y fallo del servidor casi iguales salvo el título.
- `paymentCardNote` es un texto largo en 12 pt.

## Para el celular (capa E)

- Detalle sin red: tocar «Reintentar» en el cuadro de error del mapa; a 200 % el cuadro debe caber en 240 pt.
- Inicio a 200 %: la atribución no queda tapada por «Mi ubicación» ni por la barra inferior.
- «Pago rechazado» en rojo con el texto «Pago rechazado. Toca “Reintentar pago”.» y el chip rojo coincidentes.

## Campo Diseño

| Tarea | Veredicto |
|---|---|
| T-110 | Aprobado condicionado a celular |
| T-121 | Aprobado condicionado a celular |
| T-119 | Aprobado condicionado a celular |
| T-126 | Aprobado condicionado a celular |

Ninguna tarea pasa a «Validada» sin la evidencia del celular (capa E).
