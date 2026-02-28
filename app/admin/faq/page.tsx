'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, FAQItem, defaultFAQs, generateId } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, ChevronDown } from 'lucide-react';

const BLANK: Omit<FAQItem, 'id'> = { question: '', answer: '' };

export default function AdminFAQPage() {
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setFAQs(AdminStore.getFAQs());
  }, []);

  const persist = (data: FAQItem[]) => {
    AdminStore.saveFAQs(data);
    setFAQs(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    if (!editing || !editing.question.trim() || !editing.answer.trim()) return;
    let updated: FAQItem[];
    if (isNew) {
      updated = [...faqs, { ...editing, id: generateId() }];
    } else {
      updated = faqs.map(f => f.id === editing.id ? editing : f);
    }
    persist(updated);
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    persist(faqs.filter(f => f.id !== id));
    setDeleteId(null);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...faqs];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    persist(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === faqs.length - 1) return;
    const arr = [...faqs];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    persist(arr);
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage frequently asked questions shown on the website</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm"><Check className="w-4 h-4" /> Saved!</span>}
          <button onClick={() => persist(defaultFAQs)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Reset Default</button>
          <button
            onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              {/* Order buttons */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === faqs.length - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Number */}
              <span className="w-6 h-6 bg-gray-100 rounded-lg text-xs font-medium text-gray-500 flex items-center justify-center shrink-0">{idx + 1}</span>

              {/* Question */}
              <button
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                className="flex-1 text-left text-sm font-medium text-gray-900"
              >
                {faq.question}
              </button>

              {/* Actions */}
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

            {/* Answer preview */}
            {expanded === faq.id && (
              <div className="px-4 pb-4 border-t border-gray-50">
                <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}

        {/* Add new */}
        <button
          onClick={() => { setEditing({ id: '', ...BLANK }); setIsNew(true); }}
          className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-red-300 hover:bg-red-50/30 transition-colors flex items-center justify-center gap-2 text-sm text-gray-400"
        >
          <Plus className="w-4 h-4" /> Add New FAQ
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
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
                disabled={!editing.question.trim() || !editing.answer.trim()}
                className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
              >
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
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
