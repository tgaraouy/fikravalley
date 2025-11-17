'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime } from '@/lib/utils';

interface AccessRequest {
  id: string;
  email: string;
  name: string;
  organization: string | null;
  user_type: string;
  reason: string;
  how_heard: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/access-requests?status=${activeTab === 'all' ? 'all' : activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/access-requests/${requestId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh requests
        fetchRequests();
        // TODO: Send approval email
      } else {
        alert('Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez fournir une raison de rejet');
      return;
    }

    try {
      const response = await fetch(`/api/access-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setRejectingId(null);
        setRejectionReason('');
        fetchRequests();
        // TODO: Send rejection email
      } else {
        alert('Erreur lors du rejet');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Erreur lors du rejet');
    }
  };

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      workshop_attendee: '🎫 Participant à l\'atelier',
      student: '🎓 Étudiant(e)',
      professional: '💼 Professionnel(le)',
      diaspora: '🌍 Diaspora',
      government: '🏛️ Fonctionnaire',
      entrepreneur: '🚀 Entrepreneur(e)',
      other: '📋 Autre',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    all: requests.length,
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement des demandes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Demandes d'Accès</h1>
        <p className="mt-2 text-base text-slate-600">
          Examinez et approuvez les demandes d'accès à la plateforme Fikra Labs
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            En Attente ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées ({counts.rejected})
          </TabsTrigger>
          <TabsTrigger value="all">
            Toutes ({counts.all})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">Aucune demande {activeTab === 'all' ? '' : activeTab}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-white/80 bg-white/95">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{request.name}</CardTitle>
                        <CardDescription>{request.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">{getUserTypeLabel(request.user_type)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {request.organization && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Organisation:</p>
                          <p className="text-sm text-slate-600">{request.organization}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-slate-700">Raison:</p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{request.reason}</p>
                      </div>

                      {request.how_heard && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Comment ils ont entendu parler de nous:</p>
                          <p className="text-sm text-slate-600">{request.how_heard}</p>
                        </div>
                      )}

                      {request.rejection_reason && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm font-medium text-red-900">Raison du rejet:</p>
                          <p className="text-sm text-red-800">{request.rejection_reason}</p>
                        </div>
                      )}

                      <p className="text-xs text-slate-500">
                        Demandé {formatRelativeTime(request.created_at)}
                        {request.reviewed_at && ` • Examiné ${formatRelativeTime(request.reviewed_at)}`}
                      </p>
                    </div>
                  </CardContent>
                  {request.status === 'pending' && (
                    <div className="px-6 pb-6 flex gap-3">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ✅ Approuver
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setRejectingId(request.id)}
                        className="flex-1"
                      >
                        ❌ Rejeter
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rejeter la Demande</CardTitle>
              <CardDescription>Fournissez une raison pour le rejet</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-lg"
                rows={4}
                placeholder="Raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </CardContent>
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(rejectingId)}
                className="flex-1"
              >
                Confirmer le Rejet
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

