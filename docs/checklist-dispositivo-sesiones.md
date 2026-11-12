# Lista de comprobación en dispositivo — sesiones

<!-- AI-assisted: see docs/AI_LOG.md #56 (T-74) -->
Estado: **sin ejecutar.** Anderson la sigue en el celular (Android) y declara el resultado por paso («OK», «Falla: …»). Hasta entonces todo es **No verificado en dispositivo** y ninguna tarea pasa a «Validada». Usa solo fotos y datos de prueba.

| # | Paso | Esperado | Resultado |
|---|---|---|---|
| 1 | Crear la cuenta A (correo y contraseña) | Entra al registro | |
| 2 | Completar el registro con documentos y enviar | Pantalla de cuenta pendiente | |
| 3 | En la consola, aprobar `drivers/{uidA}` | La app pasa sola a Inicio | |
| 4 | Ciclo de viaje en efectivo y «Confirmar efectivo recibido» | Aparece en Historial como pagado | |
| 5 | Ciclo de viaje con Mercado Pago (prueba) | Pendiente y luego pagado por el backend | |
| 6 | Cerrar sesión (Configuración) | Pantalla Iniciar sesión | |
| 7 | Crear la cuenta B | Registro vacío; no se ve nada de A | |
| 8 | Volver a A | Historial y Ganancias de A intactos | |
| 9 | Con un viaje en curso, intentar cerrar sesión | Bloqueado con mensaje; el viaje sigue | |
| 10 | Modo avión en Iniciar sesión | Mensaje de red, sin diálogos | |
| 11 | Contraseña incorrecta | Mensaje genérico que no revela si el correo existe | |
| 12 | Recuperar contraseña | Mensaje de envío sin revelar si el correo existe | |
| 13 | Cerrar la app y reabrirla con sesión | Entra sin pedir credenciales | |
| 14 | Instalar sobre la versión anterior (sesión anónima antigua) | Se cierra la sesión anónima y pide iniciar sesión | |
| 15 | Tras publicar las reglas: repetir 2, 4, 5 y la denegación sin sesión o anónima | Todo funciona; lo anónimo da permiso denegado | |
