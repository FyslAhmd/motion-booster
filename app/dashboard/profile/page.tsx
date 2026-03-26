'use client';

import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { useConfirm } from '@/lib/admin/confirm';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Eye,
  EyeOff,
  Loader2,
  AtSign,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

const DEFAULT_NOTIFICATIONS = {
  emailNotifications: true,
  campaignAlerts: true,
  budgetAlerts: true,
  weeklyReports: false,
  systemUpdates: true,
  newMessages: true,
};

const NOTIFICATION_TOGGLE_BASE =
  'relative inline-flex h-8 w-14 shrink-0 items-center overflow-hidden rounded-full border-[0.5px] px-[2px] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-red-300';

const NOTIFICATION_TOGGLE_KNOB =
  'inline-block h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'security' || tab === 'notifications') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/v1/upload/avatar', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        updateUser({ avatarUrl: json.data.avatarUrl });
        toast.success('Profile picture updated!');
      } else {
        toast.error(json.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed — please try again');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const { confirm } = useConfirm();

  const handleSaveProfile = async () => {
    if (!await confirm({ title: 'Save Profile', message: 'Are you sure you want to save your profile changes?' })) return;
    setIsSaving(true);
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
        toast.success('Profile updated successfully!');
      } else {
        toast.error(json.error || 'Update failed');
      }
    } catch {
      toast.error('Update failed — please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({ fullName: user.fullName || '', username: user.username || '', phone: user.phone || '' });
    }
    setIsEditing(false);
  };

  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [isSavingPw, setIsSavingPw] = useState(false);

  const handlePasswordChange = async () => {
    if (!pwData.currentPassword || !pwData.newPassword || !pwData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (pwData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error('New passwords do not match');
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
        toast.success('Password changed successfully!');
      } else {
        toast.error(json.error || 'Password change failed');
      }
    } catch {
      toast.error('Password change failed — please try again');
    } finally {
      setIsSavingPw(false);
    }
  };

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (!user) {
    return (
      <AdminShell>
        <AdminSectionSkeleton variant="editor" />
      </AdminShell>
    );
  }

  const avatarSrc = user?.avatarUrl ?? null;

  return (
    <AdminShell>
      <div className="h-full overflow-y-auto no-scrollbar bg-gray-50">
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
                    <h2 className="text-xl font-bold text-gray-900">{user.fullName || user.username}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                        Active Account
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{user.role?.toLowerCase()}</span>
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
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
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
                          type="button"
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          aria-pressed={value}
                          className={`${NOTIFICATION_TOGGLE_BASE} ${
                            value
                              ? 'border-red-600 bg-red-500 shadow-sm shadow-red-200'
                              : 'border-gray-300 bg-gray-200 shadow-inner'
                          }`}
                        >
                          <span
                            className={`${NOTIFICATION_TOGGLE_KNOB} ${
                              value ? 'translate-x-5.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
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
