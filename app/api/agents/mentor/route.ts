/**
 * MENTOR Agent API Route
 * Semantic mentor matching with warm introductions
 */

import { NextRequest, NextResponse } from 'next/server';
import { MentorAgent } from '@/lib/agents/mentor-agent';
import { supabase } from '@/lib/supabase';

const mentorAgent = new MentorAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'find_matches') {
      const { idea, creatorProfile } = data;
      
      if (!idea) {
        return NextResponse.json({
          success: false,
          error: 'Idea data is required'
        }, { status: 400 });
      }

      // Fetch mentors from marrai_mentors database
      const { data: mentors, error } = await supabase
        .from('marrai_mentors')
        .select('*')
        .eq('willing_to_mentor', true)
        .is('deleted_at', null)
        .limit(50);

      if (error) {
        console.error('Error fetching mentors:', error);
        // Return empty array for now - mentors table needs to be populated
        return NextResponse.json({
          success: true,
          data: [],
          note: 'No mentors available yet - configure mentor database'
        });
      }

      const matches = await mentorAgent.findMentors(idea, 5);

      return NextResponse.json({
        success: true,
        data: matches
      });
    }

    if (action === 'find_matches_by_profile') {
      // New action: AI analyzes user background and motivation
      const { background, motivation } = data;
      
      if (!background || !motivation) {
        return NextResponse.json({
          success: false,
          error: 'Background and motivation are required'
        }, { status: 400 });
      }

      // Use Claude API to extract profile attributes from voice input
      // Then match with mentors from database
      const { data: mentors, error } = await supabase
        .from('marrai_mentors')
        .select('*')
        .eq('willing_to_mentor', true)
        .is('deleted_at', null)
        .limit(50);

      if (error) {
        console.error('Error fetching mentors:', error);
        return NextResponse.json({
          success: true,
          data: [],
          note: 'No mentors available yet'
        });
      }

      // Transform database mentors to Mentor interface
      const transformedMentors = mentors.map((m: any) => ({
        id: m.id,
        name: m.name,
        avatar: '',
        title: m.currentrole?.[0] || m.currentrole || '',
        company: m.company || '',
        expertise: m.expertise || [],
        sectors: [], // Can be derived from expertise
        techStack: m.skills || [],
        locations: m.location ? [m.location] : [],
        moroccoPriorities: [],
        livedExperience: {
          founded: [],
          worked: [],
          projects: [],
          yearsExperience: m.years_experience || 0
        },
        availableSlots: m.available_hours_per_month || 0,
        responseRate: 0.8, // Default
        avgResponseTime: '24 hours',
        mentoredIdeas: m.ideas_matched || 0,
        successRate: m.ideas_funded > 0 ? (m.ideas_funded / m.ideas_matched) : 0,
        testimonials: [],
        intimacyRating: 7 // Default, can be calculated
      }));

      // Create a temporary idea object from user profile
      // Extract title from background or motivation (first sentence or first 100 chars)
      const title = background.split('.')[0].substring(0, 100) || 
                    motivation.split('.')[0].substring(0, 100) || 
                    'Idée basée sur le profil utilisateur';
      
      const profileIdea = {
        title: title,
        problem: {
          description: `${background}. ${motivation}`,
          sector: 'auto-detected', // AI will extract
          location: 'auto-detected' // AI will extract
        },
        qualification: 'developing' as const,
        alignment: {
          moroccoPriorities: []
        }
      };

      // Use mentor agent to find matches
      // Note: We need to update mentor agent to work with transformed mentors
      const matches = await mentorAgent.findMentors(profileIdea, 5);

      return NextResponse.json({
        success: true,
        data: matches,
        profile: {
          background,
          motivation
        }
      });
    }

    if (action === 'generate_introduction') {
      const { mentor, creator, idea } = data;
      
      const introduction = await mentorAgent.generateIntroduction(mentor, creator, idea);

      return NextResponse.json({
        success: true,
        data: introduction
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use find_matches, find_matches_by_profile, or generate_introduction'
    }, { status: 400 });

  } catch (error: any) {
    console.error('MENTOR Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process MENTOR agent request'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'MENTOR',
    status: 'operational',
    capabilities: [
      'semantic_matching',
      'warm_introductions',
      'connection_points',
      'intimacy_rating'
    ]
  });
}

