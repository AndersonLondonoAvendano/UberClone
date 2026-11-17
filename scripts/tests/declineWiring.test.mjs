// AI-assisted: see docs/AI_LOG.md #66
// T-229: manual rejection and every expiry go through the same declineRequest path (source checks, because the
// components cannot run in Node).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const card = read('src/components/IncomingRequestCard.js');
const screen = read('src/screens/trip/TripRequestScreen.js');
const mock = read('src/services/passengerApi/mockPassengerApi.js');
const wired = read('src/services/trip/declineRequestApp.js');

for (const [name, source] of [['IncomingRequestCard', card], ['TripRequestScreen', screen]]) {
  test(`${name} imports the wired declineRequest and never calls rejectRequest directly`, () => {
    assert.match(source, /declineRequestApp/);
    assert.doesNotMatch(source, /\brejectRequest\b/);
  });
  test(`${name} marks an accepted request so a later expiry is ignored`, () => {
    assert.match(source, /markRequestAccepted\(request\.id\)/);
  });
  test(`${name} uses both reasons`, () => {
    assert.match(source, /DECLINE_REASON\.REJECTED/);
    assert.match(source, /DECLINE_REASON\.EXPIRED/);
  });
}

test('the mock passenger API has no write path (an unseen request must write nothing, CA-005-14)', () => {
  assert.doesNotMatch(mock, /saveTrip|tripRepository|declineRequest/);
});

test('the wired module binds the real save and the passenger API release', () => {
  assert.match(wired, /save: saveTrip/);
  assert.match(wired, /reject: rejectRequest/);
});
