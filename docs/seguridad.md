# Seguridad — UberClone Conductor

Estado: vigente para `drivers` y `driverLocations` (D-80, D-81; 2026-11-10). Borrador pendiente de publicar: `drivers/{uid}/trips/{tripId}` (D-86 a D-89; prompt #50, 2026-11-11) y validación de `documents` en `drivers/{uid}` (T-84; prompt #55, 2026-11-11).

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
3. **Forma cerrada.** Solo los campos del documento (`hasOnly`; `hasAll` sin `route`, que es opcional): `driverId` (igual al `uid`), `status` (`completed` o `cancelled` al crear), `paymentStatus` (siempre `pending` al crear), `commissionRate` (número de 0 a 1), `category`, `passengerName` (hasta 80), `originLabel` y `destinationLabel` (hasta 200), `distanceKm` (0 a 500) y `durationMin` (0 a 1440) numéricos, `fare`, `commission` y `driverEarnings` enteros no negativos (pesos COP enteros, `commission + driverEarnings == fare`), `paymentMethod` (`cash` o `mercadopago`; los valores viejos `transfer` y `none` ya no se aceptan al crear), `startedAt` (fecha o nulo), `finishedAt` (fecha), `createdAt` (hora del servidor, `serverTimestamp()`) y `route` opcional (lista de hasta 40 puntos `{lat, lng}` numéricos).
4. **Sin coordenadas de posición en vivo.** La regla no admite la ubicación del conductor ni del pasajero; el documento guarda direcciones en texto (D-87) y, opcionalmente, `route`: la ruta planificada, hasta 40 puntos con 4 decimales (D-110).
5. **Sin borrado** desde la app. La edición está cerrada salvo la regla estrecha de efectivo (punto 6). Guardar es idempotente leyendo antes: si el documento ya existe, no se escribe de nuevo.
6. **Pagos (T-91, D-107 a D-110).** La app crea el viaje con `status: 'completed'`, `paymentStatus: 'pending'` y `paymentMethod` `cash` o `mercadopago`. En viajes `mercadopago`, `paymentStatus`, `paymentId` y `status: 'paid'` los escribe **solo el backend** con firebase-admin, que no pasa por estas reglas: la app no puede editarlos. En viajes `cash` hay una regla de `update` estrecha: el conductor dueño y aprobado puede pasar `paymentStatus` de `pending` a `paid` y `status` de `completed` a `paid`; solo cambian `paymentStatus` y `status` (`paymentMethod` debe seguir siendo `cash`), y no se permite ninguna otra edición ni el borrado. Casos denegados (CA-002-59): otro uid, cuenta no aprobada, viaje `mercadopago`, cambiar `fare` u otro campo, volver de `paid` a `pending`, agregar `paymentId`, borrar. Leer en vivo (`onSnapshot`) usa `allow read: if isTripOwner()`. El texto está listo para pegar; no se tocó `firestore.rules` local.
7. **Backend detrás de un túnel o proxy.** El backend no activa `trust proxy`: tras ngrok o un hosting, `req.ip` es la IP del proxy y todos los clientes comparten el límite de 120 por minuto. Para la prueba real alcanza; al desplegar, añadir `app.set('trust proxy', 1)` mediante una variable de entorno.

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

      function validRoute(route) {
        return route is list && route.size() <= 40
          && (route.size() == 0 || (route[0].keys().hasOnly(['lat', 'lng']) && route[0].lat is number && route[0].lng is number));
      }

      function validTrip() {
        let data = request.resource.data;
        return data.keys().hasAll(['driverId', 'status', 'paymentStatus', 'commissionRate', 'category', 'passengerName', 'originLabel', 'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'paymentMethod', 'startedAt', 'finishedAt', 'createdAt'])
          && data.keys().hasOnly(['driverId', 'status', 'paymentStatus', 'commissionRate', 'category', 'passengerName', 'originLabel', 'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'paymentMethod', 'startedAt', 'finishedAt', 'createdAt', 'route'])
          && data.driverId == uid
          && data.status in ['completed', 'cancelled']
          && data.paymentStatus == 'pending'
          && data.commissionRate is number && data.commissionRate >= 0 && data.commissionRate <= 1
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
          && data.paymentMethod in ['cash', 'mercadopago']
          && (data.startedAt == null || data.startedAt is timestamp)
          && data.finishedAt is timestamp
          && data.createdAt == request.time
          && (!('route' in data) || validRoute(data.route));
      }

      // Narrow cash rule (D-108): only paymentStatus and status change, pending/completed -> paid,
      // only for a cash trip. Mercado Pago trips are updated only by the backend (admin).
      function validCashPayment() {
        let before = resource.data;
        let after = request.resource.data;
        return before.paymentMethod == 'cash'
          && before.paymentStatus == 'pending' && before.status == 'completed'
          && after.paymentStatus == 'paid' && after.status == 'paid'
          && after.diff(before).affectedKeys().hasOnly(['paymentStatus', 'status']);
      }

      allow read: if isTripOwner();
      allow create: if isTripOwner() && isApprovedDriver() && validTrip();
      allow update: if isTripOwner() && isApprovedDriver() && validCashPayment();
      allow delete: if false;
    }
```

## Documentos del conductor (`drivers/{uid}.documents`)

<!-- AI-assisted: see docs/AI_LOG.md #55 (T-84, CA-002-57, RF-41, RNF-16) -->
Redactada en el prompt #55. **No está publicada:** Anderson la pega en la consola de Firebase, a mano, reemplazando la validación de `documents` dentro de la regla de `drivers/{uid}` (el resto de la regla no cambia). No se toca el `firestore.rules` local ni la consola desde el código.

1. `documents.license`: `number` alfanumérico de 5 a 20 caracteres, `photoUrl` con `https://` y `expiresAt` como texto `YYYY-MM-DD`.
2. `documents.soat`: `photoUrl` con `https://` y `expiresAt` como texto `YYYY-MM-DD`.
3. `documents.technicalReview`: `required` booleano. Si `required` es `true`, `photoUrl` (`https://`) y `expiresAt` son obligatorios; si es `false`, ambos son `null`.
4. Las cuentas anteriores, sin `license`, `soat` ni `technicalReview`, siguen pasando: cada bloque es opcional.
5. No se aceptan campos bancarios ni de tarjeta (`cardNumber`, `bankAccount` y similares): solo las claves listadas, `mercadoPagoEmail` y `termsAccepted == true`.
6. La vigencia de la fecha (posterior a hoy) la valida la app; la regla solo comprueba el formato, porque Firestore no conoce la zona UTC−5 del conductor.

```
// Documents of the driver (inside the drivers/{uid} rule).
function validDate(v) {
  return v is string && v.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
}
function validUrl(v) {
  return v is string && v.matches('^https://.+') && v.size() <= 500;
}
function validLicense(l) {
  return l.keys().hasOnly(['number', 'photoUrl', 'expiresAt'])
    && l.number is string && l.number.matches('^[A-Za-z0-9]{5,20}$')
    && validUrl(l.photoUrl) && validDate(l.expiresAt);
}
function validSoat(s) {
  return s.keys().hasOnly(['photoUrl', 'expiresAt'])
    && validUrl(s.photoUrl) && validDate(s.expiresAt);
}
function validTechnicalReview(t) {
  return t.keys().hasOnly(['required', 'photoUrl', 'expiresAt'])
    && t.required is bool
    && (t.required
      ? (validUrl(t.photoUrl) && validDate(t.expiresAt))
      : (t.photoUrl == null && t.expiresAt == null));
}
function validDocuments(d) {
  // Old accounts: the three blocks are optional.
  return (!('license' in d) || validLicense(d.license))
    && (!('soat' in d) || validSoat(d.soat))
    && (!('technicalReview' in d) || validTechnicalReview(d.technicalReview));
}
// Use inside the drivers/{uid} create/update: && validDocuments(request.resource.data.documents)
// Keep the existing checks (termsAccepted == true, commissionRate, https photos of the vehicle).
```

**Fotos de prueba.** Las imágenes se suben a Cloudinary con un preset sin firma (D-68); las URL son públicas pero no adivinables. Se usan solo fotos de prueba: nunca documentos reales. Este texto no contiene credenciales ni valores de `.env`.

## Secretos
- Secretos de servidor (`access_token` de Mercado Pago, API secret de Cloudinary): solo en `backend/.env` (RNF-05).
- Configuración pública de cliente (`EXPO_PUBLIC_*`): en `.env` local, ignorado por Git. `.env.example` lleva solo los **nombres** (D-81).
- El mapa no necesita clave ni variable: MapLibre usa las teselas públicas de OpenFreeMap y las rutas salen del servidor demo público de OSRM. Sus URL son constantes públicas en `src/config/map.js` y `src/config/routing.js` (D-82 Vigente MODIFICADA, prompt #41).
- Ningún agente de IA lee ni escribe valores de `.env` (CLAUDE.md).
