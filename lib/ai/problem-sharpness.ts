/**
 * Problem Sharpness Analyzer
 * 
 * Based on Concept Ventures pre-seed framework:
 * - Avoid vague "big spaces" (e.g., "AI for healthcare")
 * - Define exact friction
 * - Identify who has the problem
 * - What specific job are they trying to do?
 * - Why is it painful right now?
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ProblemSharpnessAnalysis {
  score: number; // 1-5
  isVague: boolean;
  identifiedFriction: string | null;
  targetPersona: string | null;
  specificJob: string | null;
  painPoint: string | null;
  suggestions: string[];
  sharpenedProblem: string | null;
}

export async function analyzeProblemSharpness(
  problemStatement: string,
  title?: string,
  category?: string
): Promise<ProblemSharpnessAnalysis> {
  const prompt = `Tu es un expert en évaluation de startups pré-seed. Analyse la netteté du problème décrit.

PROBLÈME ACTUEL:
Titre: ${title || 'N/A'}
Catégorie: ${category || 'N/A'}
Problème: ${problemStatement}

ÉVALUE selon ces critères (1-5):
1. **Évite les espaces vagues** (ex: "AI pour la santé" = vague, "Les médecins perdent 2h/jour à remplir des formulaires" = net)
2. **Friction exacte identifiée** - Quelle est la friction précise?
3. **Persona cible claire** - Qui a exactement ce problème?
4. **Job spécifique** - Quelle tâche spécifique essaie-t-il d'accomplir?
5. **Point de douleur** - Pourquoi c'est douloureux MAINTENANT?

Retourne UNIQUEMENT un JSON valide:
{
  "score": 3, // 1-5
  "isVague": true, // true si trop vague
  "identifiedFriction": "La friction exacte identifiée ou null",
  "targetPersona": "Persona cible spécifique ou null",
  "specificJob": "Tâche spécifique ou null",
  "painPoint": "Pourquoi c'est douloureux maintenant ou null",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "sharpenedProblem": "Version affinée du problème (plus spécifique) ou null"
}

IMPORTANT:
- Retourne UNIQUEMENT le JSON, pas de markdown
- Score 1-2 = très vague, besoin d'affinage majeur
- Score 3 = acceptable mais peut être amélioré
- Score 4-5 = problème net et spécifique
- Si score < 3, fournis un "sharpenedProblem" amélioré`;

  try {
    // Try Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt,
          }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              // Validate required fields
              if (typeof parsed.score === 'number' && parsed.score >= 1 && parsed.score <= 5) {
                return {
                  score: parsed.score,
                  isVague: parsed.isVague ?? (parsed.score < 3),
                  identifiedFriction: parsed.identifiedFriction || null,
                  targetPersona: parsed.targetPersona || null,
                  specificJob: parsed.specificJob || null,
                  painPoint: parsed.painPoint || null,
                  suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                  sharpenedProblem: parsed.sharpenedProblem || null,
                };
              }
            } catch (parseError) {
              if (process.env.NODE_ENV === 'development') {
                console.error('JSON parse error:', parseError);
              }
            }
          }
        }
      } catch (anthropicError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Anthropic error:', anthropicError);
        }
        // Fall through to next provider
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const text = response.choices[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed.score === 'number' && parsed.score >= 1 && parsed.score <= 5) {
              return {
                score: parsed.score,
                isVague: parsed.isVague ?? (parsed.score < 3),
                identifiedFriction: parsed.identifiedFriction || null,
                targetPersona: parsed.targetPersona || null,
                specificJob: parsed.specificJob || null,
                painPoint: parsed.painPoint || null,
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                sharpenedProblem: parsed.sharpenedProblem || null,
              };
            }
          } catch (parseError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('JSON parse error:', parseError);
            }
          }
        }
      } catch (openaiError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('OpenAI error:', openaiError);
        }
        // Fall through to next provider
      }
    }

    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
      try {
        const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');
        const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed.score === 'number' && parsed.score >= 1 && parsed.score <= 5) {
              return {
                score: parsed.score,
                isVague: parsed.isVague ?? (parsed.score < 3),
                identifiedFriction: parsed.identifiedFriction || null,
                targetPersona: parsed.targetPersona || null,
                specificJob: parsed.specificJob || null,
                painPoint: parsed.painPoint || null,
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                sharpenedProblem: parsed.sharpenedProblem || null,
              };
            }
          } catch (parseError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('JSON parse error:', parseError);
            }
          }
        }
      } catch (geminiError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Gemini error:', geminiError);
        }
        // Fall through to default
      }
    }

    // Default fallback - return a valid structure even if no API works
    return {
      score: 3,
      isVague: true,
      identifiedFriction: null,
      targetPersona: null,
      specificJob: null,
      painPoint: null,
      suggestions: ['Aucune API configurée. Veuillez configurer ANTHROPIC_API_KEY, OPENAI_API_KEY ou GEMINI_API_KEY.'],
      sharpenedProblem: null,
    };
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error analyzing problem sharpness:', error);
    }
    // Return a valid structure even on error
    return {
      score: 3,
      isVague: true,
      identifiedFriction: null,
      targetPersona: null,
      specificJob: null,
      painPoint: null,
      suggestions: ['Erreur lors de l\'analyse. Veuillez réessayer.'],
      sharpenedProblem: null,
    };
  }
}

