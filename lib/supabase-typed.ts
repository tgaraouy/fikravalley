/**
 * Typed Supabase client helper
 * This provides a properly typed Supabase client that works with all our custom tables
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Create a typed wrapper that allows any table operations
export type TypedSupabaseClient = {
  from<T = any>(table: string): {
    select(columns?: string): any;
    insert(values: T | T[]): any;
    update(values: Partial<T>): any;
    delete(): any;
    eq(column: string, value: any): any;
    neq(column: string, value: any): any;
    gt(column: string, value: any): any;
    gte(column: string, value: any): any;
    lt(column: string, value: any): any;
    lte(column: string, value: any): any;
    like(column: string, pattern: string): any;
    ilike(column: string, pattern: string): any;
    is(column: string, value: any): any;
    in(column: string, values: any[]): any;
    contains(column: string, value: any): any;
    order(column: string, options?: { ascending?: boolean }): any;
    limit(count: number): any;
    single(): Promise<{ data: T | null; error: any }>;
  };
  rpc(functionName: string, params?: any): Promise<{ data: any; error: any }>;
} & Omit<SupabaseClient<any>, 'from' | 'rpc'>;

/**
 * Create a typed Supabase client
 * This wrapper allows us to use any table name without TypeScript errors
 */
export function createTypedClient(): TypedSupabaseClient {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client as unknown as TypedSupabaseClient;
}


