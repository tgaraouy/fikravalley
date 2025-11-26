/**
 * AGENT 1: Conversation Extractor & Validator
 * 
 * ROLE: You are a Moroccan entrepreneur's AI assistant. Extract structured data from 
 * messy, conversational speech (WhatsApp voice notes, workshop transcripts) and create 
 * an interactive validation loop.
 * 
 * INPUT: 
 * - speaker_quote (raw text from voice transcription)
 * - speaker_email/phone (for follow-up)
 * - session_id (if from workshop)
 * 
 * OUTPUT: Populate marrai_conversation_ideas with:
 * - problem_title (max 5 words, in speaker's language)
 * - problem_statement (1 sentence, in speaker's language)
 * - proposed_solution (1 sentence, in speaker's language)
 * - category (MUST be one of: health, education, agriculture, tech, infrastructure, finance, logistics, customer_service, inclusion, other)
 * - location (if mentioned: casablanca, rabat, marrakech, kenitra, tangier, agadir, fes, meknes, oujda, other)
 * - confidence_score (0.00-1.00)
 * - needs_clarification (boolean)
 * - validation_question (if needs_clarification, ask in Darija/Tamazight/English/French)
 * 
 * HUMAN-IN-THE-LOOP RULES:
 * 1. If confidence_score < 0.85 OR needs_clarification=true:
 *    - Set status='speaker_contacted'
 *    - Send validation_question via WhatsApp to speaker_phone
 *    - WAIT for reply before promoting
 * 2. If confidence_score >= 0.85 AND needs_clarification=false:
 *    - Auto-promote to marrai_ideas table
 *    - Set promoted_to_idea_id
 *    - Set status='promoted_to_idea'
 * 
 * VALIDATION QUESTION FORMAT (Darija):
 * "شنو كتعني ب '{unclear_term}'؟" (What do you mean by 'X'?)
 * 
 * EXAMPLE EXTRACTION:
 * Speaker: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط"
 * → {
 *   problem_title: "توصيل المدارس",
 *   problem_statement: "الأهل كيعانيو من توصيل ولادهم للمدارس بالرباط",
 *   proposed_solution: "تطبيق للتوصيل آمن",
 *   category: "logistics",
 *   location: "rabat",
 *   confidence_score: 0.92,
 *   needs_clarification: false
 * }
 * 
 * LANGUAGE: Preserve original language. If Tamazight, use Latin script for schema fields.
 * 
 * Following .cursorrules specifications
 */

import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import type { Database } from '@/lib/supabase';

type ConversationIdeaInsert = Database['public']['Tables']['marrai_conversation_ideas']['Insert'];
type ConversationIdeaRow = Database['public']['Tables']['marrai_conversation_ideas']['Row'];
type IdeaInsert = Database['public']['Tables']['marrai_ideas']['Insert'];

export interface ExtractionInput {
  speaker_quote: string; // Raw text from voice transcription
  speaker_email?: string | null;
  speaker_phone?: string | null;
  session_id?: string | null;
  speaker_context?: string | null;
}

export interface ExtractedIdeaData {
  problem_title: string; // Max 5 words, in speaker's language
  problem_statement: string; // 1 sentence, in speaker's language
  proposed_solution?: string | null; // 1 sentence, in speaker's language
  category: 'health' | 'education' | 'agriculture' | 'tech' | 'infrastructure' | 'administration' | 'logistics' | 'finance' | 'customer_service' | 'inclusion' | 'other';
  location?: 'casablanca' | 'rabat' | 'marrakech' | 'kenitra' | 'tangier' | 'agadir' | 'fes' | 'meknes' | 'oujda' | 'other' | null;
  confidence_score: number; // 0.00-1.00
  needs_clarification: boolean;
  validation_question?: string | null; // In Darija/Tamazight if needs_clarification
  extraction_reasoning?: string;
}

/**
 * Clean JSON response by removing markdown code blocks
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
  cleaned = cleaned.trim();
  return cleaned;
}

/**
 * Detect language from text (Darija, Tamazight, French, English)
 */
function detectLanguage(text: string): 'darija' | 'tamazight' | 'fr' | 'en' {
  const lowerText = text.toLowerCase();
  
  // Check for Arabic script (Darija)
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'darija';
  }
  
  // Check for Tamazight indicators (Latin script with specific patterns)
  if (lowerText.includes('adggar') || lowerText.includes('ssawal') || lowerText.includes('amaynu')) {
    return 'tamazight';
  }
  
  // Check for English (common English words/patterns)
  const englishPatterns = /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|as|is|are|was|were|be|been|have|has|had|do|does|did|will|would|should|could|can|may|might|this|that|these|those|they|them|their|there|then|than|more|most|very|much|many|some|any|all|each|every|other|another|first|last|new|old|good|bad|big|small|long|short|high|low|right|left|up|down|out|off|over|under|again|further|then|once|here|where|when|why|how|what|which|who|whom|whose|whether|while|until|unless|because|although|though|however|therefore|thus|hence|moreover|furthermore|nevertheless|nonetheless|meanwhile|otherwise|instead|besides|indeed|certainly|probably|possibly|perhaps|maybe|actually|really|quite|rather|pretty|very|too|so|such|enough|also|just|only|even|still|yet|already|always|never|often|sometimes|usually|generally|specifically|particularly|especially|mainly|mostly|partially|completely|entirely|totally|absolutely|definitely|probably|possibly|perhaps|maybe|likely|unlikely|certainly|surely|obviously|clearly|apparently|evidently|presumably|supposedly|allegedly|reportedly|supposedly|apparently|evidently|presumably|supposedly|allegedly|reportedly)\b/i;
  if (englishPatterns.test(text)) {
    return 'en';
  }
  
  // Default to French
  return 'fr';
}

/**
 * Generate validation question in Darija
 */
function generateValidationQuestionDarija(unclearTerm: string, problemTitle: string): string {
  return `شنو كتعني ب '${unclearTerm}'؟ واش هاد '${problemTitle}' هو فكرة بغيتي نوليها مشروع؟`;
}

/**
 * Generate validation question in Tamazight (Latin)
 */
function generateValidationQuestionTamazight(unclearTerm: string, problemTitle: string): string {
  return `Mani tennamid s '${unclearTerm}'? Ism had '${problemTitle}' d adggar bghiti ad nerr aferyigh?`;
}

/**
 * Generate validation question in French
 */
function generateValidationQuestionFrench(unclearTerm: string, problemTitle: string): string {
  return `Que veux-tu dire par '${unclearTerm}' ? Est-ce que '${problemTitle}' est une idée que tu veux transformer en projet ?`;
}

/**
 * Generate validation question in English
 */
function generateValidationQuestionEnglish(unclearTerm: string, problemTitle: string): string {
  return `What do you mean by '${unclearTerm}'? Is '${problemTitle}' an idea you want to turn into a project?`;
}

/**
 * Generate validation question based on language
 */
function generateValidationQuestion(
  unclearTerm: string,
  problemTitle: string,
  language: 'darija' | 'tamazight' | 'fr' | 'en'
): string {
  switch (language) {
    case 'darija':
      return generateValidationQuestionDarija(unclearTerm, problemTitle);
    case 'tamazight':
      return generateValidationQuestionTamazight(unclearTerm, problemTitle);
    case 'fr':
      return generateValidationQuestionFrench(unclearTerm, problemTitle);
    case 'en':
      return generateValidationQuestionEnglish(unclearTerm, problemTitle);
  }
}

export class ConversationExtractorAgent {
  /**
   * Get Supabase client with service role (bypasses RLS)
   */
  private getSupabase() {
    // Use service role key to bypass RLS for API operations
    // Check both possible env var names
    const serviceRoleKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    
    const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
    
    if (!hasServiceRole) {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set! Using anon key - RLS may block inserts.');
      console.warn('   Set SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS');
    }
    
    return createClient<Database>(
      supabaseUrl,
      serviceRoleKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  /**
   * Extract structured idea data from conversational speech
   */
  async extractIdea(input: ExtractionInput): Promise<ExtractedIdeaData | null> {
    const language = detectLanguage(input.speaker_quote);
    
    // Log input for debugging
    console.log('Extracting idea from input:', {
      quoteLength: input.speaker_quote.length,
      language,
      hasPhone: !!input.speaker_phone,
      hasEmail: !!input.speaker_email,
    });
    
    // Build prompt for Claude API
    const prompt = `Tu es un assistant IA pour entrepreneurs marocains. Extrais des données structurées à partir d'un message vocal conversationnel.

MESSAGE VOCAL:
"${input.speaker_quote}"

INSTRUCTIONS:
1. Identifie si ce message contient une idée de problème ou d'opportunité de numérisation
2. Si oui, extrais:
   - problem_title: Titre concis (MAX 5 mots) dans la langue originale du locuteur (Darija/Tamazight/Français/English)
   - problem_statement: Description en 1 phrase dans la langue originale
   - proposed_solution: Solution proposée en 1 phrase si mentionnée (sinon null), dans la langue originale
   - category: UNIQUEMENT une de ces valeurs: health, education, agriculture, tech, infrastructure, administration, logistics, finance, customer_service, inclusion, other
   - location: Si mentionnée: casablanca, rabat, marrakech, kenitra, tangier, agadir, fes, meknes, oujda, ou 'other'. Sinon null.
   - confidence_score: Score entre 0.00 et 1.00 (0.70 minimum pour être valide)
   - needs_clarification: true si quelque chose n'est pas clair (terme ambigu, contexte manquant, etc.)
   - validation_question: Si needs_clarification=true, génère une question en Darija pour clarifier. Format: "شنو كتعني ب '{terme_ambigu}'؟" (What do you mean by 'X'?)

3. Si le message ne contient PAS d'idée claire, retourne null (littéralement la chaîne "null")
4. Si confidence_score < 0.70, retourne null (littéralement la chaîne "null")

IMPORTANT:
- Préserve la langue originale (Darija, Tamazight, Français, English)
- Pour Tamazight, utilise le script Latin pour les champs de schéma
- Sois conservateur: si tu n'es pas sûr, mets needs_clarification=true
- La validation_question doit être dans la langue du locuteur si needs_clarification=true (Darija pour Darija, English pour English, etc.)

Format JSON attendu:
{
  "problem_title": "<5 mots max, langue originale>",
  "problem_statement": "<1 phrase, langue originale>",
  "proposed_solution": "<1 phrase si mentionnée, sinon null>",
  "category": "<une des catégories valides>",
  "location": "<location si mentionnée, sinon null>",
  "confidence_score": <0.70-1.00>,
  "needs_clarification": <true/false>,
  "validation_question": "<question en Darija si needs_clarification=true, sinon null>",
  "extraction_reasoning": "<pourquoi tu penses que c'est une idée>"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire ni markdown. Si aucune idée valide, retourne null.`;

    try {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return null;
      }

      const cleanedJson = cleanJsonResponse(content.text);
      
      // Log raw response for debugging
      console.log('Claude raw response (first 200 chars):', content.text.substring(0, 200));
      console.log('Cleaned JSON (first 200 chars):', cleanedJson.substring(0, 200));
      
      // Check if Claude returned null (valid response when no idea found)
      if (cleanedJson.trim().toLowerCase() === 'null' || cleanedJson.trim() === '') {
        console.log('Claude returned null - no valid idea found in input');
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanedJson);
        console.log('Successfully parsed JSON, validating...');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Cleaned JSON (full):', cleanedJson);
        return null;
      }

      // Validate extracted data
      if (!parsed || typeof parsed !== 'object') {
        console.log('Parsed data is not an object:', parsed);
        return null;
      }

      // Validate required fields
      if (!parsed.problem_title || !parsed.problem_statement || !parsed.category) {
        console.log('Missing required fields:', {
          hasTitle: !!parsed.problem_title,
          hasStatement: !!parsed.problem_statement,
          hasCategory: !!parsed.category,
        });
        return null;
      }

      // Validate confidence score
      if (parsed.confidence_score < 0.70) {
        console.log(`Confidence score too low: ${parsed.confidence_score} (minimum: 0.70)`);
        return null;
      }

      // Validate category
      const validCategories = ['health', 'education', 'agriculture', 'tech', 'infrastructure', 'administration', 'logistics', 'finance', 'customer_service', 'inclusion', 'other'];
      if (!validCategories.includes(parsed.category)) {
        parsed.category = 'other';
      }

      // Validate location if provided
      if (parsed.location) {
        const validLocations = ['casablanca', 'rabat', 'marrakech', 'kenitra', 'tangier', 'agadir', 'fes', 'meknes', 'oujda', 'other'];
        if (!validLocations.includes(parsed.location)) {
          parsed.location = null;
        }
      }

      // Generate validation question if needed
      if (parsed.needs_clarification && !parsed.validation_question) {
        // Extract unclear term from problem_title (first word or key term)
        const unclearTerm = parsed.problem_title.split(' ')[0] || 'هذا';
        parsed.validation_question = generateValidationQuestion(
          unclearTerm,
          parsed.problem_title,
          language
        );
      }

      return {
        problem_title: parsed.problem_title.substring(0, 100), // Max 5 words enforced by prompt, but cap length
        problem_statement: parsed.problem_statement,
        proposed_solution: parsed.proposed_solution || null,
        category: parsed.category,
        location: parsed.location || null,
        confidence_score: Math.min(1.0, Math.max(0.0, parsed.confidence_score)),
        needs_clarification: parsed.needs_clarification || false,
        validation_question: parsed.validation_question || null,
        extraction_reasoning: parsed.extraction_reasoning || null,
      };
    } catch (error) {
      console.error('Error extracting idea:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      return null;
    }
  }

  /**
   * Save extracted idea to marrai_conversation_ideas
   */
  async saveExtractedIdea(
    input: ExtractionInput,
    extracted: ExtractedIdeaData
  ): Promise<string | null> {
    try {
      // Store speaker_phone in speaker_context if not already there
      let speakerContext = input.speaker_context || '';
      if (input.speaker_phone && !speakerContext.includes('Phone:')) {
        speakerContext = speakerContext 
          ? `${speakerContext} | Phone: ${input.speaker_phone}`
          : `Phone: ${input.speaker_phone}`;
      }

      const conversationIdea: ConversationIdeaInsert = {
        session_id: input.session_id || null,
        speaker_quote: input.speaker_quote,
        speaker_context: speakerContext || null,
        speaker_email: input.speaker_email || null,
        problem_title: extracted.problem_title,
        problem_statement: extracted.problem_statement,
        proposed_solution: extracted.proposed_solution || null,
        category: extracted.category,
        digitization_opportunity: extracted.proposed_solution || null, // Use solution as opportunity
        confidence_score: extracted.confidence_score,
        extraction_reasoning: extracted.extraction_reasoning || null,
        needs_clarification: extracted.needs_clarification,
        validation_question: extracted.validation_question || null,
        // Set status based on human-in-the-loop rules from .cursorrules
        status: extracted.confidence_score >= 0.85 && !extracted.needs_clarification
          ? 'promoted_to_idea' // Auto-promote (Rule 2)
          : 'speaker_contacted', // Needs validation (Rule 1)
      };

      const supabase = this.getSupabase();
      
      // Verify we're using service role key
      const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
      if (!hasServiceRole) {
        console.warn('⚠️ WARNING: Using anon key - RLS will block inserts!');
        console.warn('   Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
      } else {
        console.log('✅ Using service role key - RLS bypassed');
      }
      
      console.log('Attempting to insert conversation idea:', {
        problem_title: conversationIdea.problem_title,
        category: conversationIdea.category,
        confidence_score: conversationIdea.confidence_score,
        usingServiceRole: hasServiceRole,
      });
      
      const { data: inserted, error } = await (supabase as any)
        .from('marrai_conversation_ideas')
        .insert(conversationIdea)
        .select('id')
        .single();

      if (error) {
        console.error('Error saving extracted idea:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // If RLS error, provide detailed help
        if (error.code === '42501') {
          const hasServiceRole = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
          if (!hasServiceRole) {
            console.error('❌ RLS error detected!');
            console.error('   Solution 1: Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
            console.error('   Solution 2: Add INSERT policy in Supabase:');
            console.error('      CREATE POLICY "Allow inserts" ON marrai_conversation_ideas FOR INSERT WITH CHECK (true);');
          } else {
            console.error('❌ RLS error even with service role key!');
            console.error('   Check that SUPABASE_SERVICE_ROLE_KEY is correct');
            console.error('   Restart dev server after adding the key');
          }
        }
        
        return null;
      }
      
      console.log('Successfully saved conversation idea:', inserted?.id);

      return inserted?.id || null;
    } catch (error) {
      console.error('Error in saveExtractedIdea:', error);
      return null;
    }
  }

  /**
   * Auto-promote high confidence ideas to marrai_ideas
   */
  async autoPromoteIdea(conversationIdeaId: string): Promise<string | null> {
    try {
      const supabase = this.getSupabase();
      // Fetch the conversation idea
      const { data: conversationIdea, error: fetchError } = await (supabase as any)
        .from('marrai_conversation_ideas')
        .select('*')
        .eq('id', conversationIdeaId)
        .single();

      if (fetchError || !conversationIdea) {
        console.error('Error fetching conversation idea:', fetchError);
        return null;
      }

        // Extract phone from speaker_context if stored there
        let submitterPhone: string | null = null;
        if (conversationIdea.speaker_context?.includes('Phone:')) {
          const phoneMatch = conversationIdea.speaker_context.match(/Phone:\s*([+\d\s]+)/);
          if (phoneMatch) {
            submitterPhone = phoneMatch[1].trim();
          }
        }

        // Create idea in main table
        const ideaData: IdeaInsert = {
          title: conversationIdea.problem_title,
          problem_statement: conversationIdea.problem_statement,
          proposed_solution: conversationIdea.proposed_solution || null,
          category: conversationIdea.category || 'other',
          location: 'other', // Location not in conversation_ideas schema, default to 'other'
          current_manual_process: conversationIdea.current_manual_process || null,
          digitization_opportunity: conversationIdea.digitization_opportunity || null,
          submitter_name: conversationIdea.speaker_context?.replace(/\s*\|\s*Phone:.*/, '') || 'Workshop Participant',
          submitter_email: conversationIdea.speaker_email || null,
          submitter_phone: submitterPhone,
          submitter_type: 'entrepreneur',
          submitted_via: 'workshop_conversation', // Workshop conversation extraction
          status: 'submitted',
        };

      const { data: insertedIdea, error: insertError } = await (supabase as any)
        .from('marrai_ideas')
        .insert(ideaData)
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating idea:', insertError);
        return null;
      }

      // Update conversation idea with promotion
      const { error: updateError } = await (supabase as any)
        .from('marrai_conversation_ideas')
        .update({
          promoted_to_idea_id: insertedIdea.id,
          promoted_at: new Date().toISOString(),
          status: 'promoted_to_idea',
        })
        .eq('id', conversationIdeaId);

      if (updateError) {
        console.error('Error updating conversation idea:', updateError);
      }

      return insertedIdea.id;
    } catch (error) {
      console.error('Error in autoPromoteIdea:', error);
      return null;
    }
  }

  /**
   * Process extraction with human-in-the-loop validation
   * 
   * HUMAN-IN-THE-LOOP RULES:
   * 1. If confidence_score < 0.85 OR needs_clarification=true:
   *    - Set status='speaker_contacted'
   *    - Send validation_question via WhatsApp to speaker_phone
   *    - WAIT for reply before promoting
   * 2. If confidence_score >= 0.85 AND needs_clarification=false:
   *    - Auto-promote to marrai_ideas table
   *    - Set promoted_to_idea_id
   *    - Set status='promoted_to_idea'
   */
  async processExtraction(input: ExtractionInput): Promise<{
    success: boolean;
    conversationIdeaId?: string;
    ideaId?: string;
    needsValidation: boolean;
    validationQuestion?: string;
  }> {
    // Extract idea
    const extracted = await this.extractIdea(input);
    
    if (!extracted) {
      return {
        success: false,
        needsValidation: false,
      };
    }

    // Save to conversation_ideas
    const conversationIdeaId = await this.saveExtractedIdea(input, extracted);
    
    if (!conversationIdeaId) {
      return {
        success: false,
        needsValidation: false,
      };
    }

    // Check if auto-promotion is possible
    const canAutoPromote = extracted.confidence_score >= 0.85 && !extracted.needs_clarification;

    if (canAutoPromote) {
      // Auto-promote to marrai_ideas
      const ideaId = await this.autoPromoteIdea(conversationIdeaId);
      
      return {
        success: true,
        conversationIdeaId,
        ideaId: ideaId || undefined,
        needsValidation: false,
      };
    } else {
      // Needs human validation - Send validation_question via WhatsApp
      if (input.speaker_phone && extracted.validation_question) {
        try {
          // Send validation question via WhatsApp
          const messageSent = await sendWhatsAppMessage(
            input.speaker_phone,
            extracted.validation_question
          );
          
          if (messageSent) {
            console.log(`Validation question sent to ${input.speaker_phone}`);
          } else {
            console.warn(`Failed to send validation question to ${input.speaker_phone}`);
          }
        } catch (whatsappError) {
          console.error('Error sending WhatsApp validation question:', whatsappError);
          // Continue even if WhatsApp fails - question is stored in DB
        }
      }
      
      return {
        success: true,
        conversationIdeaId,
        needsValidation: true,
        validationQuestion: extracted.validation_question || undefined,
      };
    }
  }
}

// Export singleton instance
export const conversationExtractorAgent = new ConversationExtractorAgent();

