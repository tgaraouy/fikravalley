/**
 * FIKRA AGENT - Practical Usage Examples
 * 
 * This file demonstrates real-world usage of the FIKRA agent
 */

import FikraAgent, { type ProblemDraft, type FikraResponse } from '../fikra-agent';

// ==================== EXAMPLE 1: Basic Usage ====================

async function example1_basicUsage() {
  console.log("=== EXAMPLE 1: Basic Usage ===\n");
  
  const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  
  const draft: ProblemDraft = {
    text: "Les infirmières ont des problèmes avec le matériel médical",
    wordCount: 8,
    lastUpdated: new Date()
  };
  
  const response = await agent.analyze(draft);
  
  console.log("Mode:", response.mode);
  console.log("Intimacy Score:", response.intimacyScore, "/10");
  console.log("Clarity Score:", response.clarityScore, "/10");
  console.log("Progress:", response.progress, "%");
  console.log("\nAgent says (French):", response.message.french);
  console.log("Agent says (Darija):", response.message.darija);
  
  if (response.nextQuestion) {
    console.log("\n📝 Next Question:");
    console.log("Gap:", response.nextQuestion.gap);
    console.log("Why it matters:", response.nextQuestion.why);
    console.log("\n✅ Good examples:");
    response.nextQuestion.examples.forEach(ex => console.log("-", ex));
    
    if (response.nextQuestion.badExamples) {
      console.log("\n❌ Bad examples:");
      response.nextQuestion.badExamples.forEach(ex => console.log("-", ex));
    }
  }
}

// ==================== EXAMPLE 2: Evolution from Vague to Intimate ====================

async function example2_evolution() {
  console.log("\n=== EXAMPLE 2: Evolution from Vague to Intimate ===\n");
  
  const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  
  const drafts = [
    {
      iteration: 1,
      text: "Les gens ont des problèmes"
    },
    {
      iteration: 2,
      text: "Les infirmières du CHU Ibn Sina ont des problèmes avec le matériel"
    },
    {
      iteration: 3,
      text: "Les infirmières du CHU Ibn Sina cherchent du matériel médical plusieurs fois par jour"
    },
    {
      iteration: 4,
      text: "Hier, j'ai passé 4 heures au CHU Ibn Sina avec l'infirmière Fatima à chercher un défibrillateur. Les infirmières du service de cardiologie vivent ce problème 6-8 fois par shift de 8 heures. Actuellement, elles appellent 3-4 services mais personne ne répond car tout le monde est occupé."
    }
  ];
  
  for (const draft of drafts) {
    const response = await agent.analyze({
      text: draft.text,
      wordCount: draft.text.split(/\s+/).length,
      lastUpdated: new Date()
    });
    
    console.log(`\n--- Iteration ${draft.iteration} ---`);
    console.log("Text:", draft.text.slice(0, 80) + "...");
    console.log("Mode:", response.mode);
    console.log("Intimacy:", response.intimacyScore.toFixed(1), "/10");
    console.log("Clarity:", response.clarityScore.toFixed(1), "/10");
    console.log("Progress:", response.progress.toFixed(0), "%");
    
    if (response.milestone) {
      console.log("🏆 Milestone:", response.milestone);
    }
  }
}

// ==================== EXAMPLE 3: Detecting Different Gaps ====================

async function example3_gapDetection() {
  console.log("\n=== EXAMPLE 3: Gap Detection ===\n");
  
  const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  
  const testCases = [
    {
      name: "Missing WHO",
      text: "Il y a un problème avec le matériel médical dans les hôpitaux"
    },
    {
      name: "Missing FREQUENCY",
      text: "Les infirmières du CHU Ibn Sina cherchent du matériel médical"
    },
    {
      name: "Missing LIVED_EXPERIENCE",
      text: "Les infirmières du CHU Ibn Sina cherchent du matériel médical chaque jour"
    },
    {
      name: "All Gaps Filled",
      text: "Hier, j'ai vu l'infirmière Fatima au CHU Ibn Sina chercher un défibrillateur pendant 45 minutes. Cela arrive 6-8 fois par shift. Actuellement ils appellent les autres services mais personne ne répond car ils sont occupés avec les patients."
    }
  ];
  
  for (const testCase of testCases) {
    const response = await agent.analyze({
      text: testCase.text,
      wordCount: testCase.text.split(/\s+/).length,
      lastUpdated: new Date()
    });
    
    console.log(`\n--- ${testCase.name} ---`);
    console.log("Gaps remaining:", response.gapsRemaining.length);
    
    if (response.gapsRemaining.length > 0) {
      console.log("Missing:");
      response.gapsRemaining.forEach(gap => {
        console.log(`  - ${gap.type} (${gap.severity})`);
      });
    } else {
      console.log("✅ All critical gaps filled!");
    }
    
    console.log("Next question:", response.nextQuestion?.gap || "None");
  }
}

// ==================== EXAMPLE 4: Multilingual Support ====================

async function example4_multilingual() {
  console.log("\n=== EXAMPLE 4: Multilingual Support ===\n");
  
  const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  
  const drafts = [
    {
      language: "French",
      text: "Les médecins perdent du temps"
    },
    {
      language: "Darija",
      text: "L-tbiba kay-khassrو l-w9t"
    },
    {
      language: "Mixed FR/Darija",
      text: "Les infirmières dial CHU kay-9albو 3la matériel médical kol nhar"
    }
  ];
  
  for (const draft of drafts) {
    const response = await agent.analyze({
      text: draft.text,
      wordCount: draft.text.split(/\s+/).length,
      lastUpdated: new Date()
    });
    
    console.log(`\n--- ${draft.language} ---`);
    console.log("Input:", draft.text);
    console.log("\nResponses:");
    console.log("  French:", response.message.french.slice(0, 100) + "...");
    console.log("  Darija:", response.message.darija.slice(0, 100) + "...");
    
    if (response.nextQuestion) {
      console.log("\n  Question in Arabic:", response.nextQuestion.question.arabic);
    }
  }
}

// ==================== EXAMPLE 5: Tracking Thinking Journey ====================

async function example5_thinkingJourney() {
  console.log("\n=== EXAMPLE 5: Tracking Thinking Journey (Locke's Method) ===\n");
  
  const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  const ideaId = "test-idea-123";
  
  // Simulate user's thinking process
  const marginNotes = [
    {
      section: "problem_statement",
      note: "Je pense que le vrai problème est le manque de communication entre services"
    },
    {
      section: "who",
      note: "Après réflexion, c'est spécifiquement les infirmières de nuit qui souffrent le plus"
    },
    {
      section: "frequency",
      note: "Je me suis trompé - ce n'est pas 'souvent', c'est exactement 6-8 fois par shift"
    },
    {
      section: "lived_experience",
      note: "L'histoire avec Fatima hier illustre parfaitement le problème"
    }
  ];
  
  console.log("User's thinking evolution (like Locke's pencil marks):\n");
  
  for (const note of marginNotes) {
    await agent.saveMarginNote(ideaId, note.section, note.note);
    console.log(`📝 [${note.section}]`);
    console.log(`   "${note.note}"\n`);
  }
  
  // Get the thinking journey
  const journey = await agent.getThinkingJourney(ideaId);
  
  console.log("Journey Summary:");
  console.log("  Total thinking time:", journey.totalThinkingTime, "minutes");
  console.log("  Number of revisions:", journey.revisions.length);
  console.log("  Intimacy evolution:", journey.intimacyEvolution.map(s => s.toFixed(1)).join(" → "));
}

// ==================== EXAMPLE 6: Interactive Session ====================

async function example6_interactiveSession() {
  console.log("\n=== EXAMPLE 6: Simulated Interactive Session ===\n");
  
  const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);
  
  // Simulate a back-and-forth conversation
  const conversation = [
    {
      user: "Les hôpitaux ont des problèmes",
      agentNote: "Too vague - will ask for WHO"
    },
    {
      user: "Les infirmières du CHU Ibn Sina ont des problèmes avec le matériel",
      agentNote: "Better! Now has WHO. Will ask for FREQUENCY"
    },
    {
      user: "Les infirmières du CHU Ibn Sina cherchent du matériel médical chaque jour",
      agentNote: "Has WHO and FREQUENCY. Will challenge for LIVED_EXPERIENCE"
    },
    {
      user: "Hier, j'ai passé 4 heures au CHU Ibn Sina avec l'infirmière Fatima à chercher un défibrillateur pendant une urgence cardiaque",
      agentNote: "Excellent! Has personal experience. Should celebrate!"
    }
  ];
  
  for (let i = 0; i < conversation.length; i++) {
    const turn = conversation[i];
    
    console.log(`\n--- Turn ${i + 1} ---`);
    console.log("👤 USER:", turn.user);
    console.log("💭 Expected:", turn.agentNote);
    
    const response = await agent.analyze({
      text: turn.user,
      wordCount: turn.user.split(/\s+/).length,
      lastUpdated: new Date()
    });
    
    console.log("🤖 FIKRA Mode:", response.mode);
    console.log("🤖 FIKRA Says:", response.message.french.slice(0, 120) + "...");
    console.log("   Intimacy:", response.intimacyScore.toFixed(1), "/10");
    console.log("   Progress:", response.progress.toFixed(0), "%");
    
    if (response.milestone) {
      console.log("   🏆", response.milestone);
    }
  }
}

// ==================== RUN ALL EXAMPLES ====================

async function runAllExamples() {
  try {
    await example1_basicUsage();
    await example2_evolution();
    await example3_gapDetection();
    await example4_multilingual();
    await example5_thinkingJourney();
    await example6_interactiveSession();
    
    console.log("\n\n✅ All examples completed successfully!");
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
  example1_basicUsage,
  example2_evolution,
  example3_gapDetection,
  example4_multilingual,
  example5_thinkingJourney,
  example6_interactiveSession,
  runAllExamples
};

