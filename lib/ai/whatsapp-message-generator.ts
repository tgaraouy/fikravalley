/**
 * AI Message Generator for WhatsApp Customer Validation
 * 
 * Assembly over Addition: Pre-drafts validation messages in Darija
 * so users don't have to think about what to say.
 */

import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

export interface CustomerMessageParams {
  ideaTitle: string;
  problemStatement: string;
  customerName?: string;
  paymentLink?: string;
  amount?: number; // in DH
}

/**
 * Generate a customer validation message in Darija
 * Ready to copy-paste into WhatsApp
 */
export async function generateCustomerMessage(
  params: CustomerMessageParams
): Promise<string> {
  const { ideaTitle, problemStatement, customerName, paymentLink, amount = 10 } = params;

  const prompt = `Génère un message WhatsApp en Darija marocaine pour valider une idée d'entreprise.

CONTEXTE:
- Titre de l'idée: ${ideaTitle}
- Problème résolu: ${problemStatement.substring(0, 200)}...
- Montant de validation: ${amount} DH
- Nom du client: ${customerName || '[nom client]'}

EXIGENCES:
1. Message en Darija marocaine authentique (pas de français formel)
2. Ton amical et décontracté (comme un message WhatsApp entre amis)
3. Court (max 3-4 phrases)
4. Inclut le problème résolu de manière simple
5. Appel à l'action clair: "Tu veux l'essayer? ${amount} DH seulement"
6. ${paymentLink ? `Inclut le lien de paiement: ${paymentLink}` : 'Laisse un placeholder [payment_link]'}

FORMAT:
Salam [nom], je teste une idée: [titre]. Ça résout [problème]. Tu veux l'essayer? [montant] DH. [lien]

Génère UNIQUEMENT le message, sans explication.`;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return getFallbackMessage(params);
    }

    let message = content.text.trim();

    // Replace placeholders
    if (customerName) {
      message = message.replace(/\[nom client\]/gi, customerName);
    }
    if (paymentLink) {
      message = message.replace(/\[payment_link\]/gi, paymentLink);
    }

    return message;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating customer message:', error);
    }
    return getFallbackMessage(params);
  }
}

function getFallbackMessage(params: CustomerMessageParams): string {
  const { ideaTitle, problemStatement, customerName, paymentLink, amount = 10 } = params;
  const name = customerName || '[nom client]';
  const problem = problemStatement.substring(0, 100) + '...';
  const link = paymentLink || '[payment_link]';

  return `Salam ${name}, je teste une idée: ${ideaTitle}. 

Ça résout: ${problem}

Tu veux l'essayer? ${amount} DH seulement. ${link}`;
}

/**
 * Generate mentor outreach message (when adopter gets stuck)
 */
export async function generateMentorOutreachMessage(
  ideaTitle: string,
  blocker: string,
  mentorName?: string
): Promise<string> {
  const prompt = `Génère un message WhatsApp en Darija pour contacter un mentor.

CONTEXTE:
- Idée: ${ideaTitle}
- Blocage: ${blocker}
- Mentor: ${mentorName || '[nom mentor]'}

EXIGENCES:
1. Message en Darija, ton respectueux mais pas formel
2. Explique brièvement le blocage
3. Demande 15 minutes de leur temps
4. Mentionne que c'est dans leur domaine d'expertise

Génère UNIQUEMENT le message.`;

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 150,
      temperature: 0.6,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return getFallbackMentorMessage(ideaTitle, blocker, mentorName);
    }

    let message = content.text.trim();
    if (mentorName) {
      message = message.replace(/\[nom mentor\]/gi, mentorName);
    }

    return message;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating mentor message:', error);
    }
    return getFallbackMentorMessage(ideaTitle, blocker, mentorName);
  }
}

function getFallbackMentorMessage(
  ideaTitle: string,
  blocker: string,
  mentorName?: string
): string {
  const name = mentorName || '[nom mentor]';
  return `Salam ${name}, 

Je travaille sur: ${ideaTitle}

J'ai un blocage: ${blocker}

Est-ce que tu peux m'aider 15 minutes? C'est dans ton domaine d'expertise.

Merci!`;
}

