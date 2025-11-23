/**
 * SIMPLE UNIVERSITY - WhatsApp-Forwarding
 * 
 * No subscribe forms
 * Each module = WhatsApp forward button
 * Track engagement via link clicks
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MODULES = [
  {
    id: 'mvp-canvas',
    title: 'MVP فالمدار',
    description: 'كيفاش تبني MVP',
    whatsappMessage: 'خاصك هاد درس: كيفاش تبني MVP\n\nhttps://fikravalley.com/modules/mvp-canvas'
  },
  {
    id: 'problem-validation',
    title: 'Validation de Problème',
    description: 'كيفاش تتحقق من المشكل',
    whatsappMessage: 'خاصك هاد درس: كيفاش تتحقق من المشكل\n\nhttps://fikravalley.com/modules/problem-validation'
  },
  {
    id: 'evidence-collection',
    title: 'Collecte de Preuves',
    description: 'كيفاش تجمع الأدلة',
    whatsappMessage: 'خاصك هاد درس: كيفاش تجمع الأدلة\n\nhttps://fikravalley.com/modules/evidence-collection'
  },
  {
    id: 'intilaka-prep',
    title: 'Préparation Intilaka',
    description: 'كيفاش تتهيأ ل Intilaka',
    whatsappMessage: 'خاصك هاد درس: كيفاش تتهيأ ل Intilaka\n\nhttps://fikravalley.com/modules/intilaka-prep'
  }
];

export default function SimpleUniversityPage() {
  const shareModule = (module: typeof MODULES[0]) => {
    // Direct WhatsApp share (no form, no typing)
    window.open(`https://wa.me/?text=${encodeURIComponent(module.whatsappMessage)}`, '_blank');
    
    // Track engagement (link click)
    fetch('/api/university/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: module.id, action: 'share' })
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🎓 Modules Universitaires
          </h1>
          <p className="text-lg text-slate-600">
            شارك فالواتساب (Share on WhatsApp) - 99% d'ouverture!
          </p>
        </div>

        <div className="space-y-4">
          {MODULES.map((module) => (
            <Card key={module.id} className="border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">{module.description}</p>
                <Button
                  onClick={() => shareModule(module)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
                >
                  📤 شارك فالواتساب (Share on WhatsApp)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 Comment ça marche?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Clique "Share" → Ouvre WhatsApp</li>
              <li>✅ Forward à tes amis (comme un message normal)</li>
              <li>✅ On track les clics (pas de formulaire)</li>
              <li>✅ 99% d'ouverture vs. 20% email</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

