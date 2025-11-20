import { NextResponse } from 'next/server';

/**
 * POST /api/test-claude
 * Test endpoint to verify Claude API integration
 * Includes environment variable checks and detailed error diagnosis
 */
export async function POST() {
  try {
    // Step 1: Check environment variable
    const envCheck = {
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      keyPreview: process.env.ANTHROPIC_API_KEY
        ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...${process.env.ANTHROPIC_API_KEY.substring(process.env.ANTHROPIC_API_KEY.length - 4)}`
        : null,
    };

    if (!envCheck.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anthropic API key not configured',
          env_check: envCheck,
          api_connected: false,
          timestamp: new Date().toISOString(),
          diagnosis: {
            issue: 'Missing environment variable',
            solution: 'Add ANTHROPIC_API_KEY to .env.local',
            location: 'Create or update .env.local in project root',
            note: 'This key should be server-side only (not NEXT_PUBLIC_)',
          },
        },
        { status: 500 }
      );
    }

    // Step 1.5: Dynamically import anthropic to handle missing API key gracefully
    let anthropic: any;
    let CLAUDE_MODEL: string;

    try {
      const anthropicModule = await import('@/lib/anthropic');
      anthropic = anthropicModule.anthropic;
      CLAUDE_MODEL = anthropicModule.CLAUDE_MODEL;
    } catch (importError: any) {
      // Handle case where module fails to load (e.g., missing API key)
      console.error('Failed to import anthropic module:', importError.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to initialize Anthropic client',
          env_check: envCheck,
          api_connected: false,
          timestamp: new Date().toISOString(),
          diagnosis: {
            issue: 'Anthropic client initialization failed',
            possible_causes: ['Module import error', 'Invalid API key format', importError.message],
            solutions: [
              'Check that ANTHROPIC_API_KEY is correctly formatted in .env.local',
              'Restart your dev server after adding the key',
              'Verify the key has no extra spaces or quotes',
              'Ensure the API key is valid in Anthropic dashboard',
            ],
          },
        },
        { status: 500 }
      );
    }

    // Step 2: Test Claude API with a simple prompt
    const testPrompt = 'Say "Hello from Claude!" and tell me the current date in French format. Keep your response brief.';

    try {
      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: testPrompt,
          },
        ],
      });

      // Extract text content from response
      const textContent = message.content.find((block: any) => block.type === 'text');
      const responseText = textContent && 'text' in textContent ? textContent.text : 'No text response';

      // Log successful response
      console.log('Claude API test successful:', {
        model: CLAUDE_MODEL,
        tokens_used: message.usage?.input_tokens && message.usage?.output_tokens
          ? message.usage.input_tokens + message.usage.output_tokens
          : null,
        response_length: responseText.length,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Claude API connection successful',
          env_check: envCheck,
          api_connected: true,
          timestamp: new Date().toISOString(),
          test_details: {
            model: CLAUDE_MODEL,
            prompt: testPrompt,
            response: responseText,
            usage: message.usage
              ? {
                  input_tokens: message.usage.input_tokens,
                  output_tokens: message.usage.output_tokens,
                  total_tokens: message.usage.input_tokens + message.usage.output_tokens,
                }
              : null,
            response_id: message.id,
            stop_reason: message.stop_reason,
          },
        },
        { status: 200 }
      );
    } catch (apiError: any) {
      console.error('Claude API error:', apiError);

      // Diagnose common issues
      let diagnosis = {
        issue: apiError.message || 'Unknown API error',
        possible_causes: [] as string[],
        solutions: [] as string[],
      };

      if (apiError.status === 401) {
        diagnosis.possible_causes.push('Invalid API key');
        diagnosis.solutions.push('Verify ANTHROPIC_API_KEY is correct in .env.local');
        diagnosis.solutions.push('Check for extra spaces or quotes in .env.local');
        diagnosis.solutions.push('Regenerate API key in Anthropic dashboard');
      } else if (apiError.status === 429) {
        diagnosis.possible_causes.push('Rate limit exceeded');
        diagnosis.solutions.push('Wait a few minutes and try again');
        diagnosis.solutions.push('Check your Anthropic account usage limits');
      } else if (apiError.status === 400) {
        diagnosis.possible_causes.push('Invalid request');
        diagnosis.solutions.push('Check that CLAUDE_MODEL is valid');
        diagnosis.solutions.push('Verify request format matches Anthropic API spec');
      } else if (apiError.message?.includes('fetch')) {
        diagnosis.possible_causes.push('Network error');
        diagnosis.solutions.push('Check internet connection');
        diagnosis.solutions.push('Verify Anthropic API is accessible');
      } else if (apiError.message?.includes('API key')) {
        diagnosis.possible_causes.push('API key issue');
        diagnosis.solutions.push('Verify ANTHROPIC_API_KEY is set correctly');
        diagnosis.solutions.push('Ensure key has proper permissions');
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Claude API call failed',
          env_check: envCheck,
          api_connected: false,
          timestamp: new Date().toISOString(),
          error: {
            status: apiError.status,
            statusText: apiError.statusText,
            message: apiError.message,
            name: apiError.name,
            stack: process.env.NODE_ENV === 'development' ? apiError.stack : undefined,
          },
          diagnosis,
        },
        { status: apiError.status || 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in Claude test:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
        api_connected: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

