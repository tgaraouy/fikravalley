/**
 * Immediate Reward Screen
 * 
 * Shows after voice recording to give instant gratification
 * 4 dopamine hits: ✅ Success, 🎯 Idea Number, 📊 Progress, 🚀 Next Action
 */

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Language } from '@/lib/constants/tagline';

interface IdeaRewardScreenProps {
  ideaNumber: number;
  language: Language;
  onNext: () => void;
  onSkip?: () => void;
}

const REWARD_MESSAGES = {
  darija: {
    success: "✅ فكرتك تسجّلت!",
    ideaNumber: "فكرة",
    step: "الخطوة",
    stepLabel: "فكرة ممسوكة",
    nextButton: "واش نوليها شركة؟"
  },
  tamazight: {
    success: "✅ ⴰⴷⴳⴳⴰⵔ-ⴽ ⵉⵙⵙⵏⵙⵏ!",
    successLatin: "Adggar-ik issnsn!",
    ideaNumber: "ⴰⴷⴳⴳⴰⵔ",
    ideaNumberLatin: "Adggar",
    step: "ⵉⵙⴼⴰⵡ",
    stepLatin: "Isfaw",
    stepLabel: "ⴰⴷⴳⴳⴰⵔ ⴷⴰⵎⵙⵓⵏ",
    stepLabelLatin: "Adggar dameshun",
    nextButton: "ⵉⵙⵎ ⴰⴷ ⵜⴱⴷⴷ ⴰⴼⴰⵔⵉⵖ?",
    nextButtonLatin: "Ism ad tebddd aferyigh?"
  },
  fr: {
    success: "✅ Ton idée est enregistrée !",
    ideaNumber: "Idée",
    step: "Étape",
    stepLabel: "Idée capturée",
    nextButton: "En faire une startup ?"
  },
  en: {
    success: "✅ Your idea is recorded!",
    ideaNumber: "Idea",
    step: "Step",
    stepLabel: "Idea captured",
    nextButton: "Turn it into a startup?"
  }
};

export default function IdeaRewardScreen({ 
  ideaNumber, 
  language, 
  onNext,
  onSkip 
}: IdeaRewardScreenProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const messages = REWARD_MESSAGES[language];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`
      fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4
      ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300
    `}>
      <div className={`
        bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center
        ${isAnimating ? 'scale-95' : 'scale-100'} transition-transform duration-300
      `}>
        {/* Dopamine Hit 1: Success Checkmark */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <p className="text-green-600 font-bold text-lg">
            {messages.success}
            {language === 'tamazight' && messages.successLatin && (
              <span className="block text-xs text-gray-500 mt-1">
                {messages.successLatin}
              </span>
            )}
          </p>
        </div>

        {/* Dopamine Hit 2: Idea Number */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-slate-900">
            {messages.ideaNumber} #{ideaNumber}
            {language === 'tamazight' && messages.ideaNumberLatin && (
              <span className="block text-sm text-gray-500 mt-1">
                {messages.ideaNumberLatin} #{ideaNumber}
              </span>
            )}
          </p>
        </div>

        {/* Dopamine Hit 3: Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: '33%' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {messages.step} 1/3: {messages.stepLabel}
            {language === 'tamazight' && messages.stepLatin && (
              <span className="block text-xs text-gray-400 mt-1">
                {messages.stepLatin} 1/3: {messages.stepLabelLatin}
              </span>
            )}
          </p>
        </div>

        {/* Dopamine Hit 4: Next Action Button */}
        <div className="space-y-3">
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {messages.nextButton}
            {language === 'tamazight' && messages.nextButtonLatin && (
              <span className="block text-xs opacity-75 mt-1">
                {messages.nextButtonLatin}
              </span>
            )}
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Plus tard
            </button>
          )}
        </div>

        {/* Tamazight Latin transliteration helper */}
        {language === 'tamazight' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              {messages.successLatin} • {messages.ideaNumberLatin} #{ideaNumber} • {messages.stepLatin} 1/3: {messages.stepLabelLatin}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

