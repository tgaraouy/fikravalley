export const MOROCCAN_PRIORITIES_MAP = {
  // Green Morocco Plan
  green_morocco: {
    keywords: [
      'solaire',
      'renouvelable',
      'énergie verte',
      'recyclage',
      'déchets',
      'pollution',
      'carbone',
      'écologique',
      'durable',
      'agriculture durable',
      'eau',
      'hydrique',
      'climat',
    ],
    categories: ['agriculture', 'sustainability', 'environment', 'energy', 'infrastructure'],
    context: 'climate action, renewable energy, sustainable agriculture',
  },

  // Digital Morocco 2030
  digital_morocco: {
    keywords: [
      'ia',
      'intelligence artificielle',
      'app',
      'digital',
      'numérique',
      'tech',
      'automatisation',
      'blockchain',
      'iot',
      'streaming',
      'api',
      'smart',
    ],
    categories: ['tech', 'e-commerce', 'media', 'education', 'finance', 'infrastructure', 'customer_service'],
    context: 'digital transformation, e-government, tech innovation',
  },

  // Vision 2030 (Economic Development)
  vision_2030: {
    keywords: [
      'port',
      'logistique',
      'compétitivité',
      'export',
      'qualité',
      'standard',
      'productivité',
      'efficacité',
      'optimisation',
      'performance',
    ],
    categories: ['logistics', 'infrastructure', 'agriculture', 'commerce'],
    context: 'economic development, competitiveness, human capital',
  },

  // Youth Employment Priority
  youth_employment: {
    keywords: [
      'emploi',
      'job',
      'étudiant',
      'jeunes',
      'entrepreneur',
      'startup',
      'compétences',
      'formation',
      'recrutement',
      'talent',
      'chômage',
      'opportunité',
    ],
    categories: ['education', 'tech', 'finance', 'inclusion', 'media'],
    context: 'job creation for young people, entrepreneurship',
    target_audience: ['genz', 'jeunes', 'étudiants', 'diplômés'],
  },

  // Women Entrepreneurship
  women_entrepreneurship: {
    keywords: ['femme', 'femmes', 'maman', 'artisan femme', 'coopérative', 'maternel', 'égalité', 'gender'],
    categories: ['agriculture', 'e-commerce', 'commerce'],
    context: 'economic empowerment of women, gender equality',
    target_audience: ['femmes', 'mères'],
  },

  // Rural Development
  rural_development: {
    keywords: [
      'rural',
      'village',
      'campagne',
      'agriculteur',
      'agriculture',
      'zones reculées',
      'infrastructure rurale',
      'accès rural',
    ],
    categories: ['agriculture', 'infrastructure'],
    context: 'infrastructure and services for rural areas',
    location_type: 'rural',
  },

  // Healthcare Improvement
  healthcare_improvement: {
    keywords: [
      'santé',
      'health',
      'télémédecine',
      'thérapie',
      'psychologie',
      'clinique',
      'docteur',
      'médical',
      'hôpital',
      'santé mentale',
      'anxiété',
      'depression',
    ],
    categories: ['health', 'santé'],
    context: 'better healthcare access and quality',
  },
} as const;

export function mapBudgetTier(estimated_cost?: string | null): string {
  if (!estimated_cost) return '<1K';

  if (estimated_cost.includes('<1K') || estimated_cost.includes('1K-3K')) return '<1K';
  if (estimated_cost.includes('1K-5K') || estimated_cost.includes('3K-5K')) return '1K-5K';
  if (estimated_cost.includes('5K-10K')) return '5K-10K';
  if (estimated_cost.includes('10K+')) return '10K+';

  const numbers = estimated_cost.match(/\d+/g);
  if (!numbers) return '<1K';

  const maxBudget = Math.max(...numbers.map(Number));
  if (maxBudget < 1000) return '<1K';
  if (maxBudget <= 5000) return '1K-5K';
  if (maxBudget <= 10000) return '5K-10K';
  return '10K+';
}

export function determineLocationType(location: string | null, category: string | null, problem: string | null): string {
  const normalized = `${location || ''} ${problem || ''}`.toLowerCase();

  if (
    normalized.includes('rural') ||
    normalized.includes('village') ||
    normalized.includes('campagne') ||
    normalized.includes('agriculteur') ||
    normalized.includes('montagne') ||
    normalized.includes('atlas') ||
    normalized.includes('reculée')
  ) {
    return 'rural';
  }

  if (
    normalized.includes('maroc') &&
    !normalized.includes('casablanca') &&
    !normalized.includes('rabat') &&
    !normalized.includes('marrakech') &&
    !normalized.includes('tanger') &&
    !normalized.includes('fès') &&
    !normalized.includes('agadir')
  ) {
    return 'both';
  }

  const cities = [
    'casablanca',
    'rabat',
    'marrakech',
    'marrakesh',
    'fès',
    'tanger',
    'tetouan',
    'tétouan',
    'essaouira',
    'agadir',
    'oujda',
    'meknès',
    'beni mellal',
    'khouribga',
    'el jadida',
    'safi',
  ];
  if (cities.some((city) => normalized.includes(city))) {
    return 'urban';
  }

  const cat = (category || '').toLowerCase();
  if (cat === 'agriculture') return 'rural';
  if (cat === 'infrastructure' && normalized.includes('urbain')) return 'urban';

  return 'urban';
}

export function determineComplexity(
  ai_capabilities: string[] | null,
  integration_points: string[] | null,
  budget_tier: string
): string {
  const capabilities = ai_capabilities || [];
  const integrations = integration_points || [];

  const advanced =
    capabilities.length >= 3 ||
    capabilities.some((c) =>
      ['blockchain', 'optimization', 'optimisation', 'nlp', 'computer_vision', 'vision par ordinateur'].some((k) =>
        c.toLowerCase().includes(k)
      )
    ) ||
    integrations.length >= 4 ||
    budget_tier === '10K+';

  if (advanced) return 'advanced';

  const beginner =
    capabilities.length <= 1 &&
    integrations.length <= 2 &&
    (budget_tier === '<1K' || budget_tier === '1K-5K');

  if (beginner) return 'beginner';

  return 'intermediate';
}


