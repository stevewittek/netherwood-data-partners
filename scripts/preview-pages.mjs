import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute } from 'node:path';
const root = resolve('pages-dist');
const desk = process.argv.includes('--desk');
const port = Number(process.env.NDP_PREVIEW_PORT || (desk ? 5173 : 4175));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('NDP_PREVIEW_PORT must be 1024–65535.');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (desk && ['/publication.json', '/articles-snapshot.json'].includes(url.pathname)) {
      try {
        const upstream = await fetch(`https://netherwooddatapartners.com${url.pathname}?desk=${Date.now()}`, {signal: AbortSignal.timeout(15000), redirect: 'error'});
        if (!upstream.ok) throw new Error('Live evidence unavailable');
        response.writeHead(200, {'content-type':'application/json', 'cache-control':'no-store'});
        response.end(await upstream.text());
      } catch {
        response.writeHead(502, {'content-type':'application/json', 'cache-control':'no-store'});
        response.end(JSON.stringify({error:'Live website evidence unavailable'}));
      }
      return;
    }
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    const relativePath = relative(root, path);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) throw new Error('outside public root');
    const info = await stat(path);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(301, {location:`${url.pathname}/${url.search}`}); response.end(); return; }
      path = resolve(path, 'index.html');
    }
    const body = await readFile(path);
    response.writeHead(200, {'content-type':types[extname(path)] || 'application/octet-stream', 'cache-control':'no-store'});
    response.end(body);
  } catch {
    response.writeHead(404, {'content-type':'text/html; charset=utf-8', 'cache-control':'no-store'});
    response.end(await readFile(resolve(root, '404.html')));
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/${desk ? 'admin/articles/' : ''}`));
