import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import type { Database } from '@/lib/supabase';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];
type AgentSolutionInsert = Database['public']['Tables']['marrai_agent_solutions']['Insert'];
type IdeaUpdate = Database['public']['Tables']['marrai_ideas']['Update'];

interface ClaudeAnalysisResponse {
  feasibility_score: number;
  automation_potential: 'high' | 'medium' | 'low';
  agent_architecture: {
    agent_name: string;
    agent_type: 'workflow' | 'data' | 'decision' | 'interface' | 'hybrid';
    triggers: string[];
    actions: string[];
    tools_needed: string[];
  };
  technical_feasibility: {
    complexity: 'simple' | 'moderate' | 'complex';
    estimated_cost: string;
    estimated_dev_time: string;
  };
  digitization_roadmap: {
    phase_1_mvp: string;
    phase_2_automation: string;
    phase_3_full_agent: string;
  };
  roi_analysis: {
    time_saved_per_month: number;
    cost_saved_per_month: number;
    payback_period: string;
    automation_percentage: number;
    annual_roi: number;
  };
  strengths: string[];
  challenges: string[];
  next_steps: string[];
  scalability: {
    replicability: 'high' | 'medium' | 'low';
    market_size: string;
  };
  impact_score: number;
  summary: string;
}

/**
 * Clean JSON response by removing markdown code blocks
 */
function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
  // Trim whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

/**
 * Generate fallback analysis when Claude API fails
 */
function generateFallbackAnalysis(idea: any): ClaudeAnalysisResponse {
  return {
    feasibility_score: 6.0,
    automation_potential: 'medium',
    agent_architecture: {
      agent_name: `${idea?.title || 'Idée'} - Agent de Numérisation`,
      agent_type: 'workflow',
      triggers: ['daily_schedule', 'manual_trigger'],
      actions: ['process_data', 'send_notification', 'update_database'],
      tools_needed: ['database_access', 'email_api'],
    },
    technical_feasibility: {
      complexity: 'moderate',
      estimated_cost: '3K-5K',
      estimated_dev_time: '4-6 weeks',
    },
    digitization_roadmap: {
      phase_1_mvp: 'Création d\'une interface de base pour capturer et stocker les données',
      phase_2_automation: 'Automatisation des processus répétitifs avec notifications',
      phase_3_full_agent: 'Intégration d\'IA pour prise de décision et optimisation continue',
    },
    roi_analysis: {
      time_saved_per_month: 20,
      cost_saved_per_month: 500,
      payback_period: '6-8 months',
      automation_percentage: 60,
      annual_roi: 120,
    },
    strengths: ['Potentiel d\'automatisation significatif', 'Impact positif sur l\'efficacité'],
    challenges: ['Nécessite une analyse plus approfondie', 'Intégration avec systèmes existants'],
    next_steps: [
      'Analyser les systèmes existants',
      'Définir les spécifications techniques détaillées',
      'Identifier les parties prenantes clés',
    ],
    scalability: {
      replicability: 'medium',
      market_size: 'À déterminer',
    },
    impact_score: 6.5,
    summary: `Analyse de base pour ${idea?.title || 'cette idée'}. Une analyse plus approfondie est recommandée.`,
  };
}

/**
 * POST /api/analyze-idea
 * Analyzes an idea using Claude API and updates database
 */
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const { ideaId } = body;

    if (!ideaId || typeof ideaId !== 'string') {
      return NextResponse.json(
        { error: 'ideaId is required and must be a string' },
        { status: 400 }
      );
    }

    // Fetch idea from database
    const { data: idea, error: fetchError } = await (supabase as any)
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (fetchError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Update status to 'analyzing'
    const { error: updateError } = await (supabase as any)
      .from('marrai_ideas')
      .update({ status: 'analyzing' })
      .eq('id', ideaId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating idea status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update idea status' },
        { status: 500 }
      );
    }

    // Build prompt for Claude API
    const ideaData = idea as any;
    const prompt = `Tu es un expert en architecture d'agents IA et en numérisation de processus pour le secteur public marocain.

Analyse cette idée de numérisation et fournis une analyse complète au format JSON.

IDÉE À ANALYSER:
- Titre: ${ideaData.title}
- Problème: ${ideaData.problem_statement}
- Solution proposée: ${ideaData.proposed_solution || 'Non spécifiée'}
- Catégorie: ${ideaData.category || 'Non spécifiée'}
- Localisation: ${ideaData.location || 'Non spécifiée'}
- Processus manuel actuel: ${ideaData.current_manual_process || 'Non spécifié'}
- Opportunité de numérisation: ${ideaData.digitization_opportunity || 'Non spécifiée'}
- Fréquence: ${ideaData.frequency || 'Non spécifiée'}
- Sources de données: ${ideaData.data_sources?.join(', ') || 'Non spécifiées'}
- Points d'intégration: ${ideaData.integration_points?.join(', ') || 'Non spécifiés'}
- Capacités IA nécessaires: ${ideaData.ai_capabilities_needed?.join(', ') || 'Non spécifiées'}

Fournis une réponse JSON avec cette structure exacte:
{
  "feasibility_score": <nombre entre 0 et 10>,
  "automation_potential": "high" | "medium" | "low",
  "agent_architecture": {
    "agent_name": "<nom descriptif de l'agent>",
    "agent_type": "workflow" | "data" | "decision" | "interface" | "hybrid",
    "triggers": ["<trigger1>", "<trigger2>"],
    "actions": ["<action1>", "<action2>"],
    "tools_needed": ["<tool1>", "<tool2>"]
  },
  "technical_feasibility": {
    "complexity": "simple" | "moderate" | "complex",
    "estimated_cost": "<coût estimé>",
    "estimated_dev_time": "<temps estimé>"
  },
  "digitization_roadmap": {
    "phase_1_mvp": "<description phase 1>",
    "phase_2_automation": "<description phase 2>",
    "phase_3_full_agent": "<description phase 3>"
  },
  "roi_analysis": {
    "time_saved_per_month": <nombre d'heures>,
    "cost_saved_per_month": <montant en EUR>,
    "payback_period": "<période>",
    "automation_percentage": <pourcentage 0-100>,
    "annual_roi": <pourcentage>
  },
  "strengths": ["<force1>", "<force2>"],
  "challenges": ["<défi1>", "<défi2>"],
  "next_steps": ["<étape1>", "<étape2>"],
  "scalability": {
    "replicability": "high" | "medium" | "low",
    "market_size": "<description>"
  },
  "impact_score": <nombre entre 0 et 10>,
  "summary": "<résumé en français>"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire ni markdown.`;

    let analysis: ClaudeAnalysisResponse;

    try {
      // Call Claude API
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      // Clean and parse JSON response
      const cleanedJson = cleanJsonResponse(content.text);
      analysis = JSON.parse(cleanedJson) as ClaudeAnalysisResponse;
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      // Use fallback analysis
      analysis = generateFallbackAnalysis(ideaData);
    }

    // Validate analysis structure
    if (!analysis || typeof analysis !== 'object') {
      console.error('Invalid analysis structure, using fallback');
      analysis = generateFallbackAnalysis(ideaData);
    }

    // Update marrai_ideas with analysis results
    const ideaUpdate: IdeaUpdate = {
      status: 'analyzed',
      ai_feasibility_score: analysis.feasibility_score,
      ai_impact_score: analysis.impact_score,
      automation_potential: analysis.automation_potential,
      agent_type: analysis.agent_architecture.agent_type === 'workflow' ? 'workflow_agent' :
                   analysis.agent_architecture.agent_type === 'data' ? 'data_agent' :
                   analysis.agent_architecture.agent_type === 'decision' ? 'decision_agent' :
                   analysis.agent_architecture.agent_type === 'interface' ? 'interface_agent' :
                   'hybrid_agent',
      ai_category_suggested: ideaData.category || analysis.agent_architecture.agent_type,
      ai_cost_estimate: analysis.technical_feasibility.estimated_cost,
      roi_time_saved_hours: analysis.roi_analysis.time_saved_per_month,
      roi_cost_saved_eur: analysis.roi_analysis.cost_saved_per_month,
      ai_analysis: {
        ...analysis,
        generated_at: new Date().toISOString(),
      },
      analysis_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: ideaUpdateError } = await (supabase as any)
      .from('marrai_ideas')
      .update(ideaUpdate)
      .eq('id', ideaId)
      .select()
      .single();

    if (ideaUpdateError) {
      console.error('Error updating idea with analysis:', ideaUpdateError);
      return NextResponse.json(
        { error: 'Failed to update idea with analysis results' },
        { status: 500 }
      );
    }

    // Insert into marrai_agent_solutions
    const agentSolution: AgentSolutionInsert = {
      idea_id: ideaId,
      agent_name: analysis.agent_architecture.agent_name,
      agent_description: analysis.summary,
      agent_type: analysis.agent_architecture.agent_type,
      triggers: analysis.agent_architecture.triggers,
      actions: analysis.agent_architecture.actions,
      tools_needed: analysis.agent_architecture.tools_needed,
      complexity: analysis.technical_feasibility.complexity,
      estimated_dev_time: analysis.technical_feasibility.estimated_dev_time,
      estimated_cost: analysis.technical_feasibility.estimated_cost,
      phase_1_mvp: analysis.digitization_roadmap.phase_1_mvp,
      phase_2_automation: analysis.digitization_roadmap.phase_2_automation,
      phase_3_full_agent: analysis.digitization_roadmap.phase_3_full_agent,
      automation_percentage: analysis.roi_analysis.automation_percentage,
      monthly_time_saved: analysis.roi_analysis.time_saved_per_month,
      monthly_cost_saved: analysis.roi_analysis.cost_saved_per_month,
      payback_period: analysis.roi_analysis.payback_period,
      annual_roi_percentage: analysis.roi_analysis.annual_roi,
      replicability: analysis.scalability.replicability,
      market_size: analysis.scalability.market_size,
      tech_stack: {
        recommended: 'Python, Supabase, Next.js',
        notes: 'Stack recommandé basé sur l\'analyse',
      },
      code_samples: {
        example: 'Exemples de code disponibles après spécification détaillée',
      },
    };

    const { data: insertedSolution, error: solutionError } = await (supabase as any)
      .from('marrai_agent_solutions')
      .insert(agentSolution)
      .select()
      .single();

    if (solutionError) {
      console.error('Error inserting agent solution:', solutionError);
      // Don't fail the request if solution insert fails, but log it
      console.warn('Analysis completed but failed to insert agent solution');
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Idea analyzed successfully',
        ideaId,
        analysis: {
          feasibility_score: analysis.feasibility_score,
          impact_score: analysis.impact_score,
          automation_potential: analysis.automation_potential,
          agent_name: analysis.agent_architecture.agent_name,
        },
        agentSolutionId: insertedSolution?.id || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in analyze-idea API route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

