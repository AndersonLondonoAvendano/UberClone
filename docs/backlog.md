# Backlog

## Dueños de campo
| Campo | Lo escribe |
|---|---|
| Spec, Requisitos, Depende de, Archivos, Hacer, Hecho cuando, Diseño hecho cuando | planner |
| Estado: En curso / Implementada | agente principal / implementer |
| Estado: Validada / Rechazada (motivo) | verifier |
| Diseño | design-auditor |

`Estado: Pendiente | En curso | Implementada | Validada | Rechazada (…)`
`Diseño: Pendiente | N/A | Aprobado | Rechazado (ronda N)`

## Fase 0 — Contexto
| ID | Tarea | Estado |
|---|---|---|
| F0-1 | Herramientas (plugins de diseño, Playwright, frontend-design) | En curso (ver resumen de la sesión de arranque) |
| F0-2 | PRODUCT.md | Pendiente |
| F0-3 | Aprobación de requisitos, decisiones y constitución | Pendiente |
| F0-4 | Selftest de scripts | Hecho en la sesión de arranque (re-ejecutar al aprobar) |
| F0-5 | Decisión de `.gitignore` y README antes del primer push | Pendiente |
| F0-6 | Resolver P-01 a P-12 (abajo) | Pendiente |
| F0-7 | Verificaciones externas V-01 a V-05 (abajo) | Pendiente |

### F0-6 — Pendientes del equipo (parados a propósito; no preguntar, registrar)
| ID | Pendiente | Decisión ligada |
|---|---|---|
| P-01 | Cómo se simulan las solicitudes sin app de pasajero | D-07 |
| P-03 | Pasarela de pago | D-09 |
| P-04 | Rúbrica y regla de la revisión técnico-mecánica | D-13, D-17 |
| P-05 | Plataforma del celular (Android/iOS) y cómo se conecta | — |
| P-06 | Sistema operativo, shell e IDE (detectado: Windows 11, PowerShell/Git Bash, VS Code) | — |
| P-07 | Fecha límite | — |
| P-08 | Presupuesto de tokens | D-20 |
| P-09 | Pull Requests con un solo integrante | D-23 |
| P-10 | Qué se versiona de los documentos de trabajo | D-19 |
| P-11 | URL del repositorio y rama principal (hoy: `master` local; el entorno cita `main` como principal) | — |
| P-12 | Nivel de diseño (supuesto "cuidado") | — |

### F0-7 — Verificaciones externas
| ID | Verificación |
|---|---|
| V-01 | Google Directions/Distance Matrix heredadas frente a Routes API (`computeRoutes`/`computeRouteMatrix`); decidir |
| V-02 | SDK de Expo vigente y compatibilidad en development build de `@react-native-firebase`, `react-native-maps` y geolocalización |
| V-03 | Mercado Pago Checkout Pro en WebView con cuentas de prueba y webhook contra servidor local (túnel) |
| V-04 | FCM en segundo plano |
| V-05 | Carga de imágenes a Cloudinary sin exponer secretos |

## Niveles de dependencia
| Nivel | Contenido |
|---|---|
| N0 | Fundación (T-01, navegación, config) |
| N1 | Tarifa (`calculateFare`), modelo de datos |
| N2 | Registro, ubicación |
| N3 | Solicitudes y viaje |
| N4 | Cobro y pagos |
| N5 | Ganancias, historial, perfil |
| N6 | Entrega |

## Fase 1 — Especificar
(vacío)

## Fase 2 — Planificar
### T-01 (propuesta; la confirma el planner)
- Spec: 000-fundacion
- Requisitos: RNF-01, RNF-12, RNF-13
- Hacer: dejar una primera pantalla corriendo en el celular físico con development build (ver D-22 para el scaffold existente).
- Hecho cuando: Anderson confirma el resultado en el celular. Hasta entonces: "No verificado en dispositivo".
- Estado: Pendiente

## Fase 3 — Implementar
(vacío)

## Fase 4 — Verificar
(vacío)

## Fase 5 — Entrega
(vacío)
