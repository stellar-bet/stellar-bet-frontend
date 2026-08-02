import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import TopBar from '@/components/layout/TopBar';
import SportsSidebar from '@/components/layout/SportsSidebar';
import MobileNav from '@/components/layout/MobileNav';
import LiveTicker from '@/components/live/LiveTicker';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StellarBet — Sports Betting on Stellar',
  description: 'Sports betting powered by Stellar Soroban smart contracts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-sp-bg text-sp-text min-h-screen`}>
        <Providers>
          <TopBar />
          <LiveTicker />

          {/* Page body: sidebar + content */}
          <div className="flex" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <SportsSidebar />
            <main id="main-content" className="flex-1 min-w-0 pb-16 lg:pb-0">
              {children}
            </main>
          </div>

          <MobileNav />

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#00a651',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
              },
              error: {
                style: { background: '#d32f2f', color: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
