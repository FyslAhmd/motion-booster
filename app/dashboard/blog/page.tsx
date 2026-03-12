'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import {
  Plus, Pencil, Trash2, X, AlertTriangle, ChevronDown, Loader2,
  EyeOff, Tag, Image as ImageIcon,
} from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  order: number;
}

const BLANK: Omit<BlogPostItem, 'id' | 'order'> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: null,
  category: '',
  tags: [],
  author: 'Motion Booster',
  status: 'PUBLISHED',
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [editing, setEditing] = useState<BlogPostItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [draftConfirm, setDraftConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/blog')
      .then(r => r.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const reorder = async (ordered: BlogPostItem[]) => {
    setPosts(ordered);
    await fetch('/api/v1/cms/blog/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(p => p.id) }),
    }).catch(() => {});
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...posts];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    reorder(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === posts.length - 1) return;
    const arr = [...posts];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    reorder(arr);
  };

  const openNew = () => {
    setEditing({ id: '', order: 0, ...BLANK });
    setIsNew(true);
    setTagInput('');
  };

  const openEdit = (post: BlogPostItem) => {
    setEditing({ ...post });
    setIsNew(false);
    setTagInput('');
  };

  const handleSave = async (overrideStatus?: 'DRAFT' | 'PUBLISHED') => {
    if (!editing) return;
    
    // Validation
    if (!editing.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!editing.excerpt.trim()) {
      toast.error('Excerpt is required');
      return;
    }
    if (!editing.content.trim()) {
      toast.error('Content is required');
      return;
    }
    
    setSaving(true);
    const payload = {
      ...editing,
      slug: editing.slug.trim() || slugify(editing.title),
      status: overrideStatus || editing.status
    };
    
    try {
      if (isNew) {
        const res = await fetch('/api/v1/cms/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}: Failed to create post`);
        }
        
        const created = await res.json();
        setPosts(prev => [...prev, created]);
        toast.success(
          payload.status === 'PUBLISHED'
            ? 'Post published successfully!'
            : 'Post saved as draft successfully!'
        );
      } else {
        const res = await fetch(`/api/v1/cms/blog/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}: Failed to update post`);
        }
        
        const updated = await res.json();
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast.success(
          payload.status === 'PUBLISHED'
            ? 'Post published successfully!'
            : 'Post updated successfully!'
        );
      }
      
      setEditing(null);
      setIsNew(false);
      setDraftConfirm(false);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/cms/blog/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to delete post`);
      }
      
      setPosts(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
      toast.success('Blog post deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete blog post');
    } finally {
      setDeleting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || !editing) return;
    if (!editing.tags.includes(tag)) {
      setEditing({ ...editing, tags: [...editing.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!editing) return;
    setEditing({ ...editing, tags: editing.tags.filter(t => t !== tag) });
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage blog posts shown on the website</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                    <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === posts.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="w-6 h-6 bg-gray-100 rounded-lg text-xs font-medium text-gray-500 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                {/* Cover image thumbnail */}
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{post.category} · {post.author}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(post)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(post.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={openNew}
            className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-red-300 hover:bg-red-50/30 transition-colors flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <Plus className="w-4 h-4" /> Add New Blog Post
          </button>
        </div>
      )}

      {/* ── Edit / Create Modal ─── */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add Blog Post' : 'Edit Blog Post'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <ImageUpload
                  value={editing.coverImage ?? ''}
                  onChange={(url) => setEditing({ ...editing, coverImage: url || null })}
                  label="Upload cover image"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={e => {
                    const title = e.target.value;
                    setEditing({
                      ...editing,
                      title,
                      slug: isNew ? slugify(title) : editing.slug,
                    });
                  }}
                  placeholder="Blog post title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={e => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-mono"
                />
              </div>

              {/* Category & Author row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={editing.category}
                    onChange={e => setEditing({ ...editing, category: e.target.value })}
                    placeholder="e.g. SEO, Marketing"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={editing.author}
                    onChange={e => setEditing({ ...editing, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
                <textarea
                  value={editing.excerpt}
                  onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Short description for blog listing page"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={editing.content}
                  onChange={e => setEditing({ ...editing, content: e.target.value })}
                  placeholder="Full blog post content"
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-y font-mono"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm">Add</button>
                </div>
                {editing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editing.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Draft note */}
              {isNew && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5">
                  Post will be <span className="font-semibold text-green-600">published</span> immediately. Use &ldquo;Save as Draft&rdquo; below to keep it hidden.
                </p>
              )}
              {!isNew && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
                    editing.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {editing.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
              <div>
                {isNew && (
                  <button
                    onClick={() => setDraftConfirm(true)}
                    disabled={saving || !editing.title.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 disabled:opacity-40 rounded-xl"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Save as Draft
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditing(null); setIsNew(false); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={saving || !editing.title.trim() || !editing.excerpt.trim() || !editing.content.trim()}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isNew ? 'Publish Post' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Confirm Modal */}
      {draftConfirm && editing && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Save as Draft?</h3>
                <p className="text-sm text-gray-500">This post will not be visible on the website.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDraftConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 rounded-xl"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Post</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
