/**
 * Supabase Auth Integration Helpers
 * For checking user authentication and access
 */

import { createClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';

type AccessRequestRow = Database['public']['Tables']['marrai_access_requests']['Row'];

/**
 * Check if user has approved and activated access
 * Uses Supabase Auth session + access_requests table
 */
export async function checkUserAccessStatus(email: string): Promise<{
  hasAccess: boolean;
  status: 'pending' | 'approved' | 'rejected' | null;
  activated: boolean;
  requestId?: string;
}> {
  try {
    const supabase = await createClient();

    // Check access request
    const { data } = await supabase
      .from('marrai_access_requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const accessRequest = data as AccessRequestRow | null;

    if (!accessRequest) {
      return { hasAccess: false, status: null, activated: false };
    }

    return {
      hasAccess: accessRequest.status === 'approved' && !!accessRequest.activated_at,
      status: accessRequest.status,
      activated: !!accessRequest.activated_at,
      requestId: accessRequest.id,
    };
  } catch (error) {
    console.error('Error checking user access status:', error);
    return { hasAccess: false, status: null, activated: false };
  }
}

/**
 * Get current user from Supabase Auth
 */
export async function getCurrentAuthUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentAuthUser();
    if (!user) return false;

    // Check if user email is in admin list
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
    return adminEmails.includes(user.email?.toLowerCase() || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

