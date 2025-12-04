/**
 * Become a Mentor Registration Page
 * 
 * Engages mentors to register for mentorship program
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, Star, Users, Heart, Target, Zap } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { getUserFriendlyError, logError } from '@/lib/utils/error-handler';
import LinkedInMentorRegistration from '@/components/mentors/LinkedInMentorRegistration';

export default function BecomeMentorPage() {
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    moroccan_city: '',
    currentrole: '',
    company: '',
    years_experience: '',
    expertise: '',
    skills: '',
    bio: '',
    available_hours_per_month: '',
    willing_to_cofund: false,
    max_cofund_amount: '',
    linkedin_url: '',
    website_url: '',
    chapter: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.currentrole.trim()) {
      newErrors.currentrole = 'Le poste actuel est requis';
    }

    if (!formData.years_experience || parseInt(formData.years_experience) < 0) {
      newErrors.years_experience = 'Les années d\'expérience sont requises';
    }

    if (!formData.expertise.trim()) {
      newErrors.expertise = 'Au moins un domaine d\'expertise est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/mentors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: formData.expertise.split(',').map(e => e.trim()).filter(Boolean),
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          currentrole: formData.currentrole ? [formData.currentrole.trim()] : [],
          years_experience: parseInt(formData.years_experience) || 0,
          available_hours_per_month: parseInt(formData.available_hours_per_month) || 0,
          max_cofund_amount: formData.max_cofund_amount ? parseFloat(formData.max_cofund_amount) : null,
          willing_to_mentor: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        success('✅ Inscription réussie! Nous vous contacterons bientôt.');
        setTimeout(() => {
          router.push('/find-mentor');
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Impossible de s\'inscrire';
        logError(new Error(errorMessage), 'MentorRegistration');
        showError(getUserFriendlyError(new Error(errorMessage)));
      }
    } catch (error) {
      logError(error, 'MentorRegistration');
      showError(getUserFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4 relative">
      <div className="max-w-3xl mx-auto relative z-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            👨‍🏫 Devenez Mentor
          </h1>
          <p className="text-lg text-slate-600">
            Partagez votre expérience et aidez les entrepreneurs marocains à réussir
          </p>
        </div>

        {/* Enhanced Value Proposition Card */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-extrabold text-green-900 mb-2 flex items-center justify-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Pourquoi devenir mentor?
              </h3>
              <p className="text-green-700 font-medium">Rejoignez une communauté qui transforme les idées en réalité</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">Impact réel</h4>
                    <p className="text-sm text-green-800">Aidez des entrepreneurs à transformer leurs idées en entreprises</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">Réseau</h4>
                    <p className="text-sm text-green-800">Connectez-vous avec la prochaine génération d'entrepreneurs marocains</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">Flexibilité</h4>
                    <p className="text-sm text-green-800">Choisissez vos heures et le nombre d'idées à mentorer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">Reconnaissance</h4>
                    <p className="text-sm text-green-800">Votre profil sera visible et vous recevrez des demandes ciblées</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Registration (Option 1 - Preferred) */}
        <div className="mb-8 relative z-50">
          <LinkedInMentorRegistration />
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">Ou utilisez le formulaire classique</span>
          </div>
        </div>

        {/* Registration Form (Fallback) */}
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle>Formulaire d'inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom complet *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="Votre nom"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="votre@email.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Localisation actuelle
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Casablanca, Paris, Berlin..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ville d'origine (Maroc)
                    </label>
                    <Input
                      value={formData.moroccan_city}
                      onChange={(e) => setFormData({ ...formData, moroccan_city: e.target.value })}
                      placeholder="Ex: Rabat, Casablanca, Fès..."
                    />
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Informations professionnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Poste actuel *
                    </label>
                    <Input
                      required
                      value={formData.currentrole}
                      onChange={(e) => {
                        setFormData({ ...formData, currentrole: e.target.value });
                        if (errors.currentrole) setErrors({ ...errors, currentrole: '' });
                      }}
                      placeholder="Ex: CEO, CTO, Directeur..."
                      className={errors.currentrole ? 'border-red-500' : ''}
                    />
                    {errors.currentrole && <p className="text-sm text-red-600 mt-1">{errors.currentrole}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Entreprise
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Années d'expérience *
                    </label>
                    <Input
                      required
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) => {
                        setFormData({ ...formData, years_experience: e.target.value });
                        if (errors.years_experience) setErrors({ ...errors, years_experience: '' });
                      }}
                      placeholder="5"
                      className={errors.years_experience ? 'border-red-500' : ''}
                    />
                    {errors.years_experience && <p className="text-sm text-red-600 mt-1">{errors.years_experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Heures disponibles/mois
                    </label>
                    <Input
                      type="number"
                      value={formData.available_hours_per_month}
                      onChange={(e) => setFormData({ ...formData, available_hours_per_month: e.target.value })}
                      placeholder="Ex: 5, 10, 20..."
                    />
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Expertise</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Domaines d'expertise * (séparés par des virgules)
                  </label>
                  <Input
                    required
                    value={formData.expertise}
                    onChange={(e) => {
                      setFormData({ ...formData, expertise: e.target.value });
                      if (errors.expertise) setErrors({ ...errors, expertise: '' });
                    }}
                    placeholder="Ex: healthcare, technology, finance, education..."
                    className={errors.expertise ? 'border-red-500' : ''}
                  />
                  {errors.expertise && <p className="text-sm text-red-600 mt-1">{errors.expertise}</p>}
                  <p className="text-xs text-slate-500 mt-1">Séparez les domaines par des virgules</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Compétences techniques (séparées par des virgules)
                  </label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Ex: React, Node.js, Python, IoT, AI..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bio / Présentation
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Parlez de votre parcours, vos réussites, votre vision..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Engagement */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Engagement</h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cofund"
                    checked={formData.willing_to_cofund}
                    onChange={(e) => setFormData({ ...formData, willing_to_cofund: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="cofund" className="text-sm text-slate-700">
                    Je suis intéressé(e) par le co-financement
                  </label>
                </div>

                {formData.willing_to_cofund && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Montant maximum de co-financement (EUR)
                    </label>
                    <Input
                      type="number"
                      value={formData.max_cofund_amount}
                      onChange={(e) => setFormData({ ...formData, max_cofund_amount: e.target.value })}
                      placeholder="Ex: 5000, 10000..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chapitre MGL (optionnel)
                  </label>
                  <Input
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="Ex: health, education, innovation, women..."
                  />
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 border-b pb-2">Liens</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      LinkedIn
                    </label>
                    <Input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Site web
                    </label>
                    <Input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    S'inscrire comme Mentor
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Message */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            En vous inscrivant, vous acceptez de recevoir des demandes de mentorat de la part d'entrepreneurs marocains.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

