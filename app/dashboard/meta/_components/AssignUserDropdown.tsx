'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, X, Loader2, Check } from 'lucide-react';

interface AssignedUser {
  id: string;
  fullName: string;
  phone: string;
  username: string;
}

interface UserOption {
  id: string;
  fullName: string;
  phone: string;
  username: string;
}

interface AssignUserDropdownProps {
  /** The Meta object id (campaign/adset/ad) */
  metaObjectId: string;
  /** The type of Meta object */
  metaObjectType: 'CAMPAIGN' | 'ADSET' | 'AD';
  /** The Meta ad account id (e.g. act_xxx) */
  metaAccountId?: string;
  /** Currently assigned user (null if unassigned) */
  assignedUser: AssignedUser | null;
  /** Callback after assignment changes */
  onAssigned: (user: AssignedUser | null) => void;
}

export default function AssignUserDropdown({
  metaObjectId,
  metaObjectType,
  metaAccountId,
  assignedUser,
  onAssigned,
}: AssignUserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch users when dropdown opens or search changes
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', search });
        const res = await fetch(`/api/v1/admin/clients?${params}`);
        const json = await res.json();
        if (json.success) {
          setUsers(
            json.data.map((u: UserOption) => ({
              id: u.id,
              fullName: u.fullName,
              phone: u.phone,
              username: u.username,
            }))
          );
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };

    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(fetchUsers, search ? 300 : 0);

    return () => clearTimeout(searchTimerRef.current);
  }, [open, search]);

  const handleAssign = async (user: UserOption) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/meta-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaObjectId,
          metaObjectType,
          metaAccountId,
          userId: user.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        onAssigned({
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          username: user.username,
        });
        setOpen(false);
        setSearch('');
      }
    } catch {}
    finally {
      setSaving(false);
    }
  };

  const handleUnassign = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/meta-assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metaObjectId }),
      });
      const json = await res.json();
      if (json.success) {
        onAssigned(null);
      }
    } catch {}
    finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      {assignedUser ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setOpen(!open)}
            disabled={saving}
            className="inline-flex max-w-35 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <Check className="h-3 w-3 shrink-0" />
            <span className="truncate">{assignedUser.fullName}</span>
          </button>
          <button
            onClick={handleUnassign}
            disabled={saving}
            title="Unassign user"
            className="rounded-full p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
          Assign
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Search */}
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                autoFocus
              />
            </div>
          </div>

          {/* User list */}
          <div className="max-h-52 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                {search ? 'No users found' : 'No clients registered'}
              </div>
            ) : (
              users.map((user) => {
                const isCurrentlyAssigned = assignedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => !isCurrentlyAssigned && handleAssign(user)}
                    disabled={saving || isCurrentlyAssigned}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                      isCurrentlyAssigned
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-red-50'
                    } disabled:opacity-60`}
                  >
                    {/* Avatar */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-700 text-[10px] font-bold text-white">
                      {user.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{user.fullName}</p>
                      <p className="truncate text-[10px] text-gray-400">{user.phone}</p>
                    </div>
                    {isCurrentlyAssigned && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
