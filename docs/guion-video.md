# Guion del video — UberClone Conductor (máximo 5 minutos)

<!-- AI-assisted: see docs/AI_LOG.md #57 (T-132) -->

Estado: borrador para Anderson. Nada de lo que describe este guion se ha validado en el celular («No verificado en dispositivo»); antes de grabar, haz un ensayo completo y ajusta los tiempos y textos a lo que de verdad ocurra.

Requisito del enunciado (F1 §9): video de **máximo 5 minutos** con el flujo completo: registro del conductor, solicitud, viaje, pago de prueba e historial. Este guion cubre esos cinco pasos en ese orden y añade mapa, Ganancias y cierre de sesión. El enunciado no pide nada más para el video.

**Total del guion: 4:45** (suma acumulada de la tabla), con 15 s de margen bajo el tope de 5:00.

## Tabla de escenas

| # | Escena | Duración | Acumulado |
|---|---|---|---|
| 1 | Presentación | 0:15 | 0:15 |
| 2 | Registro del conductor y documentos | 0:50 | 1:05 |
| 3 | Disponibilidad, mapa y «Mi ubicación» | 0:25 | 1:30 |
| 4 | Solicitud entrante | 0:25 | 1:55 |
| 5 | Viaje | 0:35 | 2:30 |
| 6 | Cobro en efectivo | 0:25 | 2:55 |
| 7 | Cobro con tarjeta (Stripe, prueba) | 0:55 | 3:50 |
| 8 | Historial con detalle del viaje | 0:25 | 4:15 |
| 9 | Ganancias y saldo | 0:20 | 4:35 |
| 10 | Cierre de sesión y límites | 0:10 | 4:45 |

Comprobación de la suma: 15 + 50 + 25 + 25 + 35 + 25 + 55 + 25 + 20 + 10 = 285 s = 4:45.

## Qué se ve y qué decir, escena por escena

Los textos son para leerlos con calma y en primera persona; si te pasas de tiempo, recorta el texto, no las escenas obligatorias (2, 4, 5, 7 y 8).

### 1. Presentación (0:00 a 0:15)
- **Se ve:** pantalla de inicio de sesión de la app, o una diapositiva simple con el nombre del proyecto.
- **Digo:** «Soy Anderson Londoño. Esta es UberClone, la versión del conductor, hecha con React Native y Expo, con un backend en Node y Firestore. Voy a mostrar el flujo: registro, solicitud, viaje, pago de prueba e historial.»

### 2. Registro del conductor y documentos (0:15 a 1:05)
- **Se ve:** «Crear cuenta» con correo y contraseña de prueba, datos personales y del vehículo, fotos de prueba de licencia y SOAT, aceptación de términos y envío. Después la pantalla de estado de la cuenta.
- **Digo:** «Creo una cuenta con correo y contraseña. Lleno mis datos y los del vehículo, adjunto fotos de prueba de la licencia y del SOAT y acepto los términos. Al enviar, la cuenta queda pendiente de aprobación. Para seguir uso una cuenta que ya fue aprobada.»
- **Nota de montaje:** se graba el registro con una cuenta ficticia B hasta el envío; luego un corte limpio a la cuenta A, ya aprobada y con la sesión iniciada. Dilo en voz alta para no dar a entender que la aprobación fue instantánea.

### 3. Disponibilidad, mapa y «Mi ubicación» (1:05 a 1:30)
- **Se ve:** pantalla de Inicio con el mapa, el control para ponerse disponible y el botón «Mi ubicación».
- **Digo:** «Me pongo disponible. El mapa usa MapLibre con teselas de OpenFreeMap, y el botón Mi ubicación me centra en mi posición.»
- **Condición:** menciona el centrado de «Mi ubicación» solo si en el ensayo funcionó.

### 4. Solicitud entrante (1:30 a 1:55)
- **Se ve:** la tarjeta de solicitud con origen, destino y precio visibles; botón «Aceptar».
- **Digo:** «Llega una solicitud de prueba. Veo el origen, el destino y el precio antes de decidir. La acepto.»
- **Honestidad:** di «de prueba»; los datos del pasajero son ficticios.

### 5. Viaje (1:55 a 2:30)
- **Se ve:** mapa con la ruta y la posición; etapas del viaje y botón «Finalizar viaje».
- **Digo:** «La ruta la calcula OSRM, un servidor de demostración público. Avanzo por las etapas del viaje y al llegar toco Finalizar viaje.»
- **Opcional (si cabe y funcionó en el ensayo):** una frase sobre la ruta recorrida; si el ensayo mostró algún fallo, omítela.

### 6. Cobro en efectivo (2:30 a 2:55)
- **Se ve:** pantalla de resumen del viaje con tarifa y comisión; método «Efectivo»; botón «Confirmar efectivo recibido»; mensaje «Efectivo recibido. El viaje quedó guardado en tu historial.»
- **Digo:** «Este viaje se paga en efectivo. Veo el resumen con la tarifa y la comisión, confirmo que recibí el efectivo y el viaje queda guardado en mi historial.»
- **Nota:** si para ahorrar tiempo usas un viaje en efectivo grabado antes (ver tomas de respaldo), no lo presentes como en vivo.

### 7. Cobro con tarjeta, Stripe de prueba (2:55 a 3:50)
- **Se ve:** un segundo viaje terminado; método «Tarjeta»; botón «Cobrar con Stripe (tarjeta de prueba)»; el checkout de Stripe en el navegador; tarjeta de prueba `4242 4242 4242 4242` con cualquier fecha futura y cualquier CVC; vuelta a la app; «Verificar pago»; chip «Aprobado» y «Pago aprobado. El viaje quedó guardado en tu historial.»
- **Digo:** «Ahora un viaje con tarjeta. Toco Cobrar con Stripe y se abre el checkout en modo de prueba. Pongo la tarjeta de prueba 4242, que simula una aprobación. Vuelvo a la app, toco Verificar pago y el estado pasa a Aprobado. Es solo modo de prueba: no se mueve dinero real.»
- **No muestres en pantalla** la clave secreta de Stripe, una URL con secretos ni el archivo `.env`. Enseña solo los datos de la tarjeta de prueba (públicos).
- **Mercado Pago:** no se pudieron crear cuentas de prueba, así que **no lo menciones como demostrado**. Si lo nombras, di que está implementado pero no verificado en dispositivo.
- **Todo esto es No verificado en dispositivo** hasta el ensayo. Si falla: aplica el Plan B (sección siguiente).

### 8. Historial con detalle del viaje (3:50 a 4:15)
- **Se ve:** pantalla Historial con los dos viajes (efectivo y tarjeta), filtros de periodo y de método; abrir un viaje y mostrar su detalle; «Volver al historial».
- **Digo:** «En el Historial aparecen los dos viajes, con filtros por periodo y método de pago. Abro uno y veo su detalle.»
- **Condición:** el detalle con ruta figuraba como pendiente en `docs/omisiones-y-limites.md`; di solo lo que el ensayo muestre, y no digas «mapa del recorrido» si no aparece.

### 9. Ganancias y saldo (4:15 a 4:35)
- **Se ve:** pantalla Ganancias con totales por periodo y el bloque «Saldo con la plataforma».
- **Digo:** «En Ganancias veo lo ganado por periodo y mi saldo con la plataforma, que refleja la comisión de los viajes en efectivo.»

### 10. Cierre de sesión y límites (4:35 a 4:45)
- **Se ve:** Configuración, «Cerrar sesión», confirmación.
- **Digo:** «Cierro sesión. Lo que no cubre esta entrega: iOS no está verificado y las notificaciones push se omitieron. Gracias.»
- **Si no cabe:** quita la mención de límites del video y deja la lista completa en `docs/omisiones-y-limites.md`.

## Datos ficticios a preparar

- **Cuenta A (aprobada):** correo y contraseña de prueba, con la cuenta ya aprobada en Firestore. No uses datos personales reales ni tu correo habitual.
- **Cuenta B (solo para mostrar el registro):** otro correo de prueba, que no necesita aprobación.
- **Datos personales y de vehículo ficticios:** nombre, documento, teléfono, placa y modelo inventados.
- **Documentos:** fotos de prueba de licencia y SOAT (imágenes genéricas, sin documentos reales de nadie) guardadas en la galería del celular.
- **Ruta de prueba:** un origen y un destino cercanos (pocos minutos) para que el viaje se vea completo sin alargar el video; confirma con antelación que OSRM devuelve ruta.
- **Cuenta de Stripe en modo de prueba:** no hace falta comprador. Para un correo en el checkout usa uno ficticio.
- **Tarjeta de prueba de Stripe:** `4242 4242 4242 4242` (aprobada), cualquier fecha futura y cualquier CVC; `4000 0000 0000 0002` es la rechazada (solo para ensayo, no para el video). Contrasta con <https://docs.stripe.com/testing> antes de grabar (ver `docs/pagos-stripe-guia.md`).
- **Mercado Pago:** sin cuentas de prueba no hay datos que preparar; no se graba su flujo.

## Preparación previa

1. Cuenta A aprobada y sesión iniciada en la app. Reglas de Firestore de `drivers` y `trips` publicadas.
2. Backend encendido (`npm start` en `backend/`, con `npm install` ya hecho) y `npm run doctor` sin `FALTA` ni `ERROR` y con «Pasarela Stripe: configurada.».
3. Túnel `cloudflared` encendido; su URL pública en `PUBLIC_BASE_URL` (`backend/.env`) y en `EXPO_PUBLIC_BACKEND_URL` (`.env` de la raíz); backend reiniciado y Metro con `npx expo start -c`. La URL cambia en cada ejecución del túnel: no la cambies después del ensayo.
4. `https://<url-del-túnel>/health` abre en el navegador del celular.
5. Celular: brillo alto, modo No molestar activado, batería cargada o con cargador, notificaciones de otras apps silenciadas, orientación vertical bloqueada, GPS y datos o Wi-Fi activos.
6. Grabación de pantalla activa con audio del micrófono; prueba de 10 segundos para verificar que se oye la voz y se ve la pantalla. Cierra otras apps.
7. Navegador del celular listo para el checkout de Stripe (sin sesiones ni datos personales guardados); la tarjeta de prueba a mano.
8. Historial limpio o con pocos viajes de prueba, para que los dos viajes del video se vean sin ruido. Un ensayo completo con cronómetro antes de la toma final.
9. Nada de secretos en pantalla: ni `backend/.env`, ni `backend/secrets`, ni consolas con llaves, ni la clave secreta de Stripe.

## Plan B: si el pago con tarjeta falla en el momento

Fallos típicos: el checkout no abre, tarda demasiado, «Verificar pago» deja el chip en «Pendiente», o aparece un mensaje de error del cobro (por ejemplo, sin conexión o túnel caído; ver la sección 11 de `docs/pagos-stripe-guia.md` y la 7 de `docs/pagos-guia-rapida.md`). Un rechazo de Stripe puede verse como «Pendiente»: no lo presentes como rechazo si el chip no lo dice.

1. No improvises depurando en cámara. Máximo 10 segundos de reintento (un solo «Verificar pago»).
2. Si no se resuelve, muestra **efectivo en vivo**: haz un viaje en efectivo y completa el cobro con «Confirmar efectivo recibido».
3. Pega la **prueba de tarjeta grabada previamente** (toma de respaldo 1) en la escena 7, con un rótulo visible: «Grabado antes del video».
4. Qué decir: «El cobro con tarjeta falló en este momento, probablemente por la red o por el túnel. Para no perder tiempo, muestro el efectivo en vivo y aquí pego la prueba de tarjeta que grabé antes: es un pago de prueba aprobado con la tarjeta de prueba de Stripe.»
5. No digas «funciona siempre»: di solo lo que se ve en la toma grabada. Si esa toma tampoco existe, di claramente que el pago con tarjeta no se pudo demostrar y preséntalo como pendiente.
6. Mantén los tiempos: el efectivo en vivo ocupa la escena 6 y la toma pegada los 55 s de la 7; el total no cambia.

## Tomas de respaldo para grabar antes

Graba cada toma por separado, con la misma configuración y el mismo audio. Úsalas solo si la toma en vivo falla, y rotúlalas como «Grabado antes del video».

1. `respaldo-01-tarjeta-aprobada`: viaje con tarjeta completo, desde «Cobrar con Stripe (tarjeta de prueba)» hasta el chip «Aprobado» (50 a 60 s).
2. `respaldo-02-efectivo`: viaje en efectivo y «Confirmar efectivo recibido» (20 a 25 s).
3. `respaldo-03-registro`: registro completo con la cuenta B, incluidas las fotos de documentos (45 a 50 s).
4. `respaldo-04-solicitud-aceptar`: llegada de la solicitud y aceptación (20 a 25 s).
5. `respaldo-05-viaje`: viaje por la ruta de prueba, de la aceptación al final (30 a 35 s).
6. `respaldo-06-historial-detalle`: Historial con filtros y detalle de un viaje (20 a 25 s).
7. `respaldo-07-ganancias-saldo`: Ganancias y saldo (15 a 20 s).
8. `respaldo-08-cierre-sesion`: Configuración y cierre de sesión (10 s).
9. `respaldo-09-voz`: lectura limpia del texto de cada escena, por si hay ruido en la toma en vivo; el audio se monta encima.

## Antes de publicar el video

- Comprueba que dura 5:00 o menos (el guion suma 4:45).
- Revisa que no se vea ningún secreto, correo personal ni dato real.
- Todo lo dicho debe ser lo que el ensayo mostró. Lo que no se vio en el celular se queda fuera o se dice como pendiente.
