/**
 * Agent Orchestration API
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator, type Agent } from '@/lib/agents/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agents, sprintGoal, deadline } = body;

    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Agents array is required' },
        { status: 400 }
      );
    }

    if (!sprintGoal || !deadline) {
      return NextResponse.json(
        { success: false, error: 'sprintGoal and deadline are required' },
        { status: 400 }
      );
    }

    const orchestrator = new AgentOrchestrator(
      agents as Agent[],
      sprintGoal,
      new Date(deadline)
    );

    const conflicts = orchestrator.generateConflictChecks();
    const schedule = orchestrator.generateSchedule(5);
    const code = orchestrator.generateOrchestrationCode();

    return NextResponse.json({
      success: true,
      data: {
        conflicts,
        schedule,
        code
      }
    });
  } catch (error: any) {
    console.error('Error orchestrating agents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

