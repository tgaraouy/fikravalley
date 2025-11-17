/**
 * Access Control Helper Functions
 * For managing user access and permissions
 */

export type UserRole = 'public' | 'user' | 'workshop_participant' | 'staff' | 'admin';
export type AccessStatus = 'pending' | 'approved' | 'rejected';

export interface AccessRequest {
  id: string;
  email: string;
  name: string;
  organization?: string;
  user_type: string;
  reason: string;
  how_heard?: string;
  status: AccessStatus;
  created_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

/**
 * Check if user has access to submit ideas
 */
export async function checkUserAccess(email: string): Promise<{
  hasAccess: boolean;
  status: AccessStatus | null;
  requestId?: string;
}> {
  try {
    const response = await fetch(`/api/access-requests?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      return { hasAccess: false, status: null };
    }

    const data = await response.json();
    if (!data.requests || data.requests.length === 0) {
      return { hasAccess: false, status: null };
    }

    const request = data.requests[0];
    return {
      hasAccess: request.status === 'approved',
      status: request.status,
      requestId: request.id,
    };
  } catch (error) {
    console.error('Error checking user access:', error);
    return { hasAccess: false, status: null };
  }
}

/**
 * Check if email is from trusted domain (auto-approve)
 */
export function isFromTrustedDomain(email: string): boolean {
  const trustedDomains = [
    'ministry.gov.ma',
    'hospital.ma',
    'university.ac.ma',
    'gmail.com', // For testing - remove in production
  ];

  const domain = email.toLowerCase().split('@')[1];
  return trustedDomains.some((trusted) => domain === trusted);
}

/**
 * Verify workshop code
 */
export async function verifyWorkshopCode(code: string): Promise<{
  valid: boolean;
  workshopId?: string;
  message?: string;
}> {
  try {
    const response = await fetch(`/api/workshop-codes/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { valid: false, message: error.error || 'Code invalide' };
    }

    const data = await response.json();
    return {
      valid: data.valid,
      workshopId: data.workshop_id,
      message: data.message,
    };
  } catch (error) {
    console.error('Error verifying workshop code:', error);
    return { valid: false, message: 'Erreur lors de la vérification' };
  }
}

/**
 * Get user role from session/context
 * In production, this would check Supabase auth session
 */
export function getUserRole(): UserRole {
  // TODO: Implement actual role checking from Supabase auth
  // For now, return based on localStorage
  const role = localStorage.getItem('fikralabs_role');
  return (role as UserRole) || 'public';
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
  action: 'submit' | 'validate' | 'moderate' | 'admin',
  userRole: UserRole
): boolean {
  const permissions: Record<UserRole, string[]> = {
    public: [],
    user: ['submit'],
    workshop_participant: ['submit', 'validate'],
    staff: ['submit', 'validate', 'moderate'],
    admin: ['submit', 'validate', 'moderate', 'admin'],
  };

  return permissions[userRole]?.includes(action) || false;
}

