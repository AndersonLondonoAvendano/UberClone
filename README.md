# UberClone — Versión Conductor

App móvil del conductor (React Native + Expo, development build, iOS y Android) con backend Node/Express y Firestore. Taller "Taller: Uber - clone". Metodología Spec-Driven Development; ver [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md).

**Estado actual (2026-11-12, pendiente de validar en el celular):** inicio de sesión con correo y contraseña y cierre de sesión (ver [docs/arquitectura-sesiones.md](docs/arquitectura-sesiones.md)), registro con documentos, Inicio con mapa y solicitudes, viaje, cobro con tarjeta con Stripe o Mercado Pago (ambos en modo de prueba, ninguno validado en el celular), efectivo y saldo, Ganancias (6 métricas, propinas y saldo) e Historial con filtros, paginación y detalle de viaje con mapa de solo lectura (ruta simplificada guardada, propina y calificación de 1 a 5 estrellas). La propina y la calificación son **simuladas** (D-124) y las direcciones del pasajero se resuelven con Nominatim (D-125); ambos puntos están «Implementada, pendiente de dispositivo». Las auditorías de diseño (rondas 1 y 2) y las verificaciones funcionales son estáticas. **Nada de esto está «Validado»: falta la evidencia en el celular.**

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
- Los textos visibles están en `src/constants/labels.js` y los estilos salen de `src/theme/tokens.js`.

## Requisitos
- Node.js **≥ 20.12** y npm (el `package.json` lo declara en `engines`).
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
Hay un archivo por tema en [scripts/tests/](scripts/tests/) (tarifa, saldo, ganancias, historial, cobro, propina y calificación, geocodificación, etc.); se ejecutan igual con el cargador `registerSrcLoader.mjs`.

## Notificaciones push (FCM)
**Qué hace.** Con las notificaciones activadas, el backend envía por Firebase Cloud Messaging un aviso de solicitud de viaje al dispositivo del conductor; llega como notificación emergente con sonido aunque la app esté cerrada, y al tocarla se abre la solicitud con la cuenta de 15 s para decidir.

**Solo Android.** iOS queda fuera de alcance: FCM en iOS exige APNs y una cuenta de Apple Developer de pago, y no hay un equipo Apple para probarlo.

**Cómo obtener `google-services.json`.** En la consola de Firebase, agrega una app Android con el `package` de `app.json` (`expo.android.package`), descarga `google-services.json` y colócalo en la raíz del repositorio. Está en `.gitignore` y NO se sube. En el proyecto de Google Cloud confirma también que la API **Firebase Cloud Messaging API (V1)** esté habilitada. Después hay que recompilar la app (`expo prebuild` y `expo run:android`, a cargo de una persona).

**Endpoints del backend** (todos `POST`, con sesión; sin valores secretos en el repositorio): `/notifications/register`, `/notifications/unregister` y `/notifications/test-request`. Ejemplos con `curl` en «Probar los endpoints de notificaciones con curl» más abajo; seguridad en [docs/seguridad.md](docs/seguridad.md).

**Cómo probar.**
1. Con el backend y su túnel activos, abre la app con una cuenta aprobada y ve a Configuración → Notificaciones.
2. Activa el interruptor y concede el permiso de notificaciones.
3. Pulsa «Enviar solicitud de prueba» (retraso de 0 a 60 s).
4. Cierra la app por completo y espera el aviso.
5. Toca la notificación: se abre la solicitud con el temporizador de 15 s; si pasó su validez, dice «La solicitud expiró».

**Nota importante: dev client frente a release.** Con el development build (dev client), tocar la notificación con la app cerrada NO entrega la solicitud: el lanzador de desarrollo relanza la actividad sin los datos de la notificación (límite del modo desarrollo, no fallo del código). En la build **release** sí funciona. El APK release incrusta `EXPO_PUBLIC_BACKEND_URL` al compilarse (su valor no va en el repositorio), así que debe compilarse con el túnel vigente. Para probar o grabar el arranque en frío usa la build release. Con la app en primer plano o en segundo plano, tocar la notificación abre la solicitud a pantalla completa desde cualquier pantalla del menú (D-149); al rechazar o vencer vuelve a la pantalla donde estabas. **No verificado en dispositivo.**

**Límites.** La app no publica ubicación ni disponibilidad en segundo plano (el conductor decide al abrir la solicitud) y el disparo real de la solicitud está simulado: sale del endpoint de prueba, no de un pasajero real. Más en [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md).

### Probar los endpoints de notificaciones con curl
Con el backend en marcha y un conductor con `accountStatus = approved`. Los valores entre `<>` son placeholders: el ID token sale de la sesión de Firebase de la app y el token FCM, del dispositivo; no los pegues en chats ni en archivos del repositorio.
```bash
# Registrar el dispositivo (200 {"registered":true}; 400 si el token es inválido)
curl -X POST <BACKEND_URL>/notifications/register -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"token":"<FCM_TOKEN>","platform":"android"}'
# Solicitud de prueba a mis dispositivos, con retraso de 0 a 60 s (202 {"scheduled":true})
curl -X POST <BACKEND_URL>/notifications/test-request -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"delaySeconds":10}'
# Dar de baja el dispositivo (204 siempre que el token tenga forma válida)
curl -X POST <BACKEND_URL>/notifications/unregister -H "Authorization: Bearer <ID_TOKEN>" -H "Content-Type: application/json" -d '{"token":"<FCM_TOKEN>"}'
```
Errores genéricos: 401 sin sesión, 400 datos inválidos o cuenta no aprobada, 404 sin dispositivos registrados, 429 límite (5 por minuto, o ya hay un envío diferido pendiente), 502 si FCM falla en un envío inmediato, 500 si el backend no tiene mensajería. Detalles de seguridad en [docs/seguridad.md](docs/seguridad.md).

## Cómo probar los endpoints de notificaciones cuando el cliente (S3) esté listo
Con el backend en marcha y un conductor con . Todos los valores entre  son placeholders: el ID token sale de la sesión de Firebase de la app y el token FCM, del dispositivo; no los pegues en chats ni en archivos del repositorio.
\Errores genéricos: 401 sin sesión, 400 datos inválidos o cuenta no aprobada, 404 sin dispositivos registrados, 429 límite (5 por minuto, o ya hay un envío diferido pendiente), 502 si FCM falla en un envío inmediato, 500 si el backend no tiene mensajería. Detalles de seguridad en [docs/seguridad.md](docs/seguridad.md).

## Cobro: Stripe o Mercado Pago (modo de prueba) y efectivo
El backend admite **dos pasarelas de prueba** y la app ofrece un botón por cada una que esté configurada; si ninguna lo está, la app lo dice. Stripe usa Checkout Sessions con `STRIPE_SECRET_KEY` (solo clave de prueba) en `backend/.env`; sigue [docs/pagos-stripe-guia.md](docs/pagos-stripe-guia.md). Mercado Pago no pudo probarse (no se pudieron crear cuentas de prueba): está implementado y **No verificado en dispositivo**. Ninguna pasarela está validada en el celular, y el backend aún no se ha ejecutado por HTTP real (falta `npm install` en `backend/`). El efectivo no usa pasarela.

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
| Mercado Pago | Implementado, **No verificado en dispositivo** | No se pudieron crear cuentas de prueba |
| Notificaciones push (FCM) | Omitido | Requiere SDK nativo y credenciales; el pasajero es simulado |
| Idioma español/inglés | Se guarda la preferencia; interfaz solo en español | Alcance |
| Pagos divididos (split) | Omitido | Fuera del alcance de la entrega |
| Propina y calificación reales | Simuladas (D-124) | No existe app de pasajero |

## Omisiones y límites
Lo que la entrega no hace, o hace con otra herramienta, con su razón técnica e impacto: [docs/omisiones-y-limites.md](docs/omisiones-y-limites.md).

## Estructura del proyecto
- `src/screens/` — pantallas por flujo (`registration/`, `home/`, `main/`, `trip/`, `startup/`).
- `src/components/` — componentes compartidos (incluye elementos provisionales de desarrollo, ver [Herramientas de desarrollo](#herramientas-de-desarrollo-show_dev_tools) más abajo).
- `src/context/` — estado compartido (`AppStateContext`, `RegistrationFormContext`).
- `src/services/` — acceso a Firebase/Firestore y Cloudinary.
- `src/constants/labels.js` — todos los textos visibles (español).
- `src/hooks/`, `src/utils/`, `src/config/`, `src/theme/` — hooks (`useDriverLocation`, `useTripRequests`, `useEarnings`), funciones puras (`fare.js`, `earnings.js`), configuración y tokens de diseño.
- `backend/` — servidor Node/Express, independiente de la app.
- `scripts/` — `check-constitution.mjs` y pruebas en `scripts/tests/`.
- `specs/`, `docs/` — documentación SDD: specs, plan, backlog, decisiones, bitácora de IA, constitución.

## Herramientas de desarrollo (SHOW_DEV_TOOLS)
Algunas pantallas incluyen paneles provisionales solo para desarrollo: el selector «Estado de la pantalla» (fuerza contenido/cargando/vacío/error en una pantalla), el «Simulador de cuenta» (fuerza el estado de la cuenta del conductor) y «Simular solicitud» (dispara una solicitud de viaje de prueba). Los tres están controlados por un único interruptor, `SHOW_DEV_TOOLS`, en [`src/constants/devTools.js`](src/constants/devTools.js). El valor en este repositorio es `false`: ningún panel provisional se muestra en la entrega. Un desarrollador puede poner ese valor en `true` en su copia local mientras trabaja, pero debe devolverlo a `false` antes de hacer commit.

## Uso de IA
Todo el desarrollo siguió una metodología Spec-Driven Development asistida por Claude Code, con 5 agentes especializados (spec-author, planner, implementer, verifier, design-auditor) y reglas fijas en [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md) (una tarea a la vez, implementador y verificador siempre distintos, nunca secretos en un prompt, nunca commits automáticos). La bitácora completa, con cada prompt dado a Claude Code, su verificación y el aprendizaje registrado por Anderson, está en [docs/AI_LOG.md](docs/AI_LOG.md) (el PDF de la bitácora lo exporta el humano al entregar). El código con aportes de IA está marcado en el propio archivo con comentarios `// AI-assisted: see docs/AI_LOG.md #N`, trazables a la entrada exacta de la bitácora.

## Integrantes
Anderson Londoño Avendaño (equipo de una persona).

## Créditos
Taller "Taller: Uber - clone". Construido con Expo, React Native, Firebase/Firestore, Cloudinary y Node/Express.
