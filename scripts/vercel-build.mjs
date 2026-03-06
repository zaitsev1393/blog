/**
 * Creates the Vercel Build Output API v3 structure from the Angular build output.
 * Deploys as a Vercel Edge Function (same Fetch API handler used by Netlify).
 */
import { mkdir, writeFile, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(fileURLToPath(import.meta.url), '../..');

// Build the Angular app (includes prebuild → generate-posts)
execSync('npm run build', { stdio: 'inherit', cwd: root });

const outDir = join(root, '.vercel/output');
const staticDir = join(outDir, 'static');
const funcDir = join(outDir, 'functions/ssr.func');

await mkdir(staticDir, { recursive: true });
await mkdir(funcDir, { recursive: true });

// Static browser files → served by Vercel CDN
await cp(join(root, 'dist/blog/browser'), staticDir, { recursive: true });

// Server bundle → Vercel Edge Function
await cp(join(root, 'dist/blog/server'), funcDir, { recursive: true });

// package.json needed for ES module support in the Lambda
await writeFile(join(funcDir, 'package.json'), JSON.stringify({ type: 'module' }));

// Node.js adapter: converts IncomingMessage ↔ Fetch API to reuse netlifyAppEngineHandler
await writeFile(join(funcDir, 'index.mjs'), `
import { netlifyAppEngineHandler } from './server.mjs';

function toFetchRequest(req) {
  const proto = req.headers['x-forwarded-proto']?.split(',')[0]?.trim() ?? 'https';
  const host  = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';
  const url   = new URL(req.url ?? '/', \`\${proto}://\${host}\`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') headers.set(k, v);
    else if (Array.isArray(v)) v.forEach(val => headers.append(k, val));
  }
  const method  = req.method ?? 'GET';
  const hasBody = method !== 'GET' && method !== 'HEAD';
  return new Request(url, { method, headers, body: hasBody ? req : undefined, duplex: hasBody ? 'half' : undefined });
}

async function toNodeResponse(fetchRes, res) {
  res.statusCode = fetchRes.status;
  const setCookies = fetchRes.headers.getSetCookie?.() ?? [];
  if (setCookies.length) res.setHeader('set-cookie', setCookies);
  for (const [k, v] of fetchRes.headers.entries()) {
    if (k.toLowerCase() !== 'set-cookie') res.setHeader(k, v);
  }
  if (!fetchRes.body) { res.end(); return; }
  const reader = fetchRes.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) { res.end(); break; }
    res.write(value);
  }
}

export default async function handler(req, res) {
  const fetchReq = toFetchRequest(req);
  const fetchRes = await netlifyAppEngineHandler(fetchReq);
  await toNodeResponse(fetchRes, res);
}
`.trimStart());

// Vercel Serverless Function config (Node.js runtime)
await writeFile(join(funcDir, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs22.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
}));

// Vercel routing: static files first, everything else → edge function
await writeFile(join(outDir, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/ssr' },
  ],
}));

console.log('Vercel output ready at .vercel/output/');
