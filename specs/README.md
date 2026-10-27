# Specs

Cada spec vive en `specs/NNN-nombre/` y se crea en la Fase 1 (no antes). Contiene `spec.md` y, desde la Fase 2, `plan.md`.

## Requisitos en EARS (en español)
| Tipo | Plantilla | Ejemplo |
|---|---|---|
| Ubicuo | El sistema deberá … | El sistema deberá mostrar los errores bajo cada campo. |
| Evento | Cuando <evento>, el sistema deberá … | Cuando el temporizador llegue a 0, el sistema deberá rechazar la solicitud. |
| Estado | Mientras <estado>, el sistema deberá … | Mientras el conductor esté Disponible, el sistema deberá escribir su ubicación cada pocos segundos. |
| No deseado | Si <condición>, entonces el sistema deberá … | Si la cuenta no está Aprobada, entonces el sistema no deberá permitir ponerse Disponible. |
| Opcional | Donde <característica>, el sistema deberá … | Donde se active el pago dividido, el sistema deberá repartir el cobro entre plataforma y conductor. |

Cada requisito lleva su ID entre corchetes, p. ej. `[RF-11]`.

## Criterios de aceptación
```
CA-NNN-XX  (de diseño: CA-NNN-Dn)
Dado …  Cuando …  Entonces …
Cómo se verifica: <prueba, script o paso manual>
```
Si solo se ve en el celular: "No verificado en dispositivo" + tarea concreta.

## Estados de una spec
Borrador → Aprobada → Planificada → En implementación → Implementada → Validada

## Mapa de specs propuesto
| Spec | Requisitos |
|---|---|
| 000-fundacion | RNF-01, RNF-02, RNF-11, RNF-12, RNF-13, RF-30 |
| 001-registro-conductor | RF-01 a RF-07, RNF-04, RNF-07 |
| 002-disponibilidad-ubicacion | RF-08, RF-09, RNF-03 (`useDriverLocation`), RNF-06 (geolocalización) |
| 003-solicitudes-viaje | RF-10 a RF-13, RNF-03 (`useTripRequests`), RNF-06 (FCM y tiempo real), RNF-08 |
| 004-tarifa-comision | RF-20 a RF-23, RNF-09 |
| 005-cobro-pagos | RF-14 a RF-19, RNF-05 |
| 006-ganancias | RF-24, RF-25, RNF-03 (`useEarnings`) |
| 007-historial | RF-26 a RF-28, RNF-10 |
| 008-perfil-config | RF-29 |
| 009-entrega | ENT-01 a ENT-08 |
