# Informe B5 — `timeInterval` en expo-location (T-210, CA-004-16)

Fecha: 2026-11-16. Resultado: NO se toca el código.

Evidencia:
- Versión instalada: `expo-location ~57.0.23` (`package.json`). `node_modules/expo-location/build/Location.types.d.ts:110-115`: `timeInterval?: number` es "tiempo mínimo entre actualizaciones en ms. El valor por defecto puede depender de `accuracy`", `@platform android`. No se consultó la doc en línea; la decisión se apoya en el `.d.ts` instalado (C17).
- Código real: `src/services/location/gpsLocationSource.js:71-76` usa `accuracy: Balanced`, `distanceInterval: GPS_DISTANCE_INTERVAL_M` (10 m, `src/config/location.js:8`) y `mayShowUserSettingsDialog: false`.

Motivo para no tocar:
1. Es solo Android: en iOS no tendría efecto, así que no es un cambio uniforme.
2. El valor por defecto depende de `accuracy`, que no está documentado con cifra; fijar 1000 ms podría cambiar la frecuencia efectiva respecto de lo ya validado en dispositivo (`distanceInterval` 10 m más el throttle de 5 s / 20 m). El plan §3.9 manda no tocar en ese caso y RC-07 lo permite.
3. No se puede comprobar con los tests (la fuente GPS es nativa); el riesgo recae solo en el dispositivo.

Sin cambios en `gpsLocationSource.js`, `config/location.js`, `locationPolicy.js` ni `throttle.js`. Suite: `npm test` 155 pass, 0 fail.
