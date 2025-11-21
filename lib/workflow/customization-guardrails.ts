/**
 * Customization Debt Guardrails
 * 
 * Prevent "customization as escape from discipline"
 * Based on hackathon research: enforced constraints, not freedom
 * Platform should feel like a creative constraint engine, not blank canvas
 */

export interface UserWorkflowHistory {
  userId: string;
  completedPods: number;
  sprintCompletionRate: number; // Average across all pods
  taskEaseScore: number; // Average task ease (must be >3.5/5)
  customizationAttempts: number;
  lastCustomizationAt?: Date;
}

/**
 * Check if user can customize workflow
 * 
 * Requirements:
 * - Must have completed 2 full pods
 * - Must have >60% sprint completion rate
 * - Must maintain task ease score >3.5/5 across both
 */
export function canCustomizeWorkflow(user: UserWorkflowHistory): boolean {
  // Must have completed 2 full pods
  if (user.completedPods < 2) {
    return false;
  }
  
  // Must have >60% sprint completion rate
  if (user.sprintCompletionRate < 0.6) {
    return false;
  }
  
  // Must maintain task ease score >3.5/5
  if (user.taskEaseScore < 3.5) {
    return false;
  }
  
  return true;
}

/**
 * Track customization attempt
 * Logs when user tries to customize before being eligible
 */
export function trackCustomizationAttempt(userId: string): void {
  const key = `customization_attempts_${userId}`;
  const attempts = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, attempts.toString());
  localStorage.setItem(`last_customization_${userId}`, new Date().toISOString());
}

/**
 * Get customization eligibility message
 */
export function getCustomizationMessage(user: UserWorkflowHistory): string {
  if (user.completedPods < 2) {
    return `Complète ${2 - user.completedPods} pod(s) supplémentaire(s) pour débloquer la personnalisation`;
  }
  
  if (user.sprintCompletionRate < 0.6) {
    return `Améliore ton taux de complétion à 60%+ (actuellement ${Math.round(user.sprintCompletionRate * 100)}%)`;
  }
  
  if (user.taskEaseScore < 3.5) {
    return `Améliore ta facilité de tâche à 3.5/5+ (actuellement ${user.taskEaseScore.toFixed(1)}/5)`;
  }
  
  return 'Tu peux maintenant personnaliser ton workflow!';
}

/**
 * Enforce constraint-based workflow
 * Returns available templates (not blank canvas)
 */
export function getAvailableTemplates(user: UserWorkflowHistory): string[] {
  // Start with template-only
  const baseTemplates = [
    'template_problem_validation',
    'template_solution_building',
    'template_market_research',
    'template_prototype_testing'
  ];
  
  // Unlock more templates as user progresses
  if (user.completedPods >= 1) {
    baseTemplates.push('template_advanced_validation');
  }
  
  if (user.completedPods >= 2 && canCustomizeWorkflow(user)) {
    baseTemplates.push('template_custom');
  }
  
  return baseTemplates;
}

