'use client';

import { useEffect, useRef, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { Check, ImagePlus, Save, Trash2, Eye, NotebookPen } from 'lucide-react';
import { toast } from 'sonner';

type WelcomeSettingsForm = {
  welcomeModalImage: string;
  welcomeModalExploreLink: string;
};

const DEFAULT_WELCOME_SETTINGS: WelcomeSettingsForm = {
  welcomeModalImage: '',
  welcomeModalExploreLink: '/service',
};

const WELCOME_SETTINGS_CACHE_KEY = 'mb_welcome_modal_settings_v1';

function WelcomeModalCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 mb-4" />
          <div className="h-36 w-full animate-pulse rounded-xl bg-gray-200 mb-3" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 mb-4" />
          <div className="h-80 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-amber-200 mb-2" />
          <div className="h-3 w-full animate-pulse rounded bg-amber-200" />
        </div>
      </div>
    </div>
  );
}

export default function WelcomeModalPage() {
  const [settings, setSettings] = useState<WelcomeSettingsForm>(DEFAULT_WELCOME_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/v1/cms/site-settings', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;

        setSettings({
          welcomeModalImage: data?.welcomeModalImage || '',
          welcomeModalExploreLink: data?.welcomeModalExploreLink || '/service',
        });
      } catch {
        if (!cancelled) {
          toast.error('Failed to load welcome popup settings');
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: keyof WelcomeSettingsForm) => (value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const { confirm } = useConfirm();

  const handleSave = async () => {
    if (!await confirm({ title: 'Save Changes', message: 'Are you sure you want to save these changes?' })) return;

    try {
      const res = await fetch('/api/v1/cms/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcomeModalImage: settings.welcomeModalImage || null,
          welcomeModalExploreLink: settings.welcomeModalExploreLink || '/service',
          welcomeModalTitle: null,
          welcomeModalBody: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save settings');
      }

      const normalized = {
        welcomeModalImage: data?.welcomeModalImage || '',
        welcomeModalExploreLink: data?.welcomeModalExploreLink || '/service',
      };
      setSettings(normalized);

      try {
        localStorage.setItem(WELCOME_SETTINGS_CACHE_KEY, JSON.stringify(normalized));
      } catch {
        // noop
      }

      setSaved(true);
      toast.success('Welcome popup settings saved successfully!');
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save settings';
      toast.error(message);
    }
  };

  const handleImageUpload = (file: File) => {
    const isSvg =
      file.type === 'image/svg+xml' ||
      file.name.toLowerCase().endsWith('.svg');

    if (isSvg) {
      const svgReader = new FileReader();
      svgReader.onload = () => {
        const rawSvg = typeof svgReader.result === 'string' ? svgReader.result : '';
        if (!rawSvg) {
          toast.error('Failed to read SVG file');
          return;
        }

        const encodedSvg = encodeURIComponent(rawSvg)
          .replace(/%0A/g, '')
          .replace(/%20/g, ' ');

        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        setSettings(prev => ({ ...prev, welcomeModalImage: svgDataUrl }));
      };
      svgReader.onerror = () => toast.error('Failed to read SVG file');
      svgReader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = typeof reader.result === 'string' ? reader.result : '';
      setSettings(prev => ({ ...prev, welcomeModalImage: b64 }));
    };
    reader.onerror = () => toast.error('Failed to read image file');
    reader.readAsDataURL(file);
  };

  const currentImage = settings.welcomeModalImage || '';
  // const currentLink = settings.welcomeModalExploreLink || '/service';

  return (
    <AdminShell>
      {/* Fullscreen Preview Overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setPreview(false)}
        >
          <div className="relative z-10 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            {/* Close hint */}
            <p className="text-white/60 text-xs text-center mb-3">Click anywhere outside to close preview</p>

            {/* Simulated modal */}
            <div className="relative w-full bg-transparent p-0">
              <button
                onClick={() => setPreview(false)}
                className="absolute -top-2 right-0 z-20 h-8 w-8 rounded-full bg-white/90 text-gray-600 shadow transition-colors hover:text-red-500"
              >
                <span className="text-xs font-bold">✕</span>
              </button>

              {/* Banner */}
              {currentImage ? (
                <div className="mx-auto flex max-h-[70vh] w-fit max-w-[92vw] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage}
                    alt="banner"
                    className="block h-auto max-h-[70vh] w-auto max-w-full border-0 bg-transparent object-contain shadow-none"
                  />
                </div>
              ) : (
                <span></span>
              )}

              {/* CTA below image */}
              <div className="mt-4 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-7 py-2 text-base font-bold text-white shadow-xl">
                  Learn More →
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
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {initialLoading ? (
        <WelcomeModalCardsSkeleton />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Banner Image</h2>

            {currentImage ? (
              <div className="relative rounded-xl overflow-hidden mb-3 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImage} alt="Modal banner" className="w-full h-48 object-contain bg-transparent" />
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
                className="border-2 border-dashed border-gray-200 rounded-xl h-48 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-colors mb-3"
              >
                <ImagePlus className="w-6 h-6 text-gray-300" />
                <p className="text-xs text-gray-400">Click to upload no-background image</p>
                <p className="text-[10px] text-gray-300">PNG/WebP with transparent background recommended</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.svg,image/svg+xml"
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
              Transparent PNG will be preserved exactly as uploaded.
            </p>
          </div>

          {/* Link */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Explore Button</h2>

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
            <div className="flex items-center justify-center bg-gray-800/80 rounded-xl p-4">
              {/* Mock modal */}
              <div className="relative w-fit max-w-[92vw] bg-transparent p-0 shadow-2xl">
                {/* close btn */}
                <div className="absolute -top-2 right-0 z-20 h-8 w-8 rounded-full bg-white/90 text-gray-600 shadow flex items-center justify-center">
                  <span className="text-xs font-bold">✕</span>
                </div>

                {/* banner */}
                {currentImage ? (
                  <div className="mx-auto flex max-h-[70vh] w-fit max-w-[92vw] items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImage}
                      alt="banner"
                      className="block h-auto max-h-[70vh] w-auto max-w-full border-0 bg-transparent object-contain shadow-none"
                    />
                  </div>
                ) : (
                  <span></span>
                )}

                {/* button below image */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-7 py-2 text-base font-bold text-white shadow-xl">
                    Learn More →
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
              <p>The popup shows automatically 0.5 seconds after a visitor lands on the site, then auto-closes after 10 seconds. It appears once per browser session.</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </AdminShell>
  );
}
