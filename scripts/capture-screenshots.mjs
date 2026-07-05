import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const appUrl = 'http://127.0.0.1:5173';
const outDir = 'screenshots';
const port = 9223;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} ${response.status}`);
  }
  return response.json();
}

async function waitForChrome() {
  for (let index = 0; index < 50; index += 1) {
    try {
      return await requestJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await wait(100);
    }
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

function createClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const current = pending.get(message.id);
    if (!current) return;
    pending.delete(message.id);
    if (message.error) {
      current.reject(new Error(message.error.message));
    } else {
      current.resolve(message.result);
    }
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          id += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((methodResolve, methodReject) => {
            pending.set(id, { resolve: methodResolve, reject: methodReject });
          });
        },
        close() {
          socket.close();
        },
      });
    });
    socket.addEventListener('error', reject);
  });
}

async function screenshot(client, fileName) {
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(`${outDir}/${fileName}`, Buffer.from(result.data, 'base64'));
}

async function clickButton(client, text) {
  await client.send('Runtime.evaluate', {
    expression: `
      [...document.querySelectorAll('button')]
        .find((button) => button.textContent.includes(${JSON.stringify(text)}))
        ?.click();
    `,
    awaitPromise: true,
  });
}

await mkdir(outDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--window-size=1280,800',
  '--hide-scrollbars',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank',
], { stdio: 'ignore' });

try {
  await waitForChrome();
  const page = await requestJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(appUrl)}`, {
    method: 'PUT',
  });
  const client = await createClient(page.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await wait(1200);
  await screenshot(client, '01-home.png');

  await clickButton(client, 'ဒီနေ့');
  await wait(1200);
  await screenshot(client, '02-thinking.png');

  await wait(4500);
  await screenshot(client, '03-results.png');

  client.close();
} finally {
  chrome.kill();
}
