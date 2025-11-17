'use client';

/**
 * Admin Secure Users Dashboard
 * 
 * Privacy-first admin dashboard for managing user data with:
 * - Masked PII in list view
 * - Password re-entry for detail view
 * - Full access logging
 * - GDPR compliance features
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

/**
 * User data (masked)
 */
interface MaskedUser {
  id: string;
  maskedPhone: string;
  anonymousEmail: string;
  submissionCount: number;
  consentStatus: Record<string, boolean>;
  dataRetentionExpiry: string;
  createdAt: string;
  lastActivity: string | null;
}

/**
 * User detail (decrypted - requires password)
 */
interface UserDetail {
  id: string;
  name: string;
  phone: string;
  anonymousEmail: string;
  submissionCount: number;
  consentHistory: Array<{
    id: string;
    consentType: string;
    granted: boolean;
    consentVersion: string;
    consentMethod: string;
    createdAt: string;
  }>;
  accessLogs: Array<{
    id: string;
    adminId: string;
    action: string;
    reason: string;
    timestamp: string;
  }>;
  dataRetentionExpiry: string;
}

export default function AdminSecureUsersPage() {
  const [users, setUsers] = useState<MaskedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [accessReason, setAccessReason] = useState('');
  const [redactionMode, setRedactionMode] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout: 15 minutes
  const SESSION_TIMEOUT = 15 * 60 * 1000;

  // Check session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        setSessionExpired(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, SESSION_TIMEOUT]);

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setSessionExpired(false);
  }, []);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        if (response.status === 401) {
          setSessionExpired(true);
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle user detail view (requires password)
  const handleViewUserDetail = async (userId: string) => {
    if (!password) {
      setPasswordError('Password required');
      return;
    }

    if (!accessReason.trim()) {
      setPasswordError('Access reason required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          reason: accessReason,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError('Invalid password or unauthorized');
          return;
        }
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUserDetail(data);
      setPasswordDialogOpen(false);
      setPassword('');
      setAccessReason('');
      updateActivity();
    } catch (error) {
      console.error('Error fetching user details:', error);
      setPasswordError('Failed to load user details');
    }
  };

  // Handle extend retention
  const handleExtendRetention = async (userId: string, days: number, reason: string) => {
    if (!reason.trim()) {
      alert('Reason required for extending retention');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/retention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend retention');
      }

      await fetchUsers();
      alert('Data retention extended successfully');
      updateActivity();
    } catch (error) {
      console.error('Error extending retention:', error);
      alert('Failed to extend retention');
    }
  };

  // Handle delete user data
  const handleDeleteUser = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Reason required for deletion');
      return;
    }

    if (!confirm('Are you sure you want to delete this user\'s data? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user data');
      }

      await fetchUsers();
      setUserDetail(null);
      alert('User data deleted successfully');
      updateActivity();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user data');
    }
  };

  // Handle export user data
  const handleExportUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/export`);
      if (!response.ok) {
        throw new Error('Failed to export user data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      updateActivity();
    } catch (error) {
      console.error('Error exporting user data:', error);
      alert('Failed to export user data');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get consent badge
  const getConsentBadge = (consentStatus: Record<string, boolean>) => {
    const hasSubmission = consentStatus.submission === true;
    const hasMarketing = consentStatus.marketing === true;
    const hasAnalysis = consentStatus.analysis === true;

    if (hasSubmission && hasAnalysis) {
      return <Badge className="bg-green-100 text-green-800">Full Consent</Badge>;
    } else if (hasSubmission) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">No Consent</Badge>;
    }
  };

  if (sessionExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Your session has expired due to inactivity. Please log in again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/admin/dashboard'}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6" onClick={updateActivity} onKeyDown={updateActivity}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Secure User Management</h1>
          <p className="text-slate-600 mt-1">Privacy-first user data management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={redactionMode ? 'primary' : 'secondary'}
            onClick={() => setRedactionMode(!redactionMode)}
          >
            {redactionMode ? '🔒 Redaction Mode ON' : '🔓 Redaction Mode OFF'}
          </Button>
          <Button variant="secondary" onClick={fetchUsers}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Privacy Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-900">Privacy Notice</p>
              <p className="text-sm text-amber-800 mt-1">
                All access to sensitive data is logged. Never share or export decrypted data outside secure channels.
                Session timeout: 15 minutes of inactivity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>Masked user data - click to view details (requires password)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">User ID</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Submissions</th>
                    <th className="text-left p-2">Consent</th>
                    <th className="text-left p-2">Retention Expiry</th>
                    <th className="text-left p-2">Last Activity</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-mono text-xs">{user.id.substring(0, 8)}...</td>
                      <td className="p-2">{redactionMode ? '****' : user.maskedPhone}</td>
                      <td className="p-2">{user.submissionCount}</td>
                      <td className="p-2">{getConsentBadge(user.consentStatus)}</td>
                      <td className="p-2">{formatDate(user.dataRetentionExpiry)}</td>
                      <td className="p-2">
                        {user.lastActivity ? formatDate(user.lastActivity) : 'Never'}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setPasswordDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Dialog for Detail View */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access User Details</DialogTitle>
            <DialogDescription>
              Password and access reason required to view sensitive data. This access will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={passwordError ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="reason">Access Reason *</Label>
              <Textarea
                id="reason"
                value={accessReason}
                onChange={(e) => {
                  setAccessReason(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Why do you need to access this user's data?"
                rows={3}
                className={passwordError ? 'border-red-500' : ''}
              />
              <p className="text-xs text-slate-500 mt-1">
                This reason will be logged and visible to the user for transparency.
              </p>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedUserId && handleViewUserDetail(selectedUserId)}
                disabled={!password || !accessReason.trim()}
              >
                Access Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail View */}
      {userDetail && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Decrypted user data - Access logged</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setUserDetail(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-slate-700">{redactionMode ? '***' : userDetail.name}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-slate-700">{redactionMode ? '***' : userDetail.phone}</p>
                </div>
                <div>
                  <Label>Anonymous Email</Label>
                  <p className="text-slate-700 font-mono text-xs">{userDetail.anonymousEmail}</p>
                </div>
                <div>
                  <Label>Submissions</Label>
                  <p className="text-slate-700">{userDetail.submissionCount}</p>
                </div>
              </div>
            </div>

            {/* Consent History */}
            <div>
              <h3 className="font-semibold mb-2">Consent History</h3>
              <div className="space-y-2">
                {userDetail.consentHistory.map((consent) => (
                  <div key={consent.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{consent.consentType}</span>
                        <Badge className={consent.granted ? 'bg-green-100' : 'bg-red-100'} style={{ marginLeft: '0.5rem' }}>
                          {consent.granted ? 'Granted' : 'Withdrawn'}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(consent.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Version: {consent.consentVersion} | Method: {consent.consentMethod}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Access Logs */}
            <div>
              <h3 className="font-semibold mb-2">Access Log (Transparency)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userDetail.accessLogs.map((log) => (
                  <div key={log.id} className="border rounded p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-slate-500">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="text-slate-600 mt-1">Reason: {log.reason}</p>
                    <p className="text-slate-500">By: {log.adminId}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-semibold mb-2">Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleExtendRetention(userDetail.id, 30, prompt('Reason for extension:') || '')}
                >
                  Extend Retention (+30 days)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleExportUser(userDetail.id)}
                >
                  Export Data (GDPR)
                </Button>
                <Button
                  variant="secondary"
                  className="bg-red-50 text-red-700 hover:bg-red-100"
                  onClick={() => handleDeleteUser(userDetail.id, prompt('Reason for deletion:') || '')}
                >
                  Delete User Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

