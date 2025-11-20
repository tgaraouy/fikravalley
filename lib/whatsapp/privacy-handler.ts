/**
 * WhatsApp Privacy Handler
 * 
 * Handles WhatsApp conversations with full privacy compliance:
 * - Consent checking before data collection
 * - Encrypted data storage
 * - Conversation state management
 * - User rights handling
 * - Rate limiting
 * - No PII logging
 */

import { sendWhatsAppMessage } from '../whatsapp';
import { ConsentManager } from '../privacy/consent';
import { SecureUserStorage } from '../privacy/secure-storage';
import { createClient } from '../supabase-server';
import { randomUUID } from 'crypto';

/**
 * Conversation stages
 */
export type ConversationStage =
  | 'need_consent'
  | 'collecting_name'
  | 'collecting_problem'
  | 'collecting_location'
  | 'collecting_analysis_consent'
  | 'collecting_retention'
  | 'completed'
  | 'deletion_requested'
  | 'export_requested'
  | 'help_requested'
  | 'stopped';

/**
 * Conversation state stored in database
 */
interface ConversationState {
  id: string;
  user_id: string | null;
  phone_hash: string; // bcrypt hash
  stage: ConversationStage;
  encrypted_data: string; // AES-256-GCM encrypted JSON
  data_iv: string;
  data_tag: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
}

/**
 * Decrypted conversation data
 */
interface ConversationData {
  name?: string;
  problem?: string;
  location?: string;
  hasAnalysisConsent?: boolean;
  retentionDays?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Message context
 */
interface MessageContext {
  phone: string;
  message: string;
  messageId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Rate limiting: 10 messages per minute
 */
const RATE_LIMIT_MESSAGES = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Message rate tracker (in-memory, should use Redis in production)
 */
const rateLimitMap = new Map<string, number[]>();

/**
 * Check rate limit
 */
function checkRateLimit(phoneHash: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(phoneHash) || [];

  // Remove timestamps outside window
  const recentTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recentTimestamps.length >= RATE_LIMIT_MESSAGES) {
    return false; // Rate limit exceeded
  }

  // Add current timestamp
  recentTimestamps.push(now);
  rateLimitMap.set(phoneHash, recentTimestamps);

  return true; // Within rate limit
}

/**
 * Hash phone number (same as SecureUserStorage)
 */
async function hashPhone(phone: string): Promise<string> {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(phone, 12);
}

/**
 * Encrypt conversation data
 */
function encryptData(data: ConversationData): { encrypted: string; iv: string; tag: string } {
  const crypto = require('crypto');
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const dataString = JSON.stringify(data);
  let encrypted = cipher.update(dataString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypt conversation data
 */
function decryptData(encryptedData: {
  encrypted: string;
  iv: string;
  tag: string;
}): ConversationData {
  const crypto = require('crypto');
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

/**
 * Sanitize log message (never log PII)
 */
function sanitizeLog(message: string, userId?: string): string {
  if (userId) {
    return message.replace(/\{userId\}/g, userId.substring(0, 8) + '...');
  }
  return message;
}

/**
 * Create audit log
 */
async function createAuditLog(
  userId: string | null,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    await (supabase as any).from('marrai_audit_logs').insert({
      id: randomUUID(),
      user_id: userId,
      action,
      actor: 'whatsapp_user',
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break flow
    console.error('Failed to create audit log:', sanitizeLog('Audit log error', userId || undefined));
  }
}

/**
 * WhatsApp Privacy Handler Class
 */
export class WhatsAppPrivacyHandler {
  private supabase: Awaited<ReturnType<typeof createClient>>;
  private consentManager: ConsentManager;
  private secureStorage: SecureUserStorage;

  constructor() {
    this.supabase = null as any;
    this.consentManager = new ConsentManager();
    this.secureStorage = new SecureUserStorage();
  }

  /**
   * Get Supabase client
   */
  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Get or create conversation state
   */
  private async getConversationState(phoneHash: string): Promise<ConversationState | null> {
    const supabase = await this.getSupabase();

    const { data: state } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('phone_hash', phoneHash)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return state as ConversationState | null;
  }

  /**
   * Create new conversation state
   */
  private async createConversationState(
    phoneHash: string,
    stage: ConversationStage
  ): Promise<ConversationState> {
    const supabase = await this.getSupabase();
    const conversationId = randomUUID();

    const emptyData: ConversationData = {};
    const encrypted = encryptData(emptyData);

    const { data: state, error } = await (supabase as any)
      .from('whatsapp_conversations')
      .insert({
        id: conversationId,
        user_id: null,
        phone_hash: phoneHash,
        stage,
        encrypted_data: encrypted.encrypted,
        data_iv: encrypted.iv,
        data_tag: encrypted.tag,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        message_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation state: ${error.message}`);
    }

    return state as ConversationState;
  }

  /**
   * Update conversation state
   */
  private async updateConversationState(
    stateId: string,
    stage: ConversationStage,
    data: ConversationData
  ): Promise<void> {
    const supabase = await this.getSupabase();
    const encrypted = encryptData(data);

    // Get current message count
    const { data: currentState } = await (supabase as any)
      .from('whatsapp_conversations')
      .select('message_count')
      .eq('id', stateId)
      .single();

    await (supabase as any)
      .from('whatsapp_conversations')
      .update({
        stage,
        encrypted_data: encrypted.encrypted,
        data_iv: encrypted.iv,
        data_tag: encrypted.tag,
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        message_count: ((currentState as any)?.message_count || 0) + 1,
      })
      .eq('id', stateId);
  }

  /**
   * Handle incoming WhatsApp message
   */
  async handleMessage(context: MessageContext): Promise<void> {
    try {
      // Hash phone for lookup
      const phoneHash = await hashPhone(context.phone);

      // Check rate limit
      if (!checkRateLimit(phoneHash)) {
        await sendWhatsAppMessage(
          context.phone,
          'Trop de messages. Veuillez attendre une minute.'
        );
        return;
      }

      // Get conversation state
      let state = await this.getConversationState(phoneHash);

      // Handle special commands first
      const command = this.detectCommand(context.message, state?.stage);
      if (command) {
        await this.handleCommand(command, context, phoneHash, state);
        return;
      }

      // If no state, start new conversation
      if (!state) {
        state = await this.createConversationState(phoneHash, 'need_consent');
        await this.sendConsentRequest(context.phone);
        return;
      }

      // Decrypt conversation data
      const conversationData = decryptData({
        encrypted: state.encrypted_data,
        iv: state.data_iv,
        tag: state.data_tag,
      });

      // Handle based on stage
      await this.handleStage(context, state, conversationData);

      // Log message (sanitized)
      await createAuditLog(state.user_id, 'whatsapp_message_received', {
        stage: state.stage,
        messageLength: context.message.length,
      });
    } catch (error) {
      // Never log PII in errors
      console.error('Error handling WhatsApp message:', sanitizeLog('Message handling error'));
      
      // Send generic error message
      await sendWhatsAppMessage(
        context.phone,
        'Désolé, une erreur est survenue. Veuillez réessayer plus tard.'
      );
    }
  }

  /**
   * Detect special commands
   */
  private detectCommand(message: string, stage?: ConversationStage): string | null {
    const upperMessage = message.trim().toUpperCase();
    
    // Handle confirmation commands
    if (stage === 'deletion_requested') {
      if (upperMessage.includes('CONFIRMER') || upperMessage.includes('CONFIRM')) {
        return 'confirm_delete';
      }
      if (upperMessage.includes('ANNULER') || upperMessage.includes('CANCEL')) {
        return 'cancel_delete';
      }
    }
    
    if (upperMessage.includes('SUPPRIMER') || upperMessage.includes('DELETE')) {
      return 'delete';
    }
    if (upperMessage.includes('EXPORTER') || upperMessage.includes('EXPORT')) {
      return 'export';
    }
    if (upperMessage.includes('AIDE') || upperMessage.includes('HELP')) {
      return 'help';
    }
    if (upperMessage.includes('STOP')) {
      return 'stop';
    }
    
    return null;
  }

  /**
   * Handle special commands
   */
  private async handleCommand(
    command: string,
    context: MessageContext,
    phoneHash: string,
    state: ConversationState | null
  ): Promise<void> {
    switch (command) {
      case 'delete':
        await this.handleDeleteRequest(context, phoneHash, state);
        break;
      case 'export':
        await this.handleExportRequest(context, phoneHash, state);
        break;
      case 'help':
        await this.handleHelpRequest(context);
        break;
      case 'stop':
        await this.handleStopRequest(context, phoneHash, state);
        break;
      case 'confirm_delete':
        await this.handleConfirmDelete(context, state);
        break;
      case 'cancel_delete':
        await this.handleCancelDelete(context, state);
        break;
    }
  }

  /**
   * Handle delete confirmation
   */
  private async handleConfirmDelete(
    context: MessageContext,
    state: ConversationState | null
  ): Promise<void> {
    if (!state?.user_id) {
      await sendWhatsAppMessage(
        context.phone,
        'Aucune demande de suppression trouvée.'
      );
      return;
    }

    // Extract verification code from message
    const codeMatch = context.message.match(/\b[A-F0-9]{8}\b/);
    if (!codeMatch) {
      await sendWhatsAppMessage(
        context.phone,
        'Veuillez inclure le code de vérification dans votre message.'
      );
      return;
    }

    const verificationCode = codeMatch[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fikravalley.com';

    // Get deletion request ID
    const supabase = await this.getSupabase();
    const { data: deletionRequest } = await (supabase as any)
      .from('marrai_deletion_requests')
      .select('id')
      .eq('user_id', state.user_id)
      .eq('status', 'pending')
      .single();

    if (!deletionRequest) {
      await sendWhatsAppMessage(
        context.phone,
        'Aucune demande de suppression en attente.'
      );
      return;
    }

    // Confirm deletion
    const response = await fetch(`${appUrl}/api/privacy/delete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deletionId: (deletionRequest as any).id,
        verificationCode,
        action: 'confirm',
      }),
    });

    if (response.ok) {
      await sendWhatsAppMessage(
        context.phone,
        'Suppression confirmée. Vos données seront supprimées dans les 24 heures.'
      );
      await (supabase as any)
        .from('whatsapp_conversations')
        .update({ stage: 'completed' })
        .eq('id', state.id);
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      await sendWhatsAppMessage(
        context.phone,
        `Erreur: ${error.message || 'Impossible de confirmer la suppression'}.`
      );
    }
  }

  /**
   * Handle delete cancellation
   */
  private async handleCancelDelete(
    context: MessageContext,
    state: ConversationState | null
  ): Promise<void> {
    if (!state?.user_id) {
      await sendWhatsAppMessage(
        context.phone,
        'Aucune demande de suppression trouvée.'
      );
      return;
    }

    const supabase = await this.getSupabase();
    const { data: deletionRequest } = await (supabase as any)
      .from('marrai_deletion_requests')
      .select('id')
      .eq('user_id', state.user_id)
      .eq('status', 'pending')
      .single();

    if (!deletionRequest) {
      await sendWhatsAppMessage(
        context.phone,
        'Aucune demande de suppression en attente.'
      );
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fikravalley.com';
    const response = await fetch(`${appUrl}/api/privacy/delete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deletionId: (deletionRequest as any).id,
        verificationCode: 'CANCEL', // Special code for cancellation
        action: 'cancel',
      }),
    });

    if (response.ok) {
      await sendWhatsAppMessage(
        context.phone,
        'Demande de suppression annulée. Vos données sont conservées.'
      );
      await (supabase as any)
        .from('whatsapp_conversations')
        .update({ stage: 'completed' })
        .eq('id', state.id);
    } else {
      await sendWhatsAppMessage(
        context.phone,
        'Erreur lors de l\'annulation. Veuillez réessayer.'
      );
    }
  }

  /**
   * Send consent request
   */
  private async sendConsentRequest(phone: string): Promise<void> {
    const message = `Bonjour ! Avant de continuer, nous devons obtenir votre consentement.

📋 Politique de confidentialité:
fikravalley.com/privacy

Pour continuer, répondez OUI pour accepter la collecte de données.

Vous pouvez retirer votre consentement à tout moment.`;

    await sendWhatsAppMessage(phone, message);
  }

  /**
   * Handle consent stage
   */
  private async handleConsentStage(
    context: MessageContext,
    state: ConversationState,
    data: ConversationData
  ): Promise<void> {
    const message = context.message.trim().toUpperCase();
    const consentKeywords = ['OUI', 'YES', 'نعم', 'OK', 'ACCEPT', 'ACCEPTER'];

    if (consentKeywords.some((keyword) => message.includes(keyword))) {
      // Find or create user
      let userId = state.user_id;
      if (!userId) {
        // Create user in secure storage
        userId = await this.secureStorage.createUser({
          phone: context.phone,
          name: 'WhatsApp User', // Temporary, will be updated
          consent: true,
          consentDate: new Date(),
        });

        // Update conversation state with user ID
        const supabase = await this.getSupabase();
        await (supabase as any)
          .from('whatsapp_conversations')
          .update({ user_id: userId })
          .eq('id', state.id);
      }

      // Record consent
      await this.consentManager.recordConsent({
        userId,
        phone: context.phone,
        consentType: 'submission',
        granted: true,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        consentMethod: 'whatsapp',
      });

      // Move to next stage
      await this.updateConversationState(state.id, 'collecting_name', data);
      await sendWhatsAppMessage(
        context.phone,
        'Merci ! Quel est votre prénom ? (prénom uniquement)'
      );
    } else {
      await sendWhatsAppMessage(
        context.phone,
        'Pour continuer, vous devez accepter notre politique de confidentialité. Répondez OUI pour accepter, ou consultez: fikravalley.com/privacy'
      );
    }
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  private sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .trim()
      .replace(/[<>\"'%;()&+]/g, '') // Remove HTML/script injection chars
      .substring(0, 1000); // Limit length
  }

  /**
   * Handle name collection stage
   */
  private async handleNameStage(
    context: MessageContext,
    state: ConversationState,
    data: ConversationData
  ): Promise<void> {
    // Sanitize and validate name (only letters, 2-50 chars)
    const name = this.sanitizeInput(context.message);
    if (!/^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(name)) {
      await sendWhatsAppMessage(
        context.phone,
        'Veuillez entrer un prénom valide (lettres uniquement, 2-50 caractères).'
      );
      return;
    }

    // Store encrypted name
    data.name = name;
    await this.updateConversationState(state.id, 'collecting_problem', data);

    // Update user name in secure storage if user exists
    if (state.user_id) {
      // Note: SecureUserStorage doesn't have update method, so we'd need to add it
      // For now, we'll just store in conversation data
    }

    await sendWhatsAppMessage(
      context.phone,
      `Bonjour ${name} ! Décrivez votre problème ou idée en quelques phrases.`
    );
  }

  /**
   * Handle problem collection stage
   */
  private async handleProblemStage(
    context: MessageContext,
    state: ConversationState,
    data: ConversationData
  ): Promise<void> {
    // Sanitize and validate problem description (min 20 chars)
    const problem = this.sanitizeInput(context.message);
    if (problem.length < 20) {
      await sendWhatsAppMessage(
        context.phone,
        'Veuillez fournir plus de détails (au moins 20 caractères).'
      );
      return;
    }

    // Store encrypted problem
    data.problem = problem;
    await this.updateConversationState(state.id, 'collecting_analysis_consent', data);

    await sendWhatsAppMessage(
      context.phone,
      `Merci ! Nous utiliserons l'intelligence artificielle pour analyser votre idée. Consentez-vous à l'analyse IA ? (Répondez OUI ou NON)`
    );
  }

  /**
   * Handle analysis consent stage
   */
  private async handleAnalysisConsentStage(
    context: MessageContext,
    state: ConversationState,
    data: ConversationData
  ): Promise<void> {
    const message = context.message.trim().toUpperCase();
    const consentKeywords = ['OUI', 'YES', 'نعم', 'OK', 'ACCEPT'];

    if (consentKeywords.some((keyword) => message.includes(keyword))) {
      data.hasAnalysisConsent = true;

      if (state.user_id) {
        await this.consentManager.recordConsent({
          userId: state.user_id,
          phone: context.phone,
          consentType: 'analysis',
          granted: true,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          consentMethod: 'whatsapp',
        });
      }

      await this.updateConversationState(state.id, 'collecting_retention', data);
      await sendWhatsAppMessage(
        context.phone,
        `Combien de temps souhaitez-vous conserver vos données ?
1 - 90 jours (par défaut)
2 - 180 jours
3 - Jusqu'à ce que je les supprime`
      );
    } else {
      data.hasAnalysisConsent = false;
      await this.updateConversationState(state.id, 'collecting_retention', data);
      await sendWhatsAppMessage(
        context.phone,
        'Sans analyse IA, votre idée sera stockée mais non analysée. Combien de temps souhaitez-vous conserver vos données ? (1, 2, ou 3)'
      );
    }
  }

  /**
   * Handle retention preference stage
   */
  private async handleRetentionStage(
    context: MessageContext,
    state: ConversationState,
    data: ConversationData
  ): Promise<void> {
    const choice = context.message.trim();
    let retentionDays = 90; // Default

    if (choice === '1') {
      retentionDays = 90;
    } else if (choice === '2') {
      retentionDays = 180;
    } else if (choice === '3') {
      retentionDays = 3650; // ~10 years (until deletion)
    } else {
      await sendWhatsAppMessage(
        context.phone,
        'Veuillez répondre 1, 2, ou 3.'
      );
      return;
    }

    data.retentionDays = retentionDays;

    if (state.user_id) {
      await this.secureStorage.setDataRetention(state.user_id, retentionDays);
      await this.consentManager.recordConsent({
        userId: state.user_id,
        phone: context.phone,
        consentType: 'data_retention',
        granted: true,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        consentMethod: 'whatsapp',
        metadata: { retentionDays },
      });
    }

    await this.updateConversationState(state.id, 'completed', data);

    // Save idea to database
    await this.saveIdea(state, data);

    await sendWhatsAppMessage(
      context.phone,
      `Parfait ! Votre idée a été enregistrée. Vous recevrez un lien pour compléter votre soumission.

Commandes disponibles:
- SUPPRIMER : Supprimer mes données
- EXPORTER : Exporter mes données
- AIDE : Aide et options`
    );
  }

  /**
   * Save idea to database
   */
  private async saveIdea(state: ConversationState, data: ConversationData): Promise<void> {
    if (!state.user_id || !data.problem) {
      return;
    }

    const supabase = await this.getSupabase();
    const { data: user } = await (supabase as any)
      .from('marrai_secure_users')
      .select('anonymous_email')
      .eq('id', state.user_id)
      .single();

    if (!user) {
      return;
    }

    await (supabase as any).from('marrai_ideas').insert({
      title: `Idée WhatsApp - ${data.name || 'Utilisateur'}`,
      problem_statement: data.problem,
      submitter_name: data.name,
      submitter_email: (user as any).anonymous_email,
      source: 'whatsapp',
      status: 'submitted',
    });
  }

  /**
   * Handle stage routing
   */
  private async handleStage(
    context: MessageContext,
    state: ConversationState,
    data: ConversationData
  ): Promise<void> {
    switch (state.stage) {
      case 'need_consent':
        await this.handleConsentStage(context, state, data);
        break;
      case 'collecting_name':
        await this.handleNameStage(context, state, data);
        break;
      case 'collecting_problem':
        await this.handleProblemStage(context, state, data);
        break;
      case 'collecting_analysis_consent':
        await this.handleAnalysisConsentStage(context, state, data);
        break;
      case 'collecting_retention':
        await this.handleRetentionStage(context, state, data);
        break;
      case 'completed':
        await sendWhatsAppMessage(
          context.phone,
          'Votre soumission est complète. Utilisez les commandes SUPPRIMER, EXPORTER, ou AIDE si besoin.'
        );
        break;
      default:
        await sendWhatsAppMessage(
          context.phone,
          'Commande non reconnue. Tapez AIDE pour voir les options disponibles.'
        );
    }
  }

  /**
   * Handle delete request
   */
  private async handleDeleteRequest(
    context: MessageContext,
    phoneHash: string,
    state: ConversationState | null
  ): Promise<void> {
    if (!state?.user_id) {
      await sendWhatsAppMessage(
        context.phone,
        'Aucun compte trouvé. Visitez fikravalley.com/privacy pour plus d\'informations.'
      );
      return;
    }

    // Update conversation stage
    const supabase = await this.getSupabase();
    await (supabase as any)
      .from('whatsapp_conversations')
      .update({ stage: 'deletion_requested' })
      .eq('id', state.id);

    // Initiate deletion request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fikravalley.com';
    const response = await fetch(`${appUrl}/api/privacy/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user_id,
        phone: context.phone,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      await sendWhatsAppMessage(
        context.phone,
        `Demande de suppression créée. Code de vérification: ${data.verificationCode}\n\nRépondez CONFIRMER ${data.verificationCode} pour confirmer, ou ANNULER pour annuler.`
      );
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      await sendWhatsAppMessage(
        context.phone,
        `Erreur: ${error.message || 'Impossible de créer la demande de suppression'}. Veuillez réessayer plus tard.`
      );
    }
  }

  /**
   * Handle export request
   */
  private async handleExportRequest(
    context: MessageContext,
    phoneHash: string,
    state: ConversationState | null
  ): Promise<void> {
    if (!state?.user_id) {
      await sendWhatsAppMessage(
        context.phone,
        'Aucun compte trouvé. Visitez fikravalley.com/privacy pour plus d\'informations.'
      );
      return;
    }

    // Update conversation stage
    const supabase = await this.getSupabase();
    await (supabase as any)
      .from('whatsapp_conversations')
      .update({ stage: 'export_requested' })
      .eq('id', state.id);

    // Request export
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fikravalley.com';
    const response = await fetch(`${appUrl}/api/privacy/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user_id,
        phone: context.phone,
        format: 'json',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      await sendWhatsAppMessage(
        context.phone,
        `Code OTP pour l'export: ${data.otp}\n\nVisitez: ${appUrl}/api/privacy/export?exportId=${data.exportId}&otp=${data.otp}\n\nCe lien expire dans 24 heures.`
      );
    } else {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      await sendWhatsAppMessage(
        context.phone,
        `Erreur: ${error.message || 'Impossible de créer l\'export'}. ${error.message?.includes('24 hours') ? 'Vous pouvez demander un export une fois par 24 heures.' : ''}`
      );
    }
  }

  /**
   * Handle help request
   */
  private async handleHelpRequest(context: MessageContext): Promise<void> {
    const message = `🔒 Options de confidentialité:

📋 Politique: fikravalley.com/privacy

Commandes:
• SUPPRIMER - Supprimer toutes mes données
• EXPORTER - Exporter mes données (GDPR)
• STOP - Arrêter les messages

Vos droits:
• Accès à vos données
• Correction des données
• Suppression des données
• Portabilité des données

Contact: contact@fikravalley.com`;

    await sendWhatsAppMessage(context.phone, message);
  }

  /**
   * Handle stop request
   */
  private async handleStopRequest(
    context: MessageContext,
    phoneHash: string,
    state: ConversationState | null
  ): Promise<void> {
    if (state?.user_id) {
      await this.consentManager.withdrawConsent(state.user_id, 'marketing');
    }

    await sendWhatsAppMessage(
      context.phone,
      'Vous ne recevrez plus de messages. Pour réactiver, contactez contact@fikravalley.com'
    );
  }
}

