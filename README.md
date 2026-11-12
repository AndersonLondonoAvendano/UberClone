# UberClone — Versión Conductor

App móvil del conductor (React Native + Expo, development build, iOS y Android) con backend Node/Express y Firestore. Taller "Taller: Uber - clone". Metodología Spec-Driven Development; ver [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md).

**Estado actual de la entrega (parcial, 2026-11-05):** registro del conductor en 3 pestañas (datos personales, vehículo, documentos), envío a Firestore, estado de cuenta en vivo (pending/approved) y precarga de los datos ya guardados mientras la cuenta está pendiente. Las demás specs (disponibilidad y ubicación, solicitudes de viaje, tarifa, cobro y pagos, ganancias, historial, perfil) todavía no están implementadas. Detalle en [docs/progress.md](docs/progress.md) y [docs/backlog.md](docs/backlog.md).

## Requisitos
- Node.js y npm (ver `expo-doctor` para la versión exacta recomendada por el SDK de Expo instalado).
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
Luego copia `.env.example` a `.env` en la raíz y completa los valores reales (nunca se versionan ni se pegan en un prompt de IA — ver "Uso de IA" abajo).

## Variables de entorno
Solo se referencian por nombre; los valores reales van en `.env` (raíz, fuera de Git) y nunca se leen ni se escriben desde un agente de IA. El archivo [`.env.example`](.env.example) en la raíz trae los nombres sin valores:
- `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` — configuración del SDK de Firebase para JavaScript (no se usa `google-services.json` ni `GoogleService-Info.plist`: este proyecto no usa el SDK nativo de Firebase, solo variables de entorno).
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — subida de fotos (perfil, vehículo, documentos).

El mapa (MapLibre con teselas de OpenFreeMap) y las rutas (OSRM) no necesitan clave ni variable de entorno; sus URL públicas están en `src/config/map.js` y `src/config/routing.js` (D-82). Al usar el mapa, la app muestra la atribución de OpenFreeMap, OpenMapTiles, OpenStreetMap y OSRM. La URL de la API del pasajero (`EXPO_PUBLIC_PASSENGER_API_URL`) se añadirá cuando se conozca la API.

## Reglas de seguridad de Firestore
Las reglas efectivas se publican a mano en la consola de Firebase (Firestore → Reglas). El archivo `firestore.rules` de la raíz es una copia local de trabajo que Git ignora, así que no viene al clonar. La política vigente está descrita en [docs/seguridad.md](docs/seguridad.md) (D-80).

El backend (`backend/`) expone `GET /health`, `POST /payments/checkout`, `POST /payments/sync` y `POST /webhooks/mercadopago`. Sus secretos viven únicamente en `backend/.env` (ignorado por Git); copia `backend/.env.example` (solo nombres, sin valores) a `backend/.env` y complétalo a mano. La app lleva solo `EXPO_PUBLIC_BACKEND_URL`, una URL pública sin secreto. Diseño y prueba manual en [docs/pagos.md](docs/pagos.md).

## Cómo correr la app (development build) y el backend
En una terminal, backend:
```powershell
cd backend
npm start
```
En otra terminal, la app (requiere un development build ya instalado en el dispositivo/emulador — `expo run:android` o `expo run:ios`, a cargo de una persona):
```powershell
npm start
```
Esto abre Metro con `expo start --dev-client`. Conecta el development build al servidor que aparece en la terminal.

## Cobro: Mercado Pago Checkout Pro (modo de prueba) y efectivo
El cobro con tarjeta usa **Mercado Pago Checkout Pro en modo de prueba**: el backend crea la preferencia con el importe leído del viaje en Firestore y la app abre el enlace; el resultado llega por webhook o por `/payments/sync` al volver a la app. No se cobra dinero real. El pago en efectivo lo confirma el conductor con «Confirmar efectivo recibido». El viaje se guarda en Firestore (`drivers/{uid}/trips/{tripId}`, sin coordenadas, montos en COP enteros). Ganancias e Historial leen esos viajes y Ganancias muestra el saldo con la plataforma. Detalles, límites y prueba manual en [docs/pagos.md](docs/pagos.md). La regla de Firestore de `trips` está en [docs/seguridad.md](docs/seguridad.md) y la publica el humano en la consola.

## Estructura del proyecto
- `src/screens/` — pantallas por flujo (`registration/`, `home/`, `main/`, `trip/`, `startup/`).
- `src/components/` — componentes compartidos (incluye elementos provisionales de desarrollo, ver [Herramientas de desarrollo](#herramientas-de-desarrollo-show_dev_tools) más abajo).
- `src/context/` — estado compartido (`AppStateContext`, `RegistrationFormContext`).
- `src/services/` — acceso a Firebase/Firestore y Cloudinary.
- `src/constants/labels.js` — todos los textos visibles (español).
- `backend/` — servidor Node/Express, independiente de la app.
- `specs/`, `docs/` — documentación SDD: specs, plan, backlog, decisiones, bitácora de IA, constitución.

## Herramientas de desarrollo (SHOW_DEV_TOOLS)
Algunas pantallas incluyen paneles provisionales solo para desarrollo: el selector «Estado de la pantalla» (fuerza contenido/cargando/vacío/error en una pantalla), el «Simulador de cuenta» (fuerza el estado de la cuenta del conductor) y «Simular solicitud» (dispara una solicitud de viaje de prueba). Los tres están controlados por un único interruptor, `SHOW_DEV_TOOLS`, en [`src/constants/devTools.js`](src/constants/devTools.js). El valor en este repositorio es `false`: ningún panel provisional se muestra en la entrega. Un desarrollador puede poner ese valor en `true` en su copia local mientras trabaja, pero debe devolverlo a `false` antes de hacer commit.

## Uso de IA
Todo el desarrollo siguió una metodología Spec-Driven Development asistida por Claude Code, con 5 agentes especializados (spec-author, planner, implementer, verifier, design-auditor) y reglas fijas en [AGENTS.md](AGENTS.md) y [docs/constitution.md](docs/constitution.md) (una tarea a la vez, implementador y verificador siempre distintos, nunca secretos en un prompt, nunca commits automáticos). La bitácora completa, con cada prompt dado a Claude Code, su verificación y el aprendizaje registrado por Anderson, está en [docs/AI_LOG.md](docs/AI_LOG.md) (también entregada en PDF). El código con aportes de IA está marcado en el propio archivo con comentarios `// AI-assisted: see docs/AI_LOG.md #N`, trazables a la entrada exacta de la bitácora.

## Integrantes
Anderson Londoño Avendaño (equipo de una persona).

## Créditos
Taller "Taller: Uber - clone". Construido con Expo, React Native, Firebase/Firestore, Cloudinary y Node/Express.
