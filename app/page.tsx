'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createShortUrl } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import { ArrowRight, Copy, Check, Zap, BarChart3, Shield, Clock } from 'lucide-react';

const EXPIRY_OPTIONS = [
  { label: '1 Hour', value: '1h' },
  { label: '2 Hours', value: '2h' },
  { label: '6 Hours', value: '6h' },
  { label: '12 Hours', value: '12h' },
  { label: '1 Day', value: '24h' },
  { label: '7 Days', value: '168h' },
];

export default function HomePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [url, setUrl] = useState('');
  const [expiry, setExpiry] = useState('2h');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      router.push('/login');
      return;
    }
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await createShortUrl(url.trim(), expiry, token);
      setResult(data.data);
      toast('Short URL created!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to shorten URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050508] grid-pattern">
      <Navbar />

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c8ff00]/20 bg-[#c8ff00]/5 text-[#c8ff00] text-[12px] font-mono mb-8"
            style={{ animation: 'fade-in 0.5s ease forwards' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
            v1.0 — Now with geo-analytics
          </div>

          {/* Headline */}
          <h1
            className="text-[64px] leading-[1.02] font-extrabold tracking-[-0.04em] text-[#eeeef5] mb-6"
            style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s', animation: 'fade-up 0.6s ease both' }}
          >
            Shorten links.
            <br />
            <span className="text-[#c8ff00] accent-glow-text">Track everything.</span>
          </h1>

          <p
            className="text-[17px] text-[#9090a8] mb-12 max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: '0.2s', animation: 'fade-up 0.6s ease both' }}
          >
            A precise URL shortener with visitor analytics, geo-tracking, and expiration control.
          </p>

          {/* Shortener form */}
          <div
            className="card p-2 mb-4 shadow-2xl border-[#1e1e2e]"
            style={{ animationDelay: '0.3s', animation: 'fade-up 0.6s ease both' }}
          >
            <form onSubmit={handleShorten} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-very-long-url.com/path/to/page"
                className="input w-auto border-transparent bg-transparent flex-1 text-[14px] py-3"
                required
              />
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="input_url w-auto border-[#1e1e2e] bg-[#0d0d12] text-[13px] py-3 pr-8 cursor-pointer"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary shrink-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Shortening
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap size={14} />
                    Shorten
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Auth hint */}
          {!user && (
            <p className="text-[13px] text-[#5a5a72]" style={{ animationDelay: '0.35s', animation: 'fade-in 0.5s ease both' }}>
              <Link href="/login" className="text-[#c8ff00] hover:underline">Sign in</Link>
              {' '}to shorten URLs and track analytics.{' '}
              <Link href="/register" className="text-[#9090a8] hover:text-[#eeeef5]">Create account →</Link>
            </p>
          )}

          {/* Result */}
          {result && (
            <div
              className="mt-4 p-4 rounded-xl border border-[#c8ff00]/20 bg-[#c8ff00]/5 flex items-center justify-between gap-3"
              style={{ animation: 'fade-up 0.3s ease forwards' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#c8ff00] shrink-0 animate-pulse" />
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c8ff00] font-mono text-[14px] hover:underline truncate"
                >
                  {result}
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={copy} className="btn-ghost py-1.5 px-3 text-[12px]">
                  {copied ? <Check size={14} className="text-[#00e887]" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                {user && (
                  <Link href="/dashboard" className="btn-ghost py-1.5 px-3 text-[12px]">
                    <BarChart3 size={14} />
                    Analytics
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ animationDelay: '0.5s', animation: 'fade-up 0.6s ease both' }}
        >
          {[
            {
              icon: <BarChart3 size={20} />,
              title: 'Geo Analytics',
              desc: 'Track visitor countries, cities, and click patterns with precision.',
            },
            {
              icon: <Clock size={20} />,
              title: 'Smart Expiration',
              desc: 'Set TTLs from 1 hour to 7 days. Extend or regenerate at any time.',
            },
            {
              icon: <Shield size={20} />,
              title: 'Secure & Private',
              desc: 'JWT-protected routes, role-based access, and httpOnly refresh tokens.',
            },
          ].map((feat) => (
            <div key={feat.title} className="card-elevated p-6 group hover:border-[#2a2a3e] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center text-[#c8ff00] mb-4 group-hover:bg-[#c8ff00]/15 transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-[#eeeef5] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {feat.title}
              </h3>
              <p className="text-[13px] text-[#9090a8] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!user && (
          <div className="mt-16 text-center">
            <Link
              href="/register"
              className="btn-primary text-[14px] py-3 px-8 inline-flex"
            >
              Start shortening for free
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
