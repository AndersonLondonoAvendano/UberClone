# Checklist de entrega final

<!-- AI-assisted: see docs/AI_LOG.md #68 (D6) -->

Casillas de lo que **solo Anderson** puede hacer. Ningún agente hace commit, push, builds nativos ni toca servicios con datos reales.

Referencias: [plan de cierre](plan-cierre-entrega-2026-11-16.md) · [progress](progress.md) · [backlog](backlog.md) · [omisiones y límites](omisiones-y-limites.md) · [evidencia de pagos](pagos-evidencia.md) · [auditoría de la bitácora](auditoria-bitacora-2026-11-16.md) · [guion del video](guion-video.md).

## Lotes (estado exacto en progress.md)
- L1: OSRM real, Ganancias sin tope, `npm test`.
- L2: estados rechazado y conductor llegando, campos aditivos, saldo. Validado en dispositivo (STOP-5).
- L3: idioma es/en ([spec](../specs/006-idioma/spec.md)). Validado en dispositivo (STOP-6).
- L3b: selector de idioma sin sesión ([adenda](../specs/006-idioma/adenda-l3b.md)). **STOP-7 probado por Anderson 2026-11-16, 100 % OK salvo un ajuste visual del selector en inicio de sesión (reducido después; verificación visual pendiente).**
- FCM A1 (D-149): toque de la notificación desde otra pantalla, VALIDADO por STOP-4 (app en segundo plano en Configuración, Historial y Perfil). Solo la app CERRADA sigue pendiente y solo se valida en la build release (el dev client no entrega la solicitud).
- L4: pagos, documental ([evidencia](pagos-evidencia.md)).
- L7 (parte de proceso): auditoría de la bitácora, README, guion y este checklist.

## Bitácora
- [ ] Completar «Verificación» y «Aprendizaje» de las entradas vacías o «pendiente» (tabla en la auditoría).
- [ ] Completar los hashes de commit (tabla objetiva en la auditoría).
- [x] Entrada «RECONSTRUIDA, no registrada en el momento» para la normalización de placa (T-174, antiguo marcador #62): creada en borrador como la entrada #69 de `docs/AI_LOG.md` (2026-11-16). [ ] Anderson: completar Verificación, Aprendizaje y hash, y decidir si restituye la marca `AI-assisted` en el código.
- [ ] Exportar el PDF de `docs/AI_LOG.md`.

## Video
- [ ] Grabar las tomas de respaldo y ensayar con cronómetro ([guion](guion-video.md)).
- [ ] Grabar con la build release; ≤ 5:00; sin secretos ni datos reales a la vista.
- [ ] Subir el video y anotar el enlace en el README.

## Datos y servicios
- [ ] Limpiar datos de prueba con datos reales en Firestore, Auth y Cloudinary.
- [ ] Verificar que las reglas **publicadas** de Firestore son las esperadas y que `firestore.rules` local es solo una copia (fuera de git).
- [ ] Cerrar el túnel de `cloudflared` al terminar.
- [ ] Confirmar que `backend/.env`, `backend/secrets/` y `google-services.json` siguen fuera del repositorio.

## Build y entrega
- [ ] Compilar el APK release con la URL final del backend (se graba al compilar) y copiarlo **fuera del repo**.
- [ ] Ejecutar `npm test` y `node scripts/check-constitution.mjs` y anotar las cifras (base: 14 errores).
- [ ] Revisar el README contra el enunciado.
- [ ] Commit y push (los hace el humano).
- [ ] PR final a `main` con merge commit y autorrevisión.

## STOP-7 (solo JavaScript, sin recompilar)
Anderson, 2026-11-16: «el resto estuvo 100 % OK en dispositivo»; ajustó el estilo del selector en inicio de sesión (más pequeño y opaco) después de la prueba, así que esa verificación visual sigue pendiente. Casillas marcadas según lo que reportó; el detalle por casilla no se registró.
- [x] Cambiar el idioma en bienvenida e inicio de sesión sin perder lo escrito (reportado OK por Anderson).
- [x] Cambiar el idioma a mitad del registro de conductor: campos y progreso se conservan (reportado OK por Anderson).
- [x] El inglés muestra «Reject» e «I've arrived» (reportado OK por Anderson).
- [x] Fuente al 200 % con el control visible (reportado OK por Anderson).
- [x] `npm test` (reportado OK por Anderson; cifra actual: 358 pruebas, 357 pasan, 0 fallan, 1 omitida).
- [ ] Verificación visual del selector en inicio de sesión tras el ajuste de tamaño y opacidad (pendiente).
