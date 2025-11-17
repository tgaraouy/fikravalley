/**
 * Test script to verify Supabase connection
 * Run with: npx tsx scripts/test-supabase.ts
 * Or: ts-node scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Step 1: Check environment variables
  console.log('📋 Step 1: Checking environment variables');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
    console.log('\n💡 Solution: Add NEXT_PUBLIC_SUPABASE_URL=your_supabase_url to .env.local');
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
    console.log('\n💡 Solution: Add NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key to .env.local');
    process.exit(1);
  }

  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...');
  console.log('');

  // Step 2: Create Supabase client
  console.log('📋 Step 2: Creating Supabase client');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client created\n');

  // Step 3: Test connection with a simple query
  console.log('📋 Step 3: Testing connection with query to marrai_workshop_sessions');
  try {
    const { data, error, status, statusText } = await supabase
      .from('marrai_workshop_sessions')
      .select('id, name, name_french, created_at')
      .limit(5);

    if (error) {
      console.error('❌ Query Error:');
      console.error('  Status:', status, statusText);
      console.error('  Error Code:', error.code);
      console.error('  Error Message:', error.message);
      console.error('  Error Details:', error.details);
      console.error('  Error Hint:', error.hint);

      // Diagnose common issues
      console.log('\n🔧 Diagnosis:');
      if (error.code === 'PGRST116') {
        console.log('  → Table "marrai_workshop_sessions" does not exist');
        console.log('  → Solution: Run the database migrations/schema in Supabase');
      } else if (error.code === '42501') {
        console.log('  → Permission denied');
        console.log('  → Solution: Check RLS (Row Level Security) policies in Supabase');
      } else if (error.code === 'PGRST301') {
        console.log('  → JWT expired or invalid');
        console.log('  → Solution: Check that NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
      } else if (error.message?.includes('Invalid API key')) {
        console.log('  → Invalid API key');
        console.log('  → Solution: Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in Supabase dashboard');
      } else if (error.message?.includes('Failed to fetch')) {
        console.log('  → Network error - cannot reach Supabase');
        console.log('  → Solution: Check NEXT_PUBLIC_SUPABASE_URL and internet connection');
      }

      process.exit(1);
    }

    if (data === null) {
      console.error('❌ Query returned null data');
      process.exit(1);
    }

    console.log('✅ Query successful!');
    console.log(`✅ Found ${data.length} session(s)\n`);

    if (data.length > 0) {
      console.log('📊 Sample data:');
      data.forEach((session, index) => {
        console.log(`\n  Session ${index + 1}:`);
        console.log(`    ID: ${session.id}`);
        console.log(`    Name: ${session.name || 'N/A'}`);
        console.log(`    Name (FR): ${session.name_french || 'N/A'}`);
        console.log(`    Created: ${session.created_at || 'N/A'}`);
      });
    } else {
      console.log('ℹ️  Table is empty (no sessions found)');
      console.log('  This is OK - the connection works, just no data yet.');
    }

    console.log('\n✅ Supabase connection is working correctly!');
  } catch (err) {
    console.error('❌ Unexpected error:');
    console.error(err);
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection()
  .then(() => {
    console.log('\n✨ Test completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test failed with error:');
    console.error(err);
    process.exit(1);
  });

