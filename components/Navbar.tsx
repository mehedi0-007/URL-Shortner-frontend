'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from './Toast';
import { LayoutDashboard, LogOut, User, Zap, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast('Signed out successfully', 'success');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e] bg-[#050508]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#c8ff00] flex items-center justify-center">
            <Zap size={14} fill="#050508" stroke="none" className="group-hover:scale-110 transition-transform" />
          </div>
          <span
            className="text-[15px] font-bold tracking-tight text-[#eeeef5]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            snip
          </span>
        </Link>

        {/* Nav links + actions */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[#141420] text-[#c8ff00] border border-[#1e1e2e]'
                    : 'text-[#9090a8] hover:text-[#eeeef5] hover:bg-[#0d0d12]'
                }`}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-all ${
                    isActive('/dashboard/admin')
                      ? 'bg-[#141420] text-[#c8ff00] border border-[#1e1e2e]'
                      : 'text-[#9090a8] hover:text-[#eeeef5] hover:bg-[#0d0d12]'
                  }`}
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-all ${
                  isActive('/profile')
                    ? 'bg-[#141420] text-[#c8ff00] border border-[#1e1e2e]'
                    : 'text-[#9090a8] hover:text-[#eeeef5] hover:bg-[#0d0d12]'
                }`}
              >
                <User size={14} />
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#9090a8] hover:text-[#ff4455] hover:bg-[#0d0d12] transition-all ml-1"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-[13px] text-[#9090a8] hover:text-[#eeeef5] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary text-[12px] py-2 px-4"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
