/**
 * Categories and Locations Data
 * 
 * Comprehensive lists of categories and Moroccan cities
 * with support for custom values
 */

export interface CategoryOption {
  value: string;
  label: string;
  labelAr?: string;
  labelDarija?: string;
}

export interface LocationOption {
  value: string;
  label: string;
  region?: string;
}

// Comprehensive list of categories for digitization ideas
export const CATEGORIES: CategoryOption[] = [
  { value: 'health', label: 'Santé', labelAr: 'الصحة', labelDarija: 'S7a' },
  { value: 'education', label: 'Éducation', labelAr: 'التعليم', labelDarija: 'T3lim' },
  { value: 'agriculture', label: 'Agriculture', labelAr: 'الزراعة', labelDarija: 'Zra3a' },
  { value: 'tech', label: 'Technologie', labelAr: 'التكنولوجيا', labelDarija: 'Teknoloji' },
  { value: 'infrastructure', label: 'Infrastructure', labelAr: 'البنية التحتية', labelDarija: 'Bniya' },
  { value: 'administration', label: 'Administration', labelAr: 'الإدارة', labelDarija: 'Idara' },
  { value: 'logistics', label: 'Logistique', labelAr: 'اللوجستيات', labelDarija: 'Logistik' },
  { value: 'finance', label: 'Finance', labelAr: 'المالية', labelDarija: 'Maliya' },
  { value: 'customer_service', label: 'Service Client', labelAr: 'خدمة العملاء', labelDarija: 'Khedma' },
  { value: 'inclusion', label: 'Inclusion Sociale', labelAr: 'الإدماج الاجتماعي', labelDarija: 'Idmaj' },
  { value: 'transport', label: 'Transport', labelAr: 'النقل', labelDarija: 'N9l' },
  { value: 'energy', label: 'Énergie', labelAr: 'الطاقة', labelDarija: 'T9a' },
  { value: 'water', label: 'Eau & Assainissement', labelAr: 'الماء والصرف الصحي', labelDarija: 'Ma w Sraf' },
  { value: 'waste', label: 'Gestion des Déchets', labelAr: 'إدارة النفايات', labelDarija: 'Idarat Nfayat' },
  { value: 'tourism', label: 'Tourisme', labelAr: 'السياحة', labelDarija: 'Siyaha' },
  { value: 'culture', label: 'Culture & Patrimoine', labelAr: 'الثقافة والتراث', labelDarija: 'T9afa' },
  { value: 'sports', label: 'Sports & Loisirs', labelAr: 'الرياضة والترفيه', labelDarija: 'Ryada' },
  { value: 'security', label: 'Sécurité', labelAr: 'الأمن', labelDarija: 'Amn' },
  { value: 'justice', label: 'Justice', labelAr: 'العدالة', labelDarija: '3dala' },
  { value: 'environment', label: 'Environnement', labelAr: 'البيئة', labelDarija: 'Bi2a' },
  { value: 'housing', label: 'Logement', labelAr: 'السكن', labelDarija: 'Skn' },
  { value: 'employment', label: 'Emploi', labelAr: 'العمل', labelDarija: 'Khdma' },
  { value: 'social_services', label: 'Services Sociaux', labelAr: 'الخدمات الاجتماعية', labelDarija: 'Khedmat' },
  { value: 'other', label: 'Autre', labelAr: 'أخرى', labelDarija: 'Okhra' },
];

// Comprehensive list of Moroccan cities
export const MOROCCAN_CITIES: LocationOption[] = [
  // Major cities
  { value: 'casablanca', label: 'Casablanca', region: 'Casablanca-Settat' },
  { value: 'rabat', label: 'Rabat', region: 'Rabat-Salé-Kénitra' },
  { value: 'fes', label: 'Fès', region: 'Fès-Meknès' },
  { value: 'marrakech', label: 'Marrakech', region: 'Marrakech-Safi' },
  { value: 'tangier', label: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma' },
  { value: 'agadir', label: 'Agadir', region: 'Souss-Massa' },
  { value: 'meknes', label: 'Meknès', region: 'Fès-Meknès' },
  { value: 'oujda', label: 'Oujda', region: 'Oriental' },
  { value: 'kenitra', label: 'Kénitra', region: 'Rabat-Salé-Kénitra' },
  
  // Other important cities
  { value: 'tetouan', label: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma' },
  { value: 'safi', label: 'Safi', region: 'Marrakech-Safi' },
  { value: 'mohammedia', label: 'Mohammedia', region: 'Casablanca-Settat' },
  { value: 'el_jadida', label: 'El Jadida', region: 'Casablanca-Settat' },
  { value: 'nador', label: 'Nador', region: 'Oriental' },
  { value: 'beni_mellal', label: 'Beni Mellal', region: 'Béni Mellal-Khénifra' },
  { value: 'taza', label: 'Taza', region: 'Fès-Meknès' },
  { value: 'khouribga', label: 'Khouribga', region: 'Béni Mellal-Khénifra' },
  { value: 'settat', label: 'Settat', region: 'Casablanca-Settat' },
  { value: 'larache', label: 'Larache', region: 'Tanger-Tétouan-Al Hoceïma' },
  { value: 'khemisset', label: 'Khemisset', region: 'Rabat-Salé-Kénitra' },
  { value: 'berrechid', label: 'Berrechid', region: 'Casablanca-Settat' },
  { value: 'taourirt', label: 'Taourirt', region: 'Oriental' },
  { value: 'errachidia', label: 'Errachidia', region: 'Drâa-Tafilalet' },
  { value: 'ouarzazate', label: 'Ouarzazate', region: 'Drâa-Tafilalet' },
  { value: 'tarfaya', label: 'Tarfaya', region: 'Laâyoune-Sakia El Hamra' },
  { value: 'laayoune', label: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra' },
  { value: 'dakhla', label: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab' },
  { value: 'guelmim', label: 'Guelmim', region: 'Guelmim-Oued Noun' },
  { value: 'tiznit', label: 'Tiznit', region: 'Souss-Massa' },
  { value: 'taroudant', label: 'Taroudant', region: 'Souss-Massa' },
  { value: 'essaouira', label: 'Essaouira', region: 'Marrakech-Safi' },
  { value: 'azilal', label: 'Azilal', region: 'Béni Mellal-Khénifra' },
  { value: 'khouribga', label: 'Khouribga', region: 'Béni Mellal-Khénifra' },
  { value: 'ifrane', label: 'Ifrane', region: 'Fès-Meknès' },
  { value: 'chefchaouen', label: 'Chefchaouen', region: 'Tanger-Tétouan-Al Hoceïma' },
  { value: 'asilah', label: 'Asilah', region: 'Tanger-Tétouan-Al Hoceïma' },
  { value: 'ouazzane', label: 'Ouazzane', region: 'Tanger-Tétouan-Al Hoceïma' },
  { value: 'sidi_kacem', label: 'Sidi Kacem', region: 'Rabat-Salé-Kénitra' },
  { value: 'sidi_slimane', label: 'Sidi Slimane', region: 'Rabat-Salé-Kénitra' },
  { value: 'sale', label: 'Salé', region: 'Rabat-Salé-Kénitra' },
  { value: 'temara', label: 'Témara', region: 'Rabat-Salé-Kénitra' },
  { value: 'skhirat', label: 'Skhirat', region: 'Rabat-Salé-Kénitra' },
  { value: 'benslimane', label: 'Benslimane', region: 'Casablanca-Settat' },
  { value: 'berkane', label: 'Berkane', region: 'Oriental' },
  { value: 'jerada', label: 'Jerada', region: 'Oriental' },
  { value: 'figuig', label: 'Figuig', region: 'Oriental' },
  { value: 'bouarfa', label: 'Bouarfa', region: 'Oriental' },
  { value: 'midelt', label: 'Midelt', region: 'Drâa-Tafilalet' },
  { value: 'zagora', label: 'Zagora', region: 'Drâa-Tafilalet' },
  { value: 'tinghir', label: 'Tinghir', region: 'Drâa-Tafilalet' },
  { value: 'kalaat_mgouna', label: 'Kalaat M\'Gouna', region: 'Drâa-Tafilalet' },
  { value: 'youssoufia', label: 'Youssoufia', region: 'Marrakech-Safi' },
  { value: 'chichaoua', label: 'Chichaoua', region: 'Marrakech-Safi' },
  { value: 'el_kelaa', label: 'El Kelâa des Sraghna', region: 'Marrakech-Safi' },
  { value: 'demnate', label: 'Demnate', region: 'Béni Mellal-Khénifra' },
  { value: 'kasba_tadla', label: 'Kasba Tadla', region: 'Béni Mellal-Khénifra' },
  { value: 'khenifra', label: 'Khénifra', region: 'Béni Mellal-Khénifra' },
  { value: 'khouribga', label: 'Khouribga', region: 'Béni Mellal-Khénifra' },
  { value: 'fquih_ben_salah', label: 'Fquih Ben Salah', region: 'Béni Mellal-Khénifra' },
  { value: 'other', label: 'Autre', region: 'Autre' },
];

/**
 * Get category label based on language
 */
export function getCategoryLabel(category: string, language: 'fr' | 'ar' | 'darija' = 'fr'): string {
  const cat = CATEGORIES.find(c => c.value === category);
  if (!cat) return category;
  
  if (language === 'ar' && cat.labelAr) return cat.labelAr;
  if (language === 'darija' && cat.labelDarija) return cat.labelDarija;
  return cat.label;
}

/**
 * Get location label
 */
export function getLocationLabel(location: string): string {
  const loc = MOROCCAN_CITIES.find(l => l.value === location);
  return loc ? loc.label : location;
}

/**
 * Check if a category is custom (not in predefined list)
 */
export function isCustomCategory(category: string): boolean {
  return !CATEGORIES.find(c => c.value === category);
}

/**
 * Check if a location is custom (not in predefined list)
 */
export function isCustomLocation(location: string): boolean {
  return !MOROCCAN_CITIES.find(l => l.value === location);
}

