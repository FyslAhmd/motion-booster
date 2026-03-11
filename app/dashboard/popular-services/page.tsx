'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { PopularServiceItem } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Save, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import Image from 'next/image';
import ImageUpload from '@/components/ui/ImageUpload';

const IMAGE_OPTIONS = [
  '/service-digital-marketing.jpg',
  '/service-graphics-design.jpg',
  '/service-software-dev.jpg',
  '/service-web-dev.jpg',
  '/service-video-animation.jpg',
  '/service-mobile-app.jpg',
  '/service-uiux-design.jpg',
  '/service-branding.jpg',
  '/service-consulting.jpg',
  '/service-specialized.jpg',
];

const GRADIENT_OPTIONS = [
  { label: 'Green',  value: 'from-green-700 via-green-600 to-emerald-500' },
  { label: 'Purple', value: 'from-purple-800 via-purple-700 to-purple-500' },
  { label: 'Blue',   value: 'from-blue-800 via-blue-700 to-indigo-500' },
  { label: 'Cyan',   value: 'from-cyan-800 via-cyan-600 to-teal-500' },
  { label: 'Red',    value: 'from-red-800 via-red-700 to-rose-500' },
  { label: 'Pink',   value: 'from-pink-800 via-pink-700 to-rose-500' },
  { label: 'Orange', value: 'from-orange-700 via-orange-600 to-amber-500' },
  { label: 'Yellow', value: 'from-yellow-700 via-amber-600 to-yellow-500' },
  { label: 'Indigo', value: 'from-indigo-800 via-indigo-700 to-violet-500' },
  { label: 'Teal',   value: 'from-teal-800 via-teal-600 to-emerald-500' },
];

const toSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const emptyItem: Omit<PopularServiceItem, 'id'> = {
  title: '',
  description: '',
  gradient: GRADIENT_OPTIONS[0].value,
  category: '',
  slug: '',
  image: IMAGE_OPTIONS[0],
  customImage: '',
  services: [''],
};

export default function PopularServicesPage() {
  const [items, setItems] = useState<PopularServiceItem[]>([]);
  const [editing, setEditing] = useState<PopularServiceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/v1/cms/popular-services')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .catch(() => showToast('Failed to load services.'));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const { confirm } = useConfirm();

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { setModalError('Title is required.'); return; }
    if (!await confirm({ title: 'Save Changes', message: 'Are you sure you want to save these changes?' })) return;
    setModalError('');
    const item = {
      ...editing,
      slug: editing.slug.trim() || toSlug(editing.title),
      services: editing.services.filter(s => s.trim()),
    };
    setLoading(true);
    try {
      const url = isNew ? '/api/v1/cms/popular-services' : `/api/v1/cms/popular-services/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (!res.ok) {
        let errMsg = 'Save failed.';
        try { const e = await res.json(); errMsg = e.error || errMsg; } catch {}
        setModalError(errMsg);
        return;
      }
      const saved: PopularServiceItem = await res.json();
      setItems(prev => isNew ? [...prev, saved] : prev.map(i => i.id === saved.id ? saved : i));
      setEditing(null);
      setIsNew(false);
      showToast(isNew ? 'Service card added!' : 'Changes saved!');
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Save failed.');
    } finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/cms/popular-services/${id}`, { method: 'DELETE' });
      if (!res.ok) { showToast('Delete failed.'); return; }
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteId(null);
      showToast('Service deleted.');
    } catch { showToast('Delete failed.'); } finally { setLoading(false); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const arr = [...items];
    const t = index + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[index], arr[t]] = [arr[t], arr[index]];
    setItems(arr);
    await fetch('/api/v1/cms/popular-services/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: arr.map(i => i.id) }),
    }).catch(() => showToast('Reorder failed.'));
  };

  const updateFeature = (idx: number, val: string) => {
    if (!editing) return;
    const s = [...editing.services];
    s[idx] = val;
    setEditing({ ...editing, services: s });
  };

  const addFeature = () => editing && setEditing({ ...editing, services: [...editing.services, ''] });

  const removeFeature = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, services: editing.services.filter((_, i) => i !== idx) });
  };

  return (
    <AdminShell>
      {toast && (
        <div className="fixed top-6 right-6 z-200 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl">{toast}</div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Service Card?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
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
              <h2 className="font-semibold text-gray-900">{isNew ? 'Add Service Card' : 'Edit Service Card'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); setModalError(''); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Card Title *</label>
                <input
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value, slug: toSlug(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="e.g. Digital Marketing Services"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea
                  value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                  placeholder="Short description shown below the title..."
                />
              </div>

              {/* Category + Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Category (for tab filter)</label>
                  <input
                    value={editing.category}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                    placeholder="e.g. Digital Marketing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">URL Slug</label>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                    <span className="text-gray-400 text-xs shrink-0">/category/</span>
                    <input
                      value={editing.slug}
                      onChange={e => setEditing({ ...editing, slug: e.target.value })}
                      className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none min-w-0"
                      placeholder="digital-marketing"
                    />
                  </div>
                </div>
              </div>

              {/* Image picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Cover Image</label>
                <ImageUpload
                  value={editing.customImage || ''}
                  onChange={v => setEditing({ ...editing, customImage: v })}
                  label="Upload Custom Image (overrides preset below)"
                  aspectRatio="wide"
                  sizeHint="800×450px recommended"
                />
                <p className="text-xs text-gray-400 mt-2 mb-2">— or choose a preset —</p>
                <div className="grid grid-cols-5 gap-2">
                  {IMAGE_OPTIONS.map(img => (
                    <button
                      key={img}
                      onClick={() => setEditing({ ...editing, image: img, customImage: '' })}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all ${!editing.customImage && editing.image === img ? 'border-red-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <Image src={img} alt={img} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Gradient Colour</label>
                <div className="grid grid-cols-5 gap-2">
                  {GRADIENT_OPTIONS.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setEditing({ ...editing, gradient: g.value })}
                      title={g.label}
                      className={`h-8 rounded-xl bg-linear-to-r ${g.value} transition-all ${editing.gradient === g.value ? 'ring-2 ring-offset-1 ring-gray-800 scale-110' : 'hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Feature list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500">Feature / Services List</label>
                  <button onClick={addFeature} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {editing.services.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-gray-300 text-xs w-4 shrink-0">{idx + 1}.</span>
                      <input
                        value={feat}
                        onChange={e => updateFeature(idx, e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                        placeholder="e.g. SEO Optimization & Link Building"
                      />
                      <button onClick={() => removeFeature(idx)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {modalError && (
              <div className="mx-6 mb-1 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                {modalError}
              </div>
            )}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setEditing(null); setIsNew(false); setModalError(''); }} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600">Cancel</button>
              <button onClick={save} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium">
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isNew ? 'Add Card' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Popular Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the "Our Popular Services" cards on the homepage slider.</p>
        </div>
        <button
          onClick={() => { setEditing({ ...emptyItem, id: '' }); setIsNew(true); setModalError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium text-gray-500">No service cards yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDragIdx(index)}
                onDragOver={e => e.preventDefault()}
                onDrop={async () => {
                  if (dragIdx === null || dragIdx === index) { setDragIdx(null); return; }
                  const arr = [...items];
                  const [moved] = arr.splice(dragIdx, 1);
                  arr.splice(index, 0, moved);
                  setItems(arr);
                  setDragIdx(null);
                  await fetch('/api/v1/cms/popular-services/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: arr.map(i => i.id) }),
                  }).catch(() => showToast('Reorder failed.'));
                }}
                onDragEnd={() => setDragIdx(null)}
                className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 transition-colors group ${
                  dragIdx === index ? 'opacity-40 bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />

                {/* Image thumb */}
                <div className="relative w-12 h-9 sm:w-14 sm:h-10 rounded-lg overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                  <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-40`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-30 sm:max-w-none">{item.category || 'No category'}</span>
                    <span className="shrink-0">{item.services.length} features</span>
                  </div>
                </div>

                {/* Reorder */}
                <div className="flex flex-col gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20">
                    <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === items.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { setEditing({ ...item }); setIsNew(false); }} className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(item.id)} className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
