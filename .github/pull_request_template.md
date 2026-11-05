<!-- AI-assisted: see docs/AI_LOG.md #35 -->
<!--
Equipo de una persona (D-23): no hay nadie más para revisar este PR, así que la revisión es una
autorrevisión con esta lista de verificación. Márcala completa (todas las casillas en [x]) antes de
fusionar. Si alguna casilla queda sin marcar, explica por qué debajo de ella.
-->

## Qué cambia y por qué

<!-- 2-3 líneas: qué tarea(s) T-NN o decisión cubre este PR, y la razón del cambio. -->

## Lista de verificación (autorrevisión, D-23)

- [ ] El diff no contiene secretos: ninguna clave, token o valor real de `.env` (solo nombres de variables, nunca valores).
- [ ] El código nuevo o modificado con aporte de IA tiene su marca `// AI-assisted: see docs/AI_LOG.md #N`, trazable a una entrada real de la bitácora.
- [ ] `docs/AI_LOG.md` está al día: cada prompt dado a Claude Code en este PR tiene su entrada, con «Verificación» completa (y «Aprendizaje» de Anderson si ya corresponde).
- [ ] `node scripts/check-constitution.mjs` no muestra errores nuevos frente a la línea base conocida (si la línea base cambió, el número y la causa están explicados aquí).
- [ ] Probado en el celular (development build): el flujo afectado se ejecutó en el dispositivo, no solo revisado en código. Si algo sigue "No verificado en dispositivo", se deja así explícito en `docs/progress.md`.

## Evidencia

<!-- Capturas, resultado del check-constitution, o referencia a la entrada de AI_LOG.md correspondiente. -->
