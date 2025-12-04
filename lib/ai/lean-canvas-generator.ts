/**
 * Lean Canvas Generator
 * 
 * Generates a Lean Canvas from an idea submission using AI.
 * Maps idea data to the 9 Lean Canvas blocks.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
});

export interface LeanCanvasData {
  problem: string; // Top 3 problems
  solution: string; // Top 3 features
  key_metrics: string; // Key activities to measure
  uvp: string; // Unique Value Proposition - single, clear, compelling message
  unfair_advantage: string; // Can't be easily copied
  channels: string; // Path to customers
  customer_segments: string; // Target customers
  cost_structure: string; // Customer acquisition costs, distribution costs, hosting, people, etc.
  revenue_streams: string; // Revenue model, lifetime value, revenue, gross margin
}

export interface IdeaData {
  title: string;
  problem_statement: string;
  proposed_solution: string | null;
  category: string | null;
  location: string | null;
  target_customers?: string | null;
  market_size?: string | null;
  revenue_model?: string | null;
  moroccan_priorities?: string[] | null;
  budget_tier?: string | null;
}

/**
 * Generate Lean Canvas from idea data
 */
export async function generateLeanCanvas(
  ideaData: IdeaData
): Promise<LeanCanvasData> {
  const prompt = `
You are helping a Moroccan entrepreneur create a Lean Canvas for their startup idea.

Idea Title: ${ideaData.title}
Problem Statement: ${ideaData.problem_statement}
Proposed Solution: ${ideaData.proposed_solution || 'Not specified'}
Category: ${ideaData.category || 'Not specified'}
Location: ${ideaData.location || 'Morocco'}
Target Customers: ${ideaData.target_customers || 'Not specified'}
Market Size: ${ideaData.market_size || 'Not specified'}
Revenue Model: ${ideaData.revenue_model || 'Not specified'}
Moroccan Priorities: ${ideaData.moroccan_priorities?.join(', ') || 'Not specified'}
Budget Tier: ${ideaData.budget_tier || 'Not specified'}

Moroccan Context:
- Consider 2G/3G connectivity (offline-first)
- Mobile money integration (M-Wallet, Orange Money)
- Multilingual (Darija, Tamazight, French)
- PDPL compliance
- Diaspora market (5M+ abroad)
- Local trust networks

Generate a Lean Canvas with these 9 blocks:

1. PROBLEM (Top 3 problems):
   - List the top 3 problems this idea solves
   - Be specific and focused on Moroccan market

2. SOLUTION (Top 3 features):
   - List the top 3 features that solve the problems
   - Consider Moroccan context (offline, mobile money, multilingual)

3. KEY METRICS (Key activities to measure):
   - What metrics will indicate success?
   - Consider: attention, trust, revenue, referrals

4. UNIQUE VALUE PROPOSITION (Single, clear, compelling message):
   - One sentence that describes the unique value
   - Should be different from competitors
   - Consider Moroccan context (local trust, execution)

5. UNFAIR ADVANTAGE (Can't be easily copied):
   - What's the moat?
   - Consider: local relationships, trust networks, Moroccan execution

6. CHANNELS (Path to customers):
   - How will you reach customers?
   - Consider: WhatsApp, Facebook, SMS, in-person, diaspora

7. CUSTOMER SEGMENTS (Target customers):
   - Who are the target customers?
   - Consider: domestic, diaspora, specific cities/regions

8. COST STRUCTURE (Customer acquisition costs, distribution costs, hosting, people, etc.):
   - What are the main costs?
   - Consider: mobile money fees, 2G/3G infrastructure, PDPL compliance

9. REVENUE STREAMS (Revenue model, lifetime value, revenue, gross margin):
   - How will you make money?
   - Consider: mobile money, cash, low-ticket pricing (10-100 DH), subscription, transaction fees

Return ONLY a valid JSON object with these exact keys:
{
  "problem": "...",
  "solution": "...",
  "key_metrics": "...",
  "uvp": "...",
  "unfair_advantage": "...",
  "channels": "...",
  "customer_segments": "...",
  "cost_structure": "...",
  "revenue_streams": "..."
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    // Try to find JSON object in the text if it's not pure JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const canvasData = JSON.parse(jsonText) as LeanCanvasData;
    
    // Ensure all fields are strings (handle arrays/objects from AI)
    const stringifyField = (value: any): string => {
      if (typeof value === 'string') return value;
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object' && value !== null) return JSON.stringify(value);
      return String(value || '');
    };
    
    // Convert all fields to strings
    canvasData.problem = stringifyField(canvasData.problem);
    canvasData.solution = stringifyField(canvasData.solution);
    canvasData.key_metrics = stringifyField(canvasData.key_metrics);
    canvasData.uvp = stringifyField(canvasData.uvp);
    canvasData.unfair_advantage = stringifyField(canvasData.unfair_advantage);
    canvasData.channels = stringifyField(canvasData.channels);
    canvasData.customer_segments = stringifyField(canvasData.customer_segments);
    canvasData.cost_structure = stringifyField(canvasData.cost_structure);
    canvasData.revenue_streams = stringifyField(canvasData.revenue_streams);

    // Validate all required fields
    const requiredFields: (keyof LeanCanvasData)[] = [
      'problem',
      'solution',
      'key_metrics',
      'uvp',
      'unfair_advantage',
      'channels',
      'customer_segments',
      'cost_structure',
      'revenue_streams',
    ];

    // Validate all required fields (already converted to strings above)
    for (const field of requiredFields) {
      const value = canvasData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return canvasData;
  } catch (error) {
    console.error('Error generating Lean Canvas:', error);
    throw new Error(`Failed to generate Lean Canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

