'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import { getUserById, changePassword, deleteAccount } from '@/lib/api';
import { User, Lock, Trash2, Eye, EyeOff, Check, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<{ name: string; email: string; role: string; createdAt: string } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Password form
  const [pwForm, setPwForm] = useState({ password: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Delete
  const [delConfirm, setDelConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !token) { router.push('/login'); return; }
      getUserById(user.id, token)
        .then((d) => setProfileData(d))
        .catch(() => {})
        .finally(() => setLoadingProfile(false));
    }
  }, [authLoading, user, token, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    if (pwForm.newPassword !== pwForm.confirm) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast('New password must be at least 8 characters', 'error');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(user.id, { password: pwForm.password, newPassword: pwForm.newPassword }, token);
      toast('Password changed successfully', 'success');
      setPwForm({ password: '', newPassword: '', confirm: '' });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      toast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || !user || delConfirm !== user.email) {
      toast('Please type your email to confirm', 'error');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(user.id, token);
      await logout();
      toast('Account deleted', 'info');
      router.push('/');
    } catch (err: any) {
      toast(err.message || 'Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#050508]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-24">
          <div className="skeleton h-40 rounded-xl mb-6" />
          <div className="skeleton h-64 rounded-xl mb-6" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  const togglePw = (key: 'current' | 'new' | 'confirm') =>
    setShowPw((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-20 space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#eeeef5]" style={{ fontFamily: 'var(--font-display)' }}>
            Account
          </h1>
          <p className="text-[13px] text-[#9090a8] mt-0.5">Manage your profile and security</p>
        </div>

        {/* Profile card */}
        <div className="card-elevated p-6" style={{ animation: 'fade-up 0.4s ease forwards' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 border border-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00]">
              <User size={22} />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#eeeef5]">{profileData?.name}</div>
              <div className="text-[13px] text-[#9090a8] font-mono">{profileData?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#0d0d12] border border-[#1e1e2e]">
              <div className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">Role</div>
              <div className="flex items-center gap-2 text-[14px]">
                <Shield size={14} className={profileData?.role === 'admin' ? 'text-[#c8ff00]' : 'text-[#9090a8]'} />
                <span className="capitalize text-[#eeeef5]">{profileData?.role}</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#0d0d12] border border-[#1e1e2e]">
              <div className="text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">Joined</div>
              <div className="text-[14px] text-[#eeeef5]">
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card-elevated p-6" style={{ animation: 'fade-up 0.45s ease forwards' }}>
          <div className="flex items-center gap-3 mb-5">
            <Lock size={16} className="text-[#9090a8]" />
            <h2 className="text-[15px] font-bold text-[#eeeef5]" style={{ fontFamily: 'var(--font-display)' }}>
              Change Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { label: 'Current Password', key: 'password', field: 'password', show: showPw.current, toggle: () => togglePw('current') },
              { label: 'New Password', key: 'newPassword', field: 'newPassword', show: showPw.new, toggle: () => togglePw('new') },
              { label: 'Confirm New Password', key: 'confirm', field: 'confirm', show: showPw.confirm, toggle: () => togglePw('confirm') },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    type={f.show ? 'text' : 'password'}
                    value={(pwForm as any)[f.field]}
                    onChange={(e) => setPwForm((prev) => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a72] hover:text-[#9090a8]"
                  >
                    {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={savingPw}
              className="btn-primary"
            >
              {savingPw ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : pwSuccess ? (
                <><Check size={14} /> Saved</>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Delete account */}
        <div
          className="card-elevated p-6 border-[#ff4455]/15"
          style={{ animation: 'fade-up 0.5s ease forwards' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <Trash2 size={16} className="text-[#ff4455]" />
            <h2 className="text-[15px] font-bold text-[#eeeef5]" style={{ fontFamily: 'var(--font-display)' }}>
              Delete Account
            </h2>
          </div>

          <p className="text-[13px] text-[#9090a8] mb-5 leading-relaxed">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <div className="mb-4">
            <label className="block text-[11px] font-mono text-[#5a5a72] uppercase tracking-widest mb-2">
              Type your email to confirm
            </label>
            <input
              type="email"
              value={delConfirm}
              onChange={(e) => setDelConfirm(e.target.value)}
              placeholder={user?.email}
              className="input border-[#ff4455]/20 focus:border-[#ff4455]"
            />
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting || delConfirm !== user?.email}
            className="btn-danger disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete Account Permanently
          </button>
        </div>
      </main>
    </div>
  );
}
