'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, CompanyItem, defaultCompanies, generateId } from '@/lib/admin/store';
import ImageUpload from '@/components/ui/ImageUpload';
import { Plus, Trash2, GripVertical, Check, RotateCcw, Building2, Image as ImageIcon, Type, NotebookPen } from 'lucide-react';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setCompanies(AdminStore.getCompanies());
  }, []);

  const showMsg = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const save = (data: CompanyItem[]) => {
    AdminStore.saveCompanies(data);
    setCompanies(data);
    window.dispatchEvent(new Event('storage'));
    showMsg('Saved!');
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

  const reset = () => {
    save(defaultCompanies);
    showMsg('Reset to defaults!');
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

  return (
    <AdminShell>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 text-white text-sm px-4 py-3 rounded-xl shadow-2xl ${toastType === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toastType === 'success' && <Check className="inline w-4 h-4 mr-1.5" />}
          {toast}
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All company logos will be replaced with the default data. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { reset(); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Companies Marquee</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage the scrolling company logos on the homepage</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => save(companies)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Save All
            </button>
          </div>
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
                    <ImageIcon className="w-3 h-3" /> Logo Image <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {company.logoImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.logoImage} alt={company.name} className="h-10 object-contain border border-gray-100 rounded-lg px-2 bg-gray-50" />
                    )}
                    <div className="flex-1">
                      <ImageUpload
                        value={company.logoImage || ''}
                        onChange={v => update(company.id, 'logoImage', v)}
                        label={company.logoImage ? 'Replace Logo' : 'Upload Logo'}
                        aspectRatio="wide"
                        maxPx={400}
                        sizeHint="400×200px, PNG transparent bg"
                      />
                    </div>
                    {company.logoImage && (
                      <button
                        onClick={() => update(company.id, 'logoImage', '')}
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
          onClick={() => save(companies)}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Save Changes
        </button>
      </div>
    </AdminShell>
  );
}
