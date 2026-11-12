# Estado actual del proyecto — 2026-11-11

Informe de solo lectura para el asesor. Leyenda: **[V]** verificado leyendo código o corriendo comandos en esta sesión; **[D]** solo declarado en los docs; **[NV]** no verificado. Sin secretos, claves, correos ni ubicaciones.

## 1. Resumen ejecutivo

- Rama `anderson/funcionalidad-sesiones`, 2 commits por delante de `main` [V]. Hay un bloque grande **sin commitear** (lote de pagos, documentos, Inicio con mapa) [V].
- Hecho y validado en el celular: precio en la solicitud, accesibilidad, marcador del auto y sesiones con correo y contraseña (S1 a S4b; lo dice el commit `2e08786`, la evidencia por criterio es [NV]).
- Implementado sin validar en el celular: cierre de sesión y cambio de cuenta (T-70 a T-72), Inicio con mapa, «NaN:NaN», pestaña de documentos, backend de Mercado Pago, cobro en la app, efectivo y saldo.
- **No iniciado**: historial con filtros, paginación y gráfica (T-101 a T-106), métricas y hook `useEarnings` (T-107, T-108), detalle con ruta (T-109, T-110), `omisiones-y-limites.md` (T-111), auditorías de diseño (T-112 a T-114), cierre F6 (T-73, T-74, T-115 a T-117).
- Reglas de Firestore nuevas (trips, documents, password): solo en texto; **no publicadas** [D].
- `check-constitution`: 12 errores, 123 advertencias [V].
- Entregables faltantes: PDF de la bitácora, video ≤5 min, README completo, omisiones.

## 2. Git y árbol

| Dato | Valor |
|---|---|
| Rama / HEAD | `anderson/funcionalidad-sesiones` / `5cbd7df` [V] |
| Remota de esta rama | no tiene (`origin/main` = `47649c9` = `main` local) [V] |
| main vs rama | 0 detrás, 2 delante; 56 archivos, +3343/−305 [V] |
| Ramas locales | main, diseno-registro, diseno-ui, diseno-ui-2, estado-y-siguiente-spec, fundacion-t01-t10, rebanada-c-viajes, registro-conductor, funcionalidad-sesiones [V] |

`git log --oneline -25`: todos los commits los firma Anderson (quien commitea el trabajo de los agentes); el log no distingue agente de humano [V].

| Commit | Tipo | Contenido |
|---|---|---|
| 5cbd7df | agentes | sesiones T-70 a T-72, pendiente de celular |
| 2e08786 | agentes | precio, accesibilidad, marcador, gate de sesión (S1 a S4b) |
| 47649c9, 377260a, 369509a, f7be7cb, 573fc7f, 1d4b89a | Anderson | merges de PR #1 a #6 |
| af20e21, 315ff8c | agentes | rediseño UI áreas A a E |
| 42ce905 | agentes | guardado de viajes, cobro simulado, ganancias, historial, perfil (T-46 a T-49) |
| f0ef3f6, daf4584, b65128e | agentes | tarjeta de solicitud, viaje, resumen, disponibilidad |
| 37e52e9, 946e57e | agentes | tarifa, comisión, API mock; mapa MapLibre, rutas, ubicación |
| b2a6111 | docs | decisiones D-76 a D-81 |
| d3f1b62, 1b015c1, 4cf9fcc, 2d6fe01, 4f59f78 | agentes | registro, Cloudinary, dependencias nativas, Firebase |
| 22e9d14, a5dffc8, 4509788 | agentes | fundación T-01 a T-14 |

**Sin commitear [V]** (no es de las rebanadas S1 a S4c; corresponde al prompt #55):

| Rebanada | Archivos |
|---|---|
| F1 Inicio y fecha | `HomeScreen.js`, `home/HomeFloatingCard.js`, `locationPolicy.js`, `format.js`, `AvailabilityContext.js`, `TripMap.js` |
| F2 documentos | `DocumentsScreen.js`, `documentValidators.js`, `documentsMapping.js`, `DateField.js`, `PhotoField.js`, `RegistrationFormContext.js` y 2 pruebas |
| F4 backend | `backend/src/{admin,auth,config,firestore,mercadopago,middleware}.js`, `routes/`, `.env.example`, `app.js`, `server.js`, `package.json` |
| F4 app | `useTripPayment.js`, `paymentsService.js`, `trip/{paymentActions,paymentView,paymentsClient,simplifyRoute,tripPaymentSubscription}.js`, `config/backend.js`, `tripRecord.js`, `tripController.js`, `tripRepository.js`, `TripSummaryScreen.js`, passengerApi `contract/mappers` |
| Saldo y Ganancias | `utils/earnings.js`, `EarningsScreen.js`, `HistoryScreen.js` |
| Docs | `pagos.md`, `AI_LOG.md`, `analisis-brechas`, `backlog`, `decisiones`, `progress`, `requisitos`, `seguridad`, `README.md`, `spec.md`, `plan.md`, `scripts/dependencies.json`, `.gitignore` |
| Pruebas | 8 archivos `scripts/tests/*.test.mjs` y `helpers/` |

Cambios que no corresponden a una rebanada registrada: ninguno claro. Quién hizo este bloque (sesión de agente o a mano) es [NV]. No se pudo confirmar si D-105/D-106 y la nota de T-72 están en el commit o en el árbol sucio [NV].

## 3. Progreso por rebanada (estado en `docs/backlog.md` [V]; commit [V])

| Tarea | Estado | Commit | Pendiente |
|---|---|---|---|
| S1 a S4b (T-55 a T-69) | Validada en el celular (según commit) | 2e08786 | filas de progress.md aún «pendiente» en varias; reconciliar |
| T-70, T-71, T-72 | Implementada, verificada estático, sin celular | 5cbd7df | checkpoint S4c (8 pasos) sin resultados |
| T-73, T-74 | No iniciada (van a F6) | — | reglas password, README, arquitectura de sesiones |
| T-75, T-76 | No iniciada (auditorías) | — | solo si sobra tiempo |
| T-77 NaN | Implementada, verificada estático | sin commit | celular (checkpoint A) |
| T-78 ayudante de pruebas | «Pendiente» en backlog, pero existen `scripts/tests/helpers/` y pruebas | sin commit | estado desactualizado [NV] |
| T-79, T-80 Inicio con mapa e interruptor | Implementada; 1 hallazgo corregido; Diseño pendiente | sin commit | celular (A), auditoría |
| T-81 a T-83 documentos | Implementada | sin commit | celular (A) |
| T-84 texto de reglas documents | Implementada | sin commit | falta verifier distinto |
| T-85 a T-89 backend | Validada (estático, verifier distinto) | sin commit | cuenta real de Mercado Pago [NV] |
| T-90 pagos.md | Implementada, corregida 1 vez | sin commit | re-verificación |
| T-91 reglas trips | Validada (estático) | sin commit | emulador, publicación |
| T-92 a T-96 | Validada (estático) | sin commit | celular (B), Diseño (T-113) |
| T-97, T-98 | Implementada (verificada estático) | sin commit | celular (B) |
| T-99 saldo puro | Implementada y Validada estático (10 aserciones) | sin commit | usa `trip.commission` guardada |
| T-100 saldo en pantalla | Implementada; verificación en curso | sin commit | celular (B) |
| T-101 a T-110 historial, métricas, detalle | **No iniciada** | — | todo |
| T-111 a T-117 | No iniciada | — | omisiones, auditorías, cierre |

Resultado de lo pedido [V en código]:

| Funcionalidad | Estado |
|---|---|
| «NaN» en Ganancias | corregido con guard en `format.js` y prueba; sin celular |
| Mapa en Inicio con interruptor | implementado (`HomeFloatingCard`, `locationPolicy`); sin celular |
| Pestaña Documentos (licencia, SOAT, RTM) | implementado; sin celular; reglas sin publicar |
| Pagos Mercado Pago (backend y app) | implementado, verificado en estático; **nunca corrido contra Mercado Pago** [D] |
| Efectivo | implementado (`confirmCashPayment`); sin celular |
| Saldo | `computeBalance` en `earnings.js` y mostrado en `EarningsScreen`; sin celular |
| Historial con filtros y gráficas | **faltante**: `HistoryScreen` no tiene FlatList, filtros ni gráfica [V] |
| Detalle del viaje con ruta | **faltante** [V: no hay pantalla de detalle]; la ruta simplificada sí se guarda (`simplifyRoute`) |
| Ganancias hoy/semana/mes | existe `computePeriodTotals` con `useMemo` en pantalla; **no existe hook `useEarnings`** [V] |

## 4. Comportamiento real hoy (desde el código)

**Navegación [V por listado de archivos; árbol exacto no releído]:** `RootNavigator` con compuerta de sesión (`sessionGate`): `AuthStack` (Iniciar sesión, Crear cuenta, Recuperar contraseña); `RegistrationTabs` (Datos personales, Vehículo, Documentos y pagos); `StartupScreen` (carga o error con «Cerrar sesión»); `MainDrawer` (Inicio, Ganancias, Historial, Perfil, Configuración); `TripStack` (Solicitud, Viaje, Resumen).

**Ciclo del viaje:** máquina en `tripMachine.js` y `tripController.js`; solicitud entrante del API simulado del pasajero (`passengerApi/mock`, forma aislada en `mappers.js`). Al completar, `TripContext`/`TripSummaryScreen` llaman `buildTripRecord` y `saveTrip` (con cola `saveQueue` y reintento `saveRetry`) [V]. Modelo declarado (D-108): `status` `completed`/`cancelled`/`paid`, `paymentStatus` `pending`/`approved`/`rejected`, `paymentMethod` `cash`/`mercadopago`. Valores exactos de `tripRecord.js` no releídos [NV].

**Escrituras en Firestore [V por grep]:**

| Ruta | Cuándo | Cómo |
|---|---|---|
| `drivers/{uid}` | registro enviado | `setDoc` con `serverTimestamp` (estado `pending`) |
| `driverLocations/{uid}` | solo en «Disponible» | `setDoc` merge |
| `drivers/{uid}/trips/{tripId}` | al completar o cancelar | `setDoc` idempotente (lee antes) con `createdAt` de servidor |
| mismo documento | efectivo confirmado | `updateDoc` solo `paymentStatus` y `status` a `paid` |
| mismo documento | pago con tarjeta | solo el backend (admin SDK) |

**Pago en la solicitud:** `TripRequestScreen` muestra la etiqueta del método (`request.paymentMethod`); lo decide el mock del pasajero vía `mappers.js` [V].

**Saldo:** `computeBalance(trips)`: suma `driverEarnings` de viajes pagados con tarjeta y resta `commission` de efectivo; puede ser negativo; devuelve 0 si no es finito [V].

**Hooks:** `useDriverLocation`, `useTripRequests`, `useTrips`, `useTripPayment`; `useMemo` en Ganancias [V]. Faltan `useEarnings`; `useCallback` en pantallas no contado [NV].

**Mapa y ruta:** MapLibre con OpenFreeMap; rutas por OSRM con respaldo `fallbackRoute` y línea recta (`routing/`); `CarMarker` tinta el glifo con el color registrado (D-100); rotación del auto **no implementada** [D]. Sin celular.

**Sesiones:** correo y contraseña con Firebase Auth (persistencia solo en `firebase.js`), `resetSession` y cuenta en Configuración. Sin celular para T-70 a T-72. El proveedor Correo/contraseña debe activarse a mano en la consola [D].

## 5. Backend

| Dato | Valor |
|---|---|
| Archivos [V] | `app.js`, `server.js`, `admin.js`, `auth.js`, `config.js`, `firestore.js`, `mercadopago.js`, `middleware.js`, `routes/payments.js`, `routes/webhooks.js` |
| Endpoints [V] | `GET /health`, `POST /payments/checkout`, `POST /payments/sync`, `POST /webhooks/mercadopago` |
| Dependencias [V] | `express ^5.3.0`, `firebase-admin ^13.0.0`; Node ≥20.12 |
| Arranque [V] | `npm start` → `node src/server.js` (en `backend/`) |
| Variables (solo nombres) [V] | `FIREBASE_SERVICE_ACCOUNT_PATH`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` (opcional), `PORT`, `PUBLIC_BASE_URL`; en la app `EXPO_PUBLIC_BACKEND_URL` |
| Pruebas | `scripts/tests/backendPayments.test.mjs` con fakes; no corridas en esta sesión [NV] |

Defensas declaradas en `docs/pagos.md` [D]: monto tomado del documento, ID token, límites de frecuencia, CORS cerrado, webhook que reconsulta el pago, idempotencia.

**Falta para probar de punta a punta:** credenciales de prueba de Mercado Pago; `backend/.env` creado a mano; archivo de cuenta de servicio (la carpeta `backend/secrets/` no existe localmente [V]); túnel público o IP y `EXPO_PUBLIC_BACKEND_URL`; publicar reglas; activar Correo/contraseña; pruebas en el celular. Puntos sin confirmar según `pagos.md`: `init_point` frente a `sandbox_init_point`, búsqueda de pagos, formato de la firma, propagación de `metadata.uid`.

## 6. Reglas de Firestore (según `docs/seguridad.md` [D]; lo publicado en la consola es [NV])

| Colección | Texto documentado | Estado |
|---|---|---|
| `drivers/{uid}` | solo el dueño; creación con `accountStatus == pending`; validaciones; sin edición si aprobada; sin borrado | asumida publicada; el texto aún habla de auth anónima (D-53), desactualizado por D-93 |
| `driverLocations/{uid}` | dueño; forma cerrada (lat, lng, timestamp, tripStatus, updatedAt) | el doc dice borrador; contradicción interna [D] |
| `drivers/{uid}/trips/{tripId}` | lectura del dueño; creación exige cuenta aprobada y `validTrip()`; actualización solo efectivo `pending`→`paid`; sin borrado | **pendiente de publicar** |
| `drivers.documents` | licencia, SOAT y RTM con foto https y fecha `YYYY-MM-DD`; bloques opcionales para cuentas viejas | **pendiente de publicar** |
| password (T-73) | texto **no existe** todavía | pendiente (F6) |

Diferencias exactas: lo publicado probablemente no incluye `trips` ni `documents`; cuenta aprobada requerida para guardar viajes.
**Orden recomendado:** validar en celular → escribir T-73 → publicar una sola vez (drivers+documents, driverLocations, trips) → repetir pruebas de A, B y C.
**Si no se publican:** fallan el guardado de viajes, el cobro en efectivo y el pago con tarjeta (el backend con admin SDK sí escribe). **Si se publican:** una cuenta sin `approved` no puede crear viajes (Anderson aprueba a mano en la consola).

## 7. Decisiones y documentación

Decisiones: 110 (D-01 a D-110) [V]. Estado por encabezado (conteo aproximado por script):

| Grupo | Estado |
|---|---|
| D-01 a D-04, D-11, D-23, D-25 a D-44, D-46 a D-74, D-76 a D-92 | Vigente (D-82 modificada, D-58 modificada, D-89 reemplazada por D-107; conflicto de lectura en D-89 [NV]) |
| D-05, D-06, D-08, D-10, D-12, D-14, D-15, D-16, D-18, D-20 a D-22, D-24, D-75 | Propuesta |
| D-07, D-09, D-13, D-17, D-19, D-45, D-48, D-67, D-69 | resueltas con anotación de P-xx o fecha [NV el estado exacto] |
| D-93 a D-106 | Vigente (ratificadas por Anderson; D-105 y D-106 el 2026-11-11) |
| D-107 a D-110 | Vigente por «ratifica» en el encabezado (prompt #55) [NV si Anderson las aprobó formalmente] |

Hallazgo: `backlog.md` dice «D-107 a D-110 siguen Propuesta» y los encabezados dicen otro estado; conciliar.

| Documento | Estado |
|---|---|
| `docs/` | AI_LOG, analisis-brechas, arquitectura-api-pasajero, arquitectura-mapa-recorrido, backlog, constitution, decisiones, diseno/, pagos, plan-entrega-final, progress, requisitos, seguridad [V] |
| `specs/` | 000-fundacion, 001-registro-conductor, 002-funcionalidad-final (spec y plan; la spec sigue «Borrador») [V] |
| AI_LOG | 55 entradas, 12 «RECONSTRUIDA»; por script aproximado: «Archivos y commit» pendiente en ~35, «Verificación» en 6 (#49 a #52, #54, #55), «Aprendizaje» vacío en 54 |
| README | 948 palabras; tiene instalación, variables, reglas, cómo correr, cobro, estructura, herramientas, IA, integrantes; faltan límites/omisiones, sesiones y lista de dispositivo; vigencia no releída [NV] |
| `omisiones-y-limites.md` | **no existe** [V] |
| `docs/enunciado-taller.pdf` | **no existe** [V]; cobertura abajo desde `requisitos.md` y la spec |
| `docs/arquitectura-sesiones.md` | no existe (T-74) |

## 8. Cobertura del enunciado (sin el PDF: según requisitos y spec; no contrastada con el enunciado original)

| Requisito | Estado | Evidencia |
|---|---|---|
| Registro de 3 pestañas con validaciones, fotos Cloudinary | hecho validado (parte previa); documentos nuevos sin validar | specs 001, T-81 a T-83 |
| Cuenta con estados, aprobación manual | hecho validado | `AppState`, `accountStatus` |
| Sesiones con correo y contraseña | hecho validado S4b; cierre de sesión sin validar | commits 2e08786, 5cbd7df |
| Disponibilidad y ubicación a `driverLocations` | hecho validado (versión previa); Inicio nuevo sin validar | `AvailabilityContext` |
| Solicitud con precio y método de pago | hecho validado (precio); método sin validar | `TripRequestScreen` |
| Estados del viaje y resumen | hecho validado (previo); modelo nuevo sin validar | `tripMachine`, `tripRecord` |
| Pasarela Mercado Pago | hecho sin validar | backend T-85 a T-89 |
| Efectivo | hecho sin validar | `confirmCashPayment` |
| Saldo | hecho sin validar | `computeBalance` |
| Historial con filtros, paginación de 20, gráfica, detalle con ruta | **faltante** (solo lista simple) | T-101 a T-110 |
| Ganancias con 6 métricas | **parcial** (totales por periodo; falta `useEarnings` y el ejemplo del enunciado) | `earnings.js` |
| Hooks obligatorios (`useEarnings`, `useMemo`, `useCallback`) | **parcial** (falta `useEarnings`) | `src/hooks/` |
| Perfil editable, idioma, FCM, Directions | omitido con justificación **pendiente** (el doc no existe) | T-111 |
| README | parcial | §7 |
| Bitácora y su PDF | parcial (entradas incompletas; PDF no existe) | AI_LOG |
| Video ≤5 min | faltante (manual) | — |

## 9. Calidad y riesgos

| Control | Resultado [V] |
|---|---|
| `check-constitution` | 12 errores: C01 ×1 (`.env` raíz, ignorado y sin trackear; solo la ruta) + C21 ×11 (RF-16, RF-17, RF-18, RNF-05, ENT-01, ENT-03 a ENT-08 sin tarea); 123 advertencias: 114 C23 (spec 002 sin fila en progress.md) y 9 C14 (literales de estado en backend y `earnings.js`) |
| Ignorado y sin trackear | `.env`, `backend/.env`, `firestore.rules` y el patrón `backend/secrets/` ignorados; ningún secreto en archivos trackeados |
| 5 símbolos anónimos | 0 coincidencias en `src`, `backend/src`, `App.js`, `index.js` |
| `SHOW_DEV_TOOLS` | `false` (`src/constants/devTools.js:7`) |
| Dependencias | las 25 de la app están en `dependencies.json`; backend: express y firebase-admin |
| Pruebas | no corridas en esta sesión [NV] |

Bugs y riesgos abiertos (todos [D] de sesiones anteriores, sin reproducir ahora):

| Severidad | Hallazgo |
|---|---|
| Alta | Reglas sin publicar bloquean viajes y cobros; pagos nunca probados contra Mercado Pago; 114 C23 por filas faltantes |
| Media | Desbordamiento de `TripActiveScreen` con fuente grande (corrección sin verifier distinto); un posible cargando infinito si `signOutLegacyAnonymous` devuelve false; filas restauradas de progress.md sin diff demostrado; estados del backlog desactualizados (T-78) |
| Baja | tokens huérfanos `driverRadius`/`driverStroke`; carpetas eslint residuales en node_modules; `AppStateProvider` importa `sessionGate`; auto sin rotación |

Datos de prueba por limpiar en Firestore (sin valores): `drivers` (cuentas de prueba), `driverLocations`, `drivers/*/trips`; además usuarios de Authentication de prueba. Cloudinary: fotos subidas de prueba [D].

## 10. Qué falta para la entrega (hasta jueves 2026-11-12 noche)

Horas estimadas por el agente (no medidas). Reglas de Anderson: no abrir rebanada tras las 08:00 del jueves; congelar a las 12:00 [D].

| # | Trabajo | Horas | Depende de Anderson |
|---|---|---|---|
| 1 | Revisar y commitear el bloque sin commitear por rebanadas | 0,5 | sí (commit) |
| 2 | Checkpoint A (Inicio, NaN, documentos) y S4c (8 pasos) | 1 | sí (celular) |
| 3 | F3: historial con filtros, `FlatList`, gráfica, `useEarnings`, detalle con ruta (T-101 a T-110) | 5 a 6 | revisión |
| 4 | Backend: `.env`, cuenta de servicio, túnel, publicar reglas, checkpoint B con tarjeta APRO | 1,5 | sí (cuentas y consola) |
| 5 | F5: `omisiones-y-limites.md` (T-111) | 0,5 | no |
| 6 | F6: T-73, T-74, verificación de S2, diff de progress.md, filas CA y C23, grep final | 2 | no |
| 7 | Entregables: bitácora completa y PDF, README final, video ≤5 min | 2 a 3 | sí |

**Qué recortar si falta tiempo:** auditorías T-75, T-76, T-112 a T-114; gráfica del historial (dejar filtros y lista); detalle con ruta (dejar el detalle sin mapa); rango de fechas libre.
**Orden recomendado:** 1 → 2 → 4 (reglas se publican una vez) → 3 (mínimo viable) → 5 → 6 → 7.

## 11. Reglas aplicadas

Sin secretos, claves, correos, ubicaciones ni datos personales. No se leyó `.env`, `backend/.env` ni `backend/secrets/`. No se modificó código, ni rama, ni se hicieron commits. El único archivo escrito es este informe.
