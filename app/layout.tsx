import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';
import EngagingFooter from '@/components/footer/EngagingFooter';
import PWARegister from '@/components/PWARegister';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { MobileNav, BottomNav } from '@/components/mobile/MobileNav';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

import { APP_TAGLINE } from '@/lib/constants/tagline';

export const metadata: Metadata = {
  title: 'Fikra Valley - Transforme ton idée en entreprise avec ta voix',
  description: APP_TAGLINE.meta.fr,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fikra Valley',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/png/FikraValley_flag_logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/png/FikraValley_flag_logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/png/FikraValley_flag_logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
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
        <PWAInstallPrompt />
        {/* Desktop Navigation */}
        <nav className="hidden md:block border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 gap-6">
            <div className="flex items-center flex-shrink-0 gap-3">
              <Logo href="/" size="lg" showText={true} />
            </div>
            <div className="flex items-center gap-6 flex-1 justify-end">
              {/* Founders Cluster */}
              <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
                <Link href="/submit-voice" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Soumettre
                </Link>
                <Link href="/ideas" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Idées
                </Link>
                <Link href="/founder" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Fondateurs
                </Link>
              </div>

              {/* Mentors Cluster */}
              <div className="flex items-center gap-4">
                <Link href="/find-mentor" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Trouver Mentor
                </Link>
                <Link href="/become-mentor" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                  Devenir Mentor
                </Link>
              </div>

              <UserMenu />
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 safe-area-top">
            <div className="flex items-center justify-between px-4 py-3">
              <Logo href="/" size="lg" showText={true} />
            </div>
          </div>
          <MobileNav />
        </div>
        {children}
        <EngagingFooter />
        <BottomNav />
      </body>
    </html>
  );
}
