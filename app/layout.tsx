import type { Metadata } from 'next';
import Script from 'next/script';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Teacherbuddy - Klassenbuch & Zufallsauswahl',
  description: 'Ein umfassendes Werkzeug für Lehrkräfte zur Klassenbuchführung und fairen Zufallsauswahl von Schüler:innen',
  keywords: ['Teacherbuddy', 'Schule', 'Unterricht', 'Zufallsauswahl', 'Namen', 'Lehrkraft', 'Klassenbuch', 'Anwesenheit'],
  authors: [{ name: 'mleem97' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#030213',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Teacherbuddy',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Teacherbuddy',
    'application-name': 'Teacherbuddy',
    'msapplication-TileColor': '#030213',
    'msapplication-config': 'none',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Teacherbuddy" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#030213" />
      </head>
      <body className="antialiased">
        {children}
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            if (confirm('Eine neue Version ist verfügbar. Jetzt aktualisieren?')) {
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              window.location.reload();
                            }
                          }
                        });
                      }
                    });
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
              
              // Handle service worker updates
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
              });
            }
          `}
        </Script>

        {/* Install Prompt */}
        <Script id="pwa-install" strategy="afterInteractive">
          {`
            let deferredPrompt;
            
            window.addEventListener('beforeinstallprompt', (e) => {
              console.log('PWA install prompt available');
              e.preventDefault();
              deferredPrompt = e;
              
              // Show custom install button or banner
              const installBanner = document.createElement('div');
              installBanner.id = 'install-banner';
              installBanner.innerHTML = \`
                <div style="position: fixed; bottom: 20px; left: 20px; right: 20px; background: var(--primary); color: var(--primary-foreground); padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; display: flex; align-items: center; justify-content: space-between; font-size: 14px;">
                  <span>📱 Teacherbuddy als App installieren?</span>
                  <div>
                    <button id="install-btn" style="background: transparent; border: 1px solid currentColor; color: inherit; padding: 8px 16px; border-radius: 4px; margin-right: 8px; cursor: pointer;">Installieren</button>
                    <button id="dismiss-btn" style="background: transparent; border: none; color: inherit; padding: 8px; cursor: pointer;">✕</button>
                  </div>
                </div>
              \`;
              
              document.body.appendChild(installBanner);
              
              document.getElementById('install-btn').addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((result) => {
                  console.log('PWA install result:', result);
                  deferredPrompt = null;
                  document.getElementById('install-banner').remove();
                });
              });
              
              document.getElementById('dismiss-btn').addEventListener('click', () => {
                document.getElementById('install-banner').remove();
              });
            });
            
            window.addEventListener('appinstalled', (evt) => {
              console.log('PWA was installed');
              const banner = document.getElementById('install-banner');
              if (banner) {
                banner.remove();
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}