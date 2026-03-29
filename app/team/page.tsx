'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { TeamMemberItem } from '@/lib/admin/store';
import { TeamPageCardsSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedText } from '@/lib/lang/localize';

export default function TeamPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetch('/api/v1/cms/team', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setTeam(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const departments = ['all', ...Array.from(new Set(team.map(m => m.department).filter(Boolean)))];
  const getDepartmentLabel = (key: string) => {
    const match = team.find((item) => item.department === key);
    return pickLocalizedText(language, match?.department || key, match?.departmentBn);
  };

  const filtered = activeTab === 'all'
    ? team
    : team.filter(m => m.department === activeTab);

  const featured = filtered.find(m => m.featured) ?? filtered[0];
  const rest = filtered.filter(m => m.id !== featured?.id);
  const openMember = (memberId: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    router.push(`/team/${memberId}`, { scroll: true });
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-[calc(2.2rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pt-32 page-reveal">
      {/* Page Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm page-reveal page-delay-1">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link href="/" className="text-gray-600 hover:text-red-500 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 text-wave">{isBN ? 'আমাদের টিম' : 'Our Team'}</h1>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3">
          {loading ? (
            <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`team-tab-skeleton-${idx}`}
                  className="h-8 w-20 shrink-0 rounded-full bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              {departments.map(dep => (
                <button
                  key={dep}
                  onClick={() => setActiveTab(dep)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeTab === dep
                      ? 'bg-white text-red-500 border-red-500'
                      : 'text-gray-500 border-gray-200 bg-white hover:border-red-300'
                  }`}
                >
                  {dep === 'all' ? (isBN ? 'সব' : 'All') : getDepartmentLabel(dep)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-2xl mx-auto lg:max-w-5xl page-reveal page-delay-2">
        {loading ? (
          <TeamPageCardsSkeleton />
        ) : (
          <>
            {/* Featured Card */}
            {featured && (
              <button
                type="button"
                onClick={() => openMember(featured.id)}
                className="block bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow card-reveal-left"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="w-28 h-28 shrink-0 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center">
                    {featured.avatarImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featured.avatarImage} alt={featured.name} className="w-full h-full object-cover" />
                    ) : (
                      <span
                        className="text-5xl font-extrabold text-white"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)', background: 'linear-gradient(135deg, #ff8079, #ff1e1e)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {featured.avatar}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">{featured.name}</h2>
                    <p className="text-gray-500 text-sm mb-3">{pickLocalizedText(language, featured.role, featured.roleBn)}</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-red-500 font-bold text-base">{pickLocalizedText(language, featured.experience, featured.experienceBn)}</p>
                        <p className="text-gray-500 text-xs">{isBN ? 'অভিজ্ঞতা' : 'Experience'}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-300" />
                      <div>
                        <p className="text-red-500 font-bold text-base">{pickLocalizedText(language, featured.projects, featured.projectsBn)}</p>
                        <p className="text-gray-500 text-xs">{isBN ? 'প্রজেক্ট' : 'Projects'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* Team Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {rest.map((member, index) => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => openMember(member.id)}
                  className={`block bg-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${index % 2 === 0 ? 'card-reveal-right' : 'card-reveal-left'}`}
                  style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                >
                  {/* Photo */}
                  <div
                    className="w-full aspect-square flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #f5f5f5, #e5e5e5)' }}
                  >
                    {member.avatarImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatarImage} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span
                        className="text-5xl font-extrabold text-white"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg, #ff8079, #ff1e1e)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {member.avatar}
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{member.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{pickLocalizedText(language, member.role, member.roleBn)}</p>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-red-500 font-bold text-sm">{pickLocalizedText(language, member.experience, member.experienceBn)}</p>
                        <p className="text-gray-400 text-xs">{isBN ? 'অভিজ্ঞতা' : 'Experience'}</p>
                      </div>
                      <div className="w-px h-6 bg-gray-300" />
                      <div>
                        <p className="text-red-500 font-bold text-sm">{pickLocalizedText(language, member.projects, member.projectsBn)}</p>
                        <p className="text-gray-400 text-xs">{isBN ? 'প্রজেক্ট' : 'Projects'}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
