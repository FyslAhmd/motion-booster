'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Plus, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { useConfirm } from '@/lib/admin/confirm';
import { toast } from 'sonner';

const BG_OPTIONS = ['bg-red-50', 'bg-orange-50', 'bg-yellow-50', 'bg-green-50', 'bg-blue-50', 'bg-indigo-50', 'bg-purple-50', 'bg-pink-50', 'bg-teal-50', 'bg-cyan-50', 'bg-lime-50', 'bg-rose-50'];
const VALUE_COLOR_OPTIONS = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-blue-500', 'text-indigo-500', 'text-purple-500', 'text-pink-500', 'text-teal-500', 'text-cyan-500', 'text-lime-500', 'text-rose-500'];

interface StatItem {
  id: string;
  value: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  bgColor: string;
  valueColor: string;
  order: number;
}

const BLANK: Omit<StatItem, 'id' | 'order'> = {
  value: '',
  title: '',
  titleBn: '',
  description: '',
  descriptionBn: '',
  bgColor: 'bg-blue-50',
  valueColor: 'text-teal-500',
};

export default function AdminStatsPage() {
  const { confirm } = useConfirm();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [editing, setEditing] = useState<StatItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/stats')
      .then(r => r.json())
      .then(data => setStats(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editing || !editing.value.trim() || !editing.title.trim()) return;
    const ok = await confirm({
      title: isNew ? 'Add Stat' : 'Save Changes',
      message: isNew
        ? 'Are you sure you want to add this stat?'
        : 'Are you sure you want to save the changes to this stat?',
      confirmLabel: isNew ? 'Add' : 'Save',
    });
    if (!ok) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/v1/cms/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setStats(prev => [...prev, created]);
      } else {
        const res = await fetch(`/api/v1/cms/stats/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        const updated = await res.json();
        setStats(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
      setEditing(null);
      setIsNew(false);
      toast.success(isNew ? 'Stat added successfully!' : 'Stat updated successfully!');
    } catch {
      toast.error('Failed to save stat.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/v1/cms/stats/${id}`, { method: 'DELETE' });
      setStats(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
      toast.success('Stat deleted successfully!');
    } catch {
      toast.error('Failed to delete stat.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Stats & Achievements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update the achievement numbers shown on the website</p>
        </div>
        <button onClick={() => { setEditing({ id: '', order: 0, ...BLANK }); setIsNew(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Stat
        </button>
      </div>

      {loading ? (
        <AdminSectionSkeleton variant="grid" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(stat => (
            <div key={stat.id} className={`${stat.bgColor} rounded-2xl p-5 border border-white/50 hover:shadow-md transition-shadow`}>
              <div className={`text-3xl font-bold ${stat.valueColor} mb-1`}>{stat.value}</div>
              <div className="font-semibold text-gray-900 text-sm mb-2">{stat.title}</div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{stat.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => { setEditing({ ...stat }); setIsNew(false); }} className="flex-1 text-xs text-blue-600 hover:bg-blue-50 border border-blue-100 bg-white/60 rounded-lg py-1.5 transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleteId(stat.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/60 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => { setEditing({ id: '', order: 0, ...BLANK }); setIsNew(true); }}
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 min-h-40"
          >
            <Plus className="w-6 h-6 text-gray-300" />
            <span className="text-sm text-gray-400">Add Stat</span>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add Stat' : 'Edit Stat'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                  <input type="text" value={editing.value} onChange={e => setEditing({ ...editing, value: e.target.value })} placeholder="e.g. 500+" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Stat title" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Bangla)</label>
                <input
                  type="text"
                  value={editing.titleBn || ''}
                  onChange={e => setEditing({ ...editing, titleBn: e.target.value })}
                  placeholder="বাংলা টাইটেল (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Bangla)</label>
                <textarea
                  value={editing.descriptionBn || ''}
                  onChange={e => setEditing({ ...editing, descriptionBn: e.target.value })}
                  rows={3}
                  placeholder="বাংলা বর্ণনা (optional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Background</label>
                <div className="flex flex-wrap gap-2">
                  {BG_OPTIONS.map(bg => (
                    <button key={bg} type="button" onClick={() => setEditing({ ...editing, bgColor: bg })}
                      className={`w-8 h-8 rounded-lg ${bg} border ${editing.bgColor === bg ? 'ring-2 ring-gray-400' : 'border-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value Color</label>
                <div className="flex flex-wrap gap-2">
                  {VALUE_COLOR_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => setEditing({ ...editing, valueColor: c })}
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${c} bg-gray-50 ${editing.valueColor === c ? 'ring-2 ring-gray-400' : ''}`}
                    >
                      {editing.value || '99+'}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${editing.bgColor} rounded-xl p-4`}>
                <div className="text-xs text-gray-400 mb-2 font-medium">PREVIEW</div>
                <div className={`text-2xl font-bold ${editing.valueColor}`}>{editing.value || 'Value'}</div>
                <div className="font-semibold text-gray-900 text-sm mt-0.5">{editing.title || 'Title'}</div>
                <div className="text-xs text-gray-500 mt-1">{editing.description || 'Description...'}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !editing.value.trim() || !editing.title.trim()} className="flex items-center gap-2 px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isNew ? 'Add Stat' : 'Save Changes'}
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
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
              <h2 className="font-bold text-gray-900">Delete Stat?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">This achievement stat will be removed from the website.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-2 text-sm hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
