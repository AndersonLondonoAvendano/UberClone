# Ronda 1 — Configuración tras quitar «Solicitud de prueba» (T-299, Parte C5, D-206) — 2026-11-16

Ronda estática por lectura del código. No hay capturas del celular. El arnés no se pudo ejecutar: `node scripts/visual-audit.mjs --selftest` responde que Playwright no está instalado. Nada de esto se presenta como visto en el dispositivo.

Archivos leídos: `NotificationsSection.js`, `SettingsScreen.js`, `SwitchTrack.js`, `Chip.js`, `tokens.js` (líneas 65-72), diccionarios `es.js:466-483` y `en/account.js:170-187`.

## Capas

| Capa | Resultado | Nota |
|---|---|---|
| A automática | Parcial | Arnés no disponible. No ejecuté `npm test`. |
| B crítica sobre capturas | No aplica | Sin capturas. |
| C audit / critique (modo Operate) | Hecha por lectura | Sin P0, P1 ni P2. Tres notas P3. |
| D checklist | Hecha por lectura | Ver veredictos. |
| E celular | Pendiente | Sin capturas. |

## Veredicto por criterio

| Criterio | Veredicto | Evidencia |
|---|---|---|
| Orden y jerarquía de secciones | Aprobado | `SettingsScreen.js:37-64`: App, notas de pago y mapas, Cuenta, Notificaciones, Idioma. Cada bloque es un `Card` con `group` y título `type.title` con rol `header`. Sin sección de prueba. |
| Hueco huérfano o separador sobrante | Aprobado | No queda ningún separador, `View` vacío ni margen propio de la sección retirada. El ritmo lo da solo `stack` `space[3]` entre tarjetas (`SettingsScreen.js:96`) y `stack` `space[2]` dentro (`NotificationsSection.js:168`). Los bloques condicionales (`explaining`, estado) no dejan hueco cuando no se muestran (`:125`, `:137`). |
| Sin restos de la función retirada | Aprobado | No hay textos ni claves de «prueba» en `src/` ni en los diccionarios. Solo quedan dos comentarios que explican el endpoint conservado (`NotificationsSection.js:7`, `notificationsApi.js:4`). |
| Interruptor «Avisos de solicitudes» | Aprobado | Fila `Pressable` con `minHeight: touch.controlHeight` (48) (`:176`). Rol `switch`, etiqueta, pista, `checked`, `disabled` y `busy` (`:106-111`). El estado ocupado se anuncia como texto («Activando…»), no solo como pista atenuada (`:116`). |
| Chip de estado | Aprobado | Texto más fondo suave: `successSoft`/`onSuccessSoft` activo, `surfaceMuted`/`text` en otro caso (`Chip.js:10-16`). El significado no depende del color. |
| Permiso denegado / bloqueado / enlace a ajustes | Aprobado | Mensaje en línea, sin `Alert` (`:137-162`). Bloqueado muestra título más explicación; denegado, texto de reintento. `SecondaryButton` «Abrir ajustes del sistema» aparece en ambos y captura el error de `Linking.openSettings` (`:158`). |
| Objetivos táctiles | Aprobado por código; real pendiente | Fila de 48 dp; botones del bloque de explicación y de ajustes son los componentes estándar. No medido en dispositivo. |
| Contraste | Aprobado por tokens | Pares ya medidos en rondas anteriores: `onDangerSoft` sobre `dangerSoft`, `text` sobre `surface`. Pista apagada `border` sobre `surface` 3,9 (umbral 3); pulgar `surface` sobre `border`, mismo orden. No recalculé. |
| Fuente al 200 % | Pendiente de dispositivo | Sin alturas fijas, `minHeight`. `flexShrink` y `flex: 1` en textos (`:170-173, :182`). Los tokens de texto limitan el multiplicador (`tokens.js:65`), y no hay `allowFontScaling={false}`. El texto de la fila envuelve; la pista fija de 56 dp no escala, correcto. |
| Accesibilidad | Aprobado con nota | Ver P3-3. |
| Paridad es/en | Aprobado | Las 13 claves de `notifications` existen en `es.js:466-483` y `en/account.js:170-187`, sin huérfanas. Tonos coherentes («Activadas/On», «Activando…/Turning on…»). |
| Tokens | Aprobado | Solo `color`, `space`, `type`, `touch`, `opacity`, `iconSize` en los estilos. Sin hex, sin números sueltos. |
| Operate: sin decoración, sin etiquetas de relleno | Aprobado | Sin mayúsculas de relleno, sin gradientes. Un icono funcional en el aviso. |

## Hallazgos (todos P3, no bloquean)

**P3-1. Tarjeta dentro de tarjeta.** `NotificationsSection.js:139` coloca `Card variant="status"` dentro del `Card` de `SettingsScreen.js:58`. Regla Operate: evitar anidar contenedores. Corrección sugerida: el aviso sin fondo de tarjeta propio (icono y texto en fila sobre el tono suave), o mantenerlo si la captura demuestra que se lee bien. Verificar en el celular.

**P3-2. Tono de peligro para «denegado».** `NotificationsSection.js:139`. `denied` es una elección del usuario y reintentable (es.js:479); un aviso rojo con alerta pesa más que la situación. Corrección: `tone="warning"` y mantener `danger` para `storage` y bloqueado. Decisión de diseño de Anderson; el texto ya es claro.

**P3-3. Anuncio duplicado en lector de pantalla.** `NotificationsSection.js:109-110, :116`. El `accessibilityValue` repite el texto del chip y además la región viva lo anuncia: con TalkBack puede oírse «Activadas» dos veces. Comprobar en el celular; si ocurre, quitar `accessibilityValue` y dejar la región viva, o al revés.

## Para el celular (capa E) — No verificado en dispositivo

- Capturas es y en, al 100 % y al 200 %, de Configuración completa (que no haya hueco entre Cuenta, Notificaciones e Idioma) y de los estados: activadas, desactivadas, explicación, denegado, bloqueado, activando.
- Área táctil real de la fila y de los botones; lectura con TalkBack/VoiceOver (P3-3).
- «Abrir ajustes del sistema» abre los ajustes de la app en iOS y Android.

## Campo Diseño

| Tarea | Veredicto |
|---|---|
| T-299 | Aprobado en código (estático, sin arnés). Capa E pendiente: **No verificado en dispositivo**. No es «Aprobado» definitivo. El campo en el backlog lo actualiza el agente principal. |
