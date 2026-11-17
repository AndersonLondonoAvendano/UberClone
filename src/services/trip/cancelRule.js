// AI-assisted: see AI_LOG.md #66
// Pure UI rule (T-222, RE-08, D-184): "Cancelar viaje" is offered only when the machine allows
// status -> cancelled; once the ride is in_progress the only exit is the local safe exit (abandon).
import { TRIP_STATUS } from '../../constants/tripStatus';
import { canTransition } from './tripMachine';

export function canOfferCancel(status) {
  return canTransition(status, TRIP_STATUS.CANCELLED);
}
