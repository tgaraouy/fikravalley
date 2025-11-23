/**
 * Admin Dashboard
 * 
 * Comprehensive admin interface for idea bank management
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { OverviewStats } from '@/components/admin/OverviewStats';
import { IdeaManagement } from '@/components/admin/IdeaManagement';
import { ReceiptVerification } from '@/components/admin/ReceiptVerification';
import { UserManagement } from '@/components/admin/UserManagement';
import { MentorMatching } from '@/components/admin/MentorMatching';
import { Reports } from '@/components/admin/Reports';
import { Settings } from '@/components/admin/Settings';
import { AuditLog } from '@/components/admin/AuditLog';
import { FollowUpDashboard } from '@/components/admin/FollowUpDashboard';

type Tab = 
  | 'overview' 
  | 'ideas' 
  | 'followup'
  | 'receipts' 
  | 'users' 
  | 'mentors' 
  | 'reports' 
  | 'settings' 
  | 'audit';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user?.role === 'admin') {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            router.push('/admin/login');
          }
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ideas', label: 'Ideas', icon: '💡' },
    { id: 'followup', label: 'Follow-up', icon: '📧' },
    { id: 'receipts', label: 'Receipts', icon: '📝' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'mentors', label: 'Mentors', icon: '🎓' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'audit', label: 'Audit Log', icon: '📋' },
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-12 sm:h-14">
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo href="/" size="sm" showText={false} />
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Admin</h1>
              <span className="text-xs text-slate-500 hidden sm:inline">Fikra Valley</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-slate-600 truncate max-w-[100px] sm:max-w-none">
                {user?.email || 'Admin'}
              </span>
              <button
                onClick={async () => {
                  await fetch('/api/admin/logout', { method: 'POST' });
                  router.push('/admin/login');
                }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="h-full">
          {activeTab === 'overview' && <OverviewStats />}
          {activeTab === 'ideas' && <IdeaManagement />}
          {activeTab === 'followup' && <FollowUpDashboard />}
          {activeTab === 'receipts' && <ReceiptVerification />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'mentors' && <MentorMatching />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'audit' && <AuditLog />}
        </div>
      </main>
    </div>
  );
}

