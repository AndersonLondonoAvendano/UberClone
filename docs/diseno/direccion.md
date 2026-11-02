# Dirección de arte A «Tablero»

Estado: Aprobado por Anderson (2026-10-27), registrado por el agente principal (D-25, Vigente).

## Idea en una frase
El panel de un taxímetro: neutros fríos y calmados; el único color va en el dato vivo (tarifa, temporizador, estado Disponible).

## Qué hace la dirección
- Fondo gris frío (`color.bg`) y superficies blancas planas (`color.surface`); se separa con escalón de tono, no con líneas ni sombras.
- Un acento teal (`color.primary`) reservado a la acción principal y al dato vivo.
- Los indicadores son tipografía (`type.display`, cifras tabulares), no tarjetas con ícono.
- La navegación se retira: el mapa y el dato de la tarifa mandan en la pantalla de inicio.
- Estados de datos honestos: un cero se muestra como cero, un vacío conserva su marco, un error explica y deja reintentar.
- Palabras del oficio en las etiquetas (tarifa, comisión, ganancia neta, recogida, destino).
- Un elemento propio: la franja de «tarifa en vivo».
- Tema claro único (D-26), tipografía del sistema, táctil ≥ 44 px.

Los tokens y patrones viven en `DESIGN.md`; de dónde salen las reglas, en `docs/diseno/referencias.md`.

## Lo prohibido
- Sombras en reposo (la sombra solo en hojas sobre el mapa).
- Degradados.
- Brillos (glow).
- Tarjetas con ícono en círculo tintado.
- Minigráficas (sparkline) en los indicadores.
- Acento repartido por todo el chrome (barras, títulos, íconos inactivos).
- Azul genérico de app de transporte.
- Marca, activos o el negro y blanco de Uber.
- Emoji como íconos.
- Color como único canal de estado.
- Texto por debajo de 12.
- Objetivos táctiles por debajo de 44 px.
- Hex sueltos fuera de los tokens de `DESIGN.md`.
- Fuentes personalizadas.
- Pares de color que no estén en la tabla de contraste de `DESIGN.md` (p. ej. texto blanco sobre `success`, `warning` o `danger`).
