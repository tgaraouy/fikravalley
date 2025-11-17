/**
 * WhatsApp Consent Handler
 * 
 * Handles consent collection via WhatsApp messages
 */

import { sendWhatsAppMessage } from './whatsapp';
import { ConsentManager } from './privacy/consent';

/**
 * Send consent request via WhatsApp
 */
export async function sendWhatsAppConsentRequest(
  phone: string,
  language: 'fr' | 'ar' = 'fr'
): Promise<void> {
  const message =
    language === 'fr'
      ? `Pour continuer, consultez notre politique de confidentialité:
fikravalley.com/privacy

Tapez OUI pour accepter la collecte de données et l'analyse IA de votre idée.

Vous pouvez retirer votre consentement à tout moment.`
      : `للمتابعة، يرجى الاطلاع على سياسة الخصوصية:
fikravalley.com/privacy

اكتب نعم للموافقة على جمع البيانات وتحليل فكرتك بالذكاء الاصطناعي.

يمكنك سحب موافقتك في أي وقت.`;

  await sendWhatsAppMessage(phone, message);
}

/**
 * Process WhatsApp consent response
 */
export async function processWhatsAppConsent(
  phone: string,
  message: string,
  userId: string
): Promise<{ accepted: boolean; message: string }> {
  const normalizedMessage = message.trim().toUpperCase();

  // Check for explicit consent (OUI, YES, نعم, etc.)
  const consentKeywords = ['OUI', 'YES', 'نعم', 'OK', 'ACCEPT', 'ACCEPTER'];
  const declineKeywords = ['NON', 'NO', 'لا', 'REFUSE', 'REFUSER'];

  const hasConsent = consentKeywords.some((keyword) => normalizedMessage.includes(keyword));
  const hasDecline = declineKeywords.some((keyword) => normalizedMessage.includes(keyword));

  if (hasConsent) {
    // Record consent
    const consentManager = new ConsentManager();
    const ipAddress = undefined; // Not available in WhatsApp
    const userAgent = 'WhatsApp';

    // Record required consents
    await consentManager.recordConsent({
      userId,
      phone,
      consentType: 'submission',
      granted: true,
      ipAddress,
      userAgent,
      consentMethod: 'whatsapp',
    });

    await consentManager.recordConsent({
      userId,
      phone,
      consentType: 'analysis',
      granted: true,
      ipAddress,
      userAgent,
      consentMethod: 'whatsapp',
    });

    return {
      accepted: true,
      message:
        'Merci ! Votre consentement a été enregistré. Vous pouvez maintenant soumettre votre idée.',
    };
  } else if (hasDecline) {
    return {
      accepted: false,
      message:
        'Nous respectons votre choix. Sans consentement, nous ne pouvons pas traiter votre idée. Visitez fikravalley.com pour plus d\'informations.',
    };
  } else {
    return {
      accepted: false,
      message:
        'Pour continuer, veuillez répondre OUI pour accepter ou NON pour refuser. Consultez notre politique: fikravalley.com/privacy',
    };
  }
}

