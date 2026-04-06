'use client';

import { useState, useEffect, useRef, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { CompanyItem, defaultCompanies, generateId } from '@/lib/admin/store';
import ImageUpload from '@/components/ui/ImageUpload';
import { Plus, Trash2, GripVertical, Check, RotateCcw, Building2, Image as ImageIcon, Type, NotebookPen } from 'lucide-react';
import { toast } from 'sonner';

function CompaniesCardsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"
        >
          <div className="mt-1 h-4 w-4 shrink-0 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-6 w-6 shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-full animate-pulse rounded-xl bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-200" />
            </div>
          </div>
          <div className="mt-1 h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [touchDragIdx, setTouchDragIdx] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const touchStartYRef = useRef(0);
  const touchPointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const normalizeCompanies = (data: unknown): CompanyItem[] => {
      if (!Array.isArray(data)) return [];
      return data
        .map((row: any) => ({
          id: String(row?.id || generateId()),
          name: String(row?.name || '').trim(),
          logoImage: (row?.logoImage || row?.logo_image || '') as string,
        }))
        .filter((row: CompanyItem) => row.name.length > 0);
    };

    const load = async () => {
      try {
        const res = await fetch('/api/v1/cms/companies', { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled) {
          setCompanies(normalizeCompanies(json));
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load companies');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const { confirm } = useConfirm();

  const save = async (data: CompanyItem[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/cms/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || 'Failed to save companies');
      }

      setCompanies(Array.isArray(json) ? json : data);
      localStorage.setItem('companies:lastUpdated', String(Date.now()));
      toast.success('Saved!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save companies');
    } finally {
      setSaving(false);
    }
  };

  const addCompany = () => {
    const updated = [...companies, { id: generateId(), name: 'New Company', logoImage: '' }];
    setCompanies(updated);
  };

  const update = (id: string, field: keyof CompanyItem, value: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const remove = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const reset = async () => {
    await save(defaultCompanies);
    toast.success('Reset to defaults!');
  };

  // drag-reorder
  const moveAt = (from: number, to: number) => {
    setCompanies(prev => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length || from === to) return prev;
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    const fromHandle = (e.target as HTMLElement).closest('[data-drag-handle="true"]');
    if (!fromHandle) {
      e.preventDefault();
      return;
    }

    setDragIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', companies[index]?.id || '');
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const arr = [...companies];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, moved);
    setDragIdx(i);
    setCompanies(arr);
  };

  const onDragEnd = () => setDragIdx(null);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (!isCoarsePointer) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    touchPointerIdRef.current = e.pointerId;
    setTouchDragIdx(index);
    setDragIdx(index);
    touchStartYRef.current = e.clientY;
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isCoarsePointer || touchDragIdx === null) return;
    if (touchPointerIdRef.current !== null && e.pointerId !== touchPointerIdRef.current) return;
    e.preventDefault();
    const deltaY = e.clientY - touchStartYRef.current;
    const threshold = 26;

    if (deltaY > threshold && touchDragIdx < companies.length - 1) {
      const next = touchDragIdx + 1;
      moveAt(touchDragIdx, next);
      setTouchDragIdx(next);
      setDragIdx(next);
      touchStartYRef.current = e.clientY;
    } else if (deltaY < -threshold && touchDragIdx > 0) {
      const next = touchDragIdx - 1;
      moveAt(touchDragIdx, next);
      setTouchDragIdx(next);
      setDragIdx(next);
      touchStartYRef.current = e.clientY;
    }
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isCoarsePointer || touchDragIdx === null) return;
    if (touchPointerIdRef.current !== null && e.pointerId !== touchPointerIdRef.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    touchPointerIdRef.current = null;
    setTouchDragIdx(null);
    setDragIdx(null);
  };

  return (
    <AdminShell>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All company logos will be replaced with the default data. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={async () => { await reset(); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="bg-linear-to-br from-red-50 via-white to-rose-50 -mx-6 -mt-6 px-6 pt-8 pb-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Companies Marquee</h1>
              <p className="text-sm text-gray-600">Manage the scrolling company logos on the homepage.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={async () => { if (await confirm({ title: 'Save Changes', message: 'Are you sure you want to save?' })) await save(companies); }}
              disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Check className="w-4 h-4" /> Save All
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
          <NotebookPen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Upload a logo image <span className="font-semibold">(recommended: PNG with transparent background)</span> or just enter a company name — it will display as stylised text if no logo is uploaded. Drag rows to reorder.
          </p>
        </div>

        {/* Card List */}
        {initialLoading ? (
          <CompaniesCardsSkeleton />
        ) : (
          <div className="space-y-2">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                draggable={!isCoarsePointer}
                onDragStart={e => onDragStart(e, idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                className={`bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3 transition-shadow ${dragIdx === idx ? 'opacity-50 shadow-lg' : 'hover:shadow-sm'}`}
              >
                {/* Drag handle */}
                <button
                  type="button"
                  data-drag-handle="true"
                  onPointerDown={(e) => onHandlePointerDown(e, idx)}
                  onPointerMove={onHandlePointerMove}
                  onPointerUp={onHandlePointerUp}
                  onPointerCancel={onHandlePointerUp}
                  className="mt-1 shrink-0 cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                  aria-label="Reorder company"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                {/* Index */}
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-1">
                  {idx + 1}
                </div>

                {/* Company Name */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1.5">
                      <Type className="w-3 h-3" /> Company Name
                    </label>
                    <input
                      value={company.name}
                      onChange={e => update(company.id, 'name', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="Company name"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1.5">
                      <ImageIcon className="w-3 h-3" /> Logo Image
                    </label>
                    <div className="flex items-center gap-3">
                      {company.logoImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={company.logoImage} alt={company.name} className="h-10 w-auto object-contain border border-gray-100 rounded-lg bg-gray-50 p-1.5" />
                      )}
                      <div className="w-[140px] sm:w-[170px] shrink-0">
                        <ImageUpload
                          value=""
                          onChange={v => update(company.id, 'logoImage', v)}
                          label="Upload Logo"
                          aspectRatio="wide"
                          maxPx={400}
                          sizeHint="400×200px, PNG transparent bg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => remove(company.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add + Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={addCompany}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-red-400 text-gray-500 hover:text-red-600 text-sm font-medium rounded-xl transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" /> Add Company
          </button>
        </div>

        <button
          onClick={async () => { if (await confirm({ title: 'Save Changes', message: 'Are you sure you want to save?' })) await save(companies); }}
          disabled={saving}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </AdminShell>
  );
}
