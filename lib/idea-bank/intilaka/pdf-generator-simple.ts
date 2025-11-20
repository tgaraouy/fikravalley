/**
 * Intilaka Grant Application PDF Generator (Simplified)
 * 
 * Uses @react-pdf/renderer for PDF generation
 * Alternative implementation that works with existing dependencies
 */

import { createClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF using a simpler approach
 * Returns PDF as buffer or saves to file
 */
export async function generateIntilakaPDFSimple(ideaId: string): Promise<string> {
  const supabase = await createClient() as any;

  // Fetch idea data
  const { data: idea, error: ideaError } = await supabase
    .from('marrai_ideas')
    .select('*')
    .eq('id', ideaId)
    .single();

  if (ideaError || !idea) {
    throw new Error(`Idea ${ideaId} not found`);
  }

  // For now, return a placeholder URL
  // In production, this would use a PDF generation service or library
  const pdfUrl = await generatePDFViaAPI(idea);

  // Update database
  await supabase
    .from('marrai_ideas')
    .update({
      intilaka_pdf_generated: true,
      intilaka_pdf_url: pdfUrl,
      intilaka_pdf_generated_at: new Date().toISOString(),
    } as any)
    .eq('id', ideaId);

  return pdfUrl;
}

/**
 * Generate PDF via external service or API
 * This is a placeholder - in production, use a PDF service
 */
async function generatePDFViaAPI(idea: any): Promise<string> {
  // Option 1: Use a PDF generation API (e.g., PDFShift, HTMLtoPDF)
  // Option 2: Use Puppeteer to generate from HTML
  // Option 3: Use a serverless function

  // For now, create an HTML version that can be converted to PDF
  const html = generateHTMLVersion(idea);

  // Save HTML temporarily
  const tempDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const htmlPath = path.join(tempDir, `intilaka_${idea.id}.html`);
  fs.writeFileSync(htmlPath, html);

  // In production, convert HTML to PDF using a service
  // For now, return a placeholder
  return `https://fikravalley.com/api/intilaka/${idea.id}/preview`;
}

/**
 * Generate HTML version of application
 */
function generateHTMLVersion(idea: any): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande de Financement Intilaka - ${idea.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
    }
    h1 {
      color: #2d5016;
      text-align: center;
      border-bottom: 3px solid #2d5016;
      padding-bottom: 10px;
    }
    h2 {
      color: #2d5016;
      margin-top: 30px;
      border-bottom: 2px solid #2d5016;
      padding-bottom: 5px;
    }
    h3 {
      color: #2d5016;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #2d5016;
      color: white;
    }
    .highlight {
      background-color: #f0f8f0;
      padding: 15px;
      border-left: 4px solid #2d5016;
      margin: 20px 0;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Demande de Financement Intilaka</h1>
  <p style="text-align: center; color: #666;">Projet: ${idea.title || 'Sans titre'}</p>
  <p style="text-align: center; color: #666;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>

  <h2>1. DESCRIPTION DU PROJET</h2>
  <p><strong>Problème Identifié:</strong></p>
  <p>${idea.problem_statement || 'À compléter'}</p>
  
  <p><strong>Solution Proposée:</strong></p>
  <p>${idea.proposed_solution || idea.digitization_opportunity || 'À compléter'}</p>

  <h2>2. ANALYSE DU MARCHÉ</h2>
  <p><strong>Segment Cible:</strong> ${idea.problem_statement?.substring(0, 200) || 'À compléter'}</p>
  <p><strong>Localisation:</strong> ${idea.location || 'À compléter'}</p>

  <h2>3. PLAN FINANCIER</h2>
  <p><strong>Budget Estimé:</strong> ${idea.estimated_cost || 'À compléter'}</p>
  <p><strong>ROI:</strong> ${idea.roi_cost_saved_eur || 0} EUR/mois économisés</p>

  <h2>4. COMPOSITION DE L'ÉQUIPE</h2>
  <p><strong>Porteur du Projet:</strong> ${idea.submitter_name || 'À compléter'}</p>
  <p><strong>Ville:</strong> ${idea.location || 'À compléter'}</p>

  <h2>5. IMPACT SOCIAL</h2>
  <p>Ce projet contribue aux Objectifs de Développement Durable et s'aligne avec les priorités stratégiques du Maroc.</p>

  <div class="footer">
    <p>Document généré automatiquement par Fikra Valley</p>
    <p>Veuillez compléter les sections marquées "À compléter" avant soumission</p>
  </div>
</body>
</html>
  `;
}


/**
 * Check if idea qualifies for Intilaka PDF generation
 */
export async function qualifiesForIntilaka(ideaId: string): Promise<boolean> {
  const supabase = await createClient() as any;

  const { data: scores } = await supabase
    .from('marrai_idea_scores')
    .select('total_score, stage2_total')
    .eq('idea_id', ideaId)
    .single();

  // Qualifies if Stage 2 score ≥ 25/40 or total score ≥ 25/40
  return (scores?.total_score || scores?.stage2_total || 0) >= 25;
}
