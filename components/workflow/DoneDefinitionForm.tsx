/**
 * Done Definition Form (MVP Canvas)
 * Shared "Done" Definition signing
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DoneDefinitionFormProps {
  podId: string;
  onSign: (definition: { firstUser: string; successCriteria: string[] }) => void;
}

export default function DoneDefinitionForm({ podId, onSign }: DoneDefinitionFormProps) {
  const [firstUser, setFirstUser] = useState('');
  const [criteria, setCriteria] = useState(['', '', '']);

  const handleSubmit = () => {
    const successCriteria = criteria.filter(c => c.trim());
    if (!firstUser.trim() || successCriteria.length === 0) {
      alert('Remplis tous les champs requis');
      return;
    }
    onSign({ firstUser, successCriteria });
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-900">📋 Définition "Done" (MVP Canvas)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-blue-900 font-semibold">
            Qui est ton "Premier Utilisateur"?
          </Label>
          <p className="text-xs text-blue-700 mb-2">
            Exemple: "Quelqu'un en dehors de notre réseau qui utilise notre solution 2 fois"
          </p>
          <Input
            value={firstUser}
            onChange={(e) => setFirstUser(e.target.value)}
            placeholder="Quelqu'un en dehors de notre réseau qui..."
            className="bg-white"
          />
        </div>

        <div>
          <Label className="text-blue-900 font-semibold">
            Critères de Succès (3 minimum)
          </Label>
          <p className="text-xs text-blue-700 mb-2">
            Qu'est-ce qui définit le succès pour votre pod?
          </p>
          {criteria.map((criterion, i) => (
            <Input
              key={i}
              value={criterion}
              onChange={(e) => {
                const newCriteria = [...criteria];
                newCriteria[i] = e.target.value;
                setCriteria(newCriteria);
              }}
              placeholder={`Critère ${i + 1}...`}
              className="mb-2 bg-white"
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCriteria([...criteria, ''])}
            className="w-full"
          >
            + Ajouter un critère
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          ✅ Signer la Définition "Done"
        </Button>

        <p className="text-xs text-blue-600">
          💡 Tous les membres du pod doivent être d'accord sur cette définition avant de commencer.
        </p>
      </CardContent>
    </Card>
  );
}

