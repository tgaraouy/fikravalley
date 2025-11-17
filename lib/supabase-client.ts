'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './supabase';

/**
 * Client-side Supabase client with auth support
 * Use this in client components ('use client')
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

