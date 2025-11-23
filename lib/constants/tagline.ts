/**
 * App Tagline and Value Proposition
 * 
 * Multi-language taglines with emotional connection
 * 4 languages: Darija, Tamazight, French, English
 */

export type Language = 'darija' | 'tamazight' | 'fr' | 'en';

export const APP_TAGLINE = {
  // Main emotional tagline (mirrors fear + command)
  main: {
    darija: {
      headline: "فكرة فبالك وكتخاف تضيع؟ دير صوتك دابا.",
      subtext: "127 شاب كيديروها. ب3 دقايق تولي خطة عمل."
    },
    tamazight: {
      headline: "ⴰⴷⴳⴳⴰⵔ ⴷ ⵓⵔⴰⵏⴷⴰⵢ? ⵎⴰⵀⴼⵓⵛ? ⵙⵙⴰⵡⴰⵍ ⴰⵎⴰⵢⵏⵓ.",
      headlineLatin: "Adggar d uranday? Mahfuch? Ssawal amaynu.",
      subtext: "127 ⵉⵙⴳⴰⵏ ⴷ ⵙⴰⵔⵓ. ⴷ 3 ⵜⵓⵙⴳⴰⴳⵉⵏ, ⴰⴷ ⵜⵔⴱⴳⴳⵓⵍ ⴰⵔⴰⵎⴰⵡⵓ.",
      subtextLatin: "127 isgan d saru. D 3 tusgagin, ad trbggul aramawu."
    },
    fr: {
      headline: "Tu as une idée qui te trotte dans la tête ? Enregistre-la maintenant.",
      subtext: "127 jeunes le font. En 3 minutes, ça devient un business plan."
    },
    en: {
      headline: "Got an idea you're scared to lose? Record it now.",
      subtext: "127 youth are doing it. In 3 minutes, it becomes a business plan."
    }
  },
  
  // Short version (for navigation/menu)
  short: {
    darija: "من الفكرة للشركة، بصوتك",
    tamazight: "ⵙⵉⵏⵉⵎⴰⵙ ⵙⵉⵏⵉⵎⴰⵙⵏ, ⵙⵙⴰⵡⴰⵍ",
    fr: "Idée → Entreprise, juste avec ta voix",
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
    darija: "فكرة فبالك؟ دير صوتك دابا. 7 وكلاء ذكاء اصطناعي غادي يوليها شركة. بلا فلوس. بلا كتابة.",
    tamazight: "Adggar d uranday? Ssawal amaynu. 7 imssawn n yimssin nnnimn ssawaln, ad trbggul aferyigh.",
    fr: "Transforme ton idée en entreprise avec 7 agents IA. Parle ton idée, reçois un plan d'action personnalisé. Gratuit, sans écrire.",
    en: "Transform your idea into a business with 7 AI agents. Speak your idea, get a personalized action plan. Free, no writing required."
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

