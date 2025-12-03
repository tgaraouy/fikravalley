/**
 * Extract Idea Metadata from Voice/Text
 * 
 * Uses LLM to automatically extract:
 * - Title
 * - Category
 * - Location
 * - Submitter type
 * - Moroccan priorities alignment
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedMetadata {
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  category: string;
  location: string;
  submitter_type: 'student' | 'entrepreneur' | 'professional' | 'unemployed';
  moroccan_priorities?: string[];
  confidence: number;
}

const CATEGORY_MAP: Record<string, string> = {
  'santé': 'health',
  'health': 'health',
  'hôpital': 'health',
  'médecine': 'health',
  'éducation': 'education',
  'education': 'education',
  'école': 'education',
  'université': 'education',
  'tech': 'tech',
  'technologie': 'tech',
  'agriculture': 'agriculture',
  'finance': 'finance',
  'banque': 'finance',
  'tourisme': 'tourism',
  'autre': 'other',
};

const LOCATION_MAP: Record<string, string> = {
  'casablanca': 'casablanca',
  'casa': 'casablanca',
  'rabat': 'rabat',
  'marrakech': 'marrakech',
  'fes': 'fes',
  'fès': 'fes',
  'tanger': 'tangier',
  'agadir': 'agadir',
  'meknes': 'meknes',
  'oujda': 'oujda',
};

/**
 * Extract metadata from idea transcript using LLM
 */
export async function extractIdeaMetadata(transcript: string): Promise<ExtractedMetadata> {
  const prompt = `Analyse ce texte d'idée entrepreneuriale marocaine et extrais les métadonnées suivantes:

1. **Titre** (max 100 caractères): Un titre court et descriptif de l'idée
2. **Énoncé du problème** (complet): Le problème identifié par l'entrepreneur
3. **Solution proposée** (si mentionnée): La solution ou approche suggérée
4. **Catégorie**: Une seule catégorie parmi: health, education, tech, agriculture, finance, tourism, infrastructure, administration, logistics, customer_service, inclusion, other
5. **Localisation**: Une ville marocaine (casablanca, rabat, marrakech, kenitra, tangier, agadir, fes, meknes, oujda) ou "other"
6. **Type de profil**: student, entrepreneur, professional, ou unemployed (basé sur le contexte)

Texte: "${transcript}"

Retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "title": "string",
  "problem_statement": "string",
  "proposed_solution": "string ou null",
  "category": "string",
  "location": "string",
  "submitter_type": "student|entrepreneur|professional|unemployed",
  "confidence": 0.0-1.0
}

Pas de markdown, pas de texte supplémentaire, juste le JSON.`;

  // Try multiple providers with fallback
  const providers = [
    async () => {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('No Anthropic key');
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return parseJSONResponse(text);
    },
    async () => {
      if (!process.env.OPENAI_API_KEY) throw new Error('No OpenAI key');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      const text = response.choices[0]?.message?.content || '';
      return parseJSONResponse(text);
    },
    async () => {
      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) throw new Error('No Gemini key');
      const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!);
      const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseJSONResponse(text);
    },
  ];

  // Try each provider with fallback
  for (const provider of providers) {
    try {
      const result = await provider();
      if (result) {
        // Normalize category and location
        result.category = normalizeCategory(result.category);
        result.location = normalizeLocation(result.location);
        return result;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error with provider:', error);
      }
      continue;
    }
  }

  // Fallback: Basic extraction
  return {
    title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
    problem_statement: transcript,
    category: 'other',
    location: 'other',
    submitter_type: 'entrepreneur',
    confidence: 0.3,
  };
}

function parseJSONResponse(text: string): ExtractedMetadata | null {
  try {
    // Try to extract JSON from text (might have markdown code blocks)
    let jsonText = text.trim();
    
    // Remove markdown code blocks
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Validate required fields
    if (!parsed.title || !parsed.problem_statement || !parsed.category || !parsed.location || !parsed.submitter_type) {
      return null;
    }
    
    return {
      title: parsed.title.substring(0, 100),
      problem_statement: parsed.problem_statement,
      proposed_solution: parsed.proposed_solution || undefined,
      category: parsed.category,
      location: parsed.location,
      submitter_type: parsed.submitter_type,
      confidence: parsed.confidence || 0.7,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error parsing JSON:', error);
    }
    return null;
  }
}

function normalizeCategory(category: string): string {
  const lower = category.toLowerCase().trim();
  
  // Direct match
  if (['health', 'education', 'tech', 'agriculture', 'finance', 'tourism', 'infrastructure', 'administration', 'logistics', 'customer_service', 'inclusion', 'other'].includes(lower)) {
    return lower;
  }
  
  // Map from French/common names
  return CATEGORY_MAP[lower] || 'other';
}

function normalizeLocation(location: string): string {
  const lower = location.toLowerCase().trim();
  
  // Direct match
  if (['casablanca', 'rabat', 'marrakech', 'kenitra', 'tangier', 'agadir', 'fes', 'meknes', 'oujda', 'other'].includes(lower)) {
    return lower;
  }
  
  // Map from variations
  return LOCATION_MAP[lower] || 'other';
}

