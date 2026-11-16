# Investigación FCM (notificaciones push, Android) — 2026-11-16

Estado: Informe de investigación (Fase 1 de FCM, sin código). Cubre PDF §7, R-113 y brecha G-04 de `docs/plan-cierre-entrega-2026-11-16.md`. Las decisiones que de aquí salen son propuestas (D-126…) y las aprueba Anderson.

## 1. Conclusión corta

- **Recomendación: `@react-native-firebase/app` + `@react-native-firebase/messaging` 27.1.1**, validado por un spike (S1) antes de construir nada más. El PDF nombra explícitamente `@react-native-firebase/messaging`, así que es la ruta que cumple R-113 al pie de la letra.
- **Riesgo principal:** la matriz oficial de RN Firebase solo declara probado hasta Expo 58 / RN 0.88-rc.3; Expo SDK 57 / RN 0.86 queda dentro del rango de pares (`expo >=47`, `react-native >=0.60`) pero **no figura como probado**. Por eso S1 es una puerta: si no compila o no entrega un token, se activa el plan B.
- **Plan B:** `expo-notifications` (~57.0.25) con `getDevicePushTokenAsync()` para obtener el token nativo FCM, y `firebase-admin` en el backend para enviar. El resto del sistema no cambia porque todo queda detrás de `src/services/notifications/`.
- Nueva Arquitectura: RN Firebase `messaging` la exige desde la v26.0.0; el SDK 57 / RN 0.86 la trae activa por defecto. No hay conflicto.

## 2. Hechos verificados (texto de las fuentes) y su fecha

| Tema | Hecho | Fuente |
|---|---|---|
| Versión | `@react-native-firebase/app` y `/messaging` última = **27.1.1** (2026-11-10) | [F4] |
| Pares de `app` 27.1.1 | `react` `*`, `react-native` `>=0.60.0-0`; `firebase` (Android BoM 35.0.2, Apple 13.1.1) como dependencia propia | [F4] |
| Par de `messaging` | `@react-native-firebase/app` 27.1.1 y `expo >=47.0.0` (opcional) | [F4] |
| Android | `minSdk` 24 | [F4] |
| Nueva Arquitectura | **Requerida** desde v26.0.0 (2026-07-29); se mantiene en 27.x | [F3] |
| Probado en | RN 0.88.0-rc.3 (Expo 58.0.0); el rango de Expo `>=47` no es un piso probado | [F1] |
| Permisos | Desde v25.0.0 las APIs de permiso de `messaging` están deprecadas: usar `PermissionsAndroid`, `expo-notifications` o `react-native-permissions`. Android 13+ (API 33): `POST_NOTIFICATIONS` | [F2][F3] |
| Token | `getToken/deleteToken/onTokenRefresh` siguen funcionando; v27 los marca deprecados solo si se activa el opt-in de Installation ID (`messaging_installation_id_enabled`). **No activar el opt-in.** | [F3] |
| `onTokenRefresh` | Solo se llama con la app en primer plano | [F2] |
| Plugin de Expo | `plugins: ["@react-native-firebase/app", "@react-native-firebase/messaging"]` (en ese orden); opciones `android.notificationIcon`, `android.notificationColor`; solo edita `AndroidManifest.xml`, no crea los recursos | [F5] |
| Config de app | `android.googleServicesFile: "./google-services.json"` y `android.package` obligatorios; correr `npx expo prebuild --clean` tras añadir plugins; no funciona en Expo Go (se usa dev client, ya permitido) | [F5] |
| Canal | El canal por defecto es «Miscellaneous». RN Firebase no crea canales: hay que crearlo (p. ej. `expo-notifications` `setNotificationChannelAsync`) o fijar `messaging_android_notification_channel_id`. El canal debe existir antes de que llegue una notificación que lo nombre | [F2][F6] |
| Segundo plano | `setBackgroundMessageHandler` debe registrarse en el archivo de entrada (`index.js`) antes de `registerRootComponent` (Headless JS, ~60 s). `onMessage` solo corre en primer plano | [F2] |
| `firebase-admin` | Última 14.5.1 (`engines node >=22`). El backend declara `^13.0.0` y `node >=20.12`; en esta máquina está instalada 13.10.0 y Node v26.13.0. La API heredada de FCM está apagada desde 2024-07-22: se usa HTTP v1 (`messaging().send()` / `sendEachForMulticast`) | [F7] |
| Plan B | `getDevicePushTokenAsync()` devuelve el token nativo del dispositivo; `setNotificationChannelAsync` debe llamarse ANTES de pedirlo. Opciones del plugin: icon, color, defaultChannel, sounds | [F6] |

**No verificado (se comprueba en S1, no se afirma):**
1. `onNotificationOpenedApp` y `getInitialNotification` en 27.1.1: la página de notificaciones de RN Firebase no se leyó. Son las APIs históricas de `messaging()`; S1 las ejercita.
2. Las claves de `firebase.json` para el canal (resumen indirecto).
3. Que el valor de `getDevicePushTokenAsync()` en Android sea el token de registro de FCM (lo documenta Expo para FCM v1, pero la página no lo dice con esas palabras).
4. Un mínimo concreto de `firebase-admin` para HTTP v1: no se encontró. Con 13.10.0 instalada (API v1) se considera suficiente; se confirma enviando un mensaje real en S2.

## 3. Fuentes

- [F1] RN Firebase, portada y tabla de versiones: https://rnfirebase.io/
- [F2] RN Firebase, Cloud Messaging (uso): https://rnfirebase.io/messaging/usage
- [F3] CHANGELOG de RN Firebase (v25, v26, v27): https://raw.githubusercontent.com/invertase/react-native-firebase/refs/heads/main/CHANGELOG.md
- [F4] npm, `@react-native-firebase/messaging` latest: https://registry.npmjs.org/@react-native-firebase/messaging/latest
- [F5] Expo, usar Firebase: https://docs.expo.dev/guides/using-firebase/
- [F6] Expo SDK 57, `expo-notifications`: https://docs.expo.dev/versions/v57.0.0/sdk/notifications/
- [F7] npm, `firebase-admin` latest: https://registry.npmjs.org/firebase-admin/latest

Consultadas el 2026-11-16. Las versiones cambian: S1 las fija con `npx expo install` y `npm ls`.

## 4. Versiones exactas recomendadas

| Paquete | Dónde | Versión | Nota |
|---|---|---|---|
| `@react-native-firebase/app` | app | 27.1.1 | fijar exacta (sin `^`) hasta pasar el spike |
| `@react-native-firebase/messaging` | app | 27.1.1 | igual a `app` (deben coincidir) |
| `firebase-admin` | backend | la ya instalada (13.10.0); subir a 14.x solo si Anderson lo decide (exige Node ≥22) | Node local v26.13.0 |
| `expo-notifications` | app | solo en plan B: ~57.0.25 (`npx expo install`) | también sirve en el camino principal para crear el canal; ver D-129 |

Canal «solicitudes» en el camino principal (D-129, Propuesta): primero se prueba fijar `messaging_android_notification_channel_id` en `firebase.json` sin añadir `expo-notifications`. **Riesgo:** RN Firebase no crea canales; si el canal no existe, Android usa «Miscellaneous». **Criterio:** S1 prueba el canal; si no queda con importancia alta, se añade `expo-notifications` solo para `setNotificationChannelAsync`.

## 5. Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| FR-1 | RNF no probado con SDK 57 / RN 0.86 | Media | Alto | Spike S1 con puerta; plan B listo |
| FR-2 | Falla de compilación Gradle (BoM 35.0.2, compileSdk) al añadir plugins | Media | Alto | `npx expo prebuild --clean`; revisar `expo-doctor`; plan B comparte `google-services.json` |
| FR-3 | `google-services.json` ausente o con otro `package_name` | Media | Medio | Paso manual E; lista de comprobación |
| FR-4 | API Cloud Messaging V1 no habilitada en el proyecto | Baja | Alto | Paso manual; el envío falla con error 403, lo detecta S2 |
| FR-5 | Canal inexistente → notificación sin heads-up | Media | Medio | Crear canal antes del primer token; prueba en S1 |
| FR-6 | Android 13+ sin permiso → no llega nada | Alta | Medio | Pedir en contexto; estado «denegado» con enlace a Ajustes |
| FR-7 | Fabricantes que matan procesos (ahorro de batería) | Media | Medio | Documentado como límite; demo con app en segundo plano normal |
| FR-8 | Token obsoleto en `pushTokens` (Firestore) | Media | Bajo | El backend borra los tokens cuyo envío falle con UNREGISTERED, revisando `resp.success` por índice de `sendEachForMulticast` (D-131; la documentación no dice que el SDK limpie tokens) |
| FR-9 | Dependencias nuevas fuera de `scripts/dependencies.json` | Baja | Medio | Solo se mueven en Fase 2 con aprobación |
| FR-10 | `firebase-admin` 13 vs 14 y Node | Baja | Bajo | Mantener 13.10.0 |

## 6. Criterio de decisión (RN Firebase vs plan B)

Al final de S1 (máx. 3 h de spike; ver plan):
- **Se mantiene RN Firebase si:** (a) `npx expo run:android` compila; (b) la app arranca con `index.js` registrando el handler; (c) `messaging().getToken()` devuelve un token (visible en log seguro: solo los primeros 8 caracteres y su longitud, en `__DEV__`); (d) el backend envía un mensaje de prueba y llega con la app en segundo plano.
- **Se activa el plan B si** falla (a), (b) o (c) y el diagnóstico (versión de BoM, plugin, `minSdk`) no se resuelve en el tiempo del spike, o (d) falla por razones de RNF y no del proyecto Firebase.
- Para el plan B solo cambia el **adaptador** de `src/services/notifications/`; la interfaz, el backend, el registro de tokens y la UI son iguales.

## 7. Interfaz propia: `src/services/notifications/`

Contrato (descriptivo, sin código): `getPermissionState()`, `requestPermission()`, `registerToken(uid)` / `unregisterToken()`, `onForegroundMessage(cb)`, `onNotificationOpened(cb)` (incluye el caso «abierta desde cerrada»), `onTokenRefresh(cb)`, y el canal «solicitudes». Dos adaptadores intercambiables (`rnFirebase`, `expoNotifications`) y uno falso para pruebas. La lógica pura (armado de payload, elegibilidad, expiración, dedupe, resolución de intención de navegación) vive aparte y se prueba con `node:test` e inyección de dependencias, igual que `resetSession`.

## 8. Nota de la revisión 1b (2026-11-16)

Diseños retirados por decisión de Anderson, que este informe no usa: la subcolección `drivers/{uid}/fcmTokens` (ahora colección raíz `pushTokens/{hash}`, D-131), la copia de `calculateFare` en el backend (D-132 rechazada) y el temporizador de 30 s (D-136 rechazada; D-137). Hechos añadidos: `sendEachForMulticast` devuelve una respuesta por token en el mismo orden y admite hasta 500 tokens por llamada (https://firebase.google.com/docs/cloud-messaging/send/admin-sdk); UNREGISTERED (HTTP 404) indica quitar el token (https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode.md.txt). Riesgo abierto: la guía marca `token` como deprecado a favor de `fid`; con `firebase-admin` 13.10.0 se usa `tokens` y se confirma en S2.
