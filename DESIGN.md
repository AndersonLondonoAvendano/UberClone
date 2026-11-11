# DESIGN

Estado: Aprobado por Anderson (2026-10-27) para lo que existía hasta esa fecha; las adiciones de 2026-11-01 (spec-author, spec 001-registro-conductor: patrones de selector desplegable, selector de fecha, captura de foto y casilla de verificación, y sus filas del contrato de testID) quedaron confirmadas por Anderson el mismo día (prompt #25, vía D-56/DP-09 Vigentes); no contradicen tokens existentes. Incluye el contrato de testID. Dirección A «Tablero» (D-25, Vigente). Nivel de diseño "cuidado" (supuesto P-12). Las skills de diseño (Taste, Impeccable, UI UX Pro Max) se consultaron leyendo su `SKILL.md`, no se cargaron con la herramienta Skill al escribir este documento (D-28, Reemplazada por D-37: desde T-05 se cargan con Skill); `draw.mjs` y los scripts de las skills no se ejecutaron. Detalle en `docs/diseno/referencias.md`. No introduce dependencias nuevas: todo se resuelve con lo que trae React Native y con las fuentes del sistema. La constitución §11 limita el código a los tokens de este archivo. Nota: la adición del token `opacity.pressed` es la decisión D-39 (aprobada por Anderson, 2026-10-27, registrada por el agente principal). Nota: la adición del token `borderWidth.thin` es la decisión D-42 (aprobada por Anderson, 2026-10-27, registrada por el agente principal). Nota: la adición del token `opacity.disabled` es la decisión D-74 (aprobada por Anderson, 2026-11-04, registrada por el agente principal).

## Dirección
«El panel de un taxímetro»: neutros fríos y calmados; el único color va en el dato vivo (tarifa, temporizador, estado Disponible). Qué hace y qué prohíbe: `docs/diseno/direccion.md`.

- Fondo gris frío, superficies blancas planas, escalón de tono para separar.
- Los importes, tiempos y distancias son tipografía grande con cifras tabulares, no tarjetas con ícono.
- Una sola acción principal por pantalla.
- El mapa es protagonista en la pantalla de inicio; la navegación se retira cuando no hace falta.
- Tema claro único (D-26); coincide con `userInterfaceStyle: "light"` del scaffold (D-22 lo revisa el planner). Modo oscuro: no encontrado en F1; no se propone.

## Actualización de tokens — rediseño (prompt #51, D-90)
El rediseño amplía los tokens sin renombrar ni borrar ninguno. Valores, roles, escala tipográfica, espaciado, radios, elevaciones, contrastes y reglas de uso: `docs/diseno/guia-de-estilo.md` (fuente en código: `src/theme/tokens.js`). Cambios de valor: `bg` #EEF2F1, `type.display` etc. conservan nombre. Nuevos: `surfaceMuted`, `borderSubtle`, `primaryDark`, `primarySoft`, `onPrimarySoft`, `onBrand`, `onBrandMuted`, `*Soft`, `on*Soft`, `skeleton`, `type.hero/heading/bodyStrong/small`, `space.0/7`, `radius.xl`, `touch.controlHeight`, `elevation`, `motion`.
Esta sección reemplaza lo contrario en las tablas siguientes: las sombras ya no están prohibidas en reposo (`elevation.card`), y `borderSubtle` sí puede separar filas y tarjetas. Los pares de contraste vigentes son los de la guía de estilo.

## Tokens

### Color
Contrastes WCAG 2.x calculados con un script temporal fuera del proyecto (`contrast.mjs` en el directorio temporal de la sesión; no se copia al repo). Mínimos: 4.5:1 texto normal, 3:1 texto grande y límites de componente.

| Token | Valor | Uso |
|---|---|---|
| `color.bg` | #F3F5F4 | Fondo de pantalla |
| `color.surface` | #FFFFFF | Tarjetas, campos, hojas, barras |
| `color.border` | #77847F | Límite de campos, controles y botones secundarios |
| `color.text` | #14201C | Texto principal |
| `color.textMuted` | #4A5A54 | Texto secundario |
| `color.primary` | #006D77 | Acción principal, foco, dato vivo (tarifa, temporizador) |
| `color.onPrimary` | #FFFFFF | Texto e íconos sobre primario |
| `color.success` | #2E7D32 | Disponible, aprobado, pago aprobado |
| `color.warning` | #8A5300 | Pendiente de aprobación o de pago |
| `color.danger` | #B3261E | Error, rechazo, pago rechazado |

Tabla de contraste (pares permitidos):

| Par (frente / fondo) | Razón | Uso permitido |
|---|---|---|
| text / bg | 15.30 | Texto |
| text / surface | 16.76 | Texto |
| textMuted / bg | 6.66 | Texto |
| textMuted / surface | 7.29 | Texto |
| onPrimary / primary | 6.08 | Texto sobre botón primario |
| onPrimary / primary a `opacity.pressed` (0.9), mezclados con el fondo | 4.98 sobre `bg`; 4.95 sobre `surface` (4.95 y 4.93 con canales de 8 bits) | Texto sobre botón primario pulsado |
| primary / bg | 5.55 | Texto, ícono, foco |
| primary / surface | 6.08 | Texto, ícono, foco |
| border / bg | 3.56 | Solo límite de componente (mín. 3) |
| success / bg | 4.68 | Texto e ícono (el par más justo) |
| success / surface | 5.13 | Texto e ícono |
| warning / bg | 5.78 | Texto e ícono |
| warning / surface | 6.33 | Texto e ícono |
| danger / bg | 5.97 | Texto e ícono |
| danger / surface | 6.54 | Texto e ícono |

Reglas de uso:
- Solo se usan los pares de la tabla. Cualquier otro par (p. ej. texto blanco sobre `success`, `warning` o `danger`, o `textMuted` sobre `primary`) no está permitido hasta calcular su contraste y añadirlo aquí.
- `success`, `warning` y `danger` van únicamente como texto o ícono sobre `bg` o `surface`; no como relleno de botón ni fondo.
- `color.border` (#77847F) es un límite de componente (≥ 3:1), no un separador decorativo. Para separar superficies se usa el escalón de tono `bg` → `surface`, sin líneas.
- El estado nunca se comunica solo con color: va con texto o ícono (p. ej. «Disponible» escrito, «Rechazado» escrito).
- El color de acento va en el dato vivo y en la acción principal, no repartido por el resto del chrome (barras, títulos, íconos de navegación inactivos usan `text`/`textMuted`).
- Sin hex sueltos en el código: todo color sale de estos tokens.

### Tipografía
Familia: Inter (D-91) con cuatro pesos cargados como familias distintas (`fontFamily.regular` 400, `medium` 500, `semibold` 600, `bold` 700; en Android el peso se elige por familia, nunca con `fontWeight`). Carga con `useFonts` en `App.js` y salida segura: tras 3 s o ante un error la app sigue con la fuente del sistema. Los tokens `type.*` ya incluyen su familia.

| Token | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `type.display` | 28 / 34 | 700 | Cifras destacadas (tarifa, ganancia, temporizador) |
| `type.title` | 20 / 26 | 600 | Títulos de pantalla |
| `type.body` | 16 / 22 | 400 | Texto y campos |
| `type.label` | 14 / 18 | 500 | Etiquetas, botones secundarios |
| `type.caption` | 12 / 16 | 400 | Ayudas y errores de campo |
| `type.numeric` | — (se compone con otro `type.*`) | — | Cifras tabulares para tarifas, ganancias, tiempos y distancias (RF-11, RF-21, RF-24); se usa junto a otro token, p. ej. `style={[type.display, type.numeric]}` |

- Cifras tabulares (token `type.numeric`, `fontVariant: ['tabular-nums']`) en todo importe, tiempo y distancia, para que las cifras no salten al cambiar.
- Ningún texto por debajo de 12. El cuerpo no baja de 16 en campos de entrada.
- Tolerancia a la escala de texto: los textos usan los `type.*` con interlineado proporcional y los contenedores no tienen altura fija que corte el contenido; los controles crecen en alto (mínimo 48) y el texto puede pasar a dos líneas. Si hace falta limitar el crecimiento, se hace por pantalla y se anota, nunca desactivando el escalado en silencio.

### Íconos (D-91)
Un solo componente, `src/components/Icon.js`, sobre Ionicons de `@expo/vector-icons`. Siempre decorativo (oculto a accesibilidad) y junto a un texto o una etiqueta del control que lo contiene. Tamaños: `iconSize.sm` 16, `md` 20 (por defecto), `lg` 24. Contorno (`-outline`) en estado inactivo y relleno en estado activo. El color sale de un token y se pasa con `tint`.

### Menú lateral y pestañas de registro (D-91)
- Menú lateral (`AppDrawerContent`): cabecera `primaryDark` con forma decorativa, avatar con borde (`avatarSize.md` 64), nombre, marca y modelo, placa y píldora de disponibilidad con texto; cuatro entradas con ícono y texto; la activa es una píldora `primarySoft` con barra de acento (`accentWidth` 4) y relleno; pie con nombre de la app y versión.
- Pestañas de registro (`AppTabBar`): ícono más etiqueta; la activa es una píldora `primarySoft` con ícono relleno, texto más pesado y subrayado, así que no depende solo del color. Alto mínimo 48.

### Espaciado
Escala de 4: `space.1`=4, `space.2`=8, `space.3`=12, `space.4`=16, `space.5`=24, `space.6`=32. Margen lateral de pantalla: 16 (`space.4`).

### Radios
`radius.sm`=8 (campos, chips), `radius.md`=12 (tarjetas, botones), `radius.lg`=20 (hojas inferiores), `radius.full`=999 (interruptores, avatar).

### Ancho de borde
| Token | Valor | Uso |
|---|---|---|
| `borderWidth.thin` | 1 | Ancho del borde de componente: campos de formulario y controles con límite `color.border` |

- Siempre con `color.border` (par border/bg 3.56:1 y border/surface 3.90:1 como límite de componente, ≥ 3:1).
- No se usa como separador decorativo ni como línea entre superficies: la regla del escalón de tono `bg` → `surface` sigue vigente (ver «Elevación»).
- `borderWidth: 0` (ausencia de borde) no necesita token.
- El token se implementa en `src/theme/tokens.js` (lo hace el implementer dentro de T-07); ningún componente usa números sueltos para el ancho de borde. El campo `personal-data-field-shared` lo usa.

### Tamaños táctiles
- Mínimo 44 × 44 px para todo elemento interactivo (con `hitSlop` si el dibujo es menor).
- Altura de botón principal y de campos: 48.
- Separación mínima entre objetivos táctiles contiguos: 8.

### Elevación
- Superficies planas, sin sombra en reposo; la jerarquía se da con el escalón de tono `bg` → `surface`.
- Sombra solo en hojas sobre el mapa (propiedades de sombra/elevación que ya trae React Native).
- Sin degradados, brillos (glow) ni bordes decorativos.

### Opacidad
| Token | Valor | Uso |
|---|---|---|
| `opacity.pressed` | 0.9 | Estado pulsado de un control con relleno (botón primario) |
| `opacity.disabled` | 0.5 | Estado de solo lectura/bloqueado de un campo de formulario (T-31) |

- Regla: el estado pulsado se indica bajando la opacidad de TODO el control (relleno y texto) a `opacity.pressed` dentro de 80–150 ms, sin cambiar el layout (sin escalas ni movimientos) y sin otra variación de color.
- Contraste del botón primario pulsado (`onPrimary` sobre `primary`, mezclados con el fondo detrás): 4.98:1 sobre `bg` y 4.95:1 sobre `surface` (con canales de 8 bits redondeados, como los pinta el celular: 4.95:1 y 4.93:1; en los tres casos por encima de 4.5). Cálculo con un script temporal fuera del proyecto (0.85 → 4.50 sobre `bg` y 4.47 sobre `surface`; 0.88 → 4.78; 0.90 → 4.95; 0.92 → 5.18; 0.94 → 5.39).
- Por qué 0.9: deja un margen de 0.45 sobre el mínimo de 4.5 y mantiene un pulsado perceptible (0.85 ya no cumple sobre `surface`).
- Regla: el estado bloqueado (`isLocked`, T-31) atenúa TODO el campo (marco, texto y control) a `opacity.disabled`, sin cambiar layout ni tipografía; se combina con `editable=false`/`disabled` en el control nativo, nunca solo con el estilo visual.
- Por qué 0.5: WCAG no exige un mínimo de contraste para controles deshabilitados (no son contenido activo), así que el valor no viene de un cálculo de contraste sino del uso perceptual estándar de iOS/Android para "deshabilitado" — claramente distinto de `opacity.pressed` (0.9, casi opaco) para que bloqueado y pulsado no se confundan.
- El token se implementa en `src/theme/tokens.js` (`opacity.pressed` lo hizo T-06; `opacity.disabled` lo hace T-31, decisión D-74); ningún componente usa números sueltos para la opacidad.

### Movimiento
- Duración ≤ 250 ms y solo con función (transición de estado, temporizador, aparición de hoja).
- Solo `transform` y opacidad.
- Respeto de «reducir movimiento»: se consulta `AccessibilityInfo.isReduceMotionEnabled` de React Native y, si está activo, el cambio es instantáneo. Sin dependencia nueva (no se usa `react-native-reanimated`, que está en `proposed`).

## Patrones de pantalla
- Campos de formulario: etiqueta arriba (`type.label`), borde `color.border` con ancho `borderWidth.thin`, error de campo bajo el campo en `color.danger` con `type.caption` y texto explícito (RF-03).
- Estado de pantalla remota: tres variantes distintas y reconocibles (constitución §5).
  - Cargando: indicador y, cuando se sabe la forma, el marco de lo que llegará.
  - Vacío: conserva su marco y su mensaje dice qué falta Y qué hacer, sin referirse a controles que no existan (D-40; el texto se corrige en `labels.js` dentro de T-06); un cero es un «0» o «$ 0», no un hueco.
  - Error: explica qué falló y ofrece reintentar (`btn-retry`).
- Temporizador de solicitud: cifra `type.display` en `color.primary` con cifras tabulares y barra de progreso; el tiempo restante es legible como texto (RF-11).
- Interruptor Disponible/No disponible: el estado se lee por texto («Disponible» en `color.success`; «No disponible» en `color.textMuted`) además del interruptor (RF-08).
- Importes: COP enteros con separador de miles, en cifras tabulares; etiquetas del oficio (tarifa, comisión, ganancia neta) sin ambigüedad (RF-21, RF-22).
- Indicadores clave (KPI): tipografía grande con su etiqueta, sin tarjeta con ícono en círculo y sin minigráficas.
- Navegación: pestañas y Drawer en `surface`, texto `text`/`textMuted`, el destino activo se marca con peso/subrayado y texto, no con relleno de color de acento.
- Elemento propio del producto: la franja de «tarifa en vivo» (cifra grande en `color.primary`) como pieza reconocible de la dirección.
- Íconos: sin emoji. Sin librería de íconos propuesta (ver conflictos pendientes): se usan texto y formas básicas de `View` hasta que haya decisión.
- Selector desplegable (categoría, color, género, idioma): mismo patrón de campo de formulario (etiqueta arriba, borde `color.border` con `borderWidth.thin`); al tocarlo abre un `Modal` con la lista de opciones en `FlatList` sobre `color.surface`; la opción activa se marca con texto/peso, igual que la navegación (sin relleno de color de acento); sin dependencia nueva (D-56, Propuesta; spec 001).
- Selector de fecha (fecha de nacimiento): mismo patrón de campo de formulario (etiqueta arriba, borde `color.border`); al tocarlo abre el selector nativo (`@react-native-community/datetimepicker`, DP-09 aprobada, prompt #25) en modo `date`; sin personalización de color del selector (sin tokens nuevos), spec 001.
- Captura de foto (foto de perfil, foto del vehículo): campo con marco `color.border`; muestra la foto ya elegida o, si está vacío, un marcador con la instrucción de qué hacer (cámara o galería); mientras la foto sube, se ve un indicador; si la subida falla, el error aparece bajo el campo con el mismo patrón de error de campo (spec 001, D-54).
- Casilla de verificación (términos y condiciones): objetivo táctil de al menos 44 × 44 px con el texto explicativo junto (incluye el porcentaje de comisión cuando aplique); si no está marcada al intentar enviar, usa el mismo patrón de error bajo el campo (spec 001).
- Campo bloqueado (registro ya enviado o precargado, `isLocked`, T-31, D-74): los cinco campos (TextField, SelectField, DateField, PhotoField, CheckboxField) quedan en solo lectura — `editable=false` o `disabled` en el control nativo, sin abrir selector/galería/cámara — con el mismo marco atenuado a `opacity.disabled` y `accessibilityState={{ disabled: true }}`; el aviso «Pendiente de aprobación» y el mensaje de confirmación de envío (D-72) siguen igual.

## Contrato de testID
Todo elemento interactivo y todo contenedor de estado lleva un `testID` estable. Sirve a las pruebas manuales y automáticas y al arnés visual (`scripts/visual-audit.mjs`, que localiza elementos por `testID`). Cambiar un `testID` es cambiar un contrato: se anota en la spec correspondiente.

Convención: kebab-case, minúsculas, ASCII, sin espacios ni acentos.

| Elemento | Forma | Ejemplo |
|---|---|---|
| Pantalla (contenedor raíz) | `screen-<pantalla>` | `screen-home` |
| Elemento de una pantalla | `<pantalla>-<elemento>` | `login-submit`, `home-availability-switch` |
| Pestaña | `tab-<destino>` | `tab-personal-data`, `tab-vehicle`, `tab-documents` |
| Entrada del Drawer | `drawer-<destino>` | `drawer-profile`, `drawer-history`, `drawer-earnings`, `drawer-settings` |
| Abrir Drawer / atrás | `nav-open-drawer`, `nav-back` | |
| Estado de pantalla | `state-loading`, `state-empty`, `state-error` | |
| Reintentar | `btn-retry` | |
| Campo de formulario | `<pantalla>-field-<campo>` | `register-field-email` |
| Error de campo | `<pantalla>-error-<campo>` | `register-error-email` |
| Opción de una lista desplegable | `<pantalla>-field-<campo>-option-<valor>` | `personal-data-field-gender-option-femenino` |
| Fila de lista | `<lista>-item-<id>` | `history-item-42` |

Reglas:
- Deben llevarlo: botones, campos, interruptores, pestañas, entradas del Drawer, botón de atrás, filas tocables de listas, los tres estados de pantalla y `btn-retry`.
- Los `<pantalla>`, `<destino>`, `<elemento>` y `<campo>` van en inglés, igual que los identificadores del código.
- En `state-*` se usa el prefijo literal, no `<pantalla>-state-*`; si hay varios estados en una pantalla, el contenedor de cada estado se distingue por el `screen-<pantalla>` que lo contiene.
- El `testID` no sustituye a la etiqueta de accesibilidad: los controles llevan además su texto/`accessibilityLabel`.
- Los `testID` de pestañas y Drawer los fija la spec 000 (RF-30); los de las demás pantallas, la spec de cada una.

## Qué debe refinarse
- Capturas en celular real (capa E de `docs/diseno/rubrica.md`): lo que solo se ve en el celular está "No verificado en dispositivo".
- Crítica de Taste, `audit` y `critique` de Impeccable y checklist de UI UX Pro Max sobre pantallas reales, con las skills cargadas con Skill (D-37, P4).
- Sistema de íconos sin dependencia nueva: pendiente.
- Para la auditoría T-12 (D-40): marco tenue del estado vacío (solo escalón de tono `surface` sobre `bg`, 1.09:1) y `accessibilityLabel` de carga (en el contenedor, sin `accessible`).

## Pendiente de decisión
D-25, D-26, D-37, D-39 y D-40 están Vigentes en `docs/decisiones.md`. Íconos: `@expo/vector-icons` solo si ya está en `package.json` (hoy no está); si no, texto y formas de `View` (D-29). Nuevo desde 2026-11-01 (spec 001): D-56 (desplegables con `Modal`/`FlatList`) quedó Vigente (prompt #25); los cuatro patrones (selector desplegable, selector de fecha, captura de foto y casilla de verificación) quedan confirmados junto con ella, salvo el de selector de fecha, corregido arriba para usar el selector nativo (DP-09, también aprobada en el prompt #25) en vez de `Modal`/`FlatList`. Ninguno introduce tokens nuevos; el selector de fecha y la captura de foto sí añaden las dependencias nativas ya aprobadas en D-65.
