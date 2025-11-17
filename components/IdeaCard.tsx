import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryBadge from '@/components/CategoryBadge';
import type { Database } from '@/lib/supabase';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];

interface IdeaCardProps {
  idea: IdeaRow;
  onClick?: () => void;
  showFullDescription?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Soumis',
  analyzing: 'Analyse en cours',
  analyzed: 'Analysé',
  matched: 'Apparié',
  funded: 'Financé',
  in_progress: 'En cours',
  completed: 'Terminé',
  rejected: 'Rejeté',
};

const STATUS_COLORS: Record<string, 'default' | 'success' | 'outline'> = {
  submitted: 'outline',
  analyzing: 'outline',
  analyzed: 'default',
  matched: 'success',
  funded: 'success',
  in_progress: 'success',
  completed: 'success',
  rejected: 'outline',
};

type CategoryBadgeCategory = 'health' | 'education' | 'agriculture' | 'tech' | 'administration' | 'logistics' | 'finance' | 'customer_service' | 'inclusion' | 'other';

export default function IdeaCard({ idea, onClick, showFullDescription = false }: IdeaCardProps) {
  const statusLabel = idea.status ? STATUS_LABELS[idea.status] || idea.status : 'Inconnu';
  const statusColor = idea.status ? STATUS_COLORS[idea.status] || 'outline' : 'outline';
  
  // Ensure category is a valid CategoryBadge category, default to 'other' if not
  const validCategories: CategoryBadgeCategory[] = ['health', 'education', 'agriculture', 'tech', 'administration', 'logistics', 'finance', 'customer_service', 'inclusion', 'other'];
  const category: CategoryBadgeCategory = (idea.category && validCategories.includes(idea.category as CategoryBadgeCategory))
    ? (idea.category as CategoryBadgeCategory)
    : 'other';

  const problemStatement = idea.problem_statement || 'Aucune description disponible';

  const isAnalyzed = idea.status && ['analyzed', 'matched', 'funded', 'in_progress'].includes(idea.status);

  return (
    <Card
      className={`border-white/80 bg-white/95 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {idea.category && <CategoryBadge category={category} />}
          {isAnalyzed && idea.ai_feasibility_score !== null && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-indigo-600">
                {idea.ai_feasibility_score.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">/10</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-bold text-slate-900">{idea.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription
          className={`text-sm text-slate-600 ${showFullDescription ? '' : 'line-clamp-3'}`}
        >
          {problemStatement}
        </CardDescription>
        {isAnalyzed && (
          <div className="mt-4 flex items-center justify-between">
            <Badge variant={statusColor} className="text-xs">
              {statusLabel}
            </Badge>
            {idea.location && (
              <span className="text-xs text-slate-500">
                {idea.location.charAt(0).toUpperCase() + idea.location.slice(1)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

