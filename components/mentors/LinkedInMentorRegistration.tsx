/**
 * LinkedIn Mentor Registration Component
 * 
 * Handles LinkedIn OAuth flow and profile confirmation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { Card, CardContent } from '@/components/ui/card';

interface LinkedInMentorData {
  name: string;
  email: string;
  linkedin_url: string;
  currentrole: string[];
  company: string | null;
  years_experience: number;
  location: string | null;
  moroccan_city: string | null;
  expertise: string[];
  skills: string[];
  bio: string | null;
  profile_picture?: string;
}

export default function LinkedInMentorRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, success, error: showError, removeToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [mentorData, setMentorData] = useState<LinkedInMentorData | null>(null);
  const [linkedInAvailable, setLinkedInAvailable] = useState(true); // Default to true, will be checked

  // Check if LinkedIn OAuth is configured
  useEffect(() => {
    const checkLinkedInConfig = async () => {
      try {
        const response = await fetch('/api/auth/linkedin/check');
        if (response.ok) {
          const data = await response.json();
          setLinkedInAvailable(data.configured === true);
        } else {
          // If check fails, assume not configured
          setLinkedInAvailable(false);
        }
      } catch (error) {
        // If check fails, assume not configured (silently fail)
        setLinkedInAvailable(false);
      }
    };
    checkLinkedInConfig();
  }, []);
  const [additionalData, setAdditionalData] = useState({
    phone: '',
    available_hours_per_month: '5',
    willing_to_cofund: false,
    max_cofund_amount: '',
    website_url: '',
    chapter: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if LinkedIn callback succeeded
  useEffect(() => {
    const linkedinSuccess = searchParams.get('linkedin');
    const error = searchParams.get('error');

    if (error) {
      showError(`Erreur LinkedIn: ${error}`);
      return;
    }

    if (linkedinSuccess === 'success') {
      // Fetch mentor data from session
      fetchMentorData();
    }
  }, [searchParams]);

  const fetchMentorData = async () => {
    try {
      const response = await fetch('/api/auth/linkedin/data');
      if (response.ok) {
        const data = await response.json();
        setMentorData(data);
      }
    } catch (error) {
      showError('Impossible de récupérer les données LinkedIn');
    }
  };

  const handleLinkedInAuth = async () => {
    setIsLoading(true);
    try {
      // Check if LinkedIn is configured before redirecting
      const response = await fetch('/api/auth/linkedin/check');
      if (!response.ok) {
        const error = await response.json();
        showError(error.details || 'LinkedIn OAuth n\'est pas configuré. Veuillez utiliser le formulaire manuel.');
        setIsLoading(false);
        return;
      }
      // Redirect to LinkedIn OAuth
      window.location.href = '/api/auth/linkedin';
    } catch (error) {
      showError('Erreur lors de la connexion LinkedIn. Veuillez utiliser le formulaire manuel.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentorData) {
      showError('Données LinkedIn manquantes');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mentors/register-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorData,
          additionalData: {
            ...additionalData,
            available_hours_per_month: parseInt(additionalData.available_hours_per_month) || 5,
            max_cofund_amount: additionalData.max_cofund_amount ? parseFloat(additionalData.max_cofund_amount) : null,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        success('✅ Inscription réussie! Nous vous contacterons bientôt.');
        setTimeout(() => {
          router.push('/find-mentor');
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      showError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If LinkedIn is not configured, don't show LinkedIn option
  // Note: Keep component mounted to prevent re-rendering issues
  if (!linkedInAvailable) {
    return null; // Hide LinkedIn option if not configured
  }

  // If LinkedIn data is loaded, show confirmation form
  if (mentorData) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Card className="border-2 border-green-200 shadow-xl animate-fade-in">
          <CardContent className="p-6 space-y-6">
            {/* Success Animation */}
            <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="relative">
                <CheckCircle className="w-8 h-8 animate-scale-in" />
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold">✅ Profil LinkedIn chargé avec succès!</h2>
                <p className="text-sm text-green-600">90% de votre profil est déjà rempli</p>
              </div>
            </div>

            {/* Profile Preview */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <p><strong>Nom:</strong> {mentorData.name}</p>
              <p><strong>Email:</strong> {mentorData.email}</p>
              {mentorData.currentrole.length > 0 && (
                <p><strong>Poste:</strong> {mentorData.currentrole.join(', ')}</p>
              )}
              {mentorData.company && (
                <p><strong>Entreprise:</strong> {mentorData.company}</p>
              )}
              {mentorData.years_experience > 0 && (
                <p><strong>Expérience:</strong> {mentorData.years_experience} ans</p>
              )}
              {mentorData.expertise.length > 0 && (
                <p><strong>Expertise:</strong> {mentorData.expertise.join(', ')}</p>
              )}
            </div>

            {/* Additional Info Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-slate-900">Informations complémentaires (optionnel)</h3>

              <Input
                type="tel"
                placeholder="Téléphone (optionnel)"
                value={additionalData.phone}
                onChange={(e) => setAdditionalData({ ...additionalData, phone: e.target.value })}
              />

              <Input
                type="number"
                placeholder="Heures disponibles/mois (défaut: 5)"
                value={additionalData.available_hours_per_month}
                onChange={(e) => setAdditionalData({ ...additionalData, available_hours_per_month: e.target.value })}
                min="1"
                max="40"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cofund"
                  checked={additionalData.willing_to_cofund}
                  onChange={(e) => setAdditionalData({ ...additionalData, willing_to_cofund: e.target.checked })}
                />
                <label htmlFor="cofund" className="text-sm text-slate-700">
                  Je suis intéressé(e) par le co-financement
                </label>
              </div>

              {additionalData.willing_to_cofund && (
                <Input
                  type="number"
                  placeholder="Montant maximum de co-financement (EUR)"
                  value={additionalData.max_cofund_amount}
                  onChange={(e) => setAdditionalData({ ...additionalData, max_cofund_amount: e.target.value })}
                />
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmer l'inscription
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </>
    );
  }

  // Show LinkedIn auth button
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Card className="border-2 border-blue-200 shadow-xl relative overflow-visible z-50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 animate-gradient-x opacity-50"></div>
        
        <CardContent className="p-8 text-center space-y-6 relative z-10">
          {/* Prominent LinkedIn Icon with pulse animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Linkedin className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Value Proposition - More Prominent */}
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900">
              ⚡ Inscription en 1 clic
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
              <p className="text-lg font-semibold text-slate-800 mb-2">
                90% de votre profil rempli automatiquement
              </p>
              <p className="text-sm text-slate-600">
                Connectez-vous avec LinkedIn pour remplir automatiquement votre profil de mentor.
                <br />
                <strong className="text-blue-600">Aucune saisie manuelle requise!</strong>
              </p>
            </div>
          </div>

          {/* Benefits in one line */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>2-3 minutes</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Auto-rempli</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Sécurisé</span>
            </div>
          </div>

          {/* Large CTA Button */}
          <Button
            onClick={handleLinkedInAuth}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-7 text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <Linkedin className="w-6 h-6 mr-3" />
                S'inscrire avec LinkedIn (1 clic)
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500">
            En continuant, vous autorisez Fikra Valley à accéder à votre profil LinkedIn.
            <br />
            Vos données sont sécurisées et conformes à la PDPL.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

