# Spec 004 — Cierre de brechas, lote L1 (desbloqueo)

Estado: **Borrador** (propuesta de `spec-author`; NO aprobada). Anderson delegó la ejecución continua en el prompt de hoy (2026-11-16); esa delegación no sustituye su aprobación de esta spec.
Fuente: `docs/plan-cierre-entrega-2026-11-16.md` (brechas G-01, G-02, G-15, G-17, G-21, G-22; requisitos R-040, R-084, R-088, R-090, R-121, R-039, R-058, R-115). G-06 (temporizador de 15 s) ya está en la spec 003 (RF-77, D-137) y no se repite aquí.
Los IDs `RC-nn` son locales de esta spec y no están aún en `docs/requisitos.md`. Si esta spec cambia tras aprobarse, planes, tema y tareas pueden quedar desactualizados.
Nota de numeración: `specs/README.md` lista un mapa antiguo (004 = tarifa-comision); el árbol real ya usa 002 y 003 distintas, así que este número es el siguiente libre.

## 1. Objetivo y porqué

Quitar del camino de la entrega seis defectos pequeños: datos de distancia y duración inventados, ganancias truncadas a 200 viajes, efectos sin limpieza verificada, suite de pruebas que «parece fallar», parámetro de GPS ausente y reglas de Firestore posiblemente sin publicar. Porqué: el taller exige distancia y duración reales (R-090, R-121) y totales correctos (R-088); el resto evita falsos fallos y fugas.

## 2. Qué ya existe (verificado)

- La solicitud simulada calcula `distanceKm = haversine × 1,3` y `durationMin` a 25 km/h (`src/services/passengerApi/mockPassengerApi.js:103-113`).
- Cliente OSRM existente: `fetchOsrmRoute(from, to)` en `src/services/routing/osrmRouting.js:7`.
- `calculateFare` única en `src/utils/fare.js` (R-084); ejemplo del enunciado 8,5 km / 22 min: Económico 19.200 y XL 26.900.
- `src/services/passengerApi/mappers.js` es el único archivo que conoce la forma de la API del pasajero (también existen `httpPassengerApi.js` y `contract.js`).
- `listenToTrips` limita a 200 (`src/services/tripRepository.js:14,46-47`) ordenando por `finishedAt`; el Historial pagina por `createdAt` con rango y 20 por página (`:59-86`).
- `TripActiveScreen.js` tiene tres `useEffect` (`:69`, `:80`, `:94`) sin verificación de limpieza.
- `package.json` solo tiene `start`, `android`, `ios` (`:34-38`); tres tests (`plateNormalization`, `registrationProgress`, `reverseGeocode`) requieren `scripts/tests/helpers/registerSrcLoader.mjs`.
- expo-location se usa con `distanceInterval` (`src/services/location/gpsLocationSource.js:74`), sin `timeInterval`.
- `firestore.rules` está fuera de git; el texto vigente de `validTrip()` está en `docs/seguridad.md:205` y la advertencia «NO publicada» en `:295`.

## 3. Requisitos

- **[RC-01]** (G-02; R-040, R-090, R-121) Cuando se cree una solicitud en la app (origen mock y origen push), el sistema deberá obtener distancia y duración de UNA sola llamada a OSRM origen→destino con timeout corto (≈2–3 s) y caché por par de coordenadas, y SOLO ENTONCES calcular la tarifa con `calculateFare` y mostrar la solicitud, de modo que la tarifa no cambie después de aparecer.
- **[RC-02]** (G-02; R-084) Si OSRM falla, responde inválido o supera el timeout, entonces el sistema deberá usar el cálculo actual (haversine × 1,3 y 25 km/h en el mock; valores de plantilla del servidor en el push) y marcar internamente que son estimados, sin mensaje al usuario.
- **[RC-03]** (G-02; R-084) El sistema deberá hacer una llamada por solicitud, nunca por movimiento ni por redibujado; deberá reutilizar `osrmRouting.js`; `mappers.js` seguirá siendo el único archivo que conoce la forma de la API del pasajero; `calculateFare` seguirá siendo la única función de tarifa.
- **[RC-04]** (G-22; R-088) Las ganancias de hoy, semana y mes deberán calcularse sobre TODOS los viajes de su periodo, sin el tope de 200 de `listenToTrips`, sin romper la paginación del Historial y sin disparar lecturas desproporcionadas (consulta acotada por rango, paginación interna o equivalente; lo decide el plan). Si exige índice compuesto o reglas, el texto exacto va en `docs/seguridad.md` con los pasos manuales de Anderson.
- **[RC-05]** (G-15; R-039, R-058) Los efectos de `TripActiveScreen.js` (≈ líneas 69, 80, 94) deberán liberar suscripciones, temporizadores y escuchas al desmontar o al cambiar dependencias; si ya lo hacen, el resultado es un reporte con evidencia archivo:línea y sin cambio de código.
- **[RC-06]** (G-21) El proyecto deberá tener un script npm `test` (solo script, sin dependencias) que ejecute toda la suite con `--import ./scripts/tests/helpers/registerSrcLoader.mjs`, documentado en el README.
- **[RC-07]** (G-17; R-115) Donde añadir `timeInterval` (1000 ms) a expo-location sea trivial y sin riesgo, el sistema deberá añadirlo; si no lo es (p. ej. altera la política de ubicación o la frecuencia de escritura de D-técnicas ya validadas en dispositivo), no se toca y se reporta.
- **[RC-08]** (G-01; R-053, R-054, R-103, R-106, R-108) La spec deberá entregar a Anderson una lista de comprobación para verificar que la regla `validTrip()` publicada coincide con la de `docs/seguridad.md:205`; el sistema SHALL NOT asumir que está publicada. Los cambios de reglas solo existen como texto en `docs/seguridad.md` (el archivo `firestore.rules` está fuera de git).

## 4. Criterios de aceptación

**B1 — Distancia y duración reales**
- **CA-004-01** Dado un par origen/destino y un OSRM falso que responde 8,5 km / 22 min, cuando se crea la solicitud, entonces `distanceKm = 8,5`, `durationMin = 22` y la tarifa es 19.200 (Económico) / 26.900 (XL). Verifica: test `node:test` con OSRM falso.
- **CA-004-02** Dado un OSRM falso que no responde dentro del timeout, cuando se crea la solicitud, entonces se usan los valores de respaldo y queda marcada como estimada internamente, sin texto nuevo en pantalla. Verifica: test con reloj/timeout inyectado.
- **CA-004-03** Dado OSRM con error HTTP o cuerpo inválido, entonces el resultado es el mismo respaldo de CA-004-02. Verifica: test.
- **CA-004-04** Dado el mismo par de coordenadas dos veces, entonces la segunda no llama a OSRM (caché). Verifica: contador del falso.
- **CA-004-05** Dada una solicitud, entonces OSRM se llama exactamente una vez y la tarifa se calcula una sola vez con los valores finales (nunca con los de respaldo si OSRM responde después). Verifica: contador de llamadas y de `calculateFare` en el test.
- **CA-004-06** Dado el flujo push, entonces distancia y duración salen de OSRM con el mismo respaldo (valores de la plantilla del servidor). Verifica: test con mapper y OSRM falso.
- **CA-004-07** Entonces ningún archivo fuera de `mappers.js` (y los adaptadores ya existentes) conoce la forma de la API del pasajero, y `calculateFare` sigue única. Verifica: `grep` y `node scripts/check-constitution.mjs` sin errores nuevos.
- **CA-004-08** No verificado en dispositivo: la tarjeta de solicitud muestra distancia/duración que coinciden con OSRM (±5 %) y la tarifa no cambia tras aparecer. Tarea: prueba en celular (la define el plan).

**B2 — Ganancias sin truncar**
- **CA-004-09** Dados más de 200 viajes en un periodo (repositorio falso), entonces hoy/semana/mes suman todos. Verifica: test con 250 viajes.
- **CA-004-10** Entonces la paginación del Historial (20 por página, `fetchTripsPage`) no cambia y sus tests existentes siguen pasando. Verifica: suite.
- **CA-004-11** Entonces el número de lecturas está acotado por el rango del periodo (una consulta por rango, sin lectura de toda la colección) y, si hace falta índice o regla, `docs/seguridad.md` contiene el texto exacto y los pasos. Verifica: lectura del plan/código y del documento.
- **CA-004-12** No verificado en dispositivo: totales de Ganancias coinciden con el Historial de un conductor con >200 viajes (o dato sembrado). Tarea: prueba en celular.

**B3 — Efectos de TripActiveScreen**
- **CA-004-13** Cada uno de los tres efectos devuelve limpieza correcta (o su ausencia está justificada) con evidencia archivo:línea en el reporte. Verifica: lectura de código; `check-constitution` sin aviso nuevo.

**B4 — Script `test`**
- **CA-004-14** `npm test` corre toda la suite y pasan los 40 tests (incluidos los 3 que hoy fallan). Verifica: ejecución de `npm test`.
- **CA-004-15** `package.json` solo gana la clave `test` (sin dependencias nuevas) y el README documenta el comando. Verifica: `git diff` y lectura.

**B5 — `timeInterval`**
- **CA-004-16** Se añade `timeInterval` solo si es trivial y no cambia la política de ubicación ni los tests existentes; si no, el reporte explica por qué y no hay cambio. Verifica: tests de ubicación y revisión. No verificado en dispositivo (comportamiento real del GPS). Tarea: prueba en celular si se tocó.

**B6 — Reglas de Firestore**
- **CA-004-17** `docs/seguridad.md` contiene (o remite sin ambigüedad a) una lista de comprobación: texto vigente de `validTrip()` (`:205`), pegar completo, Publicar, guardar un viaje con propina y calificación y ver el documento en la consola. Verifica: lectura del documento.
- **CA-004-18** No verificado en dispositivo: viaje con `tip` y `rating` se guarda tras publicar. Tarea: prueba de Anderson (G-01).

## 5. Casos límite
- OSRM responde con ruta de 0 m o duración 0: se trata como inválido y se usa el respaldo (duración mínima 1 min, como hoy).
- Coordenadas casi iguales: la caché usa el par redondeado a 5 decimales (lectura conservadora; el plan puede afinar).
- Caché sin límite: debe estar acotada (tamaño máximo pequeño).
- Dos solicitudes simultáneas con el mismo par: una sola llamada.
- Conductor sin viajes en el periodo: total 0, sin error.
- Viajes sin `finishedAt`/`createdAt` válido: se ignoran sin romper totales.
- `npm test` en Windows: la ruta del loader debe funcionar con las comillas de `cmd`/PowerShell.

## 6. Fuera de alcance
Google Directions/Distance Matrix (G-03); estados `requested`/`rejected` (G-07); modelo de datos (G-11); pagos (L4); idioma (L3); temporizador de 15 s (spec 003, RF-77); cambios de `firestore.rules` fuera de texto en `docs/seguridad.md`.

## 7. Supuestos y riesgos
- OSRM público de demostración (`router.project-osrm.org`, ya usado en R-119) sin garantía de servicio: por eso el timeout y el respaldo; no apto para producción.
- Retardo de hasta ≈3 s antes de mostrar la solicitud; se acepta para que la tarifa no cambie.
- Sin dependencias nuevas; solo `scripts/dependencies.json`.
- La regla de Firestore podría estar ya publicada o no: no se asume (estado NO VERIFICADO).
- Una consulta por rango para ganancias puede necesitar índice; se documenta, no se crea desde el agente.

## 8. Trazabilidad

| Requisito | Brecha | R del taller | CA |
|---|---|---|---|
| RC-01 | G-02 | R-040, R-090, R-121, R-084 | CA-004-01, 05, 06, 08 |
| RC-02 | G-02 | R-084 | CA-004-02, 03 |
| RC-03 | G-02 | R-084 | CA-004-04, 05, 07 |
| RC-04 | G-22 | R-088 | CA-004-09 a 12 |
| RC-05 | G-15 | R-039, R-058 | CA-004-13 |
| RC-06 | G-21 | transversal | CA-004-14, 15 |
| RC-07 | G-17 | R-115 | CA-004-16 |
| RC-08 | G-01 | R-053, R-054, R-103, R-106, R-108 | CA-004-17, 18 |

## 9. Qué debe aprobar Anderson
Esta spec (Borrador), la lectura conservadora de timeout/caché (≈2–3 s, par redondeado), y si desea proponer los `RC-nn` como RF en `docs/requisitos.md`.
