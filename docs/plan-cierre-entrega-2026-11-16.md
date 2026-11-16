# Plan de cierre de entrega — análisis total contra el taller (2026-11-16)

Fuente: `docs/enunciado-taller.pdf`, 145 requisitos atómicos R-001..R-145 numerados por el análisis (Sec. 1 = F1–F8 y Sec. 2–9 en el orden del PDF). Se re-verificó el código; no se confió en `docs/auditoria-enunciado-2026-11-12.md`. Solo lectura: no se tocó código, `.env`, `backend/.env` ni `backend/secrets/*`.

Niveles de evidencia: **D** = validado en dispositivo por Anderson según `docs/progress.md`; **T** = lectura de código o tests; **N** = ninguna.

## 1. Resumen ejecutivo

- Estado de los 145 requisitos: **96 Cumplido (66 %)**, 35 Parcial, 5 Desviación documentada, 1 Omitido documentado, 8 No cumplido.
- Por evidencia: solo **15 con D (10 %)**, 123 con T (85 %), 7 con N. Casi todo lo "cumplido" está sin probar en el celular.
- Fuerte: tarifa y ganancias (ejemplo del enunciado reproducido: 19.200/3.840/15.360 y 26.900/5.380/21.520), historial, validaciones de registro, Cloudinary, Nominatim, OSRM y seguridad del backend.
- Top 5 brechas: (1) regla de Firestore de `trips` posiblemente sin publicar, bloquea guardar con propina/calificación; (2) FCM ausente (R-113); (3) distancia y duración inventadas, sin Distance Matrix/Directions (R-090, R-121); (4) idioma es/en sin efecto y sin preferencias en AsyncStorage (R-022, R-065); (5) proceso: sin PDF de bitácora, sin video, bitácora incompleta.
- Otras: temporizador 30 s en vez de 15 s; faltan estados `requested`/`rejected`; pago con tarjeta y Mercado Pago sin validar en celular.
- Recomendación: lotes L1–L4 (desbloqueo, estados/modelo, idioma, pagos) más L7 (proceso); FCM Android solo si sobra tiempo, si no, documentarlo como omisión; no migrar el mapa ni hacer split payments.
- Calidad automática: `check-constitution` 15 errores (2 falsos positivos C01, 2 reales C18, 11 C21 = PDF y video faltantes) y 189 avisos; tests 40, 37 pasan con la invocación por defecto y los 3 restantes pasan 10/10 con el loader.

## 2. Matriz de requisitos

Estados: Cumplido / Parcial / Omitido documentado / No cumplido / Desviación documentada. Las rutas de `src/` se abrevian por nombre de archivo; las de backend llevan `backend/src/`.

| R | Estado | Ev. | Archivo:línea | Nota |
|---|---|---|---|---|
| R-001 | Cumplido | D/T | RegistrationTabs.js:79-81; progress.md (CA-001-02..05) | Datos personales validados en celular; vehículo y documentos solo por lectura/tests |
| R-002 | Cumplido | D | locationPolicy.js:6-10; driverLocationPublisher.js:18 | T-38..T-45 en progress.md:23-24 |
| R-003 | Parcial | T | TripRequestScreen.js:113,175-191 | Aceptar/rechazar con límite, pero 30 s (no 15 s) y solicitud simulada (mockPassengerApi.js:110) |
| R-004 | Parcial | D | osrmRouting.js:10-12 | Navegación con OSRM (permitido por R-119), sin Google Directions |
| R-005 | Parcial | T | backend/src/stripe.js:162-172; backend/src/mercadopago.js | Stripe test y efectivo implementados; sin pago con tarjeta validado en celular; MP sin verificar (CA-002-126) |
| R-006 | Cumplido | T | src/utils/fare.js:35-48; src/config/pricing.js:1-21 | Ejecutado: ver R-085 |
| R-007 | Parcial | T | HistoryScreen.js; useEarnings.js:109-111 | Implementado; en celular solo T-46..T-49 (progress.md:265); filtros y 6 métricas pendientes (progress.md:276,287,298) |
| R-008 | Cumplido | T | MainDrawer.js:35; RootNavigator.js:21; RegistrationTabs.js:27 | Stack + Tabs + Drawer presentes |
| R-009 | Cumplido | T | RegistrationTabs.js:79-81 | Tres pestañas |
| R-010 | Cumplido | T | RegistrationTabs.js | Botón habilitado solo con tres secciones válidas (lectura) |
| R-011 | Cumplido | T | validators.js; documentValidators.js | Sin campos vacíos |
| R-012 | Cumplido | T | PersonalDataScreen.js; VehicleScreen.js | Errores bajo cada campo |
| R-013 | Cumplido | T | sessionGate.js:38-52 | Cuenta queda pendiente |
| R-014 | Cumplido | T | sessionGate.js:38-52 | Aprobación manual en consola Firebase |
| R-015 | Parcial | T | PersonalDataScreen.js (PhotoField) | Obligatoria, pero solo se valida URL no vacía (no origen cámara/galería) |
| R-016 | Cumplido | D | validators.js | progress.md CA-001-02..05 |
| R-017 | Cumplido | D | validators.js | ídem |
| R-018 | Cumplido | D | validators.js | ídem |
| R-019 | Cumplido | D | validators.js; PersonalDataScreen.js | Mayor de 18 validado; los selectores no usan minimumDate |
| R-020 | Cumplido | T | PersonalDataScreen.js | Lista desplegable |
| R-021 | Cumplido | D | validators.js | ídem |
| R-022 | Parcial | T | PersonalDataScreen.js:157-169 | Selector existe y se guarda en personalData.language, pero la UI es solo español y no hay selector en Configuración (profileEdit.js:5) |
| R-023 | Cumplido | T | VehicleScreen.js | Lista Económico/XL/Premium |
| R-024 | Cumplido | T | validators.js:52; plateNormalization.test.mjs | Test pasa 10/10 solo con el loader (ver Sec. 7) |
| R-025 | Cumplido | T | validators.js | ≤30 |
| R-026 | Cumplido | T | validators.js | ≤30 |
| R-027 | Cumplido | T | validators.js | Año máximo con reloj del dispositivo |
| R-028 | Cumplido | T | VehicleScreen.js | Lista desplegable |
| R-029 | Cumplido | T | validators.js | XL mínimo 6 |
| R-030 | Parcial | T | VehicleScreen.js:154-162 | Foto obligatoria, pero no se puede comprobar que se vea la placa |
| R-031 | Cumplido | T | documentValidators.js | Número, foto y vencimiento futuro |
| R-032 | Cumplido | T | documentValidators.js | SOAT |
| R-033 | Parcial | T | documentValidators.js:9,74-80 | Umbral de 5 años sin decisión numerada que lo respalde |
| R-034 | Cumplido | T | validators.js | Formato de correo |
| R-035 | Cumplido | T | RegistrationTabs.js | Checkbox con comisión visible (confirmar texto en celular) |
| R-036 | Cumplido | T | firebase.js:11,25 | Solo se persiste la sesión de Firebase Auth; sin números de tarjeta/cuenta |
| R-037 | Cumplido | D | MainDrawer.js; locationPolicy.js | T-38..T-45 |
| R-038 | Cumplido | D | config/location.js:16-17 | Escribe cada 5 s o 20 m (~12 escrituras/min máx.) |
| R-039 | Parcial | T | TripActiveScreen.js:69,80,94 | Cleanup en los efectos salvo TripActiveScreen.js:69,80,94 (NO VERIFICADO) |
| R-040 | Cumplido | T | TripRequestScreen.js | Tarjeta con los datos requeridos; distancia/duración inventadas (R-090) |
| R-041 | Parcial | T | TripRequestScreen.js:113,175-191; pendingRequest.js:48-52 | Auto-rechazo existe pero a 30 s (config/passengerApi.js:17); decisiones.md:520 contradice docs/requisitos.md:25 (15 s) |
| R-042 | Cumplido | T | TripActiveScreen.js | Ruta a recogida con OSRM |
| R-043 | Cumplido | T | tripMachine.js | Cambia a ruta de destino |
| R-044 | Cumplido | T | TripActiveScreen.js | Botón finalizar |
| R-045 | Cumplido | T | chargePanel.js | Estados de pago y resumen; sin cobro con tarjeta validado en celular |
| R-046 | Cumplido | T | EarningsScreen.js:29 | Pendiente de celular (progress.md:276) |
| R-047 | Cumplido | T | HistoryScreen.js | Pendiente de celular |
| R-048 | Parcial | T | ProfileScreen.js; profileEdit.js:5 | Edición acotada y cierre de sesión; sin idioma |
| R-049 | No cumplido | T | tripStatus.js | requested no existe en el modelo |
| R-050 | Parcial | T | tripStatus.js; tripController.js | accepted sí; rejected y "siguiente conductor" no modelados |
| R-051 | Parcial | T | tripStatus.js | Existe driver_arrived (nombre distinto a driver_arriving) |
| R-052 | Cumplido | T | tripMachine.js | in_progress |
| R-053 | Cumplido | T | tripRecord.js:86-108 | completed (cálculo al cerrar) |
| R-054 | Cumplido | T | backend/src/firestore.js:29-66 | Solo el backend escribe paid; transacción e idempotencia |
| R-055 | Parcial | T | tripMachine.js:11 | Cancelación permitida también en in_progress |
| R-056 | Parcial | T | RootNavigator.js:41 | Las pantallas dependen de navegación/fase, no solo de status |
| R-057 | Cumplido | T | TripRequestScreen.js | useState |
| R-058 | Parcial | T | TripActiveScreen.js:69,80,94 | Cleanup en lo demás; tres efectos NO VERIFICADOS |
| R-059 | Cumplido | T | AvailabilityContext.js | Context (no Redux) |
| R-060 | Cumplido | T | useEarnings.js:10 | useMemo |
| R-061 | Cumplido | T | TripRequestScreen.js:218,240 | useCallback |
| R-062 | Cumplido | T | src/hooks | Hook existe |
| R-063 | Cumplido | T | src/hooks | Hook existe |
| R-064 | Cumplido | T | EarningsScreen.js:29 | Hook existe |
| R-065 | Parcial | T | firebase.js:11,25; AvailabilityContext.js:6,34 | AsyncStorage solo para sesión de Firebase; idioma no se guarda; disponibilidad NO VERIFICADO |
| R-066 | Cumplido | T | backend/src/stripe.js; backend/src/mercadopago.js | Stripe modo prueba; MP implementado |
| R-067 | Cumplido | T | fare.js:35-48 | Misma función |
| R-068 | Cumplido | T | backend/src/chargeAmount.js:7-12 | El backend toma el monto del viaje (tarifa + propina) |
| R-069 | Desviación documentada | T | backend/src/stripe.js:162-172; README.md:117 | Checkout Sessions en lugar de PaymentIntent |
| R-070 | Parcial | N | backend/src/stripe.js | Sin pago de prueba con tarjeta validado en celular |
| R-071 | Cumplido | T | backend/src/routes/webhooks.js:21-22,63-65; routes/payments.js:75-80 | Webhook y sincronización |
| R-072 | Cumplido | T | useTripPayment.js:2 | onSnapshot sobre el viaje |
| R-073 | Cumplido | T | backend/src/config.js:41 | Sin llaves en src; .env ignorado (.gitignore:42-44) |
| R-074 | Cumplido | T | backend/.env.example | Existe (solo se comprobó el archivo, no se leyó .env) |
| R-075 | Cumplido | T | backend/src/config.js:41 | Rechaza llaves live de Stripe |
| R-076 | Cumplido | T | firestore.rules (local) 182-189 | Cliente solo puede marcar efectivo |
| R-077 | Cumplido | T | earnings.js:57-72 | Saldo negativo permitido |
| R-078 | Cumplido | T | labels.js:292-301 | Solo saldo visible |
| R-079 | Omitido documentado | N | docs/omisiones-y-limites.md | Opcional; no implementado (línea de la omisión NO VERIFICADA) |
| R-080 | Cumplido | T | pricing.js:1-21; fare.js:35-48 | Propina íntegra al conductor |
| R-081 | Cumplido | T | pricing.js:1-21 | Único archivo |
| R-082 | Cumplido | T | pricing.js:1-21 | Parámetros coinciden |
| R-083 | Cumplido | T | fare.js:35-48 | Redondeo a 100 |
| R-084 | Cumplido | T | fare.js:35-48 | Pura |
| R-085 | Cumplido | T | fare.js | Ejecutado: Económico 19.200/3.840/15.360; XL 26.900/5.380/21.520 |
| R-086 | Parcial | T | fare.js; mockPassengerApi.js | La estimación del pasajero es simulada; la app del pasajero no está en este repo |
| R-087 | Cumplido | T | tripRecord.js:95,117 | Se guarda commissionRate |
| R-088 | Cumplido | T | earnings.js:78-100; useEarnings.js:109-111 | Seis métricas con useMemo |
| R-089 | Cumplido | T | earnings.js:57-72 | computeBalance |
| R-090 | No cumplido | T | mockPassengerApi.js:93-104 | Haversine×1,3 y 25 km/h inventados |
| R-091 | Cumplido | T | HistoryScreen.js | FlatList |
| R-092 | Cumplido | T | tripRepository.js:59-86 | Más reciente primero |
| R-093 | Cumplido | T | HistoryScreen.js | Hoy/Semana/Mes/Rango |
| R-094 | Cumplido | T | HistoryScreen.js | Filtro de pago |
| R-095 | Cumplido | T | HistoryScreen.js | Ítem completo |
| R-096 | Cumplido | T | TripDetailScreen.js:3-5; TripMap.js:17 | MapLibre |
| R-097 | Cumplido | T | TripDetailScreen.js | Detalle |
| R-098 | Cumplido | T | TripDetailScreen.js | Propina y calificación |
| R-099 | Parcial | T | tripRecord.js:97-99 | Solo passengerName; sin passengerId |
| R-100 | Desviación documentada | T | tripRecord.js | originLabel/destinationLabel (texto, D-86/D-125) en vez de {lat,lng,address} |
| R-101 | Cumplido | T | tripRecord.js | distanceKm, durationMin |
| R-102 | Desviación documentada | T | pricing.js:6 | Clave 'economico'; 'economy' lanza INVALID_FARE_INPUT (fare.js:45-46) |
| R-103 | Cumplido | T | tripRecord.js:86-108 | Pesos enteros |
| R-104 | Cumplido | T | tripRecord.js:95,117 | 0,20 |
| R-105 | Cumplido | T | tripRecord.js | mercadopago |
| R-106 | Cumplido | T | tripRecord.js; backend/src/firestore.js:48-66 | paymentStatus, paymentId |
| R-107 | Parcial | T | tripRepository.js:30; tripStatus.js | Solo se persisten completed/cancelled/paid |
| R-108 | Cumplido | T | tripRecord.js:32-45 | rating (ver G-01 por la regla) |
| R-109 | Parcial | T | tripRecord.js | Se usa finishedAt (+startedAt) en vez de completedAt |
| R-110 | Desviación documentada | T | tripRepository.js:14,47; D-86 | drivers/{uid}/trips en vez de trips |
| R-111 | Cumplido | T | HistoryScreen.js | Estado vacío |
| R-112 | Cumplido | T | tripRepository.js:59-86 | 20 por página + Cargar más |
| R-113 | No cumplido | T | backend/src/admin.js:6-8; package.json | Sin FCM, sin google-services.json |
| R-114 | Parcial | T | driverRepository.js:16; tripRepository.js:37,48; useTripPayment.js:2 | onSnapshot en viaje y conductor; ubicación solo se escribe (driverLocationPublisher.js:18) |
| R-115 | Parcial | D | gpsLocationSource.js:71-75; config/location.js:16-17 | expo-location (equivalente) con distanceInterval 10 m sin timeInterval; no es @react-native-community/geolocation |
| R-116 | Desviación documentada | D | package.json:7; D-82 | MapLibre + OpenFreeMap en vez de react-native-maps |
| R-117 | Cumplido | D | cloudinary.js:20-35 | Preset unsigned |
| R-118 | Cumplido | T | reverseGeocode.js:105 | Pendiente de celular |
| R-119 | Cumplido | D | osrmRouting.js:10-12 | OSRM demo público |
| R-120 | No cumplido | T | osrmRouting.js | No hay llamadas a Google Directions |
| R-121 | No cumplido | T | mockPassengerApi.js:93-104 | No hay Distance Matrix |
| R-122 | No cumplido | N | — | No aplica mientras no se use Google; se vuelve exigible si se adopta (G-03) |
| R-123 | Cumplido | T | tripRecord.js:72-75; TripDetailScreen.js:3-5 | Se dibuja la ruta planificada guardada |
| R-124 | Cumplido | D | cloudinary.js:20-35 | Sin Firebase Storage |
| R-125 | Cumplido | T | docs/AI_LOG.md | 61 entradas |
| R-126 | Parcial | T | git log | 9 ramas anderson/*, 8 PR fusionados, un solo autor |
| R-127 | Cumplido | T | README.md:141-142 | Sección y enlace |
| R-128 | No cumplido | N | — | No existe el PDF de la bitácora |
| R-129 | Parcial | T | AI_LOG.md | 10 entradas RECONSTRUIDA (#3-#11, #22) |
| R-130 | Cumplido | T | AI_LOG.md | Prompt textual |
| R-131 | Cumplido | T | AI_LOG.md | Resúmenes presentes |
| R-132 | Parcial | T | AI_LOG.md | Campo presente, desigual |
| R-133 | Parcial | T | AI_LOG.md | Hash en 20/61 entradas |
| R-134 | Parcial | T | AI_LOG.md | Verificación en 52/61 |
| R-135 | Parcial | T | AI_LOG.md | Aprendizaje solo en #33 |
| R-136 | Parcial | T | AI_LOG.md | Plantilla del PDF 8 campos; se usan 10 (Integrante, Objetivo) |
| R-137 | Parcial | T | VehicleScreen.js:79; validators.js:52; plateNormalization.test.mjs:1 | 582 marcadores en 207 archivos; #62 no existe; 19 entradas sin marcador |
| R-138 | Parcial | N | — | No hay .env en el historial; el contenido de los prompts no se auditó |
| R-139 | Cumplido | T | git branch | 9 ramas anderson/* |
| R-140 | Parcial | N | — | `gh` no instalado; revisión de PR NO VERIFICADA |
| R-141 | Cumplido | T | git log | Merge #8 en main |
| R-142 | Cumplido | T | README.md:29-44 | Instalación |
| R-143 | Cumplido | T | README.md:45-53 | Variables de entorno |
| R-144 | Parcial | T | docs/AI_LOG.md | Bitácora sí; PDF no |
| R-145 | No cumplido | N | docs/guion-video.md | Guion de 4:45; video no existe |

## 3. Brechas priorizadas

Esfuerzo: S ≤ 3 h, M 3–10 h, L > 10 h. Tipo: B = bloqueante, F = funcional, D = documental/proceso, C = calidad.

| G | Brecha | R afectados | Tipo | Impacto | Esf. | Riesgo | Depende de |
|---|---|---|---|---|---|---|---|
| G-01 | `firestore.rules` local sin `tip`/`rating` y exige comisión+ganancia==tarifa (líneas 152-178 de `validTrip`); la regla nueva está en `docs/seguridad.md:205` y `seguridad.md:295`/`progress.md:298` dicen que NO se publicó | R-053, R-054, R-103, R-106, R-108 | B | Guardar viajes con propina/calificación fallaría; estado en consola NO VERIFICADO | S | Alto si no se hace | — |
| G-02 | Distancia y duración inventadas (haversine×1,3, 25 km/h) | R-040, R-090, R-121 | F | Datos falsos en la tarjeta y la tarifa | S (OSRM) | Bajo | — |
| G-03 | Sin Google Directions/Distance Matrix ni restricción de key | R-004, R-120, R-121, R-122 | F | Requisito literal del PDF | M | Medio (tarjeta de crédito en Google) | G-02 |
| G-04 | FCM ausente | R-113 | F | Obligatoria; sin push en segundo plano | L | Alto (build nativo, iOS exige cuenta Apple de pago) | Anderson: builds |
| G-05 | Idioma es/en sin efecto; sin AsyncStorage de idioma/disponibilidad | R-022, R-048, R-065 | F | Requisito explícito; ~495 cadenas en `labels.js` | L (16–20 h) | Medio | Decidir D-15 |
| G-06 | Temporizador 30 s | R-003, R-041 | F | Incumple "15 s" | S (15 min) | Bajo | — |
| G-07 | Estados `requested`/`rejected`, "siguiente conductor", cancelar solo antes de `in_progress`, `driver_arriving`, status gobierna pantalla | R-049..R-051, R-055, R-056 | F | Máquina de estados incompleta | M | Medio | — |
| G-08 | Validación en celular pendiente (CA-002-01..09, historial, filtros, propina) | R-003, R-007, R-040..R-047 | D | 85 % del cumplimiento es solo T | M | Medio | G-01, G-06 |
| G-09 | Mercado Pago sin verificar (sin cuentas de prueba; `TEST-` no validado; preferencia no idempotente) | R-066, R-070, R-071 | F | Pasarela recomendada sin probar | M | Medio | Usuarios de prueba MP |
| G-10 | Pago con tarjeta Stripe 4242 de punta a punta sin D | R-005, R-045, R-070 | F | Hito central del video | S–M | Bajo | G-01 |
| G-11 | Modelo: sin `passengerId`, `completedAt`, categoría `economy`, etiquetas en vez de `{lat,lng,address}`, colección `drivers/{uid}/trips` | R-099, R-100, R-102, R-109, R-110 | F/D | Desvíos del esquema del PDF | M (aditivo) | Medio (migrar datos) | G-01 |
| G-12 | Sin PDF de bitácora | R-128, R-144 | D | Entregable obligatorio; `check-constitution` C21 | S | Bajo | G-13 |
| G-13 | Bitácora: Aprendizaje 1/61, Verificación 52/61, hash 20/61, marcador `#62` inexistente (3 archivos), 19 entradas sin marcador, 10 reconstruidas | R-129..R-137 | D | Incumple el formato exigido | M | Bajo | Anderson (campos humanos) |
| G-14 | Sin video ≤5 min | R-145 | D | Entregable; el guion suma 4:45 | M | Alto (depende de G-08/G-10) | G-08, G-10 |
| G-15 | Efectos sin verificar en `TripActiveScreen.js:69,80,94` | R-039, R-058 | C | Posibles fugas | S | Bajo | — |
| G-16 | Desviaciones sin decisión formal: MapLibre (D-82 existe), Checkout Sessions, expo-location, OSRM, umbral TM de 5 años, split | R-033, R-069, R-079, R-115, R-116 | D | Que el revisor las lea como incumplimiento | S | Bajo | — |
| G-17 | `timeInterval` de 1 s ausente en expo-location | R-115 | F | Máx. 1 petición/s solo por equivalencia | S | Bajo | — |
| G-18 | Foto de perfil/vehículo solo valida URL no vacía; fechas sin `minimumDate`; año con reloj del dispositivo | R-015, R-019, R-027, R-030 | C | Validación débil | S | Bajo | — |
| G-19 | R-140 (revisión de PR) y R-126 sin evidencia; `gh` no instalado | R-126, R-140 | D | Entregable de proceso | S | Bajo | Anderson |
| G-20 | `check-constitution`: 15 errores, 189 avisos (C23 149, C26 24, C14 15 con 2 reales en `chargePanel.js:67` y `earnings.js:67`, C11 1 en `ProfileScreen.js:59`) | transversal | C | Reporte sucio | S | Bajo | — |
| G-21 | Sin script `npm test`; 3 tests exigen el loader | transversal | C | Parece que fallan | S | Bajo | — |
| G-22 | `listenToTrips` limita a 200 (`tripRepository.js:14,47`): ganancias truncadas | R-088 | C | Totales erróneos con muchos viajes | S–M | Bajo | — |
| G-23 | Documentos desactualizados (D-86 dice que no se guarda commissionRate pero sí se guarda; `progress.md:287`; `decisiones.md:314` afirma preferencias en AsyncStorage; 5 documentos enlazan el PDF viejo) | R-125, R-142 | D | Contradicciones | S | Bajo | — |

Total: **23 brechas**.

Criterios de aceptación y pruebas (resumen por brecha):

- G-01: publicar la regla, guardar un viaje con tip y rating desde el celular y ver el documento en la consola; prueba: viaje completo en dispositivo + emulador de reglas si existe.
- G-02: la tarjeta muestra distancia/duración que coinciden con OSRM (±5 %) y calculateFare usa esos valores; prueba: test unitario del adaptador + celular.
- G-03: una llamada a Distance Matrix por solicitud y una al aceptar, ninguna por movimiento; key restringida a la app; alerta de presupuesto; prueba: contador de llamadas en logs del backend.
- G-04: con la app cerrada llega una notificación al crear una solicitud; token guardado en `drivers/{uid}`; prueba: script de envío con firebase-admin en celular Android.
- G-05: cambiar a inglés cambia todas las pantallas, persiste al reiniciar y se guarda en el perfil; prueba: recorrer cada pantalla en ambos idiomas; 0 literales en JSX fuera del archivo de textos.
- G-06: constante 15 s única, tests de expiración, celular: la solicitud se rechaza sola a los 15 s.
- G-07: tests puros de la máquina para cada transición, cancelar en `in_progress` rechazado, estados visibles en Firestore; celular: rechazar y vencer.
- G-08: completar los CA pendientes y anotarlos en `progress.md` como D.
- G-09: pago con usuario de prueba MP aprobado y `status: paid` visible en la app; token con prefijo `TEST-` exigido.
- G-10: pago Stripe 4242 → webhook → `paid` → resumen en el celular sin recargar.
- G-11: documento nuevo con `passengerId`, `completedAt`, `category` aceptando `economy` y ubicaciones `{lat,lng,address}` o decisión documentada.
- G-12: PDF exportado de `docs/AI_LOG.md` incluido en el repo; `check-constitution` sin C21 de ese ítem.
- G-13: cada entrada con los 9 campos y hash; `#62` resuelto; 0 errores C18.
- G-14: video ≤5 min con registro, solicitud, viaje, pago de prueba e historial.
- G-15..G-23: revisión de código/test y `check-constitution` sin los avisos citados.

## 4. Opciones para brechas grandes

**FCM (G-04).**
- 1A `@react-native-firebase/app` + `messaging`: es lo que pide el PDF. Esfuerzo L; exige build nativo (lo hace Anderson), `google-services.json`, guardar token en `drivers/{uid}`, cambiar reglas, un script de envío con firebase-admin; en iOS exige cuenta Apple de pago y APNs.
- 1B `expo-notifications` solo Android: M–L, menos fiel al PDF.
- 1C documentar como omisión: 0 h, deja R-113 en No cumplido, que es "obligatoria".
- Recomendación: 1A solo Android si hay ≥2 días libres antes de la fecha; si no, 1C con riesgo asumido por Anderson. Las dependencias deben pasar de "proposed" a "allowed" en `scripts/dependencies.json`.

**Idioma es/en (G-05).** Crear `src/i18n` con es/en, `LanguageContext` + hook `useLabels`, persistencia en AsyncStorage y en Firestore, selector en Configuración. `labels.js` tiene 687 líneas, ~495 cadenas y 48 importadores, y no hay literales en JSX fuera de él (buen punto de partida). Estimado 2–2,5 días. Alternativa mínima: traducir solo las pantallas del flujo del video (menos fiel). Requiere aprobar D-15 (hoy "Propuesta").

**Directions / Distance Matrix (G-02, G-03).**
- Plan B (recomendado ya): usar OSRM `route` para distancia y duración reales, S, sin tarjeta.
- Plan A: Google Routes/Distance Matrix vía backend (M); desde marzo de 2025 no hay crédito de 200 USD y hay cupo gratis por SKU (10.000), y exige tarjeta; fecha de retiro de las APIs legacy NO VERIFICADA.
- Recomendación: Plan B primero (G-02). Plan A solo si Anderson quiere cumplir la letra del PDF y acepta la tarjeta.

**react-native-maps vs MapLibre (R-116).** Migrar cuesta L, exige build nativo y llaves de Google Maps, y la decisión D-82 ya existe. No migrar; justificar en el README.

**Mercado Pago (G-09).** Ya está implementado (`backend/src/mercadopago.js:117-128`). Falta probar con usuarios de prueba, exigir `TEST-`, hacer idempotente la preferencia y exponer el webhook (ngrok) o usar la sincronización. M.

**Stripe PaymentIntent vs Checkout Sessions (R-069).** Se usa Checkout Sessions (`backend/src/stripe.js:162-172`), que el PDF admite en la práctica (el pasajero paga en checkout). PaymentSheet con PaymentIntent exigiría build nativo (L). Recomendación: conservar y documentar la desviación.

**Split payments (R-079).** Opcional. Stripe Connect o split de MP añaden cuentas conectadas y L de trabajo. No hacer.

**Otras.** Estados requested/rejected (M, G-07), modelo de datos aditivo (M, G-11) y reglas de Firestore (S, G-01).

## 5. Plan de lotes

Horas son estimaciones de trabajo; no hay fecha límite dada, el nombre del archivo es la fecha del análisis. Orden recomendado por riesgo/valor.

| Lote | Contenido | Horas | Se prueba en celular |
|---|---|---|---|
| L1 Desbloqueo | G-01, G-06, G-02 (OSRM), G-17, G-15, G-22 | 6–8 | Guardar viaje con propina/calificación; 15 s; distancia real |
| L2 Estados y modelo | G-07, G-11, G-16 (documentar) | 10–14 | Rechazar, vencer, cancelar, ver estados en Firestore |
| L3 Idioma | G-05, G-18 | 18–22 | Cambio es/en en todas las pantallas y tras reiniciar |
| L4 Pagos | G-09, G-10 | 8–12 | Stripe 4242; MP con usuario de prueba |
| L5 FCM (opcional) | G-04 | 16–20 | Notificación con la app cerrada |
| L6 Google (opcional) | G-03 | 6–10 | Conteo de llamadas |
| L7 Proceso y entrega | G-08, G-12, G-13, G-14, G-19, G-20, G-21, G-23 | 14–18 | Video y checklist final |

Totales: obligatorios L1–L4 + L7 ≈ 56–74 h; con L5 y L6 ≈ 78–104 h.

Decisiones pendientes de Anderson:
1. ¿FCM: 1A Android, 1B o 1C documentar?
2. ¿Aprobar D-15 (idioma es/en completo)?
3. ¿Google Directions/Distance Matrix con tarjeta o OSRM real y documentar?
4. ¿Publicó o no la regla de `trips` en la consola? (confirmarlo antes de L1)
5. ¿Hay usuarios de prueba de Mercado Pago o se deja MP como "implementado, no verificado"?
6. ¿Modelo de datos: migrar a `trips` y `passengerId`, o documentar la desviación?
7. ¿Autoriza mover dependencias de "proposed" a "allowed" para L5/L6?
8. ¿Quién revisa los PR (R-140)? Hoy hay un solo autor.

Lote final de proceso (L7): cerrar CA pendientes y anotarlos como D en `progress.md`, completar Verificación/Aprendizaje/hash en `AI_LOG.md` (Anderson), corregir marcador `#62` y las 19 entradas sin marcador, exportar el PDF, actualizar los 5 documentos con enlace al PDF viejo, grabar el video según `docs/guion-video.md`, ejecutar P6 (README, capturas, clon limpio) y hacer commit/push manualmente.

## 6. Lo que no se recomienda

- Migrar de MapLibre a `react-native-maps`: costo L, mismo resultado visible.
- Split payments reales (Connect): opcional y fuera de alcance.
- Cambiar a Redux: Context cumple R-059.
- Reescribir el backend de pagos a PaymentIntent/PaymentSheet: riesgo alto, valor bajo.
- Dejar `firestore.rules` fuera de Git (`.gitignore:61`): conviene versionarla, no contiene secretos (decisión de Anderson).
- Ampliar `dependencies.json` con paquetes no necesarios para L1–L4.

## 7. Hallazgos de calidad no ligados al PDF

- `check-constitution`: 15 errores (2 C01 falsos positivos sobre `.env` locales ignorados y nunca versionados, 2 C18 reales por `#62`, 11 C21 por PDF y video) y 189 avisos; 5 reglas inactivas porque la herramienta asume "Fase 3".
- Tests: 40 en total; 37 pasan con la invocación por defecto; `plateNormalization`, `registrationProgress` y `reverseGeocode` fallan con ERR_MODULE_NOT_FOUND y pasan 10/10 con `node --import ./scripts/tests/helpers/registerSrcLoader.mjs --test ...`. No hay script `npm test` (`package.json:32-36`). No hay pruebas directas de `tripController`, `tripMachine`, `pendingRequest`, el mock, el throttle ni `locationPolicy`.
- Seguridad: verificación de token (`backend/src/auth.js:21`), límites por IP y usuario (`backend/src/middleware.js:5-47`), monto tomado del viaje (`backend/src/chargeAmount.js:7-12`), firma de Stripe con comparación segura, CORS cerrado (`backend/src/app.js:19`), llaves live rechazadas (`backend/src/config.js:41`), `.env` ignorado (`.gitignore:42-44`) y fuera del historial. Menores: el webhook de MP acepta eventos sin firma si falta el secreto (`backend/src/routes/webhooks.js:21-22`; mitigado porque se vuelve a consultar); limitador en memoria sin `trust proxy`; la tarifa la calcula el cliente (tope del backend 2M vs reglas 10M).
- `firestore.rules` está ignorado: no viaja con el repo; `.claude/agents` tampoco está versionado.
- Estado git actual: PDF antiguo borrado ("D"), `docs/enunciado-taller.pdf` sin versionar y `CONTEXTO_PROYECTO.txt` sin versionar; el análisis solo añade este archivo.
- La auditoría `docs/auditoria-enunciado-2026-11-12.md` sobrestima el idioma y no refleja la regla de Firestore ni el temporizador.
- La hora del dispositivo se usa para el año y los vencimientos frente a vencimientos con hora de Colombia; el reloj mal puesto cambia los resultados.
- Las referencias del análisis fueron revisadas por un agente distinto, que corrigió seis rutas/líneas de backend y una de reglas; las de este documento ya están corregidas con grep.
