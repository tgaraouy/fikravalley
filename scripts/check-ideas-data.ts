/**
 * Diagnostic Script: Check Ideas Data
 * 
 * Verifies that all 557 ideas still exist and have their data intact
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIdeasData() {
  console.log('🔍 Checking ideas data...\n');

  try {
    // Count total ideas
    const { count: totalCount, error: countError } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting ideas:', countError);
      return;
    }

    console.log(`📊 Total ideas in database: ${totalCount}\n`);

    // Check for ideas with missing critical data
    const { data: ideas, error: fetchError } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category, location, visible, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchError) {
      console.error('❌ Error fetching ideas:', fetchError);
      return;
    }

    if (!ideas || ideas.length === 0) {
      console.log('⚠️  No ideas found in database!');
      return;
    }

    // Analyze data completeness
    const stats = {
      total: ideas.length,
      withTitle: 0,
      withProblem: 0,
      withSolution: 0,
      withCategory: 0,
      withLocation: 0,
      visible: 0,
      missingData: [] as any[],
    };

    ideas.forEach((idea: any) => {
      if (idea.title) stats.withTitle++;
      if (idea.problem_statement) stats.withProblem++;
      if (idea.proposed_solution) stats.withSolution++;
      if (idea.category) stats.withCategory++;
      if (idea.location) stats.withLocation++;
      if (idea.visible) stats.visible++;

      const missing: string[] = [];
      if (!idea.title) missing.push('title');
      if (!idea.problem_statement) missing.push('problem_statement');
      if (!idea.category) missing.push('category');
      if (!idea.location) missing.push('location');

      if (missing.length > 0) {
        stats.missingData.push({
          id: idea.id,
          title: idea.title || '(no title)',
          missing,
        });
      }
    });

    console.log('📈 Data Completeness:');
    console.log(`  ✅ With title: ${stats.withTitle}/${stats.total} (${Math.round(stats.withTitle / stats.total * 100)}%)`);
    console.log(`  ✅ With problem statement: ${stats.withProblem}/${stats.total} (${Math.round(stats.withProblem / stats.total * 100)}%)`);
    console.log(`  ✅ With solution: ${stats.withSolution}/${stats.total} (${Math.round(stats.withSolution / stats.total * 100)}%)`);
    console.log(`  ✅ With category: ${stats.withCategory}/${stats.total} (${Math.round(stats.withCategory / stats.total * 100)}%)`);
    console.log(`  ✅ With location: ${stats.withLocation}/${stats.total} (${Math.round(stats.withLocation / stats.total * 100)}%)`);
    console.log(`  👁️  Visible: ${stats.visible}/${stats.total} (${Math.round(stats.visible / stats.total * 100)}%)\n`);

    if (stats.missingData.length > 0) {
      console.log(`⚠️  Found ${stats.missingData.length} ideas with missing data:\n`);
      stats.missingData.slice(0, 10).forEach((item) => {
        console.log(`  - ${item.id}: "${item.title}" - Missing: ${item.missing.join(', ')}`);
      });
      if (stats.missingData.length > 10) {
        console.log(`  ... and ${stats.missingData.length - 10} more`);
      }
      console.log();
    }

    // Show sample of recent ideas
    console.log('📋 Sample of recent ideas:');
    ideas.slice(0, 5).forEach((idea: any, idx: number) => {
      console.log(`\n  ${idx + 1}. ${idea.title || '(no title)'}`);
      console.log(`     ID: ${idea.id}`);
      console.log(`     Problem: ${(idea.problem_statement || '').substring(0, 80)}...`);
      console.log(`     Category: ${idea.category || '(none)'}`);
      console.log(`     Location: ${idea.location || '(none)'}`);
      console.log(`     Visible: ${idea.visible ? '✅' : '❌'}`);
      console.log(`     Created: ${new Date(idea.created_at).toLocaleDateString()}`);
    });

    // Check if visible filter might be hiding ideas
    const { count: visibleCount } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('visible', true);

    console.log(`\n🔍 Visibility Check:`);
    console.log(`  Total ideas: ${totalCount}`);
    console.log(`  Visible ideas: ${visibleCount || 0}`);
    console.log(`  Hidden ideas: ${(totalCount || 0) - (visibleCount || 0)}`);

    if ((visibleCount || 0) < (totalCount || 0) * 0.5) {
      console.log(`\n⚠️  WARNING: Less than 50% of ideas are visible!`);
      console.log(`   This might explain why ideas aren't showing up.`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error);
  }
}

checkIdeasData()
  .then(() => {
    console.log('\n✅ Diagnostic complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

