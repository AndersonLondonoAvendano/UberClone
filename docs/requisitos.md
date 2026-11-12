# Requisitos — UberClone Conductor

Estado: Borrador, pendiente de aprobación de Anderson (F0-3). Lista contrastada solo con el análisis previo: `[F1 vía análisis previo]` (el MCP de NotebookLM no estuvo disponible).

## Fuentes
| Código | Fuente |
|---|---|
| `[F1]` | PDF "UberClone — Versión Conductor.pdf" (notebook NotebookLM 80b37884-b201-480b-9077-398e8fc7ebc1, fuente b49e216e-0ed1-493d-9fe2-e11241c35ecd); se cita por sección §1…§9 |
| `[ENCARGO]` | Instrucciones del equipo, 2026-10-26 |
| `[MAESTRO]` | La metodología SDD |

## Requisitos funcionales (RF)
| ID | Texto | Fuente |
|---|---|---|
| RF-01 | Registro en 3 pestañas con navegación Tab: Datos personales, Vehículo, Documentos | F1 §2 |
| RF-02 | "Enviar registro" solo se habilita con las 3 pestañas completas y válidas | F1 §2 |
| RF-03 | Ningún campo nulo o vacío; errores bajo cada campo, nunca en `Alert` | F1 §2 |
| RF-04 | Al enviar, cuenta "Pendiente de aprobación"; no puede ponerse Disponible hasta "Aprobado" (simulable cambiando el campo en la base de datos) | F1 §2 |
| RF-05 | Datos personales: foto de perfil obligatoria (cámara/galería); nombre ≤50, solo letras y espacios; documento 6–10 dígitos; celular 10 dígitos; fecha de nacimiento con selector y mayor de 18; género desplegable; correo con `@` y dominio; idioma ES/EN | F1 §2 |
| RF-06 | Vehículo: categoría Económico/XL/Premium; placa `ABC123` en mayúsculas antes de validar; marca y modelo ≤30 cada uno; año 4 dígitos y ≤ año actual; color desplegable; capacidad numérica (XL mínimo 6); foto con placa visible | F1 §2 |
| RF-07 | Documentos y pagos: licencia (número, foto, vencimiento posterior a hoy); SOAT (foto, vencimiento posterior a hoy); revisión técnico-mecánica (foto y vencimiento "si aplica según el año del vehículo"); correo de Mercado Pago; checkbox de términos con la comisión visible | F1 §2 |
| RF-08 | Inicio: mapa con ubicación actual e interruptor Disponible/No disponible | F1 §3 |
| RF-09 | Disponible: la ubicación se escribe en la base de datos cada pocos segundos; al pasar a No disponible o salir de la pantalla, el seguimiento se detiene con la limpieza de `useEffect` | F1 §3 |
| RF-10 | Solicitud entrante: origen, destino, distancia, duración, categoría, método de pago, tarifa estimada y ganancia neta estimada | F1 §3 |
| RF-11 | Temporizador de 15 s; en 0 se rechaza automáticamente | F1 §3 |
| RF-12 | Viaje en curso: ruta a la recogida; "Pasajero a bordo" cambia la ruta al destino; botón para finalizar; Google Directions API | F1 §1, §3 |
| RF-13 | Estados del viaje en `status`: requested, accepted, driver_arriving, in_progress, completed, paid, cancelled. Rechazo o vencimiento pasa al siguiente conductor o queda `rejected` | F1 §3 |
| RF-14 | Cobro y resumen: tarifa final, comisión, ganancia neta y estado del pago (Aprobado, Pendiente, Rechazado, Efectivo) | F1 §3 |
| RF-15 | Pasarela: Mercado Pago Checkout Pro (recomendado) o Stripe solo en modo prueba, o efectivo | F1 §1, §4 |
| RF-16 | Flujo de pago: la app calcula la tarifa; envía `tripId` y monto al backend; el backend crea preferencia o PaymentIntent con la llave secreta; la app abre el checkout; la pasarela notifica (retorno o webhook); el backend actualiza `paymentStatus`, `paymentId` y `status: paid`; la app del conductor lo escucha en tiempo real | F1 §4 |
| RF-17 | Efectivo: el conductor marca el cobro; la comisión se descuenta de su saldo, que puede quedar negativo | F1 §4 |
| RF-18 | La liquidación al conductor se simula con un saldo en la app | F1 §4 |
| RF-19 | (Opcional, bonificación) Pago dividido real entre plataforma y conductor | F1 §4 |
| RF-20 | Una sola función pura `calculateFare({distanceKm, durationMin, category, tip})` que devuelve `{fare, commission, driverEarnings}`, usada en la estimación y en el cierre del viaje | F1 §5 |
| RF-21 | Parámetros en `src/config/pricing.js`, en COP enteros: base 3.500, km 1.200, minuto 250, mínima 6.000, multiplicadores 1,0/1,4/1,8, comisión 20 %; las propinas van completas al conductor | F1 §5 |
| RF-22 | La tarifa se redondea al múltiplo de 100 COP más cercano antes de calcular la comisión. Ejemplo (8,5 km, 22 min, sin propina): Económico 19.200 / 3.840 / 15.360; XL 26.900 / 5.380 / 21.520 (recalculado y verificado) | F1 §5 |
| RF-23 | Cada viaje guarda `commissionRate` | F1 §5, §6 |
| RF-24 | Pantalla Ganancias (hoy, semana, mes): viajes, total facturado, comisiones, propinas, ganancia neta y promedio, con `useMemo` | F1 §5 |
| RF-25 | Saldo del conductor = ganancias de viajes pagados por pasarela − comisiones de viajes en efectivo | F1 §5 |
| RF-26 | Historial con `FlatList`, de más reciente a más antiguo; filtros Hoy/Semana/Mes/Rango y por método de pago | F1 §6 |
| RF-27 | Cada ítem: fecha y hora, origen→destino, categoría, tarifa, ganancia neta, estado del pago; el detalle muestra ruta dibujada, duración, distancia, comisión, propina y calificación | F1 §6 |
| RF-28 | Mensaje vacío si no hay viajes; la consulta pagina o limita (ej. 20 por carga) | F1 §6 |
| RF-29 | Perfil y configuración: datos editables, vehículo, documentos, idioma y cierre de sesión | F1 §3 |
| RF-30 | Navegación combinada: Stack (viaje), Tabs (registro), Drawer (perfil, historial, ganancias, configuración) | F1 §1 |
| RF-31 | Solicitud entrante legible: «tu ganancia» y la tarifa visibles sin desplazar en ~360 x 640 dp con fuente al 100 % y 130 %; bloque de precio primero; Aceptar/Rechazar fijos fuera del scroll; con 200 % se permite desplazar sin perder la ganancia ni los botones; sin cambiar contenido, cuenta regresiva, testID ni comportamiento | ENCARGO (spec 002; extiende F1 §2 RF-10/11) |
| RF-32 | Marcador del conductor como auto genérico con el color del vehículo registrado (token por color; `otro`/desconocido = color de marca), glifo Ionicons en insignia blanca; decorativo; sin dependencias ni consultas nuevas | ENCARGO (spec 002) |
| RF-33 | Crear cuenta de conductor con correo y contraseña (Firebase Auth; mínimo 8 caracteres, confirmación, ayuda visible), seguida del registro de 3 pestañas y aprobación manual; sin verificación de correo (riesgo aceptado) | ENCARGO (spec 002); F1 §3 |
| RF-34 | Iniciar sesión con correo y contraseña; error genérico «Correo o contraseña incorrectos» y mensajes específicos solo para red caída, demasiados intentos y correo ya en uso al crear; mapeo en función pura | ENCARGO (spec 002); F1 §3 |
| RF-35 | Recuperar contraseña con `sendPasswordResetEmail` y mensaje neutro que no revela si el correo existe | ENCARGO (spec 002) |
| RF-36 | Puerta de autenticación en el navegador raíz: carga, pila de autenticación sin usuario, lógica de cuenta existente con usuario; las sesiones anónimas heredadas se cierran sin migrar | ENCARGO (spec 002) |
| RF-37 | Cerrar sesión y Cambiar de cuenta en Configuración (correo enmascarado, confirmación en pantalla) mediante un único `resetSession` de 6 pasos; varias cuentas por teléfono, una activa a la vez | ENCARGO (spec 002); F1 §3 (RF-29) |
| RF-38 | Retirar o adaptar los paneles y código dependientes de cuentas anónimas; con `SHOW_DEV_TOOLS` en `false` no se ve nada de ellos | ENCARGO (spec 002) |
| RF-39 | Inicio con mapa a pantalla completa y tarjeta flotante superior (interruptor Disponible/No disponible, estado en texto, Chip, pista); posición local sin publicar mientras Inicio está enfocado, publicación en `driverLocations` solo con Disponible, limpieza al perder foco, estado claro sin permiso | ENCARGO (spec 002, prompt #55) |
| RF-40 | Fechas desconocidas o inválidas nunca producen «NaN:NaN»: guarda en la utilidad de formato (causa raíz), texto neutro en `labels.js`, sin ocultar, con pruebas puras | ENCARGO (spec 002, prompt #55) |
| RF-41 | Pestaña «Documentos y pagos»: licencia (número, foto, vencimiento > hoy), SOAT (foto, vencimiento > hoy), revisión técnico-mecánica (foto y vencimiento; obligatoria si el vehículo tiene 5 años o más, si no se muestra el motivo); errores bajo cada campo, Enviar solo con 3 pestañas válidas, guardado estructurado sin números de cuenta ni tarjeta | ENCARGO (spec 002, prompt #55) |
| RF-42 | Modelo de `trips` con método de pago, estado de pago y escritores definidos; reglas de `drivers` y `trips` como texto en `docs/seguridad.md` | ENCARGO (spec 002, prompt #55); F1 §6 |
| RF-43 | Backend de pagos con Mercado Pago Checkout Pro: `/health`, `/payments/checkout`, `/payments/sync`, `/webhooks/mercadopago`; monto tomado del documento del viaje, webhook idempotente verificado contra la API | ENCARGO (spec 002, prompt #55); F1 §4 |
| RF-44 | Pantalla «Cobro y resumen» con estado en Chip y texto, `onSnapshot`, «Verificar pago», «Reintentar pago», «Confirmar efectivo recibido» y estados de carga, error, sin conexión y backend caído | ENCARGO (spec 002, prompt #55) |
| RF-45 | El método de pago se ve en la tarjeta de solicitud y en la solicitud a pantalla completa | ENCARGO (spec 002, prompt #55) |
| RF-46 | Saldo puro y probado, puede ser negativo («Saldo a favor de la plataforma»), visible en Ganancias | ENCARGO (spec 002, prompt #55) |
| RF-47 | Historial con filtros Hoy/Semana/Mes/Rango (hora Colombia, semana lunes a domingo), filtro por método en cliente, consulta solo por `createdAt`, FlatList, 20 por página con «Cargar más» | ENCARGO (spec 002, prompt #55); F1 §6 |
| RF-48 | Gráfico de barras dibujado con `View` en el Historial | ENCARGO (spec 002, prompt #55) |
| RF-49 | Detalle del viaje con ruta planificada de máximo 40 puntos a 4 decimales | ENCARGO (spec 002, prompt #55) |
| RF-50 | `useEarnings` con 6 métricas más saldo, pruebas puras con el ejemplo del encargo (8,5 km, 22 min) y límites de semana y mes en UTC−5 | ENCARGO (spec 002, prompt #55) |
| RF-51 | `docs/omisiones-y-limites.md` enlazado desde el README | ENCARGO (spec 002, prompt #55) |
| RF-52 | Ruta planificada simplificada y guardada en el viaje (≤40 puntos, 4 decimales) | ENCARGO (spec 002, prompt #55) |
| RF-53 | Mapa de Inicio: centra una vez con zoom de barrio, no recentra solo, botón «Mi ubicación», encuadre de Colombia sin ubicación (Propuesta) | ENCARGO (spec 002, prompt #57, G1-H1) |
| RF-54 | Viajes sin campos de pago: chip «Cobro simulado»; incluidos en métricas, excluidos del saldo (Propuesta) | ENCARGO (spec 002, prompt #57, G1-H2) |
| RF-55 | Pista de la tarjeta del saldo a varias líneas, sin corte a 200 % (Propuesta) | ENCARGO (spec 002, prompt #57, G1-H3) |
| RF-56 | Panel de cobro con una regla de render y prioridad de mensajes; efectivo sin backend (Propuesta) | ENCARGO (spec 002, prompt #57, G1-H4) |
| RF-57 | Clasificación de errores del cliente de pagos con mensajes seguros (Propuesta) | ENCARGO (spec 002, prompt #57, G2a) |
| RF-58 | `npm run doctor` del backend, sin imprimir secretos (Propuesta) | ENCARGO (spec 002, prompt #57, G2b) |
| RF-59 | `docs/pagos-guia-rapida.md` (Propuesta) | ENCARGO (spec 002, prompt #57, G2c) |
| RF-60 | `docs/checklist-manana-jueves.md` y `docs/guion-video.md` (≤5 min) (Propuesta) | ENCARGO (spec 002, prompt #57, G4) |
| RF-61 | Stripe Checkout como segunda pasarela de prueba en el backend, con Mercado Pago intacto; `GET /payments/providers` y proveedores intercambiables (Propuesta; D-116 a D-120) | ENCARGO (spec 002, adición R12, Mercado Pago sin cuentas de prueba) |
| RF-62 | La app ofrece un botón de cobro por cada pasarela configurada, verifica con el proveedor del viaje y trata `stripe` como tarjeta en Historial, detalle y saldo (Propuesta) | ENCARGO (spec 002, adición R12) |
| RNF-20 | Solo credenciales de prueba (se rechazan claves live), webhook con firma verificada, mismas defensas que Mercado Pago, sin dependencias nuevas y sin secretos en salida ni registros (Propuesta) | ENCARGO (spec 002, adición R12) |

## Requisitos no funcionales (RNF)
| ID | Texto | Fuente |
|---|---|---|
| RNF-01 | React Native + Expo, iOS y Android | F1 §1 |
| RNF-02 | Hooks obligatorios: `useState`, `useEffect` con limpieza, `useContext` o Redux, `useMemo`, `useCallback` | F1 §3 |
| RNF-03 | Hooks propios mínimos: `useDriverLocation`, `useTripRequests`, `useEarnings` | F1 §3 |
| RNF-04 | `AsyncStorage` solo para preferencias y sesión; nunca datos sensibles ni cuentas bancarias o tarjetas | F1 §2, §3 |
| RNF-05 | `access_token` de Mercado Pago o secret key de Stripe solo en el backend, en `.env` fuera de Git; `.env.example` sin valores; solo credenciales de prueba | F1 §4 |
| RNF-06 | Servicios obligatorios: FCM (`@react-native-firebase/messaging`), Firestore `onSnapshot` o Mongo Change Streams, geolocalización (`@react-native-community/geolocation`, `watchPosition`); `react-native-maps` incluida | F1 §7 |
| RNF-07 | Cloudinary recomendada para imágenes; Nominatim y OSRM/OpenRouteService opcionales | F1 §7 |
| RNF-08 | Distance Matrix una vez al crear la solicitud y una al aceptarla; restringir la API key de Google y activar alertas de presupuesto | F1 §7 |
| RNF-09 | Modelo de datos `trips` (campos de F1 §6) | F1 §6 |
| RNF-10 | Ruta del historial con `Polyline` de `react-native-maps`; sin Static Maps | F1 §7 |
| RNF-11 | Backend Node.js/Express | ENCARGO (F1 §4 lo admite) |
| RNF-12 | Development build; sin Expo Go | ENCARGO |
| RNF-13 | Verificación en celular físico desde la primera pantalla | ENCARGO |
| RNF-14 | Accesibilidad pendiente: valor elegido anunciado en SelectField/DateField; pestañas de registro sin truncar a 200 %; acción principal de viaje activo fija; cuenta regresiva solo en 10, 5 y 0 s en `polite`; fondo activo del drawer al presionar; limpieza de comentarios y claves huérfanas | ENCARGO (spec 002); F1 §2 |
| RNF-15 | Credenciales: nunca en logs ni en almacenamiento propio, campos limpiados al salir, contraseña oculta con botón accesible, autocompletado y teclado de correo, sin doble envío | ENCARGO (spec 002); F1 §2, §3 (RNF-04) |
| RNF-16 | Reglas de Firestore de `drivers`, `driverLocations` y `trips` exigen sesión con proveedor `password`; texto solo en `docs/seguridad.md`, Anderson las publica tras validar la app | ENCARGO (spec 002) |
| RNF-17 | Pantallas de autenticación y confirmación de sesión con el sistema de diseño: etiquetas, errores con ícono y texto en región viva `polite`, foco en el primer error, 44 x 44, 200 % sin recorte, teclado sin tapar, sin `Alert`; README y arquitectura actualizados | ENCARGO (spec 002); F1 §8 |
| RNF-18 | Backend de pagos: secretos solo en `backend/.env` y `backend/secrets/` (fuera de Git), `.env.example` solo con nombres, `fetch` nativo, solo `firebase-admin` como dependencia nueva, límite por usuario, cuerpo limitado, sin registrar tokens ni cabeceras, errores genéricos, CORS cerrado | ENCARGO (spec 002, prompt #55); F1 §4 |
| RNF-19 | Todo lo nuevo usa el sistema de diseño (tokens, Card, Chip, DataRow, ScreenHeader, Icon, SkeletonBlock, Inter), sin valores fijos, sin `Alert`, textos en `labels.js` | ENCARGO (spec 002, prompt #55) |

## Entrega (ENT)
| ID | Texto | Fuente |
|---|---|---|
| ENT-01 | Repositorio con ramas por integrante, Pull Requests revisados y merge a `main` | F1 §9 |
| ENT-02 | `README.md` con instalación, `.env.example` y sección "Uso de IA" enlazada a la bitácora | F1 §8, §9 |
| ENT-03 | `docs/AI_LOG.md` en `main` y su versión en PDF; se entrega aunque no se haya usado IA | F1 §8, §9 |
| ENT-04 | Entradas de bitácora con la plantilla de F1 §8; bloques asistidos marcados `// AI-assisted: see docs/AI_LOG.md #N` | F1 §8 |
| ENT-05 | Nunca pegar llaves de API, `access_token` ni datos personales reales en un prompt | F1 §8 |
| ENT-06 | Video de máximo 5 min: registro, solicitud, viaje, pago de prueba e historial | F1 §9 |
| ENT-07 | En la sustentación se debe poder explicar cualquier bloque asistido por IA | F1 §8 |
| ENT-08 | Documentación en español | ENCARGO |

## No encontrado
- Fecha límite y tamaño de equipo en F1.
- Rúbrica y pesos (F1 §9 la anuncia y no la trae).
- Versiones de Expo / React Native / Node en F1 (el scaffold actual trae expo ~57.0.31 y react-native 0.86.3; se fijan en T-01 con docs vigentes).
- Lista de librerías prohibidas por nombre.
- Formato de la sustentación.

## Matriz de trazabilidad (la columna Tareas la llena el planner en la Fase 2)
| Spec propuesta | Requisitos | Tareas |
|---|---|---|
| 000-fundacion | RNF-01, RNF-02, RNF-11, RNF-12, RNF-13, RF-30 | T-01 (RNF-01, 12, 13), T-02, T-05, T-06, T-08, T-09, T-10, T-12, T-13, T-14 (RF-30), T-03 (RNF-11), T-04 (RNF-02), T-07 (RF-30, RNF-02), T-11 (RNF-01, 13, RF-30) |
| 001-registro-conductor | RF-01 a RF-07, RNF-04, RNF-07 | T-15 (dependencias y build, RF-05/06), T-16 (Firebase/auth anónima, D-52/53), T-17 (repositorio del conductor, D-52/57/60), T-18 (estado real de cuenta, D-57/60, RNF-02), T-19 (Cloudinary, RNF-07), T-20 (validadores y opciones, RF-05/06/07), T-21 (campos texto/error/desplegable/casilla, RF-05/06/07), T-22 (fecha y foto, RF-05/06, RNF-07), T-23 (contexto del formulario y envío, RF-02/03/04), T-24 (Pestaña 1, RF-05), T-25 (Pestaña 2, RF-06), T-26 (Pestaña 3 y envío, RF-02/03/04/07), T-27 (reglas de seguridad de Firestore, D-52), T-28 (prueba integral en el celular), T-29 (auditoría de diseño) |
| 002-disponibilidad-ubicacion | RF-08, RF-09, RNF-03 (`useDriverLocation`), RNF-06 (geolocalización) | — |
| 003-solicitudes-viaje | RF-10 a RF-13, RNF-03 (`useTripRequests`), RNF-06 (FCM y tiempo real), RNF-08 | — |
| 004-tarifa-comision | RF-20 a RF-23, RNF-09 | — |
| 005-cobro-pagos | RF-14 a RF-19, RNF-05 | — |
| 006-ganancias | RF-24, RF-25, RNF-03 (`useEarnings`) | — |
| 007-historial | RF-26 a RF-28, RNF-10 | — |
| 008-perfil-config | RF-29 | — |
| 009-entrega | ENT-01 a ENT-08 | — |
| 002-funcionalidad-final (Borrador; el número 002 convive con 002-disponibilidad-ubicacion, a decidir por Anderson) | RF-31 a RF-52, RNF-14 a RNF-19 (extiende RF-29, RNF-04) | RF-31: T-55, T-56, T-75; RNF-14: T-57, T-58, T-59, T-60, T-75; RF-32: T-61, T-62, T-75; RF-33: T-63, T-64, T-66, T-67, T-76; RF-34: T-63, T-64, T-66, T-76; RF-35: T-63, T-64, T-68; RF-36: T-64, T-69; RF-37: T-64, T-65, T-70, T-71; RF-38: T-72; RNF-15: T-63, T-64, T-66, T-67, T-68; RNF-16: T-73; RNF-17: T-66, T-67, T-68, T-71, T-74, T-75, T-76; RNF-04 (extensión): T-65, T-70. Lote final R5 a R10 (prompt #55): RF-39: T-79, T-80, T-112; RF-40: T-77, T-78, T-112; RF-41: T-81, T-82, T-83, T-84, T-112; RF-42: T-90, T-91, T-93, T-95, T-97; RF-43: T-85, T-86, T-87, T-88, T-89, T-90; RF-44: T-94, T-95, T-96, T-97, T-113; RF-45: T-98, T-113; RF-46: T-99, T-100, T-108, T-114; RF-47: T-101, T-102, T-105, T-106, T-114; RF-48: T-103, T-104, T-106, T-114; RF-49: T-109, T-110, T-114; RF-50: T-107, T-108, T-114; RF-51: T-111; RF-52: T-91, T-92, T-93; RNF-18: T-85 a T-90, T-95, T-115; RNF-19: T-80, T-83, T-96, T-100, T-104 a T-106, T-108, T-110, T-112 a T-114; RF-38 (cierre): T-115; trazabilidad: T-116, T-117. Lote de cierre nocturno R11 (ENCARGO prompt #57; R11 Propuesta): RF-53: T-120, T-121, T-130; RF-54: T-122, T-123, T-109, T-110; RF-55: T-124, T-130; RF-56: T-118, T-119, T-126, T-130; RF-57: T-125, T-126; RF-58: T-127, T-128; RF-59: T-129; RF-60: T-131, T-132, T-133; RNF-17 (R11): T-133; RNF-18 (R11): T-127, T-128; RNF-19 (R11): T-118, T-119, T-121, T-123, T-124, T-126, T-130. Adición R12 Stripe (Propuesta): RF-61, RF-62, RNF-20 (tareas T-134 a T-156: RF-61 en T-135 a T-143, T-151, T-152, T-154; RF-62 en T-134, T-144 a T-150, T-153, T-154; RNF-20 en T-136 a T-138, T-141, T-143, T-152, T-154, T-155; RNF-19 en T-134, T-147, T-155, T-156) |

Nota: RNF-06 completo (FCM, Firestore, geolocalización) queda repartido entre 002 y 003; RNF-01 y RNF-13 se cubren con T-01.
