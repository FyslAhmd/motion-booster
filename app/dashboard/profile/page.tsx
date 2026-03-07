'use client';

import AdminShell from '../_components/AdminShell';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Camera,
  Save,
  Edit2,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    fullName: 'Michael Anderson',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    company: 'MotionBooster Inc.',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    bio: 'Digital marketing specialist focused on growth strategies and campaign optimization.',
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignAlerts: true,
    budgetAlerts: true,
    weeklyReports: false,
    systemUpdates: true,
    newMessages: true,
  });

  const handlePasswordChange = () => {
    // Handle password change logic
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <AdminShell>
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-lg"
                >
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
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Tabs */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2 space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'notifications' | 'billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                {/* Profile Header — MoreDrawer style */}
                <div className="flex flex-col items-center pb-8 pt-2 border-b border-gray-100">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-red-400 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{formData.fullName}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{formData.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                      Active Account
                    </span>
                    <span className="text-xs text-gray-400">Member since Jan 2024</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      >
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                  />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button onClick={handlePasswordChange}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                  >
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
                        <p className="text-sm text-gray-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      Enable
                    </button>
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
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Receive updates about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
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

                {/* Current Plan */}
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
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-red-100">
                    <p className="text-sm text-gray-600">
                      Next billing date: <span className="font-medium text-gray-900">March 1, 2026</span>
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Method</h3>
                  <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/2026</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'Feb 1, 2026', amount: '$99.00', status: 'Paid' },
                      { date: 'Jan 1, 2026', amount: '$99.00', status: 'Paid' },
                      { date: 'Dec 1, 2025', amount: '$99.00', status: 'Paid' },
                    ].map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{invoice.date}</p>
                            <p className="text-sm text-gray-600">Professional Plan</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-gray-900">{invoice.amount}</span>
                          <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                            {invoice.status}
                          </span>
                          <button className="text-red-500 hover:text-red-600"
                          >
                            Download
                          </button>
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