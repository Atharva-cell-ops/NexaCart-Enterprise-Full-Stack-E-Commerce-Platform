import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShieldCheck, ShoppingBag, Mail, Phone, Calendar } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Badge } from '../../components/common/Badge';

export const AdminUsersPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers(),
  });

  const users = data?.users || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Customer & Account Directory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registered accounts, customer lifetime purchase volumes, and access permissions.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-bold uppercase text-[10px] bg-slate-900/40">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3">Orders Placed</th>
                <th className="py-3.5 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users registered in system.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs border border-slate-700">
                          {u.firstName?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-white">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{u.phoneNumber || '—'}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
                        {u.orderCount || 0} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
