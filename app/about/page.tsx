'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeamMemberItem } from '@/lib/admin/store';
import { PublicPageLoadingSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';

const TeamMember: React.FC<{ member: TeamMemberItem }> = ({ member }) => {
  const initials = member.avatar || member.name.slice(0, 2).toUpperCase();
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
          <p className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-1">{member.role}</p>
          {member.department && (
            <p className="text-gray-400 text-xs mb-4">{member.department}</p>
          )}

          {/* Expertise tags */}
          {member.specializedArea?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {member.specializedArea.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">{skill}</span>
              ))}
            </div>
          )}

          {member.experience && (
            <p className="text-gray-500 text-xs">{member.experience} experience</p>
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
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/cms/team')
      .then(r => r.json())
      .then(data => setTeam(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setTeamLoading(false));
  }, []);

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
      title: 'Speed & Efficiency',
      description: 'We deliver projects on time without compromising quality. Fast turnaround, efficient processes.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Reliability',
      description: 'Rock-solid solutions you can depend on. We build software that works flawlessly, every time.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Innovation',
      description: 'Constantly pushing boundaries with the latest technologies. We stay ahead so you can stay competitive.',
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Quality First',
      description: 'Every project receives our full attention to detail. We deliver solutions that exceed expectations.',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Happy Clients' },
    { number: '50+', label: 'Projects Delivered' },
    { number: '15+', label: 'Team Members' },
    { number: '5★', label: 'Client Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-10 sm:pt-14 lg:pt-32 pb-10 sm:pb-12 lg:pb-16 bg-linear-to-br from-red-50 via-white to-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              We Build Software That
              <span className="block text-red-500">
                Powers Modern Businesses
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              A passionate software company crafting innovative solutions that help businesses grow and succeed in the digital age.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                Get In Touch
              </Link>
              <Link
                href="/service"
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                Our Services
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
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2020, we started as a small team of developers passionate about creating software that makes a real difference. What began in a small office has grown into a thriving software company.
                </p>
                <p>
                  We believe that great software should be intuitive, powerful, and accessible. Our mission is to build tools that empower businesses to achieve more with less complexity.
                </p>
                <p>
                  Every line of code we write, every feature we design, and every solution we deliver is guided by one principle: putting our clients&apos; success first.
                </p>
                <p className="font-semibold text-gray-900">
                  Today, we work with companies across industries, helping them transform their ideas into powerful digital solutions.
                </p>
              </div>
            </div>
            <div className="bg-red-100 rounded-3xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                  Empower businesses with cutting-edge software solutions that drive innovation and growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600">
              The values that guide everything we build
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <ValueCard
                key={index}
                icon={value.icon}
                title={value.title}
                description={value.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                Our Team
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Meet <span className="text-red-500">Our Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Talented individuals working together to build exceptional software solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <TeamMember key={member.id} member={member} />
            ))}
          </div>
          
          {/* Join Team CTA */}
          <div className="mt-10 text-center">
            <div className="inline-block bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Want to join our team?</h3>
              <p className="text-gray-600 mb-6">We're always looking for talented people</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                View Open Positions
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
