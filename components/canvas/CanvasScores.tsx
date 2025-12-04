'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CanvasScoresProps {
  scores: {
    clarity_score: number;
    desirability_score: number;
    viability_score: number;
    feasibility_score: number;
    timing_score: number;
    defensibility_score: number;
    mission_alignment_score: number;
    overall_score?: number;
  };
  showOverall?: boolean;
}

const SCORE_LABELS = {
  clarity_score: 'Clarity',
  desirability_score: 'Desirability',
  viability_score: 'Viability',
  feasibility_score: 'Feasibility',
  timing_score: 'Timing',
  defensibility_score: 'Defensibility',
  mission_alignment_score: 'Mission Alignment',
};

const SCORE_DESCRIPTIONS = {
  clarity_score: 'How clear is the problem-solution fit?',
  desirability_score: 'How much do customers want this?',
  viability_score: 'Can this be a sustainable business?',
  feasibility_score: 'Can this be built and delivered?',
  timing_score: 'Is now the right time?',
  defensibility_score: 'What\'s the unfair advantage?',
  mission_alignment_score: 'Does this align with founder\'s mission?',
};

function getScoreColorClass(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-blue-600';
  if (score >= 4) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  return 'Poor';
}

export function CanvasScores({ scores, showOverall = true }: CanvasScoresProps) {
  // Convert scores to numbers and filter out overall_score
  const scoreEntries = Object.entries(scores)
    .filter(([key]) => key !== 'overall_score')
    .map(([key, value]) => [key, typeof value === 'number' ? value : parseFloat(String(value)) || 0] as [keyof typeof SCORE_LABELS, number]);

  const overallScore = scores.overall_score !== undefined 
    ? (typeof scores.overall_score === 'number' ? scores.overall_score : parseFloat(String(scores.overall_score)) || 0)
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Canvas Scores</span>
          {showOverall && overallScore !== undefined && (
            <span className={`text-2xl font-bold ${getScoreColorClass(overallScore)}`}>
              {overallScore.toFixed(1)}/10
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scoreEntries.map(([key, score]) => {
          const numScore = typeof score === 'number' ? score : parseFloat(String(score)) || 0;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-slate-900">{SCORE_LABELS[key]}</span>
                  <span className="text-slate-500 ml-2">({SCORE_DESCRIPTIONS[key]})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColorClass(numScore)}`}>
                    {numScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">({getScoreLabel(numScore)})</span>
                </div>
              </div>
              <Progress value={(numScore / 10) * 100} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

