# Seguridad — UberClone Conductor

Estado: vigente (D-80, D-81; 2026-11-10).

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

## Ampliaciones previstas (no publicadas todavía)
Las reglas de la colección `trips` (historial, rebanada C) y de la ubicación del conductor (rebanada B) se definen en sus tareas de `docs/plan-entrega-final.md`. Al publicarse, se describen aquí con el mismo formato. Hasta entonces no existen y el acceso a esas colecciones está denegado.

## Secretos
- Secretos de servidor (`access_token` de Mercado Pago, API secret de Cloudinary): solo en `backend/.env` (RNF-05).
- Configuración pública de cliente (`EXPO_PUBLIC_*`) y clave de Google Maps: en `.env` local, ignorado por Git. `.env.example` lleva solo los **nombres** (D-81).
- La clave de Google Maps queda embebida en el APK, así que no es secreta en sentido estricto. Su protección es la restricción en Google Cloud a «Android apps» (paquete `com.andersonlondono.uberclone` y SHA-1) y a la API «Maps SDK for Android», más una alerta de presupuesto (RNF-08).
- Ningún agente de IA lee ni escribe valores de `.env` (CLAUDE.md).
