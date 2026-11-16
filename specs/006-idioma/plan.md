# Plan — Spec 006 Idioma español/inglés, lote L3

Estado: **Propuesta de `planner` (2026-11-16)**. La spec 006 sigue en Borrador; Anderson ordenó continuar sin esperar su aprobación y eso no la sustituye. Tareas T-241 a T-267 (siguiente libre tras T-240). Sin dependencias nuevas, sin tocar `.env`, `app.json`, lo nativo ni `backend/`. Los `RI-nn` son locales de la spec; cada tarea cita su `RI-nn` más un ancla existente de `docs/requisitos.md` (RF-29 Configuración, RNF-19 textos en `labels.js`, RNF-14 accesibilidad).

Numeración de decisiones: el borrador de la spec llama D-187 (idioma por dispositivo) y D-188 (push) a lo que aquí es D-188 y D-189, porque D-187 se usó para el enfoque técnico elegido. D-190 a D-192 son nuevas. Todas «Propuesta».

## 0. Hallazgos del código real

- `src/constants/labels.js` (747 líneas): objeto `labels` con 21 secciones de primer nivel (`appName`, `registrationFlow`, `tabs`, `drawer`, `nav`, `home`, `trip`, `earnings`, `history`, `profile`, `settings`, `notifications`, `states`, `placeholder`, `a11y`, `actions`, `forceState`, `mapTest`, `demo`, `auth`, `registration`), `history.weekdaysShort` (línea 346), `notifications.delayValue` (línea 478), la asignación `labels.profile.errors` (línea 738) y `getSubmitErrorMessage` (línea 745, usada en `RegistrationFormContext.js:295`).
- 51 archivos importan `labels` (pantallas, componentes, navegación, contexto, hooks, utilidades y servicios). Unas 20 líneas de 15 archivos leen una hoja a nivel de módulo (por ejemplo `HomeScreen.js:41-57`, `RegistrationTabs.js:44-55`, `DocumentsScreen.js:33`, `PersonalDataScreen.js:36`, `VehicleScreen.js:33`): se congelarían en el idioma de arranque. Otras leen un nodo (`const TEXT = labels.auth`), que sigue vivo con un Proxy por ruta.
- Formatos: `src/utils/format.js` (`formatCop`, `formatKmFromMeters` con coma fija, `formatClock`, `formatDateTime` con día primero, `fillLabel`). No hay `Intl` ni `toLocale*` en `src/`.
- `Alert.alert` y `scheduleNotificationAsync` no aparecen en `src/` (búsqueda hecha); RI-18 y CA-006-25/26 se cumplen por ausencia y la prueba lo mantiene.
- Persistencia: `services/notifications/preference.js` (almacenamiento inyectado, carga perezosa de AsyncStorage, nunca lanza) es el patrón. `buildSessionResetDeps.js` no borra preferencias propias (`clearOwnStorage` es no-op por defecto).
- Idioma del teléfono sin dependencias: `I18nManager.getConstants().localeIdentifier` (declarado en `node_modules/react-native/Libraries/ReactNative/I18nManager.d.ts`, opcional), `NativeModules.SettingsManager` en iOS e `Intl` (D-190). `expo-localization` no existe en el repo.
- `App.js` ya tiene una compuerta de arranque (`useInterReady`, pantalla vacía hasta 3 s): el idioma se resuelve dentro de ella (RI-09).
- Hay `npm test` con `node:test` y un cargador de `src` (`scripts/tests/helpers/registerSrcLoader.mjs`); no hay renderizador de componentes: la prueba de re-render es del almacén y del hook por contrato (CA-006-19), el resto «No verificado en dispositivo».

## 1. Enfoque elegido (D-187) y comparación

| | (a) `labels` vivo + hook por archivo (ELEGIDO) | (b) migrar usos a `useLabels()` |
|---|---|---|
| Archivos tocados | 1 línea en los archivos con JSX; nada en servicios | los 51, cada línea con `labels.` |
| Código fuera de React | lee el idioma activo al llamarse, sin cambios | exige pasar texto o `t()` a cada servicio |
| Riesgo en solicitud, viaje y cobro | mínimo (solo suscripción de lectura) | alto (reescritura de pantallas críticas) |
| Modo de fallo | se ve español | texto vacío o pantalla rota |
| Re-render sin remontar | cada archivo se suscribe con `useSyncExternalStore` | igual |

Sin Provider ni `key`: el árbol no se remonta, así que el estado, el temporizador de 15 s, el viaje y la tarifa no se tocan (RI-16 por construcción). Garantía de re-render: la prueba estática (D-192) exige el hook en todo archivo con JSX que lee `labels`, y la lista de pendientes obliga a cerrar cada carpeta.

## 2. Archivos → responsabilidad → requisitos

| Archivo | Responsabilidad | Requisitos |
|---|---|---|
| `src/i18n/languages.js` | `SUPPORTED`, `normalizeLanguage(texto)` por código base | RI-06, RI-07 |
| `src/i18n/resolveLanguage.js` | función pura: guardado, sugerencia, teléfono, `es` | RI-06, RI-08 |
| `src/i18n/phoneLanguage.js` | lectores inyectables del idioma del teléfono | RI-07 |
| `src/i18n/languagePreference.js` | clave `appLanguage`, almacenamiento inyectado | RI-12, RI-13 |
| `src/i18n/languageStore.js` | idioma activo, `setLanguage` (guarda mejor esfuerzo), `subscribe` | RI-14, RI-15 |
| `src/i18n/translate.js` | `t(clave, params)`, plurales, respaldo | RI-02, RI-03, RI-04 |
| `src/i18n/liveLabels.js` | Proxy por ruta sobre el diccionario activo | RI-05, RI-15 |
| `src/i18n/dictionaries/es.js`, `en/index.js`, `en/*.js` | diccionarios | RI-01 |
| `src/i18n/useLanguage.js`, `initLanguage.js` | hook de suscripción; resolución inicial | RI-09, RI-15 |
| `src/constants/labels.js` | reducido a `export const labels` vivo y `getSubmitErrorMessage` | RI-05 |
| `src/utils/format.js` | `formatKm`, fechas por idioma | RI-19, RI-21, RI-22 |
| `src/components/settings/LanguageSection.js`, `SettingsScreen.js` | selector | RI-10, RI-11, RI-14 |
| `App.js`, `RegistrationFormContext.js` | arranque y sugerencia del registro | RI-08, RI-09 |
| ~35 archivos de `src/screens`, `src/components`, `src/navigation` | `useLanguage()` y correcciones de lecturas a nivel de módulo | RI-15, RI-17 |
| `scripts/tests/i18n*.test.mjs`, `fixtures/` | pruebas | todos |

## 3. Contratos (firmas)

```
normalizeLanguage(value) => 'es' | 'en' | null
resolveLanguage({ stored, suggested, phone }) => 'es' | 'en'
readPhoneLanguage(readers) => 'es' | 'en' | null          // readers: Array<() => string|null>, nunca lanza
createLanguagePreference({ storage, key = 'appLanguage' }) => { get(), set(lang) => Promise<boolean> }
languageStore: getLanguage(), setLanguage(lang) => Promise<{ saved: boolean }>, subscribe(fn) => unsubscribe, init(lang)
t(key, params?, language = getLanguage()) => string       // plural: params.n con { one, other }
createLiveLabels({ dictionaries, getLanguage }) => Proxy
useLanguage() => { language }                              // useSyncExternalStore(subscribe, getLanguage)
formatKm(km, language?), formatDateTime(ts, language?), formatClock(ts, language?)
```

## 4. Decisiones técnicas

1. **Idioma vivo, sin Provider** (D-187). La Proxy resuelve la ruta al leer, devuelve hojas tal cual y nodos como otro Proxy; soporta `ownKeys`, `has` y `getOwnPropertyDescriptor`.
2. **`es` se mueve, no se reescribe.** Una instantánea de rutas del `labels.js` original (`scripts/tests/fixtures/labelsEsPaths.json`, generada antes del movimiento) prueba que `es` conserva todas las rutas.
3. **`en` por secciones** en archivos propios para traducir en paralelo sin pisarse; `en/index.js` se crea en T-244 con secciones vacías y respaldo a español, de modo que la app arranca en cada rebanada.
4. **Idioma inicial** (D-190, D-188): `initLanguage` lee la preferencia con tope de 1,5 s, resuelve y fija el idioma antes de quitar la pantalla de arranque de `App.js`. Falla de lectura: se sigue con teléfono y español.
5. **Sugerencia del registro** (RI-08): si no hay preferencia guardada y el registro trae `personalData.language`, se aplica una sola vez sin guardarla; nunca pisa una preferencia guardada.
6. **Cambio de idioma**: `setLanguage` cambia el almacén de inmediato y guarda después (mejor esfuerzo); si el guardado falla devuelve `saved: false` y la sección muestra el aviso (RI-14). Dos cambios seguidos: gana el último.
7. **Formatos** (D-191) sin `Intl`; plurales de dos formas con `n === 1` singular.
8. **Pruebas estáticas heurísticas** (D-192): hook obligatorio, sin lecturas de hoja a nivel de módulo, sin texto suelto, con excepciones versionadas y razonadas.
9. **No se migra a `t()`**: `t` existe para código nuevo, plurales y pruebas; los usos actuales (`fillLabel`, `.replace('{n}')`) no se tocan.
10. **Valores memorizados**: en archivos con `useMemo`/`useCallback` que leen textos, `language` entra en las dependencias; se revisa en cada tarea de migración.
11. **Sin cambios en `backend/`, `app.json`, `firestore.rules` ni `validProfileEdit`** (CA-006-14, 34).

## 5. Diseño

Visuales: T-254 (selector) y las tareas de migración que corrigen lecturas congeladas solo cambian estado interno, sin diseño nuevo. T-254 queda `Diseño: Pendiente` hasta T-263 (design-auditor: comprobación del idioma activo, contraste, 48 dp, textos en inglés al 200 % en botones, chips, contador, Historial y Detalle). El agente principal carga las skills de diseño y se las pasa al auditor.

## 6. Orden y paralelismo seguro entre implementers

- Secuencia obligatoria: T-241, T-242, T-243, T-244, T-245 (núcleo; archivos disjuntos entre sí salvo T-244/T-245 que dependen del almacén).
- **Paralelo tras T-244**: T-246 a T-249 (cuatro implementers, un archivo de `en/` cada uno) y T-251 (formatos). Después T-250 (paridad).
- **Paralelo tras T-252 y T-256**: T-257 (`screens/auth`, `registration`, `home`, `dev`), T-258 (`screens/main`, `trip`), T-259 (`components/**`), T-260 (`navigation`, `context`, `hooks`) y T-261 (`services`, `utils`, `constants`). Directorios disjuntos; el único archivo compartido es `scripts/tests/fixtures/i18nPending.json`: cada tarea borra solo su propia línea.
- T-253 (sugerencia) toca `RegistrationFormContext.js` y T-260 también: T-253 va antes o T-260 la excluye.
- Si una tarea de migración pasa de ≈8 archivos, el implementer la parte por subcarpeta y lo anota.

## 7. Mapa CA → implementación

| CA | Tareas |
|---|---|
| CA-006-01, 02, 03 | T-244, T-246 a T-250 |
| CA-006-04, 05, 06 | T-245 |
| CA-006-07 | T-244, T-249, T-250 |
| CA-006-08, 09, 10 | T-242, T-252, T-253 |
| CA-006-11 | T-252, T-264 (Anderson) |
| CA-006-12, 13, D2, D3 | T-254, T-263 |
| CA-006-14, 15 | T-242, T-243, T-254, T-255 |
| CA-006-16 | T-255 |
| CA-006-17 | T-243, T-254 |
| CA-006-18, 21, 27 | T-264 (Anderson) |
| CA-006-19 | T-243, T-252 |
| CA-006-20, 32 | T-255 |
| CA-006-22, 23, 24 | T-256 a T-261 |
| CA-006-25, 26 | T-256, T-261 |
| CA-006-28, 29, 30 | T-251 |
| CA-006-31 | T-255 |
| CA-006-33, 34 | T-262, T-266 |
| CA-006-D1 | T-263, T-264 |

## 8. Riesgos principales

1. Lecturas de hoja a nivel de módulo que quedan en español tras el cambio (control: prueba estática, T-256).
2. Un componente con `React.memo` o valores memorizados que no se re-renderiza (control: hook por archivo; `language` en dependencias).
3. Proxy y Hermes: no verificado en dispositivo hasta T-264.
4. Calidad del inglés: la paridad solo mide presencia; revisión de redacción de Anderson.
5. Lector del idioma del teléfono distinto por sistema operativo (D-190).
6. Texto en inglés más largo con fuente al 200 % (T-263).
