import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { marked } from 'marked';

const browserDistFolder = join(import.meta.dirname, '../browser');

// Resolve posts directory for both dev and production environments
const prodPostsDir = join(browserDistFolder, 'posts');
const devPostsDir = join(process.cwd(), 'public/posts');
const postsDir = existsSync(prodPostsDir) ? prodPostsDir : devPostsDir;

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

app.get('/api/posts', async (_req, res) => {
  try {
    const files = await readdir(postsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    const posts = await Promise.all(
      mdFiles.map(async (file) => {
        const raw = await readFile(join(postsDir, file), 'utf-8');
        const { data } = matter(raw);
        return {
          slug: data['slug'] ?? file.replace('.md', ''),
          title: data['title'] ?? 'Untitled',
          date: data['date'] ? new Date(data['date']).toISOString().split('T')[0] : '',
          excerpt: data['excerpt'] ?? '',
          tags: data['tags'] ?? [],
        };
      })
    );

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(posts);
  } catch {
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const files = await readdir(postsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
      const raw = await readFile(join(postsDir, file), 'utf-8');
      const { data, content } = matter(raw);
      const slug = data['slug'] ?? file.replace('.md', '');

      if (slug === req.params['slug']) {
        const html = await marked(content);
        return res.json({
          slug,
          title: data['title'] ?? 'Untitled',
          date: data['date'] ? new Date(data['date']).toISOString().split('T')[0] : '',
          excerpt: data['excerpt'] ?? '',
          tags: data['tags'] ?? [],
          content: html,
        });
      }
    }

    return res.status(404).json({ error: 'Post not found' });
  } catch {
    return res.status(500).json({ error: 'Failed to load post' });
  }
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
