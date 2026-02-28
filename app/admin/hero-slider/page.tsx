'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, HeroSlideItem, defaultHeroSlides, generateId } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Save, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import ImageUpload from '@/components/ui/ImageUpload';

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
  ctaText: 'Get Started',
  ctaLink: '/features',
};

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [editing, setEditing] = useState<HeroSlideItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setSlides(AdminStore.getHeroSlides());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const persist = (data: HeroSlideItem[]) => {
    AdminStore.saveHeroSlides(data);
    setSlides(data);
    window.dispatchEvent(new Event('storage'));
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) { showToast('Title is required.'); return; }
    const updated = isNew
      ? [...slides, { ...editing, id: generateId() }]
      : slides.map(s => (s.id === editing.id ? editing : s));
    persist(updated);
    setEditing(null);
    setIsNew(false);
    showToast(isNew ? 'Slide added!' : 'Changes saved!');
  };

  const remove = (id: string) => {
    persist(slides.filter(s => s.id !== id));
    setDeleteId(null);
    showToast('Slide deleted.');
  };

  const move = (index: number, dir: -1 | 1) => {
    const arr = [...slides];
    const t = index + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[index], arr[t]] = [arr[t], arr[index]];
    persist(arr);
  };

  const coverSrc = (slide: HeroSlideItem) => slide.customImage || slide.image;

  return (
    <AdminShell>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl">{toast}</div>
      )}

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
                label="Slide Background Image (upload custom)"
                aspectRatio="wide"
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

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Title *</label>
                <input
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="e.g. Become an IT Pro & Rule the Digital World"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea
                  value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                  placeholder="Supporting text shown below the title..."
                />
              </div>

              {/* Badge + CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Badge / Tag</label>
                  <input
                    value={editing.badge || ''}
                    onChange={e => setEditing({ ...editing, badge: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                    placeholder="e.g. Unleash Your Potential"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Button Text</label>
                  <input
                    value={editing.ctaText || ''}
                    onChange={e => setEditing({ ...editing, ctaText: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                    placeholder="e.g. Browse Course"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Button Link</label>
                  <input
                    value={editing.ctaLink || ''}
                    onChange={e => setEditing({ ...editing, ctaLink: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                    placeholder="e.g. /features"
                  />
                </div>
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

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hero Slider</h1>
          <p className="text-sm text-gray-500 mt-0.5">{slides.length} slide{slides.length !== 1 ? 's' : ''} · shown on homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => persist(defaultHeroSlides)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Reset Default</button>
          <button
            onClick={() => { setEditing({ id: '', ...emptySlide }); setIsNew(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>
      </div>

      {/* Slides list */}
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
                {slide.badge && <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-1">{slide.badge}</span>}
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{slide.title}</h3>
                {slide.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{slide.description}</p>}
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
    </AdminShell>
  );
}
