'use client';

import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useLayoutEffect, useState } from 'react';
import { ChevronLeft, CheckCircle2, Building2 } from 'lucide-react';
import { TeamMemberItem } from '@/lib/admin/store';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';

type CompanyItem = {
  name?: string;
  logoImage?: string | null;
  logo_image?: string | null;
};

function TeamMemberDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-white pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pt-32">
      <div className="lg:hidden bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="h-6 w-6 rounded bg-gray-200 skeleton-breathe" />
          <div className="h-6 w-36 rounded bg-gray-200 skeleton-breathe" />
        </div>
      </div>

      <div className="px-4 pt-6 pb-2 max-w-xl mx-auto lg:max-w-3xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 skeleton-breathe" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 rounded bg-gray-200 skeleton-breathe" />
            <div className="h-4 w-56 rounded bg-gray-200 skeleton-breathe" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f5f4ef] rounded-xl p-4">
            <div className="h-3 w-20 rounded bg-gray-200 skeleton-breathe" />
            <div className="mt-3 h-7 w-20 rounded bg-gray-200 skeleton-breathe" />
          </div>
          <div className="bg-[#f5f4ef] rounded-xl p-4">
            <div className="h-3 w-28 rounded bg-gray-200 skeleton-breathe" />
            <div className="mt-3 h-7 w-16 rounded bg-gray-200 skeleton-breathe" />
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={`team-member-card-skeleton-${idx}`} className="bg-[#f5f4ef] rounded-2xl p-5">
            <div className="h-6 w-40 rounded bg-gray-200 skeleton-breathe" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-11/12 rounded bg-gray-200 skeleton-breathe" />
              <div className="h-4 w-10/12 rounded bg-gray-200 skeleton-breathe" />
              <div className="h-4 w-9/12 rounded bg-gray-200 skeleton-breathe" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const [member, setMember] = useState<TeamMemberItem | null | undefined>(undefined);
  const [companyLogoByName, setCompanyLogoByName] = useState<Record<string, string>>({});

  const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

  useLayoutEffect(() => {
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    const prevScrollRestoration = history.scrollRestoration;
    html.style.scrollBehavior = 'auto';
    history.scrollRestoration = 'manual';

    const forceTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      html.scrollTop = 0;
    };

    forceTop();
    const t1 = window.setTimeout(forceTop, 0);
    const t2 = window.setTimeout(forceTop, 120);
    const t3 = window.setTimeout(forceTop, 280);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      html.style.scrollBehavior = prevScrollBehavior;
      history.scrollRestoration = prevScrollRestoration;
    };
  }, [id]);

  useEffect(() => {
    if (!member) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [member?.id]);

  useEffect(() => {

    fetch(`/api/v1/cms/team/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setMember(data ?? null))
      .catch(() => setMember(null));

    fetch('/api/v1/cms/companies', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : []))
      .then((companies: CompanyItem[]) => {
        if (!Array.isArray(companies)) {
          setCompanyLogoByName({});
          return;
        }

        const next: Record<string, string> = {};
        companies.forEach((item) => {
          const name = typeof item?.name === 'string' ? normalizeName(item.name) : '';
          const logo =
            typeof item?.logoImage === 'string' && item.logoImage.trim()
              ? item.logoImage.trim()
              : typeof item?.logo_image === 'string' && item.logo_image.trim()
                ? item.logo_image.trim()
                : '';

          if (name && logo) next[name] = logo;
        });

        setCompanyLogoByName(next);
      })
      .catch(() => setCompanyLogoByName({}));
  }, [id]);

  if (member === undefined) return <TeamMemberDetailsSkeleton />; // loading
  if (member === null) return notFound();

  const localizedWorkExperience = pickLocalizedList(language, member.workExperience, member.workExperienceBn).filter(Boolean);
  const localizedSpecializedArea = pickLocalizedList(language, member.specializedArea, member.specializedAreaBn).filter(Boolean);
  const localizedEducation = pickLocalizedList(language, member.education, member.educationBn).filter(Boolean);
  const localizedWorkPlaces = pickLocalizedList(language, member.workPlaces, member.workPlacesBn).filter(Boolean);
  const canonicalWorkPlaces = (member.workPlaces || []).filter(Boolean);

  return (
    <main className="min-h-screen bg-white pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pt-32">
      {/* Header — mobile only */}
      <div className="lg:hidden bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-gray-700 hover:text-red-500 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{isBN ? 'টিম সদস্য' : 'Team Member'}</h1>
        </div>
      </div>

      <div className="px-4 pt-6 pb-2 max-w-xl mx-auto lg:max-w-3xl space-y-4">
        {/* Profile Card */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-white shadow">
            {member.avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatarImage} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ background: `linear-gradient(135deg, #ff8079, #ff1e1e)`, color: '#fff' }}
              >
                {member.avatar || member.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{member.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{pickLocalizedText(language, member.role, member.roleBn)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f5f4ef] rounded-xl p-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
            <p className="text-gray-500 text-xs mb-1">{isBN ? 'অভিজ্ঞতা' : 'Experience'}</p>
            <p className="text-red-500 font-bold text-xl">{pickLocalizedText(language, member.experience, member.experienceBn)}</p>
          </div>
          <div className="bg-[#f5f4ef] rounded-xl p-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
            <p className="text-gray-500 text-xs mb-1">{isBN ? 'সম্পন্ন প্রজেক্ট' : 'Completed Projects'}</p>
            <p className="text-red-500 font-bold text-xl">{pickLocalizedText(language, member.projects, member.projectsBn)}</p>
          </div>
        </div>

        {/* Work Experience */}
        {localizedWorkExperience.length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
            <h3 className="text-base font-bold text-gray-900 mb-4">{isBN ? 'কর্ম অভিজ্ঞতা' : 'Work Experience'}</h3>
            <div className="space-y-3">
              {localizedWorkExperience.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialized Area */}
        {localizedSpecializedArea.length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
            <h3 className="text-base font-bold text-gray-900 mb-4">{isBN ? 'বিশেষ দক্ষতার ক্ষেত্র' : 'Specialized Areas'}</h3>
            <div className="space-y-3">
              {localizedSpecializedArea.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {localizedEducation.length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
            <h3 className="text-base font-bold text-gray-900 mb-4">{isBN ? 'শিক্ষাগত যোগ্যতা' : 'Education'}</h3>
            <div className="space-y-3">
              {localizedEducation.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Places */}
        {localizedWorkPlaces.length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]">
            <h3 className="text-base font-bold text-gray-900 mb-4">{isBN ? 'কর্মস্থল' : 'Work Places'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {localizedWorkPlaces.map((place, i) => {
                const canonicalName = canonicalWorkPlaces[i] || place;
                const logoSrc = (member.workPlaceLogos?.[i] || '').trim() || companyLogoByName[normalizeName(canonicalName)] || '';
                return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
                >
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={place} className="h-6 w-auto max-w-18 object-contain shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className="text-gray-700 text-xs font-medium leading-tight">{place}</span>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
