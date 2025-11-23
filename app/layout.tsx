import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import EngagingFooter from '@/components/footer/EngagingFooter';
import PWARegister from '@/components/PWARegister';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Fikra Valley - Morocco\'s Valley of Ideas',
  description: 'Where Moroccan ideas grow. Analyse technique instantanée et gratuite pour vos problèmes. Évaluez la faisabilité, obtenez une architecture de solution, et entrez dans un examen compétitif pour un financement potentiel (€3-10K) au Maroc.',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fikra Valley',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/fikra_logo_v3.png', sizes: '192x192', type: 'image/png' },
      { url: '/fikra_logo_v3.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/fikra_logo_v3.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={cn('min-h-screen bg-sand-50 text-slate-900 antialiased font-sans', inter.variable, outfit.variable)} suppressHydrationWarning>
        <PWARegister />
        {/* Simple Navigation Bar */}
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 gap-6">
            <div className="flex items-center flex-shrink-0">
              <Logo href="/" size="lg" showText={true} className="hidden sm:flex" />
              <Logo href="/" size="lg" showText={false} className="sm:hidden" />
            </div>
            <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
              <Link href="/ideas" className="text-sm text-slate-600 hover:text-slate-900">
                Idées
              </Link>
              <Link href="/submit-voice" className="text-sm text-slate-600 hover:text-slate-900">
                Soumettre
              </Link>
              <Link href="/find-mentor" className="text-sm text-slate-600 hover:text-slate-900">
                Trouver Mentor
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
