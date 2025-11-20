'use client';

/**
 * Step 3: Benefits
 * 
 * ROI calculator with visualizer
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Step3BenefitsProps {
  value: string;
  onChange: (value: string) => void;
  timeSavedHours: number;
  onTimeSavedChange: (hours: number) => void;
  costSavedEur: number;
  onCostSavedChange: (eur: number) => void;
  estimatedCost: string;
  onEstimatedCostChange: (cost: string) => void;
}

export default function Step3Benefits({
  value,
  onChange,
  timeSavedHours,
  onTimeSavedChange,
  costSavedEur,
  onCostSavedChange,
  estimatedCost,
  onEstimatedCostChange,
}: Step3BenefitsProps) {
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');

  // Calculate ROI
  const monthlyTimeSaved = timeframe === 'month' ? timeSavedHours : timeSavedHours / 12;
  const monthlyCostSaved = timeframe === 'month' ? costSavedEur : costSavedEur / 12;
  const annualSavings = costSavedEur;
  const cost = parseFloat(estimatedCost.replace(/[^0-9.]/g, '')) || 0;
  const roiMonths = monthlyCostSaved > 0 ? cost / monthlyCostSaved : null;
  const roiPercentage = cost > 0 ? ((annualSavings - cost) / cost) * 100 : 0;

  // Chart data
  const chartData = [
    { name: 'Temps économisé', value: monthlyTimeSaved, type: 'hours' },
    { name: 'Coût économisé', value: monthlyCostSaved, type: 'eur' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">3. Quels sont les bénéfices ?</h2>
        <p className="text-slate-600 mt-1">Quantifiez les bénéfices de votre solution</p>
      </div>

      {/* ROI Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Calculateur de ROI</CardTitle>
          <CardDescription>
            Calculez le retour sur investissement de votre solution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Temps économisé ({timeframe === 'month' ? 'heures/mois' : 'heures/an'})</Label>
              <Input
                type="number"
                value={timeSavedHours}
                onChange={(e) => onTimeSavedChange(parseFloat(e.target.value) || 0)}
                min="0"
                placeholder="Ex: 40"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant={timeframe === 'month' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('month')}
                >
                  Par mois
                </Button>
                <Button
                  variant={timeframe === 'year' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('year')}
                >
                  Par an
                </Button>
              </div>
            </div>
            <div>
              <Label>Coût économisé ({timeframe === 'month' ? 'EUR/mois' : 'EUR/an'})</Label>
              <Input
                type="number"
                value={costSavedEur}
                onChange={(e) => onCostSavedChange(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="Ex: 500"
              />
            </div>
          </div>

          <div>
            <Label>Coût estimé de la solution</Label>
            <Input
              value={estimatedCost}
              onChange={(e) => onEstimatedCostChange(e.target.value)}
              placeholder="Ex: 3K-5K, 5000, <1K"
            />
          </div>
        </CardContent>
      </Card>

      {/* ROI Results */}
      {(timeSavedHours > 0 || costSavedEur > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-sm">💰 Retour sur investissement</CardTitle>
            </CardHeader>
            <CardContent>
              {roiMonths ? (
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    {roiMonths.toFixed(1)} mois
                  </p>
                  <p className="text-sm text-green-700">
                    Temps de récupération
                  </p>
                  {roiMonths <= 24 ? (
                    <Badge className="bg-green-600 text-white mt-2">✓ Faisable</Badge>
                  ) : (
                    <Badge className="bg-yellow-600 text-white mt-2">⚠ Long terme</Badge>
                  )}
                </div>
              ) : (
                <p className="text-green-700">Remplissez les champs pour calculer</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-sm">📈 ROI Annuel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-900">
                {roiPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-blue-700">
                {annualSavings.toFixed(2)} EUR économisés / {cost.toFixed(2)} EUR investis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualizer */}
      {(timeSavedHours > 0 || costSavedEur > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Visualisation des bénéfices</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Benefit Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description des bénéfices</CardTitle>
          <CardDescription>
            Décrivez en détail les bénéfices de votre solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ex: Avec un système digital, nous économiserons 2 heures par jour par infirmière, soit 40 heures par mois. Cela représente 500 EUR d'économies mensuelles par hôpital. Les patients attendront 50% moins de temps."
            rows={6}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}

