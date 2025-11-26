/**
 * AGENT 7: Feature Flag & Priority Agent
 * 
 * ROLE: You are the Moroccan admin's AI assistant. Auto-flag exceptional ideas for 
 * featured status and elite mentor tiers.
 * 
 * TRIGGER: marrai_ideas.status = 'matched'
 * 
 * OUTPUT: Update marrai_ideas with:
 * - featured (boolean)
 * - priority ('critical'|'high'|'medium'|'low')
 * - visible (boolean, default false)
 * - qualification_tier (final validation)
 * 
 * AUTO-FLAGGING RULES:
 * featured=true IF:
 * - qualification_tier='exceptional' AND
 * - ai_impact_score >= 8 AND
 * - matching_score >= 0.8 AND
 * - alignment['moroccoPriorities'].length >= 2
 * 
 * priority='critical' IF:
 * - featured=true OR
 * - ai_impact_score >= 9 OR
 * - roi_cost_saved_eur > 2000
 * 
 * visible=true IF:
 * - featured=true AND
 * - admin manually approves (admin_notes="Approved for public")
 * 
 * HUMAN-IN-THE-LOOP:
 * - Admin must manually set visible=true (default is false for privacy)
 * - Admin can override featured=false if idea is sensitive
 * - Admin sets qualification_tier final value after review
 * 
 * ADMIN DASHBOARD QUERY:
 * SELECT * FROM marrai_ideas 
 * WHERE status='matched' AND featured IS NULL 
 * ORDER BY ai_impact_score DESC;
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];
type IdeaUpdate = Database['public']['Tables']['marrai_ideas']['Update'];

type Priority = 'critical' | 'high' | 'medium' | 'low';
type QualificationTier = 'exceptional' | 'qualified' | 'needs_work';

interface FeatureFlagResult {
  success: boolean;
  ideaId: string;
  updates: {
    featured?: boolean;
    priority?: Priority;
    visible?: boolean;
    qualification_tier?: QualificationTier;
  };
  reason?: string;
  errors: string[];
}

interface AutoFlaggingAnalysis {
  shouldFeature: boolean;
  priority: Priority;
  featuredReason?: string;
  priorityReason?: string;
}

/**
 * Analyze idea for auto-flagging
 */
function analyzeForAutoFlagging(idea: IdeaRow): AutoFlaggingAnalysis {
  const analysis: AutoFlaggingAnalysis = {
    shouldFeature: false,
    priority: 'low',
  };

  // Parse alignment (jsonb)
  const alignment = (idea.alignment as any) || {};
  const moroccoPriorities = alignment.moroccoPriorities || [];
  const matchingScore = idea.matching_score || 0;
  const aiImpactScore = idea.ai_impact_score || 0;
  const qualificationTier = (idea as any).qualification_tier as QualificationTier | null;
  const roiCostSaved = idea.roi_cost_saved_eur || 0;

  // AUTO-FLAGGING RULE: featured=true IF:
  // - qualification_tier='exceptional' AND
  // - ai_impact_score >= 8 AND
  // - matching_score >= 0.8 AND
  // - alignment['moroccoPriorities'].length >= 2
  if (
    qualificationTier === 'exceptional' &&
    aiImpactScore >= 8 &&
    matchingScore >= 0.8 &&
    moroccoPriorities.length >= 2
  ) {
    analysis.shouldFeature = true;
    analysis.featuredReason = `Exceptional idea: tier=${qualificationTier}, impact=${aiImpactScore}, match=${matchingScore}, priorities=${moroccoPriorities.length}`;
  }

  // PRIORITY RULE: priority='critical' IF:
  // - featured=true OR
  // - ai_impact_score >= 9 OR
  // - roi_cost_saved_eur > 2000
  if (analysis.shouldFeature || aiImpactScore >= 9 || roiCostSaved > 2000) {
    analysis.priority = 'critical';
    analysis.priorityReason = analysis.shouldFeature
      ? 'Featured idea'
      : aiImpactScore >= 9
      ? `High impact score: ${aiImpactScore}`
      : `High ROI: ${roiCostSaved} EUR`;
  } else if (aiImpactScore >= 7 || matchingScore >= 0.7) {
    analysis.priority = 'high';
  } else if (aiImpactScore >= 5 || matchingScore >= 0.5) {
    analysis.priority = 'medium';
  } else {
    analysis.priority = 'low';
  }

  return analysis;
}

/**
 * Check if admin has approved for public visibility
 */
function isAdminApproved(idea: IdeaRow): boolean {
  const adminNotes = idea.admin_notes || '';
  // Check if admin_notes contains approval text
  return adminNotes.toLowerCase().includes('approved for public') ||
         adminNotes.toLowerCase().includes('approved') ||
         adminNotes.toLowerCase().includes('public');
}

/**
 * Process feature flagging for a single idea
 */
async function processFeatureFlagging(
  supabase: ReturnType<typeof createClient>,
  ideaId: string
): Promise<FeatureFlagResult> {
  const errors: string[] = [];

  try {
    // Fetch the idea
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return {
        success: false,
        ideaId,
        updates: {},
        errors: [`Failed to fetch idea: ${ideaError?.message || 'Idea not found'}`],
      };
    }

    // TRIGGER: Only process if status = 'matched'
    if ((idea as any).status !== 'matched') {
      return {
        success: false,
        ideaId,
        updates: {},
        reason: `Idea status is '${(idea as any).status}', not 'matched'. Agent 7 only processes matched ideas.`,
        errors: [],
      };
    }

    // Skip if already processed (featured is not NULL)
    // But allow re-processing if admin wants to update
    const analysis = analyzeForAutoFlagging(idea);

    const updates: IdeaUpdate = {};

    // Set featured flag (only if conditions met AND not already set to false by admin)
    const ideaAny = idea as any;
    if (analysis.shouldFeature && ideaAny.featured !== false) {
      // Don't override if admin explicitly set to false
      if (ideaAny.featured === null || ideaAny.featured === undefined) {
        updates.featured = true;
      }
    }

    // Set priority
    if (analysis.priority) {
      // Only update if priority is higher or not set
      const currentPriority = (idea as any).priority as Priority | null;
      const priorityOrder: Record<Priority, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      
      if (!currentPriority || priorityOrder[analysis.priority] > priorityOrder[currentPriority]) {
        updates.priority = analysis.priority;
      }
    }

    // Set visible (HUMAN-IN-THE-LOOP: Only if admin approved)
    // visible=true IF: featured=true AND admin manually approves
    const updatesAny = updates as any;
    if (updates.featured && isAdminApproved(idea)) {
      // Use 'public' column if 'visible' doesn't exist
      updatesAny.public = true;
      // Also try 'visible' if it exists
      if ('visible' in ideaAny) {
        updatesAny.visible = true;
      }
    } else {
      // Default: visible=false (privacy)
      if ('visible' in ideaAny) {
        updatesAny.visible = false;
      }
      if (!ideaAny.public) {
        updatesAny.public = false;
      }
    }

    // Don't update qualification_tier (admin sets final value after review)
    // This is HUMAN-IN-THE-LOOP - agent doesn't change it

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      const query = supabase
        .from('marrai_ideas')
        // @ts-expect-error - Supabase type inference issue with .update()
        .update(updatesAny);
      const { error: updateError } = await query.eq('id', ideaId);

      if (updateError) {
        errors.push(`Failed to update idea: ${updateError.message}`);
        return {
          success: false,
          ideaId,
          updates: {},
          errors,
        };
      }
    }

    return {
      success: true,
      ideaId,
      updates: {
        featured: updates.featured ?? undefined,
        priority: updates.priority as Priority | undefined,
        visible: (updates as any).visible,
        qualification_tier: ideaAny.qualification_tier as QualificationTier | undefined,
      },
      reason: analysis.featuredReason || analysis.priorityReason || 'Processed successfully',
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      ideaId,
      updates: {},
      errors: [`Feature flag agent error: ${errorMessage}`],
    };
  }
}

/**
 * Get ideas that need feature flag review (for admin dashboard)
 */
async function getIdeasNeedingReview(
  supabase: ReturnType<typeof createClient>,
  limit: number = 50
): Promise<IdeaRow[]> {
  try {
    // ADMIN DASHBOARD QUERY:
    // SELECT * FROM marrai_ideas 
    // WHERE status='matched' AND featured IS NULL 
    // ORDER BY ai_impact_score DESC;
    const { data: ideas, error } = await supabase
      .from('marrai_ideas')
      .select('*')
      .eq('status', 'matched')
      .is('featured', null)
      .order('ai_impact_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching ideas for review:', error);
      return [];
    }

    return ideas || [];
  } catch (error) {
    console.error('Error in getIdeasNeedingReview:', error);
    return [];
  }
}

/**
 * Feature Flag Agent class
 */
export class FeatureFlagAgent {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseClient?: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Process feature flagging for an idea
   * TRIGGER: Call this when marrai_ideas.status = 'matched'
   */
  async processFeatureFlag(ideaId: string): Promise<FeatureFlagResult> {
    return processFeatureFlagging(this.supabase, ideaId);
  }

  /**
   * Get a single idea by ID (for preview/analysis)
   */
  async getIdea(ideaId: string): Promise<{ data: IdeaRow | null; error: any }> {
    const { data, error } = await this.supabase
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    return { data, error };
  }

  /**
   * Get ideas that need admin review (for dashboard)
   */
  async getIdeasNeedingReview(limit: number = 50): Promise<IdeaRow[]> {
    return getIdeasNeedingReview(this.supabase, limit);
  }

  /**
   * Analyze idea without updating (for preview)
   */
  analyzeIdea(idea: IdeaRow): AutoFlaggingAnalysis {
    return analyzeForAutoFlagging(idea);
  }
}

// Export default instance
export const featureFlagAgent = new FeatureFlagAgent();

// Export standalone function for convenience
export async function processFeatureFlag(ideaId: string): Promise<FeatureFlagResult> {
  return featureFlagAgent.processFeatureFlag(ideaId);
}
