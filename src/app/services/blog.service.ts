import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostMeta } from '../models/post.model';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  getPosts(): Observable<PostMeta[]> {
    return this.http.get<PostMeta[]>(`${this.baseUrl}/data/posts.json`);
  }

  getPost(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/data/posts/${slug}.json`);
  }
}
