/**
 * Al-Ma3qool Protocol v2.0 - Intent-Based Permissions
 * 
 * Permissions are NOT role-based—they're **intent-based**.
 * Agents request what they NEED, substrate validates against eGov rules.
 */

import { substrateAPI } from './substrate';
import type { ProofType } from './substrate';

export type Intent = 'validate-idea' | 'activate-daret' | 'submit-intilaka';

export interface PermissionGrant {
  granted: boolean;
  missing?: ProofType[];
  limits?: {
    maxCost: number;
    allowedActions: string[];
    expiresAt: number;
  };
}

/**
 * IntentPermissions: Define what each intent requires
 * 
 * This is the "constitution" of the system.
 * Agents can only do what intents allow.
 */
export const IntentPermissions: Record<Intent, {
  required_proofs: ProofType[];
  allowed_actions: string[];
  max_cost_dh: number;
}> = {
  'validate-idea': {
    required_proofs: [], // No proofs needed to start validation
    allowed_actions: ['create-niya-proof', 'send-whatsapp-message'],
    max_cost_dh: 0 // Free
  },

  'activate-daret': {
    required_proofs: ['niya'], // Must have Niya proof first
    allowed_actions: ['create-daret-group', 'initiate-recurring-payment'],
    max_cost_dh: 100
  },

  'submit-intilaka': {
    required_proofs: ['niya', 'tadamoun', 'thiqa'], // All 3 proofs required
    allowed_actions: ['egov-submit', 'generate-pdf'],
    max_cost_dh: 0 // Govt funded
  }
};

/**
 * Check if an agent/user can perform an intent
 * 
 * Agent asks: "Can I do X?" Substrate answers YES/NO with constraints.
 */
export async function checkIntent(
  userId: string,
  intent: Intent
): Promise<PermissionGrant> {
  // Get user's proofs
  const proofs = await substrateAPI.getProofsForUser(userId);

  // Get permission requirements for this intent
  const permission = IntentPermissions[intent];

  if (!permission) {
    return {
      granted: false,
      missing: []
    };
  }

  // Validate: Does user have required proofs?
  const userProofTypes = proofs.map(p => p.proof_type);
  const hasProofs = permission.required_proofs.every(requiredType =>
    userProofTypes.includes(requiredType)
  );

  if (!hasProofs) {
    return {
      granted: false,
      missing: permission.required_proofs.filter(requiredType =>
        !userProofTypes.includes(requiredType)
      )
    };
  }

  // Grant scoped permission
  return {
    granted: true,
    limits: {
      maxCost: permission.max_cost_dh,
      allowedActions: permission.allowed_actions,
      expiresAt: Date.now() + 3600000 // 1 hour
    }
  };
}

/**
 * Check if a specific action is allowed for an intent
 */
export function isActionAllowed(
  intent: Intent,
  action: string
): boolean {
  const permission = IntentPermissions[intent];
  if (!permission) return false;

  return permission.allowed_actions.includes(action);
}

/**
 * Get cost limit for an intent
 */
export function getCostLimit(intent: Intent): number {
  return IntentPermissions[intent]?.max_cost_dh || 0;
}

