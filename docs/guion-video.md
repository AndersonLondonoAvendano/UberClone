# Guion del video — UberClone Conductor (máximo 5 minutos)

<!-- AI-assisted: see docs/AI_LOG.md #68 (D5) -->

Estado: borrador para Anderson, sin ensayar. Los flujos de L1 a L3 y de pagos se validaron en el celular (ver [progress.md](progress.md) y [pagos-evidencia.md](pagos-evidencia.md)); el selector de idioma sin sesión (L3b) fue probado por Anderson (STOP-7, 2026-11-16, 100 % OK salvo un ajuste visual del selector en inicio de sesión; verificación visual pendiente). El guion completo no se ha grabado: ensáyalo con cronómetro y ajusta tiempos y textos a lo que de verdad ocurra. Lo que no se vea en el ensayo se deja fuera o se dice como pendiente.

Requisito del enunciado: video de **máximo 5 minutos** con el flujo completo. **Total de este guion: 4:50**, con 10 s de margen.

## Tabla de escenas

| # | Escena | Duración | Acumulado |
|---|---|---|---|
| 1 | Presentación y onboarding con selector de idioma | 0:20 | 0:20 |
| 2 | Registro del conductor (resumen) | 0:30 | 0:50 |
| 3 | Disponible y solicitud por notificación (build release) | 0:40 | 1:30 |
| 4 | Rechazo o vencimiento de una solicitud | 0:20 | 1:50 |
| 5 | Estados del viaje (conductor llegando, iniciar, finalizar) | 0:35 | 2:25 |
| 6 | Cobro en efectivo | 0:20 | 2:45 |
| 7 | Cobro con tarjeta (Stripe, prueba) | 0:50 | 3:35 |
| 8 | Historial y Detalle del viaje | 0:25 | 4:00 |
| 9 | Ganancias y saldo | 0:20 | 4:20 |
| 10 | Cambio a inglés y cierre (Mercado Pago no verificado) | 0:30 | 4:50 |

Suma: 20 + 30 + 40 + 20 + 35 + 20 + 50 + 25 + 20 + 30 = 290 s = 4:50. Si te pasas, recorta el texto hablado, no las escenas 2, 3, 5, 7 y 8.

## Escena por escena

### 1. Presentación y onboarding con selector de idioma (0:00–0:20)
- **Se ve:** bienvenida con el control «Idioma / Language»; cambiar a English y volver a Español sin perder lo escrito.
- **Digo:** «Soy Anderson Londoño. Esta es UberClone, la versión del conductor, con React Native y Expo, un backend Node y Firestore. Desde el inicio, sin sesión, puedo elegir el idioma.»

### 2. Registro del conductor (0:20–0:50)
- **Se ve:** datos personales, vehículo, documentos de prueba, términos, envío y estado «pendiente».
- **Digo:** «Registro mis datos, los del vehículo y fotos de prueba de los documentos. Al enviar, la cuenta queda pendiente de aprobación.»
- Montaje: registro con la cuenta B hasta el envío; corte a la cuenta A ya aprobada. Dilo en voz alta.

### 3. Disponible y solicitud por notificación (0:50–1:30)
- **Se ve:** Inicio, ponerse Disponible; Configuración → Notificaciones → «Enviar solicitud de prueba»; app cerrada; llega el aviso; al tocarlo se abre la solicitud con tarifa, distancia y el contador de 15 s.
- **Digo:** «Me pongo disponible y pido una solicitud de prueba: el pasajero es simulado y el backend la envía por FCM. Con la app cerrada llega el aviso; al tocarlo veo tarifa, distancia y 15 segundos para decidir.»
- Graba con la **build release**: con el dev client, tocar la notificación con la app cerrada no entrega la solicitud (ver [omisiones-y-limites.md](omisiones-y-limites.md)). Solo Android. Backend y túnel activos.

### 4. Rechazo o vencimiento (1:30–1:50)
- **Se ve:** otra solicitud: tocar «Rechazar» o dejar vencer; en Historial aparece «Rechazado» con «Sin cobro».
- **Digo:** «Si rechazo o dejo vencer la solicitud, queda en el Historial como rechazada, sin cobro.»

### 5. Estados del viaje (1:50–2:25)
- **Se ve:** aceptar; «Conductor llegando»; «Llegué»; iniciar; ruta en el mapa; finalizar.
- **Digo:** «Acepto, aviso que estoy llegando, inicio el viaje y lo finalizo. La ruta la calcula OSRM, un servidor público de demostración.»

### 6. Cobro en efectivo (2:25–2:45)
- **Se ve:** resumen con tarifa y comisión; «Confirmar cobro»; viaje guardado.
- **Digo:** «Viaje en efectivo: veo tarifa y comisión, confirmo el cobro y queda en mi historial.»

### 7. Cobro con tarjeta, Stripe de prueba (2:45–3:35)
- **Se ve:** otro viaje; método Tarjeta; checkout de Stripe en modo de prueba; tarjeta de prueba `4242 4242 4242 4242` con cualquier fecha futura y CVC; vuelta a la app; «Verificar pago»; «Pago aprobado».
- **Digo:** «Ahora con tarjeta. Se abre el checkout de Stripe en modo de prueba y uso la tarjeta de prueba 4242. Vuelvo, verifico y el pago queda aprobado. Pago de prueba: no se mueve dinero real.»
- No muestres claves, `.env` ni URLs con secretos. Si falla: Plan B.

### 8. Historial y Detalle del viaje (3:35–4:00)
- **Se ve:** Historial con filtros de periodo y método; abrir el viaje con tarjeta: «Pago aprobado», «Tarjeta (Stripe)», comisión y ruta completa.
- **Digo:** «En el Historial filtro por periodo y método y abro el detalle: pago aprobado, comisión y la ruta del viaje.»

### 9. Ganancias y saldo (4:00–4:20)
- **Se ve:** Ganancias con totales y «Saldo con la plataforma».
- **Digo:** «Ganancias muestra lo ganado y mi saldo con la plataforma, coherentes con el Historial.»

### 10. Cambio a inglés y cierre (4:20–4:50)
- **Se ve:** Configuración → English: la interfaz cambia al instante; «Reject» e «I've arrived».
- **Digo:** «Cambio a inglés y toda la interfaz cambia al instante. Límites: el texto de la notificación push sigue en español y solo probé Android. Mercado Pago está implementado pero no verificado con usuarios de prueba; la pasarela verificada de punta a punta es Stripe. Gracias.»
- No afirmes que Mercado Pago funciona.

## Plan B si la tarjeta falla en el momento
Fallos típicos: el checkout no abre, tarda, «Verificar pago» queda en «Pendiente», o falla la red o el túnel (ver [pagos-stripe-guia.md](pagos-stripe-guia.md) y [pagos-guia-rapida.md](pagos-guia-rapida.md)).
1. No depures en cámara: un solo reintento de «Verificar pago» (máximo 10 s).
2. Si no se resuelve, pega la toma `respaldo-01-tarjeta-aprobada`, rotulada «Grabado antes del video», en los 50 s de la escena 7.
3. Di: «El cobro con tarjeta falló ahora, probablemente por la red o el túnel; aquí muestro una prueba aprobada que grabé antes.»
4. Si tampoco existe esa toma, di que el pago con tarjeta no se pudo demostrar en este video y preséntalo como pendiente.
5. El total no cambia.

## Tomas de respaldo (grábalas antes, rotuladas «Grabado antes del video»)
1. `respaldo-01-tarjeta-aprobada` (50 s) · 2. `respaldo-02-efectivo` (20 s) · 3. `respaldo-03-registro` con la cuenta B (30 s) · 4. `respaldo-04-notificacion-release` (40 s) · 5. `respaldo-05-rechazo-vencimiento` (20 s) · 6. `respaldo-06-estados-viaje` (35 s) · 7. `respaldo-07-historial-detalle` (25 s) · 8. `respaldo-08-ganancias-saldo` (20 s) · 9. `respaldo-09-ingles` (30 s).

## Preparación
- Datos ficticios: cuenta A aprobada y cuenta B solo para el registro; nombres, documentos, teléfonos y placas inventados; fotos genéricas. Nada real.
- Tarjeta de prueba de Stripe `4242 4242 4242 4242` (confirma en la documentación de pruebas de Stripe antes de grabar). Mercado Pago: no se graba su flujo.
- Backend y túnel `cloudflared` activos, con la URL final ya grabada en el APK release.
- Celular: brillo alto, No molestar, batería, vertical, GPS y datos activos, grabación de pantalla con micrófono (prueba de 10 s). Un ensayo completo con cronómetro.
- Nada de secretos en pantalla: ni `backend/.env`, ni `backend/secrets`, ni claves.

## Antes de publicar
- Dura 5:00 o menos.
- Ningún secreto, correo personal ni dato real a la vista.
- Todo lo dicho coincide con lo que el ensayo mostró.
