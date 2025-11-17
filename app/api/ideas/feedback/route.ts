/**
 * API: Generate Clarity Feedback
 * 
 * Returns actionable feedback for low-clarity ideas
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateClarityFeedback,
  formatFeedbackAsText,
  formatFeedbackAsHTML,
  formatFeedbackAsWhatsApp,
  formatFeedbackAsMarkdown,
  type FeedbackInput,
} from '@/lib/idea-bank/feedback/clarity-feedback';

/**
 * POST /api/ideas/feedback
 * Generate clarity feedback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, format = 'json', language = 'fr' } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea data is required' },
        { status: 400 }
      );
    }

    // Prepare input
    const input: FeedbackInput = {
      problemStatement: idea.problemStatement || idea.problem_statement || '',
      asIsAnalysis: idea.asIsAnalysis || idea.current_manual_process || '',
      benefitStatement: idea.benefitStatement || idea.digitization_opportunity || '',
      operationalNeeds: idea.operationalNeeds || '',
      roiTimeSavedHours: idea.roiTimeSavedHours || idea.roi_time_saved_hours || 0,
      roiCostSavedEur: idea.roiCostSavedEur || idea.roi_cost_saved_eur || 0,
      estimatedCost: idea.estimatedCost || idea.estimated_cost || '',
      dataSources: idea.dataSources || idea.data_sources || [],
      integrationPoints: idea.integrationPoints || idea.integration_points || [],
      aiCapabilitiesNeeded: idea.aiCapabilitiesNeeded || idea.ai_capabilities_needed || [],
      processSteps: idea.processSteps || [],
      teamSize: idea.teamSize || 0,
      budget: idea.budget || '',
      location: idea.location || '',
      category: idea.category || '',
      frequency: idea.frequency || '',
      urgency: idea.urgency || '',
    };

    // Generate feedback
    const feedback = generateClarityFeedback(input);

    // Format based on requested format
    if (format === 'text') {
      return new NextResponse(formatFeedbackAsText(feedback, language as 'fr' | 'darija'), {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else if (format === 'html') {
      return new NextResponse(formatFeedbackAsHTML(feedback, language as 'fr' | 'darija'), {
        headers: { 'Content-Type': 'text/html' },
      });
    } else if (format === 'whatsapp') {
      return new NextResponse(formatFeedbackAsWhatsApp(feedback, language as 'fr' | 'darija'), {
        headers: { 'Content-Type': 'text/plain' },
      });
    } else if (format === 'markdown') {
      return new NextResponse(formatFeedbackAsMarkdown(feedback, language as 'fr' | 'darija'), {
        headers: { 'Content-Type': 'text/markdown' },
      });
    }

    // Default: JSON
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

