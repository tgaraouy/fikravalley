/**
 * Follow-up Dashboard Component
 * 
 * Shows ideas that need follow-up contact
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContactSubmitter } from './ContactSubmitter';
import Link from 'next/link';

interface Idea {
  id: string;
  title: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'needs_work';
  total_score?: number;
  status: string;
  follow_up_status?: string;
  last_contacted_at?: string;
  next_follow_up_date?: string;
  contact_attempts?: number;
  created_at: string;
}

export function FollowUpDashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [filter, setFilter] = useState<'pending' | 'contacted' | 'all'>('pending');

  useEffect(() => {
    fetchIdeas();
  }, [filter]);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        filter: filter,
      });
      const response = await fetch(`/api/admin/follow-up?${params}`);
      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContacted = () => {
    fetchIdeas();
    setSelectedIdea(null);
  };

  const getPriorityColor = (tier?: string) => {
    switch (tier) {
      case 'exceptional': return 'bg-red-100 text-red-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'needs_work': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'responded': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'no_response': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const pendingIdeas = ideas.filter(i => i.follow_up_status === 'pending' || !i.follow_up_status);
  const contactedIdeas = ideas.filter(i => i.follow_up_status === 'contacted');
  const respondedIdeas = ideas.filter(i => i.follow_up_status === 'responded');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingIdeas.length}</div>
            <p className="text-xs text-slate-500">Idées nécessitant un contact</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contactées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactedIdeas.length}</div>
            <p className="text-xs text-slate-500">En attente de réponse</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ont répondu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respondedIdeas.length}</div>
            <p className="text-xs text-slate-500">Suivi en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideas.length}</div>
            <p className="text-xs text-slate-500">Idées à suivre</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          En attente ({pendingIdeas.length})
        </Button>
        <Button
          variant={filter === 'contacted' ? 'primary' : 'outline'}
          onClick={() => setFilter('contacted')}
          size="sm"
        >
          Contactées ({contactedIdeas.length})
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Toutes ({ideas.length})
        </Button>
      </div>

      {/* Ideas List */}
      {isLoading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Aucune idée nécessitant un suivi
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ideas List */}
          <div className="space-y-2">
            {ideas.map((idea) => (
              <Card
                key={idea.id}
                className={`cursor-pointer hover:border-indigo-400 transition-colors ${
                  selectedIdea?.id === idea.id ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
                onClick={() => setSelectedIdea(idea)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{idea.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {idea.submitter_name} • {idea.submitter_email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {idea.qualification_tier && (
                          <Badge className={getPriorityColor(idea.qualification_tier)}>
                            {idea.qualification_tier}
                          </Badge>
                        )}
                        {idea.follow_up_status && (
                          <Badge className={getStatusColor(idea.follow_up_status)}>
                            {idea.follow_up_status}
                          </Badge>
                        )}
                        {idea.total_score && (
                          <Badge variant="outline">
                            {idea.total_score}/40
                          </Badge>
                        )}
                      </div>
                      {idea.last_contacted_at && (
                        <p className="text-xs text-slate-500 mt-1">
                          Dernier contact: {new Date(idea.last_contacted_at).toLocaleDateString()}
                        </p>
                      )}
                      {idea.contact_attempts && idea.contact_attempts > 0 && (
                        <p className="text-xs text-slate-500">
                          Tentatives: {idea.contact_attempts}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Panel */}
          {selectedIdea && (
            <div className="sticky top-4">
              <ContactSubmitter
                idea={selectedIdea}
                onContacted={handleContacted}
              />
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/ideas/${selectedIdea.id}`} target="_blank">
                    <Button variant="outline" className="w-full" size="sm">
                      Voir l'idée
                    </Button>
                  </Link>
                  <Link href={`/admin/ideas/${selectedIdea.id}`}>
                    <Button variant="outline" className="w-full" size="sm">
                      Modifier
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

