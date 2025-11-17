'use client';

/**
 * Privacy Controls Component
 * 
 * User dashboard component for managing privacy settings and data rights
 * GDPR Articles 17 & 20 compliance
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

/**
 * Privacy Controls Props
 */
export interface PrivacyControlsProps {
  userId: string;
  phone?: string;
  email?: string;
  language?: 'fr' | 'ar';
}

/**
 * Data summary
 */
interface DataSummary {
  retentionDays: number;
  retentionExpiry: string;
  submissionCount: number;
  consentStatus: {
    submission: boolean;
    analysis: boolean;
    marketing: boolean;
  };
  lastAccess: string | null;
}

/**
 * Privacy Controls Component
 */
export default function PrivacyControls({
  userId,
  phone,
  email,
  language = 'fr',
}: PrivacyControlsProps) {
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [action, setAction] = useState<'delete' | 'export' | null>(null);
  const [processing, setProcessing] = useState(false);

  const translations = {
    fr: {
      title: 'Contrôles de Confidentialité',
      description: 'Gérez vos données personnelles et vos droits',
      dataRetention: 'Conservation des données',
      currentRetention: 'Conservation actuelle',
      retentionExpiry: 'Expire le',
      submissions: 'Soumissions',
      consents: 'Consentements',
      lastAccess: 'Dernier accès',
      actions: 'Actions',
      requestExport: 'Demander l\'export de mes données',
      changeRetention: 'Modifier la conservation',
      withdrawConsent: 'Retirer le consentement',
      deleteData: 'Supprimer toutes mes données',
      deleteWarning: 'Cette action est irréversible. Toutes vos données seront supprimées après une période de grâce de 7 jours.',
      exportWarning: 'Vous pouvez demander un export de vos données une fois par 24 heures.',
      verificationCode: 'Code de vérification',
      enterCode: 'Entrez le code reçu par WhatsApp/email',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      processing: 'Traitement en cours...',
      success: 'Succès',
      error: 'Erreur',
    },
    ar: {
      title: 'ضوابط الخصوصية',
      description: 'إدارة بياناتك الشخصية وحقوقك',
      dataRetention: 'الاحتفاظ بالبيانات',
      currentRetention: 'الاحتفاظ الحالي',
      retentionExpiry: 'ينتهي في',
      submissions: 'الطلبات',
      consents: 'الموافقات',
      lastAccess: 'آخر وصول',
      actions: 'الإجراءات',
      requestExport: 'طلب تصدير بياناتي',
      changeRetention: 'تغيير مدة الاحتفاظ',
      withdrawConsent: 'سحب الموافقة',
      deleteData: 'حذف جميع بياناتي',
      deleteWarning: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بعد فترة سماح مدتها 7 أيام.',
      exportWarning: 'يمكنك طلب تصدير بياناتك مرة واحدة كل 24 ساعة.',
      verificationCode: 'رمز التحقق',
      enterCode: 'أدخل الرمز المستلم عبر WhatsApp/البريد الإلكتروني',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      processing: 'جاري المعالجة...',
      success: 'نجح',
      error: 'خطأ',
    },
  };

  const t = translations[language];

  // Fetch data summary
  useEffect(() => {
    fetchDataSummary();
  }, [userId]);

  const fetchDataSummary = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from API
      // For now, use placeholder
      setDataSummary({
        retentionDays: 90,
        retentionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        submissionCount: 0,
        consentStatus: {
          submission: true,
          analysis: true,
          marketing: false,
        },
        lastAccess: null,
      });
    } catch (error) {
      console.error('Error fetching data summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExport = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/privacy/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone,
          email,
          format: 'json',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request export');
      }

      const data = await response.json();
      setAction('export');
      setExportDialogOpen(true);
      alert(t.success + ': ' + data.message);
    } catch (error) {
      console.error('Error requesting export:', error);
      alert(t.error + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestDelete = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/privacy/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone,
          email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request deletion');
      }

      const data = await response.json();
      setAction('delete');
      setDeleteDialogOpen(true);
      alert(t.success + ': ' + data.message);
    } catch (error) {
      console.error('Error requesting deletion:', error);
      alert(t.error + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!verificationCode.trim()) {
      alert('Please enter verification code');
      return;
    }

    try {
      setProcessing(true);
      const endpoint = action === 'delete' ? '/api/privacy/delete' : '/api/privacy/export';
      const method = action === 'delete' ? 'PUT' : 'GET';

      if (action === 'delete') {
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deletionId: 'xxx', // TODO: Get from initial request
            verificationCode,
            action: 'confirm',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to confirm deletion');
        }

        alert('Deletion confirmed. Your data will be deleted within 24 hours.');
        setDeleteDialogOpen(false);
      } else {
        // Export - redirect to download
        const exportId = 'xxx'; // TODO: Get from initial request
        window.location.href = `/api/privacy/export?exportId=${exportId}&otp=${verificationCode}`;
        setExportDialogOpen(false);
      }
    } catch (error) {
      console.error('Error confirming action:', error);
      alert(t.error + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
      setVerificationCode('');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading privacy controls...</div>;
  }

  if (!dataSummary) {
    return <div className="text-center py-8">Unable to load privacy controls</div>;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Retention */}
          <div>
            <h3 className="font-semibold mb-3">{t.dataRetention}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t.currentRetention}</span>
                <Badge>{dataSummary.retentionDays} {language === 'fr' ? 'jours' : 'يوماً'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t.retentionExpiry}</span>
                <span className="text-sm">
                  {new Date(dataSummary.retentionExpiry).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div>
            <h3 className="font-semibold mb-3">{language === 'fr' ? 'Résumé des données' : 'ملخص البيانات'}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t.submissions}</span>
                <Badge>{dataSummary.submissionCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t.consents}</span>
                <div className="flex gap-2">
                  {dataSummary.consentStatus.submission && (
                    <Badge className="bg-green-100 text-green-800">
                      {language === 'fr' ? 'Soumission' : 'تقديم'}
                    </Badge>
                  )}
                  {dataSummary.consentStatus.analysis && (
                    <Badge className="bg-green-100 text-green-800">
                      {language === 'fr' ? 'Analyse' : 'تحليل'}
                    </Badge>
                  )}
                  {dataSummary.consentStatus.marketing && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {language === 'fr' ? 'Marketing' : 'التسويق'}
                    </Badge>
                  )}
                </div>
              </div>
              {dataSummary.lastAccess && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t.lastAccess}</span>
                  <span className="text-sm">
                    {new Date(dataSummary.lastAccess).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-semibold mb-3">{t.actions}</h3>
            <div className="space-y-3">
              <Button
                variant="secondary"
                onClick={handleRequestExport}
                disabled={processing}
                className="w-full"
              >
                {t.requestExport}
              </Button>
              <Button
                variant="secondary"
                onClick={() => alert('Feature coming soon')}
                disabled={processing}
                className="w-full"
              >
                {t.changeRetention}
              </Button>
              <Button
                variant="secondary"
                onClick={() => alert('Feature coming soon')}
                disabled={processing}
                className="w-full"
              >
                {t.withdrawConsent}
              </Button>
              <Button
                variant="secondary"
                className="w-full bg-red-50 text-red-700 hover:bg-red-100"
                onClick={handleRequestDelete}
                disabled={processing}
              >
                {t.deleteData}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteData}</DialogTitle>
            <DialogDescription>{t.deleteWarning}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="delete-code">{t.verificationCode}</Label>
              <Input
                id="delete-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t.enterCode}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={!verificationCode.trim() || processing}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? t.processing : t.confirm}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.requestExport}</DialogTitle>
            <DialogDescription>{t.exportWarning}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-code">{t.verificationCode}</Label>
              <Input
                id="export-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t.enterCode}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setExportDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={!verificationCode.trim() || processing}
              >
                {processing ? t.processing : t.confirm}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

