const { app, BrowserWindow, globalShortcut, shell } = require('electron');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { WebSocketServer } = require('ws');
const PORT = 3000;

let tunnelInstance = null;
let tunnelUrl = null;
let watcher = null;

function getSoundsDir() {
  if (app.isPackaged) {
    const portablePath = process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
    const externalSounds = path.join(path.dirname(portablePath), 'sounds');
    if (!fs.existsSync(externalSounds)) {
      try {
        fs.mkdirSync(externalSounds, { recursive: true });
        const bundled = path.join(__dirname, 'sounds');
        if (fs.existsSync(bundled)) {
          for (const f of fs.readdirSync(bundled)) {
            fs.copyFileSync(path.join(bundled, f), path.join(externalSounds, f));
          }
        }
      } catch (e) {
        return path.join(__dirname, 'sounds');
      }
    }
    return externalSounds;
  }
  return path.join(__dirname, 'sounds');
}

function getSoundFiles() {
  const dir = getSoundsDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(mp3|wav|ogg|m4a|aac)$/i.test(f));
}

function registerHotkeys(broadcastFn) {
  globalShortcut.unregisterAll();
  const files = getSoundFiles();

  for (let i = 1; i <= 9; i++) {
    const sound = files[i - 1];
    if (sound) {
      try {
        globalShortcut.register(`num${i}`, () => {
          broadcastFn({ play: sound });
        });
      } catch (err) {}
    }
  }

  // num0 to Stop All
  try {
    globalShortcut.register('num0', () => {
      broadcastFn({ stop: 1 });
    });
  } catch (err) {}
}

async function toggleTunnel(enable) {
  if (enable) {
    if (tunnelInstance && tunnelUrl) return tunnelUrl;
    const { startTunnel } = await import('untun');
    tunnelInstance = await startTunnel({ port: PORT });
    tunnelUrl = await tunnelInstance.getURL();
    return tunnelUrl;
  } else {
    if (tunnelInstance) {
      await tunnelInstance.close();
      tunnelInstance = null;
      tunnelUrl = null;
    }
    return null;
  }
}

function getNetworkInfo() {
  const hostname = os.hostname();
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return {
    hostname,
    mdnsUrl: `http://${hostname.toLowerCase()}.local:${PORT}`,
    lanIps: ips,
    lanUrls: ips.map(ip => `http://${ip}:${PORT}`),
    tunnelUrl: tunnelUrl || null
  };
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac'
};

function send(res, f) {
  const ext = path.extname(f).toLowerCase();
  if (MIME[ext]) res.setHeader('Content-Type', MIME[ext]);
  fs.createReadStream(path.join(__dirname, f))
    .on('error', () => { res.statusCode = 404; res.end(); })
    .pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsed = req.url.split('?');
  const url = decodeURIComponent(parsed[0]);
  const query = new URLSearchParams(parsed[1] || '');

  if (url === '/') return send(res, 'controller.html');
  if (url === '/engine') return send(res, 'engine.html');
  if (url === '/manifest.json') return send(res, 'manifest.json');
  if (url === '/qrcode.min.js') return send(res, 'qrcode.min.js');
  if (url.startsWith('/icons/')) return send(res, path.join('icons', path.basename(url)));

  if (url === '/network-info') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(getNetworkInfo()));
  }

  if (url === '/open-sounds-dir') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const dir = getSoundsDir();
    shell.openPath(dir);
    return res.end(JSON.stringify({ success: true, dir }));
  }

  if (url === '/tunnel') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const enable = query.get('enable') === '1';
    try {
      const activeUrl = await toggleTunnel(enable);
      return res.end(JSON.stringify({ success: true, tunnelUrl: activeUrl }));
    } catch (err) {
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  if (url === '/list') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(getSoundFiles()));
  }

  if (url.startsWith('/sounds/')) {
    const filename = path.basename(url);
    const fullPath = path.join(getSoundsDir(), filename);
    const ext = path.extname(filename).toLowerCase();
    if (MIME[ext]) res.setHeader('Content-Type', MIME[ext]);
    return fs.createReadStream(fullPath)
      .on('error', () => { res.statusCode = 404; res.end(); })
      .pipe(res);
  }

  res.statusCode = 404; res.end();
});

const wss = new WebSocketServer({ server });
const broadcast = m => wss.clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify(m)));
wss.on('connection', ws => ws.on('message', d => {
  try { const m = JSON.parse(d); if (m.play || m.stop) broadcast(m); } catch {}
}));

server.listen(PORT, '0.0.0.0');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 880,
    height: 720,
    minWidth: 780,
    minHeight: 600,
    title: 'Valorant Soundboard Server',
    autoHideMenuBar: true,
    webPreferences: { backgroundThrottling: false }
  });

  win.loadURL(`http://localhost:${PORT}/engine`);

  // Đăng ký phím tắt NumPad 1-9 và NumPad 0
  registerHotkeys(broadcast);

  // Tự động theo dõi thư mục sounds khi có thêm/xóa file
  const soundDir = getSoundsDir();
  try {
    watcher = fs.watch(soundDir, () => {
      registerHotkeys(broadcast);
      broadcast({ reload: 1 });
    });
  } catch (e) {}

  // Đóng hoàn toàn tiến trình khi tắt cửa sổ
  win.on('closed', async () => {
    if (watcher) watcher.close();
    globalShortcut.unregisterAll();
    if (tunnelInstance) {
      try { await tunnelInstance.close(); } catch (e) {}
    }
    server.close();
    wss.close();
    app.quit();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});