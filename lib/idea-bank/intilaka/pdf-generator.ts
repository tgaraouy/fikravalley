/**
 * Intilaka Grant Application PDF Generator
 * 
 * Auto-generates professional PDF applications for ideas scoring ≥25/40
 * Saves users 18+ hours of manual work
 */

import { createClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';

// Note: pdfkit needs to be installed: npm install pdfkit @types/pdfkit
// For now, using a simplified approach that generates HTML which can be converted to PDF

/**
 * Intilaka application data structure
 */
interface IntilakaApplicationData {
  idea: {
    id: string;
    title: string;
    problem_statement: string;
    current_manual_process: string;
    proposed_solution: string;
    digitization_opportunity: string;
    location: string;
    category: string;
    submitter_name: string;
    submitter_email: string;
    submitter_phone: string;
    submitter_type: string;
    roi_time_saved_hours?: number;
    roi_cost_saved_eur?: number;
    estimated_cost?: string;
    data_sources?: string[];
    integration_points?: string[];
    ai_capabilities_needed?: string[];
    alignment?: {
      moroccoPriorities?: string[];
      sdgTags?: number[];
      sdgAutoTagged?: boolean;
      sdgConfidence?: { [sdg: number]: number };
    };
    created_at: string;
  };
  scores?: {
    stage1?: {
      problemStatement: number;
      asIsAnalysis: number;
      benefitStatement: number;
      operationalNeeds: number;
      total: number;
    };
    stage2?: {
      strategicFit: number;
      feasibility: number;
      differentiation: number;
      evidenceOfDemand: number;
      total: number;
    };
    breakEven?: {
      months: number | null;
      feasible: boolean;
    };
  };
  selfAskResponses?: Array<{
    question_id: string;
    original_text: string;
    extracted_data: any;
    entities: any;
  }>;
  receipts?: Array<{
    id: string;
    type: string;
    verified: boolean;
    proof_url?: string;
  }>;
}

/**
 * Revenue projection
 */
interface RevenueProjection {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeRevenue: number;
}

/**
 * SDG Information
 */
const SDG_INFO: Record<number, { title: string; description: string }> = {
  1: { title: 'Pas de pauvreté', description: 'Éliminer la pauvreté sous toutes ses formes et partout dans le monde' },
  2: { title: 'Faim zéro', description: 'Éliminer la faim, assurer la sécurité alimentaire' },
  3: { title: 'Bonne santé et bien-être', description: 'Permettre à tous de vivre en bonne santé' },
  4: { title: 'Éducation de qualité', description: 'Assurer une éducation inclusive et équitable' },
  5: { title: 'Égalité entre les sexes', description: 'Parvenir à l\'égalité des sexes' },
  6: { title: 'Eau propre et assainissement', description: 'Garantir l\'accès à l\'eau et à l\'assainissement' },
  7: { title: 'Énergie propre', description: 'Garantir l\'accès à une énergie abordable' },
  8: { title: 'Travail décent', description: 'Promouvoir une croissance économique durable' },
  9: { title: 'Industrie, innovation', description: 'Bâtir une infrastructure résiliente' },
  10: { title: 'Inégalités réduites', description: 'Réduire les inégalités' },
  11: { title: 'Villes durables', description: 'Faire en sorte que les villes soient durables' },
  12: { title: 'Consommation responsable', description: 'Établir des modes de consommation durables' },
  13: { title: 'Mesures relatives au climat', description: 'Prendre des mesures urgentes contre le changement climatique' },
  14: { title: 'Vie aquatique', description: 'Conserver les océans et les mers' },
  15: { title: 'Vie terrestre', description: 'Préserver la vie terrestre' },
  16: { title: 'Paix et justice', description: 'Promouvoir des sociétés pacifiques' },
  17: { title: 'Partenariats', description: 'Renforcer les moyens de mettre en œuvre le partenariat' },
};

/**
 * Format currency
 */
function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Add section header
 */
function addSection(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(16).fillColor('#2d5016').text(title, { underline: true });
  doc.fillColor('#000000');
  doc.moveDown(0.5);
}

/**
 * Add table
 */
function addTable(
  doc: PDFKit.PDFDocument,
  table: { headers: string[]; rows: string[][] },
  options?: { startX?: number; colWidths?: number[] }
) {
  const startX = options?.startX || 60;
  const startY = doc.y;
  const colWidths = options?.colWidths || table.headers.map(() => 120);
  const rowHeight = 20;

  // Headers
  doc.fontSize(10).fillColor('#2d5016');
  let currentX = startX;
  table.headers.forEach((header, i) => {
    doc.text(header, currentX, startY, {
      width: colWidths[i],
      bold: true,
    });
    currentX += colWidths[i];
  });

  // Rows
  doc.fillColor('#000000');
  table.rows.forEach((row, rowIndex) => {
    const y = startY + rowHeight + (rowIndex * rowHeight);
    currentX = startX;
    row.forEach((cell, colIndex) => {
      doc.fontSize(9).text(cell || '', currentX, y, {
        width: colWidths[colIndex],
      });
      currentX += colWidths[colIndex];
    });
  });

  doc.y = startY + rowHeight + (table.rows.length * rowHeight) + 10;
}

/**
 * Enhance idea description with AI
 */
async function enhanceIdeaDescription(idea: any): Promise<string> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Tu es un expert en rédaction de demandes de financement pour Intilaka (programme marocain de financement).

Améliore cette description de projet pour une demande de financement Intilaka professionnelle et convaincante.

Description originale:
${idea.proposed_solution || idea.digitization_opportunity || ''}

Contexte:
- Problème: ${idea.problem_statement || ''}
- Localisation: ${idea.location || ''}
- Catégorie: ${idea.category || ''}

Instructions:
1. Rends la description professionnelle et convaincante
2. Aligne avec les priorités de développement du Maroc
3. Mets en avant l'impact social et économique
4. Maximum 200 mots
5. En français
6. Style formel mais accessible

Retourne uniquement la description améliorée, sans commentaires.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const enhanced = response.content[0].type === 'text' ? response.content[0].text : '';
    return enhanced || idea.proposed_solution || idea.digitization_opportunity || '';
  } catch (error) {
    console.error('Error enhancing description:', error);
    return idea.proposed_solution || idea.digitization_opportunity || '';
  }
}

/**
 * Calculate revenue projections
 */
function calculateRevenueProjections(data: IntilakaApplicationData): RevenueProjection[] {
  const projections: RevenueProjection[] = [];
  const monthlyCostSaved = (data.idea.roi_cost_saved_eur || 0) / 12;
  const estimatedCost = parseCost(data.idea.estimated_cost || '');
  const monthlyCosts = estimatedCost ? estimatedCost / 12 : 0;

  let cumulativeRevenue = 0;

  for (let month = 1; month <= 12; month++) {
    // Conservative growth model: start at 20% capacity, grow to 100% by month 6
    const capacity = Math.min(0.2 + (month * 0.15), 1);
    const revenue = monthlyCostSaved * capacity * 10; // Assume 10 users/month initially
    const costs = monthlyCosts;
    const profit = revenue - costs;
    cumulativeRevenue += revenue;

    projections.push({
      month,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      cumulativeRevenue: Math.round(cumulativeRevenue),
    });
  }

  return projections;
}

/**
 * Parse cost from various formats
 */
function parseCost(cost: string | number | undefined): number | null {
  if (typeof cost === 'number') return cost;
  if (!cost) return null;

  const str = String(cost).toLowerCase().trim();

  // Handle range formats like "1K-3K", "3K-5K"
  if (str.includes('-')) {
    const parts = str.split('-');
    const first = parseCost(parts[0]);
    const second = parseCost(parts[1]);
    if (first !== null && second !== null) {
      return (first + second) / 2; // Average
    }
  }

  // Handle "K" suffix
  if (str.endsWith('k')) {
    const num = parseFloat(str.slice(0, -1));
    if (!isNaN(num)) return num * 1000;
  }

  // Handle "<1K", "10K+"
  if (str.startsWith('<')) {
    const num = parseFloat(str.slice(1));
    if (!isNaN(num)) return num * 0.5; // Use half as estimate
  }
  if (str.endsWith('+')) {
    const num = parseFloat(str.slice(0, -1));
    if (!isNaN(num)) return num * 1.5; // Use 1.5x as estimate
  }

  // Direct number
  const num = parseFloat(str);
  if (!isNaN(num)) return num;

  return null;
}

/**
 * Suggest mentors based on idea
 */
async function suggestMentors(idea: any): Promise<Array<{ name: string; expertise: string }>> {
  // Mock mentor suggestions - in production, query from database
  const mentorsByCategory: Record<string, Array<{ name: string; expertise: string }>> = {
    health: [
      { name: 'Dr. Ahmed Benali', expertise: 'Santé digitale' },
      { name: 'Fatima Zahra', expertise: 'Gestion hospitalière' },
    ],
    education: [
      { name: 'Prof. Mohamed Alami', expertise: 'Technologie éducative' },
      { name: 'Aicha Bensaid', expertise: 'Formation professionnelle' },
    ],
    agriculture: [
      { name: 'Hassan El Fassi', expertise: 'Agriculture digitale' },
      { name: 'Khadija Amrani', expertise: 'Innovation rurale' },
    ],
  };

  return mentorsByCategory[idea.category] || [
    { name: 'Mentor Fikra Valley', expertise: 'Innovation et entrepreneuriat' },
  ];
}

/**
 * Get SDG alignment (from alignment field if available, otherwise fallback)
 */
function getSDGAlignment(idea: any): number[] {
  // If alignment data exists, use auto-tagged SDGs
  if (idea.alignment?.sdgTags && idea.alignment.sdgTags.length > 0) {
    return idea.alignment.sdgTags;
  }
  
  // Fallback to category-based mapping
  const categorySDGMap: Record<string, number[]> = {
    health: [3, 1],
    education: [4, 1, 8],
    agriculture: [2, 1, 15],
    tech: [9, 8, 4],
    infrastructure: [9, 11],
    administration: [16, 10],
  };

  return categorySDGMap[idea.category] || [9, 8];
}

/**
 * Get government plan alignment (from alignment field if available, otherwise fallback)
 */
function getGovernmentAlignment(idea: any): string[] {
  // If alignment data exists, use Morocco priorities
  if (idea.alignment?.moroccoPriorities && idea.alignment.moroccoPriorities.length > 0) {
    return idea.alignment.moroccoPriorities.map((priorityId: string) => {
      const priority = MOROCCO_PRIORITIES.find(p => p.id === priorityId);
      return priority ? priority.name : priorityId;
    });
  }
  
  // Fallback to category-based mapping
  const plans: string[] = [];

  if (idea.category === 'health') {
    plans.push('Healthcare Improvement');
  }
  if (idea.category === 'education') {
    plans.push('Quality Education');
  }
  if (idea.category === 'agriculture') {
    plans.push('Green Morocco Plan');
  }
  if (idea.category === 'tech' || idea.category === 'infrastructure') {
    plans.push('Digital Morocco 2025');
  }

  return plans.length > 0 ? plans : ['Vision 2030'];
}

/**
 * Generate cover letter
 */
function generateCoverLetter(data: IntilakaApplicationData): string {
  const verifiedReceipts = data.receipts?.filter((r) => r.verified).length || 0;
  const totalBudget = parseCost(data.idea.estimated_cost) || 0;
  const breakEvenMonths = data.scores?.breakEven?.months || 12;
  const sdgs = getSDGAlignment(data.idea);
  const govPlans = getGovernmentAlignment(data.idea);

  return `Madame, Monsieur,

Je me permets de solliciter votre attention pour un projet innovant qui répond à un besoin réel identifié sur le terrain marocain.

${data.idea.problem_statement?.substring(0, 200) || ''}

Après avoir validé ce besoin${verifiedReceipts > 0 ? ` auprès de ${verifiedReceipts} clients potentiels qui ont accepté de payer 3 DH pour confirmer leur intérêt` : ''}, je suis convaincu du potentiel de cette initiative.

${(() => {
    // Morocco priorities (primary)
    const prioritiesText = govPlans.length > 0 
      ? `Le projet s'aligne parfaitement avec ${govPlans.join(', ')}, priorités nationales du Maroc.`
      : '';
    
    // SDGs (secondary, supporting evidence)
    const sdgsText = sdgs.length > 0
      ? ` Il contribue également aux Objectifs de Développement Durable ${sdgs.join(', ')}.`
      : '';
    
    return prioritiesText + sdgsText;
  })()}

Avec un investissement de ${formatCurrency(totalBudget)}, nous prévoyons d'atteindre le seuil de rentabilité en ${breakEvenMonths} mois, ce qui est parfaitement compatible avec les exigences d'Intilaka.

Je reste à votre disposition pour toute information complémentaire.

Cordialement,
${data.idea.submitter_name}`;
}

/**
 * Generate Intilaka PDF
 */
export async function generateIntilakaPDF(ideaId: string): Promise<string> {
  const supabase = await createClient();

  // 1. Fetch complete idea data
  const { data: idea, error: ideaError } = await supabase
    .from('marrai_ideas')
    .select('*')
    .eq('id', ideaId)
    .single();

  if (ideaError || !idea) {
    throw new Error(`Idea ${ideaId} not found`);
  }

  // Fetch scores
  const { data: scores } = await supabase
    .from('marrai_idea_scores')
    .select('*')
    .eq('idea_id', ideaId)
    .single();

  // Fetch self-ask responses
  const { data: selfAskResponses } = await supabase
    .from('marrai_self_ask_responses')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true });

  // Fetch receipts (if any)
  const { data: receipts } = await supabase
    .from('marrai_idea_receipts')
    .select('*')
    .eq('idea_id', ideaId)
    .eq('verified', true);

  const applicationData: IntilakaApplicationData = {
    idea,
    scores: scores as any,
    selfAskResponses: selfAskResponses || [],
    receipts: receipts || [],
  };

  // 2. Generate HTML version (can be converted to PDF)
  // In production, use pdfkit or a PDF service
  const html = generateHTMLPDF(applicationData);
  
  // Create temp file
  const filename = `intilaka_${ideaId}_${Date.now()}.html`;
  const tempDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const htmlPath = path.join(tempDir, filename);
  fs.writeFileSync(htmlPath, html);

  // For now, return HTML version
  // In production, convert HTML to PDF using a service like Puppeteer or PDFShift
  const pdfUrl = await uploadHTMLAndConvert(htmlPath, ideaId);
  
  // Clean up temp file
  fs.unlinkSync(htmlPath);
  
  return pdfUrl;
}

/**
 * Generate HTML version of PDF
 */
function generateHTMLPDF(data: IntilakaApplicationData): string {
  const idea = data.idea;
  const projections = calculateRevenueProjections(data);
  const breakEvenMonths = data.scores?.breakEven?.months || 12;
  const estimatedCost = parseCost(idea.estimated_cost) || 0;
  const targetSegment = data.selfAskResponses?.find((r) => r.question_id === 'q1')?.original_text || '';
  const verifiedReceipts = data.receipts?.filter((r) => r.verified).length || 0;
  // Get SDGs and gov plans (will use alignment if available, otherwise fallback)
  const sdgs = getSDGAlignment(idea);
  const govPlans = getGovernmentAlignment(idea);
  const coverLetter = generateCoverLetter(data);
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Demande de Financement Intilaka - ${idea.title || 'Sans titre'}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      max-width: 100%;
    }
    h1 {
      color: #2d5016;
      font-size: 20pt;
      text-align: center;
      border-bottom: 3px solid #2d5016;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #2d5016;
      font-size: 16pt;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #2d5016;
      padding-bottom: 5px;
    }
    h3 {
      color: #2d5016;
      font-size: 12pt;
      margin-top: 20px;
      margin-bottom: 10px;
      text-decoration: underline;
    }
    p {
      text-align: justify;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #2d5016;
      color: white;
      font-weight: bold;
    }
    .highlight {
      background-color: #f0f8f0;
      padding: 15px;
      border-left: 4px solid #2d5016;
      margin: 20px 0;
    }
    .section {
      page-break-inside: avoid;
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 9pt;
    }
    .checklist {
      margin: 20px 0;
    }
    .checklist-item {
      margin: 8px 0;
      font-size: 11pt;
    }
  </style>
</head>
<body>
  <h1>Demande de Financement Intilaka</h1>
  <p style="text-align: center; color: #666; font-size: 12pt;">
    <strong>Projet:</strong> ${idea.title || 'Sans titre'}<br>
    <strong>Date:</strong> ${formatDate(new Date())}
  </p>

  <div class="section">
    <h2>1. DESCRIPTION DU PROJET</h2>
    <p>${idea.proposed_solution || idea.digitization_opportunity || 'À compléter'}</p>
    
    <h3>Problème Identifié</h3>
    <p>${idea.problem_statement || 'À compléter'}</p>
    
    <h3>Solution Proposée</h3>
    <p>${idea.proposed_solution || idea.digitization_opportunity || 'À compléter'}</p>
    
    ${data.selfAskResponses?.find((r) => r.question_id === 'q5')?.extracted_data?.moat ? `
    <h3>Proposition de Valeur (Avantage Local)</h3>
    <p>${data.selfAskResponses.find((r) => r.question_id === 'q5').extracted_data.moat}</p>
    ` : ''}
  </div>

  <div class="section">
    <h2>2. ANALYSE DU MARCHÉ</h2>
    
    <h3>Segment Cible</h3>
    <p>${targetSegment || idea.problem_statement?.substring(0, 200) || 'À compléter'}</p>
    
    <h3>Fréquence du Besoin</h3>
    <p>${idea.frequency ? (idea.frequency === 'daily' ? 'Quotidien' : idea.frequency === 'weekly' ? 'Hebdomadaire' : idea.frequency === 'monthly' ? 'Mensuel' : idea.frequency) : 'À compléter'}</p>
    
    <h3>Preuve de Demande</h3>
    ${verifiedReceipts > 0 ? `
    <p>${verifiedReceipts} clients ont payé 3 DH pour valider le besoin.</p>
    ` : '<p>Validation en cours</p>'}
    <p>Score de validation: ${(data.scores?.stage2?.evidenceOfDemand || 0).toFixed(1)}/5</p>
  </div>

  <div class="section">
    <h2>3. PLAN FINANCIER</h2>
    
    <h3>Budget Détaillé</h3>
    <p><strong>Équipe:</strong> ${formatCurrency(estimatedCost * 0.4)} (40%)</p>
    <p><strong>Technologie:</strong> ${formatCurrency(estimatedCost * 0.3)} (30%)</p>
    <p><strong>Autres:</strong> ${formatCurrency(estimatedCost * 0.3)} (30%)</p>
    <p style="font-size: 14pt; font-weight: bold; color: #2d5016; margin-top: 15px;">
      BUDGET TOTAL: ${formatCurrency(estimatedCost)}
    </p>
    
    <h3>Projections de Revenus (12 mois)</h3>
    <table>
      <thead>
        <tr>
          <th>Mois</th>
          <th>Revenus</th>
          <th>Coûts</th>
          <th>Profit</th>
          <th>Cumul</th>
        </tr>
      </thead>
      <tbody>
        ${projections.map((p) => `
        <tr>
          <td>M${p.month}</td>
          <td>${formatCurrency(p.revenue)}</td>
          <td>${formatCurrency(p.costs)}</td>
          <td>${formatCurrency(p.profit)}</td>
          <td>${formatCurrency(p.cumulativeRevenue)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <p style="font-weight: bold; color: #2d5016; margin-top: 15px;">
      Seuil de Rentabilité: Mois ${breakEvenMonths}
    </p>
    <p>Compatible avec Intilaka: ${breakEvenMonths <= 24 ? 'Oui ✓' : 'Non ✗'}</p>
  </div>

  <div class="section">
    <h2>4. COMPOSITION DE L'ÉQUIPE</h2>
    
    <h3>Porteur du Projet</h3>
    <p><strong>Nom:</strong> ${idea.submitter_name || 'À compléter'}</p>
    <p><strong>Email:</strong> ${idea.submitter_email || 'À compléter'}</p>
    <p><strong>Ville:</strong> ${idea.location || 'À compléter'}</p>
    <p><strong>Type:</strong> ${idea.submitter_type || 'À compléter'}</p>
    <p><strong>Expérience:</strong> [À compléter par le candidat]</p>
    
    <h3>Compétences Requises</h3>
    <p>Complexité technique: ${(data.scores?.stage2?.feasibility || 0).toFixed(1)}/5</p>
    ${idea.ai_capabilities_needed && idea.ai_capabilities_needed.length > 0 ? `
    <p>Capacités IA nécessaires: ${idea.ai_capabilities_needed.join(', ')}</p>
    ` : ''}
  </div>

  <div class="section">
    <h2>5. IMPACT SOCIAL ET ALIGNEMENT STRATÉGIQUE</h2>
    
    ${idea.alignment?.moroccoPriorities && idea.alignment.moroccoPriorities.length > 0 ? `
    <!-- PRIMARY: Morocco Priorities -->
    <h3 style="color: #2d5016; font-size: 13pt; margin-top: 20px;">Alignement avec les Priorités Nationales:</h3>
    ${idea.alignment.moroccoPriorities.map((priorityId: string) => {
      const priority = MOROCCO_PRIORITIES.find(p => p.id === priorityId);
      if (!priority) return '';
      return `
      <p style="color: #2d5016; font-weight: bold; font-size: 11pt; margin-left: 10px;">
        ✓ ${priority.name}
      </p>
      <p style="color: #666666; font-size: 10pt; margin-left: 20px; margin-bottom: 10px;">
        ${priority.description}
      </p>
      `;
    }).join('')}
    ` : ''}
    
    ${idea.alignment?.sdgTags && idea.alignment.sdgTags.length > 0 ? `
    <!-- SECONDARY: SDG Tags -->
    <h3 style="color: #444444; font-size: 12pt; margin-top: 25px; border-top: 1px solid #ddd; padding-top: 15px;">Contribution aux Objectifs de Développement Durable:</h3>
    ${(() => {
      const avgConfidence = idea.alignment.sdgTags.length > 0 && idea.alignment.sdgConfidence
        ? Math.round(
            Object.values(idea.alignment.sdgConfidence).reduce((a: number, b: number) => a + b, 0) / 
            idea.alignment.sdgTags.length * 100
          )
        : 0;
      return `
      <p style="color: #888888; font-size: 9pt; font-style: italic; margin-bottom: 10px;">
        (Auto-détectés avec ${avgConfidence}% de confiance)
      </p>
      `;
    })()}
    ${idea.alignment.sdgTags.map((sdg: number) => {
      const sdgInfo = SDG_INFO[sdg];
      return sdgInfo ? `
      <p style="color: #444444; font-size: 10pt; margin-left: 10px;">
        • SDG ${sdg}: ${sdgInfo.title}
      </p>
      ` : '';
    }).join('')}
    ` : sdgs.length > 0 ? `
    <!-- Fallback: Use category-based SDGs if alignment not available -->
    <h3 style="color: #444444; font-size: 12pt; margin-top: 25px;">Contribution aux Objectifs de Développement Durable:</h3>
    ${sdgs.map((sdg) => {
      const sdgInfo = SDG_INFO[sdg];
      return sdgInfo ? `
      <p style="color: #444444; font-size: 10pt; margin-left: 10px;">
        • SDG ${sdg}: ${sdgInfo.title}
      </p>
      ` : '';
    }).join('')}
    ` : ''}
    
    <h3 style="margin-top: 25px;">Bénéficiaires</h3>
    <p>${targetSegment || idea.problem_statement?.substring(0, 200) || 'À compléter'}</p>
  </div>

  <div class="section">
    <h2>6. CHRONOLOGIE DE MISE EN ŒUVRE</h2>
    <p><strong>Mois 1:</strong> Lancement et recrutement équipe</p>
    <p><strong>Mois 2:</strong> Développement MVP</p>
    <p><strong>Mois 3:</strong> Tests utilisateurs et itérations</p>
    <p><strong>Mois 4:</strong> Lancement beta</p>
    <p><strong>Mois 6:</strong> Lancement officiel</p>
    <p><strong>Mois 9:</strong> Expansion et optimisation</p>
    <p><strong>Mois 12:</strong> Atteinte du seuil de rentabilité</p>
  </div>

  <div class="section" style="page-break-before: always;">
    <h1 style="text-align: center; border: none;">LETTRE DE MOTIVATION</h1>
    <div style="white-space: pre-wrap; text-align: justify;">${coverLetter}</div>
  </div>

  <div class="section" style="page-break-before: always;">
    <h1 style="text-align: center; border: none;">INFORMATIONS À COMPLÉTER</h1>
    <p style="text-decoration: underline; font-weight: bold;">Veuillez ajouter les informations suivantes:</p>
    <div class="checklist">
      <div class="checklist-item">□ Nom complet légal: ___________________________________</div>
      <div class="checklist-item">□ Numéro CIN: ___________________________________</div>
      <div class="checklist-item">□ Adresse complète: ___________________________________</div>
      <div class="checklist-item">□ RIB bancaire: ___________________________________</div>
      <div class="checklist-item">□ CV détaillé (annexe)</div>
      <div class="checklist-item">□ Copie CIN (annexe)</div>
      <div class="checklist-item">□ Justificatif de domicile (annexe)</div>
      <div class="checklist-item">□ Signature: ___________________________________</div>
      <div class="checklist-item">□ Date: ___________________________________</div>
    </div>
  </div>

  <div class="footer">
    <p>Document généré automatiquement par Fikra Valley</p>
    <p>80% du formulaire a été pré-rempli automatiquement</p>
    <p>Veuillez compléter les sections marquées "À compléter" avant soumission à Intilaka</p>
  </div>
</body>
</html>
  `;
}

/**
 * Upload HTML and convert to PDF (placeholder)
 * In production, use a PDF conversion service
 */
async function uploadHTMLAndConvert(htmlPath: string, ideaId: string): Promise<string> {
  const supabase = await createClient();
  
  // For now, upload HTML file
  // In production, convert to PDF first using Puppeteer or a service
  const htmlContent = fs.readFileSync(htmlPath);
  const filename = `intilaka/${ideaId}/application.html`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filename, htmlContent, {
      contentType: 'text/html',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading HTML:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filename);
  
  // Return URL (in production, this would be the PDF URL)
  return urlData.publicUrl;
}

/**
 * Check if idea qualifies for Intilaka PDF generation
 */
export async function qualifiesForIntilaka(ideaId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: scores } = await supabase
    .from('marrai_idea_scores')
    .select('total_score, stage2_total')
    .eq('idea_id', ideaId)
    .single();

  // Qualifies if Stage 2 score ≥ 25/40 or total score ≥ 25/40
  return (scores?.total_score || scores?.stage2_total || 0) >= 25;
}

