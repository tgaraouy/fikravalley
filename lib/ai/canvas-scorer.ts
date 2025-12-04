/**
 * Canvas Scorer
 * 
 * Scores a Lean Canvas across 7 dimensions:
 * 1. Clarity
 * 2. Desirability
 * 3. Viability
 * 4. Feasibility
 * 5. Timing
 * 6. Defensibility
 * 7. Mission Alignment
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LeanCanvasData } from './lean-canvas-generator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
});

export interface CanvasScores {
  clarity_score: number;
  desirability_score: number;
  viability_score: number;
  feasibility_score: number;
  timing_score: number;
  defensibility_score: number;
  mission_alignment_score: number;
}

const SCORING_RUBRIC = `
Scoring Rubric (0-10 for each dimension):

1. CLARITY (How clear is the problem-solution fit?)
   - Problem is well-defined and specific
   - Solution directly addresses the problem
   - Customer segment is clearly identified
   - Moroccan Context: Consider local market clarity (Darija, Tamazight, French)

2. DESIRABILITY (How much do customers want this?)
   - Strong customer pain point
   - Clear value proposition
   - Evidence of demand
   - Moroccan Context: Consider local trust, word-of-mouth, community needs

3. VIABILITY (Can this be a sustainable business?)
   - Clear revenue model
   - Reasonable cost structure
   - Path to profitability
   - Moroccan Context: Consider mobile money, cash, low-ticket pricing (10-100 DH)

4. FEASIBILITY (Can this be built and delivered?)
   - Technical feasibility
   - Resource availability
   - Execution capability
   - Moroccan Context: Consider 2G/offline, mobile money integration, PDPL compliance

5. TIMING (Is now the right time?)
   - Market timing is right
   - Technology is ready
   - Competitive landscape favorable
   - Moroccan Context: Consider Moroccan market readiness, diaspora timing

6. DEFENSIBILITY (What's the unfair advantage?)
   - Unique value proposition
   - Barriers to entry
   - Sustainable competitive advantage
   - Moroccan Context: Consider local trust networks, relationships, execution capability

7. MISSION ALIGNMENT (Does this align with founder's mission?)
   - Personal motivation
   - Long-term vision
   - Impact alignment
   - Moroccan Context: Consider Moroccan impact, diaspora connection, community benefit

Scoring Guidelines:
- 0-3: Poor (major gaps, unclear, not viable)
- 4-6: Fair (some clarity, but needs work)
- 7-8: Good (clear, viable, well-defined)
- 9-10: Excellent (exceptional clarity, strong viability, clear advantage)
`;

/**
 * Score a Lean Canvas across 7 dimensions
 */
export async function scoreCanvas(
  canvasData: LeanCanvasData,
  ideaTitle?: string
): Promise<CanvasScores> {
  const prompt = `
You are scoring a Lean Canvas for a Moroccan startup idea.

${ideaTitle ? `Idea Title: ${ideaTitle}` : ''}

Lean Canvas:
${JSON.stringify(canvasData, null, 2)}

${SCORING_RUBRIC}

Score this canvas across all 7 dimensions (0-10 each).
Consider the Moroccan context: 2G/3G, mobile money, multilingual, PDPL, diaspora, local trust.

Return ONLY a valid JSON object with these exact keys and numeric values (0-10):
{
  "clarity_score": <number 0-10>,
  "desirability_score": <number 0-10>,
  "viability_score": <number 0-10>,
  "feasibility_score": <number 0-10>,
  "timing_score": <number 0-10>,
  "defensibility_score": <number 0-10>,
  "mission_alignment_score": <number 0-10>
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const scores = JSON.parse(jsonText) as CanvasScores;

    // Validate scores are in range 0-10
    const scoreFields: (keyof CanvasScores)[] = [
      'clarity_score',
      'desirability_score',
      'viability_score',
      'feasibility_score',
      'timing_score',
      'defensibility_score',
      'mission_alignment_score',
    ];

    for (const field of scoreFields) {
      const score = scores[field];
      if (typeof score !== 'number' || score < 0 || score > 10) {
        throw new Error(`Invalid score for ${field}: ${score}. Must be 0-10.`);
      }
      // Round to 1 decimal place
      scores[field] = Math.round(score * 10) / 10;
    }

    return scores;
  } catch (error) {
    console.error('Error scoring canvas:', error);
    throw new Error(`Failed to score canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

