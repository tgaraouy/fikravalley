/**
 * Logo with Transformation Tagline
 * 
 * Displays logo with "Idea → Reality" tagline underneath
 * Supports 4 languages with proper RTL/LTR handling
 */

'use client';

import { Language, APP_TAGLINE } from '@/lib/constants/tagline';
import Logo from './Logo';

interface LogoWithTaglineProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  language?: Language;
  className?: string;
  href?: string;
}

export default function LogoWithTagline({
  size = 'md',
  showText = true,
  language = 'fr',
  className = '',
  href = '/',
}: LogoWithTaglineProps) {
  const getTransformationTagline = () => {
    if (language === 'tamazight') {
      // Use Tifinagh if available, fallback to Latin
      return APP_TAGLINE.transformation.tamazightTifinagh || APP_TAGLINE.transformation.tamazight;
    }
    return APP_TAGLINE.transformation[language] || APP_TAGLINE.transformation.fr;
  };

  const isRTL = language === 'darija' || language === 'tamazight';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Logo 
        href={href}
        size={size} 
        showText={showText} 
      />
      <p 
        className="text-sm text-gray-600 mt-2 tracking-wide text-center"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {getTransformationTagline()}
      </p>
    </div>
  );
}

