/**
 * Customization Panel (Power User Tier)
 * 
 * Only accessible when:
 * - 2 completed pods
 * - >60% sprint completion
 * - >3.5/5 task ease score
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  canCustomizeWorkflow, 
  getCustomizationMessage,
  getAvailableTemplates,
  trackCustomizationAttempt,
  type UserWorkflowHistory 
} from '@/lib/workflow/customization-guardrails';

interface CustomizationPanelProps {
  userHistory: UserWorkflowHistory;
}

export default function CustomizationPanel({ userHistory }: CustomizationPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const eligible = canCustomizeWorkflow(userHistory);
  const message = getCustomizationMessage(userHistory);
  const templates = getAvailableTemplates(userHistory);

  const handleCustomize = () => {
    if (!eligible) {
      trackCustomizationAttempt(userHistory.userId);
      alert(message);
      return;
    }

    if (!selectedTemplate) {
      alert('Sélectionne un template');
      return;
    }

    // In production, save custom workflow
    alert(`✅ Workflow personnalisé créé avec le template: ${selectedTemplate}`);
  };

  if (!eligible) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-yellow-900 mb-2">🔒 Personnalisation Verrouillée</h3>
          <p className="text-yellow-800 text-sm mb-4">{message}</p>
          <div className="space-y-2 text-xs text-yellow-700">
            <div className="flex items-center gap-2">
              <span>{userHistory.completedPods >= 2 ? '✅' : '⭕'}</span>
              <span>2 pods complétés ({userHistory.completedPods}/2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{userHistory.sprintCompletionRate >= 0.6 ? '✅' : '⭕'}</span>
              <span>Taux de complétion {'>'}60% ({Math.round(userHistory.sprintCompletionRate * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{userHistory.taskEaseScore >= 3.5 ? '✅' : '⭕'}</span>
              <span>Facilité de tâche {'>'}3.5/5 ({userHistory.taskEaseScore.toFixed(1)}/5)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>⚙️</span>
          <span>Personnalisation du Workflow</span>
          <Badge variant="default" className="ml-auto bg-green-600">
            Débloqué
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Tu as prouvé ta discipline! Tu peux maintenant personnaliser ton workflow.
        </p>

        <div>
          <label className="block text-sm font-medium mb-2">
            Template de Base
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Sélectionne un template...</option>
            {templates.map(template => (
              <option key={template} value={template}>
                {template.replace('template_', '').replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleCustomize}
          disabled={!selectedTemplate}
          className="w-full bg-terracotta-600 hover:bg-terracotta-700"
        >
          🎨 Créer Workflow Personnalisé
        </Button>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <strong>💡 Rappel:</strong> La personnalisation est un privilège gagné par la discipline.
          Les contraintes créent la créativité, pas la liberté totale.
        </div>
      </CardContent>
    </Card>
  );
}

