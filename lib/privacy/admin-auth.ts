/**
 * Admin Authentication and Access Control
 * 
 * Handles admin authentication, 2FA, session management, and access logging
 */

import { createClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/auth-integration';
import { randomUUID } from 'crypto';

/**
 * Admin session data
 */
export interface AdminSession {
  adminId: string;
  email: string;
  sessionId: string;
  expiresAt: Date;
  lastActivity: Date;
  requires2FA: boolean;
  twoFactorVerified: boolean;
}

/**
 * Access log entry
 */
export interface AccessLog {
  id: string;
  adminId: string;
  userId: string | null;
  action: string;
  reason: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Session timeout: 15 minutes
 */
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

/**
 * Check if user is admin
 */
export async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  email?: string;
}> {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return { isAdmin: false };
    }

    // Get admin email
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      isAdmin: true,
      email: user?.email || undefined,
    };
  } catch (error) {
    console.error('Error checking admin access:', error);
    return { isAdmin: false };
  }
}

/**
 * Create admin session
 */
export async function createAdminSession(
  adminId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);

  // Store session (in production, use Redis or database)
  // For now, we'll use a simple in-memory store
  // TODO: Implement proper session storage

  // Log session creation
  await logAdminAccess(adminId, null, 'session_created', 'Admin session created', ipAddress, userAgent);

  return sessionId;
}

/**
 * Verify admin session
 */
export async function verifyAdminSession(
  sessionId: string
): Promise<{ valid: boolean; adminId?: string; email?: string }> {
  // TODO: Implement session verification
  // Check if session exists and hasn't expired
  // Update last activity

  return { valid: false };
}

/**
 * Log admin access to sensitive data
 */
export async function logAdminAccess(
  adminId: string,
  userId: string | null,
  action: string,
  reason: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('admin_access_logs').insert({
      id: randomUUID(),
      admin_id: adminId,
      user_id: userId,
      action,
      reason,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error logging admin access:', error);
    // Don't throw - logging should not break main flow
  }
}

/**
 * Get access logs for a user
 */
export async function getUserAccessLogs(
  userId: string
): Promise<AccessLog[]> {
  try {
    const supabase = await createClient();

    const { data: logs, error } = await supabase
      .from('admin_access_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return (
      logs?.map((log) => ({
        id: log.id,
        adminId: log.admin_id,
        userId: log.user_id,
        action: log.action,
        reason: log.reason,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: new Date(log.timestamp),
        metadata: log.metadata || {},
      })) || []
    );
  } catch (error) {
    console.error('Error getting access logs:', error);
    return [];
  }
}

/**
 * Mask phone number for display
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) {
    return '****';
  }

  // Format: 212****5678
  const countryCode = phone.substring(0, 3);
  const last4 = phone.substring(phone.length - 4);
  return `${countryCode}****${last4}`;
}

/**
 * Mask email for display
 */
export function maskEmail(email: string): string {
  if (!email) {
    return '****';
  }

  const [local, domain] = email.split('@');
  if (!domain) {
    return '****';
  }

  const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
  return `${maskedLocal}@${domain}`;
}

