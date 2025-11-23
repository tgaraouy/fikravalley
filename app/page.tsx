/**
 * SIMPLE HOME PAGE - WhatsApp-Native
 * 
 * Clean, simple, one clear CTA
 * No confusing buttons or complex components
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

export const revalidate = 60;

export default async function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Logo size="lg" showText={true} />
        </div>

        {/* Badge */}
        <div className="inline-block px-4 py-2 bg-orange-100 border border-orange-200 rounded-full">
          <span className="text-sm font-medium text-orange-700">
            🇲🇦 Plateforme Nationale • Partenaire Intilaka
          </span>
        </div>

        {/* Direct Challenge - Darija + French Mix */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center leading-tight">
          <span className="text-slate-900" dir="rtl">
            "عندك فكرة؟ دير صوتك دابا. ب3 دقايق غادي تخرج بخطة عمل."
          </span>
          <br />
          <span className="text-base sm:text-lg text-slate-500 mt-2 block">
            Tu as une idée ? Enregistre-la. Plan d'action en 3 min.
          </span>
        </h1>

        {/* Subtitle - FOMO + Zero Cost + Social Proof */}
        <p className="text-center mt-6 text-lg sm:text-xl text-slate-700" dir="rtl">
          <span className="font-semibold text-slate-900">127</span> شاب كيديروها بصوتهم. بلا فلوس. بلا كتابة.
        </p>
        <p className="text-center mt-2 text-sm text-slate-600">
          127 jeunes l'ont fait à la voix. Gratuit. Sans écrire.
        </p>

        {/* ONE Clear CTA Button - Pattern Interrupt */}
        <div className="pt-6">
          <Button 
            asChild 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg sm:text-xl px-10 py-7 rounded-full shadow-xl transform hover:scale-105 transition-all"
          >
            <Link href="/submit-voice">
              🎤 دير الصوت دابا (Enregistre ta voix)
            </Link>
          </Button>
        </div>

        {/* Trust Indicators - Emphasize Zero Friction */}
        <p className="text-sm text-slate-500 pt-4">
          💯 <strong>بلا فلوس</strong> (Gratuit) • 🔒 Confidentiel • ⚡ 7 agents IA
        </p>

        {/* Simple Link to Browse */}
        <div className="pt-4">
          <Link 
            href="/ideas" 
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            👀 Voir les projets existants
          </Link>
                  </div>
          </div>
    </main>
  );
}
