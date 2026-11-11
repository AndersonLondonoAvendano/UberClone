# Plan recortado — Entrega final (2 días)

Estado: **aprobado por Anderson para las rebanadas 0, A y B** (prompt #41, 2026-11-10; propuesto en el prompt #40). La rebanada 0 se revisó en el prompt #41 para usar MapLibre + OpenFreeMap (D-82 Vigente MODIFICADA) y sus tareas T-35 a T-37 ya están en `docs/backlog.md`. Las tareas T-38 a T-53 entran al backlog cuando se empiece su rebanada; C y D siguen como propuesta.
**SUPUESTO:** la entrega es el **jueves 2026-11-12** (fecha y hora no confirmadas). Hoy es el martes 2026-11-10.
Decisiones base: D-59 (cadena con checkpoints), D-76 a D-82. Arquitectura: `docs/arquitectura-api-pasajero.md` y `docs/arquitectura-mapa-recorrido.md`. Seguridad: `docs/seguridad.md`.

En vez de 8 specs completas (002 a 009), se trabaja por **rebanadas verticales**. Cada rebanada que se apruebe necesita su spec corta en `specs/NNN-*/spec.md` antes de implementar (constitución). Se propone una sola spec por rebanada: 010-mapa-base (0), 004-tarifa (A), 011-viaje-tiempo-real (B) y 012-cierre-viaje (C). La numeración es a confirmar.

## Calendario

| Bloque | Cuándo | Rebanada | Horas |
|---|---|---|---|
| 1 | Martes 11-10, tarde y noche | **0** (build único y spike) + **A** (tarifa) | 4,5 + 2,5 = 7 |
| 2 | Miércoles 11-11, día completo | **B** (viaje en tiempo real) | 11 |
| 3 | Miércoles 11-11, noche | **C** (abandonable) | 0 a 5 |
| 4 | Jueves 11-12, mañana (≥ medio día) | **D** (cierre) | 5 |

**Ruta mínima viable:** 0 → A → B → D, que incluye el recorrido en tiempo real (T-37, T-41, T-44). **C es abandonable** sin comprometer la ruta mínima: si a las 20:00 del miércoles B no está en el checkpoint 2, C no se empieza.

---

## Rebanada 0 — Dependencias nativas, build único y spike del mapa (HOY)
**Cubre:** RNF-01, RNF-06 (mapa y geolocalización, parcial por D-77), RNF-08 (restricción de clave y alerta), RNF-12. Prepara RF-08, RF-12. Ya no aplica la restricción de clave de RNF-08 para el mapa: el mapa no usa clave (D-81, D-82).
**Depende de:** D-82 Vigente MODIFICADA (prompt #41) y las dos dependencias instaladas (`@maplibre/maplibre-react-native`, `expo-location`); el build nativo lo hace Anderson (pasos de `arquitectura-mapa-recorrido.md` §8).

| Tarea | Qué | CA (resumen) | Horas |
|---|---|---|---|
| T-35 | `app.json` con los plugins `@maplibre/maplibre-react-native` y `expo-location` (texto del permiso de ubicación en español, sin segundo plano). Sin `app.config.js` y sin variables nuevas. | `app.json` conserva todo lo que ya tenía y suma los dos plugins; ningún secreto en archivos versionados; `check-constitution` no empeora | 0,5 |
| T-36 | `src/services/routing/` (`index.js`, `osrmRouting.js`, `fallbackRoute.js`, `straightLine.js`) y `src/config/routing.js`, según §2: OSRM, después la ruta de respaldo precargada y la línea recta como último recurso. | Un script temporal contra OSRM real devuelve más de 2 coordenadas `[lng, lat]`, `distanceM > 0`, `durationS > 0` y `provider: 'osrm'`; sin red y sin respaldo, rechaza con `ROUTE_FAILED`; con respaldo, devuelve la ruta precargada para los puntos fijos o la línea recta interpolada | 1,5 |
| T-37 | Pantalla de prueba del mapa, visible solo con `SHOW_DEV_TOOLS` en `true`: `Map` de MapLibre con el estilo de OpenFreeMap, permiso de ubicación, posición actual del conductor y ruta por calles entre dos puntos fijos (capa de línea), con carga y error con reintento (`ScreenState`) y atribución visible (OpenFreeMap, OpenMapTiles, OpenStreetMap, OSRM). | **Criterio de éxito del spike:** en el celular Android se ven calles (no un fondo vacío), la atribución, la posición real y la ruta por calles; con `SHOW_DEV_TOOLS` en `false` no aparece nada de la prueba | 1,5 |
| — | **Anderson:** `npm install` (las dependencias ya quedaron en `package.json`) y `npx expo run:android` con el celular conectado | Build instalado | 1 a 2 (manual) |

**Checkpoint 0 (celular):** criterio de éxito de T-37. Si falla dos veces o pasan 3 h, se activa el **Plan B** (`arquitectura-mapa-recorrido.md` §9).
**Se simplifica:** se prueba solo en Android; MapLibre también funciona en iOS, pero queda sin probar si no hay Mac. **No cubierto:** ubicación en segundo plano, FCM (D-77).

## Rebanada A — Tarifa y comisión (spec 004)
**Cubre:** RF-20, RF-21, RF-22, RF-23 (el campo; se escribe en C) y D-76.
**Depende de:** nada nativo; puede hacerse mientras compila el build de la rebanada 0.

| Tarea | Qué | CA (resumen) | Horas |
|---|---|---|---|
| T-38 | `src/config/pricing.js` con los parámetros de RF-21 y `COMMISSION_RATE = 0.20`. El registro (`RegistrationFormContext.js`) la lee de ahí y la muestra como «20 %»; se elimina `COMMISSION_RATE_PERCENT`. | Una sola definición de la tasa en `src/`; la casilla de términos dice «20 %»; el envío lleva `commissionRate: 0.2` | 1 |
| T-39 | `calculateFare({distanceKm, durationMin, category, tip})` pura, en `src/utils/` o `src/services/pricing/`. | Un script temporal reproduce el ejemplo de RF-22: Económico 19.200/3.840/15.360, XL 26.900/5.380/21.520; mínima de 6.000; propina íntegra al conductor; redondeo a 100 antes de la comisión | 1,5 |

**Checkpoint:** no necesita celular (lógica pura); T-38 se revisa en el checkpoint 1.
**No cubierto:** tarifa dinámica y peajes.

## Rebanada B — Disponibilidad, solicitudes, recorrido en tiempo real, viaje activo y resumen
**Cubre:** RF-08, RF-09, RF-10, RF-11, RF-12 (con OSRM en lugar de Google Directions, que es Legacy), RF-13 (estados del viaje activo), RF-20 (estimación y cierre), RNF-02, RNF-03 (`useDriverLocation`, `useTripRequests`), RNF-06 (parcial).
**Depende de:** checkpoint 0 aprobado (o Plan B activo), y T-39.

| Tarea | Qué | CA (resumen) | Horas |
|---|---|---|---|
| T-40 | `src/services/passengerApi/` (contrato, `index.js`, mock, `mappers.js` vacío, esqueleto http) y `src/config/passengerApi.js`. | Un script temporal: `subscribeToRequests` emite un `TripRequest` válido cada 10–20 s y deja de emitir tras `unsubscribe`; `acceptRequest` después de `expiresAt` rechaza con `EXPIRED` | 2 |
| T-41 | `src/services/location/` (GPS y simulada) y el hook `useDriverLocation` con regulador de 5 s / 20 m y pausa por `AppState`. | La fuente simulada recorre una polilínea de prueba de extremo a extremo; el regulador no emite más de una vez cada 5 s; hay limpieza en `useEffect` | 2 |
| T-42 | Inicio: mapa con la ubicación actual e interruptor Disponible/No disponible; escritura de ubicación en Firestore (`driverLocations/{uid}`) con el regulador; el hook `useTripRequests` reemplaza «Simular solicitud (provisional)». **Anderson** publica la regla de `driverLocations` (solo el dueño escribe y lee) y se actualiza `docs/seguridad.md`. | Al pasar a No disponible se detienen el GPS y la suscripción; sin escrituras con la app en No disponible | 2 |
| T-43 | Tarjeta de solicitud: origen, destino, distancia, duración, categoría, pago, tarifa y ganancia neta (`calculateFare`), con cuenta regresiva de 15 s y rechazo automático; aceptar o rechazar contra el puerto. | En 0 se llama `rejectRequest`; aceptar navega al viaje activo; los errores `EXPIRED` y `ALREADY_TAKEN` muestran su aviso | 2 |
| T-44 | **Viaje activo con recorrido en tiempo real:** marcadores, polilínea Y→X, cámara que sigue, distancia y tiempo restantes, llegada a ≤ 30 m, «Pasajero a bordo» (ruta X→destino), «Finalizar», cancelar; `ScreenState` para errores con `onRetry`; `reportTripStatus` y `reportDriverLocation`. | Con la fuente simulada, el marcador avanza por la polilínea hasta X y se habilita «Pasajero a bordo»; los estados siguen `accepted → driver_arriving → in_progress → completed`; si la ruta falla, hay reintento y ruta aproximada | 3 |
| T-45 | Resumen del viaje: tarifa final, comisión, ganancia neta (`calculateFare`) y botón para volver a Inicio. | Las cifras coinciden con `calculateFare` para la distancia y duración de la ruta | 1 |

**Checkpoint 1 (celular, miércoles mediodía):** T-38, T-40 a T-42 (interruptor y solicitudes llegando).
**Checkpoint 2 (celular, miércoles tarde):** T-43 a T-45, con un viaje completo en modo simulado grabado en video como respaldo para la entrega.
**Se simula:** el pasajero (mock), la posición en la demo (fuente simulada) y las direcciones (texto genérico). **No cubierto:** `requested`/`rejected` en Firestore (no hay otros conductores), FCM y segundo plano.

## Rebanada C — Cobro simulado, ganancias, historial y perfil (ABANDONABLE)
**Cubre (parcial):** RF-14, RF-17, RF-18 (saldo simulado), RF-23, RF-24, RF-25, RF-26, RF-27 (sin ruta dibujada en el detalle), RF-28, RF-29 (solo lectura), RNF-03 (`useEarnings`), RNF-09.
**Depende de:** T-45.

| Tarea | Qué | CA (resumen) | Horas |
|---|---|---|---|
| T-46 | Al cerrar el viaje, la app escribe `trips/{id}` (campos de RNF-09 que haya, `commissionRate`, `paymentMethod`, `paymentStatus`). Cobro **simulado**: la tarjeta queda «Aprobado (simulado)» y el efectivo se marca a mano («Efectivo»). **Anderson** publica la regla de `trips` (solo el conductor dueño crea y lee; sin borrado) y se actualiza `docs/seguridad.md`. | El documento aparece en la consola con `driverId == uid`; otro uid no puede leerlo | 1,5 |
| T-47 | `useEarnings` (con `useMemo`) y pantalla Ganancias (hoy/semana/mes) con saldo según RF-25. | Con 3 viajes de prueba, los totales coinciden con un cálculo a mano | 1,5 |
| T-48 | Historial: `FlatList` del más reciente al más antiguo, límite de 20, mensaje vacío y filtro por método de pago. | Lista vacía muestra el mensaje; con datos, el orden es correcto | 1,5 |
| T-49 | Perfil de solo lectura (datos, vehículo, estado de cuenta) y cerrar sesión. | Muestra los datos del registro; cerrar sesión vuelve al inicio | 0,5 |

**Checkpoint 3 (celular, miércoles noche):** T-46 a T-49.
**No cubierto (explícito):** Mercado Pago o Stripe reales (RF-15, RF-16), webhook, pago dividido (RF-19), filtro por rango de fechas, ruta dibujada en el detalle del historial (RNF-10), y edición de perfil e idioma (RF-29).

## Rebanada D — Cierre (≥ medio día, jueves por la mañana)
**Cubre:** ENT-01 a ENT-08.

| Tarea | Qué | CA (resumen) | Horas |
|---|---|---|---|
| T-50 | README: instalación, `.env.example` (solo nombres), development build, cómo cambiar mock/http y simulada/GPS, reglas en consola (`docs/seguridad.md`), «Uso de IA», y lo que queda simulado o no cubierto. | Un clon limpio sigue el README sin pasos ocultos | 1 |
| T-51 | Bitácora: hashes de commit, «Aprendizaje» y «Usado/modificado/descartado» (**Anderson**), marcas `// AI-assisted` en el código asistido, y PDF de `AI_LOG.md`. | Todas las entradas completas; el PDF corresponde a `main` | 1,5 |
| T-52 | Video de 5 min o menos: registro, solicitud, recorrido en tiempo real, cobro (simulado si C entró) e historial (si C entró). Lo graba **Anderson**. | Duración ≤ 5:00; muestra el mapa con el marcador avanzando | 1,5 |
| T-53 | Actualizar `progress.md` y la matriz, ejecutar `check-constitution`, preparar el PR a `main` (**Anderson** hace commit, push y merge). | `check-constitution` sin errores nuevos; el PR queda revisado | 1 |

## Riesgos y mitigación

| Riesgo | Probabilidad e impacto | Mitigación |
|---|---|---|
| El build nativo falla (versiones, Gradle, plugin) | Media, alto | Se hace HOY (D-79), con `npx expo install` para versiones compatibles y `expo-doctor` antes. Si falla dos veces o pasan 3 h, Plan B. |
| No cargan las teselas (OpenFreeMap caído, red lenta o estilo que falla) | Baja-media, alto | `onDidFailLoadingMap` muestra el error con reintento; se prueba el estilo alternativo `positron`; si falla dos veces o pasan 3 h, Plan B (§9 de la arquitectura). |
| OSRM sin internet o sin respuesta (celular sin datos, servidor demo caído o con límite) | Media, alto | Tiempo máximo por petición; cadena de respaldo: ruta precargada para los puntos fijos y después línea recta marcada «Ruta aproximada»; botón de reintento. |
| Permiso de ubicación denegado o GPS débil en interiores | Media, medio | `ScreenState` con reintento; la fuente simulada para la demo y el video. |
| OSRM demo con límite de uso (1 petición por segundo) | Baja, medio | Una petición por tramo, nunca en bucle; ORS queda como adaptador alternativo futuro. |
| La API del pasajero llega a última hora con otra forma | Media, medio | Solo cambian `mappers.js` y `httpPassengerApi.js` (D-78); si no hay tiempo, la demo sigue con el mock y se declara. |
| Tiempo insuficiente | Alta, alto | C es abandonable, y D tiene su medio día reservado y no se recorta. |
| Desviaciones de F1 (FCM, Google Directions, geolocalización) | Segura, medio | Declaradas en D-77, D-82 y aquí; Anderson las consulta con la profesora. |

## Desviaciones y supuestos declarados
- Fecha de entrega: SUPUESTO.
- RNF-06: sin FCM (D-77); `expo-location` en lugar de `@react-native-community/geolocation` (D-82).
- RF-12: OSRM en lugar de Google Directions (Legacy, no habilitable en proyectos nuevos).
- RF-15/16: cobro simulado sin pasarela real, si C entra.
- Specs 002 a 009 no se crean completas: se reemplazan por specs cortas por rebanada.
