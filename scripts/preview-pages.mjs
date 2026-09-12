import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('pages-dist');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    let path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (path !== root && !path.startsWith(`${root}/`)) throw new Error('outside public root');
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
}).listen(4175, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4175/'));
