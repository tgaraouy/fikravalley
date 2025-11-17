'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary
 * Catches errors that occur in the root layout
 * This is the last line of defense for unhandled errors
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error details to console for debugging
    console.error('❌ Global Application Error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      name: error.name,
      timestamp: new Date().toISOString(),
    });

    // Optionally send to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-6 py-12">
          <Card className="w-full max-w-2xl border-red-300 bg-white/95 shadow-xl">
            <CardHeader className="text-center">
              <div className="mb-4 text-6xl">🚨</div>
              <CardTitle className="text-3xl font-bold text-red-900">Erreur critique</CardTitle>
              <CardDescription className="mt-2 text-base text-red-700">
                Une erreur critique s'est produite dans l'application. Veuillez rafraîchir la page ou
                contacter le support.
              </CardDescription>
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
                <Button
                  onClick={() => {
                    reset();
                    window.location.reload();
                  }}
                  variant="primary"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
                >
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
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800">
                <p>
                  Si le problème persiste après avoir rafraîchi la page, veuillez{' '}
                  <a href="mailto:support@marrai.ma" className="font-semibold underline hover:text-red-900">
                    contacter le support technique
                  </a>
                  {' '}avec le code d'erreur ci-dessus.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

