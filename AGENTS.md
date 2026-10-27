# UberClone — Versión Conductor

App móvil del conductor (React Native + Expo, development build, iOS y Android) con backend Node/Express y Firestore (propuesta). Taller "Taller: Uber - clone". Equipo de una persona: Anderson Londoño Avendaño decide todo.
Metodología: Spec-Driven Development (SDD). Documentación en español; código e identificadores en inglés.
Precedencia: F1 / ENCARGO > `docs/constitution.md` > `docs/decisiones.md` > spec y diseño > plan > tarea.

## Fases (cada puerta la aprueba Anderson)
| Fase | Qué | Puerta |
|---|---|---|
| 0 | Contexto: herramientas, PRODUCT.md, aprobar requisitos, decisiones y constitución, resolver P-01…P-12 | Anderson aprueba |
| 1 | Especificar (`spec-author`): `specs/NNN-nombre/spec.md` | spec "Aprobada" |
| 2 | Planificar (`planner`): `plan.md` y tareas T-NN | plan revisado |
| 3 | Implementar (`implementer`): una tarea a la vez | tarea "Implementada" |
| 4 | Verificar (`verifier` + `design-auditor`) | "Validada" + Diseño "Aprobado"/"N/A" |
| 5 | Entrega: README, bitácora, video | Anderson |

## Agentes
| Agente | Lee | Escribe | Aprueba |
|---|---|---|---|
| spec-author | constitución, requisitos, decisiones, diseño | specs, requisitos, PRODUCT/DESIGN, propuestas | nada (ni lo propio) |
| planner | spec aprobada, backlog, progress | plan.md, backlog, columna Tareas | nada |
| implementer | tarea, spec, plan, DESIGN | código de UNA tarea, Estado "Implementada" | nada |
| verifier | todo | Estado "Validada/Rechazada", progress | solo lo funcional, nunca lo que construyó |
| design-auditor | DESIGN, rúbrica, capturas | informes de ronda, campo Diseño | solo lo visual |

## Comandos
```
node scripts/check-constitution.mjs
node scripts/check-constitution.mjs --selftest
node scripts/visual-audit.mjs --selftest
npx expo-doctor
```

## Reglas rápidas
- Una tarea a la vez. Ninguna tarea sin requisito ni requisito sin tarea.
- El agente principal carga las skills de diseño con la herramienta Skill y se las pasa al subagente.
- Estado "No verificado en dispositivo" para todo lo que solo se ve en el celular.
- Los builds nativos (`expo run:*`, `prebuild`, `eas`) los hace el humano.
- Secretos solo en el backend (`backend/.env`).
- La bitácora de IA (`docs/AI_LOG.md`) la registra el humano, en el momento.

## Modo ahorro (desactivado por defecto, D-20)
Una sola auditoría de diseño final con máximo dos rondas.

## Prompts del ciclo
- **P1 Una tarea.** Lee en orden constitución, tarea, spec, plan. Confirma dependencias y marca "En curso". Invoca al `implementer`. Verifica con scripts temporales fuera del proyecto contra la fuente real. Ejecuta `check-constitution` y reporta antes y después. Invoca al `verifier` (distinto). Si hay rechazo, detente. Espera: "Pega aquí el resultado de la prueba en el celular: <resultado>". Cierra con: no hagas commit ni empieces la siguiente; dame un resumen.
- **P2 Varias tareas.** Solo de bajo riesgo, sin dependencia entre ellas, cada una con su validación; se detiene en la primera rechazada.
- **P3 Tarea visual.** Igual que P1, más: el agente principal carga las skills de diseño, autocontrol con el arnés cuando aplique, `Diseño: Pendiente` hasta la auditoría.
- **P4 Auditoría de diseño.** Invoca al `design-auditor` con las skills cargadas; los hallazgos van al `implementer` (máximo dos rondas antes de escalar); el `verifier` valida solo con `Diseño: Aprobado`.
- **P5 Cambio de especificación.** `spec-author` → `planner` → `implementer` → `verifier`, y se regenera la matriz.
- **Regla de bitácora (todo prompt).** Todo prompt de Anderson a Claude Code termina con una entrada de bitácora en borrador en `docs/AI_LOG.md` que copia el prompt textual; Anderson completa «Verificación» y «Aprendizaje». Solo se registran los prompts dados a Claude Code. Las entradas reconstruidas se marcan «RECONSTRUIDA, no registrada en el momento».
- **P6 Cierre de entrega.** README, capturas con pie honesto, prueba de clon limpio, lista exacta de archivos y pasos manuales (commit, push, PDF de la bitácora, video).

---

# Reglas Expo heredadas (AGENTS.md original, conservado)

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present). (Este proyecto usa npm; `settings.json` deniega bun/yarn/pnpm.)

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md
- Nota SDD: el árbol de `src/` y si se usa Expo Router lo decide el planner (D-11, D-22); el proyecto es JavaScript (D-16 propuesta), por lo que `tsc` aplica solo si se aprueba TypeScript.

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`). Docs: https://docs.expo.dev/eas/index.md
(En este proyecto `eas` está en `deny`: lo ejecuta el humano.)

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
