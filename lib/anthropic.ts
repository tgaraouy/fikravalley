import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claude API Client
 * 
 * ⚠️ SERVER-SIDE ONLY
 * This client is intended for use in Next.js API routes and server-side code only.
 * Never import or use this in client-side components, as it contains the API key.
 * 
 * Usage in API routes:
 * ```typescript
 * import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';
 * 
 * const response = await anthropic.messages.create({
 *   model: CLAUDE_MODEL,
 *   max_tokens: 4000,
 *   messages: [...]
 * });
 * ```
 */

// Claude model constant
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Get API key from environment variables
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  throw new Error(
    'Missing ANTHROPIC_API_KEY environment variable. Please ensure ANTHROPIC_API_KEY is set in your .env.local file.'
  );
}

// Create Anthropic client instance
export const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

