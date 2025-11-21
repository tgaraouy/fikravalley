/**
 * Join Pod API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, userName } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get current pod
    const { data: pod, error: fetchError } = await supabase
      .from('marrai_pods')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !pod) {
      return NextResponse.json(
        { success: false, error: 'Pod not found' },
        { status: 404 }
      );
    }

    // Check if pod is full (max 5 members)
    const members = pod.members || [];
    if (members.length >= 5) {
      return NextResponse.json(
        { success: false, error: 'Pod is full (max 5 members)' },
        { status: 400 }
      );
    }

    // Add member
    const newMember = {
      userId,
      name: userName || 'Member',
      city: pod.city,
      role: 'validator',
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...members, newMember];

    const { data: updatedPod, error: updateError } = await supabase
      .from('marrai_pods')
      .update({
        members: updatedMembers,
        status: updatedMembers.length >= 2 ? 'active' : 'forming'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedPod });
  } catch (error: any) {
    console.error('Error joining pod:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

