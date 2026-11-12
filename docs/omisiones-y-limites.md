# Omisiones y límites — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #57 (T-133) -->
Estado: **borrador para revisión de Anderson (2026-11-12).** Lista lo que la entrega no hace, o hace de otra forma, con lo que se pide, lo que se hizo, la razón técnica y el impacto. Nada de lo que aparece aquí se declara como hecho en el README.

**Fuente de «lo que se pide».** El enunciado real es `docs/UberClone — Versión Conductor.pdf` (taller «Uber - clone»). La tabla de cobertura de abajo se contrasta con sus nueve secciones; la columna «Se pide» de las tablas siguientes cita lo que el enunciado exige y lo que los requisitos (`docs/requisitos.md`) y las decisiones (`docs/decisiones.md`) derivan de él.

## Cobertura del enunciado

Estados: **hecho** (implementado y aprobado en lo estático), **parcial**, **omitido** y **No verificado en dispositivo** (implementado, pero solo se ve en el celular; ninguna fila de esta tabla está validada en el celular todavía).

| § | Qué se pide | Estado |
|---|---|---|
| 1 | Descripción y funcionalidades 1 a 8 (registro, disponibilidad, solicitudes, viaje, cobro, ganancias, historial) | Hecho en lo estático; **No verificado en dispositivo**. Faltan los puntos de las filas 1 a 5 de Omisiones. |
| 2 | Registro en 3 pestañas (datos personales, vehículo, documentos/pagos); sin guardar datos de tarjeta ni bancarios | Hecho; **No verificado en dispositivo** (los puntos de control A, B y C no tienen evidencia). Se guarda solo el correo de Mercado Pago. |
| 3 | Siete pantallas, siete estados del viaje y los hooks obligatorios (`useDriverLocation`, `useTripRequests`, `useEarnings`) | Parcial. Los hooks existen. El conductor usa `accepted`, `driver_arriving`, `driver_arrived`, `in_progress`, `completed`, `cancelled` y `paid`; no hay `requested` ni `rejected` del lado del conductor porque el pasajero es un simulado. El temporizador de solicitud es de 15 s según RF-11; el simulado del pasajero vive 30 s (`MOCK_REQUEST_TTL_MS`). **No verificado en dispositivo.** |
| 4 | Cobro con Mercado Pago o Stripe, `.env` en el backend, comisión del efectivo descontada del saldo | Parcial. Implementadas **las dos pasarelas** en modo de prueba (R12, D-116 a D-120 en Propuesta): Mercado Pago y Stripe Checkout; el conductor elige una por cobro. **Ninguna está verificada en el celular**; Mercado Pago no pudo probarse porque no se pudieron crear cuentas de prueba. Efectivo y saldo implementados. **No verificado en dispositivo.** Guías: `docs/pagos-stripe-guia.md` y `docs/pagos-guia-rapida.md`. |
| 5 | Fórmula de tarifa y `calculateFare`, comisión del 20 % con `commissionRate` guardado, métricas de Ganancias y saldo | Hecho en lo estático (`src/utils/fare.js`, `src/utils/earnings.js`); **No verificado en dispositivo.** Los viajes antiguos sin método de pago se tratan como «Cobro simulado» (D-111, propuesta). |
| 6 | Historial con `FlatList`, filtros Hoy/Semana/Mes/Rango y método de pago, detalle con ruta, propina y calificación, estado vacío y paginación | Parcial. Lista, filtros, estado vacío y paginación (de 20 en 20) hechos. Detalle con ruta implementado (T-109, T-110) y aprobado en lo estático; **No verificado en dispositivo.** La ruta es la simplificada guardada (D-110), no el recorrido real; propina y calificación simuladas (filas 4 y 5 de Omisiones). «Rango» solo en Android. |
| 7 | FCM, Firestore en tiempo real y geolocalización obligatorios; lo demás opcional; Directions y Distance Matrix solo al crear y aceptar | Parcial. Firestore en tiempo real y geolocalización hechos; **No verificado en dispositivo.** FCM omitido (fila 1). Directions sustituido por OSRM (ver Sustituciones). |
| 8 | Bitácora de IA, sección «Uso de IA» del README y exportación a PDF | Parcial. `docs/AI_LOG.md` y la sección del README existen; **el PDF lo exporta el humano** (paso manual de la entrega). |
| 9 | Entregables: repositorio y PRs, README con `.env.example`, bitácora con PDF, video de máximo 5 minutos | Parcial. README y `.env.example` del backend listos; guion en `docs/guion-video.md` (4:45). Commit, push, PDF y video son pasos manuales del humano. |

## Omisiones

| # | Se pide | Qué se hizo | Por qué | Impacto |
|---|---|---|---|---|
| 1 | Notificaciones push (FCM) | Nada. | Exigen proyecto FCM con credenciales, tokens por dispositivo y un emisor desde el lado del pasajero, que no existe en este taller; el build nativo lo hace el humano. | Sin avisos con la app cerrada. Las solicitudes entran solo con la app abierta. |
| 2 | Perfil editable | **Acotado (D-122).** Se editan nombre, celular, color del vehículo y «Correo de cobros». Placa, marca/modelo, año, categoría, estado de cuenta y documentos quedan de solo lectura con «Para cambiar estos datos contacta a soporte.». **No verificado en dispositivo.** | Esos datos identifican al conductor y al vehículo aprobado; cambiarlos exigiría reaprobación. La regla de Firestore `validProfileEdit()` (`docs/seguridad.md`) solo admite los 4 campos y debe publicarla Anderson a mano (D-80). | El «Correo de cobros» es informativo en esta versión (D-123): no mueve dinero ni cambia la pasarela. Sin la regla publicada, guardar falla con error visible. |
| 3 | Idioma ES/EN | `language` se guarda en el registro; todos los textos están en español en `src/constants/labels.js`. | No hay capa de traducción ni pruebas en inglés. | La app se muestra solo en español; Configuración no tiene selector de idioma. |
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
| Dispositivo | Las pruebas en celular están pendientes: los puntos de control A, B y C no tienen evidencia todavía. Todo lo que solo se ve en el celular es «No verificado en dispositivo». |
| Backend por HTTP | **Sin probar por HTTP real.** `backend/node_modules` no está instalado: las rutas solo se probaron con dependencias simuladas (fakes), nunca con `npm start`. El primer arranque real será el del paso 1 del checklist (`npm install`, `npm run doctor`, `npm start`). **No verificado en dispositivo.** |

## Límites propios de Historial y Ganancias

- **Gráfica del Historial:** suma solo los viajes cargados (de 20 en 20) y respeta el filtro de método; en Hoy, Semana y Mes puede subestimar hasta pulsar «Cargar más». Excluye los viajes cancelados.
- **Ganancias:** usa como máximo los 200 viajes más recientes (`TRIPS_LIMIT`).
- **Campo de fecha:** Ganancias agrupa por `finishedAt` y el Historial por `createdAt` (la paginación sin índice compuesto consulta `createdAt`). Un viaje que cruza la medianoche podría caer en días distintos en cada pantalla.
- **Comisión:** las métricas suman la `commission` y la `fare` guardadas en cada viaje (calculadas con el `commissionRate` vigente al terminarlo); no recalculan desde `commissionRate`. El resultado es equivalente; la spec (CA-002-89) pide leer `commissionRate` del viaje, y esa diferencia queda para decisión de Anderson.
- **Cambio de día:** si la app queda abierta pasada la medianoche, los periodos de Ganancias no se actualizan hasta que lleguen datos nuevos.

## Límites aceptados de pagos y datos

- **Cuentas anteriores sin `documents`:** pasan las reglas (los tres bloques son opcionales), pero no tienen licencia ni SOAT registrados.
- **D-109:** el backend toma el monto del documento del viaje en Firestore; un cliente con sesión válida podría haber escrito un monto distinto al crear. Se acepta como límite del taller.
- **Pasarelas de pago:** solo modo de prueba; no se mueve dinero real. Stripe rechaza claves `live` (D-119, Vigente). Mercado Pago sigue implementado, pero **no se pudieron crear cuentas de prueba**: su cobro es «No verificado en dispositivo» y no se afirma que funcione.
- **Stripe, lo que la documentación leída no confirma:** que la cuenta acepte **COP** (si no, el respaldo `STRIPE_CURRENCY=usd` con `STRIPE_COP_PER_USD`, solo de prueba); que Stripe acepte una URL de retorno `http://` (la vía IP + firewall puede fallar y obligar al túnel); que un **rechazo** de tarjeta se vea como «Rechazado» y no como «Pendiente»; el mínimo en USD; y la instalación de la CLI de Stripe en Windows (solo para el webhook opcional, D-120). Detalle en `docs/pagos-stripe-guia.md`.
- **Doble cobro de prueba al cambiar de pasarela:** si el conductor paga con una pasarela y, sin verificar, cambia a la otra sobre el mismo viaje, pueden quedar dos cobros de prueba (uno en cada panel). Mitigación: verificar antes de cambiar; el backend solo escribe `paymentMethod` mientras el pago no esté aprobado (D-118, Vigente). No mueve dinero real.
- **Regla de creación y `stripe` (decidido en #59):** la copia local de `firestore.rules` restringe `create` a `cash` y `mercadopago`; `stripe` solo lo escribe el backend con firebase-admin. No se republica. Ver `docs/seguridad.md` y D-121.
- **Nombre de la pasarela en la fila del Historial:** la lista muestra «Tarjeta»; el nombre (Stripe o Mercado Pago) solo aparece en el detalle del viaje. No se implementa (límite conocido, #59).
- **Reglas sugeridas para la constitución:** quedan por proponer y ratificar (por ejemplo: «los botones de cobro salen solo de las pasarelas configuradas» y «una etiqueta nombra una pasarela solo si hay `paymentId`»). No se añaden a `docs/constitution.md` en #59.
- **Backend detrás de un túnel:** sin `trust proxy`, todos los clientes comparten el límite de 120 por minuto (ver `docs/seguridad.md`).

## Límites de la orden a70c (D-124, D-125)
- **Nominatim:** servicio público de OpenStreetMap con política de uso justo: máximo 1 petición por segundo, `User-Agent` identificable, caché y tiempo límite de 4 s. Sin red o con límite, la app muestra «Calle cercana (simulada)». Las coordenadas de prueba salen a un tercero. No es apto para producción con volumen real.
- **Valores aleatorios simulados:** propina y calificación no son repetibles entre ejecuciones; las pruebas fijan el generador.
- **FCM y selector de idioma:** siguen omitidos (filas 1 y 3).
- **Reglas de Firestore:** el guardado de un viaje con propina depende de que Anderson publique la regla `validTrip()` actualizada.
