import { Badge } from '@/components/ui/badge';

type Category = 'health' | 'education' | 'agriculture' | 'tech' | 'administration' | 'logistics' | 'finance' | 'customer_service' | 'inclusion' | 'other';

interface CategoryBadgeProps {
  category: Category;
}

const CATEGORY_LABELS: Record<Category, string> = {
  health: 'Santé',
  education: 'Éducation',
  agriculture: 'Agriculture',
  tech: 'Technologie',
  administration: 'Administration',
  logistics: 'Logistique',
  finance: 'Finance',
  customer_service: 'Service client',
  inclusion: 'Inclusion',
  other: 'Autre',
};

const CATEGORY_COLORS: Record<Category, string> = {
  health: 'bg-red-100 text-red-700 border-red-200',
  education: 'bg-blue-100 text-blue-700 border-blue-200',
  agriculture: 'bg-green-100 text-green-700 border-green-200',
  tech: 'bg-purple-100 text-purple-700 border-purple-200',
  administration: 'bg-gray-100 text-gray-700 border-gray-200',
  logistics: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  finance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  customer_service: 'bg-pink-100 text-pink-700 border-pink-200',
  inclusion: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const label = CATEGORY_LABELS[category] || category;
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  return (
    <Badge variant="outline" className={colorClass}>
      {label}
    </Badge>
  );
}

