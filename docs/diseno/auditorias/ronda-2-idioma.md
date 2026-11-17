# Ronda 2 (última) — Idioma (T-254 selector, T-263 textos EN al 200 %) — 2026-11-16

Ronda estática por lectura del código y de los diccionarios. No hay capturas del celular ni del arnés; nada de esto se presenta como visto en el dispositivo.

## Capas

| Capa | Resultado | Nota |
|---|---|---|
| A automática | Parcial | Pruebas que corrí con `node --test`: `i18nParity` 3/3, `i18nCoverage` 5/5, `languageSection` 5/5, `chartData` 1/1. `scripts/visual-audit.mjs --selftest` no corre: Playwright no está instalado (`[por instalar]`). Sin arnés no hay capturas ni medición automática de áreas táctiles. |
| B crítica sobre capturas | No aplica | Sin capturas. |
| C audit / critique | Hecha por lectura | Sin P0, P1 ni P2. |
| D checklist | Parcial | Contraste calculado a mano en la ronda 1; los tokens no cambiaron. |
| E celular | Pendiente | Ver «Para el celular». |

## Verificación de las correcciones de la ronda 1

| Hallazgo | Corrección en el código | Resultado |
|---|---|---|
| P2-1 marcas de la gráfica | `BarChart.js:62`: `numberOfLines={1}` con `adjustsFontSizeToFit`, `minimumFontScale={0.7}` y `maxFontSizeMultiplier={1.3}`. Las marcas EN («Mon», «Tue»…, `en/account.js:50`) ya no pueden pasar de 1.3x ni se truncan: encogen hasta 0.7. | Corregido |
| P2-2 Chip | `Chip.js`: `flexShrink: 1` en el contenedor (`:32`) y en el Text (`:42`). «Payment without status» ya puede envolver dentro de `TripListItem`. | Corregido |
| P3-1 selector | `LanguageSection.js:47`: `accessibilityLabel={text.groupLabel}` en el radiogroup. `:101` y `:102`: `flexShrink: 1` en `check` y `activeText`. Clave presente en `es.js:462` («Selección de idioma») y en `en/account.js:165` («Language selection»). | Corregido |

## Regresiones

- Área táctil del selector: la opción conserva `minHeight: touch.controlHeight` (48 dp). `flexShrink` no la reduce. Sin regresión.
- Orden de las marcas semanales: `showsLabel(index, count)` no cambió (`chartLayout.js`); el cambio solo toca el estilo del Text. Los textos siguen en el orden lun-dom / Mon-Sun (`es.js:347`, `en/account.js:50`).
- Valores guardados: `LanguageSection` sigue llamando solo a `setLanguage('es'|'en')`. `OPTIONS` mantiene los códigos y los testID. `languageSection.test.mjs` pasa. Sin cambios de valores.
- Paridad ES/EN: `i18nParity` y `i18nCoverage` pasan, así que la clave nueva existe en ambos idiomas.

## Lo que la ronda 1 no revisó

- `SelectField`: el disparador tiene `minHeight` 48 y el texto usa `flex: 1` con `flexShrink: 1`, así que envuelve. Las opciones tienen 48 dp y su texto también envuelve. La opción activa se marca con peso, subrayado y check, sin depender del color. La etiqueta de accesibilidad es nombre más valor, y «not selected» existe en EN (`en/registration.js:35`). Sin hallazgos.
- `PhotoField`: los botones Cámara y Galería (`Camera`, `Gallery`) usan `flexWrap` y `flex: 1` con `minHeight` 48. El texto de ayuda y el de «Uploading photo» van centrados y envuelven. Sin hallazgos.
- `DateField`: igual que `SelectField` (48 dp, texto que envuelve). Formato de fecha numérico, igual en ambos idiomas. El selector nativo es de Android y queda en capa E.
- `AuthBackdrop`: la banda no tiene altura fija. El nombre de marca usa `adjustsFontSizeToFit` con piso 0.6 y el eslogan envuelve. Los adornos están ocultos a lectores de pantalla. Sin hallazgos.
- `EarningsScreen`: los periodos «Today / This week / This month» usan `flex: 1` con `flexShrink` en el texto y envuelven. El marcado de selección lleva check y color, no solo color. Montos con `flexShrink`, avisos con `flex: 1`. Sin hallazgos.

## Hallazgos

Ningún P0, P1 ni P2.

Nota P3 (solo registro, no bloquea): los periodos de `EarningsScreen` (`touch.min`, 44 dp) y los chips de `HistoryFilters` quedan por debajo de 48 dp. Es la convención del proyecto y ya estaba registrado.

## Para el celular (capa E) — No verificado en dispositivo

- Render real al 200 % en EN: ejes de la gráfica (que el encogido a 0.7 siga legible), chips del Historial, tarjeta emergente, panel del viaje activo.
- Periodos de Ganancias en una pantalla de 360 dp con «This month».
- Barra de pestañas apilada, mapa del detalle y atribución.
- TalkBack y VoiceOver sobre el selector, incluida la lectura del nuevo nombre de grupo.
- Selector de fecha nativo de Android y flujo de cámara y galería.
- Arnés: instalar Playwright (`npm i -g playwright && npx playwright install chromium`) si se quieren capturas web.

## Campo Diseño

| Tarea | Veredicto |
|---|---|
| T-254 | Aprobado (estático, por código). Capa E pendiente: TalkBack/VoiceOver y tamaño real, **No verificado en dispositivo**. |
| T-263 | Aprobado (estático, por código), cerrada en la ronda 2 de 2. Render real al 200 % en EN, **No verificado en dispositivo**. |

Ninguna tarea pasa a «Validada» sin la evidencia del celular (capa E).
