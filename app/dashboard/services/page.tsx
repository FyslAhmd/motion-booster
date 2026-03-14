'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { useConfirm } from '@/lib/admin/confirm';
import { ServiceItem } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const COLOR_OPTIONS = [
  { label: 'Purple', value: 'bg-purple-400' },
  { label: 'Red', value: 'bg-red-400' },
  { label: 'Green', value: 'bg-green-400' },
  { label: 'Blue', value: 'bg-blue-400' },
  { label: 'Cyan', value: 'bg-cyan-400' },
  { label: 'Orange', value: 'bg-orange-400' },
  { label: 'Pink', value: 'bg-pink-400' },
  { label: 'Indigo', value: 'bg-indigo-400' },
  { label: 'Teal', value: 'bg-teal-400' },
  { label: 'Yellow', value: 'bg-yellow-400' },
];

const ICON_OPTIONS = [
  { label: 'Document', value: 'document' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'List', value: 'list' },
  { label: 'Chart', value: 'chart' },
  { label: 'Sync', value: 'sync' },
  { label: 'Users', value: 'users' },
  { label: 'Star', value: 'star' },
  { label: 'Check', value: 'check' },
  { label: 'Globe', value: 'globe' },
  { label: 'Lock', value: 'lock' },
  { label: 'Lightning', value: 'lightning' },
  { label: 'Rocket', value: 'rocket' },
];

const BLANK: Omit<ServiceItem, 'id'> = {
  title: '',
  description: '',
  iconColor: 'bg-red-400',
  iconType: 'document',
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/services')
      .then(r => r.json())
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, []);

  const { confirm } = useConfirm();

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.description.trim()) return;
    if (!await confirm({ title: isNew ? 'Add Service' : 'Save Changes', message: 'Are you sure you want to save these changes?' })) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/v1/cms/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setServices(prev => [...prev, created]);
      } else {
        const res = await fetch(`/api/v1/cms/services/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        const updated = await res.json();
        setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
      setEditing(null);
      setIsNew(false);
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/cms/services/${id}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
      toast.success('Saved!');
    } catch {
      toast.error('Failed to delete service.');
    }
  };

  const handleReset = async () => {
    try {
      // Delete all then re-fetch (API auto-seeds defaults when empty)
      await Promise.all(services.map(s => fetch(`/api/v1/cms/services/${s.id}`, { method: 'DELETE' })));
      const res = await fetch('/api/v1/cms/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
      toast.success('Saved!');
    } catch {
      toast.error('Failed to reset services.');
    }
  };

  return (
    <AdminShell>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All services will be replaced with the default data. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { handleReset(); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Services Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the service cards displayed on the homepage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            Reset to Default
          </button>
          <button
            onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {initialLoading ? (
        <AdminSectionSkeleton variant="grid" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {services.map((service, idx) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-10 h-10 ${service.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">{service.iconType.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => { setEditing({ ...service }); setIsNew(false); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(service.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{service.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{service.description}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${service.iconColor}`} />
                <span className="text-xs text-gray-400">{service.iconType}</span>
                <span className="text-xs text-gray-300 ml-auto">#{idx + 1}</span>
              </div>
            </div>
          ))}

          {/* Add new card placeholder */}
          <button
            onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }}
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 min-h-40"
          >
            <Plus className="w-6 h-6 text-gray-300" />
            <span className="text-sm text-gray-400">Add New Service</span>
          </button>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add New Service' : 'Edit Service'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Service title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Brief description of the service"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setEditing({ ...editing, iconColor: c.value })}
                        className={`w-7 h-7 rounded-lg ${c.value} ${editing.iconColor === c.value ? 'ring-2 ring-offset-1 ring-gray-600' : ''}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Type</label>
                  <select
                    value={editing.iconType}
                    onChange={e => setEditing({ ...editing, iconType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    {ICON_OPTIONS.map(i => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-2 font-medium">PREVIEW</div>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${editing.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xs font-bold">{editing.iconType.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{editing.title || 'Service Title'}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{editing.description || 'Service description here...'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.title.trim() || !editing.description.trim()}
                className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : isNew ? 'Add Service' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-bold text-gray-900">Delete Service?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove the service card from the website.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
