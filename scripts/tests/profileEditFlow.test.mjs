// AI-assisted: see docs/AI_LOG.md #60
// Plain Node tests for src/utils/profileEditFlow.js (CA-002-130, 133 to 136, 141). Run:
//   node scripts/tests/profileEditFlow.test.mjs
import './helpers/registerSrcLoader.mjs';
import assert from 'node:assert/strict';

const { createProfileEditFlow } = await import('../../src/utils/profileEditFlow.js');

const profileA = {
  personalData: { fullName: 'Ana Perez', phone: '3000000001' },
  vehicle: { color: 'blanco' },
  documents: { mercadoPagoEmail: 'ana@example.com' },
};
const profileB = {
  personalData: { fullName: 'Beto Lopez', phone: '3000000004' },
  vehicle: { color: 'negro' },
  documents: { mercadoPagoEmail: 'beto@example.com' },
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeFlow() {
  const calls = [];
  const pending = [];
  const flow = createProfileEditFlow({
    save: (uid, payload) => {
      calls.push({ uid, payload });
      const d = deferred();
      pending.push(d);
      return d.promise;
    },
  });
  return { flow, calls, pending };
}

// Initial state and a single edit mode (CA-002-130).
{
  const { flow } = makeFlow();
  assert.equal(flow.getState().mode, 'read');
  flow.start('A', profileA);
  assert.equal(flow.getState().mode, 'edit');
  assert.equal(flow.getState().canSave, false);
  assert.deepEqual(flow.getState().draft, flow.getState().baseline);
  flow.change('fullName', 'Ana Maria');
  flow.start('A', profileB); // ignored
  assert.equal(flow.getState().draft.fullName, 'Ana Maria');
  assert.equal(flow.getState().baseline.fullName, 'Ana Perez');
}

// Validity, touched errors and canSave (CA-002-133).
{
  const { flow } = makeFlow();
  flow.start('A', profileA);
  flow.change('phone', '123');
  assert.equal(flow.getState().canSave, false);
  assert.deepEqual(flow.getState().errors, { phone: true });
  flow.change('phone', '3000000005');
  assert.equal(flow.getState().canSave, true);
  assert.deepEqual(flow.getState().errors, {});
  flow.change('payoutEmail', 'mal');
  flow.touch('payoutEmail');
  assert.equal(flow.getState().errors.payoutEmail, true);
  flow.change('payoutEmail', 'ana@example.com');
  flow.change('phone', '3000000001');
  assert.equal(flow.getState().canSave, false);
  // Untouched invalid fields show no error until touched.
  const empty = makeFlow().flow;
  empty.start('A', { personalData: {}, vehicle: {}, documents: {} });
  assert.deepEqual(empty.getState().errors, {});
  empty.touch('fullName');
  assert.deepEqual(empty.getState().errors, { fullName: true });
}

// Cancel with changes never calls save (CA-002-134).
{
  const { flow, calls } = makeFlow();
  flow.start('A', profileA);
  flow.change('fullName', 'Otro Nombre');
  flow.cancel();
  assert.equal(flow.getState().mode, 'read');
  assert.equal(flow.getState().draft, null);
  assert.equal(calls.length, 0);
}

// submit without changes or with an invalid draft does nothing.
{
  const { flow, calls } = makeFlow();
  flow.start('A', profileA);
  await flow.submit();
  flow.change('phone', '12');
  await flow.submit();
  assert.equal(calls.length, 0);
}

// Double submit or retry while saving = one call; success goes to read/saved (CA-002-135).
{
  const { flow, calls, pending } = makeFlow();
  flow.start('A', profileA);
  flow.change('fullName', '  Ana Maria  ');
  const p1 = flow.submit();
  const p2 = flow.submit();
  flow.retry();
  assert.equal(flow.getState().phase, 'saving');
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    uid: 'A',
    payload: { fullName: 'Ana Maria', phone: '3000000001', vehicleColor: 'blanco', payoutEmail: 'ana@example.com' },
  });
  pending[0].resolve();
  await Promise.all([p1, p2]);
  assert.equal(flow.getState().mode, 'read');
  assert.equal(flow.getState().phase, 'saved');
  assert.equal(calls.length, 1);
}

// Rejection keeps edit mode and draft; retry repeats the same values (CA-002-136).
{
  const { flow, calls, pending } = makeFlow();
  flow.start('A', profileA);
  flow.change('vehicleColor', 'rojo');
  const p = flow.submit();
  pending[0].reject(new Error('network'));
  await p;
  assert.equal(flow.getState().mode, 'edit');
  assert.equal(flow.getState().phase, 'error');
  assert.equal(flow.getState().draft.vehicleColor, 'rojo');
  const r = flow.retry();
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], calls[0]);
  pending[1].resolve();
  await r;
  assert.equal(flow.getState().phase, 'saved');
  assert.equal(flow.getState().mode, 'read');
}

// reset(uid): zero data from A; a late save response from A is ignored (CA-002-141).
{
  const { flow, calls, pending } = makeFlow();
  flow.start('A', profileA);
  flow.change('fullName', 'Ana Maria');
  const p = flow.submit();
  flow.reset('B');
  const s = flow.getState();
  assert.equal(s.uid, 'B');
  assert.equal(s.mode, 'read');
  assert.equal(s.phase, 'idle');
  assert.equal(s.draft, null);
  assert.equal(s.baseline, null);
  assert.ok(!JSON.stringify(s).includes('Ana'));
  pending[0].resolve();
  await p;
  assert.equal(flow.getState().phase, 'idle');
  assert.equal(flow.getState().uid, 'B');
  // B edits and saves normally afterwards.
  flow.start('B', profileB);
  flow.change('fullName', 'Beto Ruiz');
  const pb = flow.submit();
  pending[1].resolve();
  await pb;
  assert.equal(flow.getState().phase, 'saved');
  assert.equal(calls[1].uid, 'B');

  // A late rejection after reset is ignored as well.
  const late = makeFlow();
  late.flow.start('A', profileA);
  late.flow.change('fullName', 'Ana Maria');
  const q = late.flow.submit();
  late.flow.reset(null);
  late.pending[0].reject(new Error('x'));
  await q;
  assert.equal(late.flow.getState().phase, 'idle');
  assert.equal(late.flow.getState().draft, null);
}

// A live profile change while editing cannot overwrite the draft: start is ignored in edit mode.
{
  const { flow } = makeFlow();
  flow.start('A', profileA);
  flow.change('fullName', 'Ana Maria');
  flow.start('A', { ...profileA, personalData: { fullName: 'Server Name', phone: '3000000006' } });
  assert.equal(flow.getState().draft.fullName, 'Ana Maria');
  assert.equal(flow.getState().baseline.fullName, 'Ana Perez');
}

// subscribe notifies and unsubscribes.
{
  const { flow } = makeFlow();
  let count = 0;
  const off = flow.subscribe(() => {
    count += 1;
  });
  flow.start('A', profileA);
  flow.change('fullName', 'X Y');
  assert.equal(count, 2);
  off();
  flow.cancel();
  assert.equal(count, 2);
}

console.log('profileEditFlow: all tests passed');
