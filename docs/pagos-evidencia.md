# Evidencia de pagos validada en el celular — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #68 -->
Estado: **borrador para revisión de Anderson (2026-11-16).** Este documento (lote L4, C1) reúne lo que Anderson validó en el celular sobre el cobro. Solo se registra lo que consta en `docs/AI_LOG.md` y `docs/progress.md`; cuando una fecha no consta se dice «no consta fecha». No contiene claves, tokens ni datos personales. Todo pago es de prueba y no se mueve dinero real.

## Declaración honesta de alcance

**Mercado Pago implementado, no verificado con usuarios de prueba; Stripe es la pasarela verificada de punta a punta.** Nada de lo que sigue valida Mercado Pago (D-196, Propuesta). Ver también `docs/omisiones-y-limites.md`.

## Qué validó Anderson, por fecha

| Fecha | Qué | Fuente | Estado |
|---|---|---|---|
| 2026-11-11 | «Confirmar cobro» guarda el viaje en Firestore (sin coordenadas); Historial y Ganancias lo muestran y se actualizan; un viaje cancelado aparece en Historial (T-46 a T-49) | `docs/AI_LOG.md` (entrada del encargo con «ESTADO PREVIO», declaración de Anderson, `SHOW_DEV_TOOLS=false`) | Validada en dispositivo por declaración de Anderson |
| 2026-11-12 | Flujo de pagos con Stripe validado en el celular: tarjeta de prueba aprobada (`4242…`) y rechazada (`4000 0000 0000 0002`), y pago en efectivo | `docs/AI_LOG.md` (contexto del encargo del 2026-11-12: «Flujo de pagos con Stripe validado en dispositivo») | Validada por declaración de Anderson; sin captura |
| 2026-11-16 14:54 (STOP-5) | Pago con tarjeta Stripe OK; Detalle con «Pago aprobado», «Tarjeta (Stripe)», comisión y ruta de OSRM; Saldo y Ganancias coherentes con el Historial; flujo completo (aceptar, conductor llegando, iniciar, finalizar, cobrar) | `docs/progress.md` (fila STOP-5), `docs/AI_LOG.md` | Validada en dispositivo por Anderson |
| 2026-11-16 15:59 (STOP-6) | Lote L3 Parte A e idioma validados (no es de pagos); el Detalle se ve con la ruta completa | `docs/progress.md` (fila STOP-6) | Validada en dispositivo por Anderson |
| No consta fecha | Pago con tarjeta de prueba de Stripe **pendiente** (caso «Pendiente» tras volver a la app) | Encargo de Anderson del 2026-11-16 (L4, C1) | Consta como validado por Anderson, pero la fecha del recorrido no está registrada |
| No consta fecha | Efectivo con «Confirmar cobro» en el flujo actual; propina y calificación simuladas (D-124) | Encargo de Anderson del 2026-11-16 (L4, C1) | Consta como validado por Anderson, pero la fecha del recorrido no está registrada |

Cobertura de las tarjetas de prueba de Stripe: aprobada, rechazada y pendiente. Las pruebas de dispositivo de Mercado Pago no existen.

## Capturas

No hay capturas de pagos en el repositorio (`git ls-files` no lista imágenes fuera de `assets/`), por lo que **no se enlaza ninguna**. Las únicas referencias visuales son los informes de auditoría de diseño, que no son capturas de dispositivo: `docs/diseno/auditorias/ronda-3-stripe.md` y `docs/diseno/auditorias/stripe-inventario.md`. Si Anderson aporta capturas, deben añadirse aquí con su pie y su fecha.

## Reglas de dinero que la evidencia respalda

- **El monto sale de Firestore, nunca del cliente.** El backend lee el viaje guardado y cobra `tarifa + propina` (D-124; ver también D-109 y su límite aceptado en `docs/omisiones-y-limites.md`).
- **La comisión del 20 % se calcula solo sobre la tarifa**, no sobre la propina (D-124). La propina y la calificación son simuladas porque no existe app de pasajero.
- **Solo modo de prueba**: el backend rechaza claves `live` (D-119). En la pantalla de resumen del viaje se muestra siempre en la tarjeta de cobro el aviso «Pago de prueba: no se mueve dinero real.» (`src/screens/trip/TripSummaryScreen.js`, `labels.trip.paymentSimulated`; en inglés «Test payment: no real money moves.»).
- **Tarjeta de prueba, no datos reales.** Las tarjetas de prueba de Stripe (`4242…`, `4000 0000 0000 0002`) son números públicos de la documentación de Stripe; nunca se usan datos de tarjetas reales ni se guardan datos de tarjeta en la app.

## Decisiones relacionadas

- D-116 a D-121: Stripe Checkout como segunda pasarela, proveedores intercambiables, elección de pasarela, solo credenciales de prueba, webhook opcional y convención del método de pago (`docs/decisiones.md`).
- D-124: propina y calificación simuladas; comisión solo sobre la tarifa; cobro `tarifa + propina`.
- D-181 a D-186: cierre del lote L2 (estados rechazado y conductor llegando, saldo).
- D-196 (Propuesta): redacción de Mercado Pago frente a Stripe.

## Guías

`docs/pagos.md`, `docs/pagos-stripe-guia.md`, `docs/pagos-guia-rapida.md`, `docs/seguridad.md`.
