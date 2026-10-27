#!/usr/bin/env node
// Constitution checker. Node ESM, standard modules only.
// Usage: node scripts/check-constitution.mjs [--root DIR] [--phase N] [--json] | --selftest
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKIP_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'web-build', 'android', 'ios', 'coverage', '_tmp']);
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml', '.html', '.txt', '']);
const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx']);
const SELF = 'scripts/check-constitution.mjs';

// ---------- helpers ----------
const rel = (root, f) => path.relative(root, f).split(path.sep).join('/');

function walk(dir, out = []) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.isFile()) out.push(path.join(dir, e.name));
  }
  return out;
}

function buildCtx(root, phase) {
  const files = walk(root).map((abs) => ({ abs, rel: rel(root, abs), ext: path.extname(abs) }));
  const cache = new Map();
  const ctx = {
    root, phase, files,
    read(r) {
      const abs = path.join(root, r);
      if (!cache.has(abs)) { try { cache.set(abs, fs.readFileSync(abs, 'utf8')); } catch { cache.set(abs, null); } }
      return cache.get(abs);
    },
    exists: (r) => fs.existsSync(path.join(root, r)),
    json(r, fallbackName) {
      for (const p of [path.join(root, r), path.join(SCRIPT_DIR, fallbackName || path.basename(r))]) {
        try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { /* try next */ }
      }
      return null;
    },
    // code files under the given prefixes (e.g. src/, backend/)
    code(...prefixes) {
      return files.filter((f) => CODE_EXT.has(f.ext) && prefixes.some((p) => f.rel.startsWith(p)));
    },
  };
  return ctx;
}

// run a regex over each line of a file; returns [{line, match}]
function grepLines(text, re) {
  const hits = [];
  text.split(/\r?\n/).forEach((l, i) => { const m = re.exec(l); if (m) hits.push({ line: i + 1, text: l, match: m }); });
  return hits;
}

function expandIds(text) {
  const ids = new Set();
  const range = /\b(RF|RNF|ENT)-(\d+)\s*(?:a|\.\.|–|—)\s*(?:(?:RF|RNF|ENT)-)?(\d+)/g;
  let m;
  while ((m = range.exec(text))) {
    for (let n = Number(m[2]); n <= Number(m[3]); n++) ids.add(`${m[1]}-${String(n).padStart(2, '0')}`);
  }
  for (const s of text.matchAll(/\b(RF|RNF|ENT)-(\d+)\b/g)) ids.add(`${s[1]}-${s[2].padStart(2, '0')}`);
  return ids;
}

function extractBody(text, startIdx) {
  // skip the parameter list first so a destructured parameter is not mistaken for the body
  let from = startIdx;
  const paren = text.indexOf('(', startIdx);
  if (paren >= 0) {
    let d = 0;
    for (let i = paren; i < text.length; i++) {
      if (text[i] === '(') d++;
      else if (text[i] === ')' && --d === 0) { from = i; break; }
    }
  }
  const open = text.indexOf('{', from);
  if (open < 0) return '';
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(open, i + 1);
  }
  return text.slice(open);
}

const isMoneyFile = (f) => /fare|money|price|pricing|earning|payment|commission|tarifa/i.test(f.rel);
const KEY_RE = /^\s*[A-Za-z_][A-Za-z0-9_]*\s*=\s*(\S.*)$/;

// ---------- rules ----------
const rules = [
  {
    id: 'C01', level: 'ERROR', from: 0, req: 'RNF-05',
    run(ctx) {
      const out = [];
      const secret = /(sk_live_[A-Za-z0-9]{6,}|sk_test_[A-Za-z0-9]{6,}|APP_USR-[A-Za-z0-9-]{6,}|TEST-\d{6,}-|AIza[0-9A-Za-z_-]{20,})/;
      for (const f of ctx.files) {
        if (!TEXT_EXT.has(f.ext) || f.rel === SELF || f.rel.endsWith('.env.example') || f.rel.endsWith('package-lock.json')) continue;
        const text = ctx.read(f.rel);
        if (text == null) continue;
        for (const h of grepLines(text, secret)) out.push({ file: f.rel, line: h.line, msg: `key literal "${h.match[1].slice(0, 8)}…" in versionable file` });
      }
      for (const f of ctx.code('src/')) {
        for (const h of grepLines(ctx.read(f.rel) || '', /process\.env\.[A-Z0-9_]*(SECRET|ACCESS_TOKEN)/)) out.push({ file: f.rel, line: h.line, msg: 'secret env var read inside src/' });
      }
      return out;
    },
  },
  {
    id: 'C02', level: 'ERROR', from: 0, req: 'RNF-05',
    run(ctx) {
      const gi = ctx.read('.gitignore');
      if (gi == null) return [{ file: '.gitignore', line: 1, msg: '.gitignore missing' }];
      const lines = gi.split(/\r?\n/).map((l) => l.trim());
      const out = [];
      if (!lines.includes('.env')) out.push({ file: '.gitignore', line: 1, msg: '.env is not ignored' });
      lines.forEach((l, i) => { if (l === '.env.example' || l === '.env*' && !lines.includes('!.env.example')) out.push({ file: '.gitignore', line: i + 1, msg: '.env.example would be ignored' }); });
      return out;
    },
  },
  {
    id: 'C03', level: 'ERROR', from: 3, req: 'RNF-05',
    run(ctx) {
      const out = [];
      for (const r of ['.env.example', 'backend/.env.example']) {
        const t = ctx.read(r);
        if (t == null) continue;
        t.split(/\r?\n/).forEach((l, i) => { const m = KEY_RE.exec(l); if (m && !l.trim().startsWith('#') && m[1].trim() !== '') out.push({ file: r, line: i + 1, msg: 'value present; only names allowed' }); });
      }
      return out;
    },
  },
  {
    id: 'C04', level: 'ERROR', from: 3, req: 'RNF-04',
    run(ctx) {
      const out = [];
      const re = /AsyncStorage\.(setItem|multiSet|mergeItem)\s*\(\s*[`'"]([^`'"]*)[`'"]/;
      for (const f of ctx.code('src/')) {
        for (const h of grepLines(ctx.read(f.rel) || '', re)) {
          if (/card|tarjeta|cuenta|account|password|clave|token|cvv/i.test(h.match[2])) out.push({ file: f.rel, line: h.line, msg: `AsyncStorage key "${h.match[2]}" looks sensitive` });
        }
      }
      return out;
    },
  },
  {
    id: 'C05', level: 'ERROR', from: 3, req: 'RF-03',
    run(ctx) {
      const out = [];
      for (const f of ctx.code('src/')) {
        if (!/regist|signup|onboarding/i.test(f.rel)) continue;
        for (const h of grepLines(ctx.read(f.rel) || '', /\bAlert\.alert\s*\(/)) out.push({ file: f.rel, line: h.line, msg: 'Alert.alert in registration code' });
      }
      return out;
    },
  },
  {
    id: 'C06', level: 'ERROR', from: 3, req: 'RNF-10',
    run(ctx) {
      const out = [];
      for (const f of ctx.code('src/', 'backend/')) {
        for (const h of grepLines(ctx.read(f.rel) || '', /maps\.googleapis\.com\/maps\/api\/staticmap/i)) out.push({ file: f.rel, line: h.line, msg: 'Static Maps URL' });
      }
      return out;
    },
  },
  {
    id: 'C07', level: 'ERROR', from: 3, req: 'RF-21',
    run(ctx) {
      const out = [];
      const re = /(?<![\d.])(3500|1200|6000)(?!\d)|(?<![\d.])1\.(4|8)(?!\d)/;
      for (const f of ctx.code('src/', 'backend/')) {
        if (f.rel === 'src/config/pricing.js') continue;
        for (const h of grepLines(ctx.read(f.rel) || '', re)) out.push({ file: f.rel, line: h.line, msg: `fare literal "${h.match[0]}" outside src/config/pricing.js` });
      }
      return out;
    },
  },
  {
    id: 'C08', level: 'ERROR', from: 3, req: 'RF-20',
    run(ctx) {
      const out = [];
      const defRe = /(function\s+calculateFare\b|(?:const|let|var)\s+calculateFare\s*=)/g;
      const defs = [];
      let usesFare = false;
      for (const f of ctx.code('src/', 'backend/')) {
        const t = ctx.read(f.rel) || '';
        if (/calculateFare/.test(t)) usesFare = true;
        let m;
        defRe.lastIndex = 0;
        while ((m = defRe.exec(t))) defs.push({ f, t, idx: m.index, line: t.slice(0, m.index).split('\n').length });
      }
      // Absence is only an error once the fare module or a caller exists (so T-01 can pass before the fare spec).
      if (defs.length === 0 && (usesFare || ctx.exists('src/config/pricing.js'))) out.push({ file: 'src/', line: 1, msg: 'calculateFare is not defined' });
      if (defs.length > 1) defs.slice(1).forEach((d) => out.push({ file: d.f.rel, line: d.line, msg: 'calculateFare defined more than once' }));
      for (const d of defs) {
        const body = extractBody(d.t, d.idx);
        if (/\b(Date\.now|new Date|Math\.random|fetch|await|console\.|process\.env)\b/.test(body)) out.push({ file: d.f.rel, line: d.line, msg: 'calculateFare is not pure' });
        if (!(/\bfare\b/.test(body) && /\bcommission\b/.test(body) && /\bdriverEarnings\b/.test(body))) out.push({ file: d.f.rel, line: d.line, msg: 'calculateFare must return {fare, commission, driverEarnings}' });
      }
      return out;
    },
  },
  {
    id: 'C09', level: 'WARN', from: 3, req: 'RF-21',
    run(ctx) {
      const out = [];
      for (const f of ctx.code('src/', 'backend/')) {
        if (!isMoneyFile(f)) continue;
        for (const h of grepLines(ctx.read(f.rel) || '', /\b(toFixed|parseFloat)\s*\(/)) out.push({ file: f.rel, line: h.line, msg: `${h.match[1]} in money file; use integer COP` });
      }
      return out;
    },
  },
  {
    id: 'C10', level: 'ERROR', from: 3, req: 'RNF-08',
    run(ctx) {
      const out = [];
      const re = /distancematrix|computeRouteMatrix|DistanceMatrix/i;
      for (const f of ctx.code('src/', 'backend/')) {
        const t = ctx.read(f.rel) || '';
        const hits = grepLines(t, re);
        if (!hits.length) continue;
        if (!f.rel.startsWith('src/services/')) hits.forEach((h) => out.push({ file: f.rel, line: h.line, msg: 'matrix API outside src/services/' }));
        if (/watchPosition/.test(t)) out.push({ file: f.rel, line: hits[0].line, msg: 'matrix API in the same file as watchPosition' });
      }
      return out;
    },
  },
  {
    id: 'C11', level: 'WARN', from: 3, req: 'RF-09, RNF-02',
    run(ctx) {
      const out = [];
      const pairs = [
        [/\bsetInterval\s*\(/, /clearInterval/, 'setInterval'],
        [/\bsetTimeout\s*\(/, /clearTimeout/, 'setTimeout'],
        [/\bwatchPosition\s*\(/, /clearWatch/, 'watchPosition'],
        [/\bonSnapshot\s*\(/, /unsubscribe|unsub\b|return\s+\(\)\s*=>|return\s+unsub/, 'onSnapshot'],
        [/\baddEventListener\s*\(|\.addListener\s*\(/, /removeEventListener|\.remove\s*\(|removeListener/, 'listener'],
      ];
      for (const f of ctx.code('src/', 'backend/')) {
        const t = ctx.read(f.rel) || '';
        for (const [start, clean, name] of pairs) {
          const h = grepLines(t, start)[0];
          if (h && !clean.test(t)) out.push({ file: f.rel, line: h.line, msg: `${name} without cleanup in the same file` });
        }
      }
      return out;
    },
  },
  {
    id: 'C12', level: 'ERROR', from: 5, req: 'RNF-03',
    run(ctx) {
      const all = ctx.code('src/').map((f) => ctx.read(f.rel) || '').join('\n');
      return ['useDriverLocation', 'useTripRequests', 'useEarnings']
        .filter((n) => !new RegExp(`(function\\s+${n}\\b|(?:const|let)\\s+${n}\\s*=)`).test(all))
        .map((n) => ({ file: 'src/', line: 1, msg: `hook ${n} is missing` }));
    },
  },
  {
    id: 'C13', level: 'ERROR', from: 5, req: 'RNF-02',
    run(ctx) {
      const out = [];
      for (const f of ctx.code('src/')) {
        const t = ctx.read(f.rel) || '';
        if (/earning|ganancia/i.test(f.rel) && !/\buseMemo\b/.test(t)) out.push({ file: f.rel, line: 1, msg: 'earnings code without useMemo' });
        if (/(?:function|const)\s+accept\w*/.test(t) && /(?:function|const)\s+reject\w*/.test(t) && !/\buseCallback\b/.test(t)) out.push({ file: f.rel, line: 1, msg: 'accept/reject without useCallback' });
      }
      return out;
    },
  },
  {
    id: 'C14', level: 'WARN', from: 3, req: 'RF-13',
    run(ctx) {
      const out = [];
      const re = /(['"`])(requested|accepted|driver_arriving|in_progress|completed|paid|cancelled|rejected)\1/;
      for (const f of ctx.code('src/', 'backend/')) {
        if (f.rel === 'src/constants/tripStatus.js') continue;
        for (const h of grepLines(ctx.read(f.rel) || '', re)) out.push({ file: f.rel, line: h.line, msg: `trip status literal ${h.match[0]} outside src/constants/tripStatus.js` });
      }
      return out;
    },
  },
  {
    id: 'C15', level: 'ERROR', from: 3, req: 'MAESTRO',
    run(ctx) {
      const out = [];
      const pkgText = ctx.read('package.json');
      const reg = ctx.json('scripts/dependencies.json');
      if (pkgText == null || !reg) return out;
      let pkg; try { pkg = JSON.parse(pkgText); } catch { return [{ file: 'package.json', line: 1, msg: 'invalid JSON' }]; }
      const decisions = ctx.read('docs/decisiones.md') || '';
      for (const sec of ['dependencies', 'devDependencies']) {
        for (const name of Object.keys(pkg[sec] || {})) {
          const line = (pkgText.split('\n').findIndex((l) => l.includes(`"${name}"`)) + 1) || 1;
          if ((reg.allowed || []).includes(name)) continue;
          if ((reg.proposed || []).includes(name)) {
            // A dependency counts as approved only if a Vigente decision mentions it.
            const approved = decisions.split(/^### /m).some((b) => /· Vigente/.test(b.split('\n')[0]) && b.includes(name));
            if (!approved) out.push({ file: 'package.json', line, level: 'WARN', msg: `${name} is only proposed; no Vigente decision` });
          } else out.push({ file: 'package.json', line, msg: `${name} is not in scripts/dependencies.json (allowed)` });
        }
      }
      return out;
    },
  },
  {
    id: 'C16', level: 'WARN', from: 3, req: 'RNF-12',
    run(ctx) {
      const t = ctx.read('package.json');
      if (t == null) return [];
      const out = [];
      if (!t.includes('"expo-dev-client"')) out.push({ file: 'package.json', line: 1, msg: 'expo-dev-client missing (development build)' });
      t.split('\n').forEach((l, i) => { if (/--go\b/.test(l)) out.push({ file: 'package.json', line: i + 1, msg: 'script uses --go (Expo Go)' }); });
      return out;
    },
  },
  {
    id: 'C17', level: 'ERROR', from: 3, req: 'MAESTRO',
    run(ctx) {
      const out = [];
      const removed = ctx.json('scripts/removed-apis.json') || [];
      const codeFiles = ctx.code('src/', 'backend/');
      for (const f of codeFiles) {
        const t = ctx.read(f.rel) || '';
        for (const r of removed) for (const h of grepLines(t, new RegExp(r.pattern))) out.push({ file: f.rel, line: h.line, msg: r.message });
      }
      // Named imports of react-native must exist in the installed type declarations, when available.
      const typeDirs = ['types', 'types_generated'].map((d) => path.join(ctx.root, 'node_modules', 'react-native', d)).filter((d) => fs.existsSync(d));
      if (typeDirs.length) {
        let decl = '';
        for (const d of typeDirs) for (const f of walk(d)) if (f.endsWith('.d.ts')) { try { decl += fs.readFileSync(f, 'utf8'); } catch { /* skip */ } }
        for (const f of codeFiles) {
          const t = ctx.read(f.rel) || '';
          for (const m of t.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/g)) {
            const line = t.slice(0, m.index).split('\n').length;
            for (const raw of m[1].split(',')) {
              const name = raw.trim().split(/\s+as\s+/)[0];
              if (name && !new RegExp(`\\b${name}\\b`).test(decl)) out.push({ file: f.rel, line, level: 'WARN', msg: `react-native import "${name}" not found in installed types` });
            }
          }
        }
      }
      return out;
    },
  },
  {
    id: 'C18', level: 'ERROR', from: 3, req: 'ENT-04',
    run(ctx) {
      const out = [];
      const log = ctx.read('docs/AI_LOG.md') || '';
      const have = new Set([...log.matchAll(/^###\s+Entrada\s+#(\d+)/gm)].map((m) => m[1]));
      const scan = ctx.files.filter((f) => CODE_EXT.has(f.ext) && f.rel !== SELF && !f.rel.startsWith('scripts/') && !f.rel.startsWith('docs/'));
      for (const f of scan) {
        for (const h of grepLines(ctx.read(f.rel) || '', /AI-assisted:?\s*see\s+docs\/AI_LOG\.md\s+#(\d+)/)) {
          if (!have.has(h.match[1])) out.push({ file: f.rel, line: h.line, msg: `AI mark #${h.match[1]} has no entry in docs/AI_LOG.md` });
        }
      }
      return out;
    },
  },
  {
    id: 'C19', level: 'ERROR', from: 5, req: 'ENT-02, ENT-03',
    run(ctx) {
      const out = [];
      const readme = ctx.read('README.md');
      if (readme == null) out.push({ file: 'README.md', line: 1, msg: 'README missing' });
      else if (!/^#+\s*Uso de IA/m.test(readme) || !/docs\/AI_LOG\.md/.test(readme)) out.push({ file: 'README.md', line: 1, msg: 'README lacks a "Uso de IA" section linking docs/AI_LOG.md' });
      const log = ctx.read('docs/AI_LOG.md');
      if (log == null || !/^###\s+Entrada\s+#\d+/m.test(log)) out.push({ file: 'docs/AI_LOG.md', line: 1, msg: 'AI log has no entries' });
      return out;
    },
  },
  {
    id: 'C20', level: 'ERROR', from: 5, req: 'ENT-02',
    run(ctx) {
      const t = ctx.read('README.md');
      return t == null ? [] : grepLines(t, /PENDIENTE|\bTODO\b|\[por definir\]/).map((h) => ({ file: 'README.md', line: h.line, msg: `placeholder "${h.match[0]}" in README` }));
    },
  },
  {
    id: 'C21', level: 'ERROR', from: 2, req: 'MAESTRO',
    run(ctx) {
      const req = ctx.read('docs/requisitos.md');
      if (req == null) return [];
      const covered = new Set();
      for (const t of parseTasks(ctx)) for (const id of t.ids) covered.add(id);
      const out = [];
      req.split(/\r?\n/).forEach((l, i) => {
        const m = /^\|\s*((?:RF|RNF|ENT)-\d+)\s*\|/.exec(l);
        if (m && !/\(Opcional/i.test(l) && !covered.has(m[1])) out.push({ file: 'docs/requisitos.md', line: i + 1, msg: `${m[1]} has no task` });
      });
      return out;
    },
  },
  {
    id: 'C22', level: 'ERROR', from: 2, req: 'MAESTRO',
    run(ctx) {
      const req = ctx.read('docs/requisitos.md');
      if (req == null) return [];
      const known = new Set([...req.matchAll(/^\|\s*((?:RF|RNF|ENT)-\d+)\s*\|/gm)].map((m) => m[1]));
      const out = [];
      for (const t of parseTasks(ctx)) {
        if (t.ids.size === 0) out.push({ file: 'docs/backlog.md', line: t.line, msg: `${t.id} has no requirement` });
        for (const id of t.ids) if (!known.has(id)) out.push({ file: 'docs/backlog.md', line: t.line, msg: `${t.id} cites unknown ${id}` });
      }
      return out;
    },
  },
  {
    id: 'C23', level: 'WARN', from: 3, req: 'MAESTRO',
    run(ctx) {
      const out = [];
      const progress = ctx.read('docs/progress.md') || '';
      for (const f of ctx.files.filter((x) => /^specs\/[^/]+\/spec\.md$/.test(x.rel))) {
        const plan = ctx.read(f.rel.replace('spec.md', 'plan.md')) || '';
        const t = ctx.read(f.rel) || '';
        const seen = new Set();
        for (const h of grepLines(t, /\bCA-\d{3}-[A-Z0-9]+\b/)) {
          const id = h.match[0];
          if (seen.has(id)) continue;
          seen.add(id);
          if (!progress.includes(id)) out.push({ file: f.rel, line: h.line, msg: `${id} has no row in docs/progress.md` });
          if (!plan.includes(id)) out.push({ file: f.rel, line: h.line, msg: `${id} is not mapped in plan.md` });
        }
      }
      return out;
    },
  },
  {
    id: 'C24', level: 'ERROR', from: 3, req: 'RF-16',
    run(ctx) {
      const out = [];
      for (const f of ctx.code('backend/')) {
        const t = ctx.read(f.rel) || '';
        if (!/preference|paymentIntent|payment_intent/i.test(t)) continue;
        const re = /req\.body\.(amount|monto|fare|total)\b|\{[^}]*\b(amount|monto|fare|total)\b[^}]*\}\s*=\s*req\.body/;
        for (const h of grepLines(t, re)) out.push({ file: f.rel, line: h.line, msg: 'payment amount read from the client body' });
      }
      return out;
    },
  },
  {
    id: 'C25', level: 'ERROR', from: 4, req: 'RNF-13',
    run(ctx) {
      const t = ctx.read('docs/progress.md');
      if (t == null) return [];
      const out = [];
      t.split(/\r?\n/).forEach((l, i) => {
        if (!/^\|\s*CA-/.test(l) || !l.includes('✅') || !/dispositivo|celular|device/i.test(l)) return;
        const cells = l.split('|').map((c) => c.trim());
        const evidence = cells[3] || '';
        if ((evidence === '' || evidence === '—' || evidence === '-') && !/\d{4}-\d{2}-\d{2}/.test(l)) out.push({ file: 'docs/progress.md', line: i + 1, msg: 'device CA marked ✅ without evidence or date' });
      });
      return out;
    },
  },
  {
    id: 'C26', level: 'WARN', from: 0, req: 'MAESTRO',
    run(ctx) {
      const out = [];
      const re = /(\/\/|\/\*|^\s*\*)[^\n]*(specs\/|docs\/(?!AI_LOG)|\bD-\d+\b|constituci[oó]n)/i;
      for (const f of ctx.code('src/', 'backend/')) {
        for (const h of grepLines(ctx.read(f.rel) || '', re)) out.push({ file: f.rel, line: h.line, msg: 'comment cites a document that is not delivered' });
      }
      return out;
    },
  },
  {
    id: 'C27', level: 'WARN', from: 3, req: 'RNF-05',
    run(ctx) {
      const out = [];
      for (const f of ctx.code('src/', 'backend/')) {
        for (const h of grepLines(ctx.read(f.rel) || '', /console\.log\s*\([^)]*(token|password|clave|secret)/i)) out.push({ file: f.rel, line: h.line, msg: 'console.log with sensitive name' });
      }
      return out;
    },
  },
];

function parseTasks(ctx) {
  const t = ctx.read('docs/backlog.md');
  if (t == null) return [];
  const lines = t.split(/\r?\n/);
  const tasks = [];
  let cur = null;
  lines.forEach((l, i) => {
    const h = /^#{2,4}\s+(T-\d+)/.exec(l);
    if (h) { cur = { id: h[1], line: i + 1, ids: new Set() }; tasks.push(cur); return; }
    if (/^#{1,4}\s/.test(l)) { cur = null; return; }
    if (cur) { const r = /Requisitos\W*:\s*(.*)/i.exec(l); if (r) for (const id of expandIds(r[1])) cur.ids.add(id); }
  });
  return tasks;
}

// ---------- runner ----------
export function runChecks(root, phaseOverride) {
  let phase = phaseOverride;
  if (phase == null) {
    const p = fs.existsSync(path.join(root, 'docs/progress.md')) ? fs.readFileSync(path.join(root, 'docs/progress.md'), 'utf8') : '';
    const m = /Fase actual:\s*(\d+)/.exec(p);
    phase = m ? Number(m[1]) : 0;
  }
  const ctx = buildCtx(root, phase);
  const findings = [];
  for (const r of rules) {
    if (r.from > phase) { findings.push({ id: r.id, level: 'INFO', file: '-', line: 0, msg: `inactiva (desde fase ${r.from})`, req: r.req }); continue; }
    for (const f of r.run(ctx)) findings.push({ id: r.id, level: f.level || r.level, file: f.file, line: f.line, msg: f.msg, req: r.req });
  }
  return { phase, findings };
}

const fmt = (f) => `${f.id} ${f.level} ${f.file}:${f.line} ${f.msg} (${f.req})`;

// ---------- selftest ----------
function put(root, r, content) { const p = path.join(root, r); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); }

function makeGood(root) {
  put(root, '.gitignore', 'node_modules/\n.env\n.env.*\n!.env.example\n');
  put(root, 'package.json', JSON.stringify({ name: 'fx', dependencies: { expo: '1', react: '1', 'react-native': '1', 'expo-dev-client': '1' }, scripts: { start: 'expo start' } }, null, 2));
  put(root, '.env.example', 'API_URL=\n');
  put(root, 'backend/.env.example', 'MP_ACCESS_TOKEN=\n');
  put(root, 'src/config/pricing.js', "export const PRICING = { base: 3500, perKm: 1200, perMinute: 250, minimum: 6000, multipliers: { economy: 1.0, xl: 1.4, premium: 1.8 }, commissionRate: 0.2 };\n");
  put(root, 'src/utils/fare.js', [
    "import { PRICING } from '../config/pricing';",
    '// AI-assisted: see docs/AI_LOG.md #1',
    'export function calculateFare({ distanceKm, durationMin, category, tip }) {',
    '  const raw = (PRICING.base + distanceKm * PRICING.perKm + durationMin * PRICING.perMinute) * PRICING.multipliers[category];',
    '  const fare = Math.max(Math.round(raw / 100) * 100, PRICING.minimum);',
    '  const commission = Math.round(fare * PRICING.commissionRate);',
    '  return { fare, commission, driverEarnings: fare - commission + (tip || 0) };',
    '}', ''].join('\n'));
  put(root, 'src/constants/tripStatus.js', "export const TRIP_STATUS = { REQUESTED: 'requested', ACCEPTED: 'accepted', PAID: 'paid', REJECTED: 'rejected' };\n");
  put(root, 'src/hooks/useDriverLocation.js', [
    "import { useEffect, useState } from 'react';",
    'export function useDriverLocation(enabled) {',
    '  const [location, setLocation] = useState(null);',
    '  useEffect(() => {',
    '    if (!enabled) return undefined;',
    '    const id = navigator.geolocation.watchPosition(setLocation);',
    '    return () => navigator.geolocation.clearWatch(id);',
    '  }, [enabled]);',
    '  return location;',
    '}', ''].join('\n'));
  put(root, 'src/hooks/useTripRequests.js', [
    "import { useCallback, useEffect, useState } from 'react';",
    'export function useTripRequests(listen) {',
    '  const [requests, setRequests] = useState([]);',
    '  useEffect(() => {',
    '    const unsubscribe = listen(setRequests);',
    '    return () => unsubscribe();',
    '  }, [listen]);',
    '  const accept = useCallback((id) => id, []);',
    '  const reject = useCallback((id) => id, []);',
    '  return { requests, accept, reject };',
    '}', ''].join('\n'));
  put(root, 'src/hooks/useEarnings.js', "import { useMemo } from 'react';\nexport function useEarnings(trips) {\n  return useMemo(() => trips.reduce((s, t) => s + t.driverEarnings, 0), [trips]);\n}\n");
  put(root, 'src/services/distance.js', "export const DISTANCE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';\n");
  put(root, 'src/screens/Register.js', 'export const Register = () => null;\n');
  put(root, 'src/store/prefs.js', "import AsyncStorage from '@react-native-async-storage/async-storage';\nexport const saveLanguage = (v) => AsyncStorage.setItem('language', v);\n");
  put(root, 'backend/server.js', "const { tripId } = req.body;\nconst preference = createPreference(tripId);\nconst token = process.env.MP_ACCESS_TOKEN;\n");
  put(root, 'docs/requisitos.md', '| RF-01 | Registro | F1 §2 |\n| RNF-01 | RN + Expo | F1 §1 |\n| RF-19 | (Opcional) Pago dividido | F1 §4 |\n');
  put(root, 'docs/backlog.md', '### T-01 Primera pantalla\n- Requisitos: RF-01, RNF-01\n');
  put(root, 'specs/001-x/spec.md', 'CA-001-01 Dado…\n');
  put(root, 'specs/001-x/plan.md', 'CA-001-01 -> src/screens/Register.js\n');
  put(root, 'docs/progress.md', 'Fase actual: 5\n\n| CA | Resultado | Evidencia |\n|---|---|---|\n| CA-001-01 | ✅ | prueba automática |\n');
  put(root, 'docs/AI_LOG.md', '### Entrada #1\n- Fecha: 2026-01-01\n');
  put(root, 'README.md', '# Fx\n\n## Uso de IA\nVer [bitácora](docs/AI_LOG.md).\n');
}

const mutations = {
  C01: (r) => put(r, 'src/leak.js', "const k = 'sk_live_abcdefgh12345678';\n"),
  C02: (r) => put(r, '.gitignore', 'node_modules/\n'),
  C03: (r) => put(r, '.env.example', 'API_URL=abc123\n'),
  C04: (r) => put(r, 'src/store/prefs.js', "AsyncStorage.setItem('card', x);\n"),
  C05: (r) => put(r, 'src/screens/Register.js', "export const Register = () => { Alert.alert('x'); return null; };\n"),
  C06: (r) => put(r, 'src/maps.js', "export const u = 'https://maps.googleapis.com/maps/api/staticmap?size=1x1';\n"),
  C07: (r) => put(r, 'src/utils/x.js', 'export const a = 3500;\n'),
  C08: (r) => put(r, 'src/utils/fare2.js', 'export function calculateFare() { return { fare: 0, commission: 0, driverEarnings: 0 }; }\n'),
  C09: (r) => put(r, 'src/utils/fareFormat.js', 'export const f = (x) => x.toFixed(2);\n'),
  C10: (r) => put(r, 'src/utils/matrix.js', "export const u = 'https://maps.googleapis.com/maps/api/distancematrix/json';\n"),
  C11: (r) => put(r, 'src/utils/timer.js', 'setInterval(() => {}, 1000);\n'),
  C12: (r) => fs.rmSync(path.join(r, 'src/hooks/useEarnings.js')),
  C13: (r) => put(r, 'src/hooks/useEarnings.js', 'export function useEarnings(trips) {\n  return trips.length;\n}\n'),
  C14: (r) => put(r, 'src/utils/status.js', "export const s = 'completed';\n"),
  C15: (r) => put(r, 'package.json', JSON.stringify({ dependencies: { expo: '1', react: '1', 'react-native': '1', 'expo-dev-client': '1', 'left-pad': '1' } })),
  C16: (r) => put(r, 'package.json', JSON.stringify({ dependencies: { expo: '1', react: '1', 'react-native': '1' } })),
  C17: (r) => put(r, 'src/utils/abs.js', 'export const s = StyleSheet.absoluteFillObject;\n'),
  C18: (r) => put(r, 'src/utils/ai.js', '// AI-assisted: see docs/AI_LOG.md #7\nexport const a = 1;\n'),
  C19: (r) => put(r, 'README.md', '# Fx\n'),
  C20: (r) => put(r, 'README.md', '# Fx\n\n## Uso de IA\nVer [bitácora](docs/AI_LOG.md).\n\nPENDIENTE\n'),
  C21: (r) => fs.appendFileSync(path.join(r, 'docs/requisitos.md'), '| RF-02 | Otro | F1 §2 |\n'),
  C22: (r) => fs.appendFileSync(path.join(r, 'docs/backlog.md'), '### T-02 Otra\n- Requisitos: RF-99\n'),
  C23: (r) => fs.appendFileSync(path.join(r, 'specs/001-x/spec.md'), 'CA-001-02 Dado…\n'),
  C24: (r) => fs.appendFileSync(path.join(r, 'backend/server.js'), 'const total = req.body.total;\n'),
  C25: (r) => put(r, 'docs/progress.md', 'Fase actual: 5\n\n| CA | Resultado | Evidencia |\n|---|---|---|\n| CA-001-01 | ✅ en el celular | — |\n'),
  C26: (r) => put(r, 'src/utils/note.js', '// see specs/001 and D-05\nexport const n = 1;\n'),
  C27: (r) => put(r, 'src/utils/log.js', "console.log('token', token);\n"),
};

function selftest() {
  let failures = 0;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-selftest-'));
  const active = (res) => res.findings.filter((f) => f.level !== 'INFO');
  try {
    const good = path.join(tmp, 'good');
    makeGood(good);
    const g = active(runChecks(good, 5));
    if (g.length) { failures++; console.log('FAIL good project:'); g.forEach((f) => console.log('  ' + fmt(f))); } else console.log('OK   good project: 0 errors, 0 warnings');
    for (const r of rules) {
      const dir = path.join(tmp, r.id);
      makeGood(dir);
      mutations[r.id](dir);
      const codes = [...new Set(active(runChecks(dir, 5)).map((f) => f.id))];
      const pass = codes.length === 1 && codes[0] === r.id;
      if (!pass) failures++;
      console.log(`${pass ? 'OK  ' : 'FAIL'} ${r.id} -> ${codes.join(',') || '(nothing)'}`);
    }
    // phase gating: with phase 0 the injected C07 violation must be inactive
    const gate = path.join(tmp, 'gate');
    makeGood(gate); mutations.C07(gate);
    const gr = runChecks(gate, 0);
    const gateOk = !active(gr).some((f) => f.id === 'C07') && gr.findings.some((f) => f.id === 'C07' && f.level === 'INFO');
    if (!gateOk) failures++;
    console.log(`${gateOk ? 'OK  ' : 'FAIL'} phase gating (C07 inactive in phase 0)`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? `\nselftest: ${failures} failure(s)` : '\nselftest: all passed');
  return failures ? 1 : 0;
}

// ---------- main ----------
const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
if (argv.includes('--selftest')) process.exit(selftest());
const root = path.resolve(arg('--root') || path.join(SCRIPT_DIR, '..'));
const { phase, findings } = runChecks(root, arg('--phase') != null ? Number(arg('--phase')) : undefined);
if (argv.includes('--json')) console.log(JSON.stringify({ phase, findings }, null, 2));
else {
  console.log(`Fase actual: ${phase}`);
  for (const f of findings) console.log(fmt(f));
  const e = findings.filter((f) => f.level === 'ERROR').length;
  const w = findings.filter((f) => f.level === 'WARN').length;
  const i = findings.filter((f) => f.level === 'INFO').length;
  console.log(`\n${e} error(es), ${w} advertencia(s), ${i} regla(s) inactiva(s)`);
}
process.exit(findings.some((f) => f.level === 'ERROR') ? 1 : 0);
