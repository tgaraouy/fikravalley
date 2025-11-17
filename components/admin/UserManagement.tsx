/**
 * User Management Component
 * 
 * User list with actions
 */

'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  ideas_count: number;
  receipts_count: number;
  upvotes_count: number;
  last_active: string;
  banned: boolean;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async (userId: string, ban: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      alert('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ideas</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 capitalize">{user.role}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.ideas_count}</td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBan(user.id, !user.banned)}
                        className={`text-sm font-medium ${
                          user.banned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                        }`}
                      >
                        {user.banned ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        View History
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                History: {selectedUser.name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <strong>Ideas Submitted:</strong> {selectedUser.ideas_count}
              </div>
              <div>
                <strong>Receipts:</strong> {selectedUser.receipts_count}
              </div>
              <div>
                <strong>Upvotes Given:</strong> {selectedUser.upvotes_count}
              </div>
              <div>
                <strong>Last Active:</strong>{' '}
                {new Date(selectedUser.last_active).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

