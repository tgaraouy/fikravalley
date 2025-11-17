'use client';

/**
 * Terms of Service Page
 * 
 * Terms and conditions for using Fikra Valley
 * Available in French and Arabic
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Language = 'fr' | 'ar';

interface TermsContent {
  title: string;
  lastUpdated: string;
  version: string;
  sections: {
    title: string;
    content: string[];
  }[];
}

const termsContent: Record<Language, TermsContent> = {
  fr: {
    title: 'Conditions d\'Utilisation',
    lastUpdated: '15 janvier 2025',
    version: '1.0.0',
    sections: [
      {
        title: 'Acceptation des Conditions',
        content: [
          'En accédant et en utilisant Fikra Valley, vous acceptez d\'être lié par ces conditions d\'utilisation.',
          'Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.',
        ],
      },
      {
        title: 'Description du Service',
        content: [
          'Fikra Valley est une plateforme qui permet aux utilisateurs de soumettre des idées et des problèmes pour analyse par intelligence artificielle.',
          'Nous fournissons des services d\'analyse, d\'évaluation et de mise en relation d\'idées.',
          'Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment.',
        ],
      },
      {
        title: 'Utilisation du Service',
        content: [
          'Vous devez être âgé d\'au moins 18 ans pour utiliser ce service.',
          'Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe.',
          'Vous acceptez de ne pas utiliser le service à des fins illégales ou non autorisées.',
          'Vous acceptez de ne pas transmettre de contenu offensant, diffamatoire ou illégal.',
        ],
      },
      {
        title: 'Soumission d\'Idées',
        content: [
          'En soumettant une idée, vous garantissez que vous êtes le propriétaire légitime de cette idée ou que vous avez le droit de la soumettre.',
          'Vous accordez à Fikra Valley une licence non exclusive pour utiliser, analyser et évaluer votre idée.',
          'Vous comprenez que votre idée peut être partagée avec des partenaires potentiels pour évaluation.',
          'Fikra Valley ne garantit pas que votre idée sera sélectionnée, financée ou mise en œuvre.',
        ],
      },
      {
        title: 'Propriété Intellectuelle',
        content: [
          'Vous conservez tous les droits de propriété intellectuelle sur vos idées soumises.',
          'Fikra Valley conserve tous les droits de propriété intellectuelle sur la plateforme, les analyses et les rapports générés.',
          'Vous accordez à Fikra Valley le droit d\'utiliser votre idée pour des fins d\'analyse et d\'évaluation uniquement.',
        ],
      },
      {
        title: 'Confidentialité',
        content: [
          'Votre utilisation du service est également régie par notre Politique de Confidentialité.',
          'Nous collectons et utilisons vos données conformément à notre politique de confidentialité et à la loi marocaine 09-08.',
          'Vos données personnelles sont protégées et ne seront jamais vendues à des tiers.',
        ],
      },
      {
        title: 'Limitation de Responsabilité',
        content: [
          'Fikra Valley est fourni "tel quel" sans garantie d\'aucune sorte.',
          'Nous ne garantissons pas que le service sera ininterrompu, sécurisé ou exempt d\'erreurs.',
          'Dans la mesure permise par la loi, Fikra Valley ne sera pas responsable des dommages indirects, accessoires ou consécutifs.',
        ],
      },
      {
        title: 'Indemnisation',
        content: [
          'Vous acceptez d\'indemniser et de dégager Fikra Valley de toute responsabilité concernant toute réclamation résultant de votre utilisation du service.',
          'Cela inclut, sans s\'y limiter, les violations de ces conditions d\'utilisation.',
        ],
      },
      {
        title: 'Résiliation',
        content: [
          'Nous nous réservons le droit de suspendre ou de résilier votre accès au service à tout moment, avec ou sans préavis.',
          'Vous pouvez cesser d\'utiliser le service à tout moment.',
          'En cas de résiliation, vos données seront traitées conformément à notre politique de confidentialité.',
        ],
      },
      {
        title: 'Modifications des Conditions',
        content: [
          'Nous nous réservons le droit de modifier ces conditions à tout moment.',
          'Les modifications entreront en vigueur dès leur publication sur cette page.',
          'Il est de votre responsabilité de consulter régulièrement ces conditions.',
          'Votre utilisation continue du service après les modifications constitue votre acceptation des nouvelles conditions.',
        ],
      },
      {
        title: 'Droit Applicable',
        content: [
          'Ces conditions sont régies par les lois du Royaume du Maroc.',
          'Tout litige sera soumis à la juridiction exclusive des tribunaux marocains.',
        ],
      },
      {
        title: 'Contact',
        content: [
          'Pour toute question concernant ces conditions d\'utilisation, veuillez nous contacter à:',
          'Email: contact@fikravalley.com',
          'Pour les questions de confidentialité: privacy@fikravalley.com',
        ],
      },
    ],
  },
  ar: {
    title: 'شروط الاستخدام',
    lastUpdated: '15 يناير 2025',
    version: '1.0.0',
    sections: [
      {
        title: 'قبول الشروط',
        content: [
          'من خلال الوصول إلى واستخدام Fikra Valley، فإنك توافق على الالتزام بهذه الشروط والأحكام.',
          'إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدمتنا.',
        ],
      },
      {
        title: 'وصف الخدمة',
        content: [
          'Fikra Valley هي منصة تسمح للمستخدمين بتقديم الأفكار والمشاكل للتحليل بواسطة الذكاء الاصطناعي.',
          'نوفر خدمات التحليل والتقييم وربط الأفكار.',
          'نحتفظ بالحق في تعديل أو تعليق أو إيقاف أي جزء من الخدمة في أي وقت.',
        ],
      },
      {
        title: 'استخدام الخدمة',
        content: [
          'يجب أن تكون عمرك 18 عامًا على الأقل لاستخدام هذه الخدمة.',
          'أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك.',
          'توافق على عدم استخدام الخدمة لأغراض غير قانونية أو غير مصرح بها.',
          'توافق على عدم نقل محتوى مسيء أو تشهيري أو غير قانوني.',
        ],
      },
      {
        title: 'تقديم الأفكار',
        content: [
          'عند تقديم فكرة، فإنك تضمن أنك المالك الشرعي لهذه الفكرة أو أن لديك الحق في تقديمها.',
          'تمنح Fikra Valley ترخيصًا غير حصري لاستخدام وتحليل وتقييم فكرتك.',
          'تفهم أن فكرتك قد يتم مشاركتها مع شركاء محتملين للتقييم.',
          'لا تضمن Fikra Valley أن فكرتك سيتم اختيارها أو تمويلها أو تنفيذها.',
        ],
      },
      {
        title: 'الملكية الفكرية',
        content: [
          'تحتفظ بجميع حقوق الملكية الفكرية على أفكارك المقدمة.',
          'تحتفظ Fikra Valley بجميع حقوق الملكية الفكرية على المنصة والتحليلات والتقارير المولدة.',
          'تمنح Fikra Valley الحق في استخدام فكرتك لأغراض التحليل والتقييم فقط.',
        ],
      },
      {
        title: 'الخصوصية',
        content: [
          'يخضع استخدامك للخدمة أيضًا لسياسة الخصوصية الخاصة بنا.',
          'نجمع ونستخدم بياناتك وفقًا لسياسة الخصوصية الخاصة بنا والقانون المغربي 09-08.',
          'بياناتك الشخصية محمية ولن يتم بيعها أبدًا لأطراف ثالثة.',
        ],
      },
      {
        title: 'تحديد المسؤولية',
        content: [
          'يتم توفير Fikra Valley "كما هو" دون أي ضمان من أي نوع.',
          'لا نضمن أن الخدمة ستكون غير منقطعة أو آمنة أو خالية من الأخطاء.',
          'في الحدود المسموح بها بموجب القانون، لن تكون Fikra Valley مسؤولة عن الأضرار غير المباشرة أو العرضية أو التبعية.',
        ],
      },
      {
        title: 'التعويض',
        content: [
          'توافق على تعويض وإبراء ذمة Fikra Valley من أي مسؤولية فيما يتعلق بأي مطالبة ناتجة عن استخدامك للخدمة.',
          'يشمل ذلك، على سبيل المثال لا الحصر، انتهاكات شروط الاستخدام هذه.',
        ],
      },
      {
        title: 'الإنهاء',
        content: [
          'نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الخدمة في أي وقت، مع أو بدون إشعار.',
          'يمكنك التوقف عن استخدام الخدمة في أي وقت.',
          'في حالة الإنهاء، سيتم معالجة بياناتك وفقًا لسياسة الخصوصية الخاصة بنا.',
        ],
      },
      {
        title: 'تعديلات الشروط',
        content: [
          'نحتفظ بالحق في تعديل هذه الشروط في أي وقت.',
          'ستدخل التعديلات حيز التنفيذ فور نشرها على هذه الصفحة.',
          'من مسؤوليتك مراجعة هذه الشروط بانتظام.',
          'استمرار استخدامك للخدمة بعد التعديلات يشكل قبولك للشروط الجديدة.',
        ],
      },
      {
        title: 'القانون الواجب التطبيق',
        content: [
          'تخضع هذه الشروط لقوانين المملكة المغربية.',
          'سيتم إحالة أي نزاع إلى الاختصاص الحصري للمحاكم المغربية.',
        ],
      },
      {
        title: 'اتصل بنا',
        content: [
          'لأي أسئلة بخصوص شروط الاستخدام هذه، يرجى الاتصال بنا على:',
          'البريد الإلكتروني: contact@fikravalley.com',
          'لأسئلة الخصوصية: privacy@fikravalley.com',
        ],
      },
    ],
  },
};

export default function TermsOfServicePage() {
  const [language, setLanguage] = useState<Language>('fr');
  const content = termsContent[language];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Language Switcher */}
      <div className="flex justify-end gap-2 mb-6">
        <Button
          variant={language === 'fr' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('fr')}
        >
          Français
        </Button>
        <Button
          variant={language === 'ar' ? 'default' : 'outline'}
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
          <Card key={index} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-none">
                {section.content.map((paragraph, pIndex) => (
                  <li key={pIndex} className="text-slate-700 leading-relaxed">
                    {paragraph}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <div>
            <p>© {new Date().getFullYear()} Fikra Valley. Tous droits réservés.</p>
          </div>
          <div className="flex gap-4">
            <a
              href="/privacy"
              className="text-indigo-600 hover:underline"
            >
              Politique de Confidentialité
            </a>
            <a
              href="/contact"
              className="text-indigo-600 hover:underline"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

