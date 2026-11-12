# Seguridad — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #56 (T-73, reglas consolidadas) -->
Estado: **un solo texto final de reglas** para `drivers` (con `documents`), `driverLocations` y `drivers/{uid}/trips` (D-80, D-81, D-86 a D-89, D-93, D-107 a D-110, T-73, T-84). **Pendiente de publicar** en la consola (Anderson). Desde que se publique, la sesión anónima queda denegada en las tres colecciones: solo vale la sesión con correo y contraseña.

## Dónde viven las reglas de Firestore
- Las reglas **efectivas** son las publicadas en la consola de Firebase (Firestore → Reglas). Anderson las publica a mano.
- `firestore.rules` en la raíz es una **copia local de trabajo** que Git ignora (`.gitignore`, D-80) y tiene **exactamente el mismo texto** que el bloque de abajo. Quien clone el repositorio no la tendrá.
- Cada vez que cambian las reglas, Anderson actualiza la consola y esta página el mismo día.

## Orden de publicación
1. Verificar que la cuenta de prueba tiene `drivers/{uid}.accountStatus == 'approved'` (se aprueba a mano en la consola con acceso de administrador).
2. Firestore → Reglas: **reemplazar todo** el contenido por el bloque de abajo (no pegar por partes) y pulsar **Publicar**.
3. Esperar la confirmación de la consola (unos segundos) y reiniciar la app.
4. Repetir las pruebas de la sección siguiente.

## Pruebas que Anderson repite después de publicar (celular, sesión con correo y contraseña)
1. Registro: enviar el formulario con documentos (licencia, SOAT y, si aplica, revisión técnico-mecánica) → se guarda en `drivers/{uid}` con `accountStatus: pending`.
2. Con la cuenta aprobada: terminar un viaje en efectivo → aparece en Historial; «Confirmar cobro» lo pasa a pagado.
3. Terminar un viaje con Mercado Pago → aparece pendiente y el backend lo pasa a pagado (el cliente no puede).
4. Cancelar un viaje → queda guardado con montos 0.
5. Inicio: la posición se publica en `driverLocations/{uid}` (el viaje no falla si no se publica).
6. Cerrar sesión e intentar leer algo sin sesión o con sesión anónima: debe fallar con permiso denegado.
7. Cuenta pendiente: terminar un viaje no guarda (la regla exige cuenta aprobada) y la app muestra su error con «Reintentar».

## Política (en palabras)
**Común.** Solo vale una sesión con correo y contraseña (`sign_in_provider == 'password'`, D-93) cuyo `uid` sea el dueño del documento. La sesión anónima (D-53, retirada) y cualquier otro `uid` se deniegan en lectura y escritura. Nada se borra desde la app.

**`drivers/{uid}`** (registro y cuenta)
1. **Solo el dueño lee y crea.** La creación exige un envío válido: `accountStatus` exactamente `pending` (la app nunca escribe `approved`; se aprueba a mano en la consola), `personalData` y `vehicle` con tipos y tamaños mínimos (nombre de 1 a 50, documento de 6 a 10, celular de 10, placa de 6, marca y modelo de 1 a 30, `year` y `capacity` numéricos, fotos con URL `https://`) y `documents` cerrado con `hasOnly`.
2. **`documents` (T-84).** Solo las claves `mercadoPagoEmail`, `termsAccepted` (debe ser `true`), `commissionRate` (número), `license`, `soat` y `technicalReview`: no se aceptan campos de tarjeta ni bancarios. `license`: `number` alfanumérico de 5 a 20, `photoUrl` `https://`, `expiresAt` `YYYY-MM-DD`. `soat`: `photoUrl` y `expiresAt`. `technicalReview`: `required` booleano; si es `true`, foto y fecha obligatorias; si es `false`, ambas `null`. Los tres bloques son opcionales para que pasen las cuentas anteriores. La vigencia de la fecha la valida la app (Firestore no conoce la zona UTC−5).
3. **Reenvío.** El dueño puede actualizar solo mientras `accountStatus` no sea `approved`, con las mismas validaciones (el estado vuelve a `pending`). Con la cuenta aprobada ya no puede escribir su documento. El nivel superior del documento no se cierra con `hasOnly` a propósito, para no bloquear el reenvío por campos que añade la consola.
4. **Sin borrado.**

**`driverLocations/{uid}`** (T-44)
1. **Solo el dueño lee y escribe.**
2. **Forma cerrada:** `lat` y `lng` (números en rango), `timestamp` (número), `tripStatus` (texto o nulo; la app escribe también `idle`, D-83) y `updatedAt` (hora del servidor).
3. **Sin borrado.**

**`drivers/{uid}/trips/{tripId}`** (T-46 a T-48, T-91)
1. **Solo el dueño lee.** Crea el dueño con la cuenta aprobada (se consulta `drivers/{uid}` con `get()`).
2. **Forma cerrada:** `driverId` (igual al `uid`), `status` (`completed` o `cancelled` al crear), `paymentStatus` (siempre `pending` al crear), `commissionRate` (0 a 1), `category`, `passengerName` (hasta 80), `originLabel` y `destinationLabel` (hasta 200), `distanceKm` (0 a 500), `durationMin` (0 a 1440), `fare`, `commission` y `driverEarnings` enteros no negativos (COP enteros, `commission + driverEarnings == fare`), `paymentMethod` (`cash` o `mercadopago`), `startedAt` (fecha o nulo), `finishedAt` (fecha), `createdAt` (hora del servidor) y `route` opcional (hasta 40 puntos `{lat, lng}`; las reglas no iteran, así que se comprueban el tamaño, el primero y el último punto, D-110).
3. **Sin coordenadas en vivo:** direcciones en texto (D-87) y, opcionalmente, la ruta planificada.
4. **Pagos (D-107 a D-110).** En viajes `mercadopago` o `stripe` (D-118, D-121: `create` solo admite `paymentMethod` `cash` o `mercadopago`; `mercadopago` sin `paymentId` significa «tarjeta, pasarela por definir» y el contrato simulado `card` se guarda así. `stripe` lo escribe solo el backend con firebase-admin al cobrar, que no pasa por las reglas; no hace falta republicar), `paymentStatus`, `paymentId` y `status: 'paid'` los escribe **solo el backend** con firebase-admin, que no pasa por estas reglas. En viajes `cash` hay una regla de `update` estrecha: pasar `paymentStatus` de `pending` a `paid` y `status` de `completed` a `paid`, y solo esas dos claves cambian (`paymentMethod` sigue `cash`). Casos denegados (CA-002-59): otro uid, cuenta no aprobada, viaje `mercadopago`, cambiar `fare` u otro campo, volver de `paid` a `pending`, agregar `paymentId`, borrar.
5. **Sin borrado.** Guardar es idempotente leyendo antes: si el documento ya existe, no se escribe de nuevo.
6. **Backend detrás de un túnel o proxy.** El backend no activa `trust proxy`: tras ngrok o un hosting, `req.ip` es la IP del proxy y todos los clientes comparten el límite de 120 por minuto. Para la prueba real alcanza; al desplegar, añadir `app.set('trust proxy', 1)` mediante una variable de entorno.

**Todo lo demás está cerrado:** ninguna otra colección tiene reglas.

## Texto final de las reglas (pegar completo, reemplazando todo)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Only a session started with email and password may touch the driver's data (D-93, T-73).
    // Anonymous sessions (sign_in_provider == 'anonymous') are always denied.
    function isDriverSession(uid) {
      return request.auth != null
        && request.auth.uid == uid
        && request.auth.token.firebase.sign_in_provider == 'password';
    }

    // Driver registration and account (T-84 documents included). Approval is done by hand in the
    // Firebase console (admin access, not subject to these rules).
    match /drivers/{driverId} {
      function isHttpsUrl(value) {
        return value is string && value.matches('^https://.+') && value.size() <= 500;
      }

      function isIsoDate(value) {
        return value is string && value.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
      }

      function validPersonalData(data) {
        return data.fullName is string && data.fullName.size() > 0 && data.fullName.size() <= 50
          && data.documentNumber is string && data.documentNumber.size() >= 6 && data.documentNumber.size() <= 10
          && data.phone is string && data.phone.size() == 10
          && data.birthDate is string && data.birthDate.size() == 10
          && data.gender is string
          && data.email is string && data.email.size() <= 254
          && data.language is string
          && isHttpsUrl(data.profilePhotoUrl);
      }

      function validVehicle(data) {
        return data.category is string
          && data.plate is string && data.plate.size() == 6
          && data.brand is string && data.brand.size() > 0 && data.brand.size() <= 30
          && data.model is string && data.model.size() > 0 && data.model.size() <= 30
          && data.year is number
          && data.color is string
          && data.capacity is number && data.capacity > 0
          && isHttpsUrl(data.photoUrl);
      }

      function validLicense(l) {
        return l.keys().hasOnly(['number', 'photoUrl', 'expiresAt'])
          && l.number is string && l.number.matches('^[A-Za-z0-9]{5,20}$')
          && isHttpsUrl(l.photoUrl) && isIsoDate(l.expiresAt);
      }

      function validSoat(s) {
        return s.keys().hasOnly(['photoUrl', 'expiresAt'])
          && isHttpsUrl(s.photoUrl) && isIsoDate(s.expiresAt);
      }

      function validTechnicalReview(t) {
        return t.keys().hasOnly(['required', 'photoUrl', 'expiresAt'])
          && t.required is bool
          && (t.required
            ? (isHttpsUrl(t.photoUrl) && isIsoDate(t.expiresAt))
            : (t.photoUrl == null && t.expiresAt == null));
      }

      // license, soat and technicalReview are optional so accounts saved before T-84 still pass.
      // The expiry being in the future is checked by the app: Firestore does not know UTC-5.
      function validDocuments(d) {
        return d.keys().hasOnly(['mercadoPagoEmail', 'termsAccepted', 'commissionRate', 'license', 'soat', 'technicalReview'])
          && d.mercadoPagoEmail is string && d.mercadoPagoEmail.size() <= 254
          && d.termsAccepted == true
          && d.commissionRate is number
          && (!('license' in d) || validLicense(d.license))
          && (!('soat' in d) || validSoat(d.soat))
          && (!('technicalReview' in d) || validTechnicalReview(d.technicalReview));
      }

      // The client may only ever write accountStatus as 'pending'.
      function validSubmission() {
        let data = request.resource.data;
        return data.accountStatus == 'pending'
          && validPersonalData(data.personalData)
          && validVehicle(data.vehicle)
          && validDocuments(data.documents);
      }

      allow read: if isDriverSession(driverId);
      allow create: if isDriverSession(driverId) && validSubmission();
      // Once approved, the client can no longer write to its own document at all.
      allow update: if isDriverSession(driverId) && resource.data.accountStatus != 'approved' && validSubmission();
      allow delete: if false;
    }

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

      allow read: if isDriverSession(uid);
      allow create, update: if isDriverSession(uid) && validLocation();
      allow delete: if false;
    }

    // Saved trips (T-46 to T-48, D-107 to D-110): only the owner reads; created once by an approved
    // driver; the only edit is confirming a cash payment. Mercado Pago updates come from the backend
    // (admin SDK, not subject to these rules). No live coordinates: labels, distance, duration,
    // whole-COP amounts, dates and an optional route of at most 40 points.
    match /drivers/{uid}/trips/{tripId} {
      function isApprovedDriver() {
        return get(/databases/$(database)/documents/drivers/$(uid)).data.accountStatus == 'approved';
      }

      function validPoint(p) {
        return p.keys().hasOnly(['lat', 'lng']) && p.lat is number && p.lng is number;
      }

      // Only the first and last point are checked (rules cannot loop); the size is capped at 40.
      function validRoute(route) {
        return route is list && route.size() <= 40
          && (route.size() == 0 || (validPoint(route[0]) && validPoint(route[route.size() - 1])));
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
          // AI-assisted: see docs/AI_LOG.md #58 (T-151, CA-002-129)
          // Only 'cash' or 'mercadopago' (card, gateway still to be chosen) are created by the app; 'stripe' is written
          // only by the backend (firebase-admin) at checkout (D-121).
          && data.paymentMethod in ['cash', 'mercadopago']
          && (data.startedAt == null || data.startedAt is timestamp)
          && data.finishedAt is timestamp
          && data.createdAt == request.time
          && (!('route' in data) || validRoute(data.route));
      }

      // Narrow cash rule (D-108): only paymentStatus and status change, pending/completed -> paid,
      // only for a cash trip.
      function validCashPayment() {
        let before = resource.data;
        let after = request.resource.data;
        return before.paymentMethod == 'cash'
          && before.paymentStatus == 'pending' && before.status == 'completed'
          && after.paymentStatus == 'paid' && after.status == 'paid'
          && after.diff(before).affectedKeys().hasOnly(['paymentStatus', 'status']);
      }

      allow read: if isDriverSession(uid);
      allow create: if isDriverSession(uid) && isApprovedDriver() && validTrip();
      allow update: if isDriverSession(uid) && isApprovedDriver() && validCashPayment();
      allow delete: if false;
    }

    // Everything else is closed by default (no other collection is declared above).
  }
}
```

## Prueba contra el código real
Un script temporal fuera del proyecto replica estas reglas cláusula por cláusula en JavaScript y las prueba con los payloads reales de `buildTripRecord`, `buildDocumentsPayload` y el registro. **No es el emulador de Firebase** (no hay Java ni emulador instalados): es una réplica, y la prueba definitiva es la repetición en el celular tras publicar. Resultado y alcance en `docs/progress.md` (T-73).

**Fotos de prueba.** Las imágenes se suben a Cloudinary con un preset sin firma (D-68); las URL son públicas pero no adivinables. Se usan solo fotos de prueba: nunca documentos reales. Este texto no contiene credenciales ni valores de `.env`.

## Secretos
- Secretos de servidor (`access_token` de Mercado Pago, API secret de Cloudinary): solo en `backend/.env` (RNF-05).
- Configuración pública de cliente (`EXPO_PUBLIC_*`): en `.env` local, ignorado por Git. `.env.example` lleva solo los **nombres** (D-81).
- El mapa no necesita clave ni variable: MapLibre usa las teselas públicas de OpenFreeMap y las rutas salen del servidor demo público de OSRM. Sus URL son constantes públicas en `src/config/map.js` y `src/config/routing.js` (D-82 Vigente MODIFICADA, prompt #41).
- Ningún agente de IA lee ni escribe valores de `.env` (CLAUDE.md).
