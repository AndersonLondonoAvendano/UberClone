# Spec 000 — Fundación

Estado: Aprobada por Anderson (2026-10-27), registrada por el agente principal; incluye D-11, RNF-11, el contrato de testID y CA-000-D1 a D3.
Requisitos cubiertos: RNF-01, RNF-02, RNF-11, RNF-12, RNF-13, RF-30. Fuentes: F1 §1, §3 (vía docs/requisitos.md), ENCARGO.

## 1. Objetivo y porqué
Dejar una base sobre la que se construyan las demás specs: la app corre como development build en un celular físico (iOS o Android), tiene la navegación combinada Stack + Tabs + Drawer, un mecanismo de estado compartido y un backend Node/Express que arranca. Sin esto, ninguna otra spec se puede verificar en dispositivo (D-03), y los errores de plataforma aparecerían tarde.

Fuera de alcance: contenido real de las pantallas (registro, mapa, viaje, etc.), Firebase, mapas, pagos, y el diseño final de cada pantalla. Aquí las pantallas son marcadores de posición que solo demuestran la navegación.

## 2. Requisitos

### Plataforma y entorno
- [RNF-01] El sistema deberá ejecutarse en dispositivos iOS y Android, construido con React Native y Expo.
- [RNF-12] El sistema deberá ejecutarse como development build (`expo-dev-client`) y no deberá requerir Expo Go para funcionar.
- [RNF-12] Si se intenta abrir el proyecto en Expo Go, entonces el sistema no deberá considerarse una forma de ejecución válida del proyecto (los módulos nativos exigidos por specs posteriores no están disponibles ahí).
- [RNF-13] Cuando se termine la primera pantalla, el sistema deberá haberse ejecutado en un celular físico antes de darla por hecha.
- [RNF-13] Mientras Anderson no confirme el resultado en el celular con fecha y evidencia, todo criterio que solo se vea en el dispositivo deberá figurar como "No verificado en dispositivo".

### Backend
- [RNF-11] El sistema deberá incluir un backend construido con Node.js y Express, separado de la app.
- [RNF-11] Cuando el backend se arranque, el sistema deberá responder a una petición de comprobación de estado indicando que está activo. (Criterio derivado, necesario para poder verificar el requisito; el contenido de la respuesta lo define el planner.)
- [RNF-11] El backend no deberá contener ni exigir secretos para arrancar en esta spec (los secretos llegan con la spec 005, RNF-05).

### Hooks y estado
- [RNF-02] El sistema deberá usar `useState`, `useEffect` con limpieza, `useContext` (o Redux), `useMemo` y `useCallback` donde lo exijan las specs que los necesitan. Esta spec establece la base: estado local, efectos y un estado compartido accesible desde cualquier pantalla de la navegación.
- [RNF-02] Cuando una pantalla cree un `setInterval`, `setTimeout`, `watchPosition` o `onSnapshot`, el sistema deberá liberarlo al salir de la pantalla (limpieza del `useEffect`).
- [RNF-02] Si una spec posterior introduce `useMemo` o `useCallback` (ganancias, aceptar/rechazar), entonces esa spec deberá verificarlo; esta spec no los verifica.

### Navegación (RF-30)
- [RF-30] El sistema deberá combinar tres tipos de navegación: Stack (flujo del viaje), Tabs (registro) y Drawer (perfil, historial, ganancias, configuración).
- [RF-30] El sistema deberá ofrecer la navegación Tabs del registro con tres pestañas, en este orden: Datos personales, Vehículo, Documentos (nombres de RF-01).
- [RF-30] El sistema deberá ofrecer un Drawer con cuatro destinos: Perfil, Historial, Ganancias y Configuración.
- [RF-30] El sistema deberá ofrecer un Stack para el flujo del viaje, al que se llega desde la pantalla de inicio.
- [RF-30] Cuando el usuario elija un destino del Drawer, el sistema deberá mostrar la pantalla correspondiente y permitir volver a la pantalla de inicio.
- [RF-30] Cuando el usuario use el gesto o botón de atrás, el sistema deberá volver a la pantalla anterior de la pila; si no hay anterior, no deberá cerrar la sesión ni perder el estado de la navegación de forma inesperada.
- [RF-30] Si la cuenta no está Aprobada, entonces el sistema no deberá dar acceso al Drawer ni al Stack del viaje, y deberá mostrar solo la rama de registro. Esta restricción de acceso es la decisión propuesta D-11; RF-04 (spec 001) solo prohíbe ponerse Disponible sin aprobación, así que la lectura más conservadora queda registrada como Propuesta, no como requisito firme.
- [RF-30] Mientras se resuelve el estado de la cuenta al abrir la app, el sistema deberá mostrar un estado de carga y no deberá mostrar brevemente una rama equivocada.

### Estados de pantalla
- [RF-30] Cada pantalla marcador de posición deberá poder mostrarse en los estados cargando, vacío y error (constitución §5), de modo que las specs siguientes los hereden.

## 3. Decisiones relacionadas (no resueltas aquí)
- D-22 (Propuesta): cómo se crea el proyecto Expo en T-01 con el scaffold ya existente. Lo decide el planner; esta spec no lo prejuzga. Los CA no dependen de la opción elegida.
- D-11 (Propuesta): estructura de navegación (Stack raíz con rama Registro en Tabs y rama Principal en Drawer con Stack de viaje) y restricción por cuenta Aprobada. Lo decide el planner.
- D-27 (Propuesta): estado compartido con `useContext`.
- D-16 (Propuesta): JavaScript.
- D-25 y D-26 (Propuestas): dirección visual y tema claro único.
- D-02 y D-03 (Vigentes): development build y pruebas en celular físico.
- Versiones de Expo, React Native y Node: no encontradas en F1; el scaffold trae expo ~57.0.31 y react-native 0.86.3 y se fijan en T-01 con la documentación vigente.
- Plataforma del celular (Android/iOS) y cómo se conecta: P-05, pendiente. Los CA de dispositivo valen para la plataforma que elija Anderson.
- PARADAS que no afectan esta spec y se registran: D-07, D-09, D-13, D-17, D-19, D-23, P-01…P-12.

## 4. Criterios de aceptación

CA-000-01
Dado el proyecto instalado según el README, Cuando se construye un development build y se instala en un celular físico, Entonces la app abre y muestra una primera pantalla sin errores en pantalla roja.
Cómo se verifica: paso manual en el celular. **No verificado en dispositivo** (tarea T-01).

CA-000-02 [RNF-01]
Dado un celular Android y uno iPhone (o, si solo hay uno, el de la plataforma de P-05), Cuando se instala el development build en cada uno, Entonces la primera pantalla y la navegación funcionan en ambos.
Cómo se verifica: paso manual por plataforma. **No verificado en dispositivo** (tarea T-01); una plataforma sin dispositivo disponible queda registrada como no verificada, no como cumplida.

CA-000-03 [RNF-12]
Dado el proyecto, Cuando se revisa `package.json`, Entonces `expo-dev-client` figura como dependencia y toda dependencia pertenece a `allowed` de `scripts/dependencies.json` o tiene decisión Vigente.
Cómo se verifica: `node scripts/check-constitution.mjs` (reglas C15 y C16).

CA-000-04 [RNF-12]
Dado el development build instalado, Cuando se inicia el servidor de desarrollo y se conecta el build, Entonces la app carga desde ese servidor sin abrir Expo Go.
Cómo se verifica: paso manual. **No verificado en dispositivo** (T-01).

CA-000-05 [RNF-13]
Dado un criterio que solo se ve en el celular, Cuando Anderson no ha confirmado el resultado, Entonces `docs/progress.md` lo muestra como "No verificado en dispositivo" y no como ✅.
Cómo se verifica: revisión de `docs/progress.md` y `node scripts/check-constitution.mjs` (regla C25).

CA-000-06 [RNF-11]
Dado el backend, Cuando se instala y se arranca con Node, Entonces escucha en un puerto y responde a la petición de comprobación con éxito y un indicador de que está activo.
Cómo se verifica: arrancar el backend y hacer la petición desde un script o cliente HTTP; automatizable.

CA-000-07 [RNF-11]
Dado el backend sin archivo `backend/.env`, Cuando se arranca, Entonces arranca y responde a la comprobación sin error por falta de secretos.
Cómo se verifica: arranque local sin `.env`; automatizable.

CA-000-08 [RNF-02]
Dado el código fuente, Cuando se revisa cada `setInterval`, `setTimeout`, `watchPosition` u `onSnapshot`, Entonces se libera en el retorno de su `useEffect`.
Cómo se verifica: `node scripts/check-constitution.mjs` (regla C11). Si la spec no crea ninguno, el criterio no aplica y se anota así.

CA-000-09 [RNF-02]
Dado un valor guardado en el estado compartido desde una pantalla, Cuando el usuario navega a otra pantalla de la app, Entonces esa pantalla lee el mismo valor sin volver a pedirlo.
Cómo se verifica: prueba manual en el celular. **No verificado en dispositivo** (T-01); revisión de código por el verifier como apoyo. Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01; detalle en `docs/progress.md`.

CA-000-10 [RF-30]
Dado la navegación de registro, Cuando se abre, Entonces aparecen tres pestañas con los nombres Datos personales, Vehículo y Documentos, en ese orden, y se puede cambiar entre ellas.
Cómo se verifica: paso manual. **No verificado en dispositivo** (T-01). Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01; detalle en `docs/progress.md`.

CA-000-11 [RF-30]
Dado la navegación principal, Cuando se abre el Drawer, Entonces muestra Perfil, Historial, Ganancias y Configuración, y cada uno lleva a su pantalla y permite volver al inicio.
Cómo se verifica: paso manual. **No verificado en dispositivo** (T-01). Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01; detalle en `docs/progress.md`. El posible choque entre el gesto de abrir el Drawer y el gesto/botón de atrás de Android quedó «sin descripción» (ni confirmado ni descartado).

CA-000-12 [RF-30]
Dado la pantalla de inicio, Cuando se entra al flujo del viaje, Entonces se abre una pila que permite avanzar y volver con el gesto o botón de atrás.
Cómo se verifica: paso manual. **No verificado en dispositivo** (T-01). Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01; detalle en `docs/progress.md`.

CA-000-13 [RF-30, D-11]
Dado una cuenta no Aprobada (simulada con el valor del campo de estado de la cuenta), Cuando se abre la app, Entonces solo se ve la rama de registro; con una cuenta Aprobada se ve la rama principal con el Drawer. Este criterio vale solo si se aprueba D-11.
Cómo se verifica: paso manual cambiando el estado simulado. **No verificado en dispositivo** (T-01). Depende de la aprobación de D-11. Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01, para las cuatro ramas del simulador; detalle en `docs/progress.md`. iOS sigue sin verificar (P-05).

CA-000-14 [RF-30]
Dado el arranque de la app, Cuando todavía se resuelve el estado de la cuenta, Entonces se ve un indicador de carga y no se ve ninguna pantalla de la rama equivocada.
Cómo se verifica: paso manual, posible con red lenta. **No verificado en dispositivo** (T-01). Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01; detalle en `docs/progress.md`. iOS sigue sin verificar (P-05).

CA-000-15 [RF-30]
Dado cada pantalla marcador de posición, Cuando se fuerza el estado cargando, vacío o error, Entonces se ve una variante distinta y reconocible de cada uno.
Cómo se verifica: paso manual o captura. **No verificado en dispositivo** (T-01); capa B a D del arnés puede revisar capturas, nunca presentadas como del celular. Cerrado por declaración de Anderson (Android, sin captura) en T-11, 2026-11-01, en Datos personales, Vehículo, Documentos y una pantalla del Drawer; detalle en `docs/progress.md`.

### Criterios de diseño
CA-000-D1
Dado cualquier elemento interactivo de la navegación (pestaña, entrada del Drawer, botón de atrás), Cuando se mide, Entonces su área táctil es al menos 44 × 44 px y la separación entre objetivos contiguos es al menos 8 (`DESIGN.md`, Tamaños táctiles). Cada uno lleva el `testID` del contrato de `DESIGN.md` (`tab-<destino>`, `drawer-<destino>`, `nav-back`) [RF-30].
Cómo se verifica: revisión de capa D (checklist de UI UX Pro Max), revisión de código de los `testID` y paso manual de las medidas. **No verificado en dispositivo** (T-01).

CA-000-D2
Dado el código de estilos, Cuando se revisan colores, tamaños de texto, espaciados y radios, Entonces provienen solo de estos tokens de `DESIGN.md`: color (`color.bg`, `color.surface`, `color.border`, `color.text`, `color.textMuted`, `color.primary`, `color.onPrimary`, `color.success`, `color.warning`, `color.danger`), tipografía (`type.display`, `type.title`, `type.body`, `type.label`, `type.caption`), espaciado (`space.1` a `space.6`) y radios (`radius.sm`, `radius.md`, `radius.lg`, `radius.full`); no hay hex, tamaños ni fuentes sueltos, y los pares de color usados son los de la tabla de contraste de `DESIGN.md`.
Cómo se verifica: revisión del verifier y capa A (regla de diseño del arnés/constitución §11, donde aplique).

CA-000-D3
Dado el texto de la navegación, Cuando se aumenta la escala de texto del sistema, Entonces los nombres de pestañas y destinos del Drawer, definidos con los `type.*` de `DESIGN.md`, no se cortan ni se solapan y sus contenedores crecen en alto (mínimo 48) en lugar de truncar.
Cómo se verifica: paso manual. **No verificado en dispositivo** (T-01).

## 5. Casos límite
- Abrir el proyecto en Expo Go: no es una forma válida de ejecución (RNF-12); los CA no se dan por cumplidos con él.
- Sin celular físico disponible: ningún CA de dispositivo puede pasar a ✅ (RNF-13); quedan "No verificado en dispositivo".
- Solo una plataforma disponible (P-05): se anota qué plataforma se probó y la otra queda sin verificar.
- Botón de atrás de Android en la raíz de la pila: no debe dejar la app en un estado inconsistente.
- Rotación del dispositivo: el scaffold fija orientación vertical; el comportamiento en horizontal no está en F1 y no se promete.
- Cambio de cuenta de Aprobada a no Aprobada con la app abierta: la rama visible deberá corresponder al estado nuevo (sujeto a D-11).
- Pérdida de red al arrancar: el estado de la cuenta no se resuelve; debe verse el estado de error, no una pantalla en blanco.
- Backend caído: la app no debe fallar al arrancar por ello en esta spec (la app no depende del backend para mostrar la primera pantalla).
- Backend arrancado con puerto ocupado: falla con un mensaje claro y no con un cuelgue silencioso.

## 6. No encontrado
Versiones objetivo de Node, fecha límite (P-07), plataforma del celular (P-05), rúbrica (D-17), y cualquier requisito de F1 sobre modo oscuro, accesibilidad o rotación.

## 7. Trazabilidad
| Requisito | Criterios |
|---|---|
| RNF-01 | CA-000-01, CA-000-02 |
| RNF-02 | CA-000-08, CA-000-09 |
| RNF-11 | CA-000-06, CA-000-07 |
| RNF-12 | CA-000-03, CA-000-04 |
| RNF-13 | CA-000-01, CA-000-05 |
| RF-30 | CA-000-10 a CA-000-15, CA-000-D1 a CA-000-D3 |
