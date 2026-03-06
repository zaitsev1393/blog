import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';
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
const prodPostsDir = join(browserDistFolder, 'posts');
const devPostsDir = join(process.cwd(), 'public/posts');
const postsDir = existsSync(prodPostsDir) ? prodPostsDir : devPostsDir;

async function getPostsData() {
  const files = await readdir(postsDir);
  const posts = await Promise.all(
    files.filter(f => f.endsWith('.md')).map(async (file) => {
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
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function getPostData(slug: string) {
  const files = await readdir(postsDir);
  for (const file of files.filter(f => f.endsWith('.md'))) {
    const raw = await readFile(join(postsDir, file), 'utf-8');
    const { data, content } = matter(raw);
    const fileSlug = data['slug'] ?? file.replace('.md', '');
    if (fileSlug === slug) {
      return {
        slug: fileSlug,
        title: data['title'] ?? 'Untitled',
        date: data['date'] ? new Date(data['date']).toISOString().split('T')[0] : '',
        excerpt: data['excerpt'] ?? '',
        tags: data['tags'] ?? [],
        content: await marked(content),
      };
    }
  }
  return null;
}

// ─── Netlify handler (Fetch API) ─────────────────────────────────────────────

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext();
  const { pathname } = new URL(request.url);

  if (pathname === '/api/posts') {
    try {
      const posts = await getPostsData();
      return Response.json(posts);
    } catch {
      return Response.json({ error: 'Failed to load posts' }, { status: 500 });
    }
  }

  const postMatch = pathname.match(/^\/api\/posts\/(.+)$/);
  if (postMatch) {
    try {
      const post = await getPostData(postMatch[1]);
      return post
        ? Response.json(post)
        : new Response('Not found', { status: 404 });
    } catch {
      return Response.json({ error: 'Failed to load post' }, { status: 500 });
    }
  }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);

// ─── Local dev / Node server ──────────────────────────────────────────────────

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const nodeAngularApp = new AngularNodeAppEngine();
  const app = express();

  app.use(express.json());

  app.get('/api/posts', async (_req, res) => {
    try {
      res.json(await getPostsData());
    } catch {
      res.status(500).json({ error: 'Failed to load posts' });
    }
  });

  app.get('/api/posts/:slug', async (req, res) => {
    try {
      const post = await getPostData(req.params['slug']);
      return post ? res.json(post) : res.status(404).json({ error: 'Not found' });
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
    nodeAngularApp
      .handle(req)
      .then((response) =>
        response ? writeResponseToNodeResponse(response, res) : next(),
      )
      .catch(next);
  });

  const port = process.env['PORT'] || 4000;
  app.listen(port, () =>
    console.log(`Node Express server listening on http://localhost:${port}`)
  );
}
