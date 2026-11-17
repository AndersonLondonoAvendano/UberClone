# Spec 007 — Solicitudes automáticas por FCM mientras el conductor está «Disponible»

Estado: **Borrador** (propuesta de `spec-author`; NO aprobada). Esta spec no aprueba nada. Anderson ordenó continuar la ejecución sin esperar la aprobación (`docs/AI_LOG.md` #70); esa instrucción no sustituye la aprobación formal. Si cambia tras aprobarse, plan, tema y tareas pueden quedar desactualizados.
Fuente: ENCARGO del prompt #70 (R1–R8 de ese prompt, citados aquí como `P70-R1…R8`), D-197 (reemplaza a D-130 en lo que choca), D-133, D-137, D-138, D-146, D-135. Spec relacionada: 003 (notificaciones FCM). AI-assisted: see docs/AI_LOG.md #70

## 1. Objetivo y porqué

Que llegue una notificación de solicitud por FCM, sola, mientras el conductor está efectivamente disponible, con la app en primer plano o en segundo plano. Porqué: hoy solo el botón «Solicitud de prueba» envía una (D-130), y con «Disponible» activo no llega nada por sí sola; eso no representa una app de conductor. El pasajero lo simula el backend; es una demostración, no un despacho real.

## 2. Alcance y no-alcance

Alcance: generador en memoria del backend, endpoint de disponibilidad, reporte desde la app, regla de fuente única frente al simulador interno, documentación de límites.
No-alcance: despacho real; guardar disponibilidad en Firestore; cambios en `firestore.rules`, `app.json` o código nativo; dependencias nuevas; textos de UI nuevos (se espera ninguno; si el plan necesitara uno, va al módulo de idioma con paridad es/en y sin `Alert`); cambios al botón «Solicitud de prueba»; ubicación en segundo plano.

## 3. Qué ya existe (a confirmar por el planner)

Rutas `POST /notifications/register`, `/unregister` y `/test-request` con guard común; constructor de payload sin tarifa ni direcciones (D-138); envíos diferidos con cancelación al cerrar el backend; simulador interno `mockPassengerApi` que genera solicitudes mientras el conductor está disponible.

## 4. Requisitos (EARS)

**Generador**
- **[RA-01]** (P70-R1) Mientras un conductor tenga disponibilidad efectiva, el backend deberá enviar por FCM solicitudes simuladas usando el constructor de payload existente, sin tarifa ni direcciones (D-138).
- **[RA-02]** (P70-R1) La primera solicitud deberá enviarse entre 15 y 30 s después de quedar efectivamente disponible, y las siguientes cada 60 a 120 s, con valor aleatorio dentro del rango.
- **[RA-03]** (P70-R1) Cuando se alcance el tope de solicitudes por sesión de disponibilidad (por defecto 10), el generador deberá detenerse hasta que el conductor vuelva a quedar disponible tras haber dejado de estarlo.
- **[RA-04]** (P70-R1) Los intervalos y el tope deberán configurarse por variables de entorno del backend, con valores por defecto seguros; solo los nombres se documentan (README y `backend/.env.example`).
- **[RA-05]** (P70-R1) El sistema deberá mantener como máximo un envío pendiente por uid y nunca emitir ráfagas (dos reportes seguidos de «disponible» no crean dos temporizadores ni reinician el contador de la sesión).

**Endpoint**
- **[RA-06]** (P70-R2) El backend deberá exponer un endpoint nuevo autenticado con ID token, con el mismo guard que los de notificaciones: límite por IP, límite por usuario, cuenta aprobada y token inválido → 401.
- **[RA-07]** (P70-R2) El cuerpo solo deberá admitir `{available: boolean}`; cualquier otro tipo o campo extra (uid, tokens, textos, data) se rechaza o se ignora sin efecto, y el backend solo actúa sobre el uid del ID token.
- **[RA-08]** (P70-R2) La disponibilidad efectiva es «Disponible» Y sin viaje en curso Y notificaciones activadas con token registrado. La app deberá reportar `available` = disponibilidad efectiva.
- **[RA-09]** (P70-R2) La app deberá reportar al cambiar el interruptor, al iniciar y al terminar un viaje, al activar y desactivar notificaciones y al volver a primer plano (latido), con un tope de frecuencia del latido.

**Detención**
- **[RA-10]** (P70-R3) El generador deberá detenerse al: quedar «No disponible», haber viaje en curso, cerrar sesión (la baja de token existente lo cancela), eliminar el token, desactivar notificaciones, alcanzar el tope, cerrar el backend (cancela todos los temporizadores) y faltar latido más allá de un máximo configurable (por defecto 30 min).
- **[RA-11]** (P70-R3) El sistema nunca deberá enviar a una cuenta no aprobada ni a un token que no pertenezca al uid.
- **[RA-12]** (P70-R1, P70-R3) Un fallo de envío no deberá detener ni romper el generador.

**Sin duplicados**
- **[RA-13]** (P70-R4, D-197) El generador del servidor y `mockPassengerApi` nunca deberán generar a la vez. Si la disponibilidad efectiva está activa y el backend confirmó el último reporte «disponible», el servidor es la fuente y el mock no genera. Si las notificaciones están desactivadas, no hay token o el backend no responde, el mock es el respaldo.
- **[RA-14]** (P70-R4) La elección de fuente deberá ser una función pura y probable que cumpla: «nunca dos fuentes; nunca cero estando disponible».

**Compatibilidad**
- **[RA-15]** (P70-R5) No se deberá romper la recepción: elegibilidad D-133/D-146, aviso «No disponible», dedupe por `requestId` (D-135), pantalla completa al tocar, tarjeta en primer plano, expiración a 90 s, 15 s para decidir (D-137) y «Rechazado».
- **[RA-16]** (P70-R6) «Solicitud de prueba» de Configuración deberá seguir igual.

**Límites y privacidad**
- **[RA-17]** (P70-R7) README y `docs/omisiones-y-limites.md` deberán declarar: temporizadores en memoria del backend, perdidos al reiniciar (la app los recupera con el siguiente latido); simulación de demostración, no despacho real; con la app cerrada la solicitud llega y abre solo en release (límite del dev client).
- **[RA-18]** (P70-R8) El latido no deberá enviar ubicación ni datos personales; el backend no deberá registrar tokens, uid ni cuerpos (solo códigos fijos).
- **[RA-19]** (P70-R8) El estado de disponibilidad deberá vivir en memoria del backend, con cero escrituras a Firestore por reporte; la documentación lo declara.

## 5. Criterios de aceptación

Las pruebas inyectan reloj y generador aleatorio; sin esperas reales.
- **CA-007-01** (RA-02) Con reloj y aleatorio inyectados, la primera solicitud se programa en [15, 30] s y las siguientes en [60, 120] s, incluidos los extremos.
- **CA-007-02** (RA-03) Con tope 10 se envían exactamente 10 y no más; tras «no disponible» y luego «disponible» se envían otras hasta el tope.
- **CA-007-03** (RA-05) Dos reportes «disponible» seguidos dejan un solo pendiente y no reinician el contador.
- **CA-007-04** (RA-10) Cada causa de detención (no disponible, viaje en curso, cierre de sesión/baja de token, token eliminado, notificaciones desactivadas, tope, cierre del backend, latido vencido) cancela el pendiente y no hay envíos posteriores; se reanuda al volver a quedar disponible.
- **CA-007-05** (RA-10) Sin latido por más del máximo (30 min por defecto, configurable) el generador se detiene; un latido a tiempo lo mantiene.
- **CA-007-06** (RA-11) Solo se envía a tokens del uid autenticado y solo con cuenta aprobada; con cuenta no aprobada no hay envío.
- **CA-007-07** (RA-06) El endpoint responde 401 con token inválido o ausente, 429 al exceder el límite por IP o por usuario, y rechaza cuenta no aprobada igual que los demás endpoints de notificaciones.
- **CA-007-08** (RA-07) Un cuerpo con `available` no booleano da error de validación; un cuerpo con uid, tokens, textos o data adicionales no cambia el uid objetivo ni el contenido enviado.
- **CA-007-09** (RA-10) Cerrar el backend cancela todos los temporizadores (sin handles activos).
- **CA-007-10** (RA-12) Un envío que falla no impide programar el siguiente ni lanza excepción no capturada.
- **CA-007-11** (RA-01) El payload enviado por el generador no contiene tarifa ni direcciones (se reutilizan las pruebas existentes).
- **CA-007-12** (RA-08, RA-09) Con un doble de la app, se reporta al cambiar el interruptor, al iniciar y terminar un viaje, al activar y desactivar notificaciones y al volver a primer plano; el latido respeta el tope de frecuencia.
- **CA-007-13** (RA-13, RA-14) La función de elección de fuente, evaluada sobre todas las combinaciones de {disponible, viaje, notificaciones+token, backend confirmó/no}, devuelve exactamente una fuente cuando el conductor está «Disponible» sin viaje y ninguna cuando no lo está; nunca dos.
- **CA-007-14** (RA-15, RA-16) Las pruebas existentes de recepción, elegibilidad, dedupe, expiración y «Solicitud de prueba» siguen en verde (`npm test` sin regresión).
- **CA-007-15** (RA-04, RA-17, RA-19) README, `.env.example` y `docs/omisiones-y-limites.md` nombran las variables (sin valores secretos), los tres límites de RA-17 y la ausencia de escrituras a Firestore.
- **CA-007-16** (RA-18) Prueba estática: ningún `console.*` del código nuevo imprime token, uid ni cuerpo; el cuerpo del latido solo tiene `available`.
- **CA-007-17** (restricciones) Sin dependencias nuevas, sin cambios en `firestore.rules`, `app.json` ni nativo, sin secretos, sin `Alert`, paridad es/en si hubiera texto; `check-constitution` sin regresión sobre la base de 14 errores.

**Dispositivo (STOP-8).** Todo lo siguiente es **No verificado en dispositivo** hasta la evidencia de Anderson, y apunta a la tarea de checklist que defina el plan: (a) en 15–30 s llega la notificación con la app en primer plano (tarjeta) o en segundo plano (aviso); (b) tocarla abre la pantalla completa; (c) la siguiente llega a los 60–120 s; (d) «No disponible» detiene; (e) viaje en curso detiene; (f) cerrar sesión y entrar con otra cuenta no hereda el generador; (g) con notificaciones desactivadas funciona el simulador interno sin duplicar; (h) «Solicitud de prueba» funciona; (i) app cerrada: solo en release.

## 6. Casos límite

- Reinicio del backend: se pierden los temporizadores; la app los recupera con el siguiente latido (puede tardar hasta el intervalo del latido).
- Backend inalcanzable: la app no recibe confirmación y el mock queda de respaldo; cuando vuelva a responder, la fuente pasa al servidor sin periodo con dos fuentes (el mock se detiene antes de que el servidor genere, o el plan define el orden que lo garantice).
- Dos dispositivos del mismo uid: un solo generador por uid; envía a todos sus tokens registrados.
- Cambio de cuenta en el mismo teléfono: el generador del uid anterior se cancela con la baja del token.
- Un viaje en curso al volver a primer plano: el latido reporta `available: false`.
- Solicitud vencida o rechazada: cuenta para el tope igual.

## 7. Riesgos

- Doble fuente transitoria si el mock sigue activo en la ventana entre reporte y confirmación (mitigación: RA-13/14 y su prueba).
- Pérdida de temporizadores al reiniciar; conductores «fantasma» si falla el latido (mitigación: máximo de latido).
- Consumo de batería/red por el latido (mitigación: tope de frecuencia, cuerpo mínimo).
- Notificaciones frecuentes pueden molestar en pruebas; el tope y las variables de entorno lo acotan.

## 8. Trazabilidad

P70-R1 → RA-01..05, 12; R2 → RA-06..09; R3 → RA-10..12; R4 → RA-13, 14; R5 → RA-15; R6 → RA-16; R7 → RA-17; R8 → RA-18, 19.

## 9. Decisiones propuestas

- **D-197** (ordenada por Anderson, #70): el backend genera solicitudes automáticas; reemplaza a D-130 en lo que choca; incluye la regla de fuente única (RA-13).
- Propuesta menor para el plan (no numerada): tope de frecuencia del latido y su intervalo, y el nombre del endpoint, los fija el planner.

## Adenda #73 (D-204)

Los valores por defecto del generador pasan a: primera solicitud 8–15 s, siguientes 35–60 s y tope de 8 por sesión (antes 15–30 s, 60–120 s y 10). Siguen configurables y validadas con las variables `AUTO_REQUEST_*`. Los rangos citados en RA-01 y CA-007-01 se leen con estos valores; el resto de la spec no cambia. AI-assisted: see docs/AI_LOG.md #73

## Adenda #74 (D-207)

El método de pago de las solicitudes automáticas alterna de forma determinista: efectivo, tarjeta, efectivo, tarjeta…, y la primera de cada sesión «Disponible» es efectivo (sin azar). El mensaje FCM lleva `data.paymentMethod` (`cash` o `card`), sin tarifa ni direcciones; la app lo lee de forma estricta (ausente = efectivo, otro valor = inválido). El resto de la spec no cambia. AI-assisted: see docs/AI_LOG.md #74
