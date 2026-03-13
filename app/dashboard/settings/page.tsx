'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { AdminStore, SiteSettings, defaultSettings } from '@/lib/admin/store';
import { Check, RotateCcw, Save, Sparkles, NotebookPen } from 'lucide-react';
import { toast } from 'sonner';

function Field({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setSettings(AdminStore.getSettings());
  }, []);

  const set = (key: keyof SiteSettings) => (value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const { confirm } = useConfirm();

  const handleSave = async () => {
    if (!await confirm({ title: 'Save Settings', message: 'Are you sure you want to save all settings?' })) return;
    AdminStore.saveSettings(settings);
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    AdminStore.saveSettings(defaultSettings);
    setSaved(true);
    toast.success('Settings reset to default!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminShell>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All settings will be reset to defaults. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { handleReset(); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update site-wide information, contact details, and social links</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><Check className="w-4 h-4" /> Settings Saved!</span>}
          <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <RotateCcw className="w-3 h-3" /> Reset Default
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">General</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site Name" value={settings.siteName} onChange={set('siteName')} placeholder="Motion Booster" />
            <Field label="Tagline" value={settings.tagline} onChange={set('tagline')} placeholder="Your tagline here" />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email Address" value={settings.contactEmail} onChange={set('contactEmail')} placeholder="info@motionbooster.com" />
            <Field label="Phone Number" value={settings.contactPhone} onChange={set('contactPhone')} placeholder="+880 1234-567890" />
            <div className="sm:col-span-2">
              <Field label="Address" value={settings.address} onChange={set('address')} placeholder="Dhaka, Bangladesh" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Social Media Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Facebook URL" value={settings.facebookUrl} onChange={set('facebookUrl')} placeholder="https://facebook.com/..." />
            <Field label="Instagram URL" value={settings.instagramUrl} onChange={set('instagramUrl')} placeholder="https://instagram.com/..." />
            <Field label="LinkedIn URL" value={settings.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/..." />
          </div>
        </div>

        {/* Homepage Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Homepage Content</h2>
          <div className="space-y-4">
            <Field label="Hero Title" value={settings.heroTitle} onChange={set('heroTitle')} hint="Main headline shown in the hero section" />
            <TextArea label="Hero Subtitle" value={settings.heroSubtitle} onChange={set('heroSubtitle')} />
            <Field label="Services Section Title" value={settings.servicesTitle} onChange={set('servicesTitle')} />
            <TextArea label="Services Section Subtitle" value={settings.servicesSubtitle} onChange={set('servicesSubtitle')} rows={2} />
          </div>
        </div>

        {/* Welcome Modal note */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <NotebookPen className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Welcome Popup settings have moved</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Manage the welcome modal image, title, description, and explore link from the{' '}
              <a href="/dashboard/welcome-modal" className="underline font-medium">Welcome Popup</a> page in the sidebar.
            </p>
          </div>
        </div>

        {/* Save button (bottom) */}
        <div className="flex justify-end">
          <button onClick={handleSave} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl">
            <Save className="w-4 h-4" /> Save All Settings
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
