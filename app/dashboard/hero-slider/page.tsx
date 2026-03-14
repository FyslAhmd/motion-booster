'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { HeroSlideItem } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Save, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import ImageUpload from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

const PRESET_IMAGES = [
  '/header1.jpeg',
  '/header2.jpeg',
  '/header3.jpeg',
];

const emptySlide: Omit<HeroSlideItem, 'id'> = {
  image: PRESET_IMAGES[0],
  customImage: '',
  title: '',
  description: '',
  badge: '',
  ctaText: '',
  ctaLink: '',
};

function HeroSlidesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white sm:flex-row"
        >
          <div className="h-32 w-full animate-pulse bg-gray-200 sm:h-auto sm:w-48" />
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
              <div className="flex items-center gap-1">
                <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-200" />
                <div className="ml-2 h-3 w-14 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-7 w-7 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8">
        <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [editing, setEditing] = useState<HeroSlideItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/hero-slides')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setSlides(data); })
      .catch(() => toast.error('Failed to load slides.'))
      .finally(() => setInitialLoading(false));
  }, []);

  const { confirm } = useConfirm();

  const save = async () => {
    if (!editing) return;
    const hasImage = editing.customImage || editing.image;
    if (!hasImage) { toast.error('Please add an image.'); return; }
    if (!await confirm({ title: 'Save Changes', message: 'Are you sure you want to save these changes?' })) return;
    setLoading(true);
    try {
      const payload = { ...editing, title: editing.title || 'Slide' };
      const url = isNew ? '/api/v1/cms/hero-slides' : `/api/v1/cms/hero-slides/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { toast.error('Save failed.'); return; }
      const saved: HeroSlideItem = await res.json();
      setSlides(prev => isNew ? [...prev, saved] : prev.map(s => s.id === saved.id ? saved : s));
      setEditing(null);
      setIsNew(false);
      toast.success(isNew ? 'Slide added!' : 'Changes saved!');
    } catch { toast.error('Save failed.'); } finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/cms/hero-slides/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Delete failed.'); return; }
      setSlides(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
      toast.success('Slide deleted.');
    } catch { toast.error('Delete failed.'); } finally { setLoading(false); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const arr = [...slides];
    const t = index + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[index], arr[t]] = [arr[t], arr[index]];
    setSlides(arr);
    await fetch('/api/v1/cms/hero-slides/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: arr.map(s => s.id) }),
    }).catch(() => toast.error('Reorder failed.'));
  };

  const resetDefault = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/cms/hero-slides/reset', { method: 'POST' });
      if (!res.ok) { toast.error('Reset failed.'); return; }
      const data: HeroSlideItem[] = await res.json();
      setSlides(data);
      toast.success('Reset to defaults!');
    } catch { toast.error('Reset failed.'); } finally { setLoading(false); }
  };

  const coverSrc = (slide: HeroSlideItem) => slide.customImage || slide.image;

  return (
    <AdminShell>
      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Delete Slide?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">This slide will be removed from the homepage.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => remove(deleteId)} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{isNew ? 'Add Slide' : 'Edit Slide'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <ImageUpload
                value={editing.customImage || ''}
                onChange={v => setEditing({ ...editing, customImage: v })}
                label="Slide Image"
                aspectRatio="wide"
                sizeHint="1280×720px recommended"
              />

              {/* Preset images */}
              <div>
                <p className="text-xs text-gray-400 mb-2">— or choose a preset background —</p>
                <div className="flex gap-2">
                  {PRESET_IMAGES.map(img => (
                    <button
                      key={img}
                      onClick={() => setEditing({ ...editing, image: img, customImage: '' })}
                      className={`relative h-16 flex-1 rounded-xl overflow-hidden border-2 transition-all ${!editing.customImage && editing.image === img ? 'border-red-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <Image src={img} alt={img} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Link <span className="text-gray-400 font-normal">(clicking image goes here)</span></label>
                <input
                  value={editing.ctaLink || ''}
                  onChange={e => setEditing({ ...editing, ctaLink: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="e.g. /service or https://example.com"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600">Cancel</button>
              <button onClick={save} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium">
                <Save className="w-4 h-4" />
                {isNew ? 'Add Slide' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All slides will be replaced with the default data. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { resetDefault(); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hero Slider</h1>
          <p className="text-sm text-gray-500 mt-0.5">{slides.length} slide{slides.length !== 1 ? 's' : ''} · shown on homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowResetConfirm(true)} disabled={loading} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">Reset Default</button>
          <button
            onClick={() => { setEditing({ id: '', ...emptySlide }); setIsNew(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>
      </div>

      {/* Slides list */}
      {initialLoading ? (
        <HeroSlidesListSkeleton />
      ) : (
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverSrc(slide)} alt={slide.title} className="w-full h-full object-cover" />
              {slide.customImage && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Custom</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                <p className="text-xs text-gray-400 mb-1">Slide {index + 1}</p>
                {slide.ctaLink ? (
                  <a
                    href={slide.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline truncate block"
                  >
                    {slide.ctaLink}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 italic">No link set</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === slides.length - 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400 ml-1">Slide {index + 1}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing({ ...slide }); setIsNew(false); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(slide.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add placeholder */}
        <button
          onClick={() => { setEditing({ id: '', ...emptySlide }); setIsNew(true); }}
          className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6 text-gray-300" />
          <span className="text-sm text-gray-400">Add New Slide</span>
        </button>
      </div>
      )}
    </AdminShell>
  );
}
