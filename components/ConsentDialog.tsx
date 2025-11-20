'use client';

/**
 * Consent Dialog Component
 * 
 * GDPR-compliant consent collection before data collection
 * Integrates with ConsentManager for recording consent
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

/**
 * Consent options
 */
export interface ConsentOptions {
  submission: boolean; // Required
  analysis: boolean; // Required
  marketing: boolean; // Optional
  dataRetention: '90' | '180' | 'indefinite'; // Default: 90
}

/**
 * Consent Dialog Props
 */
export interface ConsentDialogProps {
  open: boolean;
  onAccept: (options: ConsentOptions) => void | Promise<void>;
  onDecline: () => void;
  userId?: string;
  phone?: string;
  language?: 'fr' | 'ar';
}

/**
 * Consent Dialog Component
 */
export default function ConsentDialog({
  open,
  onAccept,
  onDecline,
  userId,
  phone,
  language = 'fr',
}: ConsentDialogProps) {
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [analysisConsent, setAnalysisConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataRetention, setDataRetention] = useState<'90' | '180' | 'indefinite'>('90');
  const [loading, setLoading] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSubmissionConsent(false);
      setAnalysisConsent(false);
      setMarketingConsent(false);
      setDataRetention('90');
    }
  }, [open]);

  const handleAccept = async () => {
    // Validate required consents
    if (!submissionConsent || !analysisConsent) {
      alert(
        language === 'fr'
          ? 'Vous devez accepter les consentements requis pour continuer.'
          : 'يجب عليك قبول الموافقات المطلوبة للمتابعة.'
      );
      return;
    }

    setLoading(true);
    try {
      const options: ConsentOptions = {
        submission: submissionConsent,
        analysis: analysisConsent,
        marketing: marketingConsent,
        dataRetention,
      };

      await onAccept(options);
    } catch (error) {
      console.error('Error recording consent:', error);
      alert(
        language === 'fr'
          ? 'Erreur lors de l\'enregistrement du consentement. Veuillez réessayer.'
          : 'خطأ في تسجيل الموافقة. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    fr: {
      title: 'Consentement à la collecte de données',
      description: 'Avant de continuer, veuillez lire notre politique de confidentialité et donner votre consentement.',
      privacyLink: 'Lire la politique de confidentialité',
      required: '(Requis)',
      optional: '(Optionnel)',
      submissionLabel: 'Je consens à la collecte de données pour la soumission de mon idée',
      analysisLabel: 'Je consens à l\'analyse IA de mon idée',
      marketingLabel: 'Je consens à recevoir des mises à jour par email concernant mon idée',
      retentionLabel: 'Durée de conservation des données',
      retention90: '90 jours (par défaut)',
      retention180: '180 jours',
      retentionIndefinite: 'Jusqu\'à ce que je les supprime',
      accept: 'Accepter',
      decline: 'Refuser',
      declineMessage: 'Vous ne pourrez pas soumettre d\'idée sans consentement.',
    },
    ar: {
      title: 'الموافقة على جمع البيانات',
      description: 'قبل المتابعة، يرجى قراءة سياسة الخصوصية وإعطاء موافقتك.',
      privacyLink: 'قراءة سياسة الخصوصية',
      required: '(مطلوب)',
      optional: '(اختياري)',
      submissionLabel: 'أوافق على جمع البيانات لتقديم فكرتي',
      analysisLabel: 'أوافق على تحليل فكرتي بالذكاء الاصطناعي',
      marketingLabel: 'أوافق على تلقي تحديثات عبر البريد الإلكتروني بخصوص فكرتي',
      retentionLabel: 'مدة الاحتفاظ بالبيانات',
      retention90: '90 يوماً (افتراضي)',
      retention180: '180 يوماً',
      retentionIndefinite: 'حتى أقوم بحذفها',
      accept: 'قبول',
      decline: 'رفض',
      declineMessage: 'لن تتمكن من تقديم فكرة دون موافقة.',
    },
  };

  const t = translations[language];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.title}</DialogTitle>
          <DialogDescription>
            <div className="text-base">
            {t.description}
            <br />
            <Link
              href="/privacy"
              target="_blank"
              className="text-indigo-600 hover:underline font-medium"
            >
              {t.privacyLink} →
            </Link>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Required Consents */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">
              {language === 'fr' ? 'Consentements requis' : 'الموافقات المطلوبة'}
            </h3>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="submission"
                checked={submissionConsent}
                onChange={(e) => setSubmissionConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <Label htmlFor="submission" className="flex-1 cursor-pointer">
                {t.submissionLabel} <span className="text-red-600">{t.required}</span>
              </Label>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="analysis"
                checked={analysisConsent}
                onChange={(e) => setAnalysisConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                required
              />
              <Label htmlFor="analysis" className="flex-1 cursor-pointer">
                {t.analysisLabel} <span className="text-red-600">{t.required}</span>
              </Label>
            </div>
          </div>

          {/* Optional Consents */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">
              {language === 'fr' ? 'Consentements optionnels' : 'الموافقات الاختيارية'}
            </h3>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="marketing"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <Label htmlFor="marketing" className="flex-1 cursor-pointer">
                {t.marketingLabel} <span className="text-slate-500">{t.optional}</span>
              </Label>
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t.retentionLabel}</Label>
            <RadioGroup value={dataRetention} onValueChange={(value) => setDataRetention(value as any)}>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <RadioGroupItem value="90" id="retention-90" />
                <Label htmlFor="retention-90" className="flex-1 cursor-pointer">
                  {t.retention90}
                </Label>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <RadioGroupItem value="180" id="retention-180" />
                <Label htmlFor="retention-180" className="flex-1 cursor-pointer">
                  {t.retention180}
                </Label>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <RadioGroupItem value="indefinite" id="retention-indefinite" />
                <Label htmlFor="retention-indefinite" className="flex-1 cursor-pointer">
                  {t.retentionIndefinite}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              {language === 'fr' ? (
                <>
                  En acceptant, vous confirmez avoir lu et compris notre{' '}
                  <Link href="/privacy" target="_blank" className="text-indigo-600 hover:underline">
                    politique de confidentialité
                  </Link>
                  . Vous pouvez retirer votre consentement à tout moment.
                </>
              ) : (
                <>
                  بقبولك، تؤكد أنك قرأت وفهمت{' '}
                  <Link href="/privacy" target="_blank" className="text-indigo-600 hover:underline">
                    سياسة الخصوصية
                  </Link>
                  . يمكنك سحب موافقتك في أي وقت.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onDecline} disabled={loading}>
            {t.decline}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={loading || !submissionConsent || !analysisConsent}
          >
            {loading
              ? language === 'fr'
                ? 'Traitement...'
                : 'جاري المعالجة...'
              : t.accept}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

