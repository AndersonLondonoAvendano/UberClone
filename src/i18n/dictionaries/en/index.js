// AI-assisted: see AI_LOG.md #67
// English dictionary: the section files merged. Keys still missing fall back to Spanish (RI-04).
import { enApp } from './app';
import { enTrip } from './trip';
import { enAccount } from './account';
import { enRegistration } from './registration';

export const en = { ...enApp, ...enTrip, ...enAccount, ...enRegistration };
