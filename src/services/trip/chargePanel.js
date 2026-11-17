// AI-assisted: see AI_LOG.md #58
// Pure decision of the single message, tone, chip and actions shown on "Cobro y resumen" (T-118, RF-56).
// The screen only paints what this returns. One message at a time with priority:
// save error > service error (card) / write error (cash) > informational > success.
// Cash trips never get backend actions or service messages. A service error only counts after a real
// user action (charge, verify, retry), never from mounting or the silent foreground check.

import { PAYMENT_STATUS } from '../../constants/tripStatus';
import { labels } from '../../constants/labels';
import { PAYMENT_ACTION, paymentView, PAYMENT_CHIP } from './paymentView';
import { chargeChoices, CHOICE_MESSAGE, hasChosenGateway } from './paymentGateway';
import { isCardMethod, SAVED_PAYMENT } from './tripRecord';

export const CHARGE_TONE = { SUCCESS: 'success', ERROR: 'error', WARNING: 'warning', INFO: 'info', NEUTRAL: 'neutral' };

const LIVE = 'polite';
const text = labels.trip.chargePanel;

// A string error carries its own (already localized) text; any other truthy value uses the generic one.
function errorText(error, generic) {
  return typeof error === 'string' && error.length > 0 ? error : generic;
}

// AI-assisted: see AI_LOG.md #57
// T-126 (RF-57): the single "Title. Message" text of a card service error class. Classes without their own
// text (failed, backendUnavailable, openFailed) use the older action texts; unknown codes use the generic one.
export function serviceErrorText(code) {
  const entry = labels.trip.paymentServiceError[code] ?? labels.trip.paymentActionError[code];
  return entry ? `${entry.title}. ${entry.message}` : text.serviceError;
}

// AI-assisted: see AI_LOG.md #58
// T-145 (RF-62, DP-47): the gateways with a charge button, in a fixed order.
export const CHARGE_PROVIDERS = [SAVED_PAYMENT.MERCADOPAGO, SAVED_PAYMENT.STRIPE];

// AI-assisted: see AI_LOG.md #59
// The pseudo-action of "Reintentar" when the providers query failed (it reloads the query, no payment service call).
export const RELOAD_PROVIDERS = 'reloadProviders';

// T-147 (CA-002-122): the buttons of the actions block, in order. CHARGE and RETRY get one button per gateway
// (chargeProviders from the panel, which come ONLY from the configured gateways; never derived from the trip).
// Other actions get one button. key and testID suffix keep the old ids for Mercado Pago and plain actions.
export function chargeButtons(panel) {
  const actions = panel?.actions ?? [];
  const gateways = Array.isArray(panel?.chargeProviders) ? panel.chargeProviders : [];
  const buttons = [];
  for (const action of actions) {
    if (action !== PAYMENT_ACTION.CHARGE && action !== PAYMENT_ACTION.RETRY) {
      buttons.push({ key: action, action, provider: null, label: labels.trip.paymentAction[action] });
      continue;
    }
    for (const provider of gateways) {
      const named = action === PAYMENT_ACTION.CHARGE ? labels.trip.chargeProvider[provider] : labels.trip.retryProvider[provider];
      const label = action === PAYMENT_ACTION.RETRY && gateways.length === 1 ? labels.trip.paymentAction.retry : named;
      buttons.push({ key: provider === SAVED_PAYMENT.MERCADOPAGO ? action : `${action}-${provider}`, action, provider, label });
    }
  }
  return buttons;
}

// writeError is the failed Firestore write of "Confirmar efectivo recibido" (not the charge service): cash only.
export function chargePanel({ method, paymentStatus, saveError, serviceError, writeError, userActed, providers, providersFailed, paymentId } = {}) {
  const isCash = method === SAVED_PAYMENT.CASH;
  const isCard = isCardMethod(method);
  const collected = paymentStatus === PAYMENT_STATUS.PAID;
  const status = isCard && collected ? PAYMENT_STATUS.APPROVED : paymentStatus;
  const view = paymentView({ paymentMethod: method, paymentStatus: status, status: 'completed' });

  // AI-assisted: see AI_LOG.md #59
  // Charge/retry buttons come ONLY from the configured gateways (chargeChoices). With the providers loading, failed
  // or none configured there is no charge button and never a default gateway. "Verificar pago" only exists once
  // the trip has a chosen gateway (paymentId). A failed providers query offers "Reintentar".
  const choices = chargeChoices({ providers, failed: providersFailed === true });
  const chosen = hasChosenGateway({ method, paymentId });
  const wantsCharge = view.actions.includes(PAYMENT_ACTION.CHARGE) || view.actions.includes(PAYMENT_ACTION.RETRY);
  const noGateway = isCard && wantsCharge && choices.gateways.length === 0;
  const reload = noGateway && choices.message === CHOICE_MESSAGE.FAILED;
  let cardActions = view.actions.filter((a) => a !== PAYMENT_ACTION.VERIFY || chosen);
  if (noGateway) cardActions = cardActions.filter((a) => a !== PAYMENT_ACTION.CHARGE && a !== PAYMENT_ACTION.RETRY);
  if (reload) cardActions = [RELOAD_PROVIDERS, ...cardActions];
  const gatewayInfo = isCard ? { chargeProviders: wantsCharge ? choices.gateways : [], noGateway } : {};

  if (saveError) {
    return { message: errorText(saveError, labels.trip.saveErrorGeneric), tone: CHARGE_TONE.ERROR, chip: PAYMENT_CHIP.UNAVAILABLE, actions: [], live: LIVE };
  }
  if (isCard && serviceError && userActed === true) {
    return { message: errorText(serviceError, text.serviceError), tone: CHARGE_TONE.ERROR, chip: view.chip, actions: cardActions, live: LIVE, ...gatewayInfo };
  }
  const base = { chip: view.chip, actions: view.actions, live: LIVE };
  if (isCash) {
    // Cash write failure: error tone, keep chip and the confirm button so the driver can retry.
    if (writeError && view.actions.length > 0) {
      const failed = labels.trip.paymentActionError.cashFailed;
      return { message: errorText(writeError, `${failed.title}. ${failed.message}`), tone: CHARGE_TONE.ERROR, chip: view.chip, actions: view.actions, live: LIVE };
    }
    return view.actions.length > 0
      ? { ...base, message: text.cashPending, tone: CHARGE_TONE.INFO }
      : { ...base, message: text.cashCollected, tone: CHARGE_TONE.SUCCESS };
  }
  if (isCard) {
    const card = { ...base, actions: cardActions, ...gatewayInfo };
    if (view.chip === PAYMENT_CHIP.APPROVED) return { ...card, message: text.cardApproved, tone: CHARGE_TONE.SUCCESS };
    if (reload) return { ...card, message: text.providersFailed, tone: CHARGE_TONE.WARNING };
    if (noGateway && choices.message === CHOICE_MESSAGE.NO_GATEWAY) return { ...card, message: text.noGateway, tone: CHARGE_TONE.INFO };
    if (view.chip === PAYMENT_CHIP.REJECTED) {
      // With two retry buttons the text cannot name one of them; with one or unknown gateways it keeps the old text.
      const several = Array.isArray(card.chargeProviders) && card.chargeProviders.length > 1;
      return { ...card, message: several ? text.cardRejectedChoose : text.cardRejected, tone: CHARGE_TONE.ERROR };
    }
    return { ...card, message: text.cardPendingGeneric, tone: CHARGE_TONE.INFO };
  }
  return { ...base, message: null, tone: CHARGE_TONE.NEUTRAL };
}
