# Ronda 1 — Idioma (T-254 selector, T-263 textos EN al 200 %) — 2026-11-16

Ronda estática por lectura del código fuente (capas A-D parciales). No hay capturas del celular ni del arnés: nada de esto se presenta como visto en el dispositivo. Todo lo que depende del render real queda «No verificado en dispositivo».

## Capas

| Capa | Resultado | Nota |
|---|---|---|
| A automática | No ejecutada por el auditor | Sin build nativo ni procesos de fondo; la corre el agente principal. |
| B crítica sobre capturas | No aplica | Sin capturas; se audita el código. |
| C audit / critique (Impeccable, nativo) | Hecha por lectura | Puntuación abajo. |
| D checklist UI UX Pro Max | Parcial | Contraste calculado a mano desde `tokens.js`; no medido con script. |
| E celular | Pendiente | Ver «Para el celular». |

Puntuación (0-4): Accesibilidad 3, Rendimiento 4, Tema 4, Conformidad de plataforma 3, Adaptividad 3.

Nota de texto: el encargo dice «Reject» e «I've arrived»; en el código real son «Decline» e «I arrived».

## Hallazgos (máximo 3)

### P2-1. Marcas del eje de la gráfica semanal se cortan en inglés
- Dónde: `src/components/BarChart.js:62` (`numberOfLines={1}`), `:92` (estilo `tick`, sin `maxFontSizeMultiplier`); etiquetas `src/i18n/dictionaries/en/account.js:50` frente a `es.js:347`.
- Problema: EN usa «Mon, Tue, Wed, Thu…» con mayúscula inicial, más anchas que las de ES en minúscula. Al 200 % la marca llega a unos 24 px en columnas de unos 41 px, sin tope de escala y con una sola línea, así que se trunca («Mo…»).
- Regla: texto legible al 200 % sin cortes (CA-006-D2; rúbrica de accesibilidad).
- Corrección: añadir `maxFontSizeMultiplier={maxFontScale}` al tick y `adjustsFontSizeToFit` con `minimumFontScale`, o usar abreviaturas EN de dos letras, o adelgazar con `MAX_VISIBLE_LABELS` (`src/utils/chartLayout.js`).

### P2-2. El texto del Chip no encoge
- Dónde: `src/components/Chip.js:23` (Text sin `flexShrink: 1`); lo usa `src/components/TripListItem.js:70`.
- Problema: la etiqueta EN más larga, «Payment without status» (`en/account.js:63`), con icono puede rebasar el ancho unos 20 px al 200 % en pantallas estrechas. El contenedor `head` hace wrap, pero el chip mismo no.
- Corrección: `flexShrink: 1` en el Text del chip (y `flexShrink: 1` en el propio chip).

### P3-1. Detalles menores del selector y filtros
- `src/components/settings/LanguageSection.js:47`: el grupo de radios no tiene `accessibilityLabel` (el título «Idioma / Language» queda fuera del grupo). `:101`: la fila `check` no encoge.
- `src/components/HistoryFilters.js:109-110`: chips a `touch.min` (44 dp), por debajo de 48 dp; es la convención del proyecto, solo se registra.

## Positivos
- Selector (T-254): el estado seleccionado no depende del color; icono `checkmark-circle`, texto «Activo/Active», borde y fondo. Contraste calculado a mano holgado (texto ≥ 4.5:1, icono ≥ 3:1). Opciones con `minHeight: touch.controlHeight` (48). Cada idioma en su propio idioma. Roles `radio` y estado `selected/checked`; aviso de «no guardado» con live region.
- Orden en Configuración coherente: información, cuenta, Notificaciones, Idioma (`SettingsScreen.js:37-64`).
- `PrimaryButton` y `SecondaryButton`: `minHeight 48`, sin `numberOfLines`, tope 1.5; Aceptar, Rechazar, Llegué, Finalizar y Cobro envuelven en vez de cortar.
- Contador «Expires in {s} s» (16 caracteres frente a 14): centrado, sin `numberOfLines`, tope 1.5, en bloque de ancho completo.
- `HistoryFilters`, `TripListItem`, `DataRow` y Detalle del viaje: filas con `flexWrap` y `flexShrink`, sin truncado. Barra de pestañas: apila desde 1.15 y reduce con `adjustsFontSizeToFit`. Drawer: EN no es más largo que ES.

## Cola de menores
Sin otros. No se revisaron: formularios de registro (`SelectField`, `PhotoField`, `DateField`, `en/registration.js`), `AuthBackdrop`, `EarningsScreen`, `scripts/visual-audit.mjs`. Quedan para la ronda 2 o la capa E.

## Para el celular (capa E) — No verificado en dispositivo
- Render real al 200 % en EN: ejes de la gráfica, chips del Historial, tarjeta emergente (cabecera y pie frente al 70 % de `maxHeight`, `IncomingRequestCard.js:50`) y panel del viaje activo (`PANEL_MAX_SHARE` 0.65).
- Barra de pestañas apilada, mapa del detalle y atribución.
- TalkBack y VoiceOver sobre el selector.

## Campo Diseño

| Tarea | Veredicto |
|---|---|
| T-254 | Aprobado parcial (estático): contraste, no depender del color, ≥ 48 dp y orden en Configuración correctos por código. Pendiente capa E y P3-1. |
| T-263 | Rechazado, ronda 1 de 2: P2-1 y P2-2. |

Ninguna tarea pasa a «Validada» sin la evidencia del celular (capa E).
