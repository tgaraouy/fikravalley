/**
 * SCORE AGENT - PRACTICAL USAGE EXAMPLES
 * 
 * Real-world examples of how to use the SCORE agent for real-time scoring
 */

import ScoreAgent, { type IdeaStatement, type LiveScore } from '../score-agent';

// ==================== EXAMPLE 1: Real-Time Scoring ====================

/**
 * Example: Integrating SCORE agent with a form
 * 
 * Use case: User is filling out idea submission form.
 * As they type, show live score updates.
 */

export async function example1_RealTimeScoring() {
  const agent = new ScoreAgent();
  
  console.log("📊 EXAMPLE 1: Real-Time Scoring\n");
  
  // Simulate user typing progressively
  const typingStages = [
    {
      label: "Stage 1: First words",
      idea: {
        problem: {
          description: "Les infirmières"
        }
      }
    },
    {
      label: "Stage 2: Adding specificity",
      idea: {
        problem: {
          description: "Les infirmières du CHU Ibn Sina"
        }
      }
    },
    {
      label: "Stage 3: Adding frequency",
      idea: {
        problem: {
          description: "Les infirmières du CHU Ibn Sina cherchent du matériel médical 6-8 fois par shift"
        }
      }
    },
    {
      label: "Stage 4: Complete problem",
      idea: {
        problem: {
          description: `Hier, j'ai vu au CHU Ibn Sina les infirmières chercher du matériel médical 6-8 fois par shift de 8 heures.
                       Actuellement, elles appellent 3-4 services par téléphone mais personne ne répond.
                       Cela retarde les soins pour environ 2,500 patients par jour.
                       Les 450 infirmières du service sont affectées.`
        }
      }
    }
  ];
  
  for (const stage of typingStages) {
    console.log(`\n${stage.label}:`);
    const score = await agent.calculateLiveScore(stage.idea);
    
    console.log(`  Clarity: ${score.current.clarity.toFixed(1)}/10`);
    console.log(`  Intimacy: ${score.current.intimacy.toFixed(1)}/10`);
    console.log(`  Total: ${score.current.total.toFixed(1)}/50`);
    console.log(`  Qualification: ${score.qualification.tier}`);
    console.log(`  Next Best Action: ${score.nextBestAction.action.french}`);
  }
}

// ==================== EXAMPLE 2: Gap-Driven UI ====================

/**
 * Example: Building a gap-driven progress UI
 * 
 * Use case: Show user exactly what's missing and prioritize actions
 */

export async function example2_GapDrivenUI() {
  const agent = new ScoreAgent();
  
  console.log("\n📈 EXAMPLE 2: Gap-Driven Progress UI\n");
  
  const partialIdea: Partial<IdeaStatement> = {
    problem: {
      description: "Les infirmières ont un problème avec le matériel"
    },
    receipts: Array(3).fill({ id: 'test', amount: 3 })
  };
  
  const score = await agent.calculateLiveScore(partialIdea);
  
  console.log("Current Score:", score.current.total, "/50");
  console.log("Potential Score:", score.potential.total, "/50");
  console.log("Gap:", score.potential.total - score.current.total, "points possible\n");
  
  console.log("🎯 Top 5 Actions (Prioritized by Impact):\n");
  
  score.gaps.slice(0, 5).forEach((gap, index) => {
    console.log(`${index + 1}. ${gap.field}`);
    console.log(`   Gain: +${gap.potentialGain.toFixed(1)} points | Effort: ${gap.effort} | Priority: ${gap.priority}`);
    console.log(`   Action: ${gap.action.french}`);
    console.log(`   Why: ${gap.why}`);
    if (gap.example) console.log(`   Example: ${gap.example}`);
    if (gap.intimacyImpact) console.log(`   💡 Locke: ${gap.intimacyImpact}`);
    console.log();
  });
}

// ==================== EXAMPLE 3: Qualification Dashboard ====================

/**
 * Example: Showing qualification status and progress
 * 
 * Use case: Dashboard showing whether user qualifies for Intilaka
 */

export async function example3_QualificationDashboard() {
  const agent = new ScoreAgent();
  
  console.log("\n🏆 EXAMPLE 3: Qualification Dashboard\n");
  
  const testCases = [
    {
      name: "Beginner (Just started)",
      idea: {
        problem: { description: "Problem avec la technologie" }
      }
    },
    {
      name: "Developing (Some progress)",
      idea: {
        problem: { description: "Les infirmières du CHU cherchent matériel 6 fois/jour. Actuellement téléphone." },
        receipts: Array(5).fill({ id: 'test', amount: 3 })
      }
    },
    {
      name: "Qualified (Good understanding)",
      idea: {
        problem: { 
          description: "Hier, j'ai vu au CHU Ibn Sina les infirmières chercher matériel 6-8 fois/shift. Actuellement téléphone mais personne répond. 2500 patients affectés."
        },
        asIs: { description: "Processus actuel: chercher 10 min, appeler 15 min. Coût 2h/jour. Très frustrant." },
        receipts: Array(60).fill({ id: 'test', amount: 3 }),
        marginNotes: Array(8).fill({ timestamp: new Date(), note: "Reflection" })
      }
    }
  ];
  
  for (const testCase of testCases) {
    const score = await agent.calculateLiveScore(testCase.idea);
    
    console.log(`\n📊 ${testCase.name}:`);
    console.log(`   Score: ${score.current.total.toFixed(1)}/50`);
    console.log(`   Intimacy: ${score.current.intimacy.toFixed(1)}/10 (${score.breakdown.intimacy.verdict})`);
    console.log(`   Tier: ${score.qualification.tier.toUpperCase()}`);
    console.log(`   Intilaka Eligible: ${score.qualification.intilaqaEligible ? '✅ YES' : '❌ NO'}`);
    console.log(`   Probability: ${score.qualification.intilaqaProbability}%`);
    console.log(`   Thinking Quality: ${score.thinkingQuality}`);
    
    if (score.qualification.nextTier) {
      console.log(`   Next Tier: ${score.qualification.nextTier.name} (${score.qualification.nextTier.gap} points away)`);
    }
  }
}

// ==================== EXAMPLE 4: Intimacy Tracker ====================

/**
 * Example: Tracking intimacy evolution (Locke's metric)
 * 
 * Use case: Show user how their understanding deepens over time
 */

export async function example4_IntimacyTracker() {
  const agent = new ScoreAgent();
  
  console.log("\n💭 EXAMPLE 4: Intimacy Evolution (Locke's Journey)\n");
  
  const journey = [
    {
      stage: "Initial (knowing OF)",
      idea: {
        problem: {
          description: "Les infirmières ont des problèmes avec le matériel médical"
        }
      }
    },
    {
      stage: "After 1 conversation",
      idea: {
        problem: {
          description: "Les infirmières du CHU Ibn Sina m'ont dit qu'elles cherchent du matériel 6-8 fois par shift"
        },
        receipts: [{ id: '1', amount: 3 }]
      }
    },
    {
      stage: "After 10 conversations",
      idea: {
        problem: {
          description: "Après avoir parlé à 10 infirmières au CHU Ibn Sina, j'ai réalisé que le problème est la désorganisation des armoires. Elles cherchent 6-8 fois par shift, perdant 2 heures/jour."
        },
        receipts: Array(10).fill({ id: 'test', amount: 3 }),
        marginNotes: [
          { timestamp: new Date(), note: "Découvert: le vrai problème n'est pas le manque de matériel mais l'organisation" },
          { timestamp: new Date(), note: "Infirmière Fatima m'a montré le processus - c'est chaotique!" }
        ]
      }
    },
    {
      stage: "True knowing",
      idea: {
        problem: {
          description: "Hier, j'ai passé un shift complet (8h) avec l'équipe du CHU Ibn Sina. J'ai vécu leur frustration: 7 fois en 8h, nous avons cherché du matériel, perdant 45 min au total. Le problème n'est pas le manque de matériel - c'est que personne ne sait OÙ il est. Les 3-4 appels téléphoniques ne servent à rien car personne ne répond (tous occupés). Impact: 2,500 patients/jour."
        },
        receipts: Array(50).fill({ id: 'test', amount: 3 }),
        marginNotes: [
          { timestamp: new Date(), note: "Épiphanie: ce n'est pas un problème de matériel, c'est un problème de tracking" },
          { timestamp: new Date(), note: "Locke avait raison - je ne pouvais pas CONNAÎTRE ce problème sans le VIVRE" },
          { timestamp: new Date(), note: "Après 50 conversations, ce problème est MIEN maintenant" }
        ],
        revisions: Array(5).fill({ timestamp: new Date(), content: "Revision" })
      }
    }
  ];
  
  for (const step of journey) {
    const score = await agent.calculateLiveScore(step.idea);
    
    console.log(`\n${step.stage}:`);
    console.log(`   Intimacy Score: ${score.current.intimacy.toFixed(1)}/10`);
    console.log(`   Verdict: ${score.breakdown.intimacy.verdict}`);
    console.log(`   Thinking Quality: ${score.thinkingQuality}`);
    console.log(`   Lived Experience: ${score.breakdown.intimacy.livedExperience.detected ? '✅' : '❌'}`);
    console.log(`   Conversations: ${score.breakdown.intimacy.conversationCount.count}`);
    console.log(`   Margin Notes: ${score.marginNoteCount}`);
    console.log(`   Revisions: ${score.revisionCount}`);
    
    if (score.breakdown.intimacy.livedExperience.evidence.length > 0) {
      console.log(`   Evidence: "${score.breakdown.intimacy.livedExperience.evidence[0].substring(0, 80)}..."`);
    }
  }
}

// ==================== EXAMPLE 5: Predictive Insights ====================

/**
 * Example: Showing user what's possible
 * 
 * Use case: "If you add X, you'll gain Y points and reach Z tier"
 */

export async function example5_PredictiveInsights() {
  const agent = new ScoreAgent();
  
  console.log("\n🔮 EXAMPLE 5: Predictive Insights\n");
  
  const currentIdea: Partial<IdeaStatement> = {
    problem: {
      description: "Les infirmières du CHU cherchent du matériel quotidiennement"
    },
    receipts: Array(5).fill({ id: 'test', amount: 3 })
  };
  
  const score = await agent.calculateLiveScore(currentIdea);
  
  console.log("Current State:");
  console.log(`  Score: ${score.current.total.toFixed(1)}/50`);
  console.log(`  Tier: ${score.qualification.tier}`);
  console.log();
  
  console.log("Potential State (if all gaps filled):");
  console.log(`  Score: ${score.potential.total.toFixed(1)}/50`);
  console.log(`  Gain: +${(score.potential.total - score.current.total).toFixed(1)} points`);
  console.log();
  
  console.log("🎯 Quick Wins (low effort, high impact):");
  const quickWins = score.gaps.filter(g => g.effort === 'low' && g.potentialGain > 1);
  quickWins.slice(0, 3).forEach(gap => {
    console.log(`  • ${gap.field}: +${gap.potentialGain.toFixed(1)} points`);
    console.log(`    ${gap.action.french}`);
  });
}

// ==================== EXAMPLE 6: Transparent Scoring ====================

/**
 * Example: Showing the work (how scores are calculated)
 * 
 * Use case: User wants to understand why they got a certain score
 */

export async function example6_TransparentScoring() {
  const agent = new ScoreAgent();
  
  console.log("\n🔍 EXAMPLE 6: Transparent Scoring (Show the Work)\n");
  
  const idea: Partial<IdeaStatement> = {
    problem: {
      description: "Les infirmières du CHU Ibn Sina cherchent du matériel médical 6-8 fois par shift. Actuellement téléphone. Personne ne répond. 2500 patients affectés."
    },
    asIs: {
      description: "Processus: chercher 10 min, appeler 15 min. Coût 2h/jour. Frustrant."
    },
    receipts: Array(12).fill({ id: 'test', amount: 3 })
  };
  
  const score = await agent.calculateLiveScore(idea);
  
  console.log("📊 CLARITY BREAKDOWN (10 points):");
  console.log(`  Problem Statement: ${score.breakdown.clarity.problemStatement.score.toFixed(1)}/10 × 0.25 = ${(score.breakdown.clarity.problemStatement.score * 0.25).toFixed(2)}`);
  console.log(`  As-Is Analysis: ${score.breakdown.clarity.asIsAnalysis.score.toFixed(1)}/10 × 0.25 = ${(score.breakdown.clarity.asIsAnalysis.score * 0.25).toFixed(2)}`);
  console.log(`  Benefits: ${score.breakdown.clarity.benefitsStatement.score.toFixed(1)}/10 × 0.25 = ${(score.breakdown.clarity.benefitsStatement.score * 0.25).toFixed(2)}`);
  console.log(`  Operations: ${score.breakdown.clarity.operationsNeeds.score.toFixed(1)}/10 × 0.25 = ${(score.breakdown.clarity.operationsNeeds.score * 0.25).toFixed(2)}`);
  console.log(`  TOTAL CLARITY: ${score.current.clarity.toFixed(2)}/10`);
  console.log();
  
  console.log("💭 INTIMACY BREAKDOWN (10 points):");
  console.log(`  Lived Experience: ${score.breakdown.intimacy.livedExperience.score.toFixed(1)}/3`);
  console.log(`  Conversations: ${score.breakdown.intimacy.conversationCount.score.toFixed(1)}/3 (${score.breakdown.intimacy.conversationCount.count} receipts)`);
  console.log(`  Iteration Depth: ${score.breakdown.intimacy.iterationDepth.score.toFixed(1)}/2`);
  console.log(`  Specificity: ${score.breakdown.intimacy.specificityLevel.score.toFixed(1)}/2`);
  console.log(`  TOTAL INTIMACY: ${score.current.intimacy.toFixed(2)}/10`);
  console.log(`  Verdict: ${score.breakdown.intimacy.verdict}`);
  console.log();
  
  console.log("🎯 DECISION BREAKDOWN (40 points):");
  console.log(`  Strategic Alignment: ${score.breakdown.decision.strategicAlignment.score.toFixed(1)}/5`);
  console.log(`  Feasibility: ${score.breakdown.decision.feasibility.score.toFixed(1)}/5`);
  console.log(`  Differentiation: ${score.breakdown.decision.differentiation.score.toFixed(1)}/5`);
  console.log(`  Demand Proof: ${score.breakdown.decision.demandProof.score.toFixed(1)}/5`);
  console.log(`  TOTAL DECISION: ${score.current.decision.toFixed(2)}/40`);
  console.log();
  
  console.log("📈 FINAL SCORE:");
  console.log(`  Clarity + Decision = ${score.current.clarity.toFixed(2)} + ${score.current.decision.toFixed(2)} = ${score.current.total.toFixed(2)}/50`);
  console.log(`  Intimacy (Locke): ${score.current.intimacy.toFixed(2)}/10`);
}

// ==================== RUN ALL EXAMPLES ====================

export async function runAllExamples() {
  console.log("🚀 SCORE AGENT - PRACTICAL EXAMPLES\n");
  console.log("=" .repeat(60));
  
  await example1_RealTimeScoring();
  console.log("\n" + "=".repeat(60));
  
  await example2_GapDrivenUI();
  console.log("\n" + "=".repeat(60));
  
  await example3_QualificationDashboard();
  console.log("\n" + "=".repeat(60));
  
  await example4_IntimacyTracker();
  console.log("\n" + "=".repeat(60));
  
  await example5_PredictiveInsights();
  console.log("\n" + "=".repeat(60));
  
  await example6_TransparentScoring();
  console.log("\n" + "=".repeat(60));
  
  console.log("\n✅ All examples completed!");
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

