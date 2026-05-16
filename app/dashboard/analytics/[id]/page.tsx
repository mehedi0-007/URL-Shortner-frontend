'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import { getUrlAnalytics, type UrlAnalytics } from '@/lib/api';
import { ArrowLeft, Globe, BarChart3, Zap, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<UrlAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.push('/login');
      return;
    }
    const id = params?.id as string;
    if (!id) return;

    (async () => {
      try {
        const result = await getUrlAnalytics(id, token);
        setData(result);
      } catch (err: any) {
        toast(err.message || 'Failed to load analytics', 'error');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, token, params, router, toast]);

  const maxClicks = Math.max(...(data?.topCountries?.map((c) => c.clicks) || [1]), 1);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-24">
          <div className="skeleton h-8 w-48 mb-8 rounded" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] text-[#9090a8] hover:text-[#eeeef5] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-[28px] font-extrabold tracking-tight text-[#eeeef5]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            URL Analytics
          </h1>
          <p className="text-[13px] text-[#9090a8] mt-1">
            Performance overview for this short link
          </p>
        </div>

        {data ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card-elevated p-6 border-[#c8ff00]/15">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest">
                    Total Clicks
                  </span>
                  <BarChart3 size={16} className="text-[#c8ff00]" />
                </div>
                <div className="text-[48px] stat-number text-[#c8ff00]">
                  {data.totalClicks.toLocaleString()}
                </div>
              </div>

              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest">
                    Today's Clicks
                  </span>
                  <TrendingUp size={16} className="text-[#9090a8]" />
                </div>
                <div className="text-[48px] stat-number text-[#eeeef5]">
                  {data.todayClicks}
                </div>
              </div>

              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest">
                    Countries
                  </span>
                  <Globe size={16} className="text-[#9090a8]" />
                </div>
                <div className="text-[48px] stat-number text-[#eeeef5]">
                  {data.topCountries.length}
                </div>
              </div>
            </div>

            {/* Top countries */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
                <h2
                  className="text-[14px] font-bold text-[#eeeef5]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Top Countries
                </h2>
                <Globe size={16} className="text-[#5a5a72]" />
              </div>

              {data.topCountries.length === 0 ? (
                <div className="py-16 text-center">
                  <Globe size={28} className="text-[#1e1e2e] mx-auto mb-3" />
                  <p className="text-[13px] text-[#5a5a72]">No visitor data yet</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {data.topCountries.map((country, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-mono text-[#5a5a72] w-5 text-right">
                            {i + 1}
                          </span>
                          <span className="text-[14px] text-[#eeeef5]">
                            {country.country || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-mono text-[#9090a8]">
                            {country.clicks} clicks
                          </span>
                          <span className="text-[12px] font-mono text-[#5a5a72] w-10 text-right">
                            {maxClicks > 0
                              ? Math.round((country.clicks / maxClicks) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#c8ff00] rounded-full transition-all duration-700"
                          style={{
                            width: `${maxClicks > 0 ? (country.clicks / maxClicks) * 100 : 0}%`,
                            opacity: 1 - i * 0.12,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card py-20 text-center">
            <Zap size={28} className="text-[#1e1e2e] mx-auto mb-3" />
            <p className="text-[13px] text-[#5a5a72]">No analytics data available</p>
          </div>
        )}
      </main>
    </div>
  );
}
