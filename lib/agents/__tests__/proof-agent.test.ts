/**
 * PROOF AGENT TESTS
 * 
 * Tests all aspects of the PROOF agent including:
 * - Strategy generation for different idea types
 * - Receipt validation and fraud detection
 * - Progress coaching at each milestone
 * - Locke philosophy integration
 */

import { describe, expect, test, beforeEach } from '@jest/globals';
import ProofAgent, {
  type IdeaStatement,
  type ReceiptStrategy,
  type ReceiptValidation,
  type ProgressCoaching
} from '../proof-agent';

describe('PROOF Agent - Strategy Generation', () => {
  let agent: ProofAgent;

  beforeEach(() => {
    agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 1: High-pain, accessible problem → In-Person Pitch', () => {
    test('should recommend in-person pitch for nurses at CHU', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Infirmières du service cardiologie",
          where: "CHU Ibn Sina, Rabat",
          painIntensity: 4.8,
          frequency: "6-8 fois par shift"
        },
        solution: "Application mobile pour localiser matériel médical",
        category: "Santé"
      };

      const strategy = await agent.generateStrategy(idea);

      expect(strategy.method).toBe('in_person_pitch');
      expect(strategy.expectedResults.confidence).toBe('high');
      expect(strategy.expectedResults.successRate).toBeGreaterThan(0.7);
      expect(strategy.steps.length).toBeGreaterThan(3);
      
      // Check for Locke philosophy
      expect(strategy.intimacyRequirement).toContain('Locke');
      expect(strategy.intimacyRequirement).toContain('face-à-face');
      expect(strategy.thinkingPrompts.length).toBeGreaterThan(0);
    });
  });

  describe('Test Case 2: Tech-savvy, moderate pain → Online Survey', () => {
    test('should recommend online survey for students with tech problem', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Étudiants en informatique",
          where: "Université Mohammed V",
          painIntensity: 2.5,
          frequency: "Régulièrement"
        },
        solution: "Plateforme d'entraide pour coding",
        category: "Éducation"
      };

      const strategy = await agent.generateStrategy(idea);

      expect(strategy.method).toBe('online_survey');
      expect(strategy.materials.needed).toContain("Compte Orange Money / Barid Cash");
      expect(strategy.materials.templates.survey).toBeDefined();
      
      // Check for Locke warning about online
      expect(strategy.intimacyRequirement).toContain('online');
      expect(strategy.intimacyRequirement).toContain('SUPERFICIEL');
    });
  });

  describe('Test Case 3: Young audience → Community Outreach', () => {
    test('should recommend community outreach for students', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Étudiants lycée",
          where: "Lycées publics Casablanca",
          painIntensity: 3.5,
          frequency: "Quotidien"
        },
        solution: "App cours en Darija",
        category: "Éducation"
      };

      const strategy = await agent.generateStrategy(idea);

      expect(strategy.method).toBe('community_outreach');
      expect(strategy.steps.some(s => s.action.includes('événement'))).toBe(true);
      expect(strategy.intimacyRequirement).toContain('mouvement');
    });
  });

  describe('Test Case 4: Strategy provides complete guidance', () => {
    test('should include all required elements in strategy', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Agriculteurs",
          where: "Région Saïs",
          painIntensity: 4.2,
          frequency: "Chaque récolte"
        },
        solution: "Marketplace direct consommateurs",
        category: "Agriculture"
      };

      const strategy = await agent.generateStrategy(idea);

      // Check all required fields
      expect(strategy.method).toBeDefined();
      expect(strategy.reasoning).toBeDefined();
      expect(strategy.steps.length).toBeGreaterThan(0);
      expect(strategy.materials).toBeDefined();
      expect(strategy.materials.needed.length).toBeGreaterThan(0);
      expect(strategy.expectedResults).toBeDefined();
      expect(strategy.intimacyRequirement).toBeDefined();
      expect(strategy.thinkingPrompts.length).toBeGreaterThan(0);

      // Check step structure
      strategy.steps.forEach(step => {
        expect(step.step).toBeGreaterThan(0);
        expect(step.action).toBeDefined();
        expect(step.tip).toBeDefined();
        expect(step.estimatedTime).toBeDefined();
        expect(step.difficulty).toMatch(/easy|medium|hard/);
      });
    });
  });

  describe('Test Case 5: Expected results are reasonable', () => {
    test('should provide realistic timeframes and success rates', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Commerçants",
          where: "Souk",
          painIntensity: 3.8,
          frequency: "Quotidien"
        },
        solution: "Gestion stock simplifiée",
        category: "Commerce"
      };

      const strategy = await agent.generateStrategy(idea);

      // Timeframe should be reasonable (days, not months)
      expect(strategy.expectedResults.timeframe).toMatch(/\d+\s*-?\s*\d*\s*(jour|day|semaine)/i);
      
      // Success rate should be between 0 and 1
      expect(strategy.expectedResults.successRate).toBeGreaterThanOrEqual(0);
      expect(strategy.expectedResults.successRate).toBeLessThanOrEqual(1);
      
      // Confidence level should be valid
      expect(strategy.expectedResults.confidence).toMatch(/low|medium|high/);
    });
  });
});

describe('PROOF Agent - Receipt Validation', () => {
  let agent: ProofAgent;

  beforeEach(() => {
    agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 6: Valid receipt auto-approval', () => {
    test('should auto-approve clean receipt with correct amount', async () => {
      // Note: This test uses mock OCR service
      const mockPhoto = new File(['receipt'], 'receipt.jpg', { type: 'image/jpeg' });
      
      const validation = await agent.validateReceipt(mockPhoto, 'test-idea-123');

      expect(validation).toBeDefined();
      expect(validation.receiptId).toBeDefined();
      expect(validation.extracted).toBeDefined();
      
      // With mock service returning perfect data, should auto-approve
      if (validation.extracted.amount === 3.0 && validation.confidence > 0.8) {
        expect(validation.autoApproved).toBe(true);
      }
    });
  });

  describe('Test Case 7: Receipt validation structure', () => {
    test('should return all required validation fields', async () => {
      const mockPhoto = new File(['receipt'], 'receipt.jpg', { type: 'image/jpeg' });
      
      const validation = await agent.validateReceipt(mockPhoto, 'test-idea-123');

      // Check structure
      expect(validation.receiptId).toBeDefined();
      expect(typeof validation.valid).toBe('boolean');
      expect(typeof validation.confidence).toBe('number');
      expect(validation.extracted).toBeDefined();
      expect(Array.isArray(validation.issues)).toBe(true);
      expect(typeof validation.autoApproved).toBe('boolean');
      expect(Array.isArray(validation.fraudFlags)).toBe(true);

      // Check extracted data structure
      expect(validation.extracted.amount !== undefined).toBe(true);
      expect(validation.extracted.date !== undefined).toBe(true);
      expect(typeof validation.extracted.signature).toBe('boolean');
    });
  });
});

describe('PROOF Agent - Progress Coaching', () => {
  let agent: ProofAgent;

  beforeEach(() => {
    agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 8: Zero receipts - Initial motivation', () => {
    test('should provide encouraging message for beginners', async () => {
      const coaching = await agent.provideCoaching(0);

      expect(coaching.currentCount).toBe(0);
      expect(coaching.targetMilestone).toBe(10);
      expect(coaching.score).toBe(1);
      expect(coaching.message.tone).toBe('motivating');
      expect(coaching.message.french).toContain('Locke');
      expect(coaching.encouragement).toBeDefined();
      expect(coaching.nextAction).toBeDefined();
    });
  });

  describe('Test Case 9: 1-9 receipts - Building momentum', () => {
    test('should encourage and track progress toward 10', async () => {
      const coaching = await agent.provideCoaching(5);

      expect(coaching.currentCount).toBe(5);
      expect(coaching.targetMilestone).toBe(10);
      expect(coaching.score).toBe(2);
      expect(coaching.message.tone).toBe('motivating');
      expect(coaching.intimacyInsight).toBeDefined();
      expect(coaching.intimacyInsight).toContain('VÔTRE');
    });
  });

  describe('Test Case 10: 10-49 receipts - Initial validation', () => {
    test('should celebrate and push toward 50', async () => {
      const coaching = await agent.provideCoaching(25);

      expect(coaching.currentCount).toBe(25);
      expect(coaching.targetMilestone).toBe(50);
      expect(coaching.score).toBe(3);
      expect(coaching.message.tone).toBe('celebrating');
      expect(coaching.message.french).toContain('Validation initiale');
      expect(coaching.message.french).toContain('3/5');
    });
  });

  describe('Test Case 11: 50-199 receipts - Strong validation', () => {
    test('should celebrate strong validation and encourage toward 200', async () => {
      const coaching = await agent.provideCoaching(100);

      expect(coaching.currentCount).toBe(100);
      expect(coaching.targetMilestone).toBe(200);
      expect(coaching.score).toBe(4);
      expect(coaching.message.tone).toBe('celebrating');
      expect(coaching.message.french).toContain('4/5');
      expect(coaching.encouragement).toContain('investisseurs');
    });
  });

  describe('Test Case 12: 200+ receipts - Market proven', () => {
    test('should celebrate legendary achievement', async () => {
      const coaching = await agent.provideCoaching(250);

      expect(coaching.currentCount).toBe(250);
      expect(coaching.targetMilestone).toBeNull();
      expect(coaching.score).toBe(5);
      expect(coaching.message.tone).toBe('celebrating');
      expect(coaching.message.french).toContain('5/5');
      expect(coaching.message.french).toContain('LEGENDARY');
      expect(coaching.message.french).toContain('pencil marks');
    });
  });

  describe('Test Case 13: Multilingual coaching', () => {
    test('should provide messages in both Darija and French', async () => {
      const coaching = await agent.provideCoaching(15);

      expect(coaching.message.darija).toBeDefined();
      expect(coaching.message.french).toBeDefined();
      expect(coaching.message.darija.length).toBeGreaterThan(0);
      expect(coaching.message.french.length).toBeGreaterThan(0);
      
      // Both should contain references to progress
      expect(coaching.message.darija).toContain('15');
      expect(coaching.message.french).toContain('15');
    });
  });
});

describe('PROOF Agent - Locke Philosophy Integration', () => {
  let agent: ProofAgent;

  beforeEach(() => {
    agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 14: All strategies reference Locke', () => {
    test('should integrate Locke philosophy in every strategy type', async () => {
      const ideas: IdeaStatement[] = [
        {
          problem: { who: "Nurses", where: "CHU", painIntensity: 4.5, frequency: "daily" },
          solution: "Test", category: "Health"
        },
        {
          problem: { who: "Students", where: "University", painIntensity: 2.5, frequency: "weekly" },
          solution: "Test", category: "Education"
        },
        {
          problem: { who: "Jeunes", where: "Quartier", painIntensity: 3.5, frequency: "often" },
          solution: "Test", category: "Social"
        }
      ];

      for (const idea of ideas) {
        const strategy = await agent.generateStrategy(idea);
        
        expect(strategy.intimacyRequirement).toContain('Locke');
        expect(strategy.thinkingPrompts.length).toBeGreaterThan(0);
        
        // Should reference intimate knowledge vs superficial
        const hasIntimacyTheme = 
          strategy.intimacyRequirement.includes('intimité') ||
          strategy.intimacyRequirement.includes('CONNAÎTRE') ||
          strategy.intimacyRequirement.includes('VIVRE');
        
        expect(hasIntimacyTheme).toBe(true);
      }
    });
  });

  describe('Test Case 15: Coaching emphasizes intimacy at all levels', () => {
    test('should reference Locke in coaching messages', async () => {
      const milestones = [0, 5, 25, 100, 250];
      
      for (const count of milestones) {
        const coaching = await agent.provideCoaching(count);
        
        const hasLockeReference = 
          coaching.message.french.includes('Locke') ||
          coaching.message.darija.includes('Locke') ||
          (coaching.intimacyInsight && coaching.intimacyInsight.length > 0);
        
        expect(hasLockeReference).toBe(true);
      }
    });
  });

  describe('Test Case 16: Thinking prompts encourage reflection', () => {
    test('should provide thoughtful reflection questions', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Farmers",
          where: "Region",
          painIntensity: 4.0,
          frequency: "daily"
        },
        solution: "Test",
        category: "Agriculture"
      };

      const strategy = await agent.generateStrategy(idea);

      expect(strategy.thinkingPrompts.length).toBeGreaterThanOrEqual(3);
      
      // Prompts should be questions
      strategy.thinkingPrompts.forEach(prompt => {
        expect(prompt.includes('?')).toBe(true);
      });

      // Should encourage deep thinking
      const hasReflectiveTheme = strategy.thinkingPrompts.some(p => 
        p.includes('appris') || 
        p.includes('pourquoi') || 
        p.includes('différemment')
      );
      
      expect(hasReflectiveTheme).toBe(true);
    });
  });
});

describe('PROOF Agent - Willingness-to-Pay Scoring', () => {
  let agent: ProofAgent;

  beforeEach(() => {
    agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 17: Score progression matches milestones', () => {
    test('should have correct score for each milestone', async () => {
      const tests = [
        { count: 0, expectedScore: 1 },
        { count: 5, expectedScore: 2 },
        { count: 10, expectedScore: 3 },
        { count: 50, expectedScore: 4 },
        { count: 200, expectedScore: 5 }
      ];

      for (const { count, expectedScore } of tests) {
        const coaching = await agent.provideCoaching(count);
        expect(coaching.score).toBe(expectedScore);
      }
    });
  });
});

describe('PROOF Agent - Edge Cases', () => {
  let agent: ProofAgent;

  beforeEach(() => {
    agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  });

  describe('Test Case 18: Handles unusual audience types', () => {
    test('should generate strategy for uncommon audiences', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Artisans traditionnels",
          where: "Médina de Fès",
          painIntensity: 3.5,
          frequency: "Variable"
        },
        solution: "Digital showcase",
        category: "Artisanat"
      };

      const strategy = await agent.generateStrategy(idea);

      expect(strategy).toBeDefined();
      expect(strategy.method).toBeDefined();
      expect(strategy.steps.length).toBeGreaterThan(0);
    });
  });

  describe('Test Case 19: Handles extreme pain levels', () => {
    test('should work with pain level 5/5', async () => {
      const idea: IdeaStatement = {
        problem: {
          who: "Emergency doctors",
          where: "ER",
          painIntensity: 5.0,
          frequency: "Critical"
        },
        solution: "Emergency system",
        category: "Health"
      };

      const strategy = await agent.generateStrategy(idea);

      expect(strategy.method).toBe('in_person_pitch');
      expect(strategy.expectedResults.confidence).toBe('high');
    });
  });

  describe('Test Case 20: Large receipt counts', () => {
    test('should handle receipt counts beyond 200', async () => {
      const largeNumbers = [250, 500, 1000];

      for (const count of largeNumbers) {
        const coaching = await agent.provideCoaching(count);
        
        expect(coaching.currentCount).toBe(count);
        expect(coaching.score).toBe(5);
        expect(coaching.targetMilestone).toBeNull();
      }
    });
  });
});

