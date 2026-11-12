# Spec 002 — Funcionalidad final: solicitud legible, accesibilidad, marcador de auto y sesiones de conductor

Estado: Borrador (pendiente de aprobación de Anderson; el spec-author no aprueba su propio trabajo). Las decisiones D-93 a D-103 citadas aquí están en estado "Propuesta" y solo viven en esta spec: el agente principal las registra en `docs/decisiones.md`.
Requisitos cubiertos: RF-31 a RF-38, RNF-14 a RNF-17 (nuevos, añadidos a `docs/requisitos.md`). Extiende RF-04, RF-10, RF-11, RF-29 y RNF-04. Fuentes: F1 §2, §3 (vía `docs/requisitos.md`) y ENCARGO (encargo al spec-author del 2026-11-11, cuatro bloques R1 a R4).
Aviso de numeración: `specs/README.md` y la matriz de `docs/requisitos.md` reservan «002» para `002-disponibilidad-ubicacion`; esta spec usa la carpeta `002-funcionalidad-final` por el encargo. Anderson decide si renumera.

## 0. Qué ya existe (no se repite; esta spec construye sobre ello)
- Solicitud entrante: `TripRequestScreen` (pantalla completa, solo desde Inicio enfocado) e `IncomingRequestCard` (tarjeta inferior fuera de Inicio), D-85; cuenta regresiva de 30 s con barra, ganancia en `color.primary`, botones fuera del scroll en la tarjeta (D-83, D-85).
- Registro de 3 pestañas con campos compartidos `SelectField`, `DateField`, `PhotoField`, `TextField`, `CheckboxField`; barra de pestañas `AppTabBar`; menú lateral `AppDrawerContent`; `ScreenState`.
- Mapa de viaje `TripMap` con un punto de color para el conductor y un anillo hueco para el destino (la forma distingue, no solo el color); `Icon.js` sobre Ionicons (D-91).
- Sesión de Firebase Auth anónima (D-53, Vigente) creada por `ensureAnonymousUser`; `drivers/{uid}` leído con `onSnapshot` (`AppStateContext`); `driverLocations/{uid}` y `drivers/{uid}/trips/{tripId}` con reglas por dueño (`docs/seguridad.md`); persistencia de sesión de Firebase en `AsyncStorage` ya instalado.
- Opciones reales del color del vehículo (`registrationOptions.js`, D-64): `blanco`, `negro`, `gris`, `plata`, `rojo`, `azul`, `verde`, `amarillo`, `otro`; se guardan en `drivers/{uid}.vehicle.color`.
- `SHOW_DEV_TOOLS` en `false` (`src/constants/devTools.js`); `maskEmail` (`src/utils/mask.js`); cola de publicación a `driverLocations` con reintentos y tiempo máximo por intento (`driverLocationWriter`, D-83).
- Paneles provisionales: `DevAccountSwitch` (simula `accountStatus`) y la nota «Tu sesión es anónima en este teléfono» de Configuración.

## 1. Objetivo y porqué
Cerrar la funcionalidad de la entrega final con cuatro bloques:
1. **R1 Solicitud entrante legible.** La decisión del conductor depende de ver cuánto gana y cuánto cobra el pasajero; hoy, con fuente grande, esos importes pueden quedar fuera de pantalla bajo el scroll y obligan a desplazar antes de aceptar.
2. **R2 Accesibilidad pendiente.** Deuda detectada en la auditoría estática (`docs/diseno/auditoria-estatica-53.md`) y en las rondas de viaje: etiquetas que ocultan el valor elegido, texto truncado a 200 %, anuncios repetitivos de la cuenta regresiva y limpieza de restos.
3. **R3 Marcador de auto.** El punto genérico no comunica «este eres tú»; un auto con el color del vehículo que el conductor registró hace el mapa reconocible sin añadir dependencias ni consultas.
4. **R4 Sesiones de conductor.** Con acceso anónimo, reinstalar la app pierde la cuenta (D-53) y no hay inicio ni cierre de sesión (RF-29, F1 §3). Con correo y contraseña, un conductor conserva su cuenta, y varios conductores pueden usar el mismo teléfono (uno a la vez), sin que los datos de uno aparezcan al otro.

### Fuera de alcance
- Verificación de correo (D-95), inicio con proveedores sociales, cambio de contraseña desde dentro de la cuenta, eliminación de cuenta.
- Migrar datos de cuentas anónimas heredadas (D-97).
- Dos usuarios activos a la vez en una misma instancia (el SDK JS de Firebase Auth admite un único usuario activo por instancia, D-94).
- Cambios en `backend/` (D-58) y en el código fuente por parte de esta spec (la spec solo describe el qué).
- Dependencias nuevas: ninguna; todo se resuelve con lo ya instalado (`firebase`/`@firebase/auth`, `@react-native-async-storage/async-storage`, `@expo/vector-icons`).
- Traducción a inglés (D-15, Propuesta).

## 2. Requisitos

### R1 — Solicitud entrante legible (RF-31)
- [RF-31] Mientras se muestre una solicitud entrante, ya sea en `TripRequestScreen` o en `IncomingRequestCard`, el sistema deberá mostrar «tu ganancia» y la tarifa sin necesidad de desplazar, en una pantalla de unos 360 × 640 dp, con el tamaño de fuente del sistema al 100 % y al 130 %.
- [RF-31] El sistema deberá presentar arriba el bloque de precio como protagonista (la ganancia como la cifra mayor y la tarifa en segundo plano), seguido, en este orden, de pasajero, origen, destino, distancia y tiempo; el resto del contenido actual (categoría, método de pago, valoración, avisos) sigue después, en el orden que fije el diseño.
- [RF-31] El sistema deberá mantener «Aceptar» y «Rechazar» fijos en la parte baja de la pantalla y de la tarjeta, fuera del área desplazable, con cualquier tamaño de fuente.
- [RF-31] Si, con el tamaño de fuente al 200 %, el contenido no cabe, entonces el sistema deberá permitir desplazarlo, con la ganancia como primer elemento del área desplazable y los botones siempre alcanzables.
- [RF-31, RF-10, RF-11] El sistema no deberá cambiar el contenido de la solicitud, la cuenta regresiva (30 s, barra, umbral de urgencia), los `testID`, las etiquetas de accesibilidad ni el comportamiento de aceptar, rechazar, vencer o cerrar.

### R2 — Accesibilidad pendiente (RNF-14)
- [RNF-14] (i) El sistema deberá anunciar, en `SelectField` y `DateField`, tanto el nombre del campo como el valor elegido (o «sin seleccionar»); la etiqueta y el valor de accesibilidad no deberán ocultar el valor elegido.
- [RNF-14] (ii) El sistema no deberá truncar los nombres «Documentos» y «Vehículo» de las pestañas de registro (`AppTabBar`) con el tamaño de fuente al 200 %.
- [RNF-14] (iii) El sistema deberá mantener la acción principal de `TripActiveScreen` fija, fuera del área desplazable del panel, de modo que siempre sea alcanzable.
- [RNF-14, D-101] (iv) El sistema no deberá anunciar la cuenta regresiva de la solicitud cada segundo de forma asertiva; deberá anunciarla solo al llegar a 10, 5 y 0 s, con prioridad `polite`, sin eliminar la región viva (`TripRequestScreen` e `IncomingRequestCard`).
- [RNF-14] (v) El sistema deberá conservar el fondo de «activo» de la entrada del menú lateral mientras se presiona (no deberá sustituirlo por el estilo de presionado).
- [RNF-14] (vi) El sistema deberá quedar sin: el comentario que remite a «plan §7» en `SelectField` (C26: no se remite a documentos que no se entregan), el comentario huérfano en `ScreenState`, el doble anuncio del indicador de subida de foto en `PhotoField` (indicador y texto anuncian lo mismo) y la clave `labels.history.route` sin uso.

### R3 — Marcador de auto con el color del vehículo registrado (RF-32)
- [RF-32, RF-08, RF-12] El sistema deberá dibujar la posición del conductor, en todo mapa donde hoy aparece su punto (`TripMap`), como un auto genérico (sin modelo ni marca) cuyo color es el del vehículo REGISTRADO por el conductor (campo «Color», valores reales de `registrationOptions.js`).
- [RF-32] El sistema deberá componer el marcador con un glifo de auto de Ionicons, mostrado mediante `Icon.js` y teñido con ese color, dentro de una insignia circular blanca (`color.surface`) con borde de token (`color.border`, `borderWidth.thin`).
- [RF-32] El sistema deberá definir un token de color por cada valor de color de vehículo y una función pura que convierta el valor registrado en su token; si el valor es `otro`, vacío, ausente o desconocido, deberá usar el color de marca (`color.primary`).
- [RF-32] El sistema deberá leer el color de la cuenta ya cargada (`drivers/{uid}`, suscripción existente), sin añadir consultas ni suscripciones.
- [RF-32] El sistema deberá mantener el anillo hueco del destino y el marcador del pasajero con una forma distinguible del auto más allá del color.
- [RF-32] Donde la rotación del auto según el rumbo sea trivial con los datos que ya llegan, el sistema podrá orientar el auto; no es obligatoria y su ausencia no incumple este requisito.
- [RF-32] El sistema deberá tratar el marcador como decorativo (no anunciado por lectores de pantalla), respetar «reducir movimiento» si hay algún movimiento o transición, y no empeorar el rendimiento del mapa (sin más actualizaciones por segundo ni más capas animadas que el punto actual).

### R4 — Sesiones de conductor (RF-33 a RF-38, RNF-15 a RNF-17)

#### Crear cuenta (RF-33)
- [RF-33, D-93] El sistema deberá permitir crear una cuenta de conductor con correo y contraseña mediante Firebase Auth (proveedor correo/contraseña) y deberá dejar de usar el acceso anónimo.
- [RF-33, D-103] El sistema deberá pedir correo, contraseña y confirmación de contraseña; la contraseña deberá tener al menos 8 caracteres y coincidir con la confirmación; los requisitos de la contraseña deberán estar visibles junto al campo siempre (no solo tras un error) y su cumplimiento deberá indicarse con texto o ícono, no solo con color.
- [RF-33, RF-04, D-60] Cuando la cuenta se cree, el sistema deberá conducir al conductor al registro de 3 pestañas (RF-01); tras enviarlo, la cuenta queda «Pendiente de aprobación» y la aprobación sigue siendo manual en la consola (RF-04).
- [RF-33, D-95] El sistema no deberá exigir verificación de correo (riesgo aceptado y documentado).
- [RF-33, D-96] Si el correo ya tiene cuenta, entonces el sistema deberá mostrar un mensaje específico de «correo ya en uso» al crear.

#### Iniciar sesión (RF-34)
- [RF-34, D-93] El sistema deberá permitir iniciar sesión con correo y contraseña.
- [RF-34, D-96] Si el inicio de sesión falla por credenciales (contraseña errónea, correo sin cuenta o credencial inválida), entonces el sistema deberá mostrar siempre el mismo mensaje genérico «Correo o contraseña incorrectos», sin revelar cuál de los dos falló.
- [RF-34, D-96] Si el inicio de sesión falla por red caída o por demasiados intentos, entonces el sistema deberá mostrar un mensaje específico para cada caso; cualquier otro fallo mostrará un mensaje genérico de «no se pudo, inténtalo de nuevo» (D-96).
- [RF-34, D-96] El sistema deberá traducir los códigos de error de Firebase a mensajes en una función pura con pruebas (tabla en «Casos límite»).

#### Recuperar contraseña (RF-35)
- [RF-35] El sistema deberá ofrecer «Recuperar contraseña» desde Iniciar sesión, pedir el correo y enviar el correo de restablecimiento con `sendPasswordResetEmail`.
- [RF-35, D-96] El sistema deberá mostrar el mismo mensaje neutro (p. ej. «Si el correo tiene una cuenta, te enviamos instrucciones») tanto si el correo existe como si no, sin revelarlo; solo la red caída y los demasiados intentos tendrán un mensaje distinto, porque en esos casos no se envió nada.

#### Puerta de autenticación y anónimos heredados (RF-36)
- [RF-36] El sistema deberá decidir la rama de la app en `RootNavigator` según la sesión: mientras `onAuthStateChanged` no haya dado su primer resultado, una pantalla de carga; sin usuario, la pila Iniciar sesión / Crear cuenta / Recuperar contraseña; con usuario, la lógica existente (sin documento `drivers/{uid}` → registro; pendiente → pestañas con aviso; aprobado → principal; error → estado de error).
- [RF-36, D-97] Si, al arrancar o al cambiar la sesión, el usuario es anónimo (cuenta heredada de D-53), entonces el sistema deberá cerrar esa sesión y mostrar Iniciar sesión, sin migrar datos.
- [RF-36] Cuando la sesión termine por causas externas (cuenta deshabilitada o eliminada, credencial revocada), el sistema deberá volver a Iniciar sesión y ejecutar la misma limpieza que el cierre voluntario, salvo los pasos que ya no puedan hacerse sin sesión.

#### Cerrar sesión y cambiar de cuenta (RF-37, RF-29)
- [RF-37, RF-29, D-102] El sistema deberá ofrecer «Cerrar sesión» y «Cambiar de cuenta» en Configuración y mostrar el correo de la cuenta activa, enmascarado con la misma regla que los demás datos personales (`maskEmail`).
- [RF-37, RF-03] El sistema deberá pedir confirmación en la propia pantalla (sin `Alert`) antes de cerrar la sesión.
- [RF-37, D-98] El sistema deberá ejecutar un único procedimiento de reinicio de sesión (`resetSession`) para cerrar sesión, cambiar de cuenta y el cierre por causas externas, con este orden:
  1. Si hay un viaje en curso, bloquear y mostrar «Termina o cancela el viaje antes de cerrar sesión»; no se ejecuta ningún paso posterior.
  2. Descartar la solicitud pendiente, si la hay, sin aceptarla.
  3. Poner la disponibilidad en no disponible y publicar el estado final a `driverLocations` con la cola de publicación existente, esperando como máximo 5 s y sin bloquear el cierre si falla o tarda.
  4. Detener la ubicación y liberar todas las suscripciones, listeners y temporizadores.
  5. Limpiar los contextos (disponibilidad, viaje, estado de la app y formulario de registro) y el almacenamiento propio de la app.
  6. Cerrar la sesión de Firebase (`signOut`).
- [RF-37, D-94] Mientras haya una sesión activa, el sistema deberá mantener un único usuario (SDK JS: un usuario activo por instancia); «varias sesiones» significa varias cuentas de conductor en el mismo teléfono, de a una por vez, y cambiar de cuenta exige volver a iniciar sesión.
- [RF-37] Si el cierre de sesión de Firebase falla, entonces el sistema deberá mostrar el error con «Reintentar» y volver a resolver el estado de la cuenta vigente, sin dejar la app a medias.

#### Herramientas de desarrollo (RF-38)
- [RF-38] El sistema deberá eliminar o adaptar los paneles y rutas de código que dependen de cuentas anónimas (`DevAccountSwitch`, `ensureAnonymousUser` y similares) y, con `SHOW_DEV_TOOLS` en `false`, no deberá mostrar nada de ellos; la nota «Tu sesión es anónima…» de Configuración deberá reemplazarse por el estado real de la sesión.

#### Credenciales (RNF-15)
- [RNF-15, RNF-04] El sistema no deberá registrar en ningún log (consola, instrumentación, diagnóstico) correos, contraseñas ni tokens; en los errores solo se registra el código.
- [RNF-15] El sistema no deberá conservar la contraseña más allá del formulario ni en almacenamiento propio (la persistencia de sesión la gestiona Firebase en `AsyncStorage`, sin contraseña); deberá limpiar los campos al salir de la pantalla y tras un envío correcto.
- [RNF-15] El sistema deberá ocultar la contraseña (`secureTextEntry`) con un botón accesible para mostrarla u ocultarla, con etiqueta que indique el estado.
- [RNF-15] El sistema deberá usar, en los campos de correo y contraseña, el autocompletado del sistema (`autoComplete`, `textContentType`), el teclado de correo y sin autocapitalizar ni autocorregir.
- [RNF-15] Mientras se envía un formulario de autenticación, el sistema deberá deshabilitar el botón y no permitir un segundo envío.

#### Reglas de Firestore (RNF-16)
- [RNF-16, D-99] El sistema deberá exigir, en las reglas de `drivers`, `driverLocations` y `trips` (subcolección `drivers/{uid}/trips`), `request.auth != null` y `request.auth.token.firebase.sign_in_provider == 'password'`, conservando las reglas de dueño y todas las validaciones actuales.
- [RNF-16, D-99] El sistema deberá documentar el texto de esas reglas solo en `docs/seguridad.md` (D-80: la consola de Firebase es la fuente de verdad); Anderson las publica al final, y solo después de validar la app en el celular con las reglas actuales.

#### Pantallas nuevas y documentación (RNF-17)
- [RNF-17] Las pantallas Iniciar sesión, Crear cuenta, Recuperar contraseña y la confirmación de Configuración deberán usar el sistema de diseño (`DESIGN.md`, `docs/diseno/guia-de-estilo.md`): campos con etiqueta; errores con ícono y texto en región viva `polite`; foco en el primer campo con error tras intentar enviar; objetivos táctiles de al menos 44 × 44 px; texto al 200 % sin recorte; teclado que no tape campos ni el botón principal; sin `Alert`.
- [RNF-17, ENT-02] El `README.md` y `docs/arquitectura*` deberán describir el nuevo flujo de sesión, el orden de publicación de reglas y el riesgo de D-95 (lo hará la tarea correspondiente).

## 3. Decisiones relacionadas
Ya Vigentes que esta spec usa sin cambiar: D-11 (navegación por estado de cuenta), D-60 (sin documento = no registrado), D-71 (recorte de espacios al guardar), D-74 (campos bloqueados), D-80 (reglas publicadas a mano; documento en palabras), D-83 (cuenta regresiva, estado final y reposo), D-85 (tarjeta inferior), D-90/D-91 (rediseño, Ionicons).

Decisión Vigente que esta spec propone reemplazar: **D-53** (Firebase Auth anónimo, `uid` = `driverId`) → D-93.

Nuevas, propuestas por esta spec (todas «Propuesta»; el agente principal las registra en `docs/decisiones.md`; ninguna queda Vigente aquí):

### D-93 — Firebase Auth con correo y contraseña reemplaza el acceso anónimo · Propuesta
Situación: D-53 usa sesión anónima; reinstalar pierde la cuenta y RF-29 (F1 §3) pide cierre de sesión.
Decisión: proveedor correo/contraseña de Firebase Auth; `uid` sigue siendo `driverId`; D-53 queda Reemplazada. Requiere que Anderson habilite el proveedor en la consola (paso manual).
Alternativa: mantener el acceso anónimo (descartada: sin cuentas recuperables ni cierre de sesión significativo).
Impacto: CA-001-22 y CA-001-23 de la spec 001, la política 1 de `docs/seguridad.md` y la nota de Configuración quedan desactualizadas (no las edita esta spec).

### D-94 — «Varias sesiones» = varias cuentas en el mismo teléfono, una activa a la vez · Propuesta
Situación: el SDK JS de Firebase Auth mantiene un solo usuario activo por instancia.
Decisión: se entiende «varias sesiones» como varias cuentas de conductor que se turnan en el mismo dispositivo; «Cambiar de cuenta» = `resetSession` + volver a Iniciar sesión; no se guardan credenciales de otras cuentas. Se documenta en README y arquitectura.
Alternativa: varias instancias de Auth o tokens guardados para cambio instantáneo (descartada: complejidad y riesgo con credenciales).

### D-95 — Sin verificación de correo (riesgo aceptado) · Propuesta
Situación: verificar el correo añade pantallas, estados y dependencia del buzón; hay una entrega con fecha límite.
Decisión: no se exige verificación; cualquiera puede crear una cuenta con un correo ajeno. El riesgo se mitiga porque la cuenta no opera hasta la aprobación manual (RF-04). Se documenta en README y `docs/seguridad.md`.
Alternativa: exigir verificación antes del registro (descartada por alcance).

### D-96 — Mensajes de autenticación que no revelan si un correo existe · Propuesta
Decisión: (a) iniciar sesión: credenciales erróneas, correo sin cuenta y credencial inválida → «Correo o contraseña incorrectos»; (b) mensajes específicos solo para red caída, demasiados intentos y, al crear, correo ya en uso (esta última revela la existencia por diseño, es lo que se pidió); (c) recuperar contraseña: respuesta neutra siempre que el envío no falle por red o límite; (d) cualquier otro código → mensaje genérico de «no se pudo, inténtalo de nuevo»; (e) el código crudo de Firebase nunca se muestra. La configuración «protección contra enumeración de correos» de la consola de Firebase cambia qué códigos llegan; el mapeo cubre ambas variantes.
Alternativa: mostrar el mensaje exacto de Firebase (descartada: filtra información).

### D-97 — Cuentas anónimas heredadas: cerrar sesión, sin migración · Propuesta
Decisión: al detectar un usuario anónimo se cierra su sesión y se muestra Iniciar sesión; los datos de `drivers/{uid-anónimo}` quedan inaccesibles (como al reinstalar, D-53). Solo hay datos de prueba.
Alternativa: vincular el usuario anónimo a correo/contraseña (descartada: alcance y datos solo de prueba).

### D-98 — Un solo procedimiento de reinicio de sesión (`resetSession`) · Propuesta
Decisión: seis pasos en el orden del requisito RF-37, con bloqueo si hay viaje en curso, espera máxima de 5 s para publicar el estado final y `signOut` siempre al final. Por qué ese orden: la publicación y las suscripciones necesitan la sesión viva (las reglas exigen autenticación); si `signOut` fuera antes, los listeners fallarían con permiso denegado y la publicación final se perdería.
Alternativa: limpiar por separado en cada pantalla (descartada: se olvidan pasos y se filtran datos entre cuentas).

### D-99 — Reglas exigen proveedor `password` y se publican después de validar la app · Propuesta
Decisión: `drivers`, `driverLocations` y `trips` exigen `request.auth != null` y proveedor `password`; orden: (1) validar la app en el celular con las reglas actuales, (2) publicar reglas, (3) repetir la prueba. El proveedor anónimo se deja habilitado hasta terminar las pruebas de denegación (CA-002-35) y luego Anderson decide si lo apaga.
Alternativa: publicar primero (descartada: un fallo de la app se confundiría con un fallo de reglas).

### D-100 — Marcador de auto: glifo teñido con el color registrado, insignia blanca, tokens y función pura · Propuesta
Decisión: glifo Ionicons de auto vía `Icon.js`, tintado con el token del color del vehículo, dentro de una insignia circular `color.surface` con borde `color.border`; un token por valor de color; `otro`/desconocido → `color.primary`; el contraste de la silueta contra la insignia debe ser de al menos 3:1 para los nueve valores (los colores claros —blanco, plata, amarillo— usan el tono visible más cercano que cumpla, y los hex de los tokens y sus razones se calculan y documentan en la guía de estilo al implementar). Sin dependencias ni consultas nuevas.
Alternativa: imagen PNG del auto por color (descartada: activos nuevos); punto con color (descartada: no comunica «auto»).
Pregunta abierta para Anderson: cómo se representa «Blanco» (hoy propuesto: gris muy oscuro suficiente para 3:1, por lo que Blanco y Plata podrían parecerse); alternativa: cambiar el fondo de la insignia para los claros.

### D-101 — La cuenta regresiva anuncia solo umbrales (10, 5 y 0 s) en `polite` · Propuesta
Decisión: la región viva se conserva; el texto anunciado solo cambia al llegar a esos tres valores. El tiempo restante sigue legible como texto en pantalla.
Alternativa: quitar la región viva (descartada: se pierde el aviso de vencimiento).

### D-102 — Correo de la cuenta en Configuración; «Cambiar de cuenta» usa el mismo procedimiento · Propuesta
Decisión: el correo de la cuenta (enmascarado) se muestra en Configuración, sección «Cuenta», junto a las dos acciones (no en Perfil, para no mezclarlo con el correo personal y el de Mercado Pago). «Cerrar sesión» y «Cambiar de cuenta» ejecutan `resetSession`; solo cambian el texto de la confirmación y el aviso inicial de Iniciar sesión.
Alternativa: mostrarlo en Perfil (posible; lo decide Anderson).

### D-103 — Reglas de los campos de la cuenta · Propuesta
Decisión: correo recortado (sin espacios al inicio y al fin), con el mismo patrón `algo@dominio.algo` de D-62; contraseña de mínimo 8 caracteres, sin máximo propio, sin recortar ni normalizar, con confirmación; el correo de la cuenta es independiente del correo personal del registro (no se precarga ni se sincroniza).
Alternativa: precargar el correo del registro con el de la cuenta (descartada: cambia la spec 001 sin necesidad).

Dependencias: ninguna nueva; no se edita `scripts/dependencies.json`.

## 4. Criterios de aceptación

### R1 — Solicitud entrante
CA-002-01 [RF-31]
Dado `TripRequestScreen` con una solicitud, en 360 × 640 dp y fuente al 100 % y al 130 %, Cuando se abre, Entonces «tu ganancia» y la tarifa se ven completas sin desplazar y «Aceptar» y «Rechazar» están visibles.
Cómo se verifica: paso manual en el celular (o emulador con la misma densidad) con la escala de fuente del sistema. **No verificado en dispositivo** (tarea por asignar por el planner).

CA-002-02 [RF-31]
Dado `IncomingRequestCard` sobre otra pantalla del menú, en las mismas condiciones, Cuando aparece, Entonces «tu ganancia» y la tarifa se ven sin desplazar y los botones están fijos abajo.
Cómo se verifica: paso manual en el celular. **No verificado en dispositivo** (tarea por asignar).

CA-002-03 [RF-31]
Dado el contenido de la solicitud, Cuando se revisa el orden de lectura y el diseño, Entonces el bloque de precio (ganancia mayor, tarifa menor) va primero, seguido de pasajero, origen, destino, distancia y tiempo, y el resto del contenido sigue después.
Cómo se verifica: revisión de código y paso manual con lector de pantalla. **No verificado en dispositivo** (tarea por asignar).

CA-002-04 [RF-31]
Dado cualquier tamaño de fuente, incluido 200 %, Cuando se desplaza el contenido de la solicitud o de la tarjeta, Entonces «Aceptar» y «Rechazar» no se desplazan con él.
Cómo se verifica: revisión de código (botones fuera del contenedor desplazable) y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-05 [RF-31]
Dado el tamaño de fuente al 200 % en 360 × 640 dp, Cuando el contenido no cabe, Entonces se puede desplazar, la ganancia es el primer elemento desplazable y los botones siguen alcanzables.
Cómo se verifica: paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-06 [RF-31, RF-10, RF-11]
Dado el cambio de R1, Cuando se compara el código antes y después, Entonces no cambian los textos de `labels.js`, los `testID` (`trip-request-*`, `incoming-request-*`), la cuenta regresiva ni el comportamiento de aceptar, rechazar, vencer y cerrar.
Cómo se verifica: revisión de la diferencia (`git diff` de esos archivos y de `labels.js`) y script fuera del proyecto sobre las funciones puras existentes de presentación y vencimiento.

### R2 — Accesibilidad
CA-002-07 [RNF-14 i]
Dado un `SelectField` o `DateField` con un valor elegido, Cuando un lector de pantalla enfoca el campo, Entonces anuncia el nombre y el valor elegido; sin valor, anuncia el nombre y «sin seleccionar».
Cómo se verifica: revisión de código de las propiedades de accesibilidad y paso manual con TalkBack/VoiceOver. **No verificado en dispositivo** (tarea por asignar).

CA-002-08 [RNF-14 ii]
Dado `AppTabBar` con la fuente al 200 %, Cuando se muestran las pestañas de registro, Entonces «Documentos» y «Vehículo» se leen completos (sin puntos suspensivos ni recorte).
Cómo se verifica: paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-09 [RNF-14 iii]
Dado `TripActiveScreen` con el panel desplazable, Cuando se desplaza el panel, Entonces la acción principal permanece visible y fija.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-10 [RNF-14 iv, D-101]
Dado una solicitud con cuenta regresiva, Cuando corre el tiempo, Entonces el lector de pantalla anuncia el tiempo solo al llegar a 10, 5 y 0 s, con prioridad `polite`, y no cada segundo; la región viva sigue existiendo.
Cómo se verifica: revisión de código (ninguna región `assertive` ligada al contador; el texto accesible cambia solo en los umbrales) y paso manual con lector de pantalla. **No verificado en dispositivo** (tarea por asignar).

CA-002-11 [RNF-14 v]
Dado el menú lateral con una entrada activa, Cuando se presiona esa entrada, Entonces conserva el fondo de activa.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-12 [RNF-14 vi]
Dado el código, Cuando se busca, Entonces no existen el comentario «plan §7» en `SelectField`, el comentario huérfano de `ScreenState`, el doble anuncio del indicador de subida en `PhotoField` (una sola descripción accesible) ni la clave `history.route` sin referencias en `labels.js`.
Cómo se verifica: búsqueda en `src/`, revisión de código y `node scripts/check-constitution.mjs` (regla C26 sin hallazgos nuevos).

### R3 — Marcador de auto
CA-002-13 [RF-32]
Dado la función pura de color a token, Cuando se evalúan `blanco`, `negro`, `gris`, `plata`, `rojo`, `azul`, `verde`, `amarillo`, `otro`, además de vacío, `null`, `undefined`, mayúsculas y un valor desconocido, Entonces los nueve valores devuelven su token propio (salvo `otro`, que devuelve el color de marca) y todo lo demás devuelve el color de marca, sin lanzar errores.
Cómo se verifica: script de prueba fuera del proyecto contra la función real y las opciones reales de `registrationOptions.js` (que no queden valores de las opciones sin token).

CA-002-14 [RF-32]
Dado un conductor con color registrado, Cuando se muestra el mapa, Entonces el auto tiene el color de su vehículo registrado y no se hace ninguna consulta ni suscripción nueva para obtenerlo.
Cómo se verifica: revisión de código (el valor sale de la cuenta ya cargada) y paso manual con dos cuentas de colores distintos. **No verificado en dispositivo** (tarea por asignar).

CA-002-15 [RF-32, D-91]
Dado el marcador, Cuando se revisa, Entonces es un glifo de auto de Ionicons, mostrado con `Icon.js`, teñido con el token de color, dentro de una insignia circular `color.surface` con borde `color.border` y `borderWidth.thin`; sin dependencias nuevas ni imágenes nuevas.
Cómo se verifica: revisión de código y `node scripts/check-constitution.mjs` (C15) y diferencia de `package.json` vacía.

CA-002-16 [RF-32]
Dado cada uno de los nueve tokens de color, Cuando se calcula su contraste contra el fondo de la insignia, Entonces es de al menos 3:1 (blanco, plata y amarillo incluidos), con la razón anotada en `docs/diseno/guia-de-estilo.md`.
Cómo se verifica: script de contraste fuera del proyecto, como en `docs/diseno/` (Capa A). Aprobación visual del aspecto: **No verificado en dispositivo**.

CA-002-17 [RF-32]
Dado el mapa con el auto, el anillo del destino y el marcador del pasajero, Cuando se ven en escala de grises, Entonces los tres se distinguen por forma, no solo por color.
Cómo se verifica: paso manual en el celular (captura en escala de grises) y revisión de código. **No verificado en dispositivo** (tarea por asignar).

CA-002-18 [RF-32]
Dado el marcador, Cuando un lector de pantalla recorre el mapa, Entonces el marcador no se anuncia (decorativo) y, si hay algún movimiento o transición, se desactiva con «reducir movimiento».
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-19 [RF-32]
Dado un viaje en curso, Cuando se compara con el punto anterior, Entonces el mapa se mueve con la misma fluidez, sin más actualizaciones por segundo ni capas animadas nuevas.
Cómo se verifica: revisión de código (la frecuencia de actualización no cambia) y paso manual en el celular durante un viaje. **No verificado en dispositivo** (tarea por asignar). La rotación (opcional) no es criterio de aprobación.

### R4 — Cuenta, sesión y reglas
CA-002-20 [RF-33, RNF-15, D-103]
Dado Crear cuenta, Cuando se intenta con correo inválido, contraseña de menos de 8 caracteres o confirmación distinta, Entonces no se envía, se muestra el error bajo el campo correspondiente y el foco pasa al primer campo con error; con datos válidos se crea la cuenta y se llega al registro.
Cómo se verifica: script fuera del proyecto contra las funciones de validación y paso manual en el celular. **No verificado en dispositivo** (flujo completo; tarea por asignar).

CA-002-21 [RF-33]
Dado la pantalla Crear cuenta, Cuando se mira, Entonces los requisitos de la contraseña están visibles desde el inicio y su cumplimiento se indica con texto o ícono, no solo con color.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-22 [RF-34, D-96]
Dado la función pura de mapeo de errores, Cuando recibe `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found` o `auth/invalid-email` al iniciar sesión, Entonces devuelve «Correo o contraseña incorrectos»; con `auth/network-request-failed` el mensaje de red caída; con `auth/too-many-requests` el de demasiados intentos; al crear, `auth/email-already-in-use` devuelve «correo ya en uso»; cualquier otro código (incluido `auth/user-disabled`, `auth/operation-not-allowed` o desconocido) devuelve el mensaje genérico, y nunca se devuelve el código crudo.
Cómo se verifica: script de prueba fuera del proyecto contra la función real (tabla completa, códigos con mayúsculas, `undefined` y objeto sin `code`).

CA-002-23 [RF-34]
Dado un intento de inicio de sesión con correo inexistente y otro con contraseña errónea de un correo existente, Cuando se comparan los mensajes, Entonces son idénticos.
Cómo se verifica: paso manual en el celular con dos cuentas de prueba (nunca datos reales, ENT-05). **No verificado en dispositivo** (tarea por asignar).

CA-002-24 [RF-35, D-96]
Dado Recuperar contraseña, Cuando se envía un correo con cuenta y otro sin cuenta, Entonces ambos muestran el mismo mensaje neutro; con red caída o demasiados intentos, mensajes distintos; y el correo de restablecimiento llega al correo con cuenta.
Cómo se verifica: script de mapeo para el mensaje (misma función) y paso manual en el celular para el correo recibido. **No verificado en dispositivo** (tarea por asignar).

CA-002-25 [RF-36]
Dado el arranque de la app, Cuando `onAuthStateChanged` aún no responde, Entonces se muestra la pantalla de carga (no Iniciar sesión ni el registro); sin usuario, la pila Iniciar sesión / Crear cuenta / Recuperar contraseña; con usuario y sin `drivers/{uid}`, el registro; pendiente, las pestañas con aviso; aprobado, la pantalla principal.
Cómo se verifica: script fuera del proyecto contra la función pura que decide la rama (si se extrae) y paso manual en el celular con cuentas en cada estado. **No verificado en dispositivo** (tarea por asignar).

CA-002-26 [RF-36, D-97]
Dado un teléfono con la sesión anónima heredada, Cuando se abre la app con la versión nueva, Entonces esa sesión se cierra y aparece Iniciar sesión, sin migrar datos y sin errores visibles.
Cómo se verifica: paso manual en el celular (instalación sobre la versión anterior). **No verificado en dispositivo** (tarea por asignar).

CA-002-27 [RF-37, D-102]
Dado Configuración con sesión iniciada, Cuando se abre, Entonces se ve el correo de la cuenta enmascarado, «Cerrar sesión» y «Cambiar de cuenta»; al pulsar cualquiera aparece una confirmación en la propia pantalla (sin `Alert`) con opción de cancelar.
Cómo se verifica: revisión de código (sin `Alert`, C05) y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-28 [RF-37, D-98]
Dado un viaje en curso, Cuando se intenta cerrar sesión o cambiar de cuenta, Entonces se muestra «Termina o cancela el viaje antes de cerrar sesión» y no cambia nada (sesión, disponibilidad, suscripciones).
Cómo se verifica: script fuera del proyecto contra el procedimiento real con dependencias simuladas, y paso manual. **No verificado en dispositivo** (paso manual; tarea por asignar).

CA-002-29 [RF-37, D-98]
Dado un conductor disponible con solicitud pendiente, Cuando cierra sesión, Entonces se ejecutan en este orden: descartar la solicitud, disponibilidad a no disponible y publicación del estado final, detención de ubicación y de todas las suscripciones y temporizadores, limpieza de contextos y almacenamiento propio, y por último `signOut`.
Cómo se verifica: script fuera del proyecto con dependencias simuladas que registra el orden de las llamadas (incluido el caso sin solicitud y el caso sin disponibilidad).

CA-002-30 [RF-37, D-98]
Dado que la publicación del estado final falla o tarda más de 5 s, Cuando se cierra sesión, Entonces el cierre continúa y termina; ningún paso posterior queda esperando.
Cómo se verifica: script fuera del proyecto con un reloj simulado.

CA-002-31 [RF-37, RNF-04]
Dado el cierre de sesión de la cuenta A seguido del inicio de sesión de la cuenta B, Cuando B abre la app, Entonces no ve datos de A (formulario de registro, perfil, solicitud, viaje, estado de disponibilidad) y `AsyncStorage` no conserva datos propios de A (solo la persistencia de sesión que gestiona Firebase).
Cómo se verifica: paso manual con dos cuentas de prueba y revisión de código de todos los usos de `AsyncStorage`. **No verificado en dispositivo** (tarea por asignar).

CA-002-32 [RF-37]
Dado que `signOut` falla, Cuando se cierra sesión, Entonces aparece el error con «Reintentar» y la app vuelve a resolver el estado de la cuenta vigente.
Cómo se verifica: script fuera del proyecto con `signOut` simulado que rechaza.

CA-002-33 [RNF-15]
Dado el código de autenticación y de `resetSession`, Cuando se busca en logs (`console.*`) y en instrumentación, Entonces no se imprime ningún correo, contraseña ni token (solo códigos de error); la contraseña no se guarda en contexto compartido, `AsyncStorage` ni otro almacenamiento propio, y los campos se limpian al salir de la pantalla y tras el éxito.
Cómo se verifica: búsqueda en `src/` y revisión de código; paso manual (salir y volver a la pantalla: campos vacíos). **No verificado en dispositivo** para la parte manual (tarea por asignar).

CA-002-34 [RNF-15]
Dado Iniciar sesión y Crear cuenta, Cuando se miran los campos y el botón de enviar, Entonces la contraseña está oculta con un botón accesible de mostrar/ocultar cuya etiqueta indica el estado; el correo usa teclado de correo, sin autocapitalizar ni autocorregir; ambos declaran autocompletado y tipo de contenido del sistema; y al enviar el botón queda deshabilitado y un segundo toque no genera un segundo envío.
Cómo se verifica: revisión de código y paso manual (incluido el gestor de contraseñas del sistema). **No verificado en dispositivo** (tarea por asignar).

CA-002-35 [RNF-16, D-99]
Dado el texto de las reglas en `docs/seguridad.md`, Cuando Anderson las publica después de validar la app, Entonces: (a) una cuenta de correo/contraseña lee y escribe sus datos como antes (registro, disponibilidad, viaje guardado); (b) una sesión anónima obtiene permiso denegado en `drivers`, `driverLocations` y `trips`; (c) una cuenta de correo/contraseña no puede leer ni escribir datos de otro `uid`.
Cómo se verifica: script fuera del proyecto con el SDK de Firestore y cuentas de prueba (nunca reales, sin imprimir credenciales) para (b) y (c), y paso manual en el celular para (a). Requiere que el proveedor anónimo siga habilitado durante la prueba (D-99). **No verificado en dispositivo** para (a).

CA-002-36 [RNF-16, D-99]
Dado el orden de publicación, Cuando se revisa `docs/seguridad.md`, Entonces indica: primero validar la app en el celular con las reglas actuales, después publicar las reglas, después repetir la prueba; y que Anderson las publica.
Cómo se verifica: revisión del documento.

CA-002-37 [RF-38]
Dado el código, Cuando se busca `signInAnonymously`, `ensureAnonymousUser` y `DevAccountSwitch`, Entonces no queda ningún uso que dependa de cuentas anónimas (excepto el cierre de sesión de anónimos heredados, que solo lee `isAnonymous`); con `SHOW_DEV_TOOLS` en `false`, ninguna pantalla muestra paneles de desarrollo ni la nota «Tu sesión es anónima…».
Cómo se verifica: búsqueda en `src/` y paso manual. **No verificado en dispositivo** para lo visible (tarea por asignar).

CA-002-38 [RNF-17, ENT-02]
Dado el cierre de la spec, Cuando se revisan `README.md` y `docs/arquitectura*`, Entonces describen el flujo de sesión, D-94 (una cuenta activa a la vez), D-95 (sin verificación de correo), el habilitado del proveedor en la consola y el orden de publicación de reglas.
Cómo se verifica: revisión de los documentos (hecha por la tarea correspondiente).

CA-002-39 [D-58]
Dado el directorio `backend/`, Cuando se compara antes y después, Entonces no hay cambios.
Cómo se verifica: `git diff --stat backend/` vacío.

CA-002-40 [RNF-14, RNF-15, RF-32]
Dado `package.json` y `scripts/dependencies.json`, Cuando se comparan antes y después, Entonces no hay dependencias nuevas.
Cómo se verifica: diferencia vacía y `node scripts/check-constitution.mjs` (C15).

### Criterios de diseño
CA-002-D1 [RNF-17]
Dado Iniciar sesión, Crear cuenta, Recuperar contraseña y la confirmación de Configuración, Cuando se revisa el código, Entonces colores, tipografía, espaciados, radios y bordes salen solo de los tokens, los componentes compartidos (`TextField`, `PrimaryButton`, `SecondaryButton`, `Card`, `ScreenState`) se reutilizan y los íconos son Ionicons vía `Icon.js` junto a texto.
Cómo se verifica: revisión de código (capa A) y del `design-auditor`.

CA-002-D2 [RNF-17, RF-03]
Dado un error de formulario de autenticación, Cuando se muestra, Entonces lleva ícono y texto (no solo color), vive en una región viva `polite`, y tras intentar enviar el foco pasa al primer campo con error.
Cómo se verifica: revisión de código y paso manual con lector de pantalla. **No verificado en dispositivo** (tarea por asignar).

CA-002-D3 [RNF-17]
Dado cada control interactivo de las pantallas nuevas (campos, botones, mostrar/ocultar contraseña, enlaces a Crear cuenta/Recuperar, confirmar/cancelar), Cuando se mide, Entonces su área táctil es de al menos 44 × 44 px con separación mínima de 8 px entre contiguos y cada uno lleva `testID` del contrato: `screen-login`, `screen-signup`, `screen-forgot-password`, `<pantalla>-field-<campo>`, `<pantalla>-error-<campo>`, `login-submit`, `signup-submit`, `forgot-submit`, `login-link-signup`, `login-link-forgot`, `<pantalla>-toggle-password`, `settings-account-email`, `settings-sign-out`, `settings-switch-account`, `settings-session-confirm`, `settings-session-cancel`, `settings-session-error`.
Cómo se verifica: revisión de código y paso manual de las medidas. **No verificado en dispositivo** (tarea por asignar).

CA-002-D4 [RNF-17]
Dado el tamaño de texto al 200 %, Cuando se abren las pantallas nuevas, Entonces ningún campo, mensaje, requisito de contraseña ni botón se corta o se solapa y los contenedores crecen en alto.
Cómo se verifica: paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-D5 [RNF-17]
Dado un campo con foco y el teclado abierto, Cuando se está en cualquier campo de las pantallas nuevas, Entonces el campo, su error y el botón principal quedan visibles por encima del teclado (como CA-001-D5).
Cómo se verifica: paso manual campo por campo, con teclado de texto. **No verificado en dispositivo** (tarea por asignar).

CA-002-D6 [RNF-17, RF-03]
Dado el código de las pantallas nuevas y del cierre de sesión, Cuando se busca `Alert`, Entonces no hay ningún uso.
Cómo se verifica: búsqueda en `src/` y `node scripts/check-constitution.mjs` (C05).

## 5. Casos límite
- **Tabla de mapeo de errores de Firebase** (función pura, D-96): iniciar sesión — `auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found`, `auth/invalid-email` → credenciales; `auth/network-request-failed` → red; `auth/too-many-requests` → demasiados intentos; resto → genérico. Crear — `auth/email-already-in-use` → ya en uso; `auth/weak-password` → ayuda de contraseña (el cliente ya valida los 8 caracteres); `auth/invalid-email` → error de formato bajo el campo; red y límite como arriba; resto → genérico. Recuperar — éxito y `auth/user-not-found` → neutro; red y límite → específicos; `auth/invalid-email` → error de formato; resto → genérico.
- Con la «protección contra enumeración de correos» activa en Firebase, el inicio de sesión devuelve el mismo código para correo inexistente y contraseña errónea; con ella apagada, devuelve dos códigos distintos. El mensaje del usuario es el mismo en ambos casos.
- Iniciar sesión estando sin red: mensaje de red caída, campos conservados (salvo la contraseña, que se limpia al salir de la pantalla), sin pantalla bloqueada.
- Doble toque rápido en «Crear cuenta» o «Iniciar sesión»: un solo envío (D-103, RNF-15).
- Cerrar sesión sin red: la publicación final del paso 3 vence a los 5 s o antes, `signOut` local sigue funcionando y el cierre termina; el estado final puede no haberse publicado (ya ocurre hoy con la cola: se acepta).
- Cerrar sesión con viaje terminado pero resumen sin confirmar (viaje por guardar): se trata como viaje en curso hasta que el conductor lo cierre o salga con la salida segura (D-83); no se bloquea una cuenta ya fuera del viaje.
- Cuenta deshabilitada, eliminada o con sesión revocada durante el uso: la puerta devuelve a Iniciar sesión y se hace la limpieza (pasos 2, 4 y 5; el 3 puede fallar sin sesión y se ignora).
- Cuenta nueva que cierra la app a mitad del registro: al volver tiene sesión y no tiene documento, así que cae en el registro vacío (los datos no se guardan localmente, RNF-04).
- Cuenta A cierra sesión y B inicia en el mismo teléfono: B no ve el formulario, el perfil ni el estado de disponibilidad de A; `drivers/{uid-de-A}` solo es accesible para A.
- Usuario anónimo heredado: pierde el acceso a sus datos de prueba (D-97); no hay recuperación.
- Cuenta con aprobación manual pendiente (D-95): puede iniciar sesión y ver las pestañas con aviso, pero no ponerse Disponible hasta ser aprobada (RF-04).
- Orden de reglas (D-99): si se publican antes de validar la app y falla algo, no se distingue entre un error de la app y uno de reglas; por eso el orden es el definido.
- Dos instalaciones o dos teléfonos con la misma cuenta: ambos pueden estar sesionados (Firebase lo permite); no hay control de sesión única en esta entrega. Si ambos ponen Disponible, ambos escriben en el mismo `driverLocations/{uid}`: caso no cubierto, riesgo aceptado.
- La contraseña con espacios al inicio o al fin se respeta tal como se escribe (no se recorta).
- Color de vehículo cambiado en el registro (cuenta aún pendiente, antes de aprobarse): el marcador usa el valor guardado vigente, sin recargar la app.
- Texto del mapa a escalas grandes: el marcador no escala con la fuente (es un elemento gráfico de tamaño fijo, con área mínima legible).

## 6. No encontrado
- Cuántas cuentas por teléfono admite F1: F1 no menciona sesiones múltiples; D-94 propone la lectura conservadora.
- Si el cierre de sesión de RF-29 («cierre de sesión» en F1 §3) exige confirmación: F1 no lo dice; se pide por buena práctica (ENCARGO).
- Aspecto exacto de «Blanco» como color de silueta (D-100, pregunta abierta para Anderson).
- Rúbrica y pesos (D-17, PARADA; no afecta esta spec).

## 7. Qué debe aprobar el equipo (Anderson)
- La spec completa y sus requisitos (RF-31 a RF-38, RNF-14 a RNF-17) y las decisiones D-93 a D-103 (siguen «Propuesta»).
- La renumeración o el nombre de esta spec respecto a `002-disponibilidad-ubicacion`.
- Dónde se ve el correo de la cuenta (D-102: Configuración) y la representación de «Blanco» (D-100).
- Pasos manuales suyos: habilitar el proveedor correo/contraseña en Firebase, decidir sobre la protección contra enumeración de correos, validar en el celular y publicar las reglas (D-99).
- Aviso: aprobar D-93 deja desactualizados CA-001-22, CA-001-23, la política 1 de `docs/seguridad.md` y la nota de Configuración; planes, tema y tareas de las specs 000/001 pueden quedar desactualizados por la retirada de `ensureAnonymousUser` y de `DevAccountSwitch`.

## 8. Trazabilidad
| Requisito | Criterios |
|---|---|
| RF-31 | CA-002-01 a CA-002-06 |
| RNF-14 | CA-002-07 a CA-002-12 |
| RF-32 | CA-002-13 a CA-002-19 |
| RF-33 | CA-002-20, CA-002-21 |
| RF-34 | CA-002-22, CA-002-23 |
| RF-35 | CA-002-24 |
| RF-36 | CA-002-25, CA-002-26 |
| RF-37 (y RF-29) | CA-002-27 a CA-002-32 |
| RF-38 | CA-002-37 |
| RNF-15 | CA-002-20, CA-002-33, CA-002-34 |
| RNF-16 | CA-002-35, CA-002-36 |
| RNF-17 | CA-002-D1 a CA-002-D6, CA-002-38 |
| D-58 | CA-002-39 |
| Sin dependencias nuevas | CA-002-40 |
| D-93 | CA-002-20 a CA-002-26, CA-002-37 |
| D-94 | CA-002-27, CA-002-31, CA-002-38 |
| D-95 | CA-002-38 |
| D-96 | CA-002-22 a CA-002-24 |
| D-97 | CA-002-26 |
| D-98 | CA-002-28 a CA-002-32 |
| D-99 | CA-002-35, CA-002-36 |
| D-100 | CA-002-13 a CA-002-19 |
| D-101 | CA-002-10 |
| D-102 | CA-002-27 |
| D-103 | CA-002-20, CA-002-34 |
