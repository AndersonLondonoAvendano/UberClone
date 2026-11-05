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
