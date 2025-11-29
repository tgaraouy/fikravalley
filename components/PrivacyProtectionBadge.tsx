/**
 * Privacy Protection Badge Component
 * 
 * Displays prominent privacy protection information to reassure users
 * that their ideas are safe and protected from theft
 */

'use client';

import { Shield, Lock, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';

interface PrivacyProtectionBadgeProps {
  variant?: 'compact' | 'full' | 'inline';
  showLink?: boolean;
}

export default function PrivacyProtectionBadge({ 
  variant = 'full',
  showLink = true 
}: PrivacyProtectionBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-green-50 border-2 border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">🔒 Vos idées sont protégées</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Privées par défaut</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>100% votre propriété</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Certificat d'enregistrement</span>
              </li>
            </ul>
            {showLink && (
              <Link 
                href="/privacy" 
                className="text-sm text-red-700 hover:text-red-900 underline mt-2 inline-block"
              >
                En savoir plus →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
        <Shield className="w-4 h-4 text-red-600" />
        <span><strong>Protégé :</strong> Votre idée est privée par défaut. 100% votre propriété.</span>
        {showLink && (
          <Link href="/privacy" className="text-red-600 hover:text-red-800 underline ml-2">
            Détails
          </Link>
        )}
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className="bg-gradient-to-r from-red-50 via-amber-50 to-green-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
            🔒 Vos idées sont protégées
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Privées par défaut</h4>
                <p className="text-sm text-slate-700">
                  Votre idée est automatiquement privée. Personne ne peut la voir sans votre permission.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">100% votre propriété</h4>
                <p className="text-sm text-slate-700">
                  Vous gardez 100% de la propriété. Fikra Valley n'a aucun droit sur votre idée.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Certificat d'enregistrement</h4>
                <p className="text-sm text-slate-700">
                  Preuve d'ownership horodatée. Téléchargeable après soumission.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Conformité PDPL</h4>
                <p className="text-sm text-slate-700">
                  Protection légale garantie. Vos données sont chiffrées et sécurisées.
                </p>
              </div>
            </div>
          </div>

          {showLink && (
            <Link 
              href="/privacy" 
              className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-medium text-sm mt-2"
            >
              En savoir plus sur la protection des idées →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

