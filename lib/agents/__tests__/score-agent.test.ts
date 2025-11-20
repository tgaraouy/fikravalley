/**
 * SCORE AGENT TESTS
 * 
 * Tests all aspects of the SCORE agent including:
 * - Clarity scoring (problem, as-is, benefits, operations)
 * - Decision scoring (alignment, feasibility, differentiation, demand)
 * - Intimacy scoring (Locke's metric)
 * - Gap identification and prioritization
 * - Qualification tier determination
 * - Real-time score calculation
 */

import { describe, expect, test, beforeEach } from '@jest/globals';
import ScoreAgent, {
  type IdeaStatement,
  type LiveScore,
  type ClarityBreakdown,
  type IntimacyBreakdown,
  type QualificationTier
} from '../score-agent';

describe('SCORE Agent - Clarity Scoring', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 1: Empty problem → Score 0', () => {
    test('should return zero score for empty problem', async () => {
      const idea: Partial<IdeaStatement> = {};
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.current.clarity).toBe(0);
      expect(score.breakdown.clarity.problemStatement.score).toBe(0);
      expect(score.breakdown.clarity.problemStatement.missing.length).toBeGreaterThan(0);
    });
  });

  describe('Test Case 2: Vague problem → Low score', () => {
    test('should give low score for vague problem', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les gens ont des problèmes avec la technologie"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.current.clarity).toBeLessThan(3);
      expect(score.breakdown.clarity.problemStatement.completed).toBe(false);
      expect(score.breakdown.clarity.problemStatement.missing.length).toBeGreaterThan(3);
    });
  });

  describe('Test Case 3: Complete problem → High score', () => {
    test('should give high score for complete problem', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: `Les infirmières du CHU Ibn Sina cherchent du matériel médical 6-8 fois par shift.
                       Actuellement, elles appellent 3-4 services par téléphone mais personne ne répond.
                       Cela retarde les soins pour 2,500 patients par jour.`
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.current.clarity).toBeGreaterThan(1.5); // Should be around 2.0-2.5
      expect(score.breakdown.clarity.problemStatement.score).toBeGreaterThan(7);
      expect(score.breakdown.clarity.problemStatement.completed).toBe(true);
    });
  });

  describe('Test Case 4: All clarity sections complete', () => {
    test('should calculate total clarity score correctly', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les infirmières du CHU Ibn Sina cherchent matériel 6-8 fois/shift. Actuellement téléphone. Personne ne répond. 2500 patients affectés."
        },
        asIs: {
          description: "D'abord chercher dans armoire (10 min). Ensuite appeler services (15 min). Coût: 2 heures perdues par jour. Frustrant."
        },
        benefits: {
          description: "Économie de 2 heures par shift. Réduction coût de 500 DH/mois. Impact sur 450 infirmières. Amélioration 50%."
        },
        operations: {
          description: "Équipe de 3 personnes. Budget 50000 DH. Timeline: 6 mois. Ressources: serveur cloud."
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.current.clarity).toBeGreaterThan(7); // Should be around 8-10
      expect(score.breakdown.clarity.problemStatement.completed).toBe(true);
      expect(score.breakdown.clarity.asIsAnalysis.completed).toBe(true);
      expect(score.breakdown.clarity.benefitsStatement.completed).toBe(true);
      expect(score.breakdown.clarity.operationsNeeds.completed).toBe(true);
    });
  });
});

describe('SCORE Agent - Intimacy Scoring (Locke)', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 5: No intimacy markers → Low score', () => {
    test('should detect lack of intimacy', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les infirmières ont des problèmes avec le matériel"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.current.intimacy).toBeLessThan(3);
      expect(score.breakdown.intimacy.verdict).toBe('knowing_of');
      expect(score.breakdown.intimacy.livedExperience.detected).toBe(false);
    });
  });

  describe('Test Case 6: Personal experience detected → Higher intimacy', () => {
    test('should detect and score personal experience', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Hier, j'ai passé 4 heures au CHU Ibn Sina à chercher un défibrillateur. Les infirmières vivent ce problème 6-8 fois par shift."
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.breakdown.intimacy.livedExperience.detected).toBe(true);
      expect(score.breakdown.intimacy.livedExperience.score).toBeGreaterThan(0);
      expect(score.breakdown.intimacy.livedExperience.evidence.length).toBeGreaterThan(0);
      expect(score.current.intimacy).toBeGreaterThan(3);
    });
  });

  describe('Test Case 7: With receipts → Conversation count bonus', () => {
    test('should count conversations from receipts', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Problem description"
        },
        receipts: Array(50).fill({ id: 'test', amount: 3 })
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.breakdown.intimacy.conversationCount.count).toBe(50);
      expect(score.breakdown.intimacy.conversationCount.score).toBeGreaterThan(1);
      expect(score.current.intimacy).toBeGreaterThan(1);
    });
  });

  describe('Test Case 8: With margin notes and revisions → Iteration bonus', () => {
    test('should score thinking depth from iterations', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Problem"
        },
        marginNotes: [
          { timestamp: new Date(), note: "Note 1" },
          { timestamp: new Date(), note: "Note 2" },
          { timestamp: new Date(), note: "Note 3" },
          { timestamp: new Date(), note: "Note 4" },
          { timestamp: new Date(), note: "Note 5" }
        ],
        revisions: [
          { timestamp: new Date(), content: "V1" },
          { timestamp: new Date(), content: "V2" },
          { timestamp: new Date(), content: "V3" }
        ]
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.marginNoteCount).toBe(5);
      expect(score.revisionCount).toBe(3);
      expect(score.breakdown.intimacy.iterationDepth.score).toBeGreaterThan(0);
    });
  });

  describe('Test Case 9: Specificity markers → Better intimacy', () => {
    test('should detect specificity (names, numbers, locations)', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Au CHU Ibn Sina, les infirmières cherchent 6-8 fois par jour, perdant 2 heures."
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.breakdown.intimacy.specificityLevel.hasNames).toBe(true);
      expect(score.breakdown.intimacy.specificityLevel.hasNumbers).toBe(true);
      expect(score.breakdown.intimacy.specificityLevel.hasLocations).toBe(true);
      expect(score.breakdown.intimacy.specificityLevel.score).toBeGreaterThan(1.5);
    });
  });

  describe('Test Case 10: Perfect intimacy → "true_knowing"', () => {
    test('should achieve true knowing verdict', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Hier, j'ai passé 4 heures au CHU Ibn Sina avec l'infirmière Fatima. Elle m'a raconté qu'ils cherchent du matériel 6-8 fois par shift."
        },
        receipts: Array(100).fill({ id: 'test', amount: 3 }),
        marginNotes: Array(10).fill({ timestamp: new Date(), note: "Reflection" }),
        revisions: Array(5).fill({ timestamp: new Date(), content: "Version" })
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.current.intimacy).toBeGreaterThanOrEqual(7);
      expect(score.breakdown.intimacy.verdict).toBe('true_knowing');
      expect(score.thinkingQuality).toMatch(/intimate|profound/);
    });
  });
});

describe('SCORE Agent - Gap Identification', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 11: Identifies missing elements', () => {
    test('should identify all clarity gaps', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les gens ont un problème"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.gaps.length).toBeGreaterThan(0);
      
      // Should have clarity gaps
      const clarityGaps = score.gaps.filter(g => g.section === 'clarity');
      expect(clarityGaps.length).toBeGreaterThan(0);
      
      // Should have intimacy gaps
      const intimacyGaps = score.gaps.filter(g => g.section === 'intimacy');
      expect(intimacyGaps.length).toBeGreaterThan(0);
    });
  });

  describe('Test Case 12: Prioritizes gaps correctly', () => {
    test('should sort gaps by priority', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Some vague problem"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      // Gaps should be sorted by priority (descending)
      for (let i = 0; i < score.gaps.length - 1; i++) {
        expect(score.gaps[i].priority).toBeGreaterThanOrEqual(score.gaps[i + 1].priority);
      }
      
      // Highest priority gap should be the nextBestAction
      expect(score.nextBestAction).toEqual(score.gaps[0]);
    });
  });

  describe('Test Case 13: Lived experience is highest priority', () => {
    test('should prioritize lived experience gap', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les infirmières ont un problème"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      const livedExpGap = score.gaps.find(g => g.field.includes('Expérience vécue'));
      expect(livedExpGap).toBeDefined();
      expect(livedExpGap!.priority).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Test Case 14: Gap actions are actionable', () => {
    test('should provide concrete actions for each gap', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Problem"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      score.gaps.forEach(gap => {
        expect(gap.action.french).toBeDefined();
        expect(gap.action.darija).toBeDefined();
        expect(gap.action.french.length).toBeGreaterThan(0);
        expect(gap.why).toBeDefined();
      });
    });
  });
});

describe('SCORE Agent - Qualification Tiers', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 15: Unqualified tier', () => {
    test('should classify low scores as unqualified', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Vague problem"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.qualification.tier).toBe('unqualified');
      expect(score.qualification.intilaqaEligible).toBe(false);
      expect(score.qualification.intilaqaProbability).toBeLessThan(10);
    });
  });

  describe('Test Case 16: Developing tier', () => {
    test('should classify moderate scores as developing', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les infirmières du CHU cherchent matériel. Fréquence quotidienne. Solution actuelle: téléphone."
        },
        receipts: Array(5).fill({ id: 'test', amount: 3 })
      };
      
      const score = await agent.calculateLiveScore(idea);

      // With this setup, should be at least developing
      expect(['developing', 'promising', 'qualified', 'exceptional']).toContain(score.qualification.tier);
    });
  });

  describe('Test Case 17: Qualified tier', () => {
    test('should classify good scores as qualified', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Hier, j'ai vu au CHU Ibn Sina les infirmières chercher matériel 6-8 fois/shift. Actuellement téléphone mais personne répond. 2500 patients affectés."
        },
        asIs: {
          description: "Processus actuel: chercher 10 min, appeler 15 min. Coût 2h/jour. Très frustrant."
        },
        benefits: {
          description: "Économie 2h/shift. Réduction 500 DH/mois. Impact 450 personnes. Amélioration 50%."
        },
        operations: {
          description: "Équipe 3 personnes. Budget 50000 DH. Timeline 6 mois. Infrastructure cloud."
        },
        receipts: Array(60).fill({ id: 'test', amount: 3 }),
        marginNotes: Array(8).fill({ timestamp: new Date(), note: "Note" })
      };
      
      const score = await agent.calculateLiveScore(idea);

      // Should achieve qualified or exceptional
      expect(['qualified', 'exceptional']).toContain(score.qualification.tier);
      expect(score.qualification.intilaqaEligible).toBe(true);
    });
  });

  describe('Test Case 18: High score but low intimacy warning', () => {
    test('should warn about low intimacy despite good clarity', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les infirmières du CHU Ibn Sina cherchent du matériel médical 6-8 fois par shift de 8 heures. Le processus actuel implique des appels téléphoniques à 3-4 services différents, mais personne ne répond car tout le monde est occupé. Cela retarde les soins pour environ 2,500 patients par jour. Les bénéficiaires sont les 450 infirmières et tous les patients."
        },
        asIs: {
          description: "Actuellement, le processus prend environ 25 minutes en moyenne. D'abord recherche dans les armoires (10 minutes), puis appels téléphoniques (15 minutes). Le coût en temps perdu est d'environ 2 heures par jour pour l'ensemble du service. C'est très frustrant et pénible."
        },
        benefits: {
          description: "Gain de temps: 2 heures par shift économisées. Économie de coût: environ 500 DH par mois. Impact sur 450 infirmières. Amélioration de l'efficacité d'environ 50%. Réduction du stress."
        },
        operations: {
          description: "Équipe nécessaire: 3 personnes (1 chef de projet, 1 développeur, 1 infirmière référente). Budget estimé: 50,000 DH. Timeline: 6 mois pour déploiement complet. Ressources: serveur cloud, smartphones, formation."
        }
        // NO receipts, NO margin notes, NO lived experience
      };
      
      const score = await agent.calculateLiveScore(idea);

      // Should have decent clarity but low intimacy
      expect(score.current.clarity).toBeGreaterThan(5);
      expect(score.current.intimacy).toBeLessThan(5);
      
      // Should be flagged
      expect(score.qualification.message.french).toContain('intimité');
    });
  });
});

describe('SCORE Agent - Real-Time Updates', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 19: Score improves as content is added', () => {
    test('should show score progression', async () => {
      const iterations = [
        { problem: { description: "Problem" } },
        { problem: { description: "Les infirmières ont un problème" } },
        { problem: { description: "Les infirmières du CHU ont un problème quotidien" } },
        { problem: { description: "Les infirmières du CHU Ibn Sina cherchent matériel 6 fois/jour" } }
      ];
      
      const scores: number[] = [];
      
      for (const idea of iterations) {
        const score = await agent.calculateLiveScore(idea);
        scores.push(score.current.total);
      }
      
      // Scores should generally increase
      expect(scores[3]).toBeGreaterThan(scores[0]);
    });
  });

  describe('Test Case 20: Potential score shows what's possible', () => {
    test('should calculate potential score from gaps', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Vague problem"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.potential.total).toBeGreaterThan(score.current.total);
      expect(score.potential.clarity).toBeGreaterThan(score.current.clarity);
      expect(score.potential.intimacy).toBeGreaterThan(score.current.intimacy);
    });
  });
});

describe('SCORE Agent - Thinking Quality Assessment', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 21: Superficial thinking', () => {
    test('should detect superficial thinking', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Problem description"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.thinkingQuality).toBe('superficial');
    });
  });

  describe('Test Case 22: Profound thinking (Locke's ideal)', () => {
    test('should detect profound thinking', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Hier, j'ai vu au CHU Ibn Sina l'infirmière Fatima chercher pendant 45 minutes. Elle m'a expliqué que ça arrive 6-8 fois par shift."
        },
        receipts: Array(50).fill({ id: 'test', amount: 3 }),
        marginNotes: Array(10).fill({ timestamp: new Date(), note: "Reflection" }),
        revisions: Array(5).fill({ timestamp: new Date(), content: "Version" })
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score.thinkingQuality).toMatch(/intimate|profound/);
    });
  });
});

describe('SCORE Agent - Locke Philosophy Integration', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 23: All explanations reference Locke', () => {
    test('should integrate Locke philosophy in feedback', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Some problem"
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      // Check if Locke is referenced in key messages
      const hasLockeReference = 
        score.breakdown.clarity.problemStatement.explanation.includes('Locke') ||
        score.qualification.message.french.includes('Locke') ||
        score.gaps.some(g => g.intimacyImpact?.includes('Locke') || g.why.includes('Locke'));
      
      expect(hasLockeReference).toBe(true);
    });
  });

  describe('Test Case 24: Intimacy vs clarity distinction', () => {
    test('should measure both intimacy and clarity separately', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Les infirmières du CHU Ibn Sina (très spécifique) cherchent du matériel 6-8 fois par shift (quantifié). Solution actuelle: téléphone. Problème: personne ne répond. Bénéficiaires: 450 infirmières."
        }
        // Good clarity but no lived experience
      };
      
      const score = await agent.calculateLiveScore(idea);

      // Should have decent clarity
      expect(score.current.clarity).toBeGreaterThan(1.5);
      
      // But low intimacy (no personal experience, no conversations)
      expect(score.current.intimacy).toBeLessThan(4);
      
      // They are measured independently
      expect(score.current.clarity).not.toEqual(score.current.intimacy);
    });
  });
});

describe('SCORE Agent - Edge Cases', () => {
  let agent: ScoreAgent;

  beforeEach(() => {
    agent = new ScoreAgent();
  });

  describe('Test Case 25: Handles undefined/null fields', () => {
    test('should not crash with missing fields', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: undefined,
        asIs: undefined,
        benefits: undefined
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score).toBeDefined();
      expect(score.current.total).toBe(0);
    });
  });

  describe('Test Case 26: Handles very long text', () => {
    test('should process long descriptions', async () => {
      const longDescription = "Les infirmières du CHU Ibn Sina ".repeat(100);
      
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: longDescription
        }
      };
      
      const score = await agent.calculateLiveScore(idea);

      expect(score).toBeDefined();
      expect(score.current.clarity).toBeGreaterThan(0);
    });
  });

  describe('Test Case 27: Handles many receipts', () => {
    test('should cap conversation score at maximum', async () => {
      const idea: Partial<IdeaStatement> = {
        problem: {
          description: "Problem"
        },
        receipts: Array(1000).fill({ id: 'test', amount: 3 })
      };
      
      const score = await agent.calculateLiveScore(idea);

      // Should cap at 3 points for conversation count
      expect(score.breakdown.intimacy.conversationCount.score).toBeLessThanOrEqual(3);
      // But intimacy total can still be high from other factors
      expect(score.current.intimacy).toBeGreaterThan(0);
    });
  });
});

