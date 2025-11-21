/**
 * University Partnership Page
 * 
 * Only accessible when pods show >50% completion
 * WhatsApp-first delivery, Darija/French modules
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isPodReadyForScaling } from '@/lib/workflow/journey-pods';

export default function UniversityPage() {
  const [eligible, setEligible] = useState(false);
  const [userPods, setUserPods] = useState<any[]>([]);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Check if user has pods with >50% completion
    // In production, fetch from API
    const mockPods = [
      { id: '1', sprintCompletionRate: 0.65, taskEaseScore: 4.2 }
    ];
    
    const hasEligiblePod = mockPods.some(pod => isPodReadyForScaling(pod as any));
    setEligible(hasEligiblePod);
    setUserPods(mockPods);
  }, []);

  const handleSubscribe = async () => {
    if (!phone.trim()) {
      alert('Entre ton numéro WhatsApp');
      return;
    }

    // Send first module via WhatsApp
    const res = await fetch('/api/whatsapp/send-module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        moduleUrl: 'https://fikravalley.com/modules/intro',
        moduleName: 'Introduction à Fikra Valley'
      })
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Module envoyé sur WhatsApp! Vérifie ton téléphone.');
    }
  };

  if (!eligible) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-yellow-900 mb-4">
                🎓 Partenariats Universitaires
              </h2>
              <p className="text-yellow-800 mb-4">
                Pour accéder aux modules universitaires, ton pod doit avoir un taux de complétion {'>'}50%.
              </p>
              <p className="text-sm text-yellow-700">
                Continue à travailler avec ton pod pour débloquer cette fonctionnalité!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🎓 Modules Universitaires
          </h1>
          <p className="text-lg text-slate-600">
            Reçois des modules directement sur WhatsApp (99% d'ouverture!)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📱 Inscription WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Numéro WhatsApp (06...)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0612345678"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <Button
              onClick={handleSubscribe}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              📱 S'abonner aux Modules WhatsApp
            </Button>
            <p className="text-xs text-slate-600">
              💡 99% d'ouverture vs. 20% email. Reçois les modules directement sur WhatsApp!
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📚 Modules Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Introduction à Fikra Valley', lang: 'FR/Darija', duration: '5 min' },
                { name: 'Validation de Problème', lang: 'FR/Darija', duration: '10 min' },
                { name: 'Collecte de Preuves', lang: 'FR/Darija', duration: '15 min' },
                { name: 'Préparation Intilaka', lang: 'FR/Darija', duration: '20 min' },
              ].map((module, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{module.name}</h4>
                    <p className="text-sm text-slate-600">
                      {module.lang} • {module.duration}
                    </p>
                  </div>
                  <Badge variant="outline">Disponible</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-blue-900 mb-2">💡 Accessibilité</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Sous-titres pour malentendants</li>
              <li>✅ Audio en Darija et Français</li>
              <li>✅ Optimisé pour transport public (bruit)</li>
              <li>✅ WhatsApp-first (99% d'ouverture)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

