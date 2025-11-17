'use client';

/**
 * Privacy Checklist Verification
 * 
 * Verifies all privacy requirements are met before launch
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'legal' | 'technical' | 'process' | 'user-rights';
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details?: string;
  actionUrl?: string;
}

export default function PrivacyChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'ready' | 'not-ready' | 'warning'>('pending');

  useEffect(() => {
    verifyChecklist();
  }, []);

  const verifyChecklist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/privacy/checklist');
      const data = await response.json();
      setChecklist(data.items || []);
      
      // Calculate overall status
      const fails = data.items.filter((i: ChecklistItem) => i.status === 'fail').length;
      const warnings = data.items.filter((i: ChecklistItem) => i.status === 'warning').length;
      
      if (fails > 0) {
        setOverallStatus('not-ready');
      } else if (warnings > 0) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('ready');
      }
    } catch (error) {
      console.error('Error verifying checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">✓ Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">✗ Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Warning</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const categories = [
    { id: 'legal', name: 'Legal', color: 'blue' },
    { id: 'technical', name: 'Technical', color: 'green' },
    { id: 'process', name: 'Process', color: 'purple' },
    { id: 'user-rights', name: 'User Rights', color: 'orange' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Vérification de la checklist...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Checklist de Confidentialité</h1>
          <p className="text-slate-600 mt-1">Vérification avant le lancement</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            overallStatus === 'ready'
              ? 'bg-green-100 text-green-800'
              : overallStatus === 'warning'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {overallStatus === 'ready' ? '✓ Prêt pour le lancement' :
             overallStatus === 'warning' ? '⚠ Vérifications requises' :
             '✗ Non prêt'}
          </div>
          <Button variant="secondary" onClick={verifyChecklist}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-2">Total</p>
            <p className="text-3xl font-bold">{checklist.length}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700 mb-2">✓ Pass</p>
            <p className="text-3xl font-bold text-green-800">
              {checklist.filter((i) => i.status === 'pass').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-700 mb-2">⚠ Warning</p>
            <p className="text-3xl font-bold text-yellow-800">
              {checklist.filter((i) => i.status === 'warning').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700 mb-2">✗ Fail</p>
            <p className="text-3xl font-bold text-red-800">
              {checklist.filter((i) => i.status === 'fail').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist by Category */}
      {categories.map((category) => {
        const categoryItems = checklist.filter((item) => item.category === category.id);
        if (categoryItems.length === 0) return null;

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>
                {categoryItems.filter((i) => i.status === 'pass').length} / {categoryItems.length} complétés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg ${
                      item.status === 'pass'
                        ? 'border-green-200 bg-green-50'
                        : item.status === 'fail'
                        ? 'border-red-200 bg-red-50'
                        : item.status === 'warning'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                          {item.details && (
                            <p className="text-xs text-slate-500 mt-2">{item.details}</p>
                          )}
                          {item.actionUrl && (
                            <a
                              href={item.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                            >
                              Voir →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Launch Readiness */}
      <Card className={overallStatus === 'ready' ? 'border-green-500' : 'border-red-500'}>
        <CardHeader>
          <CardTitle>Statut de Lancement</CardTitle>
          <CardDescription>
            {overallStatus === 'ready'
              ? 'Tous les éléments critiques sont en place. Vous pouvez lancer.'
              : overallStatus === 'warning'
              ? 'Certains éléments nécessitent une attention. Vérifiez avant de lancer.'
              : 'Des éléments critiques manquent. Ne lancez pas encore.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overallStatus !== 'ready' && (
            <div className="space-y-2">
              <p className="font-semibold">Actions requises:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {checklist
                  .filter((i) => i.status === 'fail')
                  .map((item) => (
                    <li key={item.id}>{item.title}</li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

