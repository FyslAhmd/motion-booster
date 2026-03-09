'use client';

import AdminShell from '../_components/AdminShell';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Edit2,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  AtSign,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-700'
      : 'bg-red-50 border-red-200 text-red-700';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${styles}`}>
      <Icon className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

const DEFAULT_NOTIFICATIONS = {
  emailNotifications: true,
  campaignAlerts: true,
  budgetAlerts: true,
  weeklyReports: false,
  systemUpdates: true,
  newMessages: true,
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({ fullName: '', username: '', phone: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setProfileMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/v1/upload/avatar', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        updateUser({ avatarUrl: json.data.avatarUrl });
        setProfileMsg({ type: 'success', text: 'Profile picture updated!' });
      } else {
        setProfileMsg({ type: 'error', text: json.error || 'Upload failed' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Upload failed — please try again' });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        updateUser({
          fullName: json.data.user.fullName,
          username: json.data.user.username,
          phone: json.data.user.phone,
        });
        setIsEditing(false);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: json.error || 'Update failed' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Update failed — please try again' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({ fullName: user.fullName || '', username: user.username || '', phone: user.phone || '' });
    }
    setIsEditing(false);
    setProfileMsg(null);
  };

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async () => {
    setPwMsg(null);
    if (!pwData.currentPassword || !pwData.newPassword || !pwData.confirmPassword) {
      setPwMsg({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (pwData.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setIsSavingPw(true);
    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      } else {
        setPwMsg({ type: 'error', text: json.error || 'Password change failed' });
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Password change failed — please try again' });
    } finally {
      setIsSavingPw(false);
    }
  };

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const avatarSrc = user?.avatarUrl ?? null;

  return (
    <AdminShell>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-12 md:col-span-9">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                  <div className="flex flex-col items-center pb-8 pt-2 border-b border-gray-100">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full border-4 border-red-400 overflow-hidden bg-gray-100 flex items-center justify-center">
                        {avatarSrc ? (
                          <Image
                            src={avatarSrc}
                            alt="Profile picture"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-500 to-red-700 text-white text-2xl font-bold">
                            {(user?.fullName || user?.username || 'U').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute bottom-0 right-0 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user?.fullName || user?.username}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                        Active Account
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setIsEditing(true); setProfileMsg(null); }}
                          className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                    {profileMsg && (
                      <div className="mt-4 w-full max-w-sm">
                        <Alert type={profileMsg.type} message={profileMsg.text} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Email cannot be changed after registration</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Change Password</h2>
                    <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                  </div>

                  {pwMsg && <Alert type={pwMsg.type} message={pwMsg.text} />}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPw.current ? 'text' : 'password'}
                          value={pwData.currentPassword}
                          onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                        <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPw.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPw.new ? 'text' : 'password'}
                          value={pwData.newPassword}
                          onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                          placeholder="At least 8 characters"
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                        <button type="button" onClick={() => setShowPw({ ...showPw, new: !showPw.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPw.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPw.confirm ? 'text' : 'password'}
                          value={pwData.confirmPassword}
                          onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                          placeholder="Repeat new password"
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                        <button type="button" onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPw.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={isSavingPw}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-60 transition-colors"
                    >
                      {isSavingPw && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Two-Factor Authentication</h3>
                    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">Not Enabled</h4>
                          <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">Enable</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Notification Preferences</h2>
                    <p className="text-sm text-gray-600">Choose what updates you want to receive</p>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Receive updates about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-red-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Billing & Subscription</h2>
                    <p className="text-sm text-gray-600">Manage your subscription and payment methods</p>
                  </div>

                  <div className="p-6 bg-linear-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Professional Plan</h3>
                        <p className="text-sm text-gray-600 mt-1">Perfect for growing businesses</p>
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-3xl font-bold text-gray-900">$99</span>
                          <span className="text-gray-600">/month</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">Upgrade Plan</button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-100">
                      <p className="text-sm text-gray-600">Next billing date: <span className="font-medium text-gray-900">March 1, 2026</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Method</h3>
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                        <div>
                          <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-600">Expires 12/2026</p>
                        </div>
                      </div>
                      <button className="text-red-500 hover:text-red-600 text-sm font-medium">Update</button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Billing History</h3>
                    <div className="space-y-2">
                      {[{ date: 'Feb 1, 2026', amount: '$99.00' }, { date: 'Jan 1, 2026', amount: '$99.00' }, { date: 'Dec 1, 2025', amount: '$99.00' }].map((invoice, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{invoice.date}</p>
                              <p className="text-sm text-gray-600">Professional Plan</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-900">{invoice.amount}</span>
                            <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">Paid</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
