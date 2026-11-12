# Auditoría de diseño: propina, calificación y direcciones (2026-11-12)

Alcance: revisión estática de código (sin capturas ni celular). Fuente: `docs/diseno/guia-de-estilo.md` y `src/theme/tokens.js`. Capas A, C, D y E no ejecutadas; esto es capa B parcial sobre código. Nada se aprueba visualmente: todo lo visual queda «pendiente de dispositivo».

**Diseño: Aprobado con observaciones** (condicionado a la capa E en el celular).

## Lo que cumple

(a) TripDetailScreen, fila Calificación (`src/screens/main/TripDetailScreen.js:89-105`)
- Color solo por token: `color.warning` (relleno) y `color.textMuted` (contorno); tamaño `iconSize.md`; sin hex ni tamaños literales.
- Contraste según la guía: warning/surface 6.33 y textMuted/surface 7.29, ambos sobre 4.5 y 3.
- El relleno y el contorno se distinguen por forma (`star` frente a `star-outline`), no solo por color.
- Etiqueta accesible en el contenedor (`accessible` + `view.rating.a11y`): "Calificación N de 5". Los iconos quedan agrupados bajo esa etiqueta.
- 200 %: `flexWrap: 'wrap'` y `gap`, la etiqueta con `flexShrink: 1`. Las estrellas no escalan con la fuente, así que caben; en el peor caso bajan de línea.
- No es interactivo, así que el mínimo táctil no aplica.
- Sin calificación: texto "Sin calificación" con `type.bodyStrong` en `color.text`, no solo vacío.

(b) TripSummaryScreen (`src/screens/trip/TripSummaryScreen.js:307-318`)
- Propina y Total cobrado usan `DataRow`, que aplica `type.numeric`. Las dos filas solo aparecen si `tip > 0`.
- Valor con `flexShrink: 1` y alineación `flex-start`: a 200 % el importe y la etiqueta se envuelven sin desbordar.
- Etiqueta accesible por fila ("Propina: + $X").
- El número principal sigue siendo "Tu ganancia" (`type.display`).

(c) TripRequestScreen y TripActiveScreen
- "Buscando dirección…" es estado en texto, no solo color ni icono.
- El fallback "Calle cercana (simulada)" es explícito y honesto.
- Sin `numberOfLines`: una dirección de 120 caracteres se envuelve entera y no se corta.
  - Solicitud: `Text` dentro de `View` con `flex: 1` (líneas 324-335).
  - Activo: `styles.flex` (línea 328).
- Las acciones de la solicitud están fuera del `ScrollView`, así que el crecimiento del texto no empuja los botones.

(d) Historial (`src/components/TripListItem.js:67-76`, `place: flex: 1`)
- Sin `numberOfLines`, con `alignItems: 'flex-start'`: las direcciones largas se envuelven y el icono queda alineado con la primera línea.
- La cabecera usa `flexWrap`. El importe usa `DataRow`. `HistoryScreen.js` no pinta direcciones por sí mismo.

## Hallazgos (máximo tres por ronda)

1. **Salto de altura al resolver la dirección** — `src/screens/trip/TripRequestScreen.js:326` y `:335` (también `TripActiveScreen.js:328`). Severidad: media-baja.
   - Regla incumplida: sin saltos de layout y altura estable.
   - Qué pasa: "Buscando dirección…" ocupa una línea. Al llegar la calle, el texto puede pasar a 2 o 3 líneas (más a 200 %) y todo lo de abajo se desplaza. Sucede mientras corre la cuenta regresiva y la persona puede estar a punto de tocar Aceptar. En la solicitud, los botones están fijos fuera del scroll, así que el daño es solo de lectura. En TripActive el panel puede crecer sobre el mapa.
   - Arreglo propuesto: reservar la altura con `minHeight` equivalente a 2 líneas de `type.body` mientras `originPending` o `destinationPending` sea verdadero (el hook ya los expone). En TripActive, verificar en el celular que el panel no tape el mapa a 200 %.
   - Estado: la magnitud real queda «pendiente de dispositivo».

2. **El estado "buscando" se ve igual que una dirección real y no se anuncia** — `TripRequestScreen.js:326, 335`; `src/hooks/useRequestAddresses.js:12`. Severidad: baja.
   - Regla incumplida: el estado transitorio debe distinguirse (jerarquía) y ser perceptible para lector de pantalla. El texto usa `styles.body` en `color.text`, igual que la calle final.
   - Arreglo propuesto: usar `color.textMuted` (7.29 sobre surface) mientras `originPending` o `destinationPending` sea verdadero. Añadir `accessibilityLiveRegion="polite"` a ese `Text` para que se anuncie el cambio, o dejarlo mudo a propósito y registrarlo. Para el contorno inactivo y el estado de texto, no depender solo de color: el texto "Buscando…" ya lo cubre.

3. **Orden de las filas de importes en el resumen** — `TripSummaryScreen.js:309-316`. Severidad: baja (jerarquía).
   - Regla incumplida: jerarquía y proximidad (agrupar lo relacionado).
   - Qué pasa: el orden es Tarifa, Propina, Total cobrado y luego Comisión (con `- `). La comisión se calcula sobre la tarifa, no sobre el total, pero al ir después del total se lee como "Total menos comisión". "Total cobrado" tiene el mismo peso que las demás filas y no se destaca como suma.
   - Arreglo propuesto: Tarifa, Comisión, Propina, Total cobrado. Alternativa: dejar el orden y añadir un separador visual (`space`, sin bordes, por la regla de la pantalla) antes de Total cobrado. Si se quiere énfasis, `emphasis` en `DataRow` usa `type.heading` en `color.primary`. Hay que ver si compite con "Tu ganancia", que es la cifra única; recomendación: no usarlo.

## Observaciones menores (sin numerar, no bloquean)

- `labels.js:361` define `noRatingA11y: 'Calificación: sin calificación'`, mientras que el texto visible es "Sin calificación". Es coherente, solo repetitivo al oído.
- La fila Calificación lleva `borderBottom` y la fila Estado no, mientras que `DataRow` sí lo tiene. Revisar en el celular que el ritmo de separadores se vea parejo.
- `TripListItem` concatena la dirección completa en `accessibilityLabel`. Con direcciones de 120 caracteres el anuncio es largo; probar con TalkBack y VoiceOver.

## Pendiente de dispositivo (capa E)

- Altura real y desplazamiento de las direcciones largas a fuente 200 % en solicitud, viaje activo e historial.
- Si el panel de TripActive tapa el mapa con 2 o 3 líneas de dirección.
- Legibilidad del contorno de estrella inactiva (`textMuted`) sobre la tarjeta en pantalla real, con brillo bajo y exterior.
- Anuncio de lector de pantalla del cambio "Buscando dirección…" a calle (hallazgo 2).

## Veredicto y siguiente paso

Aprobado con observaciones. Los tres hallazgos son de severidad baja a media y no bloquean; conviene resolver 1 y 2 antes de la capa E para no revalidar. Ronda 1 de 3 para estas pantallas. Las skills de diseño no se cargaron: se usaron solo la guía de estilo y los tokens, como se pidió. Nada chocó con el proyecto.
