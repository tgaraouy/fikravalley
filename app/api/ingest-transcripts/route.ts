import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type TranscriptInsert = Database['public']['Tables']['marrai_transcripts']['Insert'];

interface TranscriptInput {
  text: string;
  timestamp_in_session?: string;
  duration_seconds?: number;
  speaker_identified?: string;
  language?: string;
}

interface BatchRequest {
  session_id: string;
  transcripts: TranscriptInput[];
}

interface SingleRequest {
  session_id: string;
  text: string;
  timestamp_in_session?: string;
  duration_seconds?: number;
  speaker_identified?: string;
  language?: string;
}

/**
 * Detect language from text content
 * Returns: 'french' | 'arabic' | 'english' | 'mixed'
 */
function detectLanguage(text: string): 'french' | 'arabic' | 'english' | 'mixed' {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 'french'; // Default fallback
  }

  const lowerText = text.toLowerCase();
  
  // Arabic indicators (Arabic script Unicode range)
  const arabicPattern = /[\u0600-\u06FF]/;
  const hasArabic = arabicPattern.test(text);
  
  // French indicators
  const frenchIndicators = [
    /\b(le|la|les|un|une|des|de|du|dans|pour|avec|sans|sur|sous|par|est|sont|être|avoir|faire|aller|venir|pouvoir|vouloir|devoir|savoir|voir|dire|prendre|donner|mettre|passer|rester|partir|arriver|commencer|continuer|finir|trouver|chercher|comprendre|connaître|croire|penser|sentir|vivre|mourir|naître|grandir|changer|devenir|revenir|sortir|entrer|monter|descendre|ouvrir|fermer|commencer|finir|essayer|réussir|échouer|aider|demander|répondre|écouter|parler|lire|écrire|apprendre|enseigner|étudier|travailler|jouer|manger|boire|dormir|réveiller|se lever|se coucher|se laver|s'habiller|se déshabiller|se promener|se reposer|se dépêcher|s'arrêter|se taire|se souvenir|oublier|se tromper|se corriger|se fâcher|se calmer|se réjouir|se plaindre|se moquer|se taire|se taire|se taire)\b/gi,
    /\b(et|ou|mais|donc|car|puis|alors|ensuite|après|avant|pendant|depuis|jusqu'|dès|sauf|sans|avec|sous|sur|dans|par|pour|vers|chez|entre|parmi|contre|selon|malgré|grâce|à cause|au lieu|au lieu de|à partir|à travers|en face|en bas|en haut|en avant|en arrière|en général|en particulier|en effet|en fait|en réalité|en vérité|en principe|en théorie|en pratique|en théorie|en théorie|en théorie)\b/gi,
  ];
  const frenchMatches = frenchIndicators.reduce((count, pattern) => {
    return count + (text.match(pattern)?.length || 0);
  }, 0);
  
  // English indicators
  const englishIndicators = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by|from|as|is|are|was|were|been|being|have|has|had|do|does|did|will|would|should|could|may|might|must|can|shall|ought|need|dare|used|get|got|give|go|come|see|know|think|take|make|say|tell|ask|work|call|try|use|find|want|look|help|play|run|move|like|live|believe|bring|happen|leave|mean|keep|let|begin|seem|feel|turn|hear|show|watch|play|run|move|like|live|believe|bring|happen|leave|mean|keep|let|begin|seem|feel|turn|hear|show|watch|play|run|move|like|live|believe|bring|happen|leave|mean|keep|let|begin|seem|feel|turn|hear|show|watch)\b/gi,
  ];
  const englishMatches = englishIndicators.reduce((count, pattern) => {
    return count + (text.match(pattern)?.length || 0);
  }, 0);

  // Count language indicators
  const languages: Array<{ lang: 'french' | 'arabic' | 'english'; score: number }> = [];
  
  if (hasArabic) {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    languages.push({ lang: 'arabic', score: arabicChars });
  }
  
  if (frenchMatches > 0) {
    languages.push({ lang: 'french', score: frenchMatches });
  }
  
  if (englishMatches > 0) {
    languages.push({ lang: 'english', score: englishMatches });
  }

  if (languages.length === 0) {
    return 'french'; // Default fallback
  }

  if (languages.length === 1) {
    return languages[0].lang;
  }

  // Multiple languages detected
  const totalScore = languages.reduce((sum, l) => sum + l.score, 0);
  const maxScore = Math.max(...languages.map((l) => l.score));
  
  // If one language dominates (>70%), return it, otherwise mixed
  if (maxScore / totalScore > 0.7) {
    return languages.find((l) => l.score === maxScore)!.lang;
  }

  return 'mixed';
}

/**
 * Clean transcript text by removing noise and normalizing whitespace
 */
function cleanTranscript(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text;

  // Remove common transcription noise
  cleaned = cleaned.replace(/\[MUSIC\]/gi, '');
  cleaned = cleaned.replace(/\[APPLAUSE\]/gi, '');
  cleaned = cleaned.replace(/\[LAUGHTER\]/gi, '');
  cleaned = cleaned.replace(/\[COUGH\]/gi, '');
  cleaned = cleaned.replace(/\[SILENCE\]/gi, '');
  cleaned = cleaned.replace(/\[NOISE\]/gi, '');
  cleaned = cleaned.replace(/\[INAUDIBLE\]/gi, '');
  cleaned = cleaned.replace(/\[UNINTELLIGIBLE\]/gi, '');
  cleaned = cleaned.replace(/\[SPEAKER \d+\]/gi, '');
  cleaned = cleaned.replace(/\[.*?\]/g, ''); // Remove any other [bracketed] content

  // Remove excessive punctuation
  cleaned = cleaned.replace(/\.{3,}/g, '...'); // Multiple dots to triple dot
  cleaned = cleaned.replace(/\?{2,}/g, '?'); // Multiple question marks
  cleaned = cleaned.replace(/!{2,}/g, '!'); // Multiple exclamation marks

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single space
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Multiple newlines to double newline
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Count words in text (split on whitespace)
 */
function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const cleaned = text.trim();
  if (cleaned.length === 0) {
    return 0;
  }

  // Split on whitespace and filter out empty strings
  const words = cleaned.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Trigger extraction API non-blocking
 */
function triggerExtraction(sessionId: string): void {
  // Use fetch without await to make it non-blocking
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/extract-ideas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      force_reprocess: false,
    }),
  }).catch((error) => {
    // Silently log errors but don't crash
    console.error('Error triggering extraction API (non-blocking):', error);
  });
}

/**
 * POST /api/ingest-transcripts
 * Ingests audio transcripts (single or batch) into marrai_transcripts table
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate session_id
    if (!body.session_id || typeof body.session_id !== 'string') {
      return NextResponse.json(
        { error: 'session_id is required and must be a string' },
        { status: 400 }
      );
    }

    const sessionId = body.session_id;

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('marrai_workshop_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Determine if batch or single mode
    const isBatch = Array.isArray(body.transcripts);
    let transcriptsToProcess: TranscriptInput[] = [];

    if (isBatch) {
      // Batch mode
      if (!body.transcripts || !Array.isArray(body.transcripts) || body.transcripts.length === 0) {
        return NextResponse.json(
          { error: 'transcripts array is required and must not be empty in batch mode' },
          { status: 400 }
        );
      }

      // Validate each transcript in batch
      for (const transcript of body.transcripts) {
        if (!transcript.text || typeof transcript.text !== 'string') {
          return NextResponse.json(
            { error: 'Each transcript must have a text field (string)' },
            { status: 400 }
          );
        }
      }

      transcriptsToProcess = body.transcripts;
    } else {
      // Single mode
      if (!body.text || typeof body.text !== 'string') {
        return NextResponse.json(
          { error: 'text is required and must be a string in single mode' },
          { status: 400 }
        );
      }

      transcriptsToProcess = [
        {
          text: body.text,
          timestamp_in_session: body.timestamp_in_session,
          duration_seconds: body.duration_seconds,
          speaker_identified: body.speaker_identified,
          language: body.language,
        },
      ];
    }

    // Process each transcript
    const insertedTranscriptIds: string[] = [];
    const errors: string[] = [];

    for (const transcriptInput of transcriptsToProcess) {
      try {
        // Clean text
        const cleanedText = cleanTranscript(transcriptInput.text);

        // Skip empty transcripts
        if (cleanedText.length === 0) {
          continue;
        }

        // Detect language if not provided
        const detectedLanguage = transcriptInput.language || detectLanguage(cleanedText);

        // Count words
        const wordCount = countWords(cleanedText);

        // Prepare insert data
        const transcriptData: TranscriptInsert = {
          session_id: sessionId,
          text: transcriptInput.text, // Store original text
          text_cleaned: cleanedText,
          word_count: wordCount,
          timestamp_in_session: transcriptInput.timestamp_in_session || null,
          duration_seconds: transcriptInput.duration_seconds || null,
          speaker_identified: transcriptInput.speaker_identified || null,
          language: detectedLanguage,
          language_confidence: transcriptInput.language ? 1.0 : 0.8, // Higher confidence if provided
          processed: false,
          contains_idea: false,
          analysis_attempted: false,
        };

        // Insert transcript
        const { data: inserted, error: insertError } = await (supabase as any)
          .from('marrai_transcripts')
          .insert(transcriptData)
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting transcript:', insertError);
          errors.push(`Failed to insert transcript: ${insertError.message}`);
        } else if (inserted) {
          insertedTranscriptIds.push(inserted.id);
        }
      } catch (transcriptError) {
        console.error('Error processing transcript:', transcriptError);
        errors.push(
          `Error processing transcript: ${transcriptError instanceof Error ? transcriptError.message : 'Unknown error'}`
        );
        // Continue with next transcript
      }
    }

    // Check if we successfully inserted any transcripts
    if (insertedTranscriptIds.length === 0) {
      return NextResponse.json(
        {
          error: 'No transcripts were successfully inserted',
          errors,
        },
        { status: 500 }
      );
    }

    // Check unprocessed word count for this session
    const { data: unprocessedTranscripts, error: countError } = await (supabase as any)
      .from('marrai_transcripts')
      .select('word_count')
      .eq('session_id', sessionId)
      .eq('processed', false);

    let totalUnprocessedWords = 0;
    let extractionTriggered = false;

    if (!countError && unprocessedTranscripts) {
      totalUnprocessedWords = (unprocessedTranscripts as any[]).reduce((sum: number, t: any) => {
        return sum + (t.word_count || 0);
      }, 0);

      // Trigger extraction if threshold reached (>= 1000 words)
      if (totalUnprocessedWords >= 1000) {
        triggerExtraction(sessionId);
        extractionTriggered = true;
      }
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Successfully ingested ${insertedTranscriptIds.length} transcript(s)`,
        transcriptIds: insertedTranscriptIds,
        transcriptsInserted: insertedTranscriptIds.length,
        totalUnprocessedWords,
        extractionTriggered,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in ingest-transcripts API route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

