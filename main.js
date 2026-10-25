const { app, BrowserWindow, globalShortcut } = require('electron');
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { WebSocketServer } = require('ws');
const PORT = 3000, SOUNDS = path.join(__dirname, 'sounds');

let tunnelInstance = null;
let tunnelUrl = null;

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
  '.ogg': 'audio/ogg'
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
    return res.end(JSON.stringify(fs.readdirSync(SOUNDS)));
  }
  if (url.startsWith('/sounds/')) return send(res, path.join('sounds', path.basename(url)));
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
    width: 860,
    height: 700,
    minWidth: 750,
    minHeight: 580,
    title: 'Valorant Soundboard Server',
    autoHideMenuBar: true,
    webPreferences: { backgroundThrottling: false }
  });
  win.loadURL(`http://localhost:${PORT}/engine`);
  // Tùy chọn: numpad 1 phát sound đầu tiên trong thư mục
  globalShortcut.register('num1', () => {
    const list = fs.readdirSync(SOUNDS);
    if (list.length > 0) broadcast({ play: list[0] });
  });
});