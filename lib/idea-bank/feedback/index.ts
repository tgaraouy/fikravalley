/**
 * Clarity Feedback System
 * 
 * Exports all feedback functions and types
 */

export {
  generateClarityFeedback,
  formatFeedbackAsText,
  formatFeedbackAsHTML,
  formatFeedbackAsWhatsApp,
  formatFeedbackAsMarkdown,
  type FeedbackInput,
  type ClarityFeedback,
  type FeedbackItem,
  type OverallFeedback,
} from './clarity-feedback';

export {
  runFeedbackTests,
  testIdeas,
} from './clarity-feedback.test';

