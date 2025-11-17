import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * GET /api/health
 * Comprehensive health check endpoint to verify database connection
 * Includes environment variable checks and detailed error diagnosis
 */
export async function GET() {
  try {
    // Step 1: Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isConfigured: isSupabaseConfigured(),
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...`
        : null,
    };

    if (!envCheck.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase environment variables not configured',
          env_check: envCheck,
          database_connected: false,
          timestamp: new Date().toISOString(),
          diagnosis: {
            issue: 'Missing environment variables',
            solution: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local',
            location: 'Create or update .env.local in project root',
          },
        },
        { status: 500 }
      );
    }

    // Step 2: Test database connection by querying marrai_workshop_sessions
    const { data, error, status, statusText } = await supabase
      .from('marrai_workshop_sessions')
      .select('id, name, name_french, created_at')
      .limit(5);

    if (error) {
      console.error('Database connection error:', error);
      
      // Diagnose common issues
      let diagnosis = {
        issue: error.message,
        code: error.code,
        possible_causes: [] as string[],
        solutions: [] as string[],
      };

      if (error.code === 'PGRST116') {
        diagnosis.possible_causes.push('Table does not exist');
        diagnosis.solutions.push('Run database migrations/schema in Supabase');
        diagnosis.solutions.push('Check table name spelling (marrai_workshop_sessions)');
      } else if (error.code === '42501') {
        diagnosis.possible_causes.push('Permission denied');
        diagnosis.solutions.push('Check RLS (Row Level Security) policies in Supabase');
        diagnosis.solutions.push('Verify service_role key has proper permissions');
      } else if (error.code === 'PGRST301') {
        diagnosis.possible_causes.push('JWT expired or invalid');
        diagnosis.solutions.push('Check that NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
        diagnosis.solutions.push('Regenerate anon key in Supabase dashboard');
      } else if (error.message?.includes('Invalid API key')) {
        diagnosis.possible_causes.push('Invalid API key');
        diagnosis.solutions.push('Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in Supabase dashboard');
        diagnosis.solutions.push('Check for extra spaces or quotes in .env.local');
      } else if (error.message?.includes('Failed to fetch')) {
        diagnosis.possible_causes.push('Network error');
        diagnosis.solutions.push('Check NEXT_PUBLIC_SUPABASE_URL is correct');
        diagnosis.solutions.push('Verify internet connection');
        diagnosis.solutions.push('Check Supabase project is active');
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed',
          env_check: envCheck,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            status,
            statusText,
          },
          diagnosis,
          database_connected: false,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Step 3: Optionally count tables (this is a simple check)
    let tableCount = 0;
    const knownTables = [
      'marrai_ideas',
      'marrai_workshop_sessions',
      'marrai_conversation_ideas',
      'marrai_diaspora_profiles',
      'marrai_agent_solutions',
      'marrai_transcripts',
    ];

    for (const table of knownTables) {
      try {
        const { error: tableError } = await supabase.from(table).select('id').limit(1);
        if (!tableError) {
          tableCount++;
        }
      } catch {
        // Ignore errors for individual table checks
      }
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Database connection successful',
        env_check: envCheck,
        database_connected: true,
        timestamp: new Date().toISOString(),
        table_count: tableCount,
        total_tables_checked: knownTables.length,
        sample_data: data && data.length > 0 ? data : null,
        record_count: data?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in health check:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during health check',
        database_connected: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

