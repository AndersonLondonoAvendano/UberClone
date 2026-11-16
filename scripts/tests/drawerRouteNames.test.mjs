// AI-assisted: see docs/AI_LOG.md #64
// Drawer home renamed to MainHome (S5, N-01). Pure presentation decision plus a static check that the
// drawer and the trip stack never register the same screen name.
//   node scripts/tests/drawerRouteNames.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import './helpers/registerSrcLoader.mjs';

const { HOME_ROUTE, PRESENTATION, decideRequestPresentation } = await import('../../src/services/trip/requestPresentation.js');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (file) => readFileSync(join(ROOT, file), 'utf8');

// decideRequestPresentation(currentRoute, onTrip, accountStatus, hasRequest, requestScreenOpen)
assert.equal(HOME_ROUTE, 'MainHome');
assert.equal(decideRequestPresentation(HOME_ROUTE, false, 'approved', true), PRESENTATION.FULLSCREEN);
assert.equal(decideRequestPresentation('Profile', false, 'approved', true), PRESENTATION.CARD);
// The trip stack's own 'Home' is no longer the drawer's home: it is just another route name (card).
assert.equal(decideRequestPresentation('Home', false, 'approved', true), PRESENTATION.CARD);
// Unchanged rules: no request, on a trip, unapproved, request screen open, unknown route.
assert.equal(decideRequestPresentation(HOME_ROUTE, false, 'approved', false), PRESENTATION.NONE);
assert.equal(decideRequestPresentation(HOME_ROUTE, true, 'approved', true), PRESENTATION.NONE);
assert.equal(decideRequestPresentation(HOME_ROUTE, false, 'pending', true), PRESENTATION.NONE);
assert.equal(decideRequestPresentation(HOME_ROUTE, false, 'approved', true, true), PRESENTATION.NONE);
assert.equal(decideRequestPresentation(null, false, 'approved', true), PRESENTATION.NONE);
// The route must not start with the trip prefix, or it would be ignored.
assert.ok(!HOME_ROUTE.startsWith('Trip'));

// Static: screen names of the drawer and the trip stack do not repeat.
const names = (source, tag) => {
  const found = [];
  const pattern = /<(Drawer|Stack)[.]Screen\s+name=(?:"([^"]+)"|[{]([A-Za-z_]+)[}])/g;
  for (const m of source.matchAll(pattern)) {
    if (m[1] !== tag) continue;
    found.push(m[2] ?? (m[3] === 'HOME_ROUTE' ? HOME_ROUTE : `{${m[3]}}`));
  }
  return found;
};
const drawerSource = read('src/navigation/MainDrawer.js');
const drawerNames = names(drawerSource, 'Drawer');
const stackNames = names(read('src/navigation/TripStack.js'), 'Stack');
assert.ok(drawerNames.length >= 5 && stackNames.length >= 3, `screens were found: ${drawerNames} / ${stackNames}`);
assert.ok(drawerNames.includes(HOME_ROUTE), 'the drawer registers the home route');
assert.ok(stackNames.includes('Home'), 'the stack keeps Home (popTo("Home") resolves against it)');
assert.deepEqual(
  drawerNames.filter((name) => stackNames.includes(name)),
  [],
  'drawer and stack screen names must not repeat',
);
assert.equal(new Set(drawerNames).size, drawerNames.length, 'drawer names are unique');
// The drawer starts on the constant, not on a string literal.
assert.match(drawerSource, /initialRouteName=\{HOME_ROUTE\}/);
assert.doesNotMatch(drawerSource, /name="Home"/);

console.log('drawerRouteNames: ok');
