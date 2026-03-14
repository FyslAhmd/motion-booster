'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Plus, Pencil, Trash2, X, AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { toast } from 'sonner';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const BLANK: Omit<FAQItem, 'id' | 'order'> = { question: '', answer: '' };

export default function AdminFAQPage() {
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/v1/cms/faq')
      .then(r => r.json())
      .then(data => setFAQs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const reorder = async (ordered: FAQItem[]) => {
    setFAQs(ordered);
    await fetch('/api/v1/cms/faq/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(f => f.id) }),
    }).catch(() => {});
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...faqs];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    reorder(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === faqs.length - 1) return;
    const arr = [...faqs];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    reorder(arr);
  };

  const handleSave = async () => {
    if (!editing || !editing.question.trim() || !editing.answer.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/v1/cms/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        const created = await res.json();
        setFAQs(prev => [...prev, created]);
      } else {
        const res = await fetch(`/api/v1/cms/faq/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        });
        const updated = await res.json();
        setFAQs(prev => prev.map(f => f.id === updated.id ? updated : f));
      }
      setEditing(null);
      setIsNew(false);
      toast.success(isNew ? 'FAQ added successfully!' : 'FAQ updated successfully!');
    } catch {
      toast.error('Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/v1/cms/faq/${id}`, { method: 'DELETE' });
      setFAQs(prev => prev.filter(f => f.id !== id));
      setDeleteId(null);
      toast.success('FAQ deleted successfully!');
    } catch {
      toast.error('Failed to delete FAQ.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage frequently asked questions shown on the website</p>
        </div>
        <button
          onClick={() => { setEditing({ id: '', order: 0, ...BLANK }); setIsNew(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {loading ? (
        <AdminSectionSkeleton variant="list" />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                    <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button onClick={() => moveDown(idx)} disabled={idx === faqs.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="w-6 h-6 bg-gray-100 rounded-lg text-xs font-medium text-gray-500 flex items-center justify-center shrink-0">{idx + 1}</span>
                <button
                  onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                  className="flex-1 text-left text-sm font-medium text-gray-900"
                >
                  {faq.question}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditing({ ...faq }); setIsNew(false); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(faq.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              {expanded === faq.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => { setEditing({ id: '', order: 0, ...BLANK }); setIsNew(true); }}
            className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-red-300 hover:bg-red-50/30 transition-colors flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <Plus className="w-4 h-4" /> Add New FAQ
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add FAQ' : 'Edit FAQ'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={editing.question}
                  onChange={e => setEditing({ ...editing, question: e.target.value })}
                  placeholder="Enter the frequently asked question"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea
                  value={editing.answer}
                  onChange={e => setEditing({ ...editing, answer: e.target.value })}
                  placeholder="Provide a clear and helpful answer"
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.question.trim() || !editing.answer.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isNew ? 'Add FAQ' : 'Save Changes'}
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
              <h2 className="font-bold text-gray-900">Delete FAQ?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">This question and answer will be permanently removed.</p>
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
