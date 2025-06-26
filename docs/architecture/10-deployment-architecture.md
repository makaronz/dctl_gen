# 10. Deployment Architecture

## 10.1 Progressive Web App Configuration

```typescript
// Service Worker configuration
const CACHE_NAME = 'dctl-generator-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback to offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// PWA Manifest
const manifest = {
  name: 'DCTL Web Generator',
  short_name: 'DCTL Gen',
  description: 'Professional DCTL file generator for DaVinci Resolve',
  start_url: '/',
  display: 'standalone',
  background_color: '#0f0f0f',
  theme_color: '#6366f1',
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ],
  categories: ['productivity', 'photo', 'video'],
  orientation: 'landscape-primary'
};
```

---

Ta architektura zapewnia skalowalną, wydajną i bezpieczną platformę do generowania plików DCTL, z naciskiem na user experience, performance i maintainability. 