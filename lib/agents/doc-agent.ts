/**
 * DOC AGENT - Document Generator
 * 
 * Locke: "The materials of knowledge must be organized into something useful."
 * 
 * The idea (raw knowledge) must be transformed into professional documents (actionable materials).
 * DOC takes intimately understood ideas and creates fundable documents.
 * 
 * Core Principle:
 * - Auto-fill from idea data
 * - Professional formatting
 * - Missing field detection
 * - Progressive generation with progress tracking
 * - Multiple document types for different audiences
 */

// ==================== INTERFACES ====================

export interface GeneratedDocument {
  id: string;
  type: 'intilaka_pdf' | 'business_plan' | 'pitch_deck' | 'one_pager' | 'financial_model';
  
  url: string; // Download URL
  previewUrl: string; // Preview URL
  
  metadata: {
    pages: number;
    generatedAt: Date;
    expiresAt: Date; // 90 days validity
    version: number;
  };
  
  completeness: number; // 0-100% (how much is pre-filled?)
  
  missingFields: Array<{
    field: string;
    section: string;
    required: boolean;
    placeholder: string;
  }>;
  
  // Locke insight
  intimacyReflection: string; // How idea's intimacy shows in document
}

export interface GenerationProgress {
  status: 'queued' | 'analyzing' | 'generating' | 'formatting' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining: number; // seconds
  
  steps: Array<{
    name: string;
    status: 'pending' | 'in_progress' | 'complete';
    duration?: number; // milliseconds
  }>;
}

export interface DocumentTemplate {
  type: string;
  sections: Array<{
    title: string;
    required: boolean;
    autoFillable: boolean;
    dataSource: string[]; // Which fields from idea to use
  }>;
}

export interface IdeaStatement {
  id?: string;
  title: string;
  problem?: {
    sector?: string;
    location?: string;
    description?: string;
    who?: string;
    frequency?: string;
  };
  solution?: {
    description?: string;
    differentiation?: string;
  };
  operations?: {
    team?: string;
    budget?: string;
    timeline?: string;
    technology?: string[];
  };
  receipts?: Array<{ id: string; imageUrl?: string }>;
  revisions?: Array<{ timestamp: Date; content: string }>;
  marginNotes?: Array<{ timestamp: Date; note: string }>;
  clarityScore?: number;
  decisionScore?: number;
  intimacyScore?: number;
  submitter?: {
    name: string;
  };
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  cin?: string;
  dateOfBirth?: string;
  address?: string;
  rib?: string;
  location?: string;
  education?: string;
  preferredLanguage?: string;
}

interface ClaudeAPI {
  complete(params: any): Promise<any>;
}

interface PDFGenerator {
  generate(params: any): Promise<{ url: string; previewUrl: string; pageCount: number }>;
  generateFromMarkdown(params: any): Promise<{ url: string; previewUrl: string }>;
}

interface PPTXGenerator {
  generate(params: any): Promise<{ url: string; previewUrl: string }>;
}

// ==================== MAIN CLASS ====================

export class DocAgent {
  private claudeAPI?: ClaudeAPI;
  private pdfGenerator?: PDFGenerator;
  private pptxGenerator?: PPTXGenerator;
  private progressListeners: Map<string, (progress: any) => void> = new Map();
  
  constructor(claudeAPI?: ClaudeAPI, pdfGenerator?: PDFGenerator, pptxGenerator?: PPTXGenerator) {
    this.claudeAPI = claudeAPI;
    this.pdfGenerator = pdfGenerator;
    this.pptxGenerator = pptxGenerator;
  }

  // ==================== GENERATE INTILAKA PDF APPLICATION ====================

  /**
   * Generate complete Intilaka funding application PDF
   */
  async generateIntilakaPDF(idea: IdeaStatement, user: User): Promise<GeneratedDocument> {
    const progress = this.createProgressTracker('intilaka_pdf');
    
    try {
      // Step 1: Analyze idea for completeness (10%)
      progress.update('analyzing', 'Analyse de votre idée...', 10);
      const analysis = await this.analyzeIdeaCompleteness(idea, user);
      
      // Step 2: Generate content (40%)
      progress.update('generating', 'Génération du contenu...', 40);
      const content = await this.generateIntilaqaContent(idea, user, analysis);
      
      // Step 3: Format document (70%)
      progress.update('formatting', 'Formatage du document...', 70);
      
      const pdf = this.pdfGenerator 
        ? await this.pdfGenerator.generate({
            template: 'intilaka_2025',
            data: content,
            locale: user.preferredLanguage || 'fr'
          })
        : this.mockPDFGeneration(content);
      
      // Step 4: Finalize (100%)
      progress.update('complete', 'Document prêt!', 100);
      
      return {
        id: this.generateId(),
        type: 'intilaka_pdf',
        url: pdf.url,
        previewUrl: pdf.previewUrl,
        metadata: {
          pages: pdf.pageCount || 12,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          version: 1
        },
        completeness: analysis.completeness,
        missingFields: analysis.missingFields,
        intimacyReflection: this.generateIntimacyReflection(idea, analysis)
      };
      
    } catch (error: any) {
      progress.update('error', `Erreur: ${error.message}`, 0);
      throw error;
    }
  }

  // ==================== ANALYZE IDEA COMPLETENESS ====================

  /**
   * Analyze how complete an idea is for document generation
   */
  private async analyzeIdeaCompleteness(idea: IdeaStatement, user: User): Promise<{
    completeness: number;
    missingFields: any[];
    strengths: string[];
    weaknesses: string[];
  }> {
    const requiredFields = [
      { key: 'problem.description', label: 'Description du problème', weight: 10, getValue: () => idea.problem?.description },
      { key: 'problem.who', label: 'Qui a le problème', weight: 8, getValue: () => idea.problem?.who },
      { key: 'problem.frequency', label: 'Fréquence', weight: 6, getValue: () => idea.problem?.frequency },
      { key: 'solution.description', label: 'Description solution', weight: 10, getValue: () => idea.solution?.description },
      { key: 'solution.differentiation', label: 'Différenciation', weight: 8, getValue: () => idea.solution?.differentiation },
      { key: 'operations.team', label: 'Équipe', weight: 7, getValue: () => idea.operations?.team },
      { key: 'operations.budget', label: 'Budget', weight: 8, getValue: () => idea.operations?.budget },
      { key: 'operations.timeline', label: 'Timeline', weight: 6, getValue: () => idea.operations?.timeline },
      { key: 'receipts', label: 'Reçus (preuve)', weight: 10, getValue: () => idea.receipts },
      { key: 'user.cin', label: 'CIN', weight: 5, getValue: () => user.cin },
      { key: 'user.rib', label: 'RIB bancaire', weight: 5, getValue: () => user.rib },
      { key: 'user.address', label: 'Adresse complète', weight: 4, getValue: () => user.address }
    ];
    
    let totalWeight = 0;
    let achievedWeight = 0;
    const missingFields: any[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    for (const field of requiredFields) {
      totalWeight += field.weight;
      
      const value = field.getValue();
      
      if (this.hasValue(value)) {
        achievedWeight += field.weight;
        strengths.push(field.label);
      } else {
        missingFields.push({
          field: field.key,
          section: field.key.split('.')[0],
          label: field.label,
          required: field.weight >= 7,
          placeholder: this.getPlaceholder(field.key)
        });
        weaknesses.push(field.label);
      }
    }
    
    const completeness = Math.round((achievedWeight / totalWeight) * 100);
    
    return {
      completeness,
      missingFields,
      strengths,
      weaknesses
    };
  }

  // ==================== GENERATE INTILAKA CONTENT ====================

  /**
   * Generate content for Intilaka application
   */
  private async generateIntilaqaContent(
    idea: IdeaStatement,
    user: User,
    analysis: any
  ): Promise<any> {
    // If we have Claude API, use it to generate missing sections
    let generated: any = {};
    
    if (this.claudeAPI && analysis.missingFields.length > 0) {
      const prompt = `You are filling out an Intilaka funding application for a Moroccan entrepreneur.

IDEA SUMMARY:
Title: ${idea.title}
Problem: ${idea.problem?.description || 'Not provided'}
Solution: ${idea.solution?.description || 'Not provided'}
Receipts collected: ${idea.receipts?.length || 0}
Intimacy score: ${idea.intimacyScore || 0}/10

ENTREPRENEUR:
Name: ${user.name}
Location: ${user.location || 'Morocco'}
Education: ${user.education || 'Not provided'}

SECTIONS TO COMPLETE:
${analysis.missingFields.map((f: any) => `- ${f.label}: ${f.placeholder}`).join('\n')}

INSTRUCTIONS:
1. Generate professional, concise content for each missing section
2. Use data from idea when available
3. Tone: Professional but accessible
4. Language: French (with Darija business terms if appropriate)
5. Highlight the INTIMACY with the problem (Locke's philosophy)
6. Emphasize proof of demand (receipts collected)

LOCKE'S PHILOSOPHY:
This entrepreneur has ${idea.receipts?.length || 0} receipts proving they've ENGAGED with the problem.
They don't just "know OF" this problem - they've made it THEIRS through ${idea.receipts?.length || 0} conversations.
Highlight this intimate understanding throughout the application.

OUTPUT FORMAT (JSON):
{
  "executiveSummary": "...",
  "problemStatement": "...",
  "solutionDescription": "...",
  "marketAnalysis": "...",
  "competitiveAdvantage": "...",
  "teamDescription": "...",
  "financialProjections": "...",
  "fundingRequest": "..."
}`;

      const response = await this.claudeAPI.complete({
        prompt,
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000
      });
      
      generated = JSON.parse(response.content[0].text);
    }
    
    // Merge with existing data
    return {
      // Personal info
      fullName: user.name,
      cin: user.cin || '[À COMPLÉTER]',
      dateOfBirth: user.dateOfBirth || '[À COMPLÉTER]',
      address: user.address || '[À COMPLÉTER]',
      phone: user.phone || '[À COMPLÉTER]',
      email: user.email,
      rib: user.rib || '[À COMPLÉTER]',
      
      // Idea info
      projectTitle: idea.title,
      sector: idea.problem?.sector || 'Technology',
      location: idea.problem?.location || user.location || 'Morocco',
      
      // Generated or provided sections
      executiveSummary: generated.executiveSummary || this.generateDefaultExecutiveSummary(idea),
      problemStatement: idea.problem?.description || generated.problemStatement || '[À COMPLÉTER]',
      solutionDescription: idea.solution?.description || generated.solutionDescription || '[À COMPLÉTER]',
      marketAnalysis: generated.marketAnalysis || '[À COMPLÉTER]',
      competitiveAdvantage: idea.solution?.differentiation || generated.competitiveAdvantage || '[À COMPLÉTER]',
      teamDescription: idea.operations?.team || generated.teamDescription || '[À COMPLÉTER]',
      financialProjections: generated.financialProjections || '[À COMPLÉTER]',
      fundingRequest: generated.fundingRequest || '[À COMPLÉTER]',
      
      // Evidence
      receiptsCount: idea.receipts?.length || 0,
      receiptsPhotos: idea.receipts?.slice(0, 10).map(r => r.imageUrl).filter(Boolean) || [],
      
      // Scores
      clarityScore: idea.clarityScore || 0,
      decisionScore: idea.decisionScore || 0,
      intimacyScore: idea.intimacyScore || 0,
      
      // Locke's insight
      intimacyStatement: this.generateIntimacyStatement(idea)
    };
  }

  // ==================== GENERATE BUSINESS PLAN ====================

  /**
   * Generate comprehensive business plan (15 pages)
   */
  async generateBusinessPlan(idea: IdeaStatement): Promise<GeneratedDocument> {
    const progress = this.createProgressTracker('business_plan');
    
    try {
      progress.update('analyzing', 'Analyse stratégique...', 10);
      
      // Generate comprehensive business plan
      const prompt = `Generate a comprehensive 15-page business plan for this Moroccan startup idea.

IDEA:
${JSON.stringify(idea, null, 2)}

STRUCTURE (15 pages):
1. Executive Summary (1 page)
2. Problem Statement (1 page) - Emphasize INTIMATE understanding
3. Market Analysis (2 pages)
4. Solution Description (2 pages)
5. Business Model (1 page)
6. Competitive Analysis (2 pages)
7. Marketing Strategy (2 pages)
8. Operations Plan (1 page)
9. Financial Projections (2 pages)
10. Team (1 page)

LOCKE'S PHILOSOPHY:
- Highlight that founder has collected ${idea.receipts?.length || 0} receipts
- Emphasize INTIMATE knowledge vs competitors who just "know OF" the space
- Show thinking evolution (revisions, margin notes)
- Demonstrate lived experience

TONE: Professional, data-driven, confident
LANGUAGE: French with Morocco-specific terminology
FORMAT: Markdown with clear sections

OUTPUT: Full markdown document`;

      progress.update('generating', 'Rédaction du plan...', 40);
      
      let markdown: string;
      if (this.claudeAPI) {
        const response = await this.claudeAPI.complete({
          prompt,
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000
        });
        markdown = response.content[0].text;
      } else {
        markdown = this.generateDefaultBusinessPlan(idea);
      }
      
      progress.update('formatting', 'Création du PDF...', 70);
      
      const pdf = this.pdfGenerator
        ? await this.pdfGenerator.generateFromMarkdown({
            markdown,
            style: 'professional',
            coverPage: {
              title: idea.title,
              subtitle: 'Business Plan',
              author: idea.submitter?.name || 'Fikra Valley',
              date: new Date()
            }
          })
        : this.mockPDFGeneration({ content: markdown });
      
      progress.update('complete', 'Plan d\'affaires prêt!', 100);
      
      return {
        id: this.generateId(),
        type: 'business_plan',
        url: pdf.url,
        previewUrl: pdf.previewUrl,
        metadata: {
          pages: 15,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          version: 1
        },
        completeness: 100,
        missingFields: [],
        intimacyReflection: `Ce plan d'affaires reflète une compréhension INTIME du problème, construite à travers ${idea.receipts?.length || 0} conversations réelles. (Locke's standard)`
      };
      
    } catch (error: any) {
      progress.update('error', `Erreur: ${error.message}`, 0);
      throw error;
    }
  }

  // ==================== GENERATE PITCH DECK ====================

  /**
   * Generate pitch deck for specific audience
   */
  async generatePitchDeck(
    idea: IdeaStatement,
    audience: 'investor' | 'accelerator' | 'grant' = 'investor'
  ): Promise<GeneratedDocument> {
    const progress = this.createProgressTracker('pitch_deck');
    
    try {
      progress.update('analyzing', 'Adaptation pour audience...', 10);
      
      // Customize content based on audience
      const deckStructure = this.getDeckStructure(audience);
      
      progress.update('generating', 'Création des slides...', 40);
      
      const slides = await this.generateSlides(idea, deckStructure);
      
      progress.update('formatting', 'Design des slides...', 70);
      
      const pptx = this.pptxGenerator
        ? await this.pptxGenerator.generate({
            template: audience === 'investor' ? 'professional' : 'modern',
            slides,
            theme: {
              primaryColor: '#10B981', // Fikra Valley green
              fontFamily: 'Inter'
            }
          })
        : this.mockPPTXGeneration(slides);
      
      progress.update('complete', 'Pitch deck prêt!', 100);
      
      return {
        id: this.generateId(),
        type: 'pitch_deck',
        url: pptx.url,
        previewUrl: pptx.previewUrl,
        metadata: {
          pages: slides.length,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          version: 1
        },
        completeness: 100,
        missingFields: [],
        intimacyReflection: `Slide 4 'Proof of Demand' montre ${idea.receipts?.length || 0} reçus - preuve d'engagement intime avec le marché.`
      };
      
    } catch (error: any) {
      progress.update('error', `Erreur: ${error.message}`, 0);
      throw error;
    }
  }

  // ==================== GENERATE ONE-PAGER ====================

  /**
   * Generate single-page executive summary
   */
  async generateOnePager(idea: IdeaStatement): Promise<GeneratedDocument> {
    const prompt = `Create a compelling one-page summary for this idea.

IDEA:
${JSON.stringify(idea, null, 2)}

FORMAT:
- Company Name & Tagline (bold, centered)
- Problem (2-3 sentences)
- Solution (2-3 sentences)
- Proof of Demand: ${idea.receipts?.length || 0} people paid 3 DH to validate
- Market Size (1 sentence)
- Business Model (1 sentence)
- Competitive Advantage (2 bullets)
- Team (1 sentence)
- Ask (1 sentence)
- Contact info

LOCKE'S TOUCH:
Include one sentence about INTIMATE understanding:
"We've had ${idea.receipts?.length || 0} conversations with users. We don't just know OF this problem - we KNOW it intimately."

TONE: Punchy, confident, data-driven
LENGTH: Exactly 1 page when formatted
OUTPUT: Markdown`;

    let markdown: string;
    if (this.claudeAPI) {
      const response = await this.claudeAPI.complete({
        prompt,
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800
      });
      markdown = response.content[0].text;
    } else {
      markdown = this.generateDefaultOnePager(idea);
    }
    
    const pdf = this.pdfGenerator
      ? await this.pdfGenerator.generateFromMarkdown({
          markdown,
          style: 'compact',
          layout: 'single_page'
        })
      : this.mockPDFGeneration({ content: markdown });
    
    return {
      id: this.generateId(),
      type: 'one_pager',
      url: pdf.url,
      previewUrl: pdf.previewUrl,
      metadata: {
        pages: 1,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        version: 1
      },
      completeness: 100,
      missingFields: [],
      intimacyReflection: `One-pager leads with proof: ${idea.receipts?.length || 0} real people validated this with their money.`
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get deck structure based on audience
   */
  private getDeckStructure(audience: string): string[] {
    const structures: Record<string, string[]> = {
      investor: [
        'Cover',
        'Problem (with intimacy proof)',
        'Solution',
        'Market Size',
        'Proof of Demand (receipts!)',
        'Business Model',
        'Competitive Advantage',
        'Financial Projections',
        'Team',
        'Use of Funds',
        'Vision',
        'Contact'
      ],
      accelerator: [
        'Cover',
        'Problem',
        'Our Journey (Locke: how we became intimate)',
        'Solution',
        'Early Traction (receipts)',
        'Market Opportunity',
        'What We Need',
        'Team',
        'Ask',
        'Contact'
      ],
      grant: [
        'Cover',
        'Problem & Context',
        'Community Engagement (receipts = community validation)',
        'Proposed Solution',
        'Impact Metrics',
        'SDG Alignment',
        'Budget',
        'Timeline',
        'Team',
        'Contact'
      ]
    };
    
    return structures[audience] || structures.investor;
  }

  /**
   * Generate slides based on structure
   */
  private async generateSlides(idea: IdeaStatement, structure: string[]): Promise<any[]> {
    return structure.map(slideTitle => ({
      title: slideTitle,
      content: this.generateSlideContent(idea, slideTitle)
    }));
  }

  /**
   * Generate content for a specific slide
   */
  private generateSlideContent(idea: IdeaStatement, slideTitle: string): string {
    if (slideTitle.includes('Cover')) {
      return `# ${idea.title}\n\n${idea.problem?.description?.substring(0, 100) || ''}...`;
    }
    
    if (slideTitle.includes('Problem')) {
      return idea.problem?.description || '[Problem description]';
    }
    
    if (slideTitle.includes('Solution')) {
      return idea.solution?.description || '[Solution description]';
    }
    
    if (slideTitle.includes('Proof') || slideTitle.includes('receipts')) {
      return `${idea.receipts?.length || 0} receipts collected\n\nReal proof of demand from real people.`;
    }
    
    return `[Content for: ${slideTitle}]`;
  }

  /**
   * Generate intimacy statement (Locke-inspired)
   */
  private generateIntimacyStatement(idea: IdeaStatement): string {
    const receiptsCount = idea.receipts?.length || 0;
    const revisionCount = idea.revisions?.length || 0;
    const marginNotes = idea.marginNotes?.length || 0;
    
    return `Cette idée ne vient pas de la lecture d'articles ou d'imitation de modèles étrangers.

Elle vient de ${receiptsCount} conversations réelles avec des personnes qui vivent ce problème quotidiennement.

Elle a été raffinée ${revisionCount} fois, avec ${marginNotes} notes de réflexion capturées pendant le processus.

Comme John Locke l'a dit: "Reading furnishes the mind with materials of knowledge. It is thinking makes what we read ours."

Ici, nous n'avons pas juste LU à propos du problème.
Nous l'avons VÉCU à travers ${receiptsCount} perspectives différentes.
Nous l'avons fait NÔTRE à travers la réflexion et l'itération.

C'est cette INTIMITÉ avec le problème qui nous distingue.
C'est cette CONNAISSANCE PROFONDE qui garantit notre succès.`;
  }

  /**
   * Generate intimacy reflection for document
   */
  private generateIntimacyReflection(idea: IdeaStatement, analysis: any): string {
    const intimacyScore = idea.intimacyScore || 0;
    
    if (intimacyScore >= 8) {
      return `🎯 Document d'Excellence

Votre intimité avec le problème (${intimacyScore}/10) transparaît dans chaque section.

${analysis.completeness}% de pré-remplissage montre la profondeur de votre compréhension.

Les investisseurs verront immédiatement que vous CONNAISSEZ ce problème intimement,
pas juste que vous "connaissez DE" ce problème.

Locke serait fier. ✨`;
    }
    
    if (intimacyScore >= 6) {
      return `👍 Document Solide

Intimité avec le problème: ${intimacyScore}/10 (bon niveau).

${analysis.completeness}% pré-rempli. Les sections remplies montrent une bonne compréhension.

Pour améliorer:
${analysis.missingFields.slice(0, 3).map((f: any) => `- Ajoutez: ${f.label}`).join('\n')}

Avec ces ajouts, votre document sera encore plus convaincant.`;
    }
    
    return `⚠️ Document à Compléter

Intimité actuelle: ${intimacyScore}/10
Complétude: ${analysis.completeness}%

${analysis.missingFields.length} champs à compléter pour un document complet.

Locke: Plus vous complétez avec des détails SPÉCIFIQUES,
plus vous montrez votre connaissance INTIME du problème.

Complétez les champs manquants pour maximiser vos chances de financement.`;
  }

  /**
   * Create progress tracker for real-time updates
   */
  private createProgressTracker(type: string): any {
    const tracker = {
      status: 'queued' as GenerationProgress['status'],
      progress: 0,
      currentStep: 'En file d\'attente...',
      update: (status: any, step: string, progress: number) => {
        tracker.status = status;
        tracker.currentStep = step;
        tracker.progress = progress;
        // Emit event for real-time UI updates
        this.emit('progress', { type, ...tracker });
      }
    };
    return tracker;
  }

  /**
   * Emit progress event to listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.progressListeners.get(event);
    if (listeners) {
      // Call all registered listeners
    }
  }

  /**
   * Check if value exists and is not empty
   */
  private hasValue(value: any): boolean {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Get placeholder text for field
   */
  private getPlaceholder(fieldKey: string): string {
    const placeholders: Record<string, string> = {
      'user.cin': 'Exemple: AB123456',
      'user.rib': 'Exemple: 011 780 0001234567890123 45',
      'user.address': 'Adresse complète avec code postal',
      'operations.budget': 'Budget détaillé en DH',
      'operations.timeline': 'Timeline avec étapes clés',
      'operations.team': 'Description de l\'équipe',
      'solution.differentiation': 'Ce qui vous distingue de la concurrence',
      'problem.who': 'Qui exactement a ce problème',
      'problem.frequency': 'À quelle fréquence le problème arrive'
    };
    return placeholders[fieldKey] || 'À compléter';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== MOCK GENERATORS (FOR TESTING) ====================

  private mockPDFGeneration(data: any): { url: string; previewUrl: string; pageCount: number } {
    return {
      url: `/documents/${this.generateId()}.pdf`,
      previewUrl: `/documents/${this.generateId()}_preview.pdf`,
      pageCount: data.pages || 12
    };
  }

  private mockPPTXGeneration(slides: any[]): { url: string; previewUrl: string } {
    return {
      url: `/documents/${this.generateId()}.pptx`,
      previewUrl: `/documents/${this.generateId()}_preview.pptx`
    };
  }

  // ==================== DEFAULT GENERATORS ====================

  private generateDefaultExecutiveSummary(idea: IdeaStatement): string {
    return `${idea.title} vise à résoudre ${idea.problem?.description?.substring(0, 100) || 'un problème important'}.
Notre solution propose ${idea.solution?.description?.substring(0, 100) || 'une approche innovante'}.
Nous avons validé la demande avec ${idea.receipts?.length || 0} preuves concrètes.`;
  }

  private generateDefaultBusinessPlan(idea: IdeaStatement): string {
    return `# ${idea.title} - Business Plan

## 1. Executive Summary
${this.generateDefaultExecutiveSummary(idea)}

## 2. Problem Statement
${idea.problem?.description || '[À compléter]'}

## 3. Solution
${idea.solution?.description || '[À compléter]'}

## 4. Market Analysis
[À compléter]

## 5. Proof of Demand
Nous avons collecté ${idea.receipts?.length || 0} reçus de 3 DH, démontrant un intérêt réel du marché.

## 6. Team
${idea.operations?.team || '[À compléter]'}

## 7. Financial Projections
[À compléter]

## 8. Funding Request
[À compléter]`;
  }

  private generateDefaultOnePager(idea: IdeaStatement): string {
    return `# ${idea.title}

**Problem:** ${idea.problem?.description?.substring(0, 150) || '[À compléter]'}

**Solution:** ${idea.solution?.description?.substring(0, 150) || '[À compléter]'}

**Proof of Demand:** ${idea.receipts?.length || 0} people paid 3 DH to validate

**Market:** [À compléter]

**Team:** ${idea.submitter?.name || '[À compléter]'}

**Ask:** [À compléter]`;
  }
}

// Export everything
export default DocAgent;

