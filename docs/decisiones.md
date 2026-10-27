# Decisiones

Estados: Vigente (solo la pone Anderson) · Propuesta · PARADA (el equipo la dejó pendiente a propósito; no se pregunta, se registra).

## Vigentes [ENCARGO 2026-10-26]

### D-01 — Backend Node/Express · Vigente
Situación: F1 §4 exige un backend que guarde la llave secreta de la pasarela.
Decisión: Node.js/Express.
Alternativa: Cloud Functions.

### D-02 — Development build, sin Expo Go · Vigente
Situación: se usan módulos nativos (Firebase, mapas, geolocalización).
Decisión: development build (`expo-dev-client`).
Alternativa: Expo Go (descartada).

### D-03 — Pruebas en celular físico desde la primera pantalla · Vigente
Situación: mapas, ubicación, FCM y pagos no se validan en simulador/web.
Decisión: todo CA de dispositivo se prueba en celular real.
Alternativa: emulador.

### D-04 — Equipo unipersonal · Vigente
Situación: un solo integrante, Anderson Londoño Avendaño, decide todo.
Decisión: sin roles repartidos; Anderson aprueba cada fase.
Alternativa: —

## Propuestas

### D-05 — Base de datos Firestore · Propuesta
Situación: F1 §7 admite Firestore `onSnapshot` o Mongo Change Streams.
Decisión: Firestore.
Alternativa: MongoDB con Change Streams.

### D-06 — El backend recalcula la tarifa · Propuesta
Situación: F1 §4 dice que la app envía `tripId` y monto al backend.
Decisión: el backend recalcula con `calculateFare` desde los datos del viaje e ignora el monto del cliente.
Alternativa: confiar en el monto (inseguro).

### D-07 — Solicitudes simuladas · PARADA (P-01)
Situación: la app de pasajero no existe.
Decisión pendiente: propuesta de partida, un script o seed crea las solicitudes.
Alternativa: app de pasajero mínima.

### D-08 — El checkout se abre en la app del conductor · Propuesta
Situación: F1 §4 dice "la app abre el checkout" sin decir cuál app.
Decisión: la app del conductor.
Alternativa: app del pasajero.

### D-09 — Pasarela Mercado Pago · PARADA (P-03)
Situación: F1 §4 recomienda Mercado Pago o Stripe en modo prueba.
Decisión pendiente: propuesta de partida, Mercado Pago Checkout Pro.
Alternativa: Stripe en modo prueba.

### D-10 — Estados adicionales y sin cancelar · Propuesta
Situación: F1 §3 menciona rechazo/vencimiento y `rejected` no está en la lista de estados.
Decisión: se añade `rejected`; `accepted`→`driver_arriving` es automático; no hay botón de cancelar.
Alternativa: botón de cancelar para el conductor.

### D-11 — Navegación · Propuesta
Situación: RF-30 pide Stack + Tabs + Drawer.
Decisión: Stack raíz con la rama Registro (Tabs) y la rama Principal (Drawer con Stack de viaje), esta última solo para cuentas Aprobadas.
Alternativa: Drawer raíz.

### D-12 — Tarifa mínima · Propuesta
Situación: el orden de multiplicador, redondeo y mínima no está explícito.
Decisión: mínima aplicada tras multiplicador y redondeo, validada con el ejemplo de F1 §5.
Alternativa: mínima antes del multiplicador.

### D-13 — Revisión técnico-mecánica · PARADA (P-04)
Situación: F1 §2 dice "si aplica según el año del vehículo" sin regla.
Decisión pendiente: propuesta de partida, obligatoria siempre hasta que haya regla.
Alternativa: exigir solo para vehículos de más de N años.

### D-14 — Placa solo de carro · Propuesta
Situación: el formato `ABC123` es de carro en Colombia.
Decisión: no se admite formato de moto.
Alternativa: admitir `ABC12D`.

### D-15 — i18n ES/EN completo · Propuesta
Situación: F1 §2 exige idioma ES/EN.
Decisión: toda la interfaz traducida, no solo el selector.
Alternativa: solo preferencia guardada.

### D-16 — JavaScript · Propuesta
Situación: F1 nombra `pricing.js`.
Decisión: JavaScript.
Alternativa: TypeScript.

### D-17 — Rúbrica no encontrada · PARADA (P-04)
Situación: F1 §9 anuncia la rúbrica y no la trae.
Decisión pendiente: se trabaja sin pesos hasta que el equipo la consiga.
Alternativa: —

### D-18 — Cachear Distance Matrix; OSRM como contingencia · Propuesta
Situación: RNF-08 limita las llamadas.
Decisión: cachear resultados; OSRM/OpenRouteService si se agota el presupuesto.
Alternativa: sin caché.

### D-19 — Documentos de trabajo en Git · PARADA (P-10)
Situación: `docs/`, `specs/`, `.claude/` son documentos de trabajo SDD.
Decisión pendiente: versionarlos o ignorarlos; decidir antes del primer push.
Alternativa: —

### D-20 — Modo ahorro desactivado · Propuesta
Situación: presupuesto de tokens sin definir (P-08).
Decisión: desactivado por defecto.
Alternativa: activarlo.

### D-21 — Sin CodeGraphContext · Propuesta
Situación: hay MCPs de grafo de código disponibles en el entorno.
Decisión: no se usan en el flujo del proyecto.
Alternativa: adoptarlos.

### D-22 — Cómo se crea el proyecto Expo en T-01 · Propuesta
Situación: la raíz ya contiene un scaffold (App.js, app.json, package.json con expo ~57.0.31 y react-native 0.86.3, index.js, assets/). Esta estructura SDD convive con él.
Decisión: lo decide el planner; opciones: conservar el scaffold y ajustarlo, o regenerar en carpeta temporal y fusionar sin destruir la estructura SDD.
Alternativa: `create-expo-app` en subcarpeta.

### D-23 — Pull Requests con un solo integrante · PARADA (P-09)
Situación: F1 §9 pide PRs revisados y el equipo es de una persona.
Decisión pendiente: cómo cumplir "revisados".
Alternativa: PR autorrevisado con checklist, o revisión externa.

### D-24 — Archivos de Firebase fuera de Git · Propuesta
Situación: `google-services.json` y `GoogleService-Info.plist` contienen identificadores del proyecto.
Decisión: fuera de Git (ya en `.gitignore`); el README explica cómo generarlos.
Alternativa: versionarlos.
