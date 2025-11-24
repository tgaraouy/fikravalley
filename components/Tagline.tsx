/**
 * Tagline Component
 * 
 * Reusable tagline display component
 */

import { APP_TAGLINE, type Language } from '@/lib/constants/tagline';

interface TaglineProps {
  variant?: 'full' | 'short' | 'darija' | 'value';
  language?: Language;
  className?: string;
  showIcon?: boolean;
}

export default function Tagline({ 
  variant = 'full', 
  language = 'fr',
  className = '', 
  showIcon = false 
}: TaglineProps) {
  const getText = () => {
    switch (variant) {
      case 'short':
        return APP_TAGLINE.short[language] || APP_TAGLINE.short.fr;
      case 'darija':
        return APP_TAGLINE.main.darija.headline;
      case 'value':
        return APP_TAGLINE.valueProposition[language] || APP_TAGLINE.valueProposition.fr;
      default:
        return APP_TAGLINE.main[language]?.headline || APP_TAGLINE.main.fr.headline;
    }
  };

  return (
    <p className={`text-slate-700 ${className}`}>
      {showIcon && <span className="mr-2">🎯</span>}
      {getText()}
    </p>
  );
}

