# Guía de estilo (rediseño, prompt #51 · D-90)

Fuente de verdad en código: `src/theme/tokens.js`. Un solo tema claro. Solo estilos, layout y presentación.

## Paleta y roles
| Token | Valor | Rol |
|---|---|---|
| `bg` | #EEF2F1 | Base de pantalla |
| `surface` | #FFFFFF | Tarjeta, campo, barra |
| `surfaceMuted` | #F6F8F7 | Fila o bloque tenue |
| `border` | #77847F | Límite de control (≥3:1) |
| `borderSubtle` | #C5D0CC | Separador y marco de tarjeta (decorativo) |
| `text` / `textMuted` | #14201C / #4A5A54 | Texto principal / secundario |
| `primary` / `primaryDark` | #006D77 / #00383E | Acción y dato vivo / tarjeta destacada |
| `primarySoft` / `onPrimarySoft` | #DDEFF0 / #00474E | Chip y botón píldora de marca |
| `onBrand` / `onBrandMuted` | #FFFFFF / #BFE0E3 | Texto sobre `primaryDark` |
| `success`, `warning`, `danger` | #2E7D32, #8A5300, #B3261E | Texto o ícono sobre `bg`/`surface` |
| `*Soft` + `on*Soft` | ver tokens | Chips y tarjetas de estado |
| `skeleton` | #C9D4D0 | Bloques de carga |

## Contrastes (WCAG 2.x, script fuera del proyecto: 0 fallas de 26 pares)
| Par | Razón | Mín. | Uso |
|---|---|---|---|
| text / bg | 14.85 | 4.5 | texto sobre fondo |
| textMuted / bg | 6.46 | 4.5 | texto secundario sobre fondo |
| text / surface | 16.76 | 4.5 | texto sobre tarjeta |
| textMuted / surface | 7.29 | 4.5 | secundario sobre tarjeta |
| text / surfaceMuted | 15.71 | 4.5 | texto sobre superficie tenue |
| textMuted / surfaceMuted | 6.83 | 4.5 | secundario sobre tenue |
| primary / surface | 6.08 | 4.5 | texto de marca sobre tarjeta |
| primary / bg | 5.39 | 4.5 | texto de marca sobre fondo |
| onPrimary / primary | 6.08 | 4.5 | texto de botón primario |
| onBrand / primaryDark | 12.84 | 4.5 | texto de cabecera |
| onBrandMuted / primaryDark | 9.16 | 4.5 | texto secundario de cabecera |
| onPrimarySoft / primarySoft | 8.79 | 4.5 | chip de marca |
| onSuccessSoft / successSoft | 6.78 | 4.5 | chip éxito |
| onWarningSoft / warningSoft | 8.00 | 4.5 | chip aviso |
| onDangerSoft / dangerSoft | 7.51 | 4.5 | chip error |
| success / surface | 5.13 | 4.5 | texto éxito sobre tarjeta |
| warning / surface | 6.33 | 4.5 | texto aviso sobre tarjeta |
| danger / surface | 6.54 | 4.5 | texto error sobre tarjeta |
| danger / bg | 5.79 | 4.5 | texto error sobre fondo |
| success / bg | 4.54 | 4.5 | éxito sobre fondo |
| border / surface | 3.90 | 3 | borde de control sobre tarjeta |
| border / bg | 3.45 | 3 | borde de control sobre fondo |
| primary / bg | 5.39 | 3 | componente de marca sobre fondo |
| primary / surface | 6.08 | 3 | componente de marca sobre tarjeta |
| primaryDark / bg | 11.38 | 3 | cabecera sobre fondo |
| text / primarySoft | 14.11 | 4.5 | texto sobre suave marca |

El botón deshabilitado usa `opacity.disabled` (0.5) y pierde la sombra; los controles deshabilitados están exentos de contraste en WCAG 2.x y siguen comunicando el estado con `accessibilityState`.

## Tipografía (Inter, D-91)
Familias por peso: `fontFamily.regular` 400, `medium` 500, `semibold` 600, `bold` 700 (sin `fontWeight`; en Android el peso es la familia). Carga con `useFonts` y salida segura a la fuente del sistema a los 3 s o ante error.
hero 40/46 700 · display 28/34 700 · title 20/26 600 · heading 18/24 600 · body 16/22 400 · bodyStrong 16/22 600 · label 14/18 500 · small 14/20 400 · caption 12/16 400 · numeric (tabular-nums, se compone). Todo importe, tiempo o distancia usa `type.numeric`.

## Íconos
Un solo componente `Icon` (Ionicons), decorativo, siempre con texto o etiqueta cerca. Tamaños `iconSize`: sm 16, md 20, lg 24. Contorno inactivo, relleno activo. Color por token (`tint`).

## Menú lateral y pestañas de registro
Menú: cabecera `primaryDark` con avatar de borde (`avatarSize.md`), nombre, vehículo, placa y píldora de disponibilidad con texto; entradas con ícono y texto, la activa en píldora `primarySoft` con barra `accentWidth`.

Pestañas de registro (`AppTabBar`): sin subrayado. Ícono + etiqueta corta de una línea (`type.caption`, `numberOfLines` 1, `adjustsFontSizeToFit`); la activa va en color de marca, `semibold`, ícono relleno y píldora `primarySoft`. Con fuente grande (≥1.15) se apilan en filas. Un botón «Cuenta» al final abre un menú en línea con el correo enmascarado y «Cerrar sesión». El título de cada paso es «Paso N de 3» (sin repetir el nombre de la pestaña).

## Patrones reutilizables (pulido de diseño)
- **Encabezado compacto (`ScreenHeader`)**: barra con un botón circular de 48 dp en `primarySoft` solo con ícono (`menu` o `chevron-back`, con `accessibilityLabel`), y título que puede ocupar 2 líneas. Sin texto en el botón.
- **Campo editable por lápiz (`EditableFieldRow`)**: fila de datos con lápiz `create-outline` de 48 dp a la derecha, `accessibilityLabel` «Editar <campo>». Se edita un campo a la vez; los demás lápices quedan deshabilitados (`opacity.disabled`). Los campos de solo lectura no llevan lápiz y comparten una nota de soporte.
- **Autenticación (`AuthBackdrop`, `AuthField`, `AuthLink`)**: banda `primaryDark` con borde inferior curvo (`radius.xl`), círculo de marca (mismo motivo que el menú), insignia `car`, marca en `type.hero` (una línea, se encoge) y la tarjeta del formulario solapada. Campos con ícono; el ojo de contraseña dentro del campo. Acciones secundarias como enlaces de texto de ≥48 dp (`role link`); el CTA es único.
- **Paso de incorporación (`WelcomeScreen`)**: lista de 3 pasos con «N de 3 pasos completos» y barra de 3 segmentos, cada paso tocable con estado en texto («Pendiente/Completo») e ícono, un solo CTA (Empezar / Continuar / Revisar y enviar) y «¿No eres tú? Cerrar sesión» con confirmación en línea (sin `Alert`). Estilo Quickstart: sin carrusel.

## Espaciado, formas y elevación
- `space`: 2, 4, 8, 12, 16, 24, 32, 48. Margen lateral 16.
- `radius`: sm 8 (campos), md 12 (botones, tarjetas), lg 20 (hojas), xl 28, full (píldoras, avatar).
- `elevation`: none (base), card (tarjeta en reposo), raised (tarjeta destacada u hoja sobre el mapa).
- `touch.min` 44, `touch.controlHeight` 48. `motion`: 150/220/400 ms.

## Componentes
ScreenHeader (barra compacta, botón circular de solo ícono), PrimaryButton, SecondaryButton, ScreenState (carga con esqueleto, vacío, error con reintento), Chip (estado con texto, nunca solo color), Card (card | featured | status), DataRow (etiqueta secundaria, valor medio, separador).

## Reglas de uso
1. Todo color sale de un token; sin hex sueltos.
2. El estado se dice con texto o ícono, nunca solo con color.
3. Dentro de Card featured solo `onBrand`/`onBrandMuted`.
4. Solo animaciones de opacidad/transform con `useNativeDriver`; con reducir movimiento activo, sin animar.
5. Objetivos táctiles ≥ 44 px; texto sin altura fija que lo corte al escalar la fuente.
6. Una acción principal por pantalla.

## Marcador de auto del conductor (R3, RF-32, prompt #54)
Glifo `car` de Ionicons (vía `Icon.js`) teñido con `vehicleColor.<valor>` dentro de una insignia circular con anillo `carMarker.ring` (`color.primaryDark`), `borderWidth.thick` y sombra `elevation.card` (`carMarker` en tokens). La insignia es blanca (`carMarker.badgeLight` = `color.surface`) y pasa a oscura (`carMarker.badgeDark` = `color.primaryDark`, #00383E) cuando el glifo queda bajo 3:1 contra la blanca (`vehicleBadgeToken`: blanco, plata y amarillo). `otro`, vacío o desconocido usa `color.primary` sobre insignia blanca. Contraste de cada glifo contra SU insignia, script fuera del proyecto, mínimo 3:1:

| Valor | Token | Insignia | Contraste |
|---|---|---|---|
| blanco | `vehicleColor.blanco` #F5F5F5 | oscura #00383E | 11.78:1 |
| negro | `vehicleColor.negro` #14201C | blanca | 16.76:1 |
| gris | `vehicleColor.gris` #5A6360 | blanca | 6.20:1 |
| plata | `vehicleColor.plata` #C0C4C8 | oscura #00383E | 7.32:1 |
| rojo | `vehicleColor.rojo` #C62828 | blanca | 5.62:1 |
| azul | `vehicleColor.azul` #1565C0 | blanca | 5.75:1 |
| verde | `vehicleColor.verde` #2E7D32 | blanca | 5.13:1 |
| amarillo | `vehicleColor.amarillo` #F2C200 | oscura #00383E | 7.64:1 |
| otro | `color.primary` #006D77 | blanca | 6.08:1 |

Blanco y plata se distinguen por tono (#F5F5F5 casi blanco frente a #C0C4C8 gris claro, ambos sobre insignia oscura). Anillo contra el mapa (que es claro): `color.primaryDark` contra tierra #F2EFE9 11.19:1, fondo #EEF2F1 11.38:1, gris #E8E8E8 10.48:1, agua #AAD3DF 8.01:1 y blanco 12.84:1, todos sobre 3:1; el anillo `color.border` anterior daba 2.43:1 sobre el agua. El anillo contra la insignia blanca da 12.84:1 y la sombra separa el conjunto del mapa.

## Patrones de la spec 003 (notificaciones, S5; auditoría 2026-11-16)
- **Interruptor con chip informativo (`SwitchTrack` + `Chip`)**: la fila completa es un único `Pressable` `role switch` (≥48 dp, `checked`, `disabled`, `busy`). A la derecha, la pista con pulgar (`SwitchTrack`, mismos valores que `AvailabilitySwitch`: encendido `color.success`, apagado `color.border`, pulgar `color.surface`). Bajo la etiqueta, un `Chip` solo informativo (no pulsable) con el estado en texto («Activadas», «Desactivadas», «Activando…», «Desactivando…»). Ocupado: se atenúa solo la pista (`opacity.disabled`); el texto del chip va también en `accessibilityValue`. El estado nunca va solo en el chip ni solo en la pista.
- **Contador de decisión («Vence en N s»)**: texto `type.title` + `type.numeric` centrado en `color.primary` y, debajo, una barra fina (`space[1]`) con relleno `primary` sobre pista `primarySoft`. Sin relleno, sin radio de botón y sin sombra, para que no parezca un botón. Urgente (últimos 10 s): texto y relleno en `color.danger` (6,54:1 y 5,50:1); tamaño constante, sin saltos. Debe sumar una señal no cromática en urgente (icono; ver hallazgo H-1). Tope de fuente `maxFontScale` (1,5). Anuncio por voz solo a 10, 5 y 0 s en región `polite` aparte. **«Aceptar» domina**: es el único control relleno de la tarjeta y de la pantalla de solicitud.
- **Botón primario inactivo (`quietDisabled`)**: fondo `surfaceMuted`, borde `border` de `borderWidth.thin` (3,65:1), texto `textMuted` (6,83:1), sin sombra ni opacidad; la causa va justo debajo en `type.small`.
