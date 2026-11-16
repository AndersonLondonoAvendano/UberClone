# Ronda 1 — Control compacto «Idioma / Language» sin sesión (T-270, auditoría T-271) — 2026-11-16

Ronda estática por lectura del código. No hay capturas del celular. El arnés web no se pudo ejecutar: Playwright no está instalado (`node_modules/playwright` no existe). Nada de esto se presenta como visto en el dispositivo.

Archivos leídos: `LanguageSection.js` (variante `compact`), `AuthScreenLayout.js`, `WelcomeScreen.js`, `PlaceholderScreen.js` (`showLanguageSwitch`), `PersonalDataScreen.js`, `VehicleScreen.js`, `DocumentsScreen.js`, `SettingsScreen.js`, `tokens.js`, la adenda CA-006-D4 y CA-006-36.

## Capas

| Capa | Resultado | Nota |
|---|---|---|
| A automática | Parcial | Contraste calculado con script temporal (abajo). Arnés no disponible. No ejecuté `npm test`. |
| B crítica sobre capturas | No aplica | Sin capturas. |
| C audit / critique | Hecha por lectura | Sin P0 ni P1. Una nota P3. |
| D checklist | Hecha por lectura | Ver veredictos. |
| E celular | Pendiente | T-272. |

## Contraste (script temporal en el scratchpad, fuera del proyecto)

| Par | Razón | Umbral |
|---|---|---|
| Título compacto `textMuted` sobre `bg` | 6,46 | 4,5 (ok) |
| Nombre `text` sobre `surface` | 16,76 | 4,5 (ok) |
| Nombre activo `onPrimarySoft` sobre `primarySoft` | 8,79 | 4,5 (ok) |
| Icono `primary` sobre `primarySoft` | 5,12 | 3 (ok) |
| Borde inactivo `border` sobre `bg` / `surface` | 3,45 / 3,90 | 3 (ok) |
| Borde activo `primary` sobre `bg` | 5,39 | 3 (ok) |

## Veredicto por criterio

| Criterio | Veredicto | Evidencia |
|---|---|---|
| Ubicación y discreción (RI-25c) | Aprobado | Pie de pantalla. En `AuthScreenLayout.js:48-50` va después de los hijos (formulario y enlaces); en `WelcomeScreen.js:128` es el último bloque, tras el botón principal y el cierre de sesión; en `PlaceholderScreen.js:114` va después del contenido. Título pequeño `type.label` en `textMuted` (`LanguageSection.js:110`), sin tarjeta, sin fondo propio, sin gradientes ni bordes laterales de color. |
| Jerarquía frente al botón principal | Aprobado | El botón primario sigue siendo el único elemento relleno de color `primary`. Las opciones son contorno de 2 px (`borderWidth.thick`) sobre `surface`; la activa usa `primarySoft`, un tono suave. Por ser el último elemento y estar bajo el botón, no lo desplaza. |
| Tamaño táctil (RI-25b, CA-006-36) | Aprobado por código; táctil real Pendiente de dispositivo | `minHeight: touch.controlHeight` (48) en `:98`; `optionCompact` añade `minWidth` 96 y `flexGrow` (`:112`). Dos opciones lado a lado reparten el ancho (unos 160 dp en 360 dp). La separación es `space[2]` (8). |
| Accesibilidad y estado no solo color | Aprobado | Rol `radio`, `accessibilityState` `selected` y `checked` solo en la activa, grupo `radiogroup` con etiqueta (`:50-54, :62-64`). La activa añade peso (`bodyStrong`), borde y fondo, y el icono `checkmark-circle`. La variante compacta omite el texto «Activo», pero el icono más el peso bastan para RI-25b («icono o texto además del color»). |
| Coherencia con Configuración | Aprobado | Mismo componente, mismos `OPTIONS`, `setLanguage` y aviso `language-not-saved`. Solo cambia la presentación (título menor, fila, sin «Activo»). `SettingsScreen.js:63` usa la versión completa y no activa `showLanguageSwitch`, así que no hay dos controles. |
| Teclado abierto | Aprobado por código; Pendiente de dispositivo | El control está dentro del `ScrollView` con `KeyboardAvoidingView`, al final del contenido. No está fijo ni flotante, así que no puede tapar campos ni empujar el botón principal; solo se alcanza desplazando. Mismo patrón de teclado que ya existía. |
| Inglés largo (títulos y opciones) | Aprobado | Título «Idioma / Language» idéntico en ambos idiomas (corto). Los nombres de opción son fijos («Español», «English») y no dependen del idioma activo. `name` tiene `flexShrink: 1`. |
| Fuente al 200 % | Pendiente de dispositivo (una nota P3) | Sin alturas fijas: `minHeight`, no `height`. El título envuelve. Ver P3-1. |
| Fallo de guardado | Aprobado | El aviso `Card status warning` con icono se muestra en línea; no es un diálogo y no rompe el formulario. |

## Hallazgos

Ningún P0, P1 ni P2. No hay hallazgos bloqueantes.

**P3-1 (no bloquea; vigilar en la captura al 200 %).** `LanguageSection.js:112` y `:75-79`. Con la fuente al 200 %, «Español» ocupa unos 110 dp. La opción activa reparte unos 132 dp útiles entre el nombre, `gap` 12 y un icono de 24 dp que no escala, así que el nombre podría partirse a mitad de palabra («Españo/l») solo en la activa. No lo pude medir sin dispositivo. Corrección sugerida si la captura lo confirma: en la variante compacta, apilar las opciones en columna cuando `PixelRatio.getFontScale() >= 1.5` (`flexDirection: 'column'`), o quitar el `gap` y reducir el icono a `iconSize.md`. No la apliqué.

## Para el celular (capa E) — No verificado en dispositivo

- Capturas es y en, al 100 % y al 200 %, de bienvenida, inicio de sesión, registro de cuenta, recuperar contraseña (hereda el layout) y las tres pestañas del registro. Comprobar que «Español» no se parte en la opción activa (P3-1).
- Con el teclado abierto en cada formulario: el control queda fuera de la vista sin tapar el botón principal.
- Área táctil real (≥ 48 dp) y TalkBack/VoiceOver: lectura de «radio, seleccionado» y del nombre del grupo.
- Cambiar de idioma a mitad de un registro conserva lo escrito y la pestaña (CA-006-35d).
- Instalar Playwright si se quieren capturas web del arnés.

## Campo Diseño

| Tarea | Veredicto |
|---|---|
| T-270 | Aprobado (estático, por código). Capa E pendiente: **No verificado en dispositivo** (CA-006-D4, tamaño táctil real, teclado, fuente al 200 %). |

Ninguna tarea pasa a «Validada» sin la evidencia del celular (T-272).
