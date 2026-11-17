# Checklist de la mañana del jueves 2026-11-12 — UberClone Conductor

<!-- AI-assisted: see AI_LOG.md #57 (T-131) -->
Estado: **sin ejecutar.** Anderson la sigue en orden y marca cada paso con «OK» o «Falla: …». Nada de lo que aparece aquí está validado en el celular: todo es **No verificado en dispositivo** hasta que Anderson lo marque. Ninguna tarea pasa a «Validada» sin la evidencia de su paso. Usa solo datos y tarjetas de prueba; no pegues tokens, llaves ni valores de `.env` en el chat, en la bitácora ni en capturas.

Horario base: los tiempos son estimados y el reloj parte de las **08:00** (ajústalo si empiezas distinto). El **código se congela a las 13:00** (paso 5). Guías de apoyo: [pagos-stripe-guia.md](pagos-stripe-guia.md) (Stripe: cuenta de prueba, clave, tarjetas y tabla síntoma-causa-solución), [pagos-guia-rapida.md](pagos-guia-rapida.md) (elección de pasarela, red y Mercado Pago), [checklist-dispositivo-sesiones.md](checklist-dispositivo-sesiones.md) y [omisiones-y-limites.md](omisiones-y-limites.md). Informe visual de apoyo: [ronda-2-cierre.md](diseno/auditorias/ronda-2-cierre.md).

## Resumen de tiempos

| Paso | Qué | Estimado | Reloj sugerido |
|---|---|---|---|
| 1 | Instalar dependencias, doctor, backend y red | 45 min | 08:00 a 08:45 |
| 2 | Prueba de tarjeta con Stripe (aprobada, rechazada, botones, verificación, detalle) | 35 min | 08:45 a 09:20 |
| 3 | Pruebas en el celular (3.1 a 3.10) | 80 min | 09:20 a 10:40 |
| 4 | Reglas de Firestore | 5 min | 10:40 a 10:45 |
| 5 | Congelar código | 10 min | 12:50 a 13:00 |
| 6 a 11 | Bitácora, README, PDF, limpieza, video, commit, PR | 3 h aprox. | 13:00 en adelante |

Colchón: entre las 10:45 y las 12:50 quedan unas 2 h 05 min para repetir pasos que fallen y corregir. Si a las **11:30** el paso 3 no está completo, aplica el [plan de contingencia](#plan-de-contingencia).

---

## 1. Dependencias, doctor y backend (45 min)

- [ ] **1.0 Instalar las dependencias del backend (5 min).** `backend/node_modules` **no está instalado**: en PowerShell, `cd backend` y `npm install` (Node 20.12 o superior). Es la primera vez que el backend corre de verdad por HTTP: sus rutas solo se probaron con fakes.
  - Listo cuando: `npm install` termina sin error y existe `backend/node_modules`. Resultado: OK / Falla: ______
- [ ] **1.0b Cuenta y clave de Stripe en modo de prueba (5 min, una sola vez).** Sigue [pagos-stripe-guia.md](pagos-stripe-guia.md), secciones 1 a 3: cuenta en modo de prueba, clave secreta `sk_test_` copiada **directo** a `backend/.env` en `STRIPE_SECRET_KEY` (no la pegues en chats). Si el checkout rechaza COP, usa `STRIPE_CURRENCY=usd` y `STRIPE_COP_PER_USD` (solo de prueba).
  - Listo cuando: `STRIPE_SECRET_KEY` está definida en `backend/.env` y tienes la clave de prueba, no una `live`. Resultado: OK / Falla: ______

- [ ] **1.1 Diagnóstico (5 min).** En PowerShell: `cd backend` y `npm run doctor`.
  - Listo cuando: el comando termina con código 0 (`$LASTEXITCODE` igual a 0), no hay líneas `FALTA` ni `ERROR` y aparecen `Stripe: la API respondió OK.` y `Pasarela Stripe: configurada.`. Los `AVISO` (por ejemplo `PUBLIC_BASE_URL` sin https, `STRIPE_WEBHOOK_SECRET` sin definir, `MP_ACCESS_TOKEN` sin definir) no bloquean.
  - Mercado Pago: sin `MP_ACCESS_TOKEN` el doctor lo marca `AVISO` si Stripe está configurada; no hace falta para este paso.
  - Si falla: [pagos-stripe-guia.md](pagos-stripe-guia.md), secciones 3, 5 y 11. Resultado: OK / Falla: ______
- [ ] **1.2 Arrancar el backend (3 min).** `npm start` en `backend/` (primer arranque real por HTTP).
  - Listo cuando: imprime `Servidor escuchando en el puerto 3001` (o el de `PORT`) y la ventana queda abierta.
  - Resultado: OK / Falla: ______
- [ ] **1.3 `/health` en el PC (2 min).** Abre `http://localhost:3001/health` en el navegador del PC.
  - Listo cuando: muestra `{"status":"ok","service":"uber-clone-backend"}`.
  - Resultado: OK / Falla: ______
- [ ] **1.4 Elegir la vía de red y abrir `/health` desde el celular (15 min).** Elige una sola:
  - **Vía IP + firewall (misma Wi-Fi):** `ipconfig` para la IPv4; regla de firewall en PowerShell como administrador (comando exacto en la guía, sección 4); `PUBLIC_BASE_URL=http://<IP>:3001`. Sirve para la app; **no** para el webhook (se usará «Verificar pago»). Solo funciona en el build debug. Que Stripe acepte una URL de retorno `http://` es **NO CONFIRMADO**: si el checkout da error de URL, cambia a la vía túnel.
  - **Vía túnel:** con el backend corriendo, en otra ventana `cloudflared tunnel --url http://localhost:3001` y anota la URL `https://...` (cambia en cada ejecución). Habilita el webhook.
  - Listo cuando: **en el navegador del celular** se abre `<URL>/health` y muestra el mismo JSON que en 1.3. Medible: si a los 15 min no abre, cambia de vía una sola vez; si tampoco abre, ve al plan de contingencia (C1).
  - Resultado: OK (vía: IP / túnel) / Falla: ______
- [ ] **1.5 Actualizar las dos URLs (5 min).** Pon la URL elegida en `PUBLIC_BASE_URL` (`backend/.env`) y en `EXPO_PUBLIC_BACKEND_URL` (`.env` de la raíz, sin secretos). Reinicia el backend (`Ctrl+C`, `npm start`).
  - Listo cuando: el backend vuelve a decir `Servidor escuchando...` y `<URL>/health` sigue respondiendo desde el celular.
  - Resultado: OK / Falla: ______
- [ ] **1.6 Reiniciar Metro con caché limpia (5 min).** En la raíz: `npx expo start -c`. Abre la app en el celular (development build ya instalado).
  - Listo cuando: la app abre, inicia sesión y el cobro con tarjeta **no** muestra «Servicio de cobro sin configurar» (eso confirma que leyó `EXPO_PUBLIC_BACKEND_URL`).
  - **Build nativo:** solo si hace falta uno nuevo (la app no abre o falta un módulo nativo), lo hace **Anderson** (`expo run:android`); Claude no lo ejecuta. Si el build instalado ya abre, no hay que rehacerlo.
  - Resultado: OK / Falla: ______

## 2. Prueba de tarjeta con Stripe (35 min)

Requisitos: paso 1 completo y sesión iniciada con una cuenta aprobada. Tarjetas de prueba de Stripe (guía [pagos-stripe-guia.md](pagos-stripe-guia.md), secciones 7 y 8; contrasta con <https://docs.stripe.com/testing>): `4242 4242 4242 4242` aprobada y `4000 0000 0000 0002` rechazada, con cualquier fecha futura y cualquier CVC.

Para cada caso: completa un viaje, en «Cobro y resumen» elige **tarjeta**, toca **«Cobrar con Stripe (tarjeta de prueba)»**, paga en el navegador, **vuelve a la app a mano** y toca **«Verificar pago»**. Todo lo de este paso es **No verificado en dispositivo** hasta que Anderson marque OK.

- [ ] **2.1 Aprobada, `4242…` (10 min).**
  - En la app: el chip pasa a **«Aprobado»** y el panel dice «Pago aprobado. El viaje quedó guardado en tu historial.»
  - En Firestore: `drivers/{uid}/trips/{tripId}` con `paymentMethod = stripe` y `paymentStatus = approved`.
  - Listo cuando: ambas cosas se ven, a más tardar 1 min después de «Verificar pago». Resultado: OK / Falla: ______
- [ ] **2.2 Rechazada, `4000 0000 0000 0002` (8 min).** Viaje nuevo.
  - En la app: chip **«Rechazado»** (rojo), panel «Pago rechazado…» y botón de reintento visible. **Aviso:** la documentación leída no confirma que Stripe exponga el rechazo en el flujo usado; si el chip queda en **«Pendiente»**, anótalo como «rechazo visto como pendiente» (no es un fallo de prueba tuyo) y sigue.
  - En Firestore: `paymentStatus` = `rejected` (o `pending` si se vio como pendiente).
  - Listo cuando: chip, texto y botón no se contradicen (chip rojo con texto de rechazo, o pendiente con texto de pendiente). Resultado: OK / Falla / Rechazo visto como pendiente: ______
- [ ] **2.3 Botón por pasarela y mensaje sin pasarela (5 min, T-147).** Con solo Stripe configurada debe verse el botón «Cobrar con Stripe (tarjeta de prueba)» y no el de Mercado Pago. Con ninguna pasarela configurada (quita `STRIPE_SECRET_KEY`, reinicia backend; opcional), debe verse «No hay una pasarela de pago configurada» sin botones de cobro.
  - Listo cuando: lo que se ve coincide con las pasarelas configuradas y el rótulo largo del botón no se corta a 200 % de fuente (revisa también en el paso 3.3). Resultado: OK / Falla / No aplica: ______
- [ ] **2.4 Verificación al volver a la app (5 min, T-148).** Paga con `4242…`, vuelve a la app **sin** tocar «Verificar pago».
  - Listo cuando: en un tiempo razonable el chip pasa a «Aprobado» por la verificación silenciosa, sin mostrar error del servicio; si no cambia, toca «Verificar pago» y anota «Falla: no verifica sola». Resultado: OK / Falla: ______
- [ ] **2.5 Historial y detalle con Stripe (5 min, T-150).** En Historial, el viaje del 2.1 muestra el nombre de la pasarela («Stripe») y el filtro «Tarjeta» lo incluye; el detalle nombra la pasarela.
  - Listo cuando: chip y detalle dicen «Stripe» (no «Efectivo» ni «Cobro simulado»). Resultado: OK / Falla: ______
- [ ] **2.6 Mercado Pago: No verificado en dispositivo.** **No se pudieron crear cuentas de prueba de Mercado Pago**, así que el cobro con Mercado Pago (APRO, OTHE, CONT; guía de pagos, sección 6) **queda «No verificado en dispositivo»**. Su código no cambió y sus pruebas estáticas siguen válidas (CA-002-126).
  - **Rama de contingencia:** si más tarde Anderson logra crear las cuentas, ejecuta la sección 6 de [pagos-guia-rapida.md](pagos-guia-rapida.md) con `MP_ACCESS_TOKEN` y anota aquí el resultado; si no, no se afirma nada sobre Mercado Pago en el video ni en el README. Si **Stripe tampoco** funciona (cuenta, COP o red), aplica C10 y C1.
  - Resultado: No verificado en dispositivo / OK / Falla: ______

Si algo falla: tabla síntoma-causa-solución de [pagos-stripe-guia.md](pagos-stripe-guia.md), sección 11, y la de la guía rápida, sección 7. Si «Verificar pago» deja `approved` pero la app no cambia, anota «Falla» y revisa la ventana del backend.

## 3. Pruebas en el celular (80 min)

Usa el celular Android con el development build. Para los pasos de 200 %: Ajustes del sistema, Pantalla, Tamaño de fuente (o Accesibilidad), al máximo; devuelve a 100 % al terminar. Cada paso lleva su tarea; **solo con «OK» en todos los pasos de una tarea esa tarea puede pasar a «Validada»**. Si una falla, no pasa y se anota qué se entrega como «No verificado en dispositivo» (plan de contingencia).

| Paso | Tarea(s) | Qué hacer y qué ver | Listo cuando (medible) | Resultado |
|---|---|---|---|---|
| 3.1 (10 min) Inicio, zoom de barrio | T-121 | Abre Inicio con ubicación activada. Sin posición se ve Colombia; al llegar la posición el mapa se centra con zoom de barrio, **una sola vez**. Desplaza el mapa a otro lado. | El mapa queda centrado en tu posición en menos de 30 s y, tras desplazarlo, **no vuelve solo** durante 30 s. | OK / Falla: |
| 3.2 (5 min) Botón «Mi ubicación» | T-121 | Toca el botón «Mi ubicación» (esquina del mapa, `home-my-location`). Si tienes «Reducir movimiento» activado, hazlo también así. | Recentra en tu posición (sin animación con «Reducir movimiento»); el botón mide al menos 44 x 44 pt y no tapa la tarjeta flotante. | OK / Falla: |
| 3.3 (8 min) Inicio al 200 % | T-121 | Fuente al 200 %. Abre Inicio. | Botón, tarjeta flotante y atribución del mapa (OpenFreeMap, OpenStreetMap) visibles y sin solaparse; nada cortado. | OK / Falla: |
| 3.4 (12 min) Panel de cobro: efectivo | T-119 | Viaje en efectivo: panel pendiente y luego «Confirmar efectivo recibido». | Un solo mensaje por vez, **sin** mensajes del servicio de cobro ni botones de tarjeta; tras confirmar, estado cobrado en tono de éxito. | OK / Falla: |
| 3.5 (8 min) Panel de cobro: tarjeta y errores | T-119, T-126 | Tarjeta pendiente, aprobada y rechazada (ya vistas en el paso 2, con Stripe). Luego apaga el backend (`Ctrl+C`) y toca «Verificar pago». Después quita `EXPO_PUBLIC_BACKEND_URL` solo si quieres ver «sin configurar» (opcional; requiere `npx expo start -c`). | Antes de tocar nada no aparece error del servicio. Con el backend apagado, **tras tocar el botón**, aparece «Sin conexión con el cobro…» (o «El cobro tardó demasiado…» tras ~15 s). Los mensajes no muestran URL ni token. Verde solo con éxito real. | OK / Falla: |
| 3.6 (6 min) Historial con «Cobro simulado» | T-123 | Abre Historial. Un viaje antiguo (sin método ni estado de pago) y uno reciente. | El antiguo muestra el chip **«Cobro simulado»**; el reciente, su estado real (Aprobado, Rechazado, Pendiente o Efectivo). Si no existe un viaje antiguo en tus datos, anota «sin dato para probar» y no valides T-123. | OK / Falla / Sin dato: |
| 3.7 (10 min) Detalle del viaje: con ruta y sin ruta | T-109, T-110 | Toca un viaje reciente (con ruta) y uno antiguo (sin ruta). Verifica duración, distancia, comisión, propina, método y estado; vuelve al Historial. | Reciente: mapa con la línea de la ruta dibujada. Antiguo: texto **«Ruta no disponible»**, sin cierres ni pantalla en blanco. Los datos coinciden con el viaje; la salida vuelve al Historial. | OK / Falla: |
| 3.8 (6 min) Detalle sin red | T-110 | Abre el detalle de un viaje con ruta, activa modo avión (o apaga datos y Wi-Fi) y entra de nuevo o recarga el mapa. Toca **«Reintentar»** en el cuadro de error. Reactiva la red y vuelve a tocarlo. | El cuadro de error cabe (también a 200 %), «Reintentar» recibe el toque; con red, el mapa carga. La pantalla no se cierra sola. | OK / Falla: |
| 3.9 (5 min) Ganancias y saldo al 200 % | T-124 | Con fuente al 200 %, abre Ganancias con saldo. | La pista del saldo pasa a varias líneas, no se corta ni sale de la tarjeta; las cifras grandes no se parten ni se desbordan. | OK / Falla: |
| 3.10 (10 min) TalkBack | T-119, T-121, T-110 | Activa TalkBack. Inicio: el botón «Mi ubicación» se anuncia con su etiqueta. Panel de cobro: al cambiar el estado se anuncia **un solo mensaje**. Detalle: el mapa se anuncia con su descripción de ruta y «Reintentar» es alcanzable. | Los tres elementos se anuncian como se describe, sin repetir el mensaje ni quedar mudos. | OK / Falla: |

Qué tarea puede pasar a «Validada» con esta evidencia (el verifier registra el cambio; Anderson solo declara OK o Falla):

| Tarea | Pasos que deben estar en OK |
|---|---|
| T-119 (panel de cobro) | 2.1, 2.2, 3.4, 3.5, 3.10 |
| T-121 («Mi ubicación» y centrado) | 3.1, 3.2, 3.3, 3.10 |
| T-123 (chip «Cobro simulado») | 3.6 |
| T-124 (pista del saldo) | 3.9 |
| T-126 (mensajes por clase de error) | 3.5 (backend apagado) |
| T-147 (botones «Cobrar con …» y mensaje sin pasarela) | 2.3, 3.3 (rótulo largo a 200 %) |
| T-148 (verificación al volver a primer plano) | 2.4 |
| T-150 (nombre de la pasarela en el detalle) | 2.5 |
| T-109 (presentación del detalle) | 3.7 (los dos casos: con y sin ruta) |
| T-110 (pantalla del detalle) | 3.7, 3.8, 3.10 |

Las tareas T-120, T-122, T-125, T-127 a T-129 ya figuran «Validada» o «Validada (estático)» en el backlog y no dependen de este paso, salvo que `npm run doctor` (1.1) confirme T-127/T-128 en la ejecución real. T-130 (auditoría) queda «Aprobado condicionado a celular»: el campo Diseño solo pasa a «Aprobado» si los pasos 3.3, 3.8, 3.9 y 2.2 (rojo y texto coincidentes) salen OK y el design-auditor lo confirma con las capturas.

Capturas sugeridas (con pie honesto: «Celular Android, 2026-11-12»): pasos 2.1, 2.2, 2.5, 3.2, 3.3, 3.7, 3.9. Útiles para el README y el video.

## 4. Reglas de Firestore (5 min)

- [ ] **4.1** Hoy **no se cambió** `firestore.rules` (no aparece modificado en `git status`); las reglas publicadas por Anderson en las fases anteriores siguen vigentes. Si no tocas las reglas hoy, **no hay nada que publicar**. Con Stripe, el backend escribe `paymentMethod = stripe` con firebase-admin, que ignora las reglas; la lista de la regla de creación admite `stripe` en la copia local, pero solo hay que publicarla si un cliente creara un viaje con `stripe` (hoy no lo hace; ver [seguridad.md](seguridad.md)).
  - Listo cuando: confirmas en la consola de Firebase (Firestore, Reglas) que la fecha de publicación es posterior a la última edición de `firestore.rules`, o que no editaste nada. Si en algún momento cambias el archivo, publícalo en la consola y repite en el celular el paso 2.1 y la denegación sin sesión (paso 15 de [checklist-dispositivo-sesiones.md](checklist-dispositivo-sesiones.md)).
  - Resultado: OK / Falla / No aplica: ______

## 5. Congelar el código a las 13:00 (10 min, de 12:50 a 13:00)

- [ ] **5.1** A las 12:50 deja de hacer cambios de código o de configuración de la app. Desde 13:00 solo se tocan documentos, la bitácora y Firestore.
- [ ] **5.2** Ejecuta `node scripts/check-constitution.mjs` y anota el resultado (referencia actual: 12 errores (línea base: C01 de `.env:1` y 11 de C21); los errores no deben subir y las advertencias C23 se esperan).
- [ ] **5.3** Confirma que `SHOW_DEV_TOOLS` sigue en `false` y que `backend/.env` y `backend/secrets/` no aparecen en `git status`.
  - Listo cuando: los tres puntos se cumplen y anotas la hora real del congelado: ______. Si un paso del 3 falló y su corrección no cabe antes de las 13:00, **no se corrige**: se entrega como «No verificado en dispositivo» o con la falla declarada (contingencia).

## 6. Bitácora `AI_LOG.md` (30 min)

Lo hace Anderson; Claude no completa estos campos.

- [ ] **6.1** Entrada **#56**: completa «Verificación» (qué comprobaste de verdad: pasos del paso 3 con OK o Falla) y «Aprendizaje».
- [ ] **6.2** Entrada **#57**: completa «Verificación» y «Aprendizaje».
  - Listo cuando: ni #56 ni #57 tienen campos vacíos y ninguna entrada contiene claves, tokens ni URLs con secretos. Registra solo prompts dados a Claude Code; las entradas reconstruidas llevan la marca «RECONSTRUIDA, no registrada en el momento».
  - Resultado: OK / Falla: ______

## 7. README (25 min)

- [ ] **7.1** Revisa `README.md`: instalación, sección de cobro con Stripe y [pagos-stripe-guia.md](pagos-stripe-guia.md), `.env.example` (solo nombres), development build, `npm run doctor`, [pagos-guia-rapida.md](pagos-guia-rapida.md), este checklist y el guion del video, «Uso de IA», y lo simulado o no cubierto ([omisiones-y-limites.md](omisiones-y-limites.md)).
  - Listo cuando: un clon limpio puede seguirlo sin pasos ocultos (revísalo leyendo, sin ejecutar nada nuevo) y nada se declara «verificado» sin evidencia de celular: usa exactamente «No verificado en dispositivo» para lo que falló o no probaste. Resultado: OK / Falla: ______

## 8. PDF de la bitácora (10 min)

- [ ] **8.1** Genera el PDF desde `AI_LOG.md` ya completa (hay uno anterior, `docs/UberClone — Versión Conductor.pdf`; confirma que el que entregas corresponde a la versión final).
  - Listo cuando: el PDF abre, incluye las entradas hasta la #57 completas y su fecha de generación es posterior a 6.2. Resultado: OK / Falla: ______

## 9. Limpieza de Firestore (15 min)

Solo datos de prueba. Haz esto **después** de la prueba de la mañana y **antes** del video solo si no borras lo que el video necesita.

- [ ] **9.1** Decide qué necesita el video (según [guion-video.md](guion-video.md)): una cuenta aprobada, al menos un viaje reciente con ruta, uno en efectivo, uno con tarjeta aprobada y, si la tienes, un viaje antiguo para «Cobro simulado». **No los borres.**
- [ ] **9.2** Borra solo lo sobrante: viajes `OTHE`/`CONT` repetidos, cuentas de prueba de la prueba de sesiones que no uses, viajes duplicados. Borra desde la consola de Firebase, documento por documento; nunca la colección `drivers` completa.
  - Listo cuando: la cuenta del video conserva sus datos, no quedan documentos con datos reales de personas, y anotas cuántos documentos borraste: ______. Resultado: OK / Falla: ______

## 10. Grabar el video (30 min grabando, hasta 60 con repeticiones)

- [ ] **10.1** Sigue [guion-video.md](guion-video.md). Backend corriendo y `/health` respondiendo desde el celular (repite 1.4 si cambió la red).
  - Listo cuando: duración **≤ 5:00**, se ve el mapa con «Mi ubicación», el cobro (efectivo y tarjeta), el Historial con detalle, Ganancias y saldo, y el cierre de sesión; no se muestra ningún secreto en pantalla; lo que no se probó no se presenta como verificado. Resultado: OK / Falla: ______

## 11. Commit, push, PR final y merge (30 min; lo hace Anderson)

Claude **no** hace commit ni push.

- [ ] **11.1** Revisa `git status` y `git diff --stat`: sin `.env`, `backend/secrets/` ni llaves; sin archivos temporales.
- [ ] **11.2** Commit y push de la rama `anderson/funcionalidad-sesiones` (lo ejecuta Anderson).
- [ ] **11.3** Abre el PR a `main` con el resumen de lo validado y lo «No verificado en dispositivo»; revisa y haz merge.
  - Listo cuando: el PR muestra solo los archivos esperados, `main` contiene el merge y el README visible en GitHub es el final. Resultado: OK / Falla: ______
- [ ] **11.4** Pasos manuales de cierre ya cubiertos: PDF (8), video (10) y entrega. Anota la hora de entrega: ______

---

## Plan de contingencia

Principio: nada se declara validado sin evidencia. Lo que no se pueda comprobar se entrega **declarado**, con el texto exacto «No verificado en dispositivo» (y la falla, si la hubo) en el README, en el PR y en la bitácora.

| Si falla | Qué hacer | Qué se entrega |
|---|---|---|
| **C1.** El celular no alcanza `/health` (1.4) por ambas vías | Revisa la tabla síntoma-causa-solución (guía de pagos, sección 7): backend encendido, firewall, IP actual, túnel vivo. Tope de 30 min. | Pagos con tarjeta (2.x, 3.5) y todo lo que dependa del backend quedan «No verificado en dispositivo»; T-119 y T-126 no pasan a «Validada». Efectivo y el resto (3.1 a 3.3, 3.6 a 3.10) siguen. En el video no se muestra tarjeta, o se muestra solo el flujo de efectivo; no se afirma que el cobro con tarjeta funcione. |
| **C2.** `npm run doctor` da `ERROR` real (Firestore o llave) | Corrige `backend/.env` según el texto; si el token de Mercado Pago es el único `ERROR` (HTTP 4xx), sigue con la prueba. | Si el backend no arranca, igual que C1. T-127 y T-128 quedan «Validada (estático)». |
| **C3.** Un resultado de tarjeta no coincide (2.1 a 2.3) | Toca «Verificar pago» de nuevo; revisa la ventana del backend. Una repetición por caso. | El caso que falle se declara «Falla» en la bitácora y en el README (por ejemplo, «OTHE: comportamiento distinto al esperado»); no se oculta. T-119 no pasa a «Validada». |
| **C4.** Falla el mapa en Inicio o en el detalle (3.1 a 3.3, 3.7, 3.8) | Comprueba red y permiso de ubicación; en Inicio, el modo sin posición debe mostrar Colombia. | T-121 y/o T-110 quedan «Implementada, No verificado en dispositivo». El video usa lo que sí funcionó. Se anota en `docs/omisiones-y-limites.md` solo si Anderson lo decide (hoy no se edita ese archivo). |
| **C5.** 200 % de fuente desborda (3.3, 3.8, 3.9) | Es un defecto visual conocido en la cola de menores. Si el arreglo no cabe antes de las 13:00, no se hace. | T-124 y el campo Diseño de T-121/T-110 quedan «Aprobado condicionado a celular», con la falla declarada. |
| **C6.** Falta un viaje antiguo o uno con ruta para 3.6 o 3.7 | Genera un viaje nuevo (con ruta) con el flujo normal. El antiguo no se puede fabricar tocando el código a esta hora. | Lo que no se pudo ver («Cobro simulado» o «Ruta no disponible») se declara «sin dato para probar»; T-123 y/o T-109 no pasan a «Validada» (sus pruebas estáticas siguen válidas). |
| **C7.** Se agota el tiempo antes de las 13:00 | A las 11:30 decide: prioriza 1, 2, 3.1 a 3.2, 3.7 y 4. Deja 3.3, 3.8 a 3.10 si no cabe. | Lo no probado: «No verificado en dispositivo». El congelado de las 13:00 no se mueve; sí pueden moverse el video y la limpieza dentro del día de entrega. |
| **C8.** El build instalado no abre o falla un módulo nativo | Anderson decide si repite el build nativo (`expo run:android`). Máximo un intento si no hay tiempo. | Si no hay build funcional: se entrega el código con todo «No verificado en dispositivo» y la evidencia estática (pruebas `node`, `check-constitution`, informes de auditoría de diseño). |
| **C9.** El video no cabe en 5:00 o sale mal | Recorta escenas del guion según su tabla de tiempos; regraba solo la escena afectada. | Video más corto con solo lo que funciona; sin afirmar lo no verificado. |

Regla común: cualquier tarea cuyo paso falló o no se hizo queda en «Implementada (No verificado en dispositivo)» en el backlog; el verifier no la mueve a «Validada». Anderson aprueba cada fase y es quien decide qué se entrega.
