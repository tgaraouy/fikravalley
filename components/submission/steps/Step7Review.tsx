'use client';

/**
 * Step 7: Review & Submit
 * 
 * Preview, payment, and final submission
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';
import { autoTagSDGs, type IdeaScoringInput } from '@/lib/idea-bank/scoring';
// Simple icon components
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface SubmissionData {
  problemStatement: string;
  asIsAnalysis: string;
  benefitStatement: string;
  solution: string;
  timeSavedHours: number;
  costSavedEur: number;
  estimatedCost: string;
  dataSources: string[];
  integrationPoints: string[];
  aiCapabilities: string[];
  location: string;
  category: string;
  moroccoPriorities?: string[];
  otherAlignment?: string;
  submitterName?: string;
  submitterEmail?: string;
  submitterPhone?: string;
  submitterType?: string;
  submitterSkills?: string[];
}

interface Step7ReviewProps {
  data: SubmissionData;
  clarityScore?: number;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  language?: 'fr' | 'ar' | 'darija';
  onSubmitterNameChange?: (value: string) => void;
  onSubmitterEmailChange?: (value: string) => void;
  onSubmitterPhoneChange?: (value: string) => void;
  onSubmitterTypeChange?: (value: string) => void;
}

export default function Step7Review({
  data,
  clarityScore,
  onEdit,
  onSubmit,
  isSubmitting,
  language = 'fr',
  onSubmitterNameChange,
  onSubmitterEmailChange,
  onSubmitterPhoneChange,
  onSubmitterTypeChange,
}: Step7ReviewProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [sdgPreview, setSdgPreview] = useState<{ sdgTags: number[]; sdgConfidence: { [sdg: number]: number } }>({
    sdgTags: [],
    sdgConfidence: {}
  });

  // Auto-generate SDG tags for preview
  useEffect(() => {
    async function previewSDGs() {
      if (data.moroccoPriorities && data.moroccoPriorities.length > 0) {
        const input: IdeaScoringInput = {
          problemStatement: data.problemStatement,
          asIsAnalysis: data.asIsAnalysis,
          benefitStatement: data.benefitStatement,
          operationalNeeds: '',
          alignment: {
            moroccoPriorities: data.moroccoPriorities,
            sdgTags: [],
            sdgAutoTagged: false,
            sdgConfidence: {}
          }
        };
        const sdgs = autoTagSDGs(input);
        setSdgPreview(sdgs);
      }
    }
    previewSDGs();
  }, [data.moroccoPriorities, data.problemStatement, data.benefitStatement]);

  const validationChecks = [
    {
      label: 'Problème décrit',
      passed: data.problemStatement.length >= 20,
    },
    {
      label: 'Nom du soumissionnaire',
      passed: !!(data.submitterName && data.submitterName.length >= 2),
    },
    {
      label: 'Email valide',
      passed: !!(data.submitterEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.submitterEmail)),
    },
    {
      label: 'Type de profil sélectionné',
      passed: !!data.submitterType,
    },
    {
      label: 'Processus actuel analysé',
      passed: data.asIsAnalysis.length >= 30,
    },
    {
      label: 'Bénéfices quantifiés',
      passed: data.benefitStatement.length >= 30 && (data.timeSavedHours > 0 || data.costSavedEur > 0),
    },
    {
      label: 'Solution proposée',
      passed: data.solution.length >= 20,
    },
    {
      label: 'Sources de données identifiées',
      passed: data.dataSources.length > 0,
    },
    {
      label: 'Localisation et catégorie',
      passed: data.location.length > 0 && data.category.length > 0,
    },
  ];

  const allPassed = validationChecks.every((check) => check.passed);
  const passedCount = validationChecks.filter((check) => check.passed).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">7. Révision et soumission</h2>
        <p className="text-slate-600 mt-1">Vérifiez votre soumission avant de l'envoyer</p>
      </div>

      {/* Validation Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Vérification</CardTitle>
          <CardDescription>
            {passedCount} / {validationChecks.length} vérifications réussies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationChecks.map((check, index) => (
              <div key={index} className="flex items-center gap-3">
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={check.passed ? 'text-green-800' : 'text-red-800'}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clarity Score */}
      {clarityScore !== undefined && (
        <Card className={clarityScore >= 6 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardHeader>
            <CardTitle className={clarityScore >= 6 ? 'text-green-900' : 'text-yellow-900'}>
              Score de clarté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{clarityScore.toFixed(1)}/10</p>
                <p className="text-sm text-slate-600 mt-1">
                  {clarityScore >= 6 ? '✓ Excellent' : clarityScore >= 4 ? '⚠ Améliorable' : '✗ Insuffisant'}
                </p>
              </div>
              {clarityScore < 6 && (
                <Button variant="outline" onClick={() => onEdit(1)}>
                  Améliorer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu de votre soumission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Problème</h3>
            <p className="text-sm text-slate-600 line-clamp-3">{data.problemStatement}</p>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)} className="mt-2">
              Modifier
            </Button>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Solution</h3>
            <p className="text-sm text-slate-600 line-clamp-3">{data.solution}</p>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)} className="mt-2">
              Modifier
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Localisation</p>
              <p className="text-sm text-slate-600">{data.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Catégorie</p>
              <p className="text-sm text-slate-600">{data.category}</p>
            </div>
          </div>

          {(data.timeSavedHours > 0 || data.costSavedEur > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Temps économisé</p>
                <p className="text-sm text-slate-600">{data.timeSavedHours} heures/mois</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Coût économisé</p>
                <p className="text-sm text-slate-600">{data.costSavedEur} EUR/mois</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alignment Section */}
      {(data.moroccoPriorities && data.moroccoPriorities.length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">
              {language === 'darija' ? 'Alignement' : 'Alignement Stratégique'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Morocco Priorities (prominent) */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>🇲🇦</span>
                {language === 'darija' ? 'Priorités Marocaines' : 'Priorités Nationales'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.moroccoPriorities.map(id => {
                  const priority = MOROCCO_PRIORITIES.find(p => p.id === id);
                  if (!priority) return null;
                  return (
                    <Badge key={id} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                      {language === 'darija' ? priority.nameDarija : priority.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            {/* SDG Preview (subtle, educational) */}
            {sdgPreview.sdgTags && sdgPreview.sdgTags.length > 0 && (
              <div className="pt-4 border-t border-green-200">
                <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <span>🌍</span>
                  {language === 'darija' 
                    ? 'SDGs (détectés automatiquement)'
                    : 'Objectifs de Développement Durable (auto-détectés)'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sdgPreview.sdgTags.map(sdg => (
                    <Badge 
                      key={sdg} 
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200"
                      title={`Confidence: ${Math.round((sdgPreview.sdgConfidence[sdg] || 0) * 100)}%`}
                    >
                      SDG {sdg}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'darija'
                    ? 'Had SDGs تمّ اكتشافهم automatically من fikrtak. Ghadi تقدر تعدّلهم من بعد.'
                    : 'Ces SDGs ont été détectés automatiquement. Vous pourrez les modifier après soumission.'}
                </p>
              </div>
            )}

            {/* Other Alignment */}
            {data.otherAlignment && (
              <div className="pt-4 border-t border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {language === 'darija' ? 'Autre alignement' : 'Autre alignement'}
                </p>
                <p className="text-sm text-gray-600">{data.otherAlignment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">
            {language === 'darija' ? 'Informations de contact' : 'Informations de contact'}
          </CardTitle>
          <CardDescription>
            {language === 'darija' 
              ? 'Bach n9dro nwassluk m3a l-follow-up'
              : 'Pour vous contacter pour le suivi de votre idée'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                {language === 'darija' ? 'Smytk' : 'Nom complet'} *
              </label>
              <input
                type="text"
                value={data.submitterName || ''}
                onChange={(e) => onSubmitterNameChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                placeholder={language === 'darija' ? 'Smytk kamla' : 'Votre nom complet'}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                {language === 'darija' ? 'Email' : 'Email'} *
              </label>
              <input
                type="email"
                value={data.submitterEmail || ''}
                onChange={(e) => onSubmitterEmailChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                {language === 'darija' ? 'Téléphone (optionnel)' : 'Téléphone (optionnel)'}
              </label>
              <input
                type="tel"
                value={data.submitterPhone || ''}
                onChange={(e) => onSubmitterPhoneChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                placeholder="212612345678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                {language === 'darija' ? 'Type de profil' : 'Type de profil'} *
              </label>
              <select
                value={data.submitterType || ''}
                onChange={(e) => onSubmitterTypeChange?.(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                required
              >
                <option value="">{language === 'darija' ? 'Khtar...' : 'Sélectionnez...'}</option>
                <option value="student">{language === 'darija' ? 'Taleb' : 'Étudiant'}</option>
                <option value="professional">{language === 'darija' ? 'Professional' : 'Professionnel'}</option>
                <option value="entrepreneur">{language === 'darija' ? 'Entrepreneur' : 'Entrepreneur'}</option>
                <option value="diaspora">{language === 'darija' ? 'Diaspora' : 'Diaspora'}</option>
                <option value="government">{language === 'darija' ? 'Government' : 'Gouvernement'}</option>
                <option value="researcher">{language === 'darija' ? 'B7ith' : 'Chercheur'}</option>
                <option value="other">{language === 'darija' ? 'Khra' : 'Autre'}</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {language === 'darija'
              ? '* Champs requis. Ghadi nst3mlo had l-info bach nwassluk m3a l-follow-up.'
              : '* Champs requis. Nous utiliserons ces informations pour vous contacter concernant le suivi de votre idée.'}
          </p>
        </CardContent>
      </Card>

      {/* Payment (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse IA (Gratuite)</CardTitle>
          <CardDescription>
            Toutes les soumissions reçoivent une analyse IA gratuite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              ✓ Analyse IA gratuite incluse
            </p>
            <p className="text-green-700 text-xs mt-1">
              Votre idée sera analysée automatiquement après soumission
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => onEdit(1)}
          disabled={isSubmitting}
          className="flex-1"
        >
          Modifier
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!allPassed || isSubmitting}
          size="lg"
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">⏳</span>
              Soumission en cours...
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span>
              Soumettre l'idée
            </>
          )}
        </Button>
      </div>

      {!allPassed && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Veuillez compléter tous les champs requis avant de soumettre
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

