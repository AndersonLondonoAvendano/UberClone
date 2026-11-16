# Seguridad — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #56 (T-73, reglas consolidadas) -->
Estado: **un solo texto final de reglas, con la edición acotada del perfil (T-164, AI_LOG #60), pendiente de publicar a mano por Anderson**, para `drivers` (con `documents`), `driverLocations` y `drivers/{uid}/trips` (D-80, D-81, D-86 a D-89, D-93, D-107 a D-110, T-73, T-84). **Pendiente de publicar** en la consola (Anderson). Desde que se publique, la sesión anónima queda denegada en las tres colecciones: solo vale la sesión con correo y contraseña.

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
3. **Reenvío.** El dueño puede actualizar solo mientras `accountStatus` no sea `approved`, con las mismas validaciones (el estado vuelve a `pending`). Con la cuenta aprobada el reenvío completo sigue denegado; solo puede usar la edición acotada del punto 5. El nivel superior del documento no se cierra con `hasOnly` a propósito, para no bloquear el reenvío por campos que añade la consola.
4. **Sin borrado.**
5. **Edición acotada del Perfil (T-164, RF-64, RF-65, D-122).** Ver la sección «Edición acotada del perfil» más abajo.

**`driverLocations/{uid}`** (T-44)
1. **Solo el dueño lee y escribe.**
2. **Forma cerrada:** `lat` y `lng` (números en rango), `timestamp` (número), `tripStatus` (texto o nulo; la app escribe también `idle`, D-83) y `updatedAt` (hora del servidor).
3. **Sin borrado.**

**`drivers/{uid}/trips/{tripId}`** (T-46 a T-48, T-91)
1. **Solo el dueño lee.** Crea el dueño con la cuenta aprobada (se consulta `drivers/{uid}` con `get()`).
2. **Forma cerrada:** `driverId` (igual al `uid`), `status` (`completed` o `cancelled` al crear), `paymentStatus` (siempre `pending` al crear), `commissionRate` (0 a 1), `category`, `passengerName` (hasta 80), `originLabel` y `destinationLabel` (hasta 200), `distanceKm` (0 a 500), `durationMin` (0 a 1440), `fare`, `commission` y `driverEarnings` enteros no negativos (COP enteros, `commission + driverEarnings == fare + tip`), `tip` (entero de 0 a 1.000.000) y `rating` (entero de 1 a 5, o nulo), `paymentMethod` (`cash` o `mercadopago`), `startedAt` (fecha o nulo), `finishedAt` (fecha), `createdAt` (hora del servidor) y `route` opcional (hasta 40 puntos `{lat, lng}`; las reglas no iteran, así que se comprueban el tamaño, el primero y el último punto, D-110).
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

      // AI-assisted: see docs/AI_LOG.md #60 (T-164, RF-64, RF-65, D-122)
      // Narrow profile edit: only personalData.fullName, personalData.phone, vehicle.color and
      // documents.mercadoPagoEmail (plus updatedAt) may change; accountStatus never changes.
      // The app writes dotted paths, so the nested maps are compared with diff().affectedKeys(),
      // which also covers a client that replaces a whole map.
      function validProfileEdit() {
        let before = resource.data;
        let after = request.resource.data;
        return before.accountStatus in ['approved', 'pending']
          && after.accountStatus == before.accountStatus
          && after.diff(before).affectedKeys().hasOnly(['personalData', 'vehicle', 'documents', 'updatedAt'])
          && after.personalData.diff(before.personalData).affectedKeys().hasOnly(['fullName', 'phone'])
          && after.vehicle.diff(before.vehicle).affectedKeys().hasOnly(['color'])
          && after.documents.diff(before.documents).affectedKeys().hasOnly(['mercadoPagoEmail'])
          && after.personalData.fullName is string && after.personalData.fullName.size() > 0 && after.personalData.fullName.size() <= 50
          && after.personalData.phone is string && after.personalData.phone.size() == 10
          && after.vehicle.color is string && after.vehicle.color.size() > 0 && after.vehicle.color.size() <= 30
          && after.documents.mercadoPagoEmail is string && after.documents.mercadoPagoEmail.size() <= 254
          && after.updatedAt == request.time;
      }

      allow read: if isDriverSession(driverId);
      allow create: if isDriverSession(driverId) && validSubmission();
      // Resubmission of a registration: only while the account is not approved (state goes back to 'pending').
      allow update: if isDriverSession(driverId) && resource.data.accountStatus != 'approved' && validSubmission();
      // Profile edit (T-164): also allowed once approved, but only the four fields above (rules are ORed).
      allow update: if isDriverSession(driverId) && validProfileEdit();
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
        return data.keys().hasAll(['driverId', 'status', 'paymentStatus', 'commissionRate', 'category', 'passengerName', 'originLabel', 'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'tip', 'rating', 'paymentMethod', 'startedAt', 'finishedAt', 'createdAt'])
          && data.keys().hasOnly(['driverId', 'status', 'paymentStatus', 'commissionRate', 'category', 'passengerName', 'originLabel', 'destinationLabel', 'distanceKm', 'durationMin', 'fare', 'commission', 'driverEarnings', 'tip', 'rating', 'paymentMethod', 'startedAt', 'finishedAt', 'createdAt', 'route'])
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
          // AI-assisted: see docs/AI_LOG.md #61 (D-124): tip in whole COP and rating 1-5 (null when cancelled or not rated).
          && data.tip is int && data.tip >= 0 && data.tip <= 1000000
          && (data.rating == null || (data.rating is int && data.rating >= 1 && data.rating <= 5))
          && data.driverEarnings is int && data.driverEarnings >= 0 && data.driverEarnings <= data.fare + data.tip
          && data.commission + data.driverEarnings == data.fare + data.tip
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

## Edición acotada del perfil (T-164, RF-64, RF-65, D-122)
<!-- AI-assisted: see docs/AI_LOG.md #60 -->
**Paso manual de Anderson (D-80): esta regla NO está publicada.** Ni el agente ni el repositorio publican nada. Hasta que pegues el texto completo de arriba en Firestore → Reglas y pulses **Publicar**, «Guardar» en el Perfil falla con permiso denegado en cuentas aprobadas (T-162 queda **No verificado en dispositivo**). Orden: publicar, reiniciar la app, editar un campo.

**Qué se añade.** Un segundo `allow update` (las reglas de un mismo `match` se combinan con OR) con `validProfileEdit()`. El `allow update` de reenvío no cambia.

**Hallazgo: ¿puede el cliente cambiar `accountStatus`? No.**
- `create` exige `accountStatus == 'pending'` (`validSubmission`).
- El `update` de reenvío exige `resource.data.accountStatus != 'approved'` y que el nuevo valor sea `'pending'`: nunca produce `approved`.
- El `update` de edición exige `request.resource.data.accountStatus == resource.data.accountStatus`: no hay cambio de estado, ni de `pending` a `approved` ni al revés.
- Por tanto `approved` solo lo escribe la consola con acceso de administrador (no pasa por las reglas). La edición nueva no abre esa puerta.

**Cómo está acotada.** (1) Estado sin cambios y de una cuenta `approved` o `pending`. (2) Diff de primer nivel: solo `personalData`, `vehicle`, `documents`, `updatedAt`. (3) Diff de cada mapa anidado: `personalData` solo `fullName` y `phone`; `vehicle` solo `color`; `documents` solo `mercadoPagoEmail`. La app escribe con rutas con punto, pero la regla compara el resultado final, así que un cliente que reemplace un mapa entero con otros valores en claves vedadas también se deniega. (4) Tipos y tamaños: nombre texto de 1 a 50, celular texto de 10, color texto de 1 a 30, correo texto de hasta 254 (la validez fina del color y del correo la comprueba la app). (5) `updatedAt == request.time` (hora del servidor). Los validadores del reenvío (`validPersonalData`, etc.) no se reutilizan porque exigen el documento completo; los límites del nombre, celular y correo son los mismos que ahí.

**Razonamiento por casos** (no hay emulador: es revisión de la regla, no ejecución; la prueba real es el celular tras publicar):
| Caso | Resultado | Por qué |
|---|---|---|
| Cuenta aprobada edita uno o los cuatro campos con `updatedAt` del servidor | Permitido | Todas las cláusulas de `validProfileEdit` se cumplen; los diffs contienen solo claves permitidas (un diff vacío en un mapa también pasa `hasOnly`). |
| Cuenta pendiente edita los mismos campos | Permitido | El estado `pending` está admitido y no cambia (el reenvío completo sigue disponible por la otra regla). |
| Cambiar `accountStatus` (a `approved`, o cualquiera) | Denegado | Cláusula de igualdad de estado; el reenvío exige `!= 'approved'` y `'pending'`. |
| Cambiar `vehicle.plate`, `vehicle.category`, `vehicle.brand`, `vehicle.model`, `vehicle.year` | Denegado | El diff de `vehicle` solo admite `color`. |
| Cambiar `documents.license`, `soat`, `technicalReview`, `commissionRate`, `termsAccepted` | Denegado | El diff de `documents` solo admite `mercadoPagoEmail`. |
| Cambiar `personalData.documentNumber`, `birthDate`, `email`, fotos | Denegado | El diff de `personalData` solo admite `fullName` y `phone`. |
| Añadir un campo nuevo en el nivel superior | Denegado | El diff de primer nivel solo admite cuatro claves. |
| Cuenta aprobada con `setDoc` completo y `accountStatus: 'pending'` | Denegado | La regla de reenvío exige `!= 'approved'`; la de edición exige estado igual. |
| Cuenta pendiente reenvía el registro completo | Permitido | Sigue por la regla de reenvío con `validSubmission()`, sin cambios. |
| Sin `updatedAt` del servidor, o con una fecha del cliente | Denegado | `after.updatedAt == request.time`. |
| Tipos o tamaños inválidos (nombre vacío o de 51, celular de 9 u 11, color vacío o número, correo mayor de 254) | Denegado | Cláusulas de tipo y tamaño. |
| Otro usuario (otro `uid`) | Denegado | `isDriverSession(driverId)` exige `uid` igual. |
| Sesión anónima o sin sesión | Denegado | `isDriverSession` exige `sign_in_provider == 'password'` y `request.auth != null`. |
| Cuenta con estado distinto de `approved`/`pending` (p. ej. un estado que la consola ponga luego) | Denegado en edición | Solo se admiten esos dos estados; el reenvío sigue la regla anterior. |
| Documento inexistente | Denegado | `resource.data` no existe en `update`; la creación pasa solo por `validSubmission`. |

**Pruebas a repetir en el celular tras publicar.** (1) Cuenta aprobada: editar nombre, celular, color y correo y guardar → el Perfil muestra los datos nuevos. (2) Cuenta aprobada: el mismo flujo con un solo campo. (3) Confirmar en la consola que `accountStatus` sigue `approved`.

## Propina y calificación del viaje (D-124, prompt #61)
<!-- AI-assisted: see docs/AI_LOG.md #61 -->
**BLOQUEANTE: publicar antes de probar.** Esta regla NO está publicada. Ni el agente ni el repositorio publican nada. Hasta que pegues el texto completo de arriba (con `validTrip()` actualizada) en Firestore → Reglas y pulses **Publicar**, guardar un viaje terminado falla con permiso denegado, porque la app ahora escribe siempre `tip` y `rating` y la regla anterior los rechaza por `hasOnly`. Orden: publicar, reiniciar la app, completar un viaje simulado.

**Qué cambia en `validTrip()`.** (1) `tip` y `rating` entran en `hasAll` y `hasOnly` (la app siempre escribe ambos). (2) `tip` entero de 0 a 1.000.000 (holgura sobre el máximo simulado de 5.000). (3) `rating` nulo o entero de 1 a 5. (4) `commission + driverEarnings == fare + tip` y `driverEarnings <= fare + tip`: la comisión solo se calcula sobre la tarifa y la propina va completa al conductor. `commission <= fare` no cambia.

**Razonamiento por casos** (revisión de la regla, no ejecución; la prueba real es el celular tras publicar):
| Caso | Resultado | Por qué |
|---|---|---|
| Viaje nuevo completado con propina 2.000 (XL: 26.900 / 5.380 / 23.520) | Permitido | 5.380 + 23.520 = 28.900 = 26.900 + 2.000; `rating` entero. |
| Viaje nuevo completado sin propina (19.200 / 26.900) | Permitido | `tip` 0; la identidad vuelve a `commission + driverEarnings == fare`. |
| Viaje cancelado (tarifa, comisión y ganancia 0) | Permitido | `tip` 0 y `rating` nulo cumplen todas las cláusulas. |
| Creación sin `tip` o sin `rating` | Denegado | `hasAll`. |
| `tip` negativo, decimal o mayor de 1.000.000 | Denegado | `tip is int` y límites. |
| `rating` 0, 6 o decimal | Denegado | Cláusula de rango entero. |
| `driverEarnings` que no suma con la comisión (por ejemplo, propina que no se refleja) | Denegado | Identidad con `fare + tip`. |
| Viaje antiguo (guardado sin `tip`/`rating`) leído | Permitido | `read` solo exige la sesión del dueño; `validTrip()` solo aplica a `create`. La app lo muestra «Sin calificación» y «Sin propina». |
| Confirmar pago en efectivo de un viaje antiguo o nuevo | Permitido | `validCashPayment()` no se toca: el diff solo admite `paymentStatus` y `status`, y `tip`/`rating` no cambian. |
| Intentar editar `tip` o `rating` de un viaje guardado | Denegado | El `update` solo permite el diff `paymentStatus`/`status`. |

**El backend no se ve afectado por las reglas.** Usa el SDK de administrador (admin SDK), que no pasa por las reglas de Firestore. Lee `fare` y `tip` del documento del viaje y cobra `fare + tip` (`chargeAmount`); nunca el monto del cuerpo de la petición.

### Lista de comprobación: regla `validTrip()` publicada (spec 004, RC-08, T-212)
Estado: **NO VERIFICADO**. Este documento no afirma que la regla esté publicada; solo Anderson puede confirmarlo en la consola.

**Texto vigente de `validTrip()`** (el bloque completo está arriba en «Texto final de las reglas», `function validTrip()` en `:205-234`). Las cláusulas que importan para propina y calificación son:
- `hasAll` y `hasOnly` (`:207-208`) incluyen `'tip'` y `'rating'`.
- `data.tip is int && data.tip >= 0 && data.tip <= 1000000` (`:222`).
- `data.rating == null || (data.rating is int && data.rating >= 1 && data.rating <= 5)` (`:223`).
- `data.commission + data.driverEarnings == data.fare + data.tip` (`:225`) y `data.driverEarnings <= data.fare + data.tip` (`:224`).

**Pasos**
1. Abre la consola de Firebase, Firestore Database, pestaña **Reglas**, y compara la función `validTrip()` publicada con el texto de arriba. Si la publicada no tiene `'tip'` y `'rating'` en `hasAll` y `hasOnly`, es la versión anterior.
2. Si difiere (o no estás seguro), borra todo el editor y pega el bloque completo de «Texto final de las reglas» (de `rules_version` a la última llave), no solo la función.
3. Pulsa **Publicar** y espera la confirmación de la consola.
4. Reinicia la app (ciérrala del todo y ábrela).
5. Completa un viaje simulado con propina (por ejemplo 2.000) y calificación (por ejemplo 4 estrellas), sin cancelar.
6. En la consola, Firestore Database, Datos: abre `drivers/{uid}/trips`, el documento más reciente.
7. Anota fecha y resultado en `docs/progress.md` o en tu mensaje.

**Qué debes ver**
- Éxito: el documento existe con `tip` (número entero, p. ej. 2000), `rating` (entero 1 a 5), `fare`, `commission` y `driverEarnings` con `commission + driverEarnings = fare + tip`, y la app muestra el resumen sin error de permiso.
- Fallo: el viaje no se guarda y la app muestra un error de guardado; en el registro del dispositivo aparece `permission-denied`. Significa que la regla publicada es la anterior o que el paso 2 se pegó incompleto: repite los pasos 1 a 4.

## Geocodificación (Nominatim) (D-125, prompt #61)

La app convierte las coordenadas de las solicitudes simuladas en una dirección legible con la geocodificación inversa de Nominatim (OpenStreetMap), un servicio público y sin clave.

- **Qué sale del celular:** solo la latitud y la longitud de los puntos de recogida y destino de la solicitud simulada (coordenadas de prueba generadas cerca de la posición simulada o real del conductor). No se envía ningún dato personal: ni nombre, ni correo, ni teléfono, ni identificadores del conductor o del pasajero.
- **Identificación:** cada petición lleva el encabezado `User-Agent: UberCloneConductor-ProyectoDeClase/1.0`, como pide la política de uso. Si el sistema del celular no respetara ese encabezado, la petición seguiría funcionando; queda pendiente comprobarlo en el dispositivo.
- **Límite:** máximo una petición por segundo; el cliente usa una cola con al menos 1,1 s entre peticiones, un caché en memoria por coordenada redondeada a 4 decimales (solo éxitos) y un tiempo límite de unos 4 s por petición, sin reintentos agresivos.
- **Sin conexión o con error:** nunca bloquea el flujo; la tarjeta cae a «Calle cercana (simulada)».
- **Qué se guarda:** solo el texto corto de la dirección en `originLabel` y `destinationLabel` (límite de 200 caracteres de las reglas, el texto no pasa de 120). El historial y el detalle leen lo guardado y no llaman al servicio. Las reglas de Firestore no cambian.
- **Pendiente de producción:** el servicio público no es para uso comercial ni intensivo; en producción se cambiaría por un proveedor propio o de pago, desde el backend si requiere clave.

## Consulta de Ganancias por rango (spec 004, RC-04, T-202/T-203, D-170)
La consulta de Ganancias usa `orderBy('finishedAt')` y rango sobre `finishedAt` en `drivers/{uid}/trips`: un solo campo, índice automático. NO requiere índice compuesto ni cambios en las reglas; no hay pasos manuales.
- Lectura única por rango (`fetchTripsInRange`): de lunes o día 1 (el que caiga antes) hasta ahora, en páginas de 500 con `startAfter` y tope duro de 5000 documentos. La regla `read` de `trips` ya exige sesión del dueño; no cambia.
- Si Firestore respondiera con un error de índice (`failed-precondition`), el mensaje trae un enlace para crearlo; sería un fallo inesperado y Anderson debería avisar en vez de crearlo a ciegas. Estado: **No verificado en dispositivo** (CA-004-12).

## Prueba contra el código real
Un script temporal fuera del proyecto replica estas reglas cláusula por cláusula en JavaScript y las prueba con los payloads reales de `buildTripRecord`, `buildDocumentsPayload` y el registro. **No es el emulador de Firebase** (no hay Java ni emulador instalados): es una réplica, y la prueba definitiva es la repetición en el celular tras publicar. Resultado y alcance en `docs/progress.md` (T-73).

**Fotos de prueba.** Las imágenes se suben a Cloudinary con un preset sin firma (D-68); las URL son públicas pero no adivinables. Se usan solo fotos de prueba: nunca documentos reales. Este texto no contiene credenciales ni valores de `.env`.

## Secretos
- Secretos de servidor (`access_token` de Mercado Pago, API secret de Cloudinary): solo en `backend/.env` (RNF-05).
- Configuración pública de cliente (`EXPO_PUBLIC_*`): en `.env` local, ignorado por Git. `.env.example` lleva solo los **nombres** (D-81).
- El mapa no necesita clave ni variable: MapLibre usa las teselas públicas de OpenFreeMap y las rutas salen del servidor demo público de OSRM. Sus URL son constantes públicas en `src/config/map.js` y `src/config/routing.js` (D-82 Vigente MODIFICADA, prompt #41).
- Ningún agente de IA lee ni escribe valores de `.env` (CLAUDE.md).

## FCM (propuesta, spec 003; sin reglas nuevas)
- `pushTokens/{hash}` (colección raíz, D-131; `hash` = SHA-256 del token; campos `uid`, `token`, `platform`, `updatedAt`): acceso denegado a clientes (la regla genérica ya niega lo no listado); la lee y escribe solo el Admin SDK del backend (D-128). Registrar un token lo reasigna al uid actual en una transacción. **No se añade ninguna regla a `firestore.rules`** (sigue fuera de Git, D-24) **ni se crea ningún índice a mano**: se descartó `collectionGroup` y listar los dispositivos de un uid es `where('uid','==',uid)`, índice de un solo campo automático. `drivers/{uid}/fcmTokens` ya no existe.
- Límite del token: 512 caracteres, coherente con `BODY_LIMIT` ('2kb', `backend/src/config.js:8`).
- Ni el cuerpo de la notificación ni el payload llevan tarifa (D-132 rechazada) ni direcciones (D-138): solo categoría, distancia, duración, coordenadas, `requestId` y `expiresAt`.
- Los endpoints de registro, baja y envío de token usan `createGuard` (límite por IP, token, límite por usuario) y envían solo a los dispositivos del llamante (D-127).
- Nunca se imprime un token completo: solo los primeros 8 caracteres y su longitud, y solo en `__DEV__` (instrucción de Anderson, S1). `google-services.json` y `backend/secrets/` siguen ignorados por Git.

## Notificaciones (FCM)
Implementado en el backend (S2, spec 003; el envío real al celular queda «No verificado en dispositivo» hasta STOP-2).
- `pushTokens/{sha256(token)}` (`uid`, `token`, `platform: 'android'`, `createdAt`, `updatedAt`) solo lo lee y escribe el Admin SDK del backend. **No se necesitan reglas nuevas ni índices nuevos**: `firestore.rules` no se toca y listar los dispositivos de un uid es `where('uid','==',uid)` (índice de un campo automático). Sin `collectionGroup`.
- Los tokens nunca se escriben en logs: la única línea de registro es `[req] método ruta estado provider=- Nms`; tampoco cuerpos, correos ni uid.
- Reasignación por uid (D-131): registrar un token ya guardado para otro uid lo pasa al que llama, en una transacción, y conserva `createdAt`. Dar de baja borra solo si el documento es del uid del ID token; token inexistente o ajeno responde igual (204).
- Limpieza: tras cada envío se revisa `resp.success` por índice y se borran solo los tokens con error `messaging/registration-token-not-registered` o `messaging/invalid-registration-token`; cualquier otro error no borra nada.
- `POST /notifications/test-request` envía solo a los dispositivos del uid del ID token (el cuerpo no puede aportar uid, tokens, texto ni datos), exige `accountStatus = 'approved'`, tiene un límite propio de 5 por minuto por uid (429) además del límite general, y admite un único envío diferido pendiente por uid.
- Token válido: texto de 20 a 512 caracteres sin espacios; `platform` solo `android`. Con `BODY_LIMIT = '2kb'` cabe de sobra (comprobado en `scripts/tests/backendMessagingWiring.test.mjs`).

### Cómo probar las notificaciones con la app (S4, T-184 a T-186; No verificado en dispositivo)
1. Backend en marcha y alcanzable desde el celular (`EXPO_PUBLIC_BACKEND_URL` apunta a él). Los secretos siguen solo en `backend/.env` y `backend/secrets/`.
2. Iniciar sesión con una cuenta aprobada, abrir Configuración > Notificaciones y activar el interruptor: la app explica el permiso, lo pide en contexto y, si se concede, registra el token en `POST /notifications/register`. Si el permiso está denegado o bloqueado, la sección muestra un mensaje y un botón a los ajustes del sistema.
3. Elegir el retraso (0 a 60 s, por defecto 10 s) y pulsar «Enviar solicitud de prueba» (`POST /notifications/test-request` con `delaySeconds`). Con retraso, mandar la app a segundo plano y esperar el aviso; tocarlo abre la solicitud simulada.
4. Cerrar sesión: antes de `signOut` (y después de esperar los guardados de viaje) se da de baja el token en `POST /notifications/unregister`, se borra el token local, `notificationsEnabled` y la intención pendiente, con un tope de 3 s que nunca bloquea el cierre. Con un viaje en curso o guardados pendientes no cambia nada. Iniciar sesión con otra cuenta en el mismo celular registra el token para esa cuenta (D-131) y la cuenta anterior ya no recibe avisos.
5. Un envío diferido vive en la memoria del backend: si el backend se reinicia antes de que venza el retraso, se pierde.
