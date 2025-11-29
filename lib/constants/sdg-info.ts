/**
 * SDG (Sustainable Development Goals) metadata
 * UN Sustainable Development Goals 1-17
 */

export interface SDGInfo {
  number: number;
  name: string;
  nameFr: string;
  nameAr: string;
  color: string;
  icon: string;
  description: string;
}

export const SDG_INFO: Record<number, SDGInfo> = {
  1: {
    number: 1,
    name: 'No Poverty',
    nameFr: 'Pas de pauvreté',
    nameAr: 'القضاء على الفقر',
    color: '#E5243B',
    icon: '🏠',
    description: 'End poverty in all its forms everywhere',
  },
  2: {
    number: 2,
    name: 'Zero Hunger',
    nameFr: 'Faim zéro',
    nameAr: 'القضاء على الجوع',
    color: '#DDA63A',
    icon: '🌾',
    description: 'End hunger, achieve food security and improved nutrition',
  },
  3: {
    number: 3,
    name: 'Good Health and Well-being',
    nameFr: 'Bonne santé et bien-être',
    nameAr: 'الصحة الجيدة والرفاه',
    color: '#4C9F38',
    icon: '🏥',
    description: 'Ensure healthy lives and promote well-being for all',
  },
  4: {
    number: 4,
    name: 'Quality Education',
    nameFr: 'Éducation de qualité',
    nameAr: 'التعليم الجيد',
    color: '#C5192D',
    icon: '🎓',
    description: 'Ensure inclusive and equitable quality education',
  },
  5: {
    number: 5,
    name: 'Gender Equality',
    nameFr: 'Égalité entre les sexes',
    nameAr: 'المساواة بين الجنسين',
    color: '#FF3A21',
    icon: '♀️',
    description: 'Achieve gender equality and empower all women and girls',
  },
  6: {
    number: 6,
    name: 'Clean Water and Sanitation',
    nameFr: 'Eau propre et assainissement',
    nameAr: 'المياه النظيفة والصرف الصحي',
    color: '#26BDE2',
    icon: '💧',
    description: 'Ensure availability and sustainable management of water',
  },
  7: {
    number: 7,
    name: 'Affordable and Clean Energy',
    nameFr: 'Énergie propre et d\'un coût abordable',
    nameAr: 'طاقة نظيفة وبأسعار معقولة',
    color: '#FCC30B',
    icon: '⚡',
    description: 'Ensure access to affordable, reliable, sustainable energy',
  },
  8: {
    number: 8,
    name: 'Decent Work and Economic Growth',
    nameFr: 'Travail décent et croissance économique',
    nameAr: 'العمل اللائق ونمو الاقتصاد',
    color: '#A21942',
    icon: '💼',
    description: 'Promote sustained, inclusive economic growth and employment',
  },
  9: {
    number: 9,
    name: 'Industry, Innovation and Infrastructure',
    nameFr: 'Industrie, innovation et infrastructure',
    nameAr: 'الصناعة والابتكار والهياكل الأساسية',
    color: '#FD6925',
    icon: '🏭',
    description: 'Build resilient infrastructure, promote innovation',
  },
  10: {
    number: 10,
    name: 'Reduced Inequality',
    nameFr: 'Inégalités réduites',
    nameAr: 'الحد من أوجه عدم المساواة',
    color: '#DD1367',
    icon: '⚖️',
    description: 'Reduce inequality within and among countries',
  },
  11: {
    number: 11,
    name: 'Sustainable Cities and Communities',
    nameFr: 'Villes et communautés durables',
    nameAr: 'مدن ومجتمعات محلية مستدامة',
    color: '#FD9D24',
    icon: '🏙️',
    description: 'Make cities and human settlements inclusive and sustainable',
  },
  12: {
    number: 12,
    name: 'Responsible Consumption and Production',
    nameFr: 'Consommation et production responsables',
    nameAr: 'الاستهلاك والإنتاج المسؤولان',
    color: '#BF8B2E',
    icon: '♻️',
    description: 'Ensure sustainable consumption and production patterns',
  },
  13: {
    number: 13,
    name: 'Climate Action',
    nameFr: 'Mesures relatives à la lutte contre les changements climatiques',
    nameAr: 'العمل المناخي',
    color: '#3F7E44',
    icon: '🌍',
    description: 'Take urgent action to combat climate change',
  },
  14: {
    number: 14,
    name: 'Life Below Water',
    nameFr: 'Vie aquatique',
    nameAr: 'الحياة تحت الماء',
    color: '#0A97D9',
    icon: '🌊',
    description: 'Conserve and sustainably use oceans and marine resources',
  },
  15: {
    number: 15,
    name: 'Life on Land',
    nameFr: 'Vie terrestre',
    nameAr: 'الحياة في البر',
    color: '#56C02B',
    icon: '🌳',
    description: 'Protect, restore and promote sustainable use of terrestrial ecosystems',
  },
  16: {
    number: 16,
    name: 'Peace, Justice and Strong Institutions',
    nameFr: 'Paix, justice et institutions efficaces',
    nameAr: 'السلام والعدل والمؤسسات القوية',
    color: '#00689D',
    icon: '⚖️',
    description: 'Promote peaceful and inclusive societies',
  },
  17: {
    number: 17,
    name: 'Partnerships for the Goals',
    nameFr: 'Partenariats pour la réalisation des objectifs',
    nameAr: 'عقد الشراكات لتحقيق الأهداف',
    color: '#19486A',
    icon: '🤝',
    description: 'Strengthen the means of implementation',
  },
};

/**
 * Get SDG info by number
 */
export function getSDGInfo(sdgNumber: number): SDGInfo | null {
  return SDG_INFO[sdgNumber] || null;
}

/**
 * Get all SDG numbers
 */
export function getAllSDGNumbers(): number[] {
  return Array.from({ length: 17 }, (_, i) => i + 1);
}

