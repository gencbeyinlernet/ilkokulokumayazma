import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const allowed = new Set(['index.html', 'style.css', 'app.js', 'data.js', 'assets/favicon.svg']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!allowed.has(relative)) { res.writeHead(404); res.end('Bulunamadı'); return; }
    const body = await readFile(path.join(root, relative));
    res.writeHead(200, { 'Content-Type': types[path.extname(relative)], 'Content-Length': body.length, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(400); res.end('Geçersiz istek'); }
});
server.listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => console.log(`Minik Kelimeler: http://${process.env.HOST || '127.0.0.1'}:${server.address().port}`));
