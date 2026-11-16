// AI-assisted: see docs/AI_LOG.md #67
// Live labels (RI-05, RI-15). A Proxy over the dictionary of the active language: every read looks
// the path up at that moment, so code that keeps `const TEXT = labels.auth` stays in the current language.
// A key missing in the active dictionary falls back to the Spanish one, key by key. Leaves (strings,
// arrays, functions) are returned as they are; nodes come back as cached Proxies (stable identity).

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const isNode = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function createLiveLabels({ dictionaries, getLanguage, fallbackLanguage = 'es' }) {
  const cache = new Map();

  const walk = (root, path) => {
    let node = root;
    for (const key of path) {
      if (!isNode(node) || !has(node, key)) return undefined;
      node = node[key];
    }
    return node;
  };

  // The active dictionary first, then Spanish. A node in Spanish wins over a leaf in the active one.
  const pickNodes = (path) => {
    const active = walk(dictionaries[getLanguage()] ?? {}, path);
    const base = walk(dictionaries[fallbackLanguage] ?? {}, path);
    return { active: isNode(active) ? active : undefined, base: isNode(base) ? base : undefined };
  };

  const valueAt = (path) => {
    const active = walk(dictionaries[getLanguage()] ?? {}, path);
    const base = walk(dictionaries[fallbackLanguage] ?? {}, path);
    if (active === undefined) return base;
    if (isNode(base) && !isNode(active)) return base;
    return active;
  };

  const keysAt = (path) => {
    const { active, base } = pickNodes(path);
    const keys = new Set(base ? Object.keys(base) : []);
    if (active) for (const key of Object.keys(active)) keys.add(key);
    return [...keys];
  };

  const nodeAt = (path) => {
    const id = path.join('\u0000');
    let proxy = cache.get(id);
    if (proxy) return proxy;
    const target = {};
    proxy = new Proxy(target, {
      get(_target, prop) {
        if (typeof prop === 'symbol') return Reflect.get(target, prop);
        const value = valueAt([...path, prop]);
        if (value === undefined) return Reflect.get(target, prop);
        return isNode(value) ? nodeAt([...path, prop]) : value;
      },
      has(_target, prop) {
        return typeof prop === 'string' && (keysAt(path).includes(prop) || prop in target);
      },
      ownKeys() {
        return keysAt(path);
      },
      getOwnPropertyDescriptor(_target, prop) {
        if (typeof prop !== 'string' || !keysAt(path).includes(prop)) return undefined;
        const value = valueAt([...path, prop]);
        return {
          value: isNode(value) ? nodeAt([...path, prop]) : value,
          writable: false,
          enumerable: true,
          configurable: true,
        };
      },
      set() {
        return false;
      },
      defineProperty() {
        return false;
      },
      deleteProperty() {
        return false;
      },
    });
    cache.set(id, proxy);
    return proxy;
  };

  return nodeAt([]);
}
