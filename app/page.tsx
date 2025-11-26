/**
 * COMPACT HOME PAGE - Light Moroccan Colors
 * 
 * All information visible immediately with small navigation buttons
 * Production-ready, multilingual, information-dense
 * Moroccan color scheme: Light red, green, and gold
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { APP_TAGLINE } from '@/lib/constants/tagline';
import LogoWithTagline from '@/components/LogoWithTagline';
import { 
  Mic, 
  Lightbulb, 
  Users, 
  Search, 
  UserPlus, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Target
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Logo & Tagline - Compact */}
        <div className="text-center mb-8">
          <LogoWithTagline 
            size="md" 
            showText={true}
            language="fr"
          />
        </div>

        {/* Main Headlines - Compact Grid (3 Languages) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Darija */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
            <h1 className="text-xl font-bold text-red-900 mb-2" dir="rtl">
              {APP_TAGLINE.main.darija.headline}
            </h1>
            <p className="text-sm text-red-700" dir="rtl">
              {APP_TAGLINE.main.darija.subtext}
            </p>
          </div>

          {/* Tamazight */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <h1 className="text-xl font-bold text-amber-900 mb-2" dir="rtl">
              {APP_TAGLINE.main.tamazight.headline}
            </h1>
            {APP_TAGLINE.main.tamazight.headlineLatin && (
              <p className="text-xs text-amber-700 mb-2 font-medium">
                {APP_TAGLINE.main.tamazight.headlineLatin}
              </p>
            )}
            <p className="text-sm text-amber-700" dir="rtl">
              {APP_TAGLINE.main.tamazight.subtext}
            </p>
            {APP_TAGLINE.main.tamazight.subtextLatin && (
              <p className="text-xs text-amber-600 mt-1">
                {APP_TAGLINE.main.tamazight.subtextLatin}
              </p>
            )}
          </div>

          {/* French */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <h1 className="text-xl font-bold text-green-900 mb-2">
              {APP_TAGLINE.main.fr.headline}
            </h1>
            <p className="text-sm text-green-700">
              {APP_TAGLINE.main.fr.subtext}
            </p>
          </div>
        </div>

        {/* Benefits - One Line (3 Languages) */}
        <div className="text-center mb-6 space-y-2">
          <p className="text-base text-slate-800 font-medium" dir="rtl">
            وكلاء ذكاء اصطناعي كيستمعو لصوتك، كيحللوا فكرتك، وكيخلقو خطة عمل مخصصة.
          </p>
          <p className="text-sm text-amber-800 font-medium" dir="rtl">
            {APP_TAGLINE.valueProposition.tamazight}
          </p>
          {APP_TAGLINE.main.tamazight.subtextLatin && (
            <p className="text-xs text-amber-700 italic">
              {APP_TAGLINE.valueProposition.tamazight}
            </p>
          )}
          <p className="text-sm text-slate-700">
            7 agents IA écoutent ta voix, analysent ton idée, et créent un plan d'action sur mesure.
          </p>
        </div>

        {/* Quick Benefits - Icons Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <Zap className="w-4 h-4 text-amber-600" />
            <span><strong>7 agents IA</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>بلا فلوس</strong> (Gratuit)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Confidentiel</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Solutions concrètes</span>
          </div>
        </div>

        {/* Main CTA - Large Button with Moroccan Colors */}
        <div className="text-center mb-8">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-red-600 via-amber-500 to-green-600 hover:from-red-700 hover:via-amber-600 hover:to-green-700 text-white text-lg font-bold px-8 py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Link href="/submit-voice" className="flex items-center gap-3 justify-center">
              <Mic className="w-5 h-5" />
              <span>دير الصوت دابا (Enregistre ton idée)</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Quick Navigation - Grid of Small Buttons with Moroccan Colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all"
          >
            <Link href="/submit-voice" className="w-full">
              <Mic className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">Soumettre</span>
              <span className="text-xs text-slate-600">Idée vocale</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-amber-300 hover:border-amber-400 hover:bg-amber-50 transition-all"
          >
            <Link href="/ideas" className="w-full">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium">Idées</span>
              <span className="text-xs text-slate-600">Parcourir</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all"
          >
            <Link href="/matching" className="w-full">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Matching</span>
              <span className="text-xs text-slate-600">Mentor-Idée</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all"
          >
            <Link href="/become-mentor" className="w-full">
              <UserPlus className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">Mentor</span>
              <span className="text-xs text-slate-600">Devenir</span>
            </Link>
          </Button>
        </div>

        {/* Gen Z Founder Story */}
        <section className="bg-white/95 backdrop-blur rounded-2xl border-2 border-green-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-2/5 space-y-4 text-slate-700">
              <p className="text-sm uppercase tracking-wide text-green-700 font-semibold">
                قصة مؤثرة • Gen Z Casablanca
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                Inspiration → Mentor Call → Plan d&apos;action
              </h3>
              <p className="text-sm leading-relaxed">
                في مقهى فكازا جاتها شرارة الإلهام. خدمت مع مرشدتها من الدياسبورا عبر فيديو كول، 
                وباش شعارنا <strong>وليناها مشروع</strong> يتحقق، خدمو ف coworking space وخداو فكرتها نحو خطة تشغيل واضحة.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Une idée fulgurante dans un café de Casablanca se transforme en sketch rapide sur carnet.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>
                    Elle partage tout de suite sa vision en visio avec sa mentor de la diaspora, tableau blanc à l&apos;appui pour co-designer l&apos;app.
                  </span>
                </li>
                <li className="flex gap-3">
                  <TrendingUp className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>
                    Ensemble dans un coworking, elles transforment le concept en plan produit, chiffres et roadmap prêts pour l&apos;agent IA.
                  </span>
                </li>
              </ul>
            </div>

            <div className="md:w-3/5 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {[
                {
                  src: '/png/genz-woman_story1.png',
                  title: 'Café Inspiration',
                  caption: 'Casablanca • Carnet & café'
                },
                {
                  src: '/png/genz-woman_story2.png',
                  title: 'Mentor Call',
                  caption: 'Mentorat diaspora sur whiteboard'
                },
                {
                  src: '/png/genz-woman_story3.png',
                  title: 'Coworking Sprint',
                  caption: 'Plan produit prêt pour IA'
                },
              ].map((photo) => (
                <figure key={photo.src} className="bg-slate-50 rounded-xl p-2 border border-amber-100 h-full flex flex-col">
                  <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption>
                    <p className="text-sm font-semibold text-slate-900">{photo.title}</p>
                    <p className="text-xs text-slate-600">{photo.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Compact 3 Steps with Moroccan Colors */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-200 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-900 text-center mb-4">
            كيفاش كيخدم؟ (Comment ça marche ?)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">1️⃣</span>
              </div>
              <p className="font-semibold text-sm mb-1 text-red-900" dir="rtl">دير كليك و دير الصوت</p>
              <p className="text-xs text-slate-600">Clique et parle</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">2️⃣</span>
              </div>
              <p className="font-semibold text-sm mb-1 text-amber-900" dir="rtl">7 وكلاء ذكاء اصطناعي</p>
              <p className="text-xs text-slate-600">7 agents IA analysent</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">3️⃣</span>
              </div>
              <p className="font-semibold text-sm mb-1 text-green-900" dir="rtl">خطة عمل مخصصة</p>
              <p className="text-xs text-slate-600">Plan d'action sur mesure</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-200 text-center space-y-1">
            <p className="text-xs text-slate-700" dir="rtl">
              ⚡ كيخدم بلا كتابة. فقط صوتك. كيتم التسجيل تلقائياً.
            </p>
            <p className="text-xs text-amber-700" dir="rtl">
              ⚡ {APP_TAGLINE.main.tamazight.subtext}
            </p>
            {APP_TAGLINE.main.tamazight.subtextLatin && (
              <p className="text-xs text-amber-600 italic">
                ⚡ {APP_TAGLINE.main.tamazight.subtextLatin}
              </p>
            )}
            <p className="text-xs text-slate-600">
              ⚡ Fonctionne sans écrire. Juste ta voix. L'enregistrement est automatique.
            </p>
          </div>
        </div>

        {/* Additional Quick Links - Small Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-green-50 hover:text-green-700"
          >
            <Link href="/find-mentor">
              <Search className="w-3 h-3 mr-1" />
              Trouver Mentor
            </Link>
          </Button>
          
          <span className="text-slate-300">•</span>
          
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-amber-50 hover:text-amber-700"
          >
            <Link href="/ideas">
              <TrendingUp className="w-3 h-3 mr-1" />
              Idées Populaires
            </Link>
          </Button>
        </div>

        {/* Footer Logo - Small */}
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <Image
              src="/png/FikraValley_flag_logo.png"
              alt="Fikra Valley"
              fill
              sizes="64px"
              className="object-contain opacity-80"
              priority
            />
          </div>
        </div>

      </div>
    </main>
  );
}
