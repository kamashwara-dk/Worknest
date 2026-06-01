import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/provider';
import { Toaster } from 'sonner';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#178582',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "WorkNest — Your team's daily command center",
  description: 'Tasks, messages, leaves, and documents — unified for your entire team.',
  keywords: ['productivity', 'team', 'tasks', 'collaboration', 'workplace'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WorkNest',
  },
  icons: {
    icon: '/worknest-icon.svg',
    shortcut: '/worknest-icon.svg',
    apple: '/worknest-icon.svg',
  },
  openGraph: {
    title: 'WorkNest',
    description: "Your team's daily command center.",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} dark`}>
      <head>
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WorkNest" />
        <link rel="apple-touch-icon" href="/worknest-icon.svg" />
      </head>
      <body className="font-sans bg-[#0A1828] text-[#E8F0F8] antialiased">
        <TRPCProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0D1F35',
                border: '1px solid #1E3A5F',
                color: '#E8F0F8',
              },
            }}
          />
        </TRPCProvider>

        {/* Register service worker for PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
