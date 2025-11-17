'use client';

/**
 * Step 6: Operations
 * 
 * Team, tech, budget, and Morocco alignment
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';
import { detectMoroccoPrioritiesWithConfidence } from '@/lib/nlp';

interface Step6OperationsProps {
  dataSources: string[];
  onDataSourcesChange: (sources: string[]) => void;
  integrationPoints: string[];
  onIntegrationPointsChange: (points: string[]) => void;
  aiCapabilities: string[];
  onAiCapabilitiesChange: (capabilities: string[]) => void;
  teamSize: number;
  onTeamSizeChange: (size: number) => void;
  budget: string;
  onBudgetChange: (budget: string) => void;
  moroccoPriorities: string[];
  onMoroccoPrioritiesChange: (priorities: string[]) => void;
  otherAlignment: string;
  onOtherAlignmentChange: (alignment: string) => void;
  language?: 'fr' | 'ar' | 'darija';
  problemStatement?: string; // For auto-detection
  proposedSolution?: string; // For auto-detection
}

const DATA_SOURCES = ['Excel', 'Database', 'Email', 'PDF', 'Photos', 'Paper', 'Forms', 'SMS/WhatsApp', 'Sensors', 'None'];
const INTEGRATION_POINTS = ['Hospital ERP', 'Email', 'WhatsApp Business', 'Government DB', 'Payroll', 'E-commerce', 'Billing', 'Calendar'];
const AI_CAPABILITIES = ['Vision', 'NLP', 'Prediction', 'Text Generation', 'Classification', 'Speech Recognition', 'Translation', 'Anomaly Detection'];

export default function Step6Operations({
  dataSources,
  onDataSourcesChange,
  integrationPoints,
  onIntegrationPointsChange,
  aiCapabilities,
  onAiCapabilitiesChange,
  teamSize,
  onTeamSizeChange,
  budget,
  onBudgetChange,
  moroccoPriorities,
  onMoroccoPrioritiesChange,
  otherAlignment,
  onOtherAlignmentChange,
  language = 'fr',
  problemStatement = '',
  proposedSolution = '',
}: Step6OperationsProps) {
  const [suggestedPriorities, setSuggestedPriorities] = useState<Array<{
    priorityId: string;
    matchCount: number;
    confidence: number;
    matchedKeywords: string[];
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-detect priorities from problem statement and solution
  useEffect(() => {
    const combinedText = `${problemStatement} ${proposedSolution}`.trim();
    if (combinedText.length > 20) {
      const detected = detectMoroccoPrioritiesWithConfidence(combinedText);
      setSuggestedPriorities(detected);
      
      // Auto-suggest if user hasn't selected any priorities
      if (moroccoPriorities.length === 0 && detected.length > 0) {
        setShowSuggestions(true);
        // Auto-select top 2 priorities with confidence > 0.7
        const topPriorities = detected
          .filter(p => p.confidence >= 0.7)
          .slice(0, 2)
          .map(p => p.priorityId);
        if (topPriorities.length > 0) {
          onMoroccoPrioritiesChange(topPriorities);
        }
      }
    }
  }, [problemStatement, proposedSolution, moroccoPriorities.length, onMoroccoPrioritiesChange]);

  const toggleArray = (array: string[], value: string, onChange: (newArray: string[]) => void) => {
    if (array.includes(value)) {
      onChange(array.filter((item) => item !== value));
    } else {
      onChange([...array, value]);
    }
  };

  const handleAcceptSuggestion = (priorityId: string) => {
    if (!moroccoPriorities.includes(priorityId)) {
      onMoroccoPrioritiesChange([...moroccoPriorities, priorityId]);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">6. Besoins opérationnels</h2>
        <p className="text-slate-600 mt-1">Définissez les ressources nécessaires</p>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Sources de données</CardTitle>
          <CardDescription>
            Quelles sont les sources de données disponibles ?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DATA_SOURCES.map((source) => (
              <Checkbox
                key={source}
                id={`data-${source}`}
                label={source}
                checked={dataSources.includes(source)}
                onChange={() => toggleArray(dataSources, source, onDataSourcesChange)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle>Points d'intégration</CardTitle>
          <CardDescription>
            Avec quels systèmes faut-il s'intégrer ?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INTEGRATION_POINTS.map((point) => (
              <Checkbox
                key={point}
                id={`integration-${point}`}
                label={point}
                checked={integrationPoints.includes(point)}
                onChange={() => toggleArray(integrationPoints, point, onIntegrationPointsChange)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Capacités IA nécessaires</CardTitle>
          <CardDescription>
            Quelles capacités d'intelligence artificielle sont nécessaires ?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AI_CAPABILITIES.map((capability) => (
              <Checkbox
                key={capability}
                id={`ai-${capability}`}
                label={capability}
                checked={aiCapabilities.includes(capability)}
                onChange={() => toggleArray(aiCapabilities, capability, onAiCapabilitiesChange)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team & Budget */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Taille de l'équipe</CardTitle>
            <CardDescription>
              Combien de personnes sont nécessaires ?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={teamSize}
              onChange={(e) => onTeamSizeChange(parseInt(e.target.value) || 0)}
              min="0"
              placeholder="Ex: 3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget estimé</CardTitle>
            <CardDescription>
              Quel est le budget nécessaire ?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
              placeholder="Ex: 3K-5K, 5000, <1K"
            />
          </CardContent>
        </Card>
      </div>

      {/* Morocco Alignment Section */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-3xl">🇲🇦</span>
          {language === 'darija' ? 'Kifash kay-tsama3 m3a l-Maghrib?' : 'Alignement avec les Priorités Marocaines'}
        </h3>
        
        <p className="text-gray-700 mb-4">
          {language === 'darija' 
            ? 'Khtar wash fikrtak kat-sada9 m3a shi 7aja men had l-awlawiyat:'
            : 'Sélectionnez les priorités nationales auxquelles votre idée répond:'}
        </p>

        {/* Auto-detected Suggestions */}
        {showSuggestions && suggestedPriorities.length > 0 && moroccoPriorities.length === 0 && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="font-semibold text-blue-900 mb-2">
              {language === 'darija' 
                ? '💡 Suggestions basées sur votre texte:'
                : '💡 Suggestions basées sur votre texte:'}
            </p>
            <div className="space-y-2">
              {suggestedPriorities.slice(0, 3).map((suggestion) => {
                const priority = MOROCCO_PRIORITIES.find(p => p.id === suggestion.priorityId);
                if (!priority) return null;
                return (
                  <div key={suggestion.priorityId} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <span className="font-medium">{language === 'darija' ? priority.nameDarija : priority.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({Math.round(suggestion.confidence * 100)}% confiance, {suggestion.matchCount} mots-clés)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestion.priorityId)}
                      className="ml-2"
                    >
                      {language === 'darija' ? 'Qbel' : 'Accepter'}
                    </Button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {language === 'darija' ? 'Gha3eb' : 'Ignorer'}
            </button>
          </div>
        )}
        
        {/* Morocco Priorities Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {MOROCCO_PRIORITIES.map(priority => (
            <label 
              key={priority.id}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                moroccoPriorities.includes(priority.id)
                  ? 'border-green-600 bg-green-100'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <input
                type="checkbox"
                checked={moroccoPriorities.includes(priority.id)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...moroccoPriorities, priority.id]
                    : moroccoPriorities.filter(p => p !== priority.id);
                  onMoroccoPrioritiesChange(updated);
                }}
                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {language === 'darija' ? priority.nameDarija : priority.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {priority.description}
                </div>
                
                {/* Show SDG mapping (subtle, educational) */}
                <div className="text-xs text-gray-400 mt-2">
                  🌍 SDGs: {priority.sdgMapping.join(', ')}
                </div>
              </div>
            </label>
          ))}
        </div>
        
        {/* Optional: Ministry/Other Alignment */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'darija' 
              ? 'Wach kayna shi wizara wla stratégie okhra? (ikhtiyari)'
              : 'Autre alignement ministériel ou stratégique? (optionnel)'}
          </label>
          <input
            type="text"
            value={otherAlignment}
            onChange={(e) => onOtherAlignmentChange(e.target.value)}
            placeholder={language === 'darija' 
              ? 'Matal: Ministère de la Santé, Stratégie Halieutis...'
              : 'Ex: Ministère de la Santé, Stratégie Halieutis...'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {/* Helpful hint */}
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm">
          <p className="font-semibold text-blue-900 mb-1">
            {language === 'darija' ? '💡 3lash had chi mohim?' : '💡 Pourquoi c\'est important?'}
          </p>
          <p className="text-blue-800">
            {language === 'darija'
              ? 'L-afkar li kay-sada9 m3a awlawiyat l-Maghrib 3andhom 2x plus de chances bach يتموّلو!'
              : 'Les idées alignées avec les priorités nationales ont 2x plus de chances d\'être financées!'}
          </p>
        </div>
      </div>

      {/* Summary */}
      {(dataSources.length > 0 || integrationPoints.length > 0 || aiCapabilities.length > 0) && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900 text-sm">📊 Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dataSources.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-indigo-900">Sources de données:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dataSources.map((source) => (
                      <Badge key={source} className="bg-indigo-600 text-white">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {integrationPoints.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-indigo-900">Intégrations:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {integrationPoints.map((point) => (
                      <Badge key={point} className="bg-indigo-600 text-white">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {aiCapabilities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-indigo-900">Capacités IA:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {aiCapabilities.map((capability) => (
                      <Badge key={capability} className="bg-indigo-600 text-white">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

