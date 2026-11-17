# Guía rápida de pagos con Mercado Pago o Stripe (prueba en el celular)

<!-- AI-assisted: see AI_LOG.md #57 (T-129) y T-153 (elección de pasarela) -->

Para quién: Anderson, en Windows con PowerShell. Objetivo: que el celular alcance el backend y completar un pago de prueba con tarjeta. Las secciones 1, 2 y 6 describen Mercado Pago; para Stripe usa [pagos-stripe-guia.md](pagos-stripe-guia.md). Los datos del repositorio (puerto, rutas, variables, textos de la app) se leyeron del código; los datos de Mercado Pago vienen de las fuentes de la sección final y algunos son resúmenes (ver «No confirmado»).

Regla de oro: los valores (token, llave de Firebase, URLs con secretos) viven solo en `backend/.env`. No los pegues en el chat, en documentos ni en la bitácora. Más contexto técnico en [pagos.md](pagos.md) y las reglas de Firestore en [seguridad.md](seguridad.md).

## 0. Elegir pasarela (R12, D-116 a D-120 en Propuesta)

La app admite dos pasarelas de prueba y el conductor elige al cobrar: un botón por cada pasarela que el backend informe como configurada («Cobrar con Mercado Pago» y «Cobrar con Stripe (tarjeta de prueba)»). Si ninguna está configurada, la app dice «No hay una pasarela de pago configurada». Todo esto es **No verificado en dispositivo**.

| Pasarela | Cuándo usarla | Variable del backend | Guía |
|---|---|---|---|
| **Stripe** (recomendada hoy) | Mercado Pago no permitió crear cuentas de prueba; Stripe sí permite una cuenta en modo de prueba. | `STRIPE_SECRET_KEY` (solo clave `sk_test_` o `rk_test_`; una `live` se rechaza). Opcionales: `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`, `STRIPE_COP_PER_USD`. | [pagos-stripe-guia.md](pagos-stripe-guia.md) |
| **Mercado Pago** | Solo si logras crear las cuentas de prueba (vendedor y comprador). Sigue implementado y sin cambios. | `MP_ACCESS_TOKEN` | Las secciones 1 a 7 de este documento. |

Puedes configurar una, otra o las dos; con ninguna el backend arranca y `/health` responde, pero no se puede cobrar con tarjeta. El efectivo no usa pasarela. La red (secciones 3 a 5), el firewall y el diagnóstico (`npm run doctor`, que imprime una línea por pasarela) son comunes. **Cambiar de pasarela sobre el mismo viaje** es posible mientras no haya un pago aprobado; antes de cambiar toca «Verificar pago», porque un pago ya hecho y no verificado puede dejar dos cobros de prueba (uno en cada panel).

## 1. Preparar credenciales de Mercado Pago (una sola vez)

1. En el panel de desarrolladores de Mercado Pago Colombia entra a **Tus integraciones**, crea una aplicación (o abre la que ya tienes) y elige el entorno **Prueba**. En **Credenciales de prueba** copia el **Access Token** (empieza por `APP_USR`; ese prefijo no distingue prueba de producción, por eso importa que estés en el entorno Prueba).
2. En **Cuentas de prueba** crea dos cuentas: una **vendedor** y una **comprador**. Guarda aparte el usuario y la contraseña de la compradora; el código de verificación de 6 dígitos para iniciar sesión con una cuenta de prueba aparece en esa misma página, en la fila de la cuenta.
3. En la consola de Firebase del proyecto: **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**. Guarda el archivo dentro de `backend/secrets/` (carpeta ignorada por Git). No lo abras ni lo pegues en ningún lado.
4. Crea `backend/.env` a partir del ejemplo (PowerShell, desde la raíz del proyecto):

```powershell
Copy-Item backend\.env.example backend\.env
```

5. Abre `backend/.env` en tu editor y completa **solo ahí** los valores de estas variables:

| Variable | Qué lleva |
|---|---|
| `MP_ACCESS_TOKEN` | El Access Token de prueba del paso 1. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Ruta al JSON del paso 3 (por ejemplo, dentro de `backend/secrets/`). |
| `PUBLIC_BASE_URL` | URL pública del backend (ver sección 4). **Es obligatoria**: sin ella `npm start` se detiene con «Configuracion incompleta». |
| `PORT` | Opcional; si la dejas vacía el backend usa 3001. |
| `MP_WEBHOOK_SECRET` | Opcional; si la defines, se verifica la firma `x-signature` del webhook. |

6. Instala las dependencias del backend si aún no lo hiciste (Node 20.12 o superior):

```powershell
cd backend
npm install
```

## 2. Diagnóstico: `npm run doctor`

Desde `backend/`:

```powershell
npm run doctor
```

Imprime una línea por paso con el estado al inicio y nunca muestra valores, solo nombres de variables y el nombre del archivo de la llave. Estados:

- `OK`: el paso pasó. Esperas ver, entre otras: `Node ... cumple el mínimo`, `Variable MP_ACCESS_TOKEN definida.`, `Variable FIREBASE_SERVICE_ACCOUNT_PATH definida.`, `Llave de Firebase: "<archivo>" legible con JSON válido.`, `Firestore: firebase-admin inicia y la lectura de prueba funciona.`, `Mercado Pago: el token es válido.`, `PUBLIC_BASE_URL usa https.`
- `FALTA`: falta una variable obligatoria (`MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_PATH`); defínela en `backend/.env`.
- `ERROR`: algo falló (versión de Node, `PORT` fuera de 1 a 65535, archivo de llave ilegible o no JSON, Firestore, token de Mercado Pago o sin red). El texto dice qué revisar.
- `AVISO`: no bloquea. Casos: `PORT` sin definir (usa el por defecto), `MP_WEBHOOK_SECRET` sin definir (no se verifica la firma), `PUBLIC_BASE_URL` sin definir o que no es https (el webhook no llegará), o un paso omitido porque otro anterior falló.

El comando termina con código distinto de cero si hay algún `FALTA` o `ERROR`; los `AVISO` no cuentan.

Sobre la línea de Mercado Pago: el diagnóstico comprueba el token con `GET https://api.mercadopago.com/users/me`. **Eso NO se pudo confirmar en la documentación oficial** (ver «No confirmado»). Por eso, si sale `ERROR` con `la API respondió HTTP 4xx` pero estás seguro de que copiaste el token de prueba correcto, no te detengas: sigue con la prueba de pago; el resultado real lo da el checkout. Un `ERROR` de «no se pudo conectar» sí es tu red.

## 3. Arrancar el backend y comprobar que responde

```powershell
cd backend
npm start
```

Debe imprimir `Servidor escuchando en el puerto 3001` (o el de `PORT`). Mensajes posibles de error: `Configuracion incompleta. Revisa backend/.env (variables: ...)` (faltan o son inválidas esas variables) y `El puerto 3001 ya esta en uso...` (cierra el otro proceso o cambia `PORT`).

Comprueba la ruta de salud: `GET /health` responde `{"status":"ok","service":"uber-clone-backend"}`. Primero en el PC con `http://localhost:3001/health`; después, **desde el navegador del celular**, con la URL que vayas a usar según la vía de la sección 4. Si el celular no la abre, la app tampoco podrá cobrar: resuélvelo antes de seguir.

Rutas que usa la app: `POST /payments/checkout` y `POST /payments/sync` (con sesión), y `POST /webhooks/mercadopago` (la llama Mercado Pago).

## 4. Dos vías para que el celular alcance el backend

### Vía 1: misma Wi-Fi (IP del PC)

Sirve para que la app llegue al backend. **No sirve para el webhook** de Mercado Pago (necesita una URL pública https); sin webhook, el pago se confirma con «Verificar pago».

1. PC y celular en la misma red Wi-Fi.
2. Averigua la IP del PC: ejecuta `ipconfig` y toma la **Dirección IPv4** del adaptador Wi-Fi (por ejemplo `192.168.x.x`).
3. Abre el puerto en el firewall de Windows. Abre **PowerShell como administrador** y ejecuta:

```powershell
New-NetFirewallRule -DisplayName "UberClone backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

4. En `backend/.env` pon `PUBLIC_BASE_URL=http://<IP>:3001` (obligatoria para que arranque; el webhook no llegará y `npm run doctor` mostrará un `AVISO`).
5. Reinicia el backend (`Ctrl+C` y `npm start`) y abre `http://<IP>:3001/health` en el navegador del celular.
6. Si la IP del PC cambia (otra red, el router reasigna), repite desde el paso 2 y actualiza la app (sección 5).

### Vía 2: túnel HTTPS con `cloudflared` (habilita el webhook)

1. Con el backend ya corriendo en otra ventana de PowerShell, ejecuta:

```powershell
cloudflared tunnel --url http://localhost:3001
```

(Si no tienes `cloudflared`, instálalo desde la documentación de Cloudflare; el repositorio no lo instala ni lo verifica.)

2. La salida muestra una URL pública `https://...`. **Esa URL cambia en cada ejecución del túnel.**
3. Pon esa URL en `PUBLIC_BASE_URL` (`backend/.env`) y en `EXPO_PUBLIC_BACKEND_URL` (`.env` de la app, sección 5). Reinicia el backend para que lea `PUBLIC_BASE_URL` y reinicia Metro con `-c`.
4. Comprueba `https://<url-del-túnel>/health` en el navegador del celular.
5. Cada vez que cierres y vuelvas a abrir el túnel, repite los pasos 2 y 3.

Con esta vía el webhook puede avisar al backend y el estado del cobro se actualiza solo. Aun así, «Verificar pago» sigue disponible.

## 5. Apuntar la app al backend

En el archivo `.env` de la **raíz del proyecto** (el de la app, no el de `backend/`) define solo el nombre y la URL del paso anterior:

```
EXPO_PUBLIC_BACKEND_URL=<la URL del paso 4>
```

Es una URL pública, sin secretos. No la pongas en `app.json`. Metro lee las variables `EXPO_PUBLIC_*` al empaquetar, así que reinicia con caché limpia:

```powershell
npx expo start -c
```

Si la variable está vacía, la app muestra «Servicio de cobro sin configurar».

### Hallazgo: HTTP en build debug y release

El manifiesto Android de los builds **debug** y **debugOptimized** declara `usesCleartextTraffic="true"`, así que con ellos la app puede llamar a `http://<IP>:3001`. `app.json` no lo habilita para el resto, de modo que en un build **release** el tráfico HTTP queda bloqueado. Para release (o si dudas del build) usa la vía 2 con una URL `https`. En el build debug de este proyecto la vía 1 con HTTP funciona; en iOS no se revisó este punto.

## 6. Prueba de pago con tarjeta

Requisitos: backend arrancado, `/health` abre en el celular, app reiniciada con `-c`, sesión iniciada, y las reglas de `drivers` y `trips` de [seguridad.md](seguridad.md) publicadas en Firebase.

1. En la app completa un viaje y en «Cobro y resumen» elige el método **tarjeta** (Mercado Pago). Se guarda el viaje con el cobro pendiente.
2. Toca **«Cobrar con Mercado Pago»**. Se abre el navegador con el checkout. Conviene usar una **ventana de incógnito** para que no se mezcle con otra sesión de Mercado Pago.
3. Si el checkout lo pide, inicia sesión con la **compradora de prueba** (usuario y contraseña; el código de 6 dígitos está en **Cuentas de prueba**). La documentación indica que el checkout de prueba puede no pedir cuenta compradora; si no la pide, sigue.
4. Datos de la tarjeta de prueba (Colombia):
   - Titular: `APRO` (decide el resultado: aprobado).
   - Documento: `123456789`.
   - Mastercard crédito `5254 1336 7440 3564`, CVV `123`, vence `11/30`; o Visa crédito `4013 5406 8274 6260`, mismo CVV y vencimiento.
5. Confirma el pago. **Vuelve a la app a mano**: el backend no define `back_urls` ni `auto_return`, así que la app no recibe el retorno. (Si Mercado Pago te muestra una cuenta regresiva y redirige, es su propio comportamiento, no de esta app.)
6. En la app toca **«Verificar pago»** si el estado no cambió solo. Qué debes ver: el chip pasa a **«Aprobado»** y el panel dice «Pago aprobado. El viaje quedó guardado en tu historial.».
7. En Firestore, el documento `drivers/{uid}/trips/{tripId}` debe tener `paymentStatus = approved`.

Otros resultados con el mismo flujo, cambiando solo el titular:

| Titular | Resultado esperado en la app |
|---|---|
| `APRO` | Aprobado (chip «Aprobado»). |
| `OTHE` | Rechazado: chip «Rechazado» y panel «Pago rechazado»; aparece **«Reintentar pago»** (abre un checkout nuevo). |
| `CONT` | Pendiente: chip «Pendiente». Toca «Verificar pago» de nuevo más tarde. |
| `FUND` | Fondos insuficientes (según la documentación de tarjetas de prueba; no se probó aquí). |

## 7. Síntoma, causa y solución

Cuando falla una acción con el servicio de cobro, el panel muestra «Título. Mensaje» (textos tomados de `labels.trip.paymentServiceError` y `labels.trip.paymentActionError`). Una fila por clase de error:

| Lo que ves en la app | Causa | Solución |
|---|---|---|
| «Servicio de cobro sin configurar. El servicio de cobro no está configurado en esta app. Avisa a soporte o revisa la configuración de la app.» (`notConfigured`) | La app no tiene `EXPO_PUBLIC_BACKEND_URL` (variable vacía o Metro sin caché limpia). | Define la variable en el `.env` de la raíz y reinicia con `npx expo start -c` (sección 5). |
| «Sin conexión con el cobro. No se pudo conectar con el servicio de cobro. Revisa tu conexión y que el servicio esté encendido.» (`offline`) | El `fetch` falló: backend apagado, firewall sin abrir, IP del PC que cambió, el celular en otra red, un túnel cerrado, o HTTP bloqueado en release. | Revisa en orden: backend encendido (`npm start`); `/health` abre en el navegador del celular; regla de firewall (vía 1); IP actual con `ipconfig`; túnel vivo; en release usa `https`. |
| «El cobro tardó demasiado. No se pudo conectar con el servicio de cobro. Revisa tu conexión y que el servicio esté encendido.» (`timeout`) | La petición superó 15 s sin respuesta (red lenta, backend colgado o una IP que no responde). | Comprueba `/health` desde el celular, reintenta y revisa la ventana del backend. |
| «Servicio de cobro con problemas. No se pudo conectar con el servicio de cobro. Revisa tu conexión y que el servicio esté encendido.» (`serverError`) | El backend respondió HTTP 5xx o 429 (demasiadas solicitudes: límite de 20 por minuto por usuario), o un túnel caído (el proveedor del túnel suele responder 5xx; no se verificó). | Mira la ventana del backend y ejecuta `npm run doctor`. Si es 429, espera un minuto. Si usas túnel, reábrelo y actualiza las URLs. |
| «Sesión expirada. Tu sesión expiró; vuelve a iniciar sesión.» (`sessionExpired`) | No hay sesión o token, o el backend respondió 401/403. | Cierra sesión y vuelve a entrar. Si persiste, revisa que la llave de Firebase del backend sea del mismo proyecto que la app (`npm run doctor`). |
| «No encontramos el cobro. El servicio de cobro no encontró este viaje. Actualiza la pantalla o inténtalo más tarde.» (`notFound`) | HTTP 404: el viaje no existe en `drivers/{uid}/trips/` o la URL del backend apunta a otro servicio. | Confirma que el viaje se guardó (historial) y que `EXPO_PUBLIC_BACKEND_URL` es la del backend (`/health`). |
| «Respuesta inesperada. El servicio de cobro respondió algo que no entendemos. Inténtalo de nuevo en unos minutos.» (`invalidResponse`) | Respuesta 2xx ilegible, o el enlace de pago no es `https`. Suele pasar si la URL apunta a un servidor que no es el backend. | Abre `/health` y verifica el JSON esperado; revisa la URL de la app. |
| «Mercado Pago no respondió. Mercado Pago no pudo procesar la solicitud. Inténtalo de nuevo en unos minutos.» (`providerError`) | El backend recibió error de Mercado Pago (HTTP 502 `upstream_error`) o respondió otro 4xx. Causa típica: `MP_ACCESS_TOKEN` inválido o de otro entorno. | Ejecuta `npm run doctor`; vuelve a copiar el Access Token de **Prueba** en `backend/.env` y reinicia el backend. |
| «Servicio de cobro no disponible. No pudimos contactar el servicio de cobro. Inténtalo de nuevo en unos minutos.» (`backendUnavailable`, mensaje genérico anterior) | Texto de respaldo de la versión previa. Hoy el panel usa las ocho clases de arriba; este texto solo aparece si la clase es `backendUnavailable`. | Mismos pasos que `offline`: backend, `/health`, firewall, IP. |
| «Sin conexión. No pudimos completar la acción sin internet. Inténtalo de nuevo cuando vuelvas a tener conexión.» (`offline` de la acción) | Texto de respaldo cuando la clase es el código antiguo `offline` de la acción. | Revisa los datos o la Wi-Fi del celular. |
| «No pudimos completar la acción. Algo falló con el cobro. Inténtalo de nuevo.» (`failed`) | Código desconocido o acción sin `tripId`. | Reintenta; si persiste, revisa la ventana del backend. |
| «No pudimos abrir el pago. No se pudo abrir el navegador con el enlace de pago. Inténtalo de nuevo.» (`openFailed`) | El backend sí devolvió el enlace, pero el celular no lo pudo abrir. | Comprueba que hay un navegador predeterminado y reintenta. |

Problemas sin mensaje propio:

| Síntoma | Causa | Solución |
|---|---|---|
| Pagaste con `APRO` pero el chip sigue «Pendiente» | La app no recibe el retorno y el webhook no llegó: `PUBLIC_BASE_URL` sin `https` (vía 1) o URL de túnel vieja. | Toca **«Verificar pago»**: el backend consulta a Mercado Pago y escribe el estado. Para webhook automático usa la vía 2 con `PUBLIC_BASE_URL` actualizada. |
| El backend no arranca: «Configuracion incompleta» | Falta o es inválida alguna variable (`MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `PUBLIC_BASE_URL`, `PORT`). | `npm run doctor` y completa `backend/.env`. |
| «El puerto 3001 ya esta en uso» | Otro proceso (por ejemplo, otro backend abierto) usa el puerto. | Ciérralo o cambia `PORT` y ajusta firewall y URLs. |
| Funcionaba y dejó de funcionar al volver mañana | Cambió la IP del PC o la URL del túnel. | Actualiza `PUBLIC_BASE_URL` y `EXPO_PUBLIC_BACKEND_URL`, reinicia el backend y `npx expo start -c`. |
| Cambiaste `EXPO_PUBLIC_BACKEND_URL` y la app sigue con la anterior | Falta limpiar la caché de Metro. | `npx expo start -c`. |

## Fuentes oficiales consultadas

Todas bajo `https://www.mercadopago.com.co/developers/es/docs/`:

- `your-integrations/credentials`
- `your-integrations/test/accounts`
- `your-integrations/test/cards`
- `checkout-pro-preferences/integration-test/test-purchases`
- `checkout-pro-preferences/configure-back-urls`
- `checkout-pro-preferences/payment-notifications`
- `your-integrations/notifications/webhooks`
- `checkout-pro-preferences/create-payment-preference`

Parte de los datos viene de resúmenes de esas páginas, no de una lectura literal completa. Contrasta las tarjetas de prueba y su titular con la página `your-integrations/test/cards` antes de depender de ellas.

## No confirmado

- `GET https://api.mercadopago.com/users/me` como comprobación del token: no se confirmó en la documentación oficial. Un HTTP 4xx en `npm run doctor` con el token correcto no debe bloquear la prueba.
- El cuerpo exacto de `POST /checkout/preferences` (la preferencia que crea el backend): no se confirmó. Lo que el backend envía es solo lo que dice su código (artículo, `external_reference`, `metadata.uid` y `notification_url`).
- Si `back_urls` acepta direcciones HTTP: no se confirmó. Esta app no usa `back_urls` ni deep link.
- Las páginas de referencia consultadas para esos puntos devolvieron 404.
