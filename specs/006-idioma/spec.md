# Spec 006 — Idioma español/inglés (lote L3)

Estado: **Borrador** (propuesta de `spec-author`; NO aprobada). Esta spec no aprueba nada, ni lo propio ni D-15. Anderson ordenó que la ejecución continúe sin esperar la aprobación; esa instrucción no sustituye la aprobación formal. Si esta spec cambia tras aprobarse, planes, tema y tareas pueden quedar desactualizados.
Fuente: `docs/plan-cierre-entrega-2026-11-16.md` (G-05, D-15; R-022, R-048, R-065), D-15 (Propuesta) y su actualización por D-29 (sin `expo-localization` ni librerías de i18n; diccionario propio), y las decisiones de Anderson del prompt de este lote. El enunciado (`docs/enunciado-taller.pdf`) no se pudo renderizar en este entorno: lo que dice de R-022, R-048 y R-065 se toma de la matriz del plan (NO VERIFICADO contra el PDF).
Los IDs `RI-nn` son locales de esta spec y no están aún en `docs/requisitos.md`. Las decisiones D-188 y D-189 de la sección 8 son SOLO propuestas: no se escribieron en `docs/decisiones.md`.

## 1. Objetivo y porqué

Que el conductor use toda la app en español o en inglés, elija el idioma en Configuración, y que el cambio se vea al instante y sobreviva al reinicio. Porqué: el taller lo exige (G-05) y hoy el campo «idioma» del registro no tiene efecto. Se hace con un módulo propio y sin dependencias nuevas, aprovechando que todo el texto visible ya vive en `src/constants/labels.js`.

## 2. Qué ya existe (verificado en el código)

- `labels.js` es un objeto anidado de unas 495 cadenas (el plan estima ~495; el conteo exacto lo hace la prueba de paridad). Formas que el módulo debe soportar:
  - Cadenas simples y objetos anidados hasta 4 niveles (`trip.paymentServiceError.offline.title`).
  - Plantillas con parámetros: `{n}`, `{total}`, `{email}`, `{km}`, `{min}`, `{s}`, `{pct}`, `{percent}`, `{lat}`, `{lng}`, `{name}`, `{passenger}`, `{status}`, `{date}`, etc.
  - Un arreglo de textos: `history.weekdaysShort`.
  - Una función: `notifications.delayValue(seconds)`.
  - Claves con guion o con valores de dominio como clave (`submitErrors['permission-denied']`, `paymentMethod.card`, `accountStatus.approved`).
  - Una asignación posterior al objeto: `labels.profile.errors` (alias a los mensajes del registro) y el helper `getSubmitErrorMessage(code)`.
  - Comentarios `// AI-assisted` repartidos; no afectan.
- Hay mensajes con redacción distinta pero el mismo significado en varias claves (por ejemplo `trip.expired` y `trip.pushExpired`); se traducen como están, sin fusionarlos.
- `registration.language` = `{ es: 'Español', en: 'Inglés' }` y el campo «Idioma» del registro guarda `personalData.language` (`es`/`en`) en Firestore (`registrationOptions.js`, `RegistrationFormContext.js`, `PersonalDataScreen.js`). Hoy no cambia nada en la app.
- No existe módulo de i18n, ni contexto de idioma, ni uso de `Intl`/`toLocale*` en `src/` que se haya detectado en las búsquedas de `src/` (los formatos de fecha y moneda están en utilidades propias; el plan decide cuáles tocar). Las preferencias del teléfono ya se guardan con AsyncStorage en `services/notifications/preference.js` (patrón reutilizable, sin dependencia nueva).
- El texto de la notificación push lo arma el backend: `backend/src/notifications/payload.js` fija en español `NOTIFICATION_TITLE = 'Nueva solicitud de viaje'` y el cuerpo `Económico · {km} km · {min} min`, sin leer ningún idioma del usuario. Los `data` del mensaje (`passengerName`, etc.) no son texto de interfaz.
- En `src/services/notifications/` no se encontró código que programe notificaciones locales con texto propio (búsqueda de `scheduleNotificationAsync`, sin resultados). El nombre del canal Android lo configura un plugin de configuración (D-139) y no se inspeccionó aquí: NO VERIFICADO si contiene texto traducible.

## 3. Requisitos

**B1 — Módulo de traducción**
- **[RI-01]** (D-15, D-29; R-022) El sistema deberá tener un módulo propio de i18n, sin librería de i18n ni `expo-localization`, con un diccionario `es` y uno `en` que cubran TODAS las claves de `labels.js` (mismas rutas, incluidos los anidados, el arreglo `weekdaysShort`, las plantillas y la función `delayValue`), y ninguna clave sobrante en uno que falte en el otro.
- **[RI-02]** (R-022) Una función de traducción deberá devolver el texto de una clave en el idioma activo y sustituir parámetros con nombre en las plantillas (por ejemplo `Vence en {s} s` / `Expires in {s} s`). Un parámetro que no se pasa no deberá dejar la llave visible: se sustituye por cadena vacía y se registra en desarrollo.
- **[RI-03]** (R-022) La función deberá soportar plurales simples con dos formas (singular y plural) elegidas por un parámetro numérico (1 = singular; cualquier otro valor = plural, incluido 0), para los textos que lo necesiten («1 día» / «2 días»; «1 viaje» / «2 viajes»).
- **[RI-04]** (R-022) Si una clave no existe en el idioma activo, deberá usarse el texto en español; si tampoco existe en español, se devuelve la propia clave y se registra en desarrollo. Nunca deberá lanzar una excepción ni mostrar `undefined`.
- **[RI-05]** (D-15) Los textos que son funciones o se arman con lógica (`delayValue`, `getSubmitErrorMessage`, `profile.errors`) deberán seguir produciendo el texto del idioma activo; ningún consumidor deberá quedar leyendo un texto fijo en español capturado al cargar el módulo.

**B2 — Idioma activo**
- **[RI-06]** (R-048) Al abrir la app, el idioma activo se decide en este orden: (1) la preferencia guardada por el usuario en este teléfono; (2) si no hay, el idioma del teléfono cuando es español o inglés (cualquier variante regional); (3) si no, español. Si el valor guardado es inválido, se ignora y se sigue con (2).
- **[RI-07]** (R-048) El idioma del teléfono se lee sin `expo-localization` ni dependencia nueva, con lo que ya trae el entorno de React Native (el plan elige el mecanismo y lo documenta). Si no se puede leer, se trata como no disponible y se usa español.
- **[RI-08]** (R-048) Si el registro del conductor ya guarda `personalData.language`, ese valor solo deberá usarse como sugerencia inicial: aplica únicamente cuando no hay preferencia guardada en el teléfono, y va entre (1) y (2) del orden de RI-06. Nunca pisa una preferencia guardada.
- **[RI-09]** (R-048) El sistema deberá resolver el idioma inicial antes del primer cuadro de la interfaz para que no haya un parpadeo de un idioma a otro al abrir; mientras se lee la preferencia se conserva la pantalla de arranque o de carga actual.

**B3 — Selector y persistencia**
- **[RI-10]** (R-022, R-048) Configuración deberá tener una sección «Idioma / Language» (el título siempre en ambos idiomas) con dos opciones, «Español» y «English», escritas cada una en su propio idioma sin importar el idioma activo.
- **[RI-11]** (R-065) La opción activa deberá mostrar una comprobación visual clara (icono de marca más texto o estado seleccionado, no solo color) y exponerse a los lectores de pantalla como seleccionada; cada opción es un control con rol y estado accesibles, y área táctil ≥ 48 dp. El cambio no usa `Alert`.
- **[RI-12]** (R-048) La elección deberá guardarse en el teléfono (por dispositivo) y no en Firestore. NO se ampliará `validProfileEdit` ni ninguna regla ni colección para el idioma.
- **[RI-13]** (R-048) Cerrar sesión conservará la preferencia de idioma: el flujo de limpieza de la sesión no la borra, y la pantalla de inicio de sesión se ve en el idioma guardado. Otro usuario que inicie sesión en el mismo teléfono ve ese mismo idioma (la preferencia es del dispositivo).
- **[RI-14]** (R-048) Si el guardado de la preferencia falla, el idioma cambia igual para la sesión actual, no aparece error bloqueante, y se muestra un aviso breve en la sección (texto traducido) de que no se recordará al reiniciar.

**B4 — Cambio en vivo**
- **[RI-15]** (R-048) Al elegir otro idioma, todas las pantallas montadas deberán actualizarse al instante sin reiniciar la app, sin remontar la navegación y sin parpadeos de pantalla en blanco.
- **[RI-16]** (R-048, RF-77) El cambio de idioma no deberá alterar el estado del viaje, la solicitud abierta, la ruta, el mapa, lo escrito en formularios ni la tarifa: no reinicia el temporizador de 15 s, no recalcula ni cambia importes y no emite transiciones de la máquina de estados.

**B5 — Cobertura**
- **[RI-17]** (R-022, R-065) Todo texto visible deberá salir del diccionario del idioma activo: títulos, botones, avisos, estados vacíos, de carga y de error, chips, placeholders, `accessibilityLabel` y `accessibilityHint`, mensajes de validación, mensajes de error de servicios, onboarding, registro, viaje (solicitud, curso, resumen, cobro), Historial y Detalle, Ganancias, Perfil, Configuración, inicio de sesión, recuperación de contraseña y cualquier notificación LOCAL que la app programe o muestre.
- **[RI-18]** (R-022) Los diálogos del sistema armados por la app (confirmaciones de salir, cancelar, cerrar sesión) usan el idioma activo en su título, mensaje y botones. Lo que muestra el sistema operativo por su cuenta (permisos de ubicación, cámara, notificaciones) sigue el idioma del teléfono y se declara como límite.
- **[RI-19]** (R-022) El contador «Vence en {s} s» y su versión accesible, el chip de estado, los montos y las fechas se formatean con las reglas del idioma activo sin cambiar el valor que representan.

**B6 — Formatos y datos**
- **[RI-20]** (R-022) Los importes en pesos colombianos (COP) deberán mostrarse con puntos como separador de miles y sin decimales en ambos idiomas (por ejemplo `$ 19.200`), igual que hoy; el idioma no cambia el formato monetario ni la moneda.
- **[RI-21]** (R-022) Las fechas y horas deberán formatearse según el idioma activo (orden de día y mes, nombres de mes y de día abreviado en cada idioma, 24 h o 12 h según convenga a cada idioma; el plan fija el formato exacto y lo documenta). El instante representado y la zona horaria del teléfono no cambian.
- **[RI-22]** (R-022) Las distancias se muestran en kilómetros en ambos idiomas, con coma decimal en español y punto decimal en inglés; las duraciones, en minutos.
- **[RI-23]** (R-022) Los estados del viaje, las categorías de vehículo y los métodos de pago deberán traducirse solo al mostrarlos. Los valores guardados en Firestore y los que viajan a la API o al backend (`status`, `category`, `paymentMethod`, `paymentStatus`, `language`) no cambian con el idioma. Ningún `buildTripRecord`, regla ni cuenta depende del texto visible.

**B7 — Límites declarados**
- **[RI-24]** El sistema deberá declarar en `docs/omisiones-y-limites.md` estos límites, sin tratarlos como defectos:
  - (a) El texto de la notificación push (título «Nueva solicitud de viaje» y cuerpo `Económico · {km} km · {min} min`) lo arma el backend en español y no recibe el idioma del usuario; con la app cerrada o en segundo plano se ve en español aunque la app esté en inglés. Una vez abierta la solicitud, su pantalla sí usa el idioma activo. Cambiarlo exigiría enviar el idioma al backend, lo que se descarta en este lote por RI-12 y queda como mejora.
  - (b) Las direcciones que devuelve Nominatim y los nombres simulados de pasajeros no se traducen.
  - (c) Stripe Checkout (y Mercado Pago) sigue el idioma de la pasarela.
  - (d) Los diálogos de permisos del sistema y el nombre del canal Android (si lo tiene en español) no cambian con el idioma de la app.
  - (e) Los textos de la prueba de mapa y de las herramientas de desarrollo (`mapTest`, `forceState`, `demo`) se traducen con el resto para que la paridad sea total, aunque solo se vean en desarrollo.

## 4. Casos límite
- Teléfono en un idioma distinto de español/inglés (francés, portugués): español (RI-06).
- Teléfono en `es-CO`, `en-US`, `en-GB`, `es-419`: se reconoce por el código base.
- Preferencia guardada con un valor viejo o corrupto (`fr`, vacío, número): se ignora.
- Cambio de idioma con una solicitud abierta: el contador sigue sin saltos y la solicitud conserva su vencimiento (RI-16).
- Cambio de idioma con el viaje en `in_progress` o con el panel de cobro abierto: la pantalla se retraduce; el estado, el cobro y las llamadas en curso no se tocan.
- Un parámetro llega nulo o ausente (por ejemplo `{email}` sin correo): texto sin llaves visibles (RI-02).
- Una clave nueva se añade solo en español: la app muestra el texto en español en inglés (RI-04) y la prueba de paridad falla en integración continua local (`npm test`), de modo que no pasa inadvertido.
- Textos largos del inglés (por ejemplo avisos de pago): deben caber o saltar de línea con la fuente al 200 % sin cortarse (CA-006-D1).
- Arreglo `weekdaysShort`: siete elementos en cada idioma, mismo orden (lunes primero).
- Lectura de la preferencia lenta o fallida: se resuelve con RI-06(2) y (3); nunca bloquea el arranque.
- Dos cambios de idioma seguidos: gana el último y el valor guardado es el último.

## 5. Criterios de aceptación

**B1 — Módulo**
- **CA-006-01** (RI-01) Dado `labels.js` y los diccionarios `es` y `en`, entonces el conjunto de rutas de claves de ambos coincide con el de `labels.js` (hojas de tipo cadena, arreglo y función), sin claves que falten ni sobren. Verifica: test `node:test` de paridad que recorre los tres.
- **CA-006-02** (RI-01) Dado cada par de textos es/en de una misma clave, entonces ninguno es cadena vacía ni solo espacios, y el conjunto de parámetros `{...}` es idéntico en ambos (mismos nombres). Verifica: test de paridad.
- **CA-006-03** (RI-01) El arreglo `weekdaysShort` tiene 7 elementos no vacíos en cada idioma. Verifica: test.
- **CA-006-04** (RI-02) `t('trip.countdown', { s: 7 })` devuelve «Vence en 7 s» en español y «Expires in 7 s» en inglés (o el texto en inglés que fije el diccionario); un parámetro ausente no deja `{s}` visible. Verifica: test de la función de traducción.
- **CA-006-05** (RI-03) Con una clave de plural, `n = 1` da la forma singular, `n = 0`, `n = 2` y `n = 10` dan la plural, en ambos idiomas. Verifica: test.
- **CA-006-06** (RI-04) Con una clave que solo existe en `es`, el idioma `en` devuelve el texto español; con una clave que no existe en ninguno devuelve la clave y no lanza. Verifica: test.
- **CA-006-07** (RI-05) `delayValue(15)`, `getSubmitErrorMessage('permission-denied')` y `profile.errors.fullName` devuelven texto distinto en cada idioma activo y el mismo contenido de significado. Verifica: test.

**B2 — Idioma inicial**
- **CA-006-08** (RI-06) Tabla de resolución con entradas (preferencia guardada, sugerencia del registro, idioma del teléfono) y salida esperada, cubriendo al menos: guardado `en` con teléfono `es` da `en`; sin guardado y teléfono `en-US` da `en`; sin guardado y teléfono `fr` da `es`; guardado `fr` inválido con teléfono `en` da `en`; sin nada da `es`. Verifica: test de la función pura de resolución.
- **CA-006-09** (RI-08) Con sugerencia del registro `en` y sin preferencia guardada, el resultado es `en` aunque el teléfono sea `es`; con preferencia guardada `es` y sugerencia `en`, el resultado es `es`. Verifica: test.
- **CA-006-10** (RI-07) Con la lectura del idioma del teléfono fallando o no disponible, el resultado es `es` y no se lanza. Verifica: test con lector falso.
- **CA-006-11** (RI-09) No verificado en dispositivo: al abrir la app con inglés guardado no se ve ningún cuadro en español antes del inglés. Tarea: prueba en celular (la define el plan).

**B3 — Selector**
- **CA-006-12** (RI-10) Configuración contiene la sección «Idioma / Language» con dos opciones «Español» y «English», y su título es el mismo en ambos idiomas. Verifica: test del componente o de su descripción y lectura.
- **CA-006-13** (RI-11) La opción activa tiene icono de comprobación y estado accesible «seleccionado»; la inactiva no; ambas con rol y área táctil ≥ 48 dp. Verifica: test de las propiedades de accesibilidad y lectura del componente. No verificado en dispositivo (TalkBack/VoiceOver y tamaño real). Tarea: captura y prueba en celular.
- **CA-006-14** (RI-12) Elegir un idioma no escribe en Firestore, no llama a `validProfileEdit` y no cambia ninguna regla ni lista de campos permitidos. Verifica: test con repositorio falso y búsqueda con `grep` del campo en `validProfileEdit` y en `firestore.rules`.
- **CA-006-15** (RI-12) Elegir un idioma guarda la preferencia en el almacenamiento local con un valor `es` o `en`; reabrir (nueva resolución con ese almacenamiento) devuelve el mismo idioma. Verifica: test con almacenamiento falso.
- **CA-006-16** (RI-13) Tras el cierre de sesión (la limpieza de sesión real con sus dependencias falsas) la preferencia de idioma sigue en el almacenamiento. Verifica: test sobre el flujo de limpieza (`buildSessionResetDeps`).
- **CA-006-17** (RI-14) Con un almacenamiento que lanza error al guardar, el idioma activo cambia igual y se muestra el aviso; no hay excepción. Verifica: test.
- **CA-006-18** No verificado en dispositivo: cambiar a inglés, reiniciar la app y comprobar que sigue en inglés; cerrar sesión y ver el inicio de sesión en inglés. Tarea: prueba en celular.

**B4 — En vivo**
- **CA-006-19** (RI-15) Con el idioma cambiado en el proveedor, un componente suscrito vuelve a renderizar con el texto nuevo sin desmontarse (misma instancia). Verifica: test del proveedor/hook con renderizador de pruebas si el proyecto ya lo usa; si no, test del almacén de idioma que comprueba la notificación a los suscriptores (y el resto NO VERIFICADO hasta el celular).
- **CA-006-20** (RI-16) Con un viaje en curso y una solicitud abierta (controlador y temporizador con reloj inyectado), cambiar el idioma no cambia el estado del controlador, no reinicia ni reprograma el temporizador de 15 s y no cambia `fare`, `commission` ni `driverEarnings`. Verifica: test que compara el estado y el importe antes y después.
- **CA-006-21** No verificado en dispositivo: con la solicitud abierta y el contador en marcha, cambiar el idioma desde la sección de ajustes accesible (o, si no es accesible durante la solicitud, antes de recibirla y tras terminar el viaje) no produce parpadeos ni salto del contador. Tarea: prueba en celular.

**B5 — Cobertura**
- **CA-006-22** (RI-17) Ningún archivo de `src/screens/`, `src/components/` ni `src/app/` (o los directorios de pantalla que el plan liste) contiene texto literal visible en JSX, en propiedades `accessibilityLabel`/`accessibilityHint`/`placeholder`/`title`, ni en llamadas a `Alert.alert`, fuera de la lista de excepciones. Verifica: test «anti texto suelto» que recorre esos archivos.
- **CA-006-23** (RI-17) La lista de excepciones del test CA-006-22 es un archivo versionado, con una razón escrita por entrada (por ejemplo la marca «UberClone», símbolos como «★» o «·», unidades puramente numéricas, identificadores de prueba), sin comodines que cubran directorios completos. Verifica: lectura de la lista y test que falla si una entrada ya no coincide con nada.
- **CA-006-24** (RI-17) Todas las pantallas y componentes con textos pasan por la función de traducción o el hook; ninguno importa `labels.js` directamente para mostrar texto, salvo el módulo de i18n. Verifica: búsqueda con `grep` de importaciones de `labels` fuera del módulo de i18n (o de la lista de excepciones del plan) y test.
- **CA-006-25** (RI-18) Los diálogos armados por la app (`Alert.alert`) reciben título, mensaje y botones del diccionario activo. Verifica: test que recorre sus usos.
- **CA-006-26** (RI-17) Si existe alguna notificación LOCAL, su título y cuerpo salen del diccionario del idioma activo al programarse; si no existe ninguna, queda registrado en el informe de la tarea con la búsqueda hecha. Verifica: test o evidencia de búsqueda.
- **CA-006-27** (RI-17) No verificado en dispositivo: recorrer cada pantalla en español y en inglés (registro, inicio, solicitud, viaje, resumen, cobro, Historial, Detalle, Ganancias, Perfil, Configuración, inicio de sesión, recuperación) sin ver un texto del otro idioma. Tarea: prueba en celular con lista de pantallas.

**B6 — Formatos**
- **CA-006-28** (RI-20) Con 19200, el formato de moneda devuelve `$ 19.200` (o la forma exacta existente hoy) en `es` y en `en`; con 0 y con 1234567 usa puntos de miles en ambos. Verifica: test.
- **CA-006-29** (RI-21) Con un instante fijo y zona fija, la fecha y la hora formateadas difieren según el idioma en el orden o el nombre del mes y del día, y representan el mismo instante. Verifica: test con zona horaria inyectada.
- **CA-006-30** (RI-22) 8,5 km se ve `8,5 km` en español y `8.5 km` en inglés; la duración `22 min` en ambos. Verifica: test.
- **CA-006-31** (RI-23) Para un conjunto de viajes con estados, categorías y métodos de pago, el texto mostrado cambia con el idioma y el valor guardado (`buildTripRecord`) y el que se envía a la API son idénticos en ambos idiomas. Verifica: test que compara registros construidos con `es` y con `en`.
- **CA-006-32** (RI-16, RI-23) La tarifa calculada para la solicitud de ejemplo (8,5 km / 22 min, Económico: 19200, comisión 3840, ganancia 15360) es la misma con `es` y con `en`. Verifica: test.

**B7 — Límites**
- **CA-006-33** (RI-24) `docs/omisiones-y-limites.md` contiene los cinco límites (a) a (e), y el (a) describe el texto real del backend (`Nueva solicitud de viaje`; `Económico · {km} km · {min} min`). Verifica: lectura del documento contra `backend/src/notifications/payload.js`.
- **CA-006-34** (RI-12, RI-24a) El backend no se modifica en este lote: `backend/` no cambia respecto al estado previo. Verifica: `git diff` de `backend/` vacío al cerrar el lote.

**Diseño**
- **CA-006-D1** El `design-auditor` revisa los textos en inglés con la fuente del sistema al 200 % en: botones (Aceptar/Accept, Rechazar/Reject, Llegué/I've arrived, Finalizar viaje, Confirmar cobro, acciones de cobro), chips (estado del viaje, cobro, método), contador «Expires in {s} s», Historial (ítem, filtros, gráfica) y Detalle, y confirma que no hay texto cortado, superpuesto ni botones que pierdan el área táctil de 48 dp. Estado: **Pendiente de dispositivo**; la parte que se puede revisar con capturas del arnés se hace antes y lo demás queda «No verificado en dispositivo». Tarea: capturas en celular al 200 %.
- **CA-006-D2** (RI-11) La comprobación del idioma activo mantiene contraste ≥ 4,5:1 del texto y ≥ 3:1 del icono con los tokens de `DESIGN.md` (cálculo con script temporal sobre los tokens) y no depende solo del color. Verifica: cálculo y lectura del componente. No verificado en dispositivo.
- **CA-006-D3** El selector usa componentes y tokens existentes, sin dependencias nuevas, y sigue el orden y el espaciado de las demás secciones de Configuración. Verifica: lectura del componente y de `DESIGN.md`.

## 6. Fuera de alcance
Más idiomas que es/en; traducir direcciones de Nominatim, nombres de pasajeros o Stripe Checkout; enviar el idioma al backend o traducir el push; guardar el idioma en Firestore o ampliar `validProfileEdit`; formatos de moneda distintos del COP; escritura de derecha a izquierda; dependencias nuevas (`expo-localization`, `i18next`, etc.); resolver la discrepancia de D-10; cambios en `firestore.rules`.

## 7. Matriz requisito → criterios

| Requisito | Fuente | CA |
|---|---|---|
| RI-01 | D-15, D-29; R-022 | CA-006-01, 02, 03 |
| RI-02 | R-022 | CA-006-04 |
| RI-03 | R-022 | CA-006-05 |
| RI-04 | R-022 | CA-006-06 |
| RI-05 | D-15 | CA-006-07 |
| RI-06 | R-048 | CA-006-08, 09 |
| RI-07 | R-048 | CA-006-10 |
| RI-08 | R-048 | CA-006-09 |
| RI-09 | R-048 | CA-006-11 |
| RI-10 | R-022, R-048 | CA-006-12 |
| RI-11 | R-065 | CA-006-13, D2 |
| RI-12 | R-048 | CA-006-14, 15, 34 |
| RI-13 | R-048 | CA-006-16, 18 |
| RI-14 | R-048 | CA-006-17 |
| RI-15 | R-048 | CA-006-19, 21 |
| RI-16 | R-048, RF-77 | CA-006-20, 21, 32 |
| RI-17 | R-022, R-065 | CA-006-22, 23, 24, 26, 27, D1 |
| RI-18 | R-022 | CA-006-25 |
| RI-19 | R-022 | CA-006-04, 29, D1 |
| RI-20 | R-022 | CA-006-28 |
| RI-21 | R-022 | CA-006-29 |
| RI-22 | R-022 | CA-006-30 |
| RI-23 | R-022 | CA-006-31, 32 |
| RI-24 | Anderson (límites) | CA-006-33, 34 |

Pruebas exigidas por Anderson y su CA: paridad es/en (CA-006-01..03), anti texto suelto con excepciones justificadas (CA-006-22, 23), función de traducción (CA-006-04..07), orden de resolución del idioma inicial (CA-006-08..10) y que cambiar el idioma no altera valores guardados ni la tarifa (CA-006-20, 31, 32).

## 8. Decisiones propuestas (SOLO propuestas, nada en «Vigente»)

- **D-188 — Idioma por dispositivo, sin Firestore.** La preferencia vive en el almacenamiento local del teléfono y sobrevive al cierre de sesión; `personalData.language` del registro solo es sugerencia inicial. Esto REEMPLAZA la parte «y se guarda en el perfil» del criterio de G-05 del plan (que decía «se guarda en el perfil») por decisión de Anderson; Anderson debe confirmar que la omisión queda documentada. Alternativa descartada: guardar también en Firestore (exige ampliar `validProfileEdit` y reglas).
- **D-189 — Idioma del push fuera de alcance.** El texto de la notificación sigue siendo el del backend en español; se declara como límite (RI-24a). Alternativa: enviar el idioma al backend al registrar el token y armar el texto allí (más fiel al taller, toca backend, reglas y pruebas).
- **D-15 sigue en Propuesta.** Esta spec la desarrolla, no la aprueba.

## 9. Supuestos y riesgos
- Lectura conservadora: el idioma del teléfono se detecta con lo que ya trae React Native, sin `expo-localization`; si resulta imposible sin dependencia, el plan lo escala a Anderson y, mientras tanto, el orden RI-06 cae en español.
- Unas 495 cadenas: el riesgo mayor es traducción incompleta o de mala calidad en partes poco visitadas; la paridad automática solo comprueba presencia, no calidad. La revisión de redacción en inglés la hace Anderson.
- Modificar los 48 importadores de `labels.js` es un cambio amplio; el plan decide cómo hacerlo por etapas sin romper pantallas.
- El PDF del enunciado no se renderizó aquí: R-022, R-048 y R-065 se toman de la matriz del plan.
- El nombre del canal Android y el texto de cualquier plugin de configuración no se inspeccionaron (NO VERIFICADO).

## 10. Qué debe aprobar Anderson
Esta spec (Borrador); D-15 (sigue Propuesta) y las propuestas D-188 y D-189; en particular que el idioma no se guarde en el perfil (diferencia con el criterio literal de G-05), que el push siga en español, la lista de límites (a) a (e), y la revisión de las traducciones al inglés. Mientras no la apruebe, la implementación continúa por su instrucción y esta spec queda como Borrador; esta instrucción no sustituye la aprobación formal.
