/**
 * Live AI Analysis API Endpoint
 * 
 * Provides real-time analysis of form data as users fill it out.
 */

import { NextRequest, NextResponse } from 'next/server';
import { scoreIdeaComplete } from '@/lib/idea-bank/scoring/two-stage-scorer';
import { generateClarityFeedback } from '@/lib/idea-bank/feedback/clarity-feedback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formData, language } = body;

    if (!formData) {
      return NextResponse.json(
        { error: 'formData is required' },
        { status: 400 }
      );
    }

    // Prepare scoring input
    const scoringInput = {
      problemStatement: formData.problemStatement || '',
      asIsAnalysis: formData.asIsAnalysis || '',
      benefitStatement: formData.benefitStatement || '',
      operationalNeeds: formData.operationalNeeds || '',
      category: formData.category || '',
      location: formData.location || '',
      frequency: formData.frequency || 'daily',
      receipts: formData.receipts || 0,
      alignment: formData.alignment || {
        moroccoPriorities: [],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {},
      },
    };

    // Score the idea
    const scoringResult = scoreIdeaComplete(scoringInput);

    // Get feedback for weaknesses
    const feedback = generateClarityFeedback(scoringInput);

    // Extract strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    feedback.items.forEach((item) => {
      if (item.score >= 7) {
        strengths.push(`${item.criterionName[language || 'fr']}: ${item.suggestions[0] || 'Bien détaillé'}`);
      } else if (item.score < 6) {
        weaknesses.push(`${item.criterionName[language || 'fr']}: ${item.issues[0] || 'À améliorer'}`);
      }
    });

    // Get next steps from feedback
    const nextSteps = feedback.quickWins.slice(0, 3).map((win, idx) => `${idx + 1}. ${win}`);

    // Calculate clarity score (average of stage 1 scores)
    const clarityScore = scoringResult.stage1.total / 4; // 4 criteria, max 10 each

    return NextResponse.json({
      clarityScore: Math.min(10, clarityScore),
      stage1Score: scoringResult.stage1.total,
      stage2Score: scoringResult.stage2?.total || null,
      qualificationTier: scoringResult.overall.qualificationTier,
      strengths,
      weaknesses,
      nextSteps,
      isAnalyzing: false,
    });
  } catch (error) {
    console.error('Error in live analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze' },
      { status: 500 }
    );
  }
}

