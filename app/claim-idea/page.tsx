/**
 * Claim Idea Page
 * 
 * Users can enter their email/phone to see all their ideas
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Search, Loader2 } from 'lucide-react';

export default function ClaimIdeaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      setError('Entrez au moins un email ou un numéro de téléphone');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Search for ideas by email or phone
      const response = await fetch('/api/ideas/search-by-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la recherche');
      }

      const data = await response.json();
      
      if (data.ideas && data.ideas.length > 0) {
        // Redirect to my-fikras with contact info
        const params = new URLSearchParams();
        if (email) params.set('email', email);
        if (phone) params.set('phone', phone);
        router.push(`/my-fikras?${params.toString()}`);
      } else {
        setError('Aucune idée trouvée avec ces informations. Vérifiez votre email/téléphone.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Trouvez vos idées
          </h1>
          <p className="text-slate-600">
            Entrez votre email ou téléphone pour voir toutes vos idées soumises
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="text-center text-slate-400 font-medium">OU</div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212 6XX XXX XXX"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!email && !phone)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Trouver mes idées
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            💡 Vous avez un code de suivi?{' '}
            <a href="/track" className="text-blue-600 hover:underline font-medium">
              Utilisez-le ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

