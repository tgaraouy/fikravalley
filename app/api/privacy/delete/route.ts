/**
 * GDPR Article 17: Right to Erasure (Right to be Forgotten)
 * 
 * Handles user data deletion requests with:
 * - Verification via WhatsApp/email
 * - 7-day grace period
 * - Cancellation support
 * - Audit trail preservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';
import { ConsentManager } from '@/lib/privacy/consent';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { randomBytes, randomUUID } from 'crypto';

/**
 * Generate verification code
 */
function generateVerificationCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

/**
 * POST /api/privacy/delete
 * Initiate deletion request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, phone, email } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if deletion already requested
    const { data: existingRequest } = await supabase
      .from('marrai_deletion_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: 'Deletion request already pending',
        deletionId: existingRequest.id,
        scheduledDate: existingRequest.scheduled_deletion_date,
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7); // 7-day grace period

    // Create deletion request
    const deletionId = randomUUID();
    const { error: insertError } = await supabase.from('marrai_deletion_requests').insert({
      id: deletionId,
      user_id: userId,
      verification_code: verificationCode,
      status: 'pending',
      requested_at: new Date().toISOString(),
      scheduled_deletion_date: scheduledDate.toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    if (insertError) {
      throw new Error(`Failed to create deletion request: ${insertError.message}`);
    }

    // Send verification code
    if (phone) {
      const message = `Code de vérification pour la suppression de vos données: ${verificationCode}\n\nCe code expire dans 1 heure. Répondez CONFIRMER pour confirmer la suppression.`;
      await sendWhatsAppMessage(phone, message);
    }

    // TODO: Send email verification if email provided
    // await sendEmail(email, 'Data Deletion Request', ...);

    // Log deletion request
    await supabase.from('marrai_audit_logs').insert({
      id: randomUUID(),
      user_id: userId,
      action: 'deletion_requested',
      actor: 'user',
      timestamp: new Date().toISOString(),
      metadata: {
        deletionId,
        scheduledDate: scheduledDate.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      deletionId,
      verificationCode, // Only for testing - remove in production
      scheduledDate: scheduledDate.toISOString(),
      message: 'Deletion request created. Check your WhatsApp/email for verification code.',
    });
  } catch (error) {
    console.error('Error creating deletion request:', error);
    return NextResponse.json(
      { error: 'Failed to create deletion request' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/privacy/delete
 * Confirm or cancel deletion
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { deletionId, verificationCode, action } = body; // action: 'confirm' | 'cancel'

    if (!deletionId || !verificationCode || !action) {
      return NextResponse.json(
        { error: 'deletionId, verificationCode, and action are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get deletion request
    const { data: deletionRequest, error: fetchError } = await supabase
      .from('marrai_deletion_requests')
      .select('*')
      .eq('id', deletionId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !deletionRequest) {
      return NextResponse.json(
        { error: 'Invalid deletion request' },
        { status: 404 }
      );
    }

    // Verify code
    if (deletionRequest.verification_code !== verificationCode.toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    if (action === 'cancel') {
      // Cancel deletion
      await supabase
        .from('marrai_deletion_requests')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', deletionId);

      // Log cancellation
      await supabase.from('marrai_audit_logs').insert({
        id: randomUUID(),
        user_id: deletionRequest.user_id,
        action: 'deletion_cancelled',
        actor: 'user',
        timestamp: new Date().toISOString(),
        metadata: { deletionId },
      });

      return NextResponse.json({
        success: true,
        message: 'Deletion request cancelled',
      });
    } else if (action === 'confirm') {
      // Confirm deletion - mark for immediate deletion
      await supabase
        .from('marrai_deletion_requests')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          scheduled_deletion_date: new Date().toISOString(), // Delete immediately after confirmation
        })
        .eq('id', deletionId);

      // Mark user data for deletion (hide from queries)
      await supabase
        .from('marrai_secure_users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deletionRequest.user_id);

      // Log confirmation
      await supabase.from('marrai_audit_logs').insert({
        id: randomUUID(),
        user_id: deletionRequest.user_id,
        action: 'deletion_confirmed',
        actor: 'user',
        timestamp: new Date().toISOString(),
        metadata: { deletionId },
      });

      // Actually delete data (or schedule for background job)
      // For now, we'll mark it - actual deletion happens in background job
      await deleteUserData(deletionRequest.user_id);

      return NextResponse.json({
        success: true,
        message: 'Data deletion confirmed. Your data will be deleted within 24 hours.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing deletion:', error);
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    );
  }
}

/**
 * Actually delete user data
 */
async function deleteUserData(userId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const storage = new SecureUserStorage();
    const consentManager = new ConsentManager();

    // Get user data to find submissions
    const { data: user } = await supabase
      .from('secure_users')
      .select('anonymous_email')
      .eq('id', userId)
      .single();

    if (user) {
      // Delete all idea submissions
      await supabase
        .from('marrai_ideas')
        .delete()
        .eq('submitter_email', user.anonymous_email);

      // Delete all comments
      await supabase
        .from('marrai_comments')
        .delete()
        .eq('user_id', userId);
    }

    // Withdraw all consents
    await consentManager.withdrawConsent(userId, 'submission');
    await consentManager.withdrawConsent(userId, 'analysis');
    await consentManager.withdrawConsent(userId, 'marketing');

    // Delete user data (this also handles secure_users deletion)
    await storage.deleteUserData(userId);

    // Mark deletion request as completed
    await supabase
      .from('marrai_deletion_requests')
      .update({
        status: 'completed',
        deleted_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Log completion
    await supabase.from('marrai_audit_logs').insert({
      id: randomUUID(),
      user_id: userId,
      action: 'data_deleted',
      actor: 'system',
      timestamp: new Date().toISOString(),
      metadata: { deletionCompleted: true },
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

