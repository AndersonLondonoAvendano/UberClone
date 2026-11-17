<!-- AI-assisted: see docs/AI_LOG.md #73 -->
# Análisis: «La solicitud expiró» y «Otro conductor tomó…» al abrir desde la notificación (#73)

Método: lectura de código y pruebas, sin ejecutar en dispositivo. Sin secretos. Estado: **No verificado en dispositivo** (STOP-10).
Evidencia de Anderson (2026-11-16 20:49, release, backend sin reiniciar): captura 1 (8:45) «Solicitud entrante» con tarifa y destino en «Calculando…» y a la vez «Otro conductor tomó esta solicitud»; captura 2 (8:47) «La solicitud expiró»; bandeja con «Nueva solicitud de viaje» ×2.

## Hipótesis

| # | Hipótesis | Veredicto |
|---|---|---|
| 1 | Notificaciones apiladas: tocar una antigua (>90 s) expira de verdad | **Confirmada** como causa principal de «expiró» (captura 2). El mensaje no tenía etiqueta ni clave de colapso (`backend/src/notifications/payload.js`, `buildMessage`), así que cada solicitud añadía una notificación. Corrección: D-205. |
| 2 | Entrega tardía con la app cerrada | **Descartada como causa propia.** La validez es `expiresAt = now + FCM_TTL_MS` (90 s, `backend/src/config.js:16`) y FCM descarta lo que pasa del TTL; el arranque en frío de la app cuesta unos segundos. A3: se deja en 90 s (D-202). |
| 3 | Reloj del teléfono contra el del servidor | **Confirmada como riesgo.** Se compara `Date.now()` del teléfono con `expiresAt` del servidor, sin tolerancia, en `src/services/notifications/eligibility.js:13-20`, `src/services/notifications/pushRequest.js:~103`, `src/services/notifications/intentFlow.js:~109`, `src/components/NotificationsBridge.js:71`, `src/services/passengerApi/mockPassengerApi.js` (`adoptRequest`, `takePending`) y la compuerta (`src/services/trip/pendingRequest.js`). Un teléfono adelantado unos segundos hacía parecer vencida una solicitud vigente. Corrección: `REQUEST_CLOCK_TOLERANCE_MS` única (D-202). Se descartó usar la hora de envío: añade un campo al contrato y tiene el mismo problema de reloj. |
| 4 | Origen de «Otro conductor tomó…» | **Confirmada, no es una liberación temprana.** Ver abajo. |
| 5 | Otras causas | Ninguna: la restauración de «Disponible» (D-201), la puerta de D-146 y la intención de arranque en frío no adoptan dos veces (`createIntentFlow` vacía el almacén con `intents.take(uid)` antes de ofrecer; la compuerta deduplica por `requestId`). |

## Causa 4: «Otro conductor tomó…» sobre «Calculando…»

1. El release usa el adaptador **simulado** (`PASSENGER_API_MODE = 'mock'`, `src/config/passengerApi.js`).
2. Su `acceptRequest` lanza `ALREADY_TAKEN` con probabilidad `MOCK_ALREADY_TAKEN_PROBABILITY = 0.1` (`src/config/passengerApi.js:35`, `src/services/passengerApi/mockPassengerApi.js:249-261`), también para solicitudes adoptadas desde una notificación. Es una competencia simulada intencional, pero se podía disparar sobre cualquier solicitud.
3. `TripRequestScreen.handleAccept` (`src/screens/trip/TripRequestScreen.js:286-307`) llama `clearPendingRequest` (libera la compuerta) y guarda el error. La pantalla entonces cae al snapshot de apertura `opened` (`TripRequestScreen.js:96-106`), que es la **primera copia con métricas pendientes**: tarifa y destino en «Calculando…». De ahí la captura 1: aviso real + datos viejos.
4. El `error` solo se limpiaba en `handleAccept` (`TripRequestScreen.js:114`), no al cambiar de solicitud.

Conclusión: sí hubo una pulsación de Aceptar (con la oferta ya abierta y el refinado ≤ 3 s, `REQUEST_METRICS_CAP_MS`), y la liberación ocurrió después, no antes de los datos. El defecto es que la pantalla mostraba la copia inicial en lugar de la última con datos finales, y que la simulación podía salir en la primera carga y en solicitudes de notificación.

## Qué se cambia (T-291 a T-296)

- Tolerancia única y validez relativa: `REQUEST_CLOCK_TOLERANCE_MS = 10 s` (`src/config/trip.js`) y `src/services/trip/requestValidity.js`: vencida solo si `ahora >= expiresAt + tolerancia`; al adoptar, `expiresAt` efectivo = `max(expiresAt, ahora + 15 s)`. D-137 no cambia.
- «Tomó» solo tras decisión real: nunca en solicitudes de notificación; en las del simulador solo pasados `MOCK_TAKEN_MIN_DECISION_MS` (5 s). La pantalla conserva la última copia final y reinicia el aviso por solicitud (D-203).
- Rastros solo en desarrollo (`__DEV__`) con códigos fijos y sin datos personales: adoptada, vencida por reloj, liberada, tomada por otro.
- Bandeja: etiqueta `trip_request` y clave de colapso (D-205). Límite: la notificación de una solicitud ya aceptada o vencida solo desaparece cuando llega la siguiente o la descarta el usuario.
- Pruebas con reloj inyectado (T-294).

## Estado

Implementado (T-291 a T-298) y aceptado por verifiers distintos de forma estática; T-299 con auditoría estática de diseño. Todo queda «Implementada», **No verificado en dispositivo**. Nada pasa a «Validada» sin la evidencia de Anderson en STOP-10. Nota: los números de línea de «Causa 4» describen el código antes de la corrección y se desplazaron tras los cambios.
