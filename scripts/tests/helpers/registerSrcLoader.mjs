// AI-assisted: see docs/AI_LOG.md #55
// Import this first in a test, then import the src modules dynamically.
import { register } from 'node:module';
register('./srcLoaderHooks.mjs', import.meta.url);
