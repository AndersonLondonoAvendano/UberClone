# Conformidad final con el enunciado, 2026-11-16

Verificador de conformidad final (distinto de quienes implementaron). Solo lectura del producto. Fuente: enunciado del taller (`docs/enunciado-taller.pdf`, texto extraído), contrastado con `src/`, `backend/` (sin `.env`), `scripts/tests`, `docs/decisiones.md`, `docs/omisiones-y-limites.md`, `docs/progress.md`, `README.md` y `docs/pagos-evidencia.md`.

Regla de estado: «Cumplido y validado en dispositivo» solo si `docs/progress.md` registra evidencia de Anderson (STOP-N o declaración fechada). Lo demás es pendiente. Solo Android se ha probado en dispositivo.

## Tabla de conformidad

| Requisito del enunciado | Estado | Evidencia | Decisión de Anderson |
|---|---|---|---|
| §1 Registro en 3 pestañas (datos personales, vehículo, documentos) | Cumplido, pendiente de dispositivo | `src/navigation/RegistrationTabs.js:15,78-80`; `docs/progress.md:20` (registro «validación en dispositivo parcial»); `docs/progress.md:50` (CA-000-10 por declaración, cambio de pestañas) | Aprobada spec 001 (Anderson, 2026-11-01) |
| §1 Validaciones: nombre, documento 6-10 dígitos, teléfono 10 dígitos, mayor de 18 | Cumplido, pendiente de dispositivo | `src/utils/validators.js:14,18,22,26`; pruebas en `scripts/tests` | Spec 001 |
| §1 Placa con formato `AAA123`, marca/modelo, año, capacidad | Cumplido, pendiente de dispositivo | `src/utils/validators.js:8,54,58,62,66,75` | Spec 001 |
| §1 Fotos por cámara o galería | Cumplido, pendiente de dispositivo | `src/components/registration/PhotoField.js:16-17,61-62` | Spec 001 |
| §1 Documentos, revisión técnica según antigüedad | Cumplido, pendiente de dispositivo | `src/utils/documentValidators.js:9,74-79` | Spec 001 |
| §1 Términos con porcentaje de comisión y correo de cobro; sin datos de tarjeta ni bancarios | Cumplido, pendiente de dispositivo | `src/screens/registration/DocumentsScreen.js:29-68`; `src/config/pricing.js` (COMMISSION_RATE 0.2) | RF-01..RF-07 |
| §2 Cuenta pendiente no puede ponerse «Disponible»; estado de cuenta en tiempo real | Cumplido y validado en dispositivo | `docs/progress.md:22-24` (rebanadas 0/A/B, 2026-11-10); CA-001-24 base estática `docs/progress.md:77` | Declaración 2026-11-10 |
| §3 Mapa con ubicación y disponibilidad | Cumplido y validado en dispositivo | `docs/progress.md:22-24`; MapLibre con OpenFreeMap (D-82) | D-82 |
| §3 Publicación de ubicación con limpieza del efecto | Cumplido y validado en dispositivo | `src/hooks/useDriverLocation.js:95` (remove de la suscripción), `src/config/location.js:8` (10 m); `docs/progress.md:22-24` | Rebanada B |
| §3 Solicitud entrante con tarjeta y cuenta de 15 s, aceptar/rechazar | Cumplido y validado en dispositivo | `src/components/IncomingRequestCard.js`, `src/screens/trip/TripRequestScreen.js`, `src/hooks/useTripRequests.js:9,77,89`; `docs/progress.md` T-43/T-54 (declaración 2026-11-10); STOP-5 `docs/progress.md:364` | D-59 |
| §3 Estados del viaje: `requested`, `accepted`, `arrived`, `in_progress`, `completed`, `rejected` | Parcial | `rejected` se guarda (`declineRequest.js:63-72`, `tripRecord.js:99-120`, `docs/progress.md:362`); `requested` no se persiste y el pasajero es simulado | Ver huecos 5 y 6 |
| §4 Tarifa: base + km + minutos, mínima, categorías, comisión 20 %, propina | Cumplido y validado en dispositivo | `src/utils/fare.js:35,44-46,60`; `src/config/pricing.js`; cobro validado en STOP-5 (`docs/progress.md:364`) | Constantes de pricing |
| §4 Pago con tarjeta por pasarela de prueba | Parcial | Stripe validado (STOP-5, 2026-11-16 14:54; `docs/pagos-evidencia.md`); Mercado Pago implementado y nunca verificado (`README.md:158`) | Sin cuentas de prueba de MP |
| §4 Pago en efectivo | Cumplido y validado en dispositivo | `docs/pagos-evidencia.md` (efectivo sin fecha propia, cubierto por STOP-5 de coherencia); `src/screens/trip/TripSummaryScreen.js:192` | STOP-5 |
| §4 Backend con secretos fuera de la app | Cumplido, pendiente de dispositivo | Rutas `GET /health`, `POST /payments/checkout`, `/payments/sync`, `GET /payments/providers`, `/payments/return`, `/webhooks/...` (`README.md:58`); `.env.example` solo con nombres (`README.md:40-51`) | «Secretos solo en `backend/.env`» |
| §5 Historial paginado, FlatList, filtro por período y Rango, estado vacío | Cumplido, pendiente de dispositivo | `src/screens/main/HistoryScreen.js:13,41-68,106`; `src/services/tripRepository.js:15,93` (página de 20). Coherencia con Ganancias en STOP-5; filtro Rango y detalle sin evidencia propia | D-86..D-89 |
| §5 Detalle de viaje con ruta, propina y calificación | Cumplido y validado en dispositivo (ruta); propina/calificación simuladas | Detalle con ruta completa validado en STOP-6 (`docs/progress.md:372`); propina y calificación simuladas, ver huecos | STOP-6 |
| §5 Ganancias: viajes, total, comisión, propinas, neto, promedio | Cumplido y validado en dispositivo | `src/screens/main/EarningsScreen.js:5,99-101`; `src/hooks/useEarnings.js:5,10`; T-47/T-49 validadas 2026-11-11 (`docs/progress.md:306`); STOP-5 | Prompt #51 |
| §6 Navegación: Tabs (registro), Drawer, Stack | Cumplido y validado en dispositivo | `src/navigation/RegistrationTabs.js:15`, `MainDrawer.js:20,32-36`, `TripStack.js:6`; `docs/progress.md:50,64` | CA-000-10/13/14 |
| §6 Ruta del viaje en el mapa | Parcial | OSRM público, ruta simplificada (`src/services/routing/osrmRouting.js`, `routeMetrics.js`) | Ver hueco 1 |
| §6 Rendimiento: `useMemo`/`useCallback`, listas sin re-render | Cumplido, pendiente de dispositivo | `src/hooks/useEarnings.js:5,10`; `HistoryScreen.js:41-55`; `IncomingRequestCard.js` | RNF |
| §6 AsyncStorage solo para preferencias/sesión | Cumplido, pendiente de dispositivo | `src/i18n/languagePreference.js`, `src/services/firebase.js`, `src/services/notifications/preference.js` | D-16 |
| §7 FCM (obligatorio) | Cumplido y validado en dispositivo (Android) | Toque desde otra pantalla (A1, D-149): STOP-4 `docs/progress.md:360`. Toque en frío con app cerrada: solo en build release, STOP-2c `docs/progress.md:353`. En el dev client `getInitialNotification` es `null` (`docs/omisiones-y-limites.md:87`) | D-145, D-146, D-149 |
| §7 Firestore en tiempo real (obligatorio) | Cumplido y validado en dispositivo | `src/services/...listenToDriverAccount` (`docs/progress.md:77`); rebanadas 0/A/B | D-60 |
| §7 Geolocalización (obligatorio) | Cumplido y validado en dispositivo (primer plano) | `src/hooks/useDriverLocation.js`; sin ubicación en segundo plano (`docs/omisiones-y-limites.md:74`) | Rebanada B |
| §7 Google Directions y Distance Matrix, react-native-maps (opcional «solo al crear y aceptar») | Omitido con razón | Se usó OSRM y MapLibre en su lugar; `docs/omisiones-y-limites.md:20` | D-82 |
| §7 Idioma es/en con selector | Cumplido y validado en dispositivo | STOP-6 `docs/progress.md:372`; STOP-7 (selector sin sesión) `docs/progress.md:277`: reportado OK por Anderson, salvo ajuste visual del selector en inicio de sesión (ya reducido); verificación visual pendiente | L3, L3b |
| §7 Pagos divididos / extras opcionales | Omitido con razón | `docs/omisiones-y-limites.md` (Omisiones 1-5) | Anderson |
| §7 iOS | Omitido con razón | `README.md:101` (FCM en iOS exige APNs y cuenta de pago; sin equipo Apple) | Anderson |
| §8 README con instalación, `.env.example`, «Uso de IA» | Cumplido, pendiente de dispositivo | `README.md:40-51,158-159` (prueba de clon limpio no ejecutada por este verificador) | P6 |
| §8 Bitácora de IA exportada a PDF | Parcial | `docs/AI_LOG.md` existe; el PDF es paso manual de Anderson (`AGENTS.md`, P6) | Manual |
| §9 Video de demostración y ramas/PR | Parcial | `docs/guion-video.md` listo; el video, ramas y PR son pasos manuales | Manual |
| Accesibilidad (TalkBack, fuente 200 %) | Cumplido, pendiente de dispositivo | Fuente al 200 % validada en STOP-6 (`docs/progress.md:372`); TalkBack «No verificado en dispositivo» (`docs/progress.md:64`) | CA-000-13/14 |

## Conteo por estado

| Estado | Filas |
|---|---|
| Cumplido y validado en dispositivo | 13 |
| Cumplido, pendiente de dispositivo | 12 |
| Parcial | 5 |
| Omitido con razón | 3 |
| **Total de filas de la tabla** | **33** |

Recuento hecho por el agente principal sobre la tabla (el verificador original declaró 36 filas y cifras que sumaban 32; ese conteo era erróneo).

## 1. Huecos reales

1. **Google Directions y Distance Matrix reemplazados por OSRM.** Evidencia: `src/services/routing/osrmRouting.js`, `routeMetrics.js`; `docs/omisiones-y-limites.md:20`. La ruta es del servidor público de OSRM, sin garantías de disponibilidad.
2. **react-native-maps reemplazado por MapLibre con OpenFreeMap** (D-82). Evidencia: `docs/decisiones.md` D-82.
3. **Mercado Pago nunca verificado.** Evidencia: `README.md:158`; `docs/pagos-evidencia.md`. Solo Stripe está validado de punta a punta; no hay capturas de pagos en el repositorio.
4. **Push con la app cerrada validado solo en build release.** En el dev client el toque en frío no entrega la solicitud (`getInitialNotification` es `null`). Evidencia: `docs/progress.md:353`; `docs/omisiones-y-limites.md:85-87`.
5. **`requested` no se persiste en Firestore y el pasajero es simulado.** La solicitud la dispara un endpoint de prueba, no un pasajero real; tampoco hay «siguiente conductor» tras un rechazo. Evidencia: `README.md:159`; `docs/omisiones-y-limites.md`.
6. **Propina y calificación simuladas.** Evidencia: `docs/omisiones-y-limites.md`; `src/utils/fare.js:46` (propina entra al neto del conductor).
7. **Solo Android.** Sin iOS, sin ubicación en segundo plano. Evidencia: `README.md:101`; `docs/omisiones-y-limites.md:74`.
8. **Colección `drivers/{uid}/trips` en lugar de `trips`, y clave `economico` en lugar de `economy`.** Evidencia: `src/services/tripRepository.js`; `src/config/pricing.js`. Desviaciones de nombre respecto al enunciado.
9. **Texto de la notificación solo en español** (lo arma el backend). Evidencia: `docs/omisiones-y-limites.md:133`.
10. **Webhook de pagos opcional y saldo acotado a 5000 viajes.** Evidencia: `README.md:58`; `docs/progress.md:363` (D-181..D-186).
11. **Pendientes de dispositivo:** registro completo (`docs/progress.md:20`), TalkBack, filtro Rango, ajuste visual del selector de idioma en inicio de sesión (`docs/progress.md:277`).
12. **Entregables manuales sin hacer:** PDF de la bitácora, video, ramas y PR (`docs/guion-video.md`, P6 de `AGENTS.md`).
13. **Prueba de clon limpio no verificada** por este verificador.

## 2. Texto breve para presentarlos al profesor

La app del conductor cubre registro en tres pestañas, mapa con disponibilidad y ubicación, solicitudes con cuenta de 15 s, flujo del viaje, cobro con Stripe y efectivo, historial paginado, ganancias, idioma es/en y notificaciones FCM. Todo se probó en un celular Android; iOS quedó fuera por falta de equipo Apple y de cuenta de pago.
En lugar de Google Directions, Distance Matrix y react-native-maps usamos OSRM y MapLibre con OpenFreeMap, por una decisión técnica documentada (D-82).
Mercado Pago está implementado pero no se pudo verificar por falta de cuentas de prueba; Stripe sí está validado de punta a punta.
El pasajero es simulado: la solicitud la dispara un endpoint de prueba, así que el estado `requested` no se guarda y no hay «siguiente conductor».
La notificación con la app cerrada se validó solo en un build release; en el development build el sistema no entrega el toque.
El registro y algunas pantallas tienen validación estática completa pero prueba en celular parcial. El PDF de la bitácora y el video los entrega Anderson a mano.

## 3. Inconsistencias documentales detectadas

Corregidas por el agente principal tras el informe (sin segunda verificación independiente): 1 (solo D-149; D-150 y D-151 siguen «No verificado en dispositivo» porque STOP-4 cubre el toque, no el contador ni las observaciones O-03/09/10/11), 3, 4, 5, 6, 8 y la parte de `progress.md:3` del punto 7. Sin corregir: el punto 2 (T-174 en `VehicleScreen.js:83`, comentario de código que no se tocó) y `progress.md:11` (Fase 0, decide Anderson).

1. `docs/decisiones.md:833-835` (D-149) y las decisiones siguientes (`:839`, `:844`) dicen «No verificado en dispositivo», pero STOP-4 validó A1 (`docs/progress.md:354,360`).
2. `src/screens/registration/VehicleScreen.js:83` cita «T-174» para la placa sin autocorrección, pero T-174 en `docs/backlog.md:2679` es «S2: rutas POST /notifications/register y /unregister» (FCM).
3. `docs/omisiones-y-limites.md:4-6` apunta a un PDF con otro nombre (`docs/UberClone — Versión Conductor.pdf`; el archivo es `docs/enunciado-taller.pdf`) y se declara «borrador».
4. `docs/omisiones-y-limites.md:15` (fila 2) y `:48` (fila «Dispositivo») dicen que los puntos de control A, B y C no tienen evidencia, contradiciendo `docs/progress.md:22-24,306,343-372`.
5. `docs/omisiones-y-limites.md:87` («Límite del dev client… inconcluso») frente a lo confirmado por Anderson en STOP-2c (`docs/progress.md:353`) y STOP-4 (`:360`); revisar que no queden frases de «resultado inconcluso».
6. `docs/omisiones-y-limites.md`: la fila «Backend por HTTP sin probar» sigue vigente aunque STOP-5 probó Stripe por HTTP (`docs/progress.md:364`).
7. `docs/progress.md:3` («Fase actual: 3») y `:11` («Requisitos, decisiones y constitución aprobados ⏳ pendiente de Anderson») no reflejan el estado actual (entrega y verificación final).
8. `docs/omisiones-y-limites.md:20` (fila 7) mantiene «No verificado en dispositivo» para FCM, mientras la fila 1 (`:28`) y el README (`README.md:159`) lo dan por validado en Android.
