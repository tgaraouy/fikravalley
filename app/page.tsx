/**
 * ATTRACTIVE HOME PAGE
 * 
 * Modern, clean layout with logo and clear CTA
 * Only real facts, no mockup numbers
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { APP_TAGLINE } from '@/lib/constants/tagline';
import LogoWithTagline from '@/components/LogoWithTagline';

export default function HomePage() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-3xl mx-auto text-center space-y-10 py-12">
        
        {/* Logo at Top with Transformation Tagline */}
        <div className="mb-6">
          <LogoWithTagline 
            size="lg" 
            showText={true}
            language="fr"
          />
        </div>

        {/* Main Emotional Tagline - All 4 Languages Stacked */}
        <div className="space-y-6">
          {/* Darija */}
          <div className="space-y-2">
            <h1 
              className="text-2xl sm:text-3xl font-bold text-center"
              dir="rtl"
            >
              {APP_TAGLINE.main.darija.headline}
            </h1>
            <p 
              className="text-sm text-gray-600 text-center"
              dir="rtl"
            >
              {APP_TAGLINE.main.darija.subtext}
            </p>
          </div>

          {/* Tamazight */}
          <div className="space-y-2">
            <h1 
              className="text-2xl sm:text-3xl font-bold text-center"
              dir="rtl"
            >
              {APP_TAGLINE.main.tamazight.headline}
            </h1>
            {APP_TAGLINE.main.tamazight.headlineLatin && (
              <p className="text-base text-gray-600 text-center font-normal">
                {APP_TAGLINE.main.tamazight.headlineLatin}
              </p>
            )}
            <p 
              className="text-sm text-gray-600 text-center"
              dir="rtl"
            >
              {APP_TAGLINE.main.tamazight.subtext}
            </p>
            {APP_TAGLINE.main.tamazight.subtextLatin && (
              <p className="text-xs text-gray-500 text-center">
                {APP_TAGLINE.main.tamazight.subtextLatin}
              </p>
            )}
          </div>

          {/* French */}
          <div className="space-y-2">
            <h1 
              className="text-2xl sm:text-3xl font-bold text-center"
              dir="ltr"
            >
              {APP_TAGLINE.main.fr.headline}
            </h1>
            <p 
              className="text-sm text-gray-600 text-center"
              dir="ltr"
            >
              {APP_TAGLINE.main.fr.subtext}
            </p>
          </div>

          {/* English */}
          <div className="space-y-2">
            <h1 
              className="text-2xl sm:text-3xl font-bold text-center"
              dir="ltr"
            >
              {APP_TAGLINE.main.en.headline}
            </h1>
            <p 
              className="text-sm text-gray-600 text-center"
              dir="ltr"
            >
              {APP_TAGLINE.main.en.subtext}
            </p>
          </div>
        </div>

        {/* Benefits - Problem-Solving Focus */}
        <div className="space-y-4 pt-6">
          <p className="text-lg sm:text-xl text-slate-800 font-semibold" dir="rtl">
            وكلاء ذكاء اصطناعي كيستمعو لصوتك، كيحللوا فكرتك، وكيخلقو خطة عمل مخصصة.
          </p>
          <p className="text-base sm:text-lg text-slate-700 font-medium">
            7 agents IA écoutent ta voix, analysent ton idée, et créent un plan d'action sur mesure.
          </p>
          <div className="pt-2 space-y-2">
            <p className="text-base text-slate-600" dir="rtl">
              بلا فلوس. بلا كتابة. بلا تعقيد. فقط صوتك وفكرتك.
            </p>
            <p className="text-sm sm:text-base text-slate-500">
              Gratuit. Sans écrire. Sans complication. Juste ta voix et ton idée.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="pt-8 space-y-8">
          {/* Main CTA Button */}
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg sm:text-xl font-bold px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200 border-0"
          >
            <Link href="/submit-voice" className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <span>دير الصوت دابا (Enregistre ton idée)</span>
            </Link>
          </Button>

          {/* Logo below button */}
          <div className="flex justify-center pt-2">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <Image
                src="/fikra_logo_v3.png"
                alt="Fikra Valley"
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Educational Content - Recording Process */}
          <div className="max-w-2xl mx-auto pt-6 space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 text-center">
                كيفاش كيخدم التسجيل؟ (Comment ça marche ?)
              </h3>
              
              <div className="space-y-3 text-sm sm:text-base text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">1️⃣</span>
                  <div>
                    <p className="font-semibold mb-1" dir="rtl">دير كليك و دير الصوت</p>
                    <p className="text-slate-600">Clique et parle. En Darija ou en français.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">2️⃣</span>
                  <div>
                    <p className="font-semibold mb-1" dir="rtl">7 وكلاء ذكاء اصطناعي كيستمعو</p>
                    <p className="text-slate-600">7 agents IA écoutent, analysent et comprennent ton idée.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">3️⃣</span>
                  <div>
                    <p className="font-semibold mb-1" dir="rtl">تحصل على خطة عمل مخصصة</p>
                    <p className="text-slate-600">Tu reçois un plan d'action sur mesure pour transformer ton idée en entreprise.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs sm:text-sm text-slate-600 text-center" dir="rtl">
                  ⚡ كيخدم بلا كتابة. فقط صوتك. كيتم التسجيل تلقائياً.
                </p>
                <p className="text-xs sm:text-sm text-slate-500 text-center">
                  ⚡ Fonctionne sans écrire. Juste ta voix. L'enregistrement est automatique.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators - Agentic AI Focus */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 text-sm sm:text-base">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-lg">🤖</span>
            <span><strong className="text-slate-900">7 agents IA</strong> à ton service</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-lg">💯</span>
            <span><strong className="text-slate-900">بلا فلوس</strong> (Gratuit)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-lg">🔒</span>
            <span>Confidentiel</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-lg">🎯</span>
            <span>Solutions concrètes</span>
          </div>
        </div>

        {/* Browse Link */}
        <div className="pt-8">
          <Link 
            href="/ideas" 
            className="inline-flex items-center gap-2 text-base sm:text-lg text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <span>👀</span>
            <span>Voir les projets existants</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
