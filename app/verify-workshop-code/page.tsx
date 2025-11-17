'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VerifyWorkshopCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/workshop-codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase().trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setSuccess(true);
        // Store access approval
        localStorage.setItem('fikralabs_access_approved', 'true');
        if (data.email) {
          localStorage.setItem('fikralabs_email', data.email);
        }
        
        // Redirect to submit page after 2 seconds
        setTimeout(() => {
          router.push('/submit');
        }, 2000);
      } else {
        setError(data.message || 'Code invalide');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Erreur lors de la vérification. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <CardTitle className="text-2xl text-green-900 mb-2">Code Validé !</CardTitle>
            <CardDescription className="text-green-800 mb-4">
              Votre accès a été activé avec succès.
            </CardDescription>
            <p className="text-sm text-green-700 mb-6">
              Redirection vers la page de soumission...
            </p>
            <Button asChild>
              <a href="/submit">Continuer</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <Card className="border-white/80 bg-white/95">
        <CardHeader>
          <CardTitle>Vérifier le Code d'Atelier</CardTitle>
          <CardDescription>
            Entrez le code que vous avez reçu lors de votre inscription à l'atelier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">
                Code d'Atelier <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                required
                placeholder="Ex: KENI-2024-A7B3"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono text-lg tracking-wider"
                maxLength={20}
              />
              <p className="text-xs text-slate-500 mt-1">
                Le code est généralement au format: WORKSHOP-YYYY-XXXX
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isVerifying}>
              {isVerifying ? 'Vérification...' : 'Vérifier le Code'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Vous n'avez pas de code ?{' '}
              <a href="/submit" className="text-indigo-600 hover:underline">
                Demander l'accès
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

