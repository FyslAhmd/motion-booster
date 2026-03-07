'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, TestimonialItem, defaultTestimonials, generateId } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, Star } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

const AVATAR_BG_OPTIONS = [
  { label: 'Blue', value: 'from-blue-500 to-indigo-600' },
  { label: 'Rose', value: 'from-rose-500 to-pink-600' },
  { label: 'Green', value: 'from-green-500 to-teal-600' },
  { label: 'Orange', value: 'from-orange-500 to-amber-600' },
  { label: 'Purple', value: 'from-purple-500 to-violet-600' },
  { label: 'Red', value: 'from-red-500 to-red-700' },
  { label: 'Cyan', value: 'from-cyan-500 to-blue-500' },
  { label: 'Emerald', value: 'from-emerald-500 to-green-600' },
];

const SERVICE_OPTIONS = ['Web Development', 'Digital Marketing', 'Brand Design', 'Graphic Design', 'Video Editing', 'App Development', 'SEO', 'Content Marketing', 'Photography', 'Other'];

const BLANK: Omit<TestimonialItem, 'id'> = {
  name: '',
  role: '',
  avatar: '',
  avatarBg: 'from-blue-500 to-indigo-600',
  avatarImage: '',
  rating: 5,
  review: '',
  service: 'Web Development',
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setItems(AdminStore.getTestimonials());
  }, []);

  const persist = (data: TestimonialItem[]) => {
    AdminStore.saveTestimonials(data);
    setItems(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    if (!editing || !editing.name.trim() || !editing.review.trim()) return;
    const clean = {
      ...editing,
      avatar: editing.avatar.trim() || editing.name.slice(0, 2).toUpperCase(),
    };
    let updated: TestimonialItem[];
    if (isNew) {
      updated = [...items, { ...clean, id: generateId() }];
    } else {
      updated = items.map(t => t.id === editing.id ? clean : t);
    }
    persist(updated);
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    persist(items.filter(t => t.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminShell>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Reset to Default?</h3>
            <p className="text-sm text-gray-500 mb-6">All current testimonials will be replaced with the default data. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { persist(defaultTestimonials); setShowResetConfirm(false); }} className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">Reset</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage client reviews and testimonials</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm"><Check className="w-4 h-4" /> Saved!</span>}
          <button onClick={() => setShowResetConfirm(true)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Reset Default</button>
          <button onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-4">"{item.review}"</p>

            <div className="flex items-center gap-3 mb-3">
              {item.avatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.avatarImage} alt={item.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
              ) : (
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {item.avatar || item.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-400">{item.role}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">{item.service}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing({ ...item }); setIsNew(false); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 min-h-[180px]"
        >
          <Plus className="w-6 h-6 text-gray-300" />
          <span className="text-sm text-gray-400">Add Testimonial</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add Testimonial' : 'Edit Testimonial'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Profile Photo Upload */}
              <ImageUpload
                value={editing.avatarImage || ''}
                onChange={v => setEditing({ ...editing, avatarImage: v })}
                label="Profile Photo"
                aspectRatio="square"
                maxPx={300}
                sizeHint="300×300px recommended"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                  <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Company</label>
                  <input type="text" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="e.g. CEO, Company Name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Initials</label>
                  <input type="text" value={editing.avatar} onChange={e => setEditing({ ...editing, avatar: e.target.value.slice(0, 3).toUpperCase() })} maxLength={3} placeholder="e.g. RA" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Used</label>
                  <select value={editing.service} onChange={e => setEditing({ ...editing, service: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setEditing({ ...editing, rating: i + 1 })}>
                      <Star className={`w-6 h-6 cursor-pointer ${i < editing.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Color</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_BG_OPTIONS.map(c => (
                    <button key={c.value} type="button" onClick={() => setEditing({ ...editing, avatarBg: c.value })}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.value} ${editing.avatarBg === c.value ? 'ring-2 ring-offset-1 ring-gray-600' : ''}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
                <textarea
                  value={editing.review}
                  onChange={e => setEditing({ ...editing, review: e.target.value })}
                  placeholder="Client's testimonial review..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!editing.name.trim() || !editing.review.trim()} className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                {isNew ? 'Add Review' : 'Save Changes'}
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
              <h2 className="font-bold text-gray-900">Delete Testimonial?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">This review will be permanently removed from the website.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
