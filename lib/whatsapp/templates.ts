/**
 * WhatsApp Templates for Idea Follow-ups
 * 
 * Short, conversational templates for WhatsApp communication
 */

export interface WhatsAppTemplate {
  message: string;
  messageDarija?: string;
}

/**
 * Template for qualified ideas
 */
export function getQualifiedIdeaWhatsApp(idea: {
  title: string;
  score?: number;
  intilakaPdfUrl?: string;
}): WhatsAppTemplate {
  return {
    message: `🎉 Bonne nouvelle! Votre idée "${idea.title}" a été qualifiée!

${idea.score ? `Score: ${idea.score}/40` : ''}

${idea.intilakaPdfUrl ? `📄 Votre demande Intilaka est prête:
${idea.intilakaPdfUrl}` : 'Nous vous contacterons bientôt pour discuter des opportunités de financement.'}

Voir votre idée: https://fikravalley.com/ideas/${idea.title}

Questions? Répondez à ce message.`,
    messageDarija: `🎉 Khabar mezyan! Fikrtak "${idea.title}" tqblat!

${idea.score ? `Score: ${idea.score}/40` : ''}

${idea.intilakaPdfUrl ? `📄 Demande Intilaka dialk jaya:
${idea.intilakaPdfUrl}` : 'Ghadi nwassluk bchra bach ntkllmo 3la l-funding.'}

Chof fikrtak: https://fikravalley.com/ideas/${idea.title}

Questions? Rj3 lna 3la had message.`
  };
}

/**
 * Template for exceptional ideas
 */
export function getExceptionalIdeaWhatsApp(idea: {
  title: string;
  score: number;
}): WhatsAppTemplate {
  return {
    message: `🚀 EXCELLENT! Votre idée "${idea.title}" a obtenu ${idea.score}/40!

Votre idée fait partie des TOP 5%! 🏆

Nous aimerions vous rencontrer pour discuter des opportunités de financement.

Quand seriez-vous disponible cette semaine?

Répondez avec vos disponibilités.`,
    messageDarija: `🚀 EXCELLENT! Fikrtak "${idea.title}" khdha ${idea.score}/40!

Fikrtak f TOP 5%! 🏆

Bghina n9blok bach ntkllmo 3la l-funding opportunities.

Ash ghadi tkoun disponible had l-usbu3?

Rj3 lna b disponibilité dialk.`
  };
}

/**
 * Template for clarification needed
 */
export function getClarificationNeededWhatsApp(idea: {
  title: string;
}): WhatsAppTemplate {
  return {
    message: `Bonjour! Votre idée "${idea.title}" nécessite quelques précisions pour améliorer sa qualité.

Pouvez-vous répondre à 2-3 questions rapides? (15 min)

Tapez OUI pour continuer.`,
    messageDarija: `Salam! Fikrtak "${idea.title}" 7taj shi tawdi7at bach nzido quality.

T9dr trj3 lna 3la 2-3 questions khwiyin? (15 min)

Ktb OUI bach nkmlo.`
  };
}

/**
 * Template for receipt verification
 */
export function getReceiptVerificationWhatsApp(idea: {
  title: string;
  receiptCount: number;
}): WhatsAppTemplate {
  return {
    message: `✅ Nous avons reçu ${idea.receiptCount} reçu(s) pour "${idea.title}".

Vérification en cours (1-2 jours).

Vous recevrez une notification une fois vérifiés.`,
    messageDarija: `✅ Jibna ${idea.receiptCount} reçu(s) l "${idea.title}".

Vérification kayna (1-2 jours).

Ghadi tjib notification melli yt7asbo.`
  };
}

/**
 * Template for self-ask chain follow-up
 */
export function getSelfAskFollowUpWhatsApp(idea: {
  title: string;
  questionsRemaining: number;
}): WhatsAppTemplate {
  return {
    message: `Bonjour! Pour améliorer votre idée "${idea.title}", nous avons ${idea.questionsRemaining} questions rapides.

Répondez simplement en français ou darija.

Tapez OUI pour commencer.`,
    messageDarija: `Salam! Bach nzido fikrtak "${idea.title}", 3andna ${idea.questionsRemaining} questions khwiyin.

Rj3 b français wla darija.

Ktb OUI bach nbdo.`
  };
}

/**
 * Generic follow-up template
 */
export function getGenericFollowUpWhatsApp(idea: {
  title: string;
  message: string;
}): WhatsAppTemplate {
  return {
    message: `Bonjour!

${idea.message}

Votre idée: "${idea.title}"
Voir: https://fikravalley.com/ideas/${idea.title}

Questions? Répondez ici.`,
    messageDarija: `Salam!

${idea.message}

Fikrtak: "${idea.title}"
Chof: https://fikravalley.com/ideas/${idea.title}

Questions? Rj3 hna.`
  };
}

