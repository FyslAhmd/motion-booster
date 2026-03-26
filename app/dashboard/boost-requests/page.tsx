'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '../_components/AdminShell';
import { useAuth } from '@/lib/auth/context';
import { Search, ChevronLeft, ChevronRight, Calendar, Wallet, Clock3, Target, Users2 } from 'lucide-react';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { createPortal } from 'react-dom';

interface BoostRequestItem {
  id: string;
  language: string;
  totalBudget: string;
  dailyBudget: string;
  targetAudience: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string | null;
}

interface PaginatedResponse {
  items: BoostRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AudienceProfile {
  audienceType: 'Core audience' | 'Custom audience' | 'Audience notes';
  locations: string[];
  ageRange: string | null;
  genders: string[];
  languages: string[];
  interests: string[];
  customAudience: string[];
  notes: string[];
  placements: string[];
}

type PlacementValue = 'facebook' | 'whatsapp' | 'instagram';
type LocationValue = 'all_country' | 'bangladesh';
type GenderValue = 'male' | 'female';

interface BoostSetupDraft {
  placements: PlacementValue[];
  location: LocationValue;
  minAge: number;
  maxAge: number | '';
  gender: GenderValue;
}

const PLACEMENT_OPTIONS: Array<{ value: PlacementValue; label: string }> = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
];

const AGE_OPTIONS = Array.from({ length: 48 }, (_, i) => 18 + i);

export default function BoostRequestsPage() {
  const { accessToken, refreshSession } = useAuth();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<BoostRequestItem | null>(null);
  const [showAllAudience, setShowAllAudience] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupDraft, setSetupDraft] = useState<BoostSetupDraft | null>(null);
  const limit = 15;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      let res = await fetch(`/api/v1/boost-requests?${params}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          res = await fetch(`/api/v1/boost-requests?${params}`, {
            headers: { Authorization: `Bearer ${newToken}` },
          });
        }
      }
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, accessToken, refreshSession]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    // Reset audience expansion when selecting another request
    setShowAllAudience(false);
  }, [selected?.id]);

  const toggleCompleted = useCallback(
    async (item: BoostRequestItem, nextCompleted: boolean) => {
      if (updatingId) return;
      setUpdatingId(item.id);
      try {
        let res = await fetch(`/api/v1/boost-requests/${item.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ completed: nextCompleted }),
        });

        if (res.status === 401) {
          const newToken = await refreshSession();
          if (newToken) {
            res = await fetch(`/api/v1/boost-requests/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newToken}`,
              },
              body: JSON.stringify({ completed: nextCompleted }),
            });
          }
        }

        if (!res.ok) return;
        const updated: BoostRequestItem = await res.json();

        setData(prev =>
          prev
            ? {
                ...prev,
                items: prev.items.map(entry => (entry.id === updated.id ? { ...entry, ...updated } : entry)),
              }
            : prev,
        );
        setSelected(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
      } finally {
        setUpdatingId(null);
      }
    },
    [accessToken, refreshSession, updatingId],
  );

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCampaignName = (item: BoostRequestItem) => {
    const match = item.targetAudience.match(/placement[s]?\s*[:\-]\s*([^\n]+)/i);
    const placementFromAudience = match?.[1]?.trim();
    return placementFromAudience ? `${placementFromAudience} Campaign` : 'Boost Campaign';
  };

  const uniqueValues = (values: string[]) =>
    values.filter((value, index, arr) => arr.findIndex((entry) => entry.toLowerCase() === value.toLowerCase()) === index);

  const normalizeAudienceValue = (value: string) =>
    value
      .replace(/^[•\-\s]+/, '')
      .replace(/\s+/g, ' ')
      .replace(/\.$/, '')
      .trim();

  const splitAudienceValues = (value: string) =>
    uniqueValues(
      value
        .split(/,|\/|\||\band\b|&|\n/gi)
        .map(normalizeAudienceValue)
        .filter(Boolean),
    );

  const getAudienceTokens = (audienceText: string) => {
    return uniqueValues(audienceText
      .split(/[\n,;|]/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .map(normalizeAudienceValue));
  };

  const extractAudienceByLabels = (text: string, labels: string[]) => {
    const results: string[] = [];
    const pattern = new RegExp(`(?:^|[\\n;|])\\s*(?:${labels.join('|')})\\s*[:\\-]\\s*([^\\n;|]+)`, 'gi');
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      results.push(...splitAudienceValues(match[1]));
    }

    return uniqueValues(results);
  };

  const formatGenderValue = (value: string) => {
    const lower = value.toLowerCase();
    if (/\b(all|everyone|anyone|both|all genders)\b/.test(lower)) return 'All genders';
    if (/\b(women|female|girls|ladies)\b|নারী|মহিলা/.test(lower)) return 'Women';
    if (/\b(men|male|boys)\b|পুরুষ/.test(lower)) return 'Men';
    return value;
  };

  const formatLanguageValue = (value: string) => {
    const lower = value.toLowerCase();
    if (/\b(bangla|bengali)\b/.test(lower)) return 'Bangla';
    if (/\benglish\b/.test(lower)) return 'English';
    if (/\bhindi\b/.test(lower)) return 'Hindi';
    if (/\barabic\b/.test(lower)) return 'Arabic';
    if (/\burdu\b/.test(lower)) return 'Urdu';
    return value;
  };

  const buildAudienceProfile = (audienceText: string): AudienceProfile => {
    const locations = extractAudienceByLabels(audienceText, ['location', 'locations', 'area', 'areas', 'city', 'cities', 'country', 'countries', 'district', 'region', 'regions']);
    const ages = extractAudienceByLabels(audienceText, ['age', 'ages', 'age range', 'age group']);
    let ageRange = ages[0] ?? null;
    const genders = extractAudienceByLabels(audienceText, ['gender', 'genders', 'sex']).map(formatGenderValue);
    const languages = extractAudienceByLabels(audienceText, ['language', 'languages']).map(formatLanguageValue);
    const interests = extractAudienceByLabels(audienceText, ['interest', 'interests', 'detailed targeting', 'targeting', 'behaviour', 'behavior', 'hobby', 'hobbies', 'niche']);
    const placements = extractAudienceByLabels(audienceText, ['placement', 'placements']);
    const customAudience: string[] = [];
    const notes: string[] = [];
    const tokens = getAudienceTokens(audienceText);
    const used = new Set(
      uniqueValues([
        ...locations,
        ...genders,
        ...languages,
        ...interests,
        ...placements,
        ...(ageRange ? [ageRange] : []),
      ]).map((value) => value.toLowerCase()),
    );

    for (const token of tokens) {
      const value = normalizeAudienceValue(token);
      const lower = value.toLowerCase();
      const unlabeled = normalizeAudienceValue(value.replace(/^[a-z ]+\s*[:\-]\s*/i, ''));

      if (!value || used.has(lower) || used.has(unlabeled.toLowerCase())) continue;
      if (/^(location|locations|area|areas|city|cities|country|countries|district|region|regions|age|ages|age range|age group|gender|genders|sex|language|languages|interest|interests|detailed targeting|targeting|behaviour|behavior|placement|placements)\s*[:\-]/i.test(lower)) continue;

      if (/\b(remarketing|retarget|retargeting|lookalike|custom audience|page engagers|website visitors|video viewers|customer list|followers)\b/i.test(lower)) {
        customAudience.push(value);
        used.add(lower);
        continue;
      }

      if (!ageRange && /(?:\b\d{1,2}\s*(?:-|to)\s*\d{1,2}\b|\b\d{2}\+\b)/i.test(lower)) {
        ageRange = value.replace(/\bto\b/i, '-');
        used.add(lower);
        continue;
      }

      if (/\b(women|female|girls|ladies|men|male|boys|all genders|everyone)\b|নারী|মহিলা|পুরুষ/i.test(lower)) {
        genders.push(formatGenderValue(value));
        used.add(lower);
        continue;
      }

      if (/\b(bangla|bengali|english|hindi|arabic|urdu)\b/i.test(lower)) {
        languages.push(formatLanguageValue(value));
        used.add(lower);
        continue;
      }

      if (/\b(dhaka|chattogram|chittagong|sylhet|khulna|rajshahi|barisal|barishal|rangpur|mymensingh|bangladesh)\b/i.test(lower) && !/\b(feed|reels|story|stories|interest)\b/i.test(lower)) {
        locations.push(value);
        used.add(lower);
        continue;
      }

      if (/\b(placement|feed|reels|story|stories|messenger|audience network)\b/i.test(lower)) {
        placements.push(value);
        used.add(lower);
        continue;
      }

      if (/\b(interest|interested|shopping|shopper|fashion|clothing|beauty|cosmetics|restaurant|food|business|education|travel|real estate|gym|fitness|electronics|parents|students|entrepreneur|online shoppers|marketing|tech|gaming)\b/i.test(lower)) {
        interests.push(value);
        used.add(lower);
        continue;
      }

      notes.push(value);
    }

    const uniqueLocations = uniqueValues(locations);
    const uniqueGenders = uniqueValues(genders);
    const uniqueLanguages = uniqueValues(languages);
    const uniqueInterests = uniqueValues(interests);
    const uniqueCustomAudience = uniqueValues(customAudience);
    const uniqueNotes = uniqueValues(notes);
    const uniquePlacements = uniqueValues(placements);
    const audienceType = uniqueCustomAudience.length > 0
      ? 'Custom audience'
      : (uniqueLocations.length > 0 || ageRange || uniqueGenders.length > 0 || uniqueLanguages.length > 0 || uniqueInterests.length > 0)
        ? 'Core audience'
        : 'Audience notes';

    return {
      audienceType,
      locations: uniqueLocations,
      ageRange,
      genders: uniqueGenders,
      languages: uniqueLanguages,
      interests: uniqueInterests,
      customAudience: uniqueCustomAudience,
      notes: uniqueNotes,
      placements: uniquePlacements,
    };
  };

  const resolveSelectedPlacements = (placements: string[], rawAudience: string): PlacementValue[] => {
    const source = `${placements.join(', ')} ${rawAudience}`.toLowerCase();
    const selectedValues = PLACEMENT_OPTIONS
      .filter((option) => source.includes(option.value))
      .map((option) => option.value);

    if (selectedValues.length === 0) {
      return ['facebook', 'instagram'];
    }

    return selectedValues;
  };

  const resolveSelectedLocation = (locations: string[], rawAudience: string): LocationValue => {
    const source = `${locations.join(', ')} ${rawAudience}`.toLowerCase();
    if (source.includes('all country') || source.includes('all countries')) return 'all_country';
    return 'bangladesh';
  };

  const resolveSelectedGender = (genders: string[], rawAudience: string): GenderValue => {
    const source = `${genders.join(', ')} ${rawAudience}`.toLowerCase();
    if (source.includes('female') || source.includes('women') || source.includes('girl') || source.includes('নারী') || source.includes('মহিলা')) {
      return 'female';
    }
    return 'male';
  };

  const resolveAgeRange = (ageRange: string | null, rawAudience: string): { minAge: number; maxAge: number | '' } => {
    const source = (ageRange || rawAudience || '').toLowerCase();
    const rangeMatch = source.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})/i);
    const plusMatch = source.match(/(\d{1,2})\s*\+/);
    const singleMatch = source.match(/\b(\d{1,2})\b/);

    let minAge = 18;
    let maxAge: number | '' = 65;

    if (rangeMatch) {
      minAge = Math.max(18, Number.parseInt(rangeMatch[1], 10) || 18);
      const parsedMax = Number.parseInt(rangeMatch[2], 10);
      maxAge = Number.isFinite(parsedMax) ? Math.max(minAge, parsedMax) : '';
      return { minAge, maxAge };
    }

    if (plusMatch) {
      minAge = Math.max(18, Number.parseInt(plusMatch[1], 10) || 18);
      return { minAge, maxAge: '' };
    }

    if (singleMatch) {
      minAge = Math.max(18, Number.parseInt(singleMatch[1], 10) || 18);
    }

    return { minAge, maxAge };
  };

  const getInitialSetupDraft = (item: BoostRequestItem): BoostSetupDraft => {
    const audienceProfile = buildAudienceProfile(item.targetAudience);
    const selectedPlacementValues = resolveSelectedPlacements(audienceProfile.placements, item.targetAudience);
    const selectedLocation = resolveSelectedLocation(audienceProfile.locations, item.targetAudience);
    const selectedGender = resolveSelectedGender(audienceProfile.genders, item.targetAudience);
    const selectedAge = resolveAgeRange(audienceProfile.ageRange, item.targetAudience);

    return {
      placements: selectedPlacementValues,
      location: selectedLocation,
      minAge: selectedAge.minAge,
      maxAge: selectedAge.maxAge,
      gender: selectedGender,
    };
  };

  const saveSetupOptions = useCallback(async () => {
    if (!selected || !setupDraft || setupDraft.placements.length === 0 || updatingId) return;

    setSavingSetup(true);
    setUpdatingId(selected.id);
    try {
      let res = await fetch(`/api/v1/boost-requests/${selected.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          placements: setupDraft.placements,
          location: setupDraft.location,
          minAge: setupDraft.minAge,
          maxAge: setupDraft.maxAge === '' ? null : setupDraft.maxAge,
          gender: setupDraft.gender,
        }),
      });

      if (res.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          res = await fetch(`/api/v1/boost-requests/${selected.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({
              placements: setupDraft.placements,
              location: setupDraft.location,
              minAge: setupDraft.minAge,
              maxAge: setupDraft.maxAge === '' ? null : setupDraft.maxAge,
              gender: setupDraft.gender,
            }),
          });
        }
      }

      if (!res.ok) return;
      const updated: BoostRequestItem = await res.json();

      setData(prev =>
        prev
          ? {
              ...prev,
              items: prev.items.map(entry => (entry.id === updated.id ? { ...entry, ...updated } : entry)),
            }
          : prev,
      );
      setSelected(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    } finally {
      setSavingSetup(false);
      setUpdatingId(null);
    }
  }, [selected, setupDraft, updatingId, accessToken, refreshSession]);

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Boost Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View all boost form submissions from users
            {data && <span className="ml-1 text-gray-400">({data.total} total).</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by audience, placement, budget..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <AdminSectionSkeleton variant="table" />
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No boost requests found</p>
          <p className="text-sm mt-1">Submissions will appear here when users fill out the boost form in chat.</p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSetupDraft(getInitialSetupDraft(item));
                  setSelected(item);
                }}
                className={`w-full text-left bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow ${
                  item.completed ? 'border-emerald-200' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    BR
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">Boost Request</p>
                    <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {item.completed ? 'Completed' : 'Pending'}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.language === 'bn' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {item.language === 'bn' ? 'বাংলা' : 'EN'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate mb-2">
                  {getCampaignName(item)}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2 mt-3">
                    <span className="text-gray-400">Total</span>
                    <p className="font-semibold text-gray-900">{item.totalBudget}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 mt-3">
                    <span className="text-gray-400">Daily</span>
                    <p className="font-semibold text-gray-900">{item.dailyBudget}</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Target audience</span>
                    <p className="font-medium text-gray-800 line-clamp-2">{item.targetAudience || '—'}</p>
                  </div>
                </div>
                <label
                  className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-gray-700"
                  onClick={e => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    disabled={updatingId === item.id}
                    onChange={e => {
                      e.stopPropagation();
                      void toggleCompleted(item, e.target.checked);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-60"
                  />
                  Mark as completed
                </label>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {mounted && selected && createPortal(
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-3 sm:p-4" onClick={() => { setSetupDraft(null); setSelected(null); }}>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" aria-hidden="true" />
          <div className="relative bg-white rounded-3xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-3xl h-[92dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border border-white/40 shadow-[0_35px_90px_-28px_rgba(0,0,0,0.65)]" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Boost Request Details</h2>
              <button onClick={() => { setSetupDraft(null); setSelected(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><span className="text-lg leading-none text-gray-400">×</span></button>
            </div>

            <div className="p-4 sm:p-6 pb-8 sm:pb-8 space-y-5 bg-linear-to-b from-white via-white to-slate-50/70">
              {(() => {
                const audienceProfile = buildAudienceProfile(selected.targetAudience);
                const targetingChips = uniqueValues([
                  ...audienceProfile.interests,
                  ...audienceProfile.notes,
                ]);
                const visibleAudience = showAllAudience ? targetingChips : targetingChips.slice(0, 12);
                const audienceHasMore = targetingChips.length > 12;
                const fallbackSetup = getInitialSetupDraft(selected);
                const selectedPlacementValues = setupDraft?.placements ?? fallbackSetup.placements;
                const selectedLocation = setupDraft?.location ?? fallbackSetup.location;
                const selectedGender = setupDraft?.gender ?? fallbackSetup.gender;
                const selectedAge = {
                  minAge: setupDraft?.minAge ?? fallbackSetup.minAge,
                  maxAge: setupDraft?.maxAge ?? fallbackSetup.maxAge,
                };

                return (
                  <>
                    {/* Top campaign summary */}
                    <div className="relative overflow-hidden rounded-[28px] border border-rose-100 bg-linear-to-br from-white via-rose-50 to-orange-50 p-5 text-gray-900 shadow-sm">
                      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-rose-200/60 blur-3xl" />
                      <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-amber-200/50 blur-3xl" />

                      <div className="relative flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-orange-500 text-sm font-bold text-white shadow-lg shadow-rose-200/80">
                          BR
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-wide text-rose-700 shadow-sm">
                              Boost Request
                            </span>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${selected.language === 'bn' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                              {selected.language === 'bn' ? 'বাংলা content' : 'English content'}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${selected.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {selected.completed ? 'Completed' : 'Pending'}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                              {audienceProfile.audienceType}
                            </span>
                          </div>

                          <p className="mt-3 text-base sm:text-xl font-semibold leading-snug text-gray-900">
                            Request ID: {selected.id.slice(0, 8).toUpperCase()}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 shadow-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(selected.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Total budget</p>
                          <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">{selected.totalBudget}</p>
                          <p className="mt-1 text-xs text-gray-600">Planned campaign spend</p>
                        </div>
                        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Daily budget</p>
                          <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">{selected.dailyBudget}</p>
                          <p className="mt-1 text-xs text-gray-600">Average spend per day</p>
                        </div>
                      </div>
                      <label className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                        <input
                          type="checkbox"
                          checked={selected.completed}
                          disabled={updatingId === selected.id}
                          onChange={e => void toggleCompleted(selected, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-60"
                        />
                        Completed
                      </label>
                    </div>

                    <div className="px-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Campaign setup</h3>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500">Budget plan</p>
                            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">{selected.totalBudget}</p>
                            <p className="mt-1 text-xs text-gray-600">Daily spend target: {selected.dailyBudget}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 to-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
                            <Clock3 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-500">Submission time</p>
                            <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">{formatDate(selected.createdAt)}</p>
                            <p className="mt-1 text-xs text-gray-600">Request entered into the queue</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900">Boost Setup Options</h4>
                      <p className="mt-1 text-xs text-gray-500">Placement, location, age and gender. You can adjust and save these options.</p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Placement</p>
                          <div className="space-y-1.5">
                            {PLACEMENT_OPTIONS.map((option) => (
                              <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={selectedPlacementValues.includes(option.value)}
                                  onChange={() =>
                                    setSetupDraft((prev) => {
                                      if (!prev) return prev;
                                      const placements = prev.placements.includes(option.value)
                                        ? prev.placements.filter((item) => item !== option.value)
                                        : [...prev.placements, option.value];
                                      return { ...prev, placements };
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Location</p>
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSetupDraft((prev) => (prev ? { ...prev, location: e.target.value as LocationValue } : prev))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                          >
                            <option value="all_country">All Country</option>
                            <option value="bangladesh">Bangladesh (BD)</option>
                          </select>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Age</p>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={String(selectedAge.minAge)}
                              onChange={(e) => {
                                const nextMin = Math.max(18, Number.parseInt(e.target.value, 10) || 18);
                                setSetupDraft((prev) => {
                                  if (!prev) return prev;
                                  const adjustedMax = prev.maxAge === '' ? '' : Math.max(nextMin, prev.maxAge);
                                  return { ...prev, minAge: nextMin, maxAge: adjustedMax };
                                });
                              }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                            >
                              {AGE_OPTIONS.map((age) => (
                                <option key={`age-min-${age}`} value={String(age)}>{age}</option>
                              ))}
                            </select>
                            <select
                              value={selectedAge.maxAge === '' ? '' : String(selectedAge.maxAge)}
                              onChange={(e) =>
                                setSetupDraft((prev) => {
                                  if (!prev) return prev;
                                  if (e.target.value === '') return { ...prev, maxAge: '' };
                                  const nextMax = Math.max(prev.minAge, Number.parseInt(e.target.value, 10) || prev.minAge);
                                  return { ...prev, maxAge: nextMax };
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                            >
                              <option value="">Open</option>
                              {AGE_OPTIONS.filter((age) => age >= selectedAge.minAge).map((age) => (
                                <option key={`age-max-${age}`} value={String(age)}>{age}</option>
                              ))}
                            </select>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-500">Minimum age is 18.</p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Gender</p>
                          <select
                            value={selectedGender}
                            onChange={(e) => setSetupDraft((prev) => (prev ? { ...prev, gender: e.target.value as GenderValue } : prev))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void saveSetupOptions()}
                          disabled={savingSetup || updatingId === selected.id || selectedPlacementValues.length === 0}
                          className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingSetup ? 'Saving...' : 'Save setup options'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-blue-100 bg-linear-to-br from-white via-sky-50/60 to-blue-50 p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700">
                          <Users2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Audience setup</p>
                              <p className="mt-1 text-sm sm:text-base font-semibold text-gray-900">{audienceProfile.audienceType}</p>
                              <p className="mt-1 text-xs sm:text-sm text-gray-600">Facebook Ads style summary from the requester&apos;s note.</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-blue-700 shadow-sm">
                              {targetingChips.length} targeting signal{targetingChips.length === 1 ? '' : 's'}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                            <div className="rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Location</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">
                                {audienceProfile.locations.length > 0 ? audienceProfile.locations.join(', ') : 'Not specified'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Age range</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">
                                {audienceProfile.ageRange || 'Open'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Gender</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">
                                {audienceProfile.genders.length > 0 ? audienceProfile.genders.join(', ') : 'All genders'}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Language</p>
                              <p className="mt-2 text-sm font-semibold text-gray-900">
                                {audienceProfile.languages.length > 0 ? audienceProfile.languages.join(', ') : 'Not specified'}
                              </p>
                            </div>
                          </div>

                          {audienceProfile.customAudience.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Custom audience source</p>
                                  <p className="mt-1 text-sm text-gray-700">Remarketing or seeded audience references</p>
                                </div>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                                  {audienceProfile.customAudience.length} source{audienceProfile.customAudience.length === 1 ? '' : 's'}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {audienceProfile.customAudience.map((item, i) => (
                                  <span key={`${item}-${i}`} className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Detailed targeting</p>
                                <p className="mt-1 text-sm text-gray-700">Interests, behaviors, niches and extra audience cues</p>
                              </div>
                              {targetingChips.length > 0 && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
                                  {targetingChips.length} item{targetingChips.length === 1 ? '' : 's'}
                                </span>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {visibleAudience.length > 0 ? visibleAudience.map((token, i) => (
                                <span key={`${token}-${i}`} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-gray-700">
                                  {token}
                                </span>
                              )) : (
                                <span className="text-sm text-gray-500">No detailed targeting added in the request.</span>
                              )}
                            </div>

                            {audienceHasMore && (
                              <button
                                type="button"
                                onClick={() => setShowAllAudience(prev => !prev)}
                                className="mt-4 inline-flex items-center rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                              >
                                {showAllAudience ? 'Show less' : `Show more (${targetingChips.length - visibleAudience.length})`}
                              </button>
                            )}
                          </div>

                          <div className="mt-4 rounded-2xl border border-dashed border-blue-100 bg-white/70 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Original audience note</p>
                            <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-line wrap-break-word">{selected.targetAudience}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </AdminShell>
  );
}
