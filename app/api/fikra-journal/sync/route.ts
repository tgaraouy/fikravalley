/**
 * Fikra Journal Sync API
 * 
 * Syncs IndexedDB entries to server
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { success: false, error: 'Entries array is required' },
        { status: 400 }
      );
    }

    // Store entries in Supabase
    const { data, error } = await supabase
      .from('marrai_journal_entries')
      .upsert(entries.map((entry: any) => ({
        id: entry.id,
        fikra_tag: entry.fikraTag,
        timestamp: entry.timestamp,
        type: entry.type,
        content: entry.content,
        step: entry.step,
        synced: true
      })), {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error syncing entries:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      synced: entries.length
    });
  } catch (error: any) {
    console.error('Error in sync API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

