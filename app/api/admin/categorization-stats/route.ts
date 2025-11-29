/**
 * Admin API: Categorization Statistics
 * 
 * Returns statistics about idea categorization coverage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

async function isAdmin() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token');
  return adminToken?.value === process.env.ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get total ideas count
    const { count: totalIdeas } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true });

    // Get ideas with moroccan_priorities
    const { count: withPriorities } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .not('moroccan_priorities', 'is', null);

    // Get ideas with budget_tier
    const { count: withBudgetTier } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .not('budget_tier', 'is', null);

    // Get ideas with location_type
    const { count: withLocationType } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .not('location_type', 'is', null);

    // Get ideas with complexity
    const { count: withComplexity } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .not('complexity', 'is', null);

    // Get ideas with sdg_alignment
    const { count: withSDG } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .not('sdg_alignment', 'is', null);

    // Get priority distribution
    const { data: allIdeas } = await supabase
      .from('marrai_ideas')
      .select('moroccan_priorities');

    const priorityCounts: Record<string, number> = {};
    (allIdeas || []).forEach((idea: any) => {
      const priorities = idea.moroccan_priorities || [];
      if (Array.isArray(priorities)) {
        priorities.forEach((p: string) => {
          priorityCounts[p] = (priorityCounts[p] || 0) + 1;
        });
      }
    });

    // Get budget tier distribution
    const { data: budgetData } = await supabase
      .from('marrai_ideas')
      .select('budget_tier');

    const budgetCounts: Record<string, number> = {};
    (budgetData || []).forEach((idea: any) => {
      const tier = idea.budget_tier;
      if (tier) {
        budgetCounts[tier] = (budgetCounts[tier] || 0) + 1;
      }
    });

    // Get complexity distribution
    const { data: complexityData } = await supabase
      .from('marrai_ideas')
      .select('complexity');

    const complexityCounts: Record<string, number> = {};
    (complexityData || []).forEach((idea: any) => {
      const complexity = idea.complexity;
      if (complexity) {
        complexityCounts[complexity] = (complexityCounts[complexity] || 0) + 1;
      }
    });

    // Get uncategorized ideas (missing all categorization)
    const { data: uncategorized } = await supabase
      .from('marrai_ideas')
      .select('id, title, created_at')
      .is('moroccan_priorities', null)
      .is('budget_tier', null)
      .is('location_type', null)
      .is('complexity', null)
      .limit(50)
      .order('created_at', { ascending: false });

    const total = totalIdeas || 0;

    return NextResponse.json({
      total,
      coverage: {
        moroccan_priorities: {
          count: withPriorities || 0,
          percentage: total > 0 ? Math.round(((withPriorities || 0) / total) * 100) : 0,
        },
        budget_tier: {
          count: withBudgetTier || 0,
          percentage: total > 0 ? Math.round(((withBudgetTier || 0) / total) * 100) : 0,
        },
        location_type: {
          count: withLocationType || 0,
          percentage: total > 0 ? Math.round(((withLocationType || 0) / total) * 100) : 0,
        },
        complexity: {
          count: withComplexity || 0,
          percentage: total > 0 ? Math.round(((withComplexity || 0) / total) * 100) : 0,
        },
        sdg_alignment: {
          count: withSDG || 0,
          percentage: total > 0 ? Math.round(((withSDG || 0) / total) * 100) : 0,
        },
      },
      distributions: {
        priorities: priorityCounts,
        budget_tiers: budgetCounts,
        complexities: complexityCounts,
      },
      uncategorized: uncategorized || [],
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching categorization stats:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch categorization statistics' },
      { status: 500 }
    );
  }
}

