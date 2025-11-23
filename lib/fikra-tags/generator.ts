/**
 * FikraTag Generator
 * 
 * Memorable codes: FKR-[CATEGORY]-[WORD]-[NUMBER]
 * Local-first generation (works offline)
 */

export interface FikraTag {
  code: string;
  category: string;
  word: string;
  number: number;
  generatedAt: Date;
  synced: boolean;
}

const WORD_BANK = {
  darija: ['SMIT', 'KHBZ', 'MA', 'BIN', 'DDAR'], // Name, bread, water, between, home
  french: ['CLE', 'PAIN', 'IDEA', 'STEP', 'GOAL']
};

const CATEGORY_MAP: Record<string, string> = {
  'education': 'EDU',
  'food': 'FOOD',
  'finance': 'FIN',
  'health': 'HLT',
  'tech': 'TEC',
  'agriculture': 'AGR',
  'tourism': 'TRS',
  'other': 'OTH'
};

/**
 * Generate FikraTag locally (offline-capable)
 */
export function generateFikraTag(category: string, prefersDarija: boolean = true): FikraTag {
  // Map category to 3-letter code
  const categoryCode = CATEGORY_MAP[category.toLowerCase()] || 'OTH';
  
  // Random word based on user's language preference
  const wordBank = prefersDarija ? WORD_BANK.darija : WORD_BANK.french;
  const word = wordBank[Math.floor(Math.random() * wordBank.length)];
  
  // Sequential number from local storage (syncs later)
  const lastNumber = parseInt(localStorage.getItem('lastFikraNumber') || '0', 10);
  const nextNumber = lastNumber + 1;
  localStorage.setItem('lastFikraNumber', nextNumber.toString());
  
  const code = `FKR-${categoryCode}-${word}-${nextNumber}`;
  
  return {
    code,
    category: categoryCode,
    word,
    number: nextNumber,
    generatedAt: new Date(),
    synced: false
  };
}

/**
 * Parse FikraTag from code string
 */
export function parseFikraTag(code: string): FikraTag | null {
  const match = code.match(/^FKR-([A-Z]{3})-([A-Z]+)-(\d+)$/);
  if (!match) return null;
  
  return {
    code,
    category: match[1],
    word: match[2],
    number: parseInt(match[3], 10),
    generatedAt: new Date(),
    synced: true
  };
}

/**
 * Validate FikraTag format
 */
export function isValidFikraTag(code: string): boolean {
  return /^FKR-[A-Z]{3}-[A-Z]+-\d+$/.test(code);
}

