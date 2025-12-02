/**
 * Al-Ma3qool Protocol v2.0 - Layer 2: Intent/Agentic Layer
 * 
 * Agents are NOT chatbots—they're **stateless orchestrators**.
 * They exist only to interpret intent and call substrate.
 */

import { substrateAPI } from '@/lib/api/substrate';
import { checkIntent, type Intent } from '@/lib/api/permissions';
import { PixelGenerator } from '@/lib/pixels/runtime';
import type { DisposableUI } from '@/lib/pixels/runtime';

export interface AgentResult {
  action: 'send-whatsapp' | 'return-group-link' | 'egov-submit' | 'error';
  payload?: any;
  proofId?: string | null;
  ui?: DisposableUI;
}

export interface AgentContext {
  userId: string;
  userPhone: string;
  ideaId?: string;
  priority?: string;
  priorities?: string[];
  [key: string]: any;
}

/**
 * AlMa3qoolAgent: Main orchestrator
 * 
 * Executes intents by calling substrate and generating disposable UI.
 */
export class AlMa3qoolAgent {
  private intent: Intent;
  private context: AgentContext;

  constructor(intent: Intent, context: AgentContext) {
    this.intent = intent;
    this.context = context;
  }

  /**
   * Main execution loop
   * 
   * 1. Check permissions
   * 2. Execute intent-specific protocol
   * 3. Return result (usually a disposable UI)
   */
  async execute(): Promise<AgentResult> {
    try {
      // Step 1: Check permissions
      const permission = await checkIntent(this.context.userId, this.intent);
      
      if (!permission.granted) {
        return await this.generateErrorUI(permission.missing || []);
      }

      // Step 2: Execute based on intent
      switch (this.intent) {
        case 'validate-idea':
          return await this.executeNiyaProtocol();

        case 'activate-daret':
          return await this.executeDaretProtocol();

        case 'submit-intilaka':
          return await this.executeIntilakaProtocol();

        default:
          return {
            action: 'error',
            payload: { error: `Unknown intent: ${this.intent}` }
          };
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Agent execution error for intent ${this.intent}:`, error);
      }
      return {
        action: 'error',
        payload: { error: error.message || 'Unknown error' }
      };
    }
  }

  /**
   * Niya Protocol: Generate disposable UI for 60s voice note
   * 
   * Flow:
   * 1. Generate WhatsApp message asking for voice note
   * 2. Wait for 3 witness replies
   * 3. Create immutable proof
   * 4. Return success message
   */
  private async executeNiyaProtocol(): Promise<AgentResult> {
    if (!this.context.ideaId) {
      return {
        action: 'error',
        payload: { error: 'Idea ID required for Niya protocol' }
      };
    }

    // Get idea details
    const idea = await substrateAPI.getIdea(this.context.ideaId);
    const user = await substrateAPI.getUser(this.context.userId);

    // Generate WhatsApp message (disposable pixel)
    const niyaUI = await PixelGenerator.niyaWitnessRequest(user, idea);

    // In production, this would:
    // 1. Send WhatsApp message via API
    // 2. Set up webhook to listen for replies
    // 3. Wait for 3 replies (with timeout)
    // 4. Create proof when complete

    // For now, return the UI spec
    return {
      action: 'send-whatsapp',
      payload: {
        phone: this.context.userPhone,
        message: niyaUI.content || 'Niya protocol initiated'
      },
      ui: niyaUI
    };
  }

  /**
   * Daret Protocol: Spin up temporary group, auto-pool funds
   * 
   * Flow:
   * 1. AI matches 4 founders by priority + capacity
   * 2. Create WhatsApp group (temporary, 30 days)
   * 3. Auto-initiate mobile money pooling
   * 4. Return group link
   */
  private async executeDaretProtocol(): Promise<AgentResult> {
    // AI matches 4 founders by priority + capacity (no UI needed)
    // This would call a matching service
    const members = await this.matchDaretMembers();

    // Generate WhatsApp group (exists only for 30 days)
    // In production, this would call WhatsApp Business API
    const groupId = await this.createTemporaryWhatsAppGroup({
      name: `Daret ${this.context.priority || 'Innovation'}`,
      members,
      autoDisband: Date.now() + 2592000000 // 30 days
    });

    // Auto-initiate mobile money pooling via telecom API
    // In production, this would call mobile money API
    await this.createRecurringPool({
      groupId,
      amount: 100,
      schedule: 'monthly'
    });

    // Proof created automatically when first payment hits
    return {
      action: 'return-group-link',
      payload: { groupId },
      proofId: null // Will be created async
    };
  }

  /**
   * Intilaka Protocol: Auto-submit when 3 proofs exist
   * 
   * Flow:
   * 1. Check if user has all 3 proofs (niya, tadamoun, thiqa)
   * 2. If yes, auto-submit to eGov
   * 3. If no, generate UI showing missing proofs
   */
  private async executeIntilakaProtocol(): Promise<AgentResult> {
    const proofs = await substrateAPI.getProofsForUser(this.context.userId);

    // Validate completeness
    const required: Array<'niya' | 'tadamoun' | 'thiqa'> = ['niya', 'tadamoun', 'thiqa'];
    const userProofTypes = proofs.map(p => p.proof_type);
    const hasAll = required.every(type => userProofTypes.includes(type));

    if (!hasAll) {
      const missing = required.filter(type => !userProofTypes.includes(type));
      return this.generateMissingProofsUI(missing);
    }

    // Auto-submit to eGov (no human UI needed)
    // In production, this would call eGov API
    const applicationId = await this.submitToEGov({
      proofs,
      moroccanPriorities: this.context.priorities || []
    });

    // Disposable success UI: WhatsApp message only
    return {
      action: 'send-whatsapp',
      payload: {
        phone: this.context.userPhone,
        message: `🎉 Intilaka soumis! ID: ${applicationId}`
      },
      proofId: null
    };
  }

  /**
   * Generate error UI (disposable, discarded after send)
   */
  private async generateErrorUI(missing: string[]): Promise<AgentResult> {
    const errorUI = await PixelGenerator.errorMessage(
      `⚠️ Il manque: ${missing.join(', ')}`
    );

    return {
      action: 'send-whatsapp',
      payload: {
        phone: this.context.userPhone,
        message: errorUI.content || `Missing: ${missing.join(', ')}`
      },
      ui: errorUI
    };
  }

  /**
   * Generate UI showing missing proofs
   */
  private async generateMissingProofsUI(missing: string[]): Promise<AgentResult> {
    const missingUI = await PixelGenerator.missingProofs(missing);

    return {
      action: 'send-whatsapp',
      payload: {
        phone: this.context.userPhone,
        message: missingUI.content || `Missing proofs: ${missing.join(', ')}`
      },
      ui: missingUI
    };
  }

  // Placeholder methods (to be implemented with actual integrations)

  private async matchDaretMembers(): Promise<string[]> {
    // In production: AI matching service
    return [];
  }

  private async createTemporaryWhatsAppGroup(config: {
    name: string;
    members: string[];
    autoDisband: number;
  }): Promise<string> {
    // In production: WhatsApp Business API
    return `whatsapp-group-${Date.now()}`;
  }

  private async createRecurringPool(config: {
    groupId: string;
    amount: number;
    schedule: string;
  }): Promise<void> {
    // In production: Mobile money API
  }

  private async submitToEGov(config: {
    proofs: any[];
    moroccanPriorities: string[];
  }): Promise<string> {
    // In production: eGov API
    return `intilaka-${Date.now()}`;
  }
}
