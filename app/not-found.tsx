import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-6 py-12">
      <Card className="w-full max-w-2xl border-blue-200 bg-white/95 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <CardTitle className="text-3xl font-bold text-slate-900">Page introuvable</CardTitle>
          <CardDescription className="mt-2 text-base">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Suggestions */}
          <Card className="border-slate-200 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Pages disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-indigo-600 hover:underline">
                    🏠 Page d'accueil
                  </Link>
                </li>
                <li>
                  <Link href="/ideas" className="text-indigo-600 hover:underline">
                    💡 Toutes les idées
                  </Link>
                </li>
                <li>
                  <Link href="/submit" className="text-indigo-600 hover:underline">
                    ✍️ Soumettre une idée
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/">🏠 Retour à l'accueil</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link href="/ideas">💡 Voir les idées</Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-800">
            <p>
              Si vous pensez qu'il s'agit d'une erreur, veuillez{' '}
              <a href="mailto:support@marrai.ma" className="font-semibold underline hover:text-blue-900">
                contacter le support
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

