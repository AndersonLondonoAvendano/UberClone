# Informe B3 — Efectos de `TripActiveScreen` (T-206, CA-004-13)

Fecha: 2026-11-16. Lectura de `src/screens/trip/TripActiveScreen.js`. Resultado: sin fuga; sin cambio de código.

Búsqueda de recursos en el archivo (`setTimeout`, `setInterval`, `addEventListener`, `subscribe`, `watchPosition`, `onSnapshot`, `.addListener`): 0 coincidencias. Ningún efecto crea temporizadores ni suscripciones.

| Efecto | Línea | Qué crea | Liberación / justificación |
|---|---|---|---|
| Montaje | `:69-75` | Solo marca `mountedRef.current = true` (`:70`); no crea recurso externo. | La limpieza (`:71-74`) pone `mountedRef.current = false` y, si `endOnLeaveRef.current` (`:73`), libera el viaje con `endTripRef.current()`. Es el único efecto con retorno y lo necesita. |
| Opciones de navegación | `:80-82` | Llama `navigation.setOptions({ gestureEnabled: !active })`; es una escritura de opciones, no una suscripción. | No necesita limpieza: la pantalla se desmonta y su opción desaparece con ella. |
| Resumen al completar | `:94-98` | Llama `navigation.replace('TripSummary')` una sola vez (protegido por `leavingRef`, `:95-96`); sin recurso. | No necesita limpieza: es una acción puntual; `leavingRef` evita repetirla si el efecto se reejecuta. |
| `usePreventRemove` | `:84-87` | Hook de React Navigation; registra y retira su propia escucha internamente. | Limpieza a cargo de la librería. El callback solo despacha la acción (`:85`) o abre la confirmación (`:86`). |

Los `finally` de `handleStartRide`, `handleFinish` y `handleCancel` (`:100-130`) comprueban `mountedRef.current` antes de `setWorking`, por lo que no actualizan estado tras desmontar.

Conclusión: los tres efectos cumplen RC-05; el único con retorno (`:69`) lo tiene, y los otros dos no crean recursos. No hay prueba nueva porque no hay cambio de código.
