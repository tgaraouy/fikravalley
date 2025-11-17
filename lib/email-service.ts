/**
 * Email Service for Fikra Valley
 * Handles sending emails for access requests, approvals, etc.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Supabase Edge Functions or external service
 * For now, this is a placeholder that logs the email
 * In production, integrate with:
 * - Supabase Edge Functions
 * - Resend API
 * - SendGrid
 * - AWS SES
 * - Or your preferred email service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Replace with actual email service integration
    // For now, log to console and return success
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.subject,
      // Don't log full HTML in production
    });

    // Example: Using Supabase Edge Function
    // const { data, error } = await supabase.functions.invoke('send-email', {
    //   body: options,
    // });

    // Example: Using fetch to external API
    // const response = await fetch(process.env.EMAIL_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(options),
    // });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send access request confirmation email
 */
export async function sendAccessRequestConfirmation(email: string, name: string): Promise<boolean> {
  const subject = 'Demande d\'Accès Reçue - Fikra Valley';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Fikra Valley</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>
          <p>Merci d'avoir demandé l'accès à Fikra Valley !</p>
          <p>Nous avons bien reçu votre demande et notre équipe l'examinera dans les <strong>24 heures</strong>.</p>
          
          <h3>Prochaines étapes :</h3>
          <ul>
            <li>✓ Notre équipe examine votre demande</li>
            <li>✓ Vous recevrez un email avec la décision</li>
            <li>✓ Si approuvée, vous recevrez un lien magique pour accéder à la plateforme</li>
          </ul>
          
          <p>Détails de votre demande :</p>
          <ul>
            <li><strong>Email :</strong> ${email}</li>
            <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
          </ul>
          
          <p>Des questions ? Répondez simplement à cet email.</p>
          
          <p>Cordialement,<br>L'équipe Fikra Labs</p>
        </div>
        <div class="footer">
          <p>Fikra Labs - Plateforme d'Innovation IA pour le Maroc</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send access approval email with magic link
 */
export async function sendAccessApprovalEmail(
  email: string,
  name: string,
  magicLink: string
): Promise<boolean> {
  const subject = 'Bienvenue sur Fikra Valley ! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 16px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bienvenue sur Fikra Labs !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>
          <p>Excellente nouvelle ! Votre demande d'accès a été <strong>approuvée</strong>.</p>
          
          <p>Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
          
          <div style="text-align: center;">
            <a href="${magicLink}" class="button">Activer Mon Compte</a>
          </div>
          
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #667eea;">${magicLink}</p>
          
          <div class="warning">
            <strong>⚠️ Important :</strong> Ce lien expire dans 7 jours. Si vous ne l'utilisez pas, contactez-nous.
          </div>
          
          <h3>Une fois activé, vous pourrez :</h3>
          <ul>
            <li>✓ Soumettre vos idées pour analyse IA</li>
            <li>✓ Parcourir toutes les idées soumises</li>
            <li>✓ Participer à la validation des idées d'atelier</li>
            <li>✓ Suivre vos soumissions</li>
          </ul>
          
          <p>Prêt à soumettre votre première fikra ?</p>
          
          <p>Cordialement,<br>L'équipe Fikra Labs</p>
        </div>
        <div class="footer">
          <p>Fikra Labs - Plateforme d'Innovation IA pour le Maroc</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send access rejection email
 */
export async function sendAccessRejectionEmail(
  email: string,
  name: string,
  reason?: string
): Promise<boolean> {
  const subject = 'Mise à Jour sur Votre Demande d\'Accès - Fikra Labs';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Mise à Jour sur Votre Demande</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>
          <p>Merci pour votre intérêt pour Fikra Labs.</p>
          <p>Après examen de votre demande, nous ne pouvons pas approuver l'accès à ce moment pour la raison suivante :</p>
          
          ${reason ? `<div class="reason-box"><strong>Raison :</strong> ${reason}</div>` : ''}
          
          <p>Vous êtes invité(e) à :</p>
          <ul>
            <li>✓ Réappliquer avec des informations supplémentaires</li>
            <li>✓ Vous inscrire à notre prochain atelier ouvert</li>
            <li>✓ Parcourir les idées publiques sur fikralabs.ma</li>
          </ul>
          
          <p>Des questions ? Répondez simplement à cet email.</p>
          
          <p>Cordialement,<br>L'équipe Fikra Labs</p>
        </div>
        <div class="footer">
          <p>Fikra Labs - Plateforme d'Innovation IA pour le Maroc</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

