/**
 * Distribution Channel Mapping Agent
 * 
 * "If you build it, they will NOT come... you must own your community"
 * Identifies Moroccan distribution channels with WhatsApp-first approach
 */

import Anthropic from '@anthropic-ai/sdk';

export interface DistributionChannel {
  type: 'whatsapp' | 'facebook' | 'physical';
  name: string;
  description: string;
  estimated_members?: number;
  engagement_rate?: string;
  intro_message_darija: string;
  intro_message_fr: string;
}

export class DistributionAgent {
  private claude: Anthropic;

  constructor(apiKey?: string) {
    this.claude = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async mapChannels(idea: string): Promise<DistributionChannel[]> {
    const prompt = `Given this idea: "${idea}", identify 3 Moroccan distribution channels:

CONTEXT: Target user is in Morocco.
- Primary language: Darija (Moroccan Arabic)
- Secondary: French
- Distribution: WhatsApp groups (99% open rate), Facebook pages, physical locations (universities, cafés, mosques)

For each channel, provide:
1. WhatsApp groups: topic + estimated members
2. Facebook pages: name + engagement rate
3. Physical locations: university clubs, cafés, mosques

For each, write a 1-sentence intro message in Darija that DOESN'T sound like a sales pitch.
Goal: Get 10 genuine responses, not likes.

Format: JSON array with fields: type, name, description, estimated_members (for WhatsApp), engagement_rate (for Facebook), intro_message_darija, intro_message_fr.

Be specific. No generic channels.`;

    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.4,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    const cleaned = text.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned) as DistributionChannel[];
    } catch (error) {
      // Fallback
      return [
        {
          type: 'whatsapp',
          name: 'Groupe WhatsApp - Idées Entrepreneuriales',
          description: 'Groupe local pour entrepreneurs',
          estimated_members: 150,
          intro_message_darija: 'Salam, kayn chi had l\'idée dial... bghit nchof wach kayn chi wahd kay3ref chi wahd li kay3ani men had l\'mochkil',
          intro_message_fr: 'Bonjour, j\'ai cette idée concernant... Je cherche quelqu\'un qui connaît ce problème'
        },
        {
          type: 'facebook',
          name: 'Page Facebook - Entrepreneurs Maroc',
          description: 'Page communautaire pour entrepreneurs',
          engagement_rate: '5-8%',
          intro_message_darija: 'Salam, kayn chi had l\'idée... bghit nchof wach kayn chi wahd kay3ref chi wahd li kay3ani men had l\'mochkil',
          intro_message_fr: 'Bonjour, j\'ai cette idée... Je cherche quelqu\'un qui connaît ce problème'
        },
        {
          type: 'physical',
          name: 'Club Entrepreneuriat - Université',
          description: 'Club étudiant local',
          intro_message_darija: 'Salam, kayn chi had l\'idée... bghit nchof wach kayn chi wahd kay3ref chi wahd li kay3ani men had l\'mochkil',
          intro_message_fr: 'Bonjour, j\'ai cette idée... Je cherche quelqu\'un qui connaît ce problème'
        }
      ];
    }
  }

  async generateContentPosts(idea: string, count: number = 5): Promise<{
    post: string;
    platform: 'reddit' | 'linkedin';
    best_time: string; // Morocco timezone
  }[]> {
    const prompt = `Generate ${count} Reddit/LinkedIn posts (French) about validating ideas in Morocco.

Each post must:
- Share ONE specific micro-step (e.g., "I asked 3 students about X")
- Include a real quote from an interview (make it realistic)
- End with: "What's blocking your micro-step?" (invites engagement)
- NO mention of Fikra Valley in post (build trust first)

Output: JSON array with fields: post, platform, best_time (Morocco timezone, format: "HH:MM").

Be authentic. Not salesy.`;

    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.6,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    const cleaned = text.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      return [];
    }
  }
}

