/**
 * Build-time script: reads public/posts/*.md, outputs static JSON to public/data/
 * Run automatically via `prebuild` npm script.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const postsDir = join(root, 'public', 'posts');
const outDir = join(root, 'public', 'data');
const postsOutDir = join(outDir, 'posts');

await mkdir(postsOutDir, { recursive: true });

const files = (await readdir(postsDir)).filter(f => f.endsWith('.md'));

const metas = [];

for (const file of files) {
  const raw = await readFile(join(postsDir, file), 'utf-8');
  const { data, content } = matter(raw);

  const slug = data.slug ?? file.replace('.md', '');
  const meta = {
    slug,
    title: data.title ?? 'Untitled',
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    excerpt: data.excerpt ?? '',
    tags: data.tags ?? [],
  };

  metas.push(meta);

  const html = await marked(content);
  const post = { ...meta, content: html };

  await writeFile(join(postsOutDir, `${slug}.json`), JSON.stringify(post));
  console.log(`  ✓ ${slug}`);
}

metas.sort((a, b) => new Date(b.date) - new Date(a.date));
await writeFile(join(outDir, 'posts.json'), JSON.stringify(metas));

console.log(`Generated ${metas.length} posts → public/data/`);
