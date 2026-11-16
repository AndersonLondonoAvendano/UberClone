# Spec 005 — Estados del viaje, modelo de datos y saldo (lote L2)

Estado: **Borrador** (propuesta de `spec-author`; NO aprobada). Anderson ordenó que la implementación continúe sin esperar la aprobación de esta spec (prompt del 2026-11-16); esa instrucción no sustituye su aprobación. Si esta spec cambia tras aprobarse, planes, tema y tareas pueden quedar desactualizados.
Fuente: `docs/plan-cierre-entrega-2026-11-16.md` (G-07, G-11, D-170 saldo; R-049..R-051, R-055, R-056, R-099, R-100, R-107, R-109), `docs/requisitos.md` RF-13 (F1 §3) y el enunciado (`docs/enunciado-taller.pdf`; no se pudo renderizar en este entorno, así que lo que dice del modelo y de los estados se toma de la matriz del plan y de RF-13: NO VERIFICADO contra el PDF).
Los IDs `RE-nn` son locales de esta spec y no están aún en `docs/requisitos.md`. Spec 004 define los RC-nn y no se repite.
Las decisiones D-182 a D-186 de la sección 8 son SOLO propuestas: no se escribieron en `docs/decisiones.md`. D-181 queda reservada a «solicitud solo con Disponible» (A1/A2).

## 1. Objetivo y porqué

Completar lo que falta de la máquina de estados (`requested` implícito, `rejected`, paso «Llegué», cancelar solo antes de `in_progress`), añadir campos al viaje guardado sin romper los viajes viejos, y hacer que el saldo cuente TODOS los viajes. Porqué: RF-13 exige esos estados, el esquema del enunciado pide `passengerId`, `completedAt`, `economy` y ubicaciones `{lat,lng,address}`, y hoy el saldo se trunca a 200 viajes (D-170 lo dejó fuera de alcance). Todo es ADITIVO: ningún viaje guardado ni pantalla existente deja de funcionar.

## 2. Qué ya existe (verificado en el código)

- `TRIP_STATUS` (`src/constants/tripStatus.js`): accepted, driver_arriving, driver_arrived, in_progress, completed, cancelled, paid. No existen `requested` ni `rejected`.
- Transiciones hacia delante en `NEXT_TRIP_STATUS` (`passengerApi/contract.js:55-61`): accepted → driver_arriving → driver_arrived → in_progress → completed. `canTransition` (`tripMachine.js:9-13`) deja cancelar desde cualquier estado no terminal, incluido `in_progress`. `accepted → driver_arriving` es automático al iniciar el controlador; `driver_arrived` se emite solo por detección de llegada (`tripController.js:301-309`); no hay acción del conductor para marcarla.
- «Salir del viaje» (`abandon()`, `tripController.js:513`) cierra el viaje en local como `cancelled` (o `completed` si ya estaba en el destino) cuando la API no confirma.
- Solo se guardan `completed` y `cancelled` (`tripRecord.js:19`), más `paid` por la confirmación de efectivo o el backend. Un rechazo o vencimiento NO deja rastro.
- Documento guardado (`TRIP_DOC_KEYS`, `tripRecord.js:29-50`): driverId, status, paymentStatus, commissionRate, category, passengerName, originLabel, destinationLabel, distanceKm, durationMin, fare, commission, driverEarnings, tip, rating, paymentMethod, startedAt, finishedAt, createdAt, route. La regla de Firestore usa la misma lista (`hasOnly`). Un cancelado se guarda con montos 0, tip 0 y `rating: null`.
- `computeBalance` (`earnings.js:66-81`) ya implementa saldo = tarjeta aprobada (`driverEarnings`) − comisión de efectivo cobrado, y salta `cancelled`; pero `EarningsScreen.js:30-35` lo calcula sobre `useTrips()` (`listenToTrips`, tope 200, `tripRepository.js:14`). Ganancias de periodo ya usan `fetchTripsInRange` (D-170: páginas de 500, tope 5000, `truncated`).
- `legacyTrip.js` es el patrón de lecturas tolerantes: un helper puro decide qué hacer con un viaje al que le faltan campos.
- Historial (`TripListItem.js:29-79`) y Detalle (`tripDetailView`) tratan `cancelled` aparte (chip `danger`, «Cancelado», montos «sin cobro»). Hay una colisión de nombres a vigilar: `PAYMENT_STATUS.REJECTED` (cobro rechazado por la pasarela) NO es el estado de viaje `rejected`.
- D-10 (Propuesta) dice «no hay botón de cancelar», pero el código sí cancela; esta spec no resuelve esa discrepancia, solo fija desde qué estados se permite.

## 3. Requisitos

**B1 — Saldo sobre todos los viajes**
- **[RE-01]** (D-170 saldo; R-077, R-089) El saldo mostrado deberá ser la suma de `driverEarnings` de los viajes de tarjeta con `paymentStatus` aprobado, menos la suma de `commission` de los viajes de efectivo cobrados, calculado sobre TODOS los viajes del conductor (histórico completo), no sobre los 200 más recientes. Se conserva la semántica actual de `computeBalance` (cancelados, sin método y legacy excluidos).
- **[RE-02]** (D-170 saldo) La lectura deberá ser paginada como la de Ganancias (páginas, `startAfter`) o un agregado acotado; el plan elige. Cualquiera de las dos deberá: no exigir lectura en vivo de toda la colección en cada cambio, tener un tope duro de documentos (el de D-170, 5000, salvo que el plan justifique otro), devolver una marca `truncated` y, si se alcanza el tope, mostrar el saldo con una indicación textual honesta de que es parcial (nunca un saldo que parezca completo). Si exige índice compuesto o regla nueva, el texto exacto va en `docs/seguridad.md` con los pasos manuales de Anderson.
- **[RE-03]** (D-170) El sistema deberá declarar el coste de lecturas: Firestore cobra una lectura por documento devuelto (un agregado cobra 1 lectura por cada 1.000 entradas de índice, mínimo 1). Con lectura paginada, el coste por apertura de Ganancias es ≈ N documentos leídos (N = viajes de tarjeta aprobada y de efectivo cobrado si la consulta filtra por `paymentStatus`; todos los viajes si no filtra), máximo 5000. La declaración (fórmula, tope, cuota gratuita de 50.000 lecturas/día) va en la decisión D-182 y en `docs/omisiones-y-limites.md`. El saldo se lee al enfocar la pantalla y al reintentar (como D-170), no en vivo.

**B2 — Estados que faltan (aditivo)**
- **[RE-04]** (RF-13; R-049) `requested` es un estado IMPLÍCITO: la solicitud ofrecida al conductor y aún sin decisión está en `requested`; existe como constante y como origen de transiciones en la máquina, pero NO se escribe en Firestore (no hay app de pasajero en este repo que cree el documento). La omisión de escribirlo se documenta en `docs/omisiones-y-limites.md`.
- **[RE-05]** (RF-13; R-050..R-052) El sistema deberá modelar los estados `requested`, `accepted`, `rejected`, `driver_arriving`, `driver_arrived` (el «conductor llegó»), `in_progress`, `completed`, `cancelled` y conservar `paid`; las transiciones válidas son exactamente las de la tabla de la sección 4 y cualquier otra deberá rechazarse sin cambiar el estado ni escribir nada. No se renombra ningún estado existente.
- **[RE-06]** (RF-13; R-050) Cuando el conductor rechaza una solicitud o esta vence (RF-77: 15 s, o `expiresAt` pasado), el sistema deberá cerrarla como `rejected`: sin ganancia ni comisión ni cobro (`fare`, `commission`, `driverEarnings`, `tip` en 0, `rating` nulo), y guardarla en el mismo `drivers/{uid}/trips/{requestId}` con `status: 'rejected'` y `finishedAt` del instante de cierre, de forma idempotente (mismo id, una sola vez). Solo se guardan las solicitudes que se llegaron a mostrar; una notificación que nunca se ofreció (por ejemplo, sin Disponible, D-181) no deja documento. El guardado es de mejor esfuerzo y con tiempo límite: si falla, no bloquea el cierre de la solicitud ni el siguiente viaje.
- **[RE-07]** (RF-13; R-051) Entre aceptar e iniciar, el conductor deberá tener la acción «Llegué» mientras el viaje está en `driver_arriving`; al pulsarla pasa a `driver_arrived` y desde ahí puede iniciar el viaje. La detección automática de llegada actual se conserva; si ambas ocurren, la transición se hace una sola vez (idempotente). «Llegué» no existe en otro estado.
- **[RE-08]** (R-055) El sistema solo deberá permitir cancelar desde `accepted`, `driver_arriving` y `driver_arrived`; desde `in_progress` la cancelación se rechaza (el viaje solo puede terminar en `completed`). Excepción nombrada: la salida segura «Salir del viaje» (`abandon()`), cuando la API no confirma, conserva su comportamiento actual y se documenta como límite, no como transición de la máquina.
- **[RE-09]** (RF-13; R-047, R-097) El Historial y el Detalle deberán mostrar un viaje `rejected` con una etiqueta de texto «Rechazado» (una sola, cubre rechazo y vencimiento; el texto vive en `labels.js`), un icono y un color distinto del de `cancelled`, con contraste AA (≥ 4,5:1 el texto de la etiqueta sobre su fondo; el cálculo se registra) y sin depender solo del color. Muestra montos «sin cobro» como el cancelado y no muestra el chip «Cobro simulado».

**B3 — Campos aditivos del modelo**
- **[RE-10]** (R-099, R-100, R-102, R-109; G-11) Al guardar un viaje, el sistema deberá escribir además de los campos actuales: `passengerId` (si la solicitud lo trae; si no, se omite o es nulo, lo que acepte la regla), `completedAt` (solo en `completed`; el mismo instante que `finishedAt`; ausente o nulo en cancelado y rechazado), `economy` = `{ fare, commission, tip, driverEarnings }` (espejo de los montos de nivel superior) y `origin` y `destination` = `{ lat, lng, address }` (coordenadas del punto de recogida y del destino de la solicitud; la dirección es el texto ya guardado en `originLabel`/`destinationLabel`).
- **[RE-11]** (R-099..R-109) La lectura de un viaje (Historial, Detalle, Ganancias, saldo) deberá usar un helper puro con defaults, en la línea de `legacyTrip.js`: sin `passengerId` → nulo; sin `completedAt` y con estado `completed`/`paid` → `finishedAt`; sin `economy` → derivada de los campos de nivel superior; sin `origin`/`destination` → `{ lat: null, lng: null, address: originLabel/destinationLabel ?? '' }`. Si un viaje tiene `economy` Y los montos de nivel superior, mandan los de nivel superior (fuente única de las cuentas existentes). Los viajes guardados antes de este lote se leen igual que hoy.
- **[RE-12]** (R-100, R-102, R-110) Se conservan todos los campos actuales (`originLabel`, `destinationLabel`, `category` con clave `economico`, `fare`, `commission`, `driverEarnings`, `tip`, `rating`, `finishedAt`, la colección `drivers/{uid}/trips`). Los campos nuevos solo se añaden y nada se borra ni renombra.
- **[RE-13]** (G-11, G-16; R-100, R-102, R-110) Las desviaciones que quedan respecto al esquema del enunciado (colección `drivers/{uid}/trips` en vez de `trips`; categoría `economico` en vez de `economy`; `finishedAt` además de `completedAt`; `requested` no persistido) deberán quedar en `docs/omisiones-y-limites.md`. El texto completo y actualizado de `validTrip()` (estados permitidos con `rejected`, claves nuevas en `hasAll`/`hasOnly`, `economy`, `origin`, `destination`, `passengerId`, `completedAt`, montos 0 y `rating` nulo en `rejected` y `cancelled`) deberá entregarse en `docs/seguridad.md` para que Anderson lo publique a mano. El sistema SHALL NOT asumir que está publicado y no publica nada.

**B4 — No contaminación**
- **[RE-14]** (R-053, R-088, R-089) Un viaje `rejected` no deberá sumar en ganancias (hoy/semana/mes, las seis métricas), ni en comisión, ni en saldo, ni en el conteo, ni habilitar cobro.
- **[RE-15]** (R-108) Un viaje `cancelled` o `rejected` se guarda con `rating` nulo, `tip` 0 y montos 0.
- **[RE-16]** (R-047, R-097, R-045) Ganancias, saldo, Historial (20 por página, `fetchTripsPage`), Detalle y el panel de cobro/pago deberán comportarse igual que antes para `completed`, `paid` y `cancelled`, y para los viajes sin los campos nuevos.

## 4. Tabla de transiciones

| Desde \ Hacia | accepted | rejected | driver_arriving | driver_arrived | in_progress | completed | cancelled | paid |
|---|---|---|---|---|---|---|---|---|
| requested | válida | válida (rechazo o vencimiento) | inválida | inválida | inválida | inválida | inválida (el conductor rechaza, no cancela) | inválida |
| accepted | — | inválida | válida (automática) | inválida | inválida | inválida | válida | inválida |
| driver_arriving | inválida | inválida | — | válida (detección o «Llegué») | inválida | inválida | válida | inválida |
| driver_arrived | inválida | inválida | inválida | — | válida | inválida | válida | inválida |
| in_progress | inválida | inválida | inválida | inválida | — | válida | **inválida** (RE-08) | inválida |
| completed | inválida | inválida | inválida | inválida | inválida | — | inválida | válida (solo backend o confirmación de efectivo; fuera de la máquina) |
| rejected, cancelled, paid | terminales: toda transición es inválida |

Cualquier estado desconocido, nulo o vacío como origen o destino: inválida. Nada vuelve a `requested`.

## 5. Criterios de aceptación

**B1 — Saldo**
- **CA-005-01** Dados 250 viajes (repositorio falso: 150 de tarjeta aprobada con `driverEarnings` conocidos, 100 de efectivo cobrado con `commission` conocida), entonces el saldo = Σ tarjeta − Σ comisión de efectivo de los 250, no de los 200 más recientes. Verifica: test `node:test`.
- **CA-005-02** Dados viajes `cancelled`, `rejected`, sin método, legacy y tarjeta con `paymentStatus` distinto de aprobado, entonces no cambian el saldo. Verifica: test.
- **CA-005-03** Dado un repositorio falso con más de 5000 documentos, entonces la lectura se detiene en el tope, marca `truncated` y el saldo se presenta como parcial con texto; nunca se lanza ni se calcula sin tope. Verifica: test con repositorio falso y de la presentación.
- **CA-005-04** El número de lecturas del saldo es ≤ tope y se cuenta con el contador del repositorio falso (páginas × tamaño); `D-182` y `docs/omisiones-y-limites.md` contienen la declaración de coste. Verifica: test y lectura de ambos textos.
- **CA-005-05** Ganancias de hoy/semana/mes, `fetchTripsInRange`, `fetchTripsPage` y sus tests existentes no cambian de resultado. Verifica: `npm test`.
- **CA-005-06** No verificado en dispositivo: el saldo mostrado coincide con el cálculo manual de un conductor con >200 viajes (o datos sembrados). Tarea: prueba en celular (la define el plan).

**B2 — Estados**
- **CA-005-07** `canTransition` devuelve verdadero para exactamente las celdas «válida» de la sección 4 y falso para todas las demás y para entradas nulas o desconocidas. Verifica: test tabular que recorre todas las parejas de estados.
- **CA-005-08** Cancelar desde `in_progress` es rechazado (la máquina no cambia, no se llama a la API de cancelación); desde `accepted`, `driver_arriving` y `driver_arrived` se permite. Verifica: test del controlador con API falsa.
- **CA-005-09** `abandon()` conserva su resultado actual en todas sus fases (cancelado antes del destino, completado en el destino). Verifica: tests existentes del controlador siguen pasando y se añade uno que lo fija.
- **CA-005-10** Dada una solicitud rechazada por el conductor, entonces se guarda un documento `drivers/{uid}/trips/{requestId}` con `status: 'rejected'`, `fare`, `commission`, `driverEarnings`, `tip` = 0, `rating` = null, `finishedAt` y `createdAt`; y ningún campo de cobro positivo. Verifica: test de `buildTripRecord` y del guardado con repositorio falso.
- **CA-005-11** Dada una solicitud que vence (15 s o `expiresAt` pasado), entonces ocurre lo mismo que en CA-005-10. Verifica: test con reloj/temporizador inyectado.
- **CA-005-12** Dado el mismo rechazo notificado dos veces, entonces hay un solo documento y una sola escritura. Verifica: test con contador del repositorio falso.
- **CA-005-13** Dado un fallo o timeout del guardado de un rechazo, entonces la solicitud se cierra igual, el conductor puede recibir otra y no aparece pantalla de error ni bloqueo. Verifica: test con repositorio que rechaza o no responde.
- **CA-005-14** Una solicitud que nunca se mostró (descartada antes de ofrecerse) no escribe documento. Verifica: test del flujo de oferta.
- **CA-005-15** En `driver_arriving`, «Llegué» pasa a `driver_arrived` y habilita iniciar; en cualquier otro estado la acción no existe o no hace nada; pulsarla y que se dispare la detección automática produce una sola transición y un solo reporte a la API. Verifica: test del controlador con API falsa.
- **CA-005-16** `requested` existe como constante pero ninguna función de guardado lo escribe: un registro construido desde cualquier estado nunca tiene `status: 'requested'`. Verifica: test de `buildTripRecord` y búsqueda con `grep`.
- **CA-005-17** Validada en dispositivo por Anderson (2026-11-16, STOP-5). Estado de dispositivo: rechazar una solicitud y dejar vencer otra, y ver ambas en el Historial como «Rechazado»; pulsar «Llegué» y completar el flujo; comprobar en la consola de Firestore los documentos. Tarea: prueba en celular, después de que Anderson publique la regla (ver CA-005-26): hecha.

**B3 — Modelo**
- **CA-005-18** `buildTripRecord` de un viaje completado con la solicitud de ejemplo (8,5 km / 22 min, Económico) incluye `economy` = `{ fare: 19200, commission: 3840, tip: 0, driverEarnings: 15360 }` igual a los montos de nivel superior, `completedAt` = `finishedAt`, `origin`/`destination` con `{ lat, lng, address }` numéricos y `passengerId` cuando la solicitud lo trae. Verifica: test.
- **CA-005-19** En un viaje `cancelled` o `rejected`, `completedAt` está ausente o es nulo y `economy` está en ceros. Verifica: test.
- **CA-005-20** Dado un viaje guardado antes de este lote (sin los campos nuevos), el helper de lectura devuelve `passengerId` nulo, `completedAt` = `finishedAt` si `completed`/`paid`, `economy` derivada de los montos de nivel superior y `origin`/`destination` con coordenadas nulas y la dirección de las etiquetas; Historial, Detalle, Ganancias y saldo producen el mismo resultado que antes. Verifica: test con fixtures de viajes antiguos y comparación con la salida previa.
- **CA-005-21** Dado un viaje con `economy` distinta de los montos de nivel superior, entonces los totales usan los de nivel superior. Verifica: test.
- **CA-005-22** `TRIP_DOC_KEYS` contiene los campos actuales más los nuevos y ninguno se quita ni se renombra. Verifica: test que compara con la lista previa.
- **CA-005-23** `docs/omisiones-y-limites.md` lista las cuatro desviaciones de RE-13 y `docs/seguridad.md` contiene el texto completo de `validTrip()` con una lista de comprobación de publicación (pegar completo, Publicar, probar guardar un completado, un cancelado y un rechazado y ver los documentos en la consola). Verifica: lectura de ambos documentos.
- **CA-005-24** Dado un viaje con el texto de `validTrip()` propuesto, estados y claves: la regla acepta `completed`, `cancelled` y `rejected` con sus montos y rechaza `rejected` con monto positivo o `rating` distinto de nulo. Verifica: lectura contra la lista de casos; ejecución en el emulador de reglas solo si existe (NO VERIFICADO si no).

**B4 — No contaminación**
- **CA-005-25** Dado un conjunto con viajes `completed`, `paid`, `cancelled` y `rejected` en el mismo periodo, entonces las seis métricas, los totales de hoy/semana/mes y el saldo ignoran los `rejected` y los `cancelled` (conteo y sumas idénticos a los del conjunto sin ellos). Verifica: test con ambos conjuntos.
- **CA-005-26** CERRADO 2026-11-16 (Validada en dispositivo por Anderson, STOP-5; regla publicada ≈14:20 Bogotá y guardado real comprobado en la consola). Era un BLOQUEANTE de despliegue: la app solo guardará de forma correcta cuando Anderson publique la regla nueva (RE-13); si no, el guardado de TODOS los viajes puede fallar por `hasOnly`, como en G-01. Verifica: la lista de comprobación de CA-005-23 va primero y el informe de la tarea lo repite. Viaje rechazado guardado y comprobado en la consola; completado y flujo completo validados por Anderson en STOP-5; «Salir del viaje» a mitad y viajes antiguos siguen No verificado en dispositivo. Tarea: prueba de Anderson (T-238, T-239).
- **CA-005-27** Dado un viaje `rejected` cuyo `paymentStatus` es `pending`, el panel de cobro y el flujo de pago no se ofrecen. Dado un viaje `completed` cuyo `paymentStatus` es `rejected` (cobro rechazado por la pasarela), se trata como completado con cobro rechazado, NO como viaje rechazado. Verifica: test de ambos casos.

**Diseño**
- **CA-005-D1** La etiqueta «Rechazado» del Historial y del Detalle tiene contraste de texto ≥ 4,5:1 sobre su fondo, con los tokens de `DESIGN.md`; el cálculo queda anotado en la decisión o en el informe de la tarea. Verifica: cálculo con script temporal sobre los tokens.
- **CA-005-D2** «Rechazado» se distingue de «Cancelado» por texto e icono además del color, y el anuncio accesible del ítem lo incluye. Verifica: lectura del ítem y de sus pruebas de accesibilidad. No verificado en dispositivo (lectura con TalkBack/VoiceOver). Tarea: captura y prueba en celular.
- **CA-005-D3** «Llegué» usa el botón primario existente, con área táctil ≥ 48 dp, sin dependencias nuevas y sin cambiar el orden visual de las acciones del viaje. Verifica: lectura del componente y de `DESIGN.md`. No verificado en dispositivo.

## 6. Casos límite
- El conductor pulsa «Llegué» antes de que la ruta cargue o con la ubicación no disponible: se permite (es una acción manual) y no depende de la distancia; no hay validación de proximidad (lectura conservadora, sin geovalla).
- «Llegué» y detección automática simultáneas: una sola transición (CA-005-15).
- La solicitud vence mientras el conductor la acepta: gana la primera de las dos decisiones; la otra se ignora (no se guarda `rejected` tras `accepted`).
- Rechazo guardado sin red: tiempo límite y descarte; no se reintenta indefinidamente.
- Muchos rechazos seguidos: cada uno suma una escritura y una lectura (comprobación de existencia); se declara en D-183. Los `rejected` también salen en las lecturas por rango y paginadas, así que aumentan el coste de lecturas del Historial y de Ganancias.
- Viaje antiguo sin `finishedAt` válido: se ignora en totales como hoy.
- Coordenadas ausentes en una solicitud: `origin`/`destination` se guardan con la dirección y sin coordenadas o con nulos, según lo que admita la regla; no se inventan valores.
- `passengerId` ausente: no se inventa.
- Saldo con 0 viajes: 0, sin error. Saldo con error de lectura: estado de error con reintento, no un 0 engañoso.
- Si la regla no está publicada, los guardados nuevos fallan y la app ya los trata como «no se pudo guardar» (T-93); no se oculta el fallo.

## 7. Fuera de alcance
Pasar al «siguiente conductor» (R-050 parcial: no hay backend de despacho ni app de pasajero); persistir `requested`; mover la colección a `trips`; renombrar `economico` a `economy`; borrar `originLabel`/`destinationLabel`/`finishedAt`; Google Directions/Distance Matrix; pagos, idioma y proceso (L3, L4, L7); cambios de `firestore.rules` fuera de texto en `docs/seguridad.md`; resolver la discrepancia de D-10 sobre el botón de cancelar.

## 8. Decisiones propuestas (SOLO propuestas, nada en «Vigente»)

- **D-182 — Saldo sobre todos los viajes con lectura acotada; sustituye la parte de saldo de D-170.** El saldo (tarjeta aprobada − comisión de efectivo cobrado) se calcula sobre el histórico completo por lectura paginada al enfocar (o agregado acotado; lo decide el plan), con tope duro (5000) y marca `truncated` con indicación honesta de saldo parcial. Coste declarado: ≈ N lecturas por apertura de Ganancias (N = documentos del conductor que cumplan el filtro; el peor caso es el tope), contra 50.000 lecturas diarias gratis. Alternativa descartada por ahora: contador de saldo mantenido por el backend (menos lecturas pero exige escrituras del servidor y más reglas). Lectura conservadora: se mantiene `computeBalance` y solo cambia de dónde salen los viajes.
- **D-183 — `requested` implícito y `rejected` persistido.** `requested` existe en la máquina y no se escribe. `rejected` (rechazo o vencimiento, una sola etiqueta «Rechazado») se guarda con montos 0 solo si la solicitud se llegó a mostrar, de mejor esfuerzo y con tiempo límite. Coste: una escritura y una lectura por solicitud rechazada, y los rechazados cuentan en las lecturas por rango. Alternativa: no persistir rechazados (menos coste, pero R-050 y RF-13 quedan sin evidencia visible).
- **D-184 — «Llegué» manual y cancelación solo antes de `in_progress`.** «Llegué» convive con la detección automática (una sola transición). Cancelar se rechaza en `in_progress`; «Salir del viaje» (`abandon()`) queda como salida segura documentada, fuera de la máquina. Alternativa: eliminar la detección automática (más literal, menos cómodo).
- **D-185 — Campos aditivos con lectura por defecto.** `passengerId`, `completedAt`, `economy` (espejo) y `origin`/`destination` `{lat,lng,address}` se escriben y se leen con defaults; los campos actuales se conservan y los de nivel superior mandan en las cuentas. PRIVACIDAD a confirmar por Anderson: `tripRecord.js` hoy documenta que no se guardan coordenadas; guardar las del origen y destino de la solicitud agrega datos del pasajero. Alternativa conservadora: dejar el desvío R-100 documentado y no guardar coordenadas (en ese caso se retiran las partes de `origin`/`destination` de RE-10 y RE-11).
- **D-186 — Desviaciones documentadas, no corregidas.** Colección `drivers/{uid}/trips`, categoría `economico`, `finishedAt` junto a `completedAt` y `requested` no persistido se explican en `docs/omisiones-y-limites.md`; el texto de `validTrip()` queda en `docs/seguridad.md` y su publicación es manual y previa a la prueba.

## 9. Supuestos y riesgos
- El PDF del enunciado no se pudo renderizar aquí; el esquema y los estados exigidos se tomaron de la matriz del plan y de RF-13. Conviene que Anderson confirme el nombre exacto de `driver_arriving`/«conductor llegando» y de `economy`.
- No hay app de pasajero: el rechazo y el vencimiento ocurren en el simulador y en el flujo push; «siguiente conductor» queda fuera.
- Sin dependencias nuevas; solo `scripts/dependencies.json`.
- Riesgo mayor: publicar la regla antes de usar el código nuevo (CA-005-26). Segundo riesgo: el aumento de documentos por rechazos eleva lecturas del Historial y Ganancias.

## 10. Trazabilidad

| Requisito | Brecha | R del taller / fuente | CA |
|---|---|---|---|
| RE-01 | D-170 | R-077, R-089 | CA-005-01, 02, 05, 06 |
| RE-02 | D-170 | R-088 | CA-005-03, 04, 06 |
| RE-03 | D-170 | R-088 | CA-005-04 |
| RE-04 | G-07 | RF-13, R-049 | CA-005-16, 07 |
| RE-05 | G-07 | RF-13, R-050..R-052 | CA-005-07 |
| RE-06 | G-07 | RF-13, R-050 | CA-005-10 a 14, 17 |
| RE-07 | G-07 | RF-13, R-051 | CA-005-15, 17, D3 |
| RE-08 | G-07 | R-055 | CA-005-08, 09 |
| RE-09 | G-07 | RF-13, R-047, R-097 | CA-005-17, D1, D2 |
| RE-10 | G-11 | R-099, R-100, R-102, R-109 | CA-005-18, 19, 22 |
| RE-11 | G-11 | R-099..R-109 | CA-005-20, 21 |
| RE-12 | G-11 | R-100, R-102, R-110 | CA-005-22 |
| RE-13 | G-11, G-16 | R-100, R-102, R-110 | CA-005-23, 24, 26 |
| RE-14 | G-07 | R-053, R-088, R-089 | CA-005-25, 27 |
| RE-15 | G-07 | R-108 | CA-005-10, 19 |
| RE-16 | G-07, G-11 | R-045, R-047, R-097 | CA-005-05, 20, 25 |

Decisiones: D-182 → RE-01..03; D-183 → RE-04..06, RE-09; D-184 → RE-07, RE-08; D-185 → RE-10..12; D-186 → RE-13.

## 11. Qué debe aprobar Anderson
Esta spec (Borrador); las decisiones D-182 a D-186; en particular la privacidad de guardar coordenadas (D-185), «Rechazado» como etiqueta única para rechazo y vencimiento, el tope de 5000 para el saldo, el coste extra de persistir rechazos, y publicar la regla `validTrip()` nueva a mano antes de cualquier prueba en el celular. Mientras no la apruebe, la implementación sigue por su instrucción y esta spec queda como Borrador.
