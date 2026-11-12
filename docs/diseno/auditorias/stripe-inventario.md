<!-- AI-assisted: see docs/AI_LOG.md #58 -->
# Inventario de `testID`, accesibilidad y `labels.js` (R12, Stripe)

Tarea: T-134. Requisitos: RNF-19, RF-62. Criterio base: CA-002-127.
Fecha de captura de «Antes»: 2026-11-12. Método: Grep de solo lectura sobre el código; ningún archivo de código cambió.
Patrón usado: `testID|accessibilityRole|accessibilityLabel|accessibilityHint|accessibilityLiveRegion` en `TripSummaryScreen.js`, `chargePanel.js`, `SecondaryButton.js`, `TripListItem.js` y `TripDetailScreen.js`; lectura de `src/constants/labels.js` (`labels.trip`, `labels.history`).
La sección «Después» la completa T-155 con el mismo patrón y compara solo altas (excepción de DP-49: `labels.history.detail.methods`).

## Antes

### `src/screens/trip/TripSummaryScreen.js`
| Línea | Atributo | Valor |
|---|---|---|
| 235 | testID | `screen-trip-summary` |
| 250 | testID | `trip-summary-net` |
| 253 | accessibilityLabel | `` `${labels.trip.net}: ${formatCop(fare.driverEarnings)}` `` |
| 282 | testID | `trip-summary-payment` |
| 283 | accessibilityRole | `header` |
| 292 | testID | `trip-summary-payment-state` |
| 293 | accessibilityRole | `header` |
| 298 | testID | `trip-summary-payment-loading` |
| 300 | accessibilityLabel | `labels.trip.paymentLoading` |
| 301 | accessibilityLiveRegion | `polite` |
| 307 | testID | `trip-summary-payment-chip` |
| 315 | testID | `trip-summary-payment-actions` |
| 320 | testID | `` `trip-summary-action-${name}` `` |
| 324 | accessibilityHint | `action.busy === name ? labels.trip.paymentActionBusy : undefined` |
| 332 | testID | `trip-summary-saving` |
| 332 | accessibilityLiveRegion | `polite` |
| 339 | testID | `trip-summary-unavailable` |
| 339 | accessibilityLiveRegion | `polite` |
| 349 | testID | `messageTestID` (variable) |
| 349 | accessibilityLiveRegion | `panel.live` |
| 354 | testID | `messageTestID` (variable) |
| 354 | accessibilityLiveRegion | `panel.live` |
| 361 | testID | `trip-summary-leave-confirm` |
| 364 | accessibilityRole | `header` |
| 369 | testID | `trip-summary-leave-yes` |
| 371 | testID | `trip-summary-leave-no` |
| 385 | testID | `trip-summary-home` |
| 389 | testID | `trip-summary-confirm` |
| 393 | accessibilityHint | `labels.trip.confirmChargeHint` |
| 397 | testID | `trip-summary-leave` |
| 411 | accessibilityLabel | `` `${label}: ${value}` `` (fila `accessible`) |

### `src/services/trip/chargePanel.js`
Sin `testID` ni atributos `accessibility*` (lógica pura). Usa claves de `labels.trip`: `chargePanel` (línea 15), `paymentServiceError` y `paymentActionError` (línea 26), `saveErrorGeneric` (línea 39), `paymentActionError.cashFailed` (línea 48).

### `src/components/SecondaryButton.js`
| Línea | Atributo | Valor |
|---|---|---|
| 9 | prop | `testID` (firma: `testID, label, onPress, disabled, accessibilityHint, variant, style`) |
| 12 | testID | `testID` |
| 13 | accessibilityRole | `button` |
| 14 | accessibilityLabel | `label` |
| 15 | accessibilityHint | `accessibilityHint` |

### `src/components/TripListItem.js`
| Línea | Atributo | Valor |
|---|---|---|
| 53 | testID | `` `history-item-${trip.id}` `` |
| 56 | accessibilityLabel | `a11y` |
| 95 | testID | `` `history-item-open-${trip.id}` `` |
| 96 | accessibilityRole | `button` |
| 97 | accessibilityLabel | `a11y` |
| 98 | accessibilityHint | `labels.history.detail.openHint` |

### `src/screens/main/TripDetailScreen.js`
| Línea | Atributo | Valor |
|---|---|---|
| 54 | testID | `trip-detail-scroll` |
| 60 | testID | `trip-detail-map` |
| 62 | testID | `trip-detail-map-view` |
| 73 | testID | `trip-detail-no-route` |
| 74 | accessibilityLiveRegion | `polite` |
| 79 | testID | `trip-detail-card` |
| 83 | testID | `trip-detail-status` |
| 86 | testID | `trip-detail-rating` |
| 86 | accessibilityLabel | `view.rating.a11y` |
| 93 | testID | `` `trip-detail-${row.key}` `` |

### `src/constants/labels.js` — `labels.trip` (líneas 62 a 221)
Claves relacionadas con el cobro (valor literal):
| Línea | Clave | Valor |
|---|---|---|
| 75 | payment | `Pago` |
| 76 | paymentMethod | `{ card: 'Tarjeta', mercadopago: 'Mercado Pago', cash: 'Efectivo' }` |
| 139 | paymentTitle | `Cobro` |
| 140 | paymentSimulated | `Pago de prueba: no se mueve dinero real.` |
| 141 | paymentCash | `Efectivo: recibe el pago del pasajero en mano.` |
| 142 | paymentTransfer | `Transferencia a tu cuenta de Mercado Pago ({email}).` |
| 143 | paymentTransferNoEmail | `Transferencia a tu cuenta de Mercado Pago registrada.` |
| 144 | confirmCharge | `Confirmar cobro` |
| 145 | confirmChargeHint | `Guarda este viaje en tu historial` |
| 160-166 | paymentChip | `approved: Aprobado; pending: Pendiente; rejected: Rechazado; cash: Efectivo; unavailable: No disponible` |
| 168 | paymentStateTitle | `Estado del cobro` |
| 169 | paymentLoading | `Consultando el estado del cobro` |
| 170-173 | paymentOffline | `title: Sin conexión; message: No podemos consultar el estado del cobro sin internet. Tu viaje está guardado; puedes volver a Inicio y revisarlo después.` |
| 174-177 | paymentBackendUnavailable | `title: Servicio de cobro no disponible; message: No pudimos contactar el servicio de cobro. Tu viaje está guardado; puedes volver a Inicio y cobrar más tarde.` |
| 178-181 | paymentError | `title: No pudimos consultar el cobro; message: Algo falló al traer el estado del cobro. Tu viaje está guardado; vuelve a Inicio e inténtalo más tarde.` |
| 182-187 | paymentAction | `charge: Cobrar con Mercado Pago; retry: Reintentar pago; verify: Verificar pago; confirmCash: Confirmar efectivo recibido` |
| 190-198 | chargePanel | `cashPending: Falta confirmar que recibiste el efectivo.; cashCollected: Efectivo recibido. El viaje quedó guardado en tu historial.; cardPending: Viaje guardado. Falta el pago con Mercado Pago.; cardApproved: Pago aprobado. El viaje quedó guardado en tu historial.; cardRejected: Pago rechazado. Toca “Reintentar pago”.; savedOnly: Viaje guardado en tu historial.; serviceError: No pudimos completar la acción con el servicio de cobro. Inténtalo de nuevo.` |
| 199 | paymentActionsTitle | `Acciones de cobro` |
| 200 | paymentActionBusy | `Procesando…` |
| 201 | paymentCardNote | `Después de pagar en el navegador, vuelve a la app. El estado cambia solo cuando Mercado Pago lo confirma; esta pantalla no lo marca.` |
| 202 | paymentCashCollected | `Efectivo cobrado.` |
| 204-213 | paymentServiceError | claves `notConfigured`, `offline`, `timeout`, `serverError`, `sessionExpired`, `notFound`, `invalidResponse`, `providerError` (cada una `{ title, message }`; ver el archivo) |
| 214-220 | paymentActionError | claves `offline`, `backendUnavailable`, `failed`, `openFailed`, `cashFailed` (cada una `{ title, message }`) |

El resto de `labels.trip` (solicitud, viaje en curso, cancelar, salir, guardar: líneas 63 a 158) no cambia en R12.

### `src/constants/labels.js` — `labels.history` (líneas 248 a 316)
| Línea | Clave | Valor |
|---|---|---|
| 252 | status | `{ completed: 'Completado', cancelled: 'Cancelado' }` |
| 258 | itemA11y | `{status}. {date}. {passenger}. De {origin} a {destination}.` |
| 259 | itemA11yAmounts | ` Tarifa {fare}. Tu ganancia {net}.` |
| 267 | periodsA11y | `Periodo del historial` |
| 268 | periods | `{ day: 'Hoy', week: 'Semana', month: 'Mes', range: 'Rango' }` |
| 269 | methodsA11y | `Método de pago` |
| 270 | methods | `{ all: 'Todos', mercadopago: 'Tarjeta', cash: 'Efectivo' }` |
| 278 | paymentStatus | `{ pending: 'Pago pendiente', approved: 'Pago aprobado', rejected: 'Pago rechazado', paid: 'Pagado' }` |
| 279 | paymentUnknown | `Pago sin estado` |
| 280 | legacyPayment | `Cobro simulado` |
| 281 | itemPayment | ` {payment}.` |
| 292-315 | detail | `title: Detalle del viaje; method: Método de pago; status: Estado; methods: { mercadopago: 'Tarjeta', cash: 'Efectivo' } (línea 306); methodUnknown: No disponible; back: Volver al historial; openHint: Abre el detalle del viaje; emptyTitle: No encontramos este viaje; emptyMessage: Vuelve al historial y elige otro viaje.` y demás claves de detalle (duración, distancia, comisión, propina, calificación, ruta) |

Resto de `labels.history` (vacío, error, paginación, rango, gráfica: líneas 249 a 290) sin relación con R12.

## Después

Tarea: T-155. Fecha de captura de «Después»: 2026-11-12. Método: el mismo Grep de solo lectura de «Antes» sobre los mismos cinco archivos, más lectura de `labels.trip`, `labels.history` y `chargePanel.js`; ningún archivo de código cambió.
Resultado: solo hay altas, salvo los cambios marcados **CAMBIO**. Ningún `testID`, `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` ni clave de `labels` de «Antes» desaparece. Los números de línea de «Antes» se desplazaron (p. ej. en `TripSummaryScreen.js` unas 14 líneas); la comparación es por atributo y valor, no por línea.

### Altas de `testID` (ADICIÓN)
| Archivo | testID | Notas |
|---|---|---|
| `src/screens/trip/TripSummaryScreen.js` (línea 338, plantilla `trip-summary-action-${key}`) | `trip-summary-action-charge-stripe` | Botón «Cobrar con Stripe (tarjeta de prueba)». Lo produce `chargeButtons` con `key = ${action}-${provider}`. |
| ídem | `trip-summary-action-retry-stripe` | Botón «Reintentar pago con Stripe (tarjeta de prueba)». |

Sin cambio de testID existente: `trip-summary-action-charge` y `trip-summary-action-retry` se conservan para Mercado Pago (la clave de Mercado Pago sigue siendo la acción sola); `trip-summary-action-verify` y `trip-summary-action-confirmCash` siguen igual. No hay más `testID` nuevos en `TripSummaryScreen.js`, `chargePanel.js` (sigue sin `testID`), `SecondaryButton.js`, `TripListItem.js` ni `TripDetailScreen.js`; la lista de `testID` de esos archivos coincide con «Antes».

### Atributos de accesibilidad
Sin altas ni cambios en los cinco archivos: el conjunto de atributos y valores de «Antes» se mantiene (el `accessibilityHint` de los botones de acción sigue siendo `labels.trip.paymentActionBusy` mientras `action.busy === key`; ahora la comparación usa `key` y no `name`, de modo que cada botón de pasarela indica su propio estado ocupado, y el `label` del botón también cambia a «Procesando…» mientras está ocupado, como antes).
Región `polite`: **sin cambio**. `accessibilityLiveRegion={panel.live}` sigue siendo `polite` (constante `LIVE` de `chargePanel.js`) en todos los retornos; los demás `accessibilityLiveRegion="polite"` (`trip-summary-payment-loading`, `trip-summary-saving`, `trip-summary-unavailable`, `trip-detail-no-route`) no cambian.

### Altas en `labels.trip` (ADICIÓN)
| Clave | Valor |
|---|---|
| chargeProvider.mercadopago | `Cobrar con Mercado Pago` |
| chargeProvider.stripe | `Cobrar con Stripe (tarjeta de prueba)` |
| retryProvider.mercadopago | `Reintentar pago con Mercado Pago` |
| retryProvider.stripe | `Reintentar pago con Stripe (tarjeta de prueba)` |
| chargePanel.cardRejectedChoose | `Pago rechazado. Elige una opción de reintento.` |
| chargePanel.noGateway | `No hay una pasarela de pago configurada` |
| chargePanel.cardPendingGeneric | `Viaje guardado. Falta el pago con tarjeta.` |
| paymentCardNoteGeneric | `Después de pagar en el navegador, vuelve a la app. El estado cambia solo cuando la pasarela lo confirma; esta pantalla no lo marca.` |

Se conservan sin cambio de valor: `paymentAction.charge` («Cobrar con Mercado Pago»), `paymentAction.retry` («Reintentar pago»; se usa cuando hay una sola pasarela), `paymentAction.verify`, `paymentAction.confirmCash`, `chargePanel.cardPending`, `chargePanel.cardRejected`, `paymentCardNote`, `paymentMethod`, `paymentChip`, `paymentServiceError` y `paymentActionError`.

### Altas en `labels.history` (ADICIÓN)
| Clave | Valor |
|---|---|
| detail.methods.stripe | `Tarjeta (Stripe)` |

### Cambios de valor (CAMBIO, no adición; excepción de DP-49)
| Clave | Antes | Después |
|---|---|---|
| `labels.history.detail.methods.mercadopago` (línea 321) | `Tarjeta` | `Tarjeta (Mercado Pago)` |

Sin cambio: `labels.history.methods` (filtro, línea 284) sigue `{ all: 'Todos', mercadopago: 'Tarjeta', cash: 'Efectivo' }` y `detail.methods.cash` sigue `Efectivo`. El filtro de método no tiene entrada `stripe`.

### Comportamiento que cambia sin cambiar atributos
`chargePanel.js` (lógica pura) ahora elige entre `cardPending`/`cardPendingGeneric`, `cardRejected`/`cardRejectedChoose` y `noGateway` según las pasarelas configuradas, y `paymentCardNote`/`paymentCardNoteGeneric` según `genericCardNote` en la pantalla. Con las pasarelas desconocidas o solo Mercado Pago, los textos y botones son los de «Antes». Nuevas exportaciones de `chargePanel.js`: `CHARGE_PROVIDERS`, `chargeButtons`.
