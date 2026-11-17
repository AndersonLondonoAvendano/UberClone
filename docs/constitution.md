# Constitución — UberClone Conductor

Estado: Borrador, pendiente de aprobación de Anderson (F0-3). Cada regla indica su requisito de origen y su regla de verificación C-xx (`scripts/check-constitution.mjs`).

## §1 Propósito y alcance
App móvil del conductor (RF-08 a RF-30) con backend Node/Express. Fuera de alcance: app de pasajero (D-07).

## §2 Stack y dependencias
- React Native + Expo, development build, sin Expo Go (RNF-01, RNF-12; C16).
- Solo dependencias listadas en `scripts/dependencies.json` clave `allowed`; las de `proposed` requieren decisión Vigente (C15).
- No usar APIs que no existan en la versión instalada; verificar el `.d.ts` (C17).
- Gestor: npm (yarn/pnpm/bun denegados en `.claude/settings.json`).

## §3 Estructura
- El árbol de `src/` lo decide el planner. Existen `src/config/` (parámetros, p. ej. `pricing.js`) y `src/utils/`.
- Servicios de red solo en `src/services/` (RNF-08; C10).
- Backend en `backend/`.

## §4 Convenciones
- Identificadores y comentarios en inglés; documentación en español (ENT-08).
- Dinero en COP enteros (RF-21; C09).
- La tarifa se calcula solo con `calculateFare` (RF-20; C07, C08); el backend la recalcula sin confiar en el monto del cliente (RF-16, D-06; C24).
- Estados del viaje desde una constante única `src/constants/tripStatus.js` (RF-13; C14).
- Sin `Alert` en el registro (RF-03; C05).
- `AsyncStorage` solo preferencias y sesión (RNF-04; C04).
- Sin Static Maps (RNF-10; C06).
- Los comentarios del código no remiten a documentos que no se entregan (C26).
- Marcas de IA `// AI-assisted: see AI_LOG.md #N` siempre con entrada existente (ENT-04; C18).

## §5 Red, errores y estados
- Secretos solo en `backend/.env` (RNF-05; C01, C02, C03, C27).
- Toda pantalla con datos remotos contempla cargando, vacío y error.
- Limpieza de efectos: `setInterval`, `setTimeout`, `watchPosition`, `onSnapshot` se liberan en el retorno del `useEffect` (RF-09, RNF-02; C11).

## §7 Rendimiento
- Listas con `FlatList` y consultas paginadas (RF-26, RF-28).
- Distance Matrix: una vez al crear la solicitud y una al aceptar; cacheada (RNF-08, D-18).
- `useMemo` en ganancias y `useCallback` en aceptar/rechazar (RNF-02; C13).

## §8 Calidad y definición de hecho
- Hecho = criterios de la tarea cumplidos + `check-constitution` sin errores aplicables + verificación independiente (`verifier`).
- Lo que solo se ve en el celular queda en **"No verificado en dispositivo"** hasta que Anderson confirme el resultado con fecha y evidencia (RNF-13; C25).
- Hooks propios `useDriverLocation`, `useTripRequests`, `useEarnings` (RNF-03; C12).

## §9 Entrega
README con instalación y "Uso de IA" enlazada (ENT-02; C19, C20); `AI_LOG.md` con entradas (ENT-03); video ≤ 5 min (ENT-06).

## §10 Flujo SDD y gobierno
- Fases 0–5 (ver `AGENTS.md`). Anderson aprueba cada fase.
- "Vigente" en una decisión solo lo pone Anderson. La bitácora de IA es suya.
- Ninguna tarea sin requisito ni requisito sin tarea (C21, C22); CA con fila en progress (C23).
- Los builds nativos los hace el humano.

## §11 Diseño
Solo tokens de diseño definidos en `DESIGN.md` (dirección A «Tablero», D-25 Vigente). Rúbrica y capas en `docs/diseno/rubrica.md`.
