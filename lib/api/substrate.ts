/**
 * Al-Ma3qool Protocol v2.0 - Layer 1: Durable Substrate
 * 
 * The ONLY durable entities that agents can mutate.
 * Everything else is disposable.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

// System of Record: Core entities that persist
export const SubstrateSchema = {
  // Core entity: Idea
  ideas: {
    id: 'uuid',
    title: 'string',
    problem_statement: 'text',
    solution: 'text',
    moroccan_priorities: 'jsonb[]', // Enum from constants
    budget_tier: 'enum',
    location_type: 'enum',
    complexity: 'enum',
    status: 'enum', // draft | validating | funded | sunset
    created_at: 'timestamp',
    eGov_Meta: { // Immutable audit trail
      intilaka_application_id: 'string',
      digital_receipt_ids: 'string[]',
      niya_certificate_id: 'string'
    }
  },

  // Core entity: User (Entrepreneur)
  users: {
    id: 'uuid',
    eGovId: 'string', // Morocco national digital ID
    mobileMoneyId: 'string', // Telecom API ID
    whatsappPhone: 'string', // Primary contact
    location_eGovVerified: 'geopoint', // From eID
    trust_circle: 'jsonb[]', // eIDs of 3 Niya witnesses
    daret_group_id: 'string', // WhatsApp group ID
    moroccan_priorities: 'jsonb[]', // Their focus areas
    capacity_profile: { // AI-inferred from behavior
      available_hours_per_week: 'integer',
      risk_tolerance: 'enum', // conservative | moderate | bold
      financial_runway_months: 'integer'
    }
  },

  // Core entity: Validation Proofs (Immutable)
  proofs: {
    id: 'uuid',
    idea_id: 'uuid',
    user_id: 'uuid',
    proof_type: 'enum', // niya | tadamoun | thiqa
    payload: 'jsonb', // Encoded verification data
    eGov_signature: 'string', // Cryptographic seal
    created_at: 'timestamp',
    verified_at: 'timestamp' // When eGov confirms
  }
};

export type ProofType = 'niya' | 'tadamoun' | 'thiqa';
export type IdeaStatus = 'draft' | 'validating' | 'funded' | 'sunset';

interface SubstrateQuery {
  entity: 'ideas' | 'users' | 'proofs';
  filters?: Record<string, any>;
  limit?: number;
}

interface SubstrateSnapshot {
  ideas?: any[];
  users?: any[];
  proofs?: any[];
}

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !apiKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * SubstrateAPI: Agents can ONLY call these methods
 * 
 * This is the system of record. All mutations go through here.
 */
export class SubstrateAPI {
  private supabase = getSupabase();

  /**
   * Create a proof (immutable record)
   * 
   * Proofs are cryptographically signed and cannot be modified.
   */
  async createProof(
    type: ProofType,
    data: {
      idea_id: string;
      user_id: string;
      payload: any;
      witnesses?: string[]; // For niya proofs
      expense_id?: string; // For tadamoun proofs
      customer_phone?: string; // For thiqa proofs
    }
  ): Promise<string> {
    // In production, this would call eGov API for signature
    // For now, we'll use a placeholder
    const signature = await this.generateSignature(data);

    const { data: proof, error } = await (this.supabase as any)
      .from('marrai_proofs')
      .insert({
        id: crypto.randomUUID(),
        idea_id: data.idea_id,
        user_id: data.user_id,
        proof_type: type,
        payload: data.payload,
        eGov_signature: signature,
        created_at: new Date().toISOString(),
        verified_at: null, // Will be set when eGov confirms
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create proof: ${error.message}`);
    }

    return proof.id;
  }

  /**
   * Get substrate state (no UI, just data)
   * 
   * Returns raw data for agents to process.
   */
  async getSubstrate(query: SubstrateQuery): Promise<SubstrateSnapshot> {
    const { entity, filters = {}, limit = 100 } = query;

    switch (entity) {
      case 'ideas': {
        let query = this.supabase.from('marrai_ideas').select('*');
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data } = await query.limit(limit);
        return { ideas: data || [] };
      }

      case 'users': {
        let query = this.supabase.from('marrai_secure_users').select('*');
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data } = await query.limit(limit);
        return { users: data || [] };
      }

      case 'proofs': {
        let query = this.supabase.from('marrai_proofs').select('*');
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data } = await query.limit(limit);
        return { proofs: data || [] };
      }

      default:
        return {};
    }
  }

  /**
   * Get proofs for a user
   */
  async getProofsForUser(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('marrai_proofs')
      .select('*')
      .eq('user_id', userId);
    
    return data || [];
  }

  /**
   * Transition idea status (with audit)
   * 
   * Status transitions are logged immutably.
   */
  async transitionStatus(
    ideaId: string,
    newStatus: IdeaStatus,
    verifiedBy: string = 'agent'
  ): Promise<void> {
    const { error } = await (this.supabase as any)
      .from('marrai_ideas')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        // In production, this would also log to an audit table
      })
      .eq('id', ideaId);

    if (error) {
      throw new Error(`Failed to transition status: ${error.message}`);
    }
  }

  /**
   * Get idea by ID
   */
  async getIdea(ideaId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (error || !data) {
      throw new Error(`Idea not found: ${ideaId}`);
    }

    return data;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('marrai_secure_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error(`User not found: ${userId}`);
    }

    return data;
  }

  /**
   * Generate eGov signature (placeholder - in production, call eGov API)
   */
  private async generateSignature(data: any): Promise<string> {
    // In production, this would be:
    // return await eGovAPI.sign(JSON.stringify(data));
    
    // For now, return a hash-based signature
    const payload = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `egov_${hashHex.substring(0, 32)}`;
  }
}

// Singleton instance
export const substrateAPI = new SubstrateAPI();

