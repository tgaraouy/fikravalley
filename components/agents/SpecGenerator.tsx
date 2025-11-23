/**
 * Spec Generator UI Component
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { ProductSpec } from '@/lib/agents/spec-agent';

export default function SpecGenerator() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<ProductSpec | null>(null);

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/agents/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      const data = await res.json();
      if (data.success) {
        setSpec(data.data);
      }
    } catch (error) {
      console.error('Error generating spec:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Générer un Spec Produit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Ton Idée
          </label>
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ex: App pour cours de physique en Darija"
            rows={3}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!idea.trim() || loading}
          className="w-full"
        >
          {loading ? 'Génération...' : 'Générer le Spec'}
        </Button>

        {spec && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div>
              <h3 className="font-semibold mb-2">Problème (Darija)</h3>
              <p className="text-sm text-slate-600">{spec.problem_darija}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Problème (Français)</h3>
              <p className="text-sm text-slate-600">{spec.problem_fr}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contraintes</h3>
              <div className="flex flex-wrap gap-2">
                {spec.constraints.map((constraint, i) => (
                  <Badge key={i} variant="outline">{constraint}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Métrique de Succès</h3>
              <p className="text-sm text-slate-600">
                <strong>{spec.success_metric.target}</strong> en{' '}
                <strong>{spec.success_metric.timeframe}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {spec.success_metric.real_user_definition}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Cas Limite</h3>
              <p className="text-sm text-slate-600">
                <strong>{spec.edge_case.scenario}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Solution: {spec.edge_case.solution}
              </p>
            </div>

            {spec.distribution_channel && (
              <div>
                <h3 className="font-semibold mb-2">Canal de Distribution</h3>
                <p className="text-sm text-slate-600">{spec.distribution_channel}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

