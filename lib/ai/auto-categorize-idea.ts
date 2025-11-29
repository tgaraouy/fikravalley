/**
 * Auto-categorize an idea with Moroccan priorities, budget tier, location type, complexity, and SDG alignment
 * 
 * Uses rule-based categorization first (fast, free), with AI fallback for priorities if needed.
 */

import { suggestMoroccanPriorities } from './priority-aligner';
import {
  MOROCCAN_PRIORITIES_MAP,
  mapBudgetTier,
  determineLocationType,
  determineComplexity,
} from '@/scripts/categorization-rules';

export interface AutoCategorizationResult {
  moroccan_priorities: string[];
  budget_tier: string | null;
  location_type: string | null;
  complexity: string | null;
  sdg_alignment: {
    sdgTags: number[];
    sdgAutoTagged: boolean;
    sdgConfidence: Record<string, number>;
    moroccoPriorities: string[];
  } | null | any;
}

/**
 * Rule-based priority detection (fast, no API calls)
 */
function ruleBasedPriorities(
  problem: string | null,
  solution: string | null,
  category: string | null,
  location: string | null
): string[] {
  const priorities: string[] = [];
  const textToAnalyze = `${problem || ''} ${solution || ''} ${category || ''} ${location || ''}`.toLowerCase();
  const cat = (category || '').toLowerCase();

  for (const [priorityCode, config] of Object.entries(MOROCCAN_PRIORITIES_MAP)) {
    const cfg: any = config;

    // Check category match
    if (cfg.categories && cfg.categories.includes(cat)) {
      priorities.push(priorityCode);
      continue;
    }

    // Check keyword match
    if (cfg.keywords && cfg.keywords.some((keyword: string) => textToAnalyze.includes(keyword.toLowerCase()))) {
      priorities.push(priorityCode);
      continue;
    }

    // Special cases
    if (
      priorityCode === 'youth_employment' &&
      (textToAnalyze.includes('genz') || textToAnalyze.includes('jeune') || textToAnalyze.includes('étudiant'))
    ) {
      priorities.push(priorityCode);
      continue;
    }

    if (
      priorityCode === 'women_entrepreneurship' &&
      (textToAnalyze.includes('femme') || textToAnalyze.includes('femmes'))
    ) {
      priorities.push(priorityCode);
      continue;
    }
  }

  return Array.from(new Set(priorities)).slice(0, 3);
}

/**
 * Map Morocco priorities to SDG goals
 */
function mapPrioritiesToSDGs(priorities: string[]): { sdgTags: number[]; confidence: Record<string, number> } {
  const sdgTags: number[] = [];
  const confidence: Record<string, number> = {};

  // Morocco Priority → SDG mappings (from docs/morocco-priority-sdg-mappings.md)
  const priorityToSDG: Record<string, number[]> = {
    green_morocco: [7, 13, 15], // Clean Energy, Climate Action, Life on Land
    digital_morocco: [9], // Industry, Innovation, Infrastructure
    vision_2030: [8, 9], // Decent Work, Innovation
    youth_employment: [8], // Decent Work
    women_entrepreneurship: [5, 8], // Gender Equality, Decent Work
    rural_development: [1, 2, 6, 11], // No Poverty, Zero Hunger, Clean Water, Sustainable Cities
    healthcare_improvement: [3], // Good Health
  };

  for (const priority of priorities) {
    const sdgs = priorityToSDG[priority] || [];
    for (const sdg of sdgs) {
      if (!sdgTags.includes(sdg)) {
        sdgTags.push(sdg);
      }
      // High confidence (0.9) for priority-based SDGs
      confidence[`sdg_${sdg}`] = 0.9;
    }
  }

  return { sdgTags: sdgTags.slice(0, 5), confidence }; // Top 5 SDGs
}

/**
 * Auto-categorize an idea
 */
export async function autoCategorizeIdea(params: {
  problem_statement: string | null;
  proposed_solution: string | null;
  category: string | null;
  location: string | null;
  estimated_cost: string | null;
  ai_capabilities_needed?: string[] | null;
  integration_points?: string[] | null;
  useAIFallback?: boolean; // Whether to use AI if rules don't find priorities
}): Promise<AutoCategorizationResult> {
  const {
    problem_statement,
    proposed_solution,
    category,
    location,
    estimated_cost,
    ai_capabilities_needed,
    integration_points,
    useAIFallback = true,
  } = params;

  // 1. Rule-based priorities (fast, no API calls)
  let priorities = ruleBasedPriorities(problem_statement, proposed_solution, category, location);

  // 2. AI fallback if no priorities found and useAIFallback is true
  if (priorities.length === 0 && useAIFallback) {
    try {
      priorities = await suggestMoroccanPriorities(
        problem_statement || '',
        proposed_solution || '',
        category || ''
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in AI priority suggestion:', error);
      }
      // Continue with empty priorities if AI fails
    }
  }

  // 3. Budget tier
  const budget_tier = mapBudgetTier(estimated_cost);

  // 4. Location type
  const location_type = determineLocationType(location, category, problem_statement);

  // 5. Complexity (requires budget_tier first)
  const complexity = determineComplexity(ai_capabilities_needed || null, integration_points || null, budget_tier);

  // 6. SDG alignment from priorities
  let sdg_alignment: AutoCategorizationResult['sdg_alignment'] = null;
  if (priorities.length > 0) {
    const { sdgTags, confidence } = mapPrioritiesToSDGs(priorities);
    sdg_alignment = {
      sdgTags,
      sdgAutoTagged: true,
      sdgConfidence: confidence,
      moroccoPriorities: priorities,
    } as any;
  }

  return {
    moroccan_priorities: priorities,
    budget_tier,
    location_type,
    complexity,
    sdg_alignment,
  };
}

