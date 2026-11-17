<!-- AI-assisted: see docs/AI_LOG.md #68 -->
# Adenda L3b a la spec 006 (idioma) · Borrador (spec-author, 2026-11-16)

Estado: **Borrador. No aprobada.** Anderson aprueba. Extiende `specs/006-idioma/spec.md` (enlazada desde su sección 5); no cambia ningún RI ni CA existente salvo la nota de CA-006-07. Si esta adenda se aprueba, el plan (`plan.md`), el tema y las tareas de la spec 006 pueden quedar desactualizados y el `planner` debe regenerarlos (P5).

Fuentes: ENCARGO del lote L3b (Anderson); R-022, R-048, R-065 (matriz del plan); D-15, D-188, D-190, D-191 (todas Propuesta). Requisitos nuevos: RI-25 (Parte A) y RI-26..RI-29 (Parte B).

## Parte A. Selector de idioma sin sesión

**Objetivo y porqué.** Hoy el selector «Idioma / Language» solo está en Configuración, que exige sesión. Quien abre la app por primera vez con el teléfono en un idioma que no entiende, o quien se registra, no puede cambiarlo antes de iniciar sesión. Se ofrece un control compacto en las pantallas previas a la sesión.

**Requisitos (EARS)**
- **[RI-25a]** (R-048) CUANDO la persona está en bienvenida/onboarding, inicio de sesión, registro de cuenta o cualquiera de las pestañas del registro de conductor, ENTONCES la pantalla DEBE mostrar un control compacto «Idioma / Language» con las opciones «Español» y «English», sin requerir sesión.
- **[RI-25b]** (R-065) El control DEBE ser accesible: rol de radio, estado «seleccionado» en la opción activa, área táctil ≥ 48 dp y la opción activa distinguible sin depender solo del color (icono o texto además del color).
- **[RI-25c]** (R-048) El control DEBE colocarse en un sitio discreto (encabezado o pie) sin competir visualmente con la acción principal de la pantalla.
- **[RI-25d]** (R-022) El control DEBE reutilizar `src/components/settings/LanguageSection.js` (o una variante compacta que lo envuelva) y `src/i18n` (`languageStore`/`setLanguage`), sin duplicar la lógica de elección ni de guardado.
- **[RI-25e]** (R-048) CUANDO se elige un idioma en este control, ENTONCES la pantalla DEBE actualizarse al instante, NO DEBE borrar lo escrito en los formularios ni reiniciar el progreso del registro, y la elección DEBE guardarse en la misma preferencia local (`AsyncStorage`, clave `appLanguage`) sin escribir en Firestore.
- **[RI-25f]** (R-048) El orden de resolución del idioma inicial (RI-06: preferencia guardada, sugerencia del registro, idioma del teléfono, español) NO DEBE cambiar.

**Criterios**
- **CA-006-35** (RI-25a) Existe el control en cada pantalla listada: bienvenida/onboarding, inicio de sesión, registro de cuenta y cada pestaña del registro de conductor. Verifica: test estático que recorre los archivos de esas pantallas (la lista exacta la fija el plan) y falla si alguno no incluye el control; lectura de la lista contra `src/app/`.
- **CA-006-36** (RI-25b) El control expone rol `radio` en cada opción, estado `selected` solo en la activa, indicador de la activa que no es solo color y altura mínima ≥ 48 dp (token `touch`). Verifica: test de propiedades del componente y lectura. Contraste con los tokens de `DESIGN.md` (≥ 4,5:1 texto, ≥ 3:1 icono): cálculo con script temporal. Tamaño táctil real y lector de pantalla: **Pendiente de dispositivo**, tarea de captura en celular.
- **CA-006-37** (RI-25d) El control no contiene lógica propia de guardado: importa `LanguageSection` (o su variante) y llama a `setLanguage`; no hay segunda implementación de `setLanguage`, ni lectura/escritura directa de `appLanguage` fuera de `src/i18n`. Verifica: `grep` de `appLanguage` y de `AsyncStorage` en los archivos del control y de las pantallas.
- **CA-006-38** (RI-25e) Elegir `en` desde el control con un almacenamiento falso deja `getLanguage()` en `en` y `appLanguage = 'en'` guardado; reabrir (nueva resolución) devuelve `en`. Verifica: test con almacenamiento falso.
- **CA-006-39** (RI-25e) Elegir un idioma desde el control no llama a ningún repositorio de Firestore. Verifica: test con repositorio falso (sin llamadas) y `grep` del campo en `validProfileEdit` y `firestore.rules` (sin cambios).
- **CA-006-40** (RI-25e) Con un formulario de registro con campos escritos y una pestaña activa, cambiar el idioma deja los valores, la pestaña activa y el progreso iguales (mismo estado del contexto de registro antes y después). Verifica: test del estado del contexto de registro con el idioma cambiado; y el cambio de idioma no remonta la pantalla (misma instancia, como CA-006-19). El comportamiento visual: **Pendiente de dispositivo**.
- **CA-006-41** (RI-25f) La tabla de CA-006-08 y CA-006-09 sigue pasando sin cambios. Verifica: las mismas pruebas, sin modificar sus entradas ni salidas.
- **CA-006-42** (RI-25a, RI-25c) La clave del título del control está en `es` y en `en` (paridad, CA-006-01) y su texto es el mismo en ambos idiomas («Idioma / Language»), como CA-006-12. Verifica: test de paridad.
- **CA-006-D4** (RI-25c) El `design-auditor` confirma en capturas (es/en, fuente al 200 %) que el control no compite con el botón principal, no tapa campos ni el teclado y no recorta texto en bienvenida, inicio de sesión, registro de cuenta y pestañas del registro. Estado: **Pendiente de dispositivo**.
- **CA-006-35d** (RI-25e) **No verificado en dispositivo:** en el celular, a mitad de un registro, cambiar de idioma conserva lo escrito y la pestaña, y tras reiniciar la app el idioma sigue. Tarea: prueba en celular.

## Parte B. Correcciones de textos, formato y arranque

- **[RI-26]** (R-022) Los textos en inglés DEBEN usar «Reject» (no «Decline») para la acción de rechazar la solicitud, «I've arrived» (no «I arrived») para el botón de llegada y «Rejected» para el estado rechazado; botones, avisos y estados DEBEN ser coherentes entre sí. Origen: ENCARGO L3b.
- **[RI-27]** (R-022) La función `delayValue` DEBE documentar que su salida es idéntica en `es` y `en` (`"{seconds} s"`) porque la unidad «s» es la misma símbolo en ambos idiomas (SI).
- **[RI-28]** (R-022) El formateo de fecha y hora (`src/utils/format.js`) DEBE usar la hora local del teléfono (comportamiento real) y DEBE aceptar una zona horaria inyectable para las pruebas.
- **[RI-29]** (R-048) La sugerencia de idioma del registro (`applySuggestion`) NO DEBERÍA pisar un cambio de idioma hecho por el usuario durante el arranque; si la corrección no es trivial y segura, DEBE quedar el límite documentado.

**Criterios**
- **CA-006-43** (RI-26) En el diccionario `en`: `trip.reject` es «Reject», `trip.arrive` es «I've arrived», el estado rechazado del viaje (`trip` y el del historial `status.rejected`) es «Rejected»; ninguna cadena `en` de la app contiene «Decline»/«Declined» ni «I arrived» (salvo `declineRequest.js`, nombre de archivo, que no es texto). Verifica: test que recorre el diccionario `en` y busca esas cadenas.
- **CA-006-44** (RI-26) Las pistas y avisos que nombran esas acciones usan la misma palabra: `rejectHint`, `rejectCardHint`, `arriveFirstHint` («Tap I've arrived…») y los avisos de pago rechazado no mezclan «Decline» y «Reject» para la misma acción. Verifica: la misma prueba y lectura de las claves listadas. Los avisos de pago de tarjeta («Payment declined») son del banco/Stripe y quedan fuera del alcance de RI-26; si Anderson prefiere «rejected» también ahí, lo indica al aprobar.
- **CA-006-45** (RI-26) Paridad (CA-006-01/02) sigue pasando tras los cambios. Verifica: test de paridad.
- **CA-006-46** (RI-27) Se documenta que `delayValue(15)` devuelve `15 s` en `es` y en `en` y por qué: comentario junto a ambas definiciones (`es.js` y `en/account.js`) y nota en CA-006-07. Verifica: lectura de los dos comentarios y de esta adenda; `delayValue(15)` es igual en ambos idiomas. Nota a CA-006-07: la exigencia «texto distinto en cada idioma» se aplica a `getSubmitErrorMessage` y `profile.errors.fullName`; para `delayValue` el criterio es «mismo resultado, a propósito, documentado», porque «s» es el símbolo de segundo en ambos idiomas.
- **CA-006-47** (RI-28) Documentado en el código y en `docs/omisiones-y-limites.md` (si Anderson aprueba añadirlo) que `format.js` muestra la hora local del teléfono, no la de Colombia. Verifica: lectura.
- **CA-006-48** (RI-28) Con un instante fijo y una zona inyectada (por ejemplo UTC-5 y UTC+0), `formatDateTime` produce horas distintas y correctas para el mismo instante en cada zona y en cada idioma; sin zona inyectada usa la local. Verifica: test con zona inyectada (refina CA-006-29). Sin dependencias nuevas.
- **CA-006-49** (RI-29) Con una preferencia aún sin guardar y un `setLanguage` hecho por el usuario mientras `applySuggestion` espera la lectura, el idioma final es el elegido por el usuario y no la sugerencia. Verifica: test con almacenamiento falso que difiere la lectura y ejecuta `setLanguage` entre medias. Si el `planner`/`implementer` determina que la corrección no es trivial y segura, este CA se sustituye por el límite escrito en `docs/omisiones-y-limites.md` y la sustitución se informa a Anderson (no se omite en silencio).
- **CA-006-50** (RI-29) La sugerencia sigue sin guardarse como preferencia y sin pisar una preferencia guardada (CA-006-09 intacto). Verifica: las mismas pruebas.

## Matriz

| Requisito | Fuente | CA |
|---|---|---|
| RI-25a | R-048 (L3b) | CA-006-35, 42, D4 |
| RI-25b | R-065 | CA-006-36 |
| RI-25c | R-048 | CA-006-D4 |
| RI-25d | R-022 | CA-006-37 |
| RI-25e | R-048 | CA-006-38, 39, 40, 35d |
| RI-25f | R-048 | CA-006-41 |
| RI-26 | ENCARGO L3b | CA-006-43, 44, 45 |
| RI-27 | ENCARGO L3b | CA-006-46 |
| RI-28 | ENCARGO L3b | CA-006-47, 48 |
| RI-29 | ENCARGO L3b | CA-006-49, 50 |

## Casos límite
- Almacenamiento que falla al guardar desde el control: el idioma cambia igual y se muestra el aviso de CA-006-17 sin romper el formulario.
- Teclado abierto: el control no debe quedar tapado ni empujar el botón principal fuera de vista.
- Toques repetidos rápidos entre `es` y `en`: queda el último idioma elegido y guardado.

## Decisiones
Ninguna decisión nueva hace falta (no se propone D-193). Lectura conservadora adoptada: «Decline» no se cambia en avisos de pago de tarjeta (CA-006-44); la zona horaria sigue siendo la local del teléfono (CA-006-47).

## Qué debe aprobar Anderson
1. La adenda completa (CA-006-35 a 50, D4) como Borrador a Aprobada.
2. Si los avisos de pago «declined» también pasan a «rejected».
3. Si CA-006-49 se exige o se acepta el límite documentado.
4. Añadir el límite de la hora local a `docs/omisiones-y-limites.md`.
