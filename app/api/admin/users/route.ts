/**
 * API: Admin Users List
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const supabase = await createClient();

    // Note: This is simplified - in production, you'd need proper user management
    // For now, get users from ideas
    let query = supabase
      .from('marrai_ideas')
      .select('submitter_name, submitter_email')
      .not('submitter_email', 'is', null);

    if (search) {
      query = query.or(
        `submitter_name.ilike.%${search}%,submitter_email.ilike.%${search}%`
      );
    }

    const { data: ideas, error } = await query;

    if (error) {
      throw error;
    }

    // Aggregate users
    const userMap = new Map();
    ideas?.forEach((idea: any) => {
      const email = idea.submitter_email;
      if (email && !userMap.has(email)) {
        userMap.set(email, {
          id: email,
          email,
          name: idea.submitter_name || 'Anonymous',
          role: 'user',
          ideas_count: 0,
          receipts_count: 0,
          upvotes_count: 0,
          last_active: new Date().toISOString(),
          banned: false,
          created_at: new Date().toISOString(),
        });
      }
      if (userMap.has(email)) {
        userMap.get(email).ideas_count++;
      }
    });

    const users = Array.from(userMap.values());

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
