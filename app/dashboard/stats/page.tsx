'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, StatItem, defaultStats, generateId } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';

const BG_OPTIONS = ['bg-green-50', 'bg-lime-50', 'bg-yellow-50', 'bg-blue-50', 'bg-purple-50', 'bg-orange-50', 'bg-red-50', 'bg-pink-50', 'bg-teal-50', 'bg-indigo-50'];
const VALUE_COLOR_OPTIONS = ['text-teal-500', 'text-red-500', 'text-blue-500', 'text-purple-500', 'text-green-500', 'text-orange-500', 'text-pink-500', 'text-indigo-500'];

const BLANK: Omit<StatItem, 'id'> = {
  value: '',
  title: '',
  description: '',
  bgColor: 'bg-blue-50',
  valueColor: 'text-teal-500',
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [editing, setEditing] = useState<StatItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setStats(AdminStore.getStats());
  }, []);

  const persist = (data: StatItem[]) => {
    AdminStore.saveStats(data);
    setStats(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    if (!editing || !editing.value.trim() || !editing.title.trim()) return;
    let updated: StatItem[];
    if (isNew) {
      updated = [...stats, { ...editing, id: generateId() }];
    } else {
      updated = stats.map(s => s.id === editing.id ? editing : s);
    }
    persist(updated);
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    persist(stats.filter(s => s.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminShell>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All stats will be replaced with the default data. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { persist(defaultStats); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Stats & Achievements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update the achievement numbers shown on the website</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm"><Check className="w-4 h-4" /> Saved!</span>}
          <button onClick={() => setShowResetConfirm(true)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Reset Default</button>
          <button onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Stat
          </button>
        </div>
      </div>

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
          onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 min-h-40"
        >
          <Plus className="w-6 h-6 text-gray-300" />
          <span className="text-sm text-gray-400">Add Stat</span>
        </button>
      </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
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
              {/* Preview */}
              <div className={`${editing.bgColor} rounded-xl p-4`}>
                <div className="text-xs text-gray-400 mb-2 font-medium">PREVIEW</div>
                <div className={`text-2xl font-bold ${editing.valueColor}`}>{editing.value || 'Value'}</div>
                <div className="font-semibold text-gray-900 text-sm mt-0.5">{editing.title || 'Title'}</div>
                <div className="text-xs text-gray-500 mt-1">{editing.description || 'Description...'}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!editing.value.trim() || !editing.title.trim()} className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
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
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
