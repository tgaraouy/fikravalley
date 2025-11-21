/**
 * Pods API Route
 * Create, list, and manage journey pods
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const userId = searchParams.get('userId');

    let query = supabase
      .from('marrai_pods')
      .select('*')
      .eq('status', 'forming')
      .limit(20);

    if (city) {
      query = query.eq('city', city);
    }

    const { data: pods, error } = await query;

    if (error) {
      console.error('Error fetching pods:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: pods || [] });
  } catch (error: any) {
    console.error('Error in pods API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city, creatorId, creatorName } = body;

    if (!name || !city || !creatorId) {
      return NextResponse.json(
        { success: false, error: 'Name, city, and creatorId are required' },
        { status: 400 }
      );
    }

    const podData = {
      name,
      city,
      creator_id: creatorId,
      status: 'forming',
      members: [{
        userId: creatorId,
        name: creatorName || 'Creator',
        city,
        role: 'creator',
        joinedAt: new Date().toISOString()
      }],
      sprint_completion_rate: 0,
      task_ease_score: 0,
      created_at: new Date().toISOString()
    };

    const { data: pod, error } = await supabase
      .from('marrai_pods')
      .insert(podData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating pod:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: pod });
  } catch (error: any) {
    console.error('Error in pods API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

