# Omisiones y límites — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #56 (T-111) -->
Estado: **borrador para revisión de Anderson (2026-11-11).** Lista lo que la entrega no hace, o hace de otra forma, con lo que se pide, lo que se hizo, la razón técnica y el impacto. Nada de lo que aparece aquí se declara como hecho en el README.

**Fuente de «lo que se pide».** `docs/enunciado-taller.pdf` todavía no está en el repositorio, así que la columna «Se pide» se toma de los requisitos del proyecto (`docs/requisitos.md`) y de las decisiones vigentes (`docs/decisiones.md`). Cuando Anderson copie el enunciado, esta tabla se rehace contra él.

## Omisiones

| # | Se pide | Qué se hizo | Por qué | Impacto |
|---|---|---|---|---|
| 1 | Notificaciones push (FCM) | Nada. | Exigen proyecto FCM con credenciales, tokens por dispositivo y un emisor desde el lado del pasajero, que no existe en este taller; el build nativo lo hace el humano. | Sin avisos con la app cerrada. Las solicitudes entran solo con la app abierta. |
| 2 | Perfil editable | Perfil en solo lectura con cuenta aprobada. | La cuenta aprobada no puede escribir su documento (regla de Firestore, `docs/seguridad.md`). Editar exigiría reglas por campo y reaprobación. | Para corregir datos se reenvía el registro mientras la cuenta no esté aprobada. |
| 3 | Idioma ES/EN | `language` se guarda en el registro; todos los textos están en español en `src/constants/labels.js`. | No hay capa de traducción ni pruebas en inglés. | La app se muestra solo en español; Configuración no tiene selector de idioma. |
| 4 | Propinas y calificación | Las ganancias calculan propinas, pero el viaje guardado no trae `tip` ni calificación. | No hay API del pasajero que los entregue (su URL aún no se conoce). | El total de propinas queda en 0. |
| 5 | Detalle de viaje con ruta (T-109, T-110) | Pendiente en el backlog; el viaje ya guarda hasta 40 puntos de ruta (D-110). | Planificadas después del mínimo viable; **la decisión de hacerlas o descartarlas es de Anderson.** | Hoy Historial no abre un detalle con mapa. |

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

## Límites propios de Historial y Ganancias

- **Gráfica del Historial:** suma solo los viajes cargados (de 20 en 20) y respeta el filtro de método; en Hoy, Semana y Mes puede subestimar hasta pulsar «Cargar más». Excluye los viajes cancelados.
- **Ganancias:** usa como máximo los 200 viajes más recientes (`TRIPS_LIMIT`).
- **Campo de fecha:** Ganancias agrupa por `finishedAt` y el Historial por `createdAt` (la paginación sin índice compuesto consulta `createdAt`). Un viaje que cruza la medianoche podría caer en días distintos en cada pantalla.
- **Comisión:** las métricas suman la `commission` y la `fare` guardadas en cada viaje (calculadas con el `commissionRate` vigente al terminarlo); no recalculan desde `commissionRate`. El resultado es equivalente; la spec (CA-002-89) pide leer `commissionRate` del viaje, y esa diferencia queda para decisión de Anderson.
- **Cambio de día:** si la app queda abierta pasada la medianoche, los periodos de Ganancias no se actualizan hasta que lleguen datos nuevos.

## Límites aceptados de pagos y datos

- **Cuentas anteriores sin `documents`:** pasan las reglas (los tres bloques son opcionales), pero no tienen licencia ni SOAT registrados.
- **D-109:** el backend toma el monto del documento del viaje en Firestore; un cliente con sesión válida podría haber escrito un monto distinto al crear. Se acepta como límite del taller.
- **Mercado Pago:** solo modo de prueba; no se mueve dinero real.
- **Backend detrás de un túnel:** sin `trust proxy`, todos los clientes comparten el límite de 120 por minuto (ver `docs/seguridad.md`).
