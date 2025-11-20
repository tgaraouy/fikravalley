/**
 * COACH AGENT - USAGE EXAMPLES
 * 
 * Practical examples of using the Coach Agent for long-term guidance
 */

import { CoachAgent, Journey } from '../coach-agent';

// ==================== EXAMPLE 1: Track User Journey ====================

async function example1_TrackJourney() {
  console.log('📊 EXAMPLE 1: Track Complete Journey\n');
  console.log('=' .repeat(60));
  
  const agent = new CoachAgent();
  
  // Mock idea with 2 weeks of progress
  const mockIdea = {
    id: 'idea-123',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    intimacyScore: 6.5,
    totalScore: 22,
    receipts: Array.from({ length: 15 }, (_, i) => ({ 
      id: `receipt-${i}`, 
      amount: 3,
      createdAt: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000)
    })),
    revisions: [
      { id: 'rev-1', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { id: 'rev-2', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: 'rev-3', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
    ],
    marginNotes: [
      { id: 'note-1', text: 'After talking to 5 nurses, I realized...', createdAt: new Date() },
      { id: 'note-2', text: 'The real problem is not X but Y', createdAt: new Date() },
      { id: 'note-3', text: 'Locke was right - these conversations made it mine', createdAt: new Date() },
      { id: 'note-4', text: 'Need to focus on night shifts specifically', createdAt: new Date() }
    ]
  };
  
  const journey = await agent.trackJourney('user-ahmed', 'idea-123', mockIdea);
  
  console.log(`\n🎯 Journey Summary for User: user-ahmed`);
  console.log(`   Started: ${journey.startedAt.toLocaleDateString()}`);
  console.log(`   Current Phase: ${journey.currentPhase.toUpperCase()}`);
  console.log(`   Thinking Depth: ${journey.thinkingDepth.toUpperCase()}`);
  
  console.log(`\n📈 Stats:`);
  console.log(`   ✓ Days Active: ${journey.stats.daysActive}`);
  console.log(`   ✓ Receipts Collected: ${journey.stats.receiptsCollected}`);
  console.log(`   ✓ Conversations Had: ${journey.stats.conversationsHad}`);
  console.log(`   ✓ Revisions Made: ${journey.stats.revisionsCount}`);
  console.log(`   ✓ Margin Notes: ${journey.stats.marginNotesWritten}`);
  
  console.log(`\n🏆 Milestones Achieved:`);
  const achieved = journey.milestones.filter(m => m.achievedAt);
  achieved.forEach(m => {
    console.log(`   ${m.celebration.badge || '✓'} ${m.name} - ${m.description}`);
  });
  
  console.log(`\n🎯 Next Milestones:`);
  const upcoming = journey.milestones.filter(m => !m.achievedAt).slice(0, 3);
  upcoming.forEach(m => {
    console.log(`   ⏳ ${m.name} - ${m.description}`);
  });
  
  console.log(`\n📊 Intimacy Evolution (last 7 days):`);
  journey.intimacyEvolution.slice(-7).forEach(snapshot => {
    const bar = '█'.repeat(Math.round(snapshot.score));
    console.log(`   ${snapshot.date.toLocaleDateString()}: ${bar} ${snapshot.score.toFixed(1)}/10`);
  });
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ==================== EXAMPLE 2: Daily Coaching Messages ====================

async function example2_DailyCoaching() {
  console.log('💬 EXAMPLE 2: Daily Coaching Messages\n');
  console.log('=' .repeat(60));
  
  const agent = new CoachAgent();
  
  // Scenario A: User hasn't been active for 5 days
  console.log('\n🔔 Scenario A: Inactive User (5 days)\n');
  
  const inactiveJourney: Journey = {
    userId: 'user-fatima',
    ideaId: 'idea-456',
    startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    currentPhase: 'ideation',
    milestones: [],
    stats: {
      daysActive: 30,
      revisionsCount: 2,
      receiptsCollected: 5,
      conversationsHad: 5,
      marginNotesWritten: 3,
      documentsGenerated: 0
    },
    intimacyEvolution: [],
    thinkingDepth: 'developing'
  };
  
  const motivationalCoaching = await agent.provideDailyCoaching(
    'user-fatima',
    'Fatima',
    inactiveJourney
  );
  
  if (motivationalCoaching) {
    console.log(`📱 Message Tone: ${motivationalCoaching.message.tone}`);
    console.log(`📝 French:\n   ${motivationalCoaching.message.french.split('\n').join('\n   ')}`);
    console.log(`📝 Darija:\n   ${motivationalCoaching.message.darija.split('\n').join('\n   ')}`);
    if (motivationalCoaching.action) {
      console.log(`🎯 Action: ${motivationalCoaching.action.type}`);
      console.log(`   ${motivationalCoaching.action.description}`);
    }
  }
  
  // Scenario B: User is close to milestone (8 receipts, needs 10)
  console.log('\n\n🔔 Scenario B: Close to Milestone (8/10 receipts)\n');
  
  const almostThereJourney: Journey = {
    userId: 'user-youssef',
    ideaId: 'idea-789',
    startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    currentPhase: 'validation',
    milestones: [
      {
        id: '10_receipts',
        name: 'Initial Validation',
        description: '10 receipts = initial market validation',
        category: 'validation',
        celebration: {
          message: { darija: '', french: '' },
          shareWorthy: true
        }
      }
    ],
    stats: {
      daysActive: 14,
      revisionsCount: 3,
      receiptsCollected: 8,
      conversationsHad: 8,
      marginNotesWritten: 5,
      documentsGenerated: 1
    },
    intimacyEvolution: [],
    thinkingDepth: 'developing'
  };
  
  const encouragementCoaching = await agent.provideDailyCoaching(
    'user-youssef',
    'Youssef',
    almostThereJourney
  );
  
  if (encouragementCoaching) {
    console.log(`📱 Message Tone: ${encouragementCoaching.message.tone}`);
    console.log(`📝 French:\n   ${encouragementCoaching.message.french.split('\n').join('\n   ')}`);
    console.log(`📝 Darija:\n   ${encouragementCoaching.message.darija.split('\n').join('\n   ')}`);
    if (encouragementCoaching.action) {
      console.log(`🎯 Action: ${encouragementCoaching.action.type}`);
      console.log(`   ${encouragementCoaching.action.description}`);
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ==================== EXAMPLE 3: Milestone Celebrations ====================

async function example3_MilestoneCelebrations() {
  console.log('🎉 EXAMPLE 3: Milestone Celebrations\n');
  console.log('=' .repeat(60));
  
  const agent = new CoachAgent();
  
  // Achievement 1: First Receipt
  console.log('\n🎊 Achievement: First Receipt\n');
  
  const firstReceiptMilestone = {
    id: 'first_receipt',
    name: 'First Validation',
    description: 'Collected your first 3-DH receipt',
    achievedAt: new Date(),
    category: 'validation' as const,
    celebration: {
      message: {
        darija: '💰 Awl reçu! Shi wa7ed خلص 3 DH bach y-valider idea dyalek!\n\nHadchi machi كلام. Hadchi PROOF réel!',
        french: '💰 Premier reçu! Quelqu\'un a payé 3 DH pour valider votre idée!\n\nCe n\'est pas de la théorie. C\'est une PREUVE réelle!'
      },
      badge: '💰',
      shareWorthy: true
    },
    nextMilestone: '10_receipts'
  };
  
  const celebration1 = await agent.celebrateMilestone(firstReceiptMilestone, 'Ahmed');
  
  console.log(`🏆 ${celebration1.notification.title}`);
  console.log(`${celebration1.notification.badge}`);
  console.log(`\n${celebration1.notification.message}`);
  
  if (celebration1.sharePrompt) {
    console.log(`\n📢 Share on Social Media?`);
    console.log(`   Platforms: ${celebration1.sharePrompt.platforms.join(', ')}`);
    console.log(`   Message:\n   ${celebration1.sharePrompt.message.split('\n').join('\n   ')}`);
  }
  
  // Achievement 2: True Knowing
  console.log('\n\n🎊 Achievement: True Knowing (Intimacy ≥ 7/10)\n');
  
  const trueKnowingMilestone = {
    id: 'true_knowing',
    name: 'True Knowing',
    description: 'Achieved intimacy score ≥ 7/10 (Locke\'s standard)',
    achievedAt: new Date(),
    category: 'intimacy' as const,
    celebration: {
      message: {
        darija: '🏆 TRUE KNOWING atteint! 8.5/10 intimité!\n\nLocke: Nta daba ma-ka-t3rafش ghi "3la" had l-mochkil. Nta KAT-3RAF had l-mochkil b-sa77!',
        french: '🏆 VRAIE CONNAISSANCE atteinte! 8.5/10 d\'intimité!\n\nLocke: Vous ne "savez plus DE" ce problème. Vous le CONNAISSEZ vraiment!'
      },
      badge: '🏆',
      shareWorthy: true
    },
    nextMilestone: 'profound_understanding'
  };
  
  const celebration2 = await agent.celebrateMilestone(trueKnowingMilestone, 'Fatima');
  
  console.log(`🏆 ${celebration2.notification.title}`);
  console.log(`${celebration2.notification.badge}`);
  console.log(`\n${celebration2.notification.message}`);
  
  if (celebration2.sharePrompt) {
    console.log(`\n📢 Share on Social Media?`);
    console.log(`   Platforms: ${celebration2.sharePrompt.platforms.join(', ')}`);
    console.log(`   Message:\n   ${celebration2.sharePrompt.message.split('\n').join('\n   ')}`);
  }
  
  // Achievement 3: Market Proven
  console.log('\n\n🎊 Achievement: Market Proven (200+ receipts)\n');
  
  const marketProvenMilestone = {
    id: 'market_proven',
    name: 'Market Proven',
    description: '200+ receipts = market proven (5/5)',
    achievedAt: new Date(),
    category: 'validation' as const,
    celebration: {
      message: {
        darija: '🌟 LEGENDARY! 200+ reçus = Market Proven (5/5)!\n\nTop 1%! Les investisseurs ghadi y-tbattaw 3lik!',
        french: '🌟 LÉGENDAIRE! 200+ reçus = Marché prouvé (5/5)!\n\nTop 1%! Les investisseurs vont se battre pour vous!'
      },
      badge: '🌟',
      shareWorthy: true
    }
  };
  
  const celebration3 = await agent.celebrateMilestone(marketProvenMilestone, 'Youssef');
  
  console.log(`🏆 ${celebration3.notification.title}`);
  console.log(`${celebration3.notification.badge}`);
  console.log(`\n${celebration3.notification.message}`);
  
  if (celebration3.sharePrompt) {
    console.log(`\n📢 Share on Social Media?`);
    console.log(`   Platforms: ${celebration3.sharePrompt.platforms.join(', ')}`);
    console.log(`   Message:\n   ${celebration3.sharePrompt.message.split('\n').join('\n   ')}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ==================== EXAMPLE 4: Thinking Depth Evolution ====================

async function example4_ThinkingDepthEvolution() {
  console.log('🧠 EXAMPLE 4: Thinking Depth Evolution\n');
  console.log('=' .repeat(60));
  
  const agent = new CoachAgent();
  
  // Show evolution from superficial → profound
  const stages = [
    {
      name: 'Week 1: Superficial',
      idea: {
        id: 'idea-1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        intimacyScore: 2.5,
        totalScore: 10,
        receipts: [{ id: 'r1' }],
        revisions: [],
        marginNotes: []
      }
    },
    {
      name: 'Week 3: Developing',
      idea: {
        id: 'idea-1',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        intimacyScore: 4.5,
        totalScore: 16,
        receipts: Array.from({ length: 8 }, (_, i) => ({ id: `r${i}` })),
        revisions: [{ id: 'rev1' }, { id: 'rev2' }],
        marginNotes: [{ id: 'note1' }, { id: 'note2' }]
      }
    },
    {
      name: 'Week 6: Intimate',
      idea: {
        id: 'idea-1',
        createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
        intimacyScore: 7.5,
        totalScore: 26,
        receipts: Array.from({ length: 35 }, (_, i) => ({ id: `r${i}` })),
        revisions: Array.from({ length: 5 }, (_, i) => ({ id: `rev${i}` })),
        marginNotes: Array.from({ length: 8 }, (_, i) => ({ id: `note${i}` }))
      }
    },
    {
      name: 'Week 10: Profound',
      idea: {
        id: 'idea-1',
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        intimacyScore: 9.0,
        totalScore: 35,
        receipts: Array.from({ length: 120 }, (_, i) => ({ id: `r${i}` })),
        revisions: Array.from({ length: 10 }, (_, i) => ({ id: `rev${i}` })),
        marginNotes: Array.from({ length: 15 }, (_, i) => ({ id: `note${i}` }))
      }
    }
  ];
  
  console.log('\n📈 Tracking Journey from Superficial → Profound Thinking\n');
  
  for (const stage of stages) {
    const journey = await agent.trackJourney('user-karim', 'idea-1', stage.idea);
    
    console.log(`\n${stage.name}`);
    console.log(`   Thinking Depth: ${journey.thinkingDepth.toUpperCase()}`);
    console.log(`   Intimacy Score: ${stage.idea.intimacyScore}/10`);
    console.log(`   Receipts: ${journey.stats.receiptsCollected}`);
    console.log(`   Revisions: ${journey.stats.revisionsCount}`);
    console.log(`   Margin Notes: ${journey.stats.marginNotesWritten}`);
    console.log(`   Phase: ${journey.currentPhase}`);
    
    const achievedCount = journey.milestones.filter(m => m.achievedAt).length;
    console.log(`   Milestones: ${achievedCount}/${journey.milestones.length}`);
  }
  
  console.log('\n💡 Locke\'s Insight:');
  console.log('   "Thinking makes what we read ours."');
  console.log('   This journey shows thinking in action - from surface knowledge');
  console.log('   to TRUE KNOWING through conversations, revisions, and reflection.');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ==================== RUN ALL EXAMPLES ====================

async function runAllExamples() {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('  COACH AGENT - USAGE EXAMPLES');
  console.log('  Long-Term Guidance, Milestone Tracking, Motivation');
  console.log('═'.repeat(70));
  console.log('\n');
  
  await example1_TrackJourney();
  await example2_DailyCoaching();
  await example3_MilestoneCelebrations();
  await example4_ThinkingDepthEvolution();
  
  console.log('✅ All examples completed!\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  example1_TrackJourney,
  example2_DailyCoaching,
  example3_MilestoneCelebrations,
  example4_ThinkingDepthEvolution,
  runAllExamples
};

