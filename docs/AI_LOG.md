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

## Orden real de las entradas
Todas son del 2026-10-27, así que el orden por fecha no las distingue. Orden real: la #1 se registró en la sesión de arranque; la #2 se registró en el momento (es el prompt de cierre de T-02, pedido antes de reconstruir); las #3 a #11 son RECONSTRUIDAS después y se numeraron en el orden cronológico real en que Anderson envió esos prompts; la #12 en adelante se registran en el momento. Por eso la #2 aparece antes que las reconstruidas aunque su prompt es posterior a ellas.

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
- Archivos y commit: ver resumen de la sesión; commit: 407d196 (parcial — cubre los documentos y specs creados en el arranque de esta entrada; `.claude/agents/*.md`, creados en una sesión posterior de este mismo hilo, no aparecen en el diff de ningún commit: por confirmar).
- Verificación: `node scripts/check-constitution.mjs --selftest` y `node scripts/visual-audit.mjs --selftest`.
- Aprendizaje: (pendiente: Anderson)


### Entrada #2
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Cerrar T-02, reconstruir la bitácora y ejecutar T-03.
- Prompt textual:
````
Cierre de T-02, bitácora de IA y autorización de T-03.

Alcance de la bitácora: solo se registran los prompts que yo te doy a ti (Claude Code). No se registran mis conversaciones en otros chats.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre): fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar T-02, reconstruir la bitácora y ejecutar T-03", y el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

A. Reconstrucción de la bitácora (documental)
1. Con los mensajes míos que conservas, lista en orden cada prompt que te envié con trabajo real (no las aprobaciones de una línea). Si tu contexto fue compactado y no conservas el texto exacto de alguno, dilo y no lo inventes: déjalo como "texto no conservado, Anderson debe pegarlo".
2. Para cada uno crea una entrada en docs/AI_LOG.md con la plantilla de F1 §8: siguiente número libre, fecha, integrante, herramienta Claude Code y el modelo que veas, objetivo, prompt textual completo, resumen en 2 o 3 líneas, qué se usó, modificó o descartó (solo lo que conste), archivos afectados con "commit: ninguno aún", verificación (la que conste en docs/progress.md; si no hubo, "sin verificar") y aprendizaje en blanco.
3. Márcalas "RECONSTRUIDA el 2026-10-27, no registrada en el momento".

B. Regla hacia adelante
4. Añade a AGENTS.md, en "Prompts del ciclo": todo prompt mío a Claude Code termina con una entrada de bitácora en borrador que copia el prompt textual; yo completo "Verificación" y "Aprendizaje".
5. Revisa App.js y los archivos de src/ creados con IA en T-01 y T-02 y dime cuáles no llevan "// AI-assisted: see docs/AI_LOG.md #N". Propón el diff y NO lo apliques hasta que yo lo apruebe.

C. Resultado de mi prueba en el celular para T-02
Recompilé con `npx expo prebuild --platform android` y `npx expo run:android`, y abrí la app con `npx expo start --dev-client`. Con el celular Android conectado: la app abre sin pantalla roja; el fondo ahora es claro y "UberClone Conductor / Plataforma: android" se lee en negro; aparece el botón "Tools" del dev client; el reloj y los iconos de la barra de estado se ven claros sobre el fondo claro y casi no se leen. <Ajusta esto si viste algo distinto>
6. Invoca al verifier para actualizar docs/progress.md: confirma en dispositivo solo los CA que esa descripción cubre y deja el resto como estaba. El campo Diseño de T-02 sigue Pendiente hasta T-12.

D. Decisiones (cada una "aprobada por Anderson, registrada por el agente principal"; siguiente número libre de D-xx, Vigentes)
7. El hex #E6F4FE del adaptiveIcon de app.json es una excepción nombrada hasta la tarea del icono real.
8. tabular-nums va como token type.numeric en src/theme/tokens.js.
9. Invoca al planner para: (a) añadir type.numeric al contrato del plan y asignarlo a una tarea; (b) asignar a una tarea visual el estilo de la barra de estado con expo-status-bar (hallazgo: texto claro ilegible sobre fondo claro; no es dependencia nueva); (c) añadir en las tareas T-05 a T-10 los textos de labels.js que cada una necesita. No toques tokens.js tú: lo hace una tarea.
10. Anota en docs/backlog.md, como idea sin implementar, una regla de check-constitution sobre hex en app.json.

E. Antes de T-03: ampliar C15
11. En scripts/check-constitution.mjs, haz que C15 lea backend/package.json contra la lista "backend" de scripts/dependencies.json, con casos en el selftest (dependencia permitida pasa, no listada da ERROR). Ejecuta --selftest y adjunta la salida. Si falla, detente y no empieces T-03.

F. T-03
12. Autorizo T-03 (backend Express mínimo con GET /health). Ejecuta el prompt P1 de AGENTS.md. Comprueba si backend/package.json y express ya existen; si hace falta instalar, D-30 permite express solo en backend/, y debes pedirme aprobación del comando. El backend debe arrancar sin .env. No leas ni escribas .env.
13. Dame los comandos exactos de PowerShell para arrancar el backend y comprobar GET /health, y qué respuesta debo ver. Los criterios que dependan de que yo lo ejecute quedan "No verificado" hasta que pegue el resultado.

Cierra completando la entrada de bitácora de este prompt. No hagas commit ni empieces T-04. Resumen corto: entradas creadas y cuáles quedaron con texto no conservado, decisiones registradas, resultado del verifier de T-03 y los comandos de verificación.
````
- Resumen de la respuesta (2–3 líneas): Se registraron las aprobaciones (D-35 excepción del hex del adaptiveIcon, D-36 token `type.numeric`), la regla de bitácora en AGENTS.md y las entradas #3 a #11 reconstruidas. T-02 quedó validada con evidencia de dispositivo; el planner añadió T-14 (`type.numeric`), la barra de estado en T-10 y los textos de `labels.js` en T-06 a T-09. C15 ahora lee `backend/package.json` y T-03 (backend Express con `/health`) quedó implementada y validada por el verifier.
- Usado / modificado / descartado: Usado: el resultado de la prueba de Anderson (texto y captura), el verifier y el planner. Descartado/ajustado: un fork encargado de escribir la bitácora fue cortado por un clasificador de seguridad antes de escribir nada, así que las entradas las escribió el agente principal directamente. Una comprobación de `.env` por parte del agente principal fue bloqueada por una regla de denegación y no se repitió. Pendiente sin aplicar: marcas `// AI-assisted` en `App.js` (#8) y en `tokens.js`/`labels.js` (#11), a la espera de aprobación de Anderson. Los archivos de T-03 llevan la marca con #2.
- Archivos y commit: docs/AI_LOG.md, AGENTS.md, docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/requisitos.md, specs/000-fundacion/plan.md, scripts/check-constitution.mjs, backend/package.json, backend/package-lock.json, backend/src/app.js, backend/src/server.js; commit: 407d196 (los documentos) y 4509788 (`backend/*`).
- Verificación: `node scripts/check-constitution.mjs --selftest`: todo pasa, incluido el caso nuevo de C15 en `backend/package.json` (`express` pasa, `left-pad` da ERROR). `check-constitution`: 44 errores (C21 de specs 001 a 009 sin tareas) y 11 advertencias C23, sin errores nuevos. T-03: script temporal del implementer y script propio del verifier (GET /health 200, 404 en otras rutas, segundo arranque en el mismo puerto sale con código 1, sin sockets abiertos al final), `npm audit` del backend en 0; CA-000-06 y CA-000-07 ✅ (automatizables). T-02 con evidencia de dispositivo Android (captura y mensaje de Anderson). Sin prueba manual de Anderson del backend en PowerShell todavía.
- Aprendizaje:

### Entrada #3
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Comprobar los 5 agentes, cargar las skills de diseño, registrar aprobaciones y proponer direcciones de arte.
- Prompt textual:
````
Reinicié la sesión. Primero comprueba que los 5 agentes de .claude/agents/ aparezcan registrados (por ejemplo con /agents) y dime cuáles faltan.

1. Como agente principal, carga con la herramienta Skill: design-taste-frontend (taste-skill), impeccable y ui-ux-pro-max. Dime cuáles cargaron. Si alguna falta, detente.
2. Aprobación explícita mía (Anderson): la parte funcional de specs/000-fundacion/spec.md queda Aprobada, incluyendo D-11 y el criterio de RNF-11. Regístralo en docs/progress.md y en la bitácora como "aprobado por Anderson, registrado por el agente principal". NO apruebes los criterios CA-000-D1 a D3, ni DESIGN.md, ni D-25 a D-27.
3. P-05: mi celular es <Android o iOS, modelo>. Regístralo.
4. Con Taste, propón 3 direcciones de arte distintas para esta app (nombre, idea en una frase, paleta, tipografía sin fuentes personalizadas, qué evita) y detente. No toques DESIGN.md hasta que yo elija. Calcula el contraste WCAG real de cada paleta con un script temporal fuera del proyecto.

No hagas commit. Cierra con un resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se comprobó que los 5 agentes existen en `.claude/agents/`. Las tres skills no cargaron con la herramienta Skill («Unknown skill») y, como el prompt pedía, se detuvo en el paso 1 sin hacer los pasos 2 a 4. Los marcadores `<Android o iOS, modelo>` quedaron sin rellenar.
- Usado / modificado / descartado: Usado: la verificación de agentes. Descartado en esa respuesta: los pasos 2 a 4 (por la regla «si alguna falta, detente»). Sin cambios de archivos.
- Archivos y commit: ninguno modificado; sin commit (no aplica).
- Verificación: Glob de `.claude/agents/*` (5 archivos) y las llamadas a Skill que devolvieron «Unknown skill». Sin otra verificación.
- Aprendizaje:

### Entrada #4
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Consultar los SKILL.md de los plugins de diseño y proponer tres direcciones de arte con contraste WCAG.
- Prompt textual:
````
Sesión nueva. Como agente principal, intenta cargar con la herramienta Skill las skills de diseño de los plugins impeccable, taste-skill y ui-ux-pro-max (los nombres exactos son: <PEGA AQUÍ los nombres que viste con "/">). Dime cuáles cargaron.

Si alguna no carga, NO te detengas: localiza el SKILL.md de ese plugin dentro de la carpeta de plugins de Claude Code (en Windows, bajo %USERPROFILE%\.claude\plugins), léelo con Read y úsalo como guía de referencia. Dime cuáles usaste así, porque no es lo mismo que cargarlas.

Luego, con Taste, propón 3 direcciones de arte distintas para esta app (nombre, idea en una frase, paleta, tipografía sin fuentes personalizadas, qué evita) y detente. No toques DESIGN.md hasta que yo elija. Calcula el contraste WCAG real de cada paleta con un script temporal fuera del proyecto.

No hagas commit. Cierra con un resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Las tres skills no cargaron con Skill; se leyeron sus `SKILL.md` del caché de plugins como referencia (no equivale a cargarlas). Se propusieron tres direcciones (A Tablero, B Carretera, C Noche) con paleta y contraste WCAG calculado con un script temporal. `draw.mjs` de Taste no se ejecutó.
- Usado / modificado / descartado: Usado: reglas de `references/app-screens.md` de Taste, el modo «Operate» de Impeccable y las prioridades de UI UX Pro Max. Descartado: ejecutar `draw.mjs` (es de escritorio y sin tipo de movilidad). Sin tocar DESIGN.md. Las direcciones las redactó el agente principal.
- Archivos y commit: ninguno del proyecto (script `contrast.mjs` en el directorio temporal de la sesión); sin commit (no aplica).
- Verificación: contrastes calculados con `contrast.mjs` (A: textos ≥ 4.5:1 y componentes ≥ 3:1 tras ajustar el borde; B: el primario amarillo falla 3:1 como límite de componente; C: todo pasa). Sin otra verificación.
- Aprendizaje:

### Entrada #5
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Fijar la dirección A «Tablero» y reescribir DESIGN.md y documentos de diseño.
- Prompt textual:
````
Elijo la dirección A (Tablero).

1. Registra en docs/decisiones.md que las skills de diseño (taste-skill, impeccable, ui-ux-pro-max) se consultaron leyendo su SKILL.md y no con la herramienta Skill, y que draw.mjs no se ejecutó. D-25 se actualiza a la dirección A; sigue en Propuesta hasta que yo la apruebe.
2. Invoca al spec-author para:
   - reescribir DESIGN.md con la dirección A (tokens de color con los contrastes ya calculados, tipografía del sistema con cifras tabulares, espaciado, radios, touch 44 px, movimiento, contrato de testID);
   - escribir docs/diseno/direccion.md (idea en una frase y lista de lo prohibido);
   - dejar docs/diseno/referencias.md con lo que se tomó de las reglas de Taste y qué se descartó;
   - ajustar PRODUCT.md si la dirección lo cambia.
3. Actualiza los criterios CA-000-D1 a D3 de la spec 000 con los tokens finales.
4. Avisa si algo choca con la constitución o con una dependencia permitida.

Estado: todo en Borrador. No apruebes nada tú. No hagas commit. Cierra con un resumen corto y la lista de lo que debo aprobar.
````
- Resumen de la respuesta (2–3 líneas): Se actualizó D-25 (dirección A) y se creó D-28 (skills consultadas por SKILL.md), ambas en Propuesta. El spec-author reescribió DESIGN.md, `docs/diseno/direccion.md` y `docs/diseno/referencias.md`, ajustó PRODUCT.md y CA-000-D1 a D3, y reportó choques de dependencias (navegación, reanimated, íconos, i18n).
- Usado / modificado / descartado: Modificado: DESIGN.md, direccion.md, referencias.md, PRODUCT.md, spec 000 (solo D1 a D3) y decisiones.md. Todo en Borrador/Propuesta.
- Archivos y commit: DESIGN.md, PRODUCT.md, docs/decisiones.md, docs/diseno/direccion.md, docs/diseno/referencias.md, specs/000-fundacion/spec.md; commit: 407d196.
- Verificación: Sin verificación funcional (documentos). Los contrastes de DESIGN.md se verificaron en el prompt siguiente con un script temporal (14 de 14 pares coinciden).
- Aprendizaje:

### Entrada #6
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Aprobar la dirección A y las decisiones, verificar contrastes, fijar dependencias (D-29) y pedir el plan de 000-fundacion.
- Prompt textual:
````
Apruebo, con estas decisiones explícitas (registra cada una como "aprobada por Anderson, registrada por el agente principal"):

1. Pasan a Vigente: D-25 (dirección A y tokens), D-26 (solo tema claro), D-27 (estado con useContext), D-28 (skills consultadas por SKILL.md).
2. Se aprueban DESIGN.md, docs/diseno/direccion.md, docs/diseno/referencias.md, el contrato de testID y los criterios CA-000-D1 a D3. Spec 000-fundacion queda Aprobada entera en docs/progress.md.
3. Dependencias (nueva decisión D-29, Vigente):
   - Navegación: se permiten @react-navigation/native, native-stack, bottom-tabs y drawer y sus dependencias obligatorias (incluidas react-native-reanimated y react-native-gesture-handler solo si el Drawer las exige según la documentación vigente). El plan fija la lista exacta y se instala con `npx expo install`. No añadas nada a scripts/dependencies.json hasta que el plan la confirme.
   - Íconos: @expo/vector-icons solo si ya está en package.json; si no, texto y formas de View.
   - i18n: sin expo-localization ni librerías; diccionario propio ES/EN con contexto (actualiza D-15).
4. Actualiza la frase de la constitución §11 que dice "se llena en Fase 0/1".

Antes de nada, comprueba con un script temporal fuera del proyecto que los valores de contraste de DESIGN.md coinciden con el cálculo real. Si algo no coincide, detente y dímelo.

Luego invoca al planner sobre specs/000-fundacion: plan.md y tareas en docs/backlog.md, con T-01 primera (primera pantalla corriendo en mi celular físico con development build). T-01 puede tener la excepción de instalar dependencias, nombrada en la tarea. Verifica en la documentación vigente de Expo el SDK actual frente al 57 del scaffold y registra la conclusión como V-02; no cambies de SDK sin decisión mía.

Detente cuando el plan esté escrito. No hagas commit. Resumen corto con lo que debo aprobar.
````
- Resumen de la respuesta (2–3 líneas): Los 14 pares de contraste de DESIGN.md coincidieron con el cálculo real. Se pasaron a Vigente D-25 a D-28, se creó D-29, se marcaron aprobados los documentos de diseño y la spec 000, y se actualizó la constitución §11. El planner escribió `plan.md` y 13 tareas (T-01 a T-13); V-02 quedó con el SDK 58 como estable actual y el SDK 57 del scaffold como versión anterior.
- Usado / modificado / descartado: Modificado: decisiones.md, constitution.md, DESIGN.md, direccion.md, referencias.md, spec 000 (Estado), progress.md, plan.md, backlog.md, requisitos.md. No se tocó `scripts/dependencies.json` (se hizo en el prompt siguiente). D-11 quedó Propuesta (no estaba en la lista de este prompt).
- Archivos y commit: docs/decisiones.md, docs/constitution.md, DESIGN.md, docs/diseno/direccion.md, docs/diseno/referencias.md, specs/000-fundacion/spec.md, specs/000-fundacion/plan.md, docs/backlog.md, docs/requisitos.md, docs/progress.md; commit: 407d196.
- Verificación: script temporal `verify-design.mjs` (14/14 pares de contraste coinciden; las 5 líneas «TOKEN FALTANTE» fueron falsos positivos de su lectura de la tabla de tipografía); `check-constitution`: 0 errores y 0 advertencias en fase 0. V-02 verificado contra docs.expo.dev. Sin otra verificación.
- Aprendizaje:

### Entrada #7
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Aprobar el plan de 000-fundacion y registrar SDK 57, P-05, D-11, D-30, D-31 y las dependencias.
- Prompt textual:
````
Decisiones sobre el plan de 000-fundacion (cada una "aprobada por Anderson, registrada por el agente principal"):

- Plan aprobado. Spec 000 pasa a Planificada en docs/progress.md.
- SDK 57 Vigente (resuelve V-02 en la parte del SDK; la compatibilidad de Firebase, mapas y geolocalización sigue pendiente).
- P-05: mi celular es Android. iOS queda "No verificado en dispositivo". Regístralo en docs/backlog.md F0-6.
- D-11 y el criterio derivado de RNF-11 pasan a Vigente.
- Crea D-30 (Vigente) ampliando D-29: se permiten react-native-screens, react-native-safe-area-context y react-native-worklets, y express solo en backend/.
- Actualiza scripts/dependencies.json: pasa a "allowed" los cuatro @react-navigation/*, react-native-screens, react-native-safe-area-context, react-native-gesture-handler, react-native-reanimated y react-native-worklets, más expo-dev-client. Añade una lista aparte para backend/ con express. Ejecuta check-constitution y dime si cambia algo.
- Identificador de app: com.andersonlondono.uberclone para Android e iOS. Regístralo como decisión Vigente.
- Los paneles provisionales (DevAccountSwitch y el selector de estados forzados) se retiran antes de la entrega: añade la tarea de retirarlos a las specs 001 y 008, y anótalo en docs/backlog.md.

No autorices ninguna tarea todavía. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se registró el plan como aprobado y la spec 000 como Planificada. Se crearon D-30 (amplía D-29), D-31 (identificador de la app) y D-32 (SDK 57), D-11 pasó a Vigente y P-05 quedó como Android. `scripts/dependencies.json` pasó las dependencias a `allowed` y ganó la lista `backend` con `express`; la obligación de retirar los paneles provisionales quedó anotada en el backlog (las specs 001 y 008 aún no existen).
- Usado / modificado / descartado: Modificado: decisiones.md, scripts/dependencies.json, docs/backlog.md, specs/000-fundacion/plan.md, docs/progress.md. Descartado: nada.
- Archivos y commit: docs/decisiones.md, scripts/dependencies.json, docs/backlog.md, specs/000-fundacion/plan.md, docs/progress.md; commit: 407d196.
- Verificación: `check-constitution` antes y después: 0 errores y 0 advertencias (C15 inactiva hasta fase 3). Sin otra verificación.
- Aprendizaje:

### Entrada #8
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Autorizar T-01 (primera pantalla en el celular Android con development build) y pasar a la Fase 3.
- Prompt textual:
````
Autorizo T-01. Antes de empezar:
- En docs/progress.md pon "Fase actual: 3" y regístralo en la bitácora como "aprobado por Anderson, registrado por el agente principal".
- Camino de build en Android: <ESCRIBE: local con Android Studio | EAS en la nube>. Registra la elección como decisión Vigente.
- Anota en docs/backlog.md un pendiente para antes de T-03: ampliar C15 para que lea backend/package.json contra la lista "backend" de scripts/dependencies.json, con su caso de prueba en el selftest.

Luego ejecuta el prompt P1 de AGENTS.md para T-01 (primera pantalla corriendo en mi celular Android con development build).

Aclaraciones:
- T-01 es la única con excepción para instalar dependencias. Pídeme aprobación en cada comando; usa npx expo install.
- Para el build, dame los pasos exactos para mi celular Android en Windows y para el camino elegido, indicando qué debo instalar o activar. NO ejecutes expo run, prebuild ni eas: los hago yo.
- Si la documentación del plugin de Babel de reanimated en SDK 57 contradice el plan, detente y dímelo.
- El resultado de mi prueba en el celular lo pegaré yo después. Hasta entonces los criterios de dispositivo quedan "No verificado en dispositivo".

No hagas commit ni empieces la siguiente tarea. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Fase 3 en progress.md y pendiente de C15 anotado. El marcador del camino de build quedó sin rellenar; se le preguntó a Anderson y eligió «Local con Android Studio» (D-33). El implementer instaló diez dependencias con `npx expo install` (SDK 57), ajustó `app.json`, `package.json` y `App.js` (primera pantalla `screen-first`), y el verifier validó T-01 en lo estático.
- Usado / modificado / descartado: Usado: la documentación vigente de Expo (sin `babel.config.js`, el plugin de reanimated se configura solo en `babel-preset-expo`). Modificado: package.json, package-lock.json, app.json, App.js, docs/backlog.md, docs/progress.md, docs/decisiones.md. Sin pasos de `expo run`/`prebuild`/`eas` por parte de la IA.
- Archivos y commit: package.json, package-lock.json, app.json, App.js, docs/backlog.md, docs/progress.md, docs/decisiones.md; commit: 407d196 (docs) y 4509788 (package.json, package-lock.json, app.json, App.js).
- Verificación: `npx expo-doctor` 21/21; `npx expo export --platform android` (1034 módulos); `check-constitution` sin errores nuevos (44 C21 de specs sin tareas); CA-000-03 ✅. Los criterios de dispositivo quedaron «No verificado en dispositivo» hasta la prueba de Anderson (entrada siguiente).
- Aprendizaje:

### Entrada #9
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Registrar el resultado de la prueba de T-01 en el celular y proponer expo-system-ui.
- Prompt textual:
````
Pego el resultado de mi prueba en el celular para T-01:
- Celular Android conectado por USB, development build compilado en local (Gradle 9.3.1, JDK 21, SDK 57).
- La app abre y muestra "UberClone Conductor" y "Plataforma: android". Sin pantalla roja. Se ve el menú del dev client (exposdk:57.0.0) y el botón de ajustes.
- Observación: mi celular está en modo oscuro; el fondo de la app se ve gris oscuro y el texto negro casi no se lee, porque userInterfaceStyle no se aplica sin expo-system-ui.

Pasos:
1. Invoca al verifier (distinto del implementer) para actualizar docs/progress.md con este resultado. Marca como confirmados en dispositivo solo los CA de T-01 que mi descripción cubre; el resto queda como estaba. Si algún CA no queda cubierto, dilo.
2. Si todo lo de T-01 queda cubierto, pasa T-01 a Validada; si no, dime qué falta.
3. Propón como D-33 (Propuesta) permitir expo-system-ui, para que D-26 se cumpla también en lo nativo, con la instalación como excepción de T-02. No la apruebes tú.
4. Anota que ANDROID_HOME y JAVA_HOME ya funcionan en esta máquina (Windows 11, JDK 21 en C:\Program Files\OpenLogic\jdk-21.0.10.7-hotspot) y que ANDROID_SDK_ROOT debe quedar sin definir.

No empieces T-02. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): El verifier marcó CA-000-01 ✅ y dejó CA-000-02 parcial y CA-000-04 sin ✅ (la carga desde Metro no estaba dicha explícitamente). D-33 ya estaba usado (build local), así que la propuesta de `expo-system-ui` se registró como D-34 (Propuesta). El entorno de build (JDK 21, ANDROID_HOME, ANDROID_SDK_ROOT sin definir) quedó anotado en la fila P-06 del backlog.
- Usado / modificado / descartado: Modificado: docs/progress.md, docs/backlog.md, docs/decisiones.md. Descartado/ajustado: la numeración «D-33» pedida (ocupada) pasó a D-34. El verifier marcó además CA-000-05 ✅ por leer progress.md, lo cual se revirtió en el prompt siguiente.
- Archivos y commit: docs/progress.md, docs/backlog.md, docs/decisiones.md; commit: 407d196.
- Verificación: captura y mensaje de Anderson como evidencia de dispositivo (Android, modelo no indicado); sin otra verificación.
- Aprendizaje:

### Entrada #10
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Aprobar D-34, revertir CA-000-05 y cerrar la confirmación de CA-000-04.
- Prompt textual:
````
Decisiones:
- D-34 pasa a Vigente: se permite expo-system-ui, y su instalación es excepción de T-02. Añádelo a "allowed" en scripts/dependencies.json y ejecuta check-constitution.
- CA-000-05 vuelve a ⏳: marcarlo ✅ por leer progress.md no es evidencia. Revierte esa marca y regístralo en la bitácora.
- Anota en docs/backlog.md, como idea, una regla de check-constitution sobre userInterfaceStyle sin expo-system-ui; no la implementes.

Confirmación de dispositivo para CA-000-04: cerré el servidor del build, ejecuté `npx expo start --dev-client` y la app cargó desde ahí en mi celular. Probé además que un cambio de texto en App.js se reflejó sin recompilar (y lo revertí). <Quita esta frase si no lo probaste>

Invoca al verifier para actualizar CA-000-04 y el estado de T-01. No empieces T-02. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): D-34 pasó a Vigente, `expo-system-ui` quedó en `allowed` y la idea de regla se anotó en el backlog. El verifier marcó CA-000-04 ✅, devolvió CA-000-05 a ⏳ y dejó T-01 como «Validada, con evidencia de dispositivo Android para CA-000-01, 03, 04 y la primera pantalla de CA-000-02». La frase del cambio de texto en vivo quedó con la nota de plantilla sin resolver y no se usó como evidencia.
- Usado / modificado / descartado: Modificado: docs/decisiones.md, scripts/dependencies.json, docs/backlog.md, docs/progress.md. Descartado: usar la frase ambigua como evidencia.
- Archivos y commit: docs/decisiones.md, scripts/dependencies.json, docs/backlog.md, docs/progress.md; commit: 407d196.
- Verificación: `check-constitution`: 44 errores (C21 de specs sin tareas) y 13 advertencias, sin cambios nuevos; verificación de `App.js` sin texto residual; confirmación de Anderson para CA-000-04.
- Aprendizaje:

### Entrada #11
- RECONSTRUIDA el 2026-10-27, no registrada en el momento.
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Autorizar T-02 (tokens y textos centralizados) con la excepción de instalar expo-system-ui.
- Prompt textual:
````
Autorizo T-02 (tokens de src/theme y textos centralizados en src/constants/labels.js). Ejecuta el prompt P3 (tarea visual) de AGENTS.md.

Aclaraciones:
- T-02 tiene la excepción de instalar expo-system-ui (D-34 Vigente). Pídeme aprobación del comando; usa npx expo install. Pon "userInterfaceStyle": "light" en app.json si el plan lo indica, y verifica con la documentación vigente que no haga falta otro ajuste.
- Como agente principal, las skills de diseño no cargan con la herramienta Skill: lee el SKILL.md de Taste, Impeccable y UI UX Pro Max y pásale al implementer solo las reglas que aplican a esta tarea. Descarta las que choquen con DESIGN.md y dímelo.
- Los tokens salen de DESIGN.md (dirección A), sin colores nuevos y sin librerías de fuentes ni de íconos.
- Tras instalar, dime exactamente qué debo ejecutar para recompilar en mi celular (debo repetir `npx expo run:android`) y qué debo ver en pantalla para confirmar que el fondo y el texto ya son claros. NO ejecutes expo run, prebuild ni eas.
- Diseño: Pendiente hasta la auditoría (T-12). Los criterios de dispositivo quedan "No verificado en dispositivo" hasta que yo pegue el resultado.
- Lista las 13 advertencias de check-constitution y di cuáles son de T-02 y cuáles de specs futuras.

No hagas commit ni empieces T-03. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): El implementer creó `src/theme/tokens.js` y `src/constants/labels.js`, instaló `expo-system-ui` (~57.0.4) y ajustó `app.json` (plugin y `android.userInterfaceStyle`). El verifier validó T-02 solo en lo estático; se indicó que hacía falta `prebuild` y `run:android` para ver el efecto en el celular. Se descartó la regla de 48 dp de UI UX Pro Max porque DESIGN.md fija mínimo 44 px (controles de 48).
- Usado / modificado / descartado: Usado: reglas de las tres skills leídas por SKILL.md. Descartado: el mínimo de 48 dp de UI UX Pro Max (choca con DESIGN.md). Las 13 advertencias de `check-constitution` son todas C23 de criterios de specs futuras (CA-000-06 a 15 y D2/D3 sin fila en progress.md); ninguna es de T-02.
- Archivos y commit: src/theme/tokens.js, src/constants/labels.js, app.json, package.json, package-lock.json, docs/backlog.md, docs/progress.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: 31 comprobaciones de tokens contra DESIGN.md sin diferencias (implementer) y comparador independiente del verifier; 14/14 pares de contraste; `check-constitution` 44 errores C21 y 13 advertencias C23 (igual que la línea base); `npx expo-doctor` 21/21; `npx expo export --platform android` OK. La prueba en el celular se registra en el prompt siguiente (#2).
- Aprendizaje:

### Entrada #12
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Cerrar decisiones de T-03 y ejecutar T-04.
- Prompt textual:
````
Decisiones y T-04.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar decisiones de T-03 y ejecutar T-04", con el prompt completo copiado tal cual lo recibiste. Ordena las entradas reconstruidas por fecha o anota el orden real. Completa archivos y verificación al terminar.

Decisiones (cada una "aprobada por Anderson, registrada por el agente principal"):
1. Aplica las marcas "// AI-assisted: see docs/AI_LOG.md #N" ya propuestas en App.js (#8) y en tokens.js y labels.js (#11). Son solo comentarios en inglés.
2. npm install express en backend/ queda aprobado.
3. T-14 (type.numeric) y la barra de estado con expo-status-bar en T-10 quedan aprobados.
4. Las claves nuevas de labels.js que propuso el planner quedan aprobadas, salvo las que F1 §3 ya fije con otro literal. Comprueba cada una contra F1 y corrige las que difieran, incluida "Iniciar viaje".
5. Corrige el encabezado de specs/000-fundacion/plan.md: T-01, T-02 y T-03 están validadas.
6. Crea una decisión nueva (Vigente) que reemplace a D-28: las skills de diseño ya cargan con la herramienta Skill (impeccable:impeccable, taste-skill:design-taste-frontend, ui-ux-pro-max:ui-ux-pro-max). Desde T-05 y en toda tarea visual o auditoría, el agente principal las carga con Skill y pasa solo las reglas que aplican; si alguna no carga, lo dices. D-28 queda "Reemplazada por D-xx".
7. Borra backend/.gitkeep. Anota en docs/backlog.md, como idea sin implementar, un tiempo máximo para shutdown en backend/src/server.js.
8. Mi Ctrl+C en `npm start` cerró el servidor limpio. Pasa esa evidencia al verifier para el hallazgo de cierre; actualiza solo lo que ese resultado cubra.

T-04:
9. Autorizo T-04 (estado de cuenta con useContext). Ejecuta el prompt P1 de AGENTS.md. Sin dependencias nuevas. Los archivos que crees llevan la marca "// AI-assisted" con el número de la entrada de este prompt. Si algo exige una dependencia o contradice D-27, detente.
10. Dime cómo puedo comprobar T-04 sin pantalla (si no hay manera visible, di qué CA quedan solo con evidencia estática y cuáles esperan a T-06 y T-10).

Cierra completando la entrada de este prompt. No empieces T-05. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se aplicaron las marcas de IA en App.js (#8) y tokens.js/labels.js (#11), se aprobó `npm install express`, T-14 y la barra de estado en T-10, y se creó D-37 (las skills se cargan con Skill) que reemplaza a D-28. El planner corrigió literales de labels.js contra docs/requisitos.md y el encabezado del plan, se borró backend/.gitkeep y se registró la evidencia manual del Ctrl+C. T-04 (estado de cuenta con useContext) quedó implementada y validada por el verifier en lo estático y automatizado.
- Usado / modificado / descartado: Usado: el verifier y el planner, y tu evidencia manual del Ctrl+C (solo cubre SIGINT con Ctrl+C en Windows). Modificado: decisiones.md (D-28 Reemplazada, D-37), backlog.md, plan.md, progress.md, AI_LOG.md. Descartado/ajustado: mi primer intento de borrar backend/.gitkeep también lo quitó del índice de git y lo deshice (el borrado queda sin preparar). F1 original no está en el repositorio, así que los literales solo se contrastaron contra docs/requisitos.md; `home.startTrip` («Iniciar viaje») quedó marcado como provisional pendiente de que Anderson lo contraste con F1. El implementer de T-04 quitó una nota del Estado en backlog.md y el agente principal la restauró.
- Archivos y commit: App.js, src/theme/tokens.js, src/constants/labels.js (solo marca de IA), src/constants/accountStatus.js, src/context/AppStateContext.js, backend/.gitkeep (borrado), docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: T-04: 25 comprobaciones propias del verifier (lógica pura con temporizadores reales y falsos, y un mini-renderizador propio del hook, porque no hay renderer de React en node_modules; StrictMode simulado a mano); `check-constitution` igual que la línea base (44 errores C21 de specs sin tareas y 9 advertencias C23; C11, C17, C18, C27 limpios); `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` funciona (no valida T-04 porque nadie la importa aún). CA-000-08 ✅ para el alcance de T-04. CA-000-09, 13 y 14 quedan «No verificado en dispositivo» hasta T-07, T-09, T-10 y T-11.
- Aprendizaje:

### Entrada #13
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Autorizar y ejecutar T-05 (ScreenState).
- Prompt textual:
````
Autorizo T-05 (ScreenState).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Autorizar y ejecutar T-05 (ScreenState)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Antes de T-05, explica la diferencia en C23: dijiste 9 advertencias y el verifier de T-04 reporta 5. Dime cuál es la correcta, qué cambió y desde cuándo. No lo arregles sin decírmelo.

2. T-05 es visual. Ejecuta el prompt P3 de AGENTS.md. Según D-37, carga con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max, y pasa al implementer solo las reglas que aplican. Si alguna no carga, dilo.

3. Alcance: el componente ScreenState con los estados de la spec (loading, vacío, error con reintento, y los que defina el plan), usando solo tokens de src/theme/tokens.js y textos de src/constants/labels.js. Respeta el contrato de testID de DESIGN.md. Sin dependencias nuevas. Marca los archivos nuevos con "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt.

4. Para que yo lo vea en el celular: puedes montar un panel provisional en App.js que use useAppState() y muestre ScreenState con un selector de estado. Márcalo en docs/decisiones.md como provisional, con la tarea que lo retira. Si prefieres otra forma que no toque App.js, propónla antes de hacerla.

5. Dime qué debo ver exactamente en el celular y qué CA quedan "No verificado en dispositivo" hasta que lo confirme. Recuerda: puede haber estado de carga que no tenga btn-retry (hallazgo de T-04); el selector debe seguir visible desde loading.

6. El verifier debe ser distinto del implementer. No marques nada como Validada hasta que yo pruebe en el celular. No empieces T-06. No hagas commit. Resumen corto al cerrar.
````
- Resumen de la respuesta (2–3 líneas): Se explicó la variación de las advertencias C23 (cada verifier añade filas de criterios en progress.md: 19, 13, 11, 9, 5). Se cargaron con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max (D-37), se filtraron sus reglas contra DESIGN.md y se creó D-38 (panel provisional). El implementer creó `ScreenState` (loading, empty, error con `btn-retry`) y `DevStatePanel`, y montó el panel en `App.js`; el verifier la dejó verificada en lo estático, sin Validada.
- Usado / modificado / descartado: Usado: las tres skills de diseño cargadas con Skill (el script `impeccable context` no se ejecutó: descarga un binario; solo se leyó su referencia `craft-floor.md`), `app-screens.md` §11 de Taste y `pro-rules.md` de UI UX Pro Max. Descartado por chocar con DESIGN.md o las decisiones: 48 dp de UI UX Pro Max (DESIGN fija 44 y controles de 48), paridad de modo oscuro (D-26), caja punteada y «Retry» como texto de Taste, barras grises de carga (la spec fija indicador), y de Impeccable ir más allá de transform/opacidad, rechazar la fuente del sistema y elegir claro/oscuro por escena de uso. Modificado: decisiones.md (D-38), backlog.md, plan.md (DP-17, DP-20), progress.md, AI_LOG.md, App.js, labels.js. El implementer quitó de los comentarios las citas a D-38 por la regla C26. Un error propio del implementer (`space.2` en lugar de `space[2]`) lo detectó su test y se corrigió.
- Archivos y commit: src/components/ScreenState.js, src/components/DevStatePanel.js (provisional, lo retira T-10), App.js, src/constants/labels.js (`forceState`), docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: test propio del implementer y test propio del verifier (46 de 46 comprobaciones, con react-native simulado: no es el renderizador real); contrastes de los pares usados coinciden con DESIGN.md; `check-constitution` 44 errores C21 de specs sin tareas y 4 advertencias C23 (bajó de 5 al añadir la fila de CA-000-15), C11, C17, C18, C26 y C27 limpios; `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta (ahora valida el código nuevo). T-05 NO está Validada: CA-000-15, D1 y D3 siguen «No verificado en dispositivo» hasta la prueba de Anderson, y Diseño sigue Pendiente hasta T-12. Hallazgos menores del verifier: `PRESSED_OPACITY = 0.85` suelto (hueco de DESIGN.md; con 0.85 el contraste del botón pulsado baja a ~4.53:1), el mensaje de empty no dice qué hacer, el marco del empty es muy tenue (1.09:1), y `accessibilityLabel` de carga sin `accessible` (probar con TalkBack).
- Aprendizaje:

### Entrada #14
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Registrar la prueba de T-05 en el celular y ejecutar T-06.
- Prompt textual:
````
Resultado de la prueba de T-05 en el celular y autorización de T-06.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Registrar la prueba de T-05 en el celular y ejecutar T-06", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de T-05 en el celular Android (Anderson, 2026-10-27, con capturas de los tres estados):
   - Vacío: bloque blanco de esquinas redondeadas sobre fondo gris claro, título y mensaje, sin botón.
   - Error: título rojo, mensaje, botón teal «Reintentar» a todo el ancho.
   - Cargando: rueda centrada con título y mensaje.
   - El selector marca el estado activo con negrita y subrayado.
   - Anderson declara que hizo las demás pruebas indicadas (pulsado del botón, escala de texto máxima) y que todo cumplió lo esperado. No hay capturas ni detalle de eso: regístralo así, sin inventar nada. TalkBack no se probó.
   Con esto, T-05 pasa a «Validada, Diseño Pendiente hasta T-12», igual que T-02. Marca los CA que cubre esta evidencia y deja «No verificado en dispositivo» solo lo que siga sin cubrir (incluido TalkBack y CA-000-D2 parcial hasta T-10).

2. Decisiones (aprobadas por Anderson, registradas por el agente principal):
   a. Crea el token opacity.pressed en src/theme/tokens.js y documéntalo en DESIGN.md. Elige un valor que mantenga el contraste del botón pulsado en 4.5:1 o más con margen, y dime el contraste que resulta. ScreenState debe usar el token en lugar de PRESSED_OPACITY.
   b. El mensaje del estado vacío debe decir qué falta y qué hacer, como pide DESIGN.md. Se corrige dentro de T-06; no antes.
   c. Marco tenue del vacío y accessibilityLabel de carga: sin cambios; quedan anotados para T-12.

3. Autorizo T-06 (cabecera y pantalla marcador). Es visual: ejecuta P3 de AGENTS.md, carga con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max según D-37 y pasa al implementer solo las reglas que aplican; si alguna no carga, dilo. Solo tokens y labels.js, contrato de testID de DESIGN.md, sin dependencias nuevas, marca "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt. La barra de estado NO va en T-06 (es T-10).

4. Si T-06 necesita tocar App.js para que yo la vea, dilo antes y registra el panel provisional en docs/decisiones.md con la tarea que lo retira. Dime exactamente qué debo ver en el celular y qué CA quedan «No verificado en dispositivo».

5. El verifier debe ser distinto del implementer. No marques T-06 como Validada hasta que yo pruebe. No empieces T-07. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se registró la prueba de T-05 (capturas de los tres estados en Android; pulsado y escala de texto declarados por Anderson sin captura; TalkBack no probado) y T-05 quedó Validada con Diseño Pendiente. Se tomaron las decisiones D-39 (token `opacity.pressed` = 0.9, con contraste recalculado) y D-40 (mensaje del estado vacío). T-06 (ScreenHeader, PlaceholderScreen, ampliación del panel provisional, token y claves de labels) quedó implementada y verificada en lo estático, sin Validada hasta la prueba de Anderson.
- Usado / modificado / descartado: Usado: las tres skills de diseño (ya cargadas con Skill; al reinvocarlas la herramienta respondió «already loaded»), el spec-author (DESIGN.md), el planner (T-06 y plan) y el verifier. Modificado: decisiones.md (D-38 ampliada, D-39, D-40), DESIGN.md, plan.md, backlog.md, progress.md, AI_LOG.md, App.js (solo se quitó un `testID` duplicado), tokens.js, ScreenState.js, labels.js, DevStatePanel.js. Corregido: yo había citado 4.95:1 sobre `bg` para el botón pulsado y era 4.98 (con canales de 8 bits 4.95 y 4.93 sobre `surface`); se corrigió en DESIGN.md y D-39 y el verifier lo confirmó. El spec-author dejó D-28 como Vigente en DESIGN.md y se corrigió a D-37. Descartado: chevron dibujado con View en «Atrás» (exigía números sueltos). El verifier de T-05 aplicó «Validada» por instrucción expresa de Anderson aunque su regla pide Diseño Aprobado o N/A.
- Archivos y commit: src/components/ScreenHeader.js, src/components/PlaceholderScreen.js, src/components/DevStatePanel.js (provisional, lo retira T-10), src/components/ScreenState.js, src/theme/tokens.js, src/constants/labels.js, App.js, DESIGN.md, docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: T-05: capturas de Anderson (Android, modelo no indicado). T-06: prueba propia del implementer y del verifier con react-native simulado (0 fallos; no es el renderizador real); tokens contra DESIGN.md (32 comprobaciones sin diferencias, `opacity.pressed` = 0.9); contraste del botón pulsado recalculado por el implementer y por el verifier (4.975 sobre `bg` y 4.950 sobre `surface` sin redondear; 4.951 y 4.923 con 8 bits); `check-constitution` 44 errores C21 de specs sin tareas y 4 advertencias C23, sin líneas nuevas; `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta. T-06 NO está Validada: CA-000-D1, D3 y el efecto de D-40 en el celular quedan «No verificado en dispositivo» hasta la prueba de Anderson; CA-000-D2 sigue parcial hasta T-10; Diseño Pendiente hasta T-12. Hallazgos menores: `fontWeight` del título sobre `body` en los selectores (copiado en PlaceholderScreen y DevStatePanel; alinear en T-12), el selector «Menú/Atrás» solo es visible en «Contenido».
- Aprendizaje:

### Entrada #15
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Registrar la prueba de T-06 en el celular y ejecutar T-07.
- Prompt textual:
````
Resultado de la prueba de T-06 en el celular y autorización de T-07.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Registrar la prueba de T-06 en el celular y ejecutar T-07", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de T-06 en el celular Android (Anderson, 2026-10-27, con captura del estado Contenido):
   - Encabezado blanco con «UberClone Conductor» y botón «Menú», sin quedar bajo la barra de estado; debajo el panel provisional con Contenido, Cargando, Vacío, Error, el selector Menú/Atrás y el texto marcador.
   - Anderson declara que hizo todas las pruebas indicadas (cambio de botón Menú/Atrás, pulsado, los cuatro estados, escala de texto máxima, táctil) y que todo cumplió lo esperado. Solo hay captura del estado Contenido; regístralo así, sin inventar detalle. TalkBack no se probó.
   Con esto, T-06 pasa a «Validada, Diseño Pendiente hasta T-12». Marca los CA que cubre esta evidencia, incluido el efecto de D-40 y el pulsado a 0.9 solo si la declaración los cubre; si no, déjalos «No verificado en dispositivo». Apunta para T-12: el botón «Menú» del encabezado se ve casi como texto plano, y «Menú» aparece dos veces mientras exista el panel.

2. Autorizo T-07 (pestañas del registro). Es visual: ejecuta P3 de AGENTS.md, carga con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max según D-37 y pasa al implementer solo las reglas que aplican; si alguna no carga, dilo. Solo tokens y labels.js, contrato de testID de DESIGN.md, marca "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt.

3. Dependencias, antes de instalar nada: dime qué paquetes necesita T-07, cuáles ya están instalados y cuáles están en scripts/dependencies.json. Autorizo solo los que estén en esa lista, instalados con `npx expo install` cuando sean paquetes de Expo. Si alguno trae código nativo que NO esté ya en el build instalado en mi celular, DETENTE antes de instalar y dime qué recompilación haría falta (yo ejecuto el build; tú no ejecutas expo run ni prebuild). Si todo es solo JavaScript, sigue.

4. CA-000-09: el mismo demoValue debe verse entre las pestañas. Dime cómo lo compruebo en el celular. Mantén el panel provisional (D-38) visible desde loading, como pidió el hallazgo de T-04, y no lo retires hasta T-10.

5. Si T-07 toca App.js, dilo antes y registra el cambio como provisional en docs/decisiones.md con la tarea que lo retira. Dime exactamente qué debo ver en el celular y qué CA quedan «No verificado en dispositivo».

6. El verifier debe ser distinto del implementer. No marques T-07 como Validada hasta que yo pruebe. No empieces T-08. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se registró la prueba de T-06 (captura del estado Contenido y declaración de Anderson sin más detalle; TalkBack no probado) y T-06 quedó Validada con Diseño Pendiente. Se registró D-41 (App.js provisional con las pestañas) y T-07 (tres pestañas del registro, campo compartido `demoValue`, `DevAccountSwitch` provisional) quedó implementada y verificada en lo estático, sin Validada hasta la prueba de Anderson. Los dos hallazgos mayores del verifier (sombra `elevation: 8` de la barra y separación 0 entre pestañas) los corrigió el implementer.
- Usado / modificado / descartado: Usado: las tres skills de diseño (ya cargadas con Skill; «already loaded»), el planner, el verifier y el implementer. Modificado: decisiones.md (D-41), backlog.md (T-07 con App.js provisional y notas para T-12), plan.md (DP-08, DP-12, §4, §5), progress.md, AI_LOG.md, App.js (monta NavigationContainer y RegistrationTabs en lugar de DevStatePanel, que no se borra), PlaceholderScreen.js (prop `safeEdges` y `keyboardShouldPersistTaps`), labels.js. Decidido por el implementer y aceptado por el verifier: `theme.primary = color.text` (mi instrucción decía `color.primary`; el verifier dictaminó que no cambia nada visible). Descartado: mover `DevAccountSwitch` fuera de `children` (cambio mayor en `PlaceholderScreen`; se deja hasta T-10). Descartadas reglas de las skills que chocan con DESIGN.md (48 dp, modo oscuro, píldora de relleno para el activo). La corrección de elevación y separación no fue re-verificada por el verifier: solo por el test con mocks del implementer; queda para tu prueba y T-12.
- Archivos y commit: src/navigation/RegistrationTabs.js, src/screens/registration/PersonalDataScreen.js, VehicleScreen.js, DocumentsScreen.js, src/components/DevAccountSwitch.js, src/components/PlaceholderScreen.js, src/constants/labels.js, App.js, docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: T-07: prueba propia del verifier (56 comprobaciones, con el `AppStateProvider` real y un mini-renderizador propio: no es el renderizador real de React Native) y prueba con mocks del implementer; props de `bottom-tabs` verificadas contra los tipos instalados (v7.21.0); `check-constitution` 44 errores C21 de specs sin tareas, sin líneas nuevas, y las advertencias C23 bajaron de 4 a 3 al añadir filas de criterios; `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta (antes y después de la corrección). T-07 NO está Validada: CA-000-09, CA-000-10, CA-000-D1 y D3 de las pestañas quedan «No verificado en dispositivo» hasta la prueba de Anderson; CA-000-D2 sigue parcial hasta T-10; Diseño Pendiente hasta T-12. Hallazgos abiertos: ancho de borde sin token (`FIELD_BORDER_WIDTH = 1`, hueco de DESIGN.md), `fontWeight` del título sobre `label`/`body`, `DevAccountSwitch` oculto cuando el selector local no está en «Contenido», barra sobre el teclado en Android (`tabBarHideOnKeyboard`).
- Aprendizaje:

### Entrada #16
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Diagnosticar y corregir la barra de pestañas fuera de pantalla en T-07.
- Prompt textual:
````
Resultado de la prueba de T-07 en el celular: defecto encontrado.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Diagnosticar y corregir la barra de pestañas fuera de pantalla en T-07", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de T-07 (Anderson, Android, 2026-10-27, con captura de Datos personales):
   - Se ven el encabezado «Datos personales», el panel de estados, el campo «Valor de prueba compartido» con borde y el simulador de cuenta (con «Cargando» marcado), todo bajo la barra de estado.
   - DEFECTO: la barra de pestañas (Datos personales, Vehículo, Documentos) NO se ve. En la captura solo se asoma un fragmento del texto «Datos» pegado al borde inferior, bajo la línea del gesto de navegación de Android. La barra queda fuera de la pantalla por abajo. No es el notch (arriba todo se ve bien).
   - Como no se ve la barra, los pasos que cambian de pestaña no se pudieron probar con normalidad. Aunque Anderson dice que el resto funcionó, deja CA-000-09, CA-000-10, la conservación del valor entre pestañas, CA-000-D1/D3 de las pestañas, la ausencia de sombra y la separación como «No verificado en dispositivo». T-07 sigue en «Implementada» y no pasa a Validada.

2. Diagnóstico de causa raíz, ANTES de cambiar código. Muéstrame la causa con evidencia (código, medidas, comportamiento documentado de la librería para esta versión) y espera a decirme qué corregirás. Revisa al menos estas hipótesis y descarta cada una con razón:
   a. Android a pantalla completa (edge-to-edge) en SDK 57 / RN 0.86: el inset inferior llega en 0 o la barra de gestos se dibuja encima.
   b. El contenedor raíz usa un alto mayor que el de la ventana (por ejemplo 'screen' en lugar de 'window', o un wrapper con alto fijo).
   c. Falta o está duplicado SafeAreaProvider, o App.js/NavigationContainer no lo recibe donde lo necesita.
   d. tabBarStyle con alto o position fijos, o paddingBottom mal calculado por mi cuenta.
   e. El contenido de la pantalla (View con flex, ScrollView, panel provisional) empuja la barra fuera de la ventana.
   Si necesitas medir en el celular, puedes añadir un diagnóstico TEMPORAL (por ejemplo mostrar useSafeAreaInsets y useWindowDimensions en el panel), marcado como temporal en docs/decisiones.md y retirado al cerrar. Dime qué debo ver y te paso el valor.
   Dime también por qué el verifier de T-07 no detectó esto y qué debe añadirse a sus reglas para la próxima tarea (los criterios de diseño que dependen de la pantalla real no se pueden dar por buenos solo con lectura de código). Anótalo en docs/progress.md.

3. Decisiones (aprobadas por Anderson, registradas por el agente principal):
   a. Añade el token de ancho de borde (nombre que vaya con la convención de tokens.js) en tokens.js y DESIGN.md; el campo debe usarlo en lugar de FIELD_BORDER_WIDTH.
   b. Tema primary aceptado como color.text en lugar de color.primary.
   c. El simulador de cuenta que desaparece si el selector local no está en «Contenido» se deja hasta T-10, como está.

4. Tras la corrección: el verifier (distinto del implementer) debe volver a comprobar las dos correcciones anteriores (elevation 0 y separación de 8 entre pestañas) y la nueva. Dime exactamente qué debo ver en el celular, incluidos los pasos de la prueba de T-07 que quedaron sin hacer (CA-000-09 entre pestañas, conservación del valor, teclado abierto, escala de texto máxima).

5. Sin dependencias nuevas. Si la corrección exige recompilar el nativo (por ejemplo cambiar app.json o un plugin), dilo y yo ejecuto el build. No marques T-07 como Validada hasta que yo pruebe. No empieces T-08. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se registró la prueba de T-07 (barra de pestañas fuera de pantalla por abajo en Android) sin pasar T-07 a Validada. Se midió con un diagnóstico temporal (`LayoutDiagnostic`): `tab bar height (measured)` = 14.9 = `insets.bottom`, ventana = pantalla = 832 dp. Causa raíz: `tabBarStyle.height: 'auto'` colapsa a 0 el contenido `flex: 1` de la barra de la librería. Anderson eligió corregirlo con una barra propia (`AppTabBar`, prop `tabBar`, D-46). Pendiente: confirmación en el celular y retirar el diagnóstico.
- Usado / modificado / descartado: Usado: lectura del código de `@react-navigation/bottom-tabs` 7.21.0 (`BottomTabBar.js`, `BottomTabView.js`), la configuración Android generada (`edgeToEdgeEnabled=true`, `adjustResize`), las mediciones de Anderson (captura `8.png`), el verifier, el implementer, el planner y el spec-author. Descartado con evidencia: edge-to-edge (los insets llegan y la ventana ocupa toda la pantalla), alto raíz mayor que la ventana, `SafeAreaProvider` ausente o duplicado, contenido que empuja la barra. Modificado: decisiones.md (D-42 a D-46), DESIGN.md (`borderWidth.thin`), plan.md (DP-12, §4, §5), backlog.md (T-07), progress.md (defecto y «Lecciones del verifier (T-07)»), tokens.js, PersonalDataScreen.js, RegistrationTabs.js, y los componentes nuevos AppTabBar.js y LayoutDiagnostic.js (temporal). Error propio reconocido: yo había aceptado `height: 'auto'` sin medirlo en el dispositivo. Quedan abiertos (menores del verifier): `tabBarAllowFontScaling` muerta en `RegistrationTabs`, `tabPress` sin `data.behavior` (afectará con pilas anidadas desde T-08), sin ocultar con teclado en iOS.
- Archivos y commit: src/navigation/AppTabBar.js (nuevo), src/navigation/RegistrationTabs.js, src/components/LayoutDiagnostic.js (temporal), src/screens/registration/PersonalDataScreen.js, src/theme/tokens.js, DESIGN.md, docs/decisiones.md, docs/progress.md, docs/backlog.md, specs/000-fundacion/plan.md, docs/AI_LOG.md; commit: 407d196 (docs) y 4509788 (código), salvo `LayoutDiagnostic.js`: temporal, se creó y se borró (entrada #17) antes de que existiera ningún commit, así que no aparece en el diff de ninguno.
- Verificación: Medido por Anderson en el celular (captura `8.png`): insets T 34.1 y B 14.9; ventana, pantalla y marco inicial de 832 dp; alto medido de la barra 14.9. Verificado por ejecución con mocks (sin motor de layout): prueba propia del verifier (61 comprobaciones, 0 fallos) y del implementer para `AppTabBar`; `check-constitution` 44 errores C21 de specs sin tareas y 3 advertencias C23, sin líneas nuevas; `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta. Inferido por lectura (NO verificado en dispositivo): que la barra se vea completa sobre la línea de gestos, que crezca con la escala de texto, el táctil de 48 y la separación de 8, la zona segura inferior, el comportamiento con teclado, la ausencia de sombra y la navegación entre pestañas. CA-000-09, CA-000-10, D1 y D3 de las pestañas siguen «No verificado en dispositivo»; T-07 no está Validada.
- Aprendizaje:

### Entrada #17
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Registrar la prueba manual de la barra de pestañas corregida y retirar el diagnóstico temporal (LayoutDiagnostic).
- Prompt textual:
````
Perfecto, hice las pruebas manualmente y no pasa exitosamente, valido la implementación pueden proceder con la eliminación del LayouDiagnostic
````
  (El mensaje incluyó una captura de pantalla, `images\9.png`, con la barra de pestañas visible y el diagnóstico mostrando «tab bar height (measured) 62.9».)
- Resumen de la respuesta (2–3 líneas): Se retiró el diagnóstico temporal `LayoutDiagnostic` (D-45, ahora «Retirado») y se registró la captura de Anderson, que muestra la barra de pestañas completa sobre la línea de gestos y `tab bar height (measured)` = 62.9 = 14.9 + 48 (el defecto anterior, 14.9, queda corregido por medición). El mensaje de Anderson era contradictorio («no pasa exitosamente» y «valido la implementación»), así que se le pidió aclararlo y T-07 NO se pasó a Validada.
- Usado / modificado / descartado: Usado: la captura `9.png`, el implementer (retiro) y el verifier (evidencia y comprobación del retiro). Modificado: decisiones.md (D-45 «Retirado»), progress.md, backlog.md (nota de T-07), AI_LOG.md, PersonalDataScreen.js; borrado: src/components/LayoutDiagnostic.js. Descartado: tomar la declaración de Anderson como evidencia de ningún criterio mientras sea ambigua; dejar el callback de altura de `AppTabBar` (se conserva: lo usa también la librería y es inocuo).
- Archivos y commit: src/components/LayoutDiagnostic.js (borrado), src/screens/registration/PersonalDataScreen.js, docs/decisiones.md, docs/progress.md, docs/backlog.md, docs/AI_LOG.md; commit: 407d196 (docs) y 4509788 (`PersonalDataScreen.js`); `LayoutDiagnostic.js` se borró antes de llegar a commitearse, no aparece en ninguno.
- Verificación: Medido/visto en la captura (Android, modelo no indicado): las tres pestañas completas, activa en negrita y subrayada, fondo blanco liso (una sombra muy tenue no es determinable en la captura), alto medido de la barra 62.9. Estimado sobre la captura (no medición directa): barra de unos 122 px ≈ 63 dp; los 8 dp de separación no se pueden estimar. Retiro verificado por el verifier: el archivo no existe, no hay referencias a `LayoutDiagnostic` ni a código TEMPORARY en `src` ni en `App.js`, `check-constitution` 44 errores C21 y 3 advertencias C23 sin líneas nuevas, `--selftest` pasa y `npx expo export --platform android` empaqueta. No cubierto (No verificado en dispositivo): cambio de pestaña (CA-000-10), conservación del valor entre pestañas (CA-000-09), teclado abierto, escala de texto máxima (CA-000-D3), zona táctil y separación medidas (CA-000-D1) y pulsado, a la espera de la aclaración de Anderson.
- Aprendizaje:

### Entrada #18
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Confirmar T-07 y ejecutar T-08 (Home y Stack del viaje).
- Prompt textual:
````
Confirmación de T-07 y autorización de T-08.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Confirmar T-07 y ejecutar T-08 (Home y Stack del viaje)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Aclaración sobre T-07: «Todo pasa». Anderson repitió en el celular Android, tras la corrección, estos pasos y todos cumplieron lo esperado: valor «ABC-123» escrito en Datos personales visible en Vehículo, campo vacío con «Todavía no escribiste nada», valor conservado al pasar por Documentos, teclado abierto sin tapar el campo, escala de texto máxima sin cortes ni solapes, pestañas distinguibles sin sombra, zonas táctiles cómodas. No hay capturas de estos pasos aparte de la que ya registraste; anótalo así, sin inventar detalle.
   T-07 pasa a «Validada, Diseño Pendiente hasta T-12». Actualiza el estado de CA-000-09, CA-000-10, D1 y D3 solo en lo que esta declaración cubre. La sombra y la separación de 8 dp siguen sin medida; déjalas anotadas para T-12.

2. Autorizo T-08 (Home y Stack del viaje). Es visual: ejecuta P3 de AGENTS.md, carga con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max según D-37 y pasa al implementer solo las reglas que aplican; si alguna no carga, dilo. Solo tokens y labels.js, contrato de testID de DESIGN.md, marca "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt.

3. Literales: el texto de «Iniciar viaje» (home.startTrip) sigue provisional hasta que Anderson lo confirme contra F1 §3. Úsalo marcado como provisional en labels.js; T-08 no puede cerrar con ese texto como definitivo. Para los demás textos de T-08 usa el literal de F1/docs/requisitos.md cuando exista.

4. Dependencias, antes de instalar nada: dime qué paquetes necesita T-08, cuáles ya están instalados y cuáles están en scripts/dependencies.json. Autorizo solo los de esa lista, con `npx expo install` si son de Expo. Si alguno trae código nativo que NO esté ya en el build instalado, DETENTE y dime qué recompilación haría falta; yo ejecuto el build. Tú no ejecutas expo run ni prebuild.

5. Con pilas anidadas dentro de las pestañas, revisa el hallazgo del verifier de T-07 sobre tabPress sin data.behavior y decide con razón si afecta a T-08. Lo demás de los hallazgos menores de T-07 puede esperar a T-12.

6. Dime cómo debo comprobar en el celular el flujo del Stack del viaje y qué CA quedan «No verificado en dispositivo». Si T-08 toca App.js, regístralo como provisional con la tarea que lo retira (T-10).

7. El verifier debe ser distinto del implementer. No marques T-08 como Validada hasta que yo pruebe. No empieces T-09. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): T-07 pasó a Validada con Diseño Pendiente según la declaración «Todo pasa» de Anderson (sin capturas aparte de la 9.png; sombra y separación de 8 dp sin medida, anotadas para T-12). Se registraron D-47 (`App.js` provisional con acceso simulado a Registro o Principal) y D-48 (`home.startTrip` provisional). T-08 (Home y Stack del viaje) quedó implementada y verificada en lo estático, sin Validada: faltan tu prueba en el celular, la confirmación de «Iniciar viaje» contra F1 §3 y Diseño (T-13).
- Usado: las tres skills de diseño (ya cargadas con Skill; «already loaded»), el planner, el implementer y el verifier. Modificado: decisiones.md (D-47, D-48), backlog.md (T-07 Validada, T-08, T-10, T-12), plan.md (DP-21, §4, §5, §7), progress.md, AI_LOG.md, labels.js, App.js (vista previa provisional). Nuevos: PrimaryButton.js (fuera de la lista del planner; el verifier lo aceptó como desviación menor), TripStack.js, HomeScreen.js y las tres pantallas del viaje. Decidido: `popToTop()` en el resumen; `NavigationContainer key={rama}` en `App.js`; el hallazgo de `tabPress` sin `data.behavior` NO afecta a T-08 (el Stack del viaje es el Home del Drawer, no está dentro de una pestaña). Descartado: usar «Pasajero a bordo» y «Disponible/No disponible» en T-08 (el botón es una navegación genérica de marcador). Reglas de las skills descartadas por chocar con DESIGN.md: 48 dp en toda la navegación, modo oscuro y reglas de páginas web.
- Archivos y commit: src/components/PrimaryButton.js, src/navigation/TripStack.js, src/screens/home/HomeScreen.js, src/screens/trip/TripRequestScreen.js, TripActiveScreen.js, TripSummaryScreen.js, src/constants/labels.js, App.js, docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: T-07: declaración de Anderson («Todo pasa») sin captura ni detalle, más la captura 9.png ya registrada (medido: barra completa, alto 62.9). T-08: prueba propia del implementer (91 comprobaciones) y del verifier (64 comprobaciones) con react-native simulado, sin motor de layout; `popToTop`, `contentStyle` y `headerShown` contrastados con los tipos instalados de native-stack; `check-constitution` 44 errores C21 de specs sin tareas y 2 advertencias C23 (bajó de 3 al añadir la fila de CA-000-12), sin líneas nuevas; `--selftest` pasa (también el de `visual-audit`); `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta; sin dependencias nuevas. NO verificado en dispositivo (inferido por lectura): CA-000-12 (abrir el flujo, avanzar y volver con gesto o botón), CA-000-D1 y D3 de las pantallas del viaje y del botón principal, el gesto y botón físico de atrás, el remontaje por rama (posible parpadeo y pérdida del estado de navegación), la escala de texto y el feedback de pulsado. Pendiente: confirmar `home.startTrip` contra F1 §3 (D-48). Hallazgos menores del verifier: erratas en dos comentarios, `accessibilityLabel` redundante en `PrimaryButton`, en Home el botón principal y el simulador desaparecen si el selector local no está en «Contenido», y Fast Refresh recarga por completo por exportar `pickBranch` junto al componente por defecto.
- Aprendizaje:

### Entrada #19
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Confirmar T-08, resolver el literal de «Iniciar viaje» y ejecutar T-09 (Drawer).
- Prompt textual:
````
Confirmación de T-08, literal de «Iniciar viaje» y autorización de T-09.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Confirmar T-08, resolver el literal de «Iniciar viaje» y ejecutar T-09 (Drawer)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de T-08 en el celular Android (Anderson, 2026-10-27): Anderson hizo los ocho pasos indicados (Aprobado en el simulador, Inicio con Menú, botón principal, selector y simulador; Menú sin efecto; Solicitud entrante con Atrás y Continuar teal; Atrás por botón, gesto y botón físico; Continuar hasta Viaje en curso y Cobro y resumen; Volver al inicio sin pantalla apilada y salida de la app con el botón físico; Reintentar de Error a Cargando; Pendiente de aprobación vuelve a Registro; escala de texto máxima) y declara que todo cumplió lo esperado, sin parpadeo. Sin capturas: regístralo así, sin inventar detalle. TalkBack no se probó.
   T-08 pasa a «Validada, Diseño Pendiente hasta T-13». Actualiza solo los CA que esta declaración cubre.

2. Literal «Iniciar viaje»: Anderson comprobó F1 (el PDF del cuaderno). F1 §3 no contiene ese texto: la pantalla Inicio es el mapa con el interruptor Disponible / No disponible, y la solicitud entrante llega cuando un pasajero pide el viaje. Los literales «Solicitud entrante», «Viaje en curso» y «Cobro y resumen» sí coinciden con F1 §3.
   Decisión (aprobada por Anderson, registrada por el agente principal): cambia home.startTrip por «Simular solicitud (provisional)». Es una entrada provisional de desarrollo y se reemplaza cuando se resuelva P-01 (simulador de solicitudes, sigue APARCADA: no la resuelvas ahora). Actualiza D-48 y anota en el backlog que este botón se retira con P-01 o con la spec correspondiente. Cambia también cualquier testID, comentario o doc que mencione «Iniciar viaje» solo si es texto visible o documentación; no renombres testID ya fijados en DESIGN.md sin avisar.

3. Autorizo T-09 (Drawer). Es visual: ejecuta P3 de AGENTS.md, carga con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max según D-37 y pasa al implementer solo las reglas que aplican; si alguna no carga, dilo. Solo tokens y labels.js, contrato de testID de DESIGN.md, marca "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt. Las opciones del Drawer salen de F1 §1 y §3: perfil, historial, ganancias y configuración; usa el literal de F1/docs/requisitos.md cuando exista.

4. Dependencias, antes de instalar nada: dime qué necesita T-09, qué ya está instalado y qué está en scripts/dependencies.json. Autorizo solo lo de esa lista, con `npx expo install`. El Drawer depende de react-native-gesture-handler y react-native-reanimated: dime si ya están en el build instalado en mi celular y si hace falta cambiar babel.config.js o app.json. Si se necesita código nativo nuevo o recompilar, DETENTE antes de instalar y dime los pasos exactos (yo ejecuto el build y, si cambia Babel, `npx expo start --dev-client -c`). Tú no ejecutas expo run ni prebuild.

5. Dime cómo debo comprobar el Drawer en el celular (abrir con el botón Menú y con el gesto, cerrar, navegar a cada opción, botón físico de atrás con el Drawer abierto) y qué CA quedan «No verificado en dispositivo». Si T-09 toca App.js, regístralo como provisional con la tarea que lo retira (T-10).

6. El verifier debe ser distinto del implementer. No marques T-09 como Validada hasta que yo pruebe. No empieces T-10. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): T-08 pasó a Validada con Diseño Pendiente según la declaración de Anderson (ocho pasos, sin capturas, sin parpadeo; TalkBack no probado). Anderson comprobó F1: no contiene «Iniciar viaje», así que `home.startTrip` pasó a «Simular solicitud (provisional)» (D-48 actualizada; se retira con P-01 o la spec de solicitudes; el testID `home-start-trip` se conserva). T-09 (Drawer de la rama principal) quedó implementada y verificada en lo estático, sin Validada hasta la prueba de Anderson.
- Usado / modificado / descartado: Usado: las tres skills de diseño (ya cargadas con Skill), el planner, el implementer y el verifier; el `DrawerRouter` y el `StackRouter` reales de `@react-navigation/routers` en la prueba del verifier. Modificado: decisiones.md (D-48 actualizada, D-47 ampliada para T-09), backlog.md, plan.md, progress.md, AI_LOG.md, labels.js (`home.startTrip`, `a11y.drawerItems.*`), HomeScreen.js (solo `onLeadingPress`), App.js (la rama «Aprobado» monta `MainDrawer`). Nuevos: MainDrawer.js, AppDrawerContent.js (fuera de la lista del planner; el verifier lo juzgó justificado y recomienda añadirlo al plan), ProfileScreen, HistoryScreen, EarningsScreen y SettingsScreen. Decidido: el Drawer se abre con `navigation.dispatch(DrawerActions.openDrawer())` desde el Stack anidado (la acción sube al Drawer padre; verificado en `useOnAction.tsx` líneas 156-158); la acción de las entradas se copió de `DrawerItemList` de la librería; sin cambios de Babel, `app.json` ni recompilación (el Drawer y sus peers ya estaban en el build). Descartado: añadir sombra al panel (la librería no pone `elevation`), `getParent()?.openDrawer()` y `useNavigation()`.
- Archivos y commit: src/navigation/MainDrawer.js, src/navigation/AppDrawerContent.js, src/screens/main/ProfileScreen.js, HistoryScreen.js, EarningsScreen.js, SettingsScreen.js, src/screens/home/HomeScreen.js, src/constants/labels.js, App.js, docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: T-08: declaración de Anderson sin captura ni detalle; cambio de literal verificado por lectura y ejecución (grep sin «Iniciar viaje» en `src` ni `App.js`, `check-constitution` sin líneas nuevas). T-09: prueba propia del verifier (124 comprobaciones, 0 fallos) con el `DrawerRouter` y el `StackRouter` reales y mocks de react-native (sin motor de layout ni reanimated real) y prueba del `AppStateProvider` real con un mini-renderizador propio para Configuración; props de `drawer` verificadas contra los tipos instalados (7.14.4); contrastes de los pares usados dentro de la tabla; `check-constitution` 44 errores C21 de specs sin tareas y 1 advertencia C23 (bajó al añadir la fila de CA-000-11), sin líneas nuevas; `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta y resuelve drawer y reanimated (no prueba lo nativo). NO verificado en dispositivo (inferido por lectura): CA-000-11, CA-000-09 parte Configuración, CA-000-D1 y D3 del Drawer, abrir y cerrar con «Menú», con el gesto de borde y tocando fuera, botón físico de atrás con el Drawer abierto, gesto de borde frente al gesto de atrás de Android, animación de reanimated y módulo nativo de gesture-handler (nunca ejercitado en el dispositivo), remontaje por rama. Hallazgos menores: el panel no desplaza (un `View` fijo: con la escala de texto máxima y pantalla baja podrían no caber las cuatro entradas), overlay `rgba(0,0,0,0.5)` y radio 16 en Android de la librería no son tokens (los decide T-13), y «Perfil»/«Configuración» sin literal F1 propio (RF-29 dice «Perfil y configuración»; lo resuelve la spec 008).
- Aprendizaje:

### Entrada #20
- Fecha: 2026-10-27
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Confirmar T-09 y ejecutar T-10 (navegador raíz y barra de estado).
- Prompt textual:
````
Confirmación de T-09 y autorización de T-10.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-10-27, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Confirmar T-09 y ejecutar T-10 (navegador raíz y barra de estado)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de T-09 en el celular Android (Anderson, 2026-10-27): Anderson hizo los nueve pasos indicados (Aprobado en el simulador; Menú abre el Drawer con «UberClone Conductor» y las cuatro entradas sin Inicio; cierre tocando fuera y apertura con el gesto de borde, anotando el choque con el gesto de atrás; cada entrada cierra el Drawer y muestra su título con la activa en negrita y subrayada; Menú desde cada pantalla y atrás a Inicio; botón físico con el Drawer abierto lo cierra; escala de texto máxima con las cuatro entradas alcanzables; valor escrito en Datos personales visible en Configuración; Pendiente de aprobación en Configuración devuelve a Registro) y declara que todo se ejecutó exactamente como se indicaba. Sin capturas ni detalle por paso: regístralo así, sin inventar nada. Anderson no reportó choque con el gesto de atrás; si lo reportó en detalle, no está en este mensaje y no lo asumas. TalkBack no se probó.
   T-09 pasa a «Validada, Diseño Pendiente hasta T-13». Con esto, CA-000-09 queda cubierto por declaración (pestañas y Configuración) y CA-000-11 por declaración. Actualiza solo lo que esta declaración cubre y deja «No verificado en dispositivo» lo demás.

2. Decisiones sobre los hallazgos de T-09 (aprobadas por Anderson, registradas por el agente principal):
   a. AppDrawerContent.js se añade al plan de T-09 (actualiza plan.md).
   b. El panel del Drawer sin desplazamiento y el overlay y radio de la librería (no son tokens) pasan a T-13, anotados.
   c. «Perfil» y «Configuración» sin literal F1 propio (RF-29 dice «Perfil y configuración») los resuelve la spec 008; anótalo.

3. Autorizo T-10 (navegador raíz y barra de estado con expo-status-bar). Ejecuta el prompt de AGENTS.md que corresponda: la barra de estado y los colores son visuales, así que usa P3 y carga con la herramienta Skill impeccable:impeccable, taste-skill:design-taste-frontend y ui-ux-pro-max:ui-ux-pro-max según D-37; pasa al implementer solo las reglas que aplican; si alguna no carga, dilo. Solo tokens y labels.js, contrato de testID de DESIGN.md, marca "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt.

4. Alcance según specs/000-fundacion/plan.md: navegador raíz (Stack) que elige la rama por accountStatus usando lo ya construido (ScreenState para loading y error, Registro con pestañas para Pendiente, y el Drawer con el Stack del viaje para Aprobado). Reemplaza las composiciones provisionales de App.js (D-41, D-47) y la barra de estado ilegible con expo-status-bar, con el estilo que sea legible sobre el fondo claro de la app (D-26: solo tema claro). Si expo-status-bar no está instalado o requiere código nativo nuevo, DETENTE antes de instalar y dime los pasos; yo ejecuto el build y tú no ejecutas expo run ni prebuild.

5. Provisionales: haz la lista de TODO lo provisional que existe hoy (decisiones D-38, D-41, D-47 y las demás que tengas marcadas, el panel de estados local, el selector de estados, DevAccountSwitch, DevStatePanel.js, «Simular solicitud (provisional)»). Para cada uno di si T-10 lo retira o lo deja, con la razón. Importante: el simulador de cuenta es hoy la única forma de que yo cambie de rama en el celular; no lo retires si hace falta para la prueba de T-11, y dime qué tarea lo retira antes de la entrega. No resuelvas P-01.

6. Dime cómo debo comprobar T-10 en el celular (barra de estado legible con reloj e iconos; arranque en carga y paso a Pendiente a los 0,8 s; cambio de rama con el simulador; atrás y gestos sin salir por error) y qué CA quedan «No verificado en dispositivo». Si algo depende de T-11, dilo.

7. El verifier debe ser distinto del implementer. No marques T-10 como Validada hasta que yo pruebe. No empieces T-11. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): T-09 pasó a Validada con Diseño Pendiente según la declaración de Anderson (nueve pasos, sin capturas ni detalle por paso; no reportó choque con el gesto de atrás; TalkBack no probado). Se registraron D-49 (hallazgos de T-09 al plan, a T-13 y a la spec 008) y D-50 (`DevAccountSwitch` también en las pantallas de arranque de carga y error). T-10 (navegador raíz por estado de cuenta, pantallas de arranque y barra de estado con `expo-status-bar`) quedó implementada y verificada en lo estático, sin Validada hasta la prueba de Anderson. Se entregó el inventario de provisionales.
- Usado / modificado / descartado: Usado: las tres skills de diseño (ya cargadas con Skill), el planner, el implementer y el verifier. Hallazgo propio del agente principal: `expo-status-bar` 57.0.1 SÍ tiene módulo nativo de Android (`expo.modules.statusbar`) y ya estaba en el build de Anderson (el scaffold lo traía en `package.json` antes de T-01); el verifier lo confirmó en los intermedios de `android/app/build`; por eso no hizo falta recompilar. Modificado: decisiones.md (D-49, D-50), backlog.md (inventario de provisionales, T-09, T-10, T-13, obligaciones heredadas), plan.md (DP-22, §4, §5, §7), progress.md, AI_LOG.md, App.js (reescrito: providers, `StatusBar style="dark"`, `NavigationContainer` sin `key`, `RootNavigator`), RootNavigator.js y StartupScreen.js (nuevos), DevAccountSwitch.js (solo un comentario obsoleto); borrado: DevStatePanel.js. Decidido: `animation: 'none'` en el Stack raíz; pantallas de arranque como componentes de módulo; `pickScreen` exportada para probar la elección; `style="dark"` explícito (la API no tiene `backgroundColor`: el fondo bajo la barra lo pintan las pantallas). Descartado: `style="auto"` (D-26), un navegador raíz con `key` por rama.
- Archivos y commit: src/navigation/RootNavigator.js, src/screens/startup/StartupScreen.js, App.js, src/components/DevStatePanel.js (borrado), src/components/DevAccountSwitch.js (comentario), docs/decisiones.md, docs/backlog.md, docs/progress.md, docs/AI_LOG.md, specs/000-fundacion/plan.md; commit: 407d196 (docs) y 4509788 (código).
- Verificación: T-09: declaración de Anderson sin captura ni detalle por paso. T-10: prueba propia del implementer y del verifier (38 comprobaciones, 0 fallos) con el `AppStateProvider` real, un mini-renderizador propio (sin motor de layout) y el `StackRouter` real; props de `native-stack` (`headerShown`, `contentStyle`, `animation`) y de `expo-status-bar` (`style`; sin `backgroundColor`) contrastadas con los tipos instalados; módulo nativo de la barra de estado confirmado en los intermedios del build de Android; `check-constitution` 44 errores C21 de specs sin tareas y 1 advertencia C23, sin líneas nuevas; `--selftest` pasa; `npx expo-doctor` 21/21; `npx expo export --platform android` empaqueta; sin dependencias nuevas. NO verificado en dispositivo (inferido por lectura): CA-000-13, CA-000-14, la barra de estado legible con reloj e iconos oscuros (el contraste 15.30 solo vale si el sistema pinta los iconos con `color.text`), el arranque en carga y el paso a Pendiente a los 0,8 s, el cambio de rama con el simulador, el remontaje y posible parpadeo, el atrás físico y los gestos en la raíz de cada rama, el layout de las pantallas de arranque y la escala de texto. CA-000-D2 queda parcial hasta T-13 y T-11. Hallazgos menores: comentario obsoleto en DevAccountSwitch (corregido), `pending` y desconocido comparten ruta Registro (por diseño).
- Aprendizaje:

### Entrada #21
- Fecha: 2026-11-01
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Confirmar T-10, mapear CA-000-14 en plan.md y preparar el checklist de T-11.
- Prompt textual:
````
Confirmación de T-10, mapeo de CA-000-14 y checklist de T-11.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-01, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Confirmar T-10 y preparar el checklist de T-11", con el prompt completo copiado tal cual lo recibiste. Añade además una entrada breve reconstruida para la pregunta anterior de Anderson ("qué debería ver hoy en el celular y si hace falta un build nuevo"), marcada como reconstruida. Completa archivos y verificación al terminar.

1. Resultado de la prueba de T-10 en el celular Android (Anderson, 2026-11-01): Anderson siguió los pasos que describiste (arranque en carga con el simulador debajo, paso a Registro, Registro con tres pestañas, Aprobado lleva al Drawer con Inicio, el flujo Solicitud entrante → Viaje en curso → Cobro y resumen, y las cuatro entradas del Drawer) y declara que todo se vio y funcionó como lo indicaste. No hay capturas ni detalle por paso en este mensaje: regístralo así, sin inventar nada. Mi mensaje anterior pedía además confirmar la barra de estado legible, el atrás físico/gesto en la raíz y la escala máxima en las pantallas de arranque; Anderson no detalló esos tres puntos, así que déjalos «No verificado en dispositivo» hasta T-11.
   T-10 pasa a «Validada, Diseño Pendiente hasta T-13» solo en lo que esta declaración cubre. Corrige el estado: en tu último informe dices «Validada ✅ en la parte funcional/estática»; unifica esa redacción con el formato que usan T-02 a T-09 en backlog y progress.

2. CA-000-14 aparece en C23 como no mapeado en plan.md. Mapéalo a la tarea que corresponda (T-10 o T-11) y dime a cuál y por qué. Las 44 C21 de specs 001 a 009 son la línea base y no se tocan.

3. Prepara el checklist exacto de T-11 (recorrido completo en el celular con evidencia). Debe incluir, por paso, qué debo ver, el CA que cierra y qué evidencia anotar (captura o descripción). Cubre como mínimo: barra de estado legible en carga, error, Registro y Principal; arranque en carga y paso a Pendiente a los 0,8 s; las cuatro ramas del simulador; atrás físico y gesto del borde en la raíz de cada rama sin salir por error; Drawer (abrir, cerrar, gesto de borde frente al gesto de atrás de Android); flujo del viaje con «Volver al inicio»; escala de texto máxima en cada rama; el estado forzado del selector local en las pantallas internas; y CA-000-05 si todavía está en ⏳. Dime qué CA quedarían «No verificado en dispositivo» tras T-11, y cuáles esperan a T-12 y T-13 (diseño).

4. Solo prepara el checklist: yo lo recorro y te paso el resultado por paso. No marques T-11 como Validada, no empieces T-12, T-13 ni T-14, no instales nada, no hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Se registró la declaración de Anderson para T-10 (sin capturas): pasa a «Validada, Diseño Pendiente hasta T-13» en `docs/backlog.md`; en `docs/progress.md` la fila CA-000-13/CA-000-14 queda ✅ por declaración PARCIAL (ramas Pendiente↔Registro, Aprobado↔Principal y el arranque en carga), dejando «No verificado en dispositivo» las ramas forzadas Cargando/Error, la barra de estado, el atrás físico/gesto en la raíz y la escala máxima en arranque. Se corrigió `specs/000-fundacion/plan.md` §7 (`CA-000-13 / 14` → `CA-000-13, CA-000-14`) para que la regla C23 detecte el mapeo. Se preparó el checklist de 16 pasos para T-11 (resumido en `docs/backlog.md`, detallado en la respuesta al usuario); no se marcó T-11 como Validada ni se empezó T-12/T-13/T-14.
- Usado / modificado / descartado: Usado: `node scripts/check-constitution.mjs --json` antes y después; grep sobre `specs/000-fundacion/spec.md` y `plan.md` para entender por qué C23 solo marcaba CA-000-14 (la regla busca la subcadena literal `CA-000-14` en `plan.md`; `CA-000-07` y `CA-000-13` sí aparecían literalmente en otro punto del archivo, `CA-000-14` no). Modificado: `docs/progress.md` (fila CA-000-13/CA-000-14), `docs/backlog.md` (Estado de T-10; Hacer/Hecho cuando de T-11), `specs/000-fundacion/plan.md` (§7), `docs/AI_LOG.md` (esta entrada y la #22 reconstruida). Descartado: reestructurar la tabla del mapa CA → implementación en dos filas separadas (bastaba el ajuste literal para C23, sin cambiar el contenido ni el significado).
- Archivos y commit: docs/progress.md, docs/backlog.md, specs/000-fundacion/plan.md, docs/AI_LOG.md; commit: a5dffc8.
- Verificación: `node scripts/check-constitution.mjs --json` antes (1 hallazgo C23: «CA-000-14 is not mapped in plan.md», `specs/000-fundacion/spec.md:108`) y después (0 hallazgos C23; 44 errores C21 de línea base sin cambios; mismas reglas inactivas por fase; sin errores nuevos).
- Aprendizaje:

### Entrada #22 (RECONSTRUIDA el 2026-11-01, no registrada en el momento)
- Fecha: 2026-11-01
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Revisar el estado real del proyecto (specs, backlog, progress, código) y explicar paso a paso cómo verlo en el celular sin recompilar.
- Prompt textual:
````
cuál es el estado actual realmente del proyecto, que debería poder ver en el que pantallas yy que funcionalidades debería tener actualmente ? revisa todo. Posterior a esto indicamente como puedo ver esto reflejado en mi celular, hago un build y conecto por depuración todavía ? indicamen todo paso a paso
````
- Resumen de la respuesta (2–3 líneas): Se revisó el código (`src/`, `backend/src/`), `docs/backlog.md`, `docs/progress.md` y `docs/decisiones.md`, y se explicó que T-01 a T-10 son un esqueleto de navegación con pantallas marcador (sin cámara, mapas, Firestore ni pagos) y que las specs 001 a 009 no existen todavía. Se indicó que NO hace falta un build nuevo (T-03 a T-10 solo cambiaron JavaScript) y se dieron los pasos: conectar por USB, `adb devices`, `npx expo start --dev-client`, abrir la app ya instalada (no Expo Go).
- Usado / modificado / descartado: Usado: lectura de `src/`, `backend/src/`, `app.json`, `package.json`, `docs/backlog.md`, `docs/progress.md`, grep sobre `docs/AI_LOG.md` para confirmar el método de conexión ya usado por Anderson (USB, Gradle local). No se modificó ningún archivo del proyecto (solo lectura y diagnóstico).
- Archivos y commit: ninguno modificado; commit: ninguno.
- Verificación: revisión directa del código y la documentación existente; sin prueba en el celular en el momento de responder (la propia respuesta proponía el recorrido que terminó pidiéndose como T-11 en la entrada #21).
- Aprendizaje:

### Entrada #23
- Fecha: 2026-11-01
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Cerrar T-11, ejecutar T-14 y preparar T-12.
- Prompt textual:
````
Confirmación de T-11 y autorización de T-14; preparación de T-12.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-01, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar T-11, ejecutar T-14 y preparar T-12", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de T-11 en el celular Android (Anderson, 2026-11-01): Anderson recorrió el checklist de 16 pasos con la escala de texto en máximo y declara que en todos los pasos se cumple lo esperado, el paso 16 no aplica. No hay capturas ni descripción por paso en este mensaje: regístralo como declaración sin capturas, sin inventar detalle. Sobre el paso 12 (choque del gesto de borde con el de atrás de Android) Anderson no describió ningún choque ni su ausencia: no lo asumas en ningún sentido y anótalo como «sin descripción». TalkBack no se probó. iOS sigue sin verificar (P-05).
   T-11 pasa a «Validada». Actualiza backlog, progress y spec: marca por declaración los CA que el checklist cierra (CA-000-09 a CA-000-15, CA-000-D2 solo en lo funcional de legibilidad de la barra) y deja CA-000-D1, D2 y D3 en lo que corresponde a T-12 y T-13 (diseño), no a T-11. CA-000-05 sigue ⏳ hasta la fase 4. Dime cuáles CA quedan «No verificado en dispositivo» y por qué.

2. Autorizo T-14 (token type.numeric). Es un cambio de tokens y documentación sin pantalla: ejecuta el prompt P1 de AGENTS.md (o el que corresponda según el plan). Define type.numeric en src/theme/tokens.js y DESIGN.md con una justificación breve (para cifras: tarifas, ganancias, tiempos), sin cambiar ninguna pantalla existente salvo que el plan lo exija. Marca los archivos que toques con "// AI-assisted: see docs/AI_LOG.md #N" con el número de la entrada de este prompt. Sin dependencias nuevas.

3. Prepara T-12 pero NO la ejecutes todavía. Dime: qué pantallas y estados audita T-12 y cuáles T-13 según plan.md; qué reglas y skills aplican (impeccable:impeccable, taste-skill:design-taste-frontend, ui-ux-pro-max:ui-ux-pro-max, cargadas con la herramienta Skill según D-37); qué debe revisar el design-auditor (es el agente distinto del implementer) y qué comprobaciones corre scripts/visual-audit.mjs; y qué necesitas de mí (capturas de qué pantallas, en qué estados, con qué escala de texto) para auditar con evidencia y no a ciegas. Lista también lo que ya anotaste para T-12 y T-13 (sombra y separación de pestañas sin medida, botón «Menú» que se ve como texto plano, «Menú» repetido, marco tenue del vacío, accessibilityLabel de carga, panel del Drawer sin scroll, overlay y radio de la librería, fontWeight del título sobre body en los selectores del panel) para que no se pierda ninguno.

4. El verifier debe ser distinto del implementer. No marques T-14 como Validada hasta que yo confirme. No empieces T-12. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): T-11 pasó a Validada por declaración (16 pasos, sin capturas; paso 12 registrado explícitamente como «sin descripción»); se cerraron por declaración CA-000-09 a CA-000-15 y la parte funcional de CA-000-D2 en `docs/backlog.md`, `docs/progress.md` y `specs/000-fundacion/spec.md` (D1, D2 completo y D3 quedaron para T-12/T-13). T-14 quedó Implementada: `type.numeric` en `src/theme/tokens.js` y su fila en `DESIGN.md`, sin tocar ninguna pantalla ni dependencias. Se preparó el resumen de T-12 (alcance, skills, qué revisa el design-auditor y qué arnés corre, qué evidencia hace falta de Anderson, y la lista íntegra de hallazgos pendientes de T-12/T-13, incluida la sombra/separación de pestañas sin medida).
- Usado / modificado / descartado: Usado: `node scripts/check-constitution.mjs --json` antes y después de T-14; script temporal fuera del proyecto (`tokens_t14.mjs` + `verify_t14.mjs` en el scratchpad) que compara `tokens.js` token por token contra los valores previos y verifica la forma exacta de `type.numeric`; `npx expo-doctor` (21/21). Modificado: `docs/backlog.md` (Estado de T-11 y T-14), `docs/progress.md` (filas CA-000-09, 10, 11, 12, 13/14, 15 y la parte funcional de D2), `specs/000-fundacion/spec.md` (nota de cierre en CA-000-09 a CA-000-15), `src/theme/tokens.js` (token nuevo + marca de IA), `DESIGN.md` (fila de `type.numeric` y viñeta actualizada), `docs/AI_LOG.md` (esta entrada). Descartado: tocar `CA-000-02` (pedía explícitamente «la navegación funciona», que T-11 sí cubrió, pero quedó fuera del rango literal «CA-000-09 a CA-000-15» que pediste; se avisa en la respuesta en vez de asumir que estaba incluido); tocar `CA-000-05` (sigue ⏳, sin cambios, como pediste); editar `specs/000-fundacion/plan.md` (T-14 no cambia el mapa CA → implementación, no tiene CA propio).
- Archivos y commit: docs/backlog.md, docs/progress.md, specs/000-fundacion/spec.md, src/theme/tokens.js, DESIGN.md, docs/AI_LOG.md; commit: a5dffc8 (docs/backlog.md, docs/progress.md, specs/000-fundacion/spec.md, docs/AI_LOG.md) y 22e9d14 (src/theme/tokens.js, DESIGN.md).
- Verificación: `node scripts/check-constitution.mjs --json`: antes de tocar `tokens.js`, 44 errores C21 (línea base) y 0 C23 (ya corregido en la entrada #21). Justo después de añadir la marca de IA a `tokens.js` y antes de escribir esta entrada, apareció 1 error C18 nuevo («AI-assisted … #23» sin `### Entrada #23` todavía) — esperado, porque esta misma entrada lo resuelve. Tras escribirla: 44 errores C21 (sin cambio) y 0 C18/C23; las 5 reglas INFO «inactiva» (C12, C13, C19, C20, C25) son ruido de fase, no errores (vigentes desde las fases 4-5, la actual es 3). `npx expo-doctor`: 21/21. Script propio: 10 comprobaciones sin fallos (forma exacta de `type.numeric`, ausencia de `fontSize`/`lineHeight`/`fontWeight` en él, y los demás 7 grupos de tokens byte-idénticos a los de antes de T-14).
- Aprendizaje:

### Entrada #24
- Fecha: 2026-11-01
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Cerrar T-14, aplazar T-12 y T-13, asignar hashes de commit a la bitácora, y especificar y planificar el registro funcional (spec 001-registro-conductor, Pestañas 1 y 2 completas, Pestaña 3 mínima, con Firestore) para la entrega parcial del 2026-11-05.
- Prompt textual:
````
Cambio de prioridad: entrega parcial el jueves 2026-11-05. Aplaza T-12 y T-13 y planifica el registro funcional.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-01, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar T-14, aplazar T-12 y T-13 y especificar y planificar el registro funcional (Pestañas 1, 2 y 3 mínima) con Firestore", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Cierres de la spec 000:
   a. Anderson revisó el informe del verifier de T-14 (token type.numeric, sin cambio visible) y lo confirma: T-14 pasa a «Validada». Actualiza backlog, progress y spec.
   b. Incluye CA-000-02 en lo que cubrió T-11: la navegación funciona, solo en Android y por declaración de Anderson, sin capturas. iOS sigue sin verificar (P-05).

2. Decisión (aprobada por Anderson, registrada por el agente principal): aplaza T-12 y T-13 por la entrega parcial del 2026-11-05. Quedan en backlog como pendientes, con todos los hallazgos de diseño ya anotados. Motivo adicional: el contenido de las tres pestañas de registro será reemplazado por el registro funcional, así que auditarlo ahora sería trabajo perdido. No ejecutes T-12 ni T-13.

2b. Hashes de commit para docs/AI_LOG.md («Archivos y commit»), todos ya fusionados en main (merge 1d4b89a, PR #1):
   - 407d196 docs: spec 000, decisiones y bitácora de IA actualizadas (T-01 a T-10)
   - 4509788 feat: base de la app, navegación y backend /health (T-01 a T-10)
   - 22e9d14 feat: token type.numeric para cifras (T-14)
   - a5dffc8 docs: cierre de T-09, T-10 y T-11 y bitácora de IA actualizada
   Asigna cada hash a las entradas de la bitácora según los archivos que cada una afectó. Si una entrada no se puede asignar con seguridad a un solo commit, anota los hashes posibles o «por confirmar»; no inventes. Las entradas #1 a #24 llevan esos hashes; las nuevas de este prompt todavía no tienen commit.

3. Alcance de la entrega (confirmado por la profesora vía Anderson, F1 §2): Pestaña 1 (Datos personales, 8 campos) y Pestaña 2 (Vehículo, 7 campos) totalmente funcionales con sus validaciones de F1 §2; Pestaña 3 mínima; botón «Enviar registro» habilitado solo cuando las tres pestañas están completas y válidas; al enviar, la cuenta pasa a «Pendiente de aprobación»; datos guardados en Firestore; las fotos deben subirse de verdad. Errores debajo de cada campo, nunca en un Alert. Ningún campo nulo o vacío.

4. Decisiones propuestas (Anderson las aprueba al enviar este prompt; si alguna te parece riesgosa, dilo antes de especificar y propón alternativa):
   a. Firestore con el SDK de JavaScript (paquete firebase), no @react-native-firebase. Reglas de seguridad por uid (nada abierto a todos).
   b. Identidad: Firebase Auth anónimo; el uid es el driverId. Persistencia con AsyncStorage solo para la sesión, nunca para datos sensibles.
   c. Fotos: Cloudinary con upload preset sin firma, subida directa desde la app; sin ningún secreto en la app. Configuración por variables públicas de entorno, con los NOMBRES en .env.example. No leas ni pidas el .env.
   d. Pestaña 3 mínima: correo de Mercado Pago (validación de formato) + checkbox de términos con el porcentaje de comisión visible. Licencia, SOAT y revisión técnico-mecánica quedan como pendientes anotados (P-04 sigue aparcada).
   e. Listas desplegables con Modal y FlatList, sin dependencia nativa.
   f. El estado de la cuenta pasa a ser real: documento del conductor en Firestore con campo accountStatus escuchado con onSnapshot (reemplaza el simulador provisional cuando corresponda; propón qué tarea lo retira). «Aprobado» se simula cambiando el campo en la consola de Firestore, como dice F1 §2.
   g. El backend Express no se toca en esta entrega salvo que algo lo exija; dilo si lo exige.

5. Ejecuta fases 1 y 2 de SDD con los agentes que corresponden: spec-author para UNA spec del registro (di el número y el nombre según specs/README.md, y qué RF/RNF/ENT cubre), con criterios CA-NNN-XX por campo y por regla; luego planner para el plan y las tareas. Mantén la trazabilidad requisito↔tarea y las reglas de la constitución. Cada tarea debe decir su CA y su evidencia.

6. En el plan incluye: (i) una primera tarea que instale TODAS las dependencias nativas juntas (cámara y galería, selector de fecha, AsyncStorage y las que hagan falta) y diga exactamente qué cambia en app.json y qué comando de build debo ejecutar yo; verifica cada una contra scripts/dependencies.json y propón las altas necesarias. NO instales nada todavía. Mi entorno actual es Windows 11 con PowerShell, JAVA_HOME=C:\Program Files\Java\jdk-21.0.13.0.3, ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk (con API 36, NDK 27.1.12297006 y CMake 3.22.1), ANDROID_SDK_ROOT sin definir, celular Android físico por USB; el build nativo se ejecuta aquí por primera vez, así que dime también qué debo desinstalar del celular antes. (ii) el orden de tareas para llegar al jueves: hoy spec, plan y build; lunes Firebase, estado real y Pestaña 1 con fotos; martes Pestañas 2 y 3 y envío; miércoles pruebas, reglas de Firestore, README y bitácora. (iii) los riesgos y qué recortarías primero si el tiempo no alcanza.

7. Propón agrupar mi validación en el celular en tres puntos (Pestaña 1; Pestañas 2 y 3; envío completo y estado Pendiente) en lugar de una por tarea, manteniendo un verifier distinto en cada tarea. Dime qué regla de la constitución o de AGENTS.md habría que ajustar y deja la propuesta como decisión pendiente de mi aprobación. No la apliques.

8. Dime qué debo preparar yo y qué NO debo pegar nunca en un prompt (claves, tokens, datos reales). Lista las variables de entorno que el código va a necesitar, solo por nombre.

9. Detente aquí: no empieces la implementación, no instales nada, no hagas commit. Entrégame la spec, el plan, las decisiones nuevas y la lista de lo que apruebo. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): T-14 pasó a Validada y CA-000-02 quedó cerrada por declaración solo para Android (iOS sigue sin verificar); T-12 y T-13 quedaron aplazadas (D-51, Vigente); se asignaron hashes de commit a las entradas #1-23 de esta bitácora (407d196/4509788 para T-01 a T-10, 22e9d14 para T-14, a5dffc8 para el cierre de T-09/10/11). Se registraron D-52 a D-58 (Vigentes, los 7 puntos del encargo) y D-59 (Propuesta, agrupar la validación en 3 puntos). Se invocó al `spec-author` (spec 001-registro-conductor, Aprobada, 27 CA + 4 de diseño) y luego al `planner` (plan.md, tareas T-15 a T-29 en `docs/backlog.md`); al corregir una colisión de numeración entre mis decisiones y las que propuso el spec-author, se limpiaron duplicados en `docs/decisiones.md` y se renumeraron D-59 a D-63 del spec-author a D-60 a D-64, más D-65 del planner (promover 4 dependencias a `allowed`). Ninguna implementación empezó; nada se instaló; sin commit.
- Usado / modificado / descartado: Usado: subagentes `spec-author` y `planner` (Agent tool, agentes reales de `.claude/agents/`, no simulados); `WebSearch` y un subagente `web-fetch` para verificar contra la documentación vigente de Expo (https://docs.expo.dev/guides/using-firebase/, https://github.com/expo/fyi/blob/main/firebase-js-auth-setup.md) el comando de instalación de Firebase JS SDK y el patrón de persistencia de sesión anónima, en vez de confiar en memoria (regla de AGENTS.md "Expo ha cambiado"); `git show --stat` sobre los 4 commits para asignar archivos a hashes con evidencia, no por adivinanza. Modificado: `docs/AI_LOG.md` (hashes de las entradas #1-23, esta entrada), `docs/backlog.md` (T-14 Validada; T-12/T-13 aplazadas; T-15 a T-29 nuevas, del planner), `docs/progress.md` (CA-000-02; fila de la spec 001), `docs/decisiones.md` (D-51 a D-65; limpieza de la duplicación D-52 a D-63 que escribió el spec-author sin ver las mías), `specs/000-fundacion/spec.md` (cierre de CA-000-02), `specs/001-registro-conductor/spec.md` (nueva, del spec-author; renumerada y Estado corregido a Aprobada por mí), `specs/001-registro-conductor/plan.md` (nueva, del planner), `docs/requisitos.md` (columna Tareas de la fila 001), `DESIGN.md` (4 patrones de pantalla y una fila de contrato de testID, del spec-author). Descartado: dejar la spec 001 en "Borrador" esperando una aprobación aparte de Anderson (el prompt pedía explícitamente ejecutar fases 1 y 2 en el mismo turno, sin pausa; se marcó "Aprobada" citando esa autorización, pero las 5 decisiones nuevas D-60 a D-64 y la D-65 del planner quedan "Propuesta", pendientes de que Anderson las confirme una por una); aplicar D-59 (agrupar validación) o D-65 (promover dependencias) como Vigente sin que Anderson lo diga explícitamente.
- Archivos y commit: docs/AI_LOG.md, docs/backlog.md, docs/progress.md, docs/decisiones.md, specs/000-fundacion/spec.md, specs/001-registro-conductor/spec.md, specs/001-registro-conductor/plan.md, docs/requisitos.md, DESIGN.md; commit: ninguno aún.
- Verificación: `node scripts/check-constitution.mjs` NO se pudo ejecutar al cerrar esta entrada: `node` deja de resolverse en el PATH de esta terminal a mitad de la sesión (antes sí funcionaba, en la entrada #23 corrió sin problema); probado también con rutas directas y con `cmd.exe`/`powershell.exe`, mismo resultado. Es un problema del entorno de Anderson, no del código; pendiente de que Anderson revise su PATH (puede estar relacionado con el cambio reciente de variables de entorno de Android/Java del punto 6). Última corrida limpia conocida: la del cierre de la entrada #23 (44 errores C21 de línea base, 0 C18/C23, reglas INFO inactivas esperadas). El `spec-author` y el `planner` no ejecutan `check-constitution` (no es su rol); la primera vez que hace falta volver a correrlo es con T-15 (implementación), y debe hacerse antes de autorizarla.
- Aprendizaje:

### Entrada #25
- Fecha: 2026-11-01
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Aprobar las decisiones de la spec 001, ejecutar T-15 (instalación de dependencias) y avanzar T-16 a T-21 sin esperar el celular (D-59).
- Prompt textual:
````
Aprobaciones de la spec 001 y autorización de T-15.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-01, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Aprobar decisiones de la spec 001 y ejecutar T-15", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Precondición: antes de tocar nada, comprueba que `node` y `npm` resuelven en tu shell y ejecuta `node scripts/check-constitution.mjs` sobre el estado actual. Si node no resuelve, DETENTE y dímelo sin hacer nada más. Si resuelve, dame el resultado de check-constitution y confirma que lo único nuevo respecto de la línea base son los cambios de esta sesión.
   Además, hoy check-constitution da 37 errores y 32 advertencias. Explícame las 32 advertencias. Si son CA de la spec 001 que plan.md no menciona literalmente (regla C23), mapéalos en plan.md antes de empezar T-15; es solo trazabilidad, sin cambiar el alcance. Los errores C21 que queden deben ser solo requisitos de specs que todavía no tienen tareas.

2. Decisiones (aprobadas por Anderson, registradas por el agente principal):
   a. D-60 a D-64 quedan Vigentes.
   b. D-65 queda Vigente: promover firebase, @react-native-async-storage/async-storage, expo-image-picker y @react-native-community/datetimepicker a «allowed» en scripts/dependencies.json.
   c. DP-08 aprobada con un ajuste: como «Enviar registro» está deshabilitado hasta que todo sea válido, un intento de envío nunca ocurre. El error de cada campo se muestra tras tocarlo (al salir de él) y al cambiar de pestaña, para las pestañas ya visitadas. Corrige el texto de DP-08 y los CA que dependan de él.
   d. DP-09 aprobada: fecha de nacimiento con el selector nativo (@react-native-community/datetimepicker).
   e. D-59 queda Vigente: mi validación en el celular se agrupa en tres puntos (Pestaña 1; Pestañas 2 y 3; envío completo y estado Pendiente). Aplica el ajuste mínimo en la constitución o en AGENTS.md que corresponda y dime qué cambió. El verifier sigue siendo distinto del implementer en cada tarea, y el builder nunca aprueba.
   f. T-29 (auditoría de diseño de la spec 001) queda aplazada, igual que T-12 y T-13.

3. Autorizo T-15 (instalación conjunta de dependencias nativas). Ejecuta la tarea según el plan:
   - Instala TODAS juntas: usa `npx expo install` para los paquetes de Expo y compatibles con SDK 57 (expo-image-picker, @react-native-community/datetimepicker, @react-native-async-storage/async-storage) y npm install para firebase, con las versiones exactas que quedan fijadas en package.json. Nada fuera de las cuatro dependencias aprobadas.
   - Actualiza app.json con los plugins y permisos que correspondan (cámara y galería con textos en español para el usuario) y scripts/dependencies.json.
   - Verifica con check-constitution y expo-doctor, y dime cualquier advertencia.
   - NO ejecutes expo run, prebuild ni eas (deny). Dame el comando exacto de build para PowerShell con mi entorno (JAVA_HOME=C:\Program Files\Java\jdk-21.0.13.0.3, ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk, ANDROID_SDK_ROOT sin definir, API 36, NDK 27.1.12297006, CMake 3.22.1) y recuérdame desinstalar antes la app del celular. El build lo ejecuto yo.
   - Marca con «// AI-assisted: see docs/AI_LOG.md #N» lo que proceda.

4. Mientras yo hago el build, puedes avanzar con las tareas del plan que NO necesiten el binario nuevo ni el celular (funciones puras de validación, modelo de datos, servicio de Firebase, contexto), una a la vez, cada una con su verifier distinto, hasta la primera tarea que exija probar en el dispositivo. Para ahí, dime qué tarea fue y qué debo probar. No las marques como Validadas sin mi prueba cuando dependan del celular.

5. Variables de entorno: el código lee solo por nombre EXPO_PUBLIC_FIREBASE_API_KEY, _AUTH_DOMAIN, _PROJECT_ID, _STORAGE_BUCKET, _MESSAGING_SENDER_ID, _APP_ID, EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET. Añádelas, sin valores, a .env.example. Yo ya tengo un .env local con los valores: no lo leas ni me pidas valores.

6. No hagas commit. Resumen corto al terminar cada tarea y una lista final de lo que debo aprobar o probar.
````
- Resumen de la respuesta (2–3 líneas): `node`/`npm` resolvían al empezar (dejaron de resolver más tarde en esta misma sesión, ver Verificación). De los 37 errores, 35 eran specs sin tareas (línea base) y 2 (T-16, T-27 sin RF/RNF) se corrigieron añadiendo `RF-04`; de las 32 advertencias, 31 eran "CA sin fila en progress.md" (esperado en esta etapa, no un problema de mapeo: las 27 CA-001 y D1-D4 ya estaban en plan.md) y 1 un falso positivo (referencia cruzada a `CA-000-10` de la spec 000), corregido con una mención literal en plan.md. D-60 a D-65 y D-59 pasaron a Vigente; DP-08 se corrigió con el ajuste de Anderson (error al salir del campo + al cambiar de pestaña visitada, sin la rama de "intento de envío" que nunca ocurre); DP-09 confirmada; T-29 aplazada (D-51 ampliada); AGENTS.md P1 ganó la excepción nombrada de D-59. T-15 se implementó, pasó por dos rondas de verificación independiente (un hallazgo real: el texto del plugin no coincidía con el plan, corregido; un hallazgo que resultó ser un problema de secuencia de mi parte, no de alcance, aclarado en backlog/progress). Avancé T-16 a T-21 (Firebase, repositorio, Cloudinary, validadores, componentes de formulario) sin esperar el celular, cada uno verificado con `npx expo export` real y, donde tuvo sentido, un mini-renderizador o pruebas puras propias; encontré y corregí un incompatibilidad real entre `firebase/auth` (sin condición `"react-native"` en su `package.json`) y la guía citada en el plan, resuelta importando de `@firebase/auth` directamente. Me detuve en T-22 (necesita los módulos nativos nuevos, que solo existen en el build que Anderson va a compilar).
- Usado / modificado / descartado: Usado: `node scripts/check-constitution.mjs` (muchas rondas); `npx expo-doctor`; `npx expo export --platform android` repetido (import temporal desde `App.js`, siempre revertido, confirmado con `git diff --stat App.js` vacío cada vez) para probar que Metro resuelve cada archivo nuevo bajo las condiciones reales de React Native, incluida la condición `"react-native"` de los `package.json` de Firebase; mini-renderizador propio (`miniReact.mjs`, patrón de T-04/T-10) para `AppStateContext.js`; scripts de casos puros para `validators.js`; lectura directa de `node_modules/@firebase/auth/package.json`, `node_modules/@firebase/auth/dist/rn/index.rn.d.ts` y `node_modules/expo-image-picker/plugin/build/withImagePicker.d.ts` para verificar contra el código instalado, no contra memoria; dos subagentes `verifier` (Agent tool) para T-15. Nunca se leyó ni se pidió el `.env` real de Anderson; las pruebas de Firebase/Firestore/Cloudinary que exigían credenciales reales quedaron explícitamente sin hacer, anotadas como pendientes del checkpoint de dispositivo. Modificado: `docs/AI_LOG.md`, `docs/backlog.md` (T-15 a T-21, T-29), `docs/progress.md`, `docs/decisiones.md` (D-59 a D-65 Vigentes), `AGENTS.md` (excepción de P1), `specs/001-registro-conductor/plan.md` (DP-08 corregida, mención de CA-000-10), `DESIGN.md` (patrón del selector de fecha corregido a nativo, estado de las adiciones confirmado), `scripts/dependencies.json` (4 altas), `app.json`, `package.json`/`package-lock.json`, `.env.example` (nuevo), `src/services/{firebase,driverRepository,cloudinary}.js` (nuevos), `src/context/AppStateContext.js` (reescrito), `src/utils/validators.js` (nuevo), `src/constants/registrationOptions.js` (nuevo), `src/constants/labels.js` (amplía), `src/components/registration/{FieldError,TextField,SelectField,CheckboxField}.js` (nuevos). Descartado: instalar `firebase-tools`/un emulador de Firestore para probar T-16/T-17 de extremo a extremo (fuera del alcance de esta sesión y no autorizado); seguir con T-22 (depende del build nuevo de Anderson).
- Archivos y commit: ver lista completa arriba; commit: ninguno aún.
- Verificación: `node scripts/check-constitution.mjs` al cierre: 81 hallazgos — 35 C21 y 30 C23 de línea base (specs futuras sin tarea; CA-001 sin fila en progress.md todavía, esperado en esta etapa), 5 INFO de fase inactiva, y 11 C18 (marca `#25` sin esta entrada: se resuelven al guardar este archivo). Sin C01-C17, C22, C24, C26-C27 nuevos. `npx expo-doctor`: 21/21 en cada ronda. `npx expo export --platform android`: sin errores en cada ronda (1333 → 1364 módulos a medida que se añadió código). Aviso de entorno: a mitad de esta sesión `node`/`npm` dejaron de resolverse en esta terminal (funcionaban al principio de este prompt y en la entrada anterior) y luego volvieron a resolver solos antes de este prompt; no se tocó nada del entorno de Anderson para "arreglarlo", se reportó y se siguió cuando volvió a funcionar.
- Aprendizaje:

### Entrada #26
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Reglas de Firestore, evaluación de `@firebase/auth`, estado de T-15 a T-21 con verificación independiente real, y T-22 a T-24 (Pestaña 1) con un verifier distinto por tarea.
- Prompt textual:
````
Siguiente bloque: reglas de Firestore, revisión de @firebase/auth y Pestaña 1 (T-22 a T-24).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-01, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Reglas de Firestore, revisión de @firebase/auth y T-22 a T-24 (Pestaña 1)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Mientras yo compilo con `npx expo run:android`, NO toques app.json, package.json ni package-lock.json, ni nada nativo, y no ejecutes npx expo start, export, prebuild ni nada que use la caché de Metro o el directorio android. Para verificar solo usa scripts de casos puros, el mini-renderizador y check-constitution. Si necesitas bundlear con Metro, dímelo y espero a que yo avise que el build terminó.

2. Reglas de Firestore: dame el texto EXACTO de las reglas para pegar en la consola de Firestore, coherente con la colección y los campos reales de driverRepository. Requisitos:
   - Solo un usuario autenticado puede leer y escribir su propio documento (uid del documento = request.auth.uid). Nada abierto a todos.
   - El cliente NO puede aprobarse: al crear, accountStatus solo puede ser «pending» (o el valor de «sin enviar» que defina la spec), y después el cliente no puede cambiar accountStatus; solo yo lo cambio a mano desde la consola.
   - Valida tipos y límites básicos de los campos que ya definen la spec y los validadores (strings con longitud máxima, números, URLs https de las fotos).
   Explica en pocas líneas qué impide cada regla, cómo las pego en la consola y cómo compruebo en la consola que funcionan. Dime qué debo ver en el celular en el primer arranque con y sin reglas (con las reglas por defecto de producción, la app debería mostrar el estado de error).

3. @firebase/auth: hoy se importa directamente @firebase/auth porque firebase/auth no declara la condición «react-native». Evalúa si esa importación es robusta: @firebase/auth no está declarado en package.json y solo llega como dependencia transitiva; revisa también las reglas C15 y dependencies.json. Propón la opción más segura (por ejemplo declararlo con versión exacta, u otra) con sus pros y contras. NO añadas ninguna dependencia ni cambies package.json: espera mi OK.

4. Estado de tareas: dame una tabla con el estado real de T-15 a T-21 (Implementada, Validada solo en lo estático, Pendiente de dispositivo) y qué verifier distinto revisó cada una.

5. Continúa con T-22 a T-24 (Pestaña 1: selector de fecha, foto y la pestaña completa), una a la vez, cada una con su verifier distinto. Solo verificación estática; yo pruebo en el celular al terminar el build, como un único checkpoint (D-59). Reglas: errores debajo de cada campo según DP-08, ningún Alert para errores de validación, textos en labels.js, tokens, contrato de testID de DESIGN.md, marcas «// AI-assisted: see docs/AI_LOG.md #N». Sin dependencias nuevas.

6. Al terminar T-24 dame el checklist exacto del checkpoint 1 (Pestaña 1 completa en el celular): qué debo ver, qué CA cierra cada paso y qué evidencia anotar. Incluye: cada uno de los 8 campos con casos válidos e inválidos (límites de F1 §2), mensaje de error bajo el campo, foto por cámara y por galería, permiso con texto en español, subida real a Cloudinary, guardado real en Firestore y cómo compruebo el documento en la consola, escala de texto máxima, y qué pasa al cerrar y reabrir la app.

7. No hagas commit. Resumen corto y lista final de lo que debo aprobar o probar.
````
- Resumen de la respuesta (2–3 líneas): Entregué `firestore.rules` (texto exacto, explicación de cada regla, cómo pegarlo/probarlo en el simulador de la consola, comportamiento esperado con y sin reglas) y el análisis de `@firebase/auth` (riesgo real: invisible para C15; opción recomendada, pin exacto en package.json, sin aplicar, esperando tu OK). Implementé T-22 (DateField/PhotoField, verificado contra los `.d.ts` reales), T-23 (RegistrationFormContext + wiring de RegistrationTabs) y T-24 (PersonalDataScreen con los 8 campos reales) sin tocar nada nativo ni usar Metro. Lancé 5 verifiers independientes en paralelo (T-16-18, T-19-21, T-22, T-23, T-24): todos limpios salvo T-21, que un verifier rechazó por un color `rgba(...)` fuera de tokens en `SelectField.js` — lo corregí (junto con dos hallazgos menores más del mismo informe) y pedí una re-verificación, en curso. Preparé la tabla de estado T-15 a T-21 y el checklist del checkpoint 1.
- Usado / modificado / descartado: Usado: 6 subagentes `verifier` (Agent tool) en esta entrada (T-15 re-chequeo de contexto no, ese fue la anterior; aquí: T-16-18, T-19-21, T-22, T-23, T-24, y una re-verificación de T-21 tras la corrección); lectura directa de `node_modules/@react-native-community/datetimepicker/src/index.d.ts` y `node_modules/expo-image-picker/build/{ImagePicker,ImagePicker.types}.d.ts` para no inventar la API; `node_modules/@react-navigation/core/.../types.d.ts` para confirmar `screenListeners`; mini-renderizador propio (`scratchpad/t18/miniReact.mjs`, reutilizado) para probar `RegistrationFormContext.js` (8 escenarios) sin Metro; script de 50+ casos puros para `validators.js` (ya existente, reusado y ampliado por los verifiers con sus propios casos, hasta 108). Nunca se ejecutó `expo start`/`export`/`prebuild`; nunca se tocó `app.json`/`package.json`/`package-lock.json`/nada nativo en todo este prompt (confirmado con `git status --short` en cada ronda). Nunca se leyó el `.env` real de Anderson, aunque `check-constitution` lo señaló por contener un literal con forma de clave de Firebase (hallazgo esperado y correcto del script: el archivo está gitignorado, nunca se versiona; no se citó el valor completo en ningún documento). Modificado/creado: `firestore.rules` (nuevo), `src/components/registration/{DateField,PhotoField}.js` (nuevos), `src/context/RegistrationFormContext.js` (nuevo), `src/navigation/RegistrationTabs.js` (envuelve con el provider), `src/screens/registration/PersonalDataScreen.js` (reescrita), `src/constants/labels.js` (amplía), `src/components/registration/SelectField.js` (corrige el color fuera de tokens que encontró el verifier de T-21), `src/services/cloudinary.js` (corrige el `response.json()` sin `try/catch` que encontró el mismo informe), `docs/backlog.md` y `docs/progress.md` (Estado y CA de T-16 a T-24, escritos sobre todo por los verifiers, no por mí). Descartado: crear `src/config/pricing.js` para la constante de comisión (activaba C08, que exige `calculateFare`, fuera de alcance de esta spec); se quedó como constante local en `RegistrationFormContext.js`. Descartado también: aplicar la opción recomendada para `@firebase/auth` o cualquier cambio de `package.json`/`scripts/dependencies.json` (esperando el OK explícito de Anderson, punto 3).
- Archivos y commit: ver lista completa arriba; commit: ninguno aún.
- Verificación: `node scripts/check-constitution.mjs` tras todas las correcciones: 48 hallazgos — 35 C21 de línea base, 2 C23 (filas de `progress.md` que todavía no existen), 5 INFO de fase inactiva, 1 C01 esperado (el `.env` real de Anderson, gitignorado, no leído más allá del hallazgo truncado del propio script), y 5 C18 (marca `#26`, sin entrada hasta este archivo: se resuelven al guardarlo). Sin ningún otro hallazgo. `git status --short` confirmó en cada ronda que no se tocó nada nativo. Cinco verifiers independientes revisaron T-16 a T-24 (ninguno es el implementer); el único defecto real que encontraron (T-21, color fuera de tokens) se corrigió y está pendiente de una sexta re-verificación, en curso al cerrar esta entrada.
- Aprendizaje:

### Entrada #27
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Declarar `@firebase/auth`, confirmar las reglas de Firestore, e implementar T-25 a T-27 (Pestañas 2 y 3, envío, reglas) con un verifier distinto por tarea.
- Prompt textual:
````
Aprobación de @firebase/auth y continuación con Pestañas 2 y 3 y envío.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Declarar @firebase/auth y continuar con T-25 en adelante (Pestañas 2 y 3, envío)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Decisión (aprobada por Anderson, registrada por el agente principal): declara "@firebase/auth": "1.13.8" (versión exacta, igual a la que ya trae firebase) en package.json y muévelo a «allowed» en scripts/dependencies.json. Es solo JavaScript: no hace falta recompilar. Comprueba con `npm ls @firebase/auth` que queda una sola copia y que check-constitution y expo-doctor siguen limpios. El build ya terminó, así que ya puedes usar Metro y `npx expo export` si lo necesitas; yo estoy probando el checkpoint 1 en el celular, así que NO reinicies ni detengas mi Metro (si necesitas bundlear, usa `npx expo export` sin tocar el servidor).

2. Reglas de Firestore: confirma en una frase que firestore.rules impide que el cliente se apruebe a sí mismo (accountStatus) y que la regla de creación y la de actualización cubren el flujo de «Enviar registro» de la spec (creación con accountStatus «pending» al enviar, sin cambios posteriores del cliente). Si algo no cuadra, dímelo antes de seguir.

3. Continúa con T-25 en adelante según el plan (Pestaña 2 Vehículo, Pestaña 3 mínima, Enviar registro y paso a Pendiente, retiro del simulador cuando corresponda), una tarea a la vez, cada una con su verifier distinto. Solo verificación estática hasta los checkpoints 2 y 3 (D-59). Reglas: errores debajo de cada campo según DP-08, ningún Alert para validación, textos en labels.js, tokens, contrato de testID de DESIGN.md, marcas «// AI-assisted: see docs/AI_LOG.md #N». Sin dependencias nuevas.

4. Cuando termines, dame los checklists exactos de los checkpoints 2 (Pestañas 2 y 3) y 3 (envío completo y estado Pendiente) con qué debo ver, qué CA cierra cada paso y qué evidencia anotar. En el checkpoint 3 incluye cómo compruebo en la consola de Firestore el documento creado, qué campos debe tener, cómo cambio accountStatus a «approved» a mano y qué debo ver entonces en el celular, y qué pasa con la foto subida en Cloudinary.

5. Dime también qué falta para la entrega del jueves (README con instalación y variables de entorno, sección «Uso de IA», bitácora y PDF, PR) y qué tareas del plan quedarían sin hacer, ordenadas por lo que recortarías primero.

6. No hagas commit. Resumen corto y lista final de lo que debo aprobar o probar.
````
- Resumen de la respuesta (2–3 líneas): `@firebase/auth` declarado en `package.json` (versión exacta 1.13.8) y promovido a `allowed` (D-66 Vigente); `npm ls` confirma una sola copia deduplicada; `check-constitution`/`expo-doctor` limpios. Confirmé que `firestore.rules` impide la auto-aprobación y cubre el flujo de envío completo (creación/actualización exigen `accountStatus=='pending'`, bloqueo total una vez `'approved'`). Implementé y verifiqué (cada una con un `verifier` subagente distinto) T-25 (Vehículo), T-26 (Documentos + envío) y T-27 (ampliación de las reglas, ya escritas en el prompt anterior): las tres "Validada en lo estático", sin defectos reales. Primera vez que uso Metro real (`npx expo export`, sin tocar el servidor de Anderson) para confirmar que toda la cadena T-16 a T-26 bundlea junta (1390 módulos). Preparé los checklists de los checkpoints 2 y 3 y el resumen de qué falta para el jueves.
- Usado / modificado / descartado: Usado: `npm ls @firebase/auth`, `npm install` (sin instalar nada nuevo, solo actualiza `package-lock.json`); 3 subagentes `verifier` (T-25, T-26, T-27), todos con permiso explícito de usar `npx expo export --platform android` (proceso de una sola pasada, nunca `expo start`/`prebuild`, nunca el servidor de Anderson); `node_modules` de los paquetes reales para cualquier duda de API. Modificado: `package.json`/`package-lock.json` (`@firebase/auth`), `scripts/dependencies.json`, `docs/decisiones.md` (D-66 Vigente), `src/screens/registration/{VehicleScreen,DocumentsScreen}.js` (reescritas), `src/context/RegistrationFormContext.js` (exporta `COMMISSION_RATE_PERCENT`), `src/constants/labels.js` (amplía: vehicle, documents), `docs/backlog.md`/`docs/progress.md` (Estado y CA de T-25 a T-27, escritos sobre todo por los verifiers). Descartado: tocar `src/components/PrimaryButton.js` para el botón de envío (no estaba en el alcance declarado de T-26; se construyó un botón local en `DocumentsScreen.js` en su lugar, confirmado sin riesgo por el verifier); crear una tarea aparte para "retirar el simulador": sigue condicionado a que también exista la spec 008 (D-38/D-47/D-50 ya lo dejaban así), así que no se retira todavía, se explica en la respuesta al usuario en vez de decidirlo unilateralmente.
- Archivos y commit: ver lista completa arriba; commit: ninguno aún.
- Verificación: `node scripts/check-constitution.mjs` al cierre: 43 hallazgos — 35 C21 de línea base, 0 C23 (todas las filas de `progress.md` ya existen, por primera vez en esta spec), 5 INFO de fase inactiva, 1 C01 esperado (`.env` real, gitignorado, no leído), y 2 C18 (marca `#27`, sin entrada hasta este archivo: se resuelven al guardarlo). `npx expo-doctor`: 21/21. `npx expo export --platform android`: 1389-1390 módulos, sin errores, en cada ronda (implementer y los 3 verifiers), sin tocar nunca el servidor de Anderson ni archivos nativos (`git status --short` limpio de eso en cada ronda). Tres verifiers independientes (T-25, T-26, T-27), ningún defecto real encontrado.
- Aprendizaje:

### Entrada #28
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Registrar el checkpoint 1 y diagnosticar (sin corregir todavía) la subida de foto a Cloudinary.
- Prompt textual:
````
Resultado del checkpoint 1 y diagnóstico de la subida de foto.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Registrar el checkpoint 1 y diagnosticar la subida de foto a Cloudinary", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Si estás en medio de una tarea del prompt anterior, termínala y verifícala antes de empezar esto.

1. Resultado del checkpoint 1 en el celular Android (Anderson, 2026-11-02, con capturas):
   - Paso 1: al principio FALLABA (la app quedaba en «Cargando» y pasaba a «No pudimos cargar»). Causa: las reglas de firestore.rules no estaban publicadas en la consola de Firestore (seguían las de fábrica, allow read, write: if false). Anderson las publicó y ahora la app abre directamente en «Datos personales». Regístralo como causa de configuración y no de código, anota que la verificación estática no podía detectarlo, y marca el paso 1 como OK por declaración.
   - Paso 2 OK: pasar de Datos personales a Vehículo y volver muestra los errores en rojo bajo los 8 campos.
   - Paso 3 SIGUE FALLANDO: los permisos de cámara y galería salen bien y en español, pero tanto por cámara como por galería aparece «No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.»
   - Pasos 4 a 8 OK: nombre, documento y celular inválidos dan error inmediato bajo su campo; la fecha de 2019 da el error de mayor de 18 y desaparece con una fecha válida; género e idioma correctos; ningún error en un Alert.
   - Pasos 9, 10 y 11 OK por declaración. El 12 no aplica.
   - Prueba manual con curl.exe contra el mismo cloud name y preset del .env (imagen de 1x1 píxel con --form-string) devolvió respuesta correcta de Cloudinary con secure_url. Cuenta, preset sin firma y variables son válidos; el fallo está en el código de la app o en cómo se arma la petición en React Native/Android.
   Estado: T-22, T-23 y T-24 NO pasan a Validada hasta que la foto funcione. T-19 queda «En diagnóstico». T-16 y T-18 quedan OK por declaración (el arranque funciona).

2. Diagnóstico de la subida de foto, ANTES de cambiar código, con evidencia. Revisa al menos:
   a. Que EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET llegan con valor a src/services/cloudinary.js en tiempo de ejecución, sin imprimirlos (registra solo si están vacíos o no).
   b. El formato del FormData en React Native: campo file como { uri, type, name }, con type real (image/jpeg) y name con extensión; sin fijar Content-Type a mano, para que fetch genere el boundary.
   c. La URL del endpoint (https://api.cloudinary.com/v1_1/<cloud>/image/upload) y el método.
   d. La uri que devuelve expo-image-picker en Android (file:// o content://) y si las opciones de calidad o de base64 influyen.
   e. Cómo se capturan y clasifican los errores: hoy la causa real se oculta tras el mensaje genérico de «conexión». Distingue error de red (fetch rechazado) de respuesta HTTP con error de Cloudinary.
   f. Cualquier timeout o AbortController que corte la subida antes de tiempo.

3. Instrumentación TEMPORAL: console.warn en cloudinary.js que imprima SOLO el paso (armar petición, enviar, leer respuesta), el estado HTTP, el campo error.message de la respuesta de Cloudinary y el tipo de error de red. PROHIBIDO imprimir valores de variables de entorno, claves, tokens, URLs completas con credenciales, uid ni contenido de documentos. Márcalo TEMPORARY, regístralo en docs/decisiones.md con la tarea que lo retira y retíralo al cerrar. Dime exactamente qué líneas debo copiar de la terminal de Metro tras repetir la subida por cámara y por galería.

4. Muéstrame la causa con evidencia y espera a decirte qué corregirás antes de cambiar código de producción. Si la foto del vehículo (Pestaña 2) comparte este servicio, no la construyas sobre código roto: deja anotado qué espera esta corrección.

5. Restricciones: NO reinicies ni detengas mi Metro (usa `npx expo export` si necesitas bundlear). No leas ni toques mi .env. Sin dependencias nuevas. No marques nada como Validada. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Registré el checkpoint 1 (paso 1 OK por declaración, causa de configuración —reglas de Firestore sin publicar—, no de código; pasos 2 y 4-11 OK; paso 3 FALLA en cámara y galería) en `docs/backlog.md`/`docs/progress.md`; T-19 pasó a "EN DIAGNÓSTICO", T-22/T-23/T-24 quedaron bloqueadas para "Validada" hasta que se resuelva, ninguna se tocó hacia arriba. Diagnostiqué por revisión de código (sin cambiar nada de producción): el `catch` de `fetch()` no tenía parámetro y descartaba el error real, por eso el mensaje era siempre el mismo genérico. Añadí instrumentación TEMPORAL (D-67, Vigente, PROVISIONAL) en `src/services/cloudinary.js` que captura el error real sin imprimir secretos, y pedí las líneas exactas a copiar. No cambié ningún comportamiento de producción (la lógica de subida es idéntica, solo se agregó `console.warn`).
- Usado / modificado / descartado: Usado: `WebSearch` sobre errores comunes de "Network request failed" con `fetch`/`FormData`/`expo-image-picker` en Android, para contrastar la hipótesis con precedentes documentados (no para copiar una solución a ciegas); lectura de `node_modules/expo-image-picker/build/ImagePicker.types.d.ts` (confirma que `ImagePickerAsset` tiene `mimeType`/`fileName` reales, que el código actual ignora al hardcodear `'image/jpeg'`/`'photo.jpg'`); `npx expo export --platform android` para confirmar que el archivo instrumentado sigue bundleando (proceso aparte, sin tocar el servidor de Anderson). Modificado: `src/services/cloudinary.js` (instrumentación temporal, sin cambiar la lógica de subida ni los mensajes de error finales), `docs/decisiones.md` (D-67), `docs/backlog.md`/`docs/progress.md` (checkpoint 1, T-16/T-18 "OK por declaración", T-19 "EN DIAGNÓSTICO", bloqueo de T-22/T-23/T-24). Descartado: cambiar `type`/`name` del `FormData` a los valores reales de `mimeType`/`fileName` del asset, o cualquier otro cambio de la lógica de subida — el prompt pide explícitamente esperar la evidencia y la decisión de Anderson antes de tocar código de producción.
- Archivos y commit: `src/services/cloudinary.js`, `docs/decisiones.md`, `docs/backlog.md`, `docs/progress.md`, `docs/AI_LOG.md`; commit: ninguno aún.
- Verificación: `node scripts/check-constitution.mjs` tras la instrumentación: 42 hallazgos — 35 C21 de línea base, 1 C01 esperado (`.env` real, no leído), 5 INFO de fase inactiva, y 1 C18 (marca `#28`, sin entrada hasta este archivo: se resuelve al guardarlo). Sin C27 (el script no encontró "token"/"password"/"clave" en los `console.warn` añadidos: las claves registradas son `hasCloudName`, `hasUploadPreset`, `scheme`, `elapsedMs`, `status`, `ok`, `errorName`, `errorMessage`, `cloudinaryMessage`, ninguna imprime un valor real de entorno, token o URL con credenciales). `npx expo export --platform android`: sin errores, sin tocar el `expo start --dev-client` de Anderson (confirmado con `git status --short` antes y después, sin cambios nativos). No se marcó ninguna tarea como "Validada" en esta entrada; T-16 y T-18 quedan "OK por declaración" (no "Validada") según pidió Anderson.
- Aprendizaje:

### Entrada #29
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Corregir la subida de foto a Cloudinary con base64 como parte de texto.
- Prompt textual:
````
Autorizo la opción C, no la A ni la B. Cámbialo así, sin dependencias nuevas y sin rebuild:

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE mensaje (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir la subida de foto a Cloudinary con base64 como parte de texto", con el mensaje completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Decisión (aprobada por Anderson, registrada por el agente principal): la opción A queda descartada por afectar el fetch global (incluido Firebase) sin confirmación en Android. La opción B queda como plan de respaldo si C falla por tamaño o memoria. La causa raíz (fetch de Expo 57 rechaza la parte { uri, type, name } con «Unsupported FormDataPart implementation») queda documentada en docs/decisiones.md como una decisión Vigente, con la evidencia de tu log.

2. Opción C: en PhotoField pide a expo-image-picker base64: true y una calidad cercana a 0.7. En cloudinary.js arma la parte file como string data:<mime>;base64,<datos> (el mime sale del resultado del picker; si no viene, usa image/jpeg), junto con upload_preset como parte de texto. No fijes Content-Type a mano. Mantén la clasificación de errores (red vs. respuesta de Cloudinary) y que el usuario vea mensajes claros y distintos.

3. Límites y privacidad: rechaza con un mensaje claro una imagen cuyo base64 supere unos 8 MB. El base64 solo vive en memoria durante la subida: no lo guardes en el contexto, en el estado persistente ni en Firestore (solo la URL resultante). NUNCA lo imprimas en consola.

4. Retira la instrumentación TEMPORARY de cloudinary.js al cerrar y actualiza decisiones.md. Actualiza los casos puros de cloudinary para la nueva forma de la petición. Pide a un verifier distinto que revise el cambio (formato del data URI, ausencia de Content-Type manual, límites, no filtración del base64). Los validadores y el resto de T-19 a T-24 no cambian.

5. Dime qué debo ver en el celular (cámara y galería: indicador de subida, foto visible, y que la URL de Cloudinary llegue al formulario) y qué debo copiar de Metro si vuelve a fallar. Es solo JavaScript: recargo con r, sin build. No reinicies ni detengas mi Metro. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Confirmé que `expo-file-system` (opción B) no está instalado (solo anidado dentro de `node_modules/expo`), descarté la opción A por el riesgo señalado por Anderson, y documenté la causa raíz y la elección de C como D-68 (Vigente), con D-67 retirada. Reescribí `cloudinary.js` (parte `file` como `data:<mime>;base64,<datos>`, límite de ~8 MB antes de subir, sin instrumentación) y `PhotoField.js` (pide `base64: true`, `quality: 0.7` al picker y pasa `{base64, mimeType}` al servicio); actualicé el contrato de `plan.md` (DP-11 y la firma de `uploadPhotoAsync`) a la nueva forma.
- Usado / modificado / descartado: Modificado: `src/services/cloudinary.js`, `src/components/registration/PhotoField.js`, `specs/001-registro-conductor/plan.md`, `docs/decisiones.md`. Descartado: opción A (riesgo sobre el `fetch` global) y opción B (dependencia nueva no instalada, de respaldo). No se tocó `validators.js` ni el resto de T-19 a T-24, como pidió el prompt.
- Archivos y commit: `src/services/cloudinary.js`, `src/components/registration/PhotoField.js`, `specs/001-registro-conductor/plan.md`, `docs/decisiones.md`, `docs/AI_LOG.md`; commit: ninguno aún.
- Verificación: `node scripts/check-constitution.mjs` antes del cambio (con la instrumentación todavía puesta): 42 hallazgos (35 C21 + 1 C01 esperado + 2 C26 por los comentarios `D-67`/plan en `cloudinary.js` + 5 INFO, sin contar el C18 de la marca `#28` ya resuelto). Después del cambio: 38 errores / 0 advertencias / 5 inactivas (35 C21 + 1 C01 esperado + 2 C18 de la marca `#29`, resueltos al guardar esta entrada) — tuve que reescribir dos comentarios para no citar `D-68` literalmente (regla C26, ya conocida de una ronda anterior con C08). Pendiente: verifier independiente sobre el cambio (formato del data URI, ausencia de `Content-Type` manual, límite de 8 MB, no filtración del base64) y confirmación de Anderson en el celular.
- Aprendizaje:

### Entrada #30
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Cerrar el checkpoint 1 y entregar el checkpoint 2.
- Prompt textual:
````
Cierre del checkpoint 1 y entrega del checkpoint 2.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar el checkpoint 1 y entregar el checkpoint 2", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado en el celular Android (Anderson, 2026-11-02): tras el cambio a base64 (D-68), la subida de foto por cámara y por galería funciona y no hay fallos. Sin capturas ni detalle por paso: regístralo así, sin inventar nada. Con eso el checkpoint 1 queda completo: T-22, T-23 y T-24 pasan a «Validada» (con Diseño Pendiente), y T-19 se cierra si el verifier independiente ya confirmó el cambio; si su informe no ha llegado, dímelo y no cierres T-19 sin él. Actualiza backlog, progress y spec.

2. Dame ya, sin más preámbulo: (a) una tabla con el estado real de T-25 a T-29 (Pendiente, Implementada, Validada en lo estático, y qué verifier distinto la revisó) y qué queda sin hacer para la entrega del jueves 2026-11-05; (b) el checklist del checkpoint 2 (Pestañas 2 y 3): qué debo ver paso a paso, qué CA cierra cada paso y qué evidencia anotar. Cubre los 7 campos de Vehículo con casos válidos e inválidos de F1 §2 (categoría, placa en mayúsculas ABC123, marca y modelo máximo 30, año de 4 dígitos no mayor al actual, color, capacidad con mínimo 6 para XL, foto del vehículo), la Pestaña 3 mínima (correo de Mercado Pago y términos con la comisión visible), errores bajo cada campo, escala de texto máxima y el botón «Enviar registro» deshabilitado hasta que las tres pestañas estén completas y válidas; (c) si el checkpoint 3 (envío completo y estado Pendiente) ya está listo, entrégalo también, con cómo compruebo el documento en la consola de Firestore, qué campos debe tener, cómo cambio accountStatus a «approved» y qué debo ver entonces en el celular. Si algo de T-25 en adelante aún no está construido, dilo y continúa construyéndolo, una tarea a la vez, cada una con su verifier distinto.

3. No reinicies ni detengas mi Metro. No leas ni toques mi .env. Sin dependencias nuevas. No marques como Validada nada que dependa de mi prueba en el celular. No hagas commit. Resumen corto y lista final de lo que debo aprobar o probar.
````
- Resumen de la respuesta (2–3 líneas): Registré el reporte de Anderson (celular Android, cámara y galería sin fallos tras D-68) y moví T-22, T-23 y T-24 a "Validada" (Diseño Pendiente) en `backlog.md`/`progress.md`/`spec.md`. El verifier independiente anterior (`aeca03da9c6d9dbe4`) no está disponible (no aparece en `ListAgents`, interrumpido por rate limit en el turno previo) y su informe no llegó: por instrucción explícita, T-19 NO se cerró y despaché un verifier nuevo y distinto para el cambio de D-68. Entregué la tabla de estado T-25–T-29, el checklist de checkpoint 2 y la evaluación de checkpoint 3, sin tocar código de producción ni commitear.
- Usado / modificado / descartado: Usado: `ListAgents` (confirma que el verifier anterior no está disponible). Modificado: `docs/backlog.md` (T-19, T-22, T-23, T-24), `docs/progress.md` (filas CA y bitácora narrativa), `specs/001-registro-conductor/spec.md` (estado de checkpoint 1). Descartado: cerrar T-19 sin el informe del verifier independiente (prohibido explícitamente por el prompt).
- Archivos y commit: `docs/backlog.md`, `docs/progress.md`, `specs/001-registro-conductor/spec.md`, `docs/AI_LOG.md`; commit: ninguno.
- Verificación: `node scripts/check-constitution.mjs` antes y después de las ediciones de este prompt (ver detalle en el resumen entregado a Anderson).
- Aprendizaje:

### Entrada #31
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Continuar con T-25 en adelante y entregar tabla de estado y checklists.
- Prompt textual:
````
Sí: continúa construyendo T-25 en adelante, una tarea a la vez, cada una con su verifier distinto, solo con verificación estática hasta los checkpoints 2 y 3 (D-59).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE mensaje (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Continuar con T-25 en adelante y entregar tabla de estado y checklists", con el mensaje completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Antes de seguir, dame la tabla que pedí y no entregaste: estado real de T-25 a T-29 (Pendiente, Implementada, Validada en lo estático), qué verifier distinto la revisó y qué queda sin hacer para la entrega del jueves 2026-11-05, con el orden en que recortarías si no alcanza el tiempo.

2. Dame el checklist del checkpoint 2 (Pestañas 2 y 3) tal como lo tienes, reescrito completo en tu respuesta (no me remitas a un mensaje anterior), con qué debo ver, qué CA cierra cada paso y qué evidencia anotar. Si la Pestaña 2 o la 3 no están construidas del todo, dilo y constrúyelas antes de dármelo.

3. Si el checkpoint 3 (envío completo y estado Pendiente) está listo, entrégalo también, con cómo compruebo el documento en la consola de Firestore, qué campos debe tener, cómo cambio accountStatus a «approved» y qué debo ver entonces en el celular, y qué pasa con las fotos en Cloudinary.

4. No reinicies ni detengas mi Metro. No leas ni toques mi .env. Sin dependencias nuevas. No marques como Validada nada que dependa de mi prueba en el celular. No hagas commit. Resumen corto y lista final de lo que debo aprobar o probar.
````
- Resumen de la respuesta (2–3 líneas): No se escribió código nuevo: T-25, T-26 y T-27 ya estaban "Validada en lo estático" desde el prompt anterior, cada una con verifier distinto, así que la respuesta fue solo investigación (backlog.md, progress.md, driverRepository.js, RegistrationFormContext.js, cloudinary.js) y entrega de la tabla T-25→T-29, el checklist completo del checkpoint 2 y la guía del checkpoint 3. Se corrigió la afirmación del resumen anterior de que "nada se había construido" — era falsa frente al estado real de los archivos.
- Usado / modificado / descartado: Usado (sin cambios de código): src/screens/registration/VehicleScreen.js, DocumentsScreen.js, src/services/driverRepository.js, src/services/cloudinary.js, src/context/RegistrationFormContext.js, firestore.rules, docs/backlog.md, docs/progress.md.
- Archivos y commit: Solo se editó docs/AI_LOG.md (esta entrada). Sin commit (instrucción explícita del punto 4).
- Verificación: `node scripts/check-constitution.mjs` limpio (36 errores C21 preexistentes sin tarea MAESTRO, 1 regla C25 inactiva — sin cambios respecto a la ronda anterior); `git status --short` sin cambios nativos inesperados.
- Aprendizaje:

### Entrada #32
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Registrar el checkpoint 2 y diagnosticar el error de permisos de Firestore al enviar el registro.
- Prompt textual:
````
Resultado del checkpoint 2 en el celular y fallo al enviar el registro.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Registrar el checkpoint 2 y diagnosticar el error de permisos de Firestore al enviar el registro", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de Anderson en el celular Android (2026-11-02, con captura):
   - Paso 0: las reglas de Firestore publicadas en la consola son IDÉNTICAS al firestore.rules de la raíz (Anderson las comparó). Confirmado: no es un problema de reglas sin publicar.
   - Paso 1 OK: Datos personales completados sin errores.
   - Paso 2 OK: Vehículo completado; las validaciones a mano funcionaron como indica el checklist.
   - Paso 3 OK: correo de Mercado Pago inválido da error y el válido se acepta; el botón «Enviar registro» sigue gris y sin efecto hasta marcar los términos, y se activa después.
   - Paso 4 FALLA: con todo válido y los términos marcados, al pulsar «Enviar registro» aparece en rojo, bajo el botón, «Missing or insufficient permissions.» (permission-denied). La colección drivers de Firestore sigue vacía: ninguna escritura ha entrado nunca.
   Registra: los pasos 1 a 3 del checkpoint 2 pasan por declaración; el envío (T-26 y T-27) queda abierto; T-26 y T-27 NO pasan a Validada.

2. Diagnóstico de causa raíz ANTES de cambiar nada, con evidencia. Compara firestore.rules (validSubmission, validPersonalData, validVehicle, validDocuments; create, update, isOwner) con la carga REAL que arma driverRepository al enviar, campo por campo y con el tipo real:
   a. Nombres de las claves en cada objeto frente a los que leen las reglas (fullName, documentNumber, phone, birthDate, gender, email, language, profilePhotoUrl; category, plate, brand, model, year, color, capacity, photoUrl; mercadoPagoEmail, termsAccepted, commissionRate; accountStatus).
   b. Tipos: year y capacity deben ser número en las reglas; confirma si el código los convierte a número antes de enviar o llegan como texto de los campos de entrada. documentNumber, phone y birthDate deben ser texto; commissionRate número.
   c. Formato y longitud: birthDate debe tener exactamente 10 caracteres (¿qué formato se guarda?); plate exactamente 6 (¿se envía ya normalizada en mayúsculas?); phone 10; documentNumber de 6 a 10; profilePhotoUrl y photoUrl deben empezar por https://.
   d. Los valores de gender, language, category y color que se envían (los códigos internos de registrationOptions.js) y si las reglas los limitan.
   e. Si la escritura es una creación o una actualización; si el documento existía antes del envío; que el id del documento sea exactamente el uid de la sesión anónima y que auth esté lista al enviar.
   f. Si la carga incluye algún campo o valor que las reglas prohíban o rompan (por ejemplo, valores undefined, null o campos con serverTimestamp mal ubicados).
   Muestra la regla y el campo exactos que causan el rechazo, o la hipótesis más probable con su evidencia.

3. Instrumentación TEMPORAL: justo antes de la escritura en driverRepository, console.warn con SOLO la FORMA de la carga: la lista de claves de cada objeto con el tipo de cada valor (typeof, y la longitud para textos), SIN valores, sin correos, sin URLs, sin uid completo. Márcalo TEMPORARY, regístralo en docs/decisiones.md con la tarea que lo retira y retíralo al cerrar. Dime qué líneas debo copiar de la terminal de Metro tras repetir el envío.

4. El Rules Playground ya no está disponible en la consola de Anderson (el botón «Desarrollar y realizar pruebas» solo abre información del Emulator Suite): NO prepares una prueba de Playground ni propongas instalar el Emulator Suite. Como evidencia usa la forma real de la carga (punto 3) comparada con las reglas, y construye tú un caso mental o un script de casos puros que evalúe cada condición de las reglas contra la carga real, indicando qué cláusula falla y por qué.

5. No cambies las reglas ni el código de envío hasta que yo te dé la respuesta o apruebe tu propuesta. Si la causa es que la app envía algo distinto, propón la corrección MÁS PEQUEÑA y dime si va en el código (conversión de tipos) o en las reglas (y por qué lo uno o lo otro). No toques la regla que impide que el cliente se apruebe a sí mismo.

6. Aparte (defecto de UX): el error del envío se muestra en inglés, tal como lo devuelve Firebase. Propón la corrección: mapear los códigos de error de Firestore (permission-denied, unavailable, etc.) a mensajes en español en labels.js, sin mostrar nunca el texto crudo del servidor. Aplícala solo tras mi aprobación.

7. No reinicies ni detengas mi Metro. No leas ni toques mi .env. Sin dependencias nuevas. No marques nada como Validada. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Confirmé por lectura de código (sin tocar `firestore.rules` ni el código de envío) que `vehicle.year` y `vehicle.capacity` llegan a Firestore como `string` (nunca convertidos), mientras `validVehicle()` exige `is number`, lo que hace fallar `validSubmission()` y deniega el `create` con "Missing or insufficient permissions" en el 100% de los intentos. Añadí una instrumentación TEMPORAL (shape-only) en `driverRepository.js`, registrada como D-69, y entregué el diagnóstico completo, la evaluación de casos puros contra las reglas y dos propuestas sin aplicar (conversión a número en el código; mapeo de errores al español), pendientes de aprobación.
- Usado / modificado / descartado: Usado (sin cambios): `firestore.rules`, `src/context/RegistrationFormContext.js`, `src/utils/validators.js`, `src/screens/registration/VehicleScreen.js`, `src/context/AppStateContext.js`, `src/constants/registrationOptions.js`. Descartado: preparar una prueba en Rules Playground o proponer el Emulator Suite (prohibido explícitamente por el punto 4); cambiar `firestore.rules` o el código de envío (prohibido por el punto 5 hasta la aprobación de Anderson).
- Archivos y commit: `src/services/driverRepository.js` (instrumentación TEMPORAL), `docs/decisiones.md` (D-69), `docs/AI_LOG.md` (esta entrada). Sin commit (instrucción explícita del punto 7).
- Verificación: `node scripts/check-constitution.mjs` antes de editar: 36 errores C21 preexistentes, 0 advertencias. Primera pasada tras añadir la instrumentación: nueva advertencia C26 (el comentario citaba "D-69, docs/decisiones.md" dentro del código fuente, un documento no entregado desde `src/`). Corregido el comentario para no citar el número de decisión; segunda pasada: 36 errores C21 preexistentes (sin cambio), 0 advertencias — línea base restaurada.
- Aprendizaje:

### Entrada #33
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Aplicar la conversión de tipos de year y capacity al enviar y los mensajes de error en español.
- Prompt textual:
````
Aprobación de las dos correcciones propuestas.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Aplicar la conversión de tipos de year y capacity al enviar y los mensajes de error en español", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Decisión (aprobada por Anderson, registrada por el agente principal): apruebo tu diagnóstico (year y capacity llegan como texto y las reglas exigen número) y la corrección en el CÓDIGO, no en las reglas. Registra la decisión como Vigente en docs/decisiones.md. firestore.rules no se toca; tampoco la regla que impide la autoaprobación.

2. Aplica la conversión a número justo antes del envío en submitRegistration (RegistrationFormContext.js). Debe garantizar enteros válidos: usa los mismos criterios que ya validan year y capacity y asegúrate de que nunca se envíe NaN, Infinity, un decimal ni un número vacío; si el valor no es un entero válido, no debe llegar a Firestore. Revisa si year o capacity se usan en otra parte con la suposición de que son texto (por ejemplo al leer el documento de vuelta en el formulario) y dime si hay algún otro lugar que deba tratarlos como número o como texto.

3. Revisa de nuevo, campo por campo, que la carga final cumple CADA condición de firestore.rules (no solo year y capacity): por si hay otra discrepancia latente además de esta, para no gastar otro ciclo.

4. Aplica también el mapeo de errores de Firestore a español en labels.js (permission-denied, unavailable, deadline-exceeded, unauthenticated y un mensaje genérico para el resto), usado en el catch de submitRegistration en lugar de error.message. Nunca muestres el texto crudo del servidor.

5. Casos puros: añade o actualiza casos de prueba que cubran la conversión (año y capacidad como texto numérico válido, con espacios, con decimales, vacío, NaN) y el mapeo de errores. Pide a un verifier DISTINTO del implementer que revise el cambio y la comparación con las reglas.

6. La instrumentación temporal D-69 (forma de la carga) se queda hasta que yo confirme que el envío funciona. Dime que la retirarás en cuanto yo te lo diga, no antes.

7. Dime qué debo ver en el celular al repetir el envío con Metro encendido (recarga con r): mensaje de éxito, y en Firestore el documento con los tipos correctos (year y capacity como número) y qué línea debo copiar de Metro si vuelve a fallar. Incluye ya el paso siguiente: cambiar accountStatus a «approved» en la consola y qué debe hacer el celular.

8. No reinicies ni detengas mi Metro. No leas ni toques mi .env. Sin dependencias nuevas. No marques nada como Validada hasta que yo pruebe. No hagas commit. Resumen corto.
````
- Resumen de la respuesta (2–3 líneas): Decisión D-70 registrada (fix en código, no en firestore.rules). Implementer convirtió year/capacity a número justo antes de enviar en `submitRegistration` (con revalidación, sin mutar el estado string) y agregó mapeo de errores Firestore→español en `labels.js` (`getSubmitErrorMessage`). Revisión campo por campo contra firestore.rules: sin otra discrepancia de tipo bloqueante (dos huecos preexistentes y fuera de alcance: `isHttpsUrl`/`isNonEmptyUrl` y límite de longitud de `mercadoPagoEmail`, no introducidos por esta tarea). D-69 permanece intacto. Verifier (distinto) confirmó todo con script propio (26/26 OK) y dio luz verde para la prueba en el celular.
- Usado / modificado / descartado: Usado el diagnóstico y la corrección en código tal como se propuso. Descartado un intento del implementer de instalar ESLint vía `npx expo lint` (se autoinstaló sin pedir permiso); lo revirtió él mismo (`git checkout -- package.json package-lock.json`, borró `eslint.config.js`) y usó `node --check` en su lugar. También corregido por el agente principal (no el implementer): el comentario del implementer en `RegistrationFormContext.js:152` citaba "D-70" y disparó una advertencia C26 nueva en check-constitution; se reformuló el comentario sin citar el número de decisión.
- Archivos y commit: `src/context/RegistrationFormContext.js`, `src/constants/labels.js` modificados; `docs/decisiones.md` (D-70), `docs/AI_LOG.md` (esta entrada). Sin commit (pendiente de prueba en el celular, por instrucción explícita).
- Verificación: `node scripts/check-constitution.mjs` antes de los cambios: 36 errores (1 C01 + 35 C21, preexistentes, fuera de alcance), 0 advertencias. Tras los cambios del implementer: mismos 36 errores, pero apareció 1 advertencia nueva C26 (comentario citando "D-70"). Corregido el comentario; segunda pasada: 36 errores (sin cambio), 0 advertencias — línea base restaurada. Script temporal propio (fuera del proyecto, copiando literalmente las funciones reales de validators.js/labels.js): 22/22 casos OK (año y capacidad: texto válido, con espacios, decimal, vacío, NaN, año futuro; mapeo de los 4 códigos de error + fallback genérico). Verifier DISTINTO invocado aparte: confirmó código vs. especificación, confirmó D-69 intacto, repitió check-constitution (mismo resultado: 36/0/5) y corrió su propio script (26/26 OK), con veredicto "listo para prueba en el celular". No verificado en dispositivo todavía.
- Aprendizaje: El patrón seguro para comentarios en código fuente es únicamente `// AI-assisted: see docs/AI_LOG.md #N`; cualquier cita de un número de decisión (p. ej. "D-70") o de una ruta de documento fuera de AI_LOG dispara la regla C26 de check-constitution. Conviene recordárselo al implementer en el prompt la próxima vez para evitar un ciclo extra de corrección.

---

### Entrada #34
- Fecha: 2026-11-02
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Cerrar checkpoints 2 y 3, retirar D-69 y preparar la entrega parcial del 2026-11-05
- Prompt textual:
````
Resultado del checkpoint 2 y 3 en el celular, cierre de la instrumentación y mejoras antes de la entrega del jueves.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-02, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar checkpoints 2 y 3, retirar D-69 y preparar la entrega parcial del 2026-11-05", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Resultado de la prueba de Anderson en el celular Android (2026-11-02, con captura de Firestore):
   - Paso 1 OK: registro completo con datos válidos (categoría XL y capacidad 6).
   - Paso 2 OK: el envío terminó sin errores. Observaciones: no aparece ningún mensaje de éxito; los datos escritos siguen visibles en las pestañas después de enviar.
   - Paso 3: Anderson no vio en la terminal de Metro la línea [TEMP][D-69]; no es bloqueante porque el envío funciona.
   - Paso 4 OK: en Firestore, colección drivers, el documento se creó con accountStatus pending, personalData, vehicle (year 2020 y capacity 6 como NÚMERO; brand, category «xl», color «rojo», model, plate «ABC123», photoUrl de Cloudinary), documents y updatedAt. profilePhotoUrl también es un enlace de Cloudinary. Observación: fullName se guardó con un espacio al final («Anderson Londoño »).
   - Paso 5 OK: Anderson cambió accountStatus a approved en la consola y la app pasó sola de las pestañas de registro a la pantalla principal, sin reiniciar.
   - Paso 6 OK: al cerrar y reabrir la app se mantiene en la pantalla principal.
   - Paso 7 OK en parte: al volver accountStatus a pending, la app regresó sola a las pestañas de registro, pero NO precargó los datos que ya estaban en la base de datos.
   Registra todo por declaración de Anderson, con captura solo de Firestore. Actualiza backlog, progress y spec: T-25, T-26 y T-27 pasan a «Validada» (Diseño Pendiente o N/A según corresponda), y los CA de envío, estado pending, aprobación en vivo (CA-001-24) y persistencia al reabrir pasan a ✅ por declaración. T-28 queda parcial: dime qué parte de T-28 queda sin probar (variantes de error como foto grande, sin conexión, valores en el límite).

2. Retira ya la instrumentación TEMPORARY D-69 de driverRepository.js (el envío funciona), actualiza decisiones.md y comprueba que no queda ningún otro registro TEMPORARY en el código. El verifier distinto debe confirmar que el cambio es solo la retirada.

3. Mejoras aprobadas por Anderson (decisiones registradas por el agente principal; si exigen cambiar la spec 001, enmiéndala con CA nuevos y trazabilidad y registra la decisión):
   a. Quitar espacios al inicio y al final de los campos de texto (al menos fullName, brand, model y correos) antes de validar y guardar, de modo que no se guarde «Anderson Londoño ». Añade casos puros.
   b. Mensaje de confirmación tras un envío correcto: «Registro enviado. Tu cuenta está pendiente de aprobación.» (texto en labels.js), visible y claro, con testID del contrato de DESIGN.md. Mientras accountStatus sea pending, el formulario no debe parecer editable ni permitir reenviar: muestra un aviso de «Pendiente de aprobación» en las pestañas y deshabilita «Enviar registro». Define el mínimo cambio que cumpla esto.
   c. Precarga desde Firestore: cuando el documento del conductor existe (accountStatus pending), las pestañas deben mostrar los datos ya guardados (solo lectura, o los campos rellenos y bloqueados), leídos con el mismo listener de driverRepository, convirtiendo year y capacity a texto para mostrarlos. Hazlo SOLO si cabe en una tarea pequeña, sin dependencias nuevas y sin cambiar las reglas; si no cabe, detente, dime por qué y propón la alternativa mínima. Es lo que demuestra la conexión de lectura con la base de datos en la entrega.
   d. Las reglas de Firestore no se tocan.

4. Crea las tareas nuevas en el plan (T-30 en adelante) con su CA, evidencia y verifier distinto, y ejecútalas en este orden: a, b, c. Verificación estática y yo pruebo en el celular al final, en un solo checkpoint (D-59). Reglas: textos en labels.js, tokens, contrato de testID de DESIGN.md, marcas «// AI-assisted: see docs/AI_LOG.md #N», sin Alert para validación, sin dependencias nuevas.

5. Provisionales para la entrega: hoy las pantallas muestran el panel «Estado de la pantalla (prueba)» y el «Simulador de cuenta (provisional)», y existe el botón «Simular solicitud (provisional)». Haz el inventario de TODO lo provisional que seguirá visible en la entrega del jueves y propón cómo retirarlo u ocultarlo con el menor riesgo (por ejemplo, detrás de una bandera de desarrollo), sin romper mis pruebas. No lo apliques sin mi aprobación.

6. Entrega del jueves: prepara el borrador del README.md (qué es el proyecto, requisitos, instalación en Windows con PowerShell, variables de entorno solo por nombre referenciando .env.example, cómo correr la app en dev-client y el backend, estado actual de la entrega, sección «Uso de IA» enlazando docs/AI_LOG.md) y revisa .env.example. Dime qué falta de F1 §9 y qué debo hacer yo a mano: llenar «Aprendizaje» en la bitácora, exportar docs/AI_LOG.md a PDF, hashes de commit de las entradas posteriores a la #24, Pull Request y fusión. Lista qué quedaría fuera de esta entrega parcial y qué debe ir en la bitácora como pendiente.

7. No reinicies ni detengas mi Metro. No leas ni toques mi .env. Sin dependencias nuevas. No marques como Validada nada que dependa de mi prueba en el celular. No hagas commit. Resumen corto y lista final de lo que debo aprobar o probar.
````
- Resumen de la respuesta (2–3 líneas): Por declaración de Anderson (captura solo de Firestore), T-25, T-26 y T-27 pasaron a «Validada» (Diseño Pendiente/N-A) y los CA de envío, `pending`, aprobación en vivo (CA-001-24) y persistencia al reabrir quedaron ✅; T-28 quedó «Pendiente» (falta la prueba integral completa: variantes de error como foto grande o sin conexión, valores límite, e iOS). Se retiró D-69 de `driverRepository.js` (decisión «Retirada», verifier distinto confirmó que el único cambio fue la retirada, sin otro registro TEMPORARY). Se crearon y ejecutaron T-30 (recorte de espacios, D-71), T-31 (confirmación de envío y bloqueo mientras `pending`) y T-32 (precarga desde Firestore, D-73), las tres en el orden a→b→c, cada una con verifier distinto y `Estado: Implementada` (checkpoint único consolidado en el celular aún pendiente, D-59 ampliada). Se entregó el inventario de elementos provisionales sin aplicar ninguna bandera (quedó para aprobación de Anderson) y un borrador de README junto con la lista de pendientes de F1 §9.
- Usado / modificado / descartado: Usado tal como se propuso en los tres puntos de código (D-71/T-30, T-31, D-73/T-32) y en la retirada de D-69. No se aplicó la bandera de ocultar provisionales (punto 5 del prompt la pedía solo como propuesta, sin aplicarla sin aprobación explícita de Anderson); esa aprobación llegó en el prompt siguiente (Entrada #35).
- Archivos y commit: `src/utils/validators.js`, `src/context/RegistrationFormContext.js`, `src/services/driverRepository.js`, `src/constants/labels.js`, `src/screens/registration/DocumentsScreen.js`, `src/screens/registration/PersonalDataScreen.js`, `src/screens/registration/VehicleScreen.js` (código); `docs/backlog.md`, `docs/progress.md`, `docs/decisiones.md` (D-69 retirada, D-71, D-73), `specs/001-registro-conductor/spec.md`, `specs/001-registro-conductor/plan.md`, `README.md` (borrador), `docs/AI_LOG.md` (esta entrada). Sin commit (regla del proyecto: ningún commit lo hace un agente).
- Verificación: `node scripts/check-constitution.mjs` antes y después de cada tarea (T-30, T-31, T-32) y de la retirada de D-69: 36 errores (preexistentes, fuera de alcance), 0 advertencias, sin cambio en ninguna pasada. Cada tarea con script de prueba propio fuera del proyecto contra las funciones reales (casos puros) y verifier distinto del implementer, con veredicto favorable en lo estático. El checkpoint único consolidado en el celular (D-59 ampliada) para T-30/T-31/T-32 seguía pendiente al cierre de esta entrada; por eso ninguna de las tres pasó de «Implementada» a «Validada» aquí.
- Aprendizaje: (pendiente: Anderson)

---

### Entrada #35
- Fecha: 2026-11-04
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Aprobar la bandera de herramientas de prueba y preparar el cierre de la entrega parcial
- Prompt textual:
````
Cierre de la entrega parcial del 2026-11-05.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-04, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Aprobar la bandera de herramientas de prueba y preparar el cierre de la entrega parcial", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar.

1. Decisión (aprobada por Anderson, registrada por el agente principal): aplica tu propuesta de la bandera SHOW_DEV_TOOLS (constante en un solo archivo, no variable de entorno, sin dependencias nuevas) para el selector «Estado de la pantalla (prueba)», el «Simulador de cuenta (provisional)» y el botón «Simular solicitud (provisional)». El valor que queda en el repositorio es FALSE (la entrega no muestra ningún panel de prueba). Anderson lo cambia a true solo en su copia local cuando lo necesite. Deja un comentario claro en la constante explicando eso. Comprueba que con false la app sigue abriendo, que el flujo de registro no depende de ningún panel y que con true todo se comporta como hoy. Verifier distinto.

2. D-23: documenta como decisión Vigente que, al ser un solo integrante, los Pull Requests se revisan por autorrevisión con una lista de verificación. Crea .github/pull_request_template.md con esa lista (sin .env ni claves, marcas «AI-assisted» en el código, bitácora actualizada, check-constitution sin errores nuevos, probado en el celular), en español. Sin dependencias nuevas.

3. Prepara para Anderson una guía de la bitácora: lista cada entrada de docs/AI_LOG.md posterior a la #24 que aún no tenga hash de commit o «Aprendizaje», con su número, título y 2 líneas de qué hizo el cambio y qué archivos tocó, para que Anderson escriba SU propio «Aprendizaje». No redactes el «Aprendizaje» por él.

4. Prepara también una guía de estudio para la sustentación (F1 §8: cualquier integrante puede ser llamado a explicar un bloque asistido por IA): lista los 8 a 10 bloques más importantes marcados «AI-assisted» de lo ya construido (validadores, reglas de Firestore, subida de foto con base64 y por qué, contexto de estado de cuenta con onSnapshot, navegación, envío del registro y por qué year y capacity se convierten a número, etc.), con archivo y línea aproximada y 2 o 3 preguntas que un profesor podría hacer por bloque. Solo texto, sin tocar código.

5. Lista de verificación previa a la entrega: confirma que .env no está en el repositorio ni en el historial (git log por archivos, solo lectura), que .env.example y .gitignore son correctos, que el README es coherente con el estado real, y qué CA de la spec 001 siguen «No verificado en dispositivo». Dime qué queda como pendiente para la bitácora y el README.

6. No reinicies ni detengas mi Metro. No leas ni toques mi .env. Sin dependencias nuevas. No marques como Validada nada que dependa de mi prueba. No hagas commit. Resumen corto y lista final de lo que debo hacer yo.
````
- Resumen de la respuesta (2–3 líneas): Punto 1: bandera `SHOW_DEV_TOOLS` (constante en `src/constants/devTools.js`, valor `false` en el repositorio) aplicada en los 3 paneles de prueba, con comentario explicando el porqué; verificado que con `false` la app abre y el registro no depende de ningún panel, y que con `true` el comportamiento es el de siempre. Punto 2: `.github/pull_request_template.md` creado con la lista de autorrevisión D-23 (sin dependencias nuevas). Puntos 3, 4 y 5 se entregaron como texto directo a Anderson (guía de bitácora, guía de sustentación, lista previa a la entrega), sin tocar código ni commits.
- Usado / modificado / descartado: Usado tal como se propuso en los puntos 1 y 2. Las guías de los puntos 3, 4 y 5 se entregaron como texto en la conversación (no se generan como archivos nuevos del proyecto); Anderson decide si las traslada a algún documento.
- Archivos y commit: `src/constants/devTools.js`, `src/components/DevAccountSwitch.js`, `src/components/PlaceholderScreen.js`, `src/screens/home/HomeScreen.js`, `.github/pull_request_template.md`, `docs/decisiones.md` (D-23), `docs/AI_LOG.md` (esta entrada). Sin commit: ningún agente hace commit ni push en este proyecto.
- Verificación: `node scripts/check-constitution.mjs` → 36 error(es), 0 advertencia(s), 5 regla(s) inactiva(s), sin cambios frente a la línea base conocida (1× C01 preexistente y esperado sobre `.env` —el archivo nunca se versiona—, 35× C21 preexistentes sobre `docs/requisitos.md`, ajenos a esta entrega). Verificado con lectura de código (verifier distinto del implementer) que `SHOW_DEV_TOOLS=false` oculta los 3 paneles y no afecta el flujo de registro, y que con `true` se comporta igual que antes. `.env` no leído ni escrito en ningún momento.
- Aprendizaje: (pendiente: Anderson)

### Entrada #36
- Fecha: 2026-11-04
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Bloquear la edición de los campos tras enviar el registro (T-31) y corregir la referencia colgante del README sobre SHOW_DEV_TOOLS
- Prompt textual:
````
Corrección de T-31 (bloqueo del formulario tras enviar) y arreglo del README.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-04, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Bloquear la edición de los campos tras enviar el registro (T-31) y corregir la referencia colgante del README sobre SHOW_DEV_TOOLS", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. Resultado de la prueba en el celular (Anderson, 2026-11-04): tras pulsar «Enviar registro» aparece el mensaje de confirmación y el botón se deshabilita, pero los campos de las 3 pestañas siguen siendo editables. Precarga al reabrir (T-32) y paso a approved en vivo funcionan. T-31 queda NO validada hasta que Anderson la pruebe de nuevo.

2. Corrige T-31: cuando el registro ya fue enviado (accountStatus pending con documento existente, ya sea recién enviado o precargado al reabrir), TODOS los campos de las 3 pestañas deben quedar de solo lectura: TextField (editable=false), SelectField, DateField, PhotoField (sin abrir galería ni cámara) y CheckboxField (términos). Usa un único valor derivado en el contexto (por ejemplo isLocked), no una bandera por pantalla. Debe verse deshabilitado (estilo atenuado coherente con DESIGN.md) y exponerse a accesibilidad (accessibilityState disabled). El aviso «Pendiente de aprobación» y el mensaje de confirmación se mantienen. Importante: si el envío FALLA, el formulario debe seguir editable para poder corregir y reintentar; solo se bloquea tras un envío exitoso o cuando se precarga un registro existente. No cambies las reglas de Firestore ni el payload.

3. Pantalla de inicio: con SHOW_DEV_TOOLS en false, revisa qué ve el usuario en Inicio cuando la cuenta está approved. Si la pantalla queda completamente en blanco, añade un contenido mínimo y sobrio (título de la pantalla y una línea tipo «Aquí aparecerá tu disponibilidad y las solicitudes», texto en labels.js en español) sin lógica nueva ni dependencias. Si ya muestra algo razonable, no cambies nada y dímelo.

4. README.md: la línea 45 dice "incluye elementos provisionales de desarrollo, ver más abajo" pero no existe esa sección. Añade una sección breve en español, "Herramientas de desarrollo (SHOW_DEV_TOOLS)": qué paneles oculta (selector «Estado de la pantalla», «Simulador de cuenta», «Simular solicitud»), que vive en src/constants/devTools.js, que el valor del repositorio es false y que el desarrollador la pone en true solo en su copia local y la devuelve a false antes de hacer commit. Ajusta la línea 45 para que apunte a esa sección. Revisa que el resto del README siga coherente con el estado real y corrige solo lo desactualizado.

5. Verificación: ejecuta node scripts/check-constitution.mjs (línea base 36 errores / 0 advertencias; el único C01 es el .env local ya conocido). Un verifier distinto del implementer debe comprobar por lectura de código: (a) con isLocked los 5 tipos de campo no son editables, (b) tras un envío fallido el formulario sigue editable, (c) la precarga de un registro existente también bloquea, (d) el flujo de un registro nuevo (documento inexistente) sigue siendo completamente editable. Registra los resultados en la bitácora y deja T-31 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo".

6. No ejecutes npx expo lint ni nada que modifique package.json o cree archivos de configuración. Sin dependencias nuevas. No leas ni toques .env. No reinicies mi Metro. No hagas commit. No marques como Validada nada que dependa de mi prueba. Resumen corto y lista final de lo que debo probar yo en el celular.
````
- Resumen de la respuesta (2–3 líneas): Se agregó `isLocked` (derivado de `accountStatus === 'pending' || submitState === 'success'`) en `RegistrationFormContext.js` y se cableó `disabled={isLocked}` a los 18 campos de las 3 pestañas (TextField, SelectField, DateField, PhotoField, CheckboxField), cada uno con estilo atenuado y `accessibilityState.disabled`. En Inicio se agregó una línea fija («Aquí aparecerá tu disponibilidad y las solicitudes.») porque con `SHOW_DEV_TOOLS=false` la pantalla quedaba vacía. En README.md se corrigió la referencia colgante de la línea 45 y se añadió la sección «Herramientas de desarrollo (SHOW_DEV_TOOLS)»; el resto del README se revisó y ya era coherente (no requirió más cambios).
- Usado / modificado / descartado: Usado y modificado: `src/context/RegistrationFormContext.js`, los 5 componentes de `src/components/registration/` (TextField, SelectField, DateField, PhotoField, CheckboxField), `src/screens/registration/PersonalDataScreen.js`, `VehicleScreen.js`, `DocumentsScreen.js`, `src/screens/home/HomeScreen.js`, `src/constants/labels.js`, `README.md`. Nada descartado. Sin cambios en `firestore.rules` ni en el payload de `submitRegistration`.
- Archivos y commit: Archivos arriba; sin commit (regla del proyecto, lo hace Anderson).
- Verificación: `check-constitution.mjs` antes y después: 36 error(es) / 0 advertencia(s) / 5 regla(s) inactiva(s) sin cambio (1×C01 `.env` conocido + 35×C21 preexistentes en `docs/requisitos.md`), sin violaciones nuevas. Verificador independiente (agente `verifier`, distinto del `implementer`) confirmó por lectura de código, línea por línea, con script temporal fuera del proyecto: (a) CONFIRMADO — los 5 tipos de campo quedan no editables con `isLocked=true` y las 18 instancias de campo en las 3 pantallas reciben `disabled={isLocked}` (0 instancias sin la prop); los 4 tipos no-TextInput exponen `accessibilityState.disabled` automáticamente vía `Pressable` (RN lo fusiona cuando `disabled != null`), TextField lo expone explícito. (b) CONFIRMADO — con `submitState==='error'` y cuenta no pending, `isLocked=false` (formulario editable tras envío fallido). (c) CONFIRMADO — con `accountStatus==='pending'` (precarga), `isLocked=true` independientemente de `submitState`. (d) CONFIRMADO — con cuenta nueva (sin documento, `accountStatus` no pending, `submitState` no success), `isLocked=false`. También confirmó sin cambios: reglas de Firestore, payload de envío, aviso «Pendiente de aprobación», mensaje de confirmación y la lógica `canSubmit` del botón «Enviar registro». Veredicto: **T-31 queda "Implementada y verificada en lo estático; pendiente de validación en dispositivo"** — no "Validada" (falta Diseño Aprobado/N-A y la prueba de Anderson en el celular).
- Aprendizaje: (pendiente: Anderson)

### Entrada #37
- Fecha: 2026-11-05
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Mejorar estilos y diseño visual de las 3 pestañas de registro sin tocar funcionalidad
- Prompt textual:
````
Mejora visual de las 3 pestañas del registro de conductor (SOLO estilos y diseño).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-05, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Mejorar estilos y diseño visual de las 3 pestañas de registro sin tocar funcionalidad", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. ALCANCE ESTRICTO. Se puede tocar ÚNICAMENTE: objetos de estilo (StyleSheet.create y props de estilo), colores, tipografía, espaciados, bordes, sombras, tamaños, disposición visual (flex/alineación) y estilos de estado (foco, error, deshabilitado/bloqueado). Archivos permitidos: los de src/components/registration/* (TextField, SelectField, DateField, PhotoField, CheckboxField, FieldError), src/screens/registration/{PersonalDataScreen,VehicleScreen,DocumentsScreen}.js, src/navigation/RegistrationTabs.js (solo estilo de la barra de pestañas) y, si hace falta, el archivo de tokens/tema que ya exista.
PROHIBIDO tocar: lógica, estado, hooks, props existentes, validaciones, contexto (RegistrationFormContext, AppStateContext), servicios (firebase, cloudinary, driverRepository), reglas de Firestore, navegación y su comportamiento, textos visibles (labels.js), testID, accessibilityLabel/accessibilityRole/accessibilityState, orden de los campos, manejo de teclado, package.json y dependencias. No cambies nombres de funciones ni mueves lógica. Si una mejora visual exigiera tocar algo prohibido, NO lo hagas: anótalo en un apartado "No hecho por estar fuera de alcance".

2. LEE PRIMERO: DESIGN.md, AGENTS.md, la spec specs/001-registro-conductor/spec.md y los archivos de las 3 pestañas. Usa los tokens y la paleta de DESIGN.md. Si falta un token necesario, reutiliza el más cercano; solo añade uno nuevo si es imprescindible y regístralo en docs/decisiones.md. Sin librerías de UI nuevas, sin fuentes nuevas, sin imágenes ni íconos nuevos (nada que requiera dependencia).

3. DIRECCIÓN DE DISEÑO: simple, limpio, profesional, tipo app de movilidad actual (sobrio, mucho aire, jerarquía clara, un solo color de acento).
- Escala de espaciado coherente (múltiplos de 4/8) y mismo margen horizontal en las 3 pestañas.
- Jerarquía tipográfica: título de sección, etiqueta del campo, texto de entrada, texto de ayuda y texto de error con tamaños/pesos distintos y consistentes.
- Campos: etiqueta encima, caja con borde fino y radio consistente, altura cómoda (mínimo 48 de alto), estado de foco con borde de acento, estado de error con borde y texto de error en el color de error de DESIGN.md pegado al campo, estado deshabilitado/bloqueado (cuando el formulario está enviado) atenuado pero legible.
- Selectores y fecha con el mismo aspecto que los campos de texto (mismo alto, borde y radio) e indicador visual claro de que son desplegables.
- Casilla de términos: área táctil amplia, texto legible con buen interlineado.
- Fotos: recuadro con borde punteado o sutil, marco de proporción adecuada, vista previa bien recortada con radio, estados claros (vacío, subiendo, subida, error).
- Agrupa campos relacionados con separación visual sutil (secciones o tarjetas ligeras) sin recargar.
- Botón «Enviar registro»: ancho completo, alto cómodo, estado normal/deshabilitado/cargando bien diferenciados; mensaje de confirmación y aviso «Pendiente de aprobación» con estilo de banner discreto.
- Barra de pestañas: etiqueta clara, pestaña activa distinguible por algo más que el color, y sin recorte por el notch o la barra de navegación del sistema (conserva el ajuste de safe area que ya existe).
- Consistencia total entre las 3 pestañas.

4. ACCESIBILIDAD OBLIGATORIA (no negociable): áreas táctiles de al menos 44x44; contraste de texto mínimo AA (4.5:1 texto normal); nada que dependa solo del color para comunicar error o estado; el texto debe poder crecer con la escala de fuente del sistema sin recortarse ni solaparse; el teclado no debe tapar el campo activo ni el botón (no cambies el comportamiento actual, solo no lo empeores con tamaños fijos).

5. VERIFICACIÓN (obligatoria):
a) Revisa tu propio diff con git diff y confirma que TODA línea modificada es de estilo. Entrega una lista, por archivo, de cualquier línea modificada que NO sea de estilo (debe estar vacía; si no, revierte esa línea).
b) Un verifier distinto del implementer revisa que no cambió funcionalidad: mismas props, mismos testID, mismos textos, misma lógica; y que los estados error/foco/bloqueado/cargando existen y son visibles.
c) design-auditor (si está disponible en el proyecto) revisa contraste, áreas táctiles y consistencia, y entrega hallazgos priorizados; corrige los de severidad alta que sean solo de estilo.
d) node scripts/check-constitution.mjs debe seguir en 36 errores / 0 advertencias (línea base conocida).
e) Marca como "Implementada y verificada en lo estático; pendiente de validación en dispositivo". No marques nada como Validada: depende de mi prueba en el celular.

6. RESTRICCIONES: no ejecutes npx expo lint ni nada que modifique package.json o cree archivos de configuración. Sin dependencias nuevas. No leas ni toques .env. No reinicies ni detengas mi Metro (los estilos se recargan solos). No hagas commit. Trabaja en la rama actual.

7. SALIDA: resumen corto con (i) qué cambió visualmente por pestaña en 3-4 líneas, (ii) lista de "No hecho por estar fuera de alcance", (iii) checklist para que yo pruebe en el celular: las 3 pestañas en estado normal, con foco, con error visible, con selectores abiertos, con foto subiendo y subida, con el formulario bloqueado tras enviar, con texto grande del sistema y con la barra de pestañas junto al notch.
````
- Resumen de la respuesta (2–3 líneas): El implementer añadió estilos de estado (borde de error en TextField/SelectField/DateField, borde punteado vacío y borde de error en PhotoField), corrigió la opacidad del botón deshabilitado de DocumentsScreen (antes igual a la de "presionado") y convirtió el aviso "Pendiente de aprobación" en un banner con borde y relleno, igual en las 3 pestañas. No se agregaron tokens nuevos ni se hicieron agrupamientos visuales de campos (ver "No hecho por estar fuera de alcance").
- Usado / modificado / descartado: Usado y conservado todo lo implementado. No se descartó nada; el verifier no pidió cambios ("APROBADO sin hallazgos").
- Archivos y commit: src/components/registration/TextField.js, SelectField.js, DateField.js, PhotoField.js; src/screens/registration/PersonalDataScreen.js, VehicleScreen.js, DocumentsScreen.js. Sin commit (instrucción explícita del prompt, punto 6); cambios en working tree de la rama anderson/diseno-registro.
- Verificación: (a) implementer revisó su propio diff: todo es de estilo. (b) verifier (invocación distinta) confirmó por lectura directa del diff real: mismos props/testID/textos/lógica en los 7 archivos; estados error/foco/bloqueado visibles; `combinedError` en PhotoField era lógica preexistente, no nueva. Veredicto: "APROBADO sin hallazgos" (con 1 nota menor no bloqueante sobre esta misma entrada de bitácora, ya resuelta). (c) design-auditor NO se ejecutó: no hay capturas de celular ni arnés web disponibles en este momento (el proyecto no tiene target web configurado y el arnés `visual-audit.mjs` solo renderiza HTML) — queda pendiente para cuando existan capturas reales; Diseño queda en "Pendiente", no "Aprobado". (d) check-constitution.mjs: 36 errores / 0 advertencias / 5 reglas inactivas, igual antes y después (confirmado por implementer y de forma independiente por el verifier). (e) Estado final: "Implementada y verificada en lo estático; pendiente de validación en dispositivo".
- Aprendizaje: (pendiente: Anderson)

---

### Entrada #38
- Fecha: 2026-11-05
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Sonnet 5, claude-sonnet-5)
- Objetivo: Añadir botón para quitar la foto cargada y evitar que el teclado tape los campos en las 3 pestañas
- Prompt textual:
````
Mejoras de usabilidad del registro: botón para quitar la foto y teclado que no tape los campos.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-05, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Añadir botón para quitar la foto cargada y evitar que el teclado tape los campos en las 3 pestañas", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. PROCESO SDD: antes de implementar, el spec-author añade a specs/001-registro-conductor/spec.md los criterios nuevos (siguientes CA libres): (a) CA de quitar foto: el usuario puede quitar una foto ya cargada con una «X» en su esquina superior derecha; el campo vuelve a su estado vacío y se aplica la validación de obligatorio igual que antes; (b) CA de teclado: al enfocar cualquier campo de las 3 pestañas, el campo activo queda visible por completo por encima del teclado, con teclado de texto, numérico y con los selectores/fecha. Registra en docs/backlog.md las tareas nuevas (siguientes T libres), una por cambio, con su CA, y en docs/decisiones.md cualquier decisión. Luego implementer y verifier distintos.

2. CAMBIO 1, quitar la foto (src/components/registration/PhotoField.js, y lo mínimo imprescindible en RegistrationFormContext si no existe ya un modo de vaciar el valor):
- Cuando el campo tiene una foto (recién subida o precargada de Firestore), muestra una «X» en la esquina superior derecha de la vista previa: botón circular con fondo oscuro semitransparente y la X en blanco (buen contraste), tamaño visual ~28-32 con área táctil de al menos 44x44 (hitSlop o contenedor), sin tapar contenido importante de la foto.
- Al pulsarla: se vacía la URL de la foto en el estado del formulario (vuelve al estado vacío, con el mismo aspecto que antes de subir) y la validación de «foto obligatoria» se comporta como en el resto de campos (error bajo el campo según la regla DP-08: al salir del campo o al cambiar de pestaña tras haberla visitado; nunca Alert). Sin confirmación modal.
- NO se borra nada en Cloudinary (el preset sin firma no lo permite): la foto huérfana queda allí. Regístralo como limitación conocida en docs/decisiones.md.
- La «X» NO aparece ni funciona cuando el formulario está bloqueado tras enviar (isLocked) ni mientras la foto se está subiendo.
- Aplica a TODOS los campos de foto del registro (foto de perfil, foto del vehículo y cualquier otro que exista en las 3 pestañas).
- Accesibilidad: accessibilityRole="button", accessibilityLabel en español «Quitar foto» (texto en src/constants/labels.js), y testID siguiendo la convención existente.
- Si no hay un ícono de equis ya disponible sin instalar nada (por ejemplo, si @expo/vector-icons ya está en package.json se puede usar), dibuja la X con dos Views cruzados o un carácter «✕». NO añadas dependencias.
- No cambies el flujo de subida, el límite de 8 MB, ni el envío; no toques las reglas de Firestore ni el payload.

3. CAMBIO 2, teclado que tapa los campos (3 pestañas: PersonalDataScreen, VehicleScreen, DocumentsScreen y, si procede, un componente compartido o RegistrationTabs):
- Diagnostica primero leyendo el código: cómo está construido el contenedor de cada pestaña (ScrollView, KeyboardAvoidingView, safe area), si hay edge-to-edge en Android (Expo SDK 57 / RN 0.86) y por qué el teclado tapa los campos de abajo. Explica la causa en 3-4 líneas antes de arreglar.
- Soluciona con herramientas ya incluidas en React Native, de forma uniforme en las 3 pestañas (idealmente en un único contenedor compartido para no repetir código): ScrollView con keyboardShouldPersistTaps="handled", KeyboardAvoidingView con el behavior adecuado por plataforma, y desplazamiento automático al campo enfocado (por ejemplo, onFocus del campo que hace scrollTo a su posición usando refs/onLayout, dejando un margen visible sobre el teclado) y relleno inferior suficiente (por ejemplo con Keyboard.addListener para la altura del teclado) para poder desplazar hasta el último campo y el botón «Enviar registro».
- El campo activo debe verse COMPLETO, incluida su etiqueta y el mensaje de error si lo hay, mientras se escribe, con teclado de texto, numérico (año, capacidad, teléfono) y en todos los campos de las 3 pestañas, incluidos los de la parte baja.
- No debe cambiar el orden de los campos, ni el comportamiento de los selectores modales y el selector de fecha, ni las validaciones, ni los testID, ni los textos.
- RESTRICCIÓN CLAVE: la solución NO puede requerir recompilar el development build. Prohibido: dependencias nuevas (por ejemplo react-native-keyboard-controller), cambios en app.json/app.config, en la carpeta android/ios o en cualquier configuración nativa. Si, tras el diagnóstico, concluyes que sin eso no se puede resolver, NO lo hagas: detente, explica por qué y propón alternativas para que Anderson decida.
- Debe seguir funcionando la barra de pestañas junto al notch y el ajuste de safe area existente.

4. VERIFICACIÓN: (a) check-constitution debe seguir en 36 errores / 0 advertencias (línea base conocida); (b) un verifier distinto del implementer revisa por lectura de código: la «X» aparece solo con foto y sin bloqueo ni subida en curso, vacía el valor y dispara la validación esperada, está en todos los campos de foto; el contenedor de teclado es uniforme en las 3 pestañas, sin cambiar lógica ni testID ni textos; (c) confirma con git diff que no se tocó package.json, app.json, firestore ni servicios; (d) deja ambas tareas como "Implementada y verificada en lo estático; pendiente de validación en dispositivo". No marques Validada nada que dependa de mi prueba.

5. RESTRICCIONES: no ejecutes npx expo lint ni nada que modifique package.json o cree archivos de configuración. Sin dependencias nuevas. No leas ni toques .env. No reinicies ni detengas mi Metro (se recarga solo, no requiere build). No hagas commit. No toques firestore.rules (ya es local e ignorado por Git).

6. SALIDA: resumen corto con (i) la causa diagnosticada del teclado, (ii) qué se cambió en cada cosa, (iii) lo que quedó fuera de alcance o requiere decisión, y (iv) checklist para que yo pruebe en el celular.
````
- Resumen de la respuesta (2–3 líneas): Corregido el bucle del diálogo de ubicación de T-41 (las fuentes ya no piden el diálogo de Google solas; solo al tocar el interruptor) e implementadas T-43 (tarjeta con cuenta regresiva y una solicitud a la vez), T-44 (viaje activo con controlador, OSRM, llegada por umbral, reporte con reintentos acotados y publicación en `driverLocations/{uid}`) y T-45 (resumen con tarifa y comisión). El verifier independiente RECHAZÓ T-44 (cuelgue de «Finalizar viaje» tras «Reintentar» el reporte de `completed`), así que la cadena se detuvo ahí (P1, D-59) sin corregirlo; la ronda 1 de diseño dejó un hallazgo alto en la tarjeta (T-43) sin corregir.
- Usado / modificado / descartado: (pendiente: completar al terminar)
- Archivos y commit: sin commit. Nuevos: `src/components/SecondaryButton.js`, `src/components/map/` (mapa del viaje), `src/config/trip.js`, `src/context/TripContext.js`, `src/services/driverLocationPublisher.js`, `src/services/trip/` (máquina de estados, controlador, regulador, una a la vez), `src/utils/format.js`, `docs/diseno/auditorias/ronda-1-viaje.md`. Modificados: `src/components/PrimaryButton.js`, `src/constants/labels.js`, `src/constants/tripStatus.js`, `src/context/AvailabilityContext.js`, `src/context/RegistrationFormContext.js`, `src/hooks/useDriverLocation.js`, `src/hooks/useTripRequests.js`, `src/navigation/MainDrawer.js`, `src/screens/home/HomeScreen.js`, `src/screens/trip/TripRequestScreen.js`, `src/screens/trip/TripActiveScreen.js`, `src/screens/trip/TripSummaryScreen.js`, `src/services/location/` (gps, simulada, index), `src/services/passengerApi/` (contract, index), `docs/backlog.md`, `docs/progress.md`, `docs/seguridad.md` (regla de `driverLocations`), `docs/arquitectura-api-pasajero.md`, `docs/AI_LOG.md`.
- Verificación: script temporal en el scratchpad contra el código real (Babel + reloj falso): 39/39 PASA (máquina de estados 8 válidas/28 inválidas, llegada a 24 m sí y a 26 m no con umbral 25 m, restante, regulador 5 s/20 m, una solicitud a la vez, vencimiento a 30 s, controlador completo, errores de OSRM y del reporte); scripts borrados. check-constitution: antes 24 errores/0 advertencias, después 23/0 (22 C21 de requisitos sin tarea y 1 C01 en `.env:1`, que el verifier considera falso positivo porque está ignorado; no se leyó). Verifier independiente: T-41, T-43 y T-45 aceptadas en lo estático; **T-44 Rechazada** (hallazgo mayor en `tripController.js:286-295`). design-auditor ronda 1 estática: 1 alto (cuenta regresiva y ganancia poco destacadas en T-43), 2 medios y varios bajos; Diseño «Pendiente». Nada probado en dispositivo.
- Aprendizaje: (pendiente: Anderson)

---

### Entrada #39
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Opus 5.5, claude-opus-5-5)
- Objetivo: Obtener un informe del estado real de la implementación para decidir por dónde continuar
- Prompt textual:
````
Informe del estado actual de la implementación del proyecto (SOLO LECTURA).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Obtener un informe del estado real de la implementación para decidir por dónde continuar", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. COMPROBACIÓN DE RAMA (primero, antes de todo lo demás): con git de solo lectura (git branch --show-current, git log --oneline -10, git status, git log origin/main --oneline -5, git branch -a), dime en qué rama estoy, si mi árbol está limpio, si origin/main ya contiene el trabajo de registro (T-15 a T-34, SHOW_DEV_TOOLS, diseño del registro) o solo llega hasta el PR #1 (T-01 a T-10), y si hay ramas locales o remotas con trabajo sin fusionar. Si la rama actual NO contiene el registro, dilo en la primera línea del informe y haz el resto del análisis sobre la rama que sí lo contenga (anderson/diseno-registro u otra), indicando cuál usaste. No cambies de rama ni hagas checkout: lee con git show/git ls-tree si hace falta.

2. INFORME. Léelo todo desde el código y los documentos reales (docs/requisitos.md, docs/progress.md, docs/backlog.md, docs/decisiones.md, docs/AI_LOG.md, specs/**, README.md, DESIGN.md, el código en src/ y backend/). No te fíes de lo que digan los documentos: contrasta con el código. Entrega, en este orden:
 a) Resumen ejecutivo (máximo 10 líneas): qué funciona hoy de punta a punta, qué está solo en papel y qué falta.
 b) Tabla por spec (000 a 009): nombre, estado real (sin empezar / spec escrita / plan hecho / en implementación / implementada / verificada en lo estático / validada en dispositivo), tareas hechas / totales, y qué bloquea el siguiente paso.
 c) Matriz de requisitos: cada RF, RNF y ENT de docs/requisitos.md con su estado real (implementado y probado / implementado sin probar / parcial / no implementado) y dónde está en el código (archivo). Marca los que no tienen tarea (los 35 C21).
 d) Pantallas y navegación: lista de las pantallas existentes (Startup, Home, registro 3 pestañas, Datos personales, Configuración, Trip y las demás) con su estado: real y funcional, con datos de Firestore, o solo placeholder.
 e) Datos y servicios: qué colecciones y campos de Firestore se usan hoy, qué servicios existen (firebase, cloudinary, driverRepository, backend /health) y qué reglas de seguridad están aplicadas. Recuerda que firestore.rules es local e ignorado por Git: indica si algún documento o script lo da por existente en el repositorio.
 f) Deuda y riesgos: elementos provisionales que siguen en el código (paneles de prueba, simulador, valores fijos como commissionRate 20 vs 0.20), diseños pospuestos (T-12, T-13, T-29), criterios "No verificado en dispositivo", T-28 sin ejecutar, preguntas aparcadas (P-01, P-03, P-04, P-09, P-10), el baseline de check-constitution y por qué.
 g) Dependencias nativas: cuáles hay instaladas y cuáles pedirán las specs siguientes (mapa, geolocalización, notificaciones, etc.), para planear un único rebuild.
 h) Entregas y trazabilidad: qué exige F1 §8 (bitácora, hashes, Aprendizaje, PDF, README, PRs revisados) y en qué punto está cada cosa. Lista las entradas de la bitácora sin hash o sin «Aprendizaje».
 i) Recomendación: orden sugerido de las próximas specs con justificación (dependencias entre ellas, riesgo técnico, valor para la demo) y cuál sería la primera tarea concreta de la siguiente spec. Distingue lo que es hecho verificado de lo que es opinión tuya.

3. REGLAS: es SOLO LECTURA. No modifiques código ni documentos salvo la entrada de bitácora del punto 0. No hagas commit, checkout, stash ni cambies de rama. No ejecutes npx expo lint ni nada que cree archivos de configuración o toque package.json. No leas ni toques .env. No reinicies mi Metro. Sin dependencias nuevas. Si algún dato no se puede confirmar con el código, di "no verificado" en vez de suponerlo.

4. SALIDA: el informe en la conversación, con tablas cortas, sin copiar código largo. Termina con una lista de máximo 5 decisiones que Anderson debe tomar antes de continuar.
````
- Resumen de la respuesta (2–3 líneas): Informe de solo lectura del estado real: rama actual = main = origin/main (PR #2, registro incluido); specs 000 y 001 implementadas (001 con T-28/T-29 y 3 tareas sin validar en celular); specs 002–009 sin empezar; baseline check-constitution 36 errores (35 C21 + 1 C01 sobre `.env` ignorado). Orden recomendado: 004 → 002 → 003 → 005 → 006/007 → 008 → 009.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: docs/AI_LOG.md (solo esta entrada). Sin commit.
- Verificación: git (status, branch -a, log, merge-base) de solo lectura; lectura de requisitos, progress, backlog, decisiones, specs, README, package.json, app.json, scripts/dependencies.json, src/ y backend/src; `node scripts/check-constitution.mjs` = 36 errores / 4 advertencias / 5 inactivas. No se leyó `.env`; no se ejecutó expo lint ni se tocó Metro.
- Aprendizaje: (pendiente: Anderson)

---

### Entrada #40
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Opus 5.5, claude-opus-5-5)
- Objetivo: Registrar decisiones, definir el contrato de la API del pasajero, el mapa con recorrido en tiempo real y proponer un plan recortado de 2 días
- Prompt textual:
````
Plan recortado para la entrega final, contrato para la API del pasajero y mapa con recorrido en tiempo real (SOLO DOCUMENTOS, sin código).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Registrar decisiones, definir el contrato de la API del pasajero, el mapa con recorrido en tiempo real y proponer un plan recortado de 2 días", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. CONTEXTO: la entrega final es en 2 días (se asume jueves 2026-11-12, sin confirmar: márcalo como supuesto). La app consumirá una API que simula al pasajero. Aún no se conoce su estructura ni su funcionamiento. Todo lo que se construya debe hacer MUY FÁCIL enchufarla después sin rehacer pantallas. REQUISITO DE LA PROFESORA (obligatorio): la app debe mostrar un mapa con el RECORRIDO del conductor en tiempo real hasta la posición del pasajero. Ejemplo: el pasajero está en X y el conductor en Y; se muestra la ruta por calles de Y a X y el marcador del conductor avanzando por ella en tiempo real hasta llegar a X. Esto convierte el mapa en obligatorio (ya no opcional).

2. DECISIONES a registrar en docs/decisiones.md como Vigentes (aprobadas por Anderson el 2026-11-10), con su número libre y su justificación breve:
 a) Comisión: se representa como fracción 0.20 con una sola fuente en src/config/pricing.js; el registro la leerá de ahí y la mostrará como «20 %». Los documentos de prueba actuales se reenvían (las reglas solo exigen number).
 b) No se adopta @react-native-firebase ni FCM; un solo SDK de Firebase (el web ya usado). Tiempo real mediante onSnapshot o sondeo detrás del contrato del punto 3.
 c) Contrato de API del pasajero con patrón puerto y adaptador (punto 3).
 d) Mapa obligatorio con recorrido en tiempo real (punto 4). Un ÚNICO build nativo que se hace HOY (rebanada 0) con todas las dependencias nativas necesarias, para no bloquear los dos días.
 e) firestore.rules sigue local e ignorado por Git; documentos y README deben explicar que las reglas se publican en la consola de Firebase y describir la política en texto (crear docs/seguridad.md con la política en palabras: solo el dueño lee y crea, accountStatus pending al crear, sin edición cuando está aprobada, sin borrado). Corrige las menciones a "firestore.rules en el repo" en progress.md, backlog.md y README.
 f) Secretos: la clave de Google Maps (y cualquier otra) nunca se versiona. Va en .env (solo el NOMBRE de la variable en .env.example). Si el plugin nativo la necesita en la configuración de la app, usar app.config.js leyendo process.env en lugar de escribir el valor en app.json.

3. CONTRATO DE LA API DEL PASAJERO: crea docs/arquitectura-api-pasajero.md y márcalo "SUPUESTO hasta recibir la API real". Define:
 - Estructura de carpetas propuesta (por ejemplo src/services/passengerApi/{index.js, contract.js, mockPassengerApi.js, httpPassengerApi.js, mappers.js}) y qué hace cada archivo.
 - Modelo interno TripRequest (id, pasajero {nombre, calificación opcional}, origen {lat, lng, dirección}, destino {lat, lng, dirección}, distanciaKm, duraciónMin, categoría, creadaEn, venceEn) y modelo Trip con estados (aceptado, en camino al pasajero, en curso, finalizado, cancelado).
 - Operaciones del contrato: subscribeToRequests(onRequest) que devuelve una función para cancelar; acceptRequest(id); rejectRequest(id); reportTripStatus(id, estado); cancelTrip(id); reportDriverLocation(tripId, {lat, lng, timestamp}) para que el pasajero (la API real) vea al conductor. Errores normalizados (red, expirada, ya tomada, no autorizado).
 - Un único selector (constante, no variable de entorno secreta) mock/http y el nombre de la variable EXPO_PUBLIC_PASSENGER_API_URL para la URL base (solo el NOMBRE en .env.example; nunca valores).
 - Que el único archivo que conoce la forma de la API real sea mappers.js.
 - Que el mock reemplace al botón «Simular solicitud» y genere solicitudes con la forma del modelo interno, con coordenadas reales cercanas a la posición del conductor.
 - Que la tarifa y la comisión se calculen en la app con función pura (spec 004), con la tasa 0.20 de pricing.js.
 - Qué parte cambia el día que llegue la API real (lista corta) y qué no debe cambiar nunca.

4. MAPA Y RECORRIDO EN TIEMPO REAL: crea docs/arquitectura-mapa-recorrido.md. Define y compara con evidencia (documentación oficial vía WebSearch/WebFetch; marca "no verificado" lo que no puedas confirmar):
 - Biblioteca de mapa compatible con Expo SDK 57 / React Native 0.86 y development build (por ejemplo react-native-maps), versión exacta, plugin de configuración, y qué exige en Android (clave de API de Google Maps, cuenta de facturación, restricciones) y en iOS. Si no es compatible, alternativas.
 - Obtención de la RUTA POR CALLES entre la posición del conductor y la del pasajero: compara al menos Google Directions API, un servicio de enrutamiento abierto sin clave (por ejemplo OSRM) y OpenRouteService, con costo, límites de uso, necesidad de clave, formato de respuesta y cómo decodificar la polilínea. Recomienda una para la demo y define cómo aislar el proveedor en un único módulo (src/services/routing/*) para poder cambiarlo.
 - FUENTE DE POSICIÓN del conductor detrás de una interfaz intercambiable (igual que la API): (1) GPS real con expo-location (watchPositionAsync; permisos en Android; confirma compatibilidad con SDK 57) para pruebas en la calle, y (2) fuente SIMULADA que recorre la polilínea de la ruta a velocidad configurable, para la demostración sin salir de casa. Una constante selecciona la fuente.
 - Comportamiento en pantalla: marcador del pasajero, marcador del conductor que avanza, polilínea de la ruta, cámara que sigue al conductor, tiempo y distancia restantes, detección de llegada (umbral en metros) y cambio de estado del viaje a "en camino"/"llegó". Qué pasa si se pierde el GPS o la ruta falla (estado de error con reintento, ScreenState existente).
 - Publicación de la posición: cada cuánto se llama reportDriverLocation (limitar frecuencia) y cómo se evita saturar Firestore o la API.
 - Rendimiento y batería: límites razonables y qué se desactiva cuando la app pasa a segundo plano (la segunda plano real queda fuera de alcance salvo que sea obligatorio; dilo).
 - Lista EXACTA de dependencias nativas del build único con versiones verificadas, y la lista de lo que Anderson debe hacer a mano (crear y restringir la clave de Google Maps, ponerla en su .env, reconstruir). NO instales nada: la instalación y el build los aprueba y ejecuta Anderson.
 - Plan B si el mapa nativo no compila a tiempo (por ejemplo, vista del recorrido con la misma interfaz de datos pero sin mapa) y criterio para decidir cuándo activarlo.

5. PLAN RECORTADO: el planner entrega en docs/plan-entrega-final.md un plan para 2 días con "rebanadas" verticales (no 8 specs completas) en este orden: (0) HOY: dependencias nativas + clave + build único + prueba mínima de que el mapa se ve y la ubicación llega (spike con criterio de éxito claro); (A) tarifa y comisión (spec 004, función pura); (B) disponibilidad y ubicación + solicitudes entrantes (mock) + aceptar/rechazar + recorrido en tiempo real del conductor hasta el pasajero + viaje activo + resumen; (C) cobro simulado, ganancias, historial (colección trips en Firestore escrita por la app al cerrar el viaje) y perfil/configuración de solo lectura; (D) cierre: bitácora, hashes, «Aprendizaje», PDF, README, video. Para cada rebanada: qué RF/RNF/ENT cubre, tareas T-NN numeradas con CA y estimación en horas, dependencias, qué se simplifica o simula y qué queda explícitamente NO cubierto. Reserva al menos medio día para (D). Indica la ruta mínima viable (debe incluir el recorrido en tiempo real) y qué rebanada se puede abandonar sin comprometerla. Agrupa las pruebas en el celular en checkpoints (D-59). Señala los riesgos principales (build nativo, clave de Maps, permisos de ubicación, enrutamiento) y su mitigación.

6. TRAZABILIDAD: corrige la tabla de specs de docs/progress.md (está desactualizada) y añade las filas que faltan para CA-001-31 y CA-001-D5 en progress.md y plan.md para eliminar las 4 advertencias C23. No marques nada como Validada.

7. REGLAS: no escribas ni modifiques código fuente, no instales dependencias, no ejecutes npx expo lint ni nada que cree archivos de configuración o toque package.json o app.json, no leas ni toques .env, no reinicies mi Metro, no hagas commit, no cambies de rama. Ejecuta node scripts/check-constitution.mjs al final e informa el resultado (esperado: 36 errores, 0 advertencias; explica cualquier diferencia).

8. SALIDA: resumen corto en la conversación con (i) decisiones registradas, (ii) los 4 archivos nuevos, (iii) la dependencia nativa y el proveedor de rutas recomendados con sus costos y riesgos, (iv) la ruta mínima viable y el tiempo estimado por rebanada, (v) la lista de pasos manuales que Anderson debe hacer HOY para el build nativo, y (vi) máximo 5 preguntas que Anderson debe responder antes de empezar la rebanada 0.
````
- Resumen de la respuesta (2–3 líneas): Solo documentos, sin tocar código. Se registraron D-76 a D-81 como Vigentes y D-82 como Propuesta, y se escribieron el contrato puerto/adaptador de la API del pasajero, la arquitectura del mapa con recorrido (react-native-maps + expo-location + OSRM con respaldo) y un plan de entrega de 2 días en rebanadas (0, A, B, C, D) con la ruta mínima 0 → A → B → D. También se corrigieron la tabla de specs y la trazabilidad de CA-001-31/D5 en progress.md y plan.md, y las menciones a `firestore.rules` (D-80).
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: Nuevos: `docs/seguridad.md`, `docs/arquitectura-api-pasajero.md`, `docs/arquitectura-mapa-recorrido.md`, `docs/plan-entrega-final.md`. Modificados: `docs/decisiones.md`, `docs/progress.md`, `docs/backlog.md`, `specs/001-registro-conductor/plan.md`, `README.md`, `docs/AI_LOG.md`. Sin commit.
- Verificación: `node scripts/check-constitution.mjs` → 36 errores, 0 advertencias (antes: 36 errores y 4 advertencias C23). Los 36 errores son los de la línea base: 35 C21 (requisitos MAESTRO sin tarea, que se cubrirán al aprobar el plan de entrega) y 1 C01 (falso positivo por `.env`). No se ejecutó código, lint ni build; nada se marcó Validada.
- Aprendizaje:

### Entrada #41
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Opus 5.5, claude-opus-5-5)
- Objetivo: Cambiar el mapa a MapLibre con OpenFreeMap (sin clave de Google) e implementar la rebanada 0 (T-35 a T-37)
- Prompt textual:
````
Rebanada 0 revisada: mapa open source (MapLibre + OpenFreeMap) y ubicación (T-35 a T-37).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cambiar el mapa a MapLibre con OpenFreeMap (sin clave de Google) e implementar la rebanada 0 (T-35 a T-37)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. DECISIONES de Anderson (2026-11-10), a registrar en docs/decisiones.md:
 a) D-82 pasa a Vigente MODIFICADA: se DESCARTA react-native-maps (Google Maps exige cuenta de facturación y clave dentro del APK, y Anderson no puede o no quiere asumirlo). Se usa @maplibre/maplibre-react-native (versión 11.x; peer deps verificadas: react >=19.1, react-native >=0.80, expo >=54) con teselas de OpenFreeMap (estilo https://tiles.openfreemap.org/styles/liberty, alternativa positron; sin clave ni registro) y expo-location para la posición. Rutas por calles con OSRM como ya definía el plan. Atribución visible: «© OpenMapTiles», «Data from OpenStreetMap» (MapLibre la muestra por defecto; no la ocultes) y la de OSRM/OSM.
 b) D-79 y D-81 se mantienen, pero ya NO hay clave de Google: elimina de docs y .env.example toda mención a GOOGLE_MAPS_ANDROID_API_KEY, a app.config.js como necesidad de la clave, a la restricción por SHA-1 y a las alertas de presupuesto de Google. Si el mapa no requiere ninguna variable, no añadas variables nuevas.
 c) Autorizo editar scripts/dependencies.json para dejar permitidas SOLO @maplibre/maplibre-react-native y expo-location, e instalarlas con npx expo install (respeta SDK 57). Nada más.
 d) Se conserva el Plan B del plan (vista del viaje sin mapa) y los criterios para activarlo.

2. ACTUALIZA LOS DOCUMENTOS (antes de implementar): docs/arquitectura-mapa-recorrido.md, docs/plan-entrega-final.md (T-35 a T-37 y los riesgos: desaparecen los de clave y facturación; añade los de teselas y OSRM sin internet), docs/decisiones.md, README y .env.example, para que sean coherentes con MapLibre. Mantén la aprobación del plan para las rebanadas 0, A y B (Anderson la da aquí).

3. IMPLEMENTA exactamente T-35, T-36 y T-37 (adaptadas a MapLibre, con sus CA): configuración nativa mínima (si basta con añadir el plugin de MapLibre y el de expo-location a app.json, NO conviertas a app.config.js; no debe haber regresión en nada de lo que ya tiene app.json; permisos de ubicación con texto en español), módulo de rutas aislado en src/services/routing/* (OSRM, con ruta de respaldo precargada y línea recta como último recurso), y la prueba mínima del mapa: mapa visible con el estilo de OpenFreeMap, permiso de ubicación y posición actual del conductor, y una ruta por calles entre dos puntos fijos dibujada, con estados de carga y error con reintento (ScreenState). La prueba debe verse SOLO con SHOW_DEV_TOOLS en true (el valor en el repositorio sigue en false) o donde defina el plan. Textos en español en src/constants/labels.js. Marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo. IMPORTANTE: la API de @maplibre/maplibre-react-native cambió entre la v10 y la v11; después de instalar, lee los tipos y la documentación del paquete instalado en node_modules y su documentación oficial, no escribas de memoria. Usa implementer y verifier distintos. Marca cada tarea como "Implementada y verificada en lo estático; pendiente de validación en dispositivo".

4. VERIFICACIÓN: node scripts/check-constitution.mjs (esperado: 36 errores / 0 advertencias; explica cualquier cambio). El verifier revisa por lectura de código: ningún secreto ni clave en archivos versionados, app.json sin regresión, módulo de rutas aislado, prueba del mapa invisible con SHOW_DEV_TOOLS=false, atribución presente, y que no se tocó firestore, servicios existentes ni el registro. Confirma con git diff que package.json solo ganó las dos dependencias autorizadas.

5. REGLAS: no ejecutes expo run, prebuild ni eas (el build lo hago yo); no ejecutes npx expo lint; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; ninguna dependencia fuera de las autorizadas. Si algo resulta inviable (por ejemplo una incompatibilidad con RN 0.86), detente y explícalo en vez de improvisar.

6. SALIDA: resumen corto con (i) qué se hizo por tarea, (ii) lo que quedó pendiente o fuera de alcance, (iii) la lista exacta y ordenada de pasos para que yo haga el build nativo en mi PC con Windows (PowerShell: detener Metro, instalar, reconstruir con el celular conectado, volver a levantar Metro con -c), y (iv) el checklist de prueba en el celular: mapa visible con atribución, permiso de ubicación, posición actual, ruta dibujada, error de red con reintento, y que con SHOW_DEV_TOOLS=false no se ve nada de la prueba.
````
- Resumen de la respuesta (2–3 líneas): D-82 pasa a Vigente MODIFICADA (MapLibre 11 + OpenFreeMap + expo-location + OSRM, sin clave de Google) y los documentos quedan coherentes con la aprobación de las rebanadas 0, A y B. Se implementan T-35 (plugin de expo-location en `app.json`), T-36 (módulo de rutas aislado: OSRM → ruta precargada → línea recta) y T-37 (pantalla de prueba del mapa visible solo con `SHOW_DEV_TOOLS`). Las tres quedan implementadas y verificadas en lo estático, pendientes del checkpoint 0 en el celular.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: Sin commit. Modificados: `app.json`, `package.json`, `package-lock.json`, `scripts/dependencies.json`, `src/constants/labels.js`, `src/navigation/MainDrawer.js`, `src/screens/home/HomeScreen.js`, `README.md`, `docs/decisiones.md`, `docs/arquitectura-mapa-recorrido.md`, `docs/plan-entrega-final.md`, `docs/seguridad.md`, `docs/backlog.md`, `docs/progress.md`, `docs/AI_LOG.md`. Nuevos: `src/config/map.js`, `src/config/routing.js`, `src/services/routing/{index,osrmRouting,fallbackRoute,straightLine}.js`, `src/screens/dev/MapTestScreen.js`.
- Verificación: `check-constitution` pasó de 36 a 32 errores y 0 advertencias (RF-08, RF-12, RNF-06 y RNF-08 ya tienen tarea; el C01 de `.env` es el falso positivo conocido). `git diff package.json` muestra solo las 2 dependencias autorizadas; `git diff app.json` solo añade los plugins. Script propio del agente principal fuera del proyecto, contra la fuente real: 6/6 (OSRM real 162 puntos, 2933 m, 222 s; sin red → `ROUTE_FAILED`; respaldo precargado; línea recta; HTTP 429 → `ROUTE_FAILED`; puntos inválidos). Verifier independiente: 11/11 PASS, sin hallazgos bloqueantes. No verificado en dispositivo (pendiente: Anderson, checkpoint 0).
- Aprendizaje:

### Entrada #42
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Opus 5.5, claude-opus-5-5)
- Objetivo: Implementar tarifa y comisión (T-38, T-39), API del pasajero con mock (T-40), fuente de ubicación (T-41) y disponibilidad (T-42)
- Prompt textual:
````
Rebanadas A y B (primera mitad): tarifa, API del pasajero con mock, ubicación y disponibilidad (T-38 a T-42 de docs/plan-entrega-final.md).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Implementar tarifa y comisión (T-38, T-39), API del pasajero con mock (T-40), fuente de ubicación (T-41) y disponibilidad (T-42)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. ESTADO PREVIO: registra en backlog.md y progress.md que T-35, T-36 y T-37 quedan VALIDADAS en dispositivo por declaración de Anderson (2026-11-10): permiso de ubicación en español, mapa con calles y atribución visible, ruta dibujada en el color de acento del diseño (verde azulado; no es un defecto), «Ver mi posición» lleva la cámara a su punto real (Medellín), permiso negado con aviso y mapa funcionando, modo avión con error o ruta de respaldo y recuperación al reconectar, y con SHOW_DEV_TOOLS=false no se ve rastro de la prueba. Ya hay commit de esas tareas: no lo repitas. Aprobación de Anderson: apruebo las tareas T-38 a T-42 tal como están en el plan, con los ajustes de este prompt.

2. T-38 y T-39 (rebanada A): src/config/pricing.js con los parámetros de RF-21 en COP enteros y la comisión como fracción 0.20 (D-76) y la función pura calculateFare en src/utils/ (sin React, sin red, sin efectos; redondeo explícito y documentado). El registro (RegistrationFormContext y DocumentsScreen, hoy con COMMISSION_RATE_PERCENT = 20 fijo) debe leer la tasa de pricing.js, mostrarla como «20 %» y enviar commissionRate como 0.20 a Firestore. Al precargar un documento antiguo con 20, un valor mayor que 1 se interpreta como porcentaje (20 → 0.20). Comprueba contra docs/seguridad.md que las reglas solo exigen que commissionRate sea un número. No cambies nada más del registro.

3. T-40 (API del pasajero): impleméntala según docs/arquitectura-api-pasajero.md: src/services/passengerApi/{index.js, contract.js, mockPassengerApi.js, httpPassengerApi.js, mappers.js}. index.js elige mock/http con UNA constante. Modelo interno TripRequest y Trip, operaciones subscribeToRequests (devuelve la función para cancelar), acceptRequest, rejectRequest, reportTripStatus, cancelTrip y reportDriverLocation, con errores normalizados. httpPassengerApi.js queda como esqueleto claro con la estructura lista (la API real aún no se conoce) y mappers.js como único archivo que conocerá la forma real. El MOCK debe generar solicitudes con coordenadas cercanas a la posición actual del conductor (recogida a 0,8–2 km y destino a 2–6 km, con nombres ficticios, categoría y vencimiento de unos 30 s) para que funcione en cualquier ciudad donde pruebe, e implementar el resto de operaciones en memoria. Debe reemplazar la lógica del botón «Simular solicitud (provisional)», que sigue visible solo con SHOW_DEV_TOOLS.

4. T-41 (fuente de posición): src/services/location/* con una interfaz común y DOS fuentes intercambiables elegidas por una constante: GPS real (expo-location, watchPositionAsync) y SIMULADA (recorre una polilínea de ruta a velocidad configurable). Manejo de permisos en español, limpieza al desmontar, y sin ubicación en segundo plano. El módulo de rutas de T-36 se reutiliza tal cual.

5. T-42 (disponibilidad): en Inicio, un interruptor accesible «Disponible / No disponible» (área táctil mínima 44, estado visible también en texto, nunca solo por color). Al activarlo se pide el permiso de ubicación si falta y se suscribe a solicitudes del mock; al desactivarlo se cancela la suscripción. El estado vive en un contexto de la app (NO escribas nada nuevo en Firestore en esta mitad: las reglas actuales no permiten editar el documento del conductor aprobado y las nuevas reglas se tratan en la segunda mitad). Si no hay tarjeta de solicitud todavía (T-43), muestra bajo SHOW_DEV_TOOLS una línea de depuración «Solicitud recibida: <id>». Textos en español en src/constants/labels.js, estilos con los tokens de DESIGN.md.

6. VERIFICACIÓN: con scripts temporales FUERA del proyecto (scratchpad o scripts/_tmp, ignorado) comprueba contra el código real: (a) calculateFare con el ejemplo de RF-22 (Económico 19.200 / 3.840 / 15.360; XL 26.900 / 5.380 / 21.520) más casos de borde (cero, negativos, no numéricos, categoría inválida); (b) el mock genera solicitudes válidas con el modelo, vencen, y accept/reject/cancel responden con los errores normalizados esperados; (c) la fuente simulada recorre una polilínea y termina. Reporta tablas de resultados y borra los scripts. Ejecuta node scripts/check-constitution.mjs e informa el resultado (esperado: igual o menos errores que 32, 0 advertencias). Un verifier distinto revisa por lectura de código: función pura, una sola fuente de la tasa (grep de 20 y 0.2), el único archivo que conoce la forma de la API es mappers.js, el selector mock/http es una constante, las pantallas no importan nada del mock directamente, limpieza de suscripciones y de la fuente de ubicación, registro sin regresión, y que con SHOW_DEV_TOOLS=false no se ve nada provisional. Marca T-38 a T-42 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo".

7. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques firestore.rules ni backend/; marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo. Si algo del plan resulta inviable, detente y explícalo en vez de improvisar.

8. SALIDA: resumen corto con (i) qué se hizo por tarea, (ii) tablas de las pruebas de los scripts, (iii) lo pendiente o fuera de alcance, y (iv) el checklist para el celular: ver «20 %» en Documentos, enviar un registro nuevo y comprobar commissionRate 0.2 en Firestore, reabrir con precarga y con un documento antiguo con 20, activar y desactivar Disponible con y sin permiso de ubicación, y con SHOW_DEV_TOOLS=true pulsar «Simular solicitud» y ver la línea de depuración con la solicitud generada cerca de mi posición.
````
- Resumen de la respuesta (2–3 líneas): Se registró T-35 a T-37 como Validadas. Se implementaron T-38 a T-42: tasa única en `src/config/pricing.js` y `calculateFare` pura; puerto de la API del pasajero con mock en memoria (solicitudes cerca de la posición, vencimiento 30 s, errores normalizados), esqueleto http y mappers; fuentes de posición GPS/simulada con hook limitado (5 s / 20 m, pausa por AppState); interruptor Disponible en Inicio con estado en contexto y sin Firestore. Se agregó `src/constants/tripStatus.js` para cumplir C14 (estados de viaje en un solo lugar).
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: Sin commit. Nuevos: `src/config/{pricing,passengerApi,location}.js`, `src/utils/fare.js`, `src/constants/tripStatus.js`, `src/services/passengerApi/{index,contract,mockPassengerApi,httpPassengerApi,mappers}.js`, `src/services/location/{index,gpsLocationSource,simulatedLocationSource,throttle}.js`, `src/hooks/{useDriverLocation,useTripRequests}.js`, `src/context/AvailabilityContext.js`, `src/components/AvailabilitySwitch.js`. Modificados: `src/context/RegistrationFormContext.js`, `src/screens/registration/DocumentsScreen.js`, `src/constants/labels.js`, `src/navigation/MainDrawer.js`, `src/screens/home/HomeScreen.js`, `docs/backlog.md`, `docs/progress.md`, `docs/AI_LOG.md`.
- Verificación: scripts temporales en el scratchpad contra el código real, 66/66 OK (RF-22: Económico 19.200 / 3.840 / 15.360 y XL 26.900 / 5.380 / 21.520; bordes inválidos → INVALID_FARE_INPUT; mock: 50 solicitudes con recogida 0,82–2,00 km y destino 2,27–5,99 km, vencimiento 30.000 ms, EXPIRED / ALREADY_TAKEN / INVALID_STATE; fuente simulada recorre 1,95 km en 195 pasos y termina), scripts borrados. check-constitution: 32 → 24 errores, 0 advertencias; --selftest OK. Verifier independiente: verificada en lo estático, sin fallas bloqueantes (4 hallazgos menores en progress.md). Pendiente: checkpoint 1 en el celular.
- Aprendizaje:

### Entrada #43
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Opus 5.5, claude-opus-5-5)
- Objetivo: Corregir el bucle del diálogo de ubicación (T-41) e implementar la tarjeta de solicitud (T-43), el viaje con recorrido en tiempo real (T-44) y el resumen (T-45)
- Prompt textual:
````
Rebanada B (segunda mitad): corrección del bucle de ubicación, tarjeta de solicitud, viaje con recorrido en tiempo real y resumen (T-43 a T-45 de docs/plan-entrega-final.md).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir el bucle del diálogo de ubicación (T-41) e implementar la tarjeta de solicitud (T-43), el viaje con recorrido en tiempo real (T-44) y el resumen (T-45)", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. RESULTADO DEL CHECKPOINT 1 (Anderson, 2026-11-10, en celular real): registra en backlog.md y progress.md que T-38, T-39, T-40 y T-42 quedan VALIDADAS por declaración de Anderson, con estas excepciones: (a) T-41 NO queda validada: con la ubicación del sistema apagada, el diálogo de Google «Para mejorar la experiencia, el dispositivo necesita usar la Precisión de la ubicación» reaparece en bucle aunque se pulse «No, gracias» (defecto a corregir en el punto 2); (b) el ícono de ubicación del sistema nunca aparece en la barra de ese teléfono, por lo que "desaparece al desactivar" queda como no concluyente en dispositivo (la limpieza sí está verificada por lectura de código). Ya hay commit de T-38 a T-42: no lo repitas.

2. CORRECCIÓN DEL BUCLE (parte de T-41, hazla primero): diagnostica por lectura de código la causa. Hipótesis a verificar: el diálogo es una pantalla aparte del sistema, la app pasa a segundo plano y vuelve a activa, y el hook de ubicación (que se pausa y reanuda con el estado de la app) reinicia el watch y vuelve a lanzar el diálogo. Explica la causa real en 3-4 líneas. Corrige así: si los servicios de ubicación del sistema están apagados o el diálogo se rechaza, NO se reinicia solo; el conductor queda «No disponible» con un aviso claro en español («Activa la ubicación del teléfono para estar disponible») y solo se reintenta cuando él vuelva a pulsar el interruptor (o si al volver a la app comprobar con Location.hasServicesEnabledAsync que ya están activos). Sin bucles ni reintentos automáticos que muestren el diálogo más de una vez por acción del usuario.

3. DECISIONES de Anderson para esta entrega: (a) la comisión es regla de la plataforma: la precarga ignora un commissionRate distinto guardado y el registro siempre muestra y envía el valor de pricing.js (0.20); (b) las distancias del mock son las del prompt anterior (recogida 0,8–2 km, destino 2–6 km, 30 s): actualiza docs/arquitectura-api-pasajero.md para que coincida; (c) apruebo T-43 a T-45 con los ajustes de este prompt.

4. T-43 (tarjeta de solicitud): usa la pantalla TripRequest que ya existe como marcador. Al llegar una solicitud del mock con el conductor disponible se navega a ella y muestra: nombre y calificación del pasajero, distancia y tiempo hasta la recogida, distancia y duración del viaje, categoría, tarifa estimada y ganancia neta (con calculateFare y la comisión de pricing.js), cuenta regresiva hasta el vencimiento, y botones «Aceptar» y «Rechazar» (≥44 de área táctil, accesibles). Si vence, estado claro («La solicitud venció») y vuelta a Inicio; si otra respuesta falla (ya tomada, expirada, red), mensaje en español sin Alert. Corrige los hallazgos del verifier: una solicitud vencida se elimina del estado; solo se atiende una solicitud a la vez; y un viaje activo no debe quedar bloqueado si se desactiva Disponible a mitad del viaje (definir y documentar el comportamiento).

5. T-44 (viaje con recorrido en tiempo real — REQUISITO OBLIGATORIO DE LA PROFESORA): usa la pantalla TripActive. Tras aceptar: estado «en camino al pasajero». Se muestra el mapa (reutiliza lo hecho en T-37: crea un componente de mapa compartido en src/components/map/ para no duplicar), con el marcador del pasajero en la recogida (X), el marcador del conductor (Y), la polilínea de la ruta por calles de Y a X (módulo src/services/routing/*) y la cámara siguiendo al conductor. El conductor AVANZA POR LA RUTA EN TIEMPO REAL hasta X: usa la fuente de posición de T-41 (constante para elegir GPS real o SIMULADA que recorre la polilínea; para la demostración será la simulada, con una constante de factor de velocidad para acelerarla). Muestra distancia y tiempo restantes que se actualizan, detecta la llegada con un umbral en metros (constante) y pasa el estado a «llegó»; después «Iniciar viaje» (estado en curso) con la ruta recogida → destino recorrida del mismo modo hasta el destino, y «Finalizar viaje» al llegar. Estados del viaje SOLO en src/constants/tripStatus.js. Cada cambio de estado se informa con reportTripStatus y la posición con reportDriverLocation (limitada a máximo cada 5 s o 20 m). Si la ruta falla: reintentos limitados, luego línea recta con el aviso «Ruta aproximada» (ya existe) y el «Reintentar» debe volver a pedir la ruta a OSRM de verdad (hallazgo previo). Permite cancelar el viaje con confirmación sencilla. Error de ubicación o de red: estados claros, sin bucles.

6. T-45 (resumen): pantalla TripSummary con distancia, duración, tarifa, comisión (pricing.js) y ganancia neta calculadas con calculateFare, hora y pasajero, y un botón «Volver a Inicio» que deja al conductor disponible o no según el estado previo. SIN guardar todavía en Firestore (eso es la rebanada C).

7. PUBLICAR POSICIÓN EN FIRESTORE (mínimo y opcional por constante): escribe la última posición del conductor en driverLocations/{uid} (set con merge: lat, lng, timestamp, estado del viaje) con la misma limitación de frecuencia, detrás de la constante PUBLISH_DRIVER_LOCATION. Las reglas actuales NO lo permiten: redacta la regla nueva (solo el dueño crea y actualiza su documento; lat y lng numéricos; sin lectura de terceros) en docs/seguridad.md y en tu copia local de firestore.rules (ignorada por Git), y dime EXACTAMENTE qué debo copiar y pegar en la consola de Firebase. Si la escritura falla por permisos, la app debe seguir funcionando sin bloquear ni mostrar errores al conductor (registro silencioso con reintento acotado).

8. VERIFICACIÓN: con scripts temporales FUERA del proyecto (scratchpad o scripts/_tmp, ignorado) y contra el código real comprueba: la máquina de estados del viaje (transiciones válidas e inválidas), la detección de llegada por umbral con una polilínea simulada, el cálculo de distancia y tiempo restantes, la lógica de expiración y de una sola solicitud a la vez, y la limitación de frecuencia de reportes. Reporta tablas y borra los scripts. Ejecuta node scripts/check-constitution.mjs e informa el resultado (esperado: igual o menos de 24 errores, 0 advertencias). Un verifier distinto revisa por lectura de código: corrección del bucle sin reintentos automáticos, estados del viaje solo en tripStatus.js, ninguna pantalla importa el mock directamente, limpieza de suscripciones, temporizadores y fuente de ubicación al salir de la pantalla, accesibilidad de los botones (44), textos en labels.js, atribución del mapa visible, y que con SHOW_DEV_TOOLS=false no hay nada provisional. design-auditor (si está disponible) revisa contraste y consistencia de las 3 pantallas nuevas; corrige solo lo de severidad alta que sea de estilo. Marca T-43 a T-45 y la corrección de T-41 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo".

9. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/; marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo. Si algo del plan resulta inviable, detente y explícalo en vez de improvisar.

10. SALIDA: resumen corto con (i) la causa del bucle y su corrección, (ii) qué se hizo por tarea, (iii) tablas de las pruebas, (iv) lo pendiente o fuera de alcance, (v) el texto exacto de la regla de Firestore que debo publicar en la consola, y (vi) el checklist para el celular: ubicación del sistema apagada sin bucle; con SHOW_DEV_TOOLS=true y fuente simulada, simular solicitud → tarjeta → aceptar → marcadores y ruta → el conductor avanza hasta el pasajero en tiempo real → llegó → iniciar viaje → recorrido hasta el destino → finalizar → resumen con tarifa y comisión; rechazar y dejar vencer una solicitud; cancelar un viaje; modo avión durante el viaje; y comprobar en Firestore el documento driverLocations.
````
- Resumen de la respuesta (2–3 líneas): completado en el cierre del prompt #46; ver progress.md y D-83.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: ver el estado de git; sin commit.
- Verificación: verifier distinto (prompt #43) por lectura; validado por declaración de Anderson en el checkpoint 2.
- Aprendizaje:

---

### Entrada #44
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Opus 5.5, claude-opus-5-5)
- Objetivo: Corregir el bloqueante de T-44, publicar el estado final del viaje y liberar el viaje activo, y aplicar los ajustes de diseño
- Prompt textual:
````
Corrección de T-44, liberación del viaje activo y ajustes de diseño (rechazo del verifier).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir el bloqueante de T-44, publicar el estado final del viaje y liberar el viaje activo, y aplicar los ajustes de diseño", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. RESULTADO DEL CHECKPOINT 2 (Anderson, 2026-11-10, celular real, fuente simulada): registra en backlog.md y progress.md. VALIDADAS por declaración: T-41 (con la ubicación del sistema apagada el diálogo sale una sola vez, sin bucle), T-43 (tarjeta, aceptar, rechazar, vencer y que las solicitudes lleguen solas cuando está disponible) y T-45 (resumen con tarifa y comisión). T-44 NO queda validada: el flujo funciona (marcadores, ruta, avance en tiempo real hasta el pasajero, llegada, inicio, recorrido al destino, finalizar, cancelar con confirmación, modo avión con línea recta y recuperación con «Reintentar»), pero tiene dos defectos observados: (a) en driverLocations/{uid} el campo tripStatus se queda en "in_progress" para siempre, tras finalizar o tras cancelar el viaje; (b) después de finalizar o cancelar, el conductor no puede tomar nuevas solicitudes (aparece un mensaje relacionado con "actividad" o disponibilidad). NOTA: el mensaje "otro conductor tomó el viaje" en algunas solicitudes es el caso simulado ALREADY_TAKEN: es correcto, no lo toques. Ya existe commit de T-38 a T-42; T-41, T-43, T-44, T-45 aún no están en commit.

2. DIAGNÓSTICO (primero): por lectura de código, explica en pocas líneas la causa real de (a) y (b): dónde se publica tripStatus y por qué no se envía el estado final (por ejemplo, el reportador se detiene antes de la última escritura o la limitación de frecuencia la descarta); dónde se marca y se libera el viaje activo/ocupado (tripController, contexto de disponibilidad, mock de la API) y por qué no se libera tras completed o cancelled; y qué texto de labels.js produce el mensaje que ve el conductor (busca el literal en labels.js y su origen). No corrijas antes de explicarlo.

3. CORRECCIÓN: al llegar a completed o cancelled: (i) se publica UNA última escritura en driverLocations con el tripStatus final, saltando la limitación de frecuencia, con reintentos acotados y sin bloquear la UI; (ii) al volver a Inicio se deja tripStatus en un valor neutro de reposo definido en src/constants/tripStatus.js (única fuente de estados); (iii) se libera por completo el estado de viaje activo (controlador destruido, ocupado liberado, viaje limpiado en el mock) para que la siguiente solicitud llegue y se muestre normal; (iv) el mismo comportamiento si el viaje se cancela, si falla la red y si se desactiva Disponible a mitad de viaje (define y documenta qué ocurre).

4. BLOQUEANTE DE T-44 (tripController.js, hacia las líneas 286-295): si falla el envío de completed y se reintenta con «Reintentar», el siguiente toque de «Finalizar viaje» queda esperando para siempre; los botones quedan deshabilitados y no se puede salir. Lo mismo si el servidor rechaza completed con un error definitivo. Corrígelo de modo que la pantalla NUNCA quede sin salida: tiempos máximos, un estado de error con «Reintentar» y una salida segura («Salir del viaje» o equivalente, con confirmación) en todos los caminos de fallo.

5. AJUSTES DE DISEÑO Y TEXTO (aprobados por Anderson): (a) la cuenta regresiva de la tarjeta y «Tu ganancia» deben verse con más peso (tamaño y grosor); en los últimos 10 s usa el color primario de DESIGN.md y énfasis tipográfico, NO rojo; (b) el botón «Iniciar viaje» pasa a decir «Pasajero a bordo» (palabra de F1) y registra una decisión D-xx; (c) el umbral de llegada se queda en 25 m: actualiza docs/arquitectura-mapa-recorrido.md; (d) un único texto para la solicitud vencida: «La solicitud venció» en labels.js; (e) una tarjeta vencida llama a rejectRequest en silencio; (f) los botones deshabilitados durante el viaje muestran el motivo con una línea de texto (por ejemplo «Disponible al llegar al destino»); (g) el resumen no debe mostrar «sin viaje» un instante antes de navegar; (h) al volver a la app no debe abrirse el diálogo de permiso (solo comprobación silenciosa); (i) sin red, las escrituras pendientes de ubicación se acumulan: conserva solo la última posición pendiente y documenta la limitación; (j) revisa los bordes decorativos señalados por el design-auditor.

6. VERIFICACIÓN: con scripts temporales FUERA del proyecto y contra el código real: completar un viaje y luego recibir y aceptar otro; cancelar y recibir otro; fallo de completed, reintento y salida segura; escritura final de tripStatus (completed y cancelled) y valor de reposo después; Disponible desactivado a mitad de viaje; límite de frecuencia sin romper la escritura final. Reporta tablas y borra los scripts. Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos y 0 advertencias). La verificación la hace un verifier NUEVO, distinto del que rechazó T-44 y del implementer: debe revisar el bloqueante, la liberación del viaje activo, la publicación del estado final, la limpieza de temporizadores y suscripciones, y que con SHOW_DEV_TOOLS=false no hay nada provisional. design-auditor, segunda ronda, sobre las 3 pantallas del viaje. Marca T-44 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo" solo si el verifier la aprueba; si la rechaza otra vez, no sigas encadenando: informa y detente.

7. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni cambies las reglas de Firestore ya publicadas (si necesitas un cambio, propónlo y detente); marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo.

8. SALIDA: resumen corto con (i) la causa de (a) y (b) y cómo se corrigió, (ii) cómo quedó el bloqueante, (iii) los ajustes de diseño aplicados, (iv) tablas de pruebas, (v) lo pendiente, y (vi) el checklist para el celular: finalizar un viaje y comprobar en Firestore que tripStatus pasa a completed y luego al valor de reposo; recibir y aceptar otro viaje; cancelar uno y recibir otro; modo avión justo al finalizar y comprobar que hay Reintentar y salida segura; ver «Pasajero a bordo»; ver la cuenta regresiva con más peso; y que no aparece el diálogo de permiso al volver a la app.
````
- Resumen de la respuesta (2–3 líneas): Se diagnosticó que `tripStatus` solo lo escribía el reporte regulado y que el mock conservaba el viaje activo. Se añadió publicación del estado final y `idle` con cola ordenada, `finish()` acotado con respuesta tardía, liberación del viaje (`endTrip`) y D-83. Se aplicaron ajustes de diseño y los 3 hallazgos de la ronda 2.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: tripController.js, driverLocationPublisher.js, TripContext.js, tripStatus.js, trip.js, labels.js, TripActiveScreen.js, TripRequestScreen.js, mockPassengerApi.js, docs (decisiones D-83, arquitectura-mapa-recorrido, seguridad, backlog, progress, ronda-2-viaje); sin commit.
- Verificación: script temporal 50 PASS / 0 FAIL; verifier independiente 91 comprobaciones, aceptada en lo estático con 3 menores; `check-constitution` 23 errores base / 0 advertencias. Falta prueba en el celular.
- Aprendizaje:

---

### Entrada #45
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Encontrar y corregir la causa raíz por la que, tras finalizar o cancelar un viaje, el conductor no recibe nuevas solicitudes
- Prompt textual:
````
Corrección del defecto: tras terminar un viaje (finalizado o cancelado) ya no llegan solicitudes.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Encontrar y corregir la causa raíz por la que, tras finalizar o cancelar un viaje, el conductor no recibe nuevas solicitudes", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. RESULTADO DEL CHECKPOINT 3 (Anderson, 2026-11-10, celular real, fuente simulada): registra en backlog.md y progress.md. VALIDADO por declaración: tripStatus pasa a completed y luego a idle al volver a Inicio; el estado cancelled se publica al cancelar; «Pasajero a bordo» visible en la recogida; la cuenta regresiva se ve más fuerte; al volver a la app no aparece diálogo de permiso; modo avión al finalizar funciona como se espera. NO VALIDADO por un defecto nuevo: (c) después de finalizar O de cancelar un viaje, con Disponible activado (interruptor en verde), la ubicación del sistema activa y el permiso concedido, la pista de Inicio se queda en «Obteniendo tu ubicación…» para siempre, «Simular solicitud (provisional)» responde «Activa Disponible para simular una solicitud.», no llegan solicitudes nuevas, y apagar y volver a encender el interruptor NO lo recupera. Reiniciar la app sí lo recupera. Antes del primer viaje todo funciona. Los pasos 2 y 3 del checklist (recibir otra solicitud tras finalizar y tras cancelar) no se pudieron probar por este defecto. T-44 sigue sin validar.

2. DIAGNÓSTICO POR REPRODUCCIÓN (primero, antes de corregir): hipótesis a comprobar, que SON hipótesis y no hechos: (i) el controlador del viaje usa o reemplaza la misma fuente de posición que alimenta la disponibilidad y, al destruirse o detenerse, deja esa fuente parada sin que nadie la reinicie; (ii) un indicador interno (iniciado, en pausa, ocupado, ubicación bloqueada, suscripción activa) queda en un valor que impide reiniciar el watch; (iii) la posición se reinicia a null al empezar el viaje y no vuelve a poblarse; (iv) la suscripción del mock o el efecto de disponibilidad no se recrea porque sus dependencias no cambian; (v) alguna interacción con el cambio de estado de la app (activa/segundo plano). Traza por lectura de código el ciclo de vida completo: Disponible activado → solicitud → aceptar → viaje → finalizar o cancelar → volver a Inicio, siguiendo qué fuente de ubicación, qué hook y qué suscripción existen en cada paso. Escribe un script temporal FUERA del proyecto (scratchpad o scripts/_tmp, ignorado) que reproduzca esa secuencia contra el código real con fuentes y temporizadores simulados, y que FALLE antes de la corrección (la posición no vuelve y no llegan solicitudes). Si con el script no logras reproducirlo, NO adivines: añade instrumentación TEMPORAL con el prefijo [DIAG-LOC] (sin imprimir coordenadas ni datos personales; solo presencia, estados, inicio y parada de fuentes, suscripciones y desuscripciones, y transiciones del hook y del efecto de disponibilidad), regístrala como decisión temporal con número libre (como se hizo con D-67), y dame los pasos exactos para ver en mi Metro el resultado y qué copiar; no declares corregido nada sin evidencia.

3. CORRECCIÓN: explica la causa raíz en pocas líneas y corrígela de forma que: (a) al terminar o cancelar un viaje, la fuente de posición y la suscripción de solicitudes de Inicio quedan funcionando exactamente igual que antes del viaje; (b) apagar y encender Disponible SIEMPRE recupera el servicio (si la fuente no está corriendo, se reinicia: comportamiento autorreparable); (c) no se reintroduce el bucle del diálogo de ubicación ya corregido en T-41; (d) el viaje con fuente simulada y la fuente GPS de Inicio no se interfieren entre sí. Si el viaje y Inicio comparten una fuente, sepáralas o gestiona su propiedad de forma explícita y documentada.

4. MENORES ABIERTOS DE T-44 en la misma zona (corrígelos solo si el riesgo es bajo): tras cancel() o un cierre tardío, el bucle de reintentos de tripController.js puede reenviar un estado viejo; y queda un temporizador de 2 s tras dispose. Deben quedar cancelados.

5. VERIFICACIÓN: el script del punto 2 debe FALLAR antes y PASAR después. Amplía las pruebas con: Disponible → aceptar → finalizar → llega otra solicitud en el plazo esperado → aceptar → cancelar → llega otra; apagar y encender Disponible tras un viaje; con la fuente simulada y con la GPS; viaje cancelado a mitad de camino; sin temporizadores ni suscripciones colgadas al final. Reporta tablas y borra los scripts. Retira la instrumentación temporal si la usaste, una vez confirmada la causa (y registra su retirada). Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos, 0 advertencias). La verificación la hace un verifier NUEVO, distinto del implementer y de los anteriores, que debe revisar el ciclo de vida de las fuentes y las suscripciones y comprobar que el script reproduce de verdad el escenario de mi captura. Marca el defecto y T-44 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo", sin declararlo validado.

6. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni las reglas de Firestore; no cambies lo ya validado (mapa, registro, tarjeta, resumen) salvo lo estrictamente necesario; marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo.

7. SALIDA: resumen corto con (i) la causa raíz demostrada y cómo la demostraste (script o diagnóstico), (ii) la corrección, (iii) tablas de pruebas (antes y después), (iv) lo pendiente, y (v) el checklist para el celular: Disponible → simular solicitud → aceptar → finalizar → comprobar que la pista de Inicio pasa a «Buscando solicitudes cerca de ti.» y llega otra solicitud sola; aceptar y cancelar a mitad → llega otra; encender y apagar Disponible tras un viaje; y repetirlo 3 veces seguidas.
````
- Resumen de la respuesta (2–3 líneas): completado en el cierre del prompt #46; ver D-84 y progress.md.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: ver el estado de git; sin commit (cierre en el prompt #46).
- Verificación: verifier nuevo (prompt #46) por lectura; `check-constitution` 23 errores base, 0 advertencias; validación en el celular por declaración de Anderson (2026-11-10).
- Aprendizaje:

---

---

### Entrada #46
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Cerrar la corrección del defecto de solicitudes tras un viaje: retirar la instrumentación [DIAG-LOC], verificar de forma independiente y registrar el estado
- Prompt textual:
````
Cierre de la corrección del viaje (D-84): retiro de la instrumentación temporal, verificación independiente y registro del estado.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Cerrar la corrección del defecto de solicitudes tras un viaje: retirar la instrumentación [DIAG-LOC], verificar de forma independiente y registrar el estado", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. CONFIRMACIÓN DE ANDERSON (2026-11-10, celular real, fuente simulada, SHOW_DEV_TOOLS=true): con popTo('Home') en TripActiveScreen, TripRequestScreen y TripSummaryScreen, y el ajuste de pump en tripController, el ciclo completo funciona: Disponible → simular solicitud → aceptar → finalizar → volver a Inicio → llega otra solicitud sola; cancelar a mitad → llega otra; apagar y encender Disponible tras un viaje; repetido varias veces; y el paso a paso del agente se cumple al 100 %. Registra en backlog.md y progress.md: el defecto (c) queda CORREGIDO y VALIDADO por declaración de Anderson, y T-44 queda VALIDADA por declaración de Anderson en dispositivo (con la cola de diseño todavía Pendiente). Actualiza D-84 con la causa raíz definitiva (React Navigation 7: navigate('Home') ya no retrocede, empuja un segundo Home; las pantallas de viaje quedaban montadas y endTrip, que se ejecuta al desmontarlas, no corría) y con la lección: el diagnóstico estático y el script que simulaba el desmontaje no reprodujeron el defecto; lo encontró el log del dispositivo.

2. RETIRO DE LA INSTRUMENTACIÓN: elimina diagLoc y todas las llamadas con el prefijo [DIAG-LOC]. Sin ningún cambio de comportamiento. Comprueba con grep que no queda ninguna y registra el retiro en D-84. Revisa además TODO el proyecto en busca de otros navigate() hacia pantallas que ya existen en la pila (por ejemplo, 'Home' desde otras pantallas o flujos) que puedan empujar duplicados del mismo modo; corrige solo los casos con riesgo real, con popTo o la API adecuada, y lista los que revisaste.

3. VERIFICACIÓN con un verifier NUEVO, distinto del implementer y de todos los anteriores: por lectura de código, (a) popTo('Home') es correcto en las tres pantallas y el resto de salidas del viaje (botón físico atrás, gesto atrás, cancelar, salir del viaje, solicitud vencida o rechazada) también dejan la pila sin pantallas duplicadas y llaman a endTrip o a la limpieza equivalente; (b) el retiro de la instrumentación no cambió comportamiento; (c) las fuentes de ubicación, suscripciones y temporizadores quedan limpios en todos los caminos; (d) con SHOW_DEV_TOOLS=false no hay nada provisional. Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos, 0 advertencias). Borra cualquier script temporal restante en la carpeta temporal. Cierra las entradas de la bitácora pendientes (#44 y #45 y la de este prompt) en todo lo que no sea de Anderson.

4. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni las reglas de Firestore; no cambies nada validado salvo lo estrictamente indicado. No empieces ninguna tarea nueva.

5. SALIDA: resumen corto con (i) qué se retiró y qué se revisó, (ii) el veredicto del verifier nuevo, (iii) los otros navigate() revisados y lo corregido, (iv) lo pendiente de Anderson (SHOW_DEV_TOOLS vuelve a false antes de commit, «Usado / modificado / descartado» y «Aprendizaje» de la bitácora), y (v) un checklist breve de humo para el celular: dos ciclos completos (uno finalizando y otro cancelando) tras el retiro de la instrumentación, y con SHOW_DEV_TOOLS=false confirmar que Inicio no muestra nada provisional.
````
- Resumen de la respuesta (2–3 líneas): Se retiró la instrumentación [DIAG-LOC] sin cambio de comportamiento, se registró la validación de Anderson (defecto (c) y T-44) y la causa definitiva en D-84, se revisaron todos los navigate() del proyecto y un verifier nuevo revisó por lectura las salidas del viaje.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: `docs/AI_LOG.md`, `docs/backlog.md`, `docs/progress.md`, `docs/decisiones.md` (D-84); `src/context/AvailabilityContext.js`, `src/context/TripContext.js`, `src/hooks/useDriverLocation.js`, `src/hooks/useTripRequests.js`, `src/services/passengerApi/mockPassengerApi.js` (instrumentación retirada); `src/utils/diagLoc.js` borrado. Sin commit.
- Verificación: grep de `diagLoc|DIAG-LOC` en `src/` sin resultados; `check-constitution`: 23 errores base, 0 advertencias; verifier nuevo (por lectura): salidas del viaje, limpieza de fuentes y temporizadores y retiro OK; observación menor: el gesto del drawer desde el viaje activo no se revisó a fondo; SHOW_DEV_TOOLS sigue en `true` a propósito hasta que Anderson lo vuelva a `false`. Falta humo en el celular tras el retiro.
- Aprendizaje:

---

### Entrada #47
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Mostrar la solicitud entrante como tarjeta inferior cuando el conductor está en otra pantalla, sin sacarlo de ella
- Prompt textual:
````
Mejora de UX: solicitud entrante como tarjeta inferior cuando el conductor no está en Inicio.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Mostrar la solicitud entrante como tarjeta inferior cuando el conductor está en otra pantalla, sin sacarlo de ella", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. PROCESO SDD: primero comprueba en docs/requisitos.md, en el plan y en F1 si algún RF o CA define cómo debe presentarse una solicitud entrante (por ejemplo notificación, pantalla completa, banner). Dime si estaba contemplado y si hay conflicto con lo que pido. Si no estaba contemplado, el spec-author lo registra como tarea nueva (siguiente T libre) con sus CA en backlog.md y progress.md, y una decisión D-xx con la justificación. Aprobación de Anderson: apruebo esta tarea con el diseño de abajo.

2. COMPORTAMIENTO REQUERIDO (decidido por Anderson, a su criterio de mejor UX):
 a) En Inicio la solicitud sigue a pantalla completa, como hoy (TripRequest).
 b) En cualquier otra pantalla del drawer (Perfil, Historial, Ganancias, Configuración y las demás que existan) aparece una TARJETA INFERIOR que no cambia la pantalla actual ni la navegación. Contiene: nombre del pasajero y calificación, distancia y tiempo hasta la recogida, tarifa estimada y ganancia neta (calculateFare y pricing.js, igual que la tarjeta completa), cuenta regresiva en texto y barra, y los botones «Aceptar», «Rechazar», «Ver detalle» y un botón de cerrar «✕».
 c) Aceptar desde la tarjeta lleva a TripActive a pantalla completa (mismo flujo que hoy). Rechazar la cierra y el conductor SE QUEDA en su pantalla. «Ver detalle» abre TripRequest a pantalla completa con la MISMA solicitud y el tiempo restante real. «✕» solo oculta la tarjeta: NO rechaza; la solicitud vence sola y no se vuelve a mostrar.
 d) Al vencer la solicitud la tarjeta se retira con un aviso breve («La solicitud venció») y el conductor sigue donde estaba; NO se navega a Inicio. Si estaba en TripRequest abierta desde otra pantalla (por «Ver detalle»), al rechazar o vencer vuelve a la pantalla de origen (goBack cuando se pueda; popTo('Home') solo si no hay pantalla previa; recuerda que navigate('Home') empuja un Home duplicado en React Navigation 7). Desde Inicio, el comportamiento actual de volver a Inicio se mantiene.
 e) NO aparece la tarjeta durante un viaje (cualquier pantalla Trip*), ni en Startup, registro, carga o error, ni con la cuenta no aprobada, ni si ya hay otra solicitud pendiente (una a la vez).
 f) Una única fuente de verdad de la solicitud pendiente (el contexto existente), de modo que la tarjeta y TripRequest muestren la misma cuenta regresiva calculada desde el vencimiento de la solicitud.

3. IMPLEMENTACIÓN: un componente de tarjeta superpuesta montado una sola vez a nivel del navegador raíz (por encima del drawer), que lee la pantalla actual con el estado de navegación o la referencia del navegador. Aísla la decisión de presentación en una función pura (por ejemplo decideRequestPresentation(rutaActual, enViaje, estadoCuenta, haySolicitud) → 'fullscreen' | 'card' | 'none') para poder probarla con un script. Sin dependencias nuevas y sin cambios nativos (nada de librerías de bottom sheet ni de vibración: usa Animated y componentes de React Native). Textos en español en src/constants/labels.js, estilos con tokens de DESIGN.md (no añadas colores fuera de los tokens), sin rojo en la cuenta regresiva.

4. ACCESIBILIDAD Y DISEÑO: botones de al menos 44x44; la tarjeta respeta el área segura inferior y NO tapa la barra de pestañas ni el contenido esencial (queda por encima con margen); se anuncia a lectores de pantalla como región en vivo con «Nueva solicitud de {nombre}»; la información no depende solo del color; la entrada animada respeta reduce-motion (AccessibilityInfo.isReduceMotionEnabled, sin animación o con atenuación simple); el texto crece con la escala del sistema sin recortarse; el foco y el orden de lectura son coherentes. Cuando la tarjeta esté visible, el contenido de la pantalla de abajo sigue siendo desplazable y usable.

5. VERIFICACIÓN: con scripts temporales FUERA del proyecto y contra el código real: la función pura de presentación (tabla de rutas × en viaje × estado de cuenta × solicitud pendiente), que cerrar con «✕» no rechaza y la solicitud vence sola, que al vencer no se navega a Inicio, que «Ver detalle» conserva el tiempo restante real, que no hay doble tarjeta ni doble solicitud, y que los temporizadores y suscripciones se limpian. Reporta tablas y borra los scripts. Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos, 0 advertencias). Un verifier NUEVO, distinto del implementer y de los anteriores, revisa por lectura de código: la navegación sin duplicados en TODAS las salidas, la ausencia de la tarjeta durante el viaje, accesibilidad y textos en labels.js, y que con SHOW_DEV_TOOLS=false no hay nada provisional. design-auditor revisa contraste, áreas táctiles y consistencia; corrige solo lo de severidad alta que sea de estilo. Marca la tarea como "Implementada y verificada en lo estático; pendiente de validación en dispositivo". Si el verifier la rechaza, no sigas encadenando: informa y detente.

6. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni las reglas de Firestore; no cambies lo ya validado salvo lo estrictamente necesario; marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo.

7. SALIDA: resumen corto con (i) si estaba contemplado y qué se registró, (ii) qué se hizo, (iii) tablas de pruebas, (iv) lo pendiente, y (v) el checklist para el celular (probar con SHOW_DEV_TOOLS=false para que lleguen solas, y con true si hace falta): estando en Perfil, Configuración y en cada pestaña del drawer, llega una solicitud → aparece la tarjeta inferior sin cambiar de pantalla; Aceptar → viaje; Rechazar → te quedas; «✕» → se oculta y vence sola sin llevarte a Inicio; «Ver detalle» → pantalla completa con el tiempo restante y, al rechazar o vencer, vuelves a tu pestaña; dejar vencer en otra pestaña → aviso breve y sin volver a Inicio; en Inicio sigue a pantalla completa; durante un viaje no aparece nada; con texto grande del sistema; y que la tarjeta no tapa la barra de pestañas.
````
- Resumen de la respuesta (2–3 líneas): Se implementó la tarjeta inferior (IncomingRequestCard, montada una vez en MainDrawer), la función pura decideRequestPresentation, el origen de retorno en TripRequest y el gating por foco en Home. El verifier nuevo RECHAZÓ en lo estático: TripRequest oculta (drawer deslizable) reacciona a la solicitud aceptada/rechazada desde la tarjeta. Se detuvo ahí, sin corregir, según el prompt.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: nuevos src/components/IncomingRequestCard.js y src/services/trip/requestPresentation.js; modificados src/navigation/MainDrawer.js, src/screens/home/HomeScreen.js, src/screens/trip/TripRequestScreen.js, src/constants/labels.js, docs/backlog.md, docs/decisiones.md (D-85), docs/progress.md, docs/AI_LOG.md. Sin commit.
- Verificación: check-constitution 23 errores / 0 advertencias antes y después (ninguno de T-54). Script temporal (borrado): tabla de presentación completa y 20 comprobaciones de código OK. Verifier: Rechazada (hallazgo mayor, ver backlog T-54). design-auditor: Aprobado condicionado, sin hallazgos altos. Falta prueba en celular.
- Aprendizaje:

### Entrada #48
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Corregir el hallazgo mayor del verifier de T-54 y aplicar los ajustes medios de bajo riesgo
- Prompt textual:
````
<pasted_content id="a70c">
Corrección del hallazgo mayor de T-54 (TripRequest oculta actuando bajo la tarjeta) y ajustes medios baratos.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir el hallazgo mayor del verifier de T-54 y aplicar los ajustes medios de bajo riesgo", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. RESULTADO DEL CHECKPOINT (Anderson, 2026-11-10, celular real, SHOW_DEV_TOOLS=false): VALIDADOS por declaración los 9 puntos del checklist de T-54 (tarjeta en cada pestaña del drawer, Aceptar lleva al viaje, Rechazar deja al conductor donde está, «✕» oculta y la solicitud vence sola sin llevar a Inicio, «Ver detalle» abre la pantalla completa correcta, dejar vencer muestra el aviso sin volver a Inicio, Inicio sigue a pantalla completa, durante un viaje no aparece nada, texto grande del sistema, la tarjeta no tapa contenido esencial). NO cubierto por esa prueba y NO validado: el escenario del hallazgo mayor (abrir «Ver detalle», salir deslizando el drawer a otra pestaña y pulsar Aceptar o Rechazar en la tarjeta). T-54 sigue sin validar por ese escenario. No probó con SHOW_DEV_TOOLS=true. Registra esto en backlog.md y progress.md. Visto bueno de Anderson para corregir el hallazgo mayor y los dos medios del punto 3.

2. HALLAZGO MAYOR (corrígelo así, o mejor si lo justificas): (a) TripRequestScreen debe actuar SOLO cuando está enfocada: el temporizador de vencimiento, el rechazo automático, leave() y cualquier navegación quedan condicionados a useIsFocused (o equivalente), y al perder el foco no ejecutan acciones sobre la solicitud; (b) si TripRequest está montada pero sin foco y la solicitud se acepta, rechaza o vence desde la tarjeta, TripRequest no debe rechazar de nuevo ni cambiar de pestaña ni sacar TripActive de la pila; debe quedar limpia (o desmontarse) sin efectos; (c) el Aceptar de la tarjeta usa replace hacia TripActive, igual que TripRequest, para no apilar ni dejar TripRequest debajo; (d) comprueba que no haya otro lugar donde una pantalla oculta pueda actuar sobre una solicitud ya resuelta, y registra el caso en la decisión D-85.

3. AJUSTES MEDIOS DE BAJO RIESGO (aprobados): (a) los botones de la tarjeta («Aceptar», «Rechazar», «Ver detalle» y «✕») quedan FUERA del scroll de la tarjeta, fijos en su pie, para que con texto grande del sistema sigan visibles y alcanzables; (b) la barra de progreso de la cuenta regresiva debe distinguirse del fondo con tokens de DESIGN.md (por ejemplo borde o contraste suficiente), sin colores nuevos fuera de los tokens; (c) corrige la indentación de MainDrawer y el orden de imports de HomeScreen. No apliques los demás hallazgos (el aviso de iOS con accessibilityLiveRegion y la tarjeta tapando el pie de otras pantallas quedan como limitaciones conocidas: regístralas en D-85).

4. VERIFICACIÓN: con un script temporal FUERA del proyecto y contra el código real: la secuencia Ver detalle → perder el foco → la solicitud se acepta, rechaza o vence desde la tarjeta → TripRequest no ejecuta rechazo, leave() ni cambio de pestaña; Aceptar de la tarjeta navega con replace y no deja pantallas duplicadas; el temporizador de TripRequest no corre sin foco; los temporizadores se limpian. Reporta una tabla y borra el script. Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos, 0 advertencias). Un verifier NUEVO, distinto de los anteriores y del implementer, revisa por lectura de código el escenario exacto del hallazgo mayor, todas las salidas de TripRequest y la ausencia de efectos sin foco. Marca T-54 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo" solo si el verifier la aprueba; si la rechaza otra vez, no sigas encadenando: informa y detente.

5. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni las reglas de Firestore; no cambies nada validado salvo lo estrictamente necesario; marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo.

6. SALIDA: resumen corto con (i) la causa y la corrección del hallazgo mayor, (ii) qué ajustes medios se aplicaron, (iii) la tabla de pruebas, (iv) el veredicto del verifier nuevo, (v) lo pendiente, y (vi) el checklist para el celular: abrir una solicitud, tocar «Ver detalle», deslizar el drawer a Perfil, y desde la tarjeta probar Aceptar (el viaje debe quedar estable, sin saltos de pestaña pasados 3 s) y, en otra solicitud, Rechazar y dejar vencer; repetir con Configuración; comprobar que no queda ninguna pantalla de solicitud debajo; botones de la tarjeta visibles con texto grande; y barra de progreso visible.
````
- Resumen de la respuesta (2–3 líneas): TripRequest ahora solo actúa con foco (salidas diferidas, sin rechazo ni leave oculto), la tarjeta acepta con `StackActions.replace`, `getId` por `requestId`, y se aplicaron los ajustes medios (botones fuera del scroll, barra con borde, indentación/imports). El verifier nuevo RECHAZÓ en lo estático por dos mayores nuevos (A: «Ver detalle» duplica TripRequest si Home abrió la primera sin `requestId`; B: TripRequest oculta ya resuelta muestra «venció» y `leave()` al recuperar foco). Se detuvo ahí, sin encadenar.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: src/screens/trip/TripRequestScreen.js, src/components/IncomingRequestCard.js, src/navigation/TripStack.js, src/navigation/MainDrawer.js, src/screens/home/HomeScreen.js, docs/decisiones.md (D-85), docs/backlog.md, docs/progress.md, docs/AI_LOG.md; sin commit.
- Verificación: script temporal fuera del proyecto, 20/20 OK (borrado); `check-constitution`: 23 errores base, 0 advertencias; verifier nuevo (por lectura): RECHAZA (hallazgos A y B). Sin prueba en el celular de esta ronda.
- Aprendizaje:

### Entrada #49
- Fecha: 2026-11-10
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Simplificar la solicitud entrante (T-54) quitando «Ver detalle» y garantizando una única pantalla de solicitud
- Prompt textual:
````
<pasted_content id="a70c">
Simplificación de T-54 para eliminar por construcción los hallazgos A y B del verifier.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-10, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Simplificar la solicitud entrante (T-54) quitando «Ver detalle» y garantizando una única pantalla de solicitud", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. DECISIÓN DE ANDERSON (2026-11-10), a registrar en D-85 y en backlog.md y progress.md: T-54 lleva dos rechazos del verifier por la misma raíz (más de una pantalla de solicitud viva). En lugar de parchear de nuevo se SIMPLIFICA: (a) se QUITA el botón «Ver detalle» y toda la lógica de volver a la pestaña de origen (originRoute, findOpenRequestRoute en lo que ya no haga falta, textos y accesibilidad asociados); la tarjeta inferior queda con «Aceptar», «Rechazar» y «✕». Esto elimina por diseño los pasos del checklist ya probados que mencionaban «Ver detalle» (consta que esos pasos se validaron antes de quitarlos); (b) solo puede existir UNA TripRequest (identificador fijo) y se abre ÚNICAMENTE cuando la solicitud llega con Inicio enfocado; (c) si hay una TripRequest abierta para la solicitud pendiente, la tarjeta NO se muestra para ella (decideRequestPresentation devuelve 'none' en ese caso); si es posible sin efectos colaterales, impide deslizar el drawer mientras TripRequest está abierta, y si no, deja solo el filtro de foco; (d) cuando una solicitud se resuelve por cualquier vía (aceptar, rechazar, vencer, cancelar), se cierra cualquier TripRequest que haya quedado abierta para ella, sin cambiar de pestaña ni navegar a otra pantalla; (e) se CONSERVA lo ya corregido: TripRequest solo actúa con foco, Aceptar desde la tarjeta usa replace, botones fijos fuera del scroll, barra de progreso con tokens. Aprobación de Anderson: apruebo esta simplificación.

2. IMPLEMENTACIÓN: elimina el código que deje de hacer falta en lugar de dejarlo sin uso; menos caminos de navegación, no más. Sin dependencias nuevas ni cambios nativos. Textos solo en labels.js (borra los que no se usen), marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo, y mantén accesibilidad (44 de área táctil, región en vivo, reduce-motion).

3. VERIFICACIÓN: con scripts temporales FUERA del proyecto y contra el código real, comprueba: llegada con Inicio enfocado → solo TripRequest, nunca tarjeta; llegada en otra pestaña → solo tarjeta; TripRequest abierta + cambio de pestaña → la tarjeta no aparece y TripRequest no actúa sin foco; resolución desde la tarjeta o por vencimiento con TripRequest oculta → TripRequest se cierra sin cambiar de pestaña; Aceptar desde la tarjeta → TripActive sin pantallas duplicadas; vencer y rechazar sin navegar; limpieza de temporizadores. Reporta tablas y borra los scripts. Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos, 0 advertencias). Un verifier NUEVO, distinto de los anteriores y del implementer, revisa por lectura de código: que los hallazgos A y B ya no pueden ocurrir (explica por qué), todas las salidas de TripRequest, y que no quedó código muerto de «Ver detalle». Marca T-54 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo" solo si el verifier la aprueba. Si la rechaza, no sigas encadenando: informa y detente.

4. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni las reglas de Firestore; no cambies nada validado salvo lo estrictamente necesario.

5. SALIDA: resumen corto con (i) qué se quitó y qué se conservó, (ii) por qué A y B ya no pueden ocurrir, (iii) tablas de pruebas, (iv) el veredicto del verifier nuevo, (v) lo pendiente, y (vi) el checklist para el celular, con SHOW_DEV_TOOLS=false: en Perfil, Configuración y las demás pestañas llega una solicitud → tarjeta inferior sin «Ver detalle» → Aceptar lleva al viaje; Rechazar te deja donde estás; «✕» oculta y vence sola; dejar vencer muestra el aviso sin llevarte a Inicio; con Inicio enfocado la solicitud sigue a pantalla completa; con la solicitud a pantalla completa abierta, deslizar el drawer a Perfil no debe mostrar tarjeta ni causar saltos de pestaña pasados 3 s, y al volver a Inicio todo es coherente; durante un viaje no aparece nada; con texto grande del sistema.
</pasted_content id="a70c">
````
- Resumen de la respuesta (2–3 líneas): Se quitó «Ver detalle» y el regreso a la pestaña de origen; una única `TripRequest` (id fijo) abierta solo con Inicio enfocado; la tarjeta no se muestra mientras haya una abierta y el swipe del drawer se bloquea; una `TripRequest` oculta se cierra sola, sin cambiar de pestaña, al resolverse la solicitud. Script temporal 22/22, check-constitution 23/0, verifier nuevo APRUEBA en lo estático; T-54 pendiente de prueba en el celular.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: `src/services/trip/requestPresentation.js`, `src/context/AvailabilityContext.js`, `src/navigation/TripStack.js`, `src/navigation/MainDrawer.js`, `src/components/IncomingRequestCard.js`, `src/screens/trip/TripRequestScreen.js`, `src/constants/labels.js`, `docs/decisiones.md` (D-85), `docs/backlog.md`, `docs/progress.md`, `docs/AI_LOG.md`. Sin commit.
- Verificación: (pendiente: Anderson; en lo estático: script temporal 22/22, check-constitution 23 errores / 0 advertencias, verifier nuevo APRUEBA con 2 menores; falta la prueba en el celular)
- Aprendizaje:

### Entrada #50
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Implementar la rebanada C: guardado de viajes en Firestore, cobro simulado, ganancias, historial y perfil
- Prompt textual:
````
Rebanada C: guardar viajes, cobro simulado, ganancias, historial y perfil (T-46 a T-49 de docs/plan-entrega-final.md).

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Implementar la rebanada C: guardado de viajes en Firestore, cobro simulado, ganancias, historial y perfil", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. ESTADO PREVIO a registrar en backlog.md y progress.md: T-54 queda VALIDADA en dispositivo por declaración de Anderson (2026-11-10, SHOW_DEV_TOOLS=false, los 9 puntos del checklist de la versión simplificada: tarjeta sin «Ver detalle» en las pestañas del drawer, Rechazar, «✕» y vencimiento sin llevar a Inicio, Inicio a pantalla completa, menú bloqueado con la solicitud abierta, durante un viaje no aparece nada, texto grande). Diseño de T-54 sigue Pendiente. Aprobación de Anderson: apruebo T-46 a T-49 con el diseño de este prompt.

2. DECISIONES a registrar en docs/decisiones.md (números libres) y en docs/seguridad.md: (a) los viajes se guardan en la SUBCOLECCIÓN drivers/{uid}/trips/{tripId} (no en una colección global) para que el historial se lea sin índices compuestos (orderBy sobre un solo campo) y las reglas sean simples; (b) NO se guardan coordenadas (las solicitudes del mock nacen cerca de la ubicación real del conductor): solo etiquetas de dirección, distancia, duración, categoría, importes y fechas; (c) importes en COP enteros; (d) el cobro es SIMULADO: no hay pasarela real (P-03), y queda claro en pantalla y en README.

3. T-46 (cobro simulado y guardado): en TripSummary, además de los datos actuales, un bloque de cobro con el método (efectivo o transferencia a su cuenta de Mercado Pago ya registrada, solo texto: no muestres el correo completo si puedes enmascararlo) y el botón «Confirmar cobro», que guarda el viaje en drivers/{uid}/trips con: driverId, estado (completed o cancelled), categoría, nombre del pasajero, etiquetas de origen y destino, distanciaKm, duraciónMin, tarifa, comisión, ganancia neta (los tres calculados con calculateFare y pricing.js, iguales a los que muestra la pantalla), método de cobro, iniciadoEn, finalizadoEn y creadoEn (serverTimestamp). El guardado es idempotente (el mismo viaje no se guarda dos veces: usa el id del viaje como id del documento). Si falla: error en español con «Reintentar» y una SALIDA SEGURA («Volver a Inicio sin guardar», con confirmación); nunca dejes al conductor atrapado en la pantalla. Quita el texto «Este resumen no se guarda». También guarda los viajes CANCELADOS (estado cancelled, importes en 0) al cancelar, de forma silenciosa y con reintento acotado, sin bloquear la salida. Mantén la liberación del viaje activo y el flujo ya validado (popTo('Home'), endTrip, estados en tripStatus.js).

4. REGLAS DE FIRESTORE (no las publiques tú: redáctalas): propón el bloque exacto para match /drivers/{uid}/trips/{tripId}: leer solo el dueño; crear solo el dueño con la cuenta aprobada (puedes usar get() sobre drivers/{uid}) y con validación de claves (hasOnly), tipos (importes enteros no negativos, distancia y duración numéricas con topes razonables, estado en la lista permitida, textos con longitud máxima, fechas), driverId == uid; actualizar y borrar: false. Pon el texto en docs/seguridad.md y en tu copia local de firestore.rules (ignorada por Git), y en la salida dime EXACTAMENTE qué debo pegar en la consola, dónde, y que NO debo tocar las reglas ya publicadas de drivers y driverLocations. La app debe manejar bien permission-denied (mensaje claro, no cuelgues).

5. T-47 (Ganancias): reemplaza el marcador por una pantalla con un selector simple de periodo (Hoy, Esta semana, Este mes) y, para el periodo elegido: total ganado (neto), comisión descontada, número de viajes completados y la lista de esos viajes. Lee con onSnapshot de drivers/{uid}/trips ordenado por finalizadoEn descendente con un límite razonable (p. ej. 200) y calcula los totales en una función PURA aparte (src/utils/) que puedas probar con un script; define los límites de día y semana con la hora local del dispositivo y documenta que la semana empieza en lunes. Estados con ScreenState (cargando, vacío con mensaje amable, error con reintento).

6. T-48 (Historial): lista de viajes (fecha y hora, pasajero, origen→destino en etiquetas, tarifa, ganancia neta y estado, con los cancelados claramente diferenciados con texto, no solo color), más recientes primero, con límite y botón «Ver más» si hay más. Estados cargando, vacío y error con reintento. Accesibilidad (44 de área táctil, lectura coherente) y textos en labels.js.

7. T-49 (Perfil y Configuración, solo lectura): Perfil con foto, nombre, celular, vehículo (marca, modelo, placa, año, color, categoría), correo de Mercado Pago enmascarado y estado de la cuenta, leídos del documento drivers/{uid} ya cargado por el contexto o con la misma suscripción existente (no abras otra innecesaria). Configuración con información de la app (nombre, versión, nota de que el cobro es simulado y que las rutas usan OSRM y mapas de OpenStreetMap/OpenFreeMap) y los paneles provisionales SOLO bajo SHOW_DEV_TOOLS. Sin edición ni cierre de sesión (la autenticación es anónima).

8. REQUISITOS GENERALES: la tarjeta de solicitud (T-54) debe seguir funcionando encima de estas pantallas sin cambios. Sin dependencias nuevas ni cambios nativos. Textos en español en src/constants/labels.js, estilos con tokens de DESIGN.md, marcas «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo, ningún Alert.

9. VERIFICACIÓN: con scripts temporales FUERA del proyecto y contra el código real: (a) la función pura de totales por periodo (límites de día, semana y mes, viajes cancelados excluidos de las ganancias, lista vacía, totales con comisión y propinas inexistentes); (b) el mapeo de un viaje al documento y su validación contra una réplica en JS de las condiciones de la regla propuesta (tipos, enteros, claves permitidas, estados); (c) la idempotencia del guardado y los reintentos acotados; (d) que importes guardados == importes mostrados en el resumen. Reporta tablas y borra los scripts. Ejecuta node scripts/check-constitution.mjs (esperado: 23 errores o menos, 0 advertencias). Un verifier NUEVO, distinto del implementer y de los anteriores, revisa por lectura de código: ningún dato de ubicación guardado, la salida segura en todos los fallos del cobro, las suscripciones con limpieza, los estados vacío/error, y que con SHOW_DEV_TOOLS=false no hay nada provisional. design-auditor revisa contraste, áreas táctiles y consistencia de las pantallas nuevas; corrige solo lo de severidad alta que sea de estilo. Marca T-46 a T-49 como "Implementada y verificada en lo estático; pendiente de validación en dispositivo". Si el verifier rechaza algo, no sigas encadenando: informa y detente.

10. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas commit; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/ ni modifiques las reglas ya publicadas; no cambies lo validado salvo lo estrictamente necesario.

11. SALIDA: resumen corto con (i) qué se hizo por tarea, (ii) tablas de pruebas, (iii) el texto EXACTO de la regla de Firestore para pegar en la consola y las instrucciones, (iv) lo pendiente o fuera de alcance, y (v) el checklist para el celular: publicar la regla; completar un viaje y pulsar «Confirmar cobro» → aparece el documento en Firestore sin coordenadas; Historial y Ganancias lo muestran (Hoy, Semana, Mes) y se actualizan en vivo; cancelar un viaje → aparece como cancelado en Historial y no suma en Ganancias; modo avión al confirmar el cobro → error con «Reintentar» y salida segura; Perfil con los datos correctos y el correo enmascarado; Configuración sin paneles provisionales con SHOW_DEV_TOOLS=false; la tarjeta de solicitud sigue apareciendo encima de estas pantallas.
````
- Resumen de la respuesta (2–3 líneas): T-54 registrada como validada en dispositivo (declaración de Anderson, 2026-11-10); decisiones D-86 a D-89; T-46 a T-49 implementadas: «Confirmar cobro» guarda drivers/{uid}/trips/{tripId} de forma idempotente con error, «Reintentar» y salida segura, cancelados guardados en silencio con reintento acotado, Ganancias (hoy/semana/mes), Historial y Perfil/Configuración de solo lectura. Regla de Firestore redactada, NO publicada.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: nuevos: src/services/trip/tripRecord.js, src/services/trip/saveRetry.js, src/services/tripRepository.js, src/hooks/useTrips.js, src/utils/earnings.js, src/utils/mask.js. Modificados: TripSummaryScreen, EarningsScreen, HistoryScreen, ProfileScreen, SettingsScreen, ScreenState, TripContext, tripController, AppStateContext, driverRepository, labels.js, format.js, firestore.rules (local, ignorado por git), README.md, docs/backlog.md, decisiones.md, progress.md, seguridad.md. Sin commit (lo hace Anderson).
- Verificación: (pendiente: Anderson en el celular) En lo estático: script temporal 60/60 (periodos, mapeo vs réplica de la regla, idempotencia y reintentos, montos guardados = mostrados), borrado; check-constitution 23/0 antes y 13/0 después (preexistentes: C01 .env, C21 requisitos de fases posteriores); verifier nuevo APRUEBA los 7 puntos con una reserva menor (un setDoc caducado sin red puede escribirse al volver la red; no duplica); design-auditor: 3 hallazgos altos corregidos (filas del resumen con flexShrink, mensaje cuando el cobro no puede calcularse, confirmación de salida con scroll a la vista); medios y bajos quedan para la ronda de diseño. Diseño: Pendiente.
- Aprendizaje:

### Entrada #51
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Rediseño visual y de UX de la app (colores, tipografía, espaciado, componentes, estados y movimiento) sin tocar funcionalidad
- Prompt textual:
````
Rediseño visual y de UX de toda la aplicación (SOLO estilos, layout y presentación), ejecución nocturna sin supervisión.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Rediseño visual y de UX de la app (colores, tipografía, espaciado, componentes, estados y movimiento) sin tocar funcionalidad", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío: lo escribe Anderson.

1. ESTADO PREVIO a registrar en backlog.md y progress.md: T-46, T-47, T-48 y T-49 quedan VALIDADAS en dispositivo por declaración de Anderson (2026-11-11, SHOW_DEV_TOOLS=false): la regla de trips publicada, «Confirmar cobro» guarda el documento en Firestore sin coordenadas, Historial y Ganancias lo muestran y se actualizan, un viaje cancelado aparece en Historial, modo avión muestra error con salida segura, Perfil con datos correctos y sin edición, Configuración sin paneles con la bandera en false, y la tarjeta de solicitud sigue encima de estas pantallas. Su Diseño sigue Pendiente (lo cubre esta tarea).

2. OBJETIVO: que la app se vea y se sienta profesional, coherente y cuidada de punta a punta: identidad visual clara, jerarquía tipográfica nítida, espaciado y formas consistentes, estados (cargando, vacío, error, deshabilitado) bien resueltos y movimiento sutil. Estilo de referencia en términos generales: apps de movilidad modernas, sobrias y de alto contraste; NO copies marcas, logos ni identidad de ninguna aplicación real. Una sola temática (no añadas modo oscuro). Conserva el verde azulado actual como color de marca si pasa contraste (puedes refinar su tono y construir una escala a su alrededor), pero dale a la app más carácter que el actual fondo gris plano con tarjetas blancas idénticas.

3. DIAGNÓSTICO VISUAL ACTUAL (observado en el celular por Anderson; úsalo como punto de partida y verifica en el código):
 a) El botón de engranaje (acceso a Configuración) se ve como un círculo gris con sombra flotando sobre el encabezado y, en «Resumen del viaje», se superpone a la tarjeta de ganancia. Rediséñalo como un botón de icono coherente (forma dibujada con View, área táctil de 44x44, color de tokens) integrado en el encabezado y SIN superponerse al contenido. Si hoy es un elemento de posición absoluta, corrige solo su presentación y posición visual; no cambies su comportamiento, destino, testID ni accessibilityLabel.
 b) El acceso al menú es solo la palabra «Menú» como texto suelto junto al título. Mejóralo visualmente (por ejemplo, icono de tres barras dibujado con View más el texto o como botón con área táctil adecuada) conservando su texto/accessibilityLabel y su comportamiento.
 c) Encabezados blancos genéricos sobre fondo gris plano: define una identidad de encabezado (altura, tipografía, separación o elevación sutil) consistente en todas las pantallas, incluidas las de viaje, sin romper los insets de zona segura.
 d) Todas las tarjetas son iguales (blanco, radio grande, sin jerarquía): define una jerarquía de superficies (superficie base, tarjeta, tarjeta destacada, tarjeta de estado) con radios, bordes o elevaciones coherentes.
 e) Perfil: lista larga de pares etiqueta/valor con valores muy grandes y poca jerarquía; el avatar es un círculo sin borde ni cabecera. Dale una cabecera con avatar con borde de marca, nombre, y una etiqueta de categoría de vehículo; etiquetas pequeñas en color secundario y valores en peso medio, filas compactas con separadores sutiles.
 f) Historial: el estado «Cancelado»/«Completado» es un texto suelto arriba a la derecha. Conviértelo en una etiqueta (chip) con color de fondo suave más el texto (nunca solo color), alinea la jerarquía (pasajero, ruta con origen y destino diferenciados, tarifa y ganancia con la ganancia destacada), y diseña un estado vacío y uno de carga con skeleton.
 g) Resumen del viaje: la ganancia grande en verde azulado funciona; unifica el ritmo vertical de las filas (separación irregular hoy), diferencia visualmente tarifa, comisión y ganancia, y mejora el bloque «Cobro» (aviso de cobro simulado como nota discreta, mensaje de éxito con icono dibujado y fondo suave de éxito).
 h) Inicio, solicitud (tarjeta inferior y pantalla completa), viaje activo, Ganancias, Configuración y registro: audítalos con el mismo criterio y mejóralos.

4. ALCANCE ESTRICTO. SE PUEDE TOCAR: tokens de diseño (src/theme/tokens.js y DESIGN.md), estilos, colores, tipografía, espaciados, bordes, sombras o elevación, tamaños, disposición visual (se pueden añadir contenedores de layout y reorganizar el árbol visual de las pantallas cuando haga falta), componentes de presentación compartidos (botones, campos, tarjetas, filas, chips, encabezados, estados vacío/error/carga, barra de pestañas, contenido visual del drawer) y animaciones sutiles con Animated de React Native (opacidad y transformaciones, useNativeDriver donde se pueda). PROHIBIDO TOCAR: lógica, estado, hooks, contextos, servicios, navegación y su comportamiento, reglas de Firestore, backend, validaciones, cálculos, textos visibles existentes (ajusta redacciones solo si Anderson no las validó; ante la duda, déjalas), testID, accessibilityLabel/Role/State/LiveRegion existentes, orden de lectura lógico, nombres de funciones y props existentes (puedes añadir props opcionales de presentación). NO instales dependencias, NO añadas fuentes, íconos ni imágenes que requieran paquetes o descargas, y no descargues binarios. Tipografía: la del sistema, con una escala bien definida (tamaños, pesos, interlineado). Íconos: solo formas dibujadas con View o glifos de texto ya usados. NO cambies nada nativo ni app.json. NO instales skills ni plugins de terceros; usa las que ya tengas disponibles en este proyecto (por ejemplo una skill de diseño frontend instalada) y el agente design-auditor. No hay capturas posibles aquí: el diseño se valida de forma estática.

5. COMPATIBILIDAD DE TOKENS: NO renombres ni elimines tokens existentes: puedes cambiar sus valores y AÑADIR tokens nuevos. Todo color fuera de tokens (mapa, tarjetas, etc.) migra a un token. La paleta nueva debe tener roles semánticos (fondo, superficie, texto primario y secundario, acento/marca, éxito, advertencia, error, borde, deshabilitado, y sus variantes suaves para fondos de chips y avisos). Escribe un script temporal FUERA del proyecto que calcule la relación de contraste WCAG de TODOS los pares texto/fondo y componente/fondo usados y exige al menos 4,5:1 para texto normal y 3:1 para texto grande y componentes de interfaz; reporta la tabla y corrige lo que falle. Documenta en DESIGN.md los tokens nuevos, escala tipográfica, escala de espaciado, radios, elevaciones y reglas de uso, y registra la decisión en decisiones.md.

6. ÁREAS Y ORDEN (termina cada área en un estado coherente antes de pasar a la siguiente; nunca dejes una pantalla a medio migrar): (A) sistema de diseño: tokens, tipografía, botones, campos, tarjetas y jerarquía de superficies, chips de estado, filas, encabezado común con botón de menú y botón de engranaje rediseñados (puntos 3a-3c), estados cargando/vacío/error y skeletons con Animated; (B) Inicio con el interruptor de Disponibilidad y su pista, tarjeta inferior de solicitud (T-54) y pantalla completa de solicitud; (C) viaje activo (panel inferior sobre el mapa con fases, distancia y tiempo restantes, botones, aviso de ruta aproximada) y resumen del viaje con cobro (punto 3g); (D) barra de pestañas, encabezados restantes y drawer (cabecera con foto, nombre y vehículo del conductor si ya están en el contexto, estado activo de elementos); (E) Ganancias (tarjetas de totales, selector de periodo, barras simples dibujadas con View si ayudan a leer), Historial (punto 3f), Perfil (punto 3e) y Configuración; (F) registro: las 3 pestañas, campos, selectores, foto y banner de pendiente de aprobación; (G) pulido: movimiento sutil (entradas y transiciones de estado) y consistencia final. Incluye la cola de diseño pendiente: cámara del mapa y animaciones respetan reduce-motion; los puntos del mapa se distinguen por algo más que el color; usa opacity.disabled de tokens en botones deshabilitados; los colores del mapa salen de tokens; la cuenta regresiva ya es región en vivo (no la quites).

7. ACCESIBILIDAD (no negociable): áreas táctiles de al menos 44x44, contraste según el punto 5, nada comunicado solo por color, texto que crece con la escala del sistema sin recortarse ni solaparse (revisa especialmente encabezados, chips, filas etiqueta/valor y el resumen), foco y orden de lectura coherentes, reduce-motion respetado, ningún Alert.

8. SEGURIDAD DEL CAMBIO (nadie supervisa): antes de empezar guarda en el scratchpad un inventario de TODOS los testID, accessibilityLabel, accessibilityRole, accessibilityLiveRegion, nombres de props exportadas y claves de labels.js usados en src/. Al terminar CADA área, vuelve a generar el inventario y compáralo: no puede faltar ni cambiar ninguno; si ocurre, restáuralo antes de seguir. Confirma con git diff que no se tocaron archivos prohibidos (servicios, contextos, navegación lógica, backend, reglas, package.json, app.json, firestore.rules). Cada área la revisa un verifier DISTINTO del implementer (puede ser el mismo para todas las áreas, nunca el implementer), y el design-auditor evalúa contraste, jerarquía, consistencia y estados. Si un verifier rechaza un área, corrígela UNA sola vez y verifica de nuevo; si la rechaza otra vez, REVIERTE esa área (punto 9), anótalo y continúa. Al final ejecuta node scripts/check-constitution.mjs (esperado: 13 errores o menos, 0 advertencias).

9. COMMITS Y REVERSIÓN: Anderson autoriza, SOLO para esta tarea y SOLO en la rama actual (anderson/diseno-ui), commits LOCALES por área con el mensaje «style(diseno): área X - <descripción>» y nada de push. Si tu configuración no permite commits, guarda un parche por área (git diff) en el scratchpad y anota su ruta. No cambies de rama, no hagas push y no toques main.

10. PRESUPUESTO Y PROGRESO: trabaja por orden de áreas hasta donde llegue el límite de uso de la sesión. Tras cada área escribe el avance en docs/diseno/progreso-noche.md (área, qué cambió, veredicto del verifier, hallazgos del auditor, hash del commit o ruta del parche, y qué falta) para que, si la sesión se corta, se sepa exactamente el estado. Si te quedas sin presupuesto a mitad de un área, déjala en estado coherente (o revertida), no a medias. Entrega además docs/diseno/guia-de-estilo.md con la guía final (paleta con roles y contrastes, tipografía, espaciado, componentes y reglas de uso) para poder explicarla en la sustentación, y actualiza el campo Diseño de las tareas auditadas en backlog.md a «Auditado en lo estático; pendiente de revisión visual en el celular».

11. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; ninguna dependencia nueva; no hagas push; no cambies de rama; no toques ni reinicies mi Metro; no leas .env; no toques backend/, las reglas de Firestore ni app.json; marca «// AI-assisted: see docs/AI_LOG.md #N» en cada bloque nuevo o muy modificado. Si algo del plan es inviable o arriesgado, no improvises: anótalo en progreso-noche.md y continúa con lo seguro.

12. SALIDA FINAL (lo primero que leeré por la mañana): resumen corto con (i) áreas completadas, revertidas y no iniciadas, (ii) la nueva identidad visual en 8 líneas (paleta, tipografía, forma, movimiento), (iii) la tabla de contraste, (iv) hallazgos pendientes del auditor, (v) la lista de commits o parches por área, (vi) lo que debo probar en el celular, área por área, y (vii) cómo descartar un área si no me gusta.
````
- Resumen de la respuesta (2–3 líneas): (pendiente: se completa al terminar)
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: (pendiente: se completa al terminar)
- Verificación: (pendiente: se completa al terminar)
- Aprendizaje:

### Entrada #52
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Continuar el rediseño: drawer, pestañas de registro, íconos, tipografía, áreas B a G y barrido final de detalle visual
- Prompt textual:
````
Continuación del rediseño nocturno: nuevo menú lateral, pestañas de registro con el mismo estilo, íconos y fuente, resto de áreas y barrido final de detalles. Ejecución sin supervisión.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Continuar el rediseño: drawer, pestañas de registro, íconos, tipografía, áreas B a G y barrido final de detalle visual", con el prompt completo copiado tal cual lo recibiste. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío.

1. PUNTO DE PARTIDA: estás en la rama anderson/diseno-ui con el Área A (sistema de diseño, D-90) ya aplicada y sin commit; existe un parche en el scratchpad (area-A.patch). Confirma la rama con git branch --show-current (si no es anderson/diseno-ui, detente y avisa). Si el commit local ahora está permitido, haz primero el commit del Área A («style(diseno): área A - sistema de diseño»). Si sigue denegado, NO insistas más de una vez: usa el plan B del punto 9. Anderson ya instaló (ejecutó él mismo, con expo install) @expo/vector-icons, expo-font y @expo-google-fonts/inter; verifica con git diff package.json que son los únicos cambios de dependencias.

2. CORRECCIÓN DEL DIAGNÓSTICO: el círculo gris con engranaje que se ve en las capturas es el botón flotante de herramientas del dev client de Expo (solo existe en la build de desarrollo). NO es de la app: no lo busques ni lo recrees ni lo ocultes. El control de cabecera de la app es «Menú»/«Atrás»: su mejora visual ya hecha en el Área A se mantiene (revisa que use ícono + texto, ver punto 4).

3. CAMBIO DE REGLAS (sustituye al «no instales dependencias» del prompt anterior, solo para lo siguiente):
 a) ÍCONOS: usa únicamente @expo/vector-icons con el set Ionicons. Crea UN solo componente src/components/Icon.js que reciba name y size/color por tokens, y que los íconos sean siempre decorativos (accessibilityElementsHidden y importantForAccessibility="no-hide-descendants") cuando acompañen un texto; un ícono NUNCA reemplaza a un texto ni a un accessibilityLabel existente. Los íconos de MapLibre/mapa no se tocan.
 b) FUENTE: Inter con 4 pesos (400, 500, 600, 700) desde @expo-google-fonts/inter. Añade en los tokens de tipografía las familias por peso (en Android el peso se elige por familia, no por fontWeight) y migra los estilos de texto a esos tokens. Carga con useFonts en el archivo raíz de la app, con un máximo de 3 segundos de espera y con salida segura: si la fuente falla o tarda más, la app sigue con la fuente del sistema (una familia desconocida cae a la del sistema; confirma que ningún estilo depende de que la fuente exista para ser legible, ni anchos fijos medidos para Inter). Este es el ÚNICO cambio permitido fuera de estilos en el archivo raíz y debe quedar aislado, comentado con // AI-assisted y anotado en decisiones.md. Mantén el splash/estado de carga existente; no añadas pantallas nuevas.
 c) NINGUNA otra dependencia, ni skills ni plugins de terceros, ni cambios nativos, ni app.json. Si algo falla con los paquetes anteriores (error de módulo nativo, de resolución, de bundling que puedas detectar estáticamente), deshaz el uso de esa pieza, vuelve a íconos dibujados con View y fuente del sistema, y anótalo.

4. NUEVO MENÚ LATERAL (drawer) — prioridad alta. Hoy es una lista blanca donde el elemento activo solo se subraya. Rediséñalo con estilo sobrio y profesional, coherente con la marca verde azulada:
 - Cabecera del drawer con fondo de marca (color sólido de tokens, puedes usar una forma decorativa sutil con View), foto de perfil con borde, nombre del conductor, vehículo (marca/modelo y placa) y un indicador de estado (disponible / no disponible) usando datos que YA estén en los contextos; sin leer nada nuevo de Firestore ni crear lógica. Si algún dato no está disponible, omite ese elemento.
 - Elementos de la lista con ícono Ionicons (outline cuando está inactivo, relleno cuando está activo) a la izquierda y el texto existente a su lado: Inicio, Ganancias, Historial, Perfil, Configuración (los que existan hoy). Elemento activo: fondo suave de marca con forma de píldora redondeada, ícono y texto en color de marca con peso mayor, y una barra de acento a la izquierda; elemento inactivo: texto secundario. Estado presionado visible (ripple de Android o cambio de opacidad/fondo). Altura mínima 48. Separación y márgenes consistentes; un divisor sutil antes de Configuración si hay más de 4 elementos.
 - Pie del drawer discreto (nombre de la app y versión si ya existe en el código; no leas app.json para eso).
 - Se logra con las opciones de estilo del Drawer (drawerIcon, drawerItemStyle, drawerActiveTintColor, drawerActiveBackgroundColor, drawerLabelStyle) y/o un drawerContent de presentación que reutilice DrawerItemList. NO cambies rutas, nombres de pantallas, labels, backBehavior ni el bloqueo del gesto de apertura mientras TripRequest está abierto; mantén accessibilityRole y estado seleccionado de cada elemento. Animación de apertura: la nativa del drawer; no añadas animaciones propias que choquen con ella.

5. PESTAÑAS DE REGISTRO con el MISMO lenguaje visual del drawer (Documentos, Vehículo, Datos personales): barra superior o inferior (la que ya exista, sin mover su posición) con ícono por pestaña (Ionicons: documentos, vehículo, datos personales), la pestaña activa con fondo suave de marca en píldora, ícono relleno y texto en color de marca con mayor peso, inactivas en color secundario; altura mínima 48, indicador claro y NO solo por color (el texto más grueso y el ícono relleno cuentan). Si el contexto del formulario YA expone si una pestaña está completa, puedes mostrar una marca discreta de «completo» (ícono check con texto accesible); si no lo expone, no añadas esa lógica. Mantén los nombres de las pestañas, su orden, la navegación y su comportamiento. Aplica también ese estilo a los encabezados de sección y al banner de «pendiente de aprobación» de esas pantallas.

6. NUEVO ORDEN DE ÁREAS (las anteriores B a G se mantienen con sus contenidos del prompt original; ajusta así): (A2) ahora: Icon.js + tipografía Inter en tokens y carga segura + drawer (punto 4) + pestañas de registro (punto 5); (B) Inicio, interruptor de Disponibilidad, tarjeta inferior de solicitud y pantalla completa de solicitud; (C) viaje activo y resumen con cobro; (D) barra de pestañas restante, encabezados y consistencia con el drawer; (E) Ganancias, Historial (chips de estado con texto, ruta origen→destino diferenciada, estado vacío y skeleton), Perfil (cabecera con avatar con borde, filas etiqueta/valor compactas) y Configuración; (F) resto del registro (campos, selectores, foto, estados de error); (G) pulido de movimiento sutil; (H) BARRIDO FINAL (punto 7). Cada área termina coherente antes de la siguiente.

7. (H) BARRIDO FINAL DE DETALLE: al terminar B–G, recorre TODAS las pantallas del código una por una con esta lista y corrige lo que falle (solo presentación): ritmo vertical y espaciado según la escala; alineaciones y márgenes laterales idénticos entre pantallas; padding inferior del scroll para que nada quede tapado por la tarjeta de solicitud, el teclado o la barra de gestos; zona segura arriba y abajo; color de la barra de estado coherente con cada encabezado (usa lo que ya exista, sin paquetes nuevos); estado presionado y deshabilitado en TODOS los botones, filas y chips; botones primarios, secundarios y de peligro con jerarquía clara y mismo radio y altura; campos con estados reposo, foco, error y deshabilitado y mensajes de error con ícono y texto; estados vacío, carga, error y sin conexión en cada pantalla de datos; formato consistente de moneda, fechas, horas, distancias y duraciones (usa los utilitarios existentes, no cambies cálculos); mayúsculas/minúsculas y puntuación de títulos y botones coherentes (no cambies textos validados); truncado con numberOfLines y ellipsizeMode donde haya riesgo de desborde, con la información crítica nunca truncada; texto con escala de fuente del sistema al 200 % sin recortes ni solapamientos; elementos del mapa (marcadores, ruta, etiquetas) con colores de tokens y distinguibles por forma o etiqueta además de color; coherencia de iconografía (mismo set, tamaños 20/24, grosor); animaciones solo con opacidad y transformaciones, respetando reduce-motion; ningún valor de color, tamaño de fuente o espaciado suelto fuera de tokens (busca con grep hexadecimales y números mágicos en src/ y migra). Registra cada hallazgo y su corrección en docs/diseno/progreso-noche.md.

8. SEGURIDAD DEL CAMBIO Y ALCANCE (se mantienen): solo estilos, layout, presentación y animaciones sutiles; PROHIBIDO tocar lógica, estado, hooks, contextos (puedes LEER datos ya expuestos), servicios, navegación y su comportamiento, reglas de Firestore, backend, validaciones, cálculos, textos visibles validados, testID, accessibilityLabel/Role/State/LiveRegion existentes, nombres de funciones y props existentes. Antes de la A2 genera de nuevo el inventario de testID/accessibilityLabel/Role/LiveRegion/props exportadas/claves de labels.js, y compáralo al terminar CADA área: no puede faltar ni cambiar ninguno (solo se permiten adiciones). Contraste WCAG con el script temporal fuera del proyecto sobre TODOS los pares nuevos (drawer activo/inactivo, pestañas activas/inactivas, chips, textos sobre la cabecera de marca): 4,5:1 texto normal, 3:1 texto grande y componentes; corrige lo que falle. Áreas táctiles mínimas 44x44, nada solo por color, ningún Alert. Cada área la revisa un verifier DISTINTO del implementer y el design-auditor evalúa contraste, jerarquía, consistencia, estados y los puntos 4 y 5; si un verifier rechaza un área, corrígela UNA vez; si la rechaza de nuevo, revierte esa área (punto 9), anótalo y continúa. Al final: node scripts/check-constitution.mjs (esperado 13 errores o menos, 0 advertencias). Marca «// AI-assisted: see docs/AI_LOG.md #N» en bloques nuevos o muy modificados. Actualiza DESIGN.md, guia-de-estilo.md (añade íconos, tipografía Inter, drawer y pestañas) y decisiones.md (nueva decisión para íconos y fuente, con su plan de reversión).

9. COMMITS Y PLAN B: commits LOCALES por área («style(diseno): área X - descripción») solo en anderson/diseno-ui, sin push, sin cambiar de rama, sin tocar main. Si el commit es denegado, NO insistas: tras CADA área copia el estado a snapshots en el scratchpad (copia de src/, docs/diseno/, DESIGN.md y package.json en una carpeta area-X-snapshot) y guarda además el parche acumulado (git diff HEAD) como area-X-acumulado.patch. Revertir un área = restaurar el snapshot del área anterior. Anota rutas completas en progreso-noche.md.

10. PROGRESO Y PRESUPUESTO: tras cada área actualiza docs/diseno/progreso-noche.md (qué cambió, veredicto, hallazgos, hash o ruta del snapshot, qué falta). Si se acaba el presupuesto a mitad de un área, déjala coherente o revertida. Si algo es inviable o arriesgado, anótalo y sigue con lo seguro.

11. REGLAS: no ejecutes expo run, prebuild ni eas; no ejecutes npx expo lint; no hagas push; no toques ni reinicies mi Metro; no leas .env; no toques backend/, reglas de Firestore ni app.json; no instales nada más.

12. SALIDA FINAL (lo primero que leeré por la mañana): (i) áreas completadas, revertidas y no iniciadas, (ii) identidad visual en 8 líneas, (iii) tabla de contraste, (iv) hallazgos pendientes, (v) lista de commits o snapshots por área, (vi) qué probar en el celular área por área (con atención a drawer, pestañas de registro, fuente y texto grande al 200 %), (vii) cómo descartar un área y cómo quitar íconos y fuente si dan problemas.
````
- Resumen de la respuesta (2–3 líneas): (pendiente: se completa al terminar)
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: (pendiente: se completa al terminar)
- Verificación: (pendiente: se completa al terminar)
- Aprendizaje:

### Entrada #53
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Aplicar el sistema visual (A y A2) a Inicio, solicitud, viaje, resumen, Ganancias, Historial, Perfil, Configuración y registro; barrido final de detalle; cerrar deuda técnica de diseño
- Prompt textual:
````
Continuación del rediseño: aplicar el nuevo sistema visual a las pantallas restantes, barrido final de detalle y cierre de deuda. SOLO presentación. Hay un límite de trabajo: prioriza por visibilidad en la demostración y deja siempre cada área en estado coherente.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Aplicar el sistema visual (A y A2) a Inicio, solicitud, viaje, resumen, Ganancias, Historial, Perfil, Configuración y registro; barrido final de detalle; cerrar deuda técnica de diseño", con este prompt copiado tal cual. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío.

1. PUNTO DE PARTIDA: rama anderson/diseno-ui-2 creada desde main, que ya incluye las áreas A y A2 (D-90 y D-91, íconos Ionicons vía Icon.js, fuente Inter con salida segura, drawer y pestañas de registro nuevos), validadas por Anderson en el celular. Confirma la rama con git branch --show-current; si no es anderson/diseno-ui-2, detente. Lee antes docs/diseno/guia-de-estilo.md, DESIGN.md, docs/diseno/progreso-noche.md y decisiones.md (D-90, D-91): ahí están la paleta, la escala tipográfica, los espaciados, los componentes (Card, Chip, DataRow, ScreenHeader, Icon, SkeletonBlock) y las reglas. Úsalos; no crees un segundo sistema.

2. ALCANCE (igual que antes, sin excepciones): SE PUEDE tocar estilos, tokens (añadir; no renombrar ni eliminar), layout visual, componentes de presentación y animaciones sutiles con Animated (opacidad/transformaciones, respetando reduce-motion). PROHIBIDO tocar lógica, estado, hooks, contextos (solo puedes LEER lo que ya expongan), servicios, navegación y su comportamiento, reglas de Firestore, backend, validaciones, cálculos, textos visibles ya validados, testID, accessibilityLabel/Role/State/LiveRegion existentes, nombres de funciones y props existentes (puedes añadir props opcionales de presentación). No cambies app.json, nada nativo, ni dependencias. No instales skills ni plugins. Ningún Alert. No ejecutes expo run/prebuild/eas ni expo lint. No hagas push, no cambies de rama, no toques mi Metro, no leas .env, no toques backend/ ni reglas.

3. DEUDA TÉCNICA PRIMERO (pequeña):
 a) scripts/dependencies.json: añade @expo/vector-icons, expo-font y @expo-google-fonts/inter como dependencias permitidas, con justificación que cite D-91 y el aprobado de Anderson; verifica que check-constitution vuelve a 13 errores o menos y 0 advertencias (los 13 son los preexistentes C01 y C21).
 b) Mueve las constantes AVATAR_SIZE, ACCENT_WIDTH y SHAPE_SIZE del archivo del drawer a tokens (sin cambiar valores ni aspecto).
 c) Actualiza DESIGN.md y docs/diseno/guia-de-estilo.md con íconos (Icon.js, set Ionicons, tamaños), tipografía Inter (familias por peso, salida segura), el drawer y las pestañas de registro.

4. ÁREAS, en este orden (la que no alcance a completarse se revierte o se deja coherente):
 (B) Inicio: interruptor de Disponibilidad y su pista de ayuda con jerarquía clara y estado visual diferenciado (disponible / no disponible con texto además de color), mapa/contenedor, y la tarjeta inferior de solicitud (T-54) y la pantalla completa de solicitud (cuenta regresiva ya es región en vivo: no la quites; botones Aceptar/Rechazar con jerarquía clara y áreas táctiles de 44x44 o más; datos del pasajero, origen, destino, distancia, tarifa y tu ganancia bien jerarquizados).
 (C) Viaje activo (panel inferior sobre el mapa con fases, distancia y tiempo restantes, botones de acción con jerarquía, aviso de «Ruta aproximada» claro, marcadores del mapa distinguibles por forma o etiqueta además de color, colores del mapa desde tokens, cámara y animaciones del mapa respetando reduce-motion) y Resumen del viaje (ganancia destacada, filas con ritmo vertical uniforme usando DataRow, bloque de cobro con aviso de cobro simulado como nota discreta y mensaje de éxito con ícono y fondo suave, estados de error con «Reintentar» y confirmación de salida visibles).
 (D) Ganancias (tarjetas de totales, selector de periodo con estado activo claro, barras simples con View si ayudan a leer), Historial (Chip de estado con texto, ruta origen → destino diferenciada, ganancia destacada, estado vacío y skeleton), Perfil (cabecera con avatar con borde, nombre y chip de categoría; filas etiqueta/valor con DataRow) y Configuración.
 (E) Registro: campos (reposo, foco, error, deshabilitado), selectores, foto con botón de quitar, mensajes de error con ícono y texto, botones y banners, coherentes con las pestañas ya rediseñadas.
 (F) Barrido final de detalle sobre TODAS las pantallas: ritmo vertical y márgenes laterales idénticos; padding inferior del scroll para que nada quede tapado por la tarjeta de solicitud, el teclado o la barra de gestos; zona segura; barra de estado coherente con cada encabezado (con lo que ya exista); estado presionado y deshabilitado (opacity.disabled de tokens) en todos los botones, filas y chips; formato consistente de moneda, fechas, horas, distancias y duraciones (con los utilitarios existentes); truncado con numberOfLines solo donde haya riesgo y la información crítica nunca truncada; texto con escala de fuente del sistema al 200 % sin recortes ni solapamientos; mismo set y tamaños de íconos (20/24); cero colores, tamaños de fuente o espaciados sueltos fuera de tokens (busca con grep hexadecimales y números mágicos en src/ y migra). Registra cada hallazgo y su corrección.
 Cada área: ningún elemento nuevo debe depender solo del color, todo texto crece con la escala del sistema, nada se comunica con un ícono sin texto o accessibilityLabel.

5. VERIFICACIÓN: antes de la primera área, genera un inventario de testID, accessibilityLabel/Role/State/LiveRegion, props exportadas y claves de labels.js; compáralo al terminar CADA área (solo se permiten adiciones). Contraste WCAG con un script temporal fuera del proyecto sobre todos los pares nuevos (4,5:1 texto normal; 3:1 texto grande y componentes; el estado deshabilitado está exento pero comprueba que se lea). Cada área la revisa un verifier DISTINTO del implementer, y el design-auditor evalúa contraste, jerarquía, consistencia y estados, e incluye una pasada sobre A2 (drawer y pestañas de registro) que quedó sin auditar. Si un verifier rechaza un área, corrígela UNA vez; si la rechaza otra vez, revierte esa área y anótalo. Confirma con git diff que no se tocaron archivos prohibidos. Al final: node scripts/check-constitution.mjs (esperado: 13 errores o menos, 0 advertencias).

6. COMMITS: commits LOCALES por área («style(diseno): área X - descripción») solo en esta rama. Si un commit es denegado, no insistas: guarda copias por área en el scratchpad (carpeta area-X-snapshot y parche area-X-acumulado.patch) y anota las rutas completas. Tras cada área actualiza docs/diseno/progreso-noche.md (qué cambió, veredicto, hallazgos, hash o ruta, qué falta). Marca «// AI-assisted: see docs/AI_LOG.md #N» en bloques nuevos o muy modificados. Actualiza el campo Diseño de las tareas auditadas en backlog.md a «Auditado en lo estático; pendiente de revisión visual en el celular» y registra la decisión en decisiones.md.

7. SALIDA FINAL: (i) áreas completadas, revertidas y no iniciadas, (ii) tabla de contraste de los pares nuevos, (iii) hallazgos pendientes del auditor, (iv) lista de commits o snapshots por área, (v) qué probar en el celular, pantalla por pantalla, (vi) cómo descartar un área si no gusta.
````
- Resumen de la respuesta (2–3 líneas): Rediseño de las áreas B (Inicio), C (viaje activo y resumen), D (ganancias, historial, perfil, configuración) y E (registro), más un barrido final sin cambios de código y una auditoría de diseño solo estática. Cada área fue revisada por un verifier distinto del implementer; ninguna se probó en el celular.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: solo src/ (componentes, pantallas, tokens con adiciones), docs/diseno/progreso-noche.md, docs/diseno/auditoria-estatica-53.md, docs/backlog.md, docs/decisiones.md (D-92). Commit local denegado: copias por área en el scratchpad (area-X-snapshot y area-X-acumulado.patch, X = B, C, D, E).
- Verificación: check-constitution 13 errores y 0 advertencias (línea base); inventario solo con adiciones; contraste de los pares nuevos sin fallos; verifiers de B, C, D y E aprobaron en lo estático; auditoría estática aprobada con reservas (14 hallazgos, 0 altos). No verificado en dispositivo.
- Aprendizaje:

### Entrada #54
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Corregir precio visible en solicitud, accesibilidad pendiente, marcador de auto, sesiones de conductor con correo y contraseña, y análisis de brechas
- Prompt textual:
````
Funcionalidad final: pantalla completa de solicitud sin scroll para ver el precio, accesibilidad pendiente, marcador de auto en el mapa, sesiones de conductor (crear cuenta, iniciar sesión, cerrar sesión y cambiar de cuenta) y análisis de brechas. Proceso SDD completo.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir precio visible en solicitud, accesibilidad pendiente, marcador de auto, sesiones de conductor con correo y contraseña, y análisis de brechas", con este prompt copiado tal cual. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío.

1. PUNTO DE PARTIDA Y PROCESO
 a) Rama anderson/funcionalidad-sesiones creada desde main (incluye el diseño A a E aprobado por Anderson: D-90 a D-92). Confirma con git branch --show-current; si es otra, detente.
 b) Los estilos están CERRADOS y aprobados: no rediseñes pantallas existentes salvo lo pedido aquí. Todo lo nuevo sigue DESIGN.md, docs/diseno/guia-de-estilo.md y tokens, con Card, Chip, DataRow, ScreenHeader, Icon, SkeletonBlock e Inter; cero hex, tamaños o espaciados sueltos.
 c) Flujo del proyecto: spec-author actualiza la especificación y los requisitos nuevos; planner crea las tareas (T-xx siguientes libres) con criterios de aceptación y checklist de dispositivo; implementer construye; verifier DISTINTO del implementer revisa; design-auditor revisa las pantallas nuevas; el builder nunca aprueba. Si un verifier rechaza una rebanada, corrige UNA vez; si la rechaza otra vez, detente en esa rebanada, repórtala y continúa solo con rebanadas independientes. Agrupa las validaciones de dispositivo en checkpoints (D-59).
 d) Una rebanada = un commit LOCAL («feat: ...», «fix: ...») en esta rama. Si el commit es denegado, no insistas: copia a snapshots en el scratchpad (carpeta por rebanada y parche acumulado) y anota rutas completas. Sin push, sin cambiar de rama, sin tocar main.
 e) PROHIBIDO: expo run, prebuild, eas, expo lint; dependencias nuevas (usa firebase/auth, AsyncStorage y @expo/vector-icons ya instalados); cambios nativos y app.json; leer .env; tocar backend/; tocar mi Metro; Alert (todo con mensajes y confirmaciones en pantalla); lógica fuera del alcance de cada rebanada. No cambies reglas de Firestore publicadas: solo entrega el texto nuevo en docs/seguridad.md (firestore.rules local sigue sin entrar a git, D-80) y Anderson lo publica al final.
 f) Antes de cada rebanada de código genera el inventario de testID, accessibilityLabel/Role/State/LiveRegion, props exportadas y claves de labels.js, y compáralo al terminar (solo adiciones salvo lo pedido). SHOW_DEV_TOOLS debe seguir en false. Marca «// AI-assisted: see docs/AI_LOG.md #N». Textos en español en labels.js. Al final de cada rebanada: node scripts/check-constitution.mjs (esperado 13 errores o menos, 0 advertencias).
 g) Hora: consulta Get-Date (hora de Colombia). No inicies una rebanada nueva después de las 08:00 del jueves 2026-11-12; el código queda congelado a las 12:00. Cada rebanada termina coherente o se revierte; actualiza docs/progress.md, backlog.md, decisiones.md y escribe un avance en docs/diseno/progreso-noche.md (o docs/progreso-funcional.md si prefieres separar) tras cada una.

2. REBANADA R0 — ANÁLISIS DE BRECHAS (solo lectura, primero y rápida): compara la especificación, la constitución, los requisitos (RF/RNF), backlog.md y plan-entrega-final.md contra el código real y escribe docs/analisis-brechas-2026-11-11.md con una tabla: requisito → estado (hecho validado / hecho sin validar en dispositivo / parcial / faltante / fuera de alcance acordado) → evidencia (archivo o tarea) → prioridad (obligatorio para la entrega / mejora) → estimación en horas. Incluye los hallazgos de seguridad y los límites conocidos (iOS sin verificar, DateField solo Android, OSRM demo, etc.). No implementes nada de esto salvo lo que se pide abajo. Úsalo para el punto 7.

3. REBANADA R1 — PRECIO VISIBLE EN LA SOLICITUD A PANTALLA COMPLETA (fix): en TripRequestScreen el precio queda cortado y hay que hacer scroll para verlo. Rediseña SOLO la disposición: la tarifa y «tu ganancia» deben verse sin scroll en pantallas de unos 360x640 dp con fuente del sistema al 100 % y al 130 %; las acciones Aceptar/Rechazar quedan fijas abajo fuera del scroll; el bloque del precio va arriba como elemento destacado (jerarquía: ganancia grande, tarifa secundaria), seguido de pasajero, origen, destino, distancia y tiempo. Con fuente al 200 % se permite scroll, pero ganancia y botones deben seguir alcanzables. No cambies contenido, cuenta regresiva (región en vivo), textID, labels ni comportamiento. Comprueba lo mismo en la tarjeta inferior.

4. REBANADA R2 — ACCESIBILIDAD PENDIENTE (auditoría estática 53, hallazgos medios): (i) SelectField y DateField: el accessibilityLabel no debe ocultar el valor elegido (incluye el valor en el label o en accessibilityValue); (ii) AppTabBar: las pestañas de registro no deben truncar «Documentos» y «Vehículo» al 200 %: permite dos líneas o ajusta el ancho/disposición; (iii) TripActiveScreen: la acción principal no debe quedar dentro de un scroll del 65 %: fija la acción principal visible fuera del scroll del panel; (iv) cuenta regresiva de la solicitud: no anunciarla cada segundo en modo assertive; anuncia solo en umbrales (por ejemplo 10, 5 y 0 s) y en polite, sin quitar la región en vivo; (v) menú lateral: conserva el fondo activo mientras se pulsa; (vi) limpieza menor: comentario «plan §7» en SelectField, comentario huérfano en ScreenState, doble anuncio del indicador de subida de foto, y la clave huérfana labels.history.route.

5. REBANADA R3 — MARCADOR DE AUTO EN EL MAPA (si es viable de forma simple; si no, déjalo anotado y sigue): en el mapa del viaje, el punto que representa al conductor se reemplaza por un auto con el color del vehículo REGISTRADO por el conductor (el campo «Color» del registro) con un modelo genérico. Implementación esperada, sin dependencias: marcador de vista del mapa (el componente que ya ofrezca la versión instalada de MapLibre) con el glifo de auto de Ionicons a través de Icon.js, teñido con el color del vehículo, dentro de una insignia circular blanca con borde de token para que cualquier color (incluido blanco y negro) se lea sobre el mapa. Crea tokens para los colores de vehículo correspondientes a las opciones reales del campo Color (si hay una opción «Otro» o desconocida, usa el color de marca) y una función pura que traduzca el color registrado al token, con pruebas. Datos: lee el color ya expuesto en el contexto o el perfil del conductor, sin consultas nuevas. Mantén el aro/marcador del destino y del pasajero como están, con forma distinguible además del color. La rotación según el rumbo es opcional: solo si es trivial y no afecta el rendimiento; si no, sin rotar. El marcador no debe actualizarse con más frecuencia que la ubicación actual, respeta reduce-motion y no se anuncia como elemento accesible (decorativo). Revisa que el rendimiento del mapa no empeore.

6. REBANADA R4 — SESIONES DE CONDUCTOR (la más delicada). Decisiones de diseño que debes registrar en decisiones.md (siguientes D libres) y en seguridad.md:
 a) Firebase Auth con proveedor Correo/Contraseña (ya habilitado por Anderson en la consola); se abandona el acceso anónimo. Persistencia de sesión: la ya existente (AsyncStorage). «Múltiples sesiones» = varias cuentas de conductor en el mismo dispositivo, una activa a la vez: crear cuenta, iniciar sesión, cerrar sesión y cambiar de cuenta (cerrar sesión + iniciar con otra). El SDK de Firebase JS mantiene un solo usuario activo por instancia: documéntalo.
 b) Crear cuenta: correo y contraseña (mínimo 8 caracteres, con confirmación y ayuda visible de requisitos). Al crearla, el usuario entra al flujo de registro ya existente (3 pestañas), luego pendiente de aprobación y aprobación manual en consola. No se exige verificación de correo (la aprobación manual es la puerta real): anótalo como riesgo aceptado.
 c) Recuperar contraseña con sendPasswordResetEmail y un mensaje neutro que no revele si el correo existe. Inicio de sesión con mensaje de error genérico («Correo o contraseña incorrectos») para credenciales inválidas; mensajes específicos solo para red caída, demasiados intentos (pedir esperar) y correo ya en uso al crear cuenta. Los mensajes se mapean desde los códigos de Firebase en una función pura con pruebas.
 d) Tratamiento de credenciales: nunca registrar correos, contraseñas ni tokens en logs; no guardar la contraseña en estado más allá del formulario ni en almacenamiento propio; limpiar los campos al salir; secureTextEntry con botón accesible de mostrar/ocultar; autoComplete (email, current-password, new-password), textContentType, teclado de correo, sin autocapitalizar; el botón se deshabilita mientras se envía y no permite doble envío.
 e) Usuarios anónimos heredados: al arrancar, si el usuario actual es anónimo, cerrar esa sesión y mostrar el inicio de sesión. No se migran datos; los documentos de prueba antiguos los borra Anderson a mano.
 f) Navegación: en RootNavigator, un gate de autenticación: estado de carga mientras se resuelve onAuthStateChanged (con SkeletonBlock o el estado de carga existente) → sin usuario: pila de autenticación (Iniciar sesión, Crear cuenta, Recuperar contraseña) → con usuario: la lógica que ya existe (sin documento de conductor → registro; pendiente; aprobado → principal). El comportamiento posterior no cambia.
 g) Cerrar sesión y Cambiar de cuenta: en Configuración (y el correo de la cuenta visible, enmascarado como ya se hace con otros datos, en Perfil o Configuración), con confirmación en pantalla (sin Alert). Secuencia obligatoria de cierre (función única «resetSession»): (1) si hay viaje en curso, bloquear con el mensaje «Termina o cancela el viaje antes de cerrar sesión»; (2) descartar cualquier solicitud pendiente; (3) poner la disponibilidad en no disponible y publicar el estado final en driverLocations con la cola existente (máximo 5 s, sin bloquear el cierre); (4) detener la ubicación y todas las suscripciones, listeners y temporizadores; (5) limpiar los contextos (Availability, Trip, AppState, RegistrationForm) y el almacenamiento propio de la app; (6) signOut. Prueba con fakes que nada del usuario anterior sobrevive y que iniciar sesión con otra cuenta parte de un estado limpio.
 h) Reglas de Firestore (solo texto en docs/seguridad.md, Anderson las publica al final): en drivers, driverLocations y trips exigir request.auth != null y request.auth.token.firebase.sign_in_provider == 'password', manteniendo las reglas actuales de dueño y sus validaciones. Indica a Anderson el orden: primero validar la app nueva en el celular, después publicar las reglas.
 i) Retira o adapta los paneles de desarrollo que dependan de cuentas anónimas (DevAccountSwitch y similares); con SHOW_DEV_TOOLS en false no debe quedar nada visible. Actualiza README (cómo crear cuenta, cómo se aprueba, cómo se usa el cambio de cuenta) y docs/arquitectura (nuevo documento corto de sesión y su secuencia de cierre).
 j) Pantallas nuevas (Iniciar sesión, Crear cuenta, Recuperar contraseña) con el sistema de diseño; accesibilidad: labels, errores con ícono y texto en región en vivo polite, foco en el primer campo con error, áreas táctiles 44x44, texto al 200 % sin recortes, teclado que no tapa campos ni botón principal, sin Alert.
 k) Pruebas: script temporal fuera del proyecto con pruebas puras (validadores, mapeo de errores, resetSession con fakes, gate de navegación por estado) y checklist de dispositivo para Anderson: crear cuenta A, completar registro, aprobar en consola, ciclo completo de viaje y cobro, cerrar sesión, crear/entrar con cuenta B, comprobar que no se ve nada de A, volver a A y ver su historial y ganancias, cierre con viaje en curso bloqueado, modo avión en inicio de sesión, contraseña incorrecta, recuperación de contraseña, reinicio de la app con sesión persistente.

7. REBANADAS SIGUIENTES (según R0): después de R4, y si queda tiempo antes del límite del punto 1g, implementa por rebanadas independientes (proceso SDD completo, una a una) los requisitos clasificados «obligatorio para la entrega» en el análisis de brechas, de mayor a menor prioridad y SIN ampliar el alcance con ideas nuevas. Si un faltante requiere decisión de Anderson o una regla de Firestore nueva, déjalo documentado y pasa al siguiente.

8. SALIDA FINAL: (i) rebanadas completadas, revertidas y no iniciadas, (ii) resumen del análisis de brechas con las prioridades, (iii) commits o snapshots por rebanada, (iv) pasos manuales para Anderson en orden (qué probar en el celular, cuándo publicar las reglas nuevas, cómo borrar los datos de prueba anteriores), (v) qué descartar o revertir si algo falla, (vi) hallazgos pendientes de verifier y auditor.
````
- Resumen de la respuesta (2–3 líneas): (pendiente: se completa al terminar)
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: (pendiente: se completa al terminar)
- Verificación: (pendiente: se completa al terminar)
- Aprendizaje:

### Entrada #55
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Opus 5.5, claude-opus-5-5)
- Objetivo: Lote final: NaN en Ganancias, mapa en Inicio, documentos del conductor, pagos con Mercado Pago, historial con filtros y gráficas, y documentación de omisiones
- Prompt textual:
````
Respuesta a tu pregunta: NO hagas S4d ni las auditorías T-75 y T-76 ahora. T-73 (texto de reglas con proveedor password) y T-74 (README, docs/arquitectura-sesiones.md, checklist) se funden en la rebanada de cierre F6 del lote que sigue, porque las reglas de drivers y trips también cambian y se publican una sola vez al final; T-75 y T-76 solo si queda tiempo. Marca D-105 y D-106 como Vigente (D-106 queda enlazada a la rebanada de pagos). No añadas reglas a check-constitution para las APIs anónimas: en su lugar, incluye en la verificación final un grep de signInAnonymously, ensureAnonymousUser, DevAccountSwitch, simulateAccountStatus y authNote que debe dar cero resultados. En F6 añade también: (a) un verifier distinto revisa la corrección de S2 en TripActiveScreen; (b) demuestra con un diff contra los snapshots que las filas restauradas de progress.md son correctas y pásame las líneas cambiadas; (c) explica y baja las 29 advertencias C23. Anderson ya hizo un commit local con T-70 a T-72, así que el HEAD cambia: confírmalo con git log --oneline -3. A continuación, el lote final:Lote final de funcionalidad: correcciones rápidas, documentos del conductor, pagos con Mercado Pago Checkout Pro (con efectivo y saldo), historial con filtros y gráficas, y documentación de lo no implementado. Proceso SDD completo.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Lote final: NaN en Ganancias, mapa en Inicio, documentos del conductor, pagos con Mercado Pago, historial con filtros y gráficas, y documentación de omisiones", con este prompt copiado tal cual. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío. Nunca pegues claves ni tokens en la bitácora.

1. PUNTO DE PARTIDA Y REGLAS
 a) Estás en anderson/funcionalidad-sesiones con las sesiones (S4) cerradas en lo estático. Confirma rama y HEAD. Los estilos están cerrados: todo lo nuevo usa tokens, Card, Chip, DataRow, ScreenHeader, Icon, SkeletonBlock, Inter y las reglas de DESIGN.md y guia-de-estilo.md; nada suelto. Sin restyling de lo existente.
 b) Proceso: spec-author actualiza specs/002-funcionalidad-final (nuevos requisitos de este lote, con criterios de aceptación CA numerados); planner crea las tareas; implementer construye; verifier DISTINTO del implementer; design-auditor en pantallas nuevas; el builder nunca aprueba. Rechazo: corrige UNA vez; si se rechaza otra vez, detente en esa rebanada y sigue con las independientes. Los verifiers NO editan docs: solo informan. Agrupa validaciones de dispositivo en checkpoints (D-59). Antes de cada rebanada de código genera el inventario de testID/accessibilityLabel/Role/State/LiveRegion/props exportadas/claves de labels.js y compáralo al terminar (solo adiciones). check-constitution al terminar cada rebanada.
 c) Commits LOCALES por rebanada, sin push, sin cambiar de rama. Si se deniega, snapshot + parche acumulado en el scratchpad.
 d) PROHIBIDO: expo run/prebuild/eas/lint; cambios nativos; editar app.json (solo puedes LEER si tiene «scheme»); Alert (todo en pantalla); leer .env, backend/.env o backend/secrets/*; tocar mi Metro; pegar secretos en cualquier archivo; push. Dependencias: ninguna nueva en la app; en backend solo firebase-admin (ya instalado por Anderson) y, si lo exige el runtime, nada más (usa fetch nativo de Node para la API de Mercado Pago). Añade lo permitido a scripts/dependencies.json con justificación (este prompt es la aprobación de Anderson).
 e) Horario (Get-Date, hora Colombia): no inicies rebanada nueva después de las 10:00 del jueves 2026-11-12; el código se congela a las 14:00. Cada rebanada termina coherente o se revierte. Orden obligatorio: R0b, F1, F2, F4, F3, F5, F6. Si algo es inviable o arriesgado, anótalo y sigue con lo seguro.

2. R0b — RECONCILIAR CON EL ENUNCIADO (rápida, solo lectura y docs): lee docs/enunciado-taller.pdf completo (secciones 2 a 9) y actualiza docs/analisis-brechas-2026-11-11.md con una fila por requisito del enunciado (estado, evidencia, prioridad, horas). Debe contemplar al menos: historial con filtros Hoy/Semana/Mes/Rango y por método de pago, FlatList paginado de 20, detalle con ruta; Ganancias con las 6 métricas y el saldo; pago en efectivo; método de pago en la solicitud; estados paid/pagos; perfil editable; idioma; documentos; FCM; hooks obligatorios (useEarnings, useMemo, useCallback); 5 minutos de video. Actualiza la especificación con los requisitos nuevos de este lote.

3. F1 — CORRECCIONES RÁPIDAS
 a) Ganancias muestra «NaN:NaN» junto al nombre del usuario: encuentra la causa raíz (formato de hora o fecha con valor inválido), corrígela con un guard en el utilitario de formato y agrega pruebas puras (valores nulos, indefinidos, cadenas y fechas inválidas); no ocultes el síntoma con un parche visual.
 b) Inicio: el mapa con la ubicación actual del conductor ocupa la pantalla y el interruptor Disponible/No disponible flota arriba (tarjeta con el interruptor, estado en texto y chip, pista de ayuda breve, respetando la zona segura) con la composición más limpia que puedas. Mientras Inicio está enfocado se muestra la posición actual (solo local, sin publicar); solo mientras está Disponible se publica en driverLocations como hoy; al salir de la pantalla o pasar a No disponible el seguimiento se detiene (limpieza de useEffect). Sin permiso de ubicación: estado claro con botón para concederlo. No añadas llamadas de ruta. Reduce-motion respetado, contraste y áreas táctiles según la guía, sin romper la tarjeta de solicitud ni el flujo existente.

4. F2 — PESTAÑA «DOCUMENTOS Y PAGOS» (según enunciado §2): campos y validaciones: Licencia de conducción (número, foto, vencimiento posterior a hoy); SOAT (foto, vencimiento posterior a hoy); Revisión técnico-mecánica (foto, vencimiento posterior a hoy; solo se exige si el vehículo tiene 5 años o más según el año registrado; si no aplica, se muestra el motivo y no se exige); Correo de la cuenta de Mercado Pago (ya existe); casilla de términos con la comisión visible (ya existe). Errores debajo de cada campo, sin Alert; el botón Enviar solo se habilita con las 3 pestañas completas y válidas. Reutiliza la foto y la subida existentes (Cloudinary, D-68) y DateField. Guarda en el documento del conductor con una estructura clara; no guardes números de cuenta ni de tarjeta. Entrega el texto actualizado de las reglas de drivers (nuevas claves y validaciones) en docs/seguridad.md; Anderson lo publicará. Documenta que las fotos de documentos son datos de prueba (usar documentos ficticios) y que el preset sin firma de Cloudinary hace las URL públicas pero no adivinables. Marca los textos nuevos en labels.js.

5. F4 — PAGOS: MERCADO PAGO CHECKOUT PRO (obligatorio; enunciado §4)
 a) INVESTIGA primero en la documentación oficial de Mercado Pago Colombia (WebSearch y WebFetch; cita las URLs en docs/pagos.md): crear preferencia (POST /checkout/preferences), campos (items, currency_id COP, external_reference, back_urls, auto_return, notification_url, expires), si back_urls acepta deep links, init_point vs sandbox_init_point con credenciales de prueba, búsqueda de pagos por external_reference, notificaciones Webhooks (topic, data.id, validación de x-signature) y tarjetas de prueba de Colombia (nombres APRO/OTHE/CONT, documento y fechas). Verifica que NO exista mensualidad ni costo para usar Checkout Pro con credenciales de prueba; si lo hubiera, detente y repórtalo a Anderson sin implementar. Si algo de esta especificación contradice la documentación, elige lo más seguro y regístralo.
 b) Decisiones a registrar (D siguientes libres): supersede D-89 (cobro simulado) por pago real de prueba; el viaje se crea en Firestore al COMPLETARSE, con status 'completed', paymentStatus 'pending' y paymentMethod 'mercadopago' o 'cash' según la solicitud (la API simulada del pasajero decide el método; mappers.js sigue siendo el único archivo que conoce la forma de la API); status pasa a 'paid' al confirmarse el pago; viaje cancelado: status 'cancelled'. Los pagos con tarjeta solo los actualiza el backend (firebase-admin); el efectivo lo marca el conductor desde la app con una regla de Firestore muy estrecha (solo pasar paymentMethod/paymentStatus/status de pending a cash/paid, ningún otro campo, solo el dueño aprobado, solo si paymentMethod ya era 'cash'). Sin otra edición ni borrado de viajes. Documenta que la tarifa la calcula la app y el pasajero es simulado (límite aceptado) y que el backend valida monto positivo y un tope razonable.
 c) BACKEND (backend/, Node/Express, sin dependencias nuevas salvo firebase-admin; fetch nativo para Mercado Pago): módulos separados (config, auth, firestore, mercadopago, rutas) con un cliente de pagos inyectable para poder probar con fakes. Endpoints: GET /health; POST /payments/checkout {tripId} → verifica el token de sesión del conductor (Authorization: Bearer <ID token>, verifyIdToken), carga el viaje desde Firestore, comprueba que pertenece a ese uid, que status es 'completed', paymentMethod 'mercadopago' y paymentStatus distinto de 'approved', toma el monto DEL DOCUMENTO (nunca del cuerpo), crea la preferencia con external_reference = tripId y devuelve solo el enlace de pago; POST /payments/sync {tripId} → consulta en Mercado Pago los pagos con ese external_reference y actualiza paymentStatus, paymentId y status; POST /webhooks/mercadopago → NO confíes en el cuerpo: obtén el pago por id desde la API de Mercado Pago con el token del servidor, comprueba external_reference, monto, moneda y estado, valida x-signature si hay MP_WEBHOOK_SECRET, y actualiza el viaje de forma idempotente (transacción; no retrocede de approved). Estados de pago mapeados: approved→'approved', pending/in_process→'pending', rejected/cancelled→'rejected'. Límite de peticiones simple por usuario, cuerpos limitados, sin registrar tokens ni cabeceras, errores genéricos hacia la app, CORS cerrado. Configuración por variables: MP_ACCESS_TOKEN, FIREBASE_SERVICE_ACCOUNT_PATH, PUBLIC_BASE_URL, PORT, MP_WEBHOOK_SECRET (opcional); backend/.env.example solo con nombres; asegura que .gitignore cubre backend/.env y backend/secrets/. Pruebas con fakes (script temporal fuera del proyecto): autorización, propiedad del viaje, monto tomado del documento, idempotencia, mapeo de estados, firma inválida. No ejecutes el backend contra Mercado Pago ni leas secretos: Anderson hará la prueba real.
 d) APP: variable EXPO_PUBLIC_BACKEND_URL (solo el nombre en .env.example); servicio de pagos que llama al backend con el ID token; pantalla «Cobro y resumen» según enunciado §3: si el viaje es con tarjeta: botón «Cobrar con Mercado Pago» → abre el enlace con Linking.openURL (navegador); la app escucha el documento del viaje en tiempo real (onSnapshot con limpieza) y muestra el estado Aprobado/Pendiente/Rechazado con chip y texto; al volver a primer plano (AppState) y con un botón «Verificar pago» llama a /payments/sync; si fue rechazado, «Reintentar pago». Si es efectivo: botón «Confirmar efectivo recibido» (escritura permitida por la regla estrecha) y estado «Efectivo». Estados de carga, error, sin conexión y backend no disponible resueltos con mensajes en pantalla y salida segura (se puede salir al inicio sin perder el viaje: ya está guardado). Lee en app.json si hay «scheme» para decidir si usar back_urls con deep link; si no lo hay, sin deep link (el usuario vuelve a la app y el sync automático hace el resto) y deja la nota. Muestra el método de pago en la solicitud entrante (tarjeta tarjeta de solicitud inferior y pantalla completa). Esto cierra el menor 4 de T-71: el viaje se guarda al completarse y cualquier cierre de sesión con guardado pendiente avisa y espera como ya definiste en T-70.
 e) SALDO: cálculo puro con pruebas: ganancias (driverEarnings) de viajes con pago aprobado por pasarela menos comisiones (commission) de viajes en efectivo; puede ser negativo y así se muestra con texto «Saldo a favor de la plataforma» claro; se muestra en Ganancias. La liquidación se simula solo con el saldo (sin pantallas de retiro).
 f) Documentos: docs/pagos.md (flujo, diagrama de secuencia en texto, cómo crear cuentas de prueba y qué tarjeta usar, cómo arrancar el backend, cómo exponerlo con un túnel público si se desea, límites conocidos), README (variables de entorno y pasos), docs/seguridad.md (reglas nuevas de trips con los campos de pago y la actualización estrecha del efectivo, y el rol del backend) y .env.example. Texto de reglas listo para publicar, sin tocar firestore.rules local en git.

6. F3 — HISTORIAL Y GANANCIAS (enunciado §5 y §6)
 a) Historial: FlatList del más reciente al más antiguo; filtros Hoy, Semana, Mes y Rango de fechas (dos DateField, inicio ≤ fin, mensajes en pantalla, rango máximo razonable) y filtro por método de pago (Todos, Tarjeta, Efectivo). Consulta con orderBy y rango solo sobre createdAt (evita índices compuestos; el filtro de método se aplica en el cliente) y límite de 20 por carga con «Cargar más». Cada elemento: fecha y hora, origen → destino, categoría, tarifa, ganancia neta y estado de pago (Chip con texto). Estado vacío cuando no hay viajes en el filtro. Encima de la lista, un resumen con gráfica de barras dibujada con View (sin librerías): por franjas de horas en Hoy, por día en Semana y Mes, por día o semana en Rango; muestra ganancia neta, con etiqueta de texto y accessibilityLabel por barra y un resumen leíble (nada solo por color).
 b) Ganancias: para hoy, semana y mes: número de viajes, total facturado, total de comisiones, propinas, ganancia neta y promedio por viaje, calculados con useMemo sobre el historial mediante un hook useEarnings, más el saldo (punto 5e). Pruebas puras de los cálculos con el ejemplo del enunciado (8,5 km, 22 min: Económico 19.200/3.840/15.360, XL 26.900/5.380/21.520) y con límites de semana/mes (zona horaria de Colombia).
 c) Detalle del viaje al tocar un elemento (pantalla o panel): duración, distancia, comisión, propina, método y estado de pago, y calificación solo si existe el dato; con la ruta dibujada en el mapa. Para ello guarda al completar un viaje una versión simplificada de la ruta PLANIFICADA del viaje (máximo 40 puntos, 4 decimales) en el documento del viaje; esto modifica parcialmente D-87 (no coordenadas): regístralo como decisión nueva con su justificación (solo el dueño lo lee; datos de la demostración se limpian antes de la entrega) y actualiza el texto de reglas de trips en docs/seguridad.md. Si el viaje no tiene ruta guardada, el detalle lo indica sin fallar.

7. F5 — DOCUMENTAR LO NO IMPLEMENTADO: crea docs/omisiones-y-limites.md con una entrada por cada omisión, su justificación técnica y su impacto: (i) notificaciones push con la app en segundo plano (FCM): requiere @react-native-firebase (módulos nativos), nueva build, google-services.json, permiso de notificaciones en Android 13 y un servidor que envíe el push, y las solicitudes las genera el pasajero simulado dentro de la app; (ii) perfil editable (choca con la regla de integridad «aprobada, sin edición»); (iii) idioma español/inglés (no se traduce a medias; los textos están centralizados en labels.js, por lo que queda como siguiente paso); (iv) Google Directions/Distance Matrix y react-native-maps sustituidos por OSRM y MapLibre (D-82, sin clave ni facturación); (v) iOS no verificado; (vi) DateField solo Android; (vii) propinas y calificación del pasajero fuera de alcance salvo datos presentes. Enlaza el documento desde el README.

8. F6 — CIERRE: actualiza backlog.md, progress.md (filas CA), decisiones.md, README y docs/diseno/progreso-noche.md; check-constitution (errores solo los preexistentes C01 y C21); resumen de advertencias C23 por agrupar y corregir las que dependan de filas faltantes en progress.md.

9. SALIDA FINAL: (i) rebanadas completadas, revertidas y no iniciadas, (ii) commits o snapshots, (iii) checklist de dispositivo agrupado por checkpoints (A: Inicio con mapa, NaN, documentos; B: pagos con tarjeta de prueba y efectivo; C: historial, filtros, gráfica, detalle, saldo), (iv) pasos manuales para Anderson en orden: crear backend/.env desde .env.example, comando para arrancar el backend, cómo averiguar la IP o usar el túnel, cuándo publicar las reglas nuevas (drivers y trips), cómo probar con la cuenta compradora de prueba y la tarjeta APRO, (v) qué descartar si algo falla, (vi) hallazgos pendientes de verifiers y auditor.
````
- Resumen de la respuesta (2–3 líneas): (pendiente: se completa al terminar)
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: (pendiente: se completa al terminar)
- Verificación: (pendiente: se completa al terminar)
- Aprendizaje:

### Entrada #56
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Nuevo orden de trabajo: T-73 con reglas consolidadas, F3 mínimo viable, F5 (omisiones y límites) y F6 parcial
- Prompt textual:
````
Informe recibido, gracias. Nuevo orden de trabajo (sustituye al orden anterior), sin empezar nada fuera de esto: 1) T-73 y REGLAS CONSOLIDADAS (primero, es lo que desbloquea las pruebas de dispositivo): escribe en docs/seguridad.md UN solo texto final de reglas para drivers (con documents y con el proveedor password exigido: request.auth.token.firebase.sign_in_provider == 'password'), driverLocations y drivers/{uid}/trips, listo para pegar completo, y actualiza también el firestore.rules local (ignorado por git) con el mismo texto. Corrige en seguridad.md lo desactualizado (auth anónima D-53, «borrador» de driverLocations). Demuestra el texto contra el CÓDIGO real con un script temporal fuera del proyecto: replica las reglas y prueba como casos válidos los payloads reales que generan buildTripRecord, el registro con documents, driverLocations y el efectivo (pending→paid), y como casos inválidos al menos 15 (campos extra, montos no enteros, comisión+ganancia≠tarifa, cuenta no aprobada, otro uid, cambiar paymentMethod, pasar a paid con tarjeta desde el cliente, borrado, usuario anónimo). Un verifier distinto lo revisa. Anota el orden de publicación y qué pruebas debe repetir Anderson después. 2) F3 MÍNIMO VIABLE (en paralelo a las pruebas de Anderson): Historial con FlatList del más reciente al más antiguo; filtros Hoy, Semana, Mes y Rango de fechas (inicio ≤ fin) y filtro por método de pago; límite de 20 por carga con «Cargar más» (consulta solo con orderBy y rango sobre createdAt, sin índices compuestos; el método se filtra en el cliente); cada elemento con fecha y hora, origen → destino, categoría, tarifa, ganancia neta y estado de pago (Chip con texto); estado vacío; resumen con barras simples dibujadas con View y etiquetas accesibles. Hook useEarnings con useMemo con las 6 métricas por hoy/semana/mes (viajes, total facturado, comisiones, propinas, ganancia neta, promedio por viaje) más el saldo, con pruebas puras del ejemplo del enunciado (8,5 km y 22 min: Económico 19.200/3.840/15.360, XL 26.900/5.380/21.520) y zona horaria de Colombia. El detalle con ruta (T-109, T-110) solo si queda tiempo después de todo lo demás, y sin romper nada. 3) F5: docs/omisiones-y-limites.md (T-111) con FCM, perfil editable, idioma, Directions/Maps sustituidos, iOS y DateField, y enlázalo desde el README. Si Anderson ya copió docs/enunciado-taller.pdf, rehaz la tabla de cobertura contra el enunciado real (15 minutos). 4) F6 PARCIAL: T-74 (README y docs/arquitectura-sesiones.md); filas honestas en progress.md para los CA que faltan, con estado «pendiente de dispositivo» (nunca marques «Validada» sin evidencia de Anderson); reconcilia backlog y decisiones (D-107 a D-110, T-78); un verifier distinto revisa la corrección de TripActiveScreen de S2; no gastes más de 30 minutos en las advertencias C23. Commits locales por rebanada si el sistema lo permite; si no, snapshots. Sin push, sin leer .env ni secrets. Al terminar, informe corto con lo hecho, lo pendiente y el checklist de dispositivo para cada checkpoint.
````
- Resumen de la respuesta (2–3 líneas): (pendiente: se completa al terminar)
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: ver el estado de git (sin commit; sin push). Principales: firestore.rules (local), docs/seguridad.md, src/utils/{dateRanges,historyQuery,chartData,historyFilters,chartLayout}.js, src/hooks/{useTripHistory,useEarnings}.js, src/components/{BarChart,HistoryFilters,TripListItem}.js, src/screens/main/{HistoryScreen,EarningsScreen}.js, docs/{omisiones-y-limites,arquitectura-sesiones,checklist-dispositivo-sesiones}.md, scripts/tests/*.
- Verificación: (pendiente: Anderson)
- Aprendizaje:

### Entrada #57
- Fecha: 2026-11-11
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Corregir hallazgos de la prueba en el celular, herramientas de diagnóstico de pagos con tarjeta, zoom del mapa y documentos de cierre
- Prompt textual:
````
Lote de cierre nocturno: correcciones de la prueba en dispositivo, diagnóstico y herramientas para que funcionen los pagos con tarjeta, zoom del mapa, detalle del viaje (si falta) y documentos de la mañana. Proceso SDD completo.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-11, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir hallazgos de la prueba en el celular, herramientas de diagnóstico de pagos con tarjeta, zoom del mapa y documentos de cierre", con este prompt copiado tal cual. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío.

1. REGLAS (se mantienen): rama anderson/funcionalidad-sesiones (confirma rama y HEAD); estilos cerrados (tokens, Card, Chip, DataRow, Icon, Inter; sin hex ni números sueltos); spec-author actualiza la spec con criterios CA nuevos, planner crea tareas, implementer, verifier DISTINTO, design-auditor en lo visual nuevo; los verifiers no editan docs; el builder nunca aprueba; rechazo: corrige UNA vez y si se repite detente en esa rebanada; inventario de testID/accessibility/labels/props antes y después (solo adiciones); sin Alert; sin dependencias nuevas; sin tocar app.json, nativo, reglas publicadas ni firestore.rules salvo que un hallazgo lo exija (y entonces solo texto en docs/seguridad.md y el archivo local); SHOW_DEV_TOOLS=false; NO leas .env, backend/.env ni backend/secrets/*; sin push; commits LOCALES por rebanada («fix:», «feat:», «docs:») o snapshot + parche si se deniegan; nada pasa a «Validada» sin evidencia de Anderson. Horario: consulta Get-Date; no abras rebanadas nuevas después de las 08:00 del jueves 2026-11-12.

2. HALLAZGOS DE LA PRUEBA EN DISPOSITIVO DE ANDERSON (evidencia real, con capturas):
 H-1 Inicio: el mapa abre con todo Latinoamérica; debe abrir en su barrio o ciudad.
 H-2 Historial: los viajes antiguos (guardados antes de los campos de pago, sin paymentMethod ni paymentStatus) muestran el chip «Pago sin estado».
 H-3 Ganancias: el texto de la tarjeta del saldo se sale de la tarjeta.
 H-4 Resumen del viaje, panel de cobro: (a) con efectivo aparece el aviso amarillo «Servicio de cobro no disponible»; el efectivo no debe contactar ningún servicio; (b) aparece «Cobro confirmado. El viaje quedó guardado en tu historial» en verde mientras el chip dice «Pendiente»; (c) pueden verse a la vez un aviso amarillo, uno rojo y uno verde; (d) el botón «Confirmar efectivo recibido» sigue visible después de cobrar.
 H-5 Tarjeta: al pulsar «Cobrar con Mercado Pago» o «Verificar pago» sale «No pudimos contactar el servicio de cobro». Es un error de red hacia el backend. Causa más probable: backend apagado, EXPO_PUBLIC_BACKEND_URL ausente o inalcanzable, o configuración incompleta de Mercado Pago o Firebase en backend/. No puedes arreglar la configuración (no leas secretos); sí debes hacer el código diagnosticable y dejar herramientas y guía.
 H-6 Ya funcionan con las reglas publicadas: guardado de viaje en efectivo, Historial, filtros, gráfica y saldo.

3. REBANADAS (orden obligatorio):

 G1 — CORRECCIONES DE INTERFAZ (H-1 a H-4):
  H-1: al recibir la primera posición, centra la cámara con zoom de barrio (constante en config/map.js, por ejemplo 15); después no vuelvas a recentrar solo por cada actualización (el usuario puede mover el mapa); añade un botón accesible «Mi ubicación» (Icon, 44x44, accessibilityLabel y testID nuevos) para recentrar; con reduce-motion, salto sin animación; sin ubicación todavía, muestra un encuadre razonable de Colombia (no el mundo). Sin llamadas de red nuevas.
  H-2: viajes sin paymentMethod/paymentStatus muestran el chip neutro «Cobro simulado» (texto, no solo color), en Historial y en el detalle; decide y documenta que los totales de Ganancias los incluyen y que el saldo (computeBalance) los excluye; el filtro de método los muestra solo en «Todos»; pruebas puras.
  H-3: la tarjeta del saldo debe permitir que el texto se ajuste a varias líneas (flexShrink, sin ancho fijo ni numberOfLines que corte la información crítica), correcta al 200 %.
  H-4: define y aplica UNA regla de render del panel de cobro (tabla de estados con pruebas puras): un solo mensaje a la vez con prioridad error de guardado > error del servicio > informativo > éxito. EFECTIVO: nunca llama al backend ni muestra mensajes del servicio de cobro; pending → botón «Confirmar efectivo recibido»; cobrado → chip «Efectivo», mensaje «Efectivo recibido. El viaje quedó guardado en tu historial.» y sin botones de cobro. TARJETA: pending → «Viaje guardado. Falta el pago con Mercado Pago.» con «Cobrar con Mercado Pago» y «Verificar pago»; approved → «Pago aprobado. El viaje quedó guardado en tu historial.» sin botones; rejected → «Pago rechazado» con «Reintentar pago»; el error del servicio aparece SOLO tras una acción real del usuario (no al montar la pantalla) y reemplaza al mensaje informativo. El verde de éxito solo con approved o efectivo cobrado; «viaje guardado» y «cobro confirmado» son conceptos distintos. Región en vivo polite para los cambios de estado. Textos nuevos en labels.js.

 G2 — DIAGNÓSTICO Y HERRAMIENTAS DE PAGOS CON TARJETA (H-5):
  a) Clasifica los errores del cliente de pagos con pruebas con fakes de fetch: URL no configurada, red inalcanzable o tiempo agotado, 401/403 (sesión o token), 404, 5xx del backend, respuesta inválida, error del proveedor de pagos. Mensajes específicos y seguros en pantalla para cada caso (por ejemplo «El servicio de cobro no está configurado en esta app», «No se pudo conectar con el servicio de cobro. Revisa tu conexión y que el servicio esté encendido», «Tu sesión expiró; vuelve a iniciar sesión»), sin exponer URLs, tokens ni cabeceras. Revisa estáticamente el cliente y la ruta POST /payments/checkout y /payments/sync (rutas, cabecera Authorization con el ID token, cuerpo, tiempos de espera) y corrige cualquier bug real que encuentres; informa qué encontraste.
  b) Backend: crea el script «npm run doctor» (en backend/package.json) que Anderson ejecutará: comprueba la versión de Node, que existan las variables por NOMBRE (sin imprimir valores), que FIREBASE_SERVICE_ACCOUNT_PATH apunte a un archivo legible con JSON válido, que firebase-admin se inicialice y haga una lectura trivial de Firestore, que el token de Mercado Pago sea válido consultando un endpoint de identidad de la API (imprime solo OK o el código HTTP, nunca el token), y avisa si PUBLIC_BASE_URL falta o no es https (necesario para el webhook). Salida clara por línea con OK / FALTA / ERROR y qué hacer; nunca imprimas secretos. Añade una prueba con fakes del doctor.
  c) docs/pagos-guia-rapida.md, en español y para PowerShell en Windows, paso a paso: crear la aplicación y las credenciales de prueba, la cuenta compradora de prueba, la llave de servicio de Firebase, cómo crear backend/.env desde .env.example (sin pegar valores en el chat), npm run doctor, arrancar el backend, comprobar http://<IP>:3000/health desde el navegador del celular, DOS vías para que el celular llegue al backend: (1) misma red Wi-Fi con la IP del PC y la regla de firewall de Windows para ese puerto (comando New-NetFirewallRule), y (2) túnel público con cloudflared (comando exacto) que además habilita HTTPS y el webhook, indicando que la URL cambia en cada ejecución y que hay que actualizar PUBLIC_BASE_URL y EXPO_PUBLIC_BACKEND_URL; cómo poner EXPO_PUBLIC_BACKEND_URL en el .env de la app y reiniciar Metro con -c (las variables EXPO_PUBLIC se leen al iniciar); revisa en app.json (solo lectura) y documenta si el tráfico HTTP está permitido en la build de desarrollo y, si no, usa el túnel https; la prueba de pago: viaje con tarjeta, «Cobrar con Mercado Pago», iniciar sesión en el checkout con la cuenta compradora de prueba, pagar con la tarjeta de prueba aprobada (APRO), volver a la app, «Verificar pago», qué debe verse en la app y en Firestore; qué hacer con OTHE y CONT; y una tabla de síntomas → causa → solución (incluye el mensaje «No pudimos contactar el servicio de cobro»). Cita las URLs oficiales de Mercado Pago que consultaste. Si el flujo de la guía contradice la documentación, corrige la guía.

 G3 — DETALLE DEL VIAJE (T-109 y T-110): si ya están hechas, no las repitas y dilo; si no, hazlas ahora en dos rebanadas (detalle de datos, luego la ruta dibujada con la ruta simplificada guardada, sin red nueva; sin ruta → lo indica sin fallar).

 G4 — DOCUMENTOS DE LA MAÑANA: (a) docs/checklist-manana-jueves.md: lista ordenada y con tiempos estimados de lo que Anderson debe hacer el jueves hasta la entrega (doctor y backend, prueba de tarjeta, verificación del Historial y del detalle, publicar reglas si algo cambió, congelar código a las 13:00, bitácora, README, PDF, limpieza de Firestore, video, PR final y merge), con criterios de «listo»; (b) docs/guion-video.md: guion del video de máximo 5 minutos con la secuencia exigida por el enunciado (registro del conductor, solicitud, viaje, pago de prueba, historial), tiempos por escena, qué datos ficticios preparar, qué decir en cada escena y un plan B si el pago con tarjeta falla en el momento (mostrar efectivo y la prueba grabada previamente); (c) actualiza README, progress.md (filas honestas «pendiente de dispositivo»), backlog y decisiones; si existe docs/enunciado-taller.pdf, rehaz la tabla de cobertura contra el enunciado real; (d) grep final de símbolos anónimos (cero resultados), SHOW_DEV_TOOLS=false, y confirmación de que .env, backend/.env y backend/secrets siguen ignorados y sin rastrear.

4. VERIFICACIÓN Y SALIDA: un verifier distinto revisa cada rebanada; design-auditor revisa G1; check-constitution (12 errores es la línea base; no gastes más de 20 minutos en advertencias C23); pruebas puras de H-2, H-4, G2a y el doctor. Salida final: (i) rebanadas completadas, revertidas y no iniciadas, (ii) qué encontraste en el cliente y backend de pagos (bugs reales vs configuración), (iii) commits o snapshots, (iv) el checklist de dispositivo de G1 y G3 en orden y los comandos exactos que Anderson debe ejecutar mañana para G2 (doctor, backend, túnel o IP), (v) hallazgos pendientes de verifiers y auditor.
````
- Resumen de la respuesta (2–3 líneas): Se corrigieron en lo estático los hallazgos H-1 a H-4 (mapa con zoom de barrio y botón «Mi ubicación», chip «Cobro simulado», saldo a varias líneas, panel de cobro con una sola regla), se clasificaron los errores del cliente de pagos en ocho clases y se creó `npm run doctor` con la guía de pagos. El detalle de viaje con mapa de solo lectura (T-109, T-110) quedó implementado; los documentos de la mañana, README, progress, backlog, omisiones y decisiones D-111 a D-115 (Propuesta) se actualizaron. Nada quedó validado en el celular.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: Código: `src/components/map/{TripMap,MyLocationButton}.js`, `src/config/{backend,map}.js`, `src/constants/labels.js`, `src/navigation/MainDrawer.js`, `src/screens/home/HomeScreen.js`, `src/screens/main/{EarningsScreen,HistoryScreen,TripDetailScreen}.js`, `src/screens/trip/TripSummaryScreen.js`, `src/services/map/`, `src/services/trip/{chargePanel,legacyTrip,tripDetailView,paymentActions,paymentsClient}.js`, `src/components/{ScreenHeader,TripListItem}.js`, `backend/scripts/` y `backend/package.json`, pruebas en `scripts/tests/`. Documentos: `docs/{pagos-guia-rapida,checklist-manana-jueves,guion-video,omisiones-y-limites,progress,backlog,decisiones,requisitos}.md`, `docs/diseno/auditorias/ronda-{1,2}-cierre.md`, `README.md`, `specs/002-funcionalidad-final/{spec,plan}.md`. Commit: sin commit al momento de escribir.
- Verificación: Estática, por verifiers distintos de cada implementer; 24 pruebas puras y con fakes pasan; `check-constitution` sin cambios sobre la línea base de 12 errores; auditoría de diseño rondas 1 y 2 cerradas (Diseño aprobado condicionado al celular). Nada fue validado en el celular: todo queda «No verificado en dispositivo» hasta la lista de `docs/checklist-manana-jueves.md`; `npm run doctor` aún no lo ejecutó Anderson con credenciales reales.
- Aprendizaje:

### Entrada #58
- Fecha: 2026-11-12
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Añadir Stripe Checkout como segunda pasarela de pago de prueba sin quitar Mercado Pago
- Prompt textual:
````
Segunda pasarela de pagos: Stripe Checkout (modo de prueba), conservando Mercado Pago intacto. Proceso SDD completo, con el menor riesgo posible y con prisa: objetivo total de 60 a 75 minutos.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-12, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Añadir Stripe Checkout como segunda pasarela de pago de prueba sin quitar Mercado Pago", con este prompt copiado tal cual. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío.

1. CONTEXTO Y REGLAS: Mercado Pago no permite a Anderson crear cuentas de prueba (falla su sitio), así que no puede validar el cobro con tarjeta. NO elimines ni desactives el código de Mercado Pago: debe seguir funcionando si luego se configura. Rama anderson/funcionalidad-sesiones (confirma rama y HEAD). Estilos cerrados (tokens, Card, Chip, DataRow, Icon, Inter, sin hex sueltos). Spec-author actualiza criterios CA nuevos, planner crea tareas, implementer, verifier DISTINTO (los verifiers no editan docs), design-auditor en lo visual nuevo; rechazo: corrige UNA vez y si se repite detente. Inventario de testID/accessibility/labels antes y después (solo adiciones). Sin Alert. SIN dependencias nuevas en la app ni en backend (usa fetch y el módulo crypto de Node; no instales el paquete stripe). Sin tocar app.json, código nativo ni las reglas de Firestore publicadas; NO leas .env, backend/.env ni backend/secrets/*; sin push; commits LOCALES por rebanada o snapshot + parche; SHOW_DEV_TOOLS=false; nada pasa a «Validada» sin evidencia de Anderson.

2. DECISIONES A REGISTRAR (D siguientes libres): (a) Stripe Checkout Sessions alojado en el navegador (no PaymentSheet: requiere módulo nativo y build nueva), crea el PaymentIntent internamente y cumple el flujo del enunciado; (b) las pasarelas son proveedores intercambiables detrás de una interfaz; el backend informa cuáles están configuradas y la app ofrece un botón por cada una; (c) el pasajero simulado sigue decidiendo «tarjeta» o «efectivo»; la pasarela concreta la elige el conductor al cobrar y el backend deja en el viaje paymentMethod = 'mercadopago' o 'stripe' (escritura con firebase-admin; solo mientras el pago no esté aprobado); (d) el backend se niega a usar claves de producción de Stripe (sk_live_ o rk_live_): solo credenciales de prueba; (e) el webhook de Stripe es opcional: el camino principal es «Verificar pago» y la verificación automática al volver a la app.

3. BACKEND (backend/):
 a) Refactoriza con el mínimo cambio una interfaz de proveedor (crear cobro, consultar estado, validar notificación) con el registro de proveedores configurados. El código y las pruebas actuales de Mercado Pago deben seguir pasando sin cambios de comportamiento.
 b) Proveedor Stripe con fetch a la API oficial (lee la documentación oficial vigente con WebSearch/WebFetch y cita las URLs en docs/pagos-stripe-guia.md): crear sesión de Checkout (modo payment, una línea de producto con el nombre «Viaje UberClone» y el tripId corto, client_reference_id = tripId, metadata con tripId y uid y también en el payment_intent_data, success_url y cancel_url hacia una página estática de retorno del propio backend, clave de idempotencia derivada del tripId y del intento), con el monto TOMADO DEL DOCUMENTO del viaje en Firestore (nunca del cuerpo). Verifica en la documentación oficial si COP está soportado como moneda y cómo se expresa el monto (moneda de cero o dos decimales y mínimos de cobro) y encapsula la conversión en una función pura con pruebas. Si COP no fuera utilizable en una cuenta de prueba, soporta STRIPE_CURRENCY=usd con STRIPE_COP_PER_USD, documenta que es una simulación solo de prueba, no lo actives por defecto y que el resumen del viaje siga mostrando COP.
 c) Estado del pago (sync): consulta la sesión guardada con expansión del payment_intent; mapea pagado → approved; con last_payment_error y sin pago → rejected; sesión abierta sin error → pending; sesión expirada → rejected. Puede pasar de rejected a approved (reintento dentro de la misma página); nunca retrocede desde approved. Idempotente y en transacción; guarda paymentId y paymentStatus y deja status 'paid' cuando se aprueba.
 d) Rutas: GET /payments/providers (autenticada; devuelve solo booleanos de qué pasarelas están configuradas); POST /payments/checkout acepta {tripId, provider} y valida: ID token del conductor, propiedad del viaje, status 'completed', pago de tarjeta (no efectivo), no aprobado, proveedor configurado; POST /payments/sync usa el proveedor del viaje; POST /webhooks/stripe con cuerpo CRUDO y verificación de la firma Stripe-Signature con HMAC-SHA256 y tolerancia de 5 minutos si STRIPE_WEBHOOK_SECRET existe (NO confíes en el cuerpo: vuelve a consultar la sesión por id a la API); GET de la página estática de retorno que no incluya datos del viaje. Mismas defensas que Mercado Pago (límite de peticiones, tamaño de cuerpo, errores genéricos, sin registrar claves ni cabeceras).
 e) Variables por NOMBRE en backend/.env.example: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (opcional), STRIPE_CURRENCY (cop por defecto) y, solo si hiciera falta, STRIPE_COP_PER_USD. Que ninguna pasarela esté configurada no debe impedir arrancar el servidor (la app lo mostrará).
 f) «npm run doctor»: añade la comprobación de Stripe (variable presente, que la clave empiece por sk_test_ o rk_test_ y rechaza la de producción, una llamada de identidad a la API que imprima solo OK o el código HTTP, y si STRIPE_WEBHOOK_SECRET falta, un AVISO). Cada pasarela se reporta como configurada o no configurada; es ERROR solo si NINGUNA está configurada. Nunca imprimas secretos. Pruebas con fakes.
 g) Pruebas puras con fakes de fetch: creación de sesión (cuerpo codificado como formulario, monto y moneda), ownership y estados, mapeo de estados, idempotencia, firma válida e inválida con vectores generados en la prueba, rechazo de claves live, conversión de monto, y que Mercado Pago siga igual.

4. APP: cliente de pagos con la llamada a /payments/providers; en el resumen de un viaje con tarjeta, un botón «Cobrar con Mercado Pago» y/o «Cobrar con Stripe (tarjeta de prueba)» según las pasarelas configuradas; si no hay ninguna, mensaje claro «No hay una pasarela de pago configurada»; «Verificar pago» y la verificación al volver a primer plano usan el proveedor del viaje; respeta la regla de un solo mensaje del panel de cobro (H-4) y la clasificación de errores existente; textos nuevos en labels.js; Historial, detalle y saldo tratan 'stripe' igual que 'mercadopago' (tarjeta) y muestran el nombre de la pasarela; filtro «Tarjeta» incluye ambas; accesibilidad y 200 % verificados estáticamente. Mocks y mappers del pasajero no cambian.

5. REGLAS: no edites las reglas publicadas, pero añade 'stripe' a los valores permitidos de paymentMethod en el texto de docs/seguridad.md y en firestore.rules local, y anota que no hace falta republicar mientras sea el backend quien cambie el método.

6. DOCUMENTOS: docs/pagos-stripe-guia.md (paso a paso para PowerShell en Windows y para alguien que nunca usó Stripe: crear cuenta en modo prueba y el detalle del país, copiar la clave secreta de prueba SIN pegarla en chats, STRIPE_SECRET_KEY en backend/.env, npm run doctor, arrancar el backend, /health desde el celular, las dos vías de red ya documentadas, abrir el checkout, pagar con 4242 4242 4242 4242 (aprobada) y 4000 0000 0000 0002 (rechazada) con cualquier fecha futura y CVC, volver a la app, «Verificar pago», qué debe verse en la app y en Firestore, el webhook opcional con la CLI de Stripe o el túnel, tabla síntoma → causa → solución); actualiza docs/pagos-guia-rapida.md con la elección de pasarela; actualiza docs/checklist-manana-jueves.md (pasos 1 y 2 con Stripe, y que Mercado Pago queda como «No verificado en dispositivo: no se pudieron crear cuentas de prueba» con su rama de contingencia), docs/guion-video.md (escena del pago con Stripe), docs/omisiones-y-limites.md (sección de pagos con ambas pasarelas, sin afirmar lo no verificado), README, decisiones, progress (filas «pendiente de dispositivo») y backlog.

7. VERIFICACIÓN Y SALIDA: verifier distinto; design-auditor sobre los botones y el panel; todas las pruebas de pagos corriendo (Mercado Pago y Stripe) y check-constitution (12 errores es la línea base; no gastes tiempo en C23); grep de sk_live, access tokens y valores de .env (cero resultados) y confirmación de que .env, backend/.env y backend/secrets siguen ignorados. Salida final corta: (i) qué se hizo y qué no, (ii) qué verificaste en la documentación oficial de Stripe (moneda y decimales, mínimos, formato de firma), (iii) commits o snapshots, (iv) los comandos EXACTOS que Anderson debe ejecutar ahora (añadir STRIPE_SECRET_KEY a backend/.env sin pegar el valor en el chat, npm run doctor, npm start, comprobar /health desde el celular, reiniciar Metro con npx expo start -c) y la prueba de tarjeta en orden con qué debe ver, (v) hallazgos pendientes.
````
- Resumen de la respuesta (2–3 líneas): Stripe Checkout (modo de prueba) añadido como segunda pasarela tras una interfaz de proveedores, con Mercado Pago intacto; backend con fetch y crypto (sin dependencias), rutas de proveedores, checkout, sync y webhook, doctor con Stripe, y un botón por pasarela en la app. La auditoría de diseño estática halló un problema (el texto del panel nombraba Mercado Pago), corregido una vez; Diseño de T-147/T-150 sigue Pendiente por falta de capturas.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: backend/src/{providers/*,stripe.js,config.js,firestore.js,routes/*,app.js,server.js}, backend/scripts/doctor.mjs, backend/.env.example (solo nombres); src/services/trip/*, src/hooks/useChargeProviders.js, labels.js, TripSummaryScreen.js, historyQuery.js, earnings.js; firestore.rules local; docs (guías, checklist, guion, omisiones, README, decisiones D-116..D-120 Propuesta, progress, backlog, auditorías); pruebas nuevas. Sin commit: parche en la carpeta temporal de la sesión (stripe-r12.patch).
- Verificación: 26 archivos de prueba en verde; check-constitution 13 errores (C01 en .env ignorados + 11 C21 previos), 147 advertencias; sin dependencias nuevas; verifiers distintos por rebanada; sin pasar a «Validada»: falta evidencia del celular y la prueba HTTP real (npm install en backend/).
- Aprendizaje:

### Entrada #59
- Fecha: 2026-11-12
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Corregir la selección de pasarela (Stripe/Mercado Pago) y etiquetas de método de pago, más decisiones pendientes
- Prompt textual:
````
Corrección urgente de la selección de pasarela de pago + decisiones pendientes. El código se congela a las 14:00 de hoy 2026-11-12: trabaja rápido y enfocado, sin añadir nada fuera de este encargo. Proceso SDD con verifier distinto, pero compacto.

0. ANTES DE TODO: crea en docs/AI_LOG.md la entrada de ESTE prompt (siguiente número libre), fecha 2026-11-12, integrante Anderson Londoño Avendaño, herramienta Claude Code (modelo que veas), objetivo "Corregir la selección de pasarela (Stripe/Mercado Pago) y etiquetas de método de pago, más decisiones pendientes", con este prompt copiado tal cual. Completa archivos y verificación al terminar. Deja «Aprendizaje» vacío.

1. REGLAS (se mantienen): rama anderson/funcionalidad-sesiones; estilos cerrados (tokens, Card, Chip, Icon, Inter); sin Alert; SIN dependencias nuevas; sin tocar app.json, nativo ni las reglas publicadas; NO leas .env, backend/.env ni backend/secrets/*; sin push; commits locales o snapshot + parche; SHOW_DEV_TOOLS=false; inventario de testID/accessibility/labels antes y después; nada pasa a «Validada» sin evidencia de Anderson. NO elimines el código de Mercado Pago.

2. HALLAZGO (prueba en dispositivo de Anderson): su backend solo tiene Stripe configurado (Mercado Pago no). Aun así, la solicitud entrante muestra «Pago: Mercado Pago» y el resumen del viaje muestra el botón «Cobrar con Mercado Pago» (no el de Stripe); al pulsar el cobro falla. Los viajes simulados llegan solo con efectivo o con Mercado Pago. Causa probable (verifícala leyendo el código, no la des por cierta): el botón y las etiquetas se derivan de trip.paymentMethod / request.paymentMethod ('mercadopago') en vez de las pasarelas configuradas que informa GET /payments/providers, o hay un respaldo que muestra el botón de Mercado Pago cuando no se obtienen los proveedores, o el cliente envía provider = 'mercadopago'. Traza de punta a punta, estáticamente: botón del resumen → hook de pago → cliente de pagos → POST /payments/checkout (qué proveedor se envía) → backend (qué valida y qué responde) → actualización del viaje → panel de cobro. Informa qué encontraste.

3. CORRECCIONES (en este orden):
 a) Botones de cobro: salen SOLO de la lista de pasarelas configuradas que devuelve GET /payments/providers (un botón por pasarela configurada: «Cobrar con Stripe (tarjeta de prueba)» y/o «Cobrar con Mercado Pago»); el proveedor enviado a POST /payments/checkout es el del botón pulsado, nunca el derivado de trip.paymentMethod. Si la consulta de proveedores falla, muestra un mensaje claro con «Reintentar» (no un botón por defecto de ninguna pasarela); si ninguna está configurada, «No hay una pasarela de pago configurada». «Verificar pago» solo aparece cuando el viaje ya tiene una pasarela elegida y usa esa. Backend: POST /payments/checkout debe aceptar para un viaje con pago de tarjeta pendiente tanto el valor guardado 'mercadopago' (que significa «tarjeta, pasarela por definir») como 'stripe', y cambiar paymentMethod al proveedor elegido con firebase-admin; rechaza solo efectivo, ya aprobado y proveedor no configurado.
 b) Etiquetas: la solicitud (tarjeta y pantalla completa), el resumen, el historial, el detalle y el saldo muestran «Tarjeta» mientras no se haya elegido pasarela (paymentMethod 'mercadopago' sin paymentId, o equivalente); muestran el nombre de la pasarela («Stripe» o «Mercado Pago») solo cuando ya fue elegida y tiene paymentId. Función pura única con pruebas para la etiqueta y para la lista de botones (entradas: proveedores configurados, estado del viaje; salida: botones y mensaje).
 c) Datos simulados: el contrato del pasajero simulado emite el método como 'card' o 'cash' (mappers.js sigue siendo el único archivo que conoce la forma de la API); al crear el registro del viaje, 'card' se guarda como 'mercadopago' (valor que aceptan las reglas publicadas, que significa «tarjeta, pasarela por definir»); documenta esta convención en decisiones.md y docs/seguridad.md y revisa que no se rompa nada que dependa de request.paymentMethod (filtros del Historial, saldo, recibos, pruebas).
 d) Diagnóstico en el backend: un registro por petición con método, ruta, código de estado, proveedor y duración, SIN cuerpos, cabeceras, tokens ni correos; que el cliente de la app clasifique el error de «proveedor no configurado» con un mensaje propio.
 e) Pruebas puras para a, b y c, y repite las pruebas actuales de ambas pasarelas.

4. DECISIONES PENDIENTES (mézclalas con lo anterior): (1) restringe create a ['cash','mercadopago'] en firestore.rules local y en docs/seguridad.md (el backend cambia paymentMethod a 'stripe' con admin SDK); no hace falta republicar. (2) El doctor debe terminar con código distinto de 0 si detecta una clave live en cualquier pasarela, aunque otra esté usable; ajusta la prueba. (3) D-116 a D-120 quedan Vigente (ratificadas por Anderson). (4) El doble cobro de prueba al cambiar de pasarela, el nombre de la pasarela en la fila del Historial y las reglas sugeridas para la constitución: anótalos en docs/omisiones-y-limites.md como límites conocidos, sin implementarlos. (5) Un verifier distinto revisa en un solo pase: las correcciones de este encargo, el cambio H1 del texto «El pago se cobra con tarjeta.», el cambio del doctor y T-152 a T-155; corrige solo lo que él rechace y una vez.

5. SALIDA FINAL (10 a 15 líneas): (i) causa real encontrada y qué se corrigió, (ii) qué cambió en la app y qué en el backend (el backend hay que reiniciarlo y la app recargarla), (iii) commits o snapshot, (iv) los pasos exactos para que Anderson repita la prueba de tarjeta con Stripe (4242 4242 4242 4242 y 4000 0000 0000 0002) y qué debe ver en cada uno, incluida la línea de registro que debe aparecer en la terminal del backend, (v) pendientes.
````
- Resumen de la respuesta (2–3 líneas): Causa real: el botón de cobro caía al método guardado 'mercadopago' cuando fallaba la consulta de proveedores (el hook fallaba en silencio) y el contrato simulado emitía 'mercadopago', así que la app nombraba una pasarela antes de elegirla. Ahora los botones salen solo de GET /payments/providers (con «Reintentar» o «No hay una pasarela de pago configurada»), el proveedor es el del botón, las etiquetas dicen «Tarjeta» hasta que hay paymentId, el contrato emite card|cash, el backend registra una línea por petición y el doctor falla ante una clave live.
- Usado / modificado / descartado: (pendiente: Anderson)
- Archivos y commit: nuevos paymentGateway.js, hooks/useChargeProviders.js, paymentGateway.test.mjs, paymentConvention.test.mjs; modificados chargePanel, TripSummaryScreen, IncomingRequestCard, TripRequestScreen, tripDetailView, passengerApi (contract, mappers), tripRecord, paymentsClient, labels, backend (middleware, app, server, routes/payments, firestore, providers/registry, scripts/doctor.mjs), firestore.rules (local, create solo cash y mercadopago), decisiones (D-116..D-120 Vigente, D-121), seguridad, omisiones-y-limites y pruebas asociadas. Sin commit ni parche: ambos comandos fueron denegados; todo queda en el árbol de trabajo para que Anderson haga el commit.
- Verificación: los 28 archivos de scripts/tests pasan; check-constitution igual que la línea base (13 errores / 147 avisos); verifier distinto (un pase): sin rechazos funcionales y 3 menores (dos de documentación ya corregidos; texto heredado en labels sin efecto). Todo «Implementada / No verificado en dispositivo»; el Diseño de T-147/T-150 sigue Pendiente. Falta la prueba de Anderson con Stripe en el celular.
- Aprendizaje:

### Entrada #60
- Fecha: 2026-11-12
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Perfil editable acotado (nombre, celular, color, correo de cobros) y etiqueta neutra «Correo de cobros» (D-122, D-123).
- Prompt textual:
````
PROMPT — Perfil editable acotado + "Correo de cobros" neutro

0. ANTES DE TODO: crea la entrada en docs/AI_LOG.md copiando ESTE PROMPT COMPLETO,
   textual, como "Prompt". Deja "Aprendizaje" vacío (lo escribe Anderson). Completa
   "Archivos y commit" con los archivos que toques; el hash se llena al final.

CONTEXTO
Flujo de pagos con Stripe validado en dispositivo. Nota: ya no hay "congelamiento de
código"; seguimos implementando, pero con el mismo rigor SDD y sin ampliar alcance
más allá de lo que pide este prompt.

REGLAS DURAS (no negociables)
- No leas ni imprimas .env, backend/.env ni backend/secrets/*. Ningún token/clave en
  chat, código, docs ni bitácora.
- Sin dependencias nuevas, sin tocar app.json ni código nativo, sin Alert, sin push,
  sin commit (Anderson commitea). SHOW_DEV_TOOLS debe seguir en false.
- firestore.rules sigue fuera de git (D-80). Si hay que cambiar reglas: deja el texto
  completo en docs/seguridad.md y avisa a Anderson para que lo publique a mano.
- Roles distintos: spec-author → planner → implementer → verifier (distinto del
  implementer) → design-auditor para lo visual. El implementer no aprueba. Si el
  verifier rechaza, DETENTE y repórtalo.
- Los verifiers no editan docs.

DECISIONES YA TOMADAS (regístralas como D-122 y D-123 en docs/decisiones.md, Vigente)
D-122 Perfil editable acotado:
  - EDITABLES: nombre, celular, color del vehículo, correo de cobros.
  - SOLO LECTURA: placa, marca y modelo, año, categoría, estado de la cuenta, y los
    documentos. Texto visible: "Para cambiar estos datos contacta a soporte."
  - Motivo: placa/categoría/documentos fueron la base de la aprobación manual y la
    categoría afecta la tarifa; cambiarlos exigiría re-aprobación (fuera de alcance).
D-123 "Correo de cobros" neutro:
  - Se cambia SOLO la etiqueta y el texto de ayuda en registro, perfil y Configuración.
    Etiqueta: "Correo de cobros". Ayuda: "Correo asociado a tu cuenta de la pasarela
    de pagos. Solo informativo en esta versión."
  - NO se renombra el campo de Firestore (evita migración y cambios en reglas).
  - No pongas "Stripe" en la etiqueta: Mercado Pago sigue en el código y el correo no
    se usa en el checkout de Stripe.
  - Revisa TODAS las apariciones de "Mercado Pago" en textos visibles al conductor y
    cámbialas solo si hablan del correo de cobros. No toques las de la pasarela real.

TAREAS
A. SPEC corta (spec-author): amplía specs/002-funcionalidad-final/spec.md con RF de
   edición de perfil (criterios: validación igual que en registro, guardado, error de
   red sin perder lo escrito, estado de carga, accesibilidad).
B. PLAN (planner): tareas pequeñas con IDs T-nnn.
C. IMPLEMENTACIÓN
   1. Pantalla Perfil: botón "Editar" (o edición por campo). Un solo modo a la vez.
      Reutiliza los validadores del registro (nombre, celular, color, correo). Botón
      Guardar deshabilitado si no hay cambios o hay errores; botón Cancelar que
      descarta. Mensajes en línea, sin Alert. Estados: guardando / guardado / error.
      Si falla la red, conserva lo escrito y ofrece Reintentar.
   2. Persistencia: updateDoc en drivers/{uid} SOLO con los 4 campos editables. Nunca
      envíes accountStatus, categoría, placa ni documentos.
   3. Color del vehículo: al cambiarlo, el marcador del auto en el mapa debe usar el
      nuevo color (verifica el token de color y el caso "Blanco").
   4. Etiquetas D-123 en registro (pestaña de datos), Perfil y donde aparezca.
      El correo se sigue mostrando enmascarado en modo lectura; en edición muestra el
      valor completo solo al propio usuario.
   5. Sesiones: al cambiar de cuenta (A/B) el formulario no debe mostrar datos de la
      otra cuenta; limpia el estado local en resetSession.
D. SEGURIDAD — verifica y reporta (no asumas):
   - Con el texto de reglas publicado (docs/seguridad.md), ¿puede el dueño actualizar
     drivers/{uid}? ¿Puede cambiarse accountStatus desde el cliente? Si SÍ puede,
     ese es un hallazgo crítico: propón la regla que impida cambiar accountStatus y los
     campos solo-lectura (request.resource.data.diff(resource.data).affectedKeys()
     .hasOnly([...4 campos editables...])), pruébala razonando casos, déjala en
     docs/seguridad.md y dime qué publicar. NO publiques nada tú.
   - Confirma que los validadores de reglas aceptan el correo y celular editados.
E. VERIFICACIÓN (verifier distinto): checklist por criterio de la spec, check-constitution
   (compara con la línea base 12–13 errores; no la empeores), lint/test existentes,
   grep de "Mercado Pago" visible, grep de secretos, SHOW_DEV_TOOLS=false.
F. DOCS (solo implementer/orquestador, no verifier): progress.md y backlog.md
   (estado "Implementada, pendiente de dispositivo", no "Validada"), omisiones-y-limites.md
   (campos solo lectura y por qué; correo de cobros informativo), AI_LOG.md.

ENTREGA
Informe corto: archivos cambiados, decisiones, resultado del verifier, hallazgo de
seguridad (sí/no) y el texto de reglas a publicar si aplica, y checklist de
dispositivo para Anderson (editar nombre/celular/color/correo; validaciones; sin red;
cambio de cuenta A→B sin mezcla; color nuevo en el marcador; campos bloqueados no
editables). Sin recap de pasos.
````
- Resumen de la respuesta (2–3 líneas): Perfil editable acotado (nombre, celular, color, correo de cobros) con validadores del registro, guardado con updateDoc de 4 campos, color al marcador del mapa, textos «Correo de cobros» (D-122, D-123) y regla `validProfileEdit()` propuesta en `docs/seguridad.md` sin publicar. Sesión previa cortada por créditos; se retomó y se cerró lo pendiente.
- Usado / modificado / descartado: Usado lo ya implementado (T-157 a T-164). Modificado: `labels.js` (paymentTransfer neutro) y un comentario de `profileEdit.js` (C26). Descartado: renombrar el campo `mercadoPagoEmail` en Firestore.
- Archivos y commit: `src/utils/profileEdit.js`, `profileEditFlow.js`, `src/services/profileUpdater.js`, `driverRepository.js`, `src/hooks/useProfileEdit.js`, `ProfileScreen.js`, `TextField.js`, `DocumentsScreen.js`, `HomeScreen.js`, `labels.js`, 4 pruebas en `scripts/tests/`, y docs (spec, plan, decisiones, requisitos, backlog, seguridad, progress, omisiones). Sin commit; lo hace Anderson.
- Verificación (la completa Anderson): 
- Aprendizaje (lo escribe Anderson):

### Entrada #61
- Fecha: 2026-11-12
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Auditoría del enunciado, propina y calificación simuladas (D-124), direcciones reales con Nominatim (D-125), README y `.env.example`.
- Prompt textual:
````
PROMPT — Auditoría del enunciado + calificación y propina simuladas + direcciones reales + README

MODO DE TRABAJO (misma metodología que el pulido de diseño)
- Sin spec, sin plan, sin tareas T-nnn nuevas, sin tocar backlog.md. Defines tú las
  tareas internas, las implementas, las verificas y las auditas.
- Usa los agentes: implementer (implementa), verifier DISTINTO del implementer
  (criterios y regresiones) y design-auditor (lo visual del detalle y el Historial).
  El implementer no aprueba su propio trabajo. Si el verifier o el auditor RECHAZA,
  DETENTE y repórtalo. Los verifiers no editan docs.
- Usa las skills de diseño disponibles para la parte visual.
- Paso 0 ÚNICO: al terminar, crea UNA entrada en docs/AI_LOG.md copiando ESTE PROMPT
  textual. Deja "Aprendizaje" vacío (lo escribe Anderson) y llena "Archivos y commit"
  con los archivos tocados (el hash lo pone Anderson después de commitear).

REGLAS DURAS
- No leas ni imprimas .env, backend/.env ni backend/secrets/*. Cero secretos en chat,
  código, docs o README.
- Sin dependencias nuevas, sin tocar app.json ni código nativo, sin Alert, sin push, sin
  commit (Anderson commitea). SHOW_DEV_TOOLS debe seguir en false. firestore.rules sigue
  fuera de git (D-80): si hay que cambiar reglas, deja el texto completo en
  docs/seguridad.md y dime qué publicar; NO lo publiques tú.
- Tokens de src/theme/tokens.js, iconos con src/components/Icon.js, fuente Inter, áreas
  táctiles ≥ 48 dp, accessibilityLabel en lo nuevo, que no se rompa con fuente al 200 %.
- No cambies sesiones/resetSession, estados de cuenta ni decisiones D-93…D-123 salvo lo
  que pidan explícitamente las tareas de abajo.

TAREA 0 — AUDITORÍA DE CUMPLIMIENTO (solo lectura, hazla PRIMERO)
Lee docs/enunciado-taller.pdf (si no existe, dímelo y sigue con docs/requisitos.md).
Construye la tabla requisito → estado → evidencia (archivo:línea o test) con estados
Cumplido / Parcial / Omitido (documentado) / No encontrado. Cubre: registro (campos y
validaciones de las 3 pestañas, Enviar solo con las tres completas, errores bajo el
campo, sin Alert), estados de cuenta, pantallas 1–7, los 7 estados del viaje con sus
nombres exactos en status, hooks obligatorios y AsyncStorage solo preferencias/sesión,
pasarela (flujo de 6 pasos, seguridad, .env.example sin valores, efectivo y saldo),
tarifa (calculateFare pura, 8,5 km y 22 min = 19.200 / 26.900, commissionRate,
pricing.js), Ganancias (6 métricas hoy/semana/mes), Historial (FlatList, filtros,
paginación, estado vacío, detalle con ruta, duración, distancia, comisión, propina y
calificación), modelo de datos de trips (nombres del PDF vs reales) y la sección 7.
Comprueba también: capacidad de pasajeros (XL ≥ 6), foto del vehículo, género,
revisión técnico-mecánica según año del vehículo, checkbox de términos con la comisión
visible, último estado de disponibilidad en AsyncStorage y .env.example en la raíz.
Cuenta los marcadores "// AI-assisted: see docs/AI_LOG.md #N" y las entradas del
AI_LOG con campos vacíos. "Omitido (documentado)" solo si está en
docs/omisiones-y-limites.md. Guarda la tabla en docs/auditoria-enunciado-2026-11-12.md.
Esta tarea no cambia código. Sus hallazgos que no estén cubiertos por las tareas
siguientes se listan en el informe final, NO los implementes.

TAREA A — CALIFICACIÓN Y PROPINA ALEATORIAS EN LAS SOLICITUDES SIMULADAS
Contrato simulado del pasajero (el único archivo que conoce la forma de la API es
mappers.js; respeta eso):
1. Cada solicitud simulada genera, por viaje, una propina y una calificación finales:
   - tip: entero en pesos, múltiplo de 500, entre 0 y 5.000; probabilidad ~40 % de que
     sea > 0 y el resto 0.
   - rating: entero 1–5 con sesgo realista (mayoría 4–5; 1–2 poco frecuentes).
   - Inyecta el generador aleatorio como dependencia (o semilla) para que los tests
     sean deterministas.
2. Se ven al completar el viaje (como si el pasajero calificara y diera propina al
   terminar), no antes. Viajes cancelados: rating = null, tip = 0.
3. Persistencia: el registro del viaje guarda tip y rating con los nombres del PDF.
4. Reglas de dinero (decisión D-124, regístrala Vigente en docs/decisiones.md):
   - La comisión se calcula solo sobre la tarifa (calculateFare ya recibe tip; revisa
     que lo respete y que 8,5 km / 22 min sin propina siga dando 19.200 y 26.900).
   - driverEarnings = tarifa − comisión + propina (la propina va completa al conductor).
   - Cobro con tarjeta: el monto cobrado = tarifa + propina. REVISA el backend
     (backend/src/routes/payments.js y los providers): el monto debe seguir saliendo del
     documento del viaje en Firestore, nunca del body, y debe incluir la propina de
     forma consistente. Si hoy cobra solo la tarifa, corrígelo con tests. Efectivo: el
     conductor recibe tarifa + propina en mano y se le descuenta solo la comisión del
     saldo.
   - Verifica que Ganancias (Propinas), Saldo e Historial sigan cuadrando con esto.
5. UI:
   - Resumen del viaje: muestra Propina (si > 0) y el total cobrado.
   - Detalle del viaje: fila "Calificación" con estrellas (Icon star/star-outline con
     tokens) y accessibilityLabel "Calificación N de 5"; si rating es null, "Sin
     calificación". La propina sigue como "Sin propina" si es 0.
   - Opcional, solo si es barato y limpio: estrellitas pequeñas en la fila del Historial.
6. SEGURIDAD — verifica, no asumas: lee en docs/seguridad.md el texto de reglas de
   validTrip(). Si valida con una lista cerrada de claves (hasOnly) o tipos, y rating
   no está permitido, el guardado de TODOS los viajes fallaría. Entonces: deja en
   docs/seguridad.md el texto completo y actualizado (rating: null o entero 1–5; tip:
   entero ≥ 0), márcalo "BLOQUEANTE: publicar antes de probar" en tu informe y dime
   exactamente qué pegar. Verifica también el mismo caso para el backend (admin SDK no
   se ve afectado por reglas).
7. Tests unitarios nuevos en scripts/tests: generador determinista, rango y múltiplos
   de la propina, distribución de rating en [1,5], cancelado sin rating, driverEarnings
   con propina, monto cobrado = tarifa + propina en backend, y el caso legacy (viajes
   guardados sin rating/tip siguen mostrándose bien).

TAREA B — DIRECCIONES REALES CON NOMINATIM (reverse geocoding)
Hoy origen y destino dicen "Calle cercana (simulada)". Sustitúyelo por una dirección
corta real:
1. Cliente: función en src/services/ (ej. geocoding/reverseGeocode.js) con fetch a
   Nominatim (endpoint reverse, format=jsonv2, accept-language=es, zoom 18).
   Reglas de la política de uso: máximo 1 petición por segundo (cola serializada con
   ≥ 1,1 s entre llamadas), cabecera User-Agent que identifique la app
   ("UberCloneConductor-ProyectoDeClase/1.0"), caché en memoria por coordenada
   redondeada (~4 decimales) para no repetir, timeout corto (≈ 4 s) y sin reintentos
   agresivos.
2. Formato de la dirección: corto y legible a partir de los campos del resultado
   (calle + número si existe, y barrio/sector si existe; ej. "Calle 10 #20-30,
   Laureles"). Sin direcciones larguísimas.
3. NO bloquea nada: se resuelve en segundo plano al crear la solicitud; la tarjeta
   muestra "Buscando dirección…" y luego la dirección; si falla (sin red, timeout,
   429), cae a la etiqueta actual "Calle cercana (simulada)". Reintenta una sola vez
   al finalizar el viaje si aún falta, con timeout. La dirección resuelta se guarda en
   origin.address y destination.address del viaje; el Historial y el detalle SOLO leen
   lo guardado (nunca llaman a Nominatim al renderizar). Los viajes viejos conservan su
   texto actual.
4. Tests: formateo con respuestas de ejemplo, caché, cola con espaciado (con reloj
   simulado), fallback ante error, y que el cliente respete el límite de 1 req/s.
5. Privacidad: las coordenadas simuladas están cerca del teléfono de prueba; documenta
   en docs/seguridad.md y en el README que se envían a un servicio público (Nominatim)
   y que solo son coordenadas de prueba. Decisión D-125 (Vigente).

TAREA C — README (actualizar al estado real final)
Reescribe/actualiza README.md, sin secretos ni datos personales reales:
1. Qué es la app y capturas (solo si ya existen archivos en docs/; no inventes rutas).
2. Stack y arquitectura breve (app Expo, Firestore, Auth, backend Express, Stripe).
3. Instalación paso a paso en Windows/PowerShell: requisitos (Node ≥ 20.12, Android),
   npm install (raíz y backend), crear los .env a partir de .env.example (raíz y
   backend; SOLO los NOMBRES de variables y para qué sirve cada una), dev build,
   `npx expo start -c`, cómo levantar backend + cloudflared y cómo apuntar
   EXPO_PUBLIC_BACKEND_URL (cambia en cada ejecución), `npm run doctor`.
4. Cómo probar: aprobar una cuenta (campo accountStatus en Firestore), tarjetas de
   prueba de Stripe (4242… aprobada, 4000 0000 0000 0002 rechazada), pago en efectivo,
   cuentas A/B.
5. Seguridad: llaves solo en backend/.env, solo credenciales de prueba, .env ignorado,
   reglas de Firestore (referencia a docs/seguridad.md, se publican a mano), subida de
   imágenes con Cloudinary sin firmar y qué implica, Nominatim.
6. Tabla "Cumplimiento y desviaciones respecto al enunciado" tomada de la auditoría:
   qué se cumple, qué se desvió y por qué (MapLibre/OpenFreeMap/OSRM en vez de Google
   Directions/Distance Matrix/react-native-maps; Stripe Checkout Sessions en vez de
   PaymentIntent+PaymentSheet; Mercado Pago implementado pero NO verificado en
   dispositivo por no poder crear cuentas de prueba; FCM, idioma es/en y split
   payments omitidos, con motivo). Honesto, sin maquillar.
7. Sección "Uso de IA" con enlace a docs/AI_LOG.md y a la versión PDF (nombre del
   archivo que Anderson generará), indicando que se usaron agentes de Claude Code con
   roles separados (spec-author, planner, implementer, verifier, design-auditor).
8. Estructura de carpetas, scripts de pruebas (cómo correrlos) y enlaces a docs/.
Mantén el tono claro y corto; nada de promesas que el código no cumpla.

TAREA D — MARCADORES AI-assisted (solo si el mapeo es claro, con tope de esfuerzo)
El PDF pide en el código un comentario en inglés "// AI-assisted: see docs/AI_LOG.md
#N". Usando el campo "Archivos y commit" de cada entrada del AI_LOG, añade el
marcador (una línea de comentario, sin cambiar lógica) en los archivos que esa entrada
lista y que sean de código sustancial. No inventes asociaciones: si un archivo no
aparece en ninguna entrada, NO le pongas marcador y listalo en el informe para que
Anderson decida. Tras añadirlos, los tests deben pasar igual.

VERIFICACIÓN (verifier distinto, obligatorio)
- Tests de scripts/tests: todos pasan; los nuevos cubren lo pedido. check-constitution
  sin empeorar la línea base (12–13 errores conocidos). grep: Alert, colores/tamaños
  literales nuevos, SHOW_DEV_TOOLS=false, sin secretos (sk_live, sk_test, tokens),
  git status sin .env/secrets/firestore.rules, README sin valores de variables.
- Revisa a mano la coherencia de dinero con un ejemplo: viaje XL 8,5 km / 22 min con
  propina 2.000 → tarifa 26.900, comisión 5.380, ganancia 21.520 + 2.000 = 23.520,
  cobro con tarjeta 28.900; efectivo: saldo −5.380.
- design-auditor: detalle del viaje (fila de estrellas, contraste, 200 % de fuente),
  tarjeta de solicitud con "Buscando dirección…", Historial con direcciones largas.
  Lo no comprobable sin dispositivo: "pendiente de dispositivo".

DOCS: decisiones.md (D-124, D-125), progress.md (estado "Implementada, pendiente de
dispositivo", nunca "Validada"), omisiones-y-limites.md (límites de Nominatim, valores
aleatorios simulados, FCM e idioma siguen omitidos), seguridad.md (reglas y
privacidad), la entrada de AI_LOG, y actualiza docs/auditoria-enunciado-2026-11-12.md
con el estado final tras A–D.

ENTREGA
Informe corto: (1) resumen de la auditoría con huecos ordenados por impacto y esfuerzo,
SIN implementarlos; (2) decisiones de A, B, C, D; (3) si hay texto de reglas que
publicar (BLOQUEANTE o no); (4) archivos tocados; (5) resultado del verifier y del
auditor; (6) checklist de dispositivo para Anderson: viaje con tarjeta con propina
(cobro = tarifa + propina en Stripe), viaje en efectivo con propina (saldo), detalle
con estrellas y "Sin calificación" en un viaje viejo, dirección real en solicitud,
resumen e Historial, comportamiento sin red (cae a "Calle cercana (simulada)"), Ganancias
con propinas, cuenta A→B sin mezcla. Sin recapitular pasos.
````
- Resumen de la respuesta (2–3 líneas): Auditoría del enunciado con brechas ordenadas; propina y calificación simuladas con cobro `fare + tip` desde el documento del viaje y regla `validTrip()` BLOQUEANTE en `docs/seguridad.md`; direcciones con Nominatim (1 req/s, caché, respaldo «Calle cercana (simulada)»); README reescrito y `.env.example` con `EXPO_PUBLIC_BACKEND_URL`. Verifier: aprobada en lo estático; auditor de diseño: aprobado con observaciones.
- Usado / modificado / descartado: Usado el patrón de la API simulada y de `tripRecord`. Modificado el cobro del backend (monto desde Firestore). Descartado: comisión sobre la propina y Google Geocoding.
- Archivos y commit: `backend/src/chargeAmount.js`, `backend/src/routes/payments.js`, `backend/src/providers/stripe.js`, `backend/src/providers/mercadopago.js`, `backend/src/mercadopago.js`, `src/services/passengerApi/` (`simulatedFeedback.js`, `mockPassengerApi.js`, `mappers.js`, `contract.js`), `src/services/trip/tripRecord.js`, `tripDetailView.js`, `src/services/geocoding/`, `src/config/geocoding.js`, `src/hooks/useRequestAddresses.js`, `useTripRequests.js`, `src/context/TripContext.js`, `TripDetailScreen.js`, `TripActiveScreen.js`, `TripRequestScreen.js`, `TripSummaryScreen.js`, `src/constants/labels.js`, `src/utils/earnings.js`, pruebas en `scripts/tests/` (`tipFeedback`, `reverseGeocode`, `tripDetailView`), `.env.example`, `README.md`, y docs (`decisiones`, `progress`, `omisiones-y-limites`, `seguridad`, `auditoria-enunciado-2026-11-12`, `diseno/auditoria-propina-direcciones-2026-11-12`). Sin commit; lo hace Anderson.
- Verificación (la completa Anderson):
- Aprendizaje (lo escribe Anderson):

### Entrada #62
- Fecha: 2026-11-16
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: FCM (notificaciones push) — Fase 1: investigación, spec y plan, sin código.
- Prompt textual:
````
PROMPT — FCM (notificaciones push) — FASE 1: investigación, spec y plan (SIN CÓDIGO)

0. ANTES DE TODO: crea la entrada en docs/AI_LOG.md copiando ESTE PROMPT COMPLETO,
   textual, como "Prompt". Deja "Aprendizaje" vacío (lo escribe Anderson). Completa
   "Archivos y commit" con los archivos que toques; el hash lo pone Anderson.

METODOLOGÍA (SDD, igual que siempre)
- Roles separados: spec-author escribe la spec; planner escribe el plan y las tareas;
  un REVISOR distinto contrasta spec y plan contra el código y el PDF. Quien construye
  no aprueba. Si el revisor rechaza algo, DETENTE y repórtalo.
- Esta fase NO escribe código ni toca dependencias, app.json, package.json,
  firestore.rules ni backend. Solo produce documentos. Al terminar, DETENTE y espera la
  aprobación de Anderson para la Fase 2.

REGLAS DURAS
- No leas ni imprimas .env, backend/.env, backend/secrets/* ni google-services.json.
  Cero secretos en chat, código, docs y AI_LOG.
- Sin commit ni push (Anderson commitea). SHOW_DEV_TOOLS debe seguir en false.
  firestore.rules sigue fuera de git: cualquier cambio de reglas se deja como texto en
  docs/seguridad.md para que Anderson lo publique a mano. Sin Alert. Textos visibles
  en src/constants/labels.js (se tradurá a inglés en un lote futuro).
- Tokens de diseño, accesibilidad (áreas ≥ 48 dp, accessibilityLabel) y las
  decisiones D-93…D-125 siguen vigentes salvo lo que esta funcionalidad requiera
  cambiar, y eso debe quedar explícito en la spec.

CONTEXTO
El taller (docs/enunciado-taller.pdf, sección 7) marca como OBLIGATORIA a Firebase
Cloud Messaging (@react-native-firebase/messaging) para "notificar nuevas solicitudes
con la app en segundo plano". Hoy está omitida (R-113 en
docs/plan-cierre-entrega-2026-11-16.md, brecha G-04). El pasajero es simulado dentro
de la app (mockPassengerApi), así que con la app en segundo plano ese código no corre:
el disparador de la notificación debe vivir en el backend. La app es Expo SDK 57
(RN 0.86), con build local (npx expo run:android) y carpeta android/ generada e
ignorada. El backend Express ya usa firebase-admin (backend/src/admin.js). La sesión
la maneja useSessionReset/resetSession (D-93…D-106), con cambio de cuenta A/B en el
mismo teléfono.

DECISIONES DE DISEÑO YA TOMADAS (valídalas contra el código y refínalas; si alguna es
inviable, propón la alternativa con evidencia)
1. Alcance: SOLO Android. iOS queda fuera (exige cuenta de Apple de pago y APNs);
   se documenta en omisiones-y-limites.md.
2. Cliente: preferir @react-native-firebase/app + messaging (es lo que nombra el PDF).
   TAREA 1 obligatoria: investigar en línea (WebSearch/WebFetch a documentación
   oficial y repos) la compatibilidad ACTUAL de RN Firebase con Expo SDK 57 y
   React Native 0.86 (nueva arquitectura, config plugins, versión mínima de
   firebase-admin, requisitos de google-services.json). Cita 2–3 fuentes. Plan B si
   hay incompatibilidad: expo-notifications con getDevicePushTokenAsync (token FCM
   nativo) enviado igual con firebase-admin. Toda la funcionalidad se escribe detrás
   de una interfaz propia (src/services/notifications/: registrar/dar de baja token,
   escuchar mensaje en primer plano, escuchar apertura desde notificación, permiso),
   para cambiar de librería sin tocar pantallas.
3. Disparador: endpoint nuevo en el backend, autenticado con el ID token de Firebase,
   que envía una notificación SOLO a los dispositivos registrados del propio uid. El
   contenido lo arma el servidor con una plantilla fija de solicitud simulada
   (categoría, distancia, tarifa estimada y requestId, expiresAt); el body del
   cliente solo puede indicar un retraso acotado (p. ej. 0–60 s). Limitado por
   usuario (rate limit), sin aceptar tokens ni textos arbitrarios, errores genéricos,
   log sin secretos. En la app, una sección "Notificaciones" en Configuración con un
   interruptor y un botón "Enviar solicitud de prueba" (para que la profesora pueda
   comprobarlo: lo envías, bloqueas el teléfono o sales de la app y llega la
   notificación).
4. Tokens: el backend los guarda (admin SDK) en drivers/{uid}/fcmTokens/{id} con
   token, plataforma y updatedAt, mediante un endpoint autenticado de registro. Así NO
   se necesitan reglas nuevas para el cliente. Maneja onTokenRefresh, varios
   dispositivos por conductor y limpieza de tokens inválidos cuando FCM responde
   registration-token-not-registered.
5. Sesiones y multicuenta: resetSession agrega un paso "dar de baja el token" (mejor
   esfuerzo, con timeout corto, sin bloquear el cierre de sesión) y borra el token local,
   para que las notificaciones de la cuenta A no lleguen a la cuenta B en el mismo
   teléfono. Al iniciar sesión se registra el token del uid actual. Describe el orden
   exacto dentro de la secuencia existente sin romper D-93…D-106.
6. Mensaje FCM: notification + data, prioridad alta en Android, ttl corto
   (≈ 30–60 s, porque la solicitud vence), canal Android "solicitudes" con
   importancia alta, título/cuerpo mínimos ("Nueva solicitud de viaje",
   "Económico · $19.200 · 3,2 km"), sin datos personales innecesarios.
7. Permiso POST_NOTIFICATIONS (Android 13+): se pide en contexto (al activar el
   interruptor o al ponerse Disponible por primera vez) con una explicación previa;
   maneja "denegado" con un enlace a los ajustes del sistema. La preferencia
   notificationsEnabled se guarda en AsyncStorage (preferencia, no dato sensible; esto
   además cubre el requisito de AsyncStorage para preferencias).
8. Comportamiento del cliente: en primer plano, el mensaje entra al mismo flujo de
   solicitud existente sin duplicar (dedupe por requestId); en segundo plano o cerrada,
   el toque en la notificación abre la pantalla de solicitud mediante una "intención
   pendiente" en memoria que consume el gate de Root DESPUÉS de resolver sesión y
   estado de cuenta (si no hay sesión, no está aprobada o hay un viaje en curso, se
   ignora de forma segura). Si ya pasó expiresAt, muestra "La solicitud expiró" y no
   permite aceptar. Respeta el temporizador de 15 s.
9. Elegibilidad: investiga cómo se publica hoy la disponibilidad al salir de la app
   (si el seguimiento se detiene y se marca no disponible) y propón la semántica que
   permita la demostración con la app en segundo plano sin contradecir el PDF; no se
   implementa ubicación en segundo plano (queda como límite documentado). Para el
   endpoint de prueba, exige cuenta aprobada.
10. Seguridad: la service account ya existe en backend/secrets (no se lee); sin
    llaves nuevas en la app; google-services.json queda en .gitignore y el README debe
    explicar cómo conseguirlo (consola de Firebase → app Android con el paquete de
    app.json → descargar). Verifica qué cambia en la política de dependencias
    (scripts/dependencies.json: pasar a "allowed" las necesarias) y en app.json
    (plugins y android.googleServicesFile). Esta funcionalidad SÍ está autorizada a
    tocar app.json y agregar dependencias nativas, pero solo en la Fase 2.

ENTREGABLES DE LA FASE 1 (solo documentos)
A. Investigación (Tarea 1): conclusión sobre RN Firebase vs expo-notifications con
   fuentes, versiones exactas recomendadas, riesgos de compatibilidad y criterio de
   decisión; documento docs/fcm/investigacion.md.
B. Spec: specs/003-notificaciones-fcm/spec.md (sigue el formato de specs/002):
   requisitos funcionales y no funcionales numerados, criterios de aceptación CA-nnn
   verificables, casos límite (token vencido, permiso denegado, cambio de cuenta,
   solicitud expirada, app cerrada, sin red, varios dispositivos, notificación
   duplicada, tap con sesión caducada, doble toque), seguridad, accesibilidad, y
   fuera de alcance (iOS, ubicación en segundo plano, split). Incluye la trazabilidad
   al PDF (sección 7 y R-113).
C. Plan: specs/003-notificaciones-fcm/plan.md con tareas T-nnn (continúa la
   numeración vigente), orden y dependencias, división en rebanadas ejecutables:
   S1 spike nativo y config (dependencias, app.json, google-services.json, build,
   obtener y mostrar el token en un log seguro) → S2 backend (endpoints, registro de
   tokens, envío, rate limit, tests) → S3 cliente (servicio, permiso, canal,
   registro/baja, primer plano, apertura, intención pendiente) → S4 sesiones y
   preferencias → S5 UI de Configuración → S6 pruebas, docs y checklist. Para cada
   rebanada: archivos a tocar, pruebas automáticas (lógica pura con inyección de
   dependencias: armado del payload, registro de tokens con admin falso, elegibilidad,
   expiración, dedupe, resolución de la intención de navegación, orden de baja en
   resetSession, límites del endpoint) y verificación de dispositivo para Anderson.
   Marca los puntos de parada obligatorios donde Anderson debe recompilar e
   instalar (npx expo run:android) y probar antes de seguir.
D. Registro de riesgos y plan B con criterio de activación, y líneas de corte (qué se
   puede recortar sin dejar de cumplir la sección 7).
E. Pasos manuales de Anderson, listos para seguir: crear/registrar la app Android en
   la consola de Firebase con el paquete correcto, descargar google-services.json y
   dónde ponerlo, confirmar que la API de Cloud Messaging (V1) está habilitada, qué
   probar al recompilar, y cómo comprobar que llegó la notificación.
F. Decisiones propuestas D-126… (Propuesta, no Vigente hasta que Anderson apruebe) en
   docs/decisiones.md, y las dependencias a mover en scripts/dependencies.json
   descritas (NO modificarlas aún).
G. Estimación de horas por rebanada y total.

REVISIÓN (revisor distinto)
Verifica que la spec cubra todo lo que dice el PDF para FCM y R-113, que el plan sea
coherente con la arquitectura real (nombres de archivos y funciones que existen, p. ej.
resetSession, gate de Root, backend/src/admin.js, middleware de auth y rate limit),
que ninguna tarea contradiga D-93…D-125 sin declararlo, y que no haya secretos. Haz
una muestra de 20 referencias archivo:línea. Corrige lo que no cuadre.

ENTREGA
Informe corto: conclusión de la investigación (RN Firebase vs plan B), las 5 decisiones
más importantes que necesitas confirmar, el plan por rebanadas con horas, los pasos
manuales de Anderson y los riesgos principales. Termina con "ESPERANDO APROBACIÓN DE
ANDERSON PARA LA FASE 2". Sin recapitular pasos. No escribas código.
````
- Resumen de la respuesta (2–3 líneas): Investigación FCM (RN Firebase 27.1.1 con spike S1 y plan B expo-notifications), spec 003 (RF-67…85, RNF-21…25), plan con T-167…T-193 en 6 rebanadas (~23,25 h) y decisiones D-126…D-136 como Propuesta. El revisor distinto RECHAZÓ de forma condicionada (9 hallazgos, 1 mayor: orden de clearOwnStorage vs. espera de guardados); la fase se detuvo sin corregirlos.
- Usado / modificado / descartado: Usado: investigación, spec y plan. Modificado: referencia D-77/D-52 en plan.md (por el revisor) y párrafo del canal en investigación. Descartado: nada; hallazgos 1–9 del revisor pendientes de decisión.
- Archivos y commit: docs/fcm/investigacion.md, specs/003-notificaciones-fcm/spec.md, specs/003-notificaciones-fcm/plan.md, docs/backlog.md, docs/requisitos.md, docs/decisiones.md, docs/seguridad.md, docs/omisiones-y-limites.md, docs/AI_LOG.md. Sin commit; lo hace Anderson.
- Verificación (la completa Anderson):
- Aprendizaje (lo escribe Anderson):


### Entrada #63
- Fecha: 2026-11-16
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: FCM — Fase 1b: corregir hallazgos del revisor, ajustar diseño y segunda revisión, sin código.
- Prompt textual:
````
PROMPT — FCM — FASE 1b: corregir hallazgos, ajustar diseño y segunda revisión (SIN CÓDIGO)

0. ANTES DE TODO: crea una entrada NUEVA en docs/AI_LOG.md copiando ESTE PROMPT COMPLETO,
   textual, como "Prompt". Deja "Aprendizaje" vacío. Completa "Archivos y commit" con los
   archivos que toques; el hash lo pone Anderson.

METODOLOGÍA Y REGLAS (las mismas de la Fase 1)
- spec-author corrige la spec; planner corrige el plan; un REVISOR DISTINTO del primero
  y de quien corrige hace la segunda revisión. Quien corrige no aprueba. Si el
  revisor rechaza, DETENTE y repórtalo.
- Sigue siendo solo documentos: sin código, sin dependencias, sin app.json, sin
  package.json, sin firestore.rules, sin backend. No leas .env, backend/.env,
  backend/secrets/* ni google-services.json. Sin commit ni push. SHOW_DEV_TOOLS=false.
  Cambios de reglas, si los hubiera, solo como texto en docs/seguridad.md.

DECISIONES DE ANDERSON (D-126…D-136 pasan de "Propuesta" a lo que se indica; actualiza
docs/decisiones.md con el estado y la justificación de cada una)
- D-126 (RN Firebase 27.1.1 con plan B expo-notifications, spike S1 de 3 h máx. como
  puerta): APROBADA, queda "Vigente" al confirmarse el spike; antes, "Aprobada,
  sujeta al spike".
- D-130 (FCM no depende de "Disponible"): APROBADA con matiz: aplica al endpoint de
  prueba porque no es una solicitud real; documenta que en un sistema real solo
  recibiría un conductor disponible.
- D-131 (titularidad del token): APROBADA con CAMBIO DE DISEÑO: NO uses consultas de
  collectionGroup (exigen un índice creado a mano). Usa una colección raíz
  pushTokens/{hash} con {uid, token, platform, updatedAt}, escrita solo por el backend
  (el cliente no la lee ni escribe; confirma que las reglas publicadas ya la deniegan
  por defecto y que NO hacen falta reglas nuevas), y mantiene drivers/{uid}/fcmTokens
  si el plan lo necesita para listar los dispositivos de un uid, o sustitúyelo por una
  consulta where(uid) sobre pushTokens. Al registrar un token, el backend lo reasigna
  al uid actual en una transacción (se quita del uid anterior).
- D-132 (copiar calculateFare en el backend): RECHAZADA. El PDF exige UNA sola función
  calculateFare. El payload y el cuerpo de la notificación NO llevan tarifa; llevan
  categoría, distancia, duración, coordenadas, requestId y expiresAt. La app calcula la
  tarifa al abrir con la función única. Elimina la copia y la prueba de paridad; cita
  R-084 y R-067.
- D-136 (temporizador): RECHAZADA la opción de mantener 30 s. El temporizador de
  decisión pasa a 15 s (PDF; brecha G-06; corrige la contradicción
  decisiones.md:520 vs docs/requisitos.md:25 y ratifica con una decisión numerada).
  Para que funcione con una notificación, separa DOS tiempos: (a) validez de la
  notificación: ttl y expiresAt ≈ 90 s desde el envío; (b) ventana de decisión: 15 s
  que empiezan cuando la solicitud se MUESTRA en pantalla, tanto si llega por el mock
  como por la notificación. Si al tocar la notificación ya pasó expiresAt, muestra
  "La solicitud expiró". Actualiza spec, plan y criterios de aceptación.

CORRECCIONES A LOS 9 HALLAZGOS DEL REVISOR (corrige spec, plan y docs asociados)
1. MAYOR: clearOwnStorage (resetSession.js:86) corre antes de la espera de guardados
   (:90-98). Si esa espera da trip-save-pending, la sesión sigue abierta pero
   notificationsEnabled ya se borró, y el token sigue activo. Corrección: la preferencia
   notificationsEnabled y el token local se borran JUNTO con la baja del token, DESPUÉS
   de la espera de guardados y justo antes de signOut; si la espera falla y la sesión
   continúa, nada de eso cambia. Añade el criterio de aceptación y la prueba en la
   tarea correspondiente (T-185).
2. La intención pendiente de navegación se liga al uid que recibió la notificación
   (guarda el uid destino); se descarta si el uid actual no coincide, en resetSession y
   al iniciar sesión otro conductor. Añade criterio y prueba.
3. Límite del token: 512 caracteres de máximo, coherente con BODY_LIMIT (revisa el
   valor real y corrígelo en spec y plan; un token FCM mide ≈ 160-170).
4. DP-60: elimina la dirección fija. La notificación y el payload llevan solo
   coordenadas; la app resuelve la dirección con el geocodificador existente (D-125)
   al abrir, con su fallback. Declara que no hay direcciones en el cuerpo de la
   notificación.
5. Cita D-24 donde corresponda (G2).
6. Declara el cambio de firma de createApp y del cableado de backend/src/server.js, y
   que backend/src/admin.js debe exportar messaging de forma explícita.
7. Quita la edición condicional de middleware.js: ERRORS.rateLimited ya existe.
8. Corrige la descripción de sendEachForMulticast (comportamiento real: devuelve un
   resultado por token, hasta 500 por llamada, y los tokens inválidos se limpian a
   partir de las respuestas; verifícalo en la documentación del Admin SDK y cita la
   fuente).
9. Refuerza la trazabilidad de T-192/T-193 con los RF/CA que verifican.

OTROS AJUSTES
- Token y permisos: confirma en la spec que la baja de token usa timeout corto y no
  bloquea el cierre de sesión.
- Re-estima las horas por rebanada con estos cambios (incluida la tarea del
  temporizador de 15 s y la ventana de decisión separada de la validez) y actualiza
  los puntos de parada.
- Actualiza docs/requisitos.md, docs/omisiones-y-limites.md y docs/seguridad.md solo
  donde cambie lo dicho. Registra en docs/decisiones.md las decisiones nuevas con
  número (la del temporizador de 15 s y la separación validez/decisión, y la de
  pushTokens).

SEGUNDA REVISIÓN (revisor distinto, obligatoria)
Verifica uno por uno los 9 hallazgos corregidos, que D-132 ya no deje fórmula
duplicada, que pushTokens no necesite reglas ni índices manuales, que los dos tiempos
(validez y decisión) sean consistentes en spec, plan y criterios, que no se
contradiga D-93…D-125 sin declararlo, que la spec siga cubriendo la sección 7 del PDF y
R-113, y que no haya secretos. Muestra de 20 referencias archivo:línea.

ENTREGA
Informe corto: veredicto de la segunda revisión, estado de cada uno de los 9 hallazgos
(corregido / pendiente), las decisiones D-126…D-136 con su estado final, horas por
rebanada y el total, los pasos manuales de Anderson (M1…M4) y los riesgos que sigan
abiertos. Termina con "ESPERANDO APROBACIÓN DE ANDERSON PARA LA FASE 2". Sin recapitular
pasos. No escribas código.
````
- Resumen de la respuesta (2–3 líneas): Se corrigieron los 9 hallazgos y se aplicaron D-126…D-136 (D-132 y D-136 rechazadas; nuevas D-137 y D-138) en decisiones, spec, plan, backlog (T-167…T-195), requisitos, seguridad y omisiones. Segunda revisión por un revisor distinto: aprueba con observaciones menores; un defecto medio (T-184/T-185 contra el hallazgo 1) y seis menores se corrigieron después sin nueva revisión.
- Usado / modificado / descartado: Usado: pushTokens en colección raíz, una sola calculateFare, ventana de decisión 15 s separada de la validez ≈90 s. Descartado: fcmTokens por uid, collectionGroup, copia de calculateFare, temporizador de 30 s, dirección fija en la notificación.
- Archivos y commit: docs/decisiones.md, docs/requisitos.md, docs/seguridad.md, docs/omisiones-y-limites.md, docs/backlog.md, docs/fcm/investigacion.md, docs/AI_LOG.md, specs/003-notificaciones-fcm/spec.md y plan.md. Sin commit; lo hace Anderson.
- Verificación (la completa Anderson):
- Aprendizaje (lo escribe Anderson):


### Entrada #64 — FCM — implementación (rebanadas S1–S6)
- Fecha: 2026-11-16
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: FCM — Fase 2, implementar por rebanadas. Esta entrada recibe S1 y las siguientes.
- Prompt S1 (textual):
````
PROMPT — FCM — FASE 2, REBANADA S1: spike nativo y configuración (T-167…T-170)

0. REGISTRO EN AI_LOG: crea UNA entrada nueva "FCM — implementación (rebanadas S1–S6)" y
   copia en ella este prompt textual como "Prompt S1". Las rebanadas siguientes se
   añadirán a esta misma entrada. Deja "Aprendizaje" vacío.

APROBACIONES DE ANDERSON (aplica en docs/decisiones.md)
- Fase 1b APROBADA. D-126: "Aprobada, sujeta al spike S1". D-130 aprobada con matiz,
  D-131 aprobada (pushTokens raíz, sin reglas ni índices manuales), D-132 y D-136
  rechazadas, D-137 y D-138 aprobadas.
- D-127, D-128, D-129, D-133, D-134, D-135: en tu informe, resume cada una en UNA línea
  y márcala "Aprobada, salvo objeción de Anderson".
- Preguntas abiertas de spec §7: resuélvelas tú, documentando cada una con tu
  recomendación: targetUid va en el payload; con D-137 la validez de 30 s del mock ya
  no aplica; numeración T-194/T-195, DP-62 y el código exacto de token no registrado
  (verifícalo en la documentación del Admin SDK).

METODOLOGÍA Y REGLAS
- implementer implementa; verifier DISTINTO verifica; quien implementa no aprueba. Si el
  verifier rechaza, DETENTE y repórtalo.
- No leas ni imprimas .env, backend/.env, backend/secrets/* ni google-services.json
  (el plugin de config lo lee durante el build, no tú). Cero secretos en chat, código
  o docs. Sin commit ni push. SHOW_DEV_TOOLS=false. firestore.rules fuera de git. Sin
  Alert. Esta rebanada SÍ está autorizada a tocar app.json, package.json y
  scripts/dependencies.json, solo en lo que el plan §S1 indique.
- No puedes compilar Android en tu entorno: NO intentes ejecutar el build. Anderson lo
  hace en su máquina (STOP-1).

ALCANCE: SOLO S1 (T-167…T-170 del plan), nada de S2 en adelante.
1. Instala/declara las dependencias exactas que decidió la investigación
   (@react-native-firebase/app y @react-native-firebase/messaging 27.1.1, y cualquiera
   que el plan exija, como expo-build-properties). Actualiza
   scripts/dependencies.json (de "proposed" a "allowed") y package-lock.
2. app.json: plugins de RN Firebase, android.googleServicesFile apuntando al archivo
   de la raíz, y lo mínimo que exija el plan. Documenta cada cambio.
3. Verifica que google-services.json está ignorado (.gitignore:46) y que la ruta del
   plugin coincide.
4. Crea la capa mínima del spike dentro de src/services/notifications/ (interfaz y
   adaptador) que pueda: pedir el permiso en Android 13+, obtener el token FCM y
   registrar el listener de actualización. El token NUNCA se imprime completo: solo los
   primeros 8 caracteres y su longitud, y solo en __DEV__. Nada de UI nueva todavía.
5. Pruebas automáticas de lo puro (adaptador con dependencias inyectadas). Sin romper
   las pruebas existentes; check-constitution sin empeorar la línea base; expo-doctor
   sin errores nuevos.
6. Checklist para Anderson (STOP-1), con comandos para PowerShell: cómo reconstruir
   (npx expo prebuild --clean si hace falta o npx expo run:android), qué ver en el log
   (adb logcat filtrado), qué señales confirman que S1 pasó y qué señales activan el
   PLAN B (expo-notifications con getDevicePushTokenAsync) con su criterio de
   activación del plan.
7. Si algo exige tocar fuera del alcance de S1, repórtalo en vez de hacerlo.

VERIFICACIÓN (verifier distinto)
Cambios limitados a lo autorizado, dependencias solo las aprobadas, sin secretos, el
token no se imprime completo, pruebas y constitución sin regresión, app.json válido
(npx expo config), y trazabilidad a T-167…T-170 y a los CA de la spec.

ENTREGA
Informe corto: qué cambió, versiones instaladas, los hallazgos del verifier, las
decisiones D-127…D-129/D-133…D-135 en una línea cada una, cómo resolviste las preguntas
abiertas, y el checklist STOP-1 para Anderson. Termina con "ESPERANDO RESULTADO DE
ANDERSON EN STOP-1". No avances a S2.
````
- Prompt S2 (textual):
````
PROMPT — FCM — REBANADA S2: backend de notificaciones (T-171…T-176)

0. REGISTRO EN AI_LOG: NO crees entrada nueva. Añade este prompt textual como
   "Prompt S2" dentro de la entrada #64 "FCM — implementación (rebanadas S1–S6)".

APROBACIONES Y EVIDENCIA (actualiza docs/decisiones.md y docs/progress.md)
- STOP-1 (T-169) VALIDADO EN DISPOSITIVO por Anderson el 2026-11-16: la app compiló con
  RN Firebase 27.1.1 sobre Expo SDK 57, se obtuvo el token FCM, se concedió el permiso, y
  una notificación enviada desde la consola de Firebase llegó con la app en segundo plano
  y al tocarla abrió la app. D-126 pasa a "Vigente". El plan B (T-170) queda descartado.
- Pendiente aún de comprobar en dispositivo: que la notificación de solicitud salga como
  aviso emergente (DP-72, canal con importancia alta). No lo resuelvas en S2; queda para S3.

METODOLOGÍA Y REGLAS
- implementer implementa; verifier DISTINTO verifica; quien implementa no aprueba. Si el
  verifier rechaza, DETENTE y repórtalo.
- No leas ni imprimas .env, backend/.env, backend/secrets/* ni google-services.json.
  Cero secretos en chat, código, docs o logs. Sin commit ni push. SHOW_DEV_TOOLS=false.
  firestore.rules fuera de git. Sin Alert. NO hagas git stash, git reset, git checkout
  de archivos ni nada que revierta cambios; si necesitas aislar, repórtalo.
- Alcance: SOLO S2 (backend). No toques el cliente (src/) salvo que el plan lo exija
  para una prueba pura. No avances a S3.

ALCANCE S2 (según spec/plan; resumo las decisiones vigentes)
1. backend/src/admin.js exporta messaging de forma explícita. createApp cambia de firma
   para recibir la dependencia de mensajería e inyectarla; actualiza server.js.
2. Endpoints nuevos bajo /notifications, TODOS autenticados con el ID token existente y
   con el rate limit existente (ERRORS.rateLimited ya existe; no edites middleware.js):
   - POST /notifications/register {token, platform}: valida token (string, 20–512
     caracteres, sin espacios) y platform 'android'. Guarda en la colección RAÍZ
     pushTokens/{sha256(token)} con {uid, token, platform, createdAt, updatedAt}. Es una
     transacción: si ese token ya pertenecía a otro uid, se REASIGNA al uid actual (D-131).
     Idempotente. Sin collectionGroup ni índices nuevos.
   - POST /notifications/unregister {token}: borra el token SOLO si pertenece al uid del
     caller; idempotente (204 aunque no exista); nunca revela si pertenece a otro uid.
   - POST /notifications/test-request {delaySeconds?}: delaySeconds entero 0–60 (por
     defecto 0). Exige cuenta aprobada (lee drivers/{uid}.accountStatus con admin; D-130:
     NO exige "Disponible"). Responde 202 y envía a los tokens del propio uid. Como máximo
     UN envío diferido pendiente por uid (evita acumulación); el envío diferido se
     programa en el servidor (setTimeout) y se cancela al cerrar el servidor.
3. Mensaje FCM: sendEachForMulticast (una respuesta por token, hasta 500 por llamada)
   con notification {title: "Nueva solicitud de viaje", body: "<Categoría> · <km> km ·
   <min> min"} y data (todos strings): type='trip_request', requestId, targetUid,
   expiresAt (ahora + 90 s, epoch ms), category, distanceKm, durationMin, originLat,
   originLng, destLat, destLng, passengerName (nombre de una lista fija de prueba).
   SIN tarifa (D-132 rechazada; la app la calcula con calculateFare) y SIN direcciones
   (D-138; la app geocodifica con D-125). android: priority 'high', ttl 90 s,
   notification.channelId 'solicitudes'. Los datos simulados (distancia, duración,
   coordenadas cerca de la zona de pruebas) salen de una plantilla del servidor; el body
   del cliente NUNCA aporta tokens, textos ni datos de la solicitud.
4. Limpieza: tras el envío, borra de pushTokens solo los tokens cuya respuesta
   (revisando resp.success por índice) sea error messaging/registration-token-not-
   registered (cadena confirmada en el SDK instalado) o invalid-registration-token.
   Otros errores no borran nada.
5. Seguridad y operación: errores genéricos al cliente, log por petición sin tokens ni
   cuerpos (misma línea [req] existente, y como mucho el conteo de tokens), BODY_LIMIT
   coherente con los 512 caracteres, requestId aleatorio generado en servidor, y el
   endpoint de prueba no puede enviar a otro uid bajo ninguna combinación de body.
6. Pruebas automáticas en scripts/tests con admin y reloj falsos: registro (válido,
   token corto/largo/con espacios, reasignación entre uids), baja (propia, ajena,
   inexistente), envío (payload exacto sin tarifa ni direcciones, solo tokens del uid,
   ttl y expiresAt), delay acotado y un envío diferido por uid, cuenta no aprobada
   rechazada, limpieza selectiva por código de error, rate limit, errores genéricos,
   y que ningún log contenga token ni cuerpo. Las pruebas existentes deben seguir
   pasando (51 de 54 con la invocación por defecto; los 3 conocidos pasan con el loader).
7. Docs: backend/.env.example sin cambios salvo variables realmente nuevas (solo
   nombres); docs/seguridad.md con la sección de notificaciones (colección pushTokens
   solo backend, confirmación de que NO se necesitan reglas ni índices nuevos);
   docs/pagos-guia-rapida.md NO se toca. Añade a la guía del backend cómo probar los
   endpoints cuando el cliente (S3) esté listo.

VERIFICACIÓN (verifier distinto)
Payload exacto vs spec (sin tarifa, sin direcciones), aislamiento por uid, idempotencia,
transacción de reasignación, rate limit, que no haya secretos ni tokens en logs,
trazabilidad a T-171…T-176 y a los RF/CA, pruebas y constitución sin regresión (línea base
14 errores).

ENTREGA
Informe corto: qué se implementó, archivos tocados, resultado del verifier, cifras de
pruebas y constitución, y los casos que quedan para prueba en dispositivo en S4. Termina
con "S2 COMPLETA — LISTA PARA COMMIT DE ANDERSON". Sin recapitular pasos.
````
- Resumen de la respuesta (2–3 líneas): S1 implementada (T-167, T-168) y validada parcial por un verifier distinto: RN Firebase 27.1.1 exacta, plugins y googleServicesFile en app.json, firebase.json con canal «solicitudes», capa src/services/notifications con adaptador inyectable, handler en segundo plano y sonda solo en __DEV__; 14 pruebas nuevas. Pendiente STOP-1 (T-169) en el celular.
- Usado / modificado / descartado: usado: API modular de RN Firebase 27 (los .d.ts no exponen messaging()); modificado: maskToken pasa de «últimos 6» a «primeros 8 + longitud» (docs alineadas); descartado: expo-build-properties y expo-notifications (no requeridos; plan B solo si falla STOP-1). Incidente del implementer: un git stash pop restauró 5 archivos sin seguimiento de un stash antiguo y los borró; stash@{0} intacto.
- Archivos y commit: scripts/dependencies.json, package.json, package-lock.json, app.json, firebase.json, index.js, App.js, src/services/notifications/**, scripts/tests/notification*.test.mjs, docs (decisiones, backlog, seguridad, spec §7, investigacion, progress). Sin commit; lo hace Anderson.
- S2 — Resumen: S2 (T-171…T-175) implementada en el backend: `messaging` en `admin.js`/`createApp`/`server.js`, rutas `POST /notifications/register`, `/unregister` y `/test-request` con el `guard` y un límite propio, `pushTokens/{sha256}` con transacción (reasigna al uid que llama), mensaje FCM sin tarifa ni direcciones y limpieza selectiva de tokens. Verifier distinto: aprobada en lo estático, sin «Validada» (envío real = STOP-2). Pruebas: 93 (90 pasan; los 3 fallos conocidos pasan con el loader: 100/100); constitución 14 errores / 222 advertencias (base 14 / 225).
- S2 — Usado / modificado / descartado: usado: `sendEachForMulticast` y los códigos de error confirmados en `firebase-admin` 13.10.0 instalado; las rutas del ENCARGO (`register`/`unregister`) sustituyen a `POST/DELETE /notifications/token` de spec, plan, requisitos y backlog, que se alinearon; descartado: tarifa y direcciones en el mensaje (D-132, D-138), `collectionGroup` e índices. Pendiente: `token` frente a `fid` (FR-10) y `ttl` en el servidor real. Incidente: ninguno (sin stash/reset).
- S2 — Archivos y commit (sin hash): backend/src/{admin,app,server,config}.js, backend/src/notifications/{payload,tokenStore}.js, backend/src/routes/notifications.js, scripts/tests/{backendMessagingWiring,backendNotificationPayload,backendTokenStore,backendNotificationsRoutes}.test.mjs, scripts/tests/helpers/notificationsFakes.mjs, README.md, docs/{seguridad,backlog,decisiones,progress,requisitos}.md, specs/003-notificaciones-fcm/{spec,plan}.md.
- Prompt S3+S4 (textual):
````
PROMPT — FCM — REBANADAS S3 + S4: cliente e integración (hasta STOP-2)

0. REGISTRO EN AI_LOG: NO crees entrada nueva. Añade este prompt textual como
   "Prompt S3+S4" dentro de la entrada #64.

CONTEXTO
S1 validada en dispositivo (D-126 Vigente). S2 (backend) completa y verificada en lo
estático: POST /notifications/register, /unregister y /test-request, colección raíz
pushTokens, mensaje sin tarifa ni direcciones, ttl y expiresAt de 90 s, data con type,
requestId, targetUid, category, distanceKm, durationMin, coordenadas y passengerName.
Esta entrega cubre el cliente (S3) y la integración con sesiones, preferencias y el
extremo a extremo (S4), y termina en STOP-2, donde Anderson prueba en el celular.

METODOLOGÍA Y REGLAS
- implementer implementa cada rebanada; verifier DISTINTO verifica cada rebanada (S3 y
  luego S4); quien implementa no aprueba. Si el verifier rechaza, DETENTE y repórtalo.
- No leas ni imprimas .env, backend/.env, backend/secrets/* ni google-services.json.
  Cero secretos en chat, código, docs o logs. Sin commit ni push. SHOW_DEV_TOOLS=false.
  firestore.rules fuera de git. Sin Alert. NO hagas git stash, git reset ni checkout de
  archivos. Todo texto visible va en src/constants/labels.js. Tokens de diseño,
  accesibilidad (áreas ≥ 48 dp, accessibilityLabel) y D-93…D-138 vigentes.
- No puedes compilar Android ni probar en dispositivo: NO lo intentes.
- Sigue el plan (specs/003-notificaciones-fcm/plan.md): S3 = T-177…T-183 y, si el plan
  las asigna al cliente, T-194/T-195 (decisionDeadline y la tarjeta de solicitud);
  S4 = T-184…T-186. Respeta las asignaciones del plan; si algo del plan no cuadra con el
  código real, repórtalo antes de improvisar.

DECISIONES PARA ESTA ENTREGA (regístralas en docs/decisiones.md)
1. Canal Android (DP-72): NO uses expo-notifications (su servicio de Firebase entra en
   conflicto con el de RN Firebase). Crea un PLUGIN DE CONFIGURACIÓN LOCAL en plugins/
   (sin dependencias nuevas) que, vía @expo/config-plugins, añada al MainApplication
   nativo la creación idempotente del canal "solicitudes" con IMPORTANCE_HIGH, nombre
   visible "Solicitudes de viaje", descripción corta, sonido y vibración por defecto, y
   regístralo en app.json. Inspecciona el MainApplication que genera el prebuild
   actual (android/ ya existe; lee su estructura para no romperlo, sin modificarlo
   a mano: android/ es generado e ignorado). Debe ser tolerante a que ya exista
   y fallar con un mensaje claro en el prebuild, no en silencio. Plan B documentado si
   el plugin no logra aplicar el cambio: avisar a Anderson con el diagnóstico. Úsalo
   en el mensaje: el backend ya envía channelId 'solicitudes'.
2. Ventanas de tiempo (D-137): el temporizador de decisión pasa a 15 s y empieza
   cuando la solicitud se MUESTRA en pantalla, tanto si llega del mock como de una
   notificación (corrige la constante en el lugar de configuración único y la
   contradicción decisiones.md:520 vs docs/requisitos.md:25 con una decisión
   numerada). La validez de la notificación es expiresAt (≈ 90 s del envío); si al
   abrir ya pasó, muestra "La solicitud expiró" y no permite aceptar.
3. Dirección: la app resuelve las direcciones con el geocodificador existente (D-125)
   a partir de las coordenadas del payload, con su fallback.
4. Tarifa: la app la calcula con calculateFare, la función única (R-084), usando
   distanceKm y durationMin del payload y la categoría.
5. Elegibilidad en cliente: la notificación solo se atiende si hay sesión, la cuenta
   está aprobada, no hay un viaje en curso y el targetUid del payload coincide con el
   uid actual; si no, se ignora de forma segura sin mensajes confusos.

ALCANCE S3 — cliente
- src/services/notifications/: servicio completo detrás de la interfaz ya creada en S1:
  registrar el token con POST /notifications/register (usa el cliente HTTP y el ID
  token existentes, como paymentsClient), dar de baja con /unregister, onTokenRefresh
  que vuelve a registrar, permiso POST_NOTIFICATIONS en contexto con explicación
  previa y manejo de "denegado" con enlace a los ajustes del sistema, canal
  "solicitudes" (vía el plugin), y escucha de mensajes en primer plano y de apertura
  desde notificación (onNotificationOpenedApp y getInitialNotification).
- Estado de la preferencia notificationsEnabled en AsyncStorage (preferencia, no dato
  sensible), con un hook (p. ej. useNotifications) y un contexto si el plan lo pide.
- "Intención pendiente" en memoria (rama MAIN, D-133), ligada al targetUid: la
  consume el gate de Root DESPUÉS de resolver sesión y estado de cuenta; se descarta si
  el uid no coincide, al cerrar sesión o si el viaje ya está en curso.
- Dedupe por requestId (D-135) para que el mock y la notificación no dupliquen.
- Un adaptador puro (parsePushRequest) que convierte el data del mensaje en la
  solicitud interna a través de mappers.js (el único archivo que conoce la forma de la
  API del pasajero): valida tipos y rangos, rechaza datos inválidos o ajenos.
- decisionDeadline(request, now) y la tarjeta de solicitud (IncomingRequestCard)
  según el plan, con el temporizador de 15 s desde que se muestra.
- Pruebas automáticas (lógica pura con dependencias inyectadas): parsePushRequest,
  elegibilidad, expiración, dedupe, intención pendiente ligada a uid, decisionDeadline,
  registro y baja de token con cliente falso, onTokenRefresh y permiso denegado.

ALCANCE S4 — integración
- resetSession (D-93…D-106, D-134): añade el paso "dar de baja el token" con timeout
  corto y sin bloquear el cierre de sesión. ORDEN CRÍTICO (hallazgo del revisor): la
  preferencia notificationsEnabled, el token local y la baja del token se borran
  JUNTOS, DESPUÉS de la espera de guardados y justo antes de signOut. Si la espera da
  trip-save-pending o hay viaje en curso y la sesión continúa, NADA de eso cambia.
  Pruebas de orden y de no borrado en esos casos. clearOwnStorage (resetSession.js:86)
  corre antes de esa espera: no puede borrar la preferencia.
- Al iniciar sesión, registra el token del uid actual (si la preferencia está activa y
  hay permiso). Cambio de cuenta A→B en el mismo teléfono: el token queda asociado a B
  (D-131 reasigna) y A deja de recibir en ese dispositivo.
- Configuración: sección mínima "Notificaciones" con el interruptor (pide el permiso en
  contexto al activarlo) y el botón "Enviar solicitud de prueba" que llama a
  /notifications/test-request con un retraso seleccionable de 0 a 60 s (por defecto 10),
  con estados de carga/éxito/error en línea, sin Alert, tokens de diseño. Es la UI
  funcional mínima; el pulido visual y la auditoría de diseño son S5.
- Extremo a extremo: al tocar la notificación o recibirla en primer plano, la app
  muestra la tarjeta de solicitud con la categoría, distancia, duración, tarifa
  calculada con calculateFare y direcciones resueltas; el flujo posterior (aceptar,
  rechazar, vencer 15 s) es el existente.
- Actualiza la guía del backend (cómo probar con la app) y los docs de omisiones y
  límites (iOS fuera, sin ubicación en segundo plano).

VERIFICACIÓN (verifier distinto, por rebanada)
Trazabilidad a T-177…T-186 y a los RF/CA; el plugin no usa dependencias nuevas y falla
con mensaje claro; ninguna pantalla importa RN Firebase directamente (solo el
adaptador); el orden de borrado en resetSession; la intención ligada al uid; D-137
(15 s desde que se muestra); sin tarifa ni direcciones en el payload; sin secretos ni
tokens completos en logs; pruebas y constitución sin regresión (base 14 errores); que
la suite por defecto no pierda pruebas.

ENTREGA
Informe corto: por rebanada, qué se implementó, archivos, resultado de los dos
verifiers, cifras de pruebas y constitución, decisiones nuevas, y el CHECKLIST STOP-2
para Anderson en PowerShell: reiniciar el backend y el túnel, actualizar
EXPO_PUBLIC_BACKEND_URL si cambió, npx expo prebuild --clean y npx expo run:android,
y las pruebas: (1) activar notificaciones y conceder el permiso, (2) enviar solicitud
de prueba con la app abierta, en segundo plano y cerrada, (3) comprobar el aviso
emergente y el sonido, (4) tocar la notificación y ver la tarjeta con el temporizador
de 15 s, (5) tocarla pasados 90 s y ver "La solicitud expiró", (6) cerrar sesión en A,
entrar con B y comprobar que A no recibe y B sí, (7) denegar el permiso y ver el manejo,
(8) sin red al registrar. Termina con "ESPERANDO RESULTADO DE ANDERSON EN STOP-2". No
avances a S5.
````
- S3 — Resumen: cliente de notificaciones detrás de la interfaz de S1 (T-177…T-183, T-194, T-195): registro/baja vía backend, permiso, primer plano y apertura desde notificación, intención pendiente ligada a uid (D-133), dedupe por requestId (D-135), `parsePushRequest` vía `mappers.js`, `decisionDeadline` y tarjeta con 15 s desde que se muestra (D-137/D-140), plugin local `plugins/withRequestsChannel.js` para el canal «solicitudes» (D-139). Verifier distinto: validada en lo estático, sin «Validada» (DP-72 y entrega con la app cerrada = STOP-2).
- S4 — Resumen: T-184…T-186 más la sección mínima «Notificaciones» en Configuración (D-144): preferencia `notificationsEnabled`, controlador de registro (A→B, onTokenRefresh), paso de baja en `resetSession` tras la espera de guardados y antes de `signOut`, con tope de 3 s y restauración si `signOut` falla (D-134, D-141), oferta con compuerta antes de adoptar (D-142), regex decimal estricta (D-143). Verifier distinto: aprobada en lo estático. Hallazgo mayor (literales RF-70/RF-71 y estado bloqueado) y carrera de `enable()` corregidos tras el verifier.
- S3+S4 — Cifras: suite por defecto 107 pruebas / 104 pasan (3 fallos conocidos); con loader 114/114; constitución 14 errores / 241 advertencias (base 14); `--selftest` pasa. No se ejecutó `expo lint` ni expo-doctor tras S3/S4.
- S3+S4 — Usado / modificado / descartado: decisiones D-139…D-144; descartado `expo-notifications` (conflicto con el servicio de RN Firebase). Marca de IA `#64` (la entrada #65 inicial del implementer se corrigió a #64, sin entrada nueva). Pendiente: tarjeta y sección sin auditoría de diseño (T-183, T-187, T-195), STOP-2 en dispositivo.
- S3+S4 — Archivos y commit (sin hash): plugins/withRequestsChannel.js, app.json, App.js, src/services/notifications/*, src/services/trip/{decisionWindow,pushOffer,pendingRequest,requestPresentation}.js, src/services/session/*, src/components/{NotificationsBridge,IncomingRequestCard}.js, src/components/settings/NotificationsSection.js, src/hooks/useTripRequests.js, src/constants/labels.js, scripts/tests/* (14 archivos nuevos), docs/{decisiones,backlog,progress,seguridad,omisiones-y-limites}.md.
- S3+S4 — Fallo STOP-2 (arranque en frío): con la app cerrada, al tocar la notificación salía pantalla roja «Cannot read property 'EventEmitter' of undefined». Causa: RN Firebase inicia un contexto JS headless que evalúa `index.js` completo sin `globalThis.expo`, y `expo-modules-core` lo lee al cargar (`EventEmitter.ts:22`).
- S3+S4 — Corrección (D-145): `index.js` solo registra el manejador mínimo en segundo plano y carga `expo` y `App` de forma perezosa al montar `main`; guardia estática `scripts/tests/headlessEntry.test.mjs`. No verificado en dispositivo (app cerrada).
- S3+S4 — Fallo STOP-2c (arranque en frío, tras D-145): sin pantalla roja, pero con la app cerrada la solicitud no se mostró ni «La solicitud expiró»; con la app abierta o en segundo plano sí. La hipótesis «se juzga la elegibilidad antes de que Root resuelva» resultó falsa (el puente solo se monta con sesión y cuenta aprobada). Causa probable por código, no verificada en celular: en la build de desarrollo `expo-dev-launcher` relanza la actividad sin los extras del intent y `getInitialNotification` devuelve `null`.
- S3+S4 — Corrección STOP-2c (D-146): `intentFlow.js` evalúa la intención solo con la compuerta lista, trazas `[push] …` solo en `__DEV__`, `intentFlow.test.mjs` (10 pruebas). El arranque en frío se prueba en build release; en dev client queda como límite conocido.
- Hoy (2026-11-16), corrección logPushEvent: revisión estática con parser sin identificadores libres (D-147); causa probable bundle obsoleto de Metro, NO confirmada; pendiente de dispositivo reiniciar con `npx expo start -c`; prueba `notificationsFreeSymbols.test.mjs`.
- Hoy, S5 diseño: ronda 1 del auditor aplicada (D-148: `SwitchTrack`, botón de prueba legible, tope de fuente, Drawer renombrado a `MainHome`); Diseño sigue «Pendiente» (ronda 2 del auditor, O-03 sin decidir y faltan capturas).
- Hoy, S6 cierre: T-190 (`withRequestsChannel.test.mjs` usa el fixture versionado `scripts/tests/fixtures/MainApplication.template.kt`, ya no lee `android/`), T-191 (README «Notificaciones push (FCM)», sin secretos), T-192 (requisitos, auditoría del enunciado, plan de cierre, backlog, progress y omisiones) y T-193 (guion de demo de 75 s en `docs/guion-video.md`). T-192 sin checklist de dispositivo creado; T-190 y T-193 siguen «Pendiente».
- Hoy, evidencia de dispositivo de Anderson: build RELEASE con la app cerrada abre la solicitud con la cuenta de 15 s y luego «La solicitud expiró» (cierra STOP-2c); dev client con la app cerrada `getInitialNotification` = `null` (límite del dev launcher, no del código). Se documentó como validada solo eso; el resto, pendiente de dispositivo.
- Hoy, DP-72: resuelto en dispositivo (heads-up con sonido); D-139 anotada como validada.
- Hoy, D-145: funciona en dispositivo (un solo módulo en el contexto headless); D-146 con hipótesis refutada y arranque en frío validado en release; D-137 marcada «Vigente» por la ventana de 15 s y el mensaje de vencida.
- Hoy — Usado / modificado / descartado: usado el fixture de plantilla Expo para la prueba del plugin; modificados README, requisitos, auditoría, plan de cierre, decisiones (solo líneas de estado de D-137, D-139, D-145, D-146), backlog, progress, omisiones, spec 003 (sección «Comportamiento vigente», sin cambio de alcance) y guion; descartado dejar la prueba dependiente de `android/` y marcar «Vigente» decisiones sin evidencia (D-127 a D-135 siguen como están). Marca de IA `#64`; no se creó entrada nueva.
- Hoy — Cifras: suite por defecto 127 pruebas / 124 pasan (fallos conocidos: plateNormalization, registrationProgress, reverseGeocode; `withRequestsChannel` ya pasa); con loader 134/134; constitución 14 errores / 244 advertencias (base 14).
- Hoy — Archivos y commit (sin hash; según `git status`): docs/{AI_LOG,auditoria-enunciado-2026-11-12,backlog,decisiones,guion-video,omisiones-y-limites,plan-cierre-entrega-2026-11-16,progress,requisitos}.md, README.md, specs/003-notificaciones-fcm/spec.md, scripts/tests/withRequestsChannel.test.mjs, scripts/tests/fixtures/MainApplication.template.kt; en el árbol además, de otros pasos del día: docs/diseno/auditoria-fcm-2026-11-16.md, scripts/tests/{drawerRouteNames,headlessEntry,intentFlow,notificationsFreeSymbols}.test.mjs, index.js, src/components/{AvailabilitySwitch,IncomingRequestCard,NotificationsBridge,PrimaryButton,SecondaryButton,SwitchTrack}.js, src/components/settings/NotificationsSection.js, src/constants/labels.js, src/navigation/{AppDrawerContent,MainDrawer}.js, src/screens/home/HomeScreen.js, src/screens/trip/TripRequestScreen.js, src/services/notifications/{backgroundHandler,eligibility,index,intentFlow,safeLog}.js, src/services/trip/requestPresentation.js, src/theme/tokens.js. Sin commit.
- Hoy (2026-11-16), Parte A (notificación → pantalla completa + contador + cierre de diseño FCM): D-149 (tocar la notificación abre siempre la solicitud a pantalla completa desde cualquier pantalla del Drawer; una solicitud ya mostrada como tarjeta se promueve sin duplicarla ni reiniciar los 15 s; la llegada pasiva queda como antes; rechazar/vencer/cerrar vuelve a la pantalla de origen; aceptar va al viaje y Atrás no vuelve a la solicitud), D-150 (contador: texto de énfasis más barra fina sobre pista clara, sin bloque relleno, contrastes AA recalculados 6,08 / 6,54 / 5,12 / 5,50, anuncio accesible solo a 10, 5 y 0 s) y D-151 (O-03 «La solicitud expiró», O-09 borde del botón inactivo, O-10 topes de fuente, O-11 valor accesible del interruptor). Elegibilidad D-133/D-146 intacta. Nueva lógica pura en `src/services/trip/requestNavigation.js` con 10 pruebas.
- Hoy, Parte A — Revisión: verifier distinto aprobó en lo estático (sin hallazgos críticos ni mayores). Design-auditor (sin capturas, solo la declaración textual de Anderson): Diseño «Aprobado parcial» solo para interruptor con chip informativo, tarjeta y pantalla de solicitud operativas; contador nuevo, O-09, O-11 y fuente al 200 % siguen «Pendiente de dispositivo». Hallazgo H-1 (urgente solo por color) enviado al implementer para añadir un icono; H-2 y H-3 esperan captura/TalkBack. Límite conocido documentado: con la app cerrada en el dev client `getInitialNotification` devuelve null; la demo usa la build release. No existe `docs/fcm/capturas/` aunque Anderson dijo haber guardado capturas allí.
- Verificación (la completa Anderson):
- Aprendizaje (lo escribe Anderson):

### Entrada #65 — Cierre de brechas del taller — lote L1
- Fecha: 2026-11-16
- Integrante: Anderson Londoño Avendaño
- Herramienta / modelo: Claude Code (Claude Sonnet 5.5, claude-sonnet-5-5)
- Objetivo: Cerrar el lote L1 del plan de cierre (docs/plan-cierre-entrega-2026-11-16.md): G-02 distancia/duración reales con OSRM, G-22 Ganancias sobre todos los viajes del periodo, G-15 efectos de TripActive, G-21 script npm test, G-17 timeInterval, G-01 lista de comprobación de validTrip(). Spec 004.
- Prompt (textual):
````
PROMPT — Notificación → pantalla completa + contador + cierre de diseño FCM + LOTE L1 del plan de cierre

0. AI_LOG: la PARTE A se registra como líneas añadidas al resumen de la entrada #64 (no la copies
   como prompt). Para la PARTE B crea UNA entrada nueva "Cierre de brechas del taller — lote L1"
   copiando ESTE PROMPT COMPLETO, textual, como "Prompt". Deja "Verificación" y "Aprendizaje"
   para Anderson; el hash lo pone él.

EVIDENCIA DE DISPOSITIVO (Anderson, 2026-11-16 12:51, build de desarrollo)
- STOP-3 pasó: el interruptor de Notificaciones se ve y funciona (chip "Activadas" solo
  informativo), la tarjeta emergente y la pantalla de solicitud funcionan, la prueba de
  notificación llega. Las capturas están en docs/fcm/capturas/ (léelas con tus herramientas
  de imagen). Regístralo en progress.md/backlog como "Validada en dispositivo por Anderson".
- Observación de diseño: en la tarjeta emergente el bloque "Vence en N s" es un rectángulo
  verde relleno con texto blanco, visualmente igual al botón "Aceptar": puede confundirse con
  un control.
- Mejora pedida: al TOCAR la notificación, la app debe abrir SIEMPRE la pantalla completa de
  la solicitud, sin importar en qué pantalla estaba la app (hoy, si estaba en Configuración,
  muestra la tarjeta emergente sobre esa pantalla).
- Límite conocido (NO intentes arreglarlo): en el dev client, con la app cerrada, el toque de
  la notificación no entrega la solicitud (getInitialNotification devuelve null; es el dev
  launcher). En release funciona (validado por Anderson). Documéntalo en
  docs/omisiones-y-limites.md y en el README: la demostración debe hacerse con el build de
  release.

METODOLOGÍA Y REGLAS
- Roles separados: implementer implementa; verifier DISTINTO verifica cada parte;
  design-auditor distinto audita lo visual; spec-author y planner para la Parte B. Quien
  implementa no aprueba. Si un revisor rechaza, DETENTE y repórtalo.
- No leas ni imprimas .env, backend/.env, backend/secrets/* ni google-services.json. Cero
  secretos en docs, README ni logs. Sin commit ni push. SHOW_DEV_TOOLS=false. NO hagas git
  stash, git reset ni checkout de archivos. No puedes compilar ni probar en el dispositivo.
  Sin Alert. Textos visibles en src/constants/labels.js. Tokens de diseño. D-93…D-147 vigentes
  salvo lo que esta tarea cambie y declare. firestore.rules fuera de git (cambios de reglas,
  solo como texto en docs/seguridad.md para que Anderson los publique a mano).
- Por ahora no se añaden dependencias nuevas ni se toca app.json ni código nativo.

PARTE A — FCM: pulido final (sin spec ni plan nuevos)
A1. Al tocar la notificación (app en segundo plano o cerrada, y también el caso en que el
    toque ocurre con la app ya visible), abrir SIEMPRE la pantalla completa de la solicitud
    ("Solicitud entrante"), navegando desde cualquier pantalla del Drawer.
    - Se mantiene toda la elegibilidad de D-133/D-146 (sesión, cuenta aprobada, targetUid, sin
      viaje en curso, expiresAt → "La solicitud expiró", dedupe por requestId, intención
      ligada al uid). Lo que cambia es la PRESENTACIÓN al adoptar una intención por toque:
      pantalla completa, no tarjeta emergente.
    - Si la solicitud ya se estaba mostrando como tarjeta emergente (mismo requestId), el
      toque la promueve a pantalla completa sin duplicarla y sin reiniciar su temporizador
      de 15 s.
    - Las solicitudes que llegan SIN que el usuario toque nada (mock, o push recibido con la
      app en primer plano) siguen mostrándose como hoy (tarjeta emergente sobre cualquier
      pantalla, o pantalla completa desde Inicio). No cambies ese comportamiento.
    - Navegación: usa los nombres únicos vigentes (el Drawer ya usa MainHome). Rechazar,
      vencer los 15 s o cerrar devuelven al usuario a la pantalla donde estaba, sin pila
      duplicada; Aceptar lleva al viaje y Atrás desde el viaje no regresa a la solicitud.
    - Pruebas puras: la decisión de presentación (toque → pantalla completa; llegada pasiva →
      tarjeta/pantalla según hoy), promoción sin duplicado, y que el estado de navegación no
      acumule entradas repetidas.
A2. Contador "Vence en N s": que NO parezca un botón. Hoy es un bloque verde relleno con
    texto blanco. Usa texto con color de énfasis más una barra de progreso fina sobre una
    pista clara, sin relleno de bloque, manteniendo contraste AA, el anuncio accesible sin
    repetir cada segundo, tope de fuente y la prioridad visual del botón Aceptar. Aplica a la
    tarjeta emergente y a la pantalla completa de solicitud.
A3. O-03: unifica el mensaje a "La solicitud expiró" (labels.js, donde hoy hay "venció").
    O-09, O-10, O-11 (hallazgos de baja severidad de la auditoría de diseño): corrígelos si
    son baratos y sin riesgo (forma de quietDisabled, maxFontSizeMultiplier del contador y los
    montos de TripRequestScreen, estado busy del switch); si no, déjalos en el informe.
A4. Cierre de diseño: con las capturas de docs/fcm/capturas/ y la auditoría
    docs/diseno/auditoria-fcm-2026-11-16.md, el design-auditor deja el Diseño de S5 en
    "Validada" SOLO para lo que las capturas demuestran; lo no comprobable queda "Pendiente
    de dispositivo". Actualiza docs/progress.md y docs/diseno/guia-de-estilo.md (patrón del
    switch con chip informativo y del contador).

PARTE B — LOTE L1 del plan de cierre (docs/plan-cierre-entrega-2026-11-16.md)
Metodología SDD ligera: spec-author escribe specs/004-cierre-brechas/spec.md y planner el
plan.md (cortos, con criterios de aceptación CA-nnn verificables y tareas T-nnn que continúan
la numeración vigente), y CONTINÚAS con la implementación sin detenerte a pedir aprobación,
rebanada por rebanada con su verifier.
B1. Distancia y duración reales (G-02, R-040, R-090, R-121). Hoy las solicitudes simuladas
    (mockPassengerApi.js) y las que llegan por push traen distancia/duración inventadas
    (haversine × 1,3 y 25 km/h en el mock; valores de plantilla en el servidor). Cámbialo
    para que, al crear la solicitud en la app, la distancia y la duración salgan de UNA llamada
    a OSRM (origen → destino) con timeout corto (≈ 2–3 s) y caché por par de coordenadas, y
    SOLO ENTONCES se calcule la tarifa con calculateFare (la función única, R-084) y se muestre
    la solicitud, de modo que la tarifa no cambie después de aparecer. Si OSRM falla o tarda,
    usa el cálculo actual como respaldo y márcalo internamente (sin mensaje al usuario). Una
    llamada por solicitud, nunca por cada movimiento (recomendación de consumo del PDF).
    Reutiliza el cliente OSRM existente (osrmRouting.js) y respeta que mappers.js es el único
    archivo que conoce la forma de la API del pasajero. Pruebas con OSRM falso: tiempo de
    espera, respaldo, caché, una sola llamada por solicitud, y que la tarifa se calcula con los
    valores finales. El ejemplo 8,5 km / 22 min debe seguir dando 19.200 / 26.900.
B2. Ganancias sin truncar (G-22, R-088). listenToTrips limita a 200 viajes
    (tripRepository.js:14,47) y los totales de hoy/semana/mes pueden quedar erróneos. Corrige
    para que cada periodo se calcule sobre TODOS sus viajes (consulta por rango de fechas con
    paginación interna o equivalente, sin romper la paginación del Historial ni subir mucho el
    costo de lecturas). Pruebas con más de 200 viajes simulados. Si el cambio exige un índice
    compuesto de Firestore o reglas, deja el texto exacto y los pasos manuales para Anderson en
    docs/seguridad.md y en el informe.
B3. Efectos de TripActive (G-15, R-039, R-058). Revisa los tres efectos de
    TripActiveScreen.js (≈ líneas 69, 80, 94): confirma que cada uno devuelve una función de
    limpieza correcta (temporizadores, suscripciones, seguimiento) y corrige cualquier fuga
    con pruebas cuando sea posible. Si ya están bien, repórtalo con evidencia archivo:línea.
B4. Script de pruebas (G-21). Añade el script "test" en package.json (solo el script, sin
    dependencias) que ejecute toda la suite con el loader de src para que los 3 tests que hoy
    fallan por imports sin extensión pasen con `npm test`. Documéntalo en el README.
B5. Si es trivial y sin riesgo, revisa G-17 (timeInterval en expo-location); si no, repórtalo y
    no lo toques.
B6. Reglas de Firestore (G-01): lee el texto de validTrip() publicado en docs/seguridad.md y
    deja en el informe una lista de comprobación para que Anderson confirme en la consola que
    la regla vigente acepta tip, rating y los campos actuales. No asumas que está publicada.

VERIFICACIÓN (verifiers distintos, por parte)
Parte A: elegibilidad intacta, presentación correcta por tipo de llegada, navegación sin pila
duplicada, contador accesible y no confundible con un botón, textos unificados. Parte B:
trazabilidad a CA-nnn, tarifa con los valores finales, una llamada OSRM por solicitud,
totales correctos con más de 200 viajes, limpieza de efectos, `npm test` en verde. Pruebas
completas y check-constitution (base 14 errores) sin regresión; cita cifras reales. Docs sin
inflar: "Validada" solo con evidencia de Anderson; el resto "Implementada, pendiente de
dispositivo".

ENTREGA
Informe corto: qué se hizo por parte, decisiones nuevas (D-148…), hallazgos de los verifiers,
cifras de pruebas y constitución, pasos manuales para Anderson (índice o reglas de Firestore si
los hubiera, comprobación de la regla de trips) y el CHECKLIST STOP-4 de dispositivo, solo
JavaScript, sin recompilar: (1) app en segundo plano en Configuración, enviar prueba, tocar la
notificación → pantalla completa; (2) igual desde Historial y Perfil; (3) Rechazar/vencer
devuelve a la pantalla anterior; (4) Aceptar lleva al viaje; (5) contador que no parezca
botón y fuente al 200 %; (6) distancia/duración de una solicitud coherentes con la ruta del
mapa; (7) Ganancias; (8) `npm test`. Y recuerda que el caso de la app cerrada se valida en
RELEASE. Termina con "ESPERANDO RESULTADO DE ANDERSON EN STOP-4". Sin recapitular pasos.
````
- Resumen de la respuesta (2–3 líneas): Parte A (el toque abre la pantalla completa, contador sin bloque, icono de urgencia H-1) y lote L1 (B1 métricas OSRM, B2 ganancias por rango, B3–B6) implementados, cada parte con un verifier distinto: todas «Verificada estáticamente», ninguna «Validada» (falta el celular). `npm test` 159/159; `check-constitution` 14 errores (línea base). La spec 004 sigue en Borrador; D-149, D-150, D-151, D-160, D-170 y D-180 en Propuesta.
- Verificación (la completa Anderson):
- Aprendizaje (lo escribe Anderson):
