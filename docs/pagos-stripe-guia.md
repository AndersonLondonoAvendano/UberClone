# Guía de pagos con Stripe en modo de prueba (para quien nunca usó Stripe)

<!-- AI-assisted: see AI_LOG.md (T-152) -->

Para quién: Anderson, en Windows con PowerShell. Objetivo: completar un pago de prueba con tarjeta usando **Stripe Checkout** (la página de pago la aloja Stripe y se abre en el navegador del celular). Estado: **No verificado en dispositivo** y no ejecutado de punta a punta: nada de lo que sigue se ha probado con una cuenta real de Stripe ni con el celular. Las decisiones D-116 a D-120 siguen en «Propuesta» hasta que Anderson las apruebe.

Regla de oro: la clave secreta y cualquier `whsec_…` viven **solo** en `backend/.env`. No los pegues en el chat, en la bitácora, en capturas ni en documentos. Esta guía nombra variables, nunca valores. Para la red (misma Wi-Fi o túnel), el firewall y `/health` usa [pagos-guia-rapida.md](pagos-guia-rapida.md) (secciones 3 a 5); aquí solo va lo propio de Stripe. Tabla síntoma-causa-solución general: sección 7 de esa guía y la sección 11 de esta.

Qué hace Stripe aquí (de los requisitos R12, no del código): el backend crea una **Checkout Session** con el monto que lee del viaje en Firestore; la app abre la URL; tú pagas con una tarjeta de prueba; vuelves a la app y «Verificar pago» pide el estado a Stripe a través del backend. El webhook es opcional (D-120).

## 1. Crear la cuenta de Stripe en modo de prueba

1. Crea una cuenta en <https://dashboard.stripe.com/register> y entra al panel.
2. Activa el **modo de prueba** (en el panel aparece como modo de prueba o «sandbox»; el interruptor está en la parte superior). Las claves de prueba empiezan por `pk_test_`, `sk_test_` o `rk_test_` (<https://docs.stripe.com/keys>).
3. **Detalle del país.** La documentación oficial indica que COP tiene dos decimales y lista un mínimo de cobro de 0.50 COP (<https://docs.stripe.com/currencies>). Lo que **NO CONFIRMADO**: que tu cuenta, según el país que elijas al registrarla, acepte COP como moneda del Checkout. Si el checkout rechaza COP, usa la alternativa de la sección 3 (dólares, solo de prueba). No necesitas activar la cuenta para cobros reales: no vas a mover dinero real.

## 2. Copiar la clave secreta de prueba (sin pegarla en chats)

1. Abre <https://dashboard.stripe.com/apikeys> con el modo de prueba activo.
2. En «Clave secreta» (`sk_test_…`) usa el botón de revelar/copiar. Si prefieres una clave restringida, vale una `rk_test_…`.
3. Pégala **directamente** en `backend/.env` (sección 3). No la pegues en el chat con Claude, en un documento, en la bitácora ni en una captura. Si se te escapa a algún sitio, regénerala desde el mismo panel.
4. Una clave que empiece por `sk_live_` o `rk_live_` **no sirve**: el backend la trata como no configurada y `npm run doctor` da `ERROR` (D-119, Propuesta).

## 3. Variables de `backend/.env` (solo nombres)

Si aún no existe, créalo desde el ejemplo (desde la raíz del proyecto):

```powershell
Copy-Item backend\.env.example backend\.env
```

Abre `backend/.env` en tu editor y completa **solo ahí**:

| Variable | Qué lleva | Obligatoria |
|---|---|---|
| `STRIPE_SECRET_KEY` | La clave secreta de prueba (`sk_test_…` o `rk_test_…`). | Sí, para activar Stripe. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Ruta al JSON de la cuenta de servicio de Firebase (ver [pagos-guia-rapida.md](pagos-guia-rapida.md), sección 1). | Sí. |
| `PUBLIC_BASE_URL` | URL del backend alcanzable desde el celular; Stripe vuelve a `<PUBLIC_BASE_URL>/payments/return` al terminar o cancelar. | Sí. |
| `PORT` | Puerto del backend (por defecto 3001). | No. |
| `STRIPE_WEBHOOK_SECRET` | Secreto de firma del webhook (empieza por `whsec_`). Solo si usas webhook (sección 10). | No. |
| `STRIPE_CURRENCY` | Moneda. Si queda vacía, el ejemplo indica que el valor por defecto es `cop`. | No. |
| `STRIPE_COP_PER_USD` | Solo con `STRIPE_CURRENCY=usd`: cuántos pesos vale un dólar **según tú** (el número lo escribes tú; no es una cotización). | Solo con usd. |

Mercado Pago sigue funcionando con `MP_ACCESS_TOKEN` si lo tienes; puedes dejarlo vacío y usar solo Stripe (el doctor lo marca `AVISO`, no error).

**Si tu cuenta no acepta COP (alternativa solo de prueba):** pon `STRIPE_CURRENCY=usd` y `STRIPE_COP_PER_USD=<tu tasa>`. El monto del viaje (COP) se convierte con esa tasa que tú escribes; sirve para ver el flujo, no para cobrar de verdad. El mínimo de cobro en dólares **NO CONFIRMADO** en la documentación leída: si un viaje muy barato falla, prueba con un viaje de más monto.

## 4. Instalar las dependencias del backend

`backend/node_modules` **no está instalado** en este repositorio: hasta que lo instales, ni el servidor ni `npm run doctor` arrancan. En PowerShell (Node 20.12 o superior):

```powershell
cd backend
npm install
```

El proyecto no añade librerías de Stripe: el backend llama a la API de Stripe directamente. Si `npm install` instala algo inesperado, avisa antes de seguir.

## 5. Diagnóstico y arranque

Desde `backend/`:

```powershell
npm run doctor
```

Sin imprimir valores. Líneas relevantes de Stripe y qué significan:

- `OK`: `Stripe: la API respondió OK.` y `Pasarela Stripe: configurada.` (el doctor llama a `GET https://api.stripe.com/v1/balance`, <https://docs.stripe.com/api/balance/balance_retrieve>).
- `ERROR` `Stripe: STRIPE_SECRET_KEY es una clave live...`: pusiste una clave de producción. Cámbiala por la de prueba.
- `ERROR` `Stripe: STRIPE_SECRET_KEY no tiene prefijo sk_test_ o rk_test_, o STRIPE_CURRENCY / STRIPE_COP_PER_USD no son válidas`: revisa esas variables.
- `ERROR` `Stripe: la API respondió HTTP ...`: una clave inválida da 401 y un permiso insuficiente 403 (<https://docs.stripe.com/error-low-level.md>). Copia de nuevo la clave de prueba.
- `AVISO` `Variable STRIPE_WEBHOOK_SECRET sin definir`: normal si no usas webhook; «Verificar pago» lo cubre.
- `ERROR` `Ninguna pasarela configurada`: ni `MP_ACCESS_TOKEN` ni una clave de Stripe de prueba válida.

El comando termina con código distinto de cero si hay `FALTA` o `ERROR`; los `AVISO` no cuentan. Si todo está bien:

```powershell
npm start
```

Debe imprimir `Servidor escuchando en el puerto 3001` (o el de `PORT`). **Nota honesta:** las rutas HTTP del backend (checkout, sync, webhook, `/payments/providers`, `/payments/return`) están cubiertas por pruebas con fakes, pero **el servidor no se ha probado por HTTP** porque `backend/node_modules` no estaba instalado; el primer arranque real es el tuyo.

## 6. Comprobar `/health` desde el celular y elegir la vía de red

1. En el PC: `http://localhost:3001/health` debe mostrar `{"status":"ok","service":"uber-clone-backend"}`.
2. **Desde el navegador del celular**, abre la misma ruta con la URL que vayas a usar. Si no abre, la app tampoco podrá cobrar.
3. Las dos vías ya documentadas, con sus comandos exactos, están en [pagos-guia-rapida.md](pagos-guia-rapida.md), sección 4:
   - **Vía 1, misma Wi-Fi:** IP del PC (`ipconfig`), regla de firewall y `PUBLIC_BASE_URL=http://<IP>:3001`. Sirve para la app; no sirve para el webhook.
   - **Vía 2, túnel HTTPS** (`cloudflared tunnel --url http://localhost:3001`): la URL `https://...` cambia en cada ejecución. Habilita el webhook.
4. Con Stripe hay un punto extra: la `success_url` de la sesión apunta a `<PUBLIC_BASE_URL>/payments/return`. Que Stripe acepte una `success_url` con `http://` **NO CONFIRMADO** en las páginas leídas. Si al abrir el checkout Stripe responde con un error de URL, usa la vía 2 (https).
5. Pon la misma URL en `EXPO_PUBLIC_BACKEND_URL` (archivo `.env` de la raíz, sin secretos) y reinicia Metro con caché limpia:

```powershell
npx expo start -c
```

Si la app muestra «Servicio de cobro sin configurar», la variable no se leyó.

## 7. Abrir el checkout y pagar con una tarjeta de prueba

Requisitos: backend arrancado, `/health` abre en el celular, app reiniciada con `-c`, sesión iniciada y las reglas de `drivers` y `trips` publicadas ([seguridad.md](seguridad.md)).

1. Completa un viaje con **tarjeta** y en «Cobro y resumen» toca **«Cobrar con Stripe (tarjeta de prueba)»**. El botón aparece solo si el backend informa Stripe como configurada; si ninguna pasarela está configurada, la app dice «No hay una pasarela de pago configurada». **No verificado en dispositivo.**
2. Se abre el navegador con la página de pago de Stripe. Tarjetas de prueba (<https://docs.stripe.com/testing>), con **cualquier fecha futura** y **cualquier CVC**:

| Tarjeta | Resultado esperado |
|---|---|
| `4242 4242 4242 4242` | Aprobada. |
| `4000 0000 0000 0002` | Rechazada (`card_declined`). |
| `4000 0000 0000 9995` | Fondos insuficientes. |
| `4000 0017 0000 0003` | Tarjeta de prueba de Colombia (según la misma página). |

3. Cualquier nombre y código postal sirven; son datos de prueba.
4. Al terminar, Stripe redirige a la página fija del backend: «Puedes volver a la app». **Vuelve a la app a mano** (la app no recibe un retorno automático; que el navegador vuelva a la app solo con la redirección es **No verificado en dispositivo**).
5. En el viaje toca **«Verificar pago»** (la app también verifica sola al volver a primer plano, sin mostrar error del servicio).

## 8. Qué debe verse

En la app (todo **No verificado en dispositivo**):

| Tarjeta | Chip | Texto del panel | Botón |
|---|---|---|---|
| `4242…` | «Aprobado» | «Pago aprobado. El viaje quedó guardado en tu historial.» | Ninguno de cobro. |
| `4000 0000 0000 0002` | «Rechazado» (ver aviso) | «Pago rechazado. Toca “Reintentar pago”.» (con una sola pasarela) o «Pago rechazado. Elige una opción de reintento.» (con varias) | «Reintentar pago…» (abre un checkout nuevo). |
| Antes de pagar o sin resultado | «Pendiente» | «Viaje guardado. Falta el pago con tarjeta.» (con Stripe configurada) | «Cobrar con…». |

**Aviso de rechazos:** la documentación leída no confirma que se pueda ver el error del último intento de pago de la sesión (`last_payment_error`) con el flujo que usa el backend. Por eso un rechazo con `4000 0000 0000 0002` puede verse como **Pendiente** en lugar de «Rechazado» mientras la sesión siga abierta; una sesión expirada sí se trata como rechazada. Si pasa, no es un fallo tuyo: anótalo en la bitácora como «rechazo visto como pendiente».

En Firestore, el documento `drivers/{uid}/trips/{tripId}`:

- Aprobada: `paymentMethod = stripe`, `paymentStatus = approved`, `status = paid`, y un `paymentId` (el identificador de la sesión de Stripe, empieza por `cs_`).
- Rechazada: `paymentMethod = stripe` y `paymentStatus = rejected` (o `pending` según el aviso anterior).
- El método lo escribe solo el backend al pulsar cobrar; si el viaje ya estaba aprobado, nunca cambia (D-118, Propuesta).

Además, en el panel de Stripe (modo de prueba), **Pagos** debe mostrar el cobro de prueba.

## 9. Cambiar de pasarela y el riesgo de doble cobro de prueba

Con dos pasarelas puedes intentar Mercado Pago y luego Stripe sobre el mismo viaje mientras no haya un pago aprobado. Si un viaje ya está aprobado en una pasarela, el backend bloquea un segundo cobro (CA-002-110). Riesgo residual: si pagaste en una pasarela, no pulsaste «Verificar pago» y cambiaste de pasarela, podrías dejar **dos cobros de prueba** reales en cada panel. Es dinero de prueba, pero ensucia la limpieza y las capturas: antes de cambiar, toca «Verificar pago». No hay reembolsos en esta entrega.

## 10. Webhook (opcional)

No lo necesitas para la prueba: «Verificar pago» reconsulta la sesión a Stripe (D-120). El webhook solo hace que el estado se actualice sin que toques el botón.

1. Instala la CLI de Stripe. **Instalación en Windows: NO CONFIRMADA** en lo leído; mira las instrucciones oficiales en <https://docs.stripe.com/cli/install> y <https://github.com/stripe/stripe-cli#installation> (no se confirmó si `winget`, `scoop` o `choco` sirven).
2. `stripe login` y, con el backend corriendo:

```powershell
stripe listen --forward-to localhost:3001/webhooks/stripe
```

3. La CLI imprime un secreto de firma que empieza por `whsec_`. Cópialo **solo** en `STRIPE_WEBHOOK_SECRET` de `backend/.env` (no en chats) y reinicia el backend. Sin esa variable, la ruta `/webhooks/stripe` rechaza todo y no aplica nada.
4. Alternativa con túnel: con la vía 2 (https) puedes registrar `<URL-del-túnel>/webhooks/stripe` como endpoint en el panel de Stripe; el secreto lo da el panel. La URL del túnel cambia en cada ejecución. **No verificado.**
5. El backend verifica la firma (`Stripe-Signature`, HMAC-SHA256, tolerancia de 5 minutos, <https://docs.stripe.com/webhooks>) y **no confía en el cuerpo**: toma solo el identificador de la sesión y la reconsulta. `stripe trigger payment_intent.payment_failed` genera un evento de prueba que no pertenece a tu viaje; según CA-002-116 el backend lo responde sin aplicar nada (**No verificado en dispositivo**).

## 11. Síntoma, causa y solución

| Síntoma | Causa probable | Solución |
|---|---|---|
| No aparece el botón «Cobrar con Stripe (tarjeta de prueba)» | Stripe no configurada (clave ausente, inválida o `live`); la app no leyó `EXPO_PUBLIC_BACKEND_URL`; o aún no cargó la lista de pasarelas. | `npm run doctor` en `backend/`; revisa `STRIPE_SECRET_KEY`; reinicia el backend y Metro con `npx expo start -c`. |
| «No hay una pasarela de pago configurada» | `GET /payments/providers` devolvió ambas pasarelas en falso. | Configura al menos una en `backend/.env` y reinicia el backend. |
| `npm run doctor` o `npm start` fallan al cargar módulos | Falta `npm install` en `backend/`. | `cd backend; npm install`. |
| Doctor `ERROR` por clave `live` | Clave de producción cargada. | Usa la clave `sk_test_` o `rk_test_` (<https://dashboard.stripe.com/apikeys>, modo de prueba). |
| Doctor `ERROR` con `HTTP 401` | Clave inválida o de otra cuenta. | Cópiala de nuevo (sin espacios) en `backend/.env` y reinicia. |
| El checkout de Stripe no abre o muestra error de moneda | La cuenta puede no aceptar COP (NO CONFIRMADO). | Prueba `STRIPE_CURRENCY=usd` con `STRIPE_COP_PER_USD=<tu tasa>`, reinicia el backend. |
| Error al crear la sesión por la URL de retorno | `PUBLIC_BASE_URL` con `http://` (NO CONFIRMADO que Stripe lo acepte). | Usa la vía 2 (túnel https) y actualiza `PUBLIC_BASE_URL` y `EXPO_PUBLIC_BACKEND_URL`. |
| «Sin conexión con el cobro…» / «El cobro tardó demasiado…» | Backend apagado, firewall, IP cambiada o túnel cerrado. | Tabla de [pagos-guia-rapida.md](pagos-guia-rapida.md), sección 7; comprueba `/health` desde el celular. |
| Pagaste con `4242…` y el chip sigue «Pendiente» | No llegó el webhook y no tocaste «Verificar pago». | Toca «Verificar pago». Si sigue, revisa la ventana del backend. |
| Pagaste con `4000 0000 0000 0002` y se ve «Pendiente» | Rechazo visible como pendiente (ver sección 8). | No es un fallo; reintenta con un checkout nuevo o con la tarjeta `4242…`. |
| «Pago aprobado» en Mercado Pago y quieres cobrar con Stripe | El viaje ya está aprobado: el segundo cobro se bloquea. | Usa otro viaje. |
| El webhook responde error | `STRIPE_WEBHOOK_SECRET` ausente, firma vencida (más de 5 min) o secreto de otro `stripe listen`. | Copia el secreto que imprime el `stripe listen` actual y reinicia el backend. |
| La app sigue con la URL antigua | Metro sin caché limpia. | `npx expo start -c`. |

## 12. Cerrar la prueba

- Limpia en Firestore solo datos de prueba (ver [checklist-manana-jueves.md](checklist-manana-jueves.md), paso 9).
- No pegues claves en el chat, la bitácora ni capturas. Si lo hiciste, regénera la clave en <https://dashboard.stripe.com/apikeys>.
- Ningún resultado de esta guía se marca «Validado» sin la prueba de Anderson en el celular.

## Fuentes oficiales consultadas

- Crear sesión: <https://docs.stripe.com/api/checkout/sessions/create>
- Consultar sesión: <https://docs.stripe.com/api/checkout/sessions/retrieve>
- Idempotencia: <https://docs.stripe.com/api/idempotent_requests>
- Monedas: <https://docs.stripe.com/currencies>
- Tarjetas de prueba: <https://docs.stripe.com/testing>
- Webhooks y firma: <https://docs.stripe.com/webhooks>
- CLI: <https://docs.stripe.com/cli/install> y <https://github.com/stripe/stripe-cli#installation>
- Claves: <https://docs.stripe.com/keys> y <https://dashboard.stripe.com/apikeys>
- Errores: <https://docs.stripe.com/error-low-level.md>
- Saldo (usada por el doctor): <https://docs.stripe.com/api/balance/balance_retrieve>

## No confirmado

- Que la cuenta de Anderson acepte COP (depende del país de la cuenta). Respaldo: `STRIPE_CURRENCY=usd`.
- Que COP use dos decimales: inferido de la página de monedas (no figura entre las excepciones).
- `Authorization: Bearer` (el backend usa autenticación básica), `payment_intent_data` con metadatos, la expansión del PaymentIntent y `last_payment_error` en el flujo usado: no confirmados; por eso un rechazo puede verse como pendiente.
- Que Stripe acepte una `success_url` con `http://`.
- Instalación de la CLI en Windows con `winget`, `scoop` o `choco`.
- El mínimo de cobro en dólares.
- Todo lo visual y de pasarela en el celular: **No verificado en dispositivo.**
