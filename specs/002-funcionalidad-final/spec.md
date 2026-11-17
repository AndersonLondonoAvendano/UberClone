# Spec 002 — Funcionalidad final: solicitud legible, accesibilidad, marcador de auto y sesiones de conductor

Estado: Borrador (pendiente de aprobación de Anderson; el spec-author no aprueba su propio trabajo). Las decisiones D-93 a D-103 citadas aquí están en estado "Propuesta" y solo viven en esta spec: el agente principal las registra en `docs/decisiones.md`.
**Adición del lote final (2026-11-11, prompt #55, autorizado por Anderson):** esta spec se amplía con los bloques R5 a R10 (§2, §4, §8), las decisiones D-107 a D-110 (Propuesta) y los requisitos RF-39 a RF-52, RNF-18 y RNF-19. R1 a R4 no cambian. El spec-author no añade esos IDs a `docs/requisitos.md` ni las D-xx a `docs/decisiones.md`: lo hace el agente principal. Fuente de los bloques: ENCARGO (prompt #55) y `docs/analisis-brechas-2026-11-11.md` §5 (R0b, filas «Rebanada» F1a a F6), que cita el enunciado del taller (§2 a §9). Estado de la adición: Pendiente de aprobación (puerta autorizada por Anderson para este lote; las D-107 a D-110 siguen «Propuesta»).
**Adición R12 (Stripe como segunda pasarela de prueba, P5):** se añade el bloque R12 (RF-61, RF-62, RNF-20), las decisiones D-116 a D-120 (Propuesta) y los criterios CA-002-109 a CA-002-129. Fuente: ENCARGO (Mercado Pago no permite crear cuentas de prueba). Estado: Propuesta, pendiente de aprobación de Anderson. Aviso P5: los planes, el tema y las tareas de R8 y R11 pueden quedar desactualizados; CA-002-98 (texto del mensaje pendiente) se matiza en CA-002-124.
**Adición R13 (Perfil editable acotado y «Correo de cobros» neutro, P5):** se añade el bloque R13 (RF-63 a RF-66) y los criterios CA-002-130 a CA-002-148. Fuente: ENCARGO (orden #60) y las decisiones D-122 y D-123 (Vigente). Estado: Propuesta, pendiente de aprobación de Anderson. Aviso P5: los planes, el tema y las tareas de T-49 (Perfil de solo lectura), del registro y de Configuración pueden quedar desactualizados; el texto «Por ahora solo puedes ver estos datos.» y la etiqueta «Correo de Mercado Pago» del Perfil y del registro quedan reemplazados. El spec-author no añade RF-63 a RF-66 a `docs/requisitos.md`: lo hace el agente principal.
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

### Lote final (R5 a R10)
Objetivo y porqué: cerrar lo que el enunciado exige y aún falta (Inicio con mapa, documentos del conductor, cobro real de prueba, Historial y Ganancias completos) y declarar con honestidad lo que se omite. Mientras R1 a R4 cuidan la decisión y la cuenta del conductor, R5 a R9 cuidan el dinero y los documentos: son los datos que más importan si algo sale mal. Todo se construye con estilos cerrados: tokens, `Card`, `Chip`, `DataRow`, `ScreenHeader`, `Icon`, `SkeletonBlock`, fuente Inter, `DESIGN.md` y `docs/diseno/guia-de-estilo.md`; ningún color, tamaño ni texto suelto en el código (RNF-19).

Alcance sobre el lote anterior: la frase «sin cambios en `backend/`» (CA-002-39, D-58) y «sin dependencias nuevas» (CA-002-40) valen para R1 a R4. R8 modifica `backend/` por D-107 (que reemplaza D-58 y D-89 para ese fin); la app no añade dependencias en ningún bloque; el backend solo usa lo de `scripts/dependencies.json` y, para firebase-admin, requiere la aprobación de Anderson (ver §7).

### R5 — Inicio con mapa a pantalla completa y tarjeta flotante (RF-39)
Fuente: enunciado §3.1 (R0b, F1b).
- [RF-39] El sistema deberá mostrar en Inicio el mapa a pantalla completa con la ubicación actual del conductor (marcador de R3) y, sobre él, una tarjeta flotante con el interruptor de disponibilidad, el estado y los avisos actuales de Inicio.
- [RF-39] Mientras el conductor esté «Disponible», el sistema deberá publicar su ubicación a `driverLocations/{uid}`; en cualquier otro estado (No disponible, cuenta no aprobada, sin permiso) no deberá publicar ubicación.
- [RF-39] Mientras Inicio esté enfocada, el sistema deberá seguir la ubicación en local para centrar el mapa y mover el marcador, aunque el conductor esté «No disponible» (sin publicar).
- [RF-39] Cuando Inicio pierda el foco (blur) o el conductor pase a «No disponible», el sistema deberá detener el seguimiento local y liberar suscripciones y temporizadores propios de Inicio; la publicación a `driverLocations` sigue las reglas de RF-37 y D-83 (estado final y reposo) sin cambios.
- [RF-39] Si no hay permiso de ubicación, el sistema deberá mostrar un estado claro en la tarjeta (qué falta y por qué) con un botón para pedirlo o abrir los ajustes, y el interruptor no deberá poder dejar «Disponible» sin permiso.
- [RF-39] El sistema no deberá hacer ninguna llamada de ruta (OSRM, Directions) desde Inicio.
- [RF-39, RNF-19] La tarjeta flotante deberá respetar el área segura, tener objetivos táctiles de al menos 48 dp, contraste de texto suficiente sobre el mapa, crecer en alto con la fuente al 200 % y desactivar toda animación o transición con «reducir movimiento».

### R6 — Defecto «NaN:NaN» en Ganancias (RF-40)
Fuente: enunciado §3 (R0b, F1a).
- [RF-40] El sistema deberá formatear fechas y horas mediante una utilidad con guarda que, ante `null`, `undefined`, cadenas (vacías, no numéricas, ISO inválidas) o fechas inválidas, devuelva un texto neutro definido en `labels.js` y nunca «NaN», «Invalid Date» ni un valor impreso a partir de un número inválido.
- [RF-40] El sistema no deberá ocultar visualmente el defecto: la corrección es la guarda en la utilidad, no esconder el elemento ni recortar el texto con estilos.
- [RF-40] El sistema deberá cubrir la utilidad con pruebas puras (casos de la tabla de CA-002-48).

### R7 — Documentos del conductor en la pestaña 3 «Documentos y pagos» (RF-41)
Fuente: enunciado §2, pestaña 3 (R0b, F2); `docs/seguridad.md` para las reglas.
- [RF-41] El sistema deberá pedir en la pestaña 3: licencia (número, foto y fecha de vencimiento posterior a hoy), SOAT (foto y vencimiento posterior a hoy) y revisión técnico-mecánica (foto y vencimiento posterior a hoy), además del correo de Mercado Pago y la aceptación de términos con comisión que ya existen.
- [RF-41] El sistema deberá exigir la revisión técnico-mecánica solo si el vehículo tiene 5 años o más, calculados con el año de modelo registrado y el año actual (año actual − año registrado ≥ 5); si no se exige, deberá mostrar el motivo en pantalla (p. ej. «No se exige: tu vehículo tiene menos de 5 años»). Si el año del vehículo falta o es inválido, deberá exigirla (lectura conservadora; ver Casos límite).
- [RF-41] El sistema deberá mostrar el error bajo cada campo (texto e ícono, región viva `polite`), sin `Alert`, y habilitar «Enviar» solo cuando las 3 pestañas sean válidas, incluidos los campos nuevos.
- [RF-41] El sistema no deberá pedir ni guardar números de cuenta bancaria ni de tarjeta (solo el correo de Mercado Pago).
- [RF-41] El sistema deberá subir las fotos por Cloudinary con el mecanismo vigente (D-68) mediante `PhotoField`, usar `DateField` para las fechas, y guardar en `drivers/{uid}` una estructura clara: un objeto `documents` con `license` (`number`, `photoUrl`, `expiresAt`), `soat` (`photoUrl`, `expiresAt`) y `technicalReview` (`required`, `photoUrl`, `expiresAt`, con `photoUrl` y `expiresAt` nulos si no se exige).
- [RF-41, RNF-16] El sistema deberá documentar en `docs/seguridad.md` el texto de las reglas de `drivers` que validan esa estructura (tipos, longitudes, fechas) y una nota que diga que las fotos de prueba se alojan en URLs públicas no adivinables de Cloudinary y que no deben usarse documentos reales (ENT-05).

### R8 — Pagos reales de prueba, efectivo y saldo (RF-42 a RF-46, RF-52, RNF-18)
Fuente: enunciado §3.4, §4 (R0b, F4c, F4d, F4e); ENCARGO.

#### Modelo del viaje y escritores (RF-42)
- [RF-42, D-108] El sistema deberá crear el documento del viaje en `drivers/{uid}/trips/{tripId}` al COMPLETAR el viaje, con `status: 'completed'`, `paymentStatus: 'pending'` y `paymentMethod` igual a `'mercadopago'` o `'cash'` (el que eligió el pasajero en la solicitud).
- [RF-42, D-108] El sistema deberá pasar `status` a `'paid'` cuando se confirme el cobro (pasarela aprobada, o efectivo confirmado por el conductor) y a `'cancelled'` si el viaje se cancela.
- [RF-42, D-108] El sistema deberá permitir que solo el backend (firebase-admin) modifique `paymentStatus`, `paymentId` y `status` en viajes con `paymentMethod: 'mercadopago'`; la app no deberá poder escribirlos.
- [RF-42, D-108] Cuando el método sea efectivo, el sistema deberá permitir al conductor dueño y aprobado marcar el cobro mediante una regla estrecha: solo cambian `paymentMethod`, `paymentStatus` y `status`; `paymentStatus` pasa de `'pending'` a `'paid'`, `status` pasa de `'completed'` a `'paid'`, y solo si `paymentMethod` ya era `'cash'`; cualquier otra edición y todo borrado quedan denegados.
- [RF-42] El sistema deberá documentar el texto de esas reglas en `docs/seguridad.md` (D-80: Anderson las publica) y guardar `commissionRate` por viaje.

#### Backend de pagos (RF-43, RNF-18)
- [RF-43, D-107] El backend Express deberá exponer `GET /health`, `POST /payments/checkout`, `POST /payments/sync` y `POST /webhooks/mercadopago`.
- [RF-43, RNF-18] `POST /payments/checkout {tripId}` deberá verificar el token del conductor (`verifyIdToken`), comprobar que el viaje pertenece al `uid`, que `status` es `'completed'`, que `paymentMethod` es `'mercadopago'` y que `paymentStatus` no es `'approved'`; tomará el monto DEL DOCUMENTO del viaje (nunca del cuerpo, D-109), exigirá que sea positivo y menor o igual a un tope razonable definido en el backend, creará la preferencia de Checkout Pro con `external_reference = tripId` y devolverá solo el enlace de pago.
- [RF-43] `POST /payments/sync {tripId}` deberá, con el mismo control de identidad y propiedad, consultar el estado del pago con el token de servidor y aplicar el resultado.
- [RF-43, RNF-18] `POST /webhooks/mercadopago` no deberá confiar en el cuerpo recibido: tomará solo el identificador del pago, consultará el pago con el token de servidor, validará `external_reference`, monto, moneda y estado contra el viaje, verificará `x-signature` si `MP_WEBHOOK_SECRET` está definido, aplicará el cambio en una transacción idempotente y no retrocederá nunca un viaje ya `approved`.
- [RF-43, D-108] El sistema deberá mapear el estado de Mercado Pago así: `approved` → `approved`; `pending` o `in_process` → `pending`; `rejected` o `cancelled` → `rejected`.
- [RNF-18] El backend deberá aplicar limitación de peticiones por usuario, limitar el tamaño del cuerpo, no registrar tokens ni cabeceras de autorización, devolver errores genéricos al cliente y cerrar CORS (sin origen comodín).
- [RNF-18] El sistema deberá configurar el backend con las variables `MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `PUBLIC_BASE_URL`, `PORT` y `MP_WEBHOOK_SECRET` (opcional) en `backend/.env`, la app con `EXPO_PUBLIC_BACKEND_URL`, un `backend/.env.example` solo con nombres y `backend/.env` y `backend/secrets/` fuera de Git; ningún secreto en la app ni en logs.

#### Pantalla «Cobro y resumen» (RF-44)
- [RF-44, D-107] La pantalla «Cobro y resumen» deberá mostrar el estado del cobro como `Chip` con texto: «Aprobado», «Pendiente», «Rechazado» o «Efectivo».
- [RF-44] Con método Mercado Pago y estado no aprobado, la pantalla deberá ofrecer «Cobrar con Mercado Pago», que pide el enlace al backend y lo abre con `Linking.openURL`; tras un rechazo, «Reintentar pago».
- [RF-44] La pantalla deberá escuchar el viaje con `onSnapshot`, liberando la suscripción al salir; al volver la app a primer plano deberá llamar a `/payments/sync`, y deberá ofrecer un botón «Verificar pago» con la misma acción.
- [RF-44] Con método efectivo, la pantalla deberá ofrecer «Confirmar efectivo recibido», que ejecuta la escritura estrecha de RF-42.
- [RF-44, RF-03] La pantalla deberá tener estados de cargando (`SkeletonBlock`), error, sin conexión y backend no disponible, cada uno con texto y una salida segura a Inicio; sin `Alert`.
- [RF-44] El sistema no deberá marcar nada como pagado desde la app para método Mercado Pago, ni tratar el regreso del navegador como prueba de pago.

#### Método de pago visible (RF-45)
- [RF-45] El sistema deberá mostrar el método de pago (Mercado Pago o efectivo) en `IncomingRequestCard` y en `TripRequestScreen`, como texto, sin cambiar el orden de R1 ni los `testID` existentes (RF-31).

#### Saldo (RF-46)
- [RF-46] El sistema deberá calcular el saldo como la suma de las ganancias netas de viajes aprobados por la pasarela menos la comisión de los viajes en efectivo, y podrá ser negativo.
- [RF-46] Si el saldo es negativo, el sistema deberá mostrar el texto «Saldo a favor de la plataforma» (con el importe) en vez de un número negativo sin explicación.

#### Ruta planeada (RF-52)
- [RF-52, D-110] El sistema deberá guardar en el viaje una ruta planeada simplificada de como máximo 40 puntos con 4 decimales (`route`), obtenida de la ruta ya calculada para el viaje, sin nuevas llamadas de ruta.
- [RF-52, D-110] Si la ruta no existe, el sistema deberá guardar el viaje sin ella, sin fallar.

### R9 — Historial y Ganancias (RF-47 a RF-50)
Fuente: enunciado §5, §6 (R0b, F3a, F3b, F3c).

#### Historial (RF-47)
- [RF-47] El sistema deberá listar los viajes con `FlatList`, del más reciente al más antiguo.
- [RF-47] El sistema deberá ofrecer filtros de periodo Hoy, Semana, Mes y Rango, y de método Todos, Tarjeta y Efectivo; en Rango, dos `DateField` con inicio menor o igual al fin, mensajes de error en pantalla y un rango máximo razonable (366 días).
- [RF-47] El sistema deberá consultar con `orderBy` y rango solo sobre `createdAt` (sin índice compuesto), cargar 20 por página con «Cargar más», y aplicar el filtro de método en el cliente.
- [RF-47] Cada elemento deberá mostrar fecha y hora, origen → destino, categoría, tarifa, ganancia neta y un `Chip` con el estado de pago; sin viajes, deberá mostrar un estado vacío con texto.
- [RF-47, RNF-19] Los periodos Hoy, Semana y Mes deberán calcularse en la zona horaria de Colombia (UTC−5), con la semana de lunes a domingo.

#### Gráfica de barras (RF-48)
- [RF-48] El sistema deberá dibujar con `View` (sin dependencias) una gráfica de barras de la ganancia neta: por franjas horarias para Hoy, por día para Semana y Mes, y por día o por semana para Rango.
- [RF-48, RNF-19] Cada barra deberá llevar etiqueta de texto y `accessibilityLabel`, y la gráfica un resumen legible (total y barra mayor); nada deberá depender solo del color.

#### Detalle del viaje (RF-49)
- [RF-49] El detalle deberá mostrar la ruta dibujada si existe (si no, lo dirá con texto sin fallar), duración, distancia, comisión, propina, método de pago y estado, y la calificación solo si existe.

#### Ganancias y `useEarnings` (RF-50)
- [RF-50] El sistema deberá calcular en el hook `useEarnings`, con `useMemo`, seis métricas para Hoy, Semana y Mes: viajes, total facturado, comisiones, propinas, neto y promedio por viaje, más el saldo de RF-46.
- [RF-50] El sistema deberá cubrir con pruebas puras el ejemplo del enunciado (8,5 km, 22 min): Económico 19.200 / 3.840 / 15.360 y XL 26.900 / 5.380 / 21.520 (total / comisión / neto), y los límites de semana y mes en la zona horaria de Colombia.

### R10 — Documentación de omisiones (RF-51)
Fuente: enunciado §3, §7 (R0b, F5).
- [RF-51] El sistema deberá entregar `docs/omisiones-y-limites.md` con, para cada punto, qué pide el enunciado, qué se hizo y por qué: FCM (sin notificaciones con la app cerrada), perfil editable frente a «aprobada, sin edición», idioma ES/EN (sin selector, textos en `labels.js`), OSRM y MapLibre frente a Directions y `react-native-maps` (D-82), iOS no verificado, `DateField` solo en Android y propinas y calificación fuera de alcance salvo que existan datos.

### Requisito transversal del lote (RNF-19)
- [RNF-19] Las pantallas y componentes de R5 a R9 deberán usar solo tokens, `Card`, `Chip`, `DataRow`, `ScreenHeader`, `Icon`, `SkeletonBlock` y la fuente Inter, sin valores de color, tamaño ni texto escritos a mano; respetar área segura, objetivos de 48 dp, 200 % de texto sin recorte, «reducir movimiento» y no usar `Alert`; y no pedir dependencias nuevas en la app.

### R11 — Lote de cierre nocturno (RF-53 a RF-60)
Estado: Propuesta, pendiente de Anderson. Fuente: ENCARGO (prompt #57, `AI_LOG.md`), hallazgos de la prueba en celular de Anderson (G1 a G4). No cambia R1 a R10; precisa y corrige lo observado en R5, R8 y R9.
- [RF-53] Cuando Inicio reciba la primera posición, el sistema deberá centrar la cámara con un zoom de barrio (constante en `src/config/map.js`) y no recentrar en las actualizaciones siguientes; el mapa de Inicio deberá ofrecer un botón «Mi ubicación» que recentra, sin animación con «reducir movimiento»; mientras no haya ubicación, deberá mostrar un encuadre de Colombia. No aplica al mapa del viaje (modo seguir) y no añade llamadas de red.
- [RF-54] Cuando un viaje no tenga `paymentMethod` ni `paymentStatus` (guardado antes de esos campos), el sistema deberá mostrar el chip neutro con texto «Cobro simulado» en Historial y detalle; los totales y métricas de Ganancias lo incluyen, el saldo lo excluye y el filtro de método lo muestra solo en «Todos».
- [RF-55] La tarjeta del saldo en Ganancias deberá ajustar su pista a varias líneas sin cortarse ni salirse de la tarjeta, también con texto al 200 %.
- [RF-56] El panel de cobro de «Cobro y resumen» deberá decidirse con una sola regla de render (tabla de estados, función pura): un solo mensaje a la vez con prioridad error de guardado > error del servicio > informativo > éxito; el efectivo nunca llama al backend; el error del servicio aparece solo tras una acción real del usuario; «viaje guardado» y «cobro confirmado» son conceptos distintos.
- [RF-57] El cliente de pagos deberá clasificar sus errores (sin configurar, red, tiempo agotado, sesión vencida, no encontrado, error del servidor, respuesta inválida, error del proveedor) con un mensaje específico y seguro en pantalla.
- [RF-58] El backend deberá incluir `npm run doctor`, que diagnostica entorno, variables por nombre, llave de Firebase, Firestore, token de Mercado Pago y `PUBLIC_BASE_URL`, sin imprimir secretos.
- [RF-59] El proyecto deberá entregar `docs/pagos-guia-rapida.md` con las dos vías de red, la prueba de pago y la tabla síntoma → causa → solución.
- [RF-60] El proyecto deberá entregar `docs/checklist-manana-jueves.md` y `docs/guion-video.md` (de 5 minutos como máximo).

### R12 — Stripe Checkout como segunda pasarela de prueba (RF-61, RF-62, RNF-20)
Estado: Propuesta, pendiente de Anderson. Fuente: ENCARGO (adición R12): Mercado Pago no permite a Anderson crear cuentas de prueba, así que se añade Stripe en modo de prueba conservando Mercado Pago. Porqué: sin una pasarela con tarjeta de prueba validable no se puede demostrar el cobro de punta a punta (RF-43).
- [RF-61] El backend deberá ofrecer Stripe Checkout Sessions como proveedor de pago intercambiable con Mercado Pago (D-116, D-117): `GET /payments/providers` informa cuáles están configuradas; `POST /payments/checkout {tripId, provider}` crea el cobro con el monto del documento del viaje; `POST /payments/sync` reconsulta el estado; `/webhooks/stripe` es opcional (D-120); el método del viaje lo escribe solo el backend mientras el pago no esté aprobado (D-118).
- [RF-62] Cuando haya al menos una pasarela configurada, la app deberá mostrar un botón de cobro por cada una («Cobrar con Mercado Pago», «Cobrar con Stripe (tarjeta de prueba)»); si ninguna, el mensaje «No hay una pasarela de pago configurada»; «Verificar pago» y la verificación al volver a primer plano usan el proveedor del viaje; `stripe` se trata como tarjeta en Historial, detalle y saldo.
- [RNF-20] El sistema deberá usar solo credenciales de prueba (D-119), verificar la firma del webhook, aplicar a Stripe las mismas defensas que a Mercado Pago, no registrar ni imprimir secretos y no añadir dependencias fuera de `scripts/dependencies.json`.

### R13 — Perfil editable acotado y «Correo de cobros» neutro (RF-63 a RF-66)
Estado: Propuesta, pendiente de Anderson. Fuente: ENCARGO (orden #60), D-122 y D-123 (Vigente). Porqué: el Perfil era de solo lectura y el conductor no podía corregir su contacto ni el color de su auto sin pasar por soporte; el nombre «Correo de Mercado Pago» promete un uso que el cobro real no tiene. Placa, categoría y documentos fueron la base de la aprobación manual y la categoría afecta la tarifa, por eso no se editan.
- [RF-63] Cuando el conductor abra el Perfil con datos cargados, la app deberá mostrar la acción «Editar»; solo podrá haber un modo de edición a la vez. Serán editables únicamente el nombre, el celular, el color del vehículo y el correo de cobros. Placa, marca y modelo, año, categoría, estado de la cuenta y documentos serán de solo lectura y mostrarán el texto «Para cambiar estos datos contacta a soporte.» (D-122).
- [RF-64] Mientras el conductor edite, la app deberá validar con los mismos validadores del registro (`isValidFullName`, `isValidPhone`, `isValidVehicleColor`, `isValidEmail`). «Guardar» estará deshabilitado sin cambios o con errores; «Cancelar» descarta lo escrito; los mensajes serán en línea, sin `Alert`; habrá estados guardando, guardado y error. Con error de red se conservará lo escrito y se ofrecerá «Reintentar». La persistencia con `updateDoc` tocará solo esos cuatro campos (nunca `accountStatus`, categoría, placa ni documentos) y los recortes de espacios seguirán D-71. Accesibilidad: roles y etiquetas, estado deshabilitado u ocupado anunciado, mensajes de error anunciados y objetivos táctiles de al menos 48 dp.
- [RF-65] Tras guardar, la app deberá reflejar el nuevo color del vehículo en el marcador del mapa (incluido «Blanco», D-100); el correo de cobros se mostrará enmascarado en lectura y completo solo en edición; y al cambiar de cuenta (A a B) o al ejecutar `resetSession` (D-98) el formulario no mostrará ni conservará datos de la otra cuenta. Seguridad: la regla de Firestore de actualización del documento del conductor solo permitirá cambiar esos cuatro campos y `updatedAt`, y mantendrá `accountStatus`; Anderson la publica a mano (D-80).
- [RF-66] La app deberá mostrar «Correo de cobros» con la ayuda «Correo asociado a tu cuenta de la pasarela de pagos. Solo informativo en esta versión.» en el registro, el Perfil y Configuración (D-123). El campo `documents.mercadoPagoEmail` no se renombra y los textos visibles de la pasarela real no cambian.

## 3. Decisiones relacionadas
D-116 a D-120 (Propuesta, R12): Stripe Checkout, proveedores intercambiables, método de pago por pasarela, rechazo de claves live y webhook opcional.
D-122 y D-123 (Vigente, R13): Perfil editable acotado y «Correo de cobros» neutro.

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

Nuevas del lote final, propuestas por esta spec (todas «Propuesta»; el agente principal las registra en `docs/decisiones.md`):

### D-107 — Pago de prueba real con Mercado Pago Checkout Pro reemplaza el cobro simulado · Vigente (por encargo, prompt #55; Anderson ratifica)
Situación: D-89 declara el cobro SIMULADO y D-58 deja el backend sin cambios; el enunciado (§4) pide preferencia con llave secreta en el backend, confirmación por webhook o sincronización y escucha en tiempo real.
Decisión: Checkout Pro en modo de prueba (credenciales y tarjetas de prueba, nunca dinero real) con backend Express y firebase-admin; D-89 queda Reemplazada y D-58 queda Modificada (el backend deja de estar intacto solo para R8). Tarjeta: solo el backend escribe el resultado; efectivo: el conductor, con la regla estrecha de D-108. La pantalla y el README dicen que es pago de prueba.
Alternativa: mantener el cobro simulado (descartada: incumple §4 del enunciado).
Impacto: añade `firebase-admin` al backend, que hoy no está en `scripts/dependencies.json` (lista `backend`); requiere aprobación de Anderson. CA-002-39 vale solo para R1 a R4. El valor `transfer` de `paymentMethod` de D-89 pasa a `mercadopago` (datos antiguos de prueba, sin migración).

### D-108 — Modelo de estados y escritores del viaje; regla estrecha de efectivo · Vigente (por encargo, prompt #55; Anderson ratifica)
Decisión: el viaje nace al completar con `status: 'completed'`, `paymentStatus: 'pending'` y `paymentMethod` `'mercadopago'` o `'cash'`; `paymentStatus` toma `approved`, `pending` o `rejected`; `status` toma `completed`, `paid` o `cancelled`. Escritores: tarjeta, solo el backend; efectivo, el conductor dueño aprobado, únicamente `paymentMethod`, `paymentStatus` y `status`, de `pending`/`completed` a `paid`, y solo si ya era `cash`. Sin otras ediciones ni borrados. Por qué: el conductor no debe poder declararse pagado un viaje de tarjeta.
Alternativa: que la app marque todo (descartada: falsificable).
Impacto: reglas nuevas en `docs/seguridad.md`; Anderson las publica tras validar (D-99).

### D-109 — El backend toma el monto del documento del viaje; límite aceptado · Vigente (por encargo, prompt #55; Anderson ratifica)
Situación: el enunciado dice enviar `tripId` y monto al backend. El monto sale de una tarifa calculada por la app y el pasajero es simulado (sin cuenta de pasajero).
Decisión: el backend lee el monto del documento del viaje del `uid` autenticado y exige monto positivo y menor que un tope. Límite aceptado y documentado: un conductor modificado podría escribir un monto distinto al crear el viaje; no se resuelve sin un servidor de tarifas y un pasajero real, fuera de alcance.
Alternativa: recalcular la tarifa en el backend (descartada: requeriría ruta y reglas de tarifa en servidor).

### D-110 — Ruta planeada simplificada guardada en el viaje · Vigente (por encargo, prompt #55; Anderson ratifica)
Situación: D-87 prohíbe coordenadas y por eso el historial no dibuja la ruta (RF-27 parcial); el enunciado pide ruta dibujada en el detalle.
Decisión: se guarda una ruta planeada (no el recorrido real del conductor) de máximo 40 puntos con 4 decimales (unos 11 m), solo en `route` del documento del viaje; no se guarda ninguna posición real ni se registra el recorrido. D-87 queda Modificada solo en ese punto; origen y destino siguen guardándose como texto.
Alternativa: no guardar nada (descartada: incumple §6); recorrido real (descartada: privacidad).
Impacto: la regla de viajes admite `route` con validación de tamaño y tipo.

Dependencias: ninguna nueva en la app; en el backend solo `firebase-admin`, ya añadido a `scripts/dependencies.json` (lista «backend») por encargo de Anderson (prompt #55, D-107).

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

### R5 — Inicio con mapa
CA-002-41 [RF-39]
Dado Inicio enfocada con el conductor aprobado, Cuando se abre, Entonces el mapa ocupa toda la pantalla, muestra la ubicación actual con el marcador de auto y encima flota una tarjeta con el interruptor y el estado.
Cómo se verifica: revisión de código y paso manual en el celular. **No verificado en dispositivo** (tarea por asignar).

CA-002-42 [RF-39]
Dado el conductor en «No disponible», Cuando está en Inicio, Entonces el mapa sigue su ubicación en local y no se escribe nada en `driverLocations`; al ponerse «Disponible» se publica; al volver a «No disponible» se detiene el seguimiento local y se publica el estado final según D-83.
Cómo se verifica: script fuera del proyecto con la fuente de ubicación y el escritor simulados que cuenta escrituras por estado, y paso manual con la consola de Firestore. **No verificado en dispositivo** (paso manual).

CA-002-43 [RF-39]
Dado Inicio, Cuando pierde el foco (se abre otra pantalla del menú) o la app pasa a segundo plano, Entonces el seguimiento local se detiene y no quedan suscripciones ni temporizadores de Inicio; al volver a enfocarse se reanuda.
Cómo se verifica: script con suscripciones simuladas que cuenta altas y bajas, y revisión de código de la limpieza del efecto. **No verificado en dispositivo** para el paso manual.

CA-002-44 [RF-39]
Dado un teléfono sin permiso de ubicación, Cuando se abre Inicio, Entonces la tarjeta explica qué falta con texto y ofrece un botón para pedirlo o abrir los ajustes, y el interruptor no deja «Disponible».
Cómo se verifica: paso manual (denegar el permiso) y revisión de código. **No verificado en dispositivo** (tarea por asignar).

CA-002-45 [RF-39]
Dado el código de Inicio, Cuando se busca, Entonces no hay ninguna llamada a OSRM, Directions ni al servicio de ruta.
Cómo se verifica: búsqueda en `src/` de los importes y llamadas del servicio de ruta en los archivos de Inicio.

CA-002-46 [RF-39, RNF-19]
Dado la tarjeta flotante, Cuando se mide y se revisa, Entonces respeta el área segura, sus controles miden al menos 48 dp, el texto cumple contraste 4.5:1 sobre el fondo de la tarjeta (superficie opaca, no el mapa), crece con la fuente al 200 % y no tiene animación con «reducir movimiento» activo.
Cómo se verifica: script de contraste con los tokens (Capa A), revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

### R6 — «NaN:NaN»
CA-002-47 [RF-40]
Dado la pantalla de Ganancias con viajes de prueba que incluyen uno sin fecha, Cuando se abre, Entonces no aparece «NaN», «Invalid Date» ni «NaN:NaN» en ninguna parte.
Cómo se verifica: paso manual en el celular con un viaje de prueba sin fecha. **No verificado en dispositivo** (tarea por asignar); la parte pura se cubre en CA-002-48.

CA-002-48 [RF-40]
Dado la utilidad de formato de fecha y hora, Cuando recibe `null`, `undefined`, `''`, `'abc'`, `'2026-13-45'`, `NaN`, `new Date('x')`, un objeto sin `toDate` y un número fuera de rango, Entonces devuelve siempre el texto neutro de `labels.js`, sin lanzar y sin «NaN»; con una fecha válida (cadena ISO, `Date`, marca de tiempo de Firestore) devuelve el texto esperado.
Cómo se verifica: script de prueba fuera del proyecto contra la función real, con pruebas puras en el repositorio si el planner las asigna.

CA-002-49 [RF-40]
Dado el arreglo, Cuando se revisa la diferencia, Entonces la corrección está en la utilidad (guarda) y no en estilos que oculten el texto (`opacity`, `display`, tamaño cero).
Cómo se verifica: revisión de la diferencia.

### R7 — Documentos del conductor
CA-002-50 [RF-41]
Dado la pestaña 3, Cuando se abre, Entonces hay campos de licencia (número, foto, vencimiento), SOAT (foto, vencimiento) y revisión técnico-mecánica (foto, vencimiento) o su motivo de no exigencia, el correo de Mercado Pago y los términos con comisión.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-51 [RF-41]
Dado la función pura de validación de vencimiento, Cuando recibe hoy, ayer, mañana, vacío, `null` e inválida, Entonces solo «mañana» (posterior a hoy, en zona horaria de Colombia) es válida y las demás devuelven un error con texto.
Cómo se verifica: script fuera del proyecto contra la función real.

CA-002-52 [RF-41]
Dado la función pura que decide si se exige la revisión técnico-mecánica, Cuando recibe el año actual 2026 y años de vehículo 2022, 2021, 2020, 2026, vacío, `null`, texto y un año futuro, Entonces: 2021 y 2020 la exigen (≥5 años); 2022 y 2026 no; vacío, `null`, texto y año futuro la exigen (conservador); y cuando no se exige devuelve el motivo para mostrarlo.
Cómo se verifica: script fuera del proyecto contra la función real con el año actual inyectado.

CA-002-53 [RF-41]
Dado un vehículo de menos de 5 años, Cuando se abre la pestaña 3, Entonces la revisión técnico-mecánica no se pide y se muestra su motivo; con 5 años o más, se pide foto y vencimiento y «Enviar» no se habilita sin ellos.
Cómo se verifica: script de validación del formulario y paso manual. **No verificado en dispositivo** (paso manual).

CA-002-54 [RF-41, RF-03]
Dado un campo inválido de la pestaña 3, Cuando se intenta enviar, Entonces el error aparece bajo ese campo con ícono y texto, sin `Alert`, y «Enviar» solo se habilita con las 3 pestañas válidas.
Cómo se verifica: script contra la función de validación del registro, búsqueda de `Alert` en `src/` y `node scripts/check-constitution.mjs` (C05).

CA-002-55 [RF-41]
Dado el código y el documento guardado, Cuando se busca, Entonces la app no tiene campos ni almacena números de cuenta o de tarjeta, y el documento tiene la estructura `documents.license`, `documents.soat` y `documents.technicalReview` de RF-41.
Cómo se verifica: búsqueda en `src/` y script contra el mapeo a documento.

CA-002-56 [RF-41, D-68]
Dado la subida de las tres fotos, Cuando se envía el registro, Entonces se usan `PhotoField` y el mecanismo de `cloudinary.js` (D-68), con `DateField` en las fechas, sin dependencias nuevas.
Cómo se verifica: revisión de código y diferencia de `package.json` vacía. Subida real: **No verificado en dispositivo** (tarea por asignar).

CA-002-57 [RF-41, RNF-16]
Dado `docs/seguridad.md`, Cuando se revisa, Entonces contiene el texto de las reglas de `drivers` que validan `documents`, la indicación de que Anderson las publica y la nota de fotos de prueba en URLs públicas no adivinables sin documentos reales.
Cómo se verifica: revisión del documento.

### R8 — Pagos, efectivo y saldo
CA-002-58 [RF-42, D-108]
Dado un viaje que se completa, Cuando se crea su documento, Entonces tiene `status: 'completed'`, `paymentStatus: 'pending'`, `paymentMethod` `'mercadopago'` o `'cash'` y `commissionRate`; un viaje cancelado queda con `status: 'cancelled'`.
Cómo se verifica: script fuera del proyecto contra el constructor del registro del viaje (`tripRecord`) y paso manual con la consola de Firestore. **No verificado en dispositivo** (paso manual).

CA-002-59 [RF-42, D-108]
Dado las reglas de Firestore de `docs/seguridad.md`, Cuando un conductor aprobado dueño de un viaje en efectivo pasa `paymentStatus` de `pending` a `paid` y `status` de `completed` a `paid`, Entonces se permite; y se deniega: cambiar otros campos, cambiar el monto, pasar `paymentStatus` a `approved`, marcar un viaje de `mercadopago`, escribir en el viaje de otro `uid`, borrar, o actuar una cuenta no aprobada.
Cómo se verifica: script fuera del proyecto con el emulador o con cuentas de prueba (sin imprimir credenciales) tras publicar las reglas. **No verificado en dispositivo** para el paso manual.

CA-002-60 [RF-42, D-108]
Dado la app, Cuando se busca escritura a `paymentStatus`, `paymentId` o `status: 'paid'` para viajes de `mercadopago`, Entonces no existe en `src/` (solo el backend los escribe); la única escritura de la app es la regla estrecha de efectivo.
Cómo se verifica: búsqueda en `src/` y revisión de código.

CA-002-61 [RF-43, RNF-18]
Dado `POST /payments/checkout`, Cuando se llama sin token, con token inválido, con un `tripId` de otro conductor, con viaje no completado, con método `cash`, con viaje ya `approved`, con monto cero, negativo o por encima del tope, Entonces responde un error genérico sin crear preferencia, y con un viaje válido devuelve solo el enlace.
Cómo se verifica: script fuera del proyecto contra el servidor real con `verifyIdToken`, Firestore y Mercado Pago simulados (tabla de casos).

CA-002-62 [RF-43, D-109]
Dado `POST /payments/checkout` con un cuerpo que incluye `amount` o `title`, Cuando se procesa, Entonces el monto de la preferencia es el del documento del viaje y el valor del cuerpo se ignora; la preferencia lleva `external_reference` igual a `tripId`.
Cómo se verifica: el mismo script, inspeccionando la petición simulada a Mercado Pago.

CA-002-63 [RF-43, RNF-18]
Dado el webhook, Cuando llega una notificación con cuerpo falso (estado `approved` inventado, `tripId` ajeno, monto distinto, moneda distinta, `external_reference` que no corresponde), Entonces el backend consulta el pago con el token de servidor, no aplica nada y responde sin revelar detalles; con `MP_WEBHOOK_SECRET` definido y `x-signature` inválida o ausente rechaza.
Cómo se verifica: script fuera del proyecto con Mercado Pago y Firestore simulados.

CA-002-64 [RF-43]
Dado el webhook o `/payments/sync` recibidos dos o más veces para el mismo pago, y un pago `rejected` o `pending` posterior a un `approved`, Entonces el resultado es el mismo (idempotente) y un viaje `approved` nunca retrocede.
Cómo se verifica: script con transacción simulada que reproduce entregas duplicadas y fuera de orden.

CA-002-65 [RF-43, D-108]
Dado la función pura de mapeo, Cuando recibe `approved`, `pending`, `in_process`, `rejected`, `cancelled`, `refunded`, `undefined` y texto desconocido, Entonces devuelve `approved`, `pending`, `pending`, `rejected`, `rejected` y, para lo no listado, `pending` sin lanzar (lectura conservadora: nunca aprueba lo desconocido).
Cómo se verifica: script de prueba fuera del proyecto contra la función real.

CA-002-66 [RNF-18]
Dado el backend, Cuando se lanzan más peticiones que el límite por usuario, un cuerpo mayor al máximo y una petición desde un origen no permitido, Entonces se responde 429, 413 y sin cabeceras CORS de permiso, respectivamente; y los logs no contienen tokens ni cabeceras de autorización ni el cuerpo de las peticiones.
Cómo se verifica: script contra el servidor real y búsqueda de `console.*` y del registro de peticiones en `backend/src`.

CA-002-67 [RNF-18]
Dado el repositorio, Cuando se revisa, Entonces existe `backend/.env.example` con los nombres `MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `PUBLIC_BASE_URL`, `PORT` y `MP_WEBHOOK_SECRET` (sin valores), `.gitignore` excluye `backend/.env` y `backend/secrets/`, y la app solo usa `EXPO_PUBLIC_BACKEND_URL` y ningún secreto.
Cómo se verifica: revisión de archivos y búsqueda de `MP_ACCESS_TOKEN` en `src/` (sin resultados); `.env` no se lee.

CA-002-68 [RF-43]
Dado `GET /health`, Cuando se llama, Entonces responde correcto sin autenticación y sin datos sensibles.
Cómo se verifica: script contra el servidor real.

CA-002-69 [RF-44]
Dado «Cobro y resumen» con los estados Aprobado, Pendiente, Rechazado y Efectivo, Cuando se muestra cada uno, Entonces el `Chip` lleva texto y ícono, y las acciones son: «Cobrar con Mercado Pago» (pendiente), «Reintentar pago» (rechazado), «Verificar pago» (pendiente o rechazado), «Confirmar efectivo recibido» (efectivo pendiente) y ninguna (aprobado).
Cómo se verifica: script contra la función pura que decide estado y acciones a partir del documento, y paso manual. **No verificado en dispositivo** (paso manual).

CA-002-70 [RF-44]
Dado «Cobrar con Mercado Pago», Cuando se pulsa, Entonces la app pide el enlace al backend con el token del conductor y lo abre con `Linking.openURL`; si el backend falla, no responde o no hay conexión, se muestra el estado correspondiente sin cerrar la pantalla.
Cómo se verifica: revisión de código y paso manual con tarjeta de prueba. **No verificado en dispositivo** (tarea por asignar).

CA-002-71 [RF-44]
Dado el conductor que vuelve del navegador, Cuando la app pasa a primer plano, Entonces se llama a `/payments/sync`, el `onSnapshot` refleja el cambio del backend y el estado pasa a Aprobado sin que la app escriba el pago.
Cómo se verifica: paso manual con pago de prueba y revisión de código de la limpieza de la suscripción. **No verificado en dispositivo** (tarea por asignar).

CA-002-72 [RF-44]
Dado un viaje en efectivo, Cuando el conductor pulsa «Confirmar efectivo recibido», Entonces el viaje pasa a `paid` con la escritura estrecha de RF-42 y la pantalla lo muestra como Efectivo cobrado.
Cómo se verifica: paso manual con la consola de Firestore. **No verificado en dispositivo** (tarea por asignar).

CA-002-73 [RF-44, RF-03]
Dado que no hay red, que el viaje no carga o que el backend no está disponible, Cuando se abre la pantalla, Entonces se muestra cada estado (cargando con `SkeletonBlock`, error, sin conexión, backend no disponible) con texto y salida segura a Inicio, sin `Alert`.
Cómo se verifica: paso manual (modo avión, backend apagado) y búsqueda de `Alert`. **No verificado en dispositivo** (tarea por asignar).

CA-002-74 [RF-45]
Dado una solicitud entrante, Cuando se muestra en `TripRequestScreen` e `IncomingRequestCard`, Entonces se lee el método de pago como texto y los `testID` y el orden de R1 no cambian.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-75 [RF-46]
Dado la función pura del saldo, Cuando recibe viajes aprobados por pasarela, en efectivo y mezclados (incluido el caso en que la comisión en efectivo supera lo aprobado), Entonces devuelve ganancias aprobadas menos comisión de efectivo, puede ser negativo y nunca produce `NaN`.
Cómo se verifica: script de prueba fuera del proyecto contra la función real.

CA-002-76 [RF-46]
Dado un saldo negativo, Cuando se muestra, Entonces aparece «Saldo a favor de la plataforma» con el importe y no un número negativo sin explicación.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-77 [RF-52, D-110]
Dado un viaje completado con ruta calculada, Cuando se guarda, Entonces `route` tiene como máximo 40 puntos, cada coordenada con 4 decimales, y no se guarda ninguna posición real del conductor; sin ruta, el viaje se guarda sin ella y sin fallar.
Cómo se verifica: script fuera del proyecto contra la función pura de simplificación (0, 1, 2, 39, 40, 41 y 500 puntos, coordenadas inválidas) y el constructor del registro.

### R9 — Historial y Ganancias
CA-002-78 [RF-47]
Dado el Historial con viajes, Cuando se abre, Entonces se muestran con `FlatList` del más reciente al más antiguo, 20 por página, y «Cargar más» trae la siguiente página sin duplicados; sin más viajes, el botón desaparece.
Cómo se verifica: script con Firestore simulado (paginación) y paso manual. **No verificado en dispositivo** (paso manual).

CA-002-79 [RF-47]
Dado la función pura de rangos, Cuando se calculan Hoy, Semana y Mes con instantes alrededor de la medianoche de Colombia (UTC−5), el domingo a lunes y el último día de un mes (incluido febrero bisiesto), Entonces los límites son los correctos en hora de Colombia.
Cómo se verifica: script fuera del proyecto contra la función real.

CA-002-80 [RF-47]
Dado el filtro Rango, Cuando se elige inicio mayor que fin, un rango de más de 366 días o falta una fecha, Entonces se muestra el mensaje en pantalla (sin `Alert`) y no se consulta; con rango válido se consulta.
Cómo se verifica: script contra la función de validación del rango y paso manual con los `DateField`. **No verificado en dispositivo** (paso manual).

CA-002-81 [RF-47]
Dado la consulta, Cuando se revisa, Entonces usa `orderBy('createdAt', 'desc')` y rango solo sobre `createdAt`, sin `where` sobre otro campo, de modo que no exige índice compuesto; el filtro Todos/Tarjeta/Efectivo se aplica en el cliente.
Cómo se verifica: revisión de código y script que inspecciona los argumentos de la consulta simulada.

CA-002-82 [RF-47]
Dado un elemento del Historial, Cuando se muestra, Entonces tiene fecha y hora, origen → destino, categoría, tarifa, neto y un `Chip` de estado de pago con texto; sin viajes en el filtro, aparece el estado vacío con texto.
Cómo se verifica: revisión de código y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-83 [RF-48]
Dado la función pura que agrupa ganancia neta, Cuando recibe viajes para Hoy (franjas), Semana y Mes (por día) y Rango (por día o por semana según su longitud), incluidos viajes en los bordes, sin viajes y con fechas inválidas, Entonces cada grupo suma lo correcto, los grupos vacíos valen 0 y las fechas inválidas se excluyen sin lanzar.
Cómo se verifica: script fuera del proyecto contra la función real.

CA-002-84 [RF-48, RNF-19]
Dado la gráfica, Cuando se revisa, Entonces está hecha con `View`, cada barra tiene etiqueta de texto y `accessibilityLabel` (periodo e importe), el resumen legible indica total y barra mayor, y la información no depende solo del color.
Cómo se verifica: revisión de código y paso manual con lector de pantalla. **No verificado en dispositivo** (tarea por asignar).

CA-002-85 [RF-48]
Dado una gráfica sin ganancias, Cuando se muestra, Entonces lo dice con texto y no dibuja barras de alto indefinido.
Cómo se verifica: revisión de código y script sobre la función de escala (máximo 0).

CA-002-86 [RF-49]
Dado el detalle de un viaje con `route`, Cuando se abre, Entonces la ruta se dibuja en el mapa; sin `route` (viajes anteriores a D-110), un texto lo dice sin fallar; el detalle muestra duración, distancia, comisión, propina, método y estado, y la calificación solo si existe.
Cómo se verifica: revisión de código, script contra la función pura de presentación del detalle (con y sin ruta, propina y calificación ausentes) y paso manual. **No verificado en dispositivo** (paso manual).

CA-002-87 [RF-50]
Dado la función pura de métricas, Cuando recibe viajes de hoy, semana y mes, Entonces calcula viajes, total facturado, comisiones, propinas, neto y promedio por viaje (0 si no hay viajes, nunca `NaN`) y el saldo de RF-46.
Cómo se verifica: script de prueba fuera del proyecto contra la función real.

CA-002-88 [RF-50]
Dado el ejemplo del enunciado (8,5 km, 22 min), Cuando se calculan las tarifas, Entonces Económico es 19.200 / 3.840 / 15.360 y XL 26.900 / 5.380 / 21.520 (total / comisión / neto).
Cómo se verifica: script de prueba fuera del proyecto contra las funciones reales de tarifa y comisión, con pruebas puras en el repositorio si el planner las asigna.

CA-002-89 [RF-50]
Dado el hook `useEarnings`, Cuando se revisa, Entonces calcula las métricas con `useMemo`, la pantalla de Ganancias lo usa sin lógica de cálculo propia y `commissionRate` se lee de cada viaje (con el valor vigente solo como respaldo si falta).
Cómo se verifica: revisión de código y `node scripts/check-constitution.mjs` (C12).

### R10 — Omisiones
CA-002-90 [RF-51]
Dado `docs/omisiones-y-limites.md`, Cuando se revisa, Entonces trata FCM, perfil editable frente a «aprobada, sin edición», idioma ES/EN, OSRM y MapLibre frente a Google (D-82), iOS no verificado, `DateField` solo Android, y propinas y calificación, cada uno con qué pide el enunciado, qué se hizo y por qué.
Cómo se verifica: revisión del documento.

### R11 — Lote de cierre nocturno (Propuesta, pendiente de Anderson)
CA-002-91 [RF-53]
Dado el mapa de Inicio, Cuando llega la primera posición, Entonces la cámara se centra en ella con el zoom de barrio definido en una constante de `src/config/map.js`; las actualizaciones siguientes no mueven la cámara (el usuario puede desplazar el mapa).
Cómo se verifica: script contra la función pura que decide si centrar (primera posición, posiciones posteriores, posición nula) y revisión de código (la constante vive en `map.js`). Comportamiento visual: **No verificado en dispositivo** (tarea por asignar).

CA-002-92 [RF-53]
Dado el botón «Mi ubicación», Cuando se toca con ubicación disponible, Entonces la cámara se recentra en la posición actual con el zoom de barrio; con «reducir movimiento» activo salta sin animación; sin ubicación disponible no hace nada y no falla.
Cómo se verifica: revisión de código, script contra la función pura de decisión (con y sin ubicación, con y sin reducir movimiento) y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-93 [RF-53]
Dado el mapa de Inicio sin ubicación aún, Cuando se abre, Entonces se ve un encuadre razonable de Colombia (no el mundo); el cambio no añade llamadas de red y no altera el mapa del viaje, que sigue en modo seguir.
Cómo se verifica: revisión de código (región inicial en `map.js`, sin `fetch` nuevos) y paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-94 [RF-54]
Dado un viaje sin `paymentMethod` ni `paymentStatus`, Cuando la función pura de presentación del estado de pago lo evalúa, Entonces devuelve el chip neutro con el texto «Cobro simulado» (no «Pago sin estado»), y la pantalla lo usa en Historial y detalle.
Cómo se verifica: pruebas puras (sin ambos campos, con solo uno, con ambos) y revisión de código; el texto está en `labels.js`.

CA-002-95 [RF-54]
Dado una lista con viajes antiguos (sin campos de pago) y recientes, Cuando se calculan las métricas de Ganancias, el saldo y el filtro de método, Entonces las métricas los incluyen (por `status` completed o paid), `computeBalance` los excluye y el filtro Tarjeta/Efectivo no los muestra (solo «Todos»); la política queda escrita en `docs/omisiones-y-limites.md` o en el código documentado.
Cómo se verifica: pruebas puras contra `useEarnings` (función de métricas), `computeBalance` y el filtro, y revisión del texto de la política.

CA-002-96 [RF-56]
Dado la función pura de decisión del panel de cobro, Cuando recibe método (efectivo o tarjeta), estado de pago, error de guardado, error del servicio y si hubo acción del usuario, Entonces devuelve una sola salida (mensaje, tono, chip y botones) con la prioridad error de guardado > error del servicio > informativo > éxito, y cubre la tabla completa de estados.
Cómo se verifica: pruebas puras exhaustivas sobre la tabla (todas las combinaciones de método × estado × errores) y revisión de código de que la pantalla solo pinta lo que la función devuelve.

CA-002-97 [RF-56]
Dado un viaje en efectivo, Cuando se abre «Cobro y resumen», Entonces no se llama al backend de pagos ni aparece ningún mensaje del servicio de cobro (tampoco «Servicio de cobro no disponible»); con estado pending muestra el botón «Confirmar efectivo recibido»; cobrado muestra el chip «Efectivo», el mensaje «Efectivo recibido. El viaje quedó guardado en tu historial.» y ningún botón de cobro.
Cómo se verifica: pruebas puras de la tabla y script con fake del cliente de pagos que verifica cero llamadas; paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-98 [RF-56]
Dado un viaje con tarjeta, Cuando está pending, Entonces muestra «Viaje guardado. Falta el pago con Mercado Pago.» con los botones «Cobrar con Mercado Pago» y «Verificar pago»; approved muestra «Pago aprobado. El viaje quedó guardado en tu historial.» sin botones de cobro; rejected muestra «Pago rechazado» con «Reintentar pago».
Cómo se verifica: pruebas puras de la tabla y paso manual con Mercado Pago de prueba. **No verificado en dispositivo** (tarea por asignar).

CA-002-99 [RF-56]
Dado un viaje con tarjeta, Cuando se monta la pantalla o se hace la verificación silenciosa al volver al primer plano y el servicio falla, Entonces no se muestra error del servicio; tras una acción real del usuario («Cobrar», «Verificar», «Reintentar») que falla, aparece el error del servicio y reemplaza al mensaje informativo.
Cómo se verifica: pruebas puras (error con y sin acción del usuario) y paso manual con el backend apagado. **No verificado en dispositivo** (tarea por asignar).

CA-002-100 [RF-56, RNF-19]
Dado el panel de cobro, Cuando se revisa, Entonces el tono de éxito (verde) solo aparece con pago approved o efectivo cobrado (nunca con solo «viaje guardado»), el mensaje vive en una región viva `polite`, no hay `Alert` y todos los textos nuevos están en `labels.js`.
Cómo se verifica: pruebas puras (tono por estado), revisión de código, búsqueda de `Alert` en `src/` y `node scripts/check-constitution.mjs`; lector de pantalla **No verificado en dispositivo** (tarea por asignar).

CA-002-101 [RF-57]
Dado el cliente de pagos, Cuando falla una petición, Entonces clasifica el error en `notConfigured` (sin URL), `offline` (red), `timeout`, `sessionExpired` (401 o 403), `notFound` (404), `serverError` (5xx), `invalidResponse` (cuerpo no interpretable) o `providerError`, y nunca lanza sin clasificar.
Cómo se verifica: script con fakes de `fetch` (sin URL, rechazo de red, demora más allá del tiempo máximo, 401, 403, 404, 500, 503, JSON inválido, error del proveedor).

CA-002-102 [RF-57]
Dado cada clase de error de pagos, Cuando se muestra en pantalla, Entonces tiene un mensaje específico en `labels.js` (por ejemplo «El servicio de cobro no está configurado en esta app», «No se pudo conectar con el servicio de cobro. Revisa tu conexión y que el servicio esté encendido», «Tu sesión expiró; vuelve a iniciar sesión») y ningún mensaje contiene URLs, tokens ni cabeceras.
Cómo se verifica: pruebas con fakes de `fetch` que incluyen URL y token en el error simulado y comprueban que no aparecen en el mensaje; revisión de `labels.js`.

CA-002-103 [RF-58]
Dado `npm run doctor` en `backend/`, Cuando se ejecuta, Entonces comprueba la versión de Node, las variables de entorno por nombre (sin leer su valor en la salida), que la ruta de la llave de Firebase sea legible y con JSON válido, que `firebase-admin` cargue y lea trivialmente Firestore, que el token de Mercado Pago sea válido (solo OK o código HTTP) y avisa si `PUBLIC_BASE_URL` falta o no es https; cada línea sale como OK, FALTA o ERROR con qué hacer.
Cómo se verifica: prueba con fakes (sistema de archivos, Firestore, `fetch`) en cada rama OK, FALTA y ERROR; la ejecución real contra credenciales la hace Anderson (paso manual, no se leen `.env` ni `backend/secrets/`).

CA-002-104 [RF-58, RNF-18]
Dado la salida y los registros de `npm run doctor`, Cuando se inspeccionan con valores secretos conocidos en el entorno simulado, Entonces ningún token, llave ni contenido del `.env` aparece, y no se añade ninguna dependencia fuera de `scripts/dependencies.json`.
Cómo se verifica: prueba con fakes que busca los valores secretos en la salida capturada y revisión de `backend/package.json`.

CA-002-105 [RF-59]
Dado `docs/pagos-guia-rapida.md`, Cuando se revisa, Entonces existe y cubre las dos vías de red para que el teléfono alcance el backend, los pasos de la prueba de pago y una tabla síntoma → causa → solución, según el prompt #57.
Cómo se verifica: revisión del documento.

CA-002-106 [RF-49, RF-54]
Dado el detalle de un viaje antiguo (sin `route`, sin campos de pago), Cuando se abre, Entonces muestra «Ruta no disponible» en lugar del mapa y el chip «Cobro simulado», sin fallar (refuerza CA-002-86 y CA-002-94; cubre T-109 y T-110).
Cómo se verifica: script contra la función pura de presentación del detalle y paso manual. **No verificado en dispositivo** (paso manual).

CA-002-107 [RF-60]
Dado `docs/checklist-manana-jueves.md`, Cuando se revisa, Entonces existe y lista, en pasos comprobables, lo que Anderson debe hacer o verificar el jueves.
Cómo se verifica: revisión del documento.

CA-002-108 [RF-60]
Dado `docs/guion-video.md`, Cuando se revisa, Entonces existe y su guion dura 5 minutos o menos (suma de tiempos por escena).
Cómo se verifica: revisión del documento y suma de los tiempos indicados.

### R12 — Stripe Checkout (Propuesta, pendiente de Anderson)
CA-002-109 [RF-61]
Dado `GET /payments/providers`, Cuando se llama sin ID token válido, Entonces responde 401 sin cuerpo útil; con token válido responde solo booleanos por proveedor (por ejemplo `{mercadopago: true, stripe: false}`), sin claves, URLs ni nombres de variables.
Cómo se verifica: pruebas con fakes de configuración y del guard de autenticación; búsqueda de valores secretos conocidos en la respuesta.

CA-002-110 [RF-61, D-118]
Dado `POST /payments/checkout {tripId, provider}`, Cuando se evalúa, Entonces valida el ID token, que el viaje sea del `uid`, `status` completed, método tarjeta (no efectivo), `paymentStatus` distinto de approved y proveedor configurado; cada caso incumplido devuelve un error genérico sin detalle. Con éxito devuelve solo la URL de pago y escribe `paymentMethod` como `mercadopago` o `stripe` mediante firebase-admin; con pago aprobado nunca cambia el método.
Cómo se verifica: pruebas con fakes de Firestore y de las pasarelas, una por cada condición, incluido el método tras elegir cada proveedor y el intento con pago ya aprobado.

CA-002-111 [RF-61, D-109]
Dado el cuerpo de `checkout` con `amount`, `currency` u otros campos añadidos, Cuando se procesa, Entonces el monto enviado a la pasarela sale SIEMPRE de `fare` del documento del viaje (entero positivo y bajo el tope) y el resto del cuerpo se ignora.
Cómo se verifica: prueba con fake que captura lo enviado a Stripe y a Mercado Pago con cuerpos hostiles.

CA-002-112 [RF-61]
Dado la función pura que convierte el monto del viaje (COP) a la unidad mínima de Stripe, Cuando recibe montos enteros típicos, el mínimo y el tope, Entonces devuelve la unidad correcta para COP y rechaza montos no enteros, cero, negativos o sobre el tope. El número de decimales de COP en Stripe lo fija el plan tras verificarlo en la documentación oficial de Stripe (esta spec no lo afirma).
Cómo se verifica: pruebas puras con tabla de entradas; la cifra del plan cita la página oficial consultada.

CA-002-113 [RF-61]
Dado la función pura de estado de una Checkout Session de Stripe, Cuando se evalúa, Entonces: pago `paid` → approved; `last_payment_error` sin pago → rejected; sesión abierta sin error → pending; sesión expirada → rejected; el resultado depende solo de la sesión y de si coincide con el viaje (referencia al `tripId`, monto y moneda).
Cómo se verifica: pruebas puras exhaustivas sobre la tabla y sobre sesiones que no coinciden.

CA-002-114 [RF-61]
Dado `POST /payments/sync` y el webhook, Cuando se aplica un estado, Entonces se hace en una transacción, rejected → approved se permite, nunca se retrocede desde approved, repetir el mismo resultado no cambia nada (idempotente), y al aprobar se guardan `paymentId`, `paymentStatus` approved y `status` paid.
Cómo se verifica: pruebas con fake de transacciones: rejected→approved, approved→rejected (sin efecto), doble aplicación, dos aplicaciones concurrentes.

CA-002-115 [RF-61, RNF-20, D-120]
Dado `/webhooks/stripe`, Cuando llega una petición, Entonces usa el cuerpo crudo (no el JSON ya interpretado) y valida la cabecera `Stripe-Signature` con HMAC-SHA256 y tolerancia de 5 minutos; firma ausente, inválida, vencida o `STRIPE_WEBHOOK_SECRET` sin configurar devuelve error genérico y no aplica nada; la comparación es de tiempo constante.
Cómo se verifica: pruebas con firmas generadas en el test (válida, alterada, 6 minutos antiguas, sin secreto, sin cabecera).

CA-002-116 [RF-61, RNF-20]
Dado un webhook de Stripe con firma válida, Cuando se procesa, Entonces no confía en el cuerpo: toma solo el identificador de la sesión, la reconsulta a Stripe y aplica el estado como en `sync`; un evento de un viaje inexistente se responde correcto sin aplicar.
Cómo se verifica: prueba con fake de Stripe cuyo cuerpo del evento miente (dice pagado y la sesión dice abierta).

CA-002-117 [RF-61]
Dado la página de retorno del pago de Stripe, Cuando se abre, Entonces es una página estática que dice que se puede volver a la app, sin datos del viaje, monto, `tripId` ni parámetros reflejados.
Cómo se verifica: prueba de la respuesta con parámetros hostiles en la URL y revisión de que no se interpolan. Que el navegador vuelva a la app: **No verificado en dispositivo** (tarea por asignar).

CA-002-118 [RNF-20]
Dado las rutas de Stripe, Cuando se revisan, Entonces tienen las mismas defensas que las de Mercado Pago: límite de peticiones, tamaño máximo de cuerpo, errores genéricos sin traza y ningún secreto, firma o cabecera de autorización en los registros.
Cómo se verifica: pruebas contra el límite y el tamaño, y búsqueda de valores secretos conocidos en los registros capturados.

CA-002-119 [RF-61]
Dado que ninguna pasarela está configurada, Cuando arranca el backend, Entonces arranca con normalidad, `/health` responde, `GET /payments/providers` devuelve ambas en falso y `checkout` responde error genérico.
Cómo se verifica: prueba de arranque con configuración vacía.

CA-002-120 [RNF-20, D-119]
Dado una clave de Stripe que empieza por `sk_live_` o `rk_live_`, Cuando carga la configuración, Entonces Stripe queda como no configurada (los demás proveedores siguen) y ningún registro contiene la clave; `sk_test_` y `rk_test_` se aceptan.
Cómo se verifica: pruebas con claves ficticias de cada prefijo y de formato inválido.

CA-002-121 [RF-58, RNF-20]
Dado `npm run doctor`, Cuando se ejecuta, Entonces reporta una línea por cada pasarela (OK, FALTA o ERROR con qué hacer); es ERROR solo si ninguna está configurada, rechaza claves live con ERROR y nunca imprime secretos.
Cómo se verifica: pruebas con fakes: solo Mercado Pago, solo Stripe, ambas, ninguna, clave live; búsqueda de secretos en la salida. La ejecución real la hace Anderson (no se leen `.env` ni `backend/secrets/`).

CA-002-122 [RF-62, D-117]
Dado la pantalla «Cobro y resumen» con viaje con tarjeta pendiente o rechazado, Cuando el servicio informa pasarelas configuradas, Entonces muestra el botón «Cobrar con Mercado Pago» y/o «Cobrar con Stripe (tarjeta de prueba)» según corresponda; si ninguna está configurada, muestra el mensaje «No hay una pasarela de pago configurada» sin botones de cobro.
Cómo se verifica: pruebas puras sobre `chargePanel` (0, 1 y 2 pasarelas) y revisión de que los textos están en `labels.js`. En pantalla: **No verificado en dispositivo** (tarea por asignar).

CA-002-123 [RF-62]
Dado un viaje con pago iniciado, Cuando el conductor pulsa «Verificar pago» o la app vuelve a primer plano, Entonces la verificación usa el proveedor del viaje (`paymentMethod`), no el último botón pulsado; la verificación silenciosa sigue sin mostrar error del servicio (CA-002-99).
Cómo se verifica: pruebas con fake del cliente de pagos que verifica el proveedor enviado; paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-124 [RF-62, RF-56]
Dado el panel de cobro con dos pasarelas, Cuando se decide qué mostrar, Entonces se mantiene la regla de un solo mensaje (H-4, D-112): una sola salida con la misma prioridad; los botones de pasarela no generan mensajes adicionales. Con una sola pasarela (Mercado Pago) el mensaje pendiente es el literal de CA-002-98; con Stripe configurada y mientras no se haya elegido pasarela, el mensaje pendiente es «Viaje guardado. Falta el pago con tarjeta.» (lectura conservadora, por confirmar).
Cómo se verifica: pruebas puras exhaustivas de la tabla ampliada; paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-125 [RF-62]
Dado un viaje con `paymentMethod` `stripe`, Cuando se calcula Historial, detalle, Ganancias y saldo, Entonces se trata como tarjeta (no como efectivo ni «Cobro simulado»), el chip muestra el nombre de la pasarela («Mercado Pago» o «Stripe») y el filtro «Tarjeta» incluye ambas.
Cómo se verifica: pruebas puras de `historyQuery`, `computeBalance`, `earnings` y la presentación del detalle con viajes de cada método.

CA-002-126 [RF-61]
Dado el flujo de Mercado Pago, Cuando se ejecutan las pruebas existentes de R8 y R11, Entonces pasan sin modificar su comportamiento esperado (preferencia, webhook, sync, estados y textos).
Cómo se verifica: ejecución de las pruebas existentes de pagos sin cambios en sus aserciones.

CA-002-127 [RF-62, RNF-19]
Dado el botón y los textos nuevos, Cuando se revisan, Entonces cumplen el etiquetado accesible con rol y nombre, objetivo de 48 dp, tokens y `labels.js`, y a 200 % de texto el rótulo largo «Cobrar con Stripe (tarjeta de prueba)» no se corta (se ajusta a varias líneas).
Cómo se verifica: revisión estática de componentes y estilos. A 200 % y con lector de pantalla: **No verificado en dispositivo** (tarea por asignar).

CA-002-128 [RNF-20]
Dado el cambio completo, Cuando se revisan `package.json` de la app y del backend, Entonces no aparece ninguna dependencia fuera de `scripts/dependencies.json` (Stripe se consume sin SDK nuevo).
Cómo se verifica: revisión de ambos `package.json` y `node scripts/check-constitution.mjs`.

CA-002-129 [RF-61, D-118]
Dado `docs/seguridad.md` y `firestore.rules` local, Cuando se revisan, Entonces `stripe` figura entre los valores permitidos de `paymentMethod` y se documenta que el backend escribe `mercadopago` o `stripe` solo sin pago aprobado; las reglas se publican en Firebase solo cuando el backend cambie el método a `stripe` (paso manual de Anderson).
Cómo se verifica: revisión de ambos archivos. Publicación: **No verificado en dispositivo** (paso manual, tarea por asignar).

### R13 — Perfil editable y «Correo de cobros» (Propuesta, pendiente de Anderson)
CA-002-130 [RF-63, D-122]
Dado el Perfil con datos cargados, Cuando se abre, Entonces muestra la acción «Editar»; al activarla aparecen como campos editables solo nombre, celular, color del vehículo y correo de cobros, y no hay un segundo modo de edición simultáneo.
Cómo se verifica: pruebas de componente del Perfil (render en lectura y en edición, conteo de campos editables). En el celular: **No verificado en dispositivo** (tarea por asignar).

CA-002-131 [RF-63, D-122]
Dado el Perfil en lectura y en edición, Cuando se revisan placa, marca y modelo, año, categoría, estado de la cuenta y documentos, Entonces no son editables y se muestra el texto «Para cambiar estos datos contacta a soporte.» (desde `labels.js`).
Cómo se verifica: pruebas de componente y revisión de `labels.js`.

CA-002-132 [RF-64]
Dado el modo de edición, Cuando se escribe un valor, Entonces se valida con `isValidFullName`, `isValidPhone`, `isValidVehicleColor` e `isValidEmail` (los mismos del registro, sin copias) y el mensaje de error aparece en línea junto al campo, sin `Alert`.
Cómo se verifica: pruebas de componente con valores válidos e inválidos; búsqueda de `Alert` en el Perfil.

CA-002-133 [RF-64]
Dado el modo de edición, Cuando no hay cambios respecto al perfil cargado o algún campo tiene error, Entonces «Guardar» está deshabilitado (y anunciado como deshabilitado); con al menos un cambio y sin errores se habilita.
Cómo se verifica: pruebas de componente por cada combinación. Anuncio con lector de pantalla: **No verificado en dispositivo** (tarea por asignar).

CA-002-134 [RF-64]
Dado el modo de edición con cambios, Cuando se pulsa «Cancelar», Entonces se descartan los cambios, se vuelve a la lectura con los valores guardados y no se escribe nada en Firestore.
Cómo se verifica: prueba de componente con un fake del repositorio (cero llamadas).

CA-002-135 [RF-64, D-71]
Dado un guardado válido, Cuando se pulsa «Guardar», Entonces se muestra el estado «guardando» (botón ocupado, sin doble envío), después «guardado» y se vuelve a la lectura; los textos se recortan de espacios al guardar.
Cómo se verifica: pruebas con un fake del repositorio que resuelve tras un retardo (una sola llamada aunque se pulse dos veces).

CA-002-136 [RF-64]
Dado un guardado que falla por red, Cuando termina el intento, Entonces se muestra un mensaje de error en línea, se conserva lo escrito en el formulario, se sigue en modo de edición y se ofrece «Reintentar», que repite el guardado con los mismos valores.
Cómo se verifica: prueba con un fake del repositorio que rechaza y luego resuelve. Con el teléfono sin red: **No verificado en dispositivo** (tarea por asignar).

CA-002-137 [RF-64, D-122]
Dado `updateDoc` (vía `driverRepository.updateDriverProfile`), Cuando se guarda, Entonces la llamada incluye solo las rutas de nombre, celular, color del vehículo y `documents.mercadoPagoEmail` (más `updatedAt`) y jamás `accountStatus`, categoría, placa, marca, modelo, año ni otros documentos.
Cómo se verifica: prueba con un fake de Firestore que inspecciona las rutas del `updateDoc`; revisión estática.

CA-002-138 [RF-64, RNF-14]
Dado el modo de edición, Cuando se revisan los componentes, Entonces cada campo y botón tiene rol y etiqueta accesibles, el estado deshabilitado u ocupado se anuncia, los mensajes de error se anuncian al aparecer y todos los objetivos táctiles miden al menos 48 dp.
Cómo se verifica: revisión estática de `accessibilityRole`, `accessibilityLabel`, `accessibilityState`, `accessibilityLiveRegion` y estilos. Lector de pantalla y 200 % de texto: **No verificado en dispositivo** (tarea por asignar).

CA-002-139 [RF-65, D-100]
Dado un guardado exitoso con un color nuevo (incluido «Blanco»), Cuando el conductor vuelve a Inicio, Entonces el marcador del mapa usa el color guardado, sin reiniciar la app.
Cómo se verifica: prueba unitaria de que el marcador se calcula desde el perfil actualizado (suscripción existente). Aspecto en el mapa: **No verificado en dispositivo** (tarea por asignar).

CA-002-140 [RF-65]
Dado el correo de cobros, Cuando el Perfil está en lectura, Entonces se muestra enmascarado (`maskEmail`); al entrar en edición se muestra completo en el campo y, al guardar o cancelar, vuelve a enmascararse.
Cómo se verifica: pruebas de componente en ambos modos.

CA-002-141 [RF-65, D-98]
Dado un formulario de edición con texto sin guardar de la cuenta A, Cuando se cambia a la cuenta B o se ejecuta `resetSession`, Entonces el formulario sale del modo de edición y no muestra ni conserva ningún dato de A (ni en lectura ni en edición de B).
Cómo se verifica: prueba con dos perfiles fake y un `resetSession`; el cambio de cuenta en el teléfono: **No verificado en dispositivo** (tarea por asignar).

CA-002-142 [RF-65, D-80]
Dado `firestore.rules` local y `docs/seguridad.md`, Cuando se revisan, Entonces la regla de actualización de `drivers/{uid}` solo admite cambios en nombre, celular, color del vehículo, `documents.mercadoPagoEmail` y `updatedAt`, y exige que `accountStatus` no cambie; se documenta que Anderson publica la regla a mano.
Cómo se verifica: revisión de ambos archivos y, si hay emulador, pruebas de la regla (intento de cambiar `accountStatus`, categoría o placa rechazado). Publicación en Firebase: **No verificado en dispositivo** (paso manual de Anderson, tarea por asignar).

CA-002-143 [RF-66, D-123]
Dado el registro, el Perfil y Configuración, Cuando se muestra el correo de cobros, Entonces la etiqueta es «Correo de cobros» y la ayuda «Correo asociado a tu cuenta de la pasarela de pagos. Solo informativo en esta versión.», ambas tomadas de `labels.js`, sin la palabra «Stripe» ni «Mercado Pago» en la etiqueta.
Cómo se verifica: revisión de `labels.js` (claves de registro y de Perfil) y búsqueda del texto antiguo «Correo de Mercado Pago» (cero resultados en `src/`).

CA-002-144 [RF-66, D-123]
Dado el cambio de etiqueta, Cuando se revisa el código y las reglas, Entonces `documents.mercadoPagoEmail` conserva su nombre en el modelo, el repositorio, las reglas y el backend, y no hay migración.
Cómo se verifica: búsqueda del identificador y revisión de `docs/seguridad.md`.

CA-002-145 [RF-66, D-123]
Dado el cambio de etiqueta, Cuando se revisan los textos de cobro con la pasarela real (botones «Cobrar con…», nota de pago con tarjeta, método «Tarjeta (Mercado Pago)» o «Tarjeta (Stripe)»), Entonces no cambian respecto a R8 y R12.
Cómo se verifica: comparación de `labels.js` antes y después (solo cambian las claves del correo).

CA-002-146 [RF-63, RF-64]
Dado el Perfil, Cuando el estado de la cuenta es de error, de carga o vacío, Entonces no se ofrece «Editar» y se conservan los estados existentes (reintentar, cargando, vacío).
Cómo se verifica: pruebas de componente por estado.

CA-002-147 [RF-63 a RF-66]
Dado el cambio completo, Cuando se revisan `package.json` y `scripts/dependencies.json`, Entonces no hay dependencias nuevas y el Perfil usa los componentes y tokens compartidos (`TextField`, `PrimaryButton`, `SecondaryButton`, `Card`, `ScreenState`).
Cómo se verifica: `node scripts/check-constitution.mjs` y revisión estática.

CA-002-148 [RF-63 a RF-66]
Dado el flujo completo en un teléfono, Cuando se edita, se guarda, se cambia de cuenta y se prueba sin red, Entonces todo lo anterior se cumple a la vista.
Cómo se verifica: **No verificado en dispositivo** (tarea por asignar; prueba manual de Anderson).

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

CA-002-D7 [RNF-19]
Dado las pantallas y componentes de R5 a R9, Cuando se revisa el código, Entonces colores, tipografía, espaciados, radios y bordes salen solo de los tokens, se reutilizan `Card`, `Chip`, `DataRow`, `ScreenHeader`, `Icon` y `SkeletonBlock`, la fuente es Inter, los textos están en `labels.js` y no se añade ninguna dependencia a la app.
Cómo se verifica: revisión de código (capa A), `node scripts/check-constitution.mjs` (C15) y revisión del `design-auditor`.

CA-002-D8 [RNF-19]
Dado cada pantalla de R5 a R9 con el texto al 200 %, Cuando se abre, Entonces nada se corta ni se solapa, los controles miden al menos 48 dp en Inicio y 44 × 44 px en el resto, el contenido respeta el área segura y toda animación se desactiva con «reducir movimiento».
Cómo se verifica: paso manual. **No verificado en dispositivo** (tarea por asignar).

CA-002-D9 [RNF-19, RF-03]
Dado un estado de pago, un error o un vencimiento inválido, Cuando se muestra, Entonces lleva ícono y texto (no solo color), los errores de formulario viven en región viva `polite` y no se usa `Alert` en ninguna pantalla de R5 a R9.
Cómo se verifica: revisión de código, búsqueda de `Alert` en `src/` y `node scripts/check-constitution.mjs` (C05); paso manual con lector de pantalla. **No verificado en dispositivo** (paso manual).

CA-002-D10 [RNF-19, RF-48]
Dado la gráfica de barras en escala de grises y con el texto al 200 %, Cuando se ve, Entonces cada barra se distingue por su etiqueta de texto y su altura, y las etiquetas no se solapan (se rotan o se muestran de forma alternada si hace falta).
Cómo se verifica: paso manual con captura en escala de grises. **No verificado en dispositivo** (tarea por asignar).

CA-002-D11 [RNF-19, RF-53]
Dado el botón «Mi ubicación» del mapa de Inicio, Cuando se revisa y se mide, Entonces usa `Icon` y tokens, mide 44 × 44 px (`touch.min`), tiene `accessibilityLabel` (texto de `labels.js`) y `testID` propios, y queda separado de la tarjeta flotante sin taparla con texto al 200 %.
Cómo se verifica: revisión de código y paso manual de medidas. **No verificado en dispositivo** (tarea por asignar).

CA-002-D12 [RNF-19, RF-55]
Dado la tarjeta del saldo en Ganancias con el texto al 200 %, Cuando se muestra la pista con ícono, Entonces el texto se ajusta a varias líneas, no se corta ni sale de la tarjeta y la tarjeta crece en alto.
Cómo se verifica: revisión de código (sin altura fija ni `numberOfLines` que corte) y paso manual. **No verificado en dispositivo** (tarea por asignar).

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

**Lote final (R5 a R10)**
- Inicio: permiso concedido solo «mientras se usa» o revocado con la app abierta: se vuelve al estado de permiso y se deja de publicar (la cola de D-83 publica el estado final).
- Inicio: GPS apagado o sin señal: el mapa conserva la última posición y lo dice con texto; no se publica una posición inventada.
- Año del vehículo falta o es inválido, o es futuro: se exige la revisión técnico-mecánica (lectura conservadora). El año de modelo es entero de cuatro cifras; el año actual lo toma de la fecha del teléfono.
- Vencimiento «hoy»: no es válido (debe ser posterior a hoy); el día se cuenta en la zona horaria de Colombia, no en UTC.
- Cambiar el año del vehículo tras llenar la revisión técnico-mecánica: si deja de exigirse, sus datos no se envían (se guardan nulos); si pasa a exigirse, se pide.
- Una cuenta ya aprobada o enviada antes de R7 no tiene `documents`: no se bloquea su acceso (cuentas de prueba); la nota queda en `docs/omisiones-y-limites.md`.
- Pago: el conductor vuelve del navegador sin pagar, o cierra el navegador: queda «Pendiente»; puede reintentar o verificar. Doble toque en «Cobrar con Mercado Pago»: una sola petición en curso.
- Pago: el webhook llega antes que la escritura del viaje, o el viaje no existe: se responde correcto sin aplicar (Mercado Pago reintenta); el viaje se verifica por `/payments/sync`.
- Pago: Mercado Pago aprueba pero el backend cae antes de escribir: `/payments/sync` y el reintento del webhook lo corrigen; el conductor ve «Pendiente» y «Verificar pago».
- Pago: dos pagos para el mismo viaje (reintento tras rechazo): cuenta el aprobado; un segundo aprobado no cambia el estado ni el monto (idempotencia) y se señala para revisión manual (fuera de alcance).
- Viaje sin `paymentMethod` (datos de prueba de D-89: `transfer`, `none`): se trata como «No disponible» en la pantalla de pago, no se ofrece cobrar y no cuenta para el saldo.
- Saldo con solo viajes en efectivo: es negativo (comisión debida) y se muestra como «Saldo a favor de la plataforma».
- El pasajero es simulado (D-109): el monto no lo confirma nadie del lado del pasajero; el límite queda documentado.
- Historial: rango sin viajes → estado vacío; cambiar de filtro durante una carga descarta la respuesta tardía (sin mezclar páginas); filtro de método en el cliente puede dejar una página con menos de 20 elementos aunque haya más: «Cargar más» sigue disponible hasta agotar los resultados del servidor.
- Zona horaria: el teléfono puede estar en otra zona; los límites de Hoy, Semana y Mes se calculan siempre en hora de Colombia (UTC−5, sin horario de verano).
- Detalle: viaje sin `route`, con un solo punto o con coordenadas inválidas: se dice con texto «Ruta no disponible» sin fallar.
- Propina y calificación: no hay origen de datos con pasajero simulado; el detalle muestra propina 0 o «sin propina» y omite la calificación si no existe.

**Lote de cierre nocturno (R11, Propuesta)**
- Mapa de Inicio: si el conductor pierde y recupera la posición, no se recentra solo; solo «Mi ubicación» lo hace. Al volver a enfocar Inicio se considera una primera posición nueva (lectura conservadora, por confirmar).
- Viaje con `paymentMethod` pero sin `paymentStatus` (o al revés): no es «Cobro simulado»; se trata con la lógica de pago existente (lectura conservadora: solo ambos ausentes cuentan como antiguo).
- Panel de cobro: error de guardado y error del servicio a la vez → se muestra solo el de guardado; efectivo con error de servicio residual → se ignora.
- `npm run doctor` sin red: los pasos de Firestore y Mercado Pago salen ERROR con la acción «revisa tu conexión» y los demás pasos siguen corriendo.

**Stripe (R12, Propuesta)**
- El conductor vuelve del navegador sin pagar: queda «Pendiente» y puede reintentar o verificar; una sesión expirada es rejected y permite reintentar con una sesión nueva.
- Cambio de pasarela tras un rechazo: permitido mientras no haya pago aprobado; si ya hubo un aprobado en otra pasarela, un segundo cobro se bloquea (CA-002-110) y el caso se señala para revisión manual (fuera de alcance).
- Clave live cargada por error: Stripe queda desactivada, Mercado Pago sigue (CA-002-120).
- Webhook sin URL pública: no impide el cobro; «Verificar pago» lo cubre (D-120).
- Viaje en efectivo: nunca llama a ninguna pasarela ni a `GET /payments/providers` por esa vía.
- Falla de `GET /payments/providers` (sin red): se clasifica como en D-113 y solo se muestra tras una acción del usuario.
- Pasajero simulado: el monto sigue sin confirmarlo nadie del lado del pasajero (D-109).

**Perfil editable (R13, Propuesta)**
- Guardado sin cambios reales (el conductor escribe y vuelve al valor original): «Guardar» queda deshabilitado (CA-002-133).
- Campo vacío o con solo espacios: es error en línea; no se guarda (CA-002-132).
- El perfil cambia por la suscripción mientras se edita (por ejemplo, edición desde otro teléfono): lectura conservadora, se conserva lo escrito en edición y los valores guardados se actualizan al salir; no se pisa lo escrito.
- Cuenta con perfil sin correo de cobros: «Sin dato» en lectura y campo vacío en edición; `isValidEmail` exige un correo válido al escribir uno (lectura conservadora).
- Doble pulsación de «Guardar» o de «Reintentar»: una sola escritura (CA-002-135).
- Salir de la pantalla con cambios sin guardar: se descartan (lectura conservadora, por confirmar).
- «Transferencia a tu cuenta de Mercado Pago ({email})» en el resumen de cobro habla de la pasarela, no de la etiqueta del campo: no se toca en R13 (lectura conservadora de D-123, por confirmar).

## 6. No encontrado
- Cuántos decimales usa Stripe para COP: no se afirma aquí; el plan lo verifica en la documentación oficial de Stripe.
- Texto del mensaje pendiente con dos pasarelas: propuesto en CA-002-124, por confirmar.
- Cuántas cuentas por teléfono admite F1: F1 no menciona sesiones múltiples; D-94 propone la lectura conservadora.
- Si el cierre de sesión de RF-29 («cierre de sesión» en F1 §3) exige confirmación: F1 no lo dice; se pide por buena práctica (ENCARGO).
- Aspecto exacto de «Blanco» como color de silueta (D-100, pregunta abierta para Anderson).
- Rúbrica y pesos (D-17, PARADA; no afecta esta spec).
- Lote final: `docs/enunciado-taller.pdf` no existe en el repositorio; la fuente es el PDF de Descargas citado en `docs/analisis-brechas-2026-11-11.md` §5. Los textos literales del enunciado no se pudieron cotejar desde el repositorio.
- Tope razonable del monto del cobro, rango máximo del Historial (366 días propuesto) y límite de peticiones por usuario: el enunciado no da cifras; el planner y Anderson las fijan (el 366 está propuesto aquí).
- Texto exacto de propinas y calificación: el enunciado los pide en el detalle, pero no hay fuente de datos con pasajero simulado.

## 7. Qué debe aprobar el equipo (Anderson)
- La spec completa y sus requisitos (RF-31 a RF-38, RNF-14 a RNF-17) y las decisiones D-93 a D-103 (siguen «Propuesta»).
- La renumeración o el nombre de esta spec respecto a `002-disponibilidad-ubicacion`.
- Dónde se ve el correo de la cuenta (D-102: Configuración) y la representación de «Blanco» (D-100).
- Pasos manuales suyos: habilitar el proveedor correo/contraseña en Firebase, decidir sobre la protección contra enumeración de correos, validar en el celular y publicar las reglas (D-99).
- Lote final: RF-39 a RF-52, RNF-18, RNF-19 y las decisiones D-107 a D-110 (siguen «Propuesta»).
- Aprobar D-107 (**reemplaza** D-89 y **modifica** D-58) y D-110 (**modifica** D-87 solo en la ruta planeada): dejan desactualizados CA-002-39 para R8, el texto de «cobro simulado» en la pantalla de resumen, Configuración y README, y D-87 en el punto de coordenadas.
- La dependencia `firebase-admin` en el backend (no está en la lista `backend` de `scripts/dependencies.json`): Anderson decide si la añade; sin ella R8 no puede cumplirse. `express-rate-limit` y `cors` no se piden: límite y CORS se resuelven con código propio.
- Pasos manuales suyos: credenciales de prueba y cuentas de prueba de Mercado Pago, URL pública (`PUBLIC_BASE_URL`) para el webhook, cuenta de servicio de Firebase fuera de Git, publicar las reglas de documentos y de viajes tras validar, y las pruebas en el celular.
- Adición R13: RF-63 a RF-66 (D-122 y D-123 ya Vigentes). Pasos manuales suyos: publicar a mano la regla acotada de actualización de `drivers/{uid}` (D-80) y validar en el celular. Aprobar R13 deja desactualizados las tareas de Perfil de solo lectura (T-49), el texto «Por ahora solo puedes ver estos datos.» y la etiqueta «Correo de Mercado Pago» del registro y del Perfil.
- Adición R12: RF-61, RF-62, RNF-20 y las decisiones D-116 a D-120 (Propuesta). Pasos manuales suyos: clave de prueba de Stripe (`sk_test_`/`rk_test_`) en `backend/.env`, y opcionalmente webhook y su secreto; publicar reglas solo si el backend escribe `stripe`. Aprobar R12 deja desactualizados los planes y tareas de R8/R11 (T-85 a T-97, T-118 a T-130) y CA-002-98.
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
| RF-39 (R5, enunciado §3.1) | CA-002-41 a CA-002-46 |
| RF-40 (R6, enunciado §3) | CA-002-47 a CA-002-49 |
| RF-41 (R7, enunciado §2) | CA-002-50 a CA-002-57 |
| RF-42 (R8, enunciado §3, §4) | CA-002-58 a CA-002-60 |
| RF-43 (R8, enunciado §4) | CA-002-61 a CA-002-65, CA-002-68 |
| RNF-18 (R8, enunciado §4) | CA-002-61, CA-002-63, CA-002-66, CA-002-67 |
| RF-44 (R8, enunciado §3.4, §4) | CA-002-69 a CA-002-73 |
| RF-45 (R8, enunciado §3.2) | CA-002-74 |
| RF-46 (R8, enunciado §4) | CA-002-75, CA-002-76 |
| RF-52 (R8/R9, enunciado §6) | CA-002-77, CA-002-86 |
| RF-47 (R9, enunciado §6) | CA-002-78 a CA-002-82 |
| RF-48 (R9, mejora propia) | CA-002-83 a CA-002-85, CA-002-D10 |
| RF-49 (R9, enunciado §6) | CA-002-86 |
| RF-50 (R9, enunciado §5) | CA-002-87 a CA-002-89 |
| RF-51 (R10, enunciado §3, §7) | CA-002-90 |
| RNF-19 (R5 a R9) | CA-002-46, CA-002-84, CA-002-D7 a CA-002-D10 |
| RF-53 (R11, hallazgo G1-H1) | CA-002-91 a CA-002-93, CA-002-D11 |
| RF-54 (R11, hallazgo G1-H2, G3) | CA-002-94, CA-002-95, CA-002-106 |
| RF-55 (R11, hallazgo G1-H3) | CA-002-D12 |
| RF-56 (R11, hallazgo G1-H4) | CA-002-96 a CA-002-100 |
| RF-57 (R11, G2a) | CA-002-101, CA-002-102 |
| RF-58 (R11, G2b) | CA-002-103, CA-002-104 |
| RF-59 (R11, G2c) | CA-002-105 |
| RF-60 (R11, G4) | CA-002-107, CA-002-108 |
| D-107 | CA-002-58, CA-002-60 a CA-002-73 |
| D-108 | CA-002-58 a CA-002-60, CA-002-65 |
| D-109 | CA-002-62 |
| D-110 | CA-002-77, CA-002-86 |
| RF-61 (R12, ENCARGO) | CA-002-109 a CA-002-119, CA-002-126, CA-002-129 |
| RF-62 (R12, ENCARGO) | CA-002-122 a CA-002-125, CA-002-127 |
| RNF-20 (R12, ENCARGO) | CA-002-115, CA-002-116, CA-002-118, CA-002-120, CA-002-121, CA-002-128 |
| D-116 | CA-002-109 a CA-002-119 |
| D-117 | CA-002-109, CA-002-110, CA-002-122 |
| D-118 | CA-002-110, CA-002-114, CA-002-129 |
| D-119 | CA-002-120, CA-002-121 |
| D-120 | CA-002-115, CA-002-116 |
| RF-63 (R13, ENCARGO, D-122) | CA-002-130, CA-002-131, CA-002-146 a CA-002-148 |
| RF-64 (R13, ENCARGO, D-122) | CA-002-132 a CA-002-138, CA-002-146 a CA-002-148 |
| RF-65 (R13, ENCARGO) | CA-002-139 a CA-002-142, CA-002-147, CA-002-148 |
| RF-66 (R13, ENCARGO, D-123) | CA-002-143 a CA-002-145, CA-002-147, CA-002-148 |
| D-122 | CA-002-130, CA-002-131, CA-002-137 |
| D-123 | CA-002-143 a CA-002-145 |
