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

// Edge function entry: re-export the Fetch API handler from server.mjs
await writeFile(join(funcDir, 'index.mjs'), `export { netlifyAppEngineHandler as default } from './server.mjs';\n`);

// Vercel Edge Function config
await writeFile(join(funcDir, '.vc-config.json'), JSON.stringify({
  runtime: 'edge',
  entrypoint: 'index.mjs',
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
