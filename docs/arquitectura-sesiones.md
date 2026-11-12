# Arquitectura de sesiones — UberClone Conductor

<!-- AI-assisted: see docs/AI_LOG.md #56 (T-74) -->
Estado: **borrador para revisión de Anderson (2026-11-11).** Describe cómo funciona la sesión con correo y contraseña (D-93 a D-99, D-102, D-104). Todo lo que solo se ve en el celular es **No verificado en dispositivo**. Sin valores de `.env`.

## Idea central
- La identidad es Firebase Auth con **correo y contraseña**; el `uid` es el `driverId` (D-93). Sin verificación de correo (D-95, riesgo aceptado). Los mensajes de error no revelan si un correo existe (D-96).
- «Varias sesiones» significa **varias cuentas en el mismo teléfono, una activa a la vez** (D-94). Cambiar de cuenta es cerrar sesión e iniciar otra.
- Una sesión **anónima heredada** se trata como si no hubiera sesión: la app la cierra y muestra la pantalla de carga hasta que Firebase informe `null` (D-97, sin migración).

## Flujo de la puerta de sesión
`src/navigation/sessionGate.js` es una función pura: recibe el estado de autenticación y el estado de la cuenta y devuelve **una sola ruta**. El navegador raíz monta una rama por ruta, así que nunca comparten pila de «atrás».

| Autenticación | Cuenta (`drivers/{uid}`) | Ruta |
|---|---|---|
| Sin respuesta aún / cerrando sesión anónima | cualquiera | `loading` |
| Sin sesión | — | `auth` (Iniciar sesión / Crear cuenta) |
| Con sesión | cargando | `loading` |
| Con sesión | error de lectura | `error` (Reintentar y «Cerrar sesión», D-105) |
| Con sesión | no existe el documento | `registration` |
| Con sesión | `pending` | `pending` |
| Con sesión | `approved` | `main` |

El estado de la cuenta viene de `onSnapshot` sobre `drivers/{uid}` (D-57). La aprobación se hace a mano en la consola de Firebase.

## Cerrar sesión: un solo procedimiento
`resetSession` (`src/services/session/resetSession.js`, D-98) lo usan «Cerrar sesión», «Cambiar de cuenta» (D-102) y el fin externo de sesión. Es puro: los efectos entran por `deps` (`buildSessionResetDeps`, cableado en `useSessionReset`).

Orden fijo y por qué:
1. **Bloqueo si hay un viaje en curso** (falla cerrado: si la comprobación falla, también bloquea). No cambia nada.
2. Descartar la solicitud pendiente.
3. Poner al conductor no disponible y **publicar el estado final** (espera máxima 5 s).
4. Detener la ubicación.
5. Liberar suscripciones, temporizadores y el controlador del viaje.
6. Limpiar contextos y almacenamiento propio.
7. **Esperar (máx. 8 s) a que terminen los guardados de viaje pendientes** (D-104); si no terminan, no se cierra sesión (`trip-save-pending`) salvo elección explícita «cerrar de todos modos».
8. `signOut`, siempre al final.

La publicación y las suscripciones necesitan la sesión viva (las reglas exigen autenticación); por eso `signOut` va al final. Cada paso está aislado: si uno falla, los siguientes se ejecutan. Llamadas simultáneas comparten la que está en curso.

## Reglas de Firestore y orden de publicación (D-99)
Las reglas exigen `request.auth.token.firebase.sign_in_provider == 'password'`: la sesión anónima queda denegada. Texto final y pruebas en [seguridad.md](seguridad.md). Orden:
1. Habilitar el proveedor **Correo/contraseña** en la consola de Firebase (Authentication → Método de acceso). Paso manual de Anderson.
2. **Validar la app en el celular con las reglas actuales** (sesión con correo).
3. Verificar que la cuenta de prueba esté `approved` en la consola.
4. Publicar las reglas completas (reemplazar todo) y reiniciar la app.
5. Repetir las pruebas de [checklist-dispositivo-sesiones.md](checklist-dispositivo-sesiones.md), incluida la denegación con sesión anónima o sin sesión.
6. Solo entonces Anderson decide si apaga el proveedor anónimo.

Por qué en ese orden: si se publica primero y algo falla, un error de la app se confunde con uno de las reglas.

## Qué no cubre
- Sin verificación de correo (D-95).
- Sin migración de cuentas anónimas (D-97): los datos de una cuenta anónima antigua no pasan a la cuenta nueva.
- Las reglas se probaron con una **réplica en JavaScript**, no con el emulador; falta la repetición en el celular.
- Pagos y modelo del viaje (D-107 a D-110): ver [pagos.md](pagos.md) y [seguridad.md](seguridad.md).
