# Checklist de entrega final

<!-- AI-assisted: see docs/AI_LOG.md #68 (D6) -->

Casillas de lo que **solo Anderson** puede hacer. Ningún agente hace commit, push, builds nativos ni toca servicios con datos reales.

Referencias: [plan de cierre](plan-cierre-entrega-2026-11-16.md) · [progress](progress.md) · [backlog](backlog.md) · [omisiones y límites](omisiones-y-limites.md) · [evidencia de pagos](pagos-evidencia.md) · [auditoría de la bitácora](auditoria-bitacora-2026-11-16.md) · [guion del video](guion-video.md).

## Lotes (estado exacto en progress.md)
- L1: OSRM real, Ganancias sin tope, `npm test`.
- L2: estados rechazado y conductor llegando, campos aditivos, saldo. Validado en dispositivo (STOP-5).
- L3: idioma es/en ([spec](../specs/006-idioma/spec.md)). Validado en dispositivo (STOP-6).
- L3b: selector de idioma sin sesión ([adenda](../specs/006-idioma/adenda-l3b.md)). **Pendiente de dispositivo (STOP-7).**
- L4: pagos, documental ([evidencia](pagos-evidencia.md)).
- L7 (parte de proceso): auditoría de la bitácora, README, guion y este checklist.

## Bitácora
- [ ] Completar «Verificación» y «Aprendizaje» de las entradas vacías o «pendiente» (tabla en la auditoría).
- [ ] Completar los hashes de commit (tabla objetiva en la auditoría).
- [ ] Decidir si se registra una entrada «RECONSTRUIDA, no registrada en el momento» para la normalización de placa (T-174, antiguo marcador #62).
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
- [ ] Cambiar el idioma en bienvenida e inicio de sesión sin perder lo escrito.
- [ ] Cambiar el idioma a mitad del registro de conductor: campos y progreso se conservan.
- [ ] El inglés muestra «Reject» e «I've arrived».
- [ ] Fuente al 200 % con el control visible.
- [ ] `npm test`.
