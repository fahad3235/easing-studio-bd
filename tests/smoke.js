// Headless-Chrome smoke test via raw CDP (no puppeteer dependency).
// Usage: node tests/smoke.js — exits non-zero on any failure or page error.
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 9359;
const FILE = 'file://' + path.resolve(__dirname, '..', 'index.html');
let failures = 0;
const pageErrors = [];
function check(name, cond, extra) {
  console.log((cond ? 'ok - ' : 'FAIL - ') + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/es-smoke-' + process.pid,
    'about:blank',
  ], { stdio: 'ignore' });
  let targets = [];
  for (let i = 0; i < 50 && targets.length === 0; i++) {
    await wait(200);
    try {
      targets = JSON.parse(await new Promise((res, rej) => {
        http.get('http://127.0.0.1:' + PORT + '/json/list', (r) => {
          let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(d));
        }).on('error', rej);
      }));
    } catch (e) { /* retry */ }
  }
  if (!targets.length) { console.log('FAIL - chrome did not start'); process.exit(2); }
  const wsUrl = targets[0].webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise((res) => { ws.onopen = res; });
  let seq = 0; const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      pageErrors.push(JSON.stringify(msg.params.args));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
    }
  };
  const send = (method, params) => new Promise((res) => {
    const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: FILE });
  await wait(1500);
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) return { error: JSON.stringify(r.result.exceptionDetails).slice(0, 300) };
    return r.result ? r.result.result.value : undefined;
  };
  const clickByText = async (sel, text) => ev(
    `[...document.querySelectorAll('${sel}')].find(b=>b.textContent.trim()==='${text}')?.click(), 'clicked'`);

  check('h1 renders', (await ev(`document.querySelector('h1').textContent`)) === 'Easing Studio BD');
  check('18 preset buttons', (await ev(`document.querySelectorAll('.preset-btn').length`)) === 18);
  check('default CSS output', (await ev(`document.getElementById('cssOutput').textContent`)) === 'cubic-bezier(0.25, 0.1, 0.25, 1)');
  check('curve path drawn by default', ((await ev(`document.getElementById('curvePath').getAttribute('d').length`)) || 0) > 50);
  await clickByText('.preset-btn', 'Ease Out');
  check('preset click switches CSS', (await ev(`document.getElementById('cssOutput').textContent`)) === 'ease-out');
  // Custom bezier via numeric inputs
  await ev(`(()=>{const set=(id,v)=>{const el=document.getElementById(id);el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));};set('inX1','0.5');set('inY1','0');set('inX2','0.5');set('inY2','1');return document.getElementById('cssOutput').textContent;})()`);
  check('custom inputs build CSS', (await ev(`document.getElementById('cssOutput').textContent`)) === 'cubic-bezier(0.5, 0, 0.5, 1)');
  // Steps preset hides curve
  await clickByText('.preset-btn', 'Steps 4');
  check('steps preset CSS', (await ev(`document.getElementById('cssOutput').textContent`)) === 'steps(4, end)');
  check('steps preset hides curve path', (await ev(`document.getElementById('curvePath').getAttribute('d')`)) === '');
  await clickByText('.preset-btn', 'Ease');
  // Preview play
  await ev(`document.getElementById('playBtn').click()`);
  await wait(2200);
  check('preview finishes with Done', (await ev(`document.getElementById('previewStatus').textContent`)) === 'Done.');
  // Race
  await ev(`document.getElementById('raceBtn').click()`);
  await wait(2200);
  const raceResult = await ev(`document.getElementById('raceResult').textContent`);
  check('race produces a verdict', typeof raceResult === 'string' && raceResult.length > 5, raceResult);
  // Save + reload persistence
  await ev(`(()=>{document.getElementById('saveName').value='smoke-ease';document.getElementById('saveBtn').click();return document.getElementById('savedList').textContent;})()`);
  check('saved easing listed', (await ev(`document.getElementById('savedList').textContent`)).includes('smoke-ease'));
  await send('Page.navigate', { url: FILE });
  await wait(1500);
  check('saved easing persists after reload', (await ev(`document.getElementById('savedList').textContent`)).includes('smoke-ease'));
  // BN toggle + Bengali digits
  await ev(`document.getElementById('langBtn').click()`);
  check('BN toggle flips lang button', (await ev(`document.getElementById('langBtn').textContent`)) === 'English');
  check('BN digits in duration', (await ev(`document.getElementById('durVal').textContent`)).includes('\u09e7'));
  // Erase saved (typed DELETE)
  await ev(`(()=>{document.getElementById('eraseInput').value='DELETE';document.getElementById('eraseBtn').click();return document.getElementById('savedList').textContent;})()`);
  check('typed-DELETE erases saved', (await ev(`document.getElementById('savedList').textContent`)).includes('No saved') || (await ev(`document.getElementById('savedList').textContent`)).length < 60);
  // 390px mobile: no horizontal overflow
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await wait(500);
  const overflow = await ev(`document.documentElement.scrollWidth - window.innerWidth`);
  check('390px no horizontal overflow', overflow <= 1, 'overflow=' + overflow);
  check('no console/page errors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 400));

  console.log(failures === 0 ? 'SMOKE ALL PASS' : 'SMOKE FAILURES: ' + failures);
  ws.close(); chrome.kill();
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.log('SMOKE HARNESS ERROR: ' + e.message); process.exit(2); });
