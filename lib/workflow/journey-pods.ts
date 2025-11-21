/**
 * Journey Pods System
 * 
 * Geographic proximity-based pods (same city)
 * - Shared "Done" Definition (MVP Canvas)
 * - Pre-mortem Week 0
 * - Only launch when individuals can complete Step 1 alone
 */

export interface PodMember {
  userId: string;
  name: string;
  city: string;
  role?: 'creator' | 'validator' | 'builder';
  joinedAt: Date;
  completionRate?: number; // % of sprints completed
}

export interface Pod {
  id: string;
  name: string;
  city: string; // Geographic proximity requirement
  members: PodMember[];
  createdAt: Date;
  status: 'forming' | 'active' | 'completed' | 'paused';
  
  // MVP Canvas - Shared "Done" Definition
  doneDefinition?: {
    firstUser?: string; // "Someone outside our network who uses it twice"
    successCriteria?: string[];
    signedAt?: Date;
  };
  
  // Pre-mortem Week 0
  preMortem?: {
    blockers: string[];
    risks: string[];
    mitigation: string[];
    loggedAt: Date;
  };
  
  // Sprint tracking
  currentSprint?: {
    number: number;
    startedAt: Date;
    goal: string;
    completionRate: number; // >50% required before scaling
  };
  
  // Metrics
  sprintCompletionRate: number; // Average across all sprints
  taskEaseScore: number; // Average task ease (must be >3.5/5)
}

/**
 * Check if user can join/create a pod
 * Must have completed Step 1 alone first
 */
export function canJoinPod(userId: string, step1CompletionRate: number): boolean {
  // Must have completed Step 1 with >50% success
  return step1CompletionRate >= 0.5;
}

/**
 * Create a new pod (geographic proximity required)
 */
export function createPod(
  creatorId: string,
  city: string,
  podName: string
): Pod {
  return {
    id: `pod_${Date.now()}`,
    name: podName,
    city,
    members: [{
      userId: creatorId,
      name: 'Creator',
      city,
      role: 'creator',
      joinedAt: new Date()
    }],
    createdAt: new Date(),
    status: 'forming',
    sprintCompletionRate: 0,
    taskEaseScore: 0
  };
}

/**
 * Sign shared "Done" definition (MVP Canvas)
 */
export function signDoneDefinition(
  pod: Pod,
  firstUser: string,
  successCriteria: string[]
): Pod {
  return {
    ...pod,
    doneDefinition: {
      firstUser,
      successCriteria,
      signedAt: new Date()
    },
    status: 'active' // Pod becomes active after signing
  };
}

/**
 * Log pre-mortem (Week 0)
 * "What will make us fail?"
 */
export function logPreMortem(
  pod: Pod,
  blockers: string[],
  risks: string[],
  mitigation: string[]
): Pod {
  return {
    ...pod,
    preMortem: {
      blockers,
      risks,
      mitigation,
      loggedAt: new Date()
    }
  };
}

/**
 * Check if pod is ready for university partnership
 * Must show >50% completion rate
 */
export function isPodReadyForScaling(pod: Pod): boolean {
  return pod.sprintCompletionRate > 0.5 && pod.taskEaseScore > 3.5;
}

/**
 * Match users to pods by geographic proximity
 * Don't auto-match globally yet - start with same city
 */
export function findNearbyPods(userCity: string, allPods: Pod[]): Pod[] {
  return allPods.filter(pod => 
    pod.city.toLowerCase() === userCity.toLowerCase() &&
    pod.status === 'forming' &&
    pod.members.length < 5 // Max 5 pods
  );
}

