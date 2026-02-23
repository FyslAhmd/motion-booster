'use client';

import { notFound, useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Building2, MessageSquare } from 'lucide-react';
import { teamMembers } from '@/lib/data/team';

export default function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const member = teamMembers.find(m => m.id === Number(id));

  if (!member) return notFound();

  return (
    <main className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
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

      <div className="px-4 pt-6 max-w-xl mx-auto lg:max-w-3xl space-y-4">
        {/* Profile Card */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full shrink-0 flex items-center justify-center text-3xl font-extrabold text-white shadow"
            style={{ background: 'linear-gradient(135deg, #f0f0ea, #e8e8e0)' }}
          >
            <span className="text-gray-400 text-3xl font-bold">{member.avatar}</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{member.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{member.role}</p>
            <Link
              href={`/chat/${member.id}`}
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </Link>
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
        <div className="bg-[#f5f4ef] rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Work Experience</h3>
          <div className="space-y-3">
            {member.workExperience.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized Area */}
        <div className="bg-[#f5f4ef] rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Specialized Area</h3>
          <div className="space-y-3">
            {member.specializedArea.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-[#f5f4ef] rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Education Qualification</h3>
          <div className="space-y-3">
            {member.education.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Work Places */}
        <div className="bg-[#f5f4ef] rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">Work Place</h3>
          <div className="grid grid-cols-2 gap-3">
            {member.workPlaces.map((place, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-gray-700 text-xs font-medium leading-tight">{place}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
