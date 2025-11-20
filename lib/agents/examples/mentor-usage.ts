/**
 * MENTOR AGENT - PRACTICAL USAGE EXAMPLES
 * 
 * Real-world examples of how to use the MENTOR agent for matching and introductions
 */

import MentorAgent, { type IdeaStatement, type User } from '../mentor-agent';

// ==================== EXAMPLE 1: Basic Mentor Matching ====================

/**
 * Example: Finding mentors for a healthcare idea
 * 
 * Use case: User submits healthcare idea, we find relevant mentors
 */

export async function example1_BasicMatching() {
  const agent = new MentorAgent();
  
  console.log("🤝 EXAMPLE 1: Basic Mentor Matching\n");
  
  const idea: IdeaStatement = {
    title: 'RFID Tracking System for Hospital Equipment',
    problem: {
      sector: 'healthtech',
      location: 'Rabat',
      description: 'Nurses lose 2 hours per shift searching for equipment'
    },
    operations: {
      technology: ['RFID', 'IoT', 'React', 'Node.js']
    },
    alignment: {
      moroccoPriorities: ['digital_morocco', 'healthcare']
    }
  };
  
  const matches = await agent.findMentors(idea, 3);
  
  console.log(`Found ${matches.length} mentors:\n`);
  
  matches.forEach((match, index) => {
    console.log(`${index + 1}. ${match.mentor.name} - ${match.mentor.title} at ${match.mentor.company}`);
    console.log(`   Match Score: ${match.matchScore}/100 (${match.confidence})`);
    console.log(`   Expertise: ${match.mentor.expertise.join(', ')}`);
    console.log(`   Intimacy Rating: ${match.mentor.intimacyRating}/10 (Locke's metric)`);
    console.log(`   Why this match:`);
    match.reasons.forEach(reason => {
      console.log(`   - ${reason}`);
    });
    console.log();
  });
}

// ==================== EXAMPLE 2: Introduction Generation ====================

/**
 * Example: Generating warm introduction email
 * 
 * Use case: After finding a mentor, generate personalized intro
 */

export async function example2_IntroductionGeneration() {
  const agent = new MentorAgent();
  
  console.log("\n📧 EXAMPLE 2: Introduction Generation\n");
  
  const idea: IdeaStatement = {
    title: 'RFID Tracking System',
    problem: {
      sector: 'healthtech',
      location: 'Rabat'
    },
    operations: {
      technology: ['RFID', 'IoT']
    }
  };
  
  const creator: User = {
    name: 'Ahmed Bennani',
    email: 'ahmed@example.com',
    bio: 'Registered nurse at CHU Ibn Sina with 5 years experience. Frustrated by daily equipment searches.'
  };
  
  const matches = await agent.findMentors(idea, 1);
  const topMentor = matches[0].mentor;
  
  const intro = await agent.generateIntroduction(idea, topMentor, creator);
  
  console.log(`To: ${topMentor.name} <${topMentor.company}>`);
  console.log(`Subject: ${intro.subject}`);
  console.log(`\n${intro.body}`);
  console.log(`\n--- Suggested Ask ---`);
  console.log(intro.suggestedAsk);
  console.log(`\n--- Locke's Insight ---`);
  console.log(intro.intimacyNote);
}

// ==================== EXAMPLE 3: Alignment Breakdown ====================

/**
 * Example: Understanding why a match works
 * 
 * Use case: Show user detailed alignment metrics
 */

export async function example3_AlignmentBreakdown() {
  const agent = new MentorAgent();
  
  console.log("\n📊 EXAMPLE 3: Alignment Breakdown\n");
  
  const idea: IdeaStatement = {
    title: 'Mobile Learning App for Rural Schools',
    problem: {
      sector: 'edtech',
      location: 'Casablanca'
    },
    operations: {
      technology: ['React Native', 'Firebase', 'Gamification']
    },
    alignment: {
      moroccoPriorities: ['digital_morocco', 'education']
    }
  };
  
  const matches = await agent.findMentors(idea, 1);
  const match = matches[0];
  
  console.log(`Mentor: ${match.mentor.name}`);
  console.log(`Overall Match Score: ${match.matchScore}/100\n`);
  
  console.log("Detailed Alignment:");
  console.log(`  Expertise Match: ${(match.alignment.expertiseMatch * 100).toFixed(0)}%`);
  console.log(`  Sector Match: ${(match.alignment.sectorMatch * 100).toFixed(0)}%`);
  console.log(`  Location Match: ${(match.alignment.locationMatch * 100).toFixed(0)}%`);
  console.log(`  Priority Match: ${(match.alignment.priorityMatch * 100).toFixed(0)}%`);
  console.log(`  Intimacy Match: ${(match.alignment.intimacyMatch * 100).toFixed(0)}%`);
  
  console.log(`\nAvailability:`);
  console.log(`  Available: ${match.availability.available ? 'Yes' : 'No'}`);
  console.log(`  Response Expected: ${match.availability.responseExpected}`);
  
  console.log(`\nMatch Confidence: ${match.confidence.toUpperCase()}`);
}

// ==================== EXAMPLE 4: Comparing Multiple Mentors ====================

/**
 * Example: Side-by-side comparison of mentors
 * 
 * Use case: Help user choose between multiple good matches
 */

export async function example4_ComparingMentors() {
  const agent = new MentorAgent();
  
  console.log("\n🔍 EXAMPLE 4: Comparing Multiple Mentors\n");
  
  const idea: IdeaStatement = {
    title: 'Smart Agriculture Solution',
    problem: {
      sector: 'agritech',
      location: 'Meknès'
    },
    operations: {
      technology: ['IoT', 'Python', 'Machine Learning']
    },
    alignment: {
      moroccoPriorities: ['green_morocco', 'agriculture']
    }
  };
  
  const matches = await agent.findMentors(idea, 3);
  
  console.log("Mentor Comparison Table:\n");
  console.log("Name               | Score | Intimacy | Success | Availability");
  console.log("-".repeat(70));
  
  matches.forEach(match => {
    const name = match.mentor.name.padEnd(18);
    const score = `${match.matchScore}`.padEnd(5);
    const intimacy = `${match.mentor.intimacyRating}/10`.padEnd(8);
    const success = `${Math.round(match.mentor.successRate * 100)}%`.padEnd(7);
    const slots = `${match.mentor.availableSlots} slots`;
    
    console.log(`${name} | ${score} | ${intimacy} | ${success} | ${slots}`);
  });
  
  console.log("\nRecommendation:");
  const best = matches[0];
  console.log(`→ ${best.mentor.name} is your best match (${best.matchScore}/100)`);
  console.log(`  Key strengths: ${best.reasons.slice(0, 2).join('; ')}`);
}

// ==================== EXAMPLE 5: Locke's Intimacy Focus ====================

/**
 * Example: Emphasizing mentors with lived experience
 * 
 * Use case: Show why intimacy matters (Locke's philosophy)
 */

export async function example5_IntimacyFocus() {
  const agent = new MentorAgent();
  
  console.log("\n💡 EXAMPLE 5: Locke's Intimacy Focus\n");
  
  const idea: IdeaStatement = {
    title: 'Healthcare Innovation',
    problem: {
      sector: 'healthtech',
      location: 'Rabat'
    }
  };
  
  const matches = await agent.findMentors(idea, 3);
  
  console.log("Mentors by Intimacy Rating (Locke's Metric):\n");
  
  const sortedByIntimacy = [...matches].sort((a, b) => 
    b.mentor.intimacyRating - a.mentor.intimacyRating
  );
  
  sortedByIntimacy.forEach(match => {
    const m = match.mentor;
    console.log(`${m.name} - ${m.intimacyRating}/10`);
    
    console.log(`  Lived Experience:`);
    if (m.livedExperience.founded.length > 0) {
      console.log(`    - Founded: ${m.livedExperience.founded.join(', ')}`);
    }
    if (m.livedExperience.worked.length > 0) {
      console.log(`    - Worked at: ${m.livedExperience.worked.slice(0, 2).join(', ')}`);
    }
    console.log(`    - ${m.livedExperience.yearsExperience} years in the field`);
    
    console.log(`  Track Record:`);
    console.log(`    - Mentored ${m.mentoredIdeas} ideas`);
    console.log(`    - ${Math.round(m.successRate * 100)}% got funded`);
    
    console.log(`\n  💭 Locke's Insight:`);
    if (m.intimacyRating >= 8) {
      console.log(`    This mentor has INTIMATE knowledge. They have LIVED the challenges.`);
    } else {
      console.log(`    Good knowledge, but may not have the depth of lived experience.`);
    }
    
    console.log();
  });
}

// ==================== EXAMPLE 6: Regional Matching ====================

/**
 * Example: Finding mentors in same region
 * 
 * Use case: Prefer local mentors for in-person meetings
 */

export async function example6_RegionalMatching() {
  const agent = new MentorAgent();
  
  console.log("\n📍 EXAMPLE 6: Regional Matching\n");
  
  const locations = ['Rabat', 'Salé', 'Casablanca', 'Fès', 'Meknès'];
  
  for (const location of locations) {
    const idea: IdeaStatement = {
      title: 'Tech Innovation',
      problem: {
        sector: 'technology',
        location
      }
    };
    
    const matches = await agent.findMentors(idea, 5);
    
    const localMentors = matches.filter(m => 
      m.mentor.locations.includes(location)
    );
    
    const regionalMentors = matches.filter(m => 
      !m.mentor.locations.includes(location) && m.alignment.locationMatch > 0
    );
    
    console.log(`${location}:`);
    console.log(`  Local mentors: ${localMentors.length}`);
    console.log(`  Same region: ${regionalMentors.length}`);
    console.log(`  Total matches: ${matches.length}`);
    console.log();
  }
}

// ==================== EXAMPLE 7: Integration with UI ====================

/**
 * Example: How to integrate with React UI
 * 
 * Use case: Real-world React component integration
 */

export async function example7_UIIntegration() {
  console.log("\n🎨 EXAMPLE 7: UI Integration Pattern\n");
  
  console.log("React Component Example:\n");
  
  const reactCode = `
import { useState, useEffect } from 'react';
import MentorAgent from '@/lib/agents/mentor-agent';

export function MentorMatchingCard({ idea }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const agent = new MentorAgent();
    
    agent.findMentors(idea, 5).then(matches => {
      setMatches(matches);
      setLoading(false);
    });
  }, [idea]);
  
  if (loading) return <Loading />;
  
  return (
    <div className="mentor-matches">
      <h3>Mentors recommandés pour vous</h3>
      
      {matches.map(match => (
        <MentorCard key={match.mentor.id}>
          <Avatar src={match.mentor.avatar} />
          
          <div className="info">
            <h4>{match.mentor.name}</h4>
            <p>{match.mentor.title} at {match.mentor.company}</p>
            
            <MatchScore score={match.matchScore} confidence={match.confidence} />
            
            <div className="reasons">
              {match.reasons.map(reason => (
                <Badge key={reason}>{reason}</Badge>
              ))}
            </div>
            
            {/* Locke's intimacy indicator */}
            <IntimacyBadge rating={match.mentor.intimacyRating}>
              {match.mentor.intimacyRating >= 8 && '⭐ INTIMATE KNOWLEDGE'}
            </IntimacyBadge>
            
            <button onClick={() => requestIntro(match.mentor)}>
              Request Introduction
            </button>
          </div>
        </MentorCard>
      ))}
    </div>
  );
}`;
  
  console.log(reactCode);
}

// ==================== EXAMPLE 8: Track Record Analysis ====================

/**
 * Example: Analyzing mentor effectiveness
 * 
 * Use case: Show users mentor success metrics
 */

export async function example8_TrackRecordAnalysis() {
  const agent = new MentorAgent();
  
  console.log("\n📈 EXAMPLE 8: Track Record Analysis\n");
  
  const mentors = agent.getAllMentors();
  
  console.log("Mentor Success Metrics:\n");
  
  mentors.forEach(mentor => {
    const fundedCount = Math.round(mentor.mentoredIdeas * mentor.successRate);
    
    console.log(`${mentor.name}:`);
    console.log(`  Total Ideas Mentored: ${mentor.mentoredIdeas}`);
    console.log(`  Successfully Funded: ${fundedCount} (${Math.round(mentor.successRate * 100)}%)`);
    console.log(`  Response Rate: ${Math.round(mentor.responseRate * 100)}%`);
    console.log(`  Avg Response Time: ${mentor.avgResponseTime}`);
    console.log(`  Available Slots: ${mentor.availableSlots}/month`);
    
    // Rating
    if (mentor.successRate >= 0.6) {
      console.log(`  🏆 Top Performer`);
    } else if (mentor.successRate >= 0.4) {
      console.log(`  ✅ Solid Track Record`);
    }
    
    console.log();
  });
}

// ==================== RUN ALL EXAMPLES ====================

export async function runAllExamples() {
  console.log("🚀 MENTOR AGENT - PRACTICAL EXAMPLES\n");
  console.log("=" .repeat(70));
  
  await example1_BasicMatching();
  console.log("\n" + "=".repeat(70));
  
  await example2_IntroductionGeneration();
  console.log("\n" + "=".repeat(70));
  
  await example3_AlignmentBreakdown();
  console.log("\n" + "=".repeat(70));
  
  await example4_ComparingMentors();
  console.log("\n" + "=".repeat(70));
  
  await example5_IntimacyFocus();
  console.log("\n" + "=".repeat(70));
  
  await example6_RegionalMatching();
  console.log("\n" + "=".repeat(70));
  
  await example7_UIIntegration();
  console.log("\n" + "=".repeat(70));
  
  await example8_TrackRecordAnalysis();
  console.log("\n" + "=".repeat(70));
  
  console.log("\n✅ All examples completed!");
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

