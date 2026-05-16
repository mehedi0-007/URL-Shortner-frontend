'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import { getAdminOverview, getAdminUsers, type AdminOverview } from '@/lib/api';
import { Users, LinkIcon, BarChart3, TrendingUp, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  urlsCreated: number;
};

function AdminStat({ label, value, sub, subValue, icon }: {
  label: string; value: number; sub?: string; subValue?: number; icon: React.ReactNode
}) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest">{label}</span>
        <div className="text-[#9090a8]">{icon}</div>
      </div>
      <div className="text-[40px] stat-number text-[#eeeef5] mb-1">{value.toLocaleString()}</div>
      {sub && (
        <div className="flex items-center gap-1.5 text-[12px]">
          <TrendingUp size={11} className="text-[#c8ff00]" />
          <span className="text-[#c8ff00] font-mono">+{subValue}</span>
          <span className="text-[#5a5a72]">{sub}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPage: 1 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const [ov, ul] = await Promise.all([
        getAdminOverview(token),
        getAdminUsers(page, 15, token),
      ]);
      setOverview(ov);
      setUsers(ul.data as unknown as AdminUser[]);
      setPagination(ul.pagination);
    } catch (err: any) {
      if (err.statusCode === 401 || err.statusCode === 403) router.push('/dashboard');
      else toast(err.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, router, toast]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/login'); return; }
      if (user.role !== 'admin') { router.push('/dashboard'); return; }
      fetchData();
    }
  }, [authLoading, user, fetchData, router]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-24">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
          <div className="skeleton h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
            <Shield size={16} className="text-[#c8ff00]" />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#eeeef5]" style={{ fontFamily: 'var(--font-display)' }}>
              Admin Panel
            </h1>
            <p className="text-[13px] text-[#9090a8]">Platform-wide overview</p>
          </div>
        </div>

        {/* Stats grid */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <AdminStat label="Total Users" value={overview.totalUsers} sub="today" subValue={overview.usersToday} icon={<Users size={16} />} />
            <AdminStat label="Total URLs" value={overview.totalUrls} sub="today" subValue={overview.urlsToday} icon={<LinkIcon size={16} />} />
            <AdminStat label="Total Clicks" value={overview.totalClicks} sub="today" subValue={overview.clicksToday} icon={<BarChart3 size={16} />} />
          </div>
        )}

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-[#eeeef5]" style={{ fontFamily: 'var(--font-display)' }}>
              All Users
            </h2>
            <span className="text-[12px] font-mono text-[#5a5a72]">{overview?.totalUsers ?? 0} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  {['User', 'Email', 'Joined', 'URLs'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#0d0d12]/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1e1e2e] flex items-center justify-center text-[11px] font-bold text-[#9090a8]">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[14px] text-[#eeeef5]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#9090a8] font-mono">{u.email}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#5a5a72]">{formatDate(u.joinedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-mono">
                        <LinkIcon size={11} className="text-[#5a5a72]" />
                        <span className="text-[#eeeef5]">{u.urlsCreated}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPage > 1 && (
            <div className="px-5 py-4 border-t border-[#1e1e2e] flex items-center justify-between">
              <span className="text-[12px] font-mono text-[#5a5a72]">
                Page {pagination.page} of {pagination.totalPage}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchData(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-ghost py-1.5 px-2 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => fetchData(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPage}
                  className="btn-ghost py-1.5 px-2 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
