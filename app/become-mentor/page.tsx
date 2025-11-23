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
import { Loader2, CheckCircle, Star, Users, Heart } from 'lucide-react';

export default function BecomeMentorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    moroccan_city: '',
    current_role: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mentors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: formData.expertise.split(',').map(e => e.trim()).filter(Boolean),
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          years_experience: parseInt(formData.years_experience) || 0,
          available_hours_per_month: parseInt(formData.available_hours_per_month) || 0,
          max_cofund_amount: formData.max_cofund_amount ? parseFloat(formData.max_cofund_amount) : null,
          willing_to_mentor: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Inscription réussie! Nous vous contacterons bientôt.');
        router.push('/find-mentor');
      } else {
        const error = await response.json().catch(() => ({}));
        alert(`Erreur: ${error.error || 'Impossible de s\'inscrire'}`);
      }
    } catch (error) {
      console.error('Error registering mentor:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
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

        {/* Benefits Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Pourquoi devenir mentor?
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Impact réel:</strong> Aidez des entrepreneurs à transformer leurs idées en entreprises</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Réseau:</strong> Connectez-vous avec la prochaine génération d'entrepreneurs marocains</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Flexibilité:</strong> Choisissez vos heures et le nombre d'idées à mentorer</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Reconnaissance:</strong> Votre profil sera visible et vous recevrez des demandes ciblées</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Registration Form */}
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                    />
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
                      value={formData.current_role}
                      onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                      placeholder="Ex: CEO, CTO, Directeur..."
                    />
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
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                      placeholder="5"
                    />
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
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="Ex: healthcare, technology, finance, education..."
                  />
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
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
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
      </div>
    </div>
  );
}

