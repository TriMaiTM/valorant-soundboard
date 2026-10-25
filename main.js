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

function getKeybindsFilePath() {
  if (app.isPackaged) {
    const portablePath = process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
    return path.join(path.dirname(portablePath), 'keybinds.json');
  }
  return path.join(__dirname, 'keybinds.json');
}

function getSoundFiles() {
  const dir = getSoundsDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(mp3|wav|ogg|m4a|aac)$/i.test(f));
}

function loadKeybinds() {
  const p = getKeybindsFilePath();
  let data = { stop: 'num0', sounds: {} };
  if (fs.existsSync(p)) {
    try {
      const content = fs.readFileSync(p, 'utf-8');
      data = JSON.parse(content);
      if (!data.sounds) data.sounds = {};
      if (!data.stop) data.stop = 'num0';
    } catch (e) {}
  } else {
    const files = getSoundFiles();
    files.slice(0, 9).forEach((f, idx) => {
      data.sounds[f] = `num${idx + 1}`;
    });
    try { fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8'); } catch (e) {}
  }
  return data;
}

function saveKeybinds(data) {
  const p = getKeybindsFilePath();
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
  registerCustomHotkeys(broadcast);
  broadcast({ reloadKeybinds: 1, keybinds: data });
  return data;
}

function registerCustomHotkeys(broadcastFn) {
  globalShortcut.unregisterAll();
  const keybinds = loadKeybinds();
  const files = getSoundFiles();

  // Đăng ký phím dừng
  if (keybinds.stop && keybinds.stop.trim()) {
    try {
      globalShortcut.register(keybinds.stop.trim(), () => {
        broadcastFn({ stop: 1 });
      });
    } catch (err) {
      console.error('Không thể gán phím dừng:', keybinds.stop);
    }
  }

  // Đăng ký phím cho từng âm thanh
  for (const filename of files) {
    const key = keybinds.sounds[filename];
    if (key && key.trim()) {
      try {
        globalShortcut.register(key.trim(), () => {
          broadcastFn({ play: filename });
        });
      } catch (err) {
        console.error(`Không thể gán phím ${key} cho ${filename}:`, err);
      }
    }
  }
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

  if (url === '/keybinds' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify(loadKeybinds()));
  }

  if (url === '/keybinds' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const current = loadKeybinds();
        if (payload.stop !== undefined) current.stop = payload.stop;
        if (payload.sounds) current.sounds = { ...current.sounds, ...payload.sounds };
        if (payload.filename !== undefined) {
          if (payload.key) {
            current.sounds[payload.filename] = payload.key;
          } else {
            delete current.sounds[payload.filename];
          }
        }
        saveKeybinds(current);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ success: true, keybinds: current }));
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (url === '/keybinds/reset' && req.method === 'POST') {
    const data = { stop: 'num0', sounds: {} };
    const files = getSoundFiles();
    files.slice(0, 9).forEach((f, idx) => {
      data.sounds[f] = `num${idx + 1}`;
    });
    saveKeybinds(data);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ success: true, keybinds: data }));
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
    width: 940,
    height: 760,
    minWidth: 840,
    minHeight: 640,
    title: 'Valorant Stream Deck Soundboard',
    autoHideMenuBar: true,
    webPreferences: { backgroundThrottling: false }
  });

  win.loadURL(`http://localhost:${PORT}/engine`);

  // Đăng ký custom hotkeys ban đầu
  registerCustomHotkeys(broadcast);

  // Tự động theo dõi thư mục sounds khi có thêm/xóa file
  const soundDir = getSoundsDir();
  try {
    watcher = fs.watch(soundDir, () => {
      registerCustomHotkeys(broadcast);
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