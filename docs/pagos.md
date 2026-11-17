# Pagos — Mercado Pago Checkout Pro

<!-- AI-assisted: see AI_LOG.md #55 (T-90, RF-44, RNF-18, RNF-19, D-107 a D-110) -->

Estado: investigación y diseño (2026-11-11). La prueba real contra Mercado Pago la hace Anderson; el agente no ejecutó el backend contra Mercado Pago ni leyó secretos.

## Fuentes consultadas
- Tarjetas de prueba Colombia: https://www.mercadopago.com.co/developers/es/docs/checkout-pro/test-cards
- Configurar `back_urls`: https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/configure-back-urls
- Redirección de la interfaz: https://www.mercadopago.com/developers/en/docs/checkout-pro/checkout-customization/user-interface/redirection
- Webhooks (notificaciones): https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/webhooks

## Lo confirmado en las fuentes
- Tarjetas de prueba (Colombia): Mastercard crédito `5254 1336 7440 3564`, Visa crédito `4013 5406 8274 6260`, Visa débito `4912 6840 6309 1904`; CVV `123`, vencimiento `11/30`. Son datos públicos de prueba, no credenciales.
- El nombre del titular decide el resultado: `APRO` aprobado, `OTHE` rechazo general, `CONT` pendiente, `FUND` fondos insuficientes. Documento `123456789`.
- `back_urls` admite `success`, `pending` y `failure`; `auto_return: "approved"` redirige solo si el pago se aprueba (hasta 40 s, no personalizable). La página de retorno trae `payment_id`, `status`, `external_reference` y `merchant_order_id`.
- Webhook: cabecera `x-signature` con `ts=…,v1=…`, cabecera `x-request-id`, `data.id` en la consulta. Hay que responder 200 o 201 en 22 s; Mercado Pago reintenta cada 15 min.
- El checkout de prueba no pide cuenta de comprador de prueba; sirve un correo válido cualquiera. No se encontró costo en las páginas leídas.

## Lo no confirmado (marcado «verificar»)
- Si con credenciales de prueba se usa `init_point` o `sandbox_init_point`: el backend devuelve `init_point` y trata el otro como opcional.
- `GET /v1/payments/search?external_reference=` no aparece en las páginas leídas; es una API conocida y se usa para `/payments/sync`.
- El manifiesto de la firma (`id:<data.id>;request-id:<x-request-id>;ts:<ts>;`, HMAC-SHA256 en hexadecimal) viene de fuentes de búsqueda, no de la página oficial de Colombia. Por eso el secreto es opcional y la verificación real queda para la prueba de Anderson.
- Si Mercado Pago propaga `metadata.uid` de la preferencia al pago. Si no, el webhook no podrá ubicar el viaje: alternativa, buscar con `collectionGroup('trips')` y un campo `tripId` (requiere índice).
- Esquema personalizado: `app.json` no tiene `scheme`, así que **no hay `back_urls` con deep link**. La persona vuelve a la app a mano y la app consulta `/payments/sync` al volver a primer plano.

## Diseño (D-107 a D-110)
1. **Importe desde el documento.** `POST /payments/checkout {tripId}` lee `fare` del viaje en Firestore (pesos COP enteros); nunca acepta un importe del cliente. `external_reference` = `tripId`.
2. **Identidad.** Todas las rutas del usuario exigen `Authorization: Bearer <ID token>` verificado con `verifyIdToken`.
3. **Webhook sin confianza en el cuerpo.** `POST /webhooks/mercadopago` solo toma el id del pago, lo consulta a Mercado Pago con el token del servidor y valida `external_reference`, importe y moneda. Si hay `MP_WEBHOOK_SECRET`, verifica `x-signature` (comparación en tiempo constante, tolerancia de `ts` de 300 s).
4. **Transacción idempotente.** El estado nunca retrocede desde `approved`. Mapeo: `approved` → `approved`; `pending` e `in_process` → `pending`; `rejected` y `cancelled` → `rejected`.
5. **Límites.** 20 solicitudes por minuto por usuario y 120 por IP, cuerpo de hasta 2 KB, CORS cerrado, errores genéricos y ningún registro de tokens ni cabeceras.

## Variables del backend (solo nombres)
`MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `PUBLIC_BASE_URL`, `PORT`, `MP_WEBHOOK_SECRET` (opcional). Los valores viven solo en `backend/.env`, ignorado por Git, junto con `backend/secrets/`. La app lleva únicamente `EXPO_PUBLIC_BACKEND_URL` (una URL pública, sin secreto).

## Límite D-109 (importe del viaje)
El backend toma el importe de `fare` en el documento del viaje, nunca del cliente. Pero el conductor escribe ese documento (regla de Firestore), así que un conductor podría modificar su propio `fare` antes de pedir el cobro. En esta entrega es un riesgo aceptado: el cobro es de prueba y el pasajero real no existe. Mitigación a futuro: calcular y guardar la tarifa en el servidor, o validar contra la ruta planificada.

## Exponer el backend (`PUBLIC_BASE_URL`)
Mercado Pago debe alcanzar `POST /webhooks/mercadopago`, así que `PUBLIC_BASE_URL` tiene que ser una URL pública: un túnel HTTPS (por ejemplo, el que prefiera Anderson) hacia el puerto `PORT`. Una IP de la red local sirve para que la app llegue al backend (`EXPO_PUBLIC_BACKEND_URL`), pero no para el webhook; sin webhook, la app consulta `/payments/sync`.
Nota `trust proxy`: el backend no lo activa. Detrás de un túnel, todo el tráfico (incluido el webhook) puede verse con la misma IP y compartir el límite de 120 por minuto.

## Prueba manual (la hace Anderson)
1. Crear `backend/.env` a mano desde `backend/.env.example` y completar los valores (nunca se pegan en documentos ni en la bitácora).
2. Arrancar el backend: `cd backend` y `npm start`.
3. Exponerlo (túnel o IP de la red) y poner esa URL en `PUBLIC_BASE_URL` (webhook) y en `EXPO_PUBLIC_BACKEND_URL` del entorno de la app (no en `app.json`).
4. Publicar a mano las reglas de `drivers` y `trips` de [seguridad.md](seguridad.md) en la consola de Firebase.
5. En la app, completar un viaje con Mercado Pago, pagar con la tarjeta de prueba y el titular `APRO`, volver a la app (no hay deep link) y tocar «Verificar pago» si no se actualiza sola.
6. Probar también `OTHE` (rechazo), `CONT` (pendiente) y el efectivo.
