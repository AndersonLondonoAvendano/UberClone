# UberClone — Versión Conductor

App móvil del conductor (React Native + Expo, development build, iOS y Android) con backend Node/Express y Firestore. Taller "Taller: Uber - clone". Metodología Spec-Driven Development; ver [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md).

**Estado actual (2026-11-16):** inicio de sesión con correo y contraseña, registro con documentos, Inicio con mapa y solicitudes (también por notificación FCM en Android), viaje con estados, cobro con tarjeta con Stripe (verificada de punta a punta en modo de prueba) o efectivo, saldo, Ganancias, Historial con detalle de viaje e idioma español/inglés. Mercado Pago está implementado, pero **no verificado con usuarios de prueba**; ver [docs/pagos-evidencia.md](docs/pagos-evidencia.md). La propina y la calificación son **simuladas** (D-124) y las direcciones del pasajero se resuelven con Nominatim (D-125). Lo validado en el celular por Anderson consta en [docs/progress.md](docs/progress.md); lo que no, figura como «No verificado en dispositivo» o «Pendiente de dispositivo». Checklist de cierre: [docs/checklist-entrega-final.md](docs/checklist-entrega-final.md).

Documentos para la entrega:
- [docs/pagos-stripe-guia.md](docs/pagos-stripe-guia.md): guía paso a paso del cobro con Stripe en modo de prueba (cuenta, clave, tarjetas de prueba, verificación y tabla de fallos).
- [docs/pagos-guia-rapida.md](docs/pagos-guia-rapida.md): guía rápida de pagos (elección de pasarela, red, Mercado Pago de prueba, efectivo y saldo).
- [docs/checklist-manana-jueves.md](docs/checklist-manana-jueves.md): lista de pasos y pruebas en el celular, en orden.
- [docs/guion-video.md](docs/guion-video.md): guion del video de máximo 5 minutos.
- [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md): cobertura del enunciado, omisiones y límites.
- Detalle de tareas y criterios: [docs/progress.md](docs/progress.md) y [docs/backlog.md](docs/backlog.md); pruebas de sesión en [docs/checklist-dispositivo-sesiones.md](docs/checklist-dispositivo-sesiones.md).

## Stack y arquitectura
- **App:** React Native + Expo (~57, JavaScript, development build con `expo-dev-client`), mapa con MapLibre y teselas de OpenFreeMap, rutas con OSRM (sin claves), ubicación con `expo-location`.
- **Datos:** Firebase Auth (correo y contraseña) y Firestore en tiempo real (`drivers/{uid}` y `drivers/{uid}/trips/{tripId}`); fotos en Cloudinary con carga sin firma.
- **Backend (`backend/`):** Node/Express con el SDK admin de Firebase. Crea el cobro (Stripe Checkout Sessions o Mercado Pago Checkout Pro), recibe webhooks y es el único que marca un viaje como `paid`. El monto del cobro sale del viaje guardado en Firestore (tarifa + propina), nunca del cuerpo de la petición.
- **Pasajero simulado:** una API simulada genera las solicitudes (`src/services/passengerApi/`); `mappers.js` es el único archivo que conoce su forma.
- **Direcciones:** geocodificación inversa con Nominatim (`src/services/geocoding/`).
- Los textos visibles están en el módulo de idioma `src/i18n/` (diccionarios `es` y `en`, accesibles con `labels`) y los estilos salen de `src/theme/tokens.js`.

## Requisitos
- Node.js **≥ 21.3** y npm para la app y las pruebas (`engines` del `package.json` de la raíz); el backend (`backend/package.json`) pide **≥ 20.12**.
- Una cuenta de Firebase (Firestore) y una de Cloudinary, cada una con sus credenciales propias.
- Para compilar el development build: Android Studio (Android) o Xcode en macOS (iOS). Los builds nativos (`expo run:*`, `prebuild`, `eas`) los hace una persona, no un agente de IA.
- Un dispositivo o emulador — este proyecto no usa Expo Go; requiere development build (`expo-dev-client`).

## Instalación en Windows (PowerShell)
```powershell
git clone <url-del-repositorio>
cd UberClone
npm install
cd backend
npm install
cd ..
```
Luego crea los archivos de entorno a partir de las plantillas (solo traen nombres):
```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```
y completa los valores reales a mano (nunca se versionan ni se pegan en un prompt de IA — ver "Uso de IA" abajo).

## Variables de entorno
Solo se referencian por nombre; los valores reales van en `.env` (raíz, fuera de Git) y nunca se leen ni se escriben desde un agente de IA. El archivo [`.env.example`](.env.example) en la raíz trae los nombres sin valores:
- `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` — configuración del SDK de Firebase para JavaScript (el SDK de JavaScript no usa archivos; solo las notificaciones push usan `google-services.json`, ver «Notificaciones push (FCM)»).
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — subida de fotos (perfil, vehículo, documentos).
- `EXPO_PUBLIC_BACKEND_URL` — URL pública del backend (sin secreto); ver el túnel en «Cómo correr la app».

En `backend/.env` (plantilla `backend/.env.example`) van solo los secretos del servidor, por nombre: `MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `PUBLIC_BASE_URL`, `PORT`, `MP_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`, `STRIPE_COP_PER_USD`.

El mapa (MapLibre con teselas de OpenFreeMap) y las rutas (OSRM) no necesitan clave ni variable de entorno; sus URL públicas están en `src/config/map.js` y `src/config/routing.js` (D-82). Al usar el mapa, la app muestra la atribución de OpenFreeMap, OpenMapTiles, OpenStreetMap y OSRM. La URL de la API del pasajero (`EXPO_PUBLIC_PASSENGER_API_URL`) se añadirá cuando se conozca la API.

## Reglas de seguridad de Firestore
Las reglas efectivas se publican a mano en la consola de Firebase (Firestore → Reglas). El archivo `firestore.rules` de la raíz es una copia local de trabajo que Git ignora, así que no viene al clonar. La política vigente está descrita en [docs/seguridad.md](docs/seguridad.md) (D-80).

El backend (`backend/`) expone `GET /health`, `POST /payments/checkout`, `POST /payments/sync`, `GET /payments/providers`, `GET /payments/return`, `POST /webhooks/mercadopago` y `POST /webhooks/stripe` (opcional). Sus secretos viven únicamente en `backend/.env` (ignorado por Git); copia `backend/.env.example` (solo nombres, sin valores) a `backend/.env` y complétalo a mano. La app lleva solo `EXPO_PUBLIC_BACKEND_URL`, una URL pública sin secreto. Diseño y prueba manual en [docs/pagos.md](docs/pagos.md).

## Sesión con correo y contraseña
Habilita el proveedor **Correo/contraseña** en la consola de Firebase (Authentication → Método de acceso) antes de probar. Una cuenta activa a la vez por teléfono (D-94) y sin verificación de correo (D-95). Las reglas de Firestore se publican **después** de validar la app en el celular (D-99). Flujo, cierre de sesión y orden de publicación en [docs/arquitectura-sesiones.md](docs/arquitectura-sesiones.md).

## Cómo correr la app (development build) y el backend
En una terminal, backend:
```powershell
cd backend
npm run doctor
npm start
```
`npm run doctor` (se ejecuta dentro de `backend/`) revisa la configuración del backend (nombres de variables presentes, sin mostrar valores) antes de arrancar; corrige lo que reporte y luego usa `npm start`. Guía de pagos: [docs/pagos-guia-rapida.md](docs/pagos-guia-rapida.md).

Para que el celular y los webhooks lleguen al backend, abre un túnel HTTPS en otra terminal y pon su URL pública en `EXPO_PUBLIC_BACKEND_URL` (raíz) y `PUBLIC_BASE_URL` (`backend/.env`):
```powershell
cloudflared tunnel --url http://localhost:3001
```
(`cloudflared` no se instala con el repositorio; ajusta el puerto si cambiaste `PORT`.)

En otra terminal, la app (requiere un development build ya instalado en el dispositivo/emulador — `expo run:android` o `expo run:ios`, a cargo de una persona):
```powershell
npx expo start -c
```
`-c` limpia la caché de Metro y es lo recomendable cuando cambias variables `EXPO_PUBLIC_*`. `npm start` hace lo mismo sin limpiar (`expo start --dev-client`). Conecta el development build al servidor que aparece en la terminal.

## Cómo probar
1. **Cuenta:** regístrate con correo y contraseña y completa las tres pestañas. La cuenta queda pendiente; en la consola de Firestore cambia `accountStatus` a `approved` en `drivers/{uid}` (aprobación manual) y reabre la app.
2. **Tarjeta (Stripe, modo de prueba):** `4242 4242 4242 4242` (aprobada) y `4000 0000 0000 0002` (rechazada), con cualquier fecha futura y CVC. El cobro es tarifa + propina.
3. **Efectivo:** confirma «Efectivo recibido»; en Ganancias el saldo descuenta solo la comisión.
4. **Dos cuentas A y B:** cierra sesión y entra con la otra; no debe verse nada de la primera (Perfil, Ganancias, Historial).
5. **Pruebas automáticas** (Node plano, sin instalar nada más):
```powershell
npm test   # toda la suite (Windows y POSIX)
node --import ./scripts/tests/helpers/registerSrcLoader.mjs scripts/tests/fare.test.mjs   # un solo archivo
node scripts/check-constitution.mjs
```
Requiere Node 21.3 o superior (`engines` en `package.json`); el script `test` silencia solo los avisos DEP0205 y MODULE_TYPELESS_PACKAGE_JSON del cargador de pruebas.
Hay un archivo por tema en [scripts/tests/](scripts/tests/) (tarifa, saldo, ganancias, historial, cobro, propina y calificación, geocodificación, etc.); se ejecutan igual con el cargador `registerSrcLoader.mjs`.

## Notificaciones push (FCM)
**Qué hace.** Con las notificaciones activadas, el backend envía por Firebase Cloud Messaging un aviso de solicitud de viaje al dispositivo del conductor; llega como notificación emergente con sonido aunque la app esté cerrada, y al tocarla se abre la solicitud con la cuenta de 15 s para decidir.

**Solo Android.** iOS queda fuera de alcance: FCM en iOS exige APNs y una cuenta de Apple Developer de pago, y no hay un equipo Apple para probarlo.

**Cómo obtener `google-services.json`.** En la consola de Firebase, agrega una app Android con el `package` de `app.json` (`expo.android.package`), descarga `google-services.json` y colócalo en la raíz del repositorio. Está en `.gitignore` y NO se sube. En el proyecto de Google Cloud confirma también que la API **Firebase Cloud Messaging API (V1)** esté habilitada. Después hay que recompilar la app (`expo prebuild` y `expo run:android`, a cargo de una persona).

**Endpoints del backend** (todos `POST`, con sesión; sin valores secretos en el repositorio): `/notifications/register`, `/notifications/unregister` y `/notifications/test-request`. Ejemplos con `curl` en «Probar los endpoints de notificaciones con curl» más abajo; seguridad en [docs/seguridad.md](docs/seguridad.md).

**Cómo probar.**
1. Con el backend y su túnel activos, abre la app con una cuenta aprobada y ve a Configuración → Notificaciones.
2. Activa el interruptor y concede el permiso de notificaciones.
3. En Inicio, ponte «Disponible»: el backend genera solicitudes automáticas (la primera a los 8–15 s; ver «Solicitudes automáticas simuladas»). Configuración ya no tiene botón de solicitud de prueba (D-206).
4. Manda la app a segundo plano (o ciérrala por completo en la build release) y espera el aviso.
5. Toca la notificación: se abre la solicitud con el temporizador de 15 s; si pasó su validez, dice «La solicitud expiró».

**Bandeja y caducidad (D-205, D-202).** Cada aviso de solicitud usa la etiqueta y la clave de colapso `trip_request`: una solicitud nueva reemplaza a la anterior en la bandeja, sin apilarse. Límite: la notificación de una solicitud ya aceptada o vencida solo desaparece cuando llega la siguiente o al descartarla. La validez del aviso es de 90 s y la app aplica una tolerancia de reloj de 10 s antes de marcar «La solicitud expiró». **No verificado en dispositivo.**

**Endpoint de prueba sin interfaz (D-206).** `POST /notifications/test-request` se conserva intacto (con sesión, limitado, solo a tus propios dispositivos) como herramienta de pruebas con `curl`; la app ya no tiene pantalla para él.

**Nota importante: dev client frente a release.** Con el development build (dev client), tocar la notificación con la app cerrada NO entrega la solicitud: el lanzador de desarrollo relanza la actividad sin los datos de la notificación (límite del modo desarrollo, no fallo del código). En la build **release** sí funciona. El APK release incrusta `EXPO_PUBLIC_BACKEND_URL` al compilarse (su valor no va en el repositorio), así que debe compilarse con el túnel vigente. Para probar o grabar el arranque en frío usa la build release. **Validado en dispositivo por Anderson (2026-11-16):** en la build release, con la app cerrada, tocar la notificación abre la solicitud con la cuenta de 15 s y, vencido el plazo, «La solicitud expiró». **Validado en dispositivo por Anderson (STOP-4, 2026-11-16, dev client):** con la app en segundo plano en Configuración, Historial y Perfil, tocar la notificación abre la solicitud a pantalla completa (D-149) y, al rechazar o vencer, vuelve a la pantalla donde estabas. **Pendiente:** con la app CERRADA el toque solo se valida en la build release (en el dev client no entrega la solicitud).

**Límites.** La app no publica ubicación ni disponibilidad en segundo plano (el conductor decide al abrir la solicitud) y el disparo real de la solicitud está simulado: sale del endpoint de prueba, no de un pasajero real. Más en [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md).

### Solicitudes automáticas simuladas (spec 007)
<!-- AI-assisted: see docs/AI_LOG.md #70 -->
**Qué hace.** Con la app abierta y el conductor disponible, el backend genera solicitudes de viaje simuladas a intervalos aleatorios y las envía por FCM; el pago de cada solicitud alterna efectivo, tarjeta, efectivo… (la primera de la sesión es efectivo; D-207). La app avisa su disponibilidad con un latido: `POST /notifications/availability`, con sesión y cuerpo solo `{"available": true|false}` o, con orden, `{"available": true|false, "seq": N}` (`seq` es un entero creciente: el backend ignora un reporte con `seq` menor o igual al último aceptado, y un `false` fallido se reintenta hasta 3 veces; D-198). El latido no envía ubicación ni datos personales; el backend toma el usuario únicamente del ID token y no registra tokens, uid ni cuerpos. El estado vive en memoria: **cero escrituras a Firestore por reporte** (costo en escrituras: ninguno por reporte).

**Variables del backend (solo nombres; todas opcionales).** Se definen en `backend/.env` (plantilla en `backend/.env.example`); si falta una o es inválida, se usa su valor por defecto seguro, que está documentado en `backend/src/config.js`.
- `AUTO_REQUEST_FIRST_MIN_S` y `AUTO_REQUEST_FIRST_MAX_S`: rango en segundos de la espera hasta la primera solicitud (por defecto 8 a 15; máximo 3600; D-204).
- `AUTO_REQUEST_NEXT_MIN_S` y `AUTO_REQUEST_NEXT_MAX_S`: rango en segundos entre solicitudes siguientes (por defecto 35 a 60; máximo 3600; D-204). En cada par, el mínimo debe ser menor o igual que el máximo; si no, el par vuelve a sus valores por defecto.
- `AUTO_REQUEST_MAX_PER_SESSION`: tope de solicitudes por sesión de disponibilidad (por defecto 8; máximo 1000; D-204).
- `AUTO_REQUEST_HEARTBEAT_MAX_MIN`: minutos máximos sin latido antes de detener el generador (por defecto 30; máximo 1440).

**Fuente única.** Si el servidor confirmó el reporte, la app deja de generar solicitudes locales y solo llegan las del servidor; si el reporte falla, la app usa el simulador local como respaldo. Límite residual: si la respuesta se pierde o el teléfono no alcanza el backend con el generador activo, pueden llegar solicitudes de ambas fuentes hasta el `available: false` o hasta el vencimiento de 30 min sin latido; el control de duplicados por `requestId` no cubre dos fuentes distintas.

**Para usarlo.** Reinicia el backend para que lea las variables y el nuevo endpoint. El túnel y `EXPO_PUBLIC_BACKEND_URL` no cambian. Los temporizadores viven en la memoria del backend y se pierden al reiniciarlo: la app los recupera con el siguiente latido (hasta unos 5 min). Los tres límites (temporizadores en memoria, simulación y app cerrada solo en release) están en [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md).

### Probar los endpoints de notificaciones con curl
Con el backend en marcha y un conductor con `accountStatus = approved`. Los valores entre `<>` son placeholders: el ID token sale de la sesión de Firebase de la app y el token FCM, del dispositivo; no los pegues en chats ni en archivos del repositorio.
```bash
# Registrar el dispositivo (200 {"registered":true}; 400 si el token es inválido)
curl -X POST <BACKEND_URL>/notifications/register -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"token":"<FCM_TOKEN>","platform":"android"}'
# Solicitud simulada a mis dispositivos con retraso de 0 a 60 s (202 {"scheduled":true}); endpoint conservado sin interfaz (D-206)
curl -X POST <BACKEND_URL>/notifications/test-request -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"delaySeconds":10}'
# Dar de baja el dispositivo (204 siempre que el token tenga forma válida)
curl -X POST <BACKEND_URL>/notifications/unregister -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"token":"<FCM_TOKEN>"}'
```
Errores genéricos: 401 sin sesión, 400 datos inválidos o cuenta no aprobada, 404 sin dispositivos registrados, 429 límite (5 por minuto, o ya hay un envío diferido pendiente), 502 si FCM falla en un envío inmediato, 500 si el backend no tiene mensajería. Detalles de seguridad en [docs/seguridad.md](docs/seguridad.md).

## Build release local (APK) y URL del backend
Para probar la notificación con la app cerrada y para grabar el video se usa una build **release** de Android. Se compila en local (a cargo de una persona, no de un agente) con `npx expo run:android --variant release`, con `EXPO_PUBLIC_BACKEND_URL` ya apuntando a la URL vigente del túnel. **Esa URL se graba en el APK al compilar**: si el túnel cambia, hay que recompilar. El APK final se copia fuera del repositorio (no se versiona). Esta build requiere `google-services.json` (ver FCM).

## Idioma (español / inglés)
La interfaz está en español e inglés. Idioma inicial: el guardado por el usuario; si no hay, el sugerido por el registro; si no, el del teléfono (en o es); si no, español. El selector «Idioma / Language» está disponible sin sesión (bienvenida, inicio de sesión, registro de cuenta y pestañas del registro de conductor) y en Configuración. La preferencia se guarda **en el teléfono** (no en Firestore) y se conserva al cerrar sesión. No se traducen el texto de la notificación push (lo arma el backend en español), las direcciones de Nominatim, los nombres simulados de pasajeros ni Stripe Checkout. Las horas se muestran en la hora local del teléfono. Detalle: [specs/006-idioma/spec.md](specs/006-idioma/spec.md).

## Cobro: Stripe o Mercado Pago (modo de prueba) y efectivo
El backend admite **dos pasarelas de prueba** y la app ofrece un botón por cada una que esté configurada; si ninguna lo está, la app lo dice. Stripe usa Checkout Sessions con `STRIPE_SECRET_KEY` (solo clave de prueba) en `backend/.env`; sigue [docs/pagos-stripe-guia.md](docs/pagos-stripe-guia.md). Mercado Pago implementado, no verificado con usuarios de prueba (no se pudieron crear cuentas de prueba); Stripe es la pasarela verificada de punta a punta (validada en dispositivo por Anderson, ver [docs/pagos-evidencia.md](docs/pagos-evidencia.md)). El efectivo no usa pasarela.

El cobro con tarjeta con Mercado Pago usa **Checkout Pro en modo de prueba**: el backend crea la preferencia con el importe leído del viaje en Firestore y la app abre el enlace; el resultado llega por webhook o por `/payments/sync` al volver a la app. No se cobra dinero real. El pago en efectivo lo confirma el conductor con «Confirmar efectivo recibido». El viaje se guarda en Firestore (`drivers/{uid}/trips/{tripId}`, sin coordenadas, montos en COP enteros). Ganancias e Historial leen esos viajes y Ganancias muestra el saldo con la plataforma. Detalles, límites y prueba manual en [docs/pagos.md](docs/pagos.md). La regla de Firestore de `trips` está en [docs/seguridad.md](docs/seguridad.md) y la publica el humano en la consola.

## Propina, calificación y direcciones simuladas
- **Propina y calificación (D-124):** el pasajero es simulado, así que al terminar el viaje la app genera una propina (≈40 % de los viajes, múltiplos de 500 entre 500 y 5.000 COP) y una calificación de 1 a 5. La comisión se calcula solo sobre la tarifa; la ganancia del conductor es tarifa − comisión + propina. En tarjeta el cobro es tarifa + propina; en efectivo el conductor recibe ambas y el saldo descuenta solo la comisión. Los viajes antiguos muestran «Sin calificación».
- **Direcciones (D-125):** el origen y el destino se resuelven con Nominatim (OpenStreetMap), máximo 1 petición por segundo y con caché; si falla, la app muestra «Calle cercana (simulada)». **Privacidad:** las coordenadas de prueba salen hacia un servicio público; no se envían datos personales.

## Seguridad
- Las claves viven solo en `backend/.env`; la app no lleva secretos (solo variables `EXPO_PUBLIC_*` públicas). Ningún agente de IA lee ni escribe esos archivos.
- Las reglas de Firestore las publica el humano a mano (texto completo en [docs/seguridad.md](docs/seguridad.md)). Con propina y calificación la regla de `trips` cambió y hay que publicarla antes de probar en el celular.
- La subida de fotos a Cloudinary usa un preset **sin firma**: cualquiera que conozca el nombre del preset podría subir archivos a esa cuenta (límite conocido).
- El backend valida el token de Firebase, limita peticiones y toma el monto del viaje guardado.

## Cumplimiento del enunciado y desviaciones
Auditoría completa en [docs/auditoria-enunciado-2026-11-12.md](docs/auditoria-enunciado-2026-11-12.md).

| Enunciado | Lo entregado | Razón |
|---|---|---|
| Google Maps y Directions | MapLibre + OpenFreeMap + OSRM (sin claves) | D-82: sin tarjeta ni claves de Google |
| PaymentIntent + PaymentSheet | Stripe Checkout Sessions (página alojada) | Mismo cobro en modo de prueba sin SDK nativo de pago |
| Mercado Pago | Implementado, no verificado con usuarios de prueba; Stripe es la pasarela verificada de punta a punta | No se pudieron crear cuentas de prueba |
| Notificaciones push (FCM) | Implementado solo en Android; la solicitud la dispara un endpoint de prueba, no un pasajero real | iOS exige APNs y cuenta de Apple de pago; con el dev client el toque en frío no entrega la solicitud (ver «Notificaciones push») |
| Idioma español/inglés | Interfaz en español e inglés, con selector sin sesión y en Configuración | Límites: texto de la notificación push, direcciones de Nominatim y Stripe Checkout (ver [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md)) |
| Pagos divididos (split) | Omitido | Fuera del alcance de la entrega |
| Propina y calificación reales | Simuladas (D-124) | No existe app de pasajero |

## Omisiones y límites
Lo que la entrega no hace, o hace con otra herramienta, con su razón técnica e impacto: [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md).

## Estructura del proyecto
- `src/screens/` — pantallas por flujo (`registration/`, `home/`, `main/`, `trip/`, `startup/`).
- `src/components/` — componentes compartidos (incluye elementos provisionales de desarrollo, ver [Herramientas de desarrollo](#herramientas-de-desarrollo-show_dev_tools) más abajo).
- `src/context/` — estado compartido (`AppStateContext`, `RegistrationFormContext`).
- `src/services/` — acceso a Firebase/Firestore y Cloudinary.
- `src/i18n/` — módulo de idioma: diccionarios `es` y `en` y `labels`; `src/constants/labels.js` lo reexporta.
- `src/hooks/`, `src/utils/`, `src/config/`, `src/theme/` — hooks (`useDriverLocation`, `useTripRequests`, `useEarnings`), funciones puras (`fare.js`, `earnings.js`), configuración y tokens de diseño.
- `backend/` — servidor Node/Express, independiente de la app.
- `scripts/` — `check-constitution.mjs` y pruebas en `scripts/tests/`.
- `specs/`, `docs/` — documentación SDD: specs, plan, backlog, decisiones, bitácora de IA, constitución.

## Herramientas de desarrollo (SHOW_DEV_TOOLS)
Algunas pantallas incluyen paneles provisionales solo para desarrollo: el selector «Estado de la pantalla» (fuerza contenido/cargando/vacío/error en una pantalla), el «Simulador de cuenta» (fuerza el estado de la cuenta del conductor) y «Simular solicitud» (dispara una solicitud de viaje de prueba). Los tres están controlados por un único interruptor, `SHOW_DEV_TOOLS`, en [`src/constants/devTools.js`](src/constants/devTools.js). El valor en este repositorio es `false`: ningún panel provisional se muestra en la entrega. Un desarrollador puede poner ese valor en `true` en su copia local mientras trabaja, pero debe devolverlo a `false` antes de hacer commit.

## Uso de IA
Todo el desarrollo siguió una metodología Spec-Driven Development asistida por Claude Code, con 5 agentes especializados (spec-author, planner, implementer, verifier, design-auditor) y reglas fijas en [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md). Las reglas y la procedencia del código están en esos documentos; aquí se explican dos criterios.

**Qué se registra en la bitácora.** [docs/AI_LOG.md](docs/AI_LOG.md) guarda cada prompt dado a Claude Code con su objetivo, el resumen de la respuesta, la verificación y el aprendizaje. El trabajo sustancial (funcionalidades, correcciones de comportamiento, cambios de especificación) se registra; las funciones grandes se agrupan en una sola entrada. Las consultas triviales y los pulidos menores (un texto, un espacio) no se registran. Verificación y aprendizaje los completa Anderson; las entradas reconstruidas después se marcan «RECONSTRUIDA, no registrada en el momento». El código con aportes de IA lleva el comentario `// AI-assisted: see docs/AI_LOG.md #N`, trazable a su entrada. El PDF de la bitácora lo exporta el humano al entregar.

**Cómo se verifica.** Quien implementa nunca aprueba su propio trabajo: cada tarea la verifica un `verifier` distinto del `implementer`, y lo visual lo revisa un `design-auditor`. Ante un rechazo se registra el evento, se hace una sola ronda de corrección y se vuelve a verificar; si hay un segundo rechazo, el trabajo se detiene y se informa. Nada pasa a «Validada» sin la evidencia de Anderson en el celular. Se ejecutan `npm test` y `node scripts/check-constitution.mjs`. Auditoría de la bitácora: [docs/auditoria-bitacora-2026-11-16.md](docs/auditoria-bitacora-2026-11-16.md).

## Integrantes
Anderson Londoño Avendaño (equipo de una persona).

## Créditos
Taller "Taller: Uber - clone". Construido con Expo, React Native, Firebase/Firestore, Cloudinary y Node/Express.
