import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
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
      useFactory: () => `http://localhost:${process.env['PORT'] ?? 4000}`,
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
