'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, MetaConfig } from '@/lib/admin/store';
import { Check, Facebook, Instagram, MessageCircle, Phone, ChevronDown, ChevronUp, AlertCircle, Zap } from 'lucide-react';

const defaultConfig = (): MetaConfig => ({
  facebookPageId: '', facebookPageToken: '', facebookPixelId: '',
  instagramAccountId: '',
  whatsappNumber: '', whatsappToken: '',
  messengerEnabled: false,
  facebookConnected: false, instagramConnected: false, whatsappConnected: false,
});

type Panel = 'facebook' | 'instagram' | 'whatsapp' | 'messenger' | null;

export default function AdminMetaPage() {
  const [config, setConfig] = useState<MetaConfig>(defaultConfig());
  const [open, setOpen] = useState<Panel>('facebook');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    setConfig(AdminStore.getMetaConfig());
  }, []);

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const save = (updated: MetaConfig) => {
    AdminStore.saveMetaConfig(updated);
    setConfig(updated);
    showMsg('Settings saved!');
  };

  const toggle = (panel: Panel) => setOpen(prev => prev === panel ? null : panel);

  const StatusBadge = ({ connected }: { connected: boolean }) =>
    connected
      ? <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Connected</span>
      : <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />Not Connected</span>;

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
          <h1 className="text-xl font-bold text-gray-900">Meta Account Connect</h1>
          <p className="text-sm text-gray-500 mt-0.5">Connect your Facebook, Instagram, WhatsApp and Messenger accounts</p>
        </div>

        {/* Facebook */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle('facebook')}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Facebook</p>
              <p className="text-xs text-gray-500">Page connection &amp; Pixel tracking</p>
            </div>
            <StatusBadge connected={config.facebookConnected} />
            {open === 'facebook' ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
          </button>

          {open === 'facebook' && (
            <div className="border-t border-gray-100 p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Facebook Page ID</label>
                <input
                  value={config.facebookPageId}
                  onChange={e => setConfig({ ...config, facebookPageId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. 123456789012345"
                />
                <p className="text-xs text-gray-400 mt-1">Found at facebook.com/YOUR_PAGE → About → Page ID</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Page Access Token</label>
                <input
                  type="password"
                  value={config.facebookPageToken}
                  onChange={e => setConfig({ ...config, facebookPageToken: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="EAAxxxxxxxx..."
                />
                <p className="text-xs text-gray-400 mt-1">Generate from developers.facebook.com → Graph API Explorer</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Facebook Pixel ID <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  value={config.facebookPixelId}
                  onChange={e => setConfig({ ...config, facebookPixelId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. 987654321098765"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => save({ ...config, facebookConnected: !!(config.facebookPageId && config.facebookPageToken) })}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {config.facebookConnected ? 'Update Connection' : 'Connect Facebook'}
                </button>
                {config.facebookConnected && (
                  <button
                    onClick={() => save({ ...config, facebookPageId: '', facebookPageToken: '', facebookPixelId: '', facebookConnected: false })}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instagram */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle('instagram')}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Instagram</p>
              <p className="text-xs text-gray-500">Instagram Business account integration</p>
            </div>
            <StatusBadge connected={config.instagramConnected} />
            {open === 'instagram' ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
          </button>

          {open === 'instagram' && (
            <div className="border-t border-gray-100 p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Instagram Business Account ID</label>
                <input
                  value={config.instagramAccountId}
                  onChange={e => setConfig({ ...config, instagramAccountId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g. 17841400008460056"
                />
                <p className="text-xs text-gray-400 mt-1">Your Facebook-linked Instagram Business Account ID</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Instagram API requires a connected Facebook Page and Page Access Token to function.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => save({ ...config, instagramConnected: !!config.instagramAccountId })}
                  className="px-5 py-2 text-white text-sm font-medium rounded-xl transition-colors"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}
                >
                  {config.instagramConnected ? 'Update' : 'Connect Instagram'}
                </button>
                {config.instagramConnected && (
                  <button
                    onClick={() => save({ ...config, instagramAccountId: '', instagramConnected: false })}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle('whatsapp')}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">WhatsApp Business</p>
              <p className="text-xs text-gray-500">WhatsApp Business API configuration</p>
            </div>
            <StatusBadge connected={config.whatsappConnected} />
            {open === 'whatsapp' ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
          </button>

          {open === 'whatsapp' && (
            <div className="border-t border-gray-100 p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Business Phone Number</label>
                <input
                  value={config.whatsappNumber}
                  onChange={e => setConfig({ ...config, whatsappNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. +8801XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">WhatsApp API Token</label>
                <input
                  type="password"
                  value={config.whatsappToken}
                  onChange={e => setConfig({ ...config, whatsappToken: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Bearer token from Meta Business Suite"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => save({ ...config, whatsappConnected: !!(config.whatsappNumber && config.whatsappToken) })}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {config.whatsappConnected ? 'Update' : 'Connect WhatsApp'}
                </button>
                {config.whatsappConnected && (
                  <button
                    onClick={() => save({ ...config, whatsappNumber: '', whatsappToken: '', whatsappConnected: false })}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messenger */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle('messenger')}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Messenger Chat Plugin</p>
              <p className="text-xs text-gray-500">Show Messenger chat bubble on your website</p>
            </div>
            <StatusBadge connected={config.messengerEnabled} />
            {open === 'messenger' ? <ChevronUp className="w-4 h-4 text-gray-400 ml-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
          </button>

          {open === 'messenger' && (
            <div className="border-t border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable Messenger Plugin</p>
                  <p className="text-xs text-gray-500 mt-0.5">Adds Facebook Messenger chat widget to your site (requires Page ID above)</p>
                </div>
                <button
                  onClick={() => save({ ...config, messengerEnabled: !config.messengerEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.messengerEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${config.messengerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {config.messengerEnabled && !config.facebookPageId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Please enter your Facebook Page ID in the Facebook section above to enable the plugin.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Integration Guide</p>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              All credentials are stored locally in your browser for preview. For production, move these values to server environment variables and use the official Meta Business SDK.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
