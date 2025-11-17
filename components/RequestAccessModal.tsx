'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RequestAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const USER_TYPES = [
  { value: 'workshop_attendee', label: '🎫 Participant à l\'atelier (Kénitra 22-23 déc)' },
  { value: 'student', label: '🎓 Étudiant(e) (Université marocaine)' },
  { value: 'professional', label: '💼 Professionnel(le) (Santé, Éducation, etc.)' },
  { value: 'diaspora', label: '🌍 Diaspora marocaine' },
  { value: 'government', label: '🏛️ Fonctionnaire' },
  { value: 'entrepreneur', label: '🚀 Entrepreneur(e)' },
  { value: 'other', label: '📋 Autre' },
];

const HOW_HEARD_OPTIONS = [
  { value: 'workshop_invite', label: 'Invitation à l\'atelier' },
  { value: 'social_media', label: 'Réseaux sociaux' },
  { value: 'colleague', label: 'Collègue/Ami' },
  { value: 'news', label: 'Article de presse' },
  { value: 'government', label: 'Communication gouvernementale' },
  { value: 'university', label: 'Annonce universitaire' },
  { value: 'other', label: 'Autre' },
];

export default function RequestAccessModal({ open, onOpenChange }: RequestAccessModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    user_type: '',
    reason: '',
    how_heard: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission de la demande');
      }

      setSuccess(true);
      // Store email in localStorage for access checking
      localStorage.setItem('fikralabs_email', formData.email);
      // Reset form
      setFormData({
        name: '',
        email: '',
        organization: '',
        user_type: '',
        reason: '',
        how_heard: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-green-600">✅ Demande Soumise!</DialogTitle>
            <DialogDescription>
              Votre demande d'accès a été reçue avec succès.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">
                <strong>Prochaines étapes:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-green-700 list-disc list-inside">
                <li>Notre équipe examinera votre demande</li>
                <li>Vous recevrez un email avec la décision dans les 24 heures</li>
                <li>Si approuvée, vous recevrez un lien magique pour accéder à la plateforme</li>
              </ul>
            </div>
            <div className="text-sm text-slate-600">
              <p className="font-medium mb-1">Détails de votre demande:</p>
              <p>Email: {formData.email}</p>
              <p>Type: {USER_TYPES.find((t) => t.value === formData.user_type)?.label}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setSuccess(false); onOpenChange(false); }}>
              Retour à l'accueil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Demander l'Accès à Fikra Valley</DialogTitle>
          <DialogDescription>
            Pour soumettre vos idées et recevoir une analyse IA gratuite, demandez l'accès à la plateforme.
            Dites-nous qui vous êtes pour commencer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">
              Nom complet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              required
              placeholder="Fatima Zahra"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="fatima@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="organization">Organisation/Affiliation</Label>
            <Input
              id="organization"
              placeholder="Ministère de la Santé / Université Mohammed V"
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="user_type">
              Je suis un(e)... <span className="text-red-500">*</span>
            </Label>
            <Select
              id="user_type"
              required
              value={formData.user_type}
              onChange={(e) => handleChange('user_type', e.target.value)}
            >
              <option value="">Sélectionnez...</option>
              {USER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">
              Pourquoi souhaitez-vous participer ? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              required
              maxLength={300}
              rows={4}
              placeholder="Décrivez le problème que vous souhaitez résoudre ou pourquoi vous êtes intéressé(e) par Fikra Valley..."
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.reason.length}/300 caractères
            </p>
          </div>

          <div>
            <Label htmlFor="how_heard">Comment avez-vous entendu parler de nous ?</Label>
            <Select
              id="how_heard"
              value={formData.how_heard}
              onChange={(e) => handleChange('how_heard', e.target.value)}
            >
              <option value="">Sélectionnez...</option>
              {HOW_HEARD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre la Demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

