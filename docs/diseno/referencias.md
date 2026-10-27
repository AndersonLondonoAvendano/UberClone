# Referencias de diseño

Estado: Aprobado por Anderson (2026-10-27), registrado por el agente principal.

Las tres skills (Taste `design-taste-frontend`, Impeccable, UI UX Pro Max) se consultaron leyendo su `SKILL.md` del caché de plugins, no con la herramienta Skill. `draw.mjs` de Taste y los scripts de Impeccable y de UI UX Pro Max no se ejecutaron (D-28, Propuesta). Esto no equivale a «skills cargadas»: las rondas de diseño siguen sujetas a P4. Las reglas de Taste vienen de `references/app-screens.md` (versión 2.1.4) y de su guía general de la casa.

## Taste
| Tomado | Aplicado en |
|---|---|
| Color en los datos y no en el chrome | `DESIGN.md` (reglas de uso del color) |
| Indicadores como tipografía, no tarjetas con ícono | Patrón KPI; prohibido en `direccion.md` |
| Superficies planas, sin sombra en reposo | Elevación |
| Navegación que se retira | Patrón de navegación |
| Estados de datos honestos (ceros como cero, vacío con marco) | Patrones cargando/vacío/error |
| Palabras del oficio en las etiquetas | Importes y etiquetas |
| Un elemento propio del producto | Franja de «tarifa en vivo» |
| Sin degradados, glow ni minigráficas decorativas | Lista de prohibido |

| Descartado | Razón |
|---|---|
| Estudio de 23 pantallas de escritorio | La app es móvil; no aplica |
| Reglas de tablas y calendarios | No hay tablas ni calendarios en el alcance |
| `draw.mjs` | No se ejecutó: pensado para escritorio y sin tipo de producto de movilidad (D-28) |
| Regla de «sin monoespaciada» | No aplica: no se usa fuente monoespaciada; se usan cifras tabulares del sistema |
| Requisito de `assets/charts.js` | Es de web; no hay gráficas en el alcance |
| Scripts `inspect` y `lint` de Taste | Son para web; el arnés del proyecto es `scripts/visual-audit.mjs` |

## Impeccable
| Tomado | Razón |
|---|---|
| Solo el modo «Operate» (interfaz de uso repetido y tarea) | Encaja con un conductor que decide en segundos |

| Descartado | Razón |
|---|---|
| Resto de modos (marca, exhibición) | El nivel es "cuidado" (P-12), no una pieza de exhibición |
| `audit` y `critique` por ahora | Se usan en la capa C sobre pantallas reales, cuando la skill cargue con Skill |
| Scripts de la skill | No se ejecutaron (D-28) |

## UI UX Pro Max
| Tomado | Aplicado en |
|---|---|
| Contraste 4.5:1 texto y 3:1 componentes | Tabla de contraste |
| Objetivo táctil ≥ 44 px y separación 8 | Tamaños táctiles |

| Descartado | Razón |
|---|---|
| Base de datos de estilos y paletas de la skill | La paleta ya está fijada por D-25 |
| Pila web / sugerencias de librerías de íconos y de animación | Añadirían dependencias fuera de `scripts/dependencies.json` |
| Scripts de búsqueda y generación | No se ejecutaron (D-28) |
