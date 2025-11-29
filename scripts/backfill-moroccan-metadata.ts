/**
 * Backfill Moroccan metadata for existing ideas in Supabase
 *
 * - moroccan_priorities (JSONB)
 * - budget_tier
 * - location_type
 * - complexity
 *
 * Uses rule-based categorization for priorities/budget/location/complexity,
 * with optional AI fallback for Moroccan priorities.
 */

// Load env first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { suggestMoroccanPriorities } from '@/lib/ai/priority-aligner';
import {
  MOROCCAN_PRIORITIES_MAP,
  mapBudgetTier,
  determineLocationType,
  determineComplexity,
} from './categorization-rules';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase env vars for backfill:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];

function ruleBasedPriorities(idea: IdeaRow): string[] {
  const priorities: string[] = [];
  const textToAnalyze = `${idea.problem_statement || ''} ${idea.proposed_solution || ''} ${idea.category || ''} ${
    idea.location || ''
  }`.toLowerCase();
  const category = (idea.category || '').toLowerCase();

  for (const [priorityCode, config] of Object.entries(MOROCCAN_PRIORITIES_MAP)) {
    const cfg: any = config;

    if (cfg.categories && cfg.categories.includes(category)) {
      priorities.push(priorityCode);
      continue;
    }

    if (cfg.keywords && cfg.keywords.some((keyword: string) => textToAnalyze.includes(keyword.toLowerCase()))) {
      priorities.push(priorityCode);
      continue;
    }

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

async function backfillBatch(ideas: IdeaRow[]): Promise<{ updated: number; skipped: number }> {
  let updated = 0;
  let skipped = 0;

  for (const idea of ideas) {
    try {
      const alreadyHasPriorities = Array.isArray((idea as any).moroccan_priorities) && (idea as any).moroccan_priorities.length > 0;
      const alreadyHasBudget = !!(idea as any).budget_tier;
      const alreadyHasLocationType = !!(idea as any).location_type;
      const alreadyHasComplexity = !!(idea as any).complexity;

      // If all fields are already present, skip
      if (alreadyHasPriorities && alreadyHasBudget && alreadyHasLocationType && alreadyHasComplexity) {
        skipped++;
        continue;
      }

      let priorities = alreadyHasPriorities ? (idea as any).moroccan_priorities : ruleBasedPriorities(idea);

      // Optional AI fallback if no priorities found by rules
      if (!alreadyHasPriorities && priorities.length === 0) {
        try {
          priorities = await suggestMoroccanPriorities(
            idea.problem_statement || '',
            idea.proposed_solution || '',
            idea.category || ''
          );
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('AI fallback for priorities failed:', (e as any).message);
          }
        }
      }

      const budget_tier = alreadyHasBudget
        ? (idea as any).budget_tier
        : mapBudgetTier((idea as any).estimated_cost as any);

      const location_type = alreadyHasLocationType
        ? (idea as any).location_type
        : determineLocationType(idea.location, idea.category, idea.problem_statement);

      const complexity = alreadyHasComplexity
        ? (idea as any).complexity
        : determineComplexity(
            ((idea as any).ai_capabilities_needed || []) as string[],
            ((idea as any).integration_points || []) as string[],
            budget_tier || '<1K'
          );

      const updatePayload: any = {};

      if (priorities && priorities.length > 0) {
        updatePayload.moroccan_priorities = priorities;
      }
      if (budget_tier) {
        updatePayload.budget_tier = budget_tier;
      }
      if (location_type) {
        updatePayload.location_type = location_type;
      }
      if (complexity) {
        updatePayload.complexity = complexity;
      }

      if (Object.keys(updatePayload).length === 0) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('marrai_ideas')
        // @ts-expect-error – partial update
        .update(updatePayload)
        .eq('id', idea.id);

      if (error) {
        console.error(`❌ Error updating idea ${idea.id}:`, error.message);
        skipped++;
      } else {
        updated++;
        console.log(
          `✅ Updated ${idea.title} (${idea.id}) with priorities=${JSON.stringify(
            updatePayload.moroccan_priorities || []
          )}, budget=${updatePayload.budget_tier || 'null'}, location_type=${
            updatePayload.location_type || 'null'
          }, complexity=${updatePayload.complexity || 'null'}`
        );
      }

      // Small delay to avoid hammering Claude
      await new Promise((r) => setTimeout(r, 300));
    } catch (err: any) {
      console.error(`❌ Exception updating idea ${idea.id}:`, err.message);
      skipped++;
    }
  }

  return { updated, skipped };
}

async function main() {
  console.log('\n🇲🇦 Backfilling Moroccan metadata for existing ideas...\n');

  const pageSize = 25;
  let offset = 0;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  while (true) {
    const { data, error } = await supabase
      .from('marrai_ideas')
      .select('*')
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('❌ Error fetching ideas:', error.message);
      break;
    }

    const batch = data || [];
    if (batch.length === 0) break;

    console.log(`\n📦 Processing batch starting at offset ${offset} (${batch.length} ideas)...`);
    const { updated, skipped } = await backfillBatch(batch as any);
    totalProcessed += batch.length;
    totalUpdated += updated;
    totalSkipped += skipped;

    offset += pageSize;
  }

  console.log('\n📊 Backfill Summary:');
  console.log(`   🔄 Processed: ${totalProcessed}`);
  console.log(`   ✅ Updated:   ${totalUpdated}`);
  console.log(`   ↪️ Skipped:   ${totalSkipped}\n`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Unexpected error in backfill script:', err);
    process.exit(1);
  });
}


