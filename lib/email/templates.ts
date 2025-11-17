/**
 * Email Templates for Idea Follow-ups
 * 
 * Templates for contacting idea submitters at different stages
 */

export interface EmailTemplate {
  subject: string;
  body: string;
  subjectDarija?: string;
  bodyDarija?: string;
}

/**
 * Template for qualified ideas (score ≥25/40)
 */
export function getQualifiedIdeaEmail(idea: {
  title: string;
  submitterName: string;
  score?: number;
  qualificationTier?: string;
  intilakaPdfUrl?: string;
}): EmailTemplate {
  return {
    subject: `Votre idée "${idea.title}" a été qualifiée! 🎉`,
    body: `Bonjour ${idea.submitterName},

Félicitations! Votre idée "${idea.title}" a été analysée et qualifiée par notre système d'évaluation.

${idea.score ? `Score obtenu: ${idea.score}/40` : ''}
${idea.qualificationTier === 'exceptional' ? 'Niveau: Exceptionnel' : 'Niveau: Qualifié'}

${idea.intilakaPdfUrl ? `
📄 **Document Intilaka généré**
Nous avons généré automatiquement votre demande de financement Intilaka:
${idea.intilakaPdfUrl}

Ce document est pré-rempli à 80% avec les informations de votre idée. Vous pouvez le compléter et le soumettre directement.
` : ''}

**Prochaines étapes:**
1. Vérifiez votre idée sur: https://fikravalley.com/ideas/${idea.title}
2. ${idea.intilakaPdfUrl ? 'Complétez votre demande Intilaka' : 'Nous vous contacterons bientôt pour discuter des opportunités de financement'}
3. Partagez votre idée avec votre réseau

**Besoin d'aide?**
Répondez à cet email ou contactez-nous sur WhatsApp.

Cordialement,
L'équipe Fikra Valley
Morocco's Valley of Ideas
`,
    subjectDarija: `Fikrtak "${idea.title}" tqblat! 🎉`,
    bodyDarija: `Salam ${idea.submitterName},

Mabrouk! Fikrtak "${idea.title}" t7llet w tqblat b system dialna.

${idea.score ? `Score: ${idea.score}/40` : ''}
${idea.qualificationTier === 'exceptional' ? 'Niveau: Exceptionnel' : 'Niveau: Qualifié'}

${idea.intilakaPdfUrl ? `
📄 **Document Intilaka jay**
Khlaqna lk automatically demande dial Intilaka:
${idea.intilakaPdfUrl}

Had document m3ammar b 80% b info dial fikrtak. T9dr tkmlo w tbd3oh direct.
` : ''}

**L-marhla jaya:**
1. Chof fikrtak f: https://fikravalley.com/ideas/${idea.title}
2. ${idea.intilakaPdfUrl ? 'Kml demande dial Intilaka' : 'Ghadi nwassluk bchra bach ntkllmo 3la l-funding'}
3. B3t fikrtak m3a network dialk

**7taj mo3awana?**
Rj3 lna 3la had email wla WhatsApp.

Bslama,
Team Fikra Valley
Morocco's Valley of Ideas
`
  };
}

/**
 * Template for exceptional ideas (score ≥32/40)
 */
export function getExceptionalIdeaEmail(idea: {
  title: string;
  submitterName: string;
  score: number;
  intilakaPdfUrl?: string;
}): EmailTemplate {
  return {
    subject: `🚀 Votre idée exceptionnelle "${idea.title}" - Action immédiate requise`,
    body: `Bonjour ${idea.submitterName},

**Excellente nouvelle!** Votre idée "${idea.title}" a obtenu un score exceptionnel de ${idea.score}/40.

Votre idée fait partie des **top 5%** des soumissions et présente un potentiel remarquable pour:
- Financement Intilaka (probabilité élevée)
- Matching avec des mentors experts
- Opportunités de financement européen
- Support technique et business

${idea.intilakaPdfUrl ? `
📄 **Votre demande Intilaka est prête:**
${idea.intilakaPdfUrl}
` : ''}

**Action requise:**
Nous aimerions vous rencontrer (en ligne ou en personne) pour discuter des prochaines étapes. Répondez à cet email pour planifier un rendez-vous.

**Disponibilité:**
- Cette semaine: [Répondez avec vos disponibilités]
- WhatsApp: [Votre numéro WhatsApp si disponible]

Cordialement,
L'équipe Fikra Valley
`,
    subjectDarija: `🚀 Fikrtak l-exceptionnelle "${idea.title}" - Action dialya`,
    bodyDarija: `Salam ${idea.submitterName},

**Khabar mezyan!** Fikrtak "${idea.title}" khdha score exceptionnel: ${idea.score}/40.

Fikrtak f top 5% dial submissions w 3andha potentiel kbir bach:
- Funding Intilaka (probability 3aliya)
- Matching m3a mentors experts
- Opportunities dial funding européen
- Support technique w business

${idea.intilakaPdfUrl ? `
📄 **Demande Intilaka dialk jaya:**
${idea.intilakaPdfUrl}
` : ''}

**Action khassa:**
Bghina n9blok (online wla in person) bach ntkllmo 3la l-marhla jaya. Rj3 lna 3la had email bach nprogrammo rendez-vous.

**Disponibilité:**
- Had l-usbu3: [Rj3 lna b disponibilité dialk]
- WhatsApp: [Numéro dialk ila kayn]

Bslama,
Team Fikra Valley
`
  };
}

/**
 * Template for ideas needing clarification
 */
export function getClarificationNeededEmail(idea: {
  title: string;
  submitterName: string;
  clarityScore?: number;
  feedbackUrl?: string;
}): EmailTemplate {
  return {
    subject: `Votre idée "${idea.title}" nécessite quelques précisions`,
    body: `Bonjour ${idea.submitterName},

Votre idée "${idea.title}" a été analysée. Pour améliorer sa qualité et augmenter ses chances de financement, nous avons besoin de quelques précisions.

${idea.clarityScore ? `Score de clarté actuel: ${idea.clarityScore}/10` : ''}

**Comment améliorer:**
${idea.feedbackUrl ? `Consultez les recommandations détaillées: ${idea.feedbackUrl}` : 'Nous vous contacterons bientôt avec des questions spécifiques'}

**Prochaines étapes:**
1. Répondez à cet email avec vos clarifications
2. Ou contactez-nous sur WhatsApp pour discuter
3. Nous vous aiderons à améliorer votre idée

**Temps estimé:** 15-30 minutes

Cordialement,
L'équipe Fikra Valley
`,
    subjectDarija: `Fikrtak "${idea.title}" 7taj tawdi7`,
    bodyDarija: `Salam ${idea.submitterName},

Fikrtak "${idea.title}" t7llet. Bach nzido quality w nzido chances dial funding, 7tajna shi tawdi7at.

${idea.clarityScore ? `Score dial clarté: ${idea.clarityScore}/10` : ''}

**Kifach nzido:**
${idea.feedbackUrl ? `Chof recommendations: ${idea.feedbackUrl}` : 'Ghadi nwassluk bchra b questions spécifiques'}

**L-marhla jaya:**
1. Rj3 lna 3la had email b tawdi7at dialk
2. Wla wasslna 3la WhatsApp bach ntkllmo
3. Ghadi n3awnok bach tzid fikrtak

**Temps estimé:** 15-30 minutes

Bslama,
Team Fikra Valley
`
  };
}

/**
 * Template for receipt verification follow-up
 */
export function getReceiptVerificationEmail(idea: {
  title: string;
  submitterName: string;
  receiptCount: number;
}): EmailTemplate {
  return {
    subject: `Vérification des reçus pour "${idea.title}"`,
    body: `Bonjour ${idea.submitterName},

Nous avons reçu ${idea.receiptCount} reçu(s) pour votre idée "${idea.title}".

**Statut de vérification:**
Notre équipe est en train de vérifier vos reçus. Cela prend généralement 1-2 jours ouvrables.

**Une fois vérifiés:**
- Votre score "Preuve de demande" augmentera
- Votre idée sera plus visible dans la banque d'idées
- Vous recevrez une notification

**Questions?**
Répondez à cet email ou contactez-nous sur WhatsApp.

Cordialement,
L'équipe Fikra Valley
`,
    subjectDarija: `Vérification dial reçus l "${idea.title}"`,
    bodyDarija: `Salam ${idea.submitterName},

Jibna ${idea.receiptCount} reçu(s) l fikrtak "${idea.title}".

**Statut dial vérification:**
Team dialna kay7awlo yvérifiw reçus dialk. Hadchi khdah généralement 1-2 jours.

**Melli yt7asbo:**
- Score dialk "Preuve de demande" ghadi yzid
- Fikrtak ghadi tban bzaf f idea bank
- Ghadi tjib notification

**Questions?**
Rj3 lna 3la had email wla WhatsApp.

Bslama,
Team Fikra Valley
`
  };
}

/**
 * Generic follow-up template
 */
export function getGenericFollowUpEmail(idea: {
  title: string;
  submitterName: string;
  message: string;
}): EmailTemplate {
  return {
    subject: `Suivi de votre idée "${idea.title}"`,
    body: `Bonjour ${idea.submitterName},

${idea.message}

**Votre idée:**
${idea.title}
Voir sur: https://fikravalley.com/ideas/${idea.title}

**Contact:**
Email: contact@fikravalley.com
WhatsApp: [Votre numéro WhatsApp]

Cordialement,
L'équipe Fikra Valley
`,
    subjectDarija: `Follow-up l fikrtak "${idea.title}"`,
    bodyDarija: `Salam ${idea.submitterName},

${idea.message}

**Fikrtak:**
${idea.title}
Chofha f: https://fikravalley.com/ideas/${idea.title}

**Contact:**
Email: contact@fikravalley.com
WhatsApp: [Numéro WhatsApp]

Bslama,
Team Fikra Valley
`
  };
}

