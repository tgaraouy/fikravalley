'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error details to console for debugging
    console.error('❌ Application Error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  // Determine error type and user-friendly message
  const getErrorInfo = () => {
    // Check for 404 errors
    if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Not Found')) {
      return {
        title: 'Page introuvable',
        description: "La page que vous recherchez n'existe pas ou a été déplacée.",
        icon: '🔍',
        is404: true,
      };
    }

    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Network')) {
      return {
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        icon: '🌐',
        is404: false,
      };
    }

    // Check for authentication errors
    if (error.message.includes('auth') || error.message.includes('unauthorized') || error.message.includes('401')) {
      return {
        title: 'Accès non autorisé',
        description: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
        icon: '🔒',
        is404: false,
      };
    }

    // Generic error
    return {
      title: 'Une erreur est survenue',
      description: "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support si le problème persiste.",
      icon: '⚠️',
      is404: false,
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-6 py-12">
      <Card className="w-full max-w-2xl border-red-200 bg-white/95 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 text-6xl">{errorInfo.icon}</div>
          <CardTitle className="text-3xl font-bold text-slate-900">{errorInfo.title}</CardTitle>
          <CardDescription className="mt-2 text-base">{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-slate-200 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Détails techniques (développement)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Message:</span>{' '}
                  <code className="rounded bg-slate-100 px-1 text-xs">{error.message}</code>
                </div>
                {error.digest && (
                  <div className="text-sm">
                    <span className="font-semibold">Digest:</span>{' '}
                    <code className="rounded bg-slate-100 px-1 text-xs">{error.digest}</code>
                  </div>
                )}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset} variant="primary" size="lg" className="w-full sm:w-auto">
              🔄 Réessayer
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              🏠 Retour à l'accueil
            </Button>
          </div>

          {/* Help Text */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-800">
            <p>
              Si le problème persiste, veuillez{' '}
              <a href="mailto:support@marrai.ma" className="font-semibold underline hover:text-blue-900">
                contacter le support
              </a>
              {' '}ou consulter la{' '}
              <a href="/" className="font-semibold underline hover:text-blue-900">
                page d'accueil
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

