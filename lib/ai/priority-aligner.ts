import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

/**
 * Suggest Moroccan national priorities for an idea
 * based on problem, solution and category.
 *
 * Returns an array of MoroccanPriorityCode, e.g.:
 * ['digital_morocco', 'youth_employment']
 */
export async function suggestMoroccanPriorities(
  problem: string,
  solution: string,
  category: string
): Promise<string[]> {
  const prompt = `
    Analyze this Moroccan innovation:
    PROBLEM: ${problem}
    SOLUTION: ${solution}
    CATEGORY: ${category}
    
    Based on Morocco's national strategies (Digital Morocco 2030, Green Plan, Vision 2030, Youth Employment, Women Entrepreneurship, Rural Development, Healthcare Improvement), return ONLY the relevant priority codes as a JSON array.
    
    Valid codes:
    - "green_morocco"
    - "digital_morocco"
    - "vision_2030"
    - "youth_employment"
    - "women_entrepreneurship"
    - "rural_development"
    - "healthcare_improvement"
    
    Examples:
    - "AI platform for rural farmers" → ["digital_morocco", "green_morocco", "rural_development"]
    - "Telemedicine app for youth" → ["digital_morocco", "healthcare_improvement", "youth_employment"]
    - "E-commerce for women artisans" → ["women_entrepreneurship", "digital_morocco", "youth_employment"]
    
    Return ONLY the JSON array, no explanation, no extra text.
  `;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 200,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return [];
  }

  const text = content.text.trim();

  try {
    // Ensure we only parse the JSON array (strip any accidental text)
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return [];
    return arr.filter((code: any) => typeof code === 'string');
  } catch {
    return [];
  }
}


