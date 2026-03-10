'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import ImageUpload from '@/components/ui/ImageUpload';
import { Plus, Trash2, GripVertical, Check, Image as ImageIcon, Type, NotebookPen, Loader2 } from 'lucide-react';

interface CompanyItem {
  id: string;
  name: string;
  logoImage?: string | null;
  order: number;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/companies')
      .then(r => r.json())
      .then((data: CompanyItem[]) => {
        if (Array.isArray(data)) {
          setCompanies(data);
          setSavedIds(new Set(data.map(c => c.id)));
        }
      })
      .catch(() => showMsg('Failed to load companies.', 'error'));
  }, []);

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const addCompany = () => {
    const tempId = `new_${Date.now()}`;
    setCompanies(prev => [...prev, { id: tempId, name: 'New Company', logoImage: null, order: prev.length }]);
  };

  const update = (id: string, field: 'name' | 'logoImage', value: string | null) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const remove = async (id: string) => {
    if (savedIds.has(id)) {
      try {
        const res = await fetch(`/api/v1/cms/companies/${id}`, { method: 'DELETE' });
        if (!res.ok) { showMsg('Delete failed.', 'error'); return; }
        setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      } catch {
        showMsg('Delete failed.', 'error');
        return;
      }
    }
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  // drag-reorder
  const onDragStart = (i: number) => setDragIdx(i);
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const arr = [...companies];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, moved);
    setDragIdx(i);
    setCompanies(arr);
  };
  const onDragEnd = () => setDragIdx(null);

  const saveAll = async () => {
    setSaving(true);
    try {
      let finalCompanies = [...companies];

      // POST new (unsaved) items
      const newItems = companies.filter(c => !savedIds.has(c.id));
      for (const item of newItems) {
        if (!item.name.trim()) { showMsg('Company name cannot be empty.', 'error'); setSaving(false); return; }
        const res = await fetch('/api/v1/cms/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, logoImage: item.logoImage }),
        });
        if (!res.ok) { showMsg('Failed to save "' + item.name + '"', 'error'); setSaving(false); return; }
        const created: CompanyItem = await res.json();
        finalCompanies = finalCompanies.map(c => c.id === item.id ? created : c);
      }

      // PATCH existing items
      const existingItems = finalCompanies.filter(c => savedIds.has(c.id));
      await Promise.all(existingItems.map(item =>
        fetch(`/api/v1/cms/companies/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, logoImage: item.logoImage }),
        })
      ));

      // Reorder
      await fetch('/api/v1/cms/companies/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: finalCompanies.map(c => c.id) }),
      });

      setCompanies(finalCompanies);
      setSavedIds(new Set(finalCompanies.map(c => c.id)));
      showMsg('Saved!');
    } catch {
      showMsg('Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 text-white text-sm px-4 py-3 rounded-xl shadow-2xl ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toastType === 'success' && <Check className="inline w-4 h-4 mr-1.5" />}
          {toast}
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Companies Marquee</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage the scrolling company logos on the homepage</p>
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save All
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
          <NotebookPen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Upload a logo image <span className="font-semibold">(recommended: PNG with transparent background)</span> or just enter a company name — it will display as stylised text if no logo is uploaded. Drag rows to reorder.
          </p>
        </div>

        {/* Card List */}
        <div className="space-y-2">
          {companies.map((company, idx) => (
            <div
              key={company.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              className={`bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3 transition-shadow ${dragIdx === idx ? 'opacity-50 shadow-lg' : 'hover:shadow-sm'}`}
            >
              {/* Drag handle */}
              <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Index */}
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-1">
                {idx + 1}
              </div>

              {/* Company Name + Logo */}
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
                      <img src={company.logoImage} alt={company.name} className="h-10 object-contain border border-gray-100 rounded-lg px-2 bg-gray-50" />
                    )}
                    <div className="flex-1">
                      <ImageUpload
                        value={company.logoImage || ''}
                        onChange={v => update(company.id, 'logoImage', v || null)}
                        label={company.logoImage ? 'Replace Logo' : 'Upload Logo'}
                        aspectRatio="wide"
                        maxPx={400}
                        sizeHint="400×200px, PNG transparent bg"
                      />
                    </div>
                    {company.logoImage && (
                      <button
                        onClick={() => update(company.id, 'logoImage', null)}
                        className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                      >
                        Remove
                      </button>
                    )}
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

        {/* Add button */}
        <button
          onClick={addCompany}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-red-400 text-gray-500 hover:text-red-600 text-sm font-medium rounded-xl transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>

        <button
          onClick={saveAll}
          disabled={saving}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </button>
      </div>
    </AdminShell>
  );
}

