'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Lien d\'activation invalide. Paramètres manquants.');
      return;
    }

    activateAccount(token, email);
  }, [searchParams]);

  const activateAccount = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Votre compte a été activé avec succès !');
        
        // Store access approval in localStorage
        localStorage.setItem('fikralabs_access_approved', 'true');
        localStorage.setItem('fikralabs_email', email);
        
        // Redirect to submit page after 2 seconds
        setTimeout(() => {
          router.push('/submit');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Erreur lors de l\'activation du compte');
      }
    } catch (error) {
      console.error('Error activating account:', error);
      setStatus('error');
      setMessage('Erreur lors de l\'activation. Veuillez réessayer.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Activation du compte en cours...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <Card className={status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader>
          <CardTitle className={status === 'success' ? 'text-green-900' : 'text-red-900'}>
            {status === 'success' ? '✅ Compte Activé !' : '❌ Erreur d\'Activation'}
          </CardTitle>
          <CardDescription className={status === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="space-y-4">
              <p className="text-green-800">
                Vous pouvez maintenant accéder à toutes les fonctionnalités de Fikra Labs.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/submit">Soumettre une Idée</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/ideas">Parcourir les Idées</Link>
                </Button>
              </div>
              <p className="text-sm text-green-700">
                Redirection automatique dans quelques secondes...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-800">
                Le lien d'activation peut avoir expiré ou être invalide.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/submit">Demander un Nouveau Lien</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/">Retour à l'Accueil</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

