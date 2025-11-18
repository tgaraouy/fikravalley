'use client';

/**
 * Privacy Compliance Monitoring Dashboard
 * 
 * Admin-only dashboard for monitoring GDPR/Morocco Law compliance
 * Requires privacy_officer permission
 */

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';

/**
 * Compliance metrics
 */
interface ComplianceMetrics {
  totalUsers: number;
  usersWithConsent: number;
  pendingDeletions: number;
  retentionBreakdown: {
    expired: number;
    expires30Days: number;
    expires90Days: number;
    expires180Days: number;
    expiresLater: number;
  };
  withdrawalRate: number;
  exportRequests: number;
  deletionRequests: number;
  avgRetentionDays: number;
  expiredNotDeleted: number;
  complianceScore: number;
}

/**
 * Compliance alert
 */
interface ComplianceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  count?: number;
  actionRequired: boolean;
  createdAt: string;
}

/**
 * User rights data
 */
interface UserRightsData {
  pending: {
    deletions: Array<{
      id: string;
      userId: string;
      type: string;
      requestedAt: string;
      daysPending: number;
      onTrack: boolean;
    }>;
    exports: Array<{
      id: string;
      userId: string;
      type: string;
      requestedAt: string;
      daysPending: number;
      onTrack: boolean;
    }>;
  };
  overdue: {
    deletions: number;
    exports: number;
  };
  averageFulfillmentTime: {
    deletions: number;
    exports: number;
  };
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [userRights, setUserRights] = useState<UserRightsData | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchComplianceData();
    const interval = setInterval(fetchComplianceData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);

      // Fetch metrics
      const metricsRes = await fetch('/api/admin/compliance/metrics');
      if (metricsRes.status === 401) {
        setUnauthorized(true);
        return;
      }
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.metrics);
      setTrends(metricsData.trends);

      // Fetch alerts
      const alertsRes = await fetch('/api/admin/compliance/alerts');
      const alertsData = await alertsRes.json();
      setAlerts(alertsData.alerts || []);

      // Fetch user rights
      const rightsRes = await fetch('/api/admin/compliance/user-rights');
      const rightsData = await rightsRes.json();
      setUserRights(rightsData);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm('Supprimer toutes les données expirées ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/compliance/batch-delete', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Suppression en cours...');
        await fetchComplianceData();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting expired data:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/compliance/export?format=${format}`);
      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Erreur lors de l\'export');
    }
  };

  if (unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous devez avoir le rôle "privacy_officer" pour accéder à ce tableau de bord.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Chargement des données de conformité...</div>
      </div>
    );
  }

  // Prepare chart data
  const retentionData = [
    { name: 'Expiré', value: metrics.retentionBreakdown.expired },
    { name: '30 jours', value: metrics.retentionBreakdown.expires30Days },
    { name: '90 jours', value: metrics.retentionBreakdown.expires90Days },
    { name: '180 jours', value: metrics.retentionBreakdown.expires180Days },
    { name: 'Plus tard', value: metrics.retentionBreakdown.expiresLater },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de Bord de Conformité</h1>
          <p className="text-slate-600 mt-1">Surveillance GDPR / Loi 09-08</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExportReport('pdf')}>
            Exporter PDF
          </Button>
          <Button variant="secondary" onClick={() => handleExportReport('csv')}>
            Exporter CSV
          </Button>
          <Button variant="secondary" onClick={fetchComplianceData}>
            Actualiser
          </Button>
        </div>
      </div>

      {/* Compliance Score */}
      <Card className={`border-2 ${
        metrics.complianceScore >= 90 ? 'border-green-500' :
        metrics.complianceScore >= 70 ? 'border-yellow-500' :
        'border-red-500'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Score de Conformité</h2>
              <p className="text-slate-600">Basé sur les métriques de conformité</p>
            </div>
            <div className="text-6xl font-bold">
              {metrics.complianceScore}
              <span className="text-2xl text-slate-500">/100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-2">Utilisateurs totaux</p>
            <p className="text-3xl font-bold">{metrics.totalUsers}</p>
            <p className="text-xs text-slate-500 mt-1">Utilisateurs actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-2">Avec consentement</p>
            <p className="text-3xl font-bold">{metrics.usersWithConsent}</p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.totalUsers > 0
                ? `${Math.round((metrics.usersWithConsent / metrics.totalUsers) * 100)}% des utilisateurs`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-2">Suppressions en attente</p>
            <p className="text-3xl font-bold">{metrics.pendingDeletions}</p>
            <p className="text-xs text-slate-500 mt-1">Demandes de suppression</p>
          </CardContent>
        </Card>
        <Card className={metrics.expiredNotDeleted > 0 ? 'border-red-500' : ''}>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-2">Données expirées</p>
            <p className="text-3xl font-bold text-red-600">{metrics.expiredNotDeleted}</p>
            <p className="text-xs text-slate-500 mt-1">Non supprimées</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>Alertes de Conformité</CardTitle>
            <CardDescription>Actions requises ou à surveiller</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.severity === 'high'
                      ? 'border-red-500 bg-red-50'
                      : alert.severity === 'medium'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                    {alert.count && (
                      <Badge className="ml-2">{alert.count}</Badge>
                    )}
                  </div>
                  {alert.actionRequired && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        if (alert.id === 'expired-data') {
                          handleBatchDelete();
                        }
                      }}
                    >
                      Agir
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition de la Conservation</CardTitle>
            <CardDescription>Données par période d'expiration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={retentionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {retentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consent Rates Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de Consentement</CardTitle>
            <CardDescription>Évolution sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends?.consentRates || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Taux de consentement (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Privacy Requests Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de Confidentialité</CardTitle>
            <CardDescription>Tendances sur 30 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends?.privacyRequests || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="exports" fill="#3b82f6" name="Exports" />
                <Bar dataKey="deletions" fill="#ef4444" name="Suppressions" />
                <Bar dataKey="withdrawals" fill="#f59e0b" name="Retraits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Rights Fulfillment */}
        <Card>
          <CardHeader>
            <CardTitle>Respect des Droits Utilisateurs</CardTitle>
            <CardDescription>Temps de traitement moyen</CardDescription>
          </CardHeader>
          <CardContent>
            {userRights && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Temps moyen de traitement</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-2xl font-bold">{userRights.averageFulfillmentTime.deletions}</p>
                      <p className="text-xs text-slate-500">jours (suppressions)</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userRights.averageFulfillmentTime.exports}</p>
                      <p className="text-xs text-slate-500">jours (exports)</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Demandes en retard</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{userRights.overdue.deletions}</p>
                      <p className="text-xs text-slate-500">suppressions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{userRights.overdue.exports}</p>
                      <p className="text-xs text-slate-500">exports</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taux de Retrait</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(metrics.withdrawalRate * 100)}%</p>
            <p className="text-sm text-slate-600">Consentements retirés (30 jours)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demandes d'Export</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.exportRequests}</p>
            <p className="text-sm text-slate-600">Derniers 30 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conservation Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.avgRetentionDays}</p>
            <p className="text-sm text-slate-600">jours</p>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents de Confidentialité</CardTitle>
          <CardDescription>Suivi des violations et incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Incidents actifs</span>
              <Badge className="bg-red-100 text-red-800">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Notifications en attente</span>
              <Badge className="bg-yellow-100 text-yellow-800">0</Badge>
            </div>
            <Button
              variant="secondary"
              onClick={() => alert('Fonctionnalité à venir - Créer un incident')}
            >
              Créer un incident
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Opérations par Lot</CardTitle>
          <CardDescription>Actions administratives en masse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={handleBatchDelete}
              disabled={metrics.expiredNotDeleted === 0}
            >
              Supprimer données expirées ({metrics.expiredNotDeleted})
            </Button>
            <Button
              variant="secondary"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Re-demander consentements expirés
            </Button>
            <Button
              variant="secondary"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Notifier changement de politique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

