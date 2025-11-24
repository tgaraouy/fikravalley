/**
 * App Tagline and Value Proposition
 * 
 * Multi-language taglines with emotional connection
 * 4 languages: Darija, Tamazight, French, English
 */

export type Language = 'darija' | 'tamazight' | 'fr' | 'en';

export const APP_TAGLINE = {
  // Main emotional tagline (conviction + validation)
  main: {
    darija: {
      headline: "فكرة فبالك وكتأكد بلي شركة؟ بغيتي تتحقق منها.",
      subtext: "دير صوتك دابا. 7 وكلاء ذكاء اصطناعي غادي يتحققو منها."
    },
    tamazight: {
      headline: "ⴰⴷⴳⴳⴰⵔ ⴷⴰⵎⵙⵓⵏ ⴷ ⴰⴼⴰⵔⵉⵖ? ⴱⵖⵉⵏⴰⴷ ⵜⵙⵏⵙⵏⵙ.",
      headlineLatin: "Adggar dameshun d aferyigh? Bghinad tsnsns.",
      subtext: "ⵙⵙⴰⵡⴰⵍ ⴰⵎⴰⵢⵏⵓ. 7 ⵉⵎⵙⵙⴰⵡⵏ ⵏ ⵢⵉⵎⵙⵙⵉⵏ ⴰⴷ ⵙⵏⵙⵏⵙⵏ.",
      subtextLatin: "Ssawal amaynu. 7 imssawn n yimssin ad snsnsn."
    },
    fr: {
      headline: "Tu es convaincu que ton idée est un business ? Valide-la.",
      subtext: "Enregistre ta voix. 7 agents IA vont la valider pour toi."
    },
    en: {
      headline: "Convinced your idea is a business? Validate it.",
      subtext: "Record your voice. 7 AI agents will validate it for you."
    }
  },
  
  // Short version (for navigation/menu)
  short: {
    darija: "من الفكرة للشركة، بصوتك",
    tamazight: "ⵙⵉⵏⵉⵎⴰⵙ ⵙⵉⵏⵉⵎⴰⵙⵏ, ⵙⵙⴰⵡⴰⵍ",
    fr: "Idée → Business, juste avec ta voix",
    en: "Idea → Business, just with your voice"
  },
  
  // Transformation tagline (under logo - ≤3 words)
  transformation: {
    darija: "فكرة → واقع",
    tamazight: "Adggar → Asaru",
    tamazightTifinagh: "ⴰⴷⴳⴳⴰⵔ → ⴰⵙⴰⵔⵓ",
    fr: "Idée → Réalité",
    en: "Idea → Reality"
  },
  
  // Full value proposition
  valueProposition: {
    darija: "7 وكلاء ذكاء اصطناعي كيستمعو لصوتك، كيحللوا فكرتك، وكيخلقو خطة عمل مخصصة",
    tamazight: "7 ⵉⵎⵙⵙⴰⵡⵏ ⵏ ⵢⵉⵎⵙⵙⵉⵏ ⵏⵏⵉⵎⵏ ⵙⵙⴰⵡⴰⵍⵏ, ⵙⵙⵏⵙⵏⵏ, ⵙⵙⵏⵙⵏⵏ ⴰⵎⵙⵙⵓⵏ",
    fr: "7 agents IA écoutent ta voix, analysent ton idée, et créent un plan d'action sur mesure",
    en: "7 AI agents listen to your voice, analyze your idea, and create a customized action plan"
  },
  
  // Meta description
  meta: {
    darija: "فكرة فبالك وكتأكد بلي شركة؟ بغيتي تتحقق منها. 7 وكلاء ذكاء اصطناعي غادي يتحققو منها. بلا فلوس. بلا كتابة.",
    tamazight: "Adggar dameshun d aferyigh? Bghinad tsnsns. 7 imssawn n yimssin ad snsnsn. Ssawal amaynu.",
    fr: "Tu es convaincu que ton idée est un business ? Valide-la avec 7 agents IA. Enregistre ta voix, reçois une validation complète. Gratuit, sans écrire.",
    en: "Convinced your idea is a business? Validate it with 7 AI agents. Record your voice, get complete validation. Free, no writing required."
  },
  
  // Benefits (short)
  benefits: {
    darija: ["بلا فلوس", "بلا كتابة", "بلا تعقيد", "فقط صوتك وفكرتك"],
    tamazight: ["ⵙⵙⵏⵉⵎⵙⵏ", "ⵙⵙⵏⵉⵎⵙⵏ", "ⵙⵙⵏⵉⵎⵙⵏ", "ⵙⵙⵏⵉⵎⵙⵏ"],
    fr: ["Gratuit", "Sans écrire", "Sans complication", "Juste ta voix et ton idée"],
    en: ["Free", "No writing", "No complication", "Just your voice and your idea"]
  }
};

/**
 * Get tagline for a specific language
 */
export function getTagline(lang: Language, type: 'main' | 'short' | 'value' | 'meta' = 'main') {
  if (type === 'main') {
    return APP_TAGLINE.main[lang];
  }
  return APP_TAGLINE[type][lang];
}

/**
 * Detect user language from browser
 */
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  
  const browserLang = navigator.language.toLowerCase();
  
  // Darija (Moroccan Arabic)
  if (browserLang.startsWith('ar') || browserLang.includes('ma')) {
    return 'darija';
  }
  
  // Tamazight (Berber languages)
  if (browserLang.includes('ber') || browserLang.includes('tzm') || browserLang.includes('zgh')) {
    return 'tamazight';
  }
  
  // French
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  
  // Default to French for Morocco
  return 'fr';
}

