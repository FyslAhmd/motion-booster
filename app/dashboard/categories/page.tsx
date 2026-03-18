'use client';

import { useState, useEffect, useRef, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { ServiceCategoryItem } from '@/lib/admin/store';
import { CategoryIcon, ICON_OPTIONS } from '@/lib/admin/categoryIcons';
import { Plus, Pencil, Trash2, X, Save, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

const COLOR_OPTIONS = [
  { label: 'Green',   text: 'text-green-600',  bg: 'bg-green-50'  },
  { label: 'Purple',  text: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Blue',    text: 'text-blue-600',   bg: 'bg-blue-50'   },
  { label: 'Cyan',    text: 'text-cyan-600',   bg: 'bg-cyan-50'   },
  { label: 'Pink',    text: 'text-pink-600',   bg: 'bg-pink-50'   },
  { label: 'Orange',  text: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Yellow',  text: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Red',     text: 'text-red-500',    bg: 'bg-red-50'    },
  { label: 'Indigo',  text: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Teal',    text: 'text-teal-600',   bg: 'bg-teal-50'   },
  { label: 'Rose',    text: 'text-rose-500',   bg: 'bg-rose-50'   },
  { label: 'Amber',   text: 'text-amber-600',  bg: 'bg-amber-50'  },
];

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const emptyItem: Omit<ServiceCategoryItem, 'id'> = {
  title: '',
  slug: '',
  iconType: 'layers',
  iconColor: 'text-blue-600',
  iconBg: 'bg-blue-50',
  logoImage: '',
};

function CategoriesListSkeleton() {
  return (
    <ul className="divide-y divide-gray-50">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  const [items, setItems] = useState<ServiceCategoryItem[]>([]);
  const [editing, setEditing] = useState<ServiceCategoryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragReordered, setDragReordered] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [touchDragIdx, setTouchDragIdx] = useState<number | null>(null);
  const touchStartYRef = useRef(0);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const itemsRef = useRef<ServiceCategoryItem[]>([]);

  useEffect(() => {
    fetch('/api/v1/cms/service-categories')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .catch(() => toast.error('Failed to load categories.'))
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const { confirm } = useConfirm();

  const persistOrder = async (orderedItems: ServiceCategoryItem[]) => {
    await fetch('/api/v1/cms/service-categories/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: orderedItems.map(i => i.id) }),
    }).catch(() => toast.error('Reorder failed.'));
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast.error('Title is required.'); return; }
    if (!await confirm({ title: 'Save Changes', message: 'Are you sure you want to save these changes?' })) return;
    const withSlug = { ...editing, slug: editing.slug.trim() || toSlug(editing.title) };
    setLoading(true);
    try {
      const url = isNew ? '/api/v1/cms/service-categories' : `/api/v1/cms/service-categories/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(withSlug) });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || 'Save failed.'); return; }
      const saved: ServiceCategoryItem = await res.json();
      setItems(prev => isNew ? [...prev, saved] : prev.map(i => i.id === saved.id ? saved : i));
      setEditing(null);
      setIsNew(false);
      toast.success(isNew ? 'Category added!' : 'Changes saved!');
    } catch { toast.error('Save failed.'); } finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/cms/service-categories/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Delete failed.'); return; }
      setItems(prev => prev.filter(i => i.id !== id));
      setDeleteId(null);
      toast.success('Category deleted.');
    } catch { toast.error('Delete failed.'); } finally { setLoading(false); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const arr = [...items];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setItems(arr);
    await persistOrder(arr);
  };

  const onDragStart = (e: DragEvent<HTMLLIElement>, index: number) => {
    const fromHandle = (e.target as HTMLElement).closest('[data-drag-handle="true"]');
    if (!fromHandle) {
      e.preventDefault();
      return;
    }
    setDragIdx(index);
    setDragReordered(false);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', items[index]?.id || '');
  };

  const onDragOver = (e: DragEvent<HTMLLIElement>, overIndex: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === overIndex) return;

    setItems(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(overIndex, 0, moved);
      itemsRef.current = arr;
      return arr;
    });
    setDragIdx(overIndex);
    setDragReordered(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragEnd = async () => {
    const shouldPersist = dragReordered;
    setDragIdx(null);
    setDragReordered(false);
    if (!shouldPersist) return;
    await persistOrder(itemsRef.current);
  };

  const moveAt = (from: number, to: number) => {
    setItems(prev => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length || from === to) return prev;
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      itemsRef.current = arr;
      return arr;
    });
  };

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (!isCoarsePointer) return;
    setTouchDragIdx(index);
    touchStartYRef.current = e.clientY;
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isCoarsePointer || touchDragIdx === null) return;
    const deltaY = e.clientY - touchStartYRef.current;
    const threshold = 26;

    if (deltaY > threshold && touchDragIdx < itemsRef.current.length - 1) {
      const next = touchDragIdx + 1;
      moveAt(touchDragIdx, next);
      setTouchDragIdx(next);
      touchStartYRef.current = e.clientY;
    } else if (deltaY < -threshold && touchDragIdx > 0) {
      const next = touchDragIdx - 1;
      moveAt(touchDragIdx, next);
      setTouchDragIdx(next);
      touchStartYRef.current = e.clientY;
    }
  };

  const onHandlePointerUp = async () => {
    if (!isCoarsePointer || touchDragIdx === null) return;
    setTouchDragIdx(null);
    await persistOrder(itemsRef.current);
  };

  const openNew = () => {
    setEditing({ ...emptyItem, id: '' });
    setIsNew(true);
  };

  const openEdit = (item: ServiceCategoryItem) => {
    setEditing({ ...item });
    setIsNew(false);
  };

  const setColor = (opt: typeof COLOR_OPTIONS[0]) => {
    if (!editing) return;
    setEditing({ ...editing, iconColor: opt.text, iconBg: opt.bg });
  };

  const handleLogoChange = (nextValue: string) => {
    if (nextValue !== '') {
      setEditing(prev => (prev ? { ...prev, logoImage: nextValue } : prev));
      return;
    }

    if (!editing?.logoImage) {
      setEditing(prev => (prev ? { ...prev, logoImage: '' } : prev));
      return;
    }

    void confirm({
      title: 'Remove Logo?',
      message: 'Are you sure you want to remove this category logo?',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
    }).then((ok) => {
      if (!ok) return;
      setEditing(prev => (prev ? { ...prev, logoImage: '' } : prev));
    });
  };

  const selectedColor = COLOR_OPTIONS.find(c => c.text === editing?.iconColor);

  return (
    <AdminShell>
      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => remove(deleteId)} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{isNew ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Category Title *</label>
                <input
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value, slug: toSlug(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="e.g. Digital Marketing"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">URL Slug <span className="text-gray-400 font-normal">(auto-generated)</span></label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                  <span className="text-gray-400 text-xs">/category/</span>
                  <input
                    value={editing.slug}
                    onChange={e => setEditing({ ...editing, slug: e.target.value })}
                    className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                    placeholder="digital-marketing"
                  />
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Icon</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setEditing({ ...editing, iconType: icon })}
                      title={icon}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        editing.iconType === icon
                          ? `${editing.iconBg} ring-2 ring-offset-1 ring-red-500 scale-110`
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <CategoryIcon iconType={icon} className={`w-4 h-4 ${editing.iconColor}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Color</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.text}
                      onClick={() => setColor(opt)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        editing.iconColor === opt.text
                          ? 'ring-2 ring-red-500 bg-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${opt.bg} flex items-center justify-center`}>
                        <CategoryIcon iconType={editing.iconType} className={`w-4 h-4 ${opt.text}`} />
                      </div>
                      <span className="text-[10px] text-gray-500">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">
                  <ImageIcon className="w-3 h-3" /> Logo Image
                </label>
                <ImageUpload
                  value={editing.logoImage || ''}
                  onChange={handleLogoChange}
                  label={editing.logoImage ? 'Replace Logo' : 'Upload Logo'}
                  aspectRatio="square"
                  maxPx={360}
                  sizeHint="360×360px PNG recommended"
                />
              </div>

              {/* Preview */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <p className="text-xs text-gray-400 mb-3">Preview</p>
                <div className="flex flex-col items-center justify-center w-36 h-28 bg-white border border-gray-100 rounded-2xl shadow-sm mx-auto">
                  <div className={`mb-2 w-11 h-11 rounded-xl flex items-center justify-center ${editing.iconBg}`}>
                    {editing.logoImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.logoImage} alt="Category logo preview" className="w-7 h-7 object-contain" />
                    ) : (
                      <CategoryIcon iconType={editing.iconType} className={`w-6 h-6 ${editing.iconColor}`} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-800 text-center leading-tight px-3">
                    {editing.title || 'Category Name'}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600">
                Cancel
              </button>
              <button onClick={save} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium">
                <Save className="w-4 h-4" />
                {isNew ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Service Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the "Our Service" cards shown on the homepage. Drag to reorder.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {initialLoading ? (
          <CategoriesListSkeleton />
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium text-gray-500">No categories yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable={!isCoarsePointer}
                onDragStart={e => onDragStart(e, index)}
                onDragOver={e => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group ${
                  dragIdx === index || touchDragIdx === index ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                {/* Grip */}
                <button
                  type="button"
                  data-drag-handle="true"
                  onPointerDown={(e) => onHandlePointerDown(e, index)}
                  onPointerMove={onHandlePointerMove}
                  onPointerUp={onHandlePointerUp}
                  onPointerCancel={onHandlePointerUp}
                  onPointerLeave={onHandlePointerUp}
                  className="cursor-grab active:cursor-grabbing shrink-0 p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                  title={isCoarsePointer ? 'Drag up/down to reorder' : 'Drag to reorder'}
                  aria-label="Drag to reorder"
                >
                  <span className="pointer-events-none grid grid-cols-2 gap-0.5">
                    {Array.from({ length: 6 }).map((_, dotIndex) => (
                      <span key={dotIndex} className="h-0.5 w-0.5 rounded-full bg-current" />
                    ))}
                  </span>
                </button>

                {/* Icon preview */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  {item.logoImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.logoImage} alt={item.title} className="w-6 h-6 object-contain" />
                  ) : (
                    <CategoryIcon iconType={item.iconType} className={`w-5 h-5 ${item.iconColor}`} />
                  )}
                </div>

                {/* Title + slug */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-400">/category/{item.slug}</div>
                </div>

                {/* Reorder */}
                <div className="hidden sm:flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20">
                    <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === items.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="relative z-10 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(item.id)} className="relative z-10 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
