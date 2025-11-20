'use client';

/**
 * AI Analysis Agent
 * 
 * Shows live AI analysis of the idea as user fills out the form.
 * Displays real-time scores, suggestions, and progress indicators.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisResult {
  clarityScore: number;
  stage1Score: number;
  stage2Score: number | null;
  qualificationTier: 'exceptional' | 'qualified' | 'developing' | null;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  isAnalyzing: boolean;
}

interface AIAnalysisAgentProps {
  formData: {
    problemStatement?: string;
    asIsAnalysis?: string;
    benefitStatement?: string;
    operationalNeeds?: string;
    [key: string]: any;
  };
  language?: 'fr' | 'darija';
  compact?: boolean;
}

export default function AIAnalysisAgent({
  formData,
  language = 'fr',
  compact = false,
}: AIAnalysisAgentProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Check if we have enough data to analyze
    const hasEnoughData =
      (formData.problemStatement?.length ?? 0) > 50 &&
      (formData.asIsAnalysis?.length ?? 0) > 50 &&
      (formData.benefitStatement?.length ?? 0) > 50;

    if (!hasEnoughData) {
      setAnalysis(null);
      return;
    }

    // Debounce analysis
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/analyze-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData,
            language,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAnalysis(data);
          setLastAnalysisTime(new Date());
        }
      } catch (error) {
        console.error('Error analyzing:', error);
      } finally {
        setIsLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, language]);

  if (!isMounted) {
    return null; // Don't render until mounted on client
  }

  if (compact) {
    return (
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-900">
                {language === 'darija' ? 'T7lil l-IA' : 'Analyse IA'}
              </span>
            </div>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : analysis ? (
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    analysis.qualificationTier === 'exceptional'
                      ? 'default'
                      : analysis.qualificationTier === 'qualified'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {analysis.clarityScore.toFixed(1)}/10
                </Badge>
                {analysis.qualificationTier && (
                  <Badge variant="outline" className="text-xs">
                    {analysis.qualificationTier}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                {language === 'darija' ? 'Kayn chi data' : 'En attente...'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis && !isLoading) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'exceptional':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'qualified':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'developing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-lg">
              {language === 'darija' ? 'T7lil l-IA f l-w9t l-7y9' : 'Analyse IA en Temps Réel'}
            </CardTitle>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
        </div>
        {lastAnalysisTime && (
          <p className="text-xs text-slate-500 mt-1">
            Dernière mise à jour: {lastAnalysisTime.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis && (
          <>
            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">
                    {language === 'darija' ? 'Score dyal l-Wuduh' : 'Score de Clarté'}
                  </span>
                  <span className={`text-lg font-bold ${getScoreColor(analysis.clarityScore)}`}>
                    {analysis.clarityScore.toFixed(1)}/10
                  </span>
                </div>
                <Progress
                  value={analysis.clarityScore * 10}
                  className="h-2"
                />
              </div>

              {analysis.stage2Score !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">
                      {language === 'darija' ? 'Score dyal l-Qarar' : 'Score de Décision'}
                    </span>
                    <span className={`text-lg font-bold ${getScoreColor(analysis.stage2Score / 2)}`}>
                      {analysis.stage2Score}/20
                    </span>
                  </div>
                  <Progress
                    value={(analysis.stage2Score / 20) * 100}
                    className="h-2"
                  />
                </div>
              )}
            </div>

            {/* Qualification Tier */}
            {analysis.qualificationTier && (
              <div>
                <Badge className={`${getTierColor(analysis.qualificationTier)} border`}>
                  {analysis.qualificationTier === 'exceptional' && '⭐ '}
                  {analysis.qualificationTier === 'exceptional'
                    ? language === 'darija'
                      ? 'Exceptionnel'
                      : 'Exceptionnel'
                    : analysis.qualificationTier === 'qualified'
                    ? language === 'darija'
                      ? 'Qualifié'
                      : 'Qualifié'
                    : language === 'darija'
                    ? 'En développement'
                    : 'En développement'}
                </Badge>
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    {language === 'darija' ? 'Points forts' : 'Points Forts'}
                  </span>
                </div>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    {language === 'darija' ? 'Points à améliorer' : 'Points à Améliorer'}
                  </span>
                </div>
                <ul className="space-y-1">
                  {analysis.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {analysis.nextSteps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    {language === 'darija' ? 'Prochaines étapes' : 'Prochaines Étapes'}
                  </span>
                </div>
                <ul className="space-y-1">
                  {analysis.nextSteps.map((step, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-indigo-600 mt-1">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

