const CACHE_NAME = 'natunutri-v1.0.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/apple-touch-icon.png'
];

// Instalação: Pré-cache dos arquivos essenciais e ativação imediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Aviso ao realizar pré-cache inicial:', err);
      });
    })
  );
});

// Ativação: Limpar caches de versões antigas e assumir controle dos clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Apenas intercepta requisições HTTP(S) do tipo GET
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Ignorar chamadas de API e Banco Neon (garantir dados clínicos em tempo real)
  if (
    url.hostname.includes('neon.tech') ||
    url.hostname.includes('neonauth') ||
    url.pathname.startsWith('/api')
  ) {
    return; // Pass-through para a rede
  }

  // 2. Requisições de Navegação (Páginas SPA / HTML) -> Network-First com fallback para cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline: serve o index.html em cache para o roteamento do React Router funcionar
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 3. Arquivos estáticos da mesma origem (JS, CSS, Imagens, Fontes, SVGs) -> Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Recursos externos (fontes do Google, CDNs etc.) -> Cache-First com fallback para rede
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => null);
    })
  );
});

// Mensagens recebidas dos clientes (ex: forçar atualização de versão)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
