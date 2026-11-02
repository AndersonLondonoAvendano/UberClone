# Plan 001 — Registro del conductor

Spec: `specs/001-registro-conductor/spec.md` (Aprobada por Anderson, 2026-11-01, prompt #24).
Requisitos: RF-01 a RF-07, RNF-04, RNF-07. Criterios: CA-001-01 a CA-001-27, CA-001-D1 a D4.
Precedencia: ENCARGO > constitución > decisiones > spec/diseño > este plan > tareas.
Estado del plan: recién escrito, pendiente de revisión de Anderson. Ninguna tarea autorizada todavía (todas Pendiente).

## 0. Cronograma pedido por Anderson (entrega parcial 2026-11-05)

| Día | Qué | Tareas |
|---|---|---|
| **Domingo 2026-11-01 (HOY)** | Spec + este plan; instalar todas las dependencias nuevas y preparar el build nativo | T-15 |
| **Lunes 2026-11-02** | Firebase (auth anónima + Firestore), estado real de cuenta, Cloudinary, validadores, componentes de campo, contexto de formulario, Pestaña 1 (Datos personales) con fotos | T-16, T-17, T-18, T-19, T-20, T-21, T-22, T-23, T-24 |
| **Martes 2026-11-03** | Pestañas 2 (Vehículo) y 3 (Documentos) y envío a Firestore | T-25, T-26 |
| **Miércoles 2026-11-04** | Pruebas de extremo a extremo, reglas de seguridad de Firestore, README y bitácora | T-27, T-28 (+ README/bitácora, fuera de esta spec, ver nota) |
| Jueves 2026-11-05 | Entrega parcial a la profesora | — |

Nota sobre README y bitácora del miércoles: `ENT-02` (README) y `ENT-03` (bitácora en PDF) son requisitos de la spec **009-entrega**, no de esta spec. No les creo tarea aquí porque "ninguna tarea sin requisito" (regla del planner); lo que sí hace esta spec el miércoles es T-27 y T-28. Mantener el README al día y seguir completando `docs/AI_LOG.md` el miércoles es trabajo directo de Anderson/agente principal, no una tarea T-NN de la 001.

La auditoría de diseño propia de esta spec (T-29) queda creada y Pendiente, pero con el tiempo disponible hasta el jueves probablemente no alcanza una ronda completa de `design-auditor`; lo anoto en «Riesgos» (§8) para que Anderson decida si la aplaza, igual que hizo con T-12/T-13 (D-51).

## 1. Qué ya existe y no se repite
De la spec 000 (sin tocar salvo que se diga lo contrario): `RegistrationTabs` (tres pestañas, su navegación y testID ya cumplen RF-01 con el criterio CA-000-10 de esa spec; esta spec no repite ese criterio, ver §7 de `spec.md`), `PlaceholderScreen`, `ScreenHeader`, `ScreenState`, `AppStateContext`/`useAppState` (contrato público se conserva), `DevAccountSwitch`, `RootNavigator` (con `pickScreen`, sin cambios de código), `StartupScreen`, tokens y labels existentes. Esta spec AÑADE código nuevo y modifica `AppStateContext.js` por dentro (mismo contrato hacia afuera, ver DP-02) y reemplaza el contenido de `PersonalDataScreen.js`, `VehicleScreen.js` y `DocumentsScreen.js`.

## 2. Decisiones técnicas del plan (DP-NN; numeración propia de este plan, no sustituye a `docs/decisiones.md`)

- **DP-01 (ubicación de servicios).** Todo el código de red nuevo vive en `src/services/`: `firebase.js`, `driverRepository.js`, `cloudinary.js`. Sigue la convención de la constitución §3 aunque la regla automática C10 solo revise la Distance Matrix; mantiene el mismo patrón para cuando lleguen las specs 002+.
- **DP-02 (mismo contrato público de `useAppState`).** La autenticación anónima y la lectura real de `accountStatus` se añaden DENTRO de `AppStateContext.js`, sin crear un contexto nuevo, para no tocar `RootNavigator.js`, `DevAccountSwitch.js` ni `StartupScreen.js` (los tres ya consumen `useAppState()` con esta forma). Se añade `driverId` al valor del contexto; `accountStatus`, `retryAccountStatus`, `simulateAccountStatus`, `demoValue`, `setDemoValue` conservan su firma.
- **DP-03 (sin documento ⇒ `accountStatus: null`, D-60).** Cuando `drivers/{uid}` no existe todavía, el contexto expone `accountStatus: null` (no un valor de error). `RootNavigator.pickScreen` YA envía a la rama Registro cualquier valor que no sea `'loading'`, `'error'` ni `'approved'` (código existente, sin cambios): `null` cae ahí solo. No se modifica `RootNavigator.js` ni se amplía `ACCOUNT_STATUS`.
- **DP-04 (`retryAccountStatus` y `simulateAccountStatus` cambian de sentido, D-57).** `retryAccountStatus` deja de reiniciar un temporizador falso: ahora reintenta `ensureAnonymousUser()` y vuelve a suscribirse con `onSnapshot`. `simulateAccountStatus` se conserva como ANULACIÓN LOCAL con prioridad sobre el valor real (mientras haya una anulación activa, el valor real que llegue de Firestore se sigue leyendo pero no se usa para decidir la rama); así `DevAccountSwitch` sigue sirviendo para forzar `approved`/`error`/`loading` sin depender de la consola de Firebase, como pide D-57 (retiro total pendiente de la spec 008).
- **DP-05 (`demoValue` no se toca).** `demoValue`/`setDemoValue` siguen en el contrato de `AppStateContext` sin cambios (los usa `SettingsScreen`, fuera de esta spec). Esta spec solo retira su USO de `PersonalDataScreen` (campo `personal-data-field-shared`) y `VehicleScreen` (`vehicle-shared-value`), que son las pantallas que reemplaza.
- **DP-06 (contexto propio del formulario).** El estado de los 17 campos vive en un contexto NUEVO, `RegistrationFormContext` (`src/context/RegistrationFormContext.js`), separado de `AppStateContext`: la cuenta/sesión vive toda la app, el formulario de registro solo mientras la rama Registro está montada. El provider se monta DENTRO de `src/navigation/RegistrationTabs.js` (envuelve `Tab.Navigator`); ningún otro archivo de navegación cambia.
- **DP-07 (validez independiente de qué pestaña se visitó, RF-02).** Como el estado de los 17 campos vive en el contexto compartido (DP-06) y no en cada pantalla, la validez se calcula siempre sobre los 17 campos aunque una pestaña nunca se haya abierto (sus campos quedan en su valor inicial, inválido). No hace falta forzar `lazy={false}` en `Tab.Navigator`.
- **DP-08 (cuándo se pinta el error bajo el campo — aprobada por Anderson, 2026-11-01, prompt #25, punto 2c, con un ajuste sobre la propuesta original).** Un campo muestra su error después de que el conductor lo tocó y salió de él (`onBlur`), o al cambiar de pestaña, para TODOS los campos de una pestaña que ya fue visitada (salir de una pestaña cuenta como haber tocado cada uno de sus campos). Un campo vacío recién abierto, en una pestaña que nunca se visitó, no muestra error todavía. Se retira la rama original "o después de un intento de pulsar «Enviar registro» con el formulario inválido": como el botón «Enviar registro» queda deshabilitado mientras el formulario no sea válido (RF-02), ese intento nunca llega a ocurrir; `submitRegistration()` no necesita marcar nada como «tocado» (ver el contrato corregido en §6). Motivo: RF-03 exige que el error aparezca «bajo el campo» cuando el valor es inválido, pero F1 no dice si debe aparecer antes de cualquier interacción; pintar las tres pestañas en rojo al abrirlas por primera vez es un patrón que ningún documento pide y que generalmente se considera mala práctica.
- **DP-09 (fecha de nacimiento con `@react-native-community/datetimepicker`, no `Modal`/`FlatList`).** Decisión operativa para ahorrar tiempo antes del jueves (indicada en el encargo de esta tarea): el selector de fecha de nacimiento usa el picker nativo en vez de construir uno propio. D-56 (Vigente) sigue aplicando solo a los CUATRO desplegables de opciones fijas (categoría, color, género, idioma); esos siguen con `Modal` + `FlatList` propios, sin dependencia nueva. Necesita la decisión Vigente D-65 (abajo) para promover `@react-native-community/datetimepicker` a `allowed`.
- **DP-10 (foto: dos botones, no un menú).** El campo de foto (perfil y vehículo) ofrece dos botones con su propio `testID` (`-camera`, `-gallery`) en vez de un único control que abra un menú contextual; así cada uno es un objetivo táctil propio de ≥ 44 × 44, sin añadir un `Modal` adicional para elegir el origen.
- **DP-11 (Cloudinary sin SDK).** Subida con `fetch`/`FormData` contra `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload` (D-54); `<cloud_name>` se interpola en tiempo de ejecución desde `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, el campo `upload_preset` del cuerpo desde `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Ningún valor en el código, solo los nombres de las variables (RNF-07, D-54).
- **DP-12 (`firestore.rules` versionado como texto, sin despliegue automatizado).** Vive en la raíz del repo (`firestore.rules`). No hay Firebase CLI en `scripts/dependencies.json` y no se añade solo para esto (no es dependencia de la app, D-52 ya descartó meter más piezas de Firebase de las necesarias): Anderson copia el contenido a la consola de Firebase o lo despliega con una CLI que ya tenga instalada fuera de este proyecto.
- **DP-13 (envío idempotente).** «Enviar registro» puede pulsarse más de una vez (reintento tras un error de red) sin duplicar nada: siempre se usa `setDoc(ref, payload, { merge: true })` sobre `drivers/{uid}` (nunca `addDoc`), así reenviar sobrescribe el mismo documento.
- **DP-14 (fotos no se re-suben sin tocarlas).** Si el campo de foto ya tiene una URL válida y el conductor no lo vuelve a tocar, enviar el formulario reutiliza esa URL; solo se sube de nuevo si el conductor elige otra foto.
- **DP-15 (variables de entorno públicas, archivo `.env.example` en la raíz).** Nuevo archivo `.env.example` en la raíz del proyecto (no en `backend/`, que no cambia, D-58) con los NOMBRES de las variables `EXPO_PUBLIC_FIREBASE_*` y `EXPO_PUBLIC_CLOUDINARY_*`, sin valores. `.env` de la raíz ya queda fuera de Git por el patrón `.env`/`.env.*` existente en `.gitignore`. El planner no lee ni escribe valores de ningún `.env`; Anderson crea el `.env` real con sus propios valores de Firebase/Cloudinary.
- **DP-16 (reemplazo del simulador por la lectura real, D-57 — cambio respecto a la sugerencia del agente principal).** D-57 proponía que la tarea que reemplaza el simulador por la lectura real fuera «la que conecta el envío del registro con Firestore». Lo cambio a **T-18** (lunes, antes de construir ninguna pantalla), no a la tarea de envío (martes), por dos razones: (a) D-60 («sin documento ⇒ rama Registro, no error») solo tiene sentido si el oyente real (`onSnapshot`) ya está activo desde el arranque de la app, no solo después de que el conductor envíe el formulario — antes de enviar, el conductor YA debe estar en la rama Registro gracias a la lectura real, no al valor simulado; (b) conviene validar la conexión a Firebase Auth/Firestore temprano (lunes), antes de invertir el martes construyendo las tres pantallas encima, para descubrir cualquier problema de configuración con margen de reacción. `DevAccountSwitch` sigue montado y sigue sirviendo (DP-04) durante todo el desarrollo.

## 3. Dependencias — lista exacta y decisión que falta

Hoy en `scripts/dependencies.json`: `firebase` no está en ninguna lista; `@react-native-async-storage/async-storage`, `expo-image-picker` y `@react-native-community/datetimepicker` están en `proposed`. Ninguno está en `allowed`.

| Paquete | Para qué | Acción propuesta | Decisión que lo respalda |
|---|---|---|---|
| `firebase` | Firestore + Auth anónima (SDK JS, D-52) | **Añadir directo a `allowed`** (no puede quedar solo en `proposed` sin aparecer en ninguna lista hoy; y una vez en `allowed`, `check-constitution` C15 no exige además una decisión Vigente que lo nombre, aunque D-52 ya lo nombra literalmente y ya es Vigente) | D-52 (Vigente) |
| `@react-native-async-storage/async-storage` | Persistencia de la sesión anónima entre reinicios (`getReactNativePersistence`, guía oficial citada en el encargo) | Promover de `proposed` a `allowed` | D-53 (Vigente) + D-65 (nueva, propuesta abajo) |
| `expo-image-picker` | Foto de perfil y foto del vehículo (cámara/galería, RF-05/RF-06) | Promover de `proposed` a `allowed` | D-54 (Vigente) + D-65 |
| `@react-native-community/datetimepicker` | Selector de fecha de nacimiento (RF-05) | Promover de `proposed` a `allowed` | D-65 (nueva; DP-09 explica por qué no se usó `Modal`/`FlatList` aquí) |

**Importante — qué NO hago yo (el planner):** no edito `scripts/dependencies.json` ni `docs/decisiones.md`. Esa promoción y la decisión Vigente las registra el agente principal cuando Anderson apruebe este plan, igual que se hizo con T-01 de la spec 000 (el plan de esa spec tampoco editó `scripts/dependencies.json`, solo lo propuso en su §3).

**D-65 (propuesta por este plan, pendiente de que Anderson la ponga Vigente):** «Se promueven a `allowed` en `scripts/dependencies.json` las dependencias `firebase`, `@react-native-async-storage/async-storage`, `expo-image-picker` y `@react-native-community/datetimepicker` para la spec 001-registro-conductor, por las razones ya Vigentes D-52 (Firestore SDK JS), D-53 (persistencia de la sesión anónima) y D-54 (fotos con Cloudinary vía `expo-image-picker`); `@react-native-community/datetimepicker` se añade porque el equipo prefirió el picker nativo de fecha al `Modal`/`FlatList` propio por tiempo (DP-09 del plan de la 001), dejando D-56 vigente solo para los desplegables de opciones fijas.» Alternativa: mantener las cuatro en `proposed` y en su lugar crear cuatro decisiones Vigentes separadas que las nombren literalmente (más trámite, mismo resultado).

**Lo que NO se instala:** `@react-native-picker/picker` (D-56 sigue con `Modal`/`FlatList` para los 4 desplegables de opciones fijas), `expo-router`, `expo-localization`, `react-native-maps`, `@react-native-firebase/*`, `@react-native-community/geolocation`, `react-native-webview` (fuera de alcance de esta spec).

### T-15 — qué cambia exactamente en `app.json`
Se añade una entrada al array `plugins` (ya existe, solo tiene `"expo-system-ui"` hoy):
```json
"plugins": [
  "expo-system-ui",
  [
    "expo-image-picker",
    {
      "cameraPermission": "UberClone Conductor necesita la cámara para tomar tu foto de perfil y la foto de tu vehículo.",
      "photosPermission": "UberClone Conductor necesita tu galería para elegir tu foto de perfil o la de tu vehículo.",
      "microphonePermission": false
    }
  ]
]
```
`microphonePermission: false` porque esta app no grava audio (de lo contrario `expo-image-picker` añade `RECORD_AUDIO` en Android por defecto, sin necesidad). Nada más cambia en `app.json`; `android.package`/`ios.bundleIdentifier` no se tocan (D-31).

`@react-native-community/datetimepicker`: por mi conocimiento, NO necesita entrada en `plugins` (no pide permisos de iOS/Android propios; es autolinking puro sobre los pickers nativos del sistema). **No lo doy por verificado al 100 %:** T-15 pide al implementer reconfirmarlo contra la documentación vigente de Expo/el `README` del paquete instalado al momento de instalar, y detenerse si contradice esto.

`firebase` y `@react-native-async-storage/async-storage`: sin entrada en `plugins` (SDK JS puro + almacenamiento ya usado en el proyecto sin plugin).

### T-15 — recompilación y el celular de Anderson
`expo-image-picker` (código nativo nuevo desde T-02) exige una recompilación: Anderson ejecuta él mismo `npx expo run:android` después de que el implementer deje `package.json`/`app.json` listos (nunca lo ejecuta el implementer ni el planner). **¿Desinstalar la app actual primero?** Mi conclusión: no debería ser necesario. `expo run:android` reinstala sobre el mismo `applicationId` (`com.andersonlondono.uberclone`, sin cambios, D-31) con el mismo certificado de depuración de siempre; Android permite actualizar una app añadiendo permisos nuevos sin desinstalar (el permiso se solicita en tiempo de ejecución la primera vez que el código lo necesite). Alternativa si algo falla: si Gradle devolviera un error de tipo `INSTALL_FAILED_UPDATE_INCOMPATIBLE` (poco probable aquí, suele pasar solo si cambia la firma o el `versionCode` baja), desinstalar manualmente y reinstalar.

## 4. Contrato de datos de Firestore

### Documento `drivers/{uid}`
```js
drivers/{uid} = {
  personalData: {
    fullName: string,            // RF-05, D-61: letras del alfabeto español (incl. tildes y ñ) y espacios, 1-50
    documentNumber: string,      // RF-05: 6-10 dígitos (se guarda como string, no se usa en aritmética)
    phone: string,               // RF-05: exactamente 10 dígitos
    birthDate: string,           // RF-05: 'YYYY-MM-DD'; >= 18 años cumplidos en la fecha de envío
    gender: string,              // RF-05, D-63: uno de GENDER_OPTIONS[].value (femenino|masculino|otro|prefiero-no-decir)
    email: string,               // RF-05, D-62
    language: string,            // RF-05: 'es' | 'en'
    profilePhotoUrl: string,     // RF-05, RNF-07, D-54: secure_url de Cloudinary
  },
  vehicle: {
    category: string,            // RF-06: 'economico' | 'xl' | 'premium'
    plate: string,                // RF-06, D-14: normalizada en mayúsculas, patrón ABC123
    brand: string,                // RF-06: 1-30 caracteres
    model: string,                // RF-06: 1-30 caracteres
    year: number,                 // RF-06: entero de 4 dígitos <= año actual
    color: string,                // RF-06, D-64
    capacity: number,             // RF-06: entero positivo; >= 6 si category === 'xl'
    photoUrl: string,             // RF-06, RNF-07, D-54
  },
  documents: {
    mercadoPagoEmail: string,    // RF-07, D-55, D-62
    termsAccepted: boolean,      // RF-07, D-55: true (nunca se escribe el documento con false)
    commissionRate: number,      // informativo: 20 (RF-21), copiado al momento del envío
  },
  accountStatus: 'pending',       // RF-04, D-57: se escribe/sobrescribe en cada envío válido
  updatedAt: <server timestamp>, // housekeeping; no lo exige ningún CA, el implementer puede omitirlo si complica el envío
}
```
`uid` = `driverId` (D-53). El cambio a `accountStatus: 'approved'` sigue siendo manual, en la consola de Firebase (RF-04, F1 §2); esta spec nunca lo escribe.

### Reglas de seguridad de Firestore (`firestore.rules`, borrador — D-52, CA-001-22)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drivers/{driverId} {
      allow read, write: if request.auth != null && request.auth.uid == driverId;
    }
  }
}
```
Nada más se declara (sin `allow read, write: if true` en ninguna otra ruta): cualquier otra colección queda cerrada por defecto.

## 5. Árbol de archivos → responsabilidad → requisitos

```
app.json, package.json                    T-15: plugin expo-image-picker, dependencias nuevas      (RF-05, RF-06, D-54)
.env.example                               T-16 crea (Firebase), T-19 amplía (Cloudinary)            (D-52, D-54, RNF-05 por extensión)
firestore.rules                            T-27                                                       (D-52, CA-001-22)
src/services/firebase.js                   T-16: init app/auth/db + autenticación anónima            (D-52, D-53, CA-001-23)
src/services/driverRepository.js           T-17: onSnapshot de drivers/{uid} + escritura del envío   (D-52, D-57, RF-04, CA-001-21, CA-001-24)
src/services/cloudinary.js                 T-19: subida de fotos sin firma                            (RNF-07, D-54, CA-001-01/15)
src/utils/validators.js                    T-20: funciones puras de validación de los 17 campos       (RF-03, RF-05, RF-06, RF-07)
src/constants/registrationOptions.js       T-20: listas {value,label} de género/idioma/categoría/color (D-63, D-64, RF-05, RF-06)
src/components/registration/FieldError.js  T-21: texto de error bajo el campo                         (RF-03, CA-001-D3)
src/components/registration/TextField.js   T-21: campo de texto con etiqueta y error                  (RF-05, RF-06, RF-07)
src/components/registration/SelectField.js T-21: desplegable Modal+FlatList (D-56)                    (RF-05, RF-06)
src/components/registration/CheckboxField.js T-21: casilla de términos                                (RF-07, D-55)
src/components/registration/DateField.js   T-22: selector de fecha (DP-09)                            (RF-05)
src/components/registration/PhotoField.js  T-22: cámara/galería + subida a Cloudinary                 (RF-05, RF-06, RNF-07, D-54)
src/context/AppStateContext.js             T-18 MODIFICA: driverId + accountStatus real (DP-02 a 04)  (D-53, D-57, D-60, RNF-02, CA-001-23/24)
src/context/RegistrationFormContext.js     T-23: estado de los 17 campos, validez, envío              (RF-02, RF-03, RF-04, CA-001-18/21)
src/navigation/RegistrationTabs.js         T-23 MODIFICA (mínimo): envuelve con RegistrationFormProvider (DP-06)
src/screens/registration/PersonalDataScreen.js T-24 REESCRIBE: 8 campos + foto                        (RF-05, CA-001-01 a 08)
src/screens/registration/VehicleScreen.js  T-25 REESCRIBE: 7 campos + foto                            (RF-06, CA-001-09 a 15)
src/screens/registration/DocumentsScreen.js T-26 REESCRIBE: 2 campos + «Enviar registro»              (RF-02, RF-07, D-55, CA-001-16/17/18/21/27)
src/constants/labels.js                    T-24, T-25, T-26 AMPLÍAN (solo añaden claves, DP-17 de la 000) (RF-03, RF-05 a 07)
```
No se toca `backend/` (D-58, CA-001-26). No se toca `RootNavigator.js`, `DevAccountSwitch.js`, `StartupScreen.js`, `ScreenHeader.js`, `PlaceholderScreen.js`, `tokens.js` (sin tokens nuevos: esta spec no necesita ninguno que DESIGN.md no tenga ya).

## 6. Contratos (firmas)

```js
// src/services/firebase.js
export const auth; // Auth
export const db;    // Firestore
export async function ensureAnonymousUser(): Promise<string>; // uid; firma si no hay sesión, idempotente, cachea con onAuthStateChanged

// src/services/driverRepository.js
export function listenToDriverAccount(uid: string, handlers: {
  onChange: (accountStatus: string | null) => void, // null = sin documento (D-60); si existe, el valor de accountStatus del documento
  onError: (error: Error) => void,                  // solo fallos reales de red/permisos (D-60)
}): () => void; // unsubscribe, se llama en el retorno del useEffect (C11)
export async function submitDriverRegistration(uid: string, payload: {
  personalData: object, vehicle: object, documents: object,
}): Promise<void>; // setDoc(ref, { ...payload, accountStatus: 'pending', updatedAt: serverTimestamp() }, { merge: true }) — DP-13

// src/services/cloudinary.js
export async function uploadPhotoAsync(localUri: string): Promise<string>; // devuelve secure_url; lanza CloudinaryUploadError si falla

// src/utils/validators.js (todas puras, sin React, probables con un script fuera del proyecto)
export function isValidFullName(value: string): boolean;                      // D-61
export function isValidDocumentNumber(value: string): boolean;
export function isValidPhone(value: string): boolean;
export function isAdultBirthDate(date: Date, today?: Date): boolean;          // >= 18 años cumplidos en `today` (por defecto hoy)
export function isValidGender(value: string): boolean;
export function isValidEmail(value: string): boolean;                         // D-62: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function isValidLanguage(value: string): boolean;
export function isValidVehicleCategory(value: string): boolean;
export function normalizePlate(value: string): string;                        // mayúsculas + trim, antes de validar (D-14)
export function isValidPlate(normalizedValue: string): boolean;               // patrón ABC123
export function isValidBrandOrModel(value: string): boolean;                  // 1-30 caracteres
export function isValidVehicleYear(value: string | number, currentYear?: number): boolean;
export function isValidVehicleColor(value: string): boolean;
export function isValidCapacity(value: string | number, category: string): boolean; // entero positivo; XL >= 6
export function isNonEmptyUrl(value: string): boolean;                        // validez de los campos de foto (solo tras subida exitosa)
export function isTermsAccepted(value: boolean): boolean;                     // === true

// src/constants/registrationOptions.js
export const GENDER_OPTIONS;   // [{ value: 'femenino'|'masculino'|'otro'|'prefiero-no-decir', label }]
export const LANGUAGE_OPTIONS; // [{ value: 'es'|'en', label }]
export const VEHICLE_CATEGORY_OPTIONS; // [{ value: 'economico'|'xl'|'premium', label }]
export const VEHICLE_COLOR_OPTIONS;    // [{ value: 'blanco'|'negro'|'gris'|'plata'|'rojo'|'azul'|'verde'|'amarillo'|'otro', label }]
// cada label sale de labels.js (ninguna pantalla ni constante lleva texto literal, DP-17 de la 000)

// src/components/registration/FieldError.js
export function FieldError({ testID, message }): JSX.Element | null; // null si message es falsy; type.caption, color.danger

// src/components/registration/TextField.js
export function TextField({ testID, label, value, onChangeText, onBlur, errorTestID, errorMessage, keyboardType, maxLength }): JSX.Element;

// src/components/registration/SelectField.js (D-56: Modal + FlatList)
export function SelectField({ testID, label, options, value, onChange, errorTestID, errorMessage }): JSX.Element;
// options: [{ value, label }]; cada opción del Modal lleva testID `${testID}-option-${value}` (contrato DESIGN.md)

// src/components/registration/CheckboxField.js
export function CheckboxField({ testID, checked, onChange, label, errorTestID, errorMessage }): JSX.Element; // objetivo táctil >= 44x44

// src/components/registration/DateField.js (DP-09)
export function DateField({ testID, label, value, onChange, errorTestID, errorMessage, maximumDate }): JSX.Element;
// value: Date | null; onChange: (date: Date) => void; abre @react-native-community/datetimepicker en modo 'date'

// src/components/registration/PhotoField.js (DP-10, DP-11, DP-14)
export function PhotoField({ testID, label, value, onChange, errorTestID, errorMessage }): JSX.Element;
// value: string (secure_url) | ''; onChange: (url: string) => void; botones `${testID}-camera` y `${testID}-gallery`;
// estado interno 'idle'|'uploading'|'error'; en éxito llama onChange(secureUrl); en fallo NO llama onChange (el campo sigue inválido) y expone error por errorMessage/errorTestID

// src/context/AppStateContext.js (MODIFICA: mismo useAppState(), con driverId nuevo)
export function useAppState(): {
  driverId: string | null,
  accountStatus: string | null,       // ACCOUNT_STATUS.LOADING|ERROR|APPROVED, o PENDING si hay documento con ese valor, o null sin documento (D-60)
  retryAccountStatus: () => void,     // DP-04: reintenta ensureAnonymousUser() + re-suscribe
  simulateAccountStatus: (value: string) => void, // DP-04: anulación local, sin cambio de firma
  demoValue: string, setDemoValue: (v: string) => void, // DP-05: sin cambios, ya no lo usan las pantallas de esta spec
};

// src/context/RegistrationFormContext.js
export function RegistrationFormProvider({ children }): JSX.Element;
export function useRegistrationForm(): {
  personalData: { fullName, documentNumber, phone, birthDate, gender, email, language, profilePhotoUrl, touched: {...} },
  setPersonalDataField: (key: string, value: any) => void,
  touchPersonalDataField: (key: string) => void,  // onBlur de un campo (DP-08)
  isPersonalDataValid: boolean,

  vehicle: { category, plate, brand, model, year, color, capacity, photoUrl, touched: {...} },
  setVehicleField: (key: string, value: any) => void,
  touchVehicleField: (key: string) => void,  // onBlur de un campo (DP-08)
  isVehicleValid: boolean,

  documents: { mercadoPagoEmail, termsAccepted, touched: {...} },
  setDocumentsField: (key: string, value: any) => void,
  touchDocumentsField: (key: string) => void,  // onBlur de un campo (DP-08)
  isDocumentsValid: boolean,

  visitedTabs: { personalData: boolean, vehicle: boolean, documents: boolean },  // DP-08: true al SALIR de la pestaña (listener `blur` de @react-navigation en RegistrationTabs, T-23 lo cablea)
  markTabVisited: (tab: 'personalData' | 'vehicle' | 'documents') => void,
  // Cada pantalla pinta el error de un campo si touched[campo] === true O visitedTabs[suPestaña] === true (DP-08).

  isRegistrationValid: boolean,        // RF-02: los 17 campos válidos, visitada o no cada pestaña
  submitState: 'idle' | 'submitting' | 'success' | 'error',
  submitErrorMessage: string | null,
  submitRegistration: () => Promise<void>, // DP-08: NO marca nada como tocado (el botón ya está deshabilitado si el formulario es inválido, así que solo se llama cuando isRegistrationValid es true); si isRegistrationValid, llama submitDriverRegistration(driverId, {...})
};
```
`testID` nuevos que fija esta spec (DESIGN.md, ya anotados ahí como pendientes de confirmación): `personal-data-field-<campo>`, `personal-data-error-<campo>`, `personal-data-field-photo-camera|gallery`, `vehicle-field-<campo>`, `vehicle-error-<campo>`, `vehicle-field-photo-camera|gallery`, `documents-field-<campo>`, `documents-error-<campo>`, `documents-submit`, `<pantalla>-field-<campo>-option-<valor>`.

## 7. Diseño
Dirección A «Tablero» (D-25), solo tokens de `DESIGN.md` (ya ampliado el 2026-11-01 por el spec-author con los patrones de selector desplegable, selector de fecha, captura de foto y casilla de verificación — pendientes de confirmación de Anderson, no de esta tarea).
- Campos: etiqueta `type.label` arriba, borde `color.border` con `borderWidth.thin`, fondo `color.surface`, `radius.sm`, altura ≥ `touch.controlHeight` (48) que crece con la escala de texto (CA-001-D1, D4).
- Error de campo: `type.caption` en `color.danger`, bajo el campo, texto siempre presente (nunca solo color, CA-001-D3).
- Desplegables (D-56): mismo patrón de campo; `Modal` + `FlatList` sobre `color.surface`; opción activa marcada por peso/subrayado, no por relleno de acento (igual que la navegación).
- Selector de fecha (DP-09): mismo patrón de campo, abre el picker nativo del sistema (no es un componente de DESIGN.md con estilo propio: el calendario que se abre lo pinta el sistema operativo, no la app).
- Foto: marco `color.border`; vacío = marcador con instrucción; subiendo = indicador; error = mismo patrón de error de campo; dos botones (cámara/galería) con `touch.min` (44) y `touch.gap` (8) entre ellos.
- Casilla de términos: objetivo táctil ≥ 44 × 44 con el texto (incluye «20 %») junto, mismo patrón de error si no está marcada al intentar enviar.
- «Enviar registro» (`documents-submit`): botón principal, mismo patrón que `PrimaryButton` de la spec 000 (fondo `color.primary`, texto `color.onPrimary`, `radius.md`, `touch.controlHeight`, pulsado `opacity.pressed`); deshabilitado (opacidad reducida sin usar un color fuera de la tabla, o simplemente `disabled` sin estilo adicional) cuando `isRegistrationValid` es falso.
- Sin íconos de librería ni emoji (ninguno de los componentes nuevos los necesita). Sin colores, tamaños ni anchos de borde sueltos: todo sale de `color`, `type`, `space`, `radius`, `touch`, `opacity`, `borderWidth` ya existentes en `src/theme/tokens.js` (esta spec no añade ningún token nuevo).
- `Diseño: Pendiente` en T-21, T-22, T-24, T-25, T-26 hasta T-29 (abajo).

## 8. Mapa CA → implementación

| CA | Tareas | Cómo se comprueba |
|---|---|---|
| CA-001-01 (foto perfil + Cloudinary) | T-19, T-22, T-24 | Anderson, celular. No verificado en dispositivo |
| CA-001-02 (nombre) | T-20, T-24 | script fuera del proyecto contra `isValidFullName` |
| CA-001-03 (documento) | T-20, T-24 | script fuera del proyecto |
| CA-001-04 (celular) | T-20, T-24 | script fuera del proyecto |
| CA-001-05 (fecha nacimiento, 18+) | T-20, T-22, T-24 | script (fecha fija) + Anderson, celular (picker). No verificado en dispositivo (el picker) |
| CA-001-06 (género) | T-20, T-21, T-24 | Anderson, celular + revisión de código. No verificado en dispositivo |
| CA-001-07 (correo) | T-20, T-24 | script fuera del proyecto |
| CA-001-08 (idioma) | T-20, T-21, T-24 | Anderson, celular. No verificado en dispositivo |
| CA-001-09 (categoría) | T-20, T-21, T-25 | Anderson, celular. No verificado en dispositivo |
| CA-001-10 (placa) | T-20, T-25 | script fuera del proyecto |
| CA-001-11 (marca/modelo) | T-20, T-25 | script fuera del proyecto |
| CA-001-12 (año) | T-20, T-25 | script (año fijo) |
| CA-001-13 (color) | T-20, T-21, T-25 | Anderson, celular. No verificado en dispositivo |
| CA-001-14 (capacidad/XL) | T-20, T-25 | script fuera del proyecto |
| CA-001-15 (foto vehículo) | T-19, T-22, T-25 | Anderson, celular. No verificado en dispositivo |
| CA-001-16 (correo MP) | T-20, T-26 | script fuera del proyecto |
| CA-001-17 (términos, 20 %) | T-21, T-26 | Anderson, celular (texto visible) + revisión. No verificado en dispositivo |
| CA-001-18 (envío habilitado solo con 17 válidos) | T-23, T-26 | prueba sobre `isRegistrationValid` + Anderson, celular. No verificado en dispositivo |
| CA-001-19 (sin `Alert`) | T-24, T-25, T-26 | `grep Alert` + `check-constitution` C05 |
| CA-001-20 (error bajo el campo) | T-21, T-22, T-24, T-25, T-26 | Anderson, celular por campo. No verificado en dispositivo |
| CA-001-21 (escritura en Firestore al enviar) | T-17, T-23, T-26 | script fuera del proyecto (SDK de Firestore, datos de prueba) tras un envío; flujo completo en celular: No verificado en dispositivo |
| CA-001-22 (reglas por `uid`) | T-27 | script fuera del proyecto con dos sesiones anónimas contra el emulador de reglas |
| CA-001-23 (auth anónima) | T-16 | revisión de código + Anderson revisa el `uid` en la consola de Firebase. No verificado en dispositivo |
| CA-001-24 (accountStatus real, D-60) | T-17, T-18 | Anderson cambia el campo en la consola y observa la app; `check-constitution` C11. No verificado en dispositivo |
| CA-001-25 (sin `AsyncStorage` de datos del formulario) | T-16, T-23, T-24, T-25, T-26 | `grep AsyncStorage` + `check-constitution` C04 |
| CA-001-26 (backend sin cambios) | todas (verificación transversal) | `git diff --stat backend/` vacío |
| CA-001-27 (sin licencia/SOAT/RTM) | T-26 | revisión de código + Anderson, celular. No verificado en dispositivo |
| CA-001-D1 (táctil ≥44, testID) | T-21, T-22, T-24, T-25, T-26, T-29 | revisión de `testID` + medidas en capturas (T-29) |
| CA-001-D2 (solo tokens, Modal/FlatList, sin emoji) | T-21, T-22, T-24, T-25, T-26, T-29 | revisión de código + T-29 |
| CA-001-D3 (error en `type.caption`/`color.danger`, nunca solo color) | T-21, T-24, T-25, T-26, T-29 | revisión de código + T-29 |
| CA-001-D4 (escala de texto sin cortes) | T-21, T-22, T-24, T-25, T-26, T-29 | Anderson, escala máxima + T-29 |

## 9. Riesgos y qué recortar primero si el tiempo no alcanza

1. **Mayor riesgo técnico: Firebase (`firebase` v10+) con Metro/Expo SDK 57.** D-52 ya lo señaló. Mitigación: T-16 es la primera tarea de código del lunes, antes de construir ninguna pantalla, para descubrir cualquier incompatibilidad con margen de reacción. Si Metro falla por "package.json exports", la guía vigente de Expo (citada en el encargo) dice que no hace falta tocar `metro.config.js`; si en la práctica sí hiciera falta, el implementer se detiene y lo reporta (no se improvisa un ajuste sin verificarlo).
2. **Segundo riesgo: recompilación nativa de T-15.** Es la única tarea de esta spec que depende de que Anderson ejecute `expo run:android` con éxito. Si falla, todo lo del lunes en adelante queda bloqueado. Mitigación: T-15 es la tarea de HOY, con margen de un día completo antes de que el lunes dependa de ella.
3. **Tercero: `@react-native-community/datetimepicker` sin plugin de configuración.** Lo doy por probable pero no verificado al 100 % (ver §3). Si resultara necesitar un plugin, es un ajuste de una línea en `app.json`, de bajo riesgo pero puede obligar a OTRA recompilación si ya se había hecho la de T-15 sin él.
4. **Qué recortar primero si falta tiempo (en este orden):**
   1. **T-29 (auditoría de diseño propia).** Como pasó con T-12/T-13 de la spec 000 (D-51), es lo más seguro de aplazar: no bloquea que el registro funcione ni que persista datos reales, que es lo que pide la profesora para el jueves. Quedaría «Diseño: Pendiente» en T-21, T-22, T-24, T-25, T-26, igual que quedaron las pantallas de la spec 000.
   2. **T-27 (reglas de seguridad de Firestore).** Si el miércoles se queda corto, el jueves se puede entregar con las reglas por defecto de un proyecto de prueba (todo autenticado puede leer/escribir cualquier documento) dejando CA-001-22 explícitamente "No verificado"/pendiente, en vez de bloquear la entrega completa; no es ideal (D-52 lo exige) pero es preferible a no entregar nada. Recomiendo NO recortar esto si se puede evitar: es una sola tarea de bajo riesgo y protege datos de otros conductores.
   3. **Pestaña 3 (T-26) ya es el mínimo de D-55**; no hay nada más que recortar ahí sin violar RF-02 (el envío no podría habilitarse nunca sin ella).
   4. **No recortaría** T-16 a T-20 (Firebase, repositorio, Cloudinary, validadores): sin ellos no hay registro funcional en absoluto, que es el objetivo central de la entrega del jueves.
5. **Sin dispositivo iOS** (P-05, ya conocido): todo lo "No verificado en dispositivo" de esta spec queda así también en iOS, de forma permanente, igual que en la spec 000.
