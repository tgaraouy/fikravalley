/**
 * Phased Workflow System
 * 
 * Sequencing: Think-Time UX → Pods → University → Power User → Hardware
 * Build each only when previous shows >50% completion rate
 */

export type WorkflowPhase = 
  | 'think_time_ux'      // Month 1: Solo micro-validation
  | 'journey_pods'       // Month 2: Local pods (5 max)
  | 'university'         // Month 3: Campus partnerships
  | 'power_user'         // Month 4+: Customization unlocked
  | 'hardware_pilot';    // Future: Hardware integration

export interface PhaseMetrics {
  phase: WorkflowPhase;
  completionRate: number; // >50% required to unlock next
  taskEaseScore: number; // >3.5/5 required
  userCount: number;
  startedAt: Date;
  unlockedAt?: Date;
}

/**
 * Check if next phase can be unlocked
 * Must show >50% completion rate
 */
export function canUnlockNextPhase(currentPhase: PhaseMetrics): boolean {
  return currentPhase.completionRate > 0.5 && currentPhase.taskEaseScore > 3.5;
}

/**
 * Get current phase based on user progress
 */
export function getCurrentPhase(userMetrics: {
  soloCompletionRate: number;
  podCompletionRate: number;
  universityPartnership: boolean;
}): WorkflowPhase {
  // Start with Think-Time UX
  if (userMetrics.soloCompletionRate < 0.5) {
    return 'think_time_ux';
  }
  
  // Unlock Pods when solo >50%
  if (userMetrics.podCompletionRate < 0.5) {
    return 'journey_pods';
  }
  
  // Unlock University when pods >50%
  if (!userMetrics.universityPartnership) {
    return 'university';
  }
  
  // Power User tier (customization unlocked)
  return 'power_user';
}

/**
 * SUS-style benchmark (System Usability Scale)
 * Measure at Week 2, then quarterly
 */
export interface SUSBenchmark {
  score: number; // 0-100
  measuredAt: Date;
  nextMeasurement: Date; // Quarterly
}

export function calculateSUSScore(responses: number[]): number {
  // SUS calculation: (sum of odd items - 5) + (25 - sum of even items) * 2.5
  // Simplified: average of all responses * 2.5
  const avg = responses.reduce((a, b) => a + b, 0) / responses.length;
  return avg * 2.5;
}

/**
 * WhatsApp-first module delivery
 * 99% open rate vs. 20% email
 */
export function sendModuleViaWhatsApp(userPhone: string, moduleUrl: string): void {
  // In production, integrate with WhatsApp Business API
  const message = `🎯 Nouveau module Fikra Valley:\n${moduleUrl}\n\nRéponds STOP pour arrêter.`;
  
  // For now, log (implement WhatsApp API integration)
  console.log(`WhatsApp to ${userPhone}: ${message}`);
  
  // TODO: Integrate with WhatsApp Business API
  // fetch('/api/whatsapp/send', { method: 'POST', body: { phone: userPhone, message } });
}

