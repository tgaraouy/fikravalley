/**
 * AGENT 6: Notification & Sharing Agent
 * 
 * ROLE: You are a Moroccan community manager. Share validated ideas with matched mentors 
 * and the public, but ONLY after human approval.
 * 
 * TRIGGER: marrai_ideas.visible = true OR featured = true
 * 
 * ACTIONS:
 * 1. Notify mentors (marrai_mentor_matches.status='pending' → 'active')
 *    - WhatsApp (primary): Use Twilio API
 *    - Email (fallback): SendGrid template
 *    - SMS (last resort): for 2G users
 *    
 *    Message format (Darija):
 *    ```
 *    مرحبا {mentor.name},
 *    فكرة جديدة ت-match مع خبرتك: {idea.title}
 *    مشكل: {idea.problem_statement}
 *    Score: {idea.matching_score}/10
 *    شوف التفاصيل: https://fikravalley.com/idea/{idea.id}
 *    ```
 * 
 * 2. Generate social share text
 *    - Twitter (if featured): Auto-post with #فكرة_فالوادي #MRE
 *    - WhatsApp Status: User can copy from dashboard
 *    - Public page: /idea/{id} uses RLS view
 * 
 * 3. Update mentor stats (via trigger)
 *    - increment marrai_mentors.ideas_matched
 *    - increment marrai_mentors.ideas_funded when match.status='completed'
 * 
 * HUMAN-IN-THE-LOOP:
 * - Admin must set visible=true before any public sharing
 * - Admin must approve mentor match (status='accepted') before contact
 * - User can opt-out of public visibility (visible=false by default)
 * 
 * SAFETY CHECKS:
 * - Never expose PII (email, phone) in public view
 * - Never send without admin approval (status guard)
 * - Rate limit: Max 1 WhatsApp message per mentor per day
 */

import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import type { Database } from '@/lib/supabase';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];
// @ts-expect-error - Table may not be in generated types yet
type MentorMatchRow = Database['public']['Tables']['marrai_mentor_matches']['Row'];
// @ts-expect-error - Table may not be in generated types yet
type MentorRow = Database['public']['Tables']['marrai_mentors']['Row'];

interface NotificationResult {
  success: boolean;
  mentorsNotified: number;
  errors: string[];
  socialShareText?: {
    twitter?: string;
    whatsappStatus?: string;
  };
}

/**
 * Rate limiting: Track last notification time per mentor
 */
const lastNotificationTime = new Map<string, Date>();

/**
 * Check if we can send notification to mentor (rate limit: 1 per day)
 */
function canNotifyMentor(mentorId: string): boolean {
  const lastTime = lastNotificationTime.get(mentorId);
  if (!lastTime) return true;

  const now = new Date();
  const hoursSinceLastNotification = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
  
  // Allow if 24 hours have passed
  return hoursSinceLastNotification >= 24;
}

/**
 * Record notification time for rate limiting
 */
function recordNotification(mentorId: string): void {
  lastNotificationTime.set(mentorId, new Date());
}

/**
 * Generate WhatsApp message in Darija for mentor notification
 */
function generateMentorWhatsAppMessage(
  mentorName: string,
  idea: { title: string; problem_statement: string; id: string; matching_score?: number }
): string {
  const score = idea.matching_score ? `${idea.matching_score}/10` : 'N/A';
  const ideaUrl = `https://fikravalley.com/idea/${idea.id}`;

  return `مرحبا ${mentorName},

فكرة جديدة ت-match مع خبرتك: ${idea.title}

مشكل: ${idea.problem_statement}

Score: ${score}

شوف التفاصيل: ${ideaUrl}`;
}

/**
 * Generate social share text for Twitter
 */
function generateTwitterShareText(idea: { title: string; problem_statement: string; id: string }): string {
  const ideaUrl = `https://fikravalley.com/idea/${idea.id}`;
  const truncatedProblem = idea.problem_statement.length > 100 
    ? idea.problem_statement.substring(0, 100) + '...'
    : idea.problem_statement;

  return `${idea.title}

${truncatedProblem}

${ideaUrl}

#فكرة_فالوادي #MRE`;
}

/**
 * Generate WhatsApp Status share text
 */
function generateWhatsAppStatusText(idea: { title: string; problem_statement: string; id: string }): string {
  const ideaUrl = `https://fikravalley.com/idea/${idea.id}`;
  
  return `💡 فكرة جديدة في Fikra Valley:

${idea.title}

${idea.problem_statement}

شوف التفاصيل: ${ideaUrl}

#فكرة_فالوادي`;
}

/**
 * Notify mentors about a new idea match
 */
async function notifyMentors(
  supabase: ReturnType<typeof createClient>,
  ideaId: string,
  idea: IdeaRow
): Promise<{ notified: number; errors: string[] }> {
  const errors: string[] = [];
  let notified = 0;

  // Get all pending mentor matches for this idea
  const { data: matches, error: matchesError } = await supabase
    .from('marrai_mentor_matches')
    .select('*, mentor:marrai_mentors(*)')
    .eq('idea_id', ideaId)
    .eq('status', 'pending');

  if (matchesError) {
    errors.push(`Failed to fetch mentor matches: ${matchesError.message}`);
    return { notified, errors };
  }

  if (!matches || matches.length === 0) {
    return { notified, errors };
  }

  // Check if idea is visible or featured (HUMAN-IN-THE-LOOP check)
  const ideaAny = idea as any;
  if (!ideaAny.visible && !idea.featured) {
    errors.push('Idea is not visible or featured. Admin approval required.');
    return { notified, errors };
  }

  // Notify each mentor
  for (const match of matches) {
    const matchAny = match as any;
    const mentor = matchAny.mentor as MentorRow;
    
    // Rate limiting check
    if (!canNotifyMentor(mentor.id)) {
      errors.push(`Rate limit: Mentor ${mentor.name} already notified today`);
      continue;
    }

    // Check if mentor has phone number
    if (!mentor.phone) {
      errors.push(`Mentor ${mentor.name} has no phone number`);
      continue;
    }

    try {
      // Generate WhatsApp message
      const message = generateMentorWhatsAppMessage(mentor.name || 'Mentor', {
        title: idea.title || 'New Idea',
        problem_statement: idea.problem_statement || '',
        id: idea.id,
        matching_score: matchAny.match_score ? Math.round(matchAny.match_score * 10) / 10 : undefined,
      });

      // Send WhatsApp message (primary method)
      const whatsappSuccess = await sendWhatsAppMessage(mentor.phone, message);

      if (whatsappSuccess) {
        // Update match status to 'active'
        const updateQuery = supabase
          .from('marrai_mentor_matches')
          // @ts-expect-error - Supabase type inference issue with .update()
          .update({ status: 'active' });
        // @ts-ignore - Supabase type inference issue with .update() chaining
        await updateQuery.eq('id', matchAny.id);

        recordNotification(mentor.id);
        notified++;
      } else {
        // WhatsApp failed, try email (fallback)
        if (mentor.email) {
          // TODO: Implement email sending via SendGrid
          console.log(`Would send email to ${mentor.email} for idea ${ideaId}`);
          // For now, just log - email implementation can be added later
          errors.push(`WhatsApp failed for ${mentor.name}, email fallback not yet implemented`);
        } else {
          errors.push(`WhatsApp failed for ${mentor.name} and no email available`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to notify mentor ${mentor.name}: ${errorMessage}`);
    }
  }

  return { notified, errors };
}

/**
 * Generate social share text for an idea
 */
function generateSocialShareText(idea: IdeaRow): {
  twitter?: string;
  whatsappStatus?: string;
} {
  const result: { twitter?: string; whatsappStatus?: string } = {};

  // Only generate if idea is featured
  if (idea.featured) {
    result.twitter = generateTwitterShareText({
      title: idea.title || 'New Idea',
      problem_statement: idea.problem_statement || '',
      id: idea.id,
    });
  }

  // Always generate WhatsApp Status text (user can copy)
  result.whatsappStatus = generateWhatsAppStatusText({
    title: idea.title || 'New Idea',
    problem_statement: idea.problem_statement || '',
    id: idea.id,
  });

  return result;
}

/**
 * Main notification agent function
 * 
 * TRIGGER: Call this when marrai_ideas.visible = true OR featured = true
 * 
 * @param ideaId - The idea ID to notify about
 * @param supabaseClient - Optional Supabase client (uses service role if not provided)
 * @returns Notification result with counts and errors
 */
export async function notifyAboutIdea(
  ideaId: string,
  supabaseClient?: ReturnType<typeof createClient>
): Promise<NotificationResult> {
  // Get Supabase client (use service role for admin operations)
  const supabase = supabaseClient || createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Fetch the idea
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return {
        success: false,
        mentorsNotified: 0,
        errors: [`Failed to fetch idea: ${ideaError?.message || 'Idea not found'}`],
      };
    }

    // HUMAN-IN-THE-LOOP: Check if idea is visible or featured
    const ideaAny = idea as any;
    if (!ideaAny.visible && !ideaAny.featured) {
      return {
        success: false,
        mentorsNotified: 0,
        errors: ['Idea is not visible or featured. Admin approval required before notification.'],
      };
    }

    // Notify mentors
    const { notified, errors } = await notifyMentors(supabase, ideaId, idea);

    // Generate social share text
    const socialShareText = generateSocialShareText(idea);

    // Note: Mentor stats are updated via database triggers (see supabase/migrations/002_add_mentors_and_full_document.sql)

    return {
      success: errors.length === 0,
      mentorsNotified: notified,
      errors,
      socialShareText,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      mentorsNotified: 0,
      errors: [`Notification agent error: ${errorMessage}`],
    };
  }
}

/**
 * Notification Agent class (for consistency with other agents)
 */
export class NotificationAgent {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseClient?: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Process notification for an idea
   */
  async processNotification(ideaId: string): Promise<NotificationResult> {
    return notifyAboutIdea(ideaId, this.supabase);
  }

  /**
   * Generate social share text only (without sending notifications)
   */
  async generateShareText(ideaId: string): Promise<{ twitter?: string; whatsappStatus?: string } | null> {
    const { data: idea, error } = await this.supabase
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    
    if (error || !idea) return null;
    return generateSocialShareText(idea);
  }
}

// Export default instance
export const notificationAgent = new NotificationAgent();
