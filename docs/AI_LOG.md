# Bitácora de uso de IA

**Regla de honestidad (F1 §8):** esta bitácora debe reflejar el uso real de IA, incluido el que no salió bien. Se entrega aunque no se haya usado IA. La registra el humano (Anderson), en el momento.

## Reglas
- Registrar en el momento, no al final.
- Prompt textual, sin resumir.
- Resumen de la respuesta en 2–3 líneas.
- Qué se usó, qué se modificó y qué se descartó.
- Archivos afectados y hash de commit.
- Cómo se verificó.
- Aprendizaje.
- Marca en el código: `// AI-assisted: see docs/AI_LOG.md #N`.
- Nunca pegar llaves de API, `access_token` ni datos personales reales en un prompt (ENT-05).

## Plantilla (F1 §8)
```
### Entrada #N
- Fecha:
- Herramienta / modelo:
- Prompt textual:
- Resumen de la respuesta (2–3 líneas):
- Usado / modificado / descartado:
- Archivos y commit:
- Verificación:
- Aprendizaje:
```

---

### Entrada #1
- Fecha: 2026-10-27
- Herramienta / modelo: Claude Code (Sonnet 5.5)
- Prompt textual: (pendiente: lo pega Anderson)
- Resumen de la respuesta (2–3 líneas): Montaje de la metodología SDD: estructura de carpetas, cinco agentes, constitución, requisitos, decisiones, scripts de verificación y capa de diseño en esqueleto. No se implementó la app.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: ver resumen de la sesión; sin commit todavía (pendiente: hash)
- Verificación: `node scripts/check-constitution.mjs --selftest` y `node scripts/visual-audit.mjs --selftest`.
- Aprendizaje: (pendiente: Anderson)
