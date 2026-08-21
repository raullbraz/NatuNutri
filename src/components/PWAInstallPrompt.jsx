import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // 1. Detectar se o app já está rodando em modo standalone (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return;
    }

    // 2. Ouvir evento nativo de instalação (Android, Chrome, Edge, Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Não exibir se o usuário já fechou nesta sessão
      const dismissed = sessionStorage.getItem('@NatuNutri:pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 3. Detectar iOS Safari (que não suporta beforeinstallprompt mas suporta adicionar à tela de início)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari && !isStandalone) {
      const dismissedIOS = sessionStorage.getItem('@NatuNutri:ios_dismissed');
      if (!dismissedIOS) {
        // Exibir banner discreto para iOS após 3 segundos
        const timer = setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    // 4. Ouvir evento de nova versão disponível
    const handleUpdateAvailable = (e) => {
      setUpdateAvailable(true);
      if (e.detail) {
        setRegistration(e.detail);
      }
    };
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Escolha do usuário:', outcome);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('@NatuNutri:pwa_dismissed', 'true');
  };

  const handleDismissIOS = () => {
    setShowIOSPrompt(false);
    sessionStorage.setItem('@NatuNutri:ios_dismissed', 'true');
  };

  const handleApplyUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Banner de Nova Versão / Atualização Automática */}
      {updateAvailable && (
        <div className="pwa-update-banner">
          <div className="pwa-update-content">
            <span className="pwa-update-icon">✨</span>
            <div className="pwa-update-text">
              <strong>Nova versão disponível!</strong>
              <span>Uma atualização do NatuNutri está pronta para uso.</span>
            </div>
          </div>
          <button type="button" className="btn-pwa-update" onClick={handleApplyUpdate}>
            Atualizar Agora
          </button>
        </div>
      )}

      {/* Banner de Instalação no Celular / Desktop */}
      {showInstallBanner && (
        <div className="pwa-install-banner">
          <div className="pwa-install-info">
            <div className="pwa-install-app-icon">
              <img src="/favicon.svg" alt="NatuNutri Logo" width="36" height="36" />
            </div>
            <div className="pwa-install-text">
              <strong>Instalar o App NatuNutri</strong>
              <span>Acesse direto da sua tela inicial de forma rápida e segura.</span>
            </div>
          </div>
          <div className="pwa-install-actions">
            <button type="button" className="btn-pwa-dismiss" onClick={handleDismiss}>
              Agora não
            </button>
            <button type="button" className="btn-pwa-install" onClick={handleInstallClick}>
              Instalar
            </button>
          </div>
        </div>
      )}

      {/* Banner de Ajuda de Instalação no iOS Safari */}
      {showIOSPrompt && (
        <div className="pwa-install-banner pwa-ios-banner">
          <div className="pwa-install-info">
            <div className="pwa-install-app-icon">
              <img src="/favicon.svg" alt="NatuNutri Logo" width="36" height="36" />
            </div>
            <div className="pwa-install-text">
              <strong>Instale o NatuNutri no seu iPhone/iPad</strong>
              <span>
                Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) e depois selecione <strong>"Adicionar à Tela de Início"</strong>.
              </span>
            </div>
          </div>
          <button type="button" className="btn-pwa-dismiss" onClick={handleDismissIOS}>
            Entendi
          </button>
        </div>
      )}
    </>
  );
}
