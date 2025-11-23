/**
 * Tagline Component
 * 
 * Reusable tagline display component
 */

import { APP_TAGLINE } from '@/lib/constants/tagline';

interface TaglineProps {
  variant?: 'full' | 'short' | 'darija' | 'value';
  className?: string;
  showIcon?: boolean;
}

export default function Tagline({ variant = 'full', className = '', showIcon = false }: TaglineProps) {
  const getText = () => {
    switch (variant) {
      case 'short':
        return APP_TAGLINE.short;
      case 'darija':
        return APP_TAGLINE.darija;
      case 'value':
        return APP_TAGLINE.valueProposition;
      default:
        return APP_TAGLINE.main;
    }
  };

  return (
    <p className={`text-slate-700 ${className}`}>
      {showIcon && <span className="mr-2">🎯</span>}
      {getText()}
    </p>
  );
}

