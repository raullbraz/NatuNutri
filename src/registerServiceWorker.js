/**
 * Registro e Gerenciamento do Ciclo de Vida do Service Worker
 */
export function registerServiceWorker(onUpdate) {
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Checar se há atualizações periodicamente (a cada 30 minutos)
          setInterval(() => {
            registration.update();
          }, 30 * 60 * 1000);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova versão disponível e pronta para uso
                  console.log('[PWA] Nova versão disponível!');
                  if (onUpdate) {
                    onUpdate(registration);
                  }
                  window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: registration }));
                } else {
                  // Conteúdo em cache para uso offline pela primeira vez
                  console.log('[PWA] Conteúdo pronto para uso offline.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[PWA] Erro ao registrar Service Worker:', error);
        });

      // Recarregar quando um novo Service Worker assumir o controle (após skipWaiting)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}
