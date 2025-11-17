/**
 * API: Admin Mentors
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from mentors table
    // For now, return mock data
    const mentors = [
      {
        id: '1',
        name: 'Dr. Ahmed Benali',
        expertise: ['Health', 'Digital Health'],
        email: 'ahmed@example.com',
        ideas_matched: 5,
        success_rate: 80,
      },
      {
        id: '2',
        name: 'Prof. Mohamed Alami',
        expertise: ['Education', 'EdTech'],
        email: 'mohamed@example.com',
        ideas_matched: 3,
        success_rate: 67,
      },
    ];

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}

