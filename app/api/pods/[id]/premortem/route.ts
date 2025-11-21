/**
 * Log Pre-Mortem (Week 0) API Route
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
    const { blockers, risks, mitigation } = body;

    if (!blockers || !risks || !mitigation) {
      return NextResponse.json(
        { success: false, error: 'blockers, risks, and mitigation arrays are required' },
        { status: 400 }
      );
    }

    const preMortem = {
      blockers: Array.isArray(blockers) ? blockers : [],
      risks: Array.isArray(risks) ? risks : [],
      mitigation: Array.isArray(mitigation) ? mitigation : [],
      loggedAt: new Date().toISOString()
    };

    const { data: pod, error } = await supabase
      .from('marrai_pods')
      .update({ pre_mortem: preMortem })
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
    console.error('Error logging pre-mortem:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

