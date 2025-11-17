'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

interface WorkshopCode {
  id: string;
  code: string;
  workshop_id: string;
  email: string | null;
  name: string | null;
  used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function WorkshopCodesPage() {
  const [codes, setCodes] = useState<WorkshopCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    workshop_id: '',
    count: 10,
    email: '',
    name: '',
    expires_in_days: 30,
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workshop-codes');
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await fetch('/api/workshop-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCodes();
        // Reset form
        setFormData({
          workshop_id: '',
          count: 10,
          email: '',
          name: '',
          expires_in_days: 30,
        });
        alert(`${formData.count} code(s) généré(s) avec succès !`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Error generating codes:', error);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const exportCodes = () => {
    const csv = [
      ['Code', 'Workshop ID', 'Email', 'Name', 'Used', 'Expires At'].join(','),
      ...codes.map((code) =>
        [
          code.code,
          code.workshop_id,
          code.email || '',
          code.name || '',
          code.used ? 'Yes' : 'No',
          code.expires_at || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement des codes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Codes d'Atelier</h1>
        <p className="mt-2 text-base text-slate-600">
          Générez et gérez les codes d'accès pour les participants aux ateliers
        </p>
      </div>

      {/* Generate Codes Form */}
      <Card className="mb-8 border-white/80 bg-white/95">
        <CardHeader>
          <CardTitle>Générer de Nouveaux Codes</CardTitle>
          <CardDescription>Créez des codes d'accès pour les participants</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={generateCodes} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="workshop_id">
                  ID de l'Atelier <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workshop_id"
                  required
                  placeholder="session_1_opening"
                  value={formData.workshop_id}
                  onChange={(e) => setFormData({ ...formData, workshop_id: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="count">
                  Nombre de Codes <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="count"
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="participant@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Si fourni, le code sera lié à cet email
                </p>
              </div>

              <div>
                <Label htmlFor="name">Nom (optionnel)</Label>
                <Input
                  id="name"
                  placeholder="Nom du participant"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="expires_in_days">Expire dans (jours)</Label>
                <Input
                  id="expires_in_days"
                  type="number"
                  min="1"
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={generating}>
                {generating ? 'Génération...' : 'Générer les Codes'}
              </Button>
              {codes.length > 0 && (
                <Button type="button" variant="outline" onClick={exportCodes}>
                  📥 Exporter en CSV
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Codes List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Codes Générés ({codes.length})</h2>
          <div className="flex gap-2">
            <Badge variant="outline">
              Utilisés: {codes.filter((c) => c.used).length}
            </Badge>
            <Badge variant="outline">
              Disponibles: {codes.filter((c) => !c.used).length}
            </Badge>
          </div>
        </div>

        {codes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">Aucun code généré</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {codes.map((code) => (
              <Card
                key={code.id}
                className={`border-white/80 ${
                  code.used ? 'bg-slate-50' : 'bg-white/95'
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-mono text-lg">{code.code}</CardTitle>
                    {code.used ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        ✓ Utilisé
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        Disponible
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Atelier:</span>{' '}
                    <span className="text-slate-600">{code.workshop_id}</span>
                  </div>
                  {code.email && (
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      <span className="text-slate-600">{code.email}</span>
                    </div>
                  )}
                  {code.name && (
                    <div>
                      <span className="font-medium">Nom:</span>{' '}
                      <span className="text-slate-600">{code.name}</span>
                    </div>
                  )}
                  {code.used_at && (
                    <div>
                      <span className="font-medium">Utilisé le:</span>{' '}
                      <span className="text-slate-600">
                        {formatDateTime(code.used_at)}
                      </span>
                    </div>
                  )}
                  {code.expires_at && (
                    <div>
                      <span className="font-medium">Expire le:</span>{' '}
                      <span className="text-slate-600">
                        {formatDateTime(code.expires_at)}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    Créé {formatDateTime(code.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

