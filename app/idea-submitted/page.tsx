/**
 * Idea Submitted Success Page
 * 
 * Shows tracking code and next steps
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Mail, Phone } from 'lucide-react';

import { detectLanguage, type Language } from '@/lib/constants/tagline';
import IdeaRewardScreen from '@/components/reward/IdeaRewardScreen';

export default function IdeaSubmittedPage() {
  const searchParams = useSearchParams();
  const trackingCode = searchParams.get('tracking_code');
  const email = searchParams.get('email');
  const ideaNumberParam = searchParams.get('idea_number');
  const ideaNumber = ideaNumberParam ? parseInt(ideaNumberParam, 10) : 128;
  const [copied, setCopied] = useState(false);
  const [showReward, setShowReward] = useState(true); // Show reward screen first
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const detected = detectLanguage();
    setLanguage(detected);
  }, []);

  const copyToClipboard = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show reward screen first, then success page
  if (showReward) {
    return (
      <IdeaRewardScreen
        ideaNumber={ideaNumber}
        language={language}
        onNext={() => setShowReward(false)}
        onSkip={() => setShowReward(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
          ✅ Idée soumise avec succès!
        </h1>

        <p className="text-center text-slate-600 mb-8">
          Votre idée a été enregistrée. Utilisez ce code pour la suivre.
        </p>

        {/* Tracking Code Card */}
        {trackingCode && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Votre code de suivi:
                </p>
                <p className="text-3xl font-bold text-blue-900 font-mono">
                  {trackingCode}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-white rounded-lg shadow hover:bg-slate-50 transition-colors"
                title="Copier"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {email && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-5 h-5" />
              <span className="text-sm">
                Un email de confirmation a été envoyé à <strong>{email}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-slate-900">Prochaines étapes:</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium text-slate-900">Sauvegardez votre code</p>
                <p className="text-sm text-slate-600">
                  Notez <code className="bg-slate-100 px-2 py-1 rounded">{trackingCode || 'VOTRE-CODE'}</code> quelque part sûr
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium text-slate-900">Vérifiez votre email</p>
                <p className="text-sm text-slate-600">
                  {email ? `Un email a été envoyé à ${email}` : 'Vérifiez votre boîte email pour le code de confirmation'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-medium text-slate-900">Suivez votre idée</p>
                <p className="text-sm text-slate-600">
                  Utilisez votre code pour voir l'état de votre idée
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/track/${trackingCode || ''}`}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition-colors"
          >
            Voir mon idée
          </Link>
          
          <Link
            href="/my-fikras"
            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-center hover:bg-blue-50 transition-colors"
          >
            Mes idées
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            💡 <strong>Astuce:</strong> Vous pouvez partager votre code avec d'autres personnes pour qu'elles puissent suivre votre idée.
          </p>
        </div>
      </div>
    </div>
  );
}

