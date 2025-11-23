/**
 * API: Search Ideas
 * 
 * Full-text search with filters and sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 18;
    const offset = (page - 1) * pageSize;

    // Filters
    const priorities = searchParams.get('priorities')?.split(',').filter(Boolean) || [];
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean) || [];
    const location = searchParams.get('location') || '';
    const scoreMin = parseInt(searchParams.get('scoreMin') || '0');
    const scoreMax = parseInt(searchParams.get('scoreMax') || '100'); // Max possible score is 40+20=60, but allow higher for safety
    const sort = searchParams.get('sort') || 'score_desc';

    const supabase = await createClient();

    // Build query - fetch ideas first, then join scores separately
    // Note: We can't use PostgREST's automatic join with views, so we'll fetch scores separately
    // Note: Fetch all ideas (we'll filter by visible in application layer)
    let query = supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact' });
    
    // We'll filter in the application layer for columns that might not exist
    // (visible, etc.)

    // Search
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,problem_statement.ilike.%${search}%,proposed_solution.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    // Sector filter
    if (sectors.length > 0) {
      query = query.in('category', sectors);
    }

    // Location filter
    if (location) {
      query = query.eq('location', location);
    }

    // Sort - we'll sort in application layer after fetching scores
    // For now, just order by created_at as default
    switch (sort) {
      case 'created_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'created_asc':
        query = query.order('created_at', { ascending: true });
        break;
      case 'title_asc':
        query = query.order('title', { ascending: true });
        break;
      default:
        // Default: will sort by score after fetching scores
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: ideas, error, count } = await query;

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
        { status: 500 }
      );
    }

    // Fetch scores for all ideas separately (since we can't join views in PostgREST)
    const ideaIds = (ideas || []).map((idea: any) => idea.id);
    let scoresMap: Record<string, any> = {};
    
    if (ideaIds.length > 0) {
      const { data: scores } = await supabase
        .from('marrai_idea_scores')
        .select('*')
        .in('idea_id', ideaIds);
      
      // Create a map of idea_id -> scores for quick lookup
      (scores || []).forEach((score: any) => {
        scoresMap[score.idea_id] = score;
      });
    }

    // Process ideas - filter for visible ones
    let ideasToProcess = ideas || [];
    
    // Filter for visible ideas if the column exists
    // Check if visible column exists by looking at the first idea
    const hasVisibleColumn = ideasToProcess.length > 0 && 'visible' in ideasToProcess[0];
    if (hasVisibleColumn) {
      ideasToProcess = ideasToProcess.filter((idea: any) => idea.visible === true);
      console.log(`Filtered to ${ideasToProcess.length} visible ideas out of ${ideas.length}`);
    } else {
      console.log('Visible column not found, showing all ideas');
    }
    
    const processedIdeas = ideasToProcess.map((idea: any) => {
      const scores = scoresMap[idea.id] || {};
      // Calculate total score: stage1_total + stage2_total
      const stage1Total = scores.stage1_total || 0;
      const stage2Total = scores.stage2_total || 0;
      const totalScore = scores.total_score || (stage1Total + stage2Total) || 0;

      // Determine qualification tier
      let qualificationTier: 'exceptional' | 'qualified' | 'developing' | undefined;
      if (totalScore >= 30) qualificationTier = 'exceptional';
      else if (totalScore >= 25) qualificationTier = 'qualified';
      else if (totalScore >= 15) qualificationTier = 'developing';

      // Parse alignment if it's a JSONB field
      let alignment = null;
      if (idea.alignment) {
        if (typeof idea.alignment === 'string') {
          try {
            alignment = JSON.parse(idea.alignment);
          } catch {
            alignment = null;
          }
        } else {
          alignment = idea.alignment;
        }
      }

      return {
        id: idea.id,
        title: idea.title,
        title_darija: idea.title_darija,
        problem_statement: idea.problem_statement,
        proposed_solution: idea.proposed_solution,
        location: idea.location,
        category: idea.category,
        total_score: totalScore,
        stage1_total: scores.stage1_total,
        stage2_total: scores.stage2_total,
        receipt_count: idea.receipt_count || 0,
        upvote_count: idea.upvote_count || 0,
        alignment: alignment || {
          moroccoPriorities: [],
          sdgTags: idea.sdg_alignment || [],
          sdgAutoTagged: false,
          sdgConfidence: {},
        },
        sdg_alignment: idea.sdg_alignment || [], // Legacy field
        funding_status: idea.funding_status,
        qualification_tier: qualificationTier,
        created_at: idea.created_at,
        submitter_name: idea.submitter_name,
        has_receipts: (idea.receipt_count || 0) > 0,
      };
    });

    // Apply score filter
    // Allow ideas with score 0 (no scores yet) OR ideas within score range
    // Note: If scoreMax is the default (40) and user hasn't explicitly set it, allow scores above
    let filteredIdeas = processedIdeas.filter((idea) => {
      // If idea has no scores (score = 0), show it regardless of scoreMin
      // This allows newly submitted ideas to appear
      if (idea.total_score === 0) {
        return true;
      }
      // Filter by score range
      return idea.total_score >= scoreMin && idea.total_score <= scoreMax;
    });

    // Apply Morocco priorities filter (PRIMARY)
    if (priorities.length > 0) {
      filteredIdeas = filteredIdeas.filter((idea: any) => {
        const ideaPriorities = (idea.alignment as any)?.moroccoPriorities || [];
        return priorities.some((p) => ideaPriorities.includes(p));
      });
    }

    // Apply sorting (now that we have scores)
    switch (sort) {
      case 'score_desc':
        filteredIdeas.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
        break;
      case 'score_asc':
        filteredIdeas.sort((a, b) => (a.total_score || 0) - (b.total_score || 0));
        break;
      case 'receipts_desc':
        filteredIdeas.sort((a, b) => (b.receipt_count || 0) - (a.receipt_count || 0));
        break;
      case 'upvotes_desc':
        filteredIdeas.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
        break;
      // Other sorts already handled in SQL query
    }

    const totalPages = Math.ceil((filteredIdeas.length || 0) / pageSize);

    // Debug logging to help diagnose why ideas aren't showing
    if (filteredIdeas.length === 0 && ideasToProcess.length > 0) {
      console.log('🔍 Debug: Ideas filtered out', {
        totalIdeasFromDB: ideasToProcess.length,
        visibleIdeas: ideasToProcess.filter((i: any) => i.visible === true).length,
        processedIdeas: processedIdeas.length,
        ideasWithScores: processedIdeas.filter((i: any) => i.total_score > 0).length,
        scoreMin,
        scoreMax,
        sampleIdeas: processedIdeas.slice(0, 3).map((i: any) => ({ 
          id: i.id, 
          title: i.title?.substring(0, 30),
          score: i.total_score, 
          visible: i.visible,
          stage1: i.stage1_total,
          stage2: i.stage2_total
        }))
      });
    }

    return NextResponse.json({
      items: filteredIdeas,
      total: filteredIdeas.length,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

