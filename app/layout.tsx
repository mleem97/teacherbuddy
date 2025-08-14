import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '../styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030213',
};

export const metadata: Metadata = {
  title: 'Teacherbuddy - Klassenbuch & Zufallsauswahl',
  description: 'Ein umfassendes Werkzeug für Lehrkräfte zur Klassenbuchführung und fairen Zufallsauswahl von Schüler:innen',
  keywords: ['Teacherbuddy', 'Schule', 'Unterricht', 'Zufallsauswahl', 'Namen', 'Lehrkraft', 'Klassenbuch', 'Anwesenheit'],
  authors: [{ name: 'mleem97' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Teacherbuddy',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Teacherbuddy" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered', registration);
                }).catch(function(err) {
                  console.log('SW registration failed', err);
                });
              });
            }
          `}
        </Script>

        {/* PWA Install: dezenter FAB, einmalig pro Gerät */}
        <Script id="pwa-install" strategy="afterInteractive">
          {`
            (function(){
              var LS_KEY_DISMISSED = 'teacherbuddy.pwa.install.dismissed';
              var deferredPrompt = null;

              function isStandalone(){
                return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                       (('standalone' in navigator) && navigator.standalone === true);
              }

              function removeFab(){
                var el = document.getElementById('install-fab');
                if (el) el.remove();
              }

              function showFab(){
                if (document.getElementById('install-fab')) return;
                if (localStorage.getItem(LS_KEY_DISMISSED) === '1') return;
                if (isStandalone()) return;
                if (!deferredPrompt) return;

                var btn = document.createElement('button');
                btn.id = 'install-fab';
                btn.setAttribute('aria-label', 'App installieren');
                btn.title = 'App installieren';
                btn.style.cssText = 'position:fixed;bottom:16px;right:16px;width:44px;height:44px;border-radius:9999px;background:var(--primary);color:var(--primary-foreground);box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0.95;';
                btn.innerHTML = '<span style="font-size:18px;line-height:1;">⬇</span>';
                document.body.appendChild(btn);

                btn.addEventListener('click', function(){
                  try {
                    if (deferredPrompt && deferredPrompt.prompt) {
                      deferredPrompt.prompt();
                      if (deferredPrompt.userChoice) {
                        deferredPrompt.userChoice.then(function(choice){
                          console.log('PWA install result:', choice);
                        });
                      }
                    }
                  } catch(e) {
                    console.warn('Install prompt error', e);
                  } finally {
                    localStorage.setItem(LS_KEY_DISMISSED, '1');
                    deferredPrompt = null;
                    removeFab();
                  }
                });
              }

              window.addEventListener('beforeinstallprompt', function(e){
                e.preventDefault();
                deferredPrompt = e;
                setTimeout(showFab, 2000);
              });

              window.addEventListener('appinstalled', function(){
                removeFab();
                localStorage.removeItem(LS_KEY_DISMISSED);
              });
            })();
          `}
        </Script>
      </body>
    </html>
  );
}