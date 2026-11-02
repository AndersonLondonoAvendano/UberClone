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

Nota: RNF-06 completo (FCM, Firestore, geolocalización) queda repartido entre 002 y 003; RNF-01 y RNF-13 se cubren con T-01.
