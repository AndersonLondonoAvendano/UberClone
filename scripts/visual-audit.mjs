#!/usr/bin/env node
// Visual audit harness (Playwright + Chromium).
// Usage: node scripts/visual-audit.mjs --url <URL|file> --out docs/diseno/auditorias/capturas/_tmp
//        node scripts/visual-audit.mjs --selftest
// LIMIT: this renders a web page only. It does NOT render native modules
// (maps, Firebase, geolocation, payments); those are judged on the real phone only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const VIEWPORTS = [{ w: 360, h: 800 }, { w: 390, h: 844 }];
const MIN_TOUCH = 44;

// Resolve playwright from the project, NODE_PATH and the global npm root (Windows lesson).
async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* try next */ }
  const roots = [];
  try { roots.push(execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()); } catch { /* no npm */ }
  for (const p of (process.env.NODE_PATH || '').split(path.delimiter)) if (p) roots.push(p);
  for (const r of roots) {
    try { return createRequire(path.join(r, 'noop.js'))('playwright'); } catch { /* try next */ }
  }
  return null;
}

async function auditPage(browser, url, outDir) {
  const result = { url, viewports: [], issues: [] };
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const consoleErrors = [];
    const requests = new Map();
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(String(e.message || e)));
    page.on('request', (r) => { const k = `${r.method()} ${r.url()}`; requests.set(k, (requests.get(k) || 0) + 1); });
    await page.goto(url, { waitUntil: 'networkidle' });
    const shot = path.join(outDir, `capture-${vp.w}x${vp.h}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const m = await page.evaluate((min) => {
      const sel = 'a,button,input,select,textarea,[role="button"],[onclick]';
      const small = [...document.querySelectorAll(sel)].map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < min || r.height < min))
        .map(({ el, r }) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} ${Math.round(r.width)}x${Math.round(r.height)}`);
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
      return { small, broken, overflow: document.documentElement.scrollWidth > window.innerWidth };
    }, MIN_TOUCH);
    const dups = [...requests].filter(([, n]) => n > 1).map(([k, n]) => `${k} x${n}`);
    const tag = `${vp.w}x${vp.h}`;
    if (m.small.length) result.issues.push({ type: 'touch-target', vp: tag, detail: m.small.join('; ') });
    if (m.overflow) result.issues.push({ type: 'horizontal-overflow', vp: tag, detail: 'scrollWidth > viewport width' });
    if (m.broken.length) result.issues.push({ type: 'broken-image', vp: tag, detail: m.broken.join('; ') });
    if (consoleErrors.length) result.issues.push({ type: 'console-error', vp: tag, detail: consoleErrors.join(' | ') });
    if (dups.length) result.issues.push({ type: 'duplicate-request', vp: tag, detail: dups.join('; ') });
    result.viewports.push({ vp: tag, shot });
    await page.close();
  }
  return result;
}

function writeReport(result, outDir) {
  const lines = ['# Informe del arnés visual', '', `URL: ${result.url}`, '',
    '> Límite: el arnés no renderiza módulos nativos (mapas, Firebase, geolocalización, pagos). Esto NO es una captura del celular.', '',
    '## Capturas', ...result.viewports.map((v) => `- ${v.vp}: ${path.basename(v.shot)}`), '', '## Hallazgos'];
  if (!result.issues.length) lines.push('Sin hallazgos automáticos.');
  for (const i of result.issues) lines.push(`- [${i.type}] ${i.vp}: ${i.detail}`);
  fs.writeFileSync(path.join(outDir, 'report.md'), lines.join('\n') + '\n');
}

const GOOD = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>ok</title>
<body style="margin:0"><button style="width:200px;height:48px">Aceptar</button>
<script>fetch('/ping')</script></body>`;
const BAD = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>bad</title>
<body style="margin:0"><button id="tiny" style="width:20px;height:20px">x</button>
<div style="width:2000px;height:10px;background:#ccc"></div>
<img src="/missing.png" width="10" height="10">
<script>console.error('boom'); fetch('/ping'); fetch('/ping')</script></body>`;

async function selftest(pw) {
  if (!pw) { console.log('[por instalar] playwright no está disponible; selftest omitido (npm i -g playwright && npx playwright install chromium)'); return 0; }
  const server = http.createServer((req, res) => {
    if (req.url === '/good') { res.setHeader('content-type', 'text/html'); res.end(GOOD); }
    else if (req.url === '/bad') { res.setHeader('content-type', 'text/html'); res.end(BAD); }
    else if (req.url.startsWith('/ping') || req.url === '/favicon.ico') { res.statusCode = 200; res.end('ok'); }
    else { res.statusCode = 404; res.end('no'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'va-selftest-'));
  let failures = 0;
  let browser;
  try {
    browser = await (pw.chromium || pw.default.chromium).launch();
    const good = await auditPage(browser, `${base}/good`, tmp);
    const bad = await auditPage(browser, `${base}/bad`, tmp);
    const goodOk = good.issues.length === 0;
    if (!goodOk) failures++;
    console.log(`${goodOk ? 'OK  ' : 'FAIL'} good page: ${good.issues.length} issue(s)`);
    for (const type of ['touch-target', 'horizontal-overflow', 'broken-image', 'console-error', 'duplicate-request']) {
      const found = bad.issues.some((i) => i.type === type);
      if (!found) failures++;
      console.log(`${found ? 'OK  ' : 'FAIL'} bad page detects ${type}`);
    }
  } catch (e) {
    failures++;
    console.log('FAIL selftest error: ' + e.message);
  } finally {
    if (browser) await browser.close();
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? `\nselftest: ${failures} failure(s)` : '\nselftest: all passed');
  return failures ? 1 : 0;
}

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const pw = await loadPlaywright();
if (argv.includes('--selftest')) process.exit(await selftest(pw));

const target = arg('--url');
const out = path.resolve(arg('--out') || 'docs/diseno/auditorias/capturas/_tmp');
if (!target) { console.error('Uso: node scripts/visual-audit.mjs --url <URL|archivo> --out <carpeta> | --selftest'); process.exit(2); }
if (!pw) { console.error('[por instalar] playwright: npm i -g playwright && npx playwright install chromium'); process.exit(2); }
const url = /^[a-z]+:\/\//i.test(target) ? target : pathToFileURL(path.resolve(target)).href;
fs.mkdirSync(out, { recursive: true });
const browser = await (pw.chromium || pw.default.chromium).launch();
try {
  const result = await auditPage(browser, url, out);
  writeReport(result, out);
  console.log(`Informe: ${path.join(out, 'report.md')} (${result.issues.length} hallazgo(s))`);
} finally { await browser.close(); }
