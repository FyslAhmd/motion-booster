'use client';

import { useEffect, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore, TeamMemberItem, defaultTeam, generateId } from '@/lib/admin/store';
import { Plus, Pencil, Trash2, X, Check, AlertTriangle, Star } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

const AVATAR_COLORS = [
  'from-red-500 to-red-700',
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-green-500 to-green-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
  'from-teal-500 to-teal-700',
  'from-indigo-500 to-indigo-700',
];

const DEPARTMENTS = ['Creative', 'Development', 'Marketing', 'Management', 'Sales', 'Support', 'Design', 'Engineering'];

const BLANK: Omit<TeamMemberItem, 'id'> = {
  name: '',
  role: '',
  experience: '',
  projects: '',
  department: 'Creative',
  featured: false,
  avatar: '',
  avatarColor: 'from-red-500 to-red-700',
  avatarImage: '',
  workExperience: [''],
  specializedArea: [''],
  education: [''],
  workPlaces: [''],
};

// Editable list helper
function EditableList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const update = (idx: number, val: string) => {
    const n = [...items]; n[idx] = val; onChange(n);
  };
  const add = () => onChange([...items, '']);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button onClick={add} type="button" className="text-xs text-red-600 hover:underline">+ Add</button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={e => update(idx, e.target.value)}
              placeholder={`${label} ${idx + 1}`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {items.length > 1 && (
              <button onClick={() => remove(idx)} type="button" className="p-2 text-gray-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [editing, setEditing] = useState<TeamMemberItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTeam(AdminStore.getTeam());
  }, []);

  const persist = (data: TeamMemberItem[]) => {
    AdminStore.saveTeam(data);
    setTeam(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    if (!editing || !editing.name.trim()) return;
    const clean = {
      ...editing,
      avatar: editing.avatar.trim() || editing.name.slice(0, 2).toUpperCase(),
      workExperience: editing.workExperience.filter(v => v.trim()),
      specializedArea: editing.specializedArea.filter(v => v.trim()),
      education: editing.education.filter(v => v.trim()),
      workPlaces: editing.workPlaces.filter(v => v.trim()),
    };
    let updated: TeamMemberItem[];
    if (isNew) {
      updated = [...team, { ...clean, id: generateId() }];
    } else {
      updated = team.map(m => m.id === editing.id ? clean : m);
    }
    persist(updated);
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    persist(team.filter(m => m.id !== id));
    setDeleteId(null);
  };

  const openNew = () => {
    setEditing({ id: '', ...BLANK });
    setIsNew(true);
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add and manage team member profiles</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm"><Check className="w-4 h-4" /> Saved!</span>}
          <button onClick={() => persist(defaultTeam)} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Reset Default</button>
          <button onClick={openNew} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {team.map(member => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              {member.avatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarImage} alt={member.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
              ) : (
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {member.avatar || member.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              {member.featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-2 line-clamp-2">{member.role}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <span>{member.experience}</span>
              <span>•</span>
              <span>{member.projects} projects</span>
            </div>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-lg">{member.department}</span>
            <div className="flex items-center gap-1 mt-3">
              <button
                onClick={() => { setEditing({ ...member }); setIsNew(false); }}
                className="flex-1 text-xs text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg py-1.5 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteId(member.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {/* Add placeholder */}
        <button
          onClick={openNew}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 min-h-[180px]"
        >
          <Plus className="w-6 h-6 text-gray-300" />
          <span className="text-sm text-gray-400">Add Team Member</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-900">{isNew ? 'Add Team Member' : 'Edit Team Member'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Avatar Photo Upload */}
              <ImageUpload
                value={editing.avatarImage || ''}
                onChange={v => setEditing({ ...editing, avatarImage: v })}
                label="Profile Photo (optional)"
                aspectRatio="square"
                maxPx={400}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Position</label>
                  <input type="text" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input type="text" value={editing.experience} onChange={e => setEditing({ ...editing, experience: e.target.value })} placeholder="e.g. 5 years+" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Projects Completed</label>
                  <input type="text" value={editing.projects} onChange={e => setEditing({ ...editing, projects: e.target.value })} placeholder="e.g. 200+" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={editing.department} onChange={e => setEditing({ ...editing, department: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Initials</label>
                  <input type="text" value={editing.avatar} onChange={e => setEditing({ ...editing, avatar: e.target.value.slice(0, 3).toUpperCase() })} placeholder="e.g. RH" maxLength={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              </div>

              {/* Avatar Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Color</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditing({ ...editing, avatarColor: c })}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} ${editing.avatarColor === c ? 'ring-2 ring-offset-1 ring-gray-600' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, featured: !editing.featured })}
                  className={`w-10 h-5 rounded-full transition-colors ${editing.featured ? 'bg-amber-400' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${editing.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700">Featured member <span className="text-xs text-gray-400">(shows star badge)</span></span>
              </div>

              <hr />

              <EditableList label="Work Experience" items={editing.workExperience} onChange={v => setEditing({ ...editing, workExperience: v })} />
              <EditableList label="Specialized Area" items={editing.specializedArea} onChange={v => setEditing({ ...editing, specializedArea: v })} />
              <EditableList label="Education" items={editing.education} onChange={v => setEditing({ ...editing, education: v })} />
              <EditableList label="Work Places" items={editing.workPlaces} onChange={v => setEditing({ ...editing, workPlaces: v })} />
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!editing.name.trim()} className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                {isNew ? 'Add Member' : 'Save Changes'}
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
              <h2 className="font-bold text-gray-900">Delete Team Member?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">This member will be removed from the team page.</p>
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
