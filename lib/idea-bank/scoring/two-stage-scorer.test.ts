/**
 * Tests for Two-Stage Scoring System with Morocco/SDG Hybrid Approach
 */

import { 
  scoreIdeaComplete, 
  autoTagSDGs,
  scoreStrategicFit,
  type IdeaScoringInput 
} from './two-stage-scorer';
import { MOROCCO_PRIORITIES } from './morocco-priorities';

describe('Morocco/SDG Hybrid Scoring', () => {
  
  const baseInput: IdeaScoringInput = {
    problemStatement: 'Test problem statement with sufficient detail to pass clarity checks.',
    asIsAnalysis: 'Current process involves multiple steps and manual work that takes time.',
    benefitStatement: 'This solution will save time and money, improving efficiency significantly.',
    operationalNeeds: 'Requires basic data sources and simple integrations.',
    estimatedCost: '3K',
    roiTimeSavedHours: 40,
    roiCostSavedEur: 500,
    location: 'Casablanca',
    category: 'health',
    frequency: 'daily',
    urgency: 'high',
    dataSources: ['Excel'],
    integrationPoints: ['API'],
  };

  test('1. Idea with Green Morocco priority → Should auto-tag SDG 7, 13, 15', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Climate change affecting agriculture. Need renewable energy solutions for farms.',
      alignment: {
        moroccoPriorities: ['green_morocco'],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const result = scoreIdeaComplete(input);
    
    expect(result.alignment?.moroccoPriorities).toContain('green_morocco');
    expect(result.alignment?.sdgTags).toContain(7); // Clean Energy
    expect(result.alignment?.sdgTags).toContain(13); // Climate Action
    expect(result.alignment?.sdgTags).toContain(15); // Life on Land
    expect(result.alignment?.sdgAutoTagged).toBe(true);
  });

  test('2. Idea with Youth Employment → Should auto-tag SDG 8', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Young people need jobs. Creating startup opportunities for shabab.',
      alignment: {
        moroccoPriorities: ['youth_employment'],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const result = scoreIdeaComplete(input);
    
    expect(result.alignment?.moroccoPriorities).toContain('youth_employment');
    expect(result.alignment?.sdgTags).toContain(8); // Decent Work
  });

  test('3. Idea with Women Empowerment → Should auto-tag SDG 5, 8', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Supporting women entrepreneurs and gender equality in business.',
      alignment: {
        moroccoPriorities: ['women_empowerment'],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const result = scoreIdeaComplete(input);
    
    expect(result.alignment?.moroccoPriorities).toContain('women_empowerment');
    expect(result.alignment?.sdgTags).toContain(5); // Gender Equality
    expect(result.alignment?.sdgTags).toContain(8); // Decent Work
  });

  test('4. Idea with health keywords → Should detect SDG 3 from text', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Hospitals need better patient management systems. Doctors spend too much time on paperwork.',
      alignment: {
        moroccoPriorities: [],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const sdgData = autoTagSDGs(input);
    
    expect(sdgData.sdgTags).toContain(3); // Good Health
    expect(sdgData.sdgConfidence[3]).toBeGreaterThan(0.5);
  });

  test('5. Idea with no priorities → Low strategic fit score', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Generic problem without clear Morocco alignment.',
      alignment: {
        moroccoPriorities: [],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const strategicFit = scoreStrategicFit(input);
    
    expect(strategicFit).toBeLessThan(3); // Should be low without priorities
  });

  test('6. Idea with multiple priorities → High strategic fit score', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Digital health platform for rural areas with youth employment focus.',
      alignment: {
        moroccoPriorities: ['digital_morocco', 'health_system', 'youth_employment', 'rural_development'],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const strategicFit = scoreStrategicFit(input);
    
    expect(strategicFit).toBeGreaterThanOrEqual(4); // Should be high with multiple priorities
    expect(input.alignment?.sdgTags.length).toBeGreaterThan(0); // Should have auto-tagged SDGs
  });

  test('7. Auto-detection of Morocco priorities from text', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Digital transformation needed for government services. E-government platform.',
      alignment: {
        moroccoPriorities: [], // Empty, should auto-detect
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const result = scoreIdeaComplete(input);
    
    expect(result.alignment?.moroccoPriorities).toContain('digital_morocco');
  });

  test('8. Funding eligibility based on SDG tags', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Climate action project with renewable energy.',
      alignment: {
        moroccoPriorities: ['green_morocco'],
        sdgTags: [7, 13, 15],
        sdgAutoTagged: true,
        sdgConfidence: { 7: 0.9, 13: 0.9, 15: 0.9 }
      }
    };

    const result = scoreIdeaComplete(input);
    
    expect(result.funding?.euGrantEligible).toBe(true); // 2+ SDGs
    expect(result.funding?.climateFundEligible).toBe(true); // Has SDG 13 or green_morocco
  });

  test('9. Strategic fit scoring with bonuses', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      alignment: {
        moroccoPriorities: ['youth_employment'], // High priority
        sdgTags: [8, 5], // Multiple SDGs
        sdgAutoTagged: true,
        sdgConfidence: { 8: 0.9, 5: 0.85 } // High confidence
      }
    };

    const strategicFit = scoreStrategicFit(input);
    
    // Base: 2 (1 priority) + bonuses
    // +0.2 (has SDG tags) + 0.3 (high priority) + 0.2 (multiple SDGs) + 0.3 (high confidence)
    expect(strategicFit).toBeGreaterThan(2.5);
  });

  test('10. Complete scoring flow with alignment', () => {
    const input: IdeaScoringInput = {
      ...baseInput,
      problemStatement: 'Healthcare digitalization for rural clinics. Improving patient access.',
      alignment: {
        moroccoPriorities: ['health_system', 'rural_development'],
        sdgTags: [],
        sdgAutoTagged: false,
        sdgConfidence: {}
      }
    };

    const result = scoreIdeaComplete(input);
    
    expect(result.alignment).toBeDefined();
    expect(result.alignment?.moroccoPriorities.length).toBeGreaterThan(0);
    expect(result.alignment?.sdgTags.length).toBeGreaterThan(0);
    expect(result.alignment?.sdgAutoTagged).toBe(true);
    expect(result.funding).toBeDefined();
  });
});
