/**
 * Micro-Module Generator
 * 
 * Creates 60-second video scripts in Darija
 * Optimized for noisy environments (public transport, cafés)
 */

import Anthropic from '@anthropic-ai/sdk';

export interface MicroModule {
  topic: string;
  script: {
    timestamp: string;
    visual_description: string;
    subtitle_text_darija: string;
    subtitle_text_fr: string;
  }[];
  total_duration: number; // seconds
}

export class MicroModuleGenerator {
  private claude: Anthropic;

  constructor(apiKey?: string) {
    this.claude = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  async generateModule(topic: string): Promise<MicroModule> {
    const prompt = `Create a 60-second video script (Darija) explaining: "${topic}"

CONTEXT: Target user is in Morocco.
- Primary language: Darija (Moroccan Arabic)
- Secondary: French
- Environment: Noisy (public transport, cafés)
- Digital literacy: Low

Script structure:
- 0-10s: Show visual (not coding, something relatable)
- 10-30s: Core concept explanation
- 30-50s: Concrete example
- 50-60s: Call to action

Include:
- Visual description for video editor
- Subtitle text in Darija (primary)
- Subtitle text in French (secondary)
- Timestamps for each segment

Format: JSON with fields: topic, script[{timestamp, visual_description, subtitle_text_darija, subtitle_text_fr}], total_duration.

Keep it simple. No jargon. Relatable examples.`;

    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.5,
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
      return JSON.parse(cleaned) as MicroModule;
    } catch (error) {
      // Fallback
      return {
        topic,
        script: [
          {
            timestamp: '0-10s',
            visual_description: 'Student drawing on paper, not coding',
            subtitle_text_darija: 'MVP ما هو؟',
            subtitle_text_fr: 'Qu\'est-ce qu\'un MVP?'
          },
          {
            timestamp: '10-30s',
            visual_description: 'Simple drawing vs complex app',
            subtitle_text_darija: 'MVP = أصغر اختبار، مش منتوج كامل',
            subtitle_text_fr: 'MVP = plus petit test, pas produit parfait'
          },
          {
            timestamp: '30-50s',
            visual_description: 'Student posting video on WhatsApp',
            subtitle_text_darija: 'مثال: اختبر واش الطلبة بغاو دروس بالدارجة ببوسط فيديو واحد',
            subtitle_text_fr: 'Exemple: Teste si les étudiants veulent des cours en Darija en postant 1 vidéo'
          },
          {
            timestamp: '50-60s',
            visual_description: 'Student starting simple',
            subtitle_text_darija: 'بدا من هنا، مش من تطبيق',
            subtitle_text_fr: 'Commence ici, pas avec une app'
          }
        ],
        total_duration: 60
      };
    }
  }
}

