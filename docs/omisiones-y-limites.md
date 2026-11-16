# Omisiones y límites — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #57 (T-133) -->
Estado: **vigente; actualizado 2026-11-16 (borrador original 2026-11-12), pendiente de la lectura final de Anderson.** Lista lo que la entrega no hace, o hace de otra forma, con lo que se pide, lo que se hizo, la razón técnica y el impacto. Nada de lo que aparece aquí se declara como hecho en el README.

**Fuente de «lo que se pide».** El enunciado real es `docs/enunciado-taller.pdf` (taller «Uber - clone»). La tabla de cobertura de abajo se contrasta con sus nueve secciones; la columna «Se pide» de las tablas siguientes cita lo que el enunciado exige y lo que los requisitos (`docs/requisitos.md`) y las decisiones (`docs/decisiones.md`) derivan de él.

## Cobertura del enunciado

Estados: **hecho** (implementado y aprobado en lo estático), **parcial**, **omitido** y **No verificado en dispositivo** (implementado, pero solo se ve en el celular; las filas de pagos con Stripe y el idioma están validadas en el celular por Anderson, ver `docs/pagos-evidencia.md` y el STOP-6 más abajo; el resto sigue sin validar).

| § | Qué se pide | Estado |
|---|---|---|
| 1 | Descripción y funcionalidades 1 a 8 (registro, disponibilidad, solicitudes, viaje, cobro, ganancias, historial) | Hecho en lo estático; **No verificado en dispositivo**. Faltan los puntos de las filas 1 a 5 de Omisiones. |
| 2 | Registro en 3 pestañas (datos personales, vehículo, documentos/pagos); sin guardar datos de tarjeta ni bancarios | Hecho; validación en dispositivo parcial (`docs/progress.md:20`; el registro completo sigue **No verificado en dispositivo**). Se guarda solo el correo de Mercado Pago. |
| 3 | Siete pantallas, siete estados del viaje y los hooks obligatorios (`useDriverLocation`, `useTripRequests`, `useEarnings`) | Parcial. Los hooks existen. El conductor usa `accepted`, `driver_arriving`, `driver_arrived`, `in_progress`, `completed`, `cancelled` y `paid`; no hay `requested` ni `rejected` del lado del conductor porque el pasajero es un simulado. El temporizador de solicitud es de 15 s según RF-11; el simulado del pasajero vive 30 s (`MOCK_REQUEST_TTL_MS`). **No verificado en dispositivo.** |
| 4 | Cobro con Mercado Pago o Stripe, `.env` en el backend, comisión del efectivo descontada del saldo | Parcial. Implementadas **las dos pasarelas** en modo de prueba (R12, D-116 a D-120 en Propuesta): Mercado Pago y Stripe Checkout; el conductor elige una por cobro. **Mercado Pago implementado, no verificado con usuarios de prueba; Stripe es la pasarela verificada de punta a punta** (validada en dispositivo por Anderson el 2026-11-12 y de nuevo en STOP-5, 2026-11-16 14:54; evidencia en `docs/pagos-evidencia.md`). Mercado Pago no pudo probarse porque no se pudieron crear cuentas de prueba. Efectivo y saldo implementados. **No verificado en dispositivo.** Guías: `docs/pagos-stripe-guia.md` y `docs/pagos-guia-rapida.md`. |
| 5 | Fórmula de tarifa y `calculateFare`, comisión del 20 % con `commissionRate` guardado, métricas de Ganancias y saldo | Hecho en lo estático (`src/utils/fare.js`, `src/utils/earnings.js`); **No verificado en dispositivo.** Los viajes antiguos sin método de pago se tratan como «Cobro simulado» (D-111, propuesta). |
| 6 | Historial con `FlatList`, filtros Hoy/Semana/Mes/Rango y método de pago, detalle con ruta, propina y calificación, estado vacío y paginación | Parcial. Lista, filtros, estado vacío y paginación (de 20 en 20) hechos. Detalle con ruta implementado (T-109, T-110) y aprobado en lo estático; **No verificado en dispositivo.** La ruta es la simplificada guardada (D-110), no el recorrido real; propina y calificación simuladas (filas 4 y 5 de Omisiones). «Rango» solo en Android. |
| 7 | FCM, Firestore en tiempo real y geolocalización obligatorios; lo demás opcional; Directions y Distance Matrix solo al crear y aceptar | Parcial. Firestore en tiempo real y geolocalización hechos y validados en dispositivo (rebanadas 0/A/B, primer plano). FCM implementado, Android validado en release (arranque en frío y heads-up), iOS fuera, sin ubicación en segundo plano (fila 1). Directions sustituido por OSRM (ver Sustituciones). |
| 8 | Bitácora de IA, sección «Uso de IA» del README y exportación a PDF | Parcial. `docs/AI_LOG.md` y la sección del README existen; **el PDF lo exporta el humano** (paso manual de la entrega). |
| 9 | Entregables: repositorio y PRs, README con `.env.example`, bitácora con PDF, video de máximo 5 minutos | Parcial. README y `.env.example` del backend listos; guion en `docs/guion-video.md` (4:50). Commit, push, PDF y video son pasos manuales del humano. |

## Omisiones

| # | Se pide | Qué se hizo | Por qué | Impacto |
|---|---|---|---|---|
| 1 | Notificaciones push (FCM) | FCM implementado, **Android validado en build release por Anderson (2026-11-16)** (heads-up con sonido; con la app cerrada, tocar la notificación abre la solicitud con la cuenta de 15 s y, vencido el plazo, «La solicitud expiró»); en el dev client ese toque en frío no entrega la solicitud (límite del dev launcher). **Validado en dispositivo por Anderson (STOP-4, 2026-11-16, dev client):** tocar con la app en segundo plano en Configuración, Historial y Perfil abre la solicitud a pantalla completa (A1, D-149). **Pendiente:** la app CERRADA, que solo se valida en la build release (en el dev client no entrega la solicitud). iOS fuera de alcance, sin ubicación en segundo plano; el resto de la lista sigue pendiente de dispositivo. | El emisor del lado del pasajero no existe en este taller: el backend envía una solicitud de prueba; el build nativo lo hace el humano. | Con la app cerrada el aviso depende de FCM y de la prueba en el celular; la disponibilidad y la ubicación no se publican en segundo plano (D-130). |
| 2 | Perfil editable | **Acotado (D-122).** Se editan nombre, celular, color del vehículo y «Correo de cobros». Placa, marca/modelo, año, categoría, estado de cuenta y documentos quedan de solo lectura con «Para cambiar estos datos contacta a soporte.». **No verificado en dispositivo.** | Esos datos identifican al conductor y al vehículo aprobado; cambiarlos exigiría reaprobación. La regla de Firestore `validProfileEdit()` (`docs/seguridad.md`) solo admite los 4 campos y debe publicarla Anderson a mano (D-80). | El «Correo de cobros» es informativo en esta versión (D-123): no mueve dinero ni cambia la pasarela. Sin la regla publicada, guardar falla con error visible. |
| 3 | Idioma ES/EN | **SUPERADA por L3 y L3b (spec 006).** Historial: al redactarse esta fila, `language` solo se guardaba en el registro y todos los textos estaban en español. Hoy hay capa de traducción es/en con selector en Configuración, **Validada en dispositivo por Anderson (2026-11-16 15:59, STOP-6)**; en L3b el selector también está disponible sin sesión (al inicio); **STOP-7 probado por Anderson 2026-11-16, 100 % OK salvo un ajuste visual del selector en inicio de sesión (reducido después; verificación visual pendiente)**. | Se cerró con L3 (D-188 a D-192); los límites que quedan están en la sección «Límites del lote L3». | El idioma se guarda por dispositivo, no en el perfil (D-188). Los textos de la notificación push los arma el backend y siguen en español (límite a). |
| 4 | Propinas y calificación | **Simuladas (D-124).** La API simulada genera propina (≈40 % de los viajes, 500 a 5.000 COP) y calificación de 1 a 5; se guardan en el viaje y se suman en Ganancias. Implementado; **No verificado en dispositivo.** | El pasajero es simulado: no existe una app real que califique o dé propina. | Los valores son aleatorios, no reflejan clientes reales; los viajes anteriores a este cambio muestran «Sin calificación». |
| 5 | Detalle de viaje con ruta, propina y calificación (T-109, T-110) | Implementado; **No verificado en dispositivo.** Muestra la ruta simplificada guardada (D-110), la propina y las estrellas simuladas (D-124); «Sin calificación» en viajes antiguos. | Los valores vienen de la simulación (fila 4). | La ruta no es el recorrido real y propina y calificación son simuladas. |

## Sustituciones (el objetivo se cumple con otra herramienta)

| Se pide | Qué se hizo | Por qué | Impacto |
|---|---|---|---|
| Google Directions API | OSRM (servidor demo público) | Sin clave ni facturación (D-82). | El demo no garantiza disponibilidad; la app avisa si no hay ruta. |
| `react-native-maps` / Google Maps | MapLibre con teselas de OpenFreeMap | Sin clave de Google, open source (D-82). | Requiere development build; se muestra la atribución exigida. |

## Límites de plataforma y verificación

| Tema | Estado |
|---|---|
| iOS | El código es multiplataforma, pero **no está verificado en iOS** (no hay Mac ni build de iOS en esta entrega). |
| `DateField` | Usa `DateTimePickerAndroid`: solo Android. El filtro «Rango» del Historial solo se ofrece en Android. |
| Reglas de Firestore | Las pruebas son una **réplica en JavaScript**, no el emulador (no hay Java). La prueba definitiva es repetirlas en el celular tras publicar. |
| Dispositivo | Las pruebas en Android ya tienen evidencia de Anderson (rebanadas 0/A/B, STOP-2c a STOP-7; ver `docs/progress.md`). Lo que no la tiene (registro completo, TalkBack, filtro Rango, app cerrada con el dev client, ajuste visual del selector de idioma) sigue «No verificado en dispositivo». |
| Backend por HTTP | Probado por HTTP real con Stripe de prueba (STOP-5, 2026-11-16; `docs/progress.md:364`, `docs/pagos-evidencia.md`). Mercado Pago sigue sin verificar. Las rutas se probaron además con dependencias simuladas. |

## Límites propios de Historial y Ganancias

- **Gráfica del Historial:** suma solo los viajes cargados (de 20 en 20) y respeta el filtro de método; en Hoy, Semana y Mes puede subestimar hasta pulsar «Cargar más». Excluye los viajes cancelados.
- **Ganancias:** usa como máximo los 200 viajes más recientes (`TRIPS_LIMIT`).
- **Campo de fecha:** Ganancias agrupa por `finishedAt` y el Historial por `createdAt` (la paginación sin índice compuesto consulta `createdAt`). Un viaje que cruza la medianoche podría caer en días distintos en cada pantalla.
- **Comisión:** las métricas suman la `commission` y la `fare` guardadas en cada viaje (calculadas con el `commissionRate` vigente al terminarlo); no recalculan desde `commissionRate`. El resultado es equivalente; la spec (CA-002-89) pide leer `commissionRate` del viaje, y esa diferencia queda para decisión de Anderson.
- **Cambio de día:** si la app queda abierta pasada la medianoche, los periodos de Ganancias no se actualizan hasta que lleguen datos nuevos.

## Límites aceptados de pagos y datos

- **Cuentas anteriores sin `documents`:** pasan las reglas (los tres bloques son opcionales), pero no tienen licencia ni SOAT registrados.
- **D-109:** el backend toma el monto del documento del viaje en Firestore; un cliente con sesión válida podría haber escrito un monto distinto al crear. Se acepta como límite del taller.
- **Pasarelas de pago:** solo modo de prueba; no se mueve dinero real. Stripe rechaza claves `live` (D-119, Vigente). Mercado Pago sigue implementado, pero **no se pudieron crear cuentas de prueba**: su cobro es «No verificado en dispositivo» y no se afirma que funcione. Stripe es la pasarela verificada de punta a punta (ver `docs/pagos-evidencia.md`).
- **Stripe, lo que la documentación leída no confirma:** que la cuenta acepte **COP** (si no, el respaldo `STRIPE_CURRENCY=usd` con `STRIPE_COP_PER_USD`, solo de prueba); que Stripe acepte una URL de retorno `http://` (la vía IP + firewall puede fallar y obligar al túnel); que un **rechazo** de tarjeta se vea como «Rechazado» y no como «Pendiente»; el mínimo en USD; y la instalación de la CLI de Stripe en Windows (solo para el webhook opcional, D-120). Detalle en `docs/pagos-stripe-guia.md`.
- **Doble cobro de prueba al cambiar de pasarela:** si el conductor paga con una pasarela y, sin verificar, cambia a la otra sobre el mismo viaje, pueden quedar dos cobros de prueba (uno en cada panel). Mitigación: verificar antes de cambiar; el backend solo escribe `paymentMethod` mientras el pago no esté aprobado (D-118, Vigente). No mueve dinero real.
- **Regla de creación y `stripe` (decidido en #59):** la copia local de `firestore.rules` restringe `create` a `cash` y `mercadopago`; `stripe` solo lo escribe el backend con firebase-admin. No se republica. Ver `docs/seguridad.md` y D-121.
- **Nombre de la pasarela en la fila del Historial:** la lista muestra «Tarjeta»; el nombre (Stripe o Mercado Pago) solo aparece en el detalle del viaje. No se implementa (límite conocido, #59).
- **Reglas sugeridas para la constitución:** quedan por proponer y ratificar (por ejemplo: «los botones de cobro salen solo de las pasarelas configuradas» y «una etiqueta nombra una pasarela solo si hay `paymentId`»). No se añaden a `docs/constitution.md` en #59.
- **Backend detrás de un túnel:** sin `trust proxy`, todos los clientes comparten el límite de 120 por minuto (ver `docs/seguridad.md`).

## Límites de la orden a70c (D-124, D-125)
- **Nominatim:** servicio público de OpenStreetMap con política de uso justo: máximo 1 petición por segundo, `User-Agent` identificable, caché y tiempo límite de 4 s. Sin red o con límite, la app muestra «Calle cercana (simulada)». Las coordenadas de prueba salen a un tercero. No es apto para producción con volumen real.
- **Valores aleatorios simulados:** propina y calificación no son repetibles entre ejecuciones; las pruebas fijan el generador.
- **FCM:** implementado, Android validado en release (fila 1), iOS fuera, sin ubicación en segundo plano. **Selector de idioma:** ya no está omitido; lo cerró L3 (validado en dispositivo, STOP-6) y L3b lo añadió sin sesión (STOP-7 probado por Anderson 2026-11-16, 100 % OK salvo el ajuste visual del selector en inicio de sesión, verificación visual pendiente); ver fila 3, ahora superada.
- **Reglas de Firestore:** el guardado de un viaje con propina depende de que Anderson publique la regla `validTrip()` actualizada.

## Límites previstos de FCM (spec 003, propuesta; aplican si se aprueba y se implementa)
- Solo Android; iOS no se entrega (requiere APNs/cuenta de pago).
- La app no publica disponibilidad ni ubicación en segundo plano (D-130): el aviso llega por FCM y el conductor decide al abrir. El endpoint de prueba avisa sin exigir «Disponible» porque no es una solicitud real; en un sistema real solo recibiría el aviso un conductor disponible.
- Fabricantes con ahorro de batería agresivo pueden retrasar o matar la entrega (riesgo FR-7).
- Temporizador: la decisión pasa a 15 s (D-137, cierra G-06) y se cuenta desde que la solicitud se muestra; la notificación vale ≈ 90 s (`ttl`/`expiresAt`). El mock de 30 s deja de ser el tiempo de decisión.
- `sendEachForMulticast` envía hasta 500 tokens por llamada; la guía de Firebase marca `token` como deprecado a favor de `fid` (riesgo abierto, se confirma en S2).
- **Notificaciones, límites de S4:** el envío diferido de la solicitud de prueba se pierde si el backend se reinicia; la solicitud que llega por aviso es simulada (sin pasajero real) y su dirección es un texto fijo hasta resolverla al abrir; iOS queda fuera y no hay ubicación ni disponibilidad en segundo plano (D-130).
- **Contexto headless (D-145):** con la app cerrada, RN Firebase evalúa `index.js` sin actividad ni `globalThis.expo`; por eso `index.js` solo registra el manejador en segundo plano y carga `expo` y `App` de forma perezosa. Todo módulo que se importe de forma ansiosa en `index.js` o en `backgroundHandler.js` debe funcionar sin módulos de Expo; `headlessEntry.test.mjs` lo vigila. El arranque en frío sigue sin verificar en dispositivo.
- **Arranque en frío en el dev client (D-146):** en una build de desarrollo, `expo-dev-launcher` relanza la actividad sin los extras del intent de la notificación (`DevLauncherController.kt:346-383`), de modo que `getInitialNotification` puede devolver `null` y la solicitud no se muestra al tocar la notificación con la app cerrada. Con la app abierta o en segundo plano funciona. Hay que probarlo en una build release (que la hace el humano); sin código nativo nuevo no hay otra fuente soportada para leer el intent.
- **Rutas del Drawer y del Stack (D-148):** el Drawer registra `MainHome` y el Stack de viaje conserva `Home`; los `popTo('Home')` resuelven contra el Stack. No hay deep links (`linking` ausente), así que el renombre no rompe enlaces; el aviso de React Navigation por nombres repetidos desaparece. Pendiente de dispositivo: aceptar desde la tarjeta debe abrir `TripActive` y «Volver a Inicio» debe regresar sin dejar una segunda pila.
- **Límite del dev client (confirmado por Anderson, 2026-11-16):** con el development build y la app cerrada, tocar la notificación NO entrega la solicitud: `getInitialNotification` devuelve `null` (log `push-initial-null`) porque `expo-dev-launcher` relanza la actividad sin los extras del intent. No es un fallo del código: en la build release el mismo gesto abre la solicitud con la cuenta de 15 s y, vencido el plazo, «La solicitud expiró». Para probar o grabar el arranque en frío se usa la build release. Con la app en segundo plano el toque SÍ abre la solicitud, también en el dev client: validado por STOP-4 en Configuración, Historial y Perfil (`docs/progress.md:360`). La demostración se hace con el build release (D-149, D-151).
- **Sin ubicación ni disponibilidad en segundo plano (D-130):** la app no las publica; el aviso llega por FCM y el conductor decide al abrir la solicitud.
- **Disparo simulado:** la solicitud que llega por notificación se origina en el endpoint de prueba del backend (`POST /notifications/test-request`), no en un pasajero real; la dirección es un texto fijo hasta que la app la resuelve al abrir.
- **Solo Android:** iOS queda fuera de alcance (requiere APNs y cuenta de Apple Developer de pago, y no hay equipo para probarlo).
- **Pendientes de dispositivo (FCM):** `ReferenceError: logPushEvent` en el dev client (causa probable: bundle obsoleto, no confirmada; recargar con `npx expo start -c`); desaparición del aviso de navegación anidada tras renombrar el Drawer a `MainHome` (D-148); resto de la lista de comprobación en dispositivo (T-192; el archivo `docs/checklist-dispositivo-fcm.md` nunca se creó; la lista vigente de pruebas de dispositivo de la entrega es `docs/checklist-entrega-final.md`).
- **O-03 abierta (decide Anderson):** unificar «La solicitud expiró» (`labels.trip.pushExpired`) y «La solicitud venció» (`labels.trip.expired`). Sin cambio hasta que decida. El diseño de S5 sigue «Pendiente» (auditor, ronda 2; faltan la decisión de O-03 y las capturas).

## Límites del lote L2: estados, modelo y saldo (spec 005; D-181 a D-186 aprobadas salvo objeción, 2026-11-16)
<!-- AI-assisted: see docs/AI_LOG.md #66 -->
Estado: decisiones **Aprobada salvo objeción** (D-185 aceptada por Anderson). **L2 completo (estados rechazado y conductor llegando, campos aditivos, saldo completo, aviso de «No disponible», rapidez al tocar la notificación): Validada en dispositivo por Anderson (2026-11-16 14:54, build de desarrollo, STOP-5).** Reglas de Firestore con los estados nuevos publicadas por Anderson (≈14:20 Bogotá) y comprobadas con un guardado real (CA-005-26 y G-01 cerrados). **Siguen «No verificado en dispositivo» SOLO:** «Salir del viaje» a mitad de viaje y los viajes antiguos. **Hallazgo visual abierto, en corrección (lote L3, A5):** en el Detalle del viaje la ruta se corta por abajo, la atribución tapa el tramo final y el marcador de destino no se ve completo. La spec 005 sigue en Borrador; este texto se ajusta si Anderson cambia las decisiones.

**Desviaciones del esquema del enunciado (RE-13, D-186).** No se corrigen; se explican:
| ID | Se pide | Qué se hace | Por qué |
|---|---|---|---|
| L2-1 | Colección `trips` | Colección `drivers/{uid}/trips` | Cada conductor solo lee y escribe lo suyo con una regla simple por `uid`; mover la colección rompería los viajes guardados y las reglas. |
| L2-2 | Categoría `economy` | Clave `economico` en `category` (la ya guardada) | Es la clave de los viajes existentes; renombrarla obligaría a migrar. El objeto `economy` nuevo (montos) no cambia esa clave. |
| L2-3 | `completedAt` | Se escribe `completedAt` (solo en `completed`) Y se conserva `finishedAt` con el mismo instante | Ganancias, Historial y las reglas usan `finishedAt`; quitarlo rompería esas lecturas. |
| L2-4 | Estado `requested` | Existe en la máquina de estados, pero NO se escribe en Firestore (D-183) | No hay app de pasajero en este repo que cree el documento; la solicitud sin decisión solo vive en memoria. |

**Salida segura fuera de la máquina (RE-08, D-184).** «Salir del viaje» (`abandon()`) cierra el viaje en local como `cancelled` (o `completed` si ya estaba en el destino) cuando la API no confirma. Es un límite documentado, no una transición de la máquina: desde `in_progress` cancelar se rechaza, pero esta salida conserva su comportamiento.

**Coste de lecturas del saldo (RE-01 a RE-03, D-182).** El saldo se lee al enfocar Ganancias y al reintentar, por páginas de 500 con tope duro de 5000 documentos. Firestore cobra una lectura por documento devuelto (un agregado cobraría 1 lectura por cada 1.000 entradas de índice, mínimo 1). Coste por apertura aproximado: N lecturas (N = viajes del conductor que devuelve la consulta; todos si no filtra por `paymentStatus`), máximo 5000. Cuota gratuita: 50.000 lecturas por día. Si se alcanza el tope, el saldo se muestra como parcial (`truncated`), nunca como completo. Esto reemplaza el límite de «200 viajes» del saldo (D-170 parcialmente reemplazada); Ganancias por rango no cambia.

**Coste extra de persistir rechazos (RE-06, D-183).** Cada solicitud rechazada o vencida que se llegó a mostrar suma una escritura y una lectura (comprobación de existencia, para la idempotencia). Los viajes `rejected` también salen en las lecturas por rango (Ganancias) y paginadas (Historial), así que aumentan las lecturas aunque no sumen dinero. La escritura es de mejor esfuerzo y con tiempo límite: si falla, el rechazo no deja rastro. Una solicitud que nunca se mostró (por ejemplo, con «No disponible», D-181) no deja documento.

**Otros límites.** No hay «siguiente conductor» tras un rechazo (no existe backend de despacho ni app de pasajero). Guardar coordenadas de origen y destino (`origin`/`destination`) agrega datos del pasajero y está sujeto a la confirmación de privacidad de Anderson (D-185). Guardar cualquier viaje depende de la regla `validTrip()` de `docs/seguridad.md`, que Anderson publicó a mano el 2026-11-16 (≈14:20 Bogotá) y comprobó con un guardado real; si se reemplaza por una versión anterior, el guardado falla y la app lo muestra como «no se pudo guardar».

**Historial sin filtro por estado (T-231, RE-09).** El Historial filtra solo por periodo y por método de pago (en el cliente); no existe un filtro por estado, así que no se añadió un chip «Rechazados» (se evita crear un filtro nuevo en la misma tarea). Los viajes `rejected` salen en la lista con su etiqueta «Rechazado» y, con el filtro de método, bajo «Todos», «Tarjeta» o «Efectivo» según su `paymentMethod`. Pendiente de decisión de Anderson si se quiere un filtro por estado.

**Límites añadidos en el cierre de L2 (2026-11-16).**
- **Saldo sin caché, hasta 10 consultas por visita:** el saldo se recalcula en cada apertura de Ganancias y en cada reintento, con hasta 10 consultas secuenciales de 500 documentos (tope de 5000). No hay caché a propósito: el coste de lectura está acotado (máximo 5000 lecturas por visita) y una caché podría mostrar un saldo viejo como si fuera actual.
- **Tope de 5000 exacto (C2b):** con exactamente 5000 viajes el saldo ya no se marca como parcial; se hace una lectura de sondeo extra (1 documento) para saber si hay más. Solo con más de 5000 sale `truncated`. `fetchTripsInRangeWith` (Ganancias por rango) conserva el criterio anterior y no se tocó.
- **Documentos sin `createdAt`:** la paginación usa `orderBy('createdAt')`, y Firestore deja fuera los documentos que no tienen ese campo; un viaje antiguo sin `createdAt` no entra al saldo ni al Historial paginado.
- **`declineWiring.test.mjs` usa expresiones regulares:** comprueba que la tarjeta y la pantalla llaman al mismo punto de rechazo leyendo el código fuente; no ejecuta el flujo de React. Se acepta porque no hay entorno de render en el proyecto (sin dependencias nuevas); el flujo real queda para la prueba en el celular.
- **`acceptRequest` con «ya tomada/vencida» no guarda `rejected`:** no fue una decisión del conductor ni un vencimiento propio, así que no queda documento (también anotado en D-183).
- **Saldo sin sesión (C2a):** sin `driverId` Ganancias muestra «Saldo no disponible» en vez de quedarse cargando.
- **Salir del viaje (C2c), No verificado en dispositivo (pendiente, junto con los viajes antiguos):** a mitad de viaje el texto dice que queda cancelado y sin cobro; se guarda como `cancelled` con montos 0. En el destino se cierra como completado en el teléfono sin registrar el cobro.
- **Chip «Rechazados» (T-231) OMITIDO:** decisión de Anderson (2026-11-16); los `rejected` salen en la lista con su etiqueta, sin filtro por estado.

## Límites del lote L3: idioma español/inglés (spec 006; RI-24, D-188 a D-192)
<!-- AI-assisted: see docs/AI_LOG.md #67 -->
Se declaran como límites, no como defectos. Estado en dispositivo: **No verificado en dispositivo** salvo lo indicado.

**Parte A y el idioma: Validada en dispositivo por Anderson (2026-11-16 15:59, STOP-6).** Cambio instantáneo a inglés, persistencia al reabrir, solicitud abierta sin reinicio de contador ni cambio de tarifa, todo en inglés, idioma conservado tras cerrar sesión y entrar de nuevo, fuente al 200 % sin cortes y Detalle con la ruta completa. `npm test` histórico de ese punto de control (STOP-6): 337 pruebas, 336 pasan, 0 fallan, 1 omitida (PowerShell); otras cifras históricas: STOP-4, 159/159. Cifra ACTUAL (2026-11-16): 358 pruebas, 357 pasan, 0 fallan, 1 omitida; `check-constitution`: 14 errores (línea base). Siguen sin verificar en dispositivo: TalkBack/VoiceOver (CA-006-13) y el aviso con almacenamiento que falla (CA-006-17). **La Parte B (límites a, b y c) queda documentada tal cual, sin validar.** <!-- AI-assisted: see docs/AI_LOG.md #68 -->

**Los cinco límites de RI-24 (CA-006-33).**
- **(a) Texto de la notificación push en español.** El título («Nueva solicitud de viaje») y el cuerpo (`Económico · {km} km · {min} min`, con el kilometraje con coma decimal) los arma el backend (`backend/src/notifications/payload.js`: `NOTIFICATION_TITLE` y `buildMessage`) y no recibe el idioma del usuario. Con la app cerrada o en segundo plano se ve en español aunque la app esté en inglés. Una vez abierta la solicitud, su pantalla sí usa el idioma activo. Cambiarlo exigiría enviar el idioma al backend al registrar el token (D-189); se descarta en este lote por RI-12 (`backend/` no cambia, CA-006-34) y queda como mejora.
- **(b) Direcciones y nombres.** Las direcciones que devuelve Nominatim y los nombres simulados de pasajeros (fijos en `payload.js`) no se traducen.
- **(c) Pasarelas de pago.** Stripe Checkout (y Mercado Pago) sigue el idioma de la pasarela.
- **(d) Sistema.** Los diálogos de permisos del sistema y el nombre del canal Android (si está en español) no cambian con el idioma de la app.
- **(e) Herramientas de desarrollo.** Los textos de la prueba de mapa y de `mapTest`, `forceState` y `demo` se traducen con el resto para que la paridad sea total, aunque solo se vean en desarrollo.

**Diferencia con G-05.** G-05 pide el idioma en el perfil; aquí se guarda por dispositivo (clave local `appLanguage`), no en el perfil del conductor (D-188, Propuesta). Cambiar de teléfono o reinstalar vuelve a la sugerencia del registro o al idioma del teléfono.

**Lector del idioma del teléfono en iOS (D-190).** Sin `expo-localization`, el idioma se lee con `SettingsManager` (`AppleLanguages`), `I18nManager` e `Intl`. En iOS el locale de región puede no coincidir con el idioma preferido; por eso se prefiere `AppleLanguages`. No está verificado qué lector responde en cada sistema operativo. Cualquier idioma distinto de español o inglés cae a español.

**La paridad mide presencia, no calidad.** La prueba de paridad comprueba que cada clave exista en ambos idiomas, no que la traducción al inglés sea buena ni que quepa en pantalla; eso depende de la revisión humana y de la auditoría al 200 % (T-263, T-264).

**Heurística de la prueba estática (D-192).** `scripts/tests/i18nCoverage.test.mjs` analiza el código con expresiones regulares, no con un AST. Límites reales hallados por el verificador de S4:
- No detecta: `{'literal'}` en JSX; ternarios con literales dentro de `{}`; plantillas con texto en JSX; `headerTitle:` o `tabBarLabel:` literales; `Alert.alert(t, 'ok')` con una palabra en minúscula; ni la desestructuración de nodos de `labels` a nivel de módulo.
- La regla de lecturas de hoja de `labels` a nivel de módulo no corre en `services`, `utils`, `constants`, `config` ni `theme`. La revisión manual y por AST dio 0 hallazgos hoy, pero no queda protegida a futuro.
- La revisión visual en inglés sigue siendo necesaria.

**Sugerencia del registro (`src/i18n/applySuggestion.js`, L3b T-269, CA-006-49).** Ya no pisa un cambio hecho mientras se leía la preferencia: si el idioma activo cambió durante la espera, la sugerencia se descarta. Límite residual: si el usuario elige el mismo idioma que ya estaba activo no queda rastro y no se distingue de no haber elegido nada (la sugerencia se aplicaría igual); y si el guardado de la elección falló, no hay preferencia guardada y una sugerencia posterior podría aplicarse. Pendiente de dispositivo.

**Hora local (`src/utils/format.js`, L3b T-269, CA-006-47).** La app muestra fechas y horas con la zona horaria del teléfono; no usa una zona fija. Para pruebas, `format.js` acepta un desfase inyectable (`{ utcOffsetMinutes }`), por lo que las pruebas no dependen de la zona de quien las ejecuta. Un viaje visto con el teléfono en otra zona se mostrará con la hora de esa zona.

**Otros límites.**
- **`delayValue(15)`** muestra «15 s» en ambos idiomas (caso CA-006-07); no es un texto sin traducir.
- **CA-006-19** no tiene prueba de renderizado (no hay entorno de render en el proyecto); el re-render real al cambiar el idioma quedó **Validada en dispositivo por Anderson** (2026-11-16 15:59, STOP-6).
- **`useMemo` sin `language`:** el de `toPickup` en `TripRequestScreen` y el de `documentFields` en `RegistrationFormContext` no dependen de `language`. Hoy es inalcanzable porque el idioma solo cambia en Configuración; si algún día cambia desde otra pantalla, deben recibirlo como dependencia.
