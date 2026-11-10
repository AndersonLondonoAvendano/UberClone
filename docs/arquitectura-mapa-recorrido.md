# Arquitectura — Mapa y recorrido del conductor en tiempo real

Estado: arquitectura aprobada para la rebanada 0 y la B (D-79, D-82 Vigente MODIFICADA el 2026-11-10: MapLibre + OpenFreeMap, sin Google). Requisito de la profesora (obligatorio): mostrar en un mapa la ruta **por calles** desde la posición del conductor (Y) hasta la del pasajero (X), y el marcador del conductor avanzando por ella en tiempo real hasta llegar a X.
Requisitos: RF-08, RF-09, RF-12, RNF-03 (`useDriverLocation`), RNF-06 (mapa y geolocalización), RNF-07 (OSRM/ORS), RNF-08, RNF-10.
Proyecto: `expo` ~57.0.31, `react-native` 0.86.3, development build (RNF-12). Evidencia consultada el 2026-11-10; lo marcado **(no verificado)** no se pudo confirmar en documentación oficial.

## 1. Biblioteca de mapa

**Actualización 2026-11-10 (prompt #41, D-82 Vigente MODIFICADA):** se descarta `react-native-maps` porque Google Maps exige cuenta de facturación y una clave embebida en el APK. El mapa usa **MapLibre** con teselas abiertas de **OpenFreeMap**, sin clave ni registro.

| Opción | Estado en SDK 57 | Veredicto |
|---|---|---|
| **`@maplibre/maplibre-react-native`** | Versión instalada **11.5.1** (`npx expo install`). Peer deps: react ≥ 19.1, react-native ≥ 0.80, expo ≥ 54, compatibles con el proyecto. La v11 solo admite la nueva arquitectura, que es la del proyecto. Plugin de configuración `@maplibre/maplibre-react-native` sin opciones obligatorias. No funciona en Expo Go: requiere development build. | **Elegida** |
| `react-native-maps` (1.27.2) | Funciona, pero en Android exige clave de Google Maps, cuenta de facturación y restricción por SHA-1. | Descartada (D-82) |
| `expo-maps` (~57.0.4) | En **alfa** según su página del SDK 57; en Android usa Google Maps. | Descartada |
| WebView + Leaflet | `react-native-webview` está en «proposed». | Solo como parte del Plan B (§9) |

**Estilo de mapa (OpenFreeMap):**
- Estilo por defecto: `https://tiles.openfreemap.org/styles/liberty`. Alternativa: `https://tiles.openfreemap.org/styles/positron` (más sobrio; la URL se deduce del mismo patrón). Ambas viven como constantes en `src/config/map.js`, no como variables de entorno: no son secretos.
- Sin clave ni registro. La página de inicio rápido de OpenFreeMap indica que los mismos estilos sirven para MapLibre Native en móviles.
- **Atribución obligatoria visible:** «OpenFreeMap © OpenMapTiles Data from OpenStreetMap». MapLibre muestra su botón de atribución por defecto y **no se oculta** (no se usa `attribution={false}`). Además, la pantalla añade un texto visible sobre el mapa con la atribución de las teselas, de OpenStreetMap y de OSRM, porque el botón nativo solo muestra el texto al pulsarlo.

**API de MapLibre v11 que se usa (leída de `node_modules/@maplibre/maplibre-react-native` y de la guía de migración a v11):**
- `Map` (antes `MapView`) con `mapStyle` (URL del estilo), `attribution`, `logo`, `onDidFailLoadingMap` y `onDidFinishLoadingMap`.
- `Camera` con `initialViewState` (`{ center: [lng, lat], zoom }` o `{ bounds: [oeste, sur, este, norte], padding }`) y métodos `easeTo`, `fitBounds` y `jumpTo` por referencia.
- `GeoJSONSource` (antes `ShapeSource`) con `data` (objeto GeoJSON) y, dentro, `Layer` con `type="line"` y estilos en `paint`/`layout` (el prop `style` de `Layer` está obsoleto y se elimina en v12).
- `UserLocation` (punto del conductor) y `LocationManager.requestPermissions()`. Las coordenadas de MapLibre van en orden **[lng, lat]**.
- Plugin: en Android solo personaliza; el manifiesto de la biblioteca ya declara `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`. En iOS añade su paso al `Podfile`.

## 2. Ruta por calles: comparación de proveedores

| | **OSRM (servidor demo)** | **OpenRouteService** | **Google (Routes API)** |
|---|---|---|---|
| Clave | No (la wiki del servidor demo no la menciona) **(no verificado que nunca la exija)** | Sí (cuenta gratuita) | Sí, más facturación |
| Costo | Gratis | Gratis en el plan Standard | Compute Routes Essentials: 10.000 al mes gratis y luego USD 5 por 1.000 |
| Límites | **Máx. 1 petición por segundo**, uso «razonable» y no comercial, sin garantía ni SLA, user agent válido y atribución a OpenStreetMap obligatoria | Directions: **2.000/día y 40/min**; al exceder, 403 (diario) o 429 (por minuto) | Cuotas por proyecto |
| Estado | Activo, pero sin garantías | Aviso de cierre del endpoint `api.openrouteservice.org` en nov. 2026 **(no verificado)** | **Directions API es «Legacy»**: según su página, desde octubre de 2026 no se puede habilitar en proyectos nuevos. RF-12 la nombra, pero el reemplazo es Routes API. |
| Petición | `GET https://router.project-osrm.org/route/v1/driving/{lngY},{latY};{lngX},{latX}?overview=full&geometries=geojson` (orden **lng,lat**) | `POST /v2/directions/driving-car/geojson` con la clave en la cabecera | `POST routes.googleapis.com/directions/v2:computeRoutes` con máscara de campos |
| Respuesta | `code:"Ok"`, `routes[0].distance` (m), `routes[0].duration` (s), `routes[0].geometry` | GeoJSON o polilínea codificada de precisión 1e5 | `routes[0].polyline.encodedPolyline`, `distanceMeters`, `duration` |
| Decodificar | Con `geometries=geojson`: **nada**, un arreglo `[lng,lat]` que se invierte a `{latitude, longitude}`. Con `polyline` o `polyline6` se usa el algoritmo de polilínea de Google con precisión 1e5 o 1e6. | Con el endpoint `/geojson`: nada | Polilínea codificada de precisión 1e5: decodificador de unas 25 líneas, sin dependencia |
| Clave expuesta en la app | No aplica | Sí, salvo que pase por el backend | Sí, salvo que pase por el backend |

**Recomendación para la demo:** **OSRM demo con `geometries=geojson`**. Es gratis, no necesita clave ni facturación, y no requiere decodificar nada. La columna de Google queda solo como comparación: no se usa (D-82).
- **Una sola petición por tramo:** al aceptar (Y→X) y al pulsar «Pasajero a bordo» (X→destino). **Nunca** una por posición, para respetar 1 petición por segundo. Se añade atribución visible de OSRM y OpenStreetMap sobre el mapa.
- **Respaldo 1 (ruta precargada):** para los dos puntos fijos de la prueba de la rebanada 0 (y para la demo) se guarda en el código una ruta por calles ya calculada con OSRM. Si la red falla y el tramo pedido coincide con esos puntos, se usa esa ruta y se marca como «Ruta de respaldo».
- **Respaldo 2 (último recurso, sin red):** `straightLine.js` interpola puntos entre Y y X. No va por calles, pero la demo nunca se queda en blanco; se marca en pantalla como «Ruta aproximada».
- OpenRouteService queda como opción futura (con la clave detrás del backend Express); no se implementa ahora.
- RF-12 queda cubierto en lo funcional con otro proveedor. Es una desviación del nombre «Google Directions» que se justifica porque esa API ya no puede habilitarse en proyectos nuevos y exige facturación.

**Aislamiento:** `src/services/routing/`
```
index.js           getRoute(from, to, { allowFallback }) -> Promise<{ coordinates: [lng, lat][], distanceM, durationS, provider }>
osrmRouting.js     adaptador OSRM (por defecto)
fallbackRoute.js   ruta precargada para los puntos fijos de prueba
straightLine.js    último recurso local sin red
```
- Las constantes (`OSRM_BASE_URL`, tiempo de espera, puntos fijos de prueba) viven en `src/config/routing.js`.
- `provider` indica de dónde salió la ruta (`'osrm'`, `'fallback'` o `'straight'`), para que la pantalla lo muestre con honestidad.
- Si OSRM falla y no se permite respaldo, `index.js` rechaza con un error normalizado (`ROUTE_FAILED`) y la pantalla ofrece reintentar.
- Las pantallas nunca construyen URLs de enrutamiento.

## 3. Fuente de posición del conductor (intercambiable)

Interfaz común en `src/services/location/`:
```
index.js            watchDriverPosition(onPosition, onError, { route? }) -> unsubscribe
gpsSource.js        GPS real con expo-location
simulatedSource.js  recorre la polilínea de la ruta
```
Una constante `LOCATION_SOURCE = 'simulated' | 'gps'` (en `src/config/location.js`) elige la fuente. Ambas entregan `{ lat, lng, heading?, speed?, timestamp }`.

1. **GPS real (`expo-location`).** El paquete está en la referencia del SDK 57: la página indica ~57.0.23 y el `bundledNativeModules.json` local ~57.0.22. `npx expo install expo-location` resuelve la versión compatible.
   - Permiso: `requestForegroundPermissionsAsync()`, con el estado comparado contra `'granted'`.
   - Seguimiento: `watchPositionAsync({ accuracy: Accuracy.High, timeInterval: 2000, distanceInterval: 5 }, callback, errorHandler)`, que devuelve una suscripción con `.remove()`.
   - Solo funciona en **primer plano**. `timeInterval` solo tiene efecto en Android.
   - El plugin `expo-location` acepta `locationWhenInUsePermission` (texto del permiso en iOS, en español) e `isAndroidBackgroundLocationEnabled` (por defecto `false`, se deja así).
   - Android: el plugin añade `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION` **(lista exacta no verificada textualmente)**.
2. **Simulada.** Recibe la polilínea de `getRoute` y emite una posición cada 1 s, avanzando a una velocidad constante configurable (por defecto 40 km/h, con un multiplicador de demo ×2 o ×4) e interpolando entre vértices. Sirve para la demo y el video sin salir de casa. También simula el arranque con la posición real del GPS si está disponible, o con una posición fija de Medellín si no.

`useDriverLocation` (RNF-03) envuelve la fuente: se suscribe en `useEffect` y llama a `unsubscribe` en la limpieza al pasar a No disponible o al salir (RF-09).

## 4. Comportamiento en pantalla (`TripActiveScreen`, estado `driver_arriving`)
- **Marcadores:** pasajero en X (origen de la solicitud) y conductor en su posición actual, con el ícono rotado según `heading` si existe. En `in_progress`, el marcador de destino reemplaza al del pasajero.
- **Ruta:** la de `getRoute`, dibujada con `GeoJSONSource` (una `LineString`) y un `Layer` de tipo `line` de MapLibre (coherente con RNF-10). Se recorta opcionalmente la parte ya recorrida.
- **Cámara:** sigue al conductor con `easeTo` de `Camera` en cada posición, con un límite de una animación por segundo. Al cargar la ruta, `fitBounds` encuadra Y y X.
- **Tiempo y distancia restantes:**
  - Distancia: la distancia sobre la polilínea desde el punto más cercano al conductor hasta X, calculada con haversine sobre los vértices, sin red.
  - Tiempo: la distancia restante por `durationS / distanceM` de la ruta.
- **Llegada:** si la distancia en línea recta a X es **≤ 30 m** (constante `ARRIVAL_THRESHOLD_M`), se muestra «Llegaste» y se habilita «Pasajero a bordo», que llama a `reportTripStatus(id, 'in_progress')` y pide la ruta X→destino. Llegar al destino con el mismo umbral habilita «Finalizar viaje» (`completed`).
- **Errores (con `ScreenState` existente):**
  - Sin permiso de ubicación → `kind="error"` con texto que lleva a Ajustes, y `onRetry` vuelve a pedir el permiso.
  - GPS perdido (no llega posición en 15 s) → aviso no bloqueante; el mapa conserva la última posición.
  - Ruta fallida → `kind="error"` con `onRetry`, más el botón secundario «Usar ruta aproximada».
  - Carga inicial → `kind="loading"`.

## 5. Estados del viaje en la pantalla
`accepted` → (ruta Y→X cargada) `driver_arriving` → (≤ 30 m y «Pasajero a bordo») `in_progress` → (≤ 30 m del destino y «Finalizar») `completed` → `TripSummaryScreen`. `cancelled` es posible desde `accepted`, `driver_arriving` e `in_progress`.

## 6. Publicación de la posición
- `reportDriverLocation(tripId, …)` se llama **como máximo cada 5 s, y solo si el conductor se movió ≥ 20 m** desde el último envío, con un regulador en el hook. Siempre se envía en los cambios de estado.
- Disponible sin viaje (RF-09): la escritura en Firestore (`drivers/{uid}` o `driverLocations/{uid}`, a definir en la rebanada B junto con su regla) sigue el mismo límite de 5 s y 20 m. Eso son como máximo unas 720 escrituras por hora en movimiento continuo, dentro de la cuota gratuita diaria de Firestore para una demo.
- Si la escritura falla, no hay reintentos en cola: se descarta y se envía la siguiente.

## 7. Rendimiento, batería y segundo plano
- `Accuracy.High` solo durante un viaje. Disponible sin viaje usa `Accuracy.Balanced` y `distanceInterval: 20`.
- Al pasar la app a segundo plano (`AppState` distinto de `active`) se detienen la suscripción de GPS, la fuente simulada y las animaciones de cámara. Se reanudan al volver.
- **La ubicación en segundo plano real queda fuera de alcance.** Exigiría `expo-task-manager`, `startLocationUpdatesAsync`, permiso «siempre» y servicio en primer plano en Android. F1 no lo exige y no entra en el build de hoy.

## 8. Build único de hoy: dependencias y pasos manuales

**Dependencias nativas (instaladas con `npx expo install` en el prompt #41, D-82):**
| Paquete | Versión instalada | Plugin en `app.json` |
|---|---|---|
| `@maplibre/maplibre-react-native` | ^11.5.1 | `@maplibre/maplibre-react-native`, sin opciones |
| `expo-location` | ~57.0.23 | `expo-location` con `locationWhenInUsePermission` en español |

Sin otras dependencias nativas. No hay claves ni variables de entorno para el mapa, así que basta con `app.json` (no se crea `app.config.js`). El decodificador de polilínea no hace falta con GeoJSON, la llamada a OSRM usa `fetch`, y FCM queda fuera (D-77).

**Pasos manuales de Anderson (en orden):**
1. Detener Metro.
2. `npm install` (por si el `package-lock.json` cambió).
3. Con el celular conectado, `npx expo run:android` (build nativo con los dos plugins nuevos).
4. Levantar Metro con `npx expo start -c`.
5. Spike: con `SHOW_DEV_TOOLS = true` solo en local, abrir la pantalla de prueba y confirmar que se ven el mapa con calles y su atribución, el punto de la posición real y una ruta OSRM dibujada entre dos puntos fijos. Devolver `SHOW_DEV_TOOLS` a `false`.

## 9. Plan B si el mapa nativo no compila a tiempo
- **Criterio de activación:** el build de la rebanada 0 sigue fallando a las **3 horas** de empezar, o el mapa aparece gris o en blanco porque no cargan las teselas de OpenFreeMap (con red disponible) tras dos intentos de corregirlo (por ejemplo, probar el estilo `positron`).
- **Plan B1 (sin mapa base):** el mismo `TripActiveScreen` con un componente `RouteView` que recibe la misma interfaz de datos (`route.coordinates`, `driverPosition`, `pickup`, `remaining`). En lugar de `MapView`, dibuja la polilínea y los marcadores en un lienzo SVG proyectado (equirectangular local) sobre fondo neutro, con «Mapa no disponible» y la atribución de OSM. `react-native-svg` está en el SDK, pero **no** en `dependencies.json` y sería otra dependencia nativa **(no verificado si ya viene en el build actual)**. La alternativa sin dependencias son `View` posicionados en absoluto para marcadores y segmentos.
- **Plan B2:** si `expo-location` sí compila pero `@maplibre/maplibre-react-native` no, se mantiene el GPS real y solo cambia la vista.
- Todo lo demás (contrato, routing, fuente de posición, estados) no cambia, porque el mapa solo es la capa de presentación. El Plan B cumple a medias el requisito de la profesora (hay recorrido por calles y avance en tiempo real, pero sin mapa base) y debe declararse honestamente en el README y el video.

## Fuentes
- https://maplibre.org/maplibre-react-native/docs/setup/expo
- https://maplibre.org/maplibre-react-native/docs/setup/migrations/v11
- `node_modules/@maplibre/maplibre-react-native/src` (tipos y componentes de la versión instalada 11.5.1)
- https://openfreemap.org/quick_start/
- https://docs.expo.dev/versions/v57.0.0/sdk/map-view/ (solo para la comparación descartada)
- https://docs.expo.dev/versions/v57.0.0/sdk/location/
- https://docs.expo.dev/versions/v57.0.0/sdk/maps/
- https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server
- https://map.project-osrm.org/about.html
- http://project-osrm.org/docs/v5.24.0/api/
- https://openrouteservice.org/plans/
- https://giscience.github.io/openrouteservice/frequently-asked-questions
- https://giscience.github.io/openrouteservice/api-reference/
- https://developers.google.com/maps/documentation/directions/overview
- https://developers.google.com/maps/billing-and-pricing/pricing
- https://developers.google.com/maps/billing-and-pricing/sku-details/maps.md.txt
- https://developers.google.com/maps/billing-and-pricing/sku-details/routes.md.txt
