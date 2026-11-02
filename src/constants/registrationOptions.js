// AI-assisted: see docs/AI_LOG.md #25
import { labels } from './labels';

export const GENDER_OPTIONS = [
  { value: 'femenino', label: labels.registration.gender.femenino },
  { value: 'masculino', label: labels.registration.gender.masculino },
  { value: 'otro', label: labels.registration.gender.otro },
  { value: 'prefiero-no-decir', label: labels.registration.gender.prefieroNoDecir },
];

export const LANGUAGE_OPTIONS = [
  { value: 'es', label: labels.registration.language.es },
  { value: 'en', label: labels.registration.language.en },
];

export const VEHICLE_CATEGORY_OPTIONS = [
  { value: 'economico', label: labels.registration.vehicleCategory.economico },
  { value: 'xl', label: labels.registration.vehicleCategory.xl },
  { value: 'premium', label: labels.registration.vehicleCategory.premium },
];

export const VEHICLE_COLOR_OPTIONS = [
  { value: 'blanco', label: labels.registration.vehicleColor.blanco },
  { value: 'negro', label: labels.registration.vehicleColor.negro },
  { value: 'gris', label: labels.registration.vehicleColor.gris },
  { value: 'plata', label: labels.registration.vehicleColor.plata },
  { value: 'rojo', label: labels.registration.vehicleColor.rojo },
  { value: 'azul', label: labels.registration.vehicleColor.azul },
  { value: 'verde', label: labels.registration.vehicleColor.verde },
  { value: 'amarillo', label: labels.registration.vehicleColor.amarillo },
  { value: 'otro', label: labels.registration.vehicleColor.otro },
];
