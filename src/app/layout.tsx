import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc/provider';
import { Toaster } from 'sonner';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata: Metadata = {
  title: "WorkNest — Your team's daily command center",
  description: 'Tasks, messages, leaves, and documents — unified for your entire team.',
  keywords: ['productivity', 'team', 'tasks', 'collaboration', 'workplace'],
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
      </body>
    </html>
  );
}
