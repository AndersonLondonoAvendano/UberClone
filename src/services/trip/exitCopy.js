// AI-assisted: see AI_LOG.md #66
// Pure choice of the text of the "Salir del viaje" confirmation (C2c). The safe exit (abandon) saves a
// cancelled trip with zero amounts, unless the driver is at the destination, where nothing is saved or charged
// either. So the text must say what really happens and only mention the missing server confirmation when
// the server actually failed to confirm (a finish or cancel error is on screen).
import { labels } from '../../constants/labels';
import { TRIP_STATUS } from '../../constants/tripStatus';

// status: current trip status. atDestination: the driver reached the destination. serverError: finishError
// or cancelError is set. Returns { question, message } (both from labels.trip).
export function exitCopy({ status, atDestination = false, serverError = false }) {
  const t = labels.trip;
  if (atDestination) return { question: t.exitQuestionServer, message: t.exitMessageAtDestination };
  if (status === TRIP_STATUS.IN_PROGRESS) return { question: t.exitQuestionInProgress, message: t.exitMessageCancelled };
  if (serverError) return { question: t.exitQuestionServer, message: t.exitMessageCancelled };
  return { question: t.exitQuestionPlain, message: t.exitMessageCancelled };
}
