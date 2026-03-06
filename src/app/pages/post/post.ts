import { Component, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { BlogService } from '../../services/blog.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class PostComponent {
  private blogService = inject(BlogService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);

  private slug = toSignal(
    this.route.paramMap.pipe(map(p => p.get('slug') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('slug') ?? '' }
  );

  postResource = resource<Post, string>({
    params: () => this.slug(),
    loader: ({ params: slug }) => firstValueFrom(this.blogService.getPost(slug)),
  });

  get safeContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.postResource.value()?.content ?? ''
    );
  }
}
