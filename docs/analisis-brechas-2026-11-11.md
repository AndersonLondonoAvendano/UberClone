# Análisis de brechas — 2026-11-11 (tarea R0, solo lectura)

Fuentes comparadas: `docs/requisitos.md`, `docs/constitution.md`, `specs/000-fundacion`, `specs/001-registro-conductor`, `docs/plan-entrega-final.md`, `docs/progress.md`, `docs/seguridad.md` y el código de `src/`, `scripts/` y `backend/src/app.js`. Fecha de entrega supuesta: jueves 2026-11-12. Las horas son estimaciones del analista, no compromisos. "Validado" significa por declaración de Anderson, según `docs/progress.md`; este análisis no ejecutó nada.

## 1. Tabla requisito → estado

Estados: HV = hecho y validado; HSV = hecho sin validación en dispositivo; P = parcial; F = faltante; FA = fuera de alcance acordado (D-77, D-82 y plan-entrega-final).

| Requisito | Estado | Evidencia | Prioridad | Horas |
|---|---|---|---|---|
| RF-01 pestañas de registro | HV (Android) | spec 001, T-24 a T-26; `src/navigation/RegistrationTabs.js` | obligatorio | 0 |
| RF-02 enviar solo con 3 pestañas válidas | HSV | T-23, T-26; T-28 (prueba integral) figura Pendiente | obligatorio | 1 |
| RF-03 errores bajo el campo, sin Alert | HSV | `src/components/registration/FieldError.js`, C05; T-31, T-33 y T-34 sin prueba en celular | obligatorio | 0,5 |
| RF-04 cuenta pendiente/aprobada | HSV | `src/constants/accountStatus.js`, `src/services/driverRepository.js` (T-17, T-18); CA-001-24 base | obligatorio | 0,5 |
| RF-05 datos personales | P | `src/utils/validators.js`; `DateField.js` usa solo `DateTimePickerAndroid`; el idioma ES/EN no tiene pantalla en `src/screens` (grep) | obligatorio | 1 |
| RF-06 vehículo | HSV | `src/screens/registration/VehicleScreen.js`, T-25 | obligatorio | 0,5 |
| RF-07 documentos y pagos | HSV | `src/screens/registration/DocumentsScreen.js`, T-26 | obligatorio | 0,5 |
| RF-08 mapa y Disponible | HV | T-37, T-42 (checkpoint 1) | obligatorio | 0 |
| RF-09 ubicación periódica y limpieza | HV | T-41 y T-42; `src/hooks/useDriverLocation.js`, `src/services/driverLocationPublisher.js` | obligatorio | 0 |
| RF-10 solicitud entrante | HV | T-43, T-54; `src/components/IncomingRequestCard.js` | obligatorio | 0 |
| RF-11 temporizador de 15 s | HV | T-43 | obligatorio | 0 |
| RF-12 viaje en curso | P | T-44 validada con OSRM (D-82), no Google Directions; las solicitudes vienen del mock (`src/services/passengerApi/mockPassengerApi.js`) | obligatorio (desviación declarada) | 0 |
| RF-13 estados del viaje | P | `src/constants/tripStatus.js`, `src/services/trip/tripMachine.js`; `requested`/`rejected` y `paid` no se escriben (plan, rebanada B) | mejora | 2 |
| RF-14 cobro y resumen | HV (simulado) | T-45, T-46; `src/screens/trip/TripSummaryScreen.js` | obligatorio | 0 |
| RF-15 pasarela Mercado Pago/Stripe | FA | plan: no cubierto; `backend/src/app.js` solo expone `/health` | mejora | 10 |
| RF-16 flujo backend de pago y webhook | FA | ídem; sin código de pago en `backend/src` | mejora | 10 |
| RF-17 efectivo y saldo negativo | P | T-46 marca el efectivo a mano; el saldo sale de `src/utils/earnings.js` | obligatorio | 1 |
| RF-18 liquidación simulada | P | saldo calculado en Ganancias (T-47), sin acción de liquidar | mejora | 1 |
| RF-19 pago dividido | FA | opcional (bonificación) | mejora | 0 |
| RF-20 `calculateFare` única | HV | `src/utils/fare.js`, T-39 | obligatorio | 0 |
| RF-21 parámetros en `pricing.js` | HV | `src/config/pricing.js`, T-38 | obligatorio | 0 |
| RF-22 redondeo a 100 y ejemplo | HV | T-39 (script) | obligatorio | 0 |
| RF-23 `commissionRate` por viaje | P | el registro lo envía (T-38); la regla de `trips` lista 15 campos y no incluye `commissionRate` (`docs/seguridad.md`) | obligatorio | 1 |
| RF-24 Ganancias hoy/semana/mes con `useMemo` | HV | `src/screens/main/EarningsScreen.js`, T-47 | obligatorio | 0 |
| RF-25 saldo del conductor | HV | T-47, `src/utils/earnings.js` | obligatorio | 0 |
| RF-26 Historial con `FlatList` y filtros | P | T-48 validada; el plan acordó solo el filtro por método de pago, sin Hoy/Semana/Mes/Rango | mejora | 2 |
| RF-27 detalle con ruta dibujada y calificación | FA | plan: sin ruta dibujada; la regla de `trips` no admite coordenadas (D-87) | mejora | 3 |
| RF-28 vacío y límite de 20 | HV | T-48 | obligatorio | 0 |
| RF-29 perfil editable, idioma y cerrar sesión | P | T-49 solo lectura (`ProfileScreen.js`, `SettingsScreen.js`); sin `signOut` en `src/` (grep); la sesión por correo es R4 de este lote | obligatorio (cerrar sesión), mejora (edición e idioma) | 1 y 3 |
| RF-30 Stack + Tabs + Drawer | HV (Android) | T-11 a T-14; `src/navigation/MainDrawer.js`, `TripStack.js` | obligatorio | 0 |
| RNF-01 iOS y Android | P | solo Android probado; CA-000-02 queda parcial (P-05, sin iPhone) | obligatorio (declarar) | 0,5 |
| RNF-02 hooks obligatorios | HV | `useMemo` en 11 archivos de `src/` (grep) y limpieza de efectos (C11) | obligatorio | 0 |
| RNF-03 `useDriverLocation`, `useTripRequests`, `useEarnings` | P | existen los dos primeros en `src/hooks/`; `useEarnings` no existe (grep sin resultados); hay `useTrips.js` | obligatorio (C12) | 1 |
| RNF-04 AsyncStorage solo preferencias | HV | C04; la sesión de Firebase usa `getReactNativePersistence` (`src/services/firebase.js`) | obligatorio | 0 |
| RNF-05 secretos fuera de Git | HV | `.gitignore` líneas 42 a 44 (`.env`, `.env.*`, `!.env.example`); existe `.env.example` | obligatorio | 0 |
| RNF-06 FCM, Firestore, geolocalización | P | `onSnapshot` sí; sin FCM (D-77); `expo-location` en lugar de `@react-native-community/geolocation` (D-82) | declarar | 0 |
| RNF-07 Cloudinary y OSRM | HV | `src/services/cloudinary.js`, `src/services/routing/osrmRouting.js` | mejora | 0 |
| RNF-08 Distance Matrix y clave | FA | no hay clave de Google; una petición OSRM por tramo | mejora | 0 |
| RNF-09 modelo `trips` | P | `drivers/{uid}/trips/{tripId}` con 15 campos; faltan `commissionRate`, `paymentId` y calificación | mejora | 1 |
| RNF-10 `Polyline` del historial | FA | MapLibre en lugar de `react-native-maps` (D-82); sin ruta en el historial | mejora | 3 |
| RNF-11 backend Node/Express | P | `backend/src/app.js` (solo `/health`) | mejora | 0 |
| RNF-12 development build | HV | T-01, CA-000-03 y CA-000-04 | obligatorio | 0 |
| RNF-13 prueba en celular físico | P | T-28 Pendiente; T-29 aplazada; T-31, T-33 y T-34 sin prueba | obligatorio | 1,5 |
| ENT-01 ramas, PR y merge | HSV | historial de git (PR #4 a #6) | obligatorio | 0,5 |
| ENT-02 README con instalación y "Uso de IA" | P | `README.md` dice "Estado actual de la entrega (parcial, 2026-11-05)" y que las demás specs no están implementadas; desactualizado (T-50) | obligatorio | 1 |
| ENT-03 bitácora y PDF | P | `AI_LOG.md` existe; PDF no encontrado (T-51, Anderson) | obligatorio | 1,5 |
| ENT-04 marcas `// AI-assisted` | P | C18; T-51 | obligatorio | 0,5 |
| ENT-05 sin llaves en prompts | HSV | sin evidencia automatizada | obligatorio | 0 |
| ENT-06 video de 5 min | F | T-52 (lo graba Anderson) | obligatorio | 1,5 |
| ENT-07 sustentación | F | proceso humano | obligatorio | 1 |
| ENT-08 docs en español | HV | revisión de `docs/` | obligatorio | 0 |
| Diseño: auditoría final | P | spec 000 con "Diseño: Pendiente"; T-29 aplazada; rondas 1 y 2 estáticas de T-43 a T-45 sin capturas (`docs/diseno/auditorias/`) | obligatorio (una sola, máx. 2 rondas) | 3 |
| Constitución: `check-constitution` | P | línea base de 23 errores y 0 advertencias (`docs/progress.md`, prompt #44) | obligatorio | 1 |

Los conteos por estado están al final del documento.

## 2. Hallazgos de seguridad y límites conocidos

Seguridad:
1. **Reglas de Firestore no versionadas.** `firestore.rules` está en `.gitignore` (línea 61, D-80). Un clon limpio no puede reproducir las reglas efectivas. Mitigación vigente: `docs/seguridad.md` describe `drivers` en palabras y trae el texto de `driverLocations` y `trips`. Riesgo de que consola, copia local y documento diverjan. Estimación: 1 h (anexar a `docs/seguridad.md` el texto completo, `drivers` incluido).
2. **Acceso anónimo.** `src/services/firebase.js:44` llama a `signInAnonymously`. El `uid` vive en el dispositivo: al reinstalar o borrar datos se pierde el acceso al documento del conductor y a sus viajes, y la identidad no está ligada a una persona. R4 lo reemplaza por correo y contraseña; las reglas de `drivers` deben revisarse tras ese cambio.
3. **Aprobación manual.** `accountStatus` solo puede crearse como `pending`; `approved` se pone a mano en la consola. Es correcto, pero depende de un administrador humano y no hay backend que lo audite.
4. **Datos personales.** `drivers/{uid}` guarda nombre, documento, celular, correo y URL de fotos de documentos en Cloudinary (subida con `upload preset`; las URL son accesibles para quien las conozca). `trips` guarda `passengerName` en texto (pasajero simulado). No hay política de retención.
5. **Logs.** La única llamada a `console.*` en `src/` es `src/services/passengerApi/mockPassengerApi.js:49`, bajo `isDev()`, sin datos del conductor. No se halló registro de datos personales. `backend/src` no se revisó más allá de `app.js`.
6. **Secretos.** `.env` está ignorado y `.env.example` solo lleva nombres. Los `EXPO_PUBLIC_*` (Firebase, Cloudinary) quedan embebidos en la app; la protección real son las reglas y el preset de Cloudinary. El backend no maneja secretos hoy. No se leyó ningún `.env`.
7. **Tarifa del cliente.** La constitución §4 (C24) pide que el backend recalcule la tarifa, pero no hay backend de pago: el monto lo calcula la app y la regla de `trips` solo valida coherencia (`commission + driverEarnings == fare`). Confiable solo dentro de la demo.
8. **`SHOW_DEV_TOOLS`.** `src/constants/devTools.js` vale `false` en la copia revisada y debe seguir así al entregar.
9. **Reglas publicadas.** Según `docs/seguridad.md` y progress (prompt #51), `drivers`, `driverLocations` y `trips` están publicadas; no se pudieron contrastar con la consola.

Límites conocidos:
- iOS sin verificar (P-05, sin iPhone); `DateField.js` usa `DateTimePickerAndroid` y no tiene rama para iOS.
- OSRM demo público (1 petición por segundo, sin SLA), con respaldo en `src/services/routing/fallbackRoute.js` y `straightLine.js`; OpenFreeMap sin SLA.
- API del pasajero simulada (`mockPassengerApi.js`; `httpPassengerApi.js` es un esqueleto) y posición de demo con fuente simulada.
- Sin FCM ni ubicación en segundo plano (D-77); sin pasarela real ni webhook; sin Google Directions.
- Backend solo con `/health`.
- `check-constitution` con 23 errores de línea base.
- README desactualizado; diseño final sin auditar con capturas.

## 3. Lo que ya cubre este lote

Las descripciones de R1 a R4 se toman del encargo; el análisis no inspeccionó su implementación.
- **R1, solicitud sin scroll:** la solicitud entrante (RF-10, `src/components/IncomingRequestCard.js`, `src/screens/trip/TripRequestScreen.js`) cabe en pantalla sin desplazamiento. Falta la prueba en el celular.
- **R2, accesibilidad pendiente:** hoy hay `accessibilityLabel` en 23 archivos de `src/`, pero `src/screens/trip/TripActiveScreen.js` tiene 0 y `TripRequestScreen.js` 4 (conteo previo al lote). No hay RF/RNF propio; se apoya en `docs/diseno/rubrica.md`.
- **R3, marcador de auto:** marcador del conductor en el mapa del viaje (RF-12, `src/components/map/TripMap.js`). Falta la prueba en el celular.
- **R4, sesiones de conductor con correo y contraseña:** reemplaza `signInAnonymously` (`src/services/firebase.js`) y cubre el cierre de sesión de RF-29. Anderson debe habilitar el proveedor en la consola; las reglas de `drivers` y los conductores de prueba pueden requerir ajuste. No se verificó si hace falta tocar `scripts/dependencies.json`.

Brechas "obligatorio para entrega" restantes, en orden (punto 7 del prompt):
1. Prueba integral en el celular y cierre de T-28 (RF-02 a RF-07), más T-31, T-33 y T-34 (RNF-13). 2,5 h, con Anderson.
2. `commissionRate` en el registro del viaje y en la regla de `trips` (RF-23, RNF-09). 1 h; Anderson publica la regla.
3. Hook `useEarnings` (RNF-03, C12), extrayendo la lógica de `EarningsScreen.js` y `src/utils/earnings.js`. 1 h.
4. Auditoría de diseño final con capturas, máximo dos rondas (specs 000 y 001 con "Diseño: Pendiente"). 3 h.
5. Reglas de Firestore: dejar el texto completo en `docs/seguridad.md` (hallazgo 1). 1 h.
6. README actualizado: instalación, mock/http, simulada/GPS, reglas, límites, iOS y `DateField` solo Android, "Uso de IA" (ENT-02, RNF-01, T-50). 1,5 h.
7. Bitácora completa, marcas `// AI-assisted` y PDF (ENT-03, ENT-04, T-51). 2 h, Anderson.
8. Video de 5 min o menos (ENT-06, T-52). 1,5 h, Anderson.
9. `progress.md`, matriz de trazabilidad y `check-constitution` antes del PR a `main` (T-53). 1 h.

Total estimado de esta lista: unas 14,5 h, cerca de 7 de ellas de Anderson (celular, bitácora, video, consola). Fuera de la lista, RF-29 (edición de perfil e idioma) y RF-05 (idioma ES/EN) son decisiones de alcance de Anderson.

## 4. Conteo por estado

Total de filas: 53. Hecho y validado (HV): 19. Hecho sin validación en dispositivo (HSV): 7. Parcial (P): 19. Faltante (F): 2. Fuera de alcance acordado (FA): 6.

## 5. Actualización R0b (2026-11-11, noche): lectura completa del enunciado

Fuente leída: `C:\Users\Anderson\Downloads\UberClone — Versión Conductor.pdf` (secciones 1 a 9, 387 líneas de texto extraído). **Discrepancia:** `docs/enunciado-taller.pdf` NO existe en el repositorio; el PDF se leyó desde Descargas. La numeración del enunciado coincide con §2 a §9 del encargo. Estados con la misma clave de la sección 1, más NI = no iniciado. Horas: estimación del analista para el lote final.

| Requisito del enunciado | Estado antes del lote | Evidencia / brecha | Prioridad | Horas | Rebanada |
|---|---|---|---|---|---|
| §3.1 Inicio: mapa a pantalla completa con ubicación actual y interruptor | P | el mapa existe, la tarjeta no es flotante; publicar solo Disponible | obligatorio | 2 | F1b |
| §3 «NaN:NaN» junto al nombre en Ganancias | defecto | formato de hora/fecha sin guarda | obligatorio | 0,5 | F1a |
| §2 Pestaña 3: licencia (número, foto, vencimiento > hoy) | F | no hay campos de licencia | obligatorio | 2 | F2 |
| §2 Pestaña 3: SOAT (foto, vencimiento > hoy) | F | no existe | obligatorio | 1 | F2 |
| §2 Pestaña 3: revisión técnico-mecánica si aplica por año (≥5 años) | F | no existe | obligatorio | 1 | F2 |
| §2 Correo Mercado Pago y términos con comisión | HSV | ya existe | obligatorio | 0 | F2 |
| §2 Enviar solo con 3 pestañas válidas | HSV | debe incluir los nuevos campos | obligatorio | 0,5 | F2 |
| §2 Sin números de cuenta/tarjeta en la app | HV | se mantiene | obligatorio | 0 | F2 |
| §2 Idioma ES/EN en datos personales | F | textos centralizados en `labels.js`, sin selector; se documenta como omisión | declarar | 0 | F5 |
| §3.4 Cobro y resumen: Aprobado/Pendiente/Rechazado/Efectivo | P | hoy simulado (D-89); sin estado de pasarela real | obligatorio | 3 | F4d |
| §3.2 Solicitud entrante muestra método de pago | F | la tarjeta de solicitud no lo muestra | obligatorio | 0,5 | F4d |
| §3 Estados `completed` y `paid` en `status` | P | `paid` no se escribe | obligatorio | 1 | F4 |
| §3 Estado `cancelled` | P | pendiente de verificar escritura | obligatorio | 0,5 | F4 |
| §3 Perfil editable | P | solo lectura; choca con «aprobada, sin edición» | declarar | 0 | F5 |
| §3 Hooks: `useMemo`, `useCallback` | HV | ya cumplido | obligatorio | 0 | F3 |
| §3 Hook `useEarnings` | F | no existe (C12) | obligatorio | 1 | F3b |
| §3 FCM (notificaciones con app en segundo plano) | F | requiere build nativo y servidor; fuera de alcance | declarar | 0 | F5 |
| §4 Backend crea preferencia con llave secreta | F | solo `/health` | obligatorio | 4 | F4c |
| §4 Webhook / sincronización que actualiza `paymentStatus`, `paymentId`, `paid` | F | no existe | obligatorio | 3 | F4c |
| §4 App abre el checkout y escucha el cambio en tiempo real | F | no existe | obligatorio | 3 | F4d |
| §4 `.env.example` con nombres, `.env` fuera de Git | P | falta `backend/.env.example` y `backend/secrets/` en `.gitignore` | obligatorio | 0,5 | F4c |
| §4 Efectivo marcado por el conductor | P | marca a mano; falta regla estrecha y estado persistido | obligatorio | 1 | F4 |
| §4 Saldo: ganancias pasarela menos comisiones en efectivo (puede ser negativo) | P | existe en `earnings.js`; falta el texto «Saldo a favor de la plataforma» y pruebas | obligatorio | 1 | F4e |
| §5 Ganancias: 6 métricas hoy/semana/mes con `useMemo` | P | faltan propinas y promedio visibles y el hook `useEarnings` | obligatorio | 1,5 | F3b |
| §5 `commissionRate` por viaje | P | ver RF-23 | obligatorio | 0,5 | F3 |
| §5 Ejemplo 8,5 km / 22 min (19.200/3.840/15.360 y 26.900/5.380/21.520) | HV | T-39; se añaden pruebas puras al hook | obligatorio | 0,5 | F3b |
| §6 Historial: `FlatList`, más reciente primero | HV | T-48 | obligatorio | 0 | F3a |
| §6 Filtros Hoy/Semana/Mes/Rango | F | solo filtro por método | obligatorio | 3 | F3a |
| §6 Filtro por método de pago | P | existe parcialmente | obligatorio | 0,5 | F3a |
| §6 Paginación de 20 con «Cargar más» | P | límite sin carga adicional | obligatorio | 1 | F3a |
| §6 Elemento con fecha/hora, origen → destino, categoría, tarifa, neto, estado de pago | P | falta el Chip de estado de pago | obligatorio | 1 | F3a |
| §6 Detalle con ruta dibujada, duración, distancia, comisión, propina, calificación | P | sin ruta guardada (D-87) | obligatorio | 3 | F3c |
| §6 Mensaje vacío | HV | T-48 | obligatorio | 0 | F3a |
| §6 Gráfica de barras de ganancia neta (mejora propia) | F | no está en el enunciado, se pide en el lote | mejora | 2 | F3a |
| §7 Servicios gratuitos: FCM obligatorio | F | se documenta como omisión | declarar | 0 | F5 |
| §7 Geolocalización, Firestore tiempo real, Cloudinary | HV | `expo-location`, `onSnapshot`, Cloudinary | obligatorio | 0 | n/a |
| §7 Directions/Distance Matrix; `react-native-maps` | FA | OSRM y MapLibre (D-82) | declarar | 0 | F5 |
| §8 Bitácora con plantilla y marcas `// AI-assisted` | P | entrada #55 abierta | obligatorio | 0,5 | F6 |
| §9 Video de máximo 5 minutos | F | lo graba Anderson | obligatorio | 1,5 | humano |

Nota sobre la pasarela: el enunciado pide enviar `tripId` y monto al backend; el lote decide (F4) que el backend toma el monto del documento del viaje y no del cuerpo, que es más seguro y compatible con el espíritu de la regla de seguridad del §4.
