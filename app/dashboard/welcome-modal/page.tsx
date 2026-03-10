'use client';

import { useEffect, useRef, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Check, ImagePlus, Loader2, Save, Trash2, Eye, NotebookPen } from 'lucide-react';

interface WelcomeSettings {
  welcomeModalImage: string;
  welcomeModalTitle: string;
  welcomeModalBody: string;
  welcomeModalExploreLink: string;
}

const DEFAULT: WelcomeSettings = {
  welcomeModalImage: '',
  welcomeModalTitle: 'Welcome to Motion Booster! 👋',
  welcomeModalBody: 'We help businesses grow with creative branding, motion graphics, web development & digital marketing.',
  welcomeModalExploreLink: '/service',
};

export default function WelcomeModalPage() {
  const [settings, setSettings] = useState<WelcomeSettings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/v1/cms/site-settings')
      .then(r => r.json())
      .then((data) => {
        setSettings({
          welcomeModalImage: data.welcomeModalImage || '',
          welcomeModalTitle: data.welcomeModalTitle || DEFAULT.welcomeModalTitle,
          welcomeModalBody: data.welcomeModalBody || DEFAULT.welcomeModalBody,
          welcomeModalExploreLink: data.welcomeModalExploreLink || DEFAULT.welcomeModalExploreLink,
        });
      })
      .catch(() => {});
  }, []);

  const set = (key: keyof WelcomeSettings) => (value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/cms/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // silent — could add toast here
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new window.Image();
    img.onload = () => {
      const maxW = 800;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL('image/jpeg', 0.85);
      setSettings(prev => ({ ...prev, welcomeModalImage: b64 }));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const currentImage = settings.welcomeModalImage;
  const currentTitle = settings.welcomeModalTitle || DEFAULT.welcomeModalTitle;
  const currentBody = settings.welcomeModalBody || DEFAULT.welcomeModalBody;
  const currentLink = settings.welcomeModalExploreLink || DEFAULT.welcomeModalExploreLink;

  return (
    <AdminShell>
      {/* Fullscreen Preview Overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setPreview(false)}
        >
          <div className="relative" onClick={e => e.stopPropagation()}>
            {/* Close hint */}
            <p className="text-white/60 text-xs text-center mb-3">Click anywhere outside to close preview</p>

            {/* Simulated modal */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-80">
              <button
                onClick={() => setPreview(false)}
                className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-gray-500 shadow hover:bg-white"
              >
                <span className="text-[10px] font-bold">✕</span>
              </button>

              {/* Banner */}
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentImage} alt="banner" className="w-full h-48 object-cover" />
              ) : (
                <div
                  className="w-full h-48 flex items-center justify-center"
                  style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
                >
                  <div className="text-center px-4">
                    <div className="text-5xl mb-2">🚀</div>
                    <p className="text-white text-xl font-extrabold">Motion Booster</p>
                    <p className="text-white/80 text-sm">Your Digital Growth Partner</p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="px-5 pt-4 pb-5">
                <h3 className="text-gray-900 text-base font-bold mb-1.5">{currentTitle}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{currentBody}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full border-2 border-red-400 flex items-center justify-center">
                      <span className="text-red-500 font-bold text-xs">8</span>
                    </div>
                    <span className="text-xs text-gray-400">Auto close</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Explore →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welcome Popup</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customize the modal shown when visitors first arrive on the site.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={() => setPreview(v => !v)}
            className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Banner Image</h2>

            {currentImage ? (
              <div className="relative rounded-xl overflow-hidden mb-3 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImage} alt="Modal banner" className="w-full h-36 object-cover" />
                <button
                  onClick={() => setSettings(prev => ({ ...prev, welcomeModalImage: '' }))}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-colors mb-3"
              >
                <ImagePlus className="w-6 h-6 text-gray-300" />
                <p className="text-xs text-gray-400">Click to upload banner image</p>
                <p className="text-[10px] text-gray-300">JPG, PNG, WebP — 800×400px recommended</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />

            {!currentImage && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <ImagePlus className="w-4 h-4" /> Upload Image
              </button>
            )}
            <p className="text-[11px] text-gray-400 mt-2">
              Leave empty to show the default red gradient banner with the 🚀 icon.
            </p>
          </div>

          {/* Text */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Modal Text</h2>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Heading</label>
              <input
                type="text"
                value={settings.welcomeModalTitle || ''}
                onChange={e => set('welcomeModalTitle')(e.target.value)}
                placeholder="Welcome to Motion Booster! 👋"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
              <textarea
                value={settings.welcomeModalBody || ''}
                onChange={e => set('welcomeModalBody')(e.target.value)}
                rows={3}
                placeholder="We help businesses grow..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Explore Button Link</label>
              <input
                type="text"
                value={settings.welcomeModalExploreLink || ''}
                onChange={e => set('welcomeModalExploreLink')(e.target.value)}
                placeholder="/service"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-[11px] text-gray-400 mt-1">Where the &quot;Explore&quot; button navigates (e.g. /service, /features)</p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Live Preview</h2>
            <div className="flex items-center justify-center bg-gray-800/80 rounded-xl p-6 min-h-80">
              {/* Mock modal */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-65">
                {/* close btn */}
                <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-gray-500 shadow">
                  <span className="text-[10px] font-bold">✕</span>
                </div>

                {/* banner */}
                {currentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentImage} alt="banner" className="w-full h-32 object-cover" />
                ) : (
                  <div
                    className="w-full h-32 flex items-center justify-center"
                    style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
                  >
                    <div className="text-center px-4">
                      <div className="text-4xl mb-1">🚀</div>
                      <p className="text-white text-base font-extrabold">Motion Booster</p>
                      <p className="text-white/80 text-[10px]">Your Digital Growth Partner</p>
                    </div>
                  </div>
                )}

                {/* content */}
                <div className="px-4 pt-3 pb-4">
                  <h3 className="text-gray-900 text-sm font-bold mb-1">{currentTitle}</h3>
                  <p className="text-gray-500 text-[11px] leading-relaxed mb-3">{currentBody}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-7 h-7 rounded-full border-2 border-red-400 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-[10px]">8</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Auto close</span>
                    </div>
                    <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-full text-[11px] font-semibold">
                      Explore →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-2.5 text-xs text-amber-700">
            <NotebookPen className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">How it works</p>
              <p>The popup shows automatically 0.5 seconds after a visitor lands on the site. It only appears once per browser session.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
