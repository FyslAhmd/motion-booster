'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, PortfolioItem, generateId } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, Star, X, Save, GripVertical } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

const CATEGORIES = [
  'Web Development',
  'Mobile App Development',
  'Digital Marketing',
  'Graphics Design',
  'UI/UX Design',
  'Software Development',
  'Video & Animation',
  'Branding & Creative',
  'Specialized Services',
];

const GRADIENTS = [
  { label: 'Blue–Indigo', value: 'from-blue-500 to-indigo-600' },
  { label: 'Green–Emerald', value: 'from-green-500 to-emerald-600' },
  { label: 'Orange–Red', value: 'from-orange-500 to-red-600' },
  { label: 'Purple–Pink', value: 'from-purple-500 to-pink-600' },
  { label: 'Teal–Cyan', value: 'from-teal-500 to-cyan-600' },
  { label: 'Pink–Rose', value: 'from-pink-500 to-rose-600' },
  { label: 'Indigo–Blue', value: 'from-indigo-500 to-blue-600' },
  { label: 'Yellow–Amber', value: 'from-yellow-500 to-amber-600' },
  { label: 'Red–Orange', value: 'from-red-500 to-orange-600' },
  { label: 'Emerald–Teal', value: 'from-emerald-500 to-teal-600' },
  { label: 'Violet–Purple', value: 'from-violet-500 to-purple-600' },
  { label: 'Sky–Blue', value: 'from-sky-500 to-blue-600' },
];

const empty: Omit<PortfolioItem, 'id'> = {
  title: '',
  category: CATEGORIES[0],
  description: '',
  client: '',
  result: '',
  tags: [],
  coverColor: GRADIENTS[0].value,
  featured: false,
};

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [toast, setToast] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    setItems(AdminStore.getPortfolio());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.client.trim()) {
      showToast('Title and Client are required.');
      return;
    }
    let updated: PortfolioItem[];
    if (isNew) {
      updated = [...items, { ...editing, id: generateId() }];
    } else {
      updated = items.map(i => (i.id === editing.id ? editing : i));
    }
    AdminStore.savePortfolio(updated);
    setItems(updated);
    setEditing(null);
    setIsNew(false);
    setTagInput('');
    showToast(isNew ? 'Portfolio item added!' : 'Changes saved!');
    window.dispatchEvent(new Event('storage'));
  };

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    AdminStore.savePortfolio(updated);
    setItems(updated);
    setDeleteId(null);
    showToast('Item deleted.');
    window.dispatchEvent(new Event('storage'));
  };

  const toggleFeatured = (id: string) => {
    const updated = items.map(i => (i.id === id ? { ...i, featured: !i.featured } : i));
    AdminStore.savePortfolio(updated);
    setItems(updated);
    window.dispatchEvent(new Event('storage'));
  };

  const openNew = () => {
    setEditing({ ...empty, id: '' });
    setIsNew(true);
    setTagInput('');
  };

  const openEdit = (item: PortfolioItem) => {
    setEditing({ ...item });
    setIsNew(false);
    setTagInput('');
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || !editing) return;
    if (!editing.tags.includes(t)) {
      setEditing({ ...editing, tags: [...editing.tags, t] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!editing) return;
    setEditing({ ...editing, tags: editing.tags.filter(t => t !== tag) });
  };

  const displayed = filterCat === 'All' ? items : items.filter(i => i.category === filterCat);

  return (
    <AdminShell>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Portfolio Item?</h3>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{isNew ? 'Add Portfolio Item' : 'Edit Portfolio Item'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Project Title *</label>
                <input
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="e.g. TechVenture E-Commerce Platform"
                />
              </div>

              {/* Client + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Client Name *</label>
                  <input
                    value={editing.client}
                    onChange={e => setEditing({ ...editing, client: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                    placeholder="e.g. TechVenture BD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                  <select
                    value={editing.category}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea
                  value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                  placeholder="Brief description of the project scope and work done..."
                />
              </div>

              {/* Result */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Result / Impact</label>
                <input
                  value={editing.result}
                  onChange={e => setEditing({ ...editing, result: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder="e.g. 200% increase in online sales"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tags / Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                    placeholder="Type a tag and press Enter or Add"
                  />
                  <button onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">Add</button>
                </div>
                {editing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editing.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Color + Image + Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Cover Color</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {GRADIENTS.map(g => (
                      <button
                        key={g.value}
                        onClick={() => setEditing({ ...editing, coverColor: g.value })}
                        title={g.label}
                        className={`h-7 rounded-lg bg-gradient-to-r ${g.value} transition-all ${editing.coverColor === g.value ? 'ring-2 ring-offset-1 ring-gray-800 scale-110' : 'hover:scale-105'}`}
                      />
                    ))}
                  </div>
                  <div className={`mt-2 h-8 rounded-lg bg-gradient-to-r ${editing.coverColor} flex items-center justify-center`}>
                    <span className="text-white text-xs font-medium opacity-75">Preview</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Featured Project</label>
                  <button
                    onClick={() => setEditing({ ...editing, featured: !editing.featured })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      editing.featured
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${editing.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    {editing.featured ? 'Featured' : 'Mark as Featured'}
                  </button>
                </div>
              </div>

              {/* Cover Image Upload */}
              <ImageUpload
                value={editing.coverImage || ''}
                onChange={v => setEditing({ ...editing, coverImage: v })}
                label="Cover Image (optional — overrides gradient)"
                aspectRatio="wide"
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <Save className="w-4 h-4" />
                {isNew ? 'Add Project' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} project{items.length !== 1 ? 's' : ''} · {items.filter(i => i.featured).length} featured</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filterCat === cat
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📁</p>
          <p className="font-medium text-gray-500">No portfolio items yet</p>
          <p className="text-sm mt-1">Click "Add Project" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Cover */}
              <div className={`h-28 bg-gradient-to-br ${item.coverColor} relative flex items-end p-4 overflow-hidden`}>
                {item.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                {item.featured && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" /> Featured
                  </span>
                )}
                <span className="text-white/70 text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">{item.category}</span>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="text-xs text-gray-400 mb-1">{item.client}</div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                )}
                {item.result && (
                  <div className="flex items-start gap-1.5 mb-3">
                    <span className="text-green-500 text-xs mt-0.5">✦</span>
                    <p className="text-xs text-green-700 font-medium leading-relaxed">{item.result}</p>
                  </div>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <button
                    onClick={() => toggleFeatured(item.id)}
                    title={item.featured ? 'Remove from featured' : 'Mark as featured'}
                    className={`p-1.5 rounded-lg transition-colors ${item.featured ? 'text-yellow-400 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'}`}
                  >
                    <Star className={`w-4 h-4 ${item.featured ? 'fill-yellow-400' : ''}`} />
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
