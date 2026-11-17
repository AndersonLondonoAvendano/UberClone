// AI-assisted: see AI_LOG.md #67
// Subscribes a component to the active language (RI-15). Re-renders when the language changes.
import { useSyncExternalStore } from 'react';
import { getLanguage, subscribe } from './languageStore';

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getLanguage, getLanguage);
  return { language };
}
