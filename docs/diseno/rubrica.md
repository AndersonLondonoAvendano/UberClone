# Rúbrica de diseño

Borrador — la rúbrica oficial del taller no fue encontrada (D-17, P-04); esto es la rúbrica interna de trabajo.

## Capas (una que falla corta la evaluación)
| Capa | Qué | Quién |
|---|---|---|
| A | Automática: `check-constitution` y arnés `visual-audit` | script |
| B | Crítica de Taste sobre capturas | design-auditor |
| C | `audit` y `critique` de Impeccable | design-auditor |
| D | Checklist de UI UX Pro Max | design-auditor |
| E | Aprobación en el celular real (capturas de Anderson en `docs/diseno/auditorias/capturas/`) | Anderson |

## Criterios
- Taste con jurado: diseño 40 %, usabilidad 30 %, creatividad 20 %, contenido 10 %; umbral 7.5.
- Impeccable ≥ 16/20 sin P0 ni P1.
- Máximo 3 rondas por pantalla; en la tercera se escala a Anderson sin redondear la nota.

## Límite del arnés
`scripts/visual-audit.mjs` usa Chromium con Playwright y **no renderiza módulos nativos**: mapas, Firebase, geolocalización ni pagos. Eso solo se juzga en la capa E. Una captura del arnés nunca se presenta como captura del celular.
