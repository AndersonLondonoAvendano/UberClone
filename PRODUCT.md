# PRODUCT

Estado: Propuesta, pendiente de aprobación de Anderson. Las skills de diseño se consultaron por su `SKILL.md`, no se cargaron con Skill (D-28, Propuesta); debe refinarse cuando se carguen. Fuentes: F1 (vía docs/requisitos.md), ENCARGO, MAESTRO. Lo que no tiene fuente figura como "no encontrado".

## Qué es
UberClone Conductor: app móvil para el conductor de un servicio de transporte tipo Uber, con backend Node/Express (D-01, RNF-11). La app de pasajero queda fuera de alcance (D-07, PARADA P-01). Cubre RF-08 a RF-30.

## Para quién
- Usuario principal: el conductor (persona que conduce un carro; la placa es de carro, D-14). Usa la app en un celular, con frecuencia dentro del vehículo, con una mano y con atención dividida.
- Otros públicos del producto: no encontrado en F1 más allá del conductor; la audiencia de la entrega (sustentación y video de máximo 5 min, ENT-06) se trata en la spec 009.

## Qué logra el conductor (de F1)
1. Registrarse con datos personales, vehículo y documentos, y esperar su aprobación (RF-01 a RF-07).
2. Ponerse Disponible y recibir solicitudes con tarifa y ganancia neta estimadas, con 15 s para decidir (RF-08 a RF-11).
3. Hacer el viaje con ruta a la recogida y al destino (RF-12, RF-13).
4. Cobrar por pasarela de pruebas o en efectivo y ver su resumen (RF-14 a RF-18).
5. Consultar ganancias, historial y perfil (RF-24 a RF-29).

## Tono y principios de producto (propuesta)
- Claridad antes que adorno: el conductor decide en segundos, por eso cada pantalla tiene una acción principal evidente.
- Dinero siempre legible: COP enteros, con separador de miles, sin ambigüedad entre tarifa, comisión y ganancia neta (RF-21, RF-22).
- Los errores se explican en el lugar donde ocurren, nunca en `Alert` en el registro (RF-03).
- Toda pantalla con datos remotos contempla cargando, vacío y error (constitución §5).
- Honestidad sobre el estado: lo que depende del celular se marca "No verificado en dispositivo" hasta que Anderson lo confirme (RNF-13).
- Voz: segunda persona de tratamiento directo, frases cortas, sin jerga técnica. Idioma de la interfaz ES/EN; el alcance de la traducción es la decisión D-15 (Propuesta).

## Nivel de diseño
"Cuidado" (supuesto P-12, sin confirmar): dirección A «Tablero» (D-25, Propuesta): sobria y consistente, no una pieza de exhibición; el color solo va en el dato vivo. Los detalles visuales viven en DESIGN.md y `docs/diseno/direccion.md`.

## Anti-objetivos
- No imitar la marca ni los activos de Uber: el proyecto es un clon académico con identidad propia sobria.
- No hay cancelar viaje desde el conductor (D-10, Propuesta).
- Sin pagos reales: solo credenciales de prueba (RNF-05).

## No encontrado
- Perfil demográfico del conductor, métricas de éxito y marca/nombre comercial final: F1 no los trae.
- Rúbrica de evaluación y pesos (D-17, PARADA).

## Qué debe refinarse con las skills cargadas
Personas y escenarios (Impeccable) y validación de principios de usabilidad (UI UX Pro Max). La dirección de arte ya está propuesta (D-25). Hasta entonces este documento es una propuesta.
