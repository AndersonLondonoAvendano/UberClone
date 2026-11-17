<!-- AI-assisted: see AI_LOG.md #72 (T-287, D-200) -->
# Auditoría de diseño: «Conductor llegando» sin botones (T-287, D-200)

Fecha: 2026-11-16. Ronda 1 de 3 (estática, por lectura de código).
Alcance: `src/screens/trip/TripActiveScreen.js` en la fase `toPickup` («Conductor llegando») sin «Llegué» ni «Pasajero a bordo», y su paso a `atPickup` («Llegaste al punto de recogida»).
Base: `DESIGN.md`, `docs/diseno/rubrica.md`, `docs/diseno/guia-de-estilo.md`, D-200.

## Estado honesto de las capas
| Capa | Estado |
|---|---|
| A (script de constitución y arnés) | No ejecutada en esta ronda (solo lectura); el arnés web además no muestra mapa. |
| B (Taste) | No aplicable: no hay capturas. Sin nota. |
| C (Impeccable) | No ejecutada: no hay capturas; se hizo lectura con sus criterios de jerarquía y accesibilidad. Sin puntuación. |
| D (UI UX Pro Max) | Lectura del código contra el checklist (targets, escala de texto, estados). |
| E (celular real) | **No verificado en dispositivo.** Mapa, escala de fuente al 200 % real, TalkBack y el paso entre fases solo se confirman en el celular (STOP-9). |

Las skills de diseño las carga el agente principal; no se me pasaron reglas que choquen con el proyecto, así que no se descartó ninguna.

## Qué se leyó
En `toPickup` el panel muestra: chip de fase («Conductor llegando», tono `brand`), distancia y tiempo restantes (`type.display` en `color.primary`, con «restantes»), pasajero (icono `person`, `bodyStrong`), dirección de recogida (icono `radio-button-on`, `body`), y debajo, fuera del scroll, un único control: «Cancelar viaje» (`SecondaryButton`, variante `danger`). No hay botón principal ni texto de ayuda (`mainHint` es `null`; líneas 179-183 y 279-291).

## Veredicto por punto pedido

### 1. Jerarquía
Cumple. Orden de lectura y de peso: estado (chip) > distancia/tiempo (el único elemento grande y de color primario) > pasajero (semibold) > dirección (regular) > acción. El dato vivo domina como pide la guía; el color primario no se usa en un botón porque no hay acción primaria, y eso es coherente con «un solo primario a la vez» de la ronda L2.

### 2. «Cancelar viaje»: accesible, no único resaltado, no aislado
- Accesible: `SecondaryButton` con `minHeight` `touch.controlHeight` (48 dp, `tokens.js:72`; `SecondaryButton.js:30`), por encima de 44. Etiqueta de texto «Cancelar viaje», no solo icono. Está fuera del `ScrollView`, así que siempre se ve y se alcanza.
- No es el único resaltado: es un botón con contorno (borde `border`, fondo `surface`) y texto `danger`; no tiene relleno. El elemento más fuerte de la pantalla sigue siendo la cifra restante en `color.primary`. Cumple «no pelea con la información».
- No queda aislado sin sentido: va junto a un bloque de información con datos vivos, ancla al borde inferior del panel y cuenta con la confirmación en línea (`cancelQuestion`/`cancelMessage`) antes de actuar. El texto del chip y la cifra que cambia dan razón para estar en la pantalla. Observación O-1 abajo.
- Estable en el paso de fase: el panel está anclado abajo y crece hacia arriba, de modo que al aparecer «Pasajero a bordo» encima, «Cancelar viaje» no se mueve de lugar; un toque dirigido a cancelar no cae sobre el botón principal.

### 3. Fuente al 200 %
Por lectura (No verificado en dispositivo):
- Sin recortes en lo habitual: ningún texto de la pantalla usa `numberOfLines` (solo el título del `ScreenHeader`, que permite 2); los botones usan `minHeight`, nunca `height`, y limitan su texto con `maxFontScale` (1,5), así que envuelven en lugar de cortar. Las filas usan `flex: 1` en el texto.
- Targets ≥ 44: «Cancelar viaje», «Pasajero a bordo» y «Reintentar» de los avisos miden al menos 48 dp y crecen con la fuente.
- Las acciones están fuera del scroll; el scroll cede el espacio (`flexShrink: 1`, panel acotado a 65 % de la altura). Con el 200 %, la información (cifra de 56 px, dirección en varias líneas) puede desplazarse dentro del panel, pero «Cancelar viaje» sigue visible. Aceptable.
- Riesgo detectado: la confirmación de cancelar, ver H-1.

### 4. Transición a «Llegaste al punto de recogida»
Cumple en lo estático. Al pasar a `atPickup`: el chip cambia de `brand` a `success` con el texto nuevo (color más texto, no solo color); la cifra restante desaparece (`moving` es falso); aparece «Pasajero a bordo» como `PrimaryButton` único relleno, habilitado salvo `busy`, sobre «Cancelar viaje». El bloque `info` es una región `polite`, así que el lector de pantalla anuncia el cambio de fase. La altura total casi no varía (se va la cifra de ~70 dp y entra un botón de 48 dp más el hueco), así que el mapa no salta de forma notable. El paso solo es visible con el simulador corriendo en el celular: **No verificado en dispositivo**.

## Hallazgos (máximo tres)

### H-1 (media) Confirmación de cancelar al 200 % puede desbordar el panel en pantallas bajas
- Dónde: `TripActiveScreen.js:212-249` (tarjeta `trip-active-cancel-confirm`) y panel con `maxHeight: windowHeight * 0.65` (`:322`).
- Qué pasa: la confirmación se pinta en `actions`, que está fuera del `ScrollView` y dentro del panel acotado. El título (20 px, con icono), el mensaje (3 a 4 líneas a 16 px x 2) y dos botones de hasta 72 dp suman, con mi estimación (supuestos: 640 dp de alto, 360 dp de ancho, padding de la tarjeta de 16), unos 440-450 dp frente a unos 416 dp disponibles. En 800 dp o más cabe. Con la cancelación fallida se añade además el bloque de error y un tercer botón («Salir del viaje»), que agrava el caso.
- Regla incumplida: rúbrica, sin recortes con escala grande; criterio de la guía sobre botones sin recorte y acciones siempre alcanzables. El riesgo es el mismo ya abierto en CA-002-09 («panel + acciones pueden superar la pantalla»).
- Corrección (al `implementer`): cuando `confirmCancel` o `confirmExit` esté abierto, o bien meter la tarjeta dentro del `ScrollView`, o bien subir el tope del panel (por ejemplo a 0,9 de la altura) mientras dura la confirmación, dejando que el mapa ceda. Sin cambiar textos, testID ni flujo.
- Estado: estimado por lectura; **No verificado en dispositivo** (probar al 200 % en un celular corto).

### H-2 (baja) El punto de recogida solo se distingue por un icono
- Dónde: `:344-349`. La fila de dirección usa `radio-button-on` (recogida) o `location` (destino) sin palabra que diga «recogida».
- Qué pasa: con «Llegué» y su ayuda retirados (D-200), la dirección es lo único que dice adónde va el conductor; el significado depende de un icono (el estilo del proyecto pide icono más texto) y el lector de pantalla lee la dirección sin decir qué es.
- Regla: guía de estilo, «iconos siempre con texto»; accesibilidad, el significado no debe depender solo de un icono.
- Corrección: etiqueta accesible «Punto de recogida: <dirección>» (y «Destino: …») y, si Anderson lo aprueba, una etiqueta visible corta. El texto nuevo es copy: pasa por el `spec-author` y se añade en es y en. No bloquea.

### H-3 (baja) Sin señal de que hay más contenido al desplazar
- Dónde: `ScrollView` del panel (`:323-326`), sin indicador ni degradado.
- Qué pasa: al 200 % y en pantallas cortas, la dirección (la última fila) puede quedar bajo el pliegue y no hay pista visual de que se desplaza.
- Corrección: dejar visible el indicador de desplazamiento (`showsVerticalScrollIndicator` ya es verdadero por defecto en iOS y se desvanece en Android) o reducir el tope de líneas de la cifra. Verificar primero en el celular si realmente ocurre; si no, descartarlo.

## Observaciones (no cuentan como hallazgo)
- O-1: sin botón ni ayuda, el panel es una pantalla de espera; es lo que D-200 ordena. Si en el celular Anderson siente que «Cancelar viaje» queda huérfano, la salida es una línea informativa (no un botón) en el pie de la cifra, a decidir por spec; hoy no se cambia.
- O-2: mientras la cancelación está abierta y el conductor llega, la confirmación sigue visible y «Pasajero a bordo» espera a cerrarla. Es consistente con el diseño actual.
- O-3: textos sin `numberOfLines` y botones con `maxFontScale` 1,5 cumplen la regla del proyecto, pero el texto del cuerpo escala sin tope; es lo que se quiere al 200 %.

## Veredicto
**Diseño: Con hallazgos, pendiente de capa E.** Jerarquía, accesibilidad de «Cancelar viaje» y transición cumplen en lo estático; no hay hallazgos bloqueantes. H-1 (media) debe corregirse o descartarse con una prueba en el celular. No se da nota de Taste ni de Impeccable (no hay capturas). No se aprueba definitivamente hasta que Anderson aporte capturas del celular en `docs/diseno/auditorias/capturas/` (T-287 sigue «Pendiente» en Estado).

## Cuando Anderson pruebe en el celular (STOP-9, pendiente)
1. Aceptar una solicitud: «Conductor llegando» con cifra, pasajero, dirección y «Cancelar viaje», sin otros botones.
2. Esperar la llegada automática (la aproximación simulada está acotada a 25 s): el chip pasa a «Llegaste al punto de recogida» y aparece «Pasajero a bordo».
3. Repetir con fuente al 200 % y abrir «Cancelar viaje»: confirmar si la tarjeta entera se ve (H-1).
4. Capturas a `docs/diseno/auditorias/capturas/`.

## Ronda 2 (por código; sin celular)
Alcance: `TripActiveScreen.js`, claves `trip.pickupPointA11y` y `trip.destinationA11y` (`es.js`, `en/trip.js`) y `labelsEsPaths.json`. Sin capturas: **No verificado en dispositivo** todo lo visual (altura real al 200 %, TalkBack).

### H-1 Resuelto (por código)
- Con `confirmCancel` o `confirmExit` abierto, la tarjeta se pinta dentro del `ScrollView` (`{confirming ? actions : null}`, `:377`) y el panel sube su tope de 0,65 a 0,9 de la altura (`PANEL_CONFIRM_MAX_SHARE`, `:47`, `:332`). El scroll cede espacio (`flexShrink: 1`) y baja al final al abrir (`onContentSizeChange` + `scrollToEnd`, `:337-339`), así que la tarjeta es alcanzable aunque no quepa.
- Botones: siguen siendo `SecondaryButton`/`PrimaryButton` (mínimo 48 dp, `minHeight`). Textos, `testID` (`trip-active-cancel-confirm`, `-yes`, `-keep`, `-exit`, `trip-active-exit-confirm*`) y flujo sin cambios. Fuera de confirmación, las acciones siguen fuera del scroll, siempre visibles.
- Reserva: con 0,9 y el 200 % en un celular muy corto el mapa casi desaparece; es el trato aceptado (el mapa cede). **No verificado en dispositivo.**

### H-2 Resuelto (por código)
- La fila de dirección es `accessible` con `accessibilityLabel` = «Punto de recogida: {address}» en `toPickup`/`atPickup` y «Destino: {address}» en `toDestination`/`atDestination` (`:310-313`, `:359`); el texto visible no cambia.
- Paridad: es «Punto de recogida: {address}» / «Destino: {address}»; en «Pickup point: {address}» / «Destination: {address}». Mismo marcador `{address}`. El fixture `labelsEsPaths.json` tiene ambas claves con el valor es exacto.
- Queda como opción de Anderson la etiqueta visible corta (no se pidió; no bloquea).

### H-3
Sin cambio: sigue pendiente de confirmar en el celular; no bloquea.

### Veredicto de la ronda
H-1 y H-2 resueltos por código. **Diseño: Aprobado (por código; No verificado en dispositivo).** Sin nota de Taste ni Impeccable (no hay capturas). La capa E (STOP-9) sigue pendiente y es de Anderson.
