/**
 * Pre-Mortem Form (Week 0)
 * "What will make us fail?"
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PreMortemFormProps {
  podId: string;
  onLog: (preMortem: { blockers: string[]; risks: string[]; mitigation: string[] }) => void;
}

export default function PreMortemForm({ podId, onLog }: PreMortemFormProps) {
  const [blockers, setBlockers] = useState(['']);
  const [risks, setRisks] = useState(['']);
  const [mitigation, setMitigation] = useState(['']);

  const handleSubmit = () => {
    const blockersList = blockers.filter(b => b.trim());
    const risksList = risks.filter(r => r.trim());
    const mitigationList = mitigation.filter(m => m.trim());

    if (blockersList.length === 0 || risksList.length === 0) {
      alert('Identifie au moins un blocker et un risque');
      return;
    }

    onLog({
      blockers: blockersList,
      risks: risksList,
      mitigation: mitigationList
    });
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">⚠️ Pre-Mortem (Semaine 0)</CardTitle>
        <p className="text-sm text-orange-700">
          "Qu'est-ce qui nous fera échouer?" - Identifiez les risques AVANT de commencer
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-orange-900 font-semibold">
            Blockers (Ce qui nous empêchera de progresser)
          </Label>
          {blockers.map((blocker, i) => (
            <Textarea
              key={i}
              value={blocker}
              onChange={(e) => {
                const newBlockers = [...blockers];
                newBlockers[i] = e.target.value;
                setBlockers(newBlockers);
              }}
              placeholder={`Blocker ${i + 1}...`}
              className="mb-2 bg-white"
              rows={2}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBlockers([...blockers, ''])}
            className="w-full"
          >
            + Ajouter un blocker
          </Button>
        </div>

        <div>
          <Label className="text-orange-900 font-semibold">
            Risques (Ce qui pourrait mal tourner)
          </Label>
          {risks.map((risk, i) => (
            <Textarea
              key={i}
              value={risk}
              onChange={(e) => {
                const newRisks = [...risks];
                newRisks[i] = e.target.value;
                setRisks(newRisks);
              }}
              placeholder={`Risque ${i + 1}...`}
              className="mb-2 bg-white"
              rows={2}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRisks([...risks, ''])}
            className="w-full"
          >
            + Ajouter un risque
          </Button>
        </div>

        <div>
          <Label className="text-orange-900 font-semibold">
            Mitigation (Comment on prévient ces risques)
          </Label>
          {mitigation.map((mit, i) => (
            <Textarea
              key={i}
              value={mit}
              onChange={(e) => {
                const newMitigation = [...mitigation];
                newMitigation[i] = e.target.value;
                setMitigation(newMitigation);
              }}
              placeholder={`Mitigation ${i + 1}...`}
              className="mb-2 bg-white"
              rows={2}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMitigation([...mitigation, ''])}
            className="w-full"
          >
            + Ajouter une mitigation
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          📋 Enregistrer le Pre-Mortem
        </Button>

        <p className="text-xs text-orange-600">
          💡 Cette analyse vous aidera à identifier les problèmes AVANT qu'ils n'arrivent.
        </p>
      </CardContent>
    </Card>
  );
}

