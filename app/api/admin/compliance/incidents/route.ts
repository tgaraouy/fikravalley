/**
 * Admin API: Privacy Incidents
 * 
 * Tracks and manages privacy incidents/breaches
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { checkAdminAccess, logAdminAccess } from '@/lib/privacy/admin-auth';
import { randomUUID } from 'crypto';

/**
 * POST /api/admin/compliance/incidents
 * Create privacy incident
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin, email } = await checkAdminAccess();
    if (!isAdmin || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, severity, affectedUsers, discoveredAt } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'title and description are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const incidentId = randomUUID();
    const notificationDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const { error } = await (supabase.from('privacy_incidents') as any).insert({
      id: incidentId,
      title,
      description,
      severity: severity || 'medium',
      status: 'investigating',
      affected_users: affectedUsers || [],
      discovered_at: discoveredAt || new Date().toISOString(),
      notification_deadline: notificationDeadline.toISOString(),
      created_at: new Date().toISOString(),
      created_by: email,
    });

    if (error) {
      throw new Error(`Failed to create incident: ${error.message}`);
    }

    // Log incident creation
    await logAdminAccess(
      email,
      null,
      'privacy_incident_created',
      `Created incident: ${title}`,
      request.headers.get('x-forwarded-for') || null,
      request.headers.get('user-agent') || null,
      { incidentId }
    );

    return NextResponse.json({
      success: true,
      incidentId,
      notificationDeadline: notificationDeadline.toISOString(),
    });
  } catch (error) {
    console.error('Error creating privacy incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/compliance/incidents
 * Get all privacy incidents
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: incidents, error } = await (supabase
      .from('privacy_incidents') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    // Calculate time until notification deadline
    const incidentsWithDeadline = incidents?.map(
      (incident: Database['public']['Tables']['privacy_incidents']['Row']) => {
        const deadline = incident.notification_deadline
          ? new Date(incident.notification_deadline)
          : new Date();
      const now = new Date();
      const hoursRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

      return {
        ...incident,
        hoursUntilNotification: hoursRemaining,
        notificationOverdue: hoursRemaining < 0,
      };
      }
    );

    return NextResponse.json({ incidents: incidentsWithDeadline || [] });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/compliance/incidents
 * Update incident status
 */
export async function PUT(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin, email } = await checkAdminAccess();
    if (!isAdmin || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, remediationSteps, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'incident id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: email,
    };

    if (status) updateData.status = status;
    if (remediationSteps) updateData.remediation_steps = remediationSteps;
    if (notes) updateData.notes = notes;

    const { error } = await (supabase
      .from('privacy_incidents') as any)
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log update
    await logAdminAccess(
      email,
      null,
      'privacy_incident_updated',
      `Updated incident ${id}`,
      request.headers.get('x-forwarded-for') || null,
      request.headers.get('user-agent') || null,
      { incidentId: id, status }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

