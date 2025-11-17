'use client';

/**
 * Privacy Policy Page
 * 
 * GDPR and Morocco Law 09-08 compliant privacy policy
 * Available in French and Arabic
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Language = 'fr' | 'ar';

interface PrivacyContent {
  title: string;
  lastUpdated: string;
  version: string;
  sections: {
    title: string;
    content: string[];
  }[];
}

const privacyContent: Record<Language, PrivacyContent> = {
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: '15 janvier 2025',
    version: '1.0.0',
    sections: [
      {
        title: 'Introduction',
        content: [
          'Fikra Valley s\'engage à protéger votre vie privée et vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.',
          'Cette politique est conforme à la loi marocaine 09-08 sur la protection des données personnelles et au RGPD (si applicable).',
        ],
      },
      {
        title: 'Quelles données collectons-nous ?',
        content: [
          'Nous collectons uniquement les données nécessaires pour fournir nos services :',
          '• Votre nom (pour vous identifier)',
          '• Votre numéro de téléphone (pour vous contacter)',
          '• La description de votre problème (pour analyser votre idée)',
          '• Votre ville (pour comprendre le contexte local)',
          '• Votre adresse email anonyme (générée automatiquement)',
        ],
      },
      {
        title: 'Pourquoi collectons-nous ces données ?',
        content: [
          'Nous utilisons vos données pour :',
          '• Analyser votre idée avec l\'intelligence artificielle',
          '• Vous contacter concernant votre soumission',
          '• Améliorer nos services',
          '• Respecter nos obligations légales',
        ],
      },
      {
        title: 'Base légale',
        content: [
          'Nous traitons vos données sur la base de :',
          '• Votre consentement explicite (que vous pouvez retirer à tout moment)',
          '• Notre intérêt légitime à fournir et améliorer nos services',
        ],
      },
      {
        title: 'Combien de temps conservons-nous vos données ?',
        content: [
          'Par défaut, nous conservons vos données pendant 90 jours.',
          'Vous pouvez choisir de :',
          '• Conserver vos données pendant 180 jours',
          '• Conserver vos données jusqu\'à ce que vous les supprimiez',
          'Vous pouvez demander la suppression de vos données à tout moment.',
        ],
      },
      {
        title: 'Qui peut accéder à vos données ?',
        content: [
          'Seule notre équipe autorisée peut accéder à vos données.',
          'Toutes les données sensibles sont :',
          '• Cryptées avec AES-256-GCM',
          '• Stockées de manière sécurisée',
          '• Accessibles uniquement avec des contrôles d\'accès stricts',
          'Nous ne partageons jamais vos données avec des tiers sans votre consentement explicite.',
        ],
      },
      {
        title: 'Vos droits',
        content: [
          'Vous avez le droit de :',
          '• Accéder à vos données personnelles',
          '• Corriger vos données si elles sont incorrectes',
          '• Demander la suppression de vos données',
          '• Exporter vos données (portabilité des données)',
          '• Retirer votre consentement à tout moment',
          '• Vous opposer au traitement de vos données',
        ],
      },
      {
        title: 'Comment exercer vos droits ?',
        content: [
          'Pour exercer vos droits, contactez-nous à :',
          'Email : contact@fikravalley.com',
          'Nous répondrons dans les 30 jours suivant votre demande.',
        ],
      },
      {
        title: 'Sécurité des données',
        content: [
          'Nous mettons en place des mesures de sécurité strictes :',
          '• Cryptage AES-256-GCM pour toutes les données sensibles',
          '• Hachage bcrypt pour les numéros de téléphone',
          '• Contrôles d\'accès basés sur les rôles',
          '• Journalisation de tous les accès aux données',
          '• Sauvegardes régulières et sécurisées',
        ],
      },
      {
        title: 'Modifications de cette politique',
        content: [
          'Si nous modifions cette politique, nous vous en informerons et vous demanderons votre consentement si nécessaire.',
          'La version actuelle est : 1.0.0',
          'Dernière mise à jour : 15 janvier 2025',
        ],
      },
      {
        title: 'Contact',
        content: [
          'Pour toute question concernant cette politique ou vos données :',
          'Email : contact@fikravalley.com',
          'Nous sommes là pour vous aider.',
        ],
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    lastUpdated: '15 يناير 2025',
    version: '1.0.0',
    sections: [
      {
        title: 'مقدمة',
        content: [
          'تلتزم Fikra Valley بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها.',
          'هذه السياسة متوافقة مع القانون المغربي 09-08 المتعلق بحماية البيانات الشخصية وRGPD (إن كان ذلك ينطبق).',
        ],
      },
      {
        title: 'ما هي البيانات التي نجمعها؟',
        content: [
          'نجمع فقط البيانات الضرورية لتقديم خدماتنا:',
          '• اسمك (لتحديد هويتك)',
          '• رقم هاتفك (للتواصل معك)',
          '• وصف مشكلتك (لتحليل فكرتك)',
          '• مدينتك (لفهم السياق المحلي)',
          '• بريدك الإلكتروني المجهول (يتم إنشاؤه تلقائياً)',
        ],
      },
      {
        title: 'لماذا نجمع هذه البيانات؟',
        content: [
          'نستخدم بياناتك من أجل:',
          '• تحليل فكرتك بالذكاء الاصطناعي',
          '• التواصل معك بخصوص طلبك',
          '• تحسين خدماتنا',
          '• الامتثال لالتزاماتنا القانونية',
        ],
      },
      {
        title: 'الأساس القانوني',
        content: [
          'نعالج بياناتك على أساس:',
          '• موافقتك الصريحة (التي يمكنك سحبها في أي وقت)',
          '• مصلحتنا المشروعة في تقديم وتحسين خدماتنا',
        ],
      },
      {
        title: 'كم من الوقت نحتفظ ببياناتك؟',
        content: [
          'افتراضياً، نحتفظ ببياناتك لمدة 90 يوماً.',
          'يمكنك اختيار:',
          '• الاحتفاظ ببياناتك لمدة 180 يوماً',
          '• الاحتفاظ ببياناتك حتى تقوم بحذفها',
          'يمكنك طلب حذف بياناتك في أي وقت.',
        ],
      },
      {
        title: 'من يمكنه الوصول إلى بياناتك؟',
        content: [
          'فقط فريقنا المصرح له يمكنه الوصول إلى بياناتك.',
          'جميع البيانات الحساسة:',
          '• مشفرة بـ AES-256-GCM',
          '• مخزنة بشكل آمن',
          '• يمكن الوصول إليها فقط مع ضوابط وصول صارمة',
          'لا نشارك بياناتك أبداً مع أطراف ثالثة دون موافقتك الصريحة.',
        ],
      },
      {
        title: 'حقوقك',
        content: [
          'لديك الحق في:',
          '• الوصول إلى بياناتك الشخصية',
          '• تصحيح بياناتك إذا كانت غير صحيحة',
          '• طلب حذف بياناتك',
          '• تصدير بياناتك (قابلية نقل البيانات)',
          '• سحب موافقتك في أي وقت',
          '• الاعتراض على معالجة بياناتك',
        ],
      },
      {
        title: 'كيف تمارس حقوقك؟',
        content: [
          'لممارسة حقوقك، اتصل بنا على:',
          'البريد الإلكتروني: contact@fikravalley.com',
          'سنجيب في غضون 30 يوماً من طلبك.',
        ],
      },
      {
        title: 'أمان البيانات',
        content: [
          'نطبق إجراءات أمان صارمة:',
          '• تشفير AES-256-GCM لجميع البيانات الحساسة',
          '• التجزئة bcrypt لأرقام الهواتف',
          '• ضوابط الوصول القائمة على الأدوار',
          '• تسجيل جميع الوصول إلى البيانات',
          '• نسخ احتياطية منتظمة وآمنة',
        ],
      },
      {
        title: 'تعديلات هذه السياسة',
        content: [
          'إذا قمنا بتعديل هذه السياسة، سنخطرك ونطلب موافقتك إذا لزم الأمر.',
          'الإصدار الحالي: 1.0.0',
          'آخر تحديث: 15 يناير 2025',
        ],
      },
      {
        title: 'اتصل بنا',
        content: [
          'لأي أسئلة حول هذه السياسة أو بياناتك:',
          'البريد الإلكتروني: contact@fikravalley.com',
          'نحن هنا لمساعدتك.',
        ],
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<Language>('fr');
  const content = privacyContent[language];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Language Switcher */}
      <div className="flex justify-end gap-2 mb-6">
        <Button
          variant={language === 'fr' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setLanguage('fr')}
        >
          Français
        </Button>
        <Button
          variant={language === 'ar' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setLanguage('ar')}
        >
          العربية
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{content.title}</h1>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <Badge>Version {content.version}</Badge>
          <span>Dernière mise à jour : {content.lastUpdated}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Badge className="bg-green-100 text-green-800">Loi 09-08</Badge>
          <Badge className="bg-blue-100 text-blue-800">RGPD</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {content.sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-2xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="text-slate-700 leading-relaxed"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card className="mt-8 bg-slate-50">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-600 text-center">
            {language === 'fr' ? (
              <>
                Questions ? Contactez-nous à{' '}
                <a href="mailto:contact@fikravalley.com" className="text-indigo-600 hover:underline">
                  contact@fikravalley.com
                </a>
              </>
            ) : (
              <>
                أسئلة؟ اتصل بنا على{' '}
                <a href="mailto:contact@fikravalley.com" className="text-indigo-600 hover:underline">
                  contact@fikravalley.com
                </a>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

