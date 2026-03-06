---
title: Angular Signals — A Practical Guide
slug: angular-signals-guide
date: 2026-03-03
excerpt: Signals are Angular's new reactive primitive. In this post I cover the core API, real-world patterns, and how to migrate from RxJS-heavy code.
tags: [angular, signals, reactive]
---

# Angular Signals — A Practical Guide

Signals landed in Angular 16 as a developer preview and have been stable since Angular 17. By Angular 21 they're the recommended way to manage state. Here's what you need to know.

## The core API

```typescript
import { signal, computed, effect } from '@angular/core';

// Writable signal
const count = signal(0);

// Read the value
console.log(count()); // 0

// Update
count.set(1);
count.update(v => v + 1);

// Computed (derived, read-only)
const doubled = computed(() => count() * 2);

// Effect (side effects that re-run when deps change)
effect(() => console.log('count changed:', count()));
```

## Signals in services

The cleanest pattern is a service that exposes signals directly:

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.price, 0)
  );

  add(item: CartItem) {
    this._items.update(items => [...items, item]);
  }

  remove(id: string) {
    this._items.update(items => items.filter(i => i.id !== id));
  }
}
```

## toSignal — bridging RxJS

Most Angular apps have existing RxJS code. `toSignal` bridges the gap:

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

@Component({ ... })
export class SearchComponent {
  private searchService = inject(SearchService);

  query = signal('');

  results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      switchMap(q => this.searchService.search(q))
    ),
    { initialValue: [] }
  );
}
```

## resource() for async data

Angular 19+ has `resource()` for async operations with built-in loading/error state:

```typescript
import { resource } from '@angular/core';

readonly postResource = resource({
  request: this.slug,
  loader: ({ request: slug }) => fetch(`/api/posts/${slug}`).then(r => r.json())
});

// In template:
// postResource.isLoading() → boolean signal
// postResource.value()     → data signal
// postResource.error()     → error signal
```

## When to use signals vs RxJS

Use **signals** for:
- Component and service state
- Derived/computed values
- Simple async data loading with `resource()`

Keep **RxJS** for:
- Complex event streams (debounce, merge, combine)
- WebSockets
- Existing infrastructure you don't need to rewrite

They compose well together thanks to `toSignal` / `toObservable`.
