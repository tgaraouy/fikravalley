/**
 * API Route: Record Consent
 * 
 * Records user consent with full GDPR compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConsentManager } from '@/lib/privacy/consent';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';

/**
 * POST /api/consent/record
 * Record user consent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      phone,
      submission,
      analysis,
      marketing,
      dataRetention,
    } = body;

    if (!userId || !phone) {
      return NextResponse.json(
        { error: 'userId and phone are required' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const consentManager = new ConsentManager();

    // Record submission consent (required)
    if (submission) {
      await consentManager.recordConsent({
        userId,
        phone,
        consentType: 'submission',
        granted: true,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        consentMethod: 'web',
      });
    }

    // Record analysis consent (required)
    if (analysis) {
      await consentManager.recordConsent({
        userId,
        phone,
        consentType: 'analysis',
        granted: true,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        consentMethod: 'web',
      });
    }

    // Record marketing consent (optional)
    if (marketing) {
      await consentManager.recordConsent({
        userId,
        phone,
        consentType: 'marketing',
        granted: true,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        consentMethod: 'web',
      });
    }

    // Record data retention consent
    const retentionDays = dataRetention === 'indefinite' ? 3650 : parseInt(dataRetention || '90');
    const storage = new SecureUserStorage();
    await storage.setDataRetention(userId, retentionDays);

    await consentManager.recordConsent({
      userId,
      phone,
      consentType: 'data_retention',
      granted: true,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
      consentMethod: 'web',
      metadata: {
        retentionDays,
        retentionType: dataRetention,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording consent:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}

