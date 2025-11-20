/**
 * NETWORK AGENT - Community Builder
 * 
 * Locke: "Knowledge is enriched when shared and discussed."
 * 
 * Ideas don't exist in isolation. Similar ideas can learn from each other.
 * Entrepreneurs in same sector = potential collaborators or mutual learners.
 * 
 * Core Principle:
 * - Find similar ideas (semantic search)
 * - Connect entrepreneurs in same space
 * - Facilitate peer learning
 * - Build sector-specific communities
 * - Share insights (anonymized)
 */

// ==================== INTERFACES ====================

export interface SimilarIdea {
  idea: IdeaStatement;
  similarity: number; // 0-1
  
  commonalities: {
    sector: boolean;
    problem: boolean;
    solution: boolean;
    location: boolean;
    stage: boolean;
  };
  
  insights: string[]; // What can be learned from this idea
  
  connectionSuggestion: {
    shouldConnect: boolean;
    reason: string;
    message: string; // Pre-generated intro message
  };
}

export interface Community {
  id: string;
  name: string;
  sector: string;
  memberCount: number;
  
  activities: {
    discussions: number;
    sharedResources: number;
    meetups: number;
  };
  
  topMembers: User[];
  recentActivity: Activity[];
  
  // Locke-inspired
  collectiveIntimacy: number; // 0-10 (how deeply does community know sector?)
}

export interface PeerInsight {
  source: 'similar_idea' | 'community_discussion' | 'expert_feedback';
  content: string;
  relevance: number; // 0-1
  
  // Locke touch
  basedOnLivedExperience: boolean; // Is this from someone who KNOWS or "knows of"?
}

export interface IdeaStatement {
  id?: string;
  title: string;
  problem?: {
    sector?: string;
    location?: string;
    description?: string;
  };
  solution?: {
    description?: string;
  };
  operations?: {
    team?: Array<{ role: string; name: string }>;
  };
  receipts?: Array<{ id: string }>;
  intimacyScore?: number;
  stage?: string;
  qualification?: string;
  businessModel?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
}

interface VectorDatabase {
  embed(params: any): Promise<number[]>;
  similaritySearch(collection: string, params: any): Promise<any[]>;
}

interface ClaudeAPI {
  complete(params: any): Promise<any>;
}

// ==================== MAIN CLASS ====================

export class NetworkAgent {
  private vectorDB?: VectorDatabase;
  private claudeAPI?: ClaudeAPI;
  
  // Mock data for testing
  private mockIdeas: IdeaStatement[] = [];
  private mockCommunities: Map<string, Community> = new Map();
  
  constructor(vectorDB?: VectorDatabase, claudeAPI?: ClaudeAPI) {
    this.vectorDB = vectorDB;
    this.claudeAPI = claudeAPI;
    this.initializeMockData();
  }

  // ==================== FIND SIMILAR IDEAS ====================

  /**
   * Find ideas similar to the given idea
   */
  async findSimilarIdeas(
    idea: IdeaStatement,
    limit: number = 5,
    onlyQualified: boolean = false
  ): Promise<SimilarIdea[]> {
    // Create search text
    const searchText = `${idea.title} ${idea.problem?.description || ''} ${idea.solution?.description || ''}`;
    
    let similarIdeas: IdeaStatement[];
    
    if (this.vectorDB) {
      // Use vector database for semantic search
      const embedding = await this.vectorDB.embed({
        text: searchText,
        model: 'text-embedding-3-large'
      });
      
      const results = await this.vectorDB.similaritySearch('ideas', {
        embedding,
        filters: {
          id: { neq: idea.id },
          ...(onlyQualified && { qualification: { gte: 'qualified' } })
        },
        limit: limit * 2
      });
      
      similarIdeas = results;
    } else {
      // Use mock database with simple text similarity
      similarIdeas = this.mockIdeas
        .filter(i => i.id !== idea.id)
        .filter(i => !onlyQualified || (i.qualification && i.qualification >= 'qualified'));
    }
    
    // Analyze each similar idea
    const analyzed: SimilarIdea[] = similarIdeas.map(similarIdea => {
      const commonalities = this.analyzeCommonalities(idea, similarIdea);
      const similarity = this.calculateSimilarity(idea, similarIdea);
      
      return {
        idea: similarIdea,
        similarity,
        commonalities,
        insights: this.extractInsights(idea, similarIdea),
        connectionSuggestion: this.suggestConnection(idea, similarIdea, commonalities)
      };
    });
    
    // Sort by similarity and return top N
    return analyzed
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // ==================== ANALYZE COMMONALITIES ====================

  /**
   * Analyze what two ideas have in common
   */
  private analyzeCommonalities(idea1: IdeaStatement, idea2: IdeaStatement): SimilarIdea['commonalities'] {
    return {
      sector: idea1.problem?.sector === idea2.problem?.sector,
      problem: this.calculateTextSimilarity(
        idea1.problem?.description,
        idea2.problem?.description
      ) > 0.6,
      solution: this.calculateTextSimilarity(
        idea1.solution?.description,
        idea2.solution?.description
      ) > 0.5,
      location: idea1.problem?.location === idea2.problem?.location,
      stage: idea1.stage === idea2.stage
    };
  }

  /**
   * Calculate overall similarity score
   */
  private calculateSimilarity(idea1: IdeaStatement, idea2: IdeaStatement): number {
    const weights = {
      sector: 0.3,
      problem: 0.35,
      solution: 0.2,
      location: 0.1,
      stage: 0.05
    };
    
    const commonalities = this.analyzeCommonalities(idea1, idea2);
    
    let score = 0;
    if (commonalities.sector) score += weights.sector;
    if (commonalities.problem) score += weights.problem;
    if (commonalities.solution) score += weights.solution;
    if (commonalities.location) score += weights.location;
    if (commonalities.stage) score += weights.stage;
    
    return score;
  }

  // ==================== EXTRACT INSIGHTS ====================

  /**
   * Extract what can be learned from a similar idea
   */
  private extractInsights(myIdea: IdeaStatement, theirIdea: IdeaStatement): string[] {
    const insights: string[] = [];
    
    // Different approach to same problem
    if (myIdea.problem?.sector === theirIdea.problem?.sector && 
        myIdea.solution?.description !== theirIdea.solution?.description) {
      insights.push(`Approche différente: ${theirIdea.solution?.description?.substring(0, 100) || 'Alternative solution'}...`);
    }
    
    // More receipts collected
    const myReceipts = myIdea.receipts?.length || 0;
    const theirReceipts = theirIdea.receipts?.length || 0;
    
    if (theirReceipts > myReceipts) {
      insights.push(`A collecté ${theirReceipts} reçus (vs ${myReceipts} pour vous) - stratégie de validation agressive`);
    }
    
    // Better intimacy score
    const myIntimacy = myIdea.intimacyScore || 0;
    const theirIntimacy = theirIdea.intimacyScore || 0;
    
    if (theirIntimacy > myIntimacy) {
      insights.push(`Intimité supérieure (${theirIntimacy}/10) - Locke: ils connaissent MIEUX leur problème`);
    }
    
    // Same location (potential local knowledge)
    if (myIdea.problem?.location && 
        myIdea.problem.location === theirIdea.problem?.location) {
      insights.push(`Même localisation (${myIdea.problem.location}) - connaissances locales partagées possibles`);
    }
    
    // Different business model
    if (myIdea.businessModel && 
        theirIdea.businessModel && 
        myIdea.businessModel !== theirIdea.businessModel) {
      insights.push(`Modèle économique différent: ${theirIdea.businessModel}`);
    }
    
    // At least one insight
    if (insights.length === 0) {
      insights.push('Idée dans un domaine similaire - échange d\'expériences recommandé');
    }
    
    return insights;
  }

  // ==================== SUGGEST CONNECTION ====================

  /**
   * Determine if two entrepreneurs should connect
   */
  private suggestConnection(
    myIdea: IdeaStatement,
    theirIdea: IdeaStatement,
    commonalities: SimilarIdea['commonalities']
  ): SimilarIdea['connectionSuggestion'] {
    const commonCount = Object.values(commonalities).filter(Boolean).length;
    
    // Same sector + same problem = definitely connect
    if (commonalities.sector && commonalities.problem) {
      return {
        shouldConnect: true,
        reason: "Vous travaillez sur le même problème dans le même secteur. Collaboration ou apprentissage mutuel fortement recommandé.",
        message: `Bonjour! J'ai vu que vous travaillez sur ${theirIdea.title}.

Je travaille sur quelque chose de similaire: ${myIdea.title}.

J'aimerais échanger sur nos approches respectives. Seriez-vous disponible pour un café virtuel?

Locke disait: "Knowledge is enriched when shared." Enrichissons nos connaissances mutuelles! 🤝`
      };
    }
    
    // Same sector but different problem = potential synergy
    if (commonalities.sector && !commonalities.problem) {
      return {
        shouldConnect: true,
        reason: "Même secteur, problèmes différents. Potentiel de synergies ou partenariats.",
        message: `Bonjour! Nous travaillons tous deux dans ${myIdea.problem?.sector || 'le même secteur'}.

Moi: ${myIdea.title}
Vous: ${theirIdea.title}

Il pourrait y avoir des synergies intéressantes. Échangeons?`
      };
    }
    
    // Similar solution, different sector = learning opportunity
    if (commonalities.solution && !commonalities.sector) {
      return {
        shouldConnect: false,
        reason: "Solutions similaires dans secteurs différents. Pas de conflit, mais apprentissage possible.",
        message: `Votre approche technique sur ${theirIdea.title} est intéressante.

J'applique quelque chose de similaire dans un autre secteur.
Seriez-vous ouvert à échanger sur nos expériences techniques?`
      };
    }
    
    // Not very similar
    if (commonCount <= 1) {
      return {
        shouldConnect: false,
        reason: "Peu de points communs. Connexion pas prioritaire.",
        message: ""
      };
    }
    
    return {
      shouldConnect: true,
      reason: `${commonCount} points communs. Échange potentiellement enrichissant.`,
      message: `Bonjour! J'ai remarqué plusieurs similitudes entre nos projets.

Seriez-vous intéressé par un échange d'expériences?`
    };
  }

  // ==================== FIND OR CREATE COMMUNITY ====================

  /**
   * Find existing community or suggest creating one
   */
  async findCommunity(idea: IdeaStatement): Promise<Community | null> {
    const sector = idea.problem?.sector;
    if (!sector) return null;
    
    // Check if community exists
    let community = this.mockCommunities.get(sector);
    
    // Create if doesn't exist and threshold met
    if (!community && await this.shouldCreateCommunity(sector)) {
      community = await this.createCommunity(sector);
    }
    
    return community || null;
  }

  /**
   * Create a new community for a sector
   */
  private async createCommunity(sector: string): Promise<Community> {
    const community: Community = {
      id: `community_${sector}_${Date.now()}`,
      name: `${sector} Builders Morocco`,
      sector,
      memberCount: 0,
      activities: {
        discussions: 0,
        sharedResources: 0,
        meetups: 0
      },
      topMembers: [],
      recentActivity: [],
      collectiveIntimacy: 0
    };
    
    this.mockCommunities.set(sector, community);
    return community;
  }

  // ==================== CALCULATE COLLECTIVE INTIMACY ====================

  /**
   * Calculate collective intimacy for a community (Locke's metric for groups)
   */
  private async calculateCollectiveIntimacy(members: User[]): Promise<number> {
    if (members.length === 0) return 0;
    
    // Get all ideas from community members
    const ideas = this.mockIdeas.filter(idea => 
      members.some(m => m.id === idea.id)
    );
    
    if (ideas.length === 0) return 0;
    
    // Average intimacy of all ideas
    const totalIntimacy = ideas.reduce((sum, idea) => 
      sum + (idea.intimacyScore || 0), 0
    );
    const avgIntimacy = totalIntimacy / ideas.length;
    
    // Bonus for community engagement (simulated)
    const engagementBonus = Math.min(2, members.length / 25); // Up to +2 points
    
    return Math.min(10, avgIntimacy + engagementBonus);
  }

  // ==================== GENERATE PEER INSIGHTS ====================

  /**
   * Generate anonymized insights from similar successful ideas
   */
  async generatePeerInsights(idea: IdeaStatement): Promise<PeerInsight[]> {
    // Find similar qualified ideas
    const similar = await this.findSimilarIdeas(idea, 10, true);
    
    const insights: PeerInsight[] = [];
    
    if (similar.length === 0) {
      return [{
        source: 'community_discussion',
        content: 'Vous êtes parmi les premiers dans ce secteur. Continuez à documenter votre expérience!',
        relevance: 0.5,
        basedOnLivedExperience: false
      }];
    }
    
    // Pattern 1: Receipt collection strategies
    const avgReceipts = similar.reduce((sum, s) => 
      sum + (s.idea.receipts?.length || 0), 0
    ) / similar.length;
    
    const myReceipts = idea.receipts?.length || 0;
    
    if (avgReceipts > myReceipts) {
      insights.push({
        source: 'similar_idea',
        content: `D'autres entrepreneurs dans votre secteur ont collecté en moyenne ${Math.round(avgReceipts)} reçus. Vous en avez ${myReceipts}. Considérez intensifier votre validation.`,
        relevance: 0.9,
        basedOnLivedExperience: true
      });
    } else if (myReceipts > avgReceipts) {
      insights.push({
        source: 'similar_idea',
        content: `Excellent! Vous avez collecté plus de reçus (${myReceipts}) que la moyenne du secteur (${Math.round(avgReceipts)}). Votre validation est solide.`,
        relevance: 0.8,
        basedOnLivedExperience: true
      });
    }
    
    // Pattern 2: Team composition
    const commonTeamRoles = this.extractCommonTeamRoles(similar);
    if (commonTeamRoles.length > 0) {
      insights.push({
        source: 'similar_idea',
        content: `Équipes similaires incluent souvent: ${commonTeamRoles.join(', ')}. Avez-vous ces compétences?`,
        relevance: 0.7,
        basedOnLivedExperience: true
      });
    }
    
    // Pattern 3: Average intimacy
    const avgIntimacy = similar.reduce((sum, s) => 
      sum + (s.idea.intimacyScore || 0), 0
    ) / similar.length;
    
    const myIntimacy = idea.intimacyScore || 0;
    
    if (avgIntimacy > myIntimacy + 1) {
      insights.push({
        source: 'similar_idea',
        content: `Intimité moyenne du secteur: ${avgIntimacy.toFixed(1)}/10. La vôtre: ${myIntimacy}/10. Locke: Approfondissez votre connaissance du problème.`,
        relevance: 0.85,
        basedOnLivedExperience: true
      });
    }
    
    // Pattern 4: Common challenges (if Claude API available)
    if (this.claudeAPI && similar.length >= 3) {
      const challenges = await this.extractCommonChallenges(similar);
      if (challenges.length > 0) {
        insights.push({
          source: 'community_discussion',
          content: `Défi fréquent dans votre secteur: ${challenges[0]}. Anticipez cela dans votre plan.`,
          relevance: 0.8,
          basedOnLivedExperience: true
        });
      }
    }
    
    return insights.sort((a, b) => b.relevance - a.relevance);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate text similarity (simple word overlap)
   */
  private calculateTextSimilarity(text1?: string, text2?: string): number {
    if (!text1 || !text2) return 0;
    
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    if (words1.size === 0 || words2.size === 0) return 0;
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    return intersection.size / Math.min(words1.size, words2.size);
  }

  /**
   * Check if a community should be created
   */
  private async shouldCreateCommunity(sector: string): Promise<boolean> {
    // Create community if there are at least 5 ideas in sector
    const ideasInSector = this.mockIdeas.filter(i => i.problem?.sector === sector);
    return ideasInSector.length >= 5;
  }

  /**
   * Extract common team roles from similar ideas
   */
  private extractCommonTeamRoles(similar: SimilarIdea[]): string[] {
    const roleCounts = new Map<string, number>();
    
    similar.forEach(s => {
      const team = s.idea.operations?.team || [];
      team.forEach((member: any) => {
        if (member.role) {
          roleCounts.set(member.role, (roleCounts.get(member.role) || 0) + 1);
        }
      });
    });
    
    // Return roles present in 50%+ of ideas
    const threshold = similar.length * 0.5;
    return Array.from(roleCounts.entries())
      .filter(([role, count]) => count >= threshold)
      .map(([role]) => role);
  }

  /**
   * Extract common challenges using Claude AI
   */
  private async extractCommonChallenges(similar: SimilarIdea[]): Promise<string[]> {
    if (!this.claudeAPI) return [];
    
    const descriptions = similar
      .map(s => s.idea.problem?.description)
      .filter(Boolean)
      .slice(0, 10); // Limit to 10 for token efficiency
    
    if (descriptions.length === 0) return [];
    
    const prompt = `Analyze these problem descriptions from similar startups and extract the 3 most common challenges:

${descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n\n')}

Return top 3 challenges as JSON array of strings.`;

    try {
      const response = await this.claudeAPI.complete({
        prompt,
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300
      });
      
      return JSON.parse(response.content[0].text);
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate community rules
   */
  private generateCommunityRules(sector: string): string[] {
    return [
      "Partagez vos expériences VÉCUES (Locke: lived experience only)",
      "Pas de spam ou auto-promotion excessive",
      "Respectez la confidentialité des autres membres",
      "Aidez activement quand vous le pouvez",
      "Célébrez les succès des autres"
    ];
  }

  // ==================== MOCK DATA (FOR TESTING) ====================

  /**
   * Initialize mock data for testing
   */
  private initializeMockData() {
    this.mockIdeas = [
      {
        id: 'idea-1',
        title: 'RFID Equipment Tracking for Hospitals',
        problem: {
          sector: 'healthtech',
          location: 'Rabat',
          description: 'Nurses lose 2 hours per shift searching for medical equipment'
        },
        solution: {
          description: 'RFID-based real-time tracking system'
        },
        receipts: Array(75).fill({ id: 'receipt' }),
        intimacyScore: 8.5,
        stage: 'validation',
        qualification: 'qualified',
        businessModel: 'SaaS subscription'
      },
      {
        id: 'idea-2',
        title: 'Mobile Inventory App for Clinics',
        problem: {
          sector: 'healthtech',
          location: 'Casablanca',
          description: 'Medical supplies go missing in private clinics, causing delays'
        },
        solution: {
          description: 'Mobile app with barcode scanning for inventory management'
        },
        receipts: Array(40).fill({ id: 'receipt' }),
        intimacyScore: 7.2,
        stage: 'validation',
        qualification: 'promising',
        businessModel: 'Per-clinic fee'
      },
      {
        id: 'idea-3',
        title: 'Smart Agriculture IoT for Farmers',
        problem: {
          sector: 'agritech',
          location: 'Meknès',
          description: 'Farmers waste water due to poor irrigation timing'
        },
        solution: {
          description: 'IoT sensors for soil moisture monitoring'
        },
        receipts: Array(120).fill({ id: 'receipt' }),
        intimacyScore: 9.0,
        stage: 'growth',
        qualification: 'exceptional',
        businessModel: 'Hardware + subscription'
      }
    ];
    
    // Initialize a healthcare community
    this.mockCommunities.set('healthtech', {
      id: 'community-healthtech',
      name: 'HealthTech Builders Morocco',
      sector: 'healthtech',
      memberCount: 15,
      activities: {
        discussions: 42,
        sharedResources: 18,
        meetups: 3
      },
      topMembers: [],
      recentActivity: [],
      collectiveIntimacy: 7.5
    });
  }

  /**
   * Add idea to mock database (for testing)
   */
  addMockIdea(idea: IdeaStatement): void {
    this.mockIdeas.push(idea);
  }

  /**
   * Get all communities (for testing)
   */
  getAllCommunities(): Community[] {
    return Array.from(this.mockCommunities.values());
  }
}

// Export everything
export default NetworkAgent;

