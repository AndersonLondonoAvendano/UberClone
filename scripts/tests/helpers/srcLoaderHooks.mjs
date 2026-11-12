// AI-assisted: see docs/AI_LOG.md #55
// Node module hooks for the pure tests: the app source uses extensionless imports (Metro) and
// imports Firebase, so this resolves "./x" to "./x.js" and replaces the Firebase modules with
// stubs that record calls in globalThis.__fsCalls. Test-only; nothing here ships in the app.
const FIRESTORE_STUB = `
const calls = (globalThis.__fsCalls ??= []);
export const doc = (...args) => ({ path: args.slice(1).join('/') });
export const getDoc = async () => ({ exists: () => false });
export const setDoc = async (ref, data) => { calls.push({ op: 'setDoc', path: ref.path, data }); };
export const updateDoc = async (ref, data) => { calls.push({ op: 'updateDoc', path: ref.path, data }); };
export const serverTimestamp = () => 'SERVER_TIMESTAMP';
export const collection = (...args) => ({ path: args.slice(1).join('/') });
export const query = (...args) => args[0];
export const orderBy = () => null;
export const limit = () => null;
export const onSnapshot = () => () => {};
`;
const FIREBASE_STUB = 'export const db = {}; export const auth = {};';
const asModule = (source) => ({ url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true });

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'firebase/firestore') return asModule(FIRESTORE_STUB);
  if (/^\.{1,2}\/(?:.*\/)?firebase$/.test(specifier)) return asModule(FIREBASE_STUB);
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && (error?.code === 'ERR_MODULE_NOT_FOUND' || error?.code === 'ERR_UNSUPPORTED_DIR_IMPORT')) {
      try {
        return await nextResolve(`${specifier}.js`, context);
      } catch {
        return nextResolve(`${specifier}/index.js`, context);
      }
    }
    throw error;
  }
}
