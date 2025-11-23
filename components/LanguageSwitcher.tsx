/**
 * Language Switcher Component
 * 
 * Allows users to switch between 4 languages:
 * - Darija (Moroccan Arabic)
 * - Tamazight (Berber)
 * - French
 * - English
 */

'use client';

import { useState, useEffect } from 'react';
import { Language, detectLanguage } from '@/lib/constants/tagline';

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: Language) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LANGUAGE_LABELS: Record<Language, { native: string; code: string; flag: string }> = {
  darija: { native: 'عربية', code: 'AR', flag: '🇲🇦' },
  tamazight: { native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', code: 'TZM', flag: 'ⵣ' },
  fr: { native: 'FR', code: 'FR', flag: '🇫🇷' },
  en: { native: 'EN', code: 'EN', flag: '🇬🇧' }
};

export default function LanguageSwitcher({ 
  onLanguageChange, 
  className = '',
  size = 'sm'
}: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState<Language>('fr');

  useEffect(() => {
    const detected = detectLanguage();
    setCurrentLang(detected);
    if (onLanguageChange) {
      onLanguageChange(detected);
    }
  }, [onLanguageChange]);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
    // Store preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Object.entries(LANGUAGE_LABELS).map(([lang, label]) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang as Language)}
          className={`
            ${sizeClasses[size]}
            rounded-lg font-medium transition-all
            ${currentLang === lang
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white/10 text-slate-600 hover:bg-white/20'
            }
          `}
          title={label.native}
        >
          <span className="mr-1">{label.flag}</span>
          <span>{label.code}</span>
        </button>
      ))}
    </div>
  );
}

