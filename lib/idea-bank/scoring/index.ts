/**
 * Two-Stage Idea Scoring System
 * 
 * Exports all scoring functions and types
 */

export {
  // Main scoring functions
  scoreIdea,
  scoreIdeaComplete,
  
  // Stage 1 functions
  scoreProblemStatement,
  scoreAsIsAnalysis,
  scoreBenefitStatement,
  scoreOperationalNeeds,
  scoreStage1,
  
  // Stage 2 functions
  scoreStrategicFit,
  scoreFeasibility,
  scoreDifferentiation,
  scoreEvidenceOfDemand,
  scoreStage2,
  
  // Alignment & SDG functions
  autoTagSDGs,
  
  // Utility functions
  detectDarija,
  calculateBreakEven,
  getScoringRecommendations,
  generateAlignmentFeedback,
  
  // Types
  type IdeaScoringInput,
  type IdeaAlignment,
  type Stage1Scores,
  type Stage2Scores,
  type IdeaScoringResult,
  type CompleteScoringResult,
} from './two-stage-scorer';

export {
  // Morocco priorities
  MOROCCO_PRIORITIES,
  getMoroccoPriority,
  detectMoroccoPriorities,
  detectMoroccoPrioritiesWithConfidence,
  type MoroccoPriority,
} from './morocco-priorities';

