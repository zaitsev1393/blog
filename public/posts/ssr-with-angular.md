---
title: SSR with Angular 21
slug: ssr-with-angular
date: 2026-03-06
excerpt: Server-side rendering in Angular 21 is easier than ever. Here's a practical overview of the new SSR architecture, render modes, and how to deploy to Netlify.
tags: [angular, ssr, netlify, deployment]
---

# SSR with Angular 21

Angular's SSR story has improved dramatically. In Angular 21, `@angular/ssr` is the standard way to ship server-rendered apps — no more `@nguniversal` juggling.

## Scaffolding

```bash
ng new my-app --ssr
```

That's it. You get:
- `src/server.ts` — an Express app
- `src/main.server.ts` — the server entry point
- `src/app/app.config.server.ts` — server-specific providers
- `src/app/app.routes.server.ts` — per-route render mode config

## Render modes

Angular 21 lets you choose a render mode per route:

```typescript
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '',         renderMode: RenderMode.Prerender },
  { path: 'blog',     renderMode: RenderMode.Prerender },
  { path: 'blog/:slug', renderMode: RenderMode.Server },
  { path: '**',       renderMode: RenderMode.Server },
];
```

- **Prerender** — rendered at build time, served as static HTML (fastest)
- **Server** — rendered on each request (freshest data)
- **Client** — no SSR, plain SPA

## HTTP transfer state

When Angular renders on the server, it serializes HTTP responses into the HTML. The browser then rehydrates without making the same requests again. You get this for free with `provideClientHydration()`.

## Deploying to Netlify

With `@netlify/angular-runtime` the Angular Express server runs as a Netlify Function:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist/blog/browser"

[[plugins]]
  package = "@netlify/angular-runtime"
```

No extra configuration needed — the plugin detects your Angular SSR output and wires everything up.
