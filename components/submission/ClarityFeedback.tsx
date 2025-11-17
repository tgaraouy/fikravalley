'use client';

/**
 * Clarity Feedback Component
 * 
 * Displays intelligent feedback for low-clarity ideas
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ClarityFeedback } from '@/lib/idea-bank/feedback/clarity-feedback';

interface ClarityFeedbackProps {
  idea: any;
  language?: 'fr' | 'darija';
  onImprove?: (criterion: string) => void;
}

export default function ClarityFeedbackDisplay({
  idea,
  language = 'fr',
  onImprove,
}: ClarityFeedbackProps) {
  const [feedback, setFeedback] = useState<ClarityFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [idea]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ideas/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, format: 'json', language }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedback || feedback.overall.score >= 6) {
    return null; // Don't show feedback if score is good
  }

  const t = feedback.overall.message[language];

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-yellow-900">
              💡 Feedback pour améliorer votre idée
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Score actuel: {feedback.overall.score.toFixed(1)}/10
            </CardDescription>
          </div>
          <Badge className={`${
            feedback.overall.score >= 6 ? 'bg-green-600' :
            feedback.overall.score >= 4 ? 'bg-yellow-600' :
            'bg-red-600'
          } text-white`}>
            {feedback.overall.status === 'excellent' ? 'Excellent' :
             feedback.overall.status === 'good' ? 'Bon' :
             feedback.overall.status === 'needs_improvement' ? 'À améliorer' :
             'Insuffisant'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Message */}
        <div className="p-4 bg-white rounded-lg border border-yellow-200">
          <p className="text-yellow-900">{t}</p>
        </div>

        {/* Quick Wins */}
        {feedback.quickWins.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">⚡ Corrections rapides</h3>
            <ol className="list-decimal list-inside space-y-1 text-green-800">
              {feedback.quickWins.map((win, index) => (
                <li key={index}>{win}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Detailed Feedback */}
        <div className="space-y-4">
          {feedback.items
            .filter((item) => item.score < 6)
            .map((item) => (
              <Card key={item.criterion} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {item.criterionName[language]}
                    </CardTitle>
                    <Badge className="bg-red-100 text-red-800">
                      {item.score.toFixed(1)}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Issues */}
                  {item.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Problèmes identifiés:</h4>
                      <ul className="list-disc list-inside space-y-1 text-red-800">
                        {item.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {item.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-green-800">
                        {item.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs font-semibold text-red-900 mb-1">Exemple actuel:</p>
                      <p className="text-sm text-red-800">{item.examples.current}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-900 mb-1">Exemple amélioré:</p>
                      <p className="text-sm text-green-800">{item.examples.improved}</p>
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-sm text-slate-600">
                      ⏱️ Temps estimé: {item.estimatedTimeToFix} minutes
                    </span>
                    {onImprove && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onImprove(item.criterion)}
                      >
                        Améliorer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Summary */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-indigo-900">Temps total estimé</p>
              <p className="text-sm text-indigo-700">
                {feedback.estimatedTotalTime} minutes pour améliorer votre score
              </p>
            </div>
            {feedback.priorityOrder.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-900 mb-1">Ordre de priorité:</p>
                <div className="flex flex-wrap gap-1">
                  {feedback.priorityOrder.slice(0, 3).map((priority, index) => (
                    <Badge key={index} className="bg-indigo-600 text-white text-xs">
                      {index + 1}. {priority}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

