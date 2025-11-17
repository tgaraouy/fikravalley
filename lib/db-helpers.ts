import { supabase } from '@/lib/supabase';

/**
 * Updates workshop session statistics by counting ideas and transcripts.
 * 
 * @param sessionId - The workshop session ID to update stats for
 * @throws Error if session update fails
 */
export async function updateSessionStats(sessionId: string): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new Error('sessionId is required and must be a string');
  }

  try {
    // Fetch all conversation ideas for this session
    const { data: conversationIdeas, error: ideasError } = await supabase
      .from('marrai_conversation_ideas')
      .select('status')
      .eq('session_id', sessionId);

    if (ideasError) {
      console.error('Error fetching conversation ideas:', ideasError);
      throw new Error(`Failed to fetch conversation ideas: ${ideasError.message}`);
    }

    // Calculate idea statistics
    const ideasDetected = conversationIdeas?.length || 0;
    const ideasValidated =
      conversationIdeas?.filter((idea) => idea.status === 'speaker_validated').length || 0;
    const ideasRejected =
      conversationIdeas?.filter((idea) => idea.status === 'speaker_rejected').length || 0;
    const ideasPending =
      conversationIdeas?.filter((idea) => idea.status === 'pending_validation').length || 0;

    // Fetch transcripts and sum word_count
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('marrai_transcripts')
      .select('word_count')
      .eq('session_id', sessionId);

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError);
      throw new Error(`Failed to fetch transcripts: ${transcriptsError.message}`);
    }

    const transcriptWordCount =
      transcripts?.reduce((sum, transcript) => sum + (transcript.word_count || 0), 0) || 0;

    // Update workshop session with calculated stats
    const { error: updateError } = await supabase
      .from('marrai_workshop_sessions')
      .update({
        ideas_detected: ideasDetected,
        ideas_validated: ideasValidated,
        ideas_rejected: ideasRejected,
        ideas_pending: ideasPending,
        transcript_word_count: transcriptWordCount,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session stats:', updateError);
      throw new Error(`Failed to update session stats: ${updateError.message}`);
    }
  } catch (error) {
    // Re-throw with context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error updating session stats: ${String(error)}`);
  }
}

