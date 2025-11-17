import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-300 bg-white/70">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="text-6xl mb-4" role="img" aria-label="Empty state icon">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-base text-slate-600 mb-6 max-w-md">{description}</p>
        {action && (
          action.onClick ? (
            <Button onClick={action.onClick} variant="primary" size="lg">
              {action.label}
            </Button>
          ) : (
            <Button asChild variant="primary" size="lg">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

