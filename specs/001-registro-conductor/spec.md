# Spec 001 — Registro del conductor

Estado: Aprobada (Anderson, 2026-11-01, prompt #24; registrada por el agente principal). La estructura y el alcance quedan aprobados; las decisiones D-60 a D-64 citadas aquí siguen en estado "Propuesta" en `docs/decisiones.md` hasta que Anderson las confirme una por una (ver el resumen de la entrega).
Requisitos cubiertos: RF-01 a RF-07, RNF-04, RNF-07. Fuentes: F1 §2 (vía `docs/requisitos.md`), ENCARGO (D-51, entrega parcial 2026-11-05).

## 0. Qué ya existe (no se repite; esta spec construye sobre ello)
La spec 000 ya dejó: `RegistrationTabs` con las tres pestañas (Datos personales, Vehículo, Documentos, `tab-personal-data`/`tab-vehicle`/`tab-documents`, en ese orden); cada pestaña es hoy un `PlaceholderScreen` sin contenido real; `PersonalDataScreen` trae un campo de demostración (`personal-data-field-shared`) y `VehicleScreen` muestra su valor (`vehicle-shared-value`); `DevAccountSwitch` (`dev-account-*`) simula `accountStatus` en memoria desde `AppStateContext` (`ACCOUNT_STATUS`: `loading`, `pending`, `approved`, `error`). Esta spec reemplaza el contenido de las tres pantallas de registro, retira el campo de demostración y empieza a sustituir el simulador de cuenta por el estado real (parcialmente: ver D-57, D-60 y D-50 ya Vigente).

## 1. Objetivo y porqué
Dejar el registro del conductor totalmente funcional para la entrega parcial del 2026-11-05 (D-51, Vigente): las pestañas Datos personales y Vehículo con sus campos y validaciones completos, una pestaña Documentos mínima (D-55, Propuesta) y un envío real que sube las fotos, crea el documento del conductor en Firestore y deja la cuenta «Pendiente de aprobación». Sin esto, la profesora no puede ver un registro que de verdad persista datos, y las specs siguientes (002 en adelante) no tendrían una cuenta real sobre la que operar.

### Fuera de alcance de esta spec
- Licencia, SOAT y revisión técnico-mecánica (resto de RF-07): ligadas a P-04 (PARADA), que sigue sin resolver la regla de la revisión técnico-mecánica. No son requisito de esta spec (D-55).
- Que la cuenta pase a «Aprobado»: sigue siendo manual en la base de datos (RF-04, F1 §2); esta spec solo deja la cuenta en «pending» al enviar.
- El interruptor Disponible/No disponible y su bloqueo mientras la cuenta no esté Aprobada: spec 002.
- Traducción completa de la interfaz a inglés (D-15, Propuesta): esta spec solo guarda la preferencia de idioma que el conductor elige en el formulario.
- Cambios en `backend/` (D-58, Propuesta).
- Retiro completo de `DevAccountSwitch`: esta spec lo vuelve innecesario para ver `pending` después de enviar el registro, pero sigue siendo la única forma de simular `approved`/`error`/`loading` sin backend de administración; su retiro total depende también de la spec 008 (D-50, Vigente).

## 2. Requisitos

### Pestaña 1 — Datos personales (RF-05)
- [RF-05] El sistema deberá pedir una foto de perfil, obligatoria, elegida por cámara o por galería.
- [RF-05, D-54] Cuando el conductor elija una foto, el sistema deberá subirla a Cloudinary de inmediato y el campo no deberá considerarse válido hasta que la subida termine con éxito.
- [RF-05] El sistema deberá validar el nombre con un máximo de 50 caracteres, solo letras y espacios (D-61: incluye tildes y la ñ).
- [RF-05] El sistema deberá validar el número de documento como una cadena de 6 a 10 dígitos.
- [RF-05] El sistema deberá validar el celular como una cadena de exactamente 10 dígitos.
- [RF-05] El sistema deberá ofrecer un selector de fecha de nacimiento y deberá rechazar cualquier fecha que no corresponda a una persona mayor de 18 años cumplidos a la fecha de hoy.
- [RF-05] El sistema deberá pedir el género mediante una lista desplegable de selección obligatoria (D-63: opciones Femenino, Masculino, Otro, Prefiero no decir).
- [RF-05, D-62] El sistema deberá validar el correo con el patrón `algo@dominio.algo` (arroba y al menos un punto en el dominio).
- [RF-05] El sistema deberá pedir el idioma mediante una lista desplegable de selección obligatoria con las opciones Español e Inglés.
- [RF-03] Si cualquiera de los ocho campos anteriores queda vacío o no cumple su regla, entonces el sistema no deberá considerarlo válido y deberá mostrar el error bajo ese campo.

### Pestaña 2 — Vehículo (RF-06)
- [RF-06] El sistema deberá pedir la categoría del vehículo mediante una lista desplegable de selección obligatoria con las opciones Económico, XL y Premium.
- [RF-06, D-14] El sistema deberá normalizar la placa escrita a mayúsculas antes de validarla y deberá aceptar solo el patrón de placa de carro `ABC123` (tres letras seguidas de tres dígitos).
- [RF-06] El sistema deberá validar la marca y el modelo del vehículo, cada uno con un máximo de 30 caracteres y sin quedar vacío.
- [RF-06] El sistema deberá validar el año del vehículo como un número de 4 dígitos menor o igual al año actual.
- [RF-06] El sistema deberá pedir el color mediante una lista desplegable de selección obligatoria (D-64: opciones Blanco, Negro, Gris, Plata, Rojo, Azul, Verde, Amarillo, Otro).
- [RF-06] El sistema deberá validar la capacidad como un número entero positivo; donde la categoría elegida sea XL, el sistema deberá exigir una capacidad mínima de 6.
- [RF-06] El sistema deberá pedir una foto del vehículo con la placa visible, obligatoria, elegida por cámara o por galería.
- [RF-06, D-54] Cuando el conductor elija la foto del vehículo, el sistema deberá subirla a Cloudinary de inmediato y el campo no deberá considerarse válido hasta que la subida termine con éxito.
- [RF-03] Si cualquiera de los siete campos anteriores (contando marca y modelo como uno) queda vacío o no cumple su regla, entonces el sistema no deberá considerarlo válido y deberá mostrar el error bajo ese campo.

### Pestaña 3 — Documentos, alcance mínimo de esta entrega (RF-07, D-55)
- [RF-07, D-55] El sistema deberá pedir el correo de Mercado Pago con el mismo patrón de validación que el correo personal (`algo@dominio.algo`, D-62).
- [RF-07, D-55] El sistema deberá mostrar una casilla de aceptación de términos con el porcentaje de comisión de la plataforma visible en su texto (20 %, RF-21/F1 §5); mientras la casilla no esté marcada, el sistema no deberá considerar válida esta pestaña.
- [RF-07] El sistema no deberá pedir en esta entrega licencia, SOAT ni revisión técnico-mecánica (quedan fuera de alcance, ligadas a P-04).

### Envío del registro (RF-02, RF-03, RF-04)
- [RF-02] El sistema deberá habilitar la acción «Enviar registro» (alcanzable desde la pestaña Documentos, última del flujo) únicamente cuando los ocho campos de Datos personales, los siete de Vehículo y los dos de Documentos de esta entrega sean válidos.
- [RF-02] Si algún campo de cualquiera de las tres pestañas está vacío o inválido, entonces el sistema no deberá habilitar «Enviar registro», se haya visitado o no esa pestaña.
- [RF-03] El sistema no deberá usar `Alert` en ningún momento del formulario de registro; todo error de validación se muestra bajo su campo.
- [RF-04, D-52, D-53] Cuando el conductor envíe el registro válido, el sistema deberá crear o actualizar el documento `drivers/{uid}` en Firestore con `accountStatus: "pending"`, los datos de las tres pestañas y las URLs de las fotos ya subidas (no antes: la subida ocurre al elegir cada foto, el documento se crea o actualiza al enviar).
- [RF-04] El cambio de la cuenta a `approved` sigue siendo manual en la base de datos (F1 §2); esta spec no lo automatiza.

### Estado de la cuenta en tiempo real (D-57, D-60, RNF-02)
- [D-57] El sistema deberá leer el `accountStatus` de `drivers/{uid}` en Firestore con `onSnapshot` y deberá liberar la suscripción en el retorno del `useEffect` (RNF-02, constitución §5, C11).
- [D-60] Mientras no exista el documento `drivers/{uid}` (conductor nuevo que no ha enviado el registro), el sistema deberá tratarlo como «cuenta no registrada» y mostrar la rama de Registro (D-11), no un estado de error.
- [D-60] Si la lectura de `drivers/{uid}` falla por red o permisos (no por ausencia del documento), entonces el sistema deberá mostrar el estado de error.

### Datos sensibles y almacenamiento local (RNF-04)
- [RNF-04] El sistema no deberá guardar en `AsyncStorage` ningún campo del formulario de registro (nombre, documento, celular, fecha de nacimiento, correos, placa, fotos) ni datos bancarios; esos datos viven en Firestore y, mientras se completa el formulario, en el estado de la pantalla.

### Imágenes (RNF-07, D-54)
- [RNF-07, D-54] El sistema deberá subir la foto de perfil y la foto del vehículo a Cloudinary mediante subida directa sin firma (upload preset sin firma), usando en el código solo los nombres de las variables de entorno públicas (`EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`), nunca sus valores.

### Seguridad de los datos (D-52)
- [D-52] El sistema deberá restringir, mediante las reglas de seguridad de Firestore, la lectura y escritura de `drivers/{uid}` al propio `uid` autenticado; ningún otro `uid` deberá poder leer ni escribir ese documento.

## 3. Decisiones relacionadas
Ya Vigentes (aprobadas por Anderson antes de esta spec; registradas por el agente principal, prompt #24, punto 4): D-52 (Firestore vía SDK JS `firebase`, no `@react-native-firebase`), D-53 (Firebase Auth anónimo, `uid` = `driverId`), D-54 (Fotos con Cloudinary, upload preset sin firma, variables `EXPO_PUBLIC_*`), D-55 (Pestaña 3 mínima para esta entrega), D-56 (Desplegables con `Modal` + `FlatList` propios, sin dependencia nativa), D-57 (`accountStatus` real en `drivers/{uid}`, escuchado con `onSnapshot`), D-58 (El backend Express no se toca en esta entrega).

Nuevas, propuestas por esta spec (estado Propuesta en `docs/decisiones.md`; ninguna queda Vigente aquí, las lista el apartado «Qué debe aprobar el equipo» de mi reporte final):
- D-60 — Sin documento `drivers/{uid}`: se trata como «no registrado», no como error.
- D-61 — «Nombre: solo letras» incluye tildes y la ñ.
- D-62 — «Correo con @ y dominio»: exige al menos un punto en el dominio.
- D-63 — Opciones del desplegable de género.
- D-64 — Opciones del desplegable de color del vehículo.

Decisiones ya existentes que esta spec usa sin cambiarlas: D-05 (Propuesta, Firestore como base de datos), D-11 (Vigente, rama de Registro mientras la cuenta no sea Aprobada), D-14 (Propuesta, placa solo de carro), D-15 (Propuesta, i18n; fuera de alcance aquí salvo guardar la preferencia), D-50 (Vigente, retiro de `DevAccountSwitch` compartido con la spec 008), D-51 (Vigente, entrega parcial).

Dependencias nuevas que esta spec necesita y que no están hoy en `scripts/dependencies.json` (el equipo debe decidirlas antes de instalar nada; esta spec-author no edita ese archivo): `firebase` (D-52); `expo-image-picker` ya figura en `proposed` (cámara/galería, RF-05/RF-06) y debe promoverse a `allowed` con una decisión Vigente antes de usarse. El selector de fecha de nacimiento (RF-05) y los desplegables (D-56) no deberían necesitar ninguna dependencia nueva si se construyen con `Modal`/`FlatList` propios; si el equipo prefiriera `@react-native-community/datetimepicker` o `@react-native-picker/picker` (hoy en `proposed`), necesitaría su propia decisión Vigente antes de instalarse.

## 4. Criterios de aceptación

### Datos personales
CA-001-01 [RF-05, D-54]
Dado el campo de foto de perfil vacío, Cuando el conductor elige una foto por cámara o por galería, Entonces la foto se sube a Cloudinary y el campo queda válido solo cuando la subida termina con éxito; si el campo sigue vacío, no es válido.
Cómo se verifica: paso manual en el celular (elegir foto, comprobar que la URL subida es accesible) y revisión de código de la regla de validación. **Verificado en dispositivo por declaración (Anderson, Android, 2026-11-02; checkpoint 1 cerrado):** tras D-68 (subida en base64), la foto por cámara y por galería funciona sin fallos, declarado sin capturas ni detalle por paso. Pendiente aparte la revisión de código independiente de la regla de validación / `cloudinary.js` (T-19, verifier distinto, aún sin cerrar).

CA-001-02 [RF-05, D-61, D-71]
Dado el campo de nombre, Cuando se escribe un valor vacío, con más de 50 caracteres, con dígitos o con símbolos, Entonces el campo es inválido y el error aparece bajo el campo; con un nombre de hasta 50 caracteres usando solo letras (incluidas tildes y ñ) y espacios, el campo es válido. Enmienda (D-71, 2026-11-02, prompt #34, punto 3a): un valor con espacios al inicio o al final se guarda SIN esos espacios (recortado en la frontera de envío, no en cada tecla); el nombre guardado nunca termina ni empieza en espacio.
Cómo se verifica: script de prueba fuera del proyecto contra la función de validación, o prueba unitaria.

CA-001-03 [RF-05]
Dado el campo de número de documento, Cuando se escribe un valor con menos de 6 dígitos, con más de 10, o con algo distinto de dígitos, Entonces el campo es inválido; con 6 a 10 dígitos es válido.
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria.

CA-001-04 [RF-05]
Dado el campo de celular, Cuando se escribe un valor distinto de exactamente 10 dígitos, Entonces el campo es inválido; con exactamente 10 dígitos es válido.
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria.

CA-001-05 [RF-05]
Dado el selector de fecha de nacimiento, Cuando se elige una fecha que da menos de 18 años cumplidos hoy, Entonces el campo es inválido; con una fecha que da 18 años o más, es válido.
Cómo se verifica: script de prueba fuera del proyecto contra la función de validación (casos con fecha de hoy fija) y paso manual del selector en el celular. **No verificado en dispositivo** (la apertura del selector; tarea por asignar).

CA-001-06 [RF-05, D-63]
Dado el desplegable de género, Cuando no se elige ninguna opción, Entonces el campo es inválido; al elegir una de Femenino, Masculino, Otro o Prefiero no decir, el campo es válido.
Cómo se verifica: paso manual en el celular y revisión de código. **No verificado en dispositivo** (apertura y selección en el `Modal`; tarea por asignar).

CA-001-07 [RF-05, D-62, D-71]
Dado el campo de correo, Cuando se escribe un valor sin `@`, sin punto después del `@`, o vacío, Entonces el campo es inválido; con un valor de forma `algo@dominio.algo`, es válido. Enmienda (D-71, 2026-11-02, prompt #34, punto 3a): un valor con espacios al inicio o al final se guarda SIN esos espacios (recortado en la frontera de envío, no en cada tecla).
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria.

CA-001-08 [RF-05]
Dado el desplegable de idioma, Cuando no se elige Español ni Inglés, Entonces el campo es inválido; al elegir uno de los dos, es válido.
Cómo se verifica: paso manual en el celular y revisión de código. **No verificado en dispositivo** (tarea por asignar).

### Vehículo
CA-001-09 [RF-06]
Dado el desplegable de categoría, Cuando no se elige ninguna opción, Entonces el campo es inválido; al elegir Económico, XL o Premium, es válido.
Cómo se verifica: paso manual en el celular y revisión de código. **No verificado en dispositivo** (tarea por asignar).

CA-001-10 [RF-06, D-14]
Dado el campo de placa, Cuando se escribe `abc123`, `Abc123` o `ABC123`, Entonces las tres se normalizan a `ABC123` y el campo es válido; con un valor que no sea tres letras seguidas de tres dígitos (p. ej. `AB1234` o formato de moto `ABC12D`), el campo es inválido.
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria.

CA-001-11 [RF-06, D-71]
Dado los campos de marca y modelo, Cuando cualquiera queda vacío o supera 30 caracteres, Entonces ese campo es inválido; con un valor no vacío de hasta 30 caracteres en cada uno, ambos son válidos. Enmienda (D-71, 2026-11-02, prompt #34, punto 3a): el límite de 30 caracteres y el de no-vacío se evalúan sobre el valor recortado (sin espacios al inicio/fin); el valor guardado también se recorta en la frontera de envío, no en cada tecla.
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria.

CA-001-12 [RF-06]
Dado el campo de año, Cuando se escribe un valor que no tiene 4 dígitos o que es mayor al año actual, Entonces el campo es inválido; con 4 dígitos y un valor menor o igual al año actual (incluido el año actual), es válido.
Cómo se verifica: script de prueba fuera del proyecto con el año actual simulado, o prueba unitaria.

CA-001-13 [RF-06, D-64]
Dado el desplegable de color, Cuando no se elige ninguna opción, Entonces el campo es inválido; al elegir una de la lista (Blanco, Negro, Gris, Plata, Rojo, Azul, Verde, Amarillo, Otro), es válido.
Cómo se verifica: paso manual en el celular y revisión de código. **No verificado en dispositivo** (tarea por asignar).

CA-001-14 [RF-06]
Dado el campo de capacidad, Cuando la categoría es XL y se escribe un valor menor a 6, Entonces el campo es inválido; con 6 o más es válido. Para Económico y Premium, cualquier entero positivo es válido y un valor vacío, cero, negativo o no numérico es inválido en cualquier categoría.
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria.

CA-001-15 [RF-06, D-54]
Dado el campo de foto del vehículo, Cuando el conductor elige una foto por cámara o por galería, Entonces la foto se sube a Cloudinary y el campo queda válido solo cuando la subida termina con éxito; si el campo sigue vacío, no es válido. Que la placa quede visible en la foto es una revisión manual, no automatizable.
Cómo se verifica: paso manual en el celular. **No verificado en dispositivo** (tarea por asignar).

### Documentos (alcance mínimo)
CA-001-16 [RF-07, D-55, D-62, D-71]
Dado el campo de correo de Mercado Pago, Cuando se escribe un valor sin `@`, sin punto después del `@`, o vacío, Entonces el campo es inválido; con un valor de forma `algo@dominio.algo`, es válido. Enmienda (D-71, 2026-11-02, prompt #34, punto 3a): un valor con espacios al inicio o al final se guarda SIN esos espacios (recortado en la frontera de envío, no en cada tecla).
Cómo se verifica: script de prueba fuera del proyecto o prueba unitaria (misma función que CA-001-07).

CA-001-17 [RF-07, D-55]
Dado la casilla de términos, Cuando no está marcada, Entonces la pestaña Documentos no es válida; al marcarla, con el texto visible mostrando el 20 % de comisión, es válida.
Cómo se verifica: paso manual en el celular (texto del porcentaje visible) y revisión de código. **No verificado en dispositivo** (que el texto se vea completo en pantalla; tarea por asignar).

### Envío
CA-001-18 [RF-02]
Dado cualquier campo inválido o vacío en cualquiera de las tres pestañas (visitada o no), Cuando se revisa la acción «Enviar registro», Entonces está deshabilitada; solo se habilita cuando los 17 campos de esta entrega (8 + 7 + 2) son válidos.
Cómo se verifica: prueba unitaria sobre la función que calcula si el formulario es válido, y paso manual en el celular. **No verificado en dispositivo** (tarea por asignar).

CA-001-19 [RF-03]
Dado el formulario de registro completo, Cuando se revisa el código de las tres pantallas, Entonces no aparece ninguna llamada a `Alert` para errores de validación.
Cómo se verifica: revisión de código (búsqueda de `Alert` en los archivos de registro) y `node scripts/check-constitution.mjs` (regla C05).

CA-001-20 [RF-03]
Dado cualquiera de los 17 campos con un valor inválido, Cuando se revisa la pantalla, Entonces el mensaje de error aparece inmediatamente bajo ese campo y en ningún otro lugar.
Cómo se verifica: paso manual en el celular por campo. **No verificado en dispositivo** (tarea por asignar); revisión de código como apoyo.

CA-001-21 [RF-04, D-52, D-53]
Dado el formulario válido, Cuando el conductor envía el registro, Entonces se crea o actualiza el documento `drivers/{uid}` en Firestore con `accountStatus: "pending"`, los 17 campos y las URLs de las dos fotos ya subidas.
Cómo se verifica: script fuera del proyecto que lee el documento con el SDK de Firestore tras un envío de prueba (con datos de prueba, nunca reales, ENT-05), o emulador de Firestore. **No verificado en dispositivo** para el flujo completo en el celular (tarea por asignar); la lectura del documento es automatizable fuera del dispositivo. **Checkpoint 3 cerrado (Anderson, Android, 2026-11-02, prompt #34):** declaró envío real sin errores y documento creado en `drivers/{uid}` con la forma esperada (confirmado con captura solo de Firestore). CA-001-21 pasa a ✅ por declaración.

CA-001-22 [D-52]
Dado un segundo `uid` distinto del dueño del documento, Cuando intenta leer o escribir `drivers/{uid-del-dueño}`, Entonces las reglas de seguridad de Firestore rechazan la operación; el propio `uid` sí puede leer y escribir su documento.
Cómo se verifica: script fuera del proyecto con el SDK de Firestore usando dos sesiones anónimas distintas, contra el emulador de reglas de Firestore o el proyecto de prueba.

CA-001-23 [D-53]
Dado que la app nunca ha autenticado al dispositivo, Cuando arranca, Entonces Firebase Auth crea una sesión anónima y el `uid` resultante se usa como `driverId` en todo el registro.
Cómo se verifica: revisión de código y paso manual (revisar el `uid` en la consola de Firebase tras abrir la app). **No verificado en dispositivo** (tarea por asignar).

CA-001-24 [D-57, D-60]
Dado un `uid` sin documento `drivers/{uid}`, Cuando la app escucha su estado de cuenta, Entonces se muestra la rama de Registro, no un estado de error; dado un documento existente, Cuando cambia su `accountStatus` en Firestore, Entonces la app lo refleja sin recargar, y la suscripción `onSnapshot` se libera al desmontarse la pantalla que la abrió.
Cómo se verifica: paso manual (cambiar el campo en la consola de Firebase y observar la app) y revisión de código de la limpieza del `useEffect` (`node scripts/check-constitution.mjs`, regla C11). **No verificado en dispositivo** (tarea por asignar). **Checkpoint 3 cerrado (Anderson, Android, 2026-11-02, prompt #34):** declaró que al cambiar `accountStatus` a `approved` en la consola la app pasó sola de las pestañas a la pantalla principal sin reiniciar, que se mantiene al cerrar y reabrir, y que al volver a `pending` regresó sola a las pestañas (aunque sin precargar los datos ya guardados — ese vacío de precarga lo cubre el nuevo T-32 propuesto, no es un defecto de esta CA). CA-001-24 pasa a ✅ por declaración.

CA-001-25 [RNF-04]
Dado el código de esta spec, Cuando se revisa cada uso de `AsyncStorage`, Entonces ninguno guarda un campo del formulario de registro ni un dato bancario.
Cómo se verifica: revisión de código (búsqueda de `AsyncStorage` en los archivos de registro) y `node scripts/check-constitution.mjs` (regla C04).

CA-001-26 [D-58]
Dado el directorio `backend/`, Cuando se compara su contenido antes y después de implementar esta spec, Entonces no hay cambios.
Cómo se verifica: `git diff --stat backend/` vacío al cerrar la spec.

CA-001-27 [RF-07, P-04]
Dado la pestaña Documentos, Cuando se revisa su contenido, Entonces no pide licencia, SOAT ni revisión técnico-mecánica en esta entrega.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-001-28 [RF-04, D-72]
Dado un envío de registro exitoso, Cuando `submitRegistration` termina sin error, Entonces la pestaña Documentos muestra el texto «Registro enviado. Tu cuenta está pendiente de aprobación.» con el `testID` `documents-submit-success`.
Cómo se verifica: revisión de código contra el contrato de `testID`/`labels.js` y paso manual. **No verificado en dispositivo** (tarea por asignar: T-31).

CA-001-29 [RF-03, RF-04, D-72]
Dado un documento `drivers/{uid}` con `accountStatus: "pending"`, Cuando el conductor abre cualquiera de las tres pestañas de registro, Entonces se muestra un aviso «Pendiente de aprobación» y el botón «Enviar registro» está deshabilitado, sin que ningún campo individual cambie su comportamiento de solo-lectura (D-72 deja esa ampliación fuera de alcance).
Cómo se verifica: revisión de código (`canSubmit`/`accountStatus` vía `useAppState()`) y paso manual. **No verificado en dispositivo** (tarea por asignar: T-31).

CA-001-30 [RF-03, RF-04, D-73]
Dado un documento `drivers/{uid}` ya existente cuando la app lo resuelve (cualquier `accountStatus`), Cuando el conductor abre las pestañas de registro, Entonces los campos de `personalData`, `vehicle` y `documents` ya guardados se muestran precargados (con `year`/`capacity` convertidos de `number` a texto y `birthDate` de cadena ISO a `Date`), sin sobrescribir una edición en curso si el documento cambia por otra vía mientras la pantalla sigue abierta.
Cómo se verifica: lectura de código (`getDriverRegistration` en `driverRepository.js`, el `useEffect` de precarga en `RegistrationFormContext.js` con `[driverId]`) y paso manual. **No verificado en dispositivo** (tarea por asignar: T-32).

### Criterios de diseño
CA-001-D1
Dado cada uno de los 17 campos y el botón «Enviar registro», Cuando se mide su área táctil, Entonces es de al menos 44 × 44 px (botones y controles) y cada uno lleva su `testID` del contrato (`<pantalla>-field-<campo>`, `<pantalla>-error-<campo>`, `documents-submit`); las opciones de una lista desplegable llevan `<pantalla>-field-<campo>-option-<valor>`.
Cómo se verifica: revisión de código de los `testID` y paso manual de las medidas. **No verificado en dispositivo** (tarea por asignar).

CA-001-D2 [D-56]
Dado el código de las tres pantallas, Cuando se revisan colores, tamaños de texto, espaciados, radios y anchos de borde, Entonces provienen solo de los tokens de `DESIGN.md`; los desplegables usan `Modal` y `FlatList` propios sin ninguna dependencia nueva; no hay íconos de emoji.
Cómo se verifica: revisión de código (capa A del arnés/constitución §11) y revisión del verifier.

CA-001-D3 [RF-03]
Dado cualquier campo inválido, Cuando se muestra su error, Entonces el texto usa `type.caption` en `color.danger` y el estado nunca se comunica solo con color (el texto del error siempre está presente).
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-001-D4
Dado el texto de etiquetas, campos y errores, Cuando se aumenta la escala de texto del sistema, Entonces ningún campo ni mensaje de error se corta ni se solapa; los contenedores crecen en alto en lugar de truncar.
Cómo se verifica: paso manual. **No verificado en dispositivo** (tarea por asignar).

## 5. Casos límite
- Reinstalar la app (o borrar sus datos) pierde el acceso al `uid` anónimo anterior y, con él, al documento `drivers/{uid}` ya creado (D-53); no hay recuperación en esta entrega.
- Placa escrita en mayúsculas, minúsculas o mixta se normaliza a mayúsculas antes de validar; las tres formas de un valor por lo demás válido dan el mismo resultado.
- Año de fabricación igual al año actual es válido (límite inclusive).
- Capacidad exactamente 6 en categoría XL es válida (límite inclusive); 5 en XL es inválida; cambiar la categoría de XL a otra tras escribir una capacidad menor a 6 vuelve el campo válido sin que el conductor tenga que volver a escribirlo.
- Fecha de nacimiento que da exactamente 18 años cumplidos hoy es válida (límite inclusive); un día antes es inválida.
- Subida de una foto sin red: el campo queda en error con posibilidad de reintentar; con red, la subida se completa y el campo queda válido. Elegir una foto nueva mientras la anterior sube: el comportamiento exacto (cancelar la subida anterior o esperarla) no está definido por F1 y lo resuelve la implementación sin contradecir que el campo solo es válido con una subida completa y exitosa.
- Licencia, SOAT y revisión técnico-mecánica (resto de RF-07) quedan pendientes, ligadas a P-04 (PARADA); no son requisito de esta spec y no bloquean el envío.
- Un `uid` anónimo recién creado, sin documento `drivers/{uid}` todavía: se trata como «no registrado» (rama de Registro), no como error (D-60).
- Nombre con tildes o ñ (p. ej. «José Peña») es válido; nombre con números o símbolos (p. ej. «Ana2» o «Ana!») es inválido.
- Intentar tocar «Enviar registro» mientras está deshabilitado no debe producir ningún efecto (ni `Alert`, ni envío parcial).
- Correo con `@` pero sin punto en el dominio (p. ej. `a@b`) es inválido (D-62); con punto (p. ej. `a@b.com`) es válido.
- Cambiar el idioma elegido en el formulario no traduce el resto de la interfaz en esta entrega (D-15 sigue en Propuesta y fuera de alcance aquí); solo se guarda como dato del conductor.
- Nombre, correo, correo de Mercado Pago, marca o modelo escritos con espacios al inicio o al final (p. ej. «Anderson Londoño ») se guardan recortados, sin esos espacios; el conductor puede seguir escribiendo con espacios intermedios mientras completa un nombre de varias palabras, porque el recorte solo ocurre al enviar, no en cada tecla (D-71).

## 6. No encontrado
- Lista exacta de opciones del desplegable de género y del de color del vehículo en F1 (D-63, D-64 proponen una lista mínima y cerrada).
- Patrón exacto del correo (F1 solo dice "con `@` y dominio"; D-62 propone la lectura conservadora).
- Si "solo letras" del nombre incluye tildes y ñ (D-61 propone que sí).
- Tope superior de capacidad del vehículo (no se propone ninguno; solo entero positivo con el mínimo de XL).
- Rúbrica y pesos (D-17, PARADA, no afecta esta spec).

## 7. Trazabilidad
| Requisito | Criterios |
|---|---|
| RF-01 | Ya cubierto por CA-000-10 (spec 000); sin criterio propio aquí |
| RF-02 | CA-001-18 |
| RF-03 | CA-001-02 a CA-001-17 (por campo), CA-001-19, CA-001-20, CA-001-29, CA-001-30, CA-001-D3 |
| RF-04 | CA-001-21, CA-001-23, CA-001-28, CA-001-29, CA-001-30 |
| RF-05 | CA-001-01 a CA-001-08 |
| RF-06 | CA-001-09 a CA-001-15 |
| RF-07 | CA-001-16, CA-001-17, CA-001-27 |
| RNF-04 | CA-001-25 |
| RNF-07 | CA-001-01, CA-001-15 |
| D-52 | CA-001-21, CA-001-22 |
| D-53 | CA-001-23 |
| D-57, D-60 | CA-001-24 |
| D-58 | CA-001-26 |
| D-72 | CA-001-28, CA-001-29 |
| D-73 | CA-001-30 |
