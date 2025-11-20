/**
 * COACH AGENT - Long-Term Guide
 * 
 * Locke: "Knowledge is built through continuous engagement and reflection."
 * 
 * Entrepreneurship is a marathon, not a sprint.
 * COACH provides ongoing support, tracks progress, celebrates wins, and provides
 * motivation during challenges.
 * 
 * Core Principle:
 * - Track journey from idea → launch → growth
 * - Milestone-based motivation
 * - Personalized guidance based on progress
 * - Celebrate small wins (Locke: each step of thinking)
 * - Long-term relationship
 */

// ==================== INTERFACES ====================

export interface Journey {
  userId: string;
  ideaId: string;
  startedAt: Date;
  
  milestones: Milestone[];
  currentPhase: 'ideation' | 'validation' | 'building' | 'launch' | 'growth';
  
  stats: {
    daysActive: number;
    revisionsCount: number;
    receiptsCollected: number;
    conversationsHad: number;
    marginNotesWritten: number;
    documentsGenerated: number;
  };
  
  // Locke metrics
  intimacyEvolution: Array<{
    date: Date;
    score: number;
  }>;
  
  thinkingDepth: 'superficial' | 'developing' | 'intimate' | 'profound';
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  achievedAt?: Date;
  
  category: 'intimacy' | 'validation' | 'building' | 'funding' | 'launch';
  
  celebration: {
    message: {
      darija: string;
      french: string;
    };
    badge?: string; // Badge icon
    shareWorthy: boolean; // Should encourage sharing?
  };
  
  nextMilestone?: string; // What's next
}

export interface CoachingMessage {
  timing: 'immediate' | 'daily' | 'weekly' | 'milestone';
  
  message: {
    darija: string;
    french: string;
    tone: 'motivating' | 'challenging' | 'celebrating' | 'reflective';
  };
  
  action?: {
    type: 'complete_section' | 'collect_receipts' | 'refine' | 'connect' | 'reflect';
    description: string;
  };
  
  // Locke wisdom
  philosophicalNote?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currentIdeaId?: string;
}

export interface IdeaWithDetails {
  id: string;
  createdAt: Date;
  intimacyScore?: number;
  totalScore?: number;
  receipts?: any[];
  revisions?: any[];
  marginNotes?: any[];
}

interface ClaudeAPI {
  complete(params: any): Promise<any>;
}

// ==================== MAIN CLASS ====================

export class CoachAgent {
  private claudeAPI?: ClaudeAPI;
  
  constructor(claudeAPI?: ClaudeAPI) {
    this.claudeAPI = claudeAPI;
  }

  // ==================== TRACK JOURNEY ====================

  /**
   * Track complete entrepreneurial journey for a user
   */
  async trackJourney(userId: string, ideaId: string, mockIdea?: IdeaWithDetails): Promise<Journey> {
    // Use mock data for testing if provided
    const idea = mockIdea || await this.getIdea(ideaId);
    
    // Calculate stats
    const stats = {
      daysActive: this.calculateDaysActive(idea.createdAt),
      revisionsCount: idea.revisions?.length || 0,
      receiptsCollected: idea.receipts?.length || 0,
      conversationsHad: idea.receipts?.length || 0, // Each receipt = conversation
      marginNotesWritten: idea.marginNotes?.length || 0,
      documentsGenerated: 0 // Would query from DB
    };
    
    // Get milestones
    const milestones = await this.getMilestones(idea, stats);
    
    // Determine current phase
    const currentPhase = this.determinePhase(idea, stats);
    
    // Track intimacy evolution
    const intimacyEvolution = this.getIntimacyEvolution(idea);
    
    // Assess thinking depth
    const thinkingDepth = this.assessThinkingDepth(stats, idea.intimacyScore || 0);
    
    return {
      userId,
      ideaId,
      startedAt: idea.createdAt,
      milestones,
      currentPhase,
      stats,
      intimacyEvolution,
      thinkingDepth
    };
  }

  // ==================== GET MILESTONES ====================

  /**
   * Get all milestones with achievement status
   */
  private async getMilestones(idea: IdeaWithDetails, stats: any): Promise<Milestone[]> {
    const allMilestones: Milestone[] = [
      // INTIMACY MILESTONES (Locke-inspired)
      {
        id: 'first_margin_note',
        name: 'First Pencil Mark',
        description: 'Wrote your first margin note (Locke\'s method)',
        achievedAt: stats.marginNotesWritten >= 1 ? new Date() : undefined,
        category: 'intimacy',
        celebration: {
          message: {
            darija: '✏️ Awl "pencil mark" dyalk! Locke kan ghadi ykoun فخور.',
            french: '✏️ Votre première "marque de crayon"! Locke serait fier.'
          },
          badge: '✏️',
          shareWorthy: false
        },
        nextMilestone: 'five_margin_notes'
      },
      
      {
        id: 'five_margin_notes',
        name: 'Thinker',
        description: 'Wrote 5+ margin notes showing deep reflection',
        achievedAt: stats.marginNotesWritten >= 5 ? new Date() : undefined,
        category: 'intimacy',
        celebration: {
          message: {
            darija: '🧠 5 margin notes! Nta kay-تفكر fash kat-ktab. Locke: "Thinking makes what we read ours."',
            french: '🧠 5 notes de réflexion! Vous PENSEZ pendant que vous écrivez. Locke: "La pensée rend nôtre ce que nous lisons."'
          },
          badge: '🧠',
          shareWorthy: false
        },
        nextMilestone: 'true_knowing'
      },
      
      {
        id: 'true_knowing',
        name: 'True Knowing',
        description: 'Achieved intimacy score ≥ 7/10 (Locke\'s standard)',
        achievedAt: (idea.intimacyScore || 0) >= 7 ? new Date() : undefined,
        category: 'intimacy',
        celebration: {
          message: {
            darija: `🏆 TRUE KNOWING atteint! ${idea.intimacyScore}/10 intimité!\n\nLocke: Nta daba ma-ka-t3rafش ghi "3la" had l-mochkil. Nta KAT-3RAF had l-mochkil b-sa77!`,
            french: `🏆 VRAIE CONNAISSANCE atteinte! ${idea.intimacyScore}/10 d'intimité!\n\nLocke: Vous ne "savez plus DE" ce problème. Vous le CONNAISSEZ vraiment!`
          },
          badge: '🏆',
          shareWorthy: true
        },
        nextMilestone: 'profound_understanding'
      },
      
      // VALIDATION MILESTONES
      {
        id: 'first_receipt',
        name: 'First Validation',
        description: 'Collected your first 3-DH receipt',
        achievedAt: stats.receiptsCollected >= 1 ? new Date() : undefined,
        category: 'validation',
        celebration: {
          message: {
            darija: '💰 Awl reçu! Shi wa7ed خلص 3 DH bach y-valider idea dyalek!\n\nHadchi machi كلام. Hadchi PROOF réel!',
            french: '💰 Premier reçu! Quelqu\'un a payé 3 DH pour valider votre idée!\n\nCe n\'est pas de la théorie. C\'est une PREUVE réelle!'
          },
          badge: '💰',
          shareWorthy: true
        },
        nextMilestone: '10_receipts'
      },
      
      {
        id: '10_receipts',
        name: 'Initial Validation',
        description: '10 receipts = initial market validation',
        achievedAt: stats.receiptsCollected >= 10 ? new Date() : undefined,
        category: 'validation',
        celebration: {
          message: {
            darija: '🎯 10 reçus! Initial validation (3/5 score)!\n\nNta daba من بين 20% top dial les idées. Kamel l-momentum!',
            french: '🎯 10 reçus! Validation initiale (3/5)!\n\nVous êtes dans le top 20% des idées. Gardez le momentum!'
          },
          badge: '🎯',
          shareWorthy: true
        },
        nextMilestone: '50_receipts'
      },
      
      {
        id: '50_receipts',
        name: 'Strong Validation',
        description: '50 receipts = strong market validation (4/5)',
        achievedAt: stats.receiptsCollected >= 50 ? new Date() : undefined,
        category: 'validation',
        celebration: {
          message: {
            darija: '🚀 50 reçus! Strong validation (4/5)!\n\n50 conversations = 50 perspectives. Had l-mochkil wlla DYAK b-sa77!',
            french: '🚀 50 reçus! Validation forte (4/5)!\n\n50 conversations = 50 perspectives. Ce problème est vraiment VÔTRE!'
          },
          badge: '🚀',
          shareWorthy: true
        },
        nextMilestone: 'market_proven'
      },
      
      {
        id: 'market_proven',
        name: 'Market Proven',
        description: '200+ receipts = market proven (5/5)',
        achievedAt: stats.receiptsCollected >= 200 ? new Date() : undefined,
        category: 'validation',
        celebration: {
          message: {
            darija: '🌟 LEGENDARY! 200+ reçus = Market Proven (5/5)!\n\nTop 1%! Les investisseurs ghadi y-tbattaw 3lik!',
            french: '🌟 LÉGENDAIRE! 200+ reçus = Marché prouvé (5/5)!\n\nTop 1%! Les investisseurs vont se battre pour vous!'
          },
          badge: '🌟',
          shareWorthy: true
        }
      },
      
      // BUILDING MILESTONES
      {
        id: 'first_revision',
        name: 'Refinement Begins',
        description: 'Made your first revision (iterative thinking)',
        achievedAt: stats.revisionsCount >= 1 ? new Date() : undefined,
        category: 'building',
        celebration: {
          message: {
            darija: '🔄 Awl révision! Kay-t7assan w kay-تفكر.\n\nLocke: Had l-iteration process = la pensée en action.',
            french: '🔄 Première révision! Vous améliorez et réfléchissez.\n\nLocke: Ce processus d\'itération = la pensée en action.'
          },
          badge: '🔄',
          shareWorthy: false
        }
      },
      
      // FUNDING MILESTONES
      {
        id: 'qualified',
        name: 'Qualified for Funding',
        description: 'Score ≥25/50 = eligible for Intilaka',
        achievedAt: (idea.totalScore || 0) >= 25 ? new Date() : undefined,
        category: 'funding',
        celebration: {
          message: {
            darija: `✅ QUALIFIÉ pour Intilaka!\n\n${idea.totalScore}/50 score. Eligible for funding. Kamel l-documents w apply!`,
            french: `✅ QUALIFIÉ pour Intilaka!\n\n${idea.totalScore}/50 score. Éligible au financement. Complétez les documents et postulez!`
          },
          badge: '✅',
          shareWorthy: true
        },
        nextMilestone: 'exceptional'
      },
      
      {
        id: 'exceptional',
        name: 'Exceptional Idea',
        description: 'Score ≥32/50 = exceptional (top 5%)',
        achievedAt: (idea.totalScore || 0) >= 32 ? new Date() : undefined,
        category: 'funding',
        celebration: {
          message: {
            darija: `🏆 EXCEPTIONAL! ${idea.totalScore}/50 = Top 5%!\n\nFinancement شبه مضمون. Nta mn l-meilleurs!`,
            french: `🏆 EXCEPTIONNEL! ${idea.totalScore}/50 = Top 5%!\n\nFinancement quasi-garanti. Vous êtes parmi les meilleurs!`
          },
          badge: '🏆',
          shareWorthy: true
        }
      }
    ];
    
    return allMilestones;
  }

  // ==================== PROVIDE DAILY COACHING ====================

  /**
   * Provide daily personalized coaching message
   */
  async provideDailyCoaching(userId: string, userName: string, journey: Journey): Promise<CoachingMessage | null> {
    // No activity recently? Motivate
    const daysSinceActivity = this.daysSinceLastActivity(journey);
    
    if (daysSinceActivity > 3) {
      return {
        timing: 'daily',
        message: {
          darija: `Salam ${userName}! ${daysSinceActivity} ayam ma-khdamtish على idea dyalek.\n\nLocke gal: "Reading without thinking is useless."\nWorking without consistency يبقى صعب.\n\nKhdم 15 minutes lyouma. Zid واحد margin note. Hder m3a واحد user.\n\nSmall steps = big progress! 💪`,
          french: `Salut ${userName}! ${daysSinceActivity} jours sans activité sur votre idée.\n\nLocke a dit: "Lire sans penser est inutile."\nTravailler sans constance reste difficile.\n\nTravaillez 15 minutes aujourd'hui. Ajoutez une note de réflexion. Parlez à un utilisateur.\n\nPetits pas = grands progrès! 💪`,
          tone: 'motivating'
        },
        action: {
          type: 'reflect',
          description: 'Add 1 margin note today'
        }
      };
    }
    
    // Close to milestone? Encourage
    const nextMilestone = journey.milestones.find(m => !m.achievedAt);
    if (nextMilestone && this.isCloseTo(journey, nextMilestone)) {
      const distance = this.distanceToMilestone(journey, nextMilestone);
      
      return {
        timing: 'daily',
        message: {
          darija: `🎯 Qrib من milestone: "${nextMilestone.name}"!\n\n${distance}\n\nKhdم شوية lyouma w nwaslو!`,
          french: `🎯 Proche du milestone: "${nextMilestone.name}"!\n\n${distance}\n\nTravaillez un peu aujourd'hui et atteignez-le!`,
          tone: 'motivating'
        },
        action: {
          type: this.getMilestoneAction(nextMilestone),
          description: nextMilestone.description
        }
      };
    }
    
    // Weekly reflection (Locke-style)
    if (this.isWeeklyReflectionTime()) {
      return {
        timing: 'weekly',
        message: {
          darija: `📝 Weekly Reflection Time (Locke's method)\n\nKtoub شوية على:\n\n1. Ash t3alamt had simana?\n2. Ash تغير في فهمك للمشكل؟\n3. Shkoun nouvelles personnes hdarti m3ahom?\n\nLa réflexion = la clé de l'intimité profonde.`,
          french: `📝 Temps de réflexion hebdomadaire (méthode Locke)\n\nÉcrivez quelques lignes sur:\n\n1. Qu'avez-vous appris cette semaine?\n2. Comment votre compréhension du problème a-t-elle changé?\n3. Avec qui avez-vous eu des conversations nouvelles?\n\nLa réflexion = clé de l'intimité profonde.`,
          tone: 'reflective'
        },
        philosophicalNote: `John Locke passait ses dimanches à relire ses notes de la semaine.

Pas pour mémoriser - pour DIGÉRER.

Pour faire des connexions.
Pour transformer "materials of knowledge" en "true knowing".

Faites de même aujourd'hui. 📚`
      };
    }
    
    return null; // No coaching needed today
  }

  // ==================== CELEBRATE MILESTONE ====================

  /**
   * Generate celebration for achieved milestone
   */
  async celebrateMilestone(milestone: Milestone, userName: string): Promise<{
    notification: {
      title: string;
      message: string;
      badge: string;
    };
    sharePrompt?: {
      message: string;
      platforms: string[];
    };
  }> {
    const notification = {
      title: `🎉 Milestone: ${milestone.name}`,
      message: milestone.celebration.message.french,
      badge: milestone.celebration.badge || '🎉'
    };
    
    let sharePrompt;
    if (milestone.celebration.shareWorthy) {
      sharePrompt = {
        message: `Je viens d'atteindre un milestone important sur Fikra Valley: ${milestone.name}! 🎉\n\n${milestone.description}\n\n#FikraValley #EntrepreneurshipMaroc`,
        platforms: ['linkedin', 'twitter', 'facebook']
      };
    }
    
    return {
      notification,
      sharePrompt
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate days since idea creation
   */
  private calculateDaysActive(startDate: Date): number {
    return Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine current phase of journey
   */
  private determinePhase(idea: IdeaWithDetails, stats: any): Journey['currentPhase'] {
    const totalScore = idea.totalScore || 0;
    
    if (totalScore >= 32) return 'growth';
    if (totalScore >= 25) return 'building';
    if (stats.receiptsCollected >= 10) return 'validation';
    return 'ideation';
  }

  /**
   * Get intimacy evolution over time
   */
  private getIntimacyEvolution(idea: IdeaWithDetails): Journey['intimacyEvolution'] {
    // Simplified - in real app, would query snapshots from DB
    const currentScore = idea.intimacyScore || 0;
    const daysAgo = Math.floor((Date.now() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simulate evolution
    return Array.from({ length: Math.min(daysAgo, 30) }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
      score: Math.min(currentScore, (currentScore / 30) * (i + 1))
    }));
  }

  /**
   * Assess thinking depth (Locke's metric)
   */
  private assessThinkingDepth(stats: any, intimacyScore: number): Journey['thinkingDepth'] {
    const signals = [
      stats.marginNotesWritten >= 5,
      stats.revisionsCount >= 3,
      stats.receiptsCollected >= 10,
      intimacyScore >= 7
    ].filter(Boolean).length;
    
    if (signals >= 4) return 'profound';
    if (signals === 3) return 'intimate';
    if (signals === 2) return 'developing';
    return 'superficial';
  }

  /**
   * Calculate days since last activity
   */
  private daysSinceLastActivity(journey: Journey): number {
    // Simplified - would check actual last activity timestamp
    return journey.stats.daysActive > 0 ? 0 : 999;
  }

  /**
   * Check if close to achieving milestone
   */
  private isCloseTo(journey: Journey, milestone: Milestone): boolean {
    // Check if within 20% of requirements
    if (milestone.id === '10_receipts') {
      return journey.stats.receiptsCollected >= 7 && journey.stats.receiptsCollected < 10;
    }
    
    if (milestone.id === '50_receipts') {
      return journey.stats.receiptsCollected >= 40 && journey.stats.receiptsCollected < 50;
    }
    
    if (milestone.id === 'five_margin_notes') {
      return journey.stats.marginNotesWritten >= 3 && journey.stats.marginNotesWritten < 5;
    }
    
    return false;
  }

  /**
   * Calculate distance to milestone
   */
  private distanceToMilestone(journey: Journey, milestone: Milestone): string {
    if (milestone.id === '10_receipts') {
      const need = 10 - journey.stats.receiptsCollected;
      return `Plus que ${need} reçus!`;
    }
    
    if (milestone.id === '50_receipts') {
      const need = 50 - journey.stats.receiptsCollected;
      return `Plus que ${need} reçus!`;
    }
    
    if (milestone.id === '200_receipts' || milestone.id === 'market_proven') {
      const need = 200 - journey.stats.receiptsCollected;
      return `Plus que ${need} reçus!`;
    }
    
    if (milestone.id === 'five_margin_notes') {
      const need = 5 - journey.stats.marginNotesWritten;
      return `Plus que ${need} notes de réflexion!`;
    }
    
    if (milestone.id === 'true_knowing') {
      return 'Continuez à approfondir votre compréhension!';
    }
    
    return 'Presque là!';
  }

  /**
   * Get action type for milestone
   */
  private getMilestoneAction(milestone: Milestone): 'complete_section' | 'collect_receipts' | 'refine' | 'connect' | 'reflect' {
    if (milestone.category === 'validation') return 'collect_receipts';
    if (milestone.category === 'intimacy') return 'reflect';
    if (milestone.category === 'building') return 'refine';
    return 'complete_section';
  }

  /**
   * Check if it's weekly reflection time
   */
  private isWeeklyReflectionTime(): boolean {
    const now = new Date();
    // Sunday evening (18:00-23:59)
    return now.getDay() === 0 && now.getHours() >= 18;
  }

  /**
   * Get idea data (mock for testing)
   */
  private async getIdea(ideaId: string): Promise<IdeaWithDetails> {
    // Mock implementation - would query database in production
    return {
      id: ideaId,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      intimacyScore: 7.5,
      totalScore: 28,
      receipts: [],
      revisions: [],
      marginNotes: []
    };
  }
}

// Export everything
export default CoachAgent;

