/**
 * NLP Module
 * 
 * Exports all NLP functions
 */

export {
  analyzeDarijaText,
  extractKeywords,
  detectSentiment,
  parseNumbers,
  extractEntities,
  extractEntitiesWithContext,
  batchAnalyzeDarijaTexts,
  getAnalysisSummary,
  detectMoroccoPriorities,
  detectMoroccoPrioritiesWithConfidence,
  type DarijaAnalysis,
  type ParsedNumber,
  type ExtractedEntities,
  type IntentType,
  type CodeSwitch,
} from './darija-analyzer';

