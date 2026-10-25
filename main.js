const { app, BrowserWindow, globalShortcut } = require('electron');
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PORT = 3000, SOUNDS = path.join(__dirname, 'sounds');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') return send(res, 'controller.html');
  if (url === '/engine') return send(res, 'engine.html');
  if (url === '/manifest.json') return send(res, 'manifest.json');
  if (url.startsWith('/icons/')) return send(res, path.join('icons', path.basename(url)));
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
  const win = new BrowserWindow({ width: 700, height: 300, webPreferences: { backgroundThrottling: false } });
  win.loadURL(`http://localhost:${PORT}/engine`);
  // Tùy chọn: numpad 1 phát sound đầu tiên trong thư mục
  globalShortcut.register('num1', () => broadcast({ play: fs.readdirSync(SOUNDS)[0] }));
});