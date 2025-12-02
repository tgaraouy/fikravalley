/**
 * Vector Embeddings Utility
 * 
 * Generates embeddings for ideas using OpenAI's text-embedding-3-small model
 * Used for semantic similarity search
 */

import OpenAI from 'openai';

// Lazy initialization to ensure env vars are loaded
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Embedding model: text-embedding-3-small (1536 dimensions)
// Alternative: text-embedding-3-large (3072 dimensions) - more accurate but slower/expensive
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  const model = options.model || EMBEDDING_MODEL;
  const dimensions = options.dimensions || EMBEDDING_DIMENSIONS;

  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model,
      input: text.trim(),
      dimensions,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embedding for an idea
 * Combines title, problem statement, and solution into a single text
 */
export async function generateIdeaEmbedding(idea: {
  title: string;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  category?: string | null;
}): Promise<number[]> {
  // Combine idea fields into a single text for embedding
  const textParts = [
    idea.title || '',
    idea.problem_statement || '',
    idea.proposed_solution || '',
    idea.category || '',
  ].filter(Boolean);

  const combinedText = textParts.join('\n\n');

  if (combinedText.trim().length === 0) {
    throw new Error('Idea must have at least a title');
  }

  return generateEmbedding(combinedText);
}

/**
 * Batch generate embeddings for multiple texts
 * Useful for bulk processing
 */
export async function generateBatchEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  if (texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts
    .map((t) => t?.trim())
    .filter((t) => t && t.length > 0);

  if (validTexts.length === 0) {
    throw new Error('No valid texts provided');
  }

  const model = options.model || EMBEDDING_MODEL;
  const dimensions = options.dimensions || EMBEDDING_DIMENSIONS;

  try {
    // OpenAI supports up to 2048 inputs per batch
    const batchSize = 100; // Conservative batch size
    const batches: number[][][] = [];

    const openai = getOpenAIClient();
    for (let i = 0; i < validTexts.length; i += batchSize) {
      const batch = validTexts.slice(i, i + batchSize);

      const response = await openai.embeddings.create({
        model,
        input: batch,
        dimensions,
      });

      const embeddings = response.data.map((item) => item.embedding);
      batches.push(embeddings);

      // Rate limiting: wait 100ms between batches
      if (i + batchSize < validTexts.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return batches.flat();
  } catch (error: any) {
    console.error('Error generating batch embeddings:', error);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

