# Ronda 2 — Flujo del viaje (T-43, T-44, T-45)

- Fecha: 2026-11-10 (prompt #44). Auditor: design-auditor.
- Tipo: **estática** (lectura del código contra `DESIGN.md`, `src/theme/tokens.js`, `docs/diseno/direccion.md`, `docs/diseno/rubrica.md` y la decisión D-83). No hay capturas del celular ni del arnés. Las notas que requieren capturas (capas B y C) no se estiman.
- Pantallas: `src/screens/trip/TripRequestScreen.js`, `src/screens/trip/TripActiveScreen.js`, `src/screens/trip/TripSummaryScreen.js`; componentes `src/components/PrimaryButton.js`, `src/components/SecondaryButton.js`, `src/components/map/TripMap.js`; textos en `src/constants/labels.js` (bloque `trip`).
- Punto de partida: `docs/diseno/auditorias/ronda-1-viaje.md` (tres hallazgos y cola) y D-83 (`docs/decisiones.md`), que resolvió el conflicto de especificación de la ronda 1: la cuenta regresiva va en `color.primary` siempre, nunca en rojo.
- Guía cargada por el agente principal: skill frontend-design (estructura visual como información, una cosa memorable por pantalla, voz activa y misma acción con el mismo nombre, errores que dicen qué pasó y cómo arreglarlo, piso accesible AA/foco/44 pt, sin mayúsculas sostenidas ni adornos genéricos). Ninguna regla de la skill choca con `DESIGN.md` ni con los tokens; no se descarta nada.

## Estado por capa

| Capa | Resultado |
|---|---|
| A | `check-constitution`: 23 errores, todos C21 (requisitos ENT-* sin tarea, línea base ajena a estas pantallas), 0 advertencias; igual que en la ronda 1. Grep de hex/rgba en los seis archivos: 0. `visual-audit --selftest`: omitido por el script (Playwright no instalado en esta máquina); de todos modos las tres pantallas dependen de `TripContext`, `AvailabilityContext` y MapLibre, que el arnés no renderiza. |
| B (Taste) | **Sin nota**: no hay capturas. No se redondea ni se estima. |
| C (Impeccable) | **Sin nota** por la misma razón. Lectura estática: sin P0 ni P1; los tres hallazgos de abajo serían P2. |
| D (UI UX Pro Max) | Por lectura: contraste AA en todos los pares de texto, 44/48 pt en todos los controles, estado con texto además de color, foco/rol/etiqueta accesibles, salida segura en todos los estados de error. Tres hallazgos de jerarquía, tokens y texto. |
| E (celular) | Pendiente. El mapa (cámara, puntos, atribución sobre las teselas), el relleno de la cuenta regresiva en los últimos 10 s y la hoja sobre el mapa con sombra solo se juzgan aquí. |

## Hallazgos de la ronda 1: estado

| # | Hallazgo | Estado | Dónde se ve |
|---|---|---|---|
| 1 | El dato vivo no manda (cuenta regresiva y «Tu ganancia» por debajo del resto) | **Resuelto.** La cuenta regresiva salió del `ScrollView` y vive en la barra de acciones (`TripRequestScreen.js:269-284`) en `[type.display, type.numeric]` y `color.primary`, con barra que se vacía (`:280-283`) y texto «Vence en N s» + `accessibilityLabel` en frase completa. «Tu ganancia» es `type.display` + `type.numeric` en `color.primary` en la tarjeta (`:372-376`) y en el resumen (`TripSummaryScreen.js:134-138`); tarifa y comisión siguen en `type.body`. El conflicto de especificación quedó cerrado por D-83 («nunca rojo»). | — |
| 2 | Líneas que decoran (bordes de tarjeta, divisores, bordes superiores; `radius.lg` en tarjetas) | **Resuelto.** Tarjetas sin borde y con `radius.md` (`TripRequestScreen.js:347-352`, `TripSummaryScreen.js:139-144`); los divisores se reemplazaron por espacio (`section.marginTop`, `totals.marginTop: space[4]`); las barras de acciones no llevan borde superior; el panel de Viaje en curso es una hoja sobre el mapa con `radius.lg` arriba y la sombra nativa permitida en «Elevación» (`TripActiveScreen.js:319-333`). El único `borderWidth.thin` que queda es el límite de `SecondaryButton`, que sí es un control. | — |
| 3 | Botones deshabilitados sin decir por qué a quien mira | **Resuelto en lo esencial.** La razón es texto visible bajo el botón mientras está deshabilitado (`trip-active-main-hint`, `TripActiveScreen.js:233-237`, `type.label`/`textMuted`). Queda una desviación de texto respecto de D-83 (ver hallazgo 3) y el registro pendiente del uso de `opacity.disabled` en botones (cola). | — |

## Cola de la ronda 1: estado

- (Media, capa E) Cámara 600 ms sin consultar «reducir movimiento»: **sin cambio** (`src/config/map.js` `CAMERA_ANIMATION_MS = 600`, `TripMap.js:66`). Sigue en cola para el celular y para el spec-author (excepción escrita en `DESIGN.md` o respeto de `isReduceMotionEnabled`).
- (Media, capa E) Puntos del mapa distinguidos solo por color (`TripMap.js:26-37`, destino en `color.success`): **sin cambio**. Se juzga en el celular.
- (Baja) `Notice` con `tone="warning"` sin estilo: **resuelto** (`TripActiveScreen.js:297-304`, `color.warning` sobre `surface`, 6.33:1).
- (Baja) Dos textos para el vencimiento: **resuelto** (`errorExpired` desapareció; `EXPIRED` usa `labels.trip.expired`, `TripRequestScreen.js:50-51`). `errorGeneric` («Algo salió mal. Inténtalo de nuevo.») sigue igual; es el `default` del `switch` y no dice qué pasó. Se mantiene en cola (Baja).
- (Baja) `styles.muted` con dos tamaños: **sin cambio** (`type.body` en Solicitud y Viaje en curso; `type.caption` en `TripSummaryScreen.js:160-163`). Baja; renombrar a `note` en el resumen o unificar.
- (Baja) Filas no interactivas con `minHeight: touch.min`: **sin cambio** (`TripRequestScreen.js:382`, `TripSummaryScreen.js:154`). Baja.
- (Baja, registro) Pintura del mapa fuera de los tokens: **sin cambio**; sigue siendo un registro para `DESIGN.md`.

## Lo que ya cumple (además de lo resuelto arriba)
- Solo tokens: colores, `type.*`, `space`, `radius`, `touch`, `opacity`, `borderWidth` salen de `tokens.js` (con la excepción del hallazgo 2). `shadowColor` del panel usa `color.text`; `shadowOpacity`/`shadowRadius`/`elevation` son propiedades de sombra que «Elevación» permite en hojas sobre el mapa.
- Contraste AA en todos los pares de texto: text/surface 16.76, text/bg 15.30, textMuted/surface 7.29, textMuted/bg 6.66, primary/surface 6.08 (cuenta regresiva y «Tu ganancia»), onPrimary/primary 6.08 (cuenta regresiva urgente y botón primario), danger/surface 6.54 (errores, «Cancelar viaje», «Sí, salir»), warning/surface 6.33 (ruta aproximada).
- Salida segura: ningún estado de error deja la pantalla sin acción. Falla al finalizar → texto + «Reintentar» + «Salir del viaje» (`TripActiveScreen.js:198-207`); rechazo definitivo → solo la salida (`:202-204`, sin un «Reintentar» inútil); cancelación fallida → «Salir del viaje» además de reintentar (`:193-195`); salida con confirmación inline que dice qué pasa («El viaje se cierra en este teléfono… El pasajero puede no recibir el aviso»). Todo con `accessibilityLiveRegion`.
- Nombres de acción coherentes en todo el flujo: «Reintentar» (un solo texto, `labels.actions.retry`) en ruta, ubicación, reporte, mapa y finalización; «Salir del viaje» → «Sí, salir»; «Cancelar viaje» → «Sí, cancelar»; «Volver a Inicio» en las tres pantallas; «Pasajero a bordo» y «Finalizar viaje» según D-83 y RF-12.
- Textos de error nuevos: dicen qué pasó sin disculpas vagas («No pudimos confirmar el final del viaje: no hay conexión.», «El servidor no respondió a tiempo…», «El servidor no aceptó el final del viaje. Puedes salir del viaje.»), en sentence case y sin relleno.
- Rojo solo para errores y para cancelar/salir (`SecondaryButton variant="danger"` cambia solo el color del texto; nunca relleno rojo, como manda «success/warning/danger solo como texto o ícono»).
- Acción principal única por estado del panel: en reposo un `PrimaryButton`; en cada confirmación la opción que conserva el viaje es la primaria y la destructiva es secundaria en rojo. Correcto: el botón más fuerte nunca es el que destruye.
- Táctil: todos los botones con `minHeight: touch.controlHeight` (48) y `gap: touch.gap`/`space[2]` (8); rol, etiqueta, pista y `accessibilityState.disabled`.
- Barra de la cuenta regresiva sin animación continua (salto de 1 s con `flex`), así que no necesita consultar «reducir movimiento»; cumple «solo con función».

## Hallazgos de la ronda (máximo tres)

### 1. (Media) La cuenta regresiva sigue en pantalla cuando la solicitud ya no existe
- Dónde: `TripRequestScreen.js:269-284` (bloque `trip-request-countdown`, se dibuja siempre dentro de la barra de acciones) con `:100` (el intervalo se detiene cuando `error.gone`) y `:291-292` (estado `gone`: solo «Volver a Inicio»).
- Qué se ve (por lectura): cuando `acceptRequest` responde `ALREADY_TAKEN` o `EXPIRED`, el bloque muestra «Otro conductor tomó esta solicitud.» en rojo y, encima, la cuenta regresiva congelada en `type.display` y `color.primary`, p. ej. «Vence en 12 s», con su barra a medio vaciar. El dato más fuerte de la pantalla contradice al mensaje: dice que aún hay tiempo para una solicitud que ya no se puede tomar. Si además el congelamiento ocurre dentro de los últimos 10 s, el bloque queda relleno en `primary`, el estado de máxima urgencia, sobre un botón «Volver a Inicio».
- Regla incumplida: `DESIGN.md` «Estados de datos honestos» (dirección) y «Estado de pantalla remota: Error explica qué falló»; frontend-design «una sola cosa memorable por pantalla» (aquí la memorable miente) y «los errores dicen qué pasó y cómo arreglarlo» sin información contradictoria al lado.
- Corrección: no dibujar el bloque de cuenta regresiva cuando `error?.gone` (condicionar el `View` de `:270` a `!error?.gone`, igual que ya se condicionan los botones en `:291`). Mientras `working` sin error, sí se mantiene: la solicitud sigue viva.

### 2. (Media) Barra urgente con un número suelto y un par de color fuera de la tabla
- Dónde: `TripRequestScreen.js:427-430` (`trackUrgent: { backgroundColor: color.onPrimary, opacity: 0.9 }`) y `:434-436` (`fillUrgent: { backgroundColor: color.text }`).
- Qué pasa: en los últimos 10 s la pista de la barra se pinta en blanco a `opacity: 0.9` escrito a mano, y el relleno en `color.text` (verde casi negro) sobre el bloque `primary`. D-83 fija el tratamiento urgente como «relleno `primary` y texto `onPrimary`»; el relleno oscuro de la barra no sale de esa decisión ni de ningún par de la tabla (text/primary da 2.76:1, calculado con el mismo método de `DESIGN.md`; no está permitido ni como límite). Visualmente, la parte vacía de la barra queda blanca y la llena casi negra dentro de un bloque teal: tres tonos para una barra de 4 pt.
- Regla incumplida: `DESIGN.md` «Opacidad»: «ningún componente usa números sueltos para la opacidad»; «Color»: «Solo se usan los pares de la tabla»; D-83 punto 3 (`primary`/`onPrimary`); frontend-design «antes de salir, quítate un accesorio».
- Corrección: en el estado urgente, `fillUrgent: { backgroundColor: color.onPrimary }` y `trackUrgent: { backgroundColor: color.primary }` (la pista se funde con el bloque y la barra se lee como una línea blanca que se acorta sobre teal, par onPrimary/primary 6.08), y eliminar `opacity: 0.9`. Si se quiere que la pista vacía siga visible, usar `color.bg` como pista solo tras añadir el par bg/primary a la tabla de `DESIGN.md` (spec-author). Para la capa E: comprobar en el celular que el bloque relleno de `radius.md` justo encima de «Aceptar» (mismo relleno, mismo radio, 8 pt de separación) no se lea como un segundo botón; si ocurre, quitarle el radio y llevarlo de borde a borde de la barra, o separarlo con `space[3]`.

### 3. (Media) Panel de Viaje en curso: el dato que decide el conductor es el texto más pequeño, y dos textos no dicen lo que D-83 pide
- Dónde: `TripActiveScreen.js:263-276` (fase en `type.title`, nombre en `muted`, dirección en `body`, restante en `[type.body, type.numeric]`); `labels.js` `trip.startRideHint`/`finishRideHint` («Se activa al llegar al punto de recogida» / «…al destino»), `trip.phase.toDestination` («Viaje en curso hacia el destino») bajo el encabezado «Viaje en curso».
- Qué se ve (por lectura): durante los dos tramos, «{km} km · {min} min restantes» es la única cifra viva del panel y va en `type.body` (16/400), el mismo tamaño que la dirección y menor que la fase (20/600). En Solicitud y Resumen ya manda el dato vivo; aquí manda una frase de estado. Además: (a) la razón bajo el botón deshabilitado describe al botón («Se activa al…») y no lo que hace el conductor; D-83 escribió el texto: «Llega al punto de recogida para continuar». (b) El título de fase «Viaje en curso hacia el destino» repite el encabezado «Viaje en curso» que está 2 cm más arriba y rompe el paralelismo con «En camino al pasajero». (c) «¿Salir del viaje sin confirmación?» es ambiguo: parece decir que se sale sin pedir confirmación, cuando se refiere a que el servidor no confirmó.
- Regla incumplida: `DESIGN.md` «Los importes, tiempos y distancias son tipografía grande con cifras tabulares», «Indicadores clave (KPI): tipografía grande con su etiqueta»; dirección «el único color va en el dato vivo»; D-83 punto 3 (texto del botón deshabilitado); frontend-design «voz activa desde la perspectiva del usuario», «el dato que decide el conductor debe ser lo más fuerte de la pantalla».
- Corrección: cuando `showRemaining`, mostrar el restante como indicador: cifras en `[type.display, type.numeric]` y `color.primary` («2,4 km · 6 min») con la palabra «restantes» o la fase como etiqueta en `type.label`/`textMuted` encima; cuando no hay restante (llegada, preparando), la fase vuelve a `type.title` como hoy. Si el alto del panel sobre el mapa preocupa, `type.title` + `type.numeric` en `color.primary` es el mínimo aceptable; nunca `type.body`. Textos en `labels.js`: `startRideHint: 'Llega al punto de recogida para continuar'`, `finishRideHint: 'Llega al destino para continuar'`, `phase.toDestination: 'En camino al destino'`, `exitQuestion: '¿Salir del viaje sin la confirmación del servidor?'`. Las pistas de accesibilidad pueden seguir usando las mismas claves.

## En cola (no se exigen en esta ronda; se revisan en la ronda 3 o en el celular)
- (Media, capa E) Cámara 600 ms sin «reducir movimiento» (`src/config/map.js`): pendiente de decisión del spec-author (excepción escrita en `DESIGN.md` «Movimiento» o consulta de `isReduceMotionEnabled`).
- (Media, capa E) Puntos del mapa conductor/destino solo por color; `success` reservado a «Disponible/aprobado» (`TripMap.js:26-37`).
- (Media, capa E) Hoja del panel sobre el mapa: comprobar en el celular que la sombra (`shadowOpacity 0.12`, `elevation 6`) no se vea como borde; y que la atribución a 12 pt sobre `surface` sea legible encima de las teselas.
- (Baja, registro para el spec-author) `opacity.disabled` se usa en `PrimaryButton`/`SecondaryButton` (`PrimaryButton.js:39-41`, `SecondaryButton.js:39-41`); `DESIGN.md` solo lo define para campos bloqueados (D-74). Registrar el uso en botones o cambiarlo.
- (Baja, accesibilidad) `accessibilityLiveRegion="assertive"` en la cuenta regresiva durante los últimos 10 s (`TripRequestScreen.js:275`) hace que el lector de pantalla interrumpa cada segundo con la frase completa. Mejor `polite` y anunciar solo en umbrales (10 s y 5 s), o dejar la región en el bloque de error y confiar en el `accessibilityLabel` al enfocar.
- (Baja) «Volver a Inicio» es `SecondaryButton` en los estados sin solicitud/sin viaje (`TripRequestScreen.js:186`, `TripActiveScreen.js:141`) y `PrimaryButton` en el resumen (`TripSummaryScreen.js:97`): cuando es la única acción de la pantalla debería ser la principal en los tres casos.
- (Baja) `errorGeneric` sigue sin decir qué pasó; `styles.muted` con dos tamaños; filas con `minHeight: touch.min`; pintura del mapa fuera de tokens (todo heredado de la ronda 1, sin cambio).
- (Baja) Resumen: la franja «Tu ganancia» y la tarjeta de detalle son dos superficies blancas iguales (`radius.md`, mismo relleno) apiladas; funciona porque la franja es la pieza propia de la dirección, pero conviene confirmar en el celular que no se lea como «dos tarjetas idénticas».

## Campo Diseño
- T-43 (Solicitud entrante): **Pendiente** (ronda 2 estática: hallazgos 1 y 2, ambos medios y de corrección local; falta la evidencia en el celular).
- T-44 (Viaje en curso): **Pendiente** (ronda 2 estática: hallazgo 3, medio; cola de capa E para el mapa; falta la evidencia en el celular).
- T-45 (Resumen del viaje): **Aprobado condicionado a celular** (sin hallazgos nuevos en lo estático; los puntos de cola son bajos; queda por ver la pantalla real en el checkpoint).

La ronda 3 será la última antes de escalar a Anderson sin redondear la nota; con los tres hallazgos corregidos y las capturas del celular, T-43 y T-44 pueden pasar a «Aprobado condicionado a celular» en la misma ronda.
