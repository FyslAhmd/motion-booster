'use client';

import { notFound, useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { ChevronLeft, CheckCircle2, Building2 } from 'lucide-react';
import { TeamMemberItem } from '@/lib/admin/store';

type CompanyItem = {
  name?: string;
  logoImage?: string | null;
  logo_image?: string | null;
};

export default function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<TeamMemberItem | null | undefined>(undefined);
  const [companyLogoByName, setCompanyLogoByName] = useState<Record<string, string>>({});

  const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

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

  if (member === undefined) return null; // loading
  if (member === null) return notFound();

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
          <h1 className="text-lg font-bold text-gray-900">Team Member</h1>
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
            <p className="text-gray-500 text-sm mt-0.5">{member.role}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f5f4ef] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">Experience</p>
            <p className="text-red-500 font-bold text-xl">{member.experience}</p>
          </div>
          <div className="bg-[#f5f4ef] rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">Projects Done</p>
            <p className="text-red-500 font-bold text-xl">{member.projects}</p>
          </div>
        </div>

        {/* Work Experience */}
        {member.workExperience?.filter(Boolean).length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Work Experience</h3>
            <div className="space-y-3">
              {member.workExperience.filter(Boolean).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialized Area */}
        {member.specializedArea?.filter(Boolean).length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Specialized Area</h3>
            <div className="space-y-3">
              {member.specializedArea.filter(Boolean).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {member.education?.filter(Boolean).length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Education Qualification</h3>
            <div className="space-y-3">
              {member.education.filter(Boolean).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Places */}
        {member.workPlaces?.filter(Boolean).length > 0 && (
          <div className="bg-[#f5f4ef] rounded-2xl p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">Work Place</h3>
            <div className="grid grid-cols-2 gap-3">
              {member.workPlaces.filter(Boolean).map((place, i) => {
                const logoSrc = companyLogoByName[normalizeName(place)] || '';
                return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm"
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
