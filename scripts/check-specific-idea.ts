/**
 * Check if a specific idea exists in the database
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

const ideaId = process.argv[2] || '2ca6f7e8-2f41-4f59-a0bb-84951878ea80';

async function checkIdea() {
  console.log(`🔍 Checking idea: ${ideaId}\n`);

  try {
    // Check if idea exists (without any filters)
    const { data: idea, error } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, visible, deleted_at, created_at')
      .eq('id', ideaId)
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!idea) {
      console.log('❌ Idea not found in database');
      return;
    }

    console.log('✅ Idea found!');
    console.log(`   Title: ${idea.title || '(no title)'}`);
    console.log(`   Visible: ${idea.visible ? '✅' : '❌'}`);
    console.log(`   Deleted: ${idea.deleted_at ? '❌ Yes' : '✅ No'}`);
    console.log(`   Created: ${new Date(idea.created_at).toLocaleDateString()}`);
    console.log(`   Problem: ${(idea.problem_statement || '').substring(0, 100)}...`);

  } catch (error: any) {
    console.error('❌ Error:', error);
  }
}

checkIdea()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

