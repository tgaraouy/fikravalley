/**
 * Think-Time UX System
 * 
 * Respects cognitive latency in mobile-first Morocco
 * - Handles interruptions gracefully
 * - Saves drafts locally (24h cool-off)
 * - Micro-validation after each step
 * - Task-difficulty surveys
 */

export interface MicroStep {
  id: string;
  name: string;
  description: string;
  estimatedTimeSeconds: number;
  difficulty?: number; // 1-5 scale from user feedback
  blockers?: string[]; // Open-text blockers reported
  completedAt?: Date;
  taskSuccessRate?: number; // < 3.5/5 = automatic flag
}

export interface ThinkTimeSession {
  userId: string;
  ideaId?: string;
  currentStep: number;
  steps: MicroStep[];
  startedAt: Date;
  lastActivity: Date;
  draftSavedAt?: Date;
  interruptions: number; // Track how many times user left and came back
  totalThinkTime: number; // Cumulative seconds of active thinking
}

/**
 * Save draft locally for 24h cool-off
 * Handles spotty connectivity - don't rely on server roundtrip
 */
export function saveDraftLocally(session: ThinkTimeSession): void {
  const key = `fikra_draft_${session.userId}_${Date.now()}`;
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24h cool-off
  
  localStorage.setItem(key, JSON.stringify({
    ...session,
    expiry: expiry.toISOString()
  }));
  
  // Clean up old drafts (older than 24h)
  cleanupOldDrafts();
}

/**
 * Load draft from local storage
 */
export function loadDraftLocally(userId: string): ThinkTimeSession | null {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(`fikra_draft_${userId}_`));
  
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const expiry = new Date(data.expiry);
      
      if (expiry > new Date()) {
        return data as ThinkTimeSession;
      } else {
        localStorage.removeItem(key); // Expired
      }
    } catch (e) {
      // Invalid draft, skip
    }
  }
  
  return null;
}

/**
 * Clean up drafts older than 24h
 */
function cleanupOldDrafts(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('fikra_draft_'));
  
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const expiry = new Date(data.expiry);
      
      if (expiry <= new Date()) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      localStorage.removeItem(key); // Invalid, remove
    }
  }
}

/**
 * Track task difficulty after each micro-step
 * Returns true if difficulty < 3.5/5 (needs attention)
 */
export function recordTaskDifficulty(
  stepId: string,
  difficulty: number, // 1-5 scale
  blockers?: string
): boolean {
  const key = `task_difficulty_${stepId}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  
  history.push({
    difficulty,
    blockers,
    timestamp: new Date().toISOString()
  });
  
  localStorage.setItem(key, JSON.stringify(history));
  
  // Calculate average
  const avg = history.reduce((sum: number, h: any) => sum + h.difficulty, 0) / history.length;
  
  // Flag if < 3.5/5
  return avg < 3.5;
}

/**
 * Get task success rate for a step
 */
export function getTaskSuccessRate(stepId: string): number {
  const key = `task_difficulty_${stepId}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  
  if (history.length === 0) return 0;
  
  const avg = history.reduce((sum: number, h: any) => sum + h.difficulty, 0) / history.length;
  return avg;
}

/**
 * Track interruption (user leaves and comes back)
 */
export function trackInterruption(session: ThinkTimeSession): ThinkTimeSession {
  return {
    ...session,
    interruptions: session.interruptions + 1,
    lastActivity: new Date()
  };
}

/**
 * Calculate total think time (active time, not wall-clock)
 */
export function updateThinkTime(session: ThinkTimeSession, activeSeconds: number): ThinkTimeSession {
  return {
    ...session,
    totalThinkTime: session.totalThinkTime + activeSeconds,
    lastActivity: new Date()
  };
}

