// AI-assisted: see docs/AI_LOG.md #67
import { labels } from './labels';

// Each option keeps its stored `value`; `label` is a getter, so the text is read from the active language
// every time it is read (never frozen when this module loads). Stored values do not change with the language.
function option(value, read) {
  return {
    value,
    get label() {
      return read();
    },
  };
}

export const GENDER_OPTIONS = [
  option('femenino', () => labels.registration.gender.femenino),
  option('masculino', () => labels.registration.gender.masculino),
  option('otro', () => labels.registration.gender.otro),
  option('prefiero-no-decir', () => labels.registration.gender.prefieroNoDecir),
];

export const LANGUAGE_OPTIONS = [
  option('es', () => labels.registration.language.es),
  option('en', () => labels.registration.language.en),
];

export const VEHICLE_CATEGORY_OPTIONS = [
  option('economico', () => labels.registration.vehicleCategory.economico),
  option('xl', () => labels.registration.vehicleCategory.xl),
  option('premium', () => labels.registration.vehicleCategory.premium),
];

export const VEHICLE_COLOR_OPTIONS = [
  option('blanco', () => labels.registration.vehicleColor.blanco),
  option('negro', () => labels.registration.vehicleColor.negro),
  option('gris', () => labels.registration.vehicleColor.gris),
  option('plata', () => labels.registration.vehicleColor.plata),
  option('rojo', () => labels.registration.vehicleColor.rojo),
  option('azul', () => labels.registration.vehicleColor.azul),
  option('verde', () => labels.registration.vehicleColor.verde),
  option('amarillo', () => labels.registration.vehicleColor.amarillo),
  option('otro', () => labels.registration.vehicleColor.otro),
];
