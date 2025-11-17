import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user (server-side)
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authentication (server-side)
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Get user ID from session (server-side)
 * Returns null if not authenticated
 */
export async function getUserId() {
  const user = await getCurrentUser();
  return user?.id || null;
}

