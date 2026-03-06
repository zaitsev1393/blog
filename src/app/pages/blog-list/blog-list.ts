import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.scss',
})
export class BlogListComponent {
  private blogService = inject(BlogService);

  private allPosts = toSignal(this.blogService.getPosts(), { initialValue: [] });

  activeTag = signal<string | null>(null);

  allTags = computed(() => {
    const tags = this.allPosts().flatMap(p => p.tags);
    return [...new Set(tags)].sort();
  });

  posts = computed(() => {
    const tag = this.activeTag();
    return [...this.allPosts()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(p => !tag || p.tags.includes(tag));
  });

  setTag(tag: string | null) {
    this.activeTag.set(tag);
  }
}
