/**
 * Spec-Driven Development Agent
 * 
 * "The premium is on knowing what you're building"
 * Generates 1-page product specs with Moroccan constraints
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ProductSpec {
  problem_darija: string;
  problem_fr: string;
  constraints: string[];
  success_metric: {
    definition: string;
    target: string;
    timeframe: string;
    real_user_definition: string; // NOT family/friends
  };
  edge_case: {
    scenario: string;
    solution: string;
  };
  distribution_channel?: string;
}

export class SpecAgent {
  private claude: Anthropic;

  constructor(apiKey?: string) {
    this.claude = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async generateSpec(userIdea: string): Promise<ProductSpec> {
    const prompt = `You are a Moroccan market validation agent. Given this idea: "${userIdea}", draft a 1-page product spec with:

CONTEXT: Target user is in Morocco.
- Primary language: Darija (Moroccan Arabic)
- Secondary: French
- Network: 2G/3G common, data is expensive
- Device: Android phone, 4GB RAM, 64GB storage
- Digital literacy: Low; avoid jargon
- Payment: No credit cards; prefer cash, mobile money

REQUIREMENTS:
- Problem statement in Darija AND French (max 2 sentences each)
- 3 constraints specific to mobile-first, intermittent connectivity users
- Success metric: "10 real users in 4 weeks" with clear definition of "real user" (NOT family/friends)
- 1 edge case: What happens if user has no data for 3 days?
- Distribution channel: WhatsApp groups, Facebook pages, or physical locations

Format: JSON with fields: problem_darija, problem_fr, constraints[], success_metric{definition, target, timeframe, real_user_definition}, edge_case{scenario, solution}, distribution_channel.

Be specific. Force clarity before execution.`;

    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Clean JSON response
    const cleaned = text.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned) as ProductSpec;
    } catch (error) {
      // Fallback parsing
      const fallback: ProductSpec = {
        problem_darija: 'المشكلة تحتاج إلى توضيح',
        problem_fr: 'Le problème nécessite une clarification',
        constraints: ['Fonctionne hors ligne', 'Taille <500KB', 'Pas de connexion requise'],
        success_metric: {
          definition: 'Utilisateur réel = personne en dehors du réseau personnel',
          target: '10 utilisateurs',
          timeframe: '4 semaines',
          real_user_definition: 'Quelqu\'un qui n\'est pas famille/ami, utilise la solution 2 fois minimum'
        },
        edge_case: {
          scenario: 'Utilisateur sans données pendant 3 jours',
          solution: 'Mode hors ligne complet, synchronisation automatique au retour de connexion'
        }
      };
      return fallback;
    }
  }
}

