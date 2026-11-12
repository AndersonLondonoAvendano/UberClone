// AI-assisted: see docs/AI_LOG.md #58
// GET /payments/return: fixed landing page for the hosted checkout (success and cancel). It carries no
// trip data and reflects nothing from the request: the HTML is a constant.
import { ERRORS, send as defaultSend } from '../middleware.js';

export const RETURN_PAGE = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pago</title>
</head>
<body>
<h1>Puedes volver a la app</h1>
<p>Cierra esta pagina y vuelve a la aplicacion. Alli, en el viaje, pulsa &laquo;Verificar pago&raquo; para ver el resultado.</p>
</body>
</html>
`;

export function registerReturnRoute(app, { ipLimiter, send = defaultSend }) {
  app.get('/payments/return', (req, res) => {
    if (!ipLimiter.hit(`return:${req.ip ?? 'unknown'}`)) return send(res, ERRORS.rateLimited);
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    });
    return res.status(200).send(RETURN_PAGE);
  });
}
