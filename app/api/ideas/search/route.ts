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
    const pageSize = parseInt(searchParams.get('pageSize') || '24'); // Increased from 18 to 24, configurable
    const offset = (page - 1) * pageSize;

    // Filters
    const priorities = searchParams.get('priorities')?.split(',').filter(Boolean) || [];
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean) || [];
    const location = searchParams.get('location') || '';
    const scoreMin = parseInt(searchParams.get('scoreMin') || '0');
    const scoreMax = parseInt(searchParams.get('scoreMax') || '100'); // Max possible score is 40+20=60, but allow higher for safety
    const budgetTiers = searchParams.get('budget_tiers')?.split(',').filter(Boolean) || [];
    const complexities = searchParams.get('complexities')?.split(',').filter(Boolean) || [];
    const locationTypes = searchParams.get('location_types')?.split(',').filter(Boolean) || [];
    const sdgTags = searchParams.get('sdg_tags')?.split(',').filter(Boolean).map(Number).filter((n) => !isNaN(n)) || [];
    const sort = searchParams.get('sort') || 'score_desc';

    const supabase = await createClient();

    // Build query - fetch ideas first, then join scores separately
    // Note: We can't use PostgREST's automatic join with views, so we'll fetch scores separately
    // Filter for visible ideas at the database level for better performance
    let query = supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact' });
    
    // Filter for visible ideas at database level (more efficient)
    // This ensures we only count and paginate visible ideas
    query = query.eq('visible', true);

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

    // Budget tier filter
    if (budgetTiers.length > 0) {
      query = query.in('budget_tier', budgetTiers);
    }

    // Complexity filter
    if (complexities.length > 0) {
      query = query.in('complexity', complexities);
    }

    // Location type filter
    if (locationTypes.length > 0) {
      query = query.in('location_type', locationTypes);
    }

    // SDG filter (JSONB array contains any of the selected SDG numbers)
    // sdg_alignment.sdgTags is an array like [7, 13, 15]
    // We need to check if any of the selected SDG numbers are in the array
    if (sdgTags.length > 0) {
      // Use PostgREST JSONB contains operator: @> (contains)
      // For each SDG tag, check if sdg_alignment->sdgTags contains it
      // We'll filter in application layer after fetching, as PostgREST JSONB filtering is complex
      // For now, we'll fetch all and filter in JS (can be optimized later with a database function)
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

    // Process ideas - all should already be visible (filtered at DB level)
    // But double-check as a safety measure
    let ideasToProcess = ideas || [];
    
    // Double-check visible filter (safety measure in case DB filter didn't work)
    const hasVisibleColumn = ideasToProcess.length > 0 && 'visible' in ideasToProcess[0];
    if (hasVisibleColumn) {
      const beforeFilter = ideasToProcess.length;
      ideasToProcess = ideasToProcess.filter((idea: any) => idea.visible === true);
      if (process.env.NODE_ENV === 'development' && beforeFilter !== ideasToProcess.length) {
        console.log(`⚠️ Warning: ${beforeFilter - ideasToProcess.length} non-visible ideas filtered out`);
      }
    }

    // SDG filter (application layer - filter by sdg_alignment JSONB)
    if (sdgTags.length > 0) {
      ideasToProcess = ideasToProcess.filter((idea: any) => {
        const sdgAlignment = idea.sdg_alignment;
        if (!sdgAlignment) return false;
        
        // Parse if string
        let sdgArray: number[] = [];
        if (typeof sdgAlignment === 'string') {
          try {
            const parsed = JSON.parse(sdgAlignment);
            sdgArray = parsed.sdgTags || parsed || [];
          } catch {
            return false;
          }
        } else if (Array.isArray(sdgAlignment)) {
          sdgArray = sdgAlignment;
        } else if (sdgAlignment.sdgTags) {
          sdgArray = sdgAlignment.sdgTags;
        }
        
        // Check if any selected SDG tag is in the idea's SDG array
        return sdgTags.some((tag) => sdgArray.includes(tag));
      });
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
        moroccan_priorities: (idea as any).moroccan_priorities || [],
        budget_tier: (idea as any).budget_tier || null,
        location_type: (idea as any).location_type || null,
        complexity: (idea as any).complexity || null,
        adoption_count: (idea as any).adoption_count || 0,
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
    // Check moroccan_priorities field directly (JSONB array)
    if (priorities.length > 0) {
      filteredIdeas = filteredIdeas.filter((idea: any) => {
        // moroccan_priorities is a JSONB array field in the database
        const ideaPriorities = idea.moroccan_priorities || [];
        // Handle both string array and parsed JSONB array
        const prioritiesArray = Array.isArray(ideaPriorities) 
          ? ideaPriorities 
          : (typeof ideaPriorities === 'string' ? JSON.parse(ideaPriorities) : []);
        
        // Normalize priority IDs to handle mismatches between filter UI and database
        // FilterSidebar uses 'women_empowerment' (from MOROCCO_PRIORITIES.id)
        // Database might have 'women_entrepreneurship' (from categorization rules)
        const priorityMap: Record<string, string[]> = {
          'women_empowerment': ['women_empowerment', 'women_entrepreneurship'],
          'women_entrepreneurship': ['women_empowerment', 'women_entrepreneurship'],
          'healthcare_improvement': ['healthcare_improvement', 'health_system'],
          'health_system': ['healthcare_improvement', 'health_system'],
        };
        
        // Check if any selected priority matches any of the idea's priorities
        // Use mapped variants if available, otherwise check exact match
        return priorities.some((p) => {
          const variants = priorityMap[p] || [p];
          return variants.some((variant) => prioritiesArray.includes(variant));
        });
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

    // Calculate total pages based on the total count from database (not filteredIdeas.length)
    // This ensures pagination works correctly even after score filtering
    const totalCount = count || filteredIdeas.length;
    const totalPages = Math.ceil(totalCount / pageSize);

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
      total: totalCount, // Use database count for accurate total
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

