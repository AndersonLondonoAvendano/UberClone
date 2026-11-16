# Auditoría de la bitácora — 2026-11-16

<!-- AI-assisted: see docs/AI_LOG.md #68 -->
Estado: **borrador para revisión de Anderson.** Contiene la sección D4 (barrido de secretos), la auditoría D1 y la nota D2.

## Barrido de secretos (D4)

**Método.** Solo archivos rastreados por Git (`git grep -n -I -E`), sin leer `.env`, `backend/.env`, `backend/secrets/*` ni `google-services.json`. El informe lista únicamente ruta:línea y el tipo de patrón; **no se copia ningún valor**. Fecha del barrido: 2026-11-16.

**Resultado general.** Ninguna coincidencia es un secreto real: `sk_test_` con 10 o más caracteres, `AIza…` y `whsec_…` dieron 0 coincidencias. Hay **2 puntos para que Anderson decida** (dato personal probable), marcados abajo. El resto son falsos positivos evidentes.

### Patrones de llave (0 secretos)

| Patrón | Coincidencias | Clasificación |
|---|---|---|
| `sk_test_[A-Za-z0-9]{10,}` | 0 | Sin hallazgos |
| `AIza[0-9A-Za-z_-]{20,}` | 0 | Sin hallazgos |
| `whsec_[A-Za-z0-9]{10,}` | 0 | Sin hallazgos |
| `sk_live` | `scripts/check-constitution.mjs:102`, `:592`; `scripts/tests/doctor.test.mjs:232`, `:285`, `:290`; `docs/AI_LOG.md:1967`, `:1984`, `:2278`, `:3363`; `docs/pagos-stripe-guia.md:22`; `docs/decisiones.md:698`; `docs/backlog.md:2142`; `specs/002-funcionalidad-final/plan.md:372`, `:378`; `specs/002-funcionalidad-final/spec.md:811` | Falso positivo: es el nombre del prefijo en reglas del verificador, en pruebas que comprueban que el backend lo rechaza (D-119) y en texto de documentación. Sin valor de llave detrás |
| `private_key` | `backend/scripts/doctor.mjs:15`; `scripts/tests/doctor.test.mjs:25`, `:115`, `:300`; `docs/AI_LOG.md:3364` | Falso positivo: nombre de campo comprobado por el doctor y por sus pruebas; sin contenido de clave |
| `APP_USR-` / `TEST-<hex>-` (Mercado Pago) | `scripts/check-constitution.mjs:102`; `scripts/tests/paymentsService.test.mjs:71` | Falso positivo: el primero es la expresión del verificador; el segundo es una expresión regular de una prueba que verifica que `src` no contiene tokens de Mercado Pago |

### Cadenas de 32 o más caracteres alfanuméricos

| Rutas | Clasificación |
|---|---|
| `package-lock.json` y `backend/package-lock.json` (cientos de líneas) | Falso positivo: sumas de integridad de paquetes |
| `src/services/location/gpsLocationSource.js:33`; `src/navigation/AppTabBar.js:12`, `:75`; `src/screens/dev/MapTestScreen.js:102`; `src/components/registration/PhotoField.js:11`, `:19`, `:62`; `scripts/tests/fixtures/MainApplication.template.kt:10`, `:14`, `:34` | Falso positivo: solo letras (mayúsculas y minúsculas), sin dígitos; nombres largos de identificadores o importaciones |
| `docs/arquitectura-mapa-recorrido.md:73`, `:76`; `docs/backlog.md:440`, `:441`; `docs/decisiones.md:812`; `docs/progress.md:65` | Falso positivo: solo letras, sin dígitos; nombres de funciones o componentes citados en prosa |

Ninguna cadena larga contiene mezcla de letras y dígitos fuera de los `package-lock.json`.

### Correos y teléfonos personales

Dominios de correo encontrados: `example.com`, `example.test`, `b.com`, `b.co`, `x.co`, `correo.com`, `email.com`, `dominio.algo`, `gmail.com` y `secret-project.iam.gserviceaccount.com`.

| Ruta:línea | Tipo | Clasificación |
|---|---|---|
| `scripts/tests/doctor.test.mjs:20` | Correo de cuenta de servicio de Google | Falso positivo evidente: nombre ficticio («secret-project») en una prueba del doctor |
| Las demás coincidencias de correo en `scripts/tests/*`, `specs/*`, `src/i18n/dictionaries/*`, `docs/backlog.md`, `docs/decisiones.md` y `docs/progress.md` | Correo | Falso positivo: dominios de ejemplo o de relleno (ejemplos de validación y de máscara) |
| **`src/utils/mask.js:2`** | Correo personal probable (`gmail.com`) | **REVISAR.** Comentario de ejemplo cuyo usuario coincide con el nombre de pila del propietario del proyecto. Aunque solo está en un comentario, conviene sustituirlo por `example.com`. No se tocó código |
| **`scripts/tests/profileEdit.test.mjs:58`, `:59` y `scripts/tests/profileEditFlow.test.mjs:15`** | Teléfono de 10 dígitos | **REVISAR.** El resto de teléfonos de prueba (11 coincidencias distintas en 3 archivos de `scripts/tests`) usa un patrón evidentemente ficticio. Estos tres no repiten dígitos y empiezan con un prefijo móvil colombiano; confirmar que no son un número real. No se tocó código |
| `scripts/tests/profileEdit.test.mjs:13`, `:20`, `:34`, `:35`, `:85`; `scripts/tests/profileEditFlow.test.mjs:10`, `:65`, `:72`, `:115`, `:188`; `scripts/tests/profileUpdater.test.mjs:21`, `:31`, `:47` | Teléfono de 10 dígitos | Falso positivo: patrón ficticio en datos de prueba |

### Acciones recomendadas (para Anderson)

1. Sustituir el correo del comentario `src/utils/mask.js:2` por un dominio `example.com`.
2. Confirmar o reemplazar los tres teléfonos señalados en `scripts/tests/profileEdit.test.mjs` y `scripts/tests/profileEditFlow.test.mjs`.
3. Repetir el barrido antes de la entrega (P6) y antes de publicar el repositorio.

## Auditoría de campos de la bitácora (D1)

**Método.** Se leyó `docs/AI_LOG.md` y se evaluó cada `### Entrada #N` con un script temporal de solo lectura (fuera del proyecto). La plantilla de F1 §8 (al inicio del archivo) pide: Fecha, Herramienta/modelo, Prompt textual, Resumen, Usado/modificado/descartado, Archivos y commit, Verificación y Aprendizaje; las entradas usan además Integrante y Objetivo. «(R)» = entrada RECONSTRUIDA, no registrada en el momento. No se rellenó ni se modificó ninguna entrada. «Hash en la entrada» = hash corto citado en la propia entrada (no se infiere). «con texto» no significa que Anderson lo haya escrito: varias Verificaciones las redactó la IA y Anderson debe confirmarlas.

| Entrada | Fecha | Campos ausentes (etiqueta no existe) | Verificación | Aprendizaje | Hash en la entrada | La completa solo Anderson |
|---|---|---|---|---|---|---|
| #1 | 2026-10-27 | Integrante, Objetivo | con texto | marcador «pendiente» | 407d196 | Aprendizaje |
| #2 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #3 (R) | 2026-10-27 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #4 (R) | 2026-10-27 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #5 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #6 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #7 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #8 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #9 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #10 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #11 (R) | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #12 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #13 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #14 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #15 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #16 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #17 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #18 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #19 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #20 | 2026-10-27 | — | con texto | vacía | 407d196 | Aprendizaje |
| #21 | 2026-11-01 | — | con texto | vacía | a5dffc8 | Aprendizaje |
| #22 (R) | 2026-11-01 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #23 | 2026-11-01 | — | con texto | vacía | a5dffc8, 22e9d14 | Aprendizaje |
| #24 | 2026-11-01 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #25 | 2026-11-01 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #26 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #27 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #28 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #29 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #30 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #31 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #32 | 2026-11-02 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #33 | 2026-11-02 | — | con texto | con texto | sin hash | hash |
| #34 | 2026-11-02 | — | con texto | marcador «pendiente» | sin hash | Aprendizaje, hash |
| #35 | 2026-11-04 | — | con texto | marcador «pendiente» | sin hash | Aprendizaje, hash |
| #36 | 2026-11-04 | — | con texto | marcador «pendiente» | sin hash | Aprendizaje, hash |
| #37 | 2026-11-05 | — | con texto | marcador «pendiente» | sin hash | Aprendizaje, hash |
| #38 | 2026-11-05 | — | con texto | marcador «pendiente» | sin hash | Aprendizaje, hash |
| #39 | 2026-11-10 | — | con texto | marcador «pendiente» | sin hash | Aprendizaje, hash |
| #40 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #41 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #42 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #43 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #44 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #45 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #46 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #47 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #48 | 2026-11-10 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #49 | 2026-11-10 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #50 | 2026-11-11 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #51 | 2026-11-11 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #52 | 2026-11-11 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #53 | 2026-11-11 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #54 | 2026-11-11 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #55 | 2026-11-11 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #56 | 2026-11-11 | — | marcador «pendiente» | vacía | sin hash | Verificación, Aprendizaje, hash |
| #57 | 2026-11-11 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #58 | 2026-11-12 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #59 | 2026-11-12 | — | con texto | vacía | sin hash | Aprendizaje, hash |
| #60 | 2026-11-12 | — | vacía | vacía | sin hash | Verificación, Aprendizaje, hash |
| #61 | 2026-11-12 | — | vacía | vacía | sin hash | Verificación, Aprendizaje, hash |
| #62 | 2026-11-16 | — | vacía | vacía | sin hash | Verificación, Aprendizaje, hash |
| #63 | 2026-11-16 | — | vacía | vacía | sin hash | Verificación, Aprendizaje, hash |
| #64 | 2026-11-16 | — | vacía | vacía | sin hash | Verificación, Aprendizaje, hash |
| #65 | 2026-11-16 | Usado/modif./descart., Archivos y commit | vacía | vacía | sin hash | Verificación, Aprendizaje, hash (sin commit aún) |
| #66 | 2026-11-16 | Usado/modif./descart., Archivos y commit | vacía | vacía | sin hash (en curso / sin commit) | Verificación, Aprendizaje, hash (sin commit aún) |
| #67 | 2026-11-16 | Usado/modif./descart., Archivos y commit | vacía | vacía | sin hash (en curso / sin commit) | Verificación, Aprendizaje, hash (sin commit aún) |
| #68 | 2026-11-16 | Usado/modif./descart., Archivos y commit | vacía | vacía | sin hash (en curso / sin commit) | Verificación, Aprendizaje, hash (sin commit aún) |

Notas de la tabla:
- #1 usa la plantilla antigua, sin las etiquetas Integrante ni Objetivo (la plantilla del encabezado tampoco las incluye).
- #65, #66, #67 y #68 no tienen las etiquetas «Usado / modificado / descartado» ni «Archivos y commit» como líneas propias; el contenido equivalente de #65 está en las líneas «Hoy — …» añadidas a la entrada #64 y en su resumen.
- **#66, #67 y #68 están en curso y sin commit.** #68 tiene el Resumen en «(en curso; se completa al cerrar el lote)». #65 tampoco cita commit.
- Verificación con marcador «pendiente»: #49, #50, #51, #52, #54, #55, #56. Aprendizaje con marcador «pendiente: Anderson»: #1 y #34 a #39.
- Aprendizaje con texto: solo #33.

### Resumen de conteos (68 entradas)

| Concepto | Cantidad |
|---|---|
| Entradas totales | 68 (#1 a #68) |
| Reconstruidas (R) | 10 (#3 a #11 y #22) |
| Con alguna etiqueta de la plantilla ausente | 5 (#1, #65, #66, #67, #68) |
| Verificación vacía | 9 (#60 a #68) |
| Verificación con marcador «pendiente» | 7 (#49, #50, #51, #52, #54, #55, #56) |
| Verificación con texto | 52 |
| Aprendizaje vacío | 60 |
| Aprendizaje con marcador «pendiente: Anderson» | 7 (#1, #34 a #39) |
| Aprendizaje con texto | 1 (#33) |
| Con hash de commit citado en la entrada | 20 (#1, #2, #5 a #21, #23) |
| Sin hash | 48 |

### Lo que solo Anderson completa (resumen)

- **Aprendizaje:** 67 de las 68 entradas (todas menos #33).
- **Verificación:** #60 a #68 (vacías) y #49, #50, #51, #52, #54, #55, #56 (marcador «pendiente»); además, confirmar las Verificaciones redactadas por la IA en las demás.
- **Hash de commit:** las 48 entradas sin hash. #66, #67 y #68 no tienen commit todavía (en curso).
- **Marcas de código retiradas en D2:** decidir si se registra una entrada reconstruida para la normalización de la placa y se restituye la marca (ver más abajo).

## Hashes de commit (`git log --format=%h~%ad~%s --date=short`, 44 commits)

Solo se relaciona un commit con una entrada cuando la propia entrada cita el hash. Cualquier otra coincidencia de fecha o de tareas (T-NN) es solo probable y se marca «sin relación segura».

| Hash | Fecha | Asunto | Entrada |
|---|---|---|---|
| e4aa399 | 2026-10-26 | Initial commit | sin relación segura |
| 9472712 | 2026-10-27 | first commit | sin relación segura |
| 407d196 | 2026-10-27 | docs: spec 000, decisiones y bitacora de IA actualizadas (T-01 a T-10) | #1, #2, #5 a #20 (la entrada cita el hash) |
| 4509788 | 2026-10-27 | feat: base de la app, navegacion y backend /health (T-01 a T-10) | sin relación segura |
| 22e9d14 | 2026-11-01 | feat: token type.numeric para cifras (T-14) | #23 (la entrada cita el hash) |
| a5dffc8 | 2026-11-01 | docs: cierre de T-09, T-10 y T-11 y bitacora de IA actualizada | #21, #23 (la entrada cita el hash) |
| 1d4b89a | 2026-11-01 | Merge pull request #1 from AndersonLondonoAvendano/anderson/fundacion-t01-t10 | sin relación segura |
| 4f59f78 | 2026-11-01 | feat: dependencias nativas, servicios de Firebase y Cloudinary, validadores y campos base (T-15 a T-21) | sin relación segura |
| 2d6fe01 | 2026-11-02 | feat: fix photo upload using base64 (Option C) and update project documentation | sin relación segura |
| 4cf9fcc | 2026-11-02 | fix: enviar year y capacity como numeros y mensajes de error en espanol (T-26) | sin relación segura |
| 1b015c1 | 2026-11-05 | feat: cierre de entrega parcial del registro de conductor (T-30 a T-32) | sin relación segura |
| d3f1b62 | 2026-11-05 | feat: boton para quitar foto y teclado que no tapa campos (T-33, T-34) y mejoras de estilo del registro | sin relación segura |
| 573fc7f | 2026-11-05 | Merge pull request #2 from AndersonLondonoAvendano/anderson/diseno-registro | sin relación segura |
| b2a6111 | 2026-11-10 | docs: decisiones D-76 a D-81, contrato de API del pasajero, arquitectura del mapa y plan de entrega final | sin relación segura |
| 946e57e | 2026-11-10 | feat: mapa con MapLibre y OpenFreeMap, modulo de rutas y ubicacion (T-35 a T-37) | sin relación segura |
| 37e52e9 | 2026-11-10 | feat: tarifa y comision, API del pasajero con mock, fuente de ubicacion y disponibilidad (T-38 a T-42) | sin relación segura |
| b65128e | 2026-11-10 | feat: disponibilidad, solicitud, viaje con recorrido en tiempo real y resumen (T-41, T-43 a T-45) | sin relación segura |
| daf4584 | 2026-11-10 | feat: viaje, resumen y tarjeta de solicitud inferior (T-41, T-43 a T-45; T-54 pendiente de validacion) | sin relación segura |
| f0ef3f6 | 2026-11-10 | fix: tarjeta de solicitud simplificada y una sola pantalla de solicitud (T-54) | sin relación segura |
| f7be7cb | 2026-11-11 | Merge pull request #3 from AndersonLondonoAvendano/anderson/estado-y-siguiente-spec | sin relación segura |
| 42ce905 | 2026-11-11 | feat: guardado de viajes, cobro simulado, ganancias, historial y perfil (T-46 a T-49) | sin relación segura |
| 369509a | 2026-11-11 | Merge pull request #4 from AndersonLondonoAvendano/anderson/rebanada-c-viajes | sin relación segura |
| 315ff8c | 2026-11-11 | style(diseno): áreas A y A2 - sistema de diseño, íconos, fuente Inter, drawer y pestañas de registro | sin relación segura |
| 377260a | 2026-11-11 | Merge pull request #5 from AndersonLondonoAvendano/anderson/diseno-ui | sin relación segura |
| af20e21 | 2026-11-11 | style(diseno): áreas B a E - Inicio, solicitud, viaje, resumen, Ganancias, Historial, Perfil, Configuración y registro | sin relación segura |
| 47649c9 | 2026-11-11 | Merge pull request #6 from AndersonLondonoAvendano/anderson/diseno-ui-2 | sin relación segura |
| 2e08786 | 2026-11-11 | feat: precio visible en solicitud, accesibilidad, marcador de auto y gate de sesión con correo y contraseña (S1 a S4b, validado en dispositivo) | sin relación segura |
| 5cbd7df | 2026-11-11 | feat(sesiones): reseteo de sesión, cuenta en Configuración y retiro de paneles de desarrollo (T-70 a T-72, pendiente de validar en el celular) | sin relación segura |
| efcf743 | 2026-11-11 | feat: Inicio con mapa, documentos, pagos con Mercado Pago, efectivo y saldo (pendiente de validar en el celular) | sin relación segura |
| 40c137a | 2026-11-11 | feat: historial con filtros, useEarnings, reglas consolidadas, omisiones y arquitectura de sesiones (pendiente de validar en el celular) | sin relación segura |
| 217685e | 2026-11-12 | feat: pagos con tarjeta via Stripe Checkout, historial, ganancias, detalle de viaje y panel de cobro | sin relación segura |
| 35e5d15 | 2026-11-12 | feat: perfil editable acotado (nombre, telefono, color, correo de cobros) y reglas de edicion (T-157 a T-165, validado en el celular) | sin relación segura |
| 9f3bfd5 | 2026-11-12 | Merge pull request #7 from AndersonLondonoAvendano/anderson/funcionalidad-sesiones | sin relación segura |
| 3010710 | 2026-11-12 | feat: perfil editable por campo, rediseno de login y registro, onboarding y pulido visual | sin relación segura |
| bc46dba | 2026-11-12 | feat: calificacion y propina simuladas, direcciones con Nominatim, cobro tarifa+propina, README y auditoria del enunciado | sin relación segura |
| 33913bd | 2026-11-12 | Merge pull request #8 from AndersonLondonoAvendano/anderson/rediseno-visual | sin relación segura |
| 281ba0b | 2026-11-16 | docs: enunciado del taller y plan de cierre de entrega | sin relación segura |
| f8064c6 | 2026-11-16 | feat: spike FCM con RN Firebase (S1: dependencias, plugins y adaptador de notificaciones) | sin relación segura |
| c6910b7 | 2026-11-16 | feat: backend de notificaciones FCM (S2: registro de tokens, baja y envio de solicitud de prueba) | sin relación segura |
| 6c93374 | 2026-11-16 | feat: notificaciones FCM en el cliente e integracion con sesiones (S3 y S4: servicio, canal, intencion pendiente, ajustes de notificaciones) | sin relación segura |
| 9aea4c7 | 2026-11-16 | docs: capturas de la prueba de notificaciones y respaldo antes del lote L1 | sin relación segura |
| b9adc5e | 2026-11-16 | feat(fcm): toque abre pantalla completa, contador sin forma de boton; lote L1 (OSRM real, ganancias sin tope, npm test) | sin relación segura (el asunto sugiere #64/#65, pero la entrada no cita el hash) |
| e2f232a | 2026-11-16 | wip(l2): estados rechazado/conductor llegando, campos aditivos, saldo completo (pendiente cierre T-232) | sin relación segura (el asunto sugiere #66) |
| 52f4d8f | 2026-11-16 | feat(l3): idioma es/en con selector en Configuracion, mapa del detalle con margen, mantenimientos (validado en dispositivo, STOP-6) | sin relación segura (el asunto sugiere #67) |

Los commits `b9adc5e`, `e2f232a` y `52f4d8f` (asuntos «lote L1», «l2», «l3») son candidatos naturales para #65, #66 y #67, pero la bitácora no los cita y #66/#67 siguen en curso, así que no se asignan. #66, #67 y #68: en curso, sin commit.

## Marcador «#62» (D2)

- `node scripts/check-constitution.mjs` reporta **0 hallazgos C18 antes y 0 después**. La entrada `### Entrada #62` (FCM, Fase 1) existe en el archivo y en HEAD, así que la regla no marca el marcador como colgante.
- Aun así, el marcador era semánticamente incorrecto: `#62` es FCM Fase 1, y los tres marcadores hablaban de la normalización de la placa (T-174, RF-67), trabajo que no aparece en ninguna entrada (se buscó «placa», «plate», «T-174», «autocorrect»). El commit que lo introdujo es `3010710` (2026-11-12), cuyas entradas #60/#61 tratan de perfil, propina y Nominatim. Ninguna entrada corresponde con certeza, así que no se apuntó a otra.
- Cambio mínimo: se retiró la marca `AI-assisted: see docs/AI_LOG.md #62` de `src/utils/validators.js` (línea 52) y `scripts/tests/plateNormalization.test.mjs` (línea 1); en `src/screens/registration/VehicleScreen.js` quedó solo el comentario «T-174: no autocorrect/suggestions on the plate». **Consecuencia:** ese código asistido por IA queda sin entrada de bitácora; Anderson decide si registra una entrada «RECONSTRUIDA, no registrada en el momento» y restituye la marca.
- Cifras: antes 14 errores / 342 advertencias; después 14 errores / 342 advertencias (C18: 0 → 0).
