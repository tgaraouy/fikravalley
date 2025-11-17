/**
 * API: Search Suggestions
 * 
 * Provides search suggestions based on query
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const COMMON_SEARCHES = [
  'santé',
  'صحة',
  'health',
  'éducation',
  'تعليم',
  'education',
  'agriculture',
  'زراعة',
  'technologie',
  'تقنية',
  'technology',
  'infrastructure',
  'بنية تحتية',
  'administration',
  'إدارة',
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = await createClient();

    // Get suggestions from idea titles and categories
    // Filter for visible ideas if column exists
    let suggestionsQuery = supabase
      .from('marrai_ideas')
      .select('title, category, location, visible')
      .ilike('title', `%${query}%`)
      .limit(10);
    
    const { data: ideas } = await suggestionsQuery;
    
    // Filter for visible ideas in application layer
    const visibleIdeas = (ideas || []).filter((idea: any) => {
      // If visible column exists, filter by it; otherwise show all
      return idea.visible !== false;
    }).slice(0, 5);

    const suggestions: string[] = [];

    // Add matching titles from visible ideas
    if (visibleIdeas) {
      visibleIdeas.forEach((idea) => {
        if (idea.title && !suggestions.includes(idea.title)) {
          suggestions.push(idea.title);
        }
      });
    }

    // Add matching common searches
    COMMON_SEARCHES.forEach((search) => {
      if (
        search.toLowerCase().includes(query.toLowerCase()) &&
        !suggestions.includes(search)
      ) {
        suggestions.push(search);
      }
    });

    // Add matching categories
    const categories = ['health', 'education', 'agriculture', 'tech', 'infrastructure', 'administration'];
    categories.forEach((cat) => {
      if (cat.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(cat)) {
        suggestions.push(cat);
      }
    });

    return NextResponse.json({
      suggestions: suggestions.slice(0, 8),
    });
  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json({ suggestions: [] });
  }
}

