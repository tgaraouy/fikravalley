'use client';

/**
 * Step 2: As-Is Analysis
 * 
 * Process builder with cost calculator
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProcessStep {
  id: string;
  description: string;
  timeMinutes: number;
  costEur: number;
}

interface Step2AsIsProps {
  value: string;
  onChange: (value: string) => void;
  processSteps: ProcessStep[];
  onProcessStepsChange: (steps: ProcessStep[]) => void;
  totalTime: number;
  totalCost: number;
}

export default function Step2AsIs({
  value,
  onChange,
  processSteps,
  onProcessStepsChange,
  totalTime,
  totalCost,
}: Step2AsIsProps) {
  const [showBuilder, setShowBuilder] = useState(false);

  const addStep = () => {
    const newStep: ProcessStep = {
      id: Date.now().toString(),
      description: '',
      timeMinutes: 0,
      costEur: 0,
    };
    onProcessStepsChange([...processSteps, newStep]);
  };

  const updateStep = (id: string, field: keyof ProcessStep, newValue: string | number) => {
    onProcessStepsChange(
      processSteps.map((step) =>
        step.id === id ? { ...step, [field]: newValue } : step
      )
    );
  };

  const removeStep = (id: string) => {
    onProcessStepsChange(processSteps.filter((step) => step.id !== id));
  };

  const generateDescription = () => {
    if (processSteps.length === 0) return value;
    
    const stepsText = processSteps
      .map((step, index) => `${index + 1}) ${step.description || 'Étape'}`)
      .join('\n');
    
    return value ? `${value}\n\n${stepsText}` : stepsText;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">2. Comment ça fonctionne actuellement ?</h2>
        <p className="text-slate-600 mt-1">Décrivez le processus actuel étape par étape</p>
      </div>

      {/* Process Builder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Constructeur de processus</CardTitle>
              <CardDescription>
                Ajoutez les étapes du processus actuel avec temps et coût
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBuilder(!showBuilder)}
            >
              {showBuilder ? 'Masquer' : 'Afficher'} le constructeur
            </Button>
          </div>
        </CardHeader>
        {showBuilder && (
          <CardContent className="space-y-4">
            {processSteps.map((step, index) => (
              <Card key={step.id} className="border-slate-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">{index + 1}</Badge>
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label>Description de l'étape</Label>
                        <Input
                          value={step.description}
                          onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                          placeholder="Ex: Le patient remplit un formulaire papier"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Temps (minutes)</Label>
                          <Input
                            type="number"
                            value={step.timeMinutes}
                            onChange={(e) => updateStep(step.id, 'timeMinutes', parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Coût (EUR)</Label>
                          <Input
                            type="number"
                            value={step.costEur}
                            onChange={(e) => updateStep(step.id, 'costEur', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                      className="text-red-600"
                    >
                      ✗
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addStep} className="w-full">
              + Ajouter une étape
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Cost Calculator Summary */}
      {(totalTime > 0 || totalCost > 0) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">📊 Résumé du processus actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Temps total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalTime} min
                </p>
                <p className="text-xs text-blue-600">
                  {Math.round(totalTime / 60 * 10) / 10} heures
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Coût total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalCost.toFixed(2)} EUR
                </p>
                <p className="text-xs text-blue-600">
                  Par processus
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description détaillée</CardTitle>
          <CardDescription>
            Décrivez le processus actuel en détail (ou générez depuis le constructeur)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ex: Actuellement, le processus est le suivant: 1) Le patient arrive avec un papier, 2) L'infirmière cherche le dossier dans des classeurs, 3) Elle remplit un formulaire papier, 4) Le dossier est rangé manuellement. Ce processus prend 15-20 minutes par patient."
            rows={6}
            className="resize-none"
          />
          {processSteps.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(generateDescription())}
              className="mt-2"
            >
              Générer depuis le constructeur
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

