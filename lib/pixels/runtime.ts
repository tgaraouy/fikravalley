/**
 * Al-Ma3qool Protocol v2.0 - Layer 3: Disposable Pixels
 * 
 * NO React components. NO pages. Just functions that return disposable UI.
 * 
 * UI is generated ONLY when agent needs to "show" something.
 * Rendered in WhatsApp/Telegram/etc., then discarded.
 */

export type DisposableUIType = 
  | 'whatsapp-text'
  | 'whatsapp-interactive'
  | 'whatsapp-upload'
  | 'whatsapp-payment';

export interface DisposableUI {
  type: DisposableUIType;
  platform: 'whatsapp' | 'telegram' | 'sms';
  content?: string;
  elements?: DisposableUIElement[];
  discardAfter: 'completion' | 'upload' | 'payment' | 'read' | 'timeout';
  ttl?: number; // Time to live in seconds
}

export interface DisposableUIElement {
  type: string;
  [key: string]: any;
}

/**
 * PixelGenerator: Creates disposable UI on-demand
 * 
 * These functions are called ONLY when agent needs to "show" something.
 * UI is never stored, just rendered and discarded.
 */
export const PixelGenerator = {
  /**
   * Niya Witness Request
   * 
   * Generated when user wants to validate an idea.
   * Disappears after voice note is recorded.
   */
  async niyaWitnessRequest(founder: any, idea: any): Promise<DisposableUI> {
    return {
      type: 'whatsapp-interactive',
      platform: 'whatsapp',
      content: `Niya Declaration for "${idea.title}":

I, ${founder.name || 'Founder'}, commit to building this for ${idea.location || 'Morocco'} with integrity.

Please record a 60-second voice note declaring your commitment.`,
      elements: [
        {
          type: 'voice-note-prompt',
          message: `Niya Declaration for "${idea.title}": "I, ${founder.name || 'Founder'}, commit to building this for ${idea.location || 'Morocco'} with integrity."`,
          maxDuration: 60,
          onComplete: 'agent://niya-protocol/witness-wait'
        }
      ],
      discardAfter: 'completion',
      ttl: 300 // 5 minutes
    };
  },

  /**
   * Daret Funding Receipt
   * 
   * Rendered only for the recipient to upload receipt.
   * Disappears after upload.
   */
  async daretFundingReceipt(expense: any): Promise<DisposableUI> {
    return {
      type: 'whatsapp-upload',
      platform: 'whatsapp',
      content: `Upload receipt for your ${expense.amount || 100} DH Daret expense`,
      elements: [
        {
          type: 'receipt-uploader',
          instructions: 'Upload receipt for your 100 DH Daret expense',
          allowedTypes: ['image/*'],
          onUpload: 'agent://tadamoun-protocol/verify-expense'
        }
      ],
      discardAfter: 'upload',
      ttl: 3600 // 1 hour
    };
  },

  /**
   * Thiqa Order Link
   * 
   * Generated when customer expresses interest.
   * Link expires after payment or 24h.
   */
  async thiqaOrderLink(customerPhone: string, idea: any, paymentLink: string): Promise<DisposableUI> {
    return {
      type: 'whatsapp-payment',
      platform: 'whatsapp',
      content: `Commande "${idea.title}" - 30 DH`,
      elements: [
        {
          type: 'payment-request',
          message: `Commande "${idea.title}" - 30 DH`,
          link: paymentLink,
          onSuccess: 'agent://thiqa-protocol/confirm-delivery'
        }
      ],
      discardAfter: 'payment',
      ttl: 86400 // 24 hours
    };
  },

  /**
   * Progress Dashboard
   * 
   * Only shown when user asks "where am I?".
   * Generated ON DEMAND, not a persistent page.
   */
  async progressDashboard(proofs: any[]): Promise<DisposableUI> {
    const proofCount = proofs.length;
    const required = ['niya', 'tadamoun', 'thiqa'];
    const hasProofs = required.map(type => 
      proofs.some(p => p.proof_type === type)
    );

    const status = `
📊 Votre Progression:

✅ Niya: ${hasProofs[0] ? '✓' : '✗'}
✅ Tadamoun: ${hasProofs[1] ? '✓' : '✗'}
✅ Thiqa: ${hasProofs[2] ? '✓' : '✗'}

Proofs: ${proofCount}/3
`;

    return {
      type: 'whatsapp-text',
      platform: 'whatsapp',
      content: status,
      elements: [
        {
          type: 'status-summary',
          content: status
        }
      ],
      discardAfter: 'read',
      ttl: 60 // 1 minute
    };
  },

  /**
   * Error Message
   */
  async errorMessage(message: string): Promise<DisposableUI> {
    return {
      type: 'whatsapp-text',
      platform: 'whatsapp',
      content: message,
      discardAfter: 'read',
      ttl: 300 // 5 minutes
    };
  },

  /**
   * Missing Proofs
   */
  async missingProofs(missing: string[]): Promise<DisposableUI> {
    const message = `⚠️ Il manque les preuves suivantes:

${missing.map(p => `• ${p}`).join('\n')}

Complétez ces étapes pour continuer.`;

    return {
      type: 'whatsapp-text',
      platform: 'whatsapp',
      content: message,
      discardAfter: 'read',
      ttl: 3600 // 1 hour
    };
  }
};

