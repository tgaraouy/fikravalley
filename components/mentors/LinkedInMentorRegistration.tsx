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
        const data = await response.json();
        setLinkedInAvailable(data.configured === true);
      } catch (error) {
        // If check fails, assume not configured
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
  if (!linkedInAvailable) {
    return null; // Hide LinkedIn option if not configured
  }

  // If LinkedIn data is loaded, show confirmation form
  if (mentorData) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Profil LinkedIn chargé avec succès!</h2>
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
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Linkedin className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Inscription rapide avec LinkedIn
          </h2>

          <p className="text-slate-600">
            Connectez-vous avec LinkedIn pour remplir automatiquement votre profil de mentor.
            <br />
            <strong>Aucune saisie manuelle requise!</strong>
          </p>

          <Button
            onClick={handleLinkedInAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Linkedin className="w-5 h-5 mr-2" />
                S'inscrire avec LinkedIn
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

