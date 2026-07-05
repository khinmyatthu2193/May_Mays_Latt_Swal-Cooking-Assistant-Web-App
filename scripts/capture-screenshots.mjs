import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import net from 'node:net';

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
  const url = new URL(wsUrl);
  const socket = net.createConnection(Number(url.port), url.hostname);
  let id = 0;
  let buffer = Buffer.alloc(0);
  let handshakeDone = false;
  const pending = new Map();

  function sendFrame(payload) {
    const body = Buffer.from(payload);
    const mask = randomBytes(4);
    let headerLength = 6;
    if (body.length >= 126 && body.length < 65536) headerLength = 8;
    if (body.length >= 65536) headerLength = 14;

    const frame = Buffer.alloc(headerLength + body.length);
    frame[0] = 0x81;
    if (body.length < 126) {
      frame[1] = 0x80 | body.length;
      mask.copy(frame, 2);
    } else if (body.length < 65536) {
      frame[1] = 0x80 | 126;
      frame.writeUInt16BE(body.length, 2);
      mask.copy(frame, 4);
    } else {
      frame[1] = 0x80 | 127;
      frame.writeBigUInt64BE(BigInt(body.length), 2);
      mask.copy(frame, 10);
    }

    const maskOffset = headerLength - 4;
    for (let index = 0; index < body.length; index += 1) {
      frame[headerLength + index] = body[index] ^ mask[index % 4];
    }
    socket.write(frame);
  }

  function handleMessage(payload) {
    const message = JSON.parse(payload.toString('utf8'));
    if (!message.id) return;
    const current = pending.get(message.id);
    if (!current) return;
    pending.delete(message.id);
    if (message.error) {
      current.reject(new Error(message.error.message));
    } else {
      current.resolve(message.result);
    }
  }

  function readFrames() {
    while (buffer.length >= 2) {
      const first = buffer[0];
      const second = buffer[1];
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (buffer.length < 4) return;
        length = buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (buffer.length < 10) return;
        length = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const masked = Boolean(second & 0x80);
      const maskOffset = offset;
      if (masked) offset += 4;
      if (buffer.length < offset + length) return;

      let payload = buffer.subarray(offset, offset + length);
      if (masked) {
        const mask = buffer.subarray(maskOffset, maskOffset + 4);
        payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      }

      buffer = buffer.subarray(offset + length);
      const opcode = first & 0x0f;
      if (opcode === 0x1) handleMessage(payload);
    }
  }

  return new Promise((resolve, reject) => {
    const key = randomBytes(16).toString('base64');
    createHash('sha1')
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');

    socket.on('connect', () => {
      socket.write([
        `GET ${url.pathname}${url.search} HTTP/1.1`,
        `Host: ${url.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '',
        '',
      ].join('\r\n'));
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (!handshakeDone) {
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;
        const header = buffer.subarray(0, headerEnd).toString('utf8');
        if (!header.includes('101 Switching Protocols')) {
          reject(new Error('WebSocket handshake failed'));
          return;
        }
        handshakeDone = true;
        buffer = buffer.subarray(headerEnd + 4);
        resolve({
          send(method, params = {}) {
            id += 1;
            sendFrame(JSON.stringify({ id, method, params }));
            return new Promise((methodResolve, methodReject) => {
              pending.set(id, { resolve: methodResolve, reject: methodReject });
            });
          },
          close() {
            socket.end();
          },
        });
      }
      readFrames();
    });

    socket.on('error', reject);
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
  const pages = await requestJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages[0];
  const client = await createClient(page.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send('Page.navigate', { url: appUrl });
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
