import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import EngagingFooter from '@/components/footer/EngagingFooter';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Fikra Valley - Morocco\'s Valley of Ideas',
  description: 'Where Moroccan ideas grow. Analyse technique instantanée et gratuite pour vos problèmes. Évaluez la faisabilité, obtenez une architecture de solution, et entrez dans un examen compétitif pour un financement potentiel (€3-10K) au Maroc.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-sand-50 text-slate-900 antialiased font-sans', inter.variable, outfit.variable)} suppressHydrationWarning>
        {/* Simple Navigation Bar */}
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Logo href="/" size="sm" showText={true} className="hidden sm:flex" />
              <Logo href="/" size="sm" showText={false} className="sm:hidden" />
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/ideas" className="text-sm text-slate-600 hover:text-slate-900">
                Idées
              </Link>
              <Link href="/submit" className="text-sm text-slate-600 hover:text-slate-900">
                Soumettre
              </Link>
              <Link href="/pods" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
                Pods
              </Link>
              <Link href="/university" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
                Université
              </Link>
              <Link href="/customize" className="text-sm text-slate-600 hover:text-slate-900 hidden sm:inline">
                Personnaliser
              </Link>
              <UserMenu />
            </div>
          </div>
        </nav>
        {children}
        <EngagingFooter />
      </body>
    </html>
  );
}
