'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const passwordChecks = [
    { label: '8+ characters', ok: form.password.length >= 8 },
    { label: 'Has a number', ok: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      await login(form.email, form.password);
      toast('Account created! Welcome to Snip.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] grid-pattern flex items-center justify-center px-4">
      {/* Logo */}
      <div className="fixed top-6 left-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#c8ff00] flex items-center justify-center">
            <Zap size={14} fill="#050508" stroke="none" />
          </div>
          <span className="text-[15px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            snip
          </span>
        </Link>
      </div>

      <div className="w-full max-w-[400px]" style={{ animation: 'fade-up 0.5s ease forwards' }}>
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-[32px] font-extrabold tracking-tight text-[#eeeef5] mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create account
          </h1>
          <p className="text-[14px] text-[#9090a8]">
            Already have one?{' '}
            <Link href="/login" className="text-[#c8ff00] hover:underline">
              Sign in →
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Alex Johnson"
              required
              autoFocus
              className="input"
            />
          </div>

          <div>
            <label className="block text-[12px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-[12px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                required
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a72] hover:text-[#9090a8] transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password checks */}
            {form.password.length > 0 && (
              <div className="mt-2 flex gap-3">
                {passwordChecks.map((c) => (
                  <span
                    key={c.label}
                    className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                      c.ok ? 'text-[#00e887]' : 'text-[#5a5a72]'
                    }`}
                  >
                    <Check size={10} />
                    {c.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg border border-[#ff4455]/20 bg-[#ff4455]/5 text-[#ff4455] text-[13px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                Create account
                <ArrowRight size={15} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#1e1e2e]">
          <p className="text-center text-[12px] text-[#5a5a72]">
            By registering you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
