/**
 * PROOF AGENT - Practical Usage Examples
 * 
 * Demonstrates real-world usage of the PROOF agent for receipt collection strategies
 */

import ProofAgent, { type IdeaStatement, type ReceiptStrategy } from '../proof-agent';

// ==================== EXAMPLE 1: Healthcare Problem (High-pain, In-Person) ====================

async function example1_healthcareProblem() {
  console.log("=== EXAMPLE 1: Healthcare Problem → In-Person Strategy ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
  const idea: IdeaStatement = {
    problem: {
      who: "Infirmières du service cardiologie",
      where: "CHU Ibn Sina, Rabat",
      painIntensity: 4.8,
      frequency: "6-8 fois par shift de 8 heures"
    },
    solution: "Application mobile pour localiser le matériel médical en temps réel",
    category: "Santé"
  };
  
  const strategy = await agent.generateStrategy(idea);
  
  console.log("Method:", strategy.method);
  console.log("\nReasoning:", strategy.reasoning);
  console.log("\nExpected Results:");
  console.log("  Timeframe:", strategy.expectedResults.timeframe);
  console.log("  Receipts:", strategy.expectedResults.receipts);
  console.log("  Success Rate:", (strategy.expectedResults.successRate * 100).toFixed(0) + "%");
  console.log("  Confidence:", strategy.expectedResults.confidence);
  
  console.log("\nStep-by-step:");
  strategy.steps.forEach(step => {
    console.log(`\n  Step ${step.step}: ${step.action}`);
    console.log(`    Difficulty: ${step.difficulty}`);
    console.log(`    Time: ${step.estimatedTime}`);
    console.log(`    Tip: ${step.tip}`);
    if (step.script) {
      console.log(`    Script: "${step.script.slice(0, 100)}..."`);
    }
  });
  
  console.log("\n🎯 Locke's Intimacy Requirement:");
  console.log(strategy.intimacyRequirement);
  
  console.log("\n💭 Thinking Prompts:");
  strategy.thinkingPrompts.forEach((prompt, i) => {
    console.log(`  ${i + 1}. ${prompt}`);
  });
  
  console.log("\n📦 Materials Needed:");
  strategy.materials.needed.forEach(item => {
    console.log(`  - ${item}`);
  });
}

// ==================== EXAMPLE 2: Student Problem (Tech-savvy, Online) ====================

async function example2_studentProblem() {
  console.log("\n=== EXAMPLE 2: Student Problem → Online Strategy ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
  const idea: IdeaStatement = {
    problem: {
      who: "Étudiants en 2ème Bac Sciences",
      where: "Lycées publics de Casablanca",
      painIntensity: 2.8,
      frequency: "Pendant période de révisions (3 mois)"
    },
    solution: "Plateforme de cours en Darija avec exercices interactifs",
    category: "Éducation"
  };
  
  const strategy = await agent.generateStrategy(idea);
  
  console.log("Method:", strategy.method);
  console.log("\nWhy this method:");
  console.log(strategy.reasoning);
  
  console.log("\n⚠️ Locke's Warning (Online Strategy):");
  console.log(strategy.intimacyRequirement);
  
  console.log("\nCompensation strategy:");
  const compensationSteps = strategy.steps.filter(s => 
    s.tip.includes('appel') || s.action.includes('appel')
  );
  if (compensationSteps.length > 0) {
    console.log("✅ Strategy includes offline compensation:", compensationSteps[0].action);
  }
}

// ==================== EXAMPLE 3: Progress Tracking ====================

async function example3_progressTracking() {
  console.log("\n=== EXAMPLE 3: Progress Tracking ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
  const milestones = [0, 1, 5, 10, 25, 50, 100, 200, 500];
  
  console.log("Receipt Collection Journey:\n");
  
  for (const count of milestones) {
    const coaching = await agent.provideCoaching(count);
    
    console.log(`\n--- ${count} Receipts ---`);
    console.log(`Score: ${coaching.score}/5`);
    console.log(`Tone: ${coaching.message.tone}`);
    console.log(`\nMessage (French):`);
    console.log(coaching.message.french.slice(0, 200) + "...");
    
    if (coaching.intimacyInsight) {
      console.log(`\n💡 Intimacy Insight:`);
      console.log(coaching.intimacyInsight);
    }
    
    console.log(`\n📍 Next Action:`);
    console.log(coaching.nextAction);
    
    if (coaching.targetMilestone) {
      console.log(`\n🎯 Next Milestone: ${coaching.targetMilestone} receipts`);
    } else {
      console.log(`\n🏆 MAX LEVEL ACHIEVED!`);
    }
  }
}

// ==================== EXAMPLE 4: Receipt Validation ====================

async function example4_receiptValidation() {
  console.log("\n=== EXAMPLE 4: Receipt Validation ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
  // Simulate receipt validation
  console.log("Validating receipt...\n");
  
  const mockPhoto = new File(['mock receipt'], 'receipt.jpg', { type: 'image/jpeg' });
  const validation = await agent.validateReceipt(mockPhoto, 'idea-123');
  
  console.log("Receipt ID:", validation.receiptId);
  console.log("Valid:", validation.valid ? "✅" : "❌");
  console.log("Confidence:", (validation.confidence * 100).toFixed(0) + "%");
  console.log("Auto-approved:", validation.autoApproved ? "✅" : "❌");
  
  console.log("\nExtracted Data:");
  console.log("  Amount:", validation.extracted.amount, "DH");
  console.log("  Date:", validation.extracted.date?.toLocaleDateString() || "N/A");
  console.log("  Signature:", validation.extracted.signature ? "✅" : "❌");
  console.log("  Name:", validation.extracted.name || "N/A");
  
  if (validation.issues.length > 0) {
    console.log("\n⚠️ Issues:");
    validation.issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }
  
  if (validation.fraudFlags.length > 0) {
    console.log("\n🚨 Fraud Flags:");
    validation.fraudFlags.forEach(flag => {
      console.log(`  [${flag.severity.toUpperCase()}] ${flag.type}: ${flag.message}`);
    });
  }
}

// ==================== EXAMPLE 5: Comparing Strategies ====================

async function example5_compareStrategies() {
  console.log("\n=== EXAMPLE 5: Strategy Comparison ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
  const ideas: Array<{ name: string; idea: IdeaStatement }> = [
    {
      name: "High-pain Healthcare",
      idea: {
        problem: { who: "Doctors", where: "Hospital", painIntensity: 4.8, frequency: "daily" },
        solution: "Emergency system", category: "Health"
      }
    },
    {
      name: "Tech Students",
      idea: {
        problem: { who: "CS students", where: "University", painIntensity: 2.5, frequency: "weekly" },
        solution: "Code help", category: "Education"
      }
    },
    {
      name: "Young Entrepreneurs",
      idea: {
        problem: { who: "Jeunes entrepreneurs", where: "Coworking", painIntensity: 3.5, frequency: "often" },
        solution: "Business network", category: "Business"
      }
    }
  ];
  
  console.log("Method | Timeframe | Receipts | Success Rate | Confidence");
  console.log("-------|-----------|----------|--------------|------------");
  
  for (const { name, idea } of ideas) {
    const strategy = await agent.generateStrategy(idea);
    console.log(
      `${strategy.method.padEnd(20)} | ` +
      `${strategy.expectedResults.timeframe.padEnd(10)} | ` +
      `${strategy.expectedResults.receipts.padEnd(12)} | ` +
      `${(strategy.expectedResults.successRate * 100).toFixed(0)}%`.padEnd(13) + ` | ` +
      `${strategy.expectedResults.confidence}`
    );
    console.log(`└─ ${name}`);
  }
}

// ==================== EXAMPLE 6: Interactive Collection Simulation ====================

async function example6_interactiveSimulation() {
  console.log("\n=== EXAMPLE 6: Interactive Collection Simulation ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
  // Simulate a user collecting receipts over time
  const days = [
    { day: 1, receipts: 0, event: "Strategy generated" },
    { day: 2, receipts: 3, event: "First 3 receipts from friends" },
    { day: 3, receipts: 8, event: "Network referrals kicking in" },
    { day: 4, receipts: 12, event: "Milestone: 10+ receipts!" },
    { day: 5, receipts: 25, event: "Momentum building" },
    { day: 7, receipts: 52, event: "Milestone: 50+ receipts!" },
    { day: 10, receipts: 120, event: "Community buzz" },
    { day: 14, receipts: 210, event: "Milestone: 200+ receipts! 🏆" }
  ];
  
  console.log("📅 Collection Journey:\n");
  
  for (const { day, receipts, event } of days) {
    const coaching = await agent.provideCoaching(receipts);
    
    console.log(`\nDay ${day}: ${receipts} receipts - ${event}`);
    console.log(`  Score: ${coaching.score}/5`);
    console.log(`  Tone: ${coaching.message.tone}`);
    
    // Show milestone celebrations
    if (receipts === 12 || receipts === 52 || receipts === 210) {
      console.log(`  🎉 MILESTONE!`);
      console.log(`  Message: ${coaching.message.french.slice(0, 100)}...`);
    }
    
    // Show progress bar
    const progress = Math.min(100, (receipts / 200) * 100);
    const filled = Math.floor(progress / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`  Progress: [${bar}] ${progress.toFixed(0)}%`);
  }
  
  console.log("\n✅ Collection complete! Ready for funding stage.");
}

// ==================== EXAMPLE 7: Locke Philosophy in Action ====================

async function example7_lockePhilosophy() {
  console.log("\n=== EXAMPLE 7: Locke's Philosophy in Action ===\n");
  
  const agent = new ProofAgent(process.env.ANTHROPIC_API_KEY);
  
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
  
  console.log("🎓 John Locke's Influence on PROOF Agent:\n");
  
  console.log("1️⃣ The Pencil Mark Metaphor:");
  console.log("   3-DH receipt = Locke's pencil mark in book");
  console.log("   Physical proof of intimate engagement\n");
  
  console.log("2️⃣ Intimacy Requirement:");
  console.log(strategy.intimacyRequirement.slice(0, 300) + "...\n");
  
  console.log("3️⃣ Thinking Prompts (Reflection Method):");
  strategy.thinkingPrompts.forEach((prompt, i) => {
    console.log(`   ${i + 1}. ${prompt}`);
  });
  
  console.log("\n4️⃣ Progress as Growing Knowledge:");
  const milestones = [10, 50, 200];
  for (const count of milestones) {
    const coaching = await agent.provideCoaching(count);
    if (coaching.intimacyInsight) {
      console.log(`\n   At ${count} receipts:`);
      console.log(`   "${coaching.intimacyInsight.slice(0, 150)}..."`);
    }
  }
  
  console.log("\n5️⃣ The Transformation:");
  console.log("   Before:  'Les gens ont ce problème' (knowing OF)");
  console.log("   After:   'J'ai eu 200 conversations' (TRUE KNOWING)");
  console.log("   Result:  Problem becomes INTIMATELY yours");
}

// ==================== RUN ALL EXAMPLES ====================

async function runAllExamples() {
  try {
    await example1_healthcareProblem();
    await example2_studentProblem();
    await example3_progressTracking();
    await example4_receiptValidation();
    await example5_compareStrategies();
    await example6_interactiveSimulation();
    await example7_lockePhilosophy();
    
    console.log("\n\n✅ All PROOF agent examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

// Run if called directly
if (require.main === module) {
  runAllExamples();
}

// Export for use in other files
export {
  example1_healthcareProblem,
  example2_studentProblem,
  example3_progressTracking,
  example4_receiptValidation,
  example5_compareStrategies,
  example6_interactiveSimulation,
  example7_lockePhilosophy,
  runAllExamples
};

