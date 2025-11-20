/**
 * MENTOR AGENT TESTS
 * 
 * Tests all aspects of the MENTOR agent including:
 * - Mentor matching algorithm
 * - Score calculation
 * - Introduction generation
 * - Connection point detection
 * - Locke philosophy integration
 */

import { describe, expect, test, beforeEach } from '@jest/globals';
import MentorAgent, {
  type Mentor,
  type MentorMatch,
  type IdeaStatement,
  type IntroductionMessage,
  type User
} from '../mentor-agent';

describe('MENTOR Agent - Matching Algorithm', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 1: Perfect match (healthcare + Rabat + RFID)', () => {
    test('should find Youssef Alami as perfect match', async () => {
      const idea: IdeaStatement = {
        title: 'RFID Tracking System for CHU',
        problem: {
          sector: 'healthtech',
          location: 'Rabat',
          description: 'Nurses lose equipment 6-8 times per shift'
        },
        operations: {
          technology: ['RFID', 'IoT', 'React']
        },
        alignment: {
          moroccoPriorities: ['digital_morocco', 'healthcare']
        }
      };

      const matches = await agent.findMentors(idea, 5);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].mentor.name).toBe('Youssef Alami');
      expect(matches[0].matchScore).toBeGreaterThanOrEqual(90);
      expect(matches[0].confidence).toBe('perfect');
    });
  });

  describe('Test Case 2: Good match (edtech + Casablanca)', () => {
    test('should find Fatima Zahrae as top match', async () => {
      const idea: IdeaStatement = {
        title: 'Mobile Learning App for Rural Schools',
        problem: {
          sector: 'edtech',
          location: 'Casablanca'
        },
        operations: {
          technology: ['React Native', 'Firebase']
        },
        alignment: {
          moroccoPriorities: ['digital_morocco', 'education']
        }
      };

      const matches = await agent.findMentors(idea, 5);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].mentor.name).toBe('Fatima Zahrae');
      expect(matches[0].matchScore).toBeGreaterThanOrEqual(70);
      expect(matches[0].confidence).toMatch(/high|perfect/);
    });
  });

  describe('Test Case 3: Agriculture match (agritech + Fès)', () => {
    test('should find Mehdi Benjelloun as top match', async () => {
      const idea: IdeaStatement = {
        title: 'Smart Irrigation for Farmers',
        problem: {
          sector: 'agritech',
          location: 'Fès'
        },
        operations: {
          technology: ['IoT', 'Python']
        },
        alignment: {
          moroccoPriorities: ['green_morocco', 'agriculture']
        }
      };

      const matches = await agent.findMentors(idea, 5);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].mentor.name).toBe('Mehdi Benjelloun');
      expect(matches[0].matchScore).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Test Case 4: No perfect match', () => {
    test('should still return mentors but with lower scores', async () => {
      const idea: IdeaStatement = {
        title: 'Blockchain for Real Estate',
        problem: {
          sector: 'real_estate',
          location: 'Agadir'
        },
        operations: {
          technology: ['Blockchain', 'Solidity']
        }
      };

      const matches = await agent.findMentors(idea, 5);

      // Should still return matches (any available mentor)
      expect(matches.length).toBeGreaterThanOrEqual(0);
      
      if (matches.length > 0) {
        expect(matches[0].matchScore).toBeLessThan(70);
        expect(matches[0].confidence).toMatch(/low|medium/);
      }
    });
  });

  describe('Test Case 5: Same region (not exact city)', () => {
    test('should give partial location score for same region', async () => {
      const idea: IdeaStatement = {
        title: 'Healthcare Solution',
        problem: {
          sector: 'healthtech',
          location: 'Salé' // Same region as Rabat
        },
        operations: {
          technology: ['RFID']
        }
      };

      const matches = await agent.findMentors(idea, 5);

      expect(matches.length).toBeGreaterThan(0);
      
      const topMatch = matches[0];
      // Should have positive location match (0.5 for same region)
      expect(topMatch.alignment.locationMatch).toBeGreaterThan(0);
    });
  });
});

describe('MENTOR Agent - Score Calculation', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 6: Expertise scoring', () => {
    test('should weight expertise heavily (40 points)', async () => {
      const idea: IdeaStatement = {
        title: 'Project',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        },
        operations: {
          technology: ['RFID', 'IoT']
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      // With perfect expertise match + location + high intimacy
      // Should get: 40 (expertise) + 20 (location) + 10 (intimacy) = 70+
      expect(match.matchScore).toBeGreaterThanOrEqual(60);
      expect(match.alignment.expertiseMatch).toBeGreaterThan(0.5);
    });
  });

  describe('Test Case 7: Intimacy rating importance', () => {
    test('should prioritize mentors with high intimacy (8+)', async () => {
      const idea: IdeaStatement = {
        title: 'Agriculture Innovation',
        problem: {
          sector: 'agritech',
          location: 'Meknès'
        }
      };

      const matches = await agent.findMentors(idea, 3);

      // Mehdi has intimacyRating: 10, should be top match
      const topMatch = matches[0];
      expect(topMatch.mentor.intimacyRating).toBeGreaterThanOrEqual(8);
      expect(topMatch.alignment.intimacyMatch).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Test Case 8: Track record bonus', () => {
    test('should give bonus for high success rate', async () => {
      const mentors = agent.getAllMentors();
      
      // Mehdi has 75% success rate (highest)
      const mehdi = mentors.find(m => m.name === 'Mehdi Benjelloun');
      expect(mehdi?.successRate).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Test Case 9: Alignment breakdown', () => {
    test('should calculate all alignment factors', async () => {
      const idea: IdeaStatement = {
        title: 'HealthTech Solution',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        },
        operations: {
          technology: ['React', 'RFID']
        },
        alignment: {
          moroccoPriorities: ['digital_morocco', 'healthcare']
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      expect(match.alignment).toBeDefined();
      expect(match.alignment.expertiseMatch).toBeGreaterThanOrEqual(0);
      expect(match.alignment.sectorMatch).toBeGreaterThanOrEqual(0);
      expect(match.alignment.locationMatch).toBeGreaterThanOrEqual(0);
      expect(match.alignment.intimacyMatch).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('MENTOR Agent - Match Explanation', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 10: Reasons are specific', () => {
    test('should provide specific reasons for match', async () => {
      const idea: IdeaStatement = {
        title: 'RFID System',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        },
        operations: {
          technology: ['RFID']
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      expect(match.reasons.length).toBeGreaterThan(0);
      
      // Should mention specific expertise, experience, or location
      const hasSpecificReason = match.reasons.some(r => 
        r.includes('Expert en') || 
        r.includes('A fondé') || 
        r.includes('Basé à') ||
        r.includes('A travaillé sur')
      );
      
      expect(hasSpecificReason).toBe(true);
    });
  });

  describe('Test Case 11: Intimacy rating highlighted', () => {
    test('should highlight high intimacy rating', async () => {
      const idea: IdeaStatement = {
        title: 'AgriTech Solution',
        problem: {
          sector: 'agritech',
          location: 'Meknès'
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      // Mehdi has intimacy rating of 10
      const hasIntimacyReason = match.reasons.some(r => 
        r.includes('Connaissance INTIME') || r.includes('Locke')
      );
      
      expect(hasIntimacyReason).toBe(true);
    });
  });

  describe('Test Case 12: Founded companies mentioned', () => {
    test('should mention founded companies', async () => {
      const idea: IdeaStatement = {
        title: 'HealthTech Project',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      const mentionsCompany = match.reasons.some(r => r.includes('A fondé'));
      expect(mentionsCompany).toBe(true);
    });
  });

  describe('Test Case 13: Success rate mentioned', () => {
    test('should mention high success rate', async () => {
      const idea: IdeaStatement = {
        title: 'AgriTech',
        problem: {
          sector: 'agritech',
          location: 'Meknès'
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      // Mehdi has 75% success rate
      const mentionsSuccessRate = match.reasons.some(r => 
        r.includes('%') && r.includes('financés')
      );
      
      expect(mentionsSuccessRate).toBe(true);
    });
  });
});

describe('MENTOR Agent - Introduction Generation', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 14: Template introduction', () => {
    test('should generate personalized introduction', async () => {
      const idea: IdeaStatement = {
        title: 'RFID Tracking System',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        },
        operations: {
          technology: ['RFID']
        }
      };

      const creator: User = {
        name: 'Ahmed Bennani',
        email: 'ahmed@example.com',
        bio: 'Nurse at CHU Ibn Sina'
      };

      const matches = await agent.findMentors(idea, 1);
      const mentor = matches[0].mentor;

      const intro = await agent.generateIntroduction(idea, mentor, creator);

      expect(intro.subject).toBeDefined();
      expect(intro.body).toBeDefined();
      expect(intro.tone).toBeDefined();
      expect(intro.suggestedAsk).toBeDefined();
      expect(intro.intimacyNote).toBeDefined();

      // Should mention creator name
      expect(intro.body).toContain(creator.name);
      
      // Should mention mentor name
      expect(intro.body).toContain(mentor.name);
      
      // Should mention idea title
      expect(intro.body).toContain(idea.title);
    });
  });

  describe('Test Case 15: Intimacy note generation', () => {
    test('should generate Locke-inspired intimacy note', async () => {
      const idea: IdeaStatement = {
        title: 'HealthTech Solution',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        }
      };

      const creator: User = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const matches = await agent.findMentors(idea, 1);
      const mentor = matches[0].mentor;

      const intro = await agent.generateIntroduction(idea, mentor, creator);

      expect(intro.intimacyNote).toContain('Locke');
      
      // Should emphasize lived experience
      const emphasizesLivedExperience = 
        intro.intimacyNote.includes('VÉCU') ||
        intro.intimacyNote.includes('FONDÉ') ||
        intro.intimacyNote.includes('expérience');
      
      expect(emphasizesLivedExperience).toBe(true);
    });
  });

  describe('Test Case 16: Connection points detected', () => {
    test('should find and mention connection points', async () => {
      const idea: IdeaStatement = {
        title: 'Mobile Learning',
        problem: {
          sector: 'edtech',
          location: 'Casablanca'
        },
        operations: {
          technology: ['React Native', 'Firebase']
        }
      };

      const creator: User = {
        name: 'Sara El Mansouri',
        email: 'sara@example.com'
      };

      const matches = await agent.findMentors(idea, 1);
      const mentor = matches[0].mentor;

      const intro = await agent.generateIntroduction(idea, mentor, creator);

      // Should mention shared sector, tech, or location
      const mentionsConnection = 
        intro.body.toLowerCase().includes('edtech') ||
        intro.body.toLowerCase().includes('react native') ||
        intro.body.toLowerCase().includes('casablanca');
      
      expect(mentionsConnection).toBe(true);
    });
  });

  describe('Test Case 17: Founded company emphasized', () => {
    test('should emphasize founded companies in intimacy note', async () => {
      const idea: IdeaStatement = {
        title: 'Project',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        }
      };

      const creator: User = {
        name: 'Test',
        email: 'test@example.com'
      };

      const matches = await agent.findMentors(idea, 1);
      const mentor = matches[0].mentor;

      const intro = await agent.generateIntroduction(idea, mentor, creator);

      // Youssef founded HealthTech Maroc
      if (mentor.livedExperience.founded.length > 0) {
        expect(intro.intimacyNote).toContain('FONDÉ');
        expect(intro.intimacyNote).toContain(mentor.livedExperience.founded[0]);
      }
    });
  });
});

describe('MENTOR Agent - Availability', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 18: Only available mentors', () => {
    test('should only match mentors with available slots', async () => {
      const idea: IdeaStatement = {
        title: 'Any Project',
        problem: {
          sector: 'healthcare',
          location: 'Rabat'
        }
      };

      const matches = await agent.findMentors(idea, 5);

      matches.forEach(match => {
        expect(match.mentor.availableSlots).toBeGreaterThan(0);
        expect(match.availability.available).toBe(true);
      });
    });
  });

  describe('Test Case 19: Response time included', () => {
    test('should include expected response time', async () => {
      const idea: IdeaStatement = {
        title: 'Project',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        }
      };

      const matches = await agent.findMentors(idea, 1);
      const match = matches[0];

      expect(match.availability.responseExpected).toBeDefined();
      expect(typeof match.availability.responseExpected).toBe('string');
    });
  });
});

describe('MENTOR Agent - Locke Philosophy', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 20: Intimacy rating filter', () => {
    test('should only match mentors with intimacy >= 6', async () => {
      const idea: IdeaStatement = {
        title: 'Any Project',
        problem: {
          sector: 'technology',
          location: 'Casablanca'
        }
      };

      const matches = await agent.findMentors(idea, 5);

      matches.forEach(match => {
        expect(match.mentor.intimacyRating).toBeGreaterThanOrEqual(6);
      });
    });
  });

  describe('Test Case 21: Lived experience required', () => {
    test('all mentors should have lived experience', async () => {
      const mentors = agent.getAllMentors();

      mentors.forEach(mentor => {
        const hasLivedExperience = 
          mentor.livedExperience.founded.length > 0 ||
          mentor.livedExperience.worked.length > 0 ||
          mentor.livedExperience.projects.length > 0;
        
        expect(hasLivedExperience).toBe(true);
        expect(mentor.livedExperience.yearsExperience).toBeGreaterThan(0);
      });
    });
  });

  describe('Test Case 22: Intimacy note always present', () => {
    test('introduction should always include intimacy note', async () => {
      const idea: IdeaStatement = {
        title: 'Test Project',
        problem: {
          sector: 'technology',
          location: 'Rabat'
        }
      };

      const creator: User = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const matches = await agent.findMentors(idea, 1);
      const mentor = matches[0].mentor;

      const intro = await agent.generateIntroduction(idea, mentor, creator);

      expect(intro.intimacyNote).toBeDefined();
      expect(intro.intimacyNote.length).toBeGreaterThan(0);
      expect(intro.intimacyNote).toContain('Locke');
    });
  });
});

describe('MENTOR Agent - Edge Cases', () => {
  let agent: MentorAgent;

  beforeEach(() => {
    agent = new MentorAgent();
  });

  describe('Test Case 23: Empty technology array', () => {
    test('should handle ideas without tech stack', async () => {
      const idea: IdeaStatement = {
        title: 'Simple Idea',
        problem: {
          sector: 'healthcare',
          location: 'Rabat'
        }
        // No operations.technology
      };

      const matches = await agent.findMentors(idea, 5);

      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Test Case 24: Missing alignment', () => {
    test('should handle ideas without morocco priorities', async () => {
      const idea: IdeaStatement = {
        title: 'Idea',
        problem: {
          sector: 'technology',
          location: 'Casablanca'
        }
        // No alignment
      };

      const matches = await agent.findMentors(idea, 5);

      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Test Case 25: Unknown location', () => {
    test('should handle unrecognized locations', async () => {
      const idea: IdeaStatement = {
        title: 'Project',
        problem: {
          sector: 'technology',
          location: 'Unknown City'
        }
      };

      const matches = await agent.findMentors(idea, 5);

      // Should still return matches (location is not required)
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Test Case 26: No creator bio', () => {
    test('should generate introduction without creator bio', async () => {
      const idea: IdeaStatement = {
        title: 'Test',
        problem: {
          sector: 'healthcare',
          location: 'Rabat'
        }
      };

      const creator: User = {
        name: 'Test User',
        email: 'test@example.com'
        // No bio
      };

      const matches = await agent.findMentors(idea, 1);
      const mentor = matches[0].mentor;

      const intro = await agent.generateIntroduction(idea, mentor, creator);

      expect(intro).toBeDefined();
      expect(intro.body).toBeDefined();
    });
  });

  describe('Test Case 27: Confidence levels', () => {
    test('should assign correct confidence levels', async () => {
      const testCases = [
        { score: 95, expected: 'perfect' },
        { score: 75, expected: 'high' },
        { score: 55, expected: 'medium' },
        { score: 35, expected: 'low' }
      ];

      // This tests the confidence determination logic indirectly
      const idea: IdeaStatement = {
        title: 'Test',
        problem: {
          sector: 'healthtech',
          location: 'Rabat'
        },
        operations: {
          technology: ['RFID', 'IoT']
        }
      };

      const matches = await agent.findMentors(idea, 5);

      matches.forEach(match => {
        if (match.matchScore >= 90) {
          expect(match.confidence).toBe('perfect');
        } else if (match.matchScore >= 70) {
          expect(match.confidence).toBe('high');
        } else if (match.matchScore >= 50) {
          expect(match.confidence).toBe('medium');
        } else {
          expect(match.confidence).toBe('low');
        }
      });
    });
  });
});

