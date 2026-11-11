# Seguridad — UberClone Conductor

Estado: vigente para `drivers` y `driverLocations` (D-80, D-81; 2026-11-10). Borrador pendiente de publicar: `drivers/{uid}/trips/{tripId}` (D-86 a D-89; prompt #50, 2026-11-11).

## Dónde viven las reglas de Firestore
- Las reglas **efectivas** son las publicadas en la consola de Firebase (Firestore → Reglas). Anderson las publica a mano.
- `firestore.rules` en la raíz es una **copia local de trabajo** que Git ignora (`.gitignore`, D-80). Quien clone el repositorio no la tendrá. La política vigente se describe en palabras aquí.
- Cada vez que cambian las reglas, Anderson actualiza la consola y esta página el mismo día.

## Política vigente (colección `drivers/{uid}`)
1. **Solo el dueño lee.** Un usuario autenticado (auth anónima, D-53) solo puede leer el documento cuyo id es su propio `uid`.
2. **Solo el dueño crea.** La creación exige `uid` = id del documento y un envío válido:
   - `accountStatus` debe ser exactamente `pending`. La app nunca puede escribir `approved`; la aprobación se hace a mano en la consola, con acceso de administrador.
   - `personalData`, `vehicle` y `documents` con tipos y tamaños mínimos: nombre de 1 a 50, documento de 6 a 10, celular de 10, placa de 6, marca y modelo de 1 a 30, `year` y `capacity` numéricos, fotos con URL `https://`, `termsAccepted == true` y `commissionRate` numérico.
3. **Sin edición cuando la cuenta está aprobada.** El dueño puede reenviar (actualizar) solo mientras `accountStatus` no sea `approved`, y con las mismas validaciones de la creación (el estado vuelve a ser `pending`).
4. **Sin borrado.** Nadie puede borrar el documento desde la app.
5. **Todo lo demás está cerrado.** Ninguna otra colección tiene reglas, así que el acceso queda denegado por defecto.

## Ubicación del conductor (`driverLocations/{uid}`) — borrador, pendiente de publicar
Redactada en el prompt #43 (T-44). **No está publicada:** Anderson la pega en la consola (Firestore → Reglas), dentro de `match /databases/{database}/documents`, junto a la de `drivers`. Ya está en la copia local `firestore.rules`. Hasta que se publique, las escrituras de la app fallan en silencio y el viaje sigue sin ellas.
1. **Solo el dueño lee y escribe.** El id del documento debe ser el `uid` del usuario autenticado.
2. **Forma cerrada.** Solo se aceptan los campos `lat` y `lng` (números en rango), `timestamp` (número), `tripStatus` (texto o nulo) y `updatedAt` (hora del servidor, `serverTimestamp()`). Desde el prompt #44 (D-83) la app también escribe en `tripStatus` el valor de reposo `idle` al volver a Inicio; es un texto, así que la regla publicada lo acepta sin cambios.
3. **Sin borrado** desde la app.

```
    // Driver position during a trip (T-44): only the owner reads and writes; never deleted.
    match /driverLocations/{uid} {
      function validLocation() {
        let data = request.resource.data;
        return data.keys().hasOnly(['lat', 'lng', 'timestamp', 'tripStatus', 'updatedAt'])
          && data.lat is number && data.lat >= -90 && data.lat <= 90
          && data.lng is number && data.lng >= -180 && data.lng <= 180
          && data.timestamp is number
          && (data.tripStatus == null || data.tripStatus is string)
          && data.updatedAt == request.time;
      }

      allow read: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid && validLocation();
      allow delete: if false;
    }
```

## Viajes guardados (`drivers/{uid}/trips/{tripId}`) — borrador, pendiente de publicar
Redactada en el prompt #50 (T-46 a T-48). **No está publicada:** Anderson la pega en la consola (Firestore → Reglas), dentro de `match /databases/{database}/documents`, **como bloque nuevo** junto a `drivers` y `driverLocations`, sin tocar esos dos bloques. Ya está en la copia local `firestore.rules`. Hasta que se publique, «Confirmar cobro» muestra el error con «Reintentar» y la salida segura, y Ganancias e Historial muestran su estado de error.
1. **Solo el dueño lee.** El id de la subcolección debe ser el `uid` del usuario autenticado.
2. **Solo el dueño crea, con la cuenta aprobada.** Se consulta `drivers/{uid}` con `get()` y su `accountStatus` debe ser `approved`.
3. **Forma cerrada.** Solo los 15 campos del documento (`hasOnly` y `hasAll`): `driverId` (igual al `uid`), `status` (`completed` o `cancelled`), `category`, `passengerName` (hasta 80), `originLabel` y `destinationLabel` (hasta 200), `distanceKm` (0 a 500) y `durationMin` (0 a 1440) numéricos, `fare`, `commission` y `driverEarnings` enteros no negativos (pesos COP enteros, `commission + driverEarnings == fare`), `paymentMethod` (`cash`, `transfer` o `none`), `startedAt` (fecha o nulo), `finishedAt` (fecha) y `createdAt` (hora del servidor, `serverTimestamp()`).
4. **Sin coordenadas.** La regla no admite ningún campo de ubicación; el documento solo guarda direcciones en texto (D-87).
5. **Sin edición ni borrado** desde la app. Por eso guardar es idempotente leyendo antes: si el documento ya existe, no se escribe de nuevo.

```
    // Saved trips (T-46 to T-48): only the owner reads; created once by an approved driver; never
    // edited or deleted. No coordinates: only labels, distance, duration, whole-COP amounts and dates.
    match /drivers/{uid}/trips/{tripId} {
      function isTripOwner() {
        return request.auth != null && request.auth.uid == uid;
      }

      function isApprovedDriver() {
        return get(/databases/$(database)/documents/drivers/$(uid)).data.accountStatus == 'approved';
      }

      function validTrip() {
        let data = request.resource.data;
        return data.keys().hasOnly(['driverId', 'status', 'category', 'passengerName', 'originLabel', 'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'paymentMethod', 'startedAt', 'finishedAt', 'createdAt'])
          && data.keys().hasAll(['driverId', 'status', 'category', 'passengerName', 'originLabel', 'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'paymentMethod', 'startedAt', 'finishedAt', 'createdAt'])
          && data.driverId == uid
          && data.status in ['completed', 'cancelled']
          && data.category is string && data.category.size() > 0 && data.category.size() <= 20
          && data.passengerName is string && data.passengerName.size() <= 80
          && data.originLabel is string && data.originLabel.size() <= 200
          && data.destinationLabel is string && data.destinationLabel.size() <= 200
          && data.distanceKm is number && data.distanceKm >= 0 && data.distanceKm <= 500
          && data.durationMin is number && data.durationMin >= 0 && data.durationMin <= 1440
          && data.fare is int && data.fare >= 0 && data.fare <= 10000000
          && data.commission is int && data.commission >= 0 && data.commission <= data.fare
          && data.driverEarnings is int && data.driverEarnings >= 0 && data.driverEarnings <= data.fare
          && data.commission + data.driverEarnings == data.fare
          && data.paymentMethod in ['cash', 'transfer', 'none']
          && (data.startedAt == null || data.startedAt is timestamp)
          && data.finishedAt is timestamp
          && data.createdAt == request.time;
      }

      allow read: if isTripOwner();
      allow create: if isTripOwner() && isApprovedDriver() && validTrip();
      allow update: if false;
      allow delete: if false;
    }
```

## Secretos
- Secretos de servidor (`access_token` de Mercado Pago, API secret de Cloudinary): solo en `backend/.env` (RNF-05).
- Configuración pública de cliente (`EXPO_PUBLIC_*`): en `.env` local, ignorado por Git. `.env.example` lleva solo los **nombres** (D-81).
- El mapa no necesita clave ni variable: MapLibre usa las teselas públicas de OpenFreeMap y las rutas salen del servidor demo público de OSRM. Sus URL son constantes públicas en `src/config/map.js` y `src/config/routing.js` (D-82 Vigente MODIFICADA, prompt #41).
- Ningún agente de IA lee ni escribe valores de `.env` (CLAUDE.md).
