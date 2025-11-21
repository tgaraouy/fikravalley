/**
 * Sign Done Definition (MVP Canvas) API Route
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
    const { firstUser, successCriteria } = body;

    if (!firstUser || !successCriteria || !Array.isArray(successCriteria)) {
      return NextResponse.json(
        { success: false, error: 'firstUser and successCriteria array are required' },
        { status: 400 }
      );
    }

    const doneDefinition = {
      firstUser,
      successCriteria,
      signedAt: new Date().toISOString()
    };

    const { data: pod, error } = await supabase
      .from('marrai_pods')
      .update({
        done_definition: doneDefinition,
        status: 'active'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: pod });
  } catch (error: any) {
    console.error('Error signing done definition:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

