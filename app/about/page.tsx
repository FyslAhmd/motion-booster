'use client';

import React from 'react';
import Link from 'next/link';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  expertise?: string[];
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio, expertise = [] }) => {
  return (
    <div className="relative">
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full">
        {/* Avatar with gradient background */}
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-1">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent">
                {name.charAt(0)}
              </span>
            </div>
          </div>
          {/* Status indicator */}
          <div className="absolute bottom-2 right-1/2 transform translate-x-16">
            <div className="w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {name}
          </h3>
          <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide mb-4">
            {role}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {bio}
          </p>

          {/* Expertise tags */}
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {expertise.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          <div className="flex justify-center gap-3">
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
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
      <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
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
      expertise: ['Leadership', 'Strategy', 'Business Dev'],
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      bio: 'Technology expert passionate about building scalable and innovative solutions.',
      expertise: ['Architecture', 'DevOps', 'Cloud'],
    },
    {
      name: 'Michael Brown',
      role: 'Lead Developer',
      bio: 'Full-stack developer who loves solving complex technical challenges.',
      expertise: ['React', 'Node.js', 'PostgreSQL'],
    },
    {
      name: 'Emma Wilson',
      role: 'Head of Design',
      bio: 'Creating beautiful user experiences that users love and remember.',
      expertise: ['UI/UX', 'Figma', 'Branding'],
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
      <section className="py-20 lg:py-32 bg-linear-to-br from-green-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              We Build Software That
              <span className="block text-green-600">
                Powers Modern Businesses
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              A passionate software company crafting innovative solutions that help businesses grow and succeed in the digital age.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-purple-500 text-white rounded-full font-semibold hover:bg-purple-600 transition-colors"
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
            <div className="bg-green-100 rounded-3xl p-12 flex items-center justify-center">
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
      <section className="py-20 lg:py-32 bg-gradient-to-br from-purple-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold">
                Our Team
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Meet the <span className="text-purple-600">Dream Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Talented individuals working together to build exceptional software solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <TeamMember
                key={index}
                name={member.name}
                role={member.role}
                bio={member.bio}
                expertise={member.expertise}
              />
            ))}
          </div>
          
          {/* Join Team CTA */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Want to join our team?</h3>
              <p className="text-gray-600 mb-6">We're always looking for talented people</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
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

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-purple-600 overflow-hidden">
        {/* Green Circle Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-green-500 rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Let's Build Something Great Together
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90">
            Ready to turn your vision into reality? Get in touch with us today.
          </p>
          <div className="flex justify-center mb-6">
            <Link
              href="/contact"
              className="bg-white text-purple-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
            No credit card required • Cancel anytime
          </p>
          <p className="text-white text-xs sm:text-sm opacity-70">
            Questions? Contact us at{' '}
            <a href="mailto:hello@youragency.com" className="underline hover:opacity-100">
              hello@youragency.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
