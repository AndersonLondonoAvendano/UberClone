# Plan — Spec 005 Estados del viaje, modelo de datos y saldo, lote L2

Estado: **Propuesta de `planner` (2026-11-16)**. La spec 005 sigue en Borrador; Anderson ordenó continuar sin esperar su aprobación y eso no la sustituye. Tareas T-216 a T-240 (siguiente libre tras T-215). Sin dependencias nuevas, sin tocar `.env`, secretos ni `google-services.json`. Los `RE-nn` son locales de la spec: cada tarea cita su `RE-nn` más un ancla existente de `docs/requisitos.md` (RF-13 estados y modelo, RF-24 saldo, RF-54 reglas) para que C21/C22 no den falsos errores.

## 0. Hallazgos del código real

- `tripMachine.canTransition` (`:9-13`) depende de `NEXT_TRIP_STATUS` y de `isTripFinished` (ambos en `src/services/passengerApi/contract.js`); `tripStatus.js` no tiene `requested` ni `rejected`.
- El rechazo y el vencimiento hoy salen por `rejectRequest(id)` en `IncomingRequestCard.js:191,237` y `TripRequestScreen.js:230,249,302` (y el temporizador de vencimiento del mock). No hay un punto único: el plan crea uno (`declineRequest`) y lo llama desde esos sitios.
- `tripRecord.js` fija `SAVED_STATUS` (completed, cancelled) y `TRIP_DOC_KEYS`; el repositorio añade `createdAt`.
- Historial: `src/screens/main/HistoryScreen.js`, `src/components/HistoryFilters.js`, `useTripHistory.js` (20 por página); `TripListItem.js` y `tripDetailView.js` ya tratan `cancelled` aparte.
- `D-181` no existe todavía en `docs/decisiones.md` (la última es D-180) y la spec la reserva; su texto lo fija la orden de Anderson: la solicitud solo se ofrece con Disponible (A2).

## 1. Archivos → responsabilidad → requisitos

| Archivo | Responsabilidad | Requisitos |
|---|---|---|
| `docs/decisiones.md` | D-181 a D-186 como Propuesta | todos (gobierno) |
| `docs/omisiones-y-limites.md`, `docs/seguridad.md` | Desviaciones, coste de lecturas, `validTrip()` y lista de publicación | RE-03, RE-13 |
| `src/services/tripRepository.js` | `fetchAllTrips` paginado, tope 5000, `truncated` | RE-01, RE-02, RE-03 |
| `src/hooks/useBalance.js` (nuevo), `src/screens/main/EarningsScreen.js` | Saldo sobre todos los viajes y texto de saldo parcial | RE-01, RE-02 |
| `src/constants/tripStatus.js`, `src/services/passengerApi/contract.js`, `src/services/trip/tripMachine.js` | `REQUESTED`, `REJECTED`, tabla de transiciones | RE-04, RE-05 |
| `src/services/trip/tripController.js` | Cancelar bloqueado en `in_progress`, `arrive()` idempotente, `abandon()` intacto | RE-07, RE-08 |
| `src/screens/trip/TripActiveScreen.js` (y el componente de acciones del viaje) | Botón «Llegué» | RE-07 |
| `src/services/trip/legacyTrip.js` | Helper de lectura con defaults | RE-11 |
| `src/services/trip/tripRecord.js` | `rejected`, campos aditivos, `TRIP_DOC_KEYS` | RE-06, RE-10, RE-12, RE-15 |
| `src/services/trip/declineRequest.js` (nuevo), `IncomingRequestCard.js`, `TripRequestScreen.js`, `mockPassengerApi.js` | Guardado idempotente del rechazo y vencimiento | RE-06 |
| `src/constants/labels.js`, `TripListItem.js`, `tripDetailView.js`, `HistoryScreen.js`, `HistoryFilters.js` | «Rechazado», icono, color, filtro/chip | RE-09 |
| `src/utils/earnings.js` | Solo si los tests de B4 exigen excluir `rejected` | RE-14, RE-16 |

## 2. Contratos (firmas)

```
// tripRepository.js
fetchAllTrips(uid, { pageSize = 500, maxDocs = 5000 }) => Promise<{ trips, truncated }>
fetchAllTripsWith(fns, tripsCollection, opts)            // inyectable para pruebas
// tripMachine.js
canTransition(from, to) => boolean                      // exactamente la tabla de la spec §4
// tripController.js
arrive() => boolean                                      // solo desde driver_arriving; una sola transición
// declineRequest.js
declineRequest({ uid, request, reason, save, setTimer, timeoutMs }) => Promise<void>  // reason: 'rejected' | 'expired'; nunca rechaza
// tripRecord.js
buildTripRecord({ ..., status })                        // status: completed | cancelled | rejected
// legacyTrip.js
readTrip(doc) => trip normalizado                       // passengerId, completedAt, economy, origin, destination con defaults
```

## 3. Decisiones técnicas

1. **Saldo por lectura paginada, no agregado.** Reusa el patrón de `fetchTripsInRange` (páginas de 500, `startAfter`, tope 5000, `truncated`) sobre toda la colección ordenada por `createdAt`; lectura única al enfocar y reintentar (no `onSnapshot`). Sin índice compuesto ni regla nueva. Coste ≈ N lecturas por apertura (peor caso 5000 de 50.000 gratis/día); va en D-182 y en `omisiones-y-limites.md`. `computeBalance` no cambia; si `truncated`, la pantalla añade el texto «Saldo parcial» (D-182).
2. **Máquina.** `canTransition` se reescribe con una tabla explícita (mapa de conjuntos) y no con `NEXT_TRIP_STATUS` más la excepción de cancelar. `NEXT_TRIP_STATUS` se conserva para quien ya lo usa. `requested` existe solo como constante y origen; ninguna función de guardado lo escribe.
3. **`PAYMENT_STATUS.REJECTED` no es `TRIP_STATUS.REJECTED`.** Los tests de T-232 fijan la distinción (CA-005-27).
4. **«Llegué».** `arrive()` aplica `canTransition(driver_arriving, driver_arrived)` y comparte con la detección automática la misma guarda: si el estado ya es `driver_arrived`, no hace nada ni reporta a la API otra vez. Sin validación de proximidad.
5. **Cancelar.** `cancel()` consulta `canTransition(estado, cancelled)`; en `in_progress` retorna sin llamar a la API ni cambiar el estado. `abandon()` no se edita; un test lo fija.
6. **Rechazo y vencimiento.** Un único `declineRequest` con el guardado inyectado: existencia previa por id (idempotencia), tiempo límite (5 s), mejor esfuerzo (nunca rechaza ni muestra error). Solo se llama desde donde la solicitud ya se mostró (tarjeta/pantalla de solicitud); el descarte previo a la oferta no lo invoca (CA-005-14). La ganancia gana la primera decisión: si el viaje ya fue aceptado, `declineRequest` se ignora.
7. **Orden de tripRecord.** T-226 (rejected) y T-227 (campos aditivos) tocan el mismo archivo: van en secuencia. T-227 depende de la decisión de privacidad D-185; si Anderson la rechaza, se omiten `origin`/`destination` y se registra.
8. **Lectura tolerante.** `readTrip` vive en `legacyTrip.js` (patrón actual); los totales siguen leyendo montos de nivel superior.
9. **Documentos antes del código que escribe.** T-218 (texto de `validTrip()`) y T-238 (publicación por Anderson) preceden a la prueba de celular T-239. BLOQUEANTE CA-005-26: sin la regla publicada a mano, el guardado de TODOS los viajes puede fallar por `hasOnly`.
10. **Nada se publica ni se commitea.** `firestore.rules` no existe en el repo; la regla va solo como texto.

## 4. Diseño

Visuales: T-224 («Llegué»), T-220 (texto de saldo parcial), T-230 y T-231 (etiqueta «Rechazado», icono, color, filtro/chip). Cada una queda `Diseño: Pendiente` hasta T-237 (design-auditor: etiquetas, colores, contraste AA y pantalla «Conductor llegando» con «Llegué»). El agente principal carga las skills de diseño y se las pasa al auditor.

## 5. Orden y archivos disjuntos

Rebanadas B1 (T-219, T-220), B2 (T-221 a T-224, T-228 a T-231), B3 (T-225, T-226, T-227 y docs) y B4 (T-232) tocan archivos distintos, salvo: `tripRecord.js` (T-226 antes que T-227) y `tripController.js` (T-222 antes que T-223). Pueden ejecutarse en cualquier intercalado respetando «Depende de». Los documentos (T-216 a T-218) son disjuntos de todo el código.

## 6. Mapa CA → implementación

| CA | Tareas |
|---|---|
| CA-005-01 a 05 | T-219, T-220, T-233 |
| CA-005-06 | T-239 (Anderson) |
| CA-005-07 | T-221, T-234 |
| CA-005-08, 09 | T-222, T-234 |
| CA-005-10, 12, 13 | T-226, T-228, T-235 |
| CA-005-11, 14 | T-229, T-235 |
| CA-005-15 | T-223, T-234 |
| CA-005-16 | T-221, T-226, T-235 |
| CA-005-17 | T-239 (Anderson) |
| CA-005-18, 19, 22 | T-226, T-227, T-235 |
| CA-005-20, 21 | T-225, T-235 |
| CA-005-23, 24 | T-217, T-218, T-236 |
| CA-005-25, 27 | T-232, T-236 |
| CA-005-26 | T-218, T-238, T-239 (cerrado 2026-11-16, STOP-5: Validada en dispositivo por Anderson) |
| CA-005-D1, D2, D3 | T-224, T-230, T-231, T-237, T-239 |
