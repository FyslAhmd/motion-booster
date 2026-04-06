'use client';

import { useEffect, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import AdminShell from '../_components/AdminShell';
import { Plus, Pencil, Trash2, X, AlertTriangle, ChevronDown, Loader2, GripVertical } from 'lucide-react';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { toast } from 'sonner';

interface FAQItem {
  id: string;
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  order: number;
}

const BLANK: Omit<FAQItem, 'id' | 'order'> = { question: '', questionBn: '', answer: '', answerBn: '' };

export default function AdminFAQPage() {
  const [faqs, setFAQs] = useState<FAQItem[]>([]);
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragReordered, setDragReordered] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [touchDragIdx, setTouchDragIdx] = useState<number | null>(null);
  const faqsRef = useRef<FAQItem[]>([]);
  const touchStartYRef = useRef(0);
  const touchPointerIdRef = useRef<number | null>(null);
  const touchReorderedRef = useRef(false);

  useEffect(() => {
    fetch('/api/v1/cms/faq')
      .then(r => r.json())
      .then(data => setFAQs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    faqsRef.current = faqs;
  }, [faqs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const reorder = async (ordered: FAQItem[]) => {
    setFAQs(ordered);
    await fetch('/api/v1/cms/faq/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ordered.map(f => f.id) }),
    }).catch(() => {});
  };

  const moveAt = (from: number, to: number) => {
    setFAQs((prev) => {
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length || from === to) return prev;
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      faqsRef.current = arr;
      return arr;
    });
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    const fromHandle = (e.target as HTMLElement).closest('[data-drag-handle="true"]');
    if (!fromHandle) {
      e.preventDefault();
      return;
    }

    setDragIdx(index);
    setDragReordered(false);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', faqs[index]?.id || '');
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>, overIndex: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === overIndex) return;

    setFAQs((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(overIndex, 0, moved);
      faqsRef.current = arr;
      return arr;
    });

    setDragIdx(overIndex);
    setDragReordered(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragEnd = async () => {
    const shouldPersist = dragReordered;
    setDragIdx(null);
    setDragReordered(false);
    if (!shouldPersist) return;
    await reorder(faqsRef.current);
  };

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (!isCoarsePointer) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    touchPointerIdRef.current = e.pointerId;
    touchReorderedRef.current = false;
    setTouchDragIdx(index);
    setDragIdx(index);
    touchStartYRef.current = e.clientY;
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isCoarsePointer || touchDragIdx === null) return;
    if (touchPointerIdRef.current !== null && e.pointerId !== touchPointerIdRef.current) return;
    e.preventDefault();
    const deltaY = e.clientY - touchStartYRef.current;
    const threshold = 26;

    if (deltaY > threshold && touchDragIdx < faqsRef.current.length - 1) {
      const next = touchDragIdx + 1;
      moveAt(touchDragIdx, next);
      setTouchDragIdx(next);
      setDragIdx(next);
      touchStartYRef.current = e.clientY;
      touchReorderedRef.current = true;
    } else if (deltaY < -threshold && touchDragIdx > 0) {
      const next = touchDragIdx - 1;
      moveAt(touchDragIdx, next);
      setTouchDragIdx(next);
      setDragIdx(next);
      touchStartYRef.current = e.clientY;
      touchReorderedRef.current = true;
    }
  };

  const onHandlePointerUp = async (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isCoarsePointer || touchDragIdx === null) return;
    if (touchPointerIdRef.current !== null && e.pointerId !== touchPointerIdRef.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const shouldPersist = touchReorderedRef.current;
    touchPointerIdRef.current = null;
    touchReorderedRef.current = false;
    setTouchDragIdx(null);
    setDragIdx(null);
    if (!shouldPersist) return;
    await reorder(faqsRef.current);
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
          <p className="text-sm text-gray-500 mt-0.5">Manage frequently asked questions shown on the website.</p>
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
            <div
              key={faq.id}
              draggable={!isCoarsePointer}
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow ${dragIdx === idx ? 'opacity-50 shadow-lg' : 'hover:shadow-sm'}`}
            >
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  data-drag-handle="true"
                  onPointerDown={(e) => onHandlePointerDown(e, idx)}
                  onPointerMove={onHandlePointerMove}
                  onPointerUp={onHandlePointerUp}
                  onPointerCancel={onHandlePointerUp}
                  className="shrink-0 cursor-grab touch-none rounded-lg p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                  aria-label="Reorder FAQ"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Question (Bangla)</label>
                <input
                  type="text"
                  value={editing.questionBn || ''}
                  onChange={e => setEditing({ ...editing, questionBn: e.target.value })}
                  placeholder="বাংলা প্রশ্ন লিখুন (optional)"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer (Bangla)</label>
                <textarea
                  value={editing.answerBn || ''}
                  onChange={e => setEditing({ ...editing, answerBn: e.target.value })}
                  placeholder="বাংলা উত্তর লিখুন (optional)"
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
