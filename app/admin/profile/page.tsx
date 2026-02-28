'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore } from '@/lib/admin/store';
import ImageUpload from '@/components/ui/ImageUpload';
import { Check, Eye, EyeOff, KeyRound, Mail, User, Shield } from 'lucide-react';

const SESSION_KEY = 'mb_admin_session';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({ displayName: 'Admin', email: 'admin@motionbooster.com', avatarImage: '', password: 'MotionBooster@2025' });
  const [form, setForm] = useState({ displayName: '', email: '', avatarImage: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const p = AdminStore.getProfile();
    setProfile({ ...p, avatarImage: p.avatarImage || '' });
    setForm({ displayName: p.displayName, email: p.email, avatarImage: p.avatarImage || '' });
  }, []);

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const saveProfile = () => {
    if (!form.displayName.trim()) { showMsg('Display name is required.', 'error'); return; }
    const updated = { ...profile, displayName: form.displayName.trim(), email: form.email.trim(), avatarImage: form.avatarImage };
    AdminStore.saveProfile(updated);
    setProfile(updated);
    showMsg('Profile updated!');
  };

  const changePassword = () => {
    if (!pwForm.current) { showMsg('Enter current password.', 'error'); return; }
    if (pwForm.current !== profile.password) { showMsg('Current password is incorrect.', 'error'); return; }
    if (pwForm.newPw.length < 8) { showMsg('New password must be at least 8 characters.', 'error'); return; }
    if (pwForm.newPw !== pwForm.confirm) { showMsg('Passwords do not match.', 'error'); return; }
    const updated = { ...profile, password: pwForm.newPw };
    AdminStore.saveProfile(updated);
    setProfile(updated);
    setPwForm({ current: '', newPw: '', confirm: '' });
    showMsg('Password changed successfully!');
  };

  const initials = profile.displayName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <AdminShell>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 text-white text-sm px-4 py-3 rounded-xl shadow-2xl ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toastType === 'success' && <Check className="inline w-4 h-4 mr-1.5" />}
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your admin account details and password</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {form.avatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarImage} alt="avatar" className="w-20 h-20 rounded-2xl object-cover shadow" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl font-bold shadow">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1">
              <ImageUpload
                value={form.avatarImage}
                onChange={v => setForm({ ...form, avatarImage: v })}
                label="Profile Photo"
                aspectRatio="square"
                maxPx={300}
              />
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
              <input
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Username (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <div className="flex items-center gap-2 border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5">
              <span className="text-sm text-gray-500 font-mono">admin</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Cannot be changed</span>
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Save Profile
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={pwForm.current}
                onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPw}
                  onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && changePassword()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          {pwForm.newPw && (
            <div className="flex items-center gap-4 text-xs">
              <span className={`flex items-center gap-1 ${pwForm.newPw.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pwForm.newPw.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                8+ characters
              </span>
              <span className={`flex items-center gap-1 ${/[A-Z]/.test(pwForm.newPw) ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(pwForm.newPw) ? 'bg-green-500' : 'bg-gray-300'}`} />
                Uppercase
              </span>
              <span className={`flex items-center gap-1 ${/[0-9!@#$%]/.test(pwForm.newPw) ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${/[0-9!@#$%]/.test(pwForm.newPw) ? 'bg-green-500' : 'bg-gray-300'}`} />
                Number/Symbol
              </span>
              {pwForm.confirm && (
                <span className={`flex items-center gap-1 ${pwForm.newPw === pwForm.confirm ? 'text-green-600' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pwForm.newPw === pwForm.confirm ? 'bg-green-500' : 'bg-red-500'}`} />
                  Passwords match
                </span>
              )}
            </div>
          )}

          <button
            onClick={changePassword}
            disabled={!pwForm.current || !pwForm.newPw || !pwForm.confirm}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Change Password
          </button>
        </div>

        {/* Security Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Security Notice</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Your admin credentials are stored locally in this browser. After changing your password, use the new password to log in next time. Username <strong>admin</strong> cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
