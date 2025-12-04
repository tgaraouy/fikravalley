/**
 * Mentor Digest System
 * 
 * Assembly over Addition: ONE weekly email with 2-3 matched adopters
 * Not a dashboard to browse - just actionable matches
 */

import { createClient } from '@/lib/supabase-server';

export interface MentorDigestItem {
  idea_id: string;
  match_id?: string; // Match ID for one-click reply
  idea_title: string;
  adopter_name: string;
  adopter_location: string;
  blocker: string;
  expertise_match: string;
  time_needed: string; // "15 minutes"
  one_click_reply: string; // "Reply 'yes' to help"
}

export interface MentorDigest {
  mentor_id: string;
  mentor_name: string;
  mentor_email: string;
  items: MentorDigestItem[];
  total_matches: number;
}

/**
 * Generate weekly mentor digest
 * ONE email with 2-3 matched adopters who need help
 */
export async function generateMentorDigest(mentorId: string): Promise<MentorDigest | null> {
  const supabase = await createClient();

  // Get mentor info
  const { data: mentor, error: mentorError } = await (supabase as any)
    .from('marrai_mentors')
    .select('id, name, email, currentrole, expertise_areas')
    .eq('id', mentorId)
    .single();

  if (mentorError || !mentor) {
    return null;
  }

  // Get active matches where adopter has a blocker
  const { data: matches, error: matchesError } = await (supabase as any)
    .from('marrai_mentor_matches')
    .select(`
      id,
      idea_id,
      match_score,
      status,
      marrai_ideas!inner(
        id,
        title,
        problem_statement,
        proposed_solution,
        submitter_name,
        location,
        moroccan_priorities
      ),
      marrai_idea_claims!left(
        id,
        blocker,
        engagement_level
      )
    `)
    .eq('mentor_id', mentorId)
    .eq('status', 'pending')
    .order('match_score', { ascending: false })
    .limit(3);

  if (matchesError || !matches || matches.length === 0) {
    return null;
  }

  // Build digest items
  const items: MentorDigestItem[] = matches.map((match: any) => {
    const idea = match.marrai_ideas;
    const claim = match.marrai_idea_claims?.[0];

    return {
      idea_id: idea.id,
      match_id: match.id, // Add match_id for one-click reply
      idea_title: idea.title,
      adopter_name: idea.submitter_name || 'Adopter',
      adopter_location: idea.location || 'Maroc',
      blocker: claim?.blocker || 'Besoin de validation',
      expertise_match: getExpertiseMatch(mentor.currentrole, idea.moroccan_priorities),
      time_needed: '15 minutes',
      one_click_reply: `Reply 'yes' to help ${idea.submitter_name || 'this adopter'}`,
    };
  });

  return {
    mentor_id: mentor.id,
    mentor_name: mentor.name,
    mentor_email: mentor.email,
    items,
    total_matches: matches.length,
  };
}

function getExpertiseMatch(
  mentorRoles: string[] | null,
  ideaPriorities: string[] | null
): string {
  if (!mentorRoles || !ideaPriorities) {
    return 'Domain match';
  }

  // Simple matching logic
  const roleMap: Record<string, string> = {
    'CEO': 'Business strategy',
    'CTO': 'Technical implementation',
    'Marketing': 'Go-to-market',
    'Finance': 'Financial planning',
    'Operations': 'Execution',
  };

  const matchedRole = mentorRoles.find((role) => roleMap[role]);
  return matchedRole ? roleMap[matchedRole] : 'Domain match';
}

/**
 * Send mentor digest email
 */
export async function sendMentorDigestEmail(digest: MentorDigest): Promise<boolean> {
  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  // For now, return true (would send email)

  const emailBody = generateEmailBody(digest);

  if (process.env.NODE_ENV === 'development') {
    console.log('=== MENTOR DIGEST EMAIL ===');
    console.log(`To: ${digest.mentor_email}`);
    console.log(`Subject: Weekly Fikra Valley Digest - ${digest.total_matches} matches`);
    console.log(emailBody);
  }

  // In production, send via email service
  // await emailService.send({
  //   to: digest.mentor_email,
  //   subject: `Weekly Fikra Valley Digest - ${digest.total_matches} matches`,
  //   html: emailBody,
  // });

  return true;
}

function generateEmailBody(digest: MentorDigest): string {
  const itemsHtml = digest.items
    .map(
      (item, index) => `
    <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid #10b981; background: #f9fafb;">
      <h3 style="margin: 0 0 8px 0; color: #111827;">${index + 1}. ${item.idea_title}</h3>
      <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
        <strong>${item.adopter_name}</strong> in ${item.adopter_location}
      </p>
      <p style="margin: 8px 0; color: #374151;">
        <strong>Blocker:</strong> ${item.blocker}
      </p>
      <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
        <strong>Your expertise:</strong> ${item.expertise_match}
      </p>
      <p style="margin: 8px 0; color: #059669; font-weight: 600;">
        ⏱️ Time needed: ${item.time_needed}
      </p>
      <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fikravalley.com'}/api/mentor/matches/one-click?match_id=${item.match_id || item.idea_id}&action=accept&email=${encodeURIComponent(digest.mentor_email)}" 
           style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ✅ Oui, je peux aider
        </a>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fikravalley.com'}/api/mentor/matches/one-click?match_id=${item.match_id || item.idea_id}&action=reject&email=${encodeURIComponent(digest.mentor_email)}" 
           style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ❌ Pas cette fois
        </a>
      </div>
      <p style="margin-top: 8px; font-size: 12px; color: #6b7280;">
        Ou <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fikravalley.com'}/matching?mode=mentor&email=${encodeURIComponent(digest.mentor_email)}" style="color: #10b981;">voir tous mes matches</a>
      </p>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #10b981; margin-bottom: 8px;">Salam ${digest.mentor_name},</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">
          Voici ${digest.total_matches} adopter${digest.total_matches > 1 ? 's' : ''} qui ont besoin de ton aide cette semaine.
        </p>
        
        ${itemsHtml}
        
        <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          Pas le temps cette semaine? Pas de problème. On te recontactera la semaine prochaine.
        </p>
        
        <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
          — L'équipe Fikra Valley
        </p>
      </body>
    </html>
  `;
}

