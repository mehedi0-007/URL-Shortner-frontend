'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import {
  getUserOverview,
  getUserUrls,
  createShortUrl,
  deleteUrl,
  extendUrl,
  regenerateUrl,
  type ShortUrl,
  type UserOverview,
} from '@/lib/api';
import {
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Clock,
  BarChart3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  LinkIcon,
  AlertCircle,
} from 'lucide-react';

const EXPIRY_OPTIONS = [
  { label: '1h', value: '1h' },
  { label: '2h', value: '2h' },
  { label: '6h', value: '6h' },
  { label: '12h', value: '12h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '168h' },
];


function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`card-elevated p-5 ${accent ? 'border-[#c8ff00]/20' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest">
          {label}
        </span>
        <div className={`text-[#9090a8] ${accent ? 'text-[#c8ff00]' : ''}`}>
          {icon}
        </div>
      </div>
      <div
        className={`text-[36px] stat-number ${accent ? 'text-[#c8ff00]' : 'text-[#eeeef5]'}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loadingData, setLoadingData] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newExpiry, setNewExpiry] = useState('2h');
  const [creating, setCreating] = useState(false);

  // Copied state per URL
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(
    async (page = 1) => {
      if (!token) return;
      setLoadingData(true);
      try {
        const [ov, ul] = await Promise.all([
          getUserOverview(token),
          getUserUrls(page, 10, token),
        ]);
        setOverview(ov);
        setUrls(ul.data);
        setPagination({
          page: ul.pagination.page,
          totalPages: ul.pagination.totalPages ?? 1,
        });
      } catch (err: any) {
        if (err.statusCode === 401) router.push('/login');
        else toast(err.message || 'Failed to load data', 'error');
      } finally {
        setLoadingData(false);
      }
    },
    [token, router, toast],
  );

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else fetchData();
    }
  }, [authLoading, user, fetchData, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newUrl.trim()) return;
    setCreating(true);
    try {
      await createShortUrl(newUrl.trim(), newExpiry, token);
      toast('Short URL created!', 'success');
      setNewUrl('');
      setShowCreate(false);
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to create URL', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (url: ShortUrl) => {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopiedId(url.id);
    toast('Copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this short URL?')) return;
    setActionLoading(id + '-del');
    try {
      await deleteUrl(id, token);
      toast('URL deleted', 'success');
      fetchData(pagination.page);
    } catch (err: any) {
      toast(err.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtend = async (id: string) => {
    if (!token) return;
    setActionLoading(id + '-ext');
    try {
      await extendUrl(id, token);
      toast('Extended by 24 hours', 'success');
      fetchData(pagination.page);
    } catch (err: any) {
      toast(err.message || 'Extend failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerate = async (id: string) => {
    if (!token) return;
    setActionLoading(id + '-reg');
    try {
      await regenerateUrl(id, token);
      toast('Short code regenerated', 'success');
      fetchData(pagination.page);
    } catch (err: any) {
      toast(err.message || 'Regenerate failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isExpired = (url: ShortUrl) => new Date(url.expiresAt) < new Date();

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 pt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-elevated p-5 h-24 skeleton" />
            ))}
          </div>
          <div className="card h-96 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-[28px] font-extrabold tracking-tight text-[#eeeef5]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dashboard
            </h1>
            <p className="text-[13px] text-[#9090a8] mt-0.5">
              Welcome back, {user?.name?.split(' ')[0]}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary"
          >
            <Plus size={15} />
            New URL
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div
            className="card p-5 mb-6 border-[#c8ff00]/15"
            style={{ animation: 'fade-up 0.3s ease forwards' }}
          >
            <h3
              className="text-[14px] font-bold text-[#eeeef5] mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Shorten a new URL
            </h3>
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://your-long-url.com/..."
                required
                autoFocus
                className="input flex-1"
              />
              <select
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="input w-auto border-[#1e1e2e] font-mono text-[13px] cursor-pointer"
              >
                {EXPIRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={14} /> Shorten
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total URLs" value={overview?.totalUrls ?? 0} icon={<LinkIcon size={16} />} />
          <StatCard label="Active" value={overview?.activeUrls ?? 0} icon={<TrendingUp size={16} />} accent />
          <StatCard label="Expired" value={overview?.expiredUrl ?? 0} icon={<AlertCircle size={16} />} />
          <StatCard label="Total Clicks" value={overview?.totalClicks ?? 0} icon={<BarChart3 size={16} />} />
        </div>

        {/* URL Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
            <h2
              className="text-[14px] font-bold text-[#eeeef5]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Your Links
            </h2>
            <span className="text-[12px] font-mono text-[#5a5a72]">
              {overview?.totalUrls ?? 0} total
            </span>
          </div>

          {urls.length === 0 ? (
            <div className="py-20 text-center">
              <LinkIcon size={32} className="text-[#1e1e2e] mx-auto mb-4" />
              <p className="text-[14px] text-[#5a5a72]">No short URLs yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-ghost mt-4 text-[13px]"
              >
                <Plus size={14} /> Create your first
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#1e1e2e]">
              {urls.map((url) => {
                const expired = isExpired(url);
                return (
                  <div
                    key={url.id}
                    className="px-5 py-4 flex items-center gap-4 hover:bg-[#0d0d12]/50 transition-colors group"
                  >
                    {/* Status dot */}
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${expired ? 'bg-[#ff4455]' : 'bg-[#00e887]'
                        }`}
                    />

                    {/* URLs */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/url/${url.shortcode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[14px] font-mono text-[#c8ff00] hover:underline"
                        >
                          {`${process.env.NEXT_PUBLIC_API_URL}/url/${url.shortcode}`}
                        </a>
                        <span
                          className={`badge ${expired ? 'badge-expired' : 'badge-active'}`}
                        >
                          {expired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#5a5a72] truncate max-w-[340px]">
                        {url.originalUrl}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="hidden md:flex items-center gap-5 text-[12px] text-[#5a5a72] shrink-0">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 size={12} />
                        {url.clicks}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatDate(url.expiresAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {/* Analytics */}
                      <Link
                        href={`/dashboard/analytics/${url.id}`}
                        className="p-2 rounded-lg text-[#9090a8] hover:text-[#c8ff00] hover:bg-[#141420] transition-all"
                        title="Analytics"
                      >
                        <BarChart3 size={15} />
                      </Link>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(url)}
                        className="p-2 rounded-lg text-[#9090a8] hover:text-[#eeeef5] hover:bg-[#141420] transition-all"
                        title="Copy"
                      >
                        {copiedId === url.id ? (
                          <Check size={15} className="text-[#00e887]" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>

                      {/* Open */}
                      <a
                        href={`${process.env.URL_API}url/${url.shortUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-[#9090a8] hover:text-[#eeeef5] hover:bg-[#141420] transition-all"
                        title="Open"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* Extend */}
                      <button
                        onClick={() => handleExtend(url.id)}
                        disabled={actionLoading === url.id + '-ext'}
                        className="p-2 rounded-lg text-[#9090a8] hover:text-[#c8ff00] hover:bg-[#141420] transition-all"
                        title="Extend 24h"
                      >
                        {actionLoading === url.id + '-ext' ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Clock size={15} />
                        )}
                      </button>

                      {/* Regenerate */}
                      <button
                        onClick={() => handleRegenerate(url.id)}
                        disabled={actionLoading === url.id + '-reg'}
                        className="p-2 rounded-lg text-[#9090a8] hover:text-[#eeeef5] hover:bg-[#141420] transition-all"
                        title="Regenerate code"
                      >
                        {actionLoading === url.id + '-reg' ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <RefreshCw size={15} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(url.id)}
                        disabled={actionLoading === url.id + '-del'}
                        className="p-2 rounded-lg text-[#9090a8] hover:text-[#ff4455] hover:bg-[#141420] transition-all"
                        title="Delete"
                      >
                        {actionLoading === url.id + '-del' ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-4 border-t border-[#1e1e2e] flex items-center justify-between">
              <span className="text-[12px] font-mono text-[#5a5a72]">
                Page {pagination.page} of {pagination.totalPages}
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
                  disabled={pagination.page === pagination.totalPages}
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
