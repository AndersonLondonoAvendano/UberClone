# Auditoría de diseño del lote L2 (T-237), ronda 1

Fecha: 2026-11-16. Alcance: solo estática, por código, tokens y etiquetas. No hay capas A (script), B (capturas), C (Impeccable) ni E (celular) en esta ronda: las skills de diseño no se cargaron, se usaron DESIGN.md, docs/diseno y la rúbrica del proyecto. Ninguna captura se presenta como del celular; todo lo visual queda «No verificado en dispositivo».
Archivos leídos: `src/theme/tokens.js`, `src/constants/labels.js`, `src/components/{TripListItem,Chip,Icon,SecondaryButton,PrimaryButton,IncomingRequestCard}.js`, `src/services/trip/tripDetailView.js`, `src/screens/trip/{TripActiveScreen,TripRequestScreen}.js`, `src/screens/main/EarningsScreen.js`.

## Veredicto por pieza

| Pieza | Veredicto estático | Dispositivo |
|---|---|---|
| 1. «Rechazado» vs «Cancelado» (lista y detalle) | Aprobado | No verificado en dispositivo |
| 2. «Conductor llegando», «Llegué», «Salir del viaje» / «Cancelar viaje» | No aprobado: corregir H-1 (jerarquía y texto de ayuda) | No verificado en dispositivo |
| 3a. Aviso `earnings-balance-partial` | Aprobado con observación (H-2, no bloquea) | No verificado en dispositivo |
| 3b. Esqueleto «calculando» y botones inactivos de la solicitud | Aprobado con observación (H-3, no bloquea) | No verificado en dispositivo |

## Pieza 1. Rechazado frente a Cancelado

Verificado por código:
- Contraste (calculado con los tokens): «Rechazado» usa tono neutral, texto `text #14201C` sobre `surfaceMuted #F6F8F7`, cerca de 16:1; «Cancelado» usa `onDangerSoft #8C1D18` sobre `dangerSoft #FBE4E2`, cerca de 7:1. Ambos cumplen AA (4,5:1) y el ícono (3:1).
- Sin depender solo del color: cada chip lleva texto distinto y ícono distinto (`remove-circle` frente a `close-circle`); el significado vive en el texto. A 16 px los dos íconos son círculos con una marca interior y se parecen; el texto los distingue, así que no bloquea.
- Lector de pantalla: en la lista, el `Pressable` lleva una sola etiqueta con el estado («Rechazado» o «Cancelado»), fecha, pasajero, ruta y «sin cobro»; la tarjeta interna se oculta del árbol. Los íconos son decorativos y están ocultos (`Icon.js`). En el detalle el estado sale de `statusOf` con la misma etiqueta.
- La misma fuente (`REJECTED_CHIP`, `labels.history.status`) alimenta lista y detalle: no hay deriva entre ambos.
- Límite: sobre la tarjeta blanca el fondo del chip neutral (`surfaceMuted`) casi no se distingue de `surface`; la forma de píldora casi no se ve y el chip se lee como texto con ícono. Es aceptable porque el texto y el ícono llevan el significado. Verlo en el celular.

Hallazgos: ninguno.

## Pieza 2. TripActiveScreen

Verificado por código:
- «Conductor llegando» sale de `labels.trip.phase.toPickup`, en un `Chip` tono `brand` (`onPrimarySoft` sobre `primarySoft`, texto claro). Va dentro de una región en vivo `polite`.
- «Llegué»: `PrimaryButton` con `minHeight` 48 dp (`touch.controlHeight`), texto «Llegué» y ayuda de accesibilidad «Avisa que ya llegaste al punto de recogida». Solo aparece con `driver_arriving` y fase `toPickup`. Cumple ≥48 dp.
- «Cancelar viaje»: `SecondaryButton` variante `danger`, texto `#B3261E` sobre blanco (cerca de 6,5:1), borde `border` de 2 px, 48 dp. «Salir del viaje» (en `in_progress`): `SecondaryButton` neutral, 48 dp. Los dos se excluyen entre sí (`canOfferCancel`), así que nunca hay dos salidas a la vez. El texto distingue las dos acciones; el color rojo se reserva para la que cancela de verdad.
- La salida con confirmación («Sí, salir» / «Quedarme aquí») está en una tarjeta de aviso con ícono, y el gesto atrás abre la misma confirmación: no hay salida accidental.

### H-1 (bloquea). Dos botones primarios apilados y texto de ayuda desactualizado mientras el conductor llega
- Dónde: `TripActiveScreen.js` líneas 266 a 296; `labels.trip.startRideHint` (`labels.js` línea 158).
- Qué pasa: con `canArrive` se muestran a la vez «Llegué» (activo, relleno primario) y «Pasajero a bordo» (también `PrimaryButton`, deshabilitado solo con `opacity 0.5`). Debajo aparece «Llega al punto de recogida para continuar». Hay dos rellenos primarios apilados y la ayuda manda a «llegar», cuando la acción que desbloquea es tocar «Llegué».
- Regla incumplida: una sola acción primaria por pantalla y el texto visible debe decir la acción que desbloquea (DESIGN.md, jerarquía de acciones; lo que el propio archivo ya declara: «A disabled main button says why in visible text»). `PrimaryButton` ya trae `quietDisabled` (superficie apagada con borde) para esto y esta pantalla no lo usa.
- Corrección: en `driver_arriving` (a) pasar `quietDisabled` al botón «Pasajero a bordo» mientras no está listo, para que «Llegué» sea el único relleno fuerte; (b) cambiar el texto de ayuda en esa fase a algo como «Toca Llegué cuando estés en el punto de recogida». Va al `implementer`.
- Evidencia: solo código; falta captura del celular o del arnés.

## Pieza 3a. Aviso de saldo parcial

Verificado por código: el aviso (`testID earnings-balance-partial`) está dentro de la tarjeta del saldo, con ícono `information-circle`, texto «Saldo parcial: se leyeron los {count} viajes más recientes.» y región en vivo `polite`. Color `textMuted #4A5A54` sobre blanco, cerca de 7,5:1: AA correcto. El texto envuelve sin ancho ni alto fijo (flexShrink, sin `numberOfLines`), correcto al 200 % de fuente. El error nunca muestra 0 (estado `error` aparte).

### H-2 (no bloquea). El aviso parcial se ve igual que la nota informativa normal
- Dónde: `EarningsScreen.js` líneas 139 a 148 y estilo `hintText` (línea 169).
- Qué pasa: el aviso de que la cifra es incompleta usa el mismo ícono, color y tamaño (`caption`, 12 px) que la nota de siempre justo encima. Un dato que condiciona la confianza en el monto queda como letra pequeña igual al resto, y el `Line` del saldo no lo anuncia junto a la cifra.
- Regla: lo que cambia cómo se interpreta un número debe tener más peso que una nota (DESIGN.md, jerarquía de avisos; uso de estados `warning`).
- Corrección sugerida: usar `type.small` (14 px) para este aviso y, si se quiere, tono `warning` (`onWarningSoft`, ícono `warning`) en vez de `information-circle` neutral. Revisar al hacer la captura 200 %.

## Pieza 3b. Esqueleto «calculando» y botones inactivos

Verificado por código: en `IncomingRequestCard` y `TripRequestScreen`, mientras `metricsPending` no hay tarifa; se muestra un `SkeletonBlock` con etiqueta accesible «Calculando distancia, duración y tarifa»; el contador muestra «Calculando…» en `textMuted` (el texto, no solo el bloque, lo dice); la barra queda vacía y sin urgencia. Aceptar y Rechazar quedan con `disabled`. El esqueleto es decorativo (`skeleton #C9D4D0`, cerca de 1,5:1, sin información propia) y respeta reducir movimiento. Los botones conservan 48 dp y estado de accesibilidad `disabled`; el contraste de elementos deshabilitados está exento de AA.

### H-3 (no bloquea). Botones inactivos de la solicitud solo con opacidad al 50 %
- Dónde: `IncomingRequestCard.js` líneas 400 a 415; `TripRequestScreen.js` líneas 478 y 485.
- Qué pasa: «Aceptar» se ve como el mismo botón verde azulado a medio tono; no se distingue bien de un botón activo sobre una superficie blanca. No hay texto cerca que diga por qué no responde, salvo «Calculando…» en el contador.
- Regla: el estado inactivo debe leerse como inactivo sin depender de la opacidad (el propio `PrimaryButton` ofrece `quietDisabled`, justificado en AI_LOG #64 O-09).
- Corrección sugerida: pasar `quietDisabled` al «Aceptar» mientras `metricsPending`.
- Nota: ya existe el segundo canal (texto «Calculando…» y etiqueta accesible), por eso no bloquea.

## Qué falta (capa E y capturas)

No verificado en dispositivo: legibilidad real de los chips y de los íconos pequeños, equilibrio visual del panel de «Conductor llegando», cómo se ve el aviso a 200 % de fuente, aspecto real del esqueleto y los botones inactivos. Capturas necesarias del equipo en `docs/diseno/auditorias/capturas/`: lista de historial con un viaje rechazado y uno cancelado; detalle rechazado; TripActive en `driver_arriving` y en `in_progress`; Ganancias con aviso parcial al 100 % y 200 %; solicitud entrante en «calculando».

## Cierre

Ronda 1 de 3 para la pantalla TripActive. Devolver H-1 al `implementer` (código, no especificación). Para L2 no pasa a «Diseño: Aprobado» la pieza 2 hasta corregir H-1 y verlo en celular; las piezas 1, 3a y 3b quedan «Aprobado» en lo estático, con observaciones H-2 y H-3 opcionales, todas «No verificado en dispositivo».

---

# Ronda 2 (T-237), 2026-11-16

Alcance: solo estática, por código y tokens. Sin capas A, B (capturas), C (Impeccable) ni E (celular); las skills de diseño no se cargaron. No hay capturas del celular ni del arnés: nada visual se da por visto, todo queda «Pendiente de dispositivo». Archivos leídos: `src/screens/trip/TripActiveScreen.js`, `src/components/PrimaryButton.js`, `src/services/trip/exitCopy.js`, `src/services/trip/requestClosed.js`, `src/constants/labels.js`, `src/screens/main/EarningsScreen.js`, `src/components/IncomingRequestCard.js`, `src/screens/trip/TripRequestScreen.js`, `src/theme/tokens.js`.

## Veredicto por hallazgo de la ronda 1

| Hallazgo | Resultado | Evidencia |
|---|---|---|
| H-1 (dos primarios, ayuda engañosa) | Resuelto en lo estático | `TripActiveScreen.js` línea 295: `quietDisabled={canArrive}` en «Pasajero a bordo»; línea 183: `mainHint` es `arriveFirstHint` con `canArrive` («Toca Llegué cuando estés en el punto de recogida», `labels.js` línea 161). |
| H-2 (aviso parcial con el peso de una nota) | Resuelto | `EarningsScreen.js` línea 174: `partialText` usa `type.label` (14/18) y `color.warning`; la nota normal sigue en `type.caption` 12 px y `textMuted`. |
| H-3 (Aceptar solo con opacidad) | Resuelto | `quietDisabled={metricsPending}` en `IncomingRequestCard.js` línea 420 y `TripRequestScreen.js` línea 483. |

## Verificaciones pedidas

1. Un solo primario a la vez en TripActive. Estado «Conductor llegando» (`driver_arriving`): «Llegué» es el único relleno `primary`; «Pasajero a bordo» pasa a superficie apagada con borde (`quiet`, solo si está `disabled`, lo que ocurre porque `atPickup` es falso con `canArrive`). La salida es `SecondaryButton` rojo («Cancelar viaje»). Al llegar, «Llegué» desaparece y «Pasajero a bordo» pasa a primario único. Las tarjetas de confirmación (salir y cancelar) tienen un solo `PrimaryButton` («Quedarme aquí», «Mantener») con la acción destructiva como secundaria; el error de finalizar tiene «Reintentar» primario y «Salir del viaje» secundario. Cumple.
2. Ayuda no engañosa: la ayuda visible depende del estado (`finishRideHint`, `arriveFirstHint`, `startRideHint`) y desaparece cuando el botón principal está listo (`mainReady`). Con `canArrive` ya no manda a «llegar» sino a tocar «Llegué». Cumple.
3. Aviso parcial de Ganancias: token de tipo `type.label` y de color `color.warning` `#8A5300` sobre `surface` blanco, cerca de 6,3:1 calculado con los tokens: AA correcto. Sigue con región en vivo `polite` y sin alto fijo. Cumple (ver O-1).
4. «Aceptar» con `quietDisabled` mientras calcula, en las dos superficies (tarjeta y pantalla completa); «Rechazar» sigue con `disabled` y se mantiene 48 dp. Etiqueta quieta: `textMuted` sobre `surfaceMuted`, cerca de 6,8:1 (exento de AA por estar deshabilitado, pero legible); borde `border #77847F` sobre `surfaceMuted`, cerca de 3,6:1, cumple los 3:1 del componente. Cumple.
5. Contraste AA de tokens usados: `onWarningSoft #6B3F00` sobre `warningSoft #FFF0D6` (confirmación de salir, aviso aproximado), cerca de 8:1; `onDangerSoft` sobre `dangerSoft`, cerca de 7:1; aviso de «Cancelada: ya no estás disponible» en `surface` blanco sobre `text #14201C`, cerca de 16:1. Todo AA.
6. Textos en `labels.js`: «Salir del viaje» (`exitQuestion*`, `exitMessage*`, `exitConfirm`, `exitKeep`) y `closedUnavailable` viven en `labels.js`; `exitCopy.js` solo elige claves, sin literales. Los textos dicen lo que ocurre de verdad: en curso, «¿Salir del viaje en curso?» con «cancelado y sin cobro»; en destino, «se cierra en este teléfono y no se registra el cobro»; el aviso de que el servidor no confirmó aparece solo cuando hay error real (`serverError`). Cumple. Los mensajes son largos (dos frases de 100 a 120 caracteres) pero envuelven sin alto fijo.

## Hallazgos nuevos (todos menores, no bloquean; máximo tres)

### O-1. Ícono informativo con tono de advertencia
- Dónde: `EarningsScreen.js` línea 148, `information-circle` con `tint={color.warning}`.
- Regla: el ícono debe decir lo mismo que el color; en `TripActiveScreen` los avisos de advertencia usan `warning` (triángulo) con `onWarningSoft`.
- Corrección: usar `name="warning"` para el aviso parcial. El texto «Saldo parcial» lleva el significado, por eso no bloquea.

### O-2. Ícono de reloj para «Cancelada: ya no estás disponible»
- Dónde: `TripRequestScreen.js` línea 327, `time-outline` para cualquier `closedReason`.
- Regla: el ícono no debe contradecir el texto; un reloj dice «expiró», no «cancelaste tu disponibilidad».
- Corrección: elegir el ícono por `closedReason` (por ejemplo `close-circle` o `remove-circle` ya usado en el proyecto, para `UNAVAILABLE`) y dejar el reloj para `EXPIRED`.

### O-3. Aviso breve de 2,5 s en la tarjeta entrante
- Dónde: `IncomingRequestCard.js` líneas 144 a 150 y `config/trip.js` línea 34 (`EXPIRED_NOTICE_MS = 2500`).
- Regla: un mensaje que explica un cambio de estado debe poder leerse completo; «Cancelada: ya no estás disponible» (unas 33 letras) a 16 px con fuente grande es corto de tiempo. La región en vivo `polite` lo anuncia, pero no hay forma de volver a verlo.
- Corrección: subir a unos 4 a 5 s o dejar un cierre manual. Decisión del equipo; no bloquea.

Observación sin número: «Finalizar viaje» deshabilitado (fase hacia el destino) sigue con opacidad al 50 % y sin `quietDisabled`. Es el único primario de esa fase y tiene su texto de ayuda visible, por eso no es hallazgo; si se quiere la misma coherencia que «Pasajero a bordo», se añade `quietDisabled`.

## Pendiente de dispositivo

Equilibrio visual de «Conductor llegando» con «Llegué» único y el botón quieto debajo; que el botón quieto se lea como inactivo y no como secundario (el borde `border` y el fondo `surfaceMuted` lo sostienen, pero hay que verlo); aviso parcial al 100 % y al 200 % de fuente; aviso «Cancelada: ya no estás disponible» en tarjeta y en pantalla completa; confirmación «Salir del viaje» con el texto largo a 200 %. Capturas que faltan en `docs/diseno/auditorias/capturas/`: TripActive en `driver_arriving` y en `in_progress`; tarjeta «Salir del viaje» en curso y en destino; Ganancias con aviso parcial (100 % y 200 %); solicitud entrante en «Calculando…» (tarjeta y pantalla completa); aviso de «Cancelada» y de «La solicitud expiró» para comparar; historial rechazado frente a cancelado (pendiente de la ronda 1).

## Cierre de la ronda 2

Ronda 2 de 3 para TripActive. H-1, H-2 y H-3 resueltos en el código; sin hallazgos que bloqueen. Campo Diseño de T-237: **Pendiente** (de dispositivo); lo verificable estáticamente queda «Aprobado en lo estático» (piezas 1, 2, 3a, 3b y textos de «Salir del viaje» y «Cancelada»), sin nota porque no hay capas A, B, C ni E. O-1, O-2 y O-3 van al `implementer` como opcionales; no son problema de especificación.
