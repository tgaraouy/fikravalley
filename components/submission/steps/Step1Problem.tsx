'use client';

/**
 * Step 1: Problem Statement
 * 
 * Helps users clearly articulate their problem with Darija support
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VoiceRecorder from '@/components/VoiceRecorder';

interface Step1ProblemProps {
  value: string;
  onChange: (value: string) => void;
  language: 'fr' | 'ar' | 'darija';
  onLanguageChange: (lang: 'fr' | 'ar' | 'darija') => void;
  clarityScore?: number;
}

const translations = {
  fr: {
    title: '1. Quel est le problème ?',
    description: 'Décrivez clairement le problème que vous rencontrez',
    placeholder: 'Ex: Les hôpitaux perdent 2 heures par jour à chercher des dossiers patients. Chaque infirmière passe 30 minutes par jour à remplir des formulaires papier. Cela affecte 500 patients par jour.',
    tips: [
      'Soyez spécifique avec des chiffres (temps, coût, nombre de personnes)',
      'Expliquez qui est affecté (patients, citoyens, étudiants, etc.)',
      'Mentionnez la fréquence (quotidien, hebdomadaire, etc.)',
      'Décrivez l\'impact concret du problème',
    ],
    goodExample: 'Les citoyens attendent 3 heures en moyenne pour obtenir un document administratif. Chaque jour, 200 personnes visitent la commune. Le processus manuel cause des erreurs dans 15% des cas.',
    badExample: 'C\'est difficile d\'obtenir des documents.',
    label: 'Description du problème',
    minLength: 20,
  },
  ar: {
    title: '1. ما هي المشكلة؟',
    description: 'اشرح المشكلة التي تواجهها بوضوح',
    placeholder: 'مثال: المستشفيات تفقد ساعتين يومياً في البحث عن ملفات المرضى...',
    tips: [
      'كن محدداً بالأرقام (الوقت، التكلفة، عدد الأشخاص)',
      'اشرح من يتأثر (المرضى، المواطنون، الطلاب، إلخ)',
      'اذكر التكرار (يومي، أسبوعي، إلخ)',
      'صف التأثير الملموس للمشكلة',
    ],
    goodExample: 'ينتظر المواطنون 3 ساعات في المتوسط للحصول على وثيقة إدارية...',
    badExample: 'من الصعب الحصول على الوثائق.',
    label: 'وصف المشكلة',
    minLength: 20,
  },
  darija: {
    title: '1. شنو المشكل؟',
    description: 'شرح المشكل اللي كاين عندك بوضوح',
    placeholder: 'مثال: المستشفيات كتخسر ساعتين كل يوم فالبحث على ملفات المرضى...',
    tips: [
      'كن محدد بالأرقام (الوقت، التكلفة، عدد الناس)',
      'اشرح منين كيتأثر (المرضى، المواطنون، الطلاب، إلخ)',
      'قول التكرار (كل يوم، كل أسبوع، إلخ)',
      'وصف التأثير الحقيقي ديال المشكل',
    ],
    goodExample: 'المواطنون كينتظرو 3 ساعات فالمتوسط باش ياخدو وثيقة إدارية...',
    badExample: 'صعيب ناخدو الوثائق.',
    label: 'وصف المشكل',
    minLength: 20,
  },
};

export default function Step1Problem({
  value,
  onChange,
  language,
  onLanguageChange,
  clarityScore,
}: Step1ProblemProps) {
  const t = translations[language];
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleTranscription = (text: string) => {
    onChange(value ? `${value} ${text}` : text);
  };

  const characterCount = value.length;
  const isValid = characterCount >= t.minLength;

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={language === 'fr' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('fr')}
        >
          🇫🇷 Français
        </Button>
        <Button
          variant={language === 'ar' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('ar')}
        >
          🇸🇦 العربية
        </Button>
        <Button
          variant={language === 'darija' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('darija')}
        >
          🏔️ Darija
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
        <p className="text-slate-600 mt-1">{t.description}</p>
      </div>

      {/* Clarity Score Indicator */}
      {clarityScore !== undefined && (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Score de clarté estimé</span>
              <span className="text-sm font-bold text-indigo-600">{clarityScore.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  clarityScore >= 6 ? 'bg-green-500' : clarityScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(clarityScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.label}</CardTitle>
              <CardDescription>
                Minimum {t.minLength} caractères • {characterCount} / {t.minLength}
              </CardDescription>
            </div>
            <VoiceRecorder
              onTranscription={handleTranscription}
              isRecording={isRecording}
              onStartRecording={() => setIsRecording(true)}
              onStopRecording={() => setIsRecording(false)}
              isTranscribing={isTranscribing}
              fieldName="problem_statement"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.placeholder}
            rows={6}
            className="resize-none"
            dir={language === 'ar' || language === 'darija' ? 'rtl' : 'ltr'}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {isValid ? (
                <Badge className="bg-green-100 text-green-800">✓ Valide</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {t.minLength - characterCount} caractères restants
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExamples(!showExamples)}
            >
              {showExamples ? 'Masquer' : 'Voir'} les exemples
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      {showExamples && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <span>✓</span> Bon exemple
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800">{t.goodExample}</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <span>✗</span> Mauvais exemple
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800">{t.badExample}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-indigo-900 text-sm">💡 Conseils</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-indigo-800">
            {t.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

