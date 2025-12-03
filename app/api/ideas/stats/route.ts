/**
 * API: Ideas Statistics
 *
 * GET /api/ideas/stats
 * Returns real-time statistics about ideas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Total visible ideas
    const { count: totalIdeas } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('visible', true);

    // Ideas created this week (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    const { count: ideasThisWeek } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('visible', true)
      .gte('created_at', oneWeekAgoISO);

    // Top city by ideas this week
    const { data: ideasByCity } = await supabase
      .from('marrai_ideas')
      .select('location')
      .eq('visible', true)
      .gte('created_at', oneWeekAgoISO)
      .not('location', 'is', null);

    // Count ideas by city
    const cityCounts: Record<string, number> = {};
    (ideasByCity || []).forEach((idea: any) => {
      const city = idea.location || 'Other';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    // Find top city
    const topCity = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Casablanca';

    return NextResponse.json({
      totalIdeas: totalIdeas || 0,
      ideasThisWeek: ideasThisWeek || 0,
      topCity: topCity,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/ideas/stats:', error);
    }
    // Return default values on error
    return NextResponse.json({
      totalIdeas: 0,
      ideasThisWeek: 0,
      topCity: 'Casablanca',
    });
  }
}

