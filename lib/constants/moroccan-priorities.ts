export const MOROCCAN_PRIORITIES = [
  {
    code: 'green_morocco',
    name: 'Green Morocco Plan',
    description: 'Climate action, renewable energy, sustainable agriculture',
    color: 'bg-green-100 text-green-800',
    icon: '🌱',
  },
  {
    code: 'digital_morocco',
    name: 'Digital Morocco 2030',
    description: 'Digital transformation, e-government, tech innovation',
    color: 'bg-blue-100 text-blue-800',
    icon: '💻',
  },
  {
    code: 'vision_2030',
    name: 'Vision 2030',
    description: 'Economic development, competitiveness, human capital',
    color: 'bg-purple-100 text-purple-800',
    icon: '🎯',
  },
  {
    code: 'youth_employment',
    name: 'Youth Employment Priority',
    description: 'Job creation for young people, entrepreneurship',
    color: 'bg-orange-100 text-orange-800',
    icon: '👥',
  },
  {
    code: 'women_entrepreneurship',
    name: 'Women Entrepreneurship',
    description: 'Economic empowerment of women, gender equality',
    color: 'bg-pink-100 text-pink-800',
    icon: '♀️',
  },
  {
    code: 'rural_development',
    name: 'Rural Development',
    description: 'Infrastructure and services for rural areas',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🏘️',
  },
  {
    code: 'healthcare_improvement',
    name: 'Healthcare Improvement',
    description: 'Better healthcare access and quality',
    color: 'bg-red-100 text-red-800',
    icon: '🏥',
  },
] as const;

export type MoroccanPriorityCode = typeof MOROCCAN_PRIORITIES[number]['code'];


