'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeamMemberItem } from '@/lib/admin/store';
import { PublicPageLoadingSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';
import { useLanguage } from '@/lib/lang/LanguageContext';
import { pickLocalizedList, pickLocalizedText } from '@/lib/lang/localize';

const TeamMember: React.FC<{ member: TeamMemberItem; language: 'EN' | 'BN'; isBN: boolean }> = ({ member, language, isBN }) => {
  const initials = member.avatar || member.name.slice(0, 2).toUpperCase();
  const role = pickLocalizedText(language, member.role, member.roleBn);
  const department = pickLocalizedText(language, member.department, member.departmentBn);
  const experience = pickLocalizedText(language, member.experience, member.experienceBn);
  const skills = pickLocalizedList(language, member.specializedArea, member.specializedAreaBn);
  return (
    <Link href={`/team/${member.id}`} className="group block">
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full hover:border-red-200 hover:shadow-xl transition-all duration-300">
        {/* Avatar */}
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-linear-to-br from-red-400 via-red-500 to-red-600 p-1">
            <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center">
              {member.avatarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarImage} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold bg-linear-to-br from-red-600 to-red-400 bg-clip-text text-transparent">
                  {initials.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 right-1/2 transform translate-x-16">
            <div className="w-5 h-5 bg-red-500 rounded-full border-4 border-white"></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{member.name}</h3>
          <p className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-1">{role}</p>
          {department && (
            <p className="text-gray-400 text-xs mb-4">{department}</p>
          )}

          {/* Expertise tags */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">{skill}</span>
              ))}
            </div>
          )}

          {experience && (
            <p className="text-gray-500 text-xs">{experience} {isBN ? 'অভিজ্ঞতা' : 'Experience'}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 group">
      <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default function AboutPage() {
  const { language } = useLanguage();
  const isBN = language === 'BN';
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/team', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setTeam(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setTeamLoading(false));
  }, [language]);

  if (teamLoading) {
    return <PublicPageLoadingSkeleton variant='about' />;
  }

  const values = [
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'গতি ও দক্ষতা',
      description: 'মান বজায় রেখে নির্ধারিত সময়ে কাজ সম্পন্ন করি। দ্রুত ডেলিভারি, কার্যকর প্রক্রিয়া।',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'নির্ভরযোগ্যতা',
      description: 'আপনার আস্থার জন্য শক্তিশালী সমাধান। আমরা এমন সফটওয়্যার তৈরি করি যা নির্ভুলভাবে কাজ করে।',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'উদ্ভাবন',
      description: 'সর্বশেষ প্রযুক্তি দিয়ে আমরা প্রতিনিয়ত নতুন সম্ভাবনা তৈরি করি, যাতে আপনি প্রতিযোগিতায় এগিয়ে থাকেন।',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'মানই প্রথম',
      description: 'প্রতিটি প্রজেক্টে সূক্ষ্ম বিষয়ে সর্বোচ্চ গুরুত্ব দিই এবং প্রত্যাশার চেয়েও ভালো সমাধান দিই।',
    },
  ].map((item) => ({
    ...item,
    title:
      isBN
        ? item.title
        : item.title === 'গতি ও দক্ষতা'
          ? 'Speed & Efficiency'
          : item.title === 'নির্ভরযোগ্যতা'
            ? 'Reliability'
            : item.title === 'উদ্ভাবন'
              ? 'Innovation'
              : 'Quality First',
    description:
      isBN
        ? item.description
        : item.title === 'গতি ও দক্ষতা'
          ? 'We deliver on time without compromising quality through efficient execution.'
          : item.title === 'নির্ভরযোগ্যতা'
            ? 'Trusted, stable solutions built to work accurately and consistently.'
            : item.title === 'উদ্ভাবন'
              ? 'We leverage modern technologies to keep you ahead of the competition.'
              : 'We focus on details and deliver beyond expectations in every project.',
  }));

  const stats = isBN
    ? [
        { number: '1000+', label: 'সন্তুষ্ট ক্লায়েন্ট' },
        { number: '50+', label: 'সম্পন্ন প্রজেক্ট' },
        { number: '15+', label: 'টিম সদস্য' },
        { number: '5★', label: 'ক্লায়েন্ট সন্তুষ্টি' },
      ]
    : [
        { number: '1000+', label: 'Happy Clients' },
        { number: '50+', label: 'Completed Projects' },
        { number: '15+', label: 'Team Members' },
        { number: '5★', label: 'Client Satisfaction' },
      ];

  return (
    <div className="min-h-screen bg-red-50 pt-10 sm:pt-12 md:pt-0">
      {/* Hero Section */}
      <section className="pt-0 pb-10 sm:pt-2 md:pt-40 sm:pb-12 lg:pt-40 lg:pb-16 bg-linear-to-br from-red-50 via-rose-50 to-rose-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto page-reveal">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">
              {isBN ? 'আমরা তৈরি করি এমন সফটওয়্যার' : 'We build software'}
              <span className="block text-red-500 text-3xl lg:text-5xl mt-1">
                {isBN ? 'যা ব্যবসাকে এগিয়ে নেয়' : 'that drives business forward'}
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed mb-3 text-wave">
              {isBN
                ? 'আমরা একটি উদ্যমী সফটওয়্যার টিম, যারা উদ্ভাবনী সমাধানের মাধ্যমে ব্যবসাকে ডিজিটাল যুগে সফল হতে সহায়তা করে।'
                : 'We are a passionate software team helping businesses succeed in the digital era through innovative solutions.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 text-center md:px-8 md:py-6 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                {isBN ? 'যোগাযোগ করুন' : 'Contact Us'}
              </Link>
              <Link
                href="/service"
                className="inline-flex items-center justify-center px-4 py-2 text-center md:px-8 md:py-6 bg-white text-gray-900 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                {isBN ? 'আমাদের সেবাসমূহ' : 'Our Services'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={index % 2 === 0 ? 'text-center card-reveal-left' : 'text-center card-reveal-right'} style={{ animationDelay: `${index * 90}ms` }}>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-8 lg:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
            <div className="page-reveal">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 text-wave">
                {isBN ? 'আমাদের গল্প' : 'Our Story'}
              </h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                {isBN ? (
                  <>
                    <p>২০২০ সালে আমরা ছোট একটি ডেভেলপার টিম হিসেবে যাত্রা শুরু করি, লক্ষ্য ছিল বাস্তব সমস্যার সমাধান করে এমন সফটওয়্যার তৈরি করা। ছোট অফিসে শুরু হওয়া সেই যাত্রা এখন একটি শক্তিশালী সফটওয়্যার প্রতিষ্ঠানে পরিণত হয়েছে।</p>
                    <p>আমরা বিশ্বাস করি ভালো সফটওয়্যার হবে সহজবোধ্য, শক্তিশালী ও সবার জন্য ব্যবহারযোগ্য। কম জটিলতায় বেশি ফল দিতে পারে এমন টুল তৈরি করাই আমাদের লক্ষ্য।</p>
                    <p>আমরা যে কোড লিখি, যে ফিচার ডিজাইন করি, যে সমাধান দিই সবকিছুর মূলনীতি একটাই: ক্লায়েন্টের সাফল্যকে সবার আগে রাখা।</p>
                    <p className="font-semibold text-gray-900">আজ আমরা বিভিন্ন শিল্পখাতের প্রতিষ্ঠানের সাথে কাজ করছি, তাদের আইডিয়াকে শক্তিশালী ডিজিটাল সমাধানে রূপ দিচ্ছি।</p>
                  </>
                ) : (
                  <>
                    <p>We started in 2020 as a small developer team with one goal: build software that solves real problems. What began in a small office has grown into a strong software company.</p>
                    <p>We believe great software should be simple, powerful, and accessible. Our focus is building tools that deliver more impact with less complexity.</p>
                    <p>Everything we code, design, and deliver follows one principle: client success comes first.</p>
                    <p className="font-semibold text-gray-900">Today we work with businesses across industries, turning their ideas into strong digital solutions.</p>
                  </>
                )}
              </div>
            </div>
            <div className="bg-red-100 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 flex items-center justify-center page-reveal page-delay-1">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-3">🚀</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{isBN ? 'মিশন' : 'Mission'}</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {isBN
                    ? 'আধুনিক সফটওয়্যার সমাধানের মাধ্যমে ব্যবসায় উদ্ভাবন ও প্রবৃদ্ধি ত্বরান্বিত করা।'
                    : 'Accelerate innovation and growth through modern software solutions.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10 page-reveal">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {isBN ? 'আমাদের মূল মূল্যবোধ' : 'Our Core Values'}
            </h2>
              <p className="text-base sm:text-xl text-gray-600 text-wave whitespace-nowrap">
              {isBN ? 'যে মূল্যবোধ আমাদের প্রতিটি কাজকে পরিচালিত করে' : 'Values that guide every decision we make'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className={index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'} style={{ animationDelay: `${index * 80}ms` }}>
                <ValueCard
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10 page-reveal">
            <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                {isBN ? 'আমাদের টিম' : 'Our Team'}
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {isBN ? 'পরিচিত হোন ' : 'Meet '}
              <span className="text-red-500">{isBN ? 'আমাদের টিমের সাথে' : 'Our Team'}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isBN
                ? 'প্রতিভাবান পেশাজীবীদের সমন্বয়ে আমরা ব্যতিক্রমী সফটওয়্যার সমাধান তৈরি করি'
                : 'A talented group of professionals building exceptional software solutions'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={member.id} className={index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'} style={{ animationDelay: `${index * 70}ms` }}>
                <TeamMember member={member} language={language} isBN={isBN} />
              </div>
            ))}
          </div>

          {/* Join Team CTA */}
          <div className="mt-10 text-center page-reveal page-delay-2">
            <div className="inline-block bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{isBN ? 'আমাদের টিমে যোগ দিতে চান?' : 'Want to join our team?'}</h3>
              <p className="text-gray-600 mb-6">{isBN ? 'আমরা সবসময় মেধাবী মানুষের খোঁজে থাকি' : 'We are always looking for talented people'}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                {isBN ? 'খালি পদ দেখুন' : 'View open positions'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
