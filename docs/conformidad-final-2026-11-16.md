# Conformidad final con el enunciado, 2026-11-16 (E6, reescrito desde cero)

Verificador (distinto de quienes implementaron). Solo lectura del producto. Fuente: `docs/enunciado-taller.pdf` (texto extraído con `pdftotext`, secciones 1 a 9), contrastada con `src/`, `backend/src` (sin `.env`, sin `backend/secrets`, sin `google-services.json`), `docs/progress.md`, `docs/decisiones.md`, `docs/omisiones-y-limites.md` y `README.md`. No se ejecutó ninguna prueba de dispositivo; solo Android se ha probado.

Regla de estado: «Cumplido y validado en dispositivo» solo si `docs/progress.md` registra «Validada en dispositivo por Anderson» (STOP-4 a STOP-8b, filas finales, o declaraciones fechadas 2026-11-10). Lo que solo se comprobó en código o con pruebas queda «Cumplido, pendiente de dispositivo».

`node scripts/check-constitution.mjs`: 14 errores y 352 advertencias (línea base documentada: 14 errores). Los 14: C01 x3 (`.env`, `backend/.env`, `google-services.json` en el árbol de trabajo; `git ls-files` no los lista y `git check-ignore` confirma que `.env` y `google-services.json` están ignorados, o sea no versionados) y C21 x11 (RF-16, RF-17, RF-18, RNF-05, ENT-01, ENT-03 a ENT-08 «sin tarea»). Sin errores nuevos.

## Tabla de conformidad (numeración del enunciado)

| Requisito del enunciado | Estado | Evidencia | Decisión de Anderson |
|---|---|---|---|
| §2 Registro en 3 pestañas Tab y «Enviar» solo con las tres válidas | Cumplido, pendiente de dispositivo | `src/navigation/RegistrationTabs.js`; `src/screens/registration/PersonalDataScreen.js`, `VehicleScreen.js`, `DocumentsScreen.js`; `docs/progress.md` fila spec 001: «validación en dispositivo parcial» | Spec 001 aprobada (2026-11-01) |
| §2 Datos personales: nombre ≤50 solo letras, documento 6-10, celular 10, mayor de 18, género, correo | Cumplido, pendiente de dispositivo | `src/utils/validators.js:4` (`FULL_NAME_PATTERN` 1-50), validadores de documento, teléfono, edad y género (`isValidGender`); género en `PersonalDataScreen.js:136` | Spec 001 |
| §2 Idioma es/en en el registro | Cumplido y validado en dispositivo | `PersonalDataScreen.js:20` (`useLanguage`); STOP-7 (`docs/progress.md:381`: el registro conserva campos y progreso). No confirmado: sugerencia de idioma T-253/T-269 | L3b |
| §2 Vehículo: categoría, placa ABC123 en mayúsculas, marca/modelo ≤30, año, color, capacidad (XL mín. 6), foto con placa | Cumplido, pendiente de dispositivo | `src/utils/validators.js:2,49,72`; `src/constants/registrationOptions.js` | Spec 001 |
| §2 Documentos: licencia, SOAT, revisión técnico-mecánica según año, correo de Mercado Pago, términos con % de comisión | Cumplido, pendiente de dispositivo | `src/utils/documentValidators.js`; `src/screens/registration/DocumentsScreen.js`; `src/config/pricing.js` (comisión 20 %) | Spec 001 |
| §2 Fotos por cámara o galería (Cloudinary) | Cumplido, pendiente de dispositivo | `src/components/registration/PhotoField.js:24`, `src/services/cloudinary.js`; preset sin firma (límite declarado en `README.md`, Seguridad) | Cloudinary sugerido por el enunciado §7 |
| §2 Sin datos bancarios o de tarjeta en la app ni en AsyncStorage | Cumplido, pendiente de dispositivo | Solo el correo de cobro; pago por Checkout de la pasarela (`backend/src/stripe.js`, `mercadopago.js`) | RNF de seguridad |
| §2 Cuenta «Pendiente de aprobación»: no puede ponerse Disponible hasta Aprobado | Cumplido y validado en dispositivo | `docs/progress.md:22-24` (rebanadas 0/A/B, declaración 2026-11-10); `src/context/AvailabilityContext.js` | Rebanadas A y B |
| §3 Inicio: mapa con ubicación e interruptor Disponible/No disponible | Cumplido y validado en dispositivo | `docs/progress.md:22-24`; MapLibre + OpenFreeMap en lugar de react-native-maps (D-82) | D-82 |
| §3 Ubicación cada pocos segundos mientras Disponible; limpieza al salir | Cumplido y validado en dispositivo (primer plano) | `src/hooks/useDriverLocation.js:93-95` (cleanup con `appStateSubscription.remove()`); `src/config/location.js`; T-41/T-43/T-45 validadas 2026-11-10; sin segundo plano (D-130) | Checkpoints 1 y 2 |
| §3 Solicitud entrante con todos los datos y temporizador de 15 s con rechazo automático | Cumplido y validado en dispositivo | `src/components/IncomingRequestCard.js`, `src/screens/trip/TripRequestScreen.js`, `src/hooks/useTripRequests.js:38,67` (cleanups); `docs/progress.md:360` (STOP-4) y `:364` (STOP-5: rechazo y vencimiento salen como «Rechazado») | D-137 (15 s) |
| §3 Viaje en curso: ruta a recogida; «Pasajero a bordo» cambia la ruta; finalizar | Cumplido y validado en dispositivo | `src/screens/trip/TripActiveScreen.js`; STOP-5 `docs/progress.md:364` (flujo completo OK). Pendiente: «Salir del viaje» a mitad y viajes antiguos | D-59 |
| §3 Cobro y resumen: tarifa final, comisión, neto, estado del pago | Cumplido y validado en dispositivo | `src/screens/trip/TripSummaryScreen.js:72`; STOP-5 (Detalle: «Pago aprobado», «Tarjeta (Stripe)», comisión) | STOP-5 |
| §3 Estados requested, accepted, driver_arriving, in_progress, completed, paid, cancelled | Parcial | Todos definidos en `src/constants/tripStatus.js:6-24` (más `rejected` y `driver_arrived`). `requested` nunca se escribe en Firestore (`tripStatus.js:7-9`). Se guardan completed, cancelled y rejected (`tripRecord.js:21,107`); `paid` lo escribe el backend (`backend/src/firestore.js:66`) o la confirmación de efectivo. Rechazo o vencimiento: queda `rejected`, sin pasar «al siguiente conductor» | D-124 (pasajero simulado); `docs/omisiones-y-limites.md` |
| §3 Hooks: useState, useEffect con cleanup, Context, useMemo/useCallback, `useDriverLocation`, `useTripRequests`, `useEarnings` | Cumplido, pendiente de dispositivo | `src/hooks/useDriverLocation.js`, `useTripRequests.js`, `useEarnings.js`; `src/context/TripContext.js`, `AppStateContext.js` (Context, no Redux). Verificación estática | RNF |
| §3 AsyncStorage solo para preferencias y sesión | Cumplido, pendiente de dispositivo | `src/i18n/languagePreference.js`, `src/services/notifications/preference.js`, `src/services/firebase.js` | D-16 |
| §3 Perfil y configuración: datos editables, vehículo, documentos, idioma, cerrar sesión | Cumplido y validado en dispositivo (idioma y cierre de sesión) | STOP-6 (`progress.md:196`); `src/hooks/useProfileEdit.js`. Edición de perfil sin captura propia | L3 |
| §1.8 Navegación: Stack (viaje), Tabs (registro), Drawer | Cumplido y validado en dispositivo | `src/navigation/RegistrationTabs.js`, `MainDrawer.js:20`, `TripStack.js`; D-148; STOP-4 (toque de notificación desde Configuración, Historial y Perfil) | D-148, D-149 |
| §4 Pasarela de prueba: backend crea sesión o preferencia con la llave secreta, la app abre el checkout, el backend actualiza paymentStatus, paymentId y status paid, el conductor lo ve en tiempo real | Parcial: Stripe validado, Mercado Pago no | Stripe: STOP-5 `docs/progress.md:364`; `backend/src/stripe.js`, `backend/src/firestore.js:23-66`, `backend/src/routes/payments.js:75`. Mercado Pago: `backend/src/mercadopago.js`; `README.md` declara «implementado, no verificado con usuarios de prueba». El enunciado recomienda MP y acepta Stripe en modo de prueba | Sin cuentas de prueba de MP |
| §4 Secretos solo en backend `.env` excluido de Git; `.env.example` sin valores | Cumplido, pendiente de dispositivo | `git ls-files` no lista `.env`, `backend/.env` ni `google-services.json`; existen `.env.example` y `backend/.env.example` (contenido no leído) | «Secretos solo en `backend/.env`» |
| §4 Efectivo: el conductor marca el cobro; la comisión se descuenta del saldo | Cumplido y validado en dispositivo | `src/utils/earnings.js:5,37,77`; `src/hooks/useBalance.js`; `TripSummaryScreen.js:52` (`confirmCashPayment`). STOP-5: «Saldo y Ganancias coherentes». Sin confirmar: saldo con más de 200 viajes | STOP-5 |
| §5 `calculateFare({distanceKm, durationMin, category, tip})` pura, parámetros en `src/config/pricing.js`, enteros, redondeo a 100 | Cumplido y validado en dispositivo (lado conductor) | `src/utils/fare.js:35`; `src/config/pricing.js` (clave `economico`, `:18`); T-39. «Usada en la estimación del pasajero»: no hay app de pasajero en este repositorio | STOP-5 |
| §5 `distanceKm` y `durationMin` de Google Distance Matrix | Omitido con razón | Reemplazado por OSRM: `src/services/routing/routeMetrics.js`, `osrmRouting.js`; `docs/omisiones-y-limites.md:38`. Ver hueco 1 | D-82 |
| §5 Cada viaje guarda `commissionRate` | Cumplido y validado en dispositivo | `src/services/trip/tripRecord.js:35,109`; STOP-5 (documento en la consola) | STOP-5 |
| §5 Ganancias hoy/semana/mes con useMemo | Cumplido y validado en dispositivo | `src/hooks/useEarnings.js`, `src/screens/main/EarningsScreen.js`, `src/utils/earnings.js`; T-47/T-49 (2026-11-11); STOP-4 y STOP-5 | Prompt #51 |
| §5 Saldo: pagados por pasarela menos comisiones de efectivo | Cumplido y validado en dispositivo | `src/utils/earnings.js:77`, `src/hooks/useBalance.js`; STOP-5 | STOP-5 |
| §6 Historial: FlatList, reciente primero, filtros Hoy/Semana/Mes/Rango y método, vacío, página de 20 | Cumplido, pendiente de dispositivo | `src/screens/main/HistoryScreen.js:8,28,35,48`, `src/services/tripRepository.js:47,64` (limit, startAfter, orderBy finishedAt desc). STOP-4/5 validan coherencia y «Rechazado»; filtro Rango y filtro por método sin evidencia propia; Historial al 200 % sin captura | D-86..D-89 |
| §6 Detalle: ruta, duración, distancia, comisión, propina, calificación | Cumplido y validado en dispositivo (ruta, comisión); propina y calificación simuladas | STOP-6 `docs/progress.md:372` (ruta completa); `src/services/trip/tripDetailView.js:7,83` | D-124 |
| §6 Modelo `trips` con campos del enunciado | Parcial | Campos presentes (`tripRecord.js:30-55`); colección `drivers/{uid}/trips` (`tripRepository.js:47`) y no `trips`; sin `passengerId` real; categoría `economico`; `finishedAt` además de `completedAt` | Sin D-NNN citado |
| §7 FCM (obligatorio) con app abierta o en segundo plano | Cumplido y validado en dispositivo (Android) | STOP-3/STOP-4 `docs/progress.md:354,360`; STOP-8 (`:382`, 15-30 s en primer y segundo plano) | D-126, D-149 |
| §7 FCM con la app cerrada | Cumplido, pendiente de dispositivo (solo release) | Release validado por Anderson en STOP-2c (`docs/progress.md:353`). Dev client: `getInitialNotification` = null. Con solicitudes automáticas y app cerrada: pendiente, solo release (`:383`) | D-145, D-146 |
| §7 Firestore en tiempo real (obligatorio) | Cumplido y validado en dispositivo | `docs/progress.md:22-24`; STOP-5 (documento en consola) | D-60 |
| §7 Geolocalización (obligatorio) | Cumplido y validado en dispositivo (primer plano) | `src/hooks/useDriverLocation.js`; `expo-location` (D-82); sin segundo plano (D-130) | Rebanada B |
| §7 Opcionales: react-native-maps, Cloudinary, Nominatim, OSRM | Cumplido, con sustitución | MapLibre + OpenFreeMap en vez de react-native-maps; Nominatim `src/config/geocoding.js`; Cloudinary; OSRM | D-82, D-125 |
| §7 Distance Matrix solo al crear y aceptar | No aplica por la sustitución | Distancia y duración por OSRM al abrir la solicitud (STOP-4) | D-82 |
| §8 Bitácora `AI_LOG.md`, sección «Uso de IA», PDF | Parcial | `AI_LOG.md` existe; marcas AI-assisted en el código (`tripStatus.js:1-2`); `docs/auditoria-bitacora-2026-11-16.md`. PDF y entradas Verificación/Aprendizaje de Anderson: manual | AGENTS.md |
| §9 README con instalación, `.env.example`, Uso de IA | Cumplido, pendiente de dispositivo | `README.md`; clon limpio no ejecutado | P6 |
| §9 Video de máximo 5 min; ramas y PR con merge en main | Parcial | `docs/guion-video.md` listo; video, PR y merge manuales (rama actual `anderson/fcm-notificaciones`) | Manual |
| Extra: solicitudes automáticas (spec 007) | Cumplido y validado en dispositivo | STOP-8 (`progress.md:382`) y STOP-8b (`:383`, D-198) | D-198 |
| iOS | Omitido con razón | `README.md` (APNs y cuenta de pago; sin equipo Apple); `omisiones-y-limites.md` | Anderson |
| Pagos divididos (bonificación) | Omitido con razón | `docs/omisiones-y-limites.md` | Anderson |

No se totaliza por estado (el informe anterior tenía un recuento erróneo). Filas «Parcial»: estados del viaje, pasarela, modelo `trips`, bitácora y video/ramas.

## Pendientes de dispositivo (según `docs/progress.md:383`)

1. «Salir del viaje» a mitad del viaje.
2. Viajes antiguos (sin los campos aditivos).
3. App cerrada con solicitudes automáticas (solo en build release).
4. Estado visual del Historial al 200 % si no hay captura.
5. Además: registro completo (parcial), filtro Rango y filtro por método del Historial, TalkBack/VoiceOver, aviso con almacenamiento que falla (CA-006-17).

## Huecos reales

1. **Google Directions y Distance Matrix no se usan; se usa OSRM.** Mayor. El enunciado los nombra en la funcionalidad 4 de §1 (navegación con Google Directions API), en §5 (distancia y duración de Distance Matrix) y en la tabla de §7. El OSRM público no garantiza disponibilidad. Evidencia: `src/services/routing/osrmRouting.js`, `routeMetrics.js`; `docs/omisiones-y-limites.md:38`; D-82. Reproducción: revisar `src/config/routing.js` (sin clave de Google para rutas).
2. **react-native-maps sustituido por MapLibre/OpenFreeMap** (D-82). Menor.
3. **Mercado Pago implementado y no verificado.** Mayor: es la pasarela recomendada; solo Stripe se probó de punta a punta (STOP-5). Evidencia: `backend/src/mercadopago.js`, `README.md` (sección Cobro).
4. **Push con la app cerrada solo validado en build release.** En el development build el toque en frío no entrega la solicitud. Evidencia: `docs/progress.md:353`; con solicitudes automáticas y app cerrada, sin validar.
5. **Idioma de la notificación push solo en español.** Menor. Título y cuerpo los arma el backend sin recibir el idioma (`backend/src/notifications/payload.js`; `docs/omisiones-y-limites.md:133`, límite RI-24 a). Reproducción: app en inglés, segundo plano, pedir solicitud de prueba.
6. **Pasajero simulado.** Mayor para el flujo completo: la solicitud sale de un endpoint de prueba; `requested` no se persiste (`src/constants/tripStatus.js:7-9`), no hay siguiente conductor ni `passengerId` real; la estimación del pasajero con calculateFare no es comprobable aquí.
7. **Propina y calificación generadas por la app** (D-124).
8. **Solo Android**; sin ubicación ni disponibilidad en segundo plano (D-130).
9. **Desviaciones de modelo:** colección `drivers/{uid}/trips` en vez de `trips`; `economico` en vez de `economy`; `finishedAt` además de `completedAt`.
10. **Nominatim y Cloudinary:** las coordenadas de prueba salen a un tercero; preset de Cloudinary sin firma (límite declarado).
11. **Entregables manuales:** PDF de la bitácora, video, ramas por integrante y PR.
12. **Prueba de clon limpio** no ejecutada por este verificador.

## Texto breve para el profesor

La app del conductor cubre el registro en tres pestañas con validaciones, el interruptor Disponible con ubicación en tiempo real, las solicitudes con cuenta de 15 segundos, el viaje por estados, el cobro con Stripe en modo de prueba y en efectivo, el historial paginado con filtros, las ganancias y el saldo, el idioma español/inglés y las notificaciones FCM. Todo esto se probó en un celular Android.

Declaramos estos límites. Usamos OSRM y MapLibre en lugar de Google Directions, Distance Matrix y react-native-maps, para no depender de claves y facturación de Google (decisión D-82). Mercado Pago está implementado pero no pudimos verificarlo porque no logramos crear cuentas de prueba; Stripe sí está probado de punta a punta. El pasajero es simulado: las solicitudes salen de un endpoint de prueba, así que la propina, la calificación y el estado requested no vienen de un pasajero real y no hay siguiente conductor. La notificación con la app cerrada solo funciona en el build release (el development build no entrega ese toque) y su texto sale siempre en español. No probamos iOS por falta de equipo Apple y de cuenta de pago. El PDF de la bitácora y el video los entrega el equipo a mano.

## Discrepancias entre documentos y código

1. La versión anterior de este informe listaba los estados del viaje como arrived y rejected y omitía driver_arriving, paid y cancelled; el enunciado pide requested, accepted, driver_arriving, in_progress, completed, paid, cancelled (rejected es adición del proyecto). Corregido aquí.
2. La versión anterior trataba Directions y Distance Matrix como opcionales; el enunciado los exige en §1 (punto 4) y §5. Corregido: la sustitución es una desviación real.
3. `docs/omisiones-y-limites.md:20` y `:75` dicen «FCM Android validado en release», mientras `:87` y `progress.md:353-360` precisan que release solo validó la app cerrada y lo demás se validó en el dev client. Redacción ambigua.
4. `docs/omisiones-y-limites.md` (contexto headless, D-145) sigue diciendo «El arranque en frío sigue sin verificar en dispositivo», lo que contradice STOP-2c en release (`progress.md:353`).
5. `docs/progress.md:3` y `:11` (requisitos, decisiones y constitución «pendiente de Anderson») están desactualizados.
6. `node scripts/check-constitution.mjs` sigue en 14 errores: C01 son archivos locales ignorados; C21 son requisitos sin tarea. Anderson debe decidir si se cierran o se aceptan.
7. Las cifras de pruebas (410, 409 pasan) son las de `progress.md:383`; no se reejecutaron aquí.
