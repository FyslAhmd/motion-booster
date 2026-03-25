'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Plus, Pencil, Trash2, X, AlertTriangle, Star, Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { toast } from 'sonner';

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

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  roleBn?: string;
  avatar: string;
  avatarBg: string;
  avatarImage?: string | null;
  rating: number;
  review: string;
  reviewBn?: string;
  service: string;
  serviceBn?: string;
  order: number;
}

const BLANK: Omit<TestimonialItem, 'id' | 'order'> = {
  name: '',
  role: '',
  roleBn: '',
  avatar: '',
  avatarBg: 'from-blue-500 to-indigo-600',
  avatarImage: '',
  rating: 5,
  review: '',
  reviewBn: '',
  service: 'Web Development',
  serviceBn: '',
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/testimonials')
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editing || !editing.name.trim() || !editing.review.trim()) return;
    const clean = {
      ...editing,
      avatar: editing.avatar.trim() || editing.name.slice(0, 2).toUpperCase(),
    };
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/v1/cms/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clean),
        });
        const created = await res.json();
        setItems(prev => [...prev, created]);
      } else {
        const res = await fetch(`/api/v1/cms/testimonials/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clean),
        });
        const updated = await res.json();
        setItems(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
      setEditing(null);
      setIsNew(false);
      toast.success(isNew ? 'Testimonial added successfully!' : 'Testimonial updated successfully!');
    } catch {
      toast.error('Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/v1/cms/testimonials/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(t => t.id !== id));
      setDeleteId(null);
      toast.success('Testimonial deleted successfully!');
    } catch {
      toast.error('Failed to delete testimonial.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage client reviews and testimonials</p>
        </div>
        <button onClick={() => { setEditing({ id: '', order: 0, ...BLANK }); setIsNew(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {loading ? (
        <AdminSectionSkeleton variant="grid" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
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
                  <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${item.avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
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
            onClick={() => { setEditing({ id: '', order: 0, ...BLANK }); setIsNew(true); }}
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 min-h-45"
          >
            <Plus className="w-6 h-6 text-gray-300" />
            <span className="text-sm text-gray-400">Add Testimonial</span>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add Testimonial' : 'Edit Testimonial'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Company (Bangla)</label>
                  <input
                    type="text"
                    value={editing.roleBn || ''}
                    onChange={e => setEditing({ ...editing, roleBn: e.target.value })}
                    placeholder="e.g. সিইও, কোম্পানি নাম"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Used (Bangla)</label>
                  <input
                    type="text"
                    value={editing.serviceBn || ''}
                    onChange={e => setEditing({ ...editing, serviceBn: e.target.value })}
                    placeholder="e.g. ওয়েব ডেভেলপমেন্ট"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Color</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_BG_OPTIONS.map(c => (
                    <button key={c.value} type="button" onClick={() => setEditing({ ...editing, avatarBg: c.value })}
                      className={`w-8 h-8 rounded-lg bg-linear-to-br ${c.value} ${editing.avatarBg === c.value ? 'ring-2 ring-offset-1 ring-gray-600' : ''}`}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review (Bangla)</label>
                <textarea
                  value={editing.reviewBn || ''}
                  onChange={e => setEditing({ ...editing, reviewBn: e.target.value })}
                  placeholder="বাংলা testimonial review (optional)"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !editing.name.trim() || !editing.review.trim()} className="flex items-center gap-2 px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
