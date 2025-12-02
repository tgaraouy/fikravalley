/**
 * Bulk Generate Embeddings for Ideas
 * 
 * Generates vector embeddings for all ideas in the database
 * Processes in batches with rate limiting
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateIdeaEmbedding, generateBatchEmbeddings } from '@/lib/ai/embeddings';
import type { Database } from '@/lib/supabase';
import { writeFileSync, readFileSync, existsSync } from 'fs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Progress {
  generated: string[];
  failed: Array<{ id: string; error: string }>;
  totalGenerated: number;
  totalFailed: number;
}

const PROGRESS_FILE = 'scripts/embedding-progress.json';

function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch {
      return { generated: [], failed: [], totalGenerated: 0, totalFailed: 0 };
    }
  }
  return { generated: [], failed: [], totalGenerated: 0, totalFailed: 0 };
}

function saveProgress(progress: Progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function generateEmbeddingForIdea(idea: any): Promise<boolean> {
  try {
    const embedding = await generateIdeaEmbedding({
      title: idea.title,
      problem_statement: idea.problem_statement,
      proposed_solution: idea.proposed_solution,
      category: idea.category,
    });

    // Update database
    // Supabase handles vector conversion automatically when passing array
    const { error } = await (supabase as any)
      .from('marrai_ideas')
      .update({ embedding })
      .eq('id', idea.id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  } catch (error: any) {
    console.error(`❌ Failed for ${idea.id}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Bulk Embedding Generation\n');
  console.log('='.repeat(60));

  const progress = loadProgress();
  console.log(`📈 Progress: ${progress.totalGenerated} embeddings already generated`);
  console.log(`❌ Failed: ${progress.totalFailed} ideas failed\n`);

  // Fetch all ideas without embeddings
  console.log('📥 Fetching ideas without embeddings...');
  let offset = 0;
  const pageSize = 50;
  let allIdeas: any[] = [];

  while (true) {
    const { data, error } = await (supabase as any)
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category, embedding')
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Error fetching ideas: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    // Filter out ideas that already have embeddings or are already processed
    const toProcess = data.filter(
      (idea: any) =>
        !idea.embedding &&
        !progress.generated.includes(idea.id) &&
        idea.title // Must have at least a title
    );

    allIdeas = [...allIdeas, ...toProcess];
    offset += pageSize;

    console.log(`   Fetched ${allIdeas.length} ideas to process...`);
  }

  console.log(`\n✅ Total ideas to process: ${allIdeas.length}\n`);

  if (allIdeas.length === 0) {
    console.log('✅ All ideas already have embeddings!');
    return;
  }

  // Process in batches
  const batchSize = 10; // Process 10 at a time to avoid rate limits
  let processed = 0;

  for (let i = 0; i < allIdeas.length; i += batchSize) {
    const batch = allIdeas.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} ideas)...`);

    const results = await Promise.allSettled(
      batch.map((idea) => generateEmbeddingForIdea(idea))
    );

    results.forEach((result, index) => {
      const idea = batch[index];
      if (result.status === 'fulfilled' && result.value) {
        progress.generated.push(idea.id);
        progress.totalGenerated++;
        processed++;
        console.log(`   ✅ ${idea.title.substring(0, 40)}...`);
      } else {
        progress.failed.push({
          id: idea.id,
          error: result.status === 'rejected' ? result.reason?.message || 'Unknown error' : 'Failed',
        });
        progress.totalFailed++;
        console.log(`   ❌ ${idea.title.substring(0, 40)}...`);
      }
    });

    saveProgress(progress);

    // Rate limiting: wait 1 second between batches
    if (i + batchSize < allIdeas.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Completed!`);
  console.log(`   Generated: ${processed} embeddings`);
  console.log(`   Failed: ${progress.totalFailed}`);
  console.log(`   Total with embeddings: ${progress.totalGenerated}`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

