# Análisis: solicitudes automáticas que no llegaban en el APK de release

Estado: **No verificado en dispositivo (STOP-9)**. Decisión: [D-199](decisiones.md). Tarea: T-284 (código en T-282 y T-283). AI-assisted: see AI_LOG.md #72

Sin secretos ni datos personales: solo nombres de archivo, líneas y códigos.

## Síntoma (evidencia de Anderson)

El 2026-11-16 a las 20:16, con el APK de release recién instalado, las solicitudes automáticas no llegaban. Al **reiniciar el backend sin tocar la app** llegaron. En el registro del backend se veía la secuencia `200` / `200 (ignorado)` / `200` para los reportes de disponibilidad: el servidor contestaba bien (HTTP 200) pero no hacía nada.

## Qué está probado por código

1. El backend guarda en memoria, por uid, la última `seq` aceptada (`accepted`, [generator.js:25](../backend/src/notifications/generator.js#L25)) y descarta cualquier reporte con `seq` menor o igual con `isStale` ([generator.js:93-96](../backend/src/notifications/generator.js#L93-L96)); `report` sale sin efecto en [generator.js:122](../backend/src/notifications/generator.js#L122).
2. La ruta respondía en ese caso con `ignored()`, que devolvía `200 { active }` sin ninguna señal de que el reporte no se había aplicado (antes: `routes/notifications.js` L119-L120, L128, L133 en el código previo a esta corrección; ahora [notifications.js:124-138](../backend/src/routes/notifications.js#L124-L138), con `applied:false` y `lastSeq`).
3. La app antigua no podía enterarse: `nextSeq` ([availabilityReporter.js](../src/services/notifications/availabilityReporter.js), antes L64-L69, ahora [L75](../src/services/notifications/availabilityReporter.js#L75)) guardaba `lastSeq` solo en memoria y el reintento solo miraba `ok`/`active`. Con `active:false` en la respuesta ignorada, la app trataba el `true` como no confirmado y volvía al simulador interno, sin dar más pistas.
4. Reiniciar el backend vacía `accepted`, por eso la primera `seq` de la app volvía a aceptarse: coincide con lo observado.

## Qué NO se puede probar por código

**Por qué la `seq` de la instalación nueva era menor** que la que el backend ya recordaba. El código de la app ya usaba `Date.now()` como base (`max(Date.now(), lastSeq + 1)`), así que una instalación nueva debería haber enviado valores mayores. Para que fuesen menores, la fuente de la `seq` mayor tuvo que ser un reloj distinto: p. ej. un emulador o la instalación anterior con la hora del dispositivo adelantada, o un cambio de hora/zona del dispositivo. Ninguna de esas cosas queda registrada en el repositorio, y no hay logs del dispositivo de esa noche; se deja como hipótesis, no como hecho.

## Por qué la corrección no depende de esa causa

- El backend sigue ignorando solo `seq` menor o igual (protección D-198 intacta) pero ahora **responde con `applied:false` y `lastSeq`** ([notifications.js:124](../backend/src/routes/notifications.js#L124), `lastSeq` en [generator.js:113](../backend/src/notifications/generator.js#L113)).
- La app, ante `applied:false` con `lastSeq` numérico, reintenta **una vez** con una `seq` mayor ([availabilityReporter.js:129-150](../src/services/notifications/availabilityReporter.js#L129-L150)); si vuelve a ignorarse, no confirma y no hay bucle. Esto recupera la sesión sea cual sea el motivo de la diferencia (reloj, reinstalación, otra instalación).
- Además la última `seq` se guarda en el dispositivo ([seqStore.js](../src/services/notifications/seqStore.js)) y no se borra al cerrar sesión, de modo que sigue creciendo entre reinicios y reinstalaciones que conserven el almacenamiento.
- El rastro de cada reporte (`availability:sent|applied|ignored-seq|retry-greater-seq|failed-retry|failed`) se imprime solo en `__DEV__` ([notificationsService.js](../src/services/notifications/notificationsService.js)); en release no imprime nada, así que la confirmación de que la causa era esta tiene que salir de la prueba en el celular.

## Comprobaciones del reporte en release (sin depender de `__DEV__` ni del dev client)

Por lectura y con prueba (`scripts/tests/availabilitySeq.test.mjs`): el reportador, el almacén de `seq` y el hook `useRequestSource` no referencian `__DEV__` ni el dev client; la disponibilidad efectiva (`available && !onTrip && notificationsReady`) se reenvía en cuanto pasa a `true` por `update()`, sin esperar el latido de 5 min.

## Qué debe ver Anderson (STOP-9)

Con el APK de release e «Disponible» activado, las solicitudes llegan sin reiniciar el backend, incluso tras reinstalar. Si no llegan, anotar la hora para cruzarla con el registro del backend (HTTP 200 sin cambios de estado). Hasta que lo confirme: No verificado en dispositivo.
