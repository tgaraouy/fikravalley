/**
 * FIKRA AGENT TESTS
 * 
 * Tests all aspects of the FIKRA agent including:
 * - Gap detection
 * - Intimacy scoring (Locke's "true knowing")
 * - Different agent modes
 * - Multilingual support
 */

import { describe, expect, test, beforeEach } from '@jest/globals';
import FikraAgent, {
  hasSpecificWho,
  hasFrequency,
  hasLivedExperience,
  hasCurrentSolution,
  hasWhyFails,
  hasBeneficiaries,
  type ProblemDraft,
  type FikraResponse
} from '../fikra-agent';

describe('FIKRA Agent - Helper Functions', () => {
  
  describe('hasSpecificWho', () => {
    test('detects specific WHO with location', () => {
      expect(hasSpecificWho("Les infirmières du CHU Ibn Sina")).toBe(true);
      expect(hasSpecificWho("Les étudiants en 2ème Bac Maths")).toBe(true);
      expect(hasSpecificWho("Les agriculteurs de la région Saïs")).toBe(true);
    });

    test('rejects vague WHO', () => {
      expect(hasSpecificWho("Les gens au Maroc")).toBe(false);
      expect(hasSpecificWho("Les professionnels")).toBe(false);
      expect(hasSpecificWho("Tout le monde")).toBe(false);
    });
  });

  describe('hasFrequency', () => {
    test('detects quantified frequency', () => {
      expect(hasFrequency("6 fois par jour")).toBe(true);
      expect(hasFrequency("chaque jour")).toBe(true);
      expect(hasFrequency("kol nhar")).toBe(true);
      expect(hasFrequency("quotidien")).toBe(true);
      expect(hasFrequency("3 heures par shift")).toBe(true);
    });

    test('rejects vague frequency', () => {
      expect(hasFrequency("souvent")).toBe(false);
      expect(hasFrequency("régulièrement")).toBe(false);
      expect(hasFrequency("de temps en temps")).toBe(false);
    });
  });

  describe('hasLivedExperience', () => {
    test('detects personal experience markers', () => {
      expect(hasLivedExperience("J'ai vu ce problème hier")).toBe(true);
      expect(hasLivedExperience("3andi had l-mochkil")).toBe(true);
      expect(hasLivedExperience("Mon expérience personnelle")).toBe(true);
      expect(hasLivedExperience("La semaine dernière, j'ai vécu")).toBe(true);
    });

    test('rejects second-hand knowledge', () => {
      expect(hasLivedExperience("J'ai lu que les gens ont ce problème")).toBe(false);
      expect(hasLivedExperience("On m'a dit que c'est un problème")).toBe(false);
    });
  });

  describe('hasCurrentSolution', () => {
    test('detects description of current solution', () => {
      expect(hasCurrentSolution("Actuellement, ils utilisent Excel")).toBe(true);
      expect(hasCurrentSolution("Daba kay dirou b telephone")).toBe(true);
      expect(hasCurrentSolution("Pour résoudre, ils appellent")).toBe(true);
    });
  });

  describe('hasWhyFails', () => {
    test('detects explanation of why current solution fails', () => {
      expect(hasWhyFails("ne marche pas parce que")).toBe(true);
      expect(hasWhyFails("ma-kaykhdamsh")).toBe(true);
      expect(hasWhyFails("problème avec la solution")).toBe(true);
    });
  });

  describe('hasBeneficiaries', () => {
    test('detects mention of beneficiaries', () => {
      expect(hasBeneficiaries("ghadi ystafd 500 infirmières")).toBe(true);
      expect(hasBeneficiaries("bénéficie aux patients")).toBe(true);
      expect(hasBeneficiaries("impact direct et indirect")).toBe(true);
    });
  });
});

describe('FIKRA Agent - Main Functionality', () => {
  let agent: FikraAgent;

  beforeEach(() => {
    agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 1: Vague Problem Statement', () => {
    test('should ask for WHO when problem is vague', async () => {
      const draft: ProblemDraft = {
        text: "Les gens ont des problèmes avec la technologie",
        wordCount: 8,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.mode).toBe('questioning');
      expect(response.intimacyScore).toBeLessThan(2);
      expect(response.clarityScore).toBeLessThan(3);
      expect(response.nextQuestion?.gap).toBe('who');
      expect(response.gapsRemaining.length).toBeGreaterThan(3);
    });
  });

  describe('Test Case 2: Specific but no lived experience', () => {
    test('should challenge for personal experience', async () => {
      const draft: ProblemDraft = {
        text: "Les infirmières du CHU Ibn Sina perdent du temps chaque jour à chercher du matériel médical",
        wordCount: 15,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      // Should detect WHO and FREQUENCY but miss LIVED_EXPERIENCE
      expect(response.mode).toBe('questioning');
      expect(response.intimacyScore).toBeLessThanOrEqual(5);
      
      // Should ask about lived experience
      const hasLivedExpGap = response.gapsRemaining.some(g => g.type === 'lived_experience');
      expect(hasLivedExpGap).toBe(true);
    });
  });

  describe('Test Case 3: Perfect intimacy - Locke\'s true knowing', () => {
    test('should celebrate when user demonstrates true knowing', async () => {
      const draft: ProblemDraft = {
        text: `Hier matin, j'ai passé 4 heures au CHU Ibn Sina à chercher un défibrillateur pendant une urgence cardiaque.
        
Les infirmières du service de cardiologie vivent ce problème 6-8 fois par shift de 8 heures. 

Actuellement, elles appellent 3-4 autres services par téléphone, mais souvent personne ne répond car tout le monde est occupé avec les patients. Le cahier papier censé tracer le matériel n'est jamais à jour parce que personne ne prend le temps d'écrire pendant les urgences.

Cette situation met en danger la vie de 2,500 patients par jour qui passent par ce service.`,
        wordCount: 95,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.mode).toBe('celebrating');
      expect(response.intimacyScore).toBeGreaterThanOrEqual(7);
      expect(response.clarityScore).toBeGreaterThanOrEqual(8);
      expect(response.progress).toBe(100);
      expect(response.milestone).toContain("Intimité atteinte");
      expect(response.message.tone).toBe('celebratory');
    });
  });

  describe('Test Case 4: Good clarity but lacking intimacy', () => {
    test('should challenge for deeper intimacy (Locke mode)', async () => {
      const draft: ProblemDraft = {
        text: "Les infirmières du CHU Ibn Sina cherchent du matériel médical plusieurs fois par jour. Elles utilisent un cahier papier qui n'est pas à jour. Cela prend beaucoup de temps et retarde les soins.",
        wordCount: 35,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.mode).toBe('questioning');
      expect(response.clarityScore).toBeGreaterThanOrEqual(4);
      expect(response.intimacyScore).toBeLessThan(5);
      expect(response.message.tone).toBe('curious');
      
      // Should push for lived experience
      expect(response.suggestions).toBeDefined();
      expect(response.suggestions?.some(s => 
        s.includes('personnellement') || s.includes('histoire')
      )).toBe(true);
    });
  });

  describe('Test Case 5: Listening mode for short text', () => {
    test('should encourage when user just started', async () => {
      const draft: ProblemDraft = {
        text: "Les hôpitaux",
        wordCount: 2,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.mode).toBe('listening');
      expect(response.message.tone).toBe('encouraging');
      expect(response.progress).toBe(0);
    });
  });

  describe('Test Case 6: Darija detection and response', () => {
    test('should handle Darija problem statements', async () => {
      const draft: ProblemDraft = {
        text: "3andi mochkil kbir f l-hopital. Kol nhar kay-khassna n9albو 3la matériel médical.",
        wordCount: 12,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.message.darija).toBeDefined();
      expect(response.message.darija.length).toBeGreaterThan(0);
      expect(response.mode).toBe('questioning');
    });
  });

  describe('Test Case 7: Mixed language support', () => {
    test('should provide responses in all supported languages', async () => {
      const draft: ProblemDraft = {
        text: "Les médecins perdent du temps",
        wordCount: 5,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.message.darija).toBeDefined();
      expect(response.message.french).toBeDefined();
      expect(response.nextQuestion?.question.darija).toBeDefined();
      expect(response.nextQuestion?.question.french).toBeDefined();
      expect(response.nextQuestion?.question.arabic).toBeDefined();
    });
  });

  describe('Test Case 8: Intimacy signals detection', () => {
    test('should detect multiple intimacy signals', async () => {
      const draft: ProblemDraft = {
        text: "La semaine dernière au CHU Ibn Sina, j'ai vu l'infirmière Fatima perdre 45 minutes à chercher un défibrillateur. Cela arrive 6 fois par jour dans ce service.",
        wordCount: 30,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      // Should detect:
      // - personal_experience ("j'ai vu")
      // - named_location ("CHU Ibn Sina")
      // - specific_person ("l'infirmière Fatima")
      // - quantified_frequency ("6 fois par jour")
      
      expect(response.intimacyScore).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Test Case 9: Gap progression tracking', () => {
    test('should show progress as gaps are filled', async () => {
      const drafts = [
        {
          text: "Les gens ont un problème",
          expectedProgress: 0
        },
        {
          text: "Les infirmières du CHU ont un problème",
          expectedProgressMin: 10
        },
        {
          text: "Les infirmières du CHU Ibn Sina perdent du temps chaque jour",
          expectedProgressMin: 30
        }
      ];

      for (const draft of drafts) {
        const response = await agent.analyze({
          text: draft.text,
          wordCount: draft.text.split(' ').length,
          lastUpdated: new Date()
        });

        if (draft.expectedProgress !== undefined) {
          expect(response.progress).toBe(draft.expectedProgress);
        } else {
          expect(response.progress).toBeGreaterThanOrEqual(draft.expectedProgressMin || 0);
        }
      }
    });
  });

  describe('Test Case 10: Examples and guidance', () => {
    test('should provide concrete examples when questioning', async () => {
      const draft: ProblemDraft = {
        text: "Les professionnels ont des problèmes",
        wordCount: 5,
        lastUpdated: new Date()
      };

      const response = await agent.analyze(draft);

      expect(response.nextQuestion?.examples).toBeDefined();
      expect(response.nextQuestion?.examples.length).toBeGreaterThan(0);
      expect(response.nextQuestion?.badExamples).toBeDefined();
      expect(response.nextQuestion?.why).toBeDefined();
    });
  });
});

describe('FIKRA Agent - Edge Cases', () => {
  let agent: FikraAgent;

  beforeEach(() => {
    agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  });

  test('should handle empty text', async () => {
    const draft: ProblemDraft = {
      text: "",
      wordCount: 0,
      lastUpdated: new Date()
    };

    const response = await agent.analyze(draft);
    expect(response.mode).toBe('listening');
  });

  test('should handle very long text', async () => {
    const longText = "Les infirmières du CHU Ibn Sina ".repeat(100);
    const draft: ProblemDraft = {
      text: longText,
      wordCount: 500,
      lastUpdated: new Date()
    };

    const response = await agent.analyze(draft);
    expect(response).toBeDefined();
    expect(response.clarityScore).toBeGreaterThan(0);
  });

  test('should handle special characters', async () => {
    const draft: ProblemDraft = {
      text: "Les infirmières ont des problèmes avec l'équipement médical à l'hôpital",
      wordCount: 10,
      lastUpdated: new Date()
    };

    const response = await agent.analyze(draft);
    expect(response).toBeDefined();
  });
});

describe('FIKRA Agent - Locke Philosophy Integration', () => {
  let agent: FikraAgent;

  beforeEach(() => {
    agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  });

  test('should prioritize lived experience over book knowledge', async () => {
    const draftBookKnowledge: ProblemDraft = {
      text: "J'ai lu dans un article que les infirmières du CHU ont des problèmes de gestion du matériel",
      wordCount: 16,
      lastUpdated: new Date()
    };

    const draftLivedExp: ProblemDraft = {
      text: "Hier, j'ai passé 4 heures au CHU à aider une infirmière à chercher du matériel",
      wordCount: 15,
      lastUpdated: new Date()
    };

    const responseBook = await agent.analyze(draftBookKnowledge);
    const responseLived = await agent.analyze(draftLivedExp);

    expect(responseLived.intimacyScore).toBeGreaterThan(responseBook.intimacyScore);
  });

  test('should celebrate true knowing with Locke reference', async () => {
    const draft: ProblemDraft = {
      text: "J'ai personnellement vécu ce problème hier au CHU Ibn Sina. Les infirmières cherchent du matériel 6 fois par jour. J'ai vu l'infirmière Fatima perdre 45 minutes.",
      wordCount: 30,
      lastUpdated: new Date()
    };

    const response = await agent.analyze(draft);

    if (response.mode === 'celebrating') {
      expect(response.message.french).toContain('Locke');
      expect(response.milestone).toContain('Intimité');
    }
  });
});

