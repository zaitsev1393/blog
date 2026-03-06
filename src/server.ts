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

// ─── Netlify Edge Function handler (Fetch API, no filesystem) ─────────────────

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const context = getContext();
  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);

// ─── Local Node/Express dev server ───────────────────────────────────────────

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const browserDistFolder = join(import.meta.dirname, '../browser');
  const nodeAngularApp = new AngularNodeAppEngine();
  const app = express();

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
