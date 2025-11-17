import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
}

const colorStyles: Record<NonNullable<StatCardProps['color']>, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  red: 'bg-red-50 border-red-200 text-red-900',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
};

const trendColorStyles: Record<NonNullable<StatCardProps['color']>, { positive: string; negative: string }> = {
  blue: { positive: 'text-blue-700', negative: 'text-blue-500' },
  green: { positive: 'text-green-700', negative: 'text-green-500' },
  yellow: { positive: 'text-yellow-700', negative: 'text-yellow-500' },
  red: { positive: 'text-red-700', negative: 'text-red-500' },
  indigo: { positive: 'text-indigo-700', negative: 'text-indigo-500' },
};

export default function StatCard({ icon, label, value, trend, color = 'indigo' }: StatCardProps) {
  const colorClass = colorStyles[color];
  const trendColors = trendColorStyles[color];

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('fr-FR');
    }
    return val;
  };

  return (
    <Card className={`${colorClass} border-2 transition-shadow hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl" role="img" aria-label={`${label} icon`}>
            {icon}
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trend.isPositive ? trendColors.positive : trendColors.negative
              }`}
              aria-label={`Trend: ${trend.isPositive ? 'up' : 'down'} ${Math.abs(trend.value)}%`}
            >
              <span aria-hidden="true">{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm opacity-75 mb-2" aria-label={`${label} label`}>
            {label}
          </p>
          <p className="text-3xl font-bold" aria-label={`${label} value: ${formatValue(value)}`}>
            {formatValue(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

