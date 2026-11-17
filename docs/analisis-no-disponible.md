<!-- AI-assisted: see AI_LOG.md #70 -->
# Análisis: «No disponible» no detenía las solicitudes automáticas (STOP-8)

Corrección ordenada por Anderson (#70, D-198, completa D-197). Método: lectura del código y de las pruebas, sin suponer. No contiene secretos.

**Nota sobre las líneas.** Las referencias «antes» provienen de la lectura previa a la corrección, que reescribió el reportador; ya no existen con esos números. Las referencias «ahora» apuntan al código corregido.

## Causa real: S3 + S2 (con S6 como consecuencia)

**S3 (causa principal).** El reportador antiguo (`availabilityReporter.js`, función `reportFalse`, ≈L80 antes) enviaba el `false` una sola vez e ignoraba el resultado. Si esa petición fallaba (red móvil al ir a segundo plano, 429, 5xx, tiempo agotado), el backend seguía con el generador activo y nada lo corregía. Ahora: `attemptFalse` y `retryPendingFalse` en [availabilityReporter.js:105-135](../src/services/notifications/availabilityReporter.js#L105-L135), con esperas `FALSE_RETRY_DELAYS_MS = [1000, 2000, 4000]` (L32).

**S2 (causa concurrente).** No había orden entre reportes. Un `true` en vuelo podía llegar después del `false` y recrear la entrada del generador en el backend (`report` antiguo del generador, sin contador). Ahora: `seq` monótono asignado al enviar (`nextSeq`, [availabilityReporter.js:64](../src/services/notifications/availabilityReporter.js#L64)); el backend ignora `seq` menor o igual al último aceptado por uid ([generator.js:92-123](../backend/src/notifications/generator.js#L92-L123)).

**S6 (consecuencia).** En segundo plano no hay latido (el temporizador solo corre en primer plano y con estado efectivo), así que un `false` perdido quedaba sin corregir hasta el máximo de 30 min. Ahora el `false` pendiente se reintenta al volver a primer plano y en el siguiente `update` (`retryPendingFalse`, L130), y el backend tiene la barrera de S5.

## Solo riesgos (no eran la causa)

- **S1.** El mínimo de 60 s entre reportes ya se saltaba en los cambios de estado (`update()` enviaba el `false` de inmediato). Riesgo, no causa. Ahora tiene prueba.
- **S4.** El latido ya exigía estado efectivo y primer plano ([availabilityReporter.js:159](../src/services/notifications/availabilityReporter.js#L159)); `useRequestSource.js:23` calcula `effective = available && !onTrip && notificationsReady`. Seguro por construcción, ahora con prueba y con la evaluación al enviar en `reportTrue` (L136). Un `true` perdido solo provoca un `false` con reintento, nunca otro `true`.
- **S5 (parcial).** Ya existían `drop` en `false` y la guarda de envío en curso. Faltaba la barrera «el último reporte aceptado es `true`»: añadida en `fire()` ([generator.js:48-52 y 67-71](../backend/src/notifications/generator.js#L48-L52)).

## Qué se cambió

- Backend (T-279): `seq` opcional validado (entero seguro > 0, si no 400); `seq` obsoleto responde 200 sin efecto; barrera en `fire()`; poda del mapa de últimos aceptados.
- App (T-280): `seq` en cada envío, `false` inmediato, reintentos acotados, cancelación si cambia el estado, `true` solo con estado efectivo.
- Contrato: D-198. El cuerpo sigue siendo `{available}` o `{available, seq}`; sin uid, tokens ni textos.

## Lo que sigue siendo normal

Una solicitud ya entregada a FCM puede llegar hasta 90 s después (TTL). No es un fallo.

## Estado

**Validada en dispositivo por Anderson (STOP-8b, 2026-11-16 19:40):** con «No disponible» y la app en segundo plano no llegan notificaciones nuevas; encender y apagar rápido y dejarlo apagado no genera nuevas; volver a «Disponible» reanuda en ≈ 30 s. El punto 4 de STOP-8 (19:10) fue el que falló y motivó esta corrección.
