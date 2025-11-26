/**
 * Transcription API Route using Vercel AI SDK with Whisper
 * 
 * Stable, production-ready transcription for Darija/Tamazight/French/English
 * Uses OpenAI Whisper model via Vercel AI SDK
 */

import { experimental_transcribe as transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { audioData, language } = await req.json();

    if (!audioData) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Map language codes to Whisper language codes
    const languageMap: Record<string, string> = {
      'darija': 'ar',
      'ar-MA': 'ar',
      'fr': 'fr',
      'fr-FR': 'fr',
      'fr-MA': 'fr',
      'en': 'en',
      'en-US': 'en',
      'en-GB': 'en',
    };

    const whisperLanguage = languageMap[language] || 'auto';

    // Transcribe using Whisper via Vercel AI SDK
    const { text } = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: audioData, // Can be base64 string, Uint8Array, or URL
      // Note: language parameter is not supported in the current SDK version
      // The model will auto-detect the language
    });

    return NextResponse.json({ 
      transcription: text,
      language: whisperLanguage 
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

