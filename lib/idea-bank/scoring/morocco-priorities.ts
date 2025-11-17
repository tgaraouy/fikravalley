/**
 * Morocco Government Priorities
 * 
 * Primary framework for strategic alignment scoring
 * SDGs are auto-mapped as secondary metadata for funders
 */

export interface MoroccoPriority {
  id: string;
  name: string;
  nameAr: string;
  nameDarija: string;
  description: string;
  sdgMapping: number[]; // Auto-map to SDGs
  keywords: string[]; // For auto-detection
}

export const MOROCCO_PRIORITIES: MoroccoPriority[] = [
  {
    id: 'green_morocco',
    name: 'Green Morocco Plan',
    nameAr: 'المغرب الأخضر',
    nameDarija: 'L-Maghrib l-akhdar',
    description: 'Climate action, renewable energy, sustainable agriculture',
    sdgMapping: [7, 13, 15], // Clean Energy, Climate Action, Life on Land
    keywords: ['climate', 'energy', 'solar', 'environment', 'carbon', 'renewable', 'agriculture', 'farm', 'akhdar', 'green', 'bi2a', 'manakh']
  },
  {
    id: 'digital_morocco',
    name: 'Digital Morocco 2025',
    nameAr: 'المغرب الرقمي',
    nameDarija: 'L-Maghrib r-raqami',
    description: 'Digital transformation, e-government, tech innovation',
    sdgMapping: [9], // Industry, Innovation, Infrastructure
    keywords: ['digital', 'technology', 'internet', 'app', 'software', 'online', 'tech', 'AI', 'raqami', 'numérique', 'e-government', 'e-gouvernement']
  },
  {
    id: 'vision_2030',
    name: 'Vision 2030',
    nameAr: 'رؤية 2030',
    nameDarija: 'Ro2ya 2030',
    description: 'Economic development, competitiveness, human capital',
    sdgMapping: [8, 9], // Decent Work, Innovation
    keywords: ['economy', 'growth', 'development', 'competitiveness', 'iqtisad', 'tanmiya', 'croissance']
  },
  {
    id: 'youth_employment',
    name: 'Youth Employment Priority',
    nameAr: 'أولوية تشغيل الشباب',
    nameDarija: 'Awlawiyat tash ghil sh-shabab',
    description: 'Job creation for young people, entrepreneurship',
    sdgMapping: [8], // Decent Work
    keywords: ['youth', 'shabab', 'job', 'khdma', 'employment', 'entrepreneur', 'startup', 'jeune', 'tashghil', 'emploi']
  },
  {
    id: 'women_empowerment',
    name: 'Women Entrepreneurship',
    nameAr: 'ريادة الأعمال النسائية',
    nameDarija: 'Riyada n-nisa',
    description: 'Economic empowerment of women, gender equality',
    sdgMapping: [5, 8], // Gender Equality, Decent Work
    keywords: ['women', 'mra', 'nisa', 'female', 'gender', 'equality', 'mosawat', 'femme', 'égalité']
  },
  {
    id: 'rural_development',
    name: 'Rural Development',
    nameAr: 'التنمية القروية',
    nameDarija: 'Tanmiya dial l-qrawi',
    description: 'Infrastructure and services for rural areas',
    sdgMapping: [1, 2, 6, 11], // No Poverty, Zero Hunger, Clean Water, Sustainable Cities
    keywords: ['rural', 'village', 'qrya', 'countryside', 'farmer', 'fellah', 'qrawi', 'rural', 'campagne']
  },
  {
    id: 'health_system',
    name: 'Healthcare Improvement',
    nameAr: 'تحسين الصحة',
    nameDarija: 'T7sin s-si7a',
    description: 'Better healthcare access and quality',
    sdgMapping: [3], // Good Health
    keywords: ['health', 'si7a', 'hospital', 'sbitar', 'medical', 'doctor', 'tbib', 'nurse', 'santé', 'patient']
  },
  {
    id: 'education_quality',
    name: 'Quality Education',
    nameAr: 'التعليم الجيد',
    nameDarija: 'Ta3lim mezyan',
    description: 'Improved education access and outcomes',
    sdgMapping: [4], // Quality Education
    keywords: ['education', 'ta3lim', 'school', 'madrasa', 'university', 'student', 'talib', 'teacher', 'prof', 'éducation']
  }
];

/**
 * Get Morocco priority by ID
 */
export function getMoroccoPriority(id: string): MoroccoPriority | undefined {
  return MOROCCO_PRIORITIES.find(p => p.id === id);
}

/**
 * Comprehensive Morocco Priority Keywords
 * Multi-language keywords for robust detection
 */
const MOROCCO_PRIORITY_KEYWORDS: Record<string, string[]> = {
  green_morocco: [
    // Darija
    'bi2a', 'akhdar', 'taqa shamsia', 'riya7', 'ma7routh', 'manakh', '7itawi',
    'filaha', 'zra3a', 'fellah', 'fellahin', 'maghrib akhdar',
    // French
    'environnement', 'vert', 'solaire', 'renouvelable', 'climat', 'écologie',
    'agriculture', 'durable', 'carbone', 'énergie', 'éolien', 'photovoltaïque',
    // Arabic
    'بيئة', 'أخضر', 'طاقة', 'متجددة', 'مناخ', 'زراعة', 'فلاح', 'فلاحة',
    // English
    'environment', 'green', 'solar', 'renewable', 'climate', 'ecology',
    'agriculture', 'sustainable', 'carbon', 'energy', 'wind', 'photovoltaic',
  ],
  
  digital_morocco: [
    // Darija
    'raqami', 'technology', 'internet', 'app', 'web', 'site', 'digital',
    'e-gouvernement', 'e-government', 'informatique', 'ordinateur',
    // French
    'numérique', 'technologie', 'application', 'internet', 'web', 'site',
    'e-gouvernement', 'informatique', 'ordinateur', 'smartphone', 'mobile',
    // Arabic
    'رقمي', 'تكنولوجيا', 'تطبيق', 'إنترنت', 'موقع', 'حاسوب', 'هاتف',
    // English
    'digital', 'technology', 'internet', 'app', 'web', 'website', 'computer',
    'e-government', 'software', 'mobile', 'smartphone', 'tech',
  ],
  
  vision_2030: [
    // Darija
    'iqtisad', 'tanmiya', 'croissance', 'tana9os', 'ro2ya 2030',
    // French
    'économie', 'développement', 'croissance', 'compétitivité', 'vision 2030',
    'capital humain', 'productivité', 'innovation',
    // Arabic
    'اقتصاد', 'تنمية', 'نمو', 'منافسة', 'رؤية 2030', 'رأس المال البشري',
    // English
    'economy', 'development', 'growth', 'competitiveness', 'vision 2030',
    'human capital', 'productivity', 'innovation',
  ],
  
  youth_employment: [
    // Darija
    'shabab', 'khdma', 'tashghil', 'mashro3', 'shabab', 'jeune', 'tashghil',
    'startup', 'riyada', 'entrepreneur', 'moujtama3 madani',
    // French
    'jeune', 'emploi', 'travail', 'startup', 'entrepreneur', 'chômage',
    'insertion professionnelle', 'formation', 'compétences',
    // Arabic
    'شباب', 'عمل', 'تشغيل', 'مشروع', 'ريادة', 'مقاولة', 'بطالة',
    // English
    'youth', 'employment', 'job', 'work', 'startup', 'entrepreneur', 'unemployment',
    'professional integration', 'training', 'skills',
  ],
  
  women_empowerment: [
    // Darija
    'mra', 'nisa', 'mosawat', 'ta9dir', 'nisa', 'mra', 'riyada nisa',
    'mosawat jinsiya', 'ta9dir nisa',
    // French
    'femme', 'égalité', 'autonomisation', 'parité', 'genre', 'féminin',
    'entrepreneuriat féminin', 'leadership féminin',
    // Arabic
    'مرأة', 'نساء', 'مساواة', 'تقييم', 'جنس', 'ريادة نسائية',
    // English
    'women', 'female', 'gender', 'equality', 'empowerment', 'parity',
    'women entrepreneurship', 'women leadership',
  ],
  
  rural_development: [
    // Darija
    'qrawi', 'qrya', 'qarya', 'fellah', 'fellahin', 'tanmiya qrawiya',
    'bled', 'qrawi', 'qrya',
    // French
    'rural', 'village', 'campagne', 'agriculteur', 'paysan', 'développement rural',
    'infrastructure rurale', 'services ruraux',
    // Arabic
    'قروي', 'قرية', 'فلاح', 'فلاحة', 'تنمية قروية', 'بنية تحتية',
    // English
    'rural', 'village', 'countryside', 'farmer', 'rural development',
    'rural infrastructure', 'rural services',
  ],
  
  health_system: [
    // Darija
    'si7a', 'sbitar', 'tbib', 'doctor', 'nurse', 'mrid', 'patient',
    't7sin si7a', 'si7a 3ama',
    // French
    'santé', 'hôpital', 'médecin', 'docteur', 'infirmier', 'patient',
    'soins', 'médical', 'clinique', 'pharmacie',
    // Arabic
    'صحة', 'مستشفى', 'طبيب', 'ممرض', 'مريض', 'عناية', 'طبي',
    // English
    'health', 'hospital', 'doctor', 'nurse', 'patient', 'medical', 'care',
    'clinic', 'pharmacy', 'healthcare',
  ],
  
  education_quality: [
    // Darija
    'ta3lim', 'madrasa', 'school', 'talib', 'student', 'prof', 'teacher',
    'ta3lim mezyan', 'ta3lim 3ali',
    // French
    'éducation', 'école', 'université', 'étudiant', 'professeur', 'formation',
    'apprentissage', 'compétences', 'qualité éducative',
    // Arabic
    'تعليم', 'مدرسة', 'جامعة', 'طالب', 'أستاذ', 'تدريب', 'تعلم',
    // English
    'education', 'school', 'university', 'student', 'teacher', 'training',
    'learning', 'skills', 'quality education',
  ],
};

/**
 * Auto-detect Morocco priorities from text
 * Requires at least 2 keyword matches for better accuracy
 */
export function detectMoroccoPriorities(text: string): string[] {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];

  Object.entries(MOROCCO_PRIORITY_KEYWORDS).forEach(([priorityId, keywords]) => {
    const matches = keywords.filter(k => {
      const keywordLower = k.toLowerCase();
      // Check for whole word match or phrase match
      return lowerText.includes(keywordLower) || 
             new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lowerText);
    }).length;
    
    // Require at least 2 keyword matches for better accuracy
    if (matches >= 2) {
      detected.push(priorityId);
    }
  });

  return [...new Set(detected)]; // Remove duplicates
}

/**
 * Detect Morocco priorities with confidence scores
 * Returns priorities with match counts and confidence
 */
export function detectMoroccoPrioritiesWithConfidence(text: string): Array<{
  priorityId: string;
  matchCount: number;
  confidence: number;
  matchedKeywords: string[];
}> {
  const lowerText = text.toLowerCase();
  const results: Array<{
    priorityId: string;
    matchCount: number;
    confidence: number;
    matchedKeywords: string[];
  }> = [];

  Object.entries(MOROCCO_PRIORITY_KEYWORDS).forEach(([priorityId, keywords]) => {
    const matchedKeywords: string[] = [];
    keywords.forEach(k => {
      const keywordLower = k.toLowerCase();
      if (lowerText.includes(keywordLower) || 
          new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lowerText)) {
        matchedKeywords.push(k);
      }
    });
    
    const matchCount = matchedKeywords.length;
    if (matchCount >= 2) {
      // Confidence based on match count (2 matches = 0.6, 3+ = 0.8, 5+ = 1.0)
      const confidence = Math.min(1.0, 0.4 + (matchCount - 2) * 0.1);
      results.push({
        priorityId,
        matchCount,
        confidence,
        matchedKeywords,
      });
    }
  });

  // Sort by confidence descending
  return results.sort((a, b) => b.confidence - a.confidence);
}

