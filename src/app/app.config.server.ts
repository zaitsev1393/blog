import { mergeApplicationConfig, ApplicationConfig, inject, Optional, REQUEST } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './services/blog.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideHttpClient(withFetch()),
    {
      provide: API_BASE_URL,
      useFactory: () => {
        const request = inject(REQUEST, { optional: true });
        if (request) {
          const url = new URL(request.url);
          return `${url.protocol}//${url.host}`;
        }
        return `http://localhost:${process.env['PORT'] ?? 4200}`;
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
