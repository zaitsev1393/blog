import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog-list/blog-list').then(m => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/post/post').then(m => m.PostComponent),
  },
  { path: '**', redirectTo: '' },
];
