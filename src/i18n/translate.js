// AI-assisted: see AI_LOG.md #67
// t(key, params, language) (RI-02, RI-03, RI-04). Looks a dotted key up in the language dictionary, falls
// back to Spanish, then to the key itself. {name} placeholders take params; a missing param becomes an
// empty string. A plural entry is { one, other } chosen by params.n (1 = one; 0, 2, 10 = other).
// It never throws and never returns undefined. Warnings only appear in development.
import { es } from './dictionaries/es';
import { en } from './dictionaries/en';
import { getLanguage } from './languageStore';

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const defaultWarn = (message) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn(`[i18n] ${message}`);
};

function lookup(dictionary, key) {
  let node = dictionary;
  for (const part of String(key).split('.')) {
    if (node === null || typeof node !== 'object' || !has(node, part)) return undefined;
    node = node[part];
  }
  return node;
}

const isPlural = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && typeof value.other === 'string';

const isText = (value) => typeof value === 'string' || isPlural(value);

export function createTranslator({ dictionaries, getLanguage: getActive, warn = defaultWarn }) {
  return function t(key, params, language) {
    try {
      const active = language ?? getActive();
      let entry = lookup(dictionaries[active] ?? {}, key);
      if (!isText(entry)) entry = lookup(dictionaries.es ?? {}, key);
      if (!isText(entry)) {
        warn(`missing key "${key}"`);
        return String(key);
      }
      let text = entry;
      if (isPlural(entry)) {
        const n = Number(params?.n);
        text = n === 1 && typeof entry.one === 'string' ? entry.one : entry.other;
      }
      return text.replace(/\{(\w+)\}/g, (_match, name) => {
        const value = params?.[name];
        if (value === undefined || value === null) {
          warn(`missing param "${name}" for "${key}"`);
          return '';
        }
        return String(value);
      });
    } catch {
      return String(key);
    }
  };
}

export const t = createTranslator({ dictionaries: { es, en }, getLanguage });
