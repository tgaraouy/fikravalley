/**
 * Supabase helper with proper typing for custom tables
 * This allows us to use any table without TypeScript errors
 */

import { supabase } from './supabase';

/**
 * Get a typed Supabase query builder for any table
 * This is a workaround for missing type definitions for custom tables
 */
export function getTable<T = any>(tableName: string) {
  return (supabase as any).from(tableName) as {
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
}

/**
 * Typed Supabase client that works with all tables
 */
export const typedSupabase = supabase as any;


