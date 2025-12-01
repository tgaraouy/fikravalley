/**
 * Verify Market Analysis Data in Supabase
 * 
 * Checks if market analysis data is actually being saved to the database
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMarketAnalysis() {
  console.log('🔍 Verifying Market Analysis Data in Supabase\n');
  console.log('='.repeat(60));

  try {
    // 1. Count total ideas
    const { count: totalIdeas, error: countError } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Error counting ideas: ${countError.message}`);
    }

    console.log(`\n📊 Total ideas in database: ${totalIdeas}`);

    // 2. Count ideas with market analysis
    const { count: analyzedCount, error: analyzedError } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .not('ai_market_analysis', 'is', null);

    if (analyzedError) {
      throw new Error(`Error counting analyzed ideas: ${analyzedError.message}`);
    }

    console.log(`✅ Ideas with market analysis: ${analyzedCount}`);
    console.log(`📈 Percentage: ${((analyzedCount || 0) / (totalIdeas || 1) * 100).toFixed(1)}%`);

    // 3. Get recent analyses
    const { data: recentAnalyses, error: recentError } = await supabase
      .from('marrai_ideas')
      .select('id, title, ai_market_analysis')
      .not('ai_market_analysis', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (recentError) {
      throw new Error(`Error fetching recent analyses: ${recentError.message}`);
    }

    console.log(`\n📋 Recent Analyses (last 5):`);
    console.log('-'.repeat(60));
    
    recentAnalyses?.forEach((idea: any, index: number) => {
      const analysis = idea.ai_market_analysis;
      console.log(`\n${index + 1}. ${idea.title.substring(0, 50)}...`);
      console.log(`   ID: ${idea.id.substring(0, 8)}...`);
      console.log(`   Analyzed at: ${analysis?.analyzed_at || 'N/A'}`);
      console.log(`   Confidence: ${((analysis?.confidence_score || 0) * 100).toFixed(1)}%`);
      console.log(`   Market size: ${analysis?.market_size?.value || 'N/A'} ${analysis?.market_size?.unit || ''}`);
      console.log(`   Competitors: ${analysis?.competitors?.length || 0}`);
      console.log(`   Trends: ${analysis?.trends?.length || 0}`);
      console.log(`   Risks: ${analysis?.risks?.length || 0}`);
      console.log(`   Opportunities: ${analysis?.opportunities?.length || 0}`);
    });

    // 4. Check analysis quality
    const { data: allAnalyses, error: qualityError } = await supabase
      .from('marrai_ideas')
      .select('ai_market_analysis')
      .not('ai_market_analysis', 'is', null);

    if (qualityError) {
      throw new Error(`Error fetching analyses for quality check: ${qualityError.message}`);
    }

    if (allAnalyses && allAnalyses.length > 0) {
      const confidences = allAnalyses
        .map((idea: any) => idea.ai_market_analysis?.confidence_score)
        .filter((c: any) => c !== undefined && c !== null) as number[];

      if (confidences.length > 0) {
        const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        const minConfidence = Math.min(...confidences);
        const maxConfidence = Math.max(...confidences);

        console.log(`\n📊 Analysis Quality:`);
        console.log(`   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
        console.log(`   Min confidence: ${(minConfidence * 100).toFixed(1)}%`);
        console.log(`   Max confidence: ${(maxConfidence * 100).toFixed(1)}%`);
      }
    }

    // 5. Compare with progress file
    const { readFileSync, existsSync } = require('fs');
    const PROGRESS_FILE = resolve(process.cwd(), 'scripts/market-analysis-progress.json');

    if (existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`\n📁 Progress File:`);
      console.log(`   Progress file says: ${progress.totalAnalyzed} analyzed`);
      console.log(`   Database has: ${analyzedCount} analyzed`);
      
      if (progress.totalAnalyzed !== analyzedCount) {
        console.log(`   ⚠️  MISMATCH! Progress file and database don't match.`);
        console.log(`   This could mean:`);
        console.log(`   - Some updates failed silently`);
        console.log(`   - Progress file is out of sync`);
        console.log(`   - Some ideas were analyzed manually`);
      } else {
        console.log(`   ✅ Progress file matches database!`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Verification complete!`);
    console.log(`\n💡 To see full SQL query, check: supabase/check-market-analysis.sql`);

  } catch (error: any) {
    console.error(`\n❌ Error verifying data:`, error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyMarketAnalysis();
}

export { verifyMarketAnalysis };

