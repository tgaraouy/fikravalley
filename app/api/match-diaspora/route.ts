import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];
type DiasporaProfileRow = Database['public']['Tables']['marrai_diaspora_profiles']['Row'];

interface MatchResult {
  profile: DiasporaProfileRow;
  score: number;
  reasoning: {
    expertiseOverlap: number;
    skillOverlap: number;
    locationProximity: number;
    willingnessToHelp: number;
    details: string[];
  };
}

/**
 * Calculate match score between an idea and a diaspora profile
 */
function calculateMatchScore(
  idea: IdeaRow,
  profile: DiasporaProfileRow
): { score: number; reasoning: MatchResult['reasoning'] } {
  const reasoning: MatchResult['reasoning'] = {
    expertiseOverlap: 0,
    skillOverlap: 0,
    locationProximity: 0,
    willingnessToHelp: 0,
    details: [],
  };

  // 1. Expertise overlap (40 points)
  // Check if profile expertise matches idea category
  if (idea.category && profile.expertise) {
    const ideaCategory = idea.category.toLowerCase();
    const profileExpertise = Array.isArray(profile.expertise)
      ? profile.expertise.map((e) => e.toLowerCase())
      : [String(profile.expertise).toLowerCase()];

    // Direct match
    if (profileExpertise.includes(ideaCategory)) {
      reasoning.expertiseOverlap = 40;
      reasoning.details.push(`Correspondance directe: ${idea.category}`);
    } else {
      // Check for related categories
      const relatedCategories: Record<string, string[]> = {
        health: ['health', 'medical', 'healthcare', 'hospital'],
        education: ['education', 'teaching', 'school', 'university'],
        agriculture: ['agriculture', 'farming', 'agritech', 'food'],
        tech: ['tech', 'technology', 'software', 'it', 'digital'],
        administration: ['administration', 'government', 'public', 'policy'],
        logistics: ['logistics', 'supply', 'transport', 'delivery'],
        finance: ['finance', 'banking', 'fintech', 'investment'],
      };

      const related = relatedCategories[ideaCategory] || [];
      const hasRelated = profileExpertise.some((exp) =>
        related.some((rel) => exp.includes(rel) || rel.includes(exp))
      );

      if (hasRelated) {
        reasoning.expertiseOverlap = 25;
        reasoning.details.push(`Correspondance partielle: ${idea.category}`);
      } else {
        reasoning.expertiseOverlap = 0;
        reasoning.details.push(`Aucune correspondance d'expertise`);
      }
    }
  } else {
    reasoning.details.push(`Données d'expertise manquantes`);
  }

  // 2. Skill overlap (30 points)
  const ideaSkills = idea.submitter_skills || [];
  const profileSkills = Array.isArray(profile.skills) ? profile.skills : [];

  if (ideaSkills.length > 0 && profileSkills.length > 0) {
    const ideaSkillsLower = ideaSkills.map((s) => String(s).toLowerCase());
    const profileSkillsLower = profileSkills.map((s) => String(s).toLowerCase());

    const matchingSkills = ideaSkillsLower.filter((skill) =>
      profileSkillsLower.some((pSkill) => pSkill.includes(skill) || skill.includes(pSkill))
    );

    if (matchingSkills.length > 0) {
      const overlapRatio = matchingSkills.length / Math.max(ideaSkills.length, profileSkills.length);
      reasoning.skillOverlap = Math.round(30 * overlapRatio);
      reasoning.details.push(`${matchingSkills.length} compétence(s) correspondante(s): ${matchingSkills.join(', ')}`);
    } else {
      reasoning.skillOverlap = 0;
      reasoning.details.push('Aucune compétence correspondante');
    }
  } else {
    reasoning.details.push('Données de compétences manquantes');
  }

  // 3. Location proximity (15 points)
  if (idea.location && profile.location) {
    const ideaLocation = String(idea.location).toLowerCase();
    const profileLocation = String(profile.location).toLowerCase();

    // Same location
    if (ideaLocation === profileLocation) {
      reasoning.locationProximity = 15;
      reasoning.details.push(`Même localisation: ${idea.location}`);
    } else {
      // Check for same country (Morocco)
      const moroccanCities = [
        'casablanca',
        'rabat',
        'marrakech',
        'kenitra',
        'tangier',
        'agadir',
        'fes',
        'meknes',
        'oujda',
      ];
      const bothMoroccan =
        moroccanCities.includes(ideaLocation) && moroccanCities.includes(profileLocation);

      if (bothMoroccan) {
        reasoning.locationProximity = 10;
        reasoning.details.push(`Même pays (Maroc): ${idea.location} ↔ ${profile.location}`);
      } else {
        reasoning.locationProximity = 0;
        reasoning.details.push(`Localisations différentes: ${idea.location} ↔ ${profile.location}`);
      }
    }
  } else {
    reasoning.details.push('Données de localisation manquantes');
  }

  // 4. Willingness to help (15 points)
  let willingnessScore = 0;
  if (profile.willing_to_mentor === true) {
    willingnessScore += 8;
    reasoning.details.push('Disponible pour mentorat');
  }
  if (profile.willing_to_cofund === true) {
    willingnessScore += 7;
    reasoning.details.push('Disponible pour cofinancement');
  }
  if (profile.attended_kenitra === true) {
    willingnessScore += 2; // Bonus for workshop attendance
    reasoning.details.push('A participé à l\'atelier de Kenitra');
  }
  reasoning.willingnessToHelp = Math.min(willingnessScore, 15);

  // Calculate total score
  const totalScore = reasoning.expertiseOverlap + reasoning.skillOverlap + reasoning.locationProximity + reasoning.willingnessToHelp;

  return {
    score: Math.min(totalScore, 100), // Cap at 100
    reasoning,
  };
}

/**
 * POST /api/match-diaspora
 * Match an idea with diaspora profiles based on expertise, skills, location, and willingness
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

    // Fetch idea
    const { data: idea, error: ideaError } = await (supabase as any)
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      console.error('Error fetching idea:', ideaError);
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Fetch diaspora profiles (filter for those willing to help or attended Kenitra workshop)
    const { data: profiles, error: profilesError } = await supabase
      .from('marrai_diaspora_profiles')
      .select('*')
      .or('willing_to_mentor.eq.true,willing_to_cofund.eq.true,attended_kenitra.eq.true');

    if (profilesError) {
      console.error('Error fetching diaspora profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch diaspora profiles' },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No diaspora profiles found',
          matches: [],
          topScore: 0,
        },
        { status: 200 }
      );
    }

    // Calculate match scores for all profiles
    const ideaData = idea as any;
    const matches: MatchResult[] = (profiles as any[])
      .map((profile: any) => {
        const { score, reasoning } = calculateMatchScore(ideaData as IdeaRow, profile);
        return {
          profile,
          score,
          reasoning,
        };
      })
      .filter((match) => match.score > 0) // Only include profiles with score > 0
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 5); // Top 5 matches

    // Update idea with matched diaspora IDs and top score
    if (matches.length > 0) {
      const matchedDiasporaIds = matches.map((m) => m.profile.id);
      const topScore = matches[0].score;
      const { error: updateError } = await (supabase as any)
        .from('marrai_ideas')
        .update({
          matched_diaspora: matchedDiasporaIds,
          matching_score: topScore,
          matched_at: new Date().toISOString(),
          status: ideaData.status === 'analyzed' ? 'matched' : ideaData.status,
        })
        .eq('id', ideaId);

      if (updateError) {
        console.error('Error updating idea with matches:', updateError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Found ${matches.length} matching diaspora profile(s)`,
        ideaId: ideaData.id,
        ideaTitle: ideaData.title,
        matches: matches.map((match) => ({
          profileId: match.profile.id,
          profileName: match.profile.name || match.profile.email || 'Anonymous',
          profileEmail: match.profile.email,
          score: match.score,
          reasoning: match.reasoning,
        })),
        topScore: matches.length > 0 ? matches[0].score : 0,
        totalProfilesChecked: profiles.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in match-diaspora API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

