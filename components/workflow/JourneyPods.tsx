/**
 * Journey Pods Component
 * 
 * Geographic proximity-based pods (same city)
 * - Shared "Done" Definition (MVP Canvas)
 * - Pre-mortem Week 0
 * - Only visible when user completes Step 1 solo (>50%)
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  createPod, 
  signDoneDefinition, 
  logPreMortem, 
  findNearbyPods,
  canJoinPod,
  type Pod 
} from '@/lib/workflow/journey-pods';
import { getTaskSuccessRate } from '@/lib/workflow/think-time-ux';

interface JourneyPodsProps {
  userId: string;
  userCity: string;
  step1CompletionRate: number;
}

export default function JourneyPods({ userId, userCity, step1CompletionRate }: JourneyPodsProps) {
  const [pods, setPods] = useState<Pod[]>([]);
  const [canJoin, setCanJoin] = useState(false);
  const [showCreatePod, setShowCreatePod] = useState(false);
  const [newPodName, setNewPodName] = useState('');

  useEffect(() => {
    // Check if user can join pods
    const eligible = canJoinPod(userId, step1CompletionRate);
    setCanJoin(eligible);
    
    if (eligible) {
      // Find nearby pods (same city)
      // In production, fetch from API
      const nearby = findNearbyPods(userCity, []); // TODO: Fetch from API
      setPods(nearby);
    }
  }, [userId, userCity, step1CompletionRate]);

  const handleCreatePod = () => {
    if (!newPodName.trim()) return;
    
    const pod = createPod(userId, userCity, newPodName);
    // In production, save to API
    setPods([...pods, pod]);
    setShowCreatePod(false);
    setNewPodName('');
  };

  if (!canJoin) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            💡 Complète d'abord l'étape 1 seul(e) avec un taux de réussite {'>'}50% pour débloquer les Pods.
            <br />
            <span className="font-semibold">Ton taux actuel: {Math.round(step1CompletionRate * 100)}%</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>👥</span>
          <span>Journey Pods</span>
          <Badge variant="outline" className="ml-auto">
            {pods.length} pods disponibles à {userCity}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Pod */}
        <Dialog open={showCreatePod} onOpenChange={setShowCreatePod}>
          <DialogTrigger>
            <Button className="w-full bg-terracotta-600 hover:bg-terracotta-700">
              ➕ Créer un Pod
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Journey Pod</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du Pod
                </label>
                <input
                  type="text"
                  value={newPodName}
                  onChange={(e) => setNewPodName(e.target.value)}
                  placeholder="Ex: Pod Casa Santé"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <p className="text-xs text-slate-600">
                Un Pod est un groupe de 2-5 personnes de {userCity} qui travaillent ensemble sur leurs idées.
              </p>
              <Button onClick={handleCreatePod} className="w-full">
                Créer le Pod
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Available Pods */}
        {pods.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-4">
            Aucun pod disponible pour le moment. Crée le premier!
          </p>
        ) : (
          <div className="space-y-2">
            {pods.map((pod) => (
              <Card key={pod.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{pod.name}</h4>
                    <Badge variant="outline">
                      {pod.members.length}/5 membres
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    {pod.city} • {pod.status === 'active' ? 'Actif' : 'En formation'}
                  </p>
                  {pod.doneDefinition && (
                    <div className="text-xs bg-green-50 p-2 rounded mb-2">
                      ✅ Définition "Done" signée: {pod.doneDefinition.firstUser}
                    </div>
                  )}
                  {pod.preMortem && (
                    <div className="text-xs bg-blue-50 p-2 rounded mb-2">
                      📋 Pre-mortem: {pod.preMortem.blockers.length} risques identifiés
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Rejoindre
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <strong>💡 Comment ça marche:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Pods de 2-5 personnes de la même ville</li>
            <li>Définissez ensemble votre "Done" (MVP Canvas)</li>
            <li>Faites un pre-mortem: "Qu'est-ce qui nous fera échouer?"</li>
            <li>Complétez des sprints ensemble</li>
            <li>Débloquez l'université quand {'>'}50% de complétion</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

