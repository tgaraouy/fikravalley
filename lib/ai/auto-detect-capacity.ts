/**
 * Auto-Detect User Capacity
 * 
 * Assembly over Addition: Infer user's budget, complexity, and availability
 * from their profile and activity - NO FORMS TO FILL
 */

export interface UserCapacity {
  budget_tier: '<1K' | '1K-5K' | '5K-10K' | '10K+';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  available_hours_per_week: number;
  preferred_contact: 'whatsapp' | 'email' | 'phone';
  location_type: 'urban' | 'rural' | 'both';
}

export interface UserProfile {
  // From existing data
  submitter_type?: 'student' | 'professional' | 'entrepreneur' | 'unemployed';
  location?: string;
  previous_ideas_count?: number;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  last_active?: string;
  submitted_via?: 'web' | 'whatsapp' | 'voice';
  submitter_skills?: string[];
}

/**
 * Auto-detect user capacity from profile
 * No forms - infer from existing data
 */
export function detectUserCapacity(profile: UserProfile): UserCapacity {
  const {
    submitter_type,
    location,
    previous_ideas_count = 0,
    device_type,
    submitted_via,
    submitter_skills = [],
  } = profile;

  // Budget tier inference
  const budget_tier = inferBudgetTier(submitter_type, location, previous_ideas_count);

  // Complexity inference
  const complexity = inferComplexity(
    submitter_type,
    previous_ideas_count,
    submitter_skills.length
  );

  // Available hours inference
  const available_hours_per_week = inferAvailableHours(submitter_type, previous_ideas_count);

  // Preferred contact
  const preferred_contact = inferPreferredContact(submitted_via, device_type);

  // Location type
  const location_type = inferLocationType(location);

  return {
    budget_tier,
    complexity,
    available_hours_per_week,
    preferred_contact,
    location_type,
  };
}

function inferBudgetTier(
  submitter_type?: string,
  location?: string,
  previous_ideas_count: number = 0
): '<1K' | '1K-5K' | '5K-10K' | '10K+' {
  // Students and unemployed: lower budget
  if (submitter_type === 'student' || submitter_type === 'unemployed') {
    return '<1K';
  }

  // First-time entrepreneurs: start small
  if (previous_ideas_count === 0) {
    return '1K-5K';
  }

  // Casablanca/Rabat: higher costs
  const majorCities = ['casablanca', 'rabat', 'marrakech'];
  if (location && majorCities.some((city) => location.toLowerCase().includes(city))) {
    if (previous_ideas_count >= 2) {
      return '5K-10K';
    }
    return '1K-5K';
  }

  // Professionals with experience: medium budget
  if (submitter_type === 'professional' && previous_ideas_count >= 1) {
    return '5K-10K';
  }

  // Default: start small
  return '1K-5K';
}

function inferComplexity(
  submitter_type?: string,
  previous_ideas_count: number = 0,
  skills_count: number = 0
): 'beginner' | 'intermediate' | 'advanced' {
  // Advanced: professionals with multiple ideas and skills
  if (
    submitter_type === 'professional' &&
    previous_ideas_count >= 2 &&
    skills_count >= 3
  ) {
    return 'advanced';
  }

  // Intermediate: some experience
  if (previous_ideas_count >= 1 || skills_count >= 2) {
    return 'intermediate';
  }

  // Beginner: everyone else
  return 'beginner';
}

function inferAvailableHours(
  submitter_type?: string,
  previous_ideas_count: number = 0
): number {
  // Students: limited time
  if (submitter_type === 'student') {
    return 5; // 5 hours/week
  }

  // Unemployed: more time available
  if (submitter_type === 'unemployed') {
    return 20; // 20 hours/week
  }

  // Professionals: limited time
  if (submitter_type === 'professional') {
    return 10; // 10 hours/week
  }

  // Entrepreneurs: more time if they've done this before
  if (submitter_type === 'entrepreneur') {
    return previous_ideas_count >= 1 ? 15 : 10;
  }

  // Default
  return 10;
}

function inferPreferredContact(
  submitted_via?: string,
  device_type?: string
): 'whatsapp' | 'email' | 'phone' {
  // If they submitted via WhatsApp, prefer WhatsApp
  if (submitted_via === 'whatsapp') {
    return 'whatsapp';
  }

  // Mobile-only users: WhatsApp
  if (device_type === 'mobile') {
    return 'whatsapp';
  }

  // Desktop users: email
  if (device_type === 'desktop') {
    return 'email';
  }

  // Default: WhatsApp (most common in Morocco)
  return 'whatsapp';
}

function inferLocationType(location?: string): 'urban' | 'rural' | 'both' {
  if (!location) return 'both';

  const locationLower = location.toLowerCase();

  // Major cities
  const majorCities = [
    'casablanca',
    'rabat',
    'marrakech',
    'fes',
    'tanger',
    'agadir',
    'meknes',
    'oujda',
  ];

  if (majorCities.some((city) => locationLower.includes(city))) {
    return 'urban';
  }

  // Rural indicators
  const ruralKeywords = ['rural', 'village', 'campagne', 'montagne', 'atlas'];
  if (ruralKeywords.some((keyword) => locationLower.includes(keyword))) {
    return 'rural';
  }

  // Generic "Morocco" or "other": both
  return 'both';
}

