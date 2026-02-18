'use client';

import React from 'react';
import Link from 'next/link';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio }) => {
  return (
    <div className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="w-32 h-32 bg-linear-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
        {name.charAt(0)}
      </div>
      <h3 className="text-xl font-bold text-gray-900 text-center mb-1">{name}</h3>
      <p className="text-blue-600 text-sm font-semibold text-center mb-3">{role}</p>
      <p className="text-gray-600 text-sm text-center leading-relaxed">{bio}</p>
    </div>
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
      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default function AboutPage() {
  const team = [
    {
      name: 'David Thompson',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 15+ years in software development and business strategy.',
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      bio: 'Technology expert passionate about building scalable and innovative solutions.',
    },
    {
      name: 'Michael Brown',
      role: 'Lead Developer',
      bio: 'Full-stack developer who loves solving complex technical challenges.',
    },
    {
      name: 'Emma Wilson',
      role: 'Head of Design',
      bio: 'Creating beautiful user experiences that users love and remember.',
    },
  ];

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
      <section className="py-20 lg:py-32 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              We Build Software That
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
                Powers Modern Businesses
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              A passionate software company crafting innovative solutions that help businesses grow and succeed in the digital age.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
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
      <section className="py-20 lg:py-32">
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
            <div className="bg-linear-to-br from-blue-100 to-purple-100 rounded-3xl p-12 flex items-center justify-center">
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
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
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
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-xl text-gray-600">
              The people making it happen
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <TeamMember
                key={index}
                name={member.name}
                role={member.role}
                bio={member.bio}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-linear-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Let&apos;s Build Something Great Together
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Ready to turn your vision into reality? Get in touch with us today.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
