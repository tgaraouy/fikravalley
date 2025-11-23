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

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-orange-600">Men l'Fikra</span>{' '}
          <span className="text-slate-400">|</span>{' '}
          <span className="text-indigo-600">Machroû3</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-xl mx-auto">
          Tu as une <strong>fikra</strong> pour le Maroc? 7 agents IA t'aident à la valider, collecter des preuves,
          trouver un mentor, et préparer ton dossier <strong>Intilaka/ETIC</strong> en moins de 30 minutes.
        </p>

        {/* ONE Clear CTA Button */}
        <div className="pt-4">
          <Button 
            asChild 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full shadow-xl"
          >
            <Link href="/submit-voice">
              🎤 دير الصوت دابا (Parle maintenant)
            </Link>
          </Button>
        </div>

        {/* Simple Trust Indicators */}
        <p className="text-sm text-slate-500 pt-2">
          💯 Gratuit • 🔒 Confidentiel • ⚡ 7 agents IA en direct
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
