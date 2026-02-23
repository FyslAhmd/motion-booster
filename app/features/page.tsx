'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  MessageSquare,
  Palette,
  PieChart,
  Rocket,
  Settings,
  Shield,
  Smartphone,
  Target,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Download,
  RefreshCw,
  Eye,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Features' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'automation', name: 'Automation' },
    { id: 'collaboration', name: 'Collaboration' },
    { id: 'security', name: 'Security' },
  ];

  const features = [
    {
      category: 'analytics',
      icon: BarChart3,
      title: 'Real-Time Analytics Dashboard',
      description: 'Monitor your campaigns with live data updates. Get instant insights into performance metrics, spending, and ROI.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      benefits: [
        'Live campaign performance tracking',
        'Custom metric visualization',
        'Historical data comparison',
        'Export reports in multiple formats',
      ],
    },
    {
      category: 'analytics',
      icon: PieChart,
      title: 'Advanced Data Visualization',
      description: 'Transform complex data into easy-to-understand charts and graphs. Multiple chart types for comprehensive analysis.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      benefits: [
        'Interactive charts and graphs',
        'Customizable dashboards',
        'Audience demographic breakdown',
        'Placement performance insights',
      ],
    },
    {
      category: 'analytics',
      icon: Target,
      title: 'Campaign Performance Tracking',
      description: 'Track every campaign metric that matters. From impressions to conversions, get detailed insights.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      benefits: [
        'Multi-campaign comparison',
        'ROI and ROAS calculation',
        'Click-through rate monitoring',
        'Conversion funnel analysis',
      ],
    },
    {
      category: 'automation',
      icon: Zap,
      title: 'Automated Reporting',
      description: 'Schedule and automate your reports. Get insights delivered to your inbox without manual work.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      benefits: [
        'Daily/weekly/monthly reports',
        'Email delivery scheduling',
        'Custom report templates',
        'PDF and CSV export',
      ],
    },
    {
      category: 'automation',
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay informed with intelligent alerts. Get notified about important campaign changes and milestones.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      benefits: [
        'Budget threshold alerts',
        'Performance anomaly detection',
        'Campaign status updates',
        'Custom notification rules',
      ],
    },
    {
      category: 'automation',
      icon: RefreshCw,
      title: 'Auto Data Sync',
      description: 'Seamless integration with Meta Marketing API. Your data is always up-to-date automatically.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      benefits: [
        'Real-time data synchronization',
        'Multi-account support',
        'Automatic data refresh',
        'Zero manual updates needed',
      ],
    },
    {
      category: 'collaboration',
      icon: MessageSquare,
      title: 'Team Chat Integration',
      description: 'Communicate with your team and agency in real-time. Share files, ideas, and updates instantly.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      benefits: [
        'Real-time messaging',
        'File sharing (PDFs, images, docs)',
        'Voice message recording',
        'Conversation history',
      ],
    },
    {
      category: 'collaboration',
      icon: Users,
      title: 'Multi-User Access',
      description: 'Collaborate with team members and clients. Role-based access control for secure sharing.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      benefits: [
        'Role-based permissions',
        'Team member invitations',
        'Activity tracking',
        'Shared workspace',
      ],
    },
    {
      category: 'collaboration',
      icon: FileText,
      title: 'Shared Reports & Notes',
      description: 'Create and share reports with stakeholders. Add notes and comments for better collaboration.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      benefits: [
        'Shareable report links',
        'Collaborative annotations',
        'Version history',
        'Access control management',
      ],
    },
    {
      category: 'security',
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Your data is protected with bank-level encryption. We take security seriously.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      benefits: [
        'End-to-end encryption',
        'SOC 2 Type II certified',
        'Regular security audits',
        'Data backup and recovery',
      ],
    },
    {
      category: 'security',
      icon: Lock,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account. Protect sensitive campaign data.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      benefits: [
        'SMS and app-based 2FA',
        'Biometric authentication',
        'Session management',
        'Login activity monitoring',
      ],
    },
    {
      category: 'security',
      icon: Eye,
      title: 'Audit Logs',
      description: 'Track all activities in your account. Complete transparency and accountability.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      benefits: [
        'Detailed activity logs',
        'User action tracking',
        'Export audit reports',
        'Compliance ready',
      ],
    },
  ];

  const platformCapabilities = [
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'Access from any device - mobile, tablet, or desktop',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Support for multiple languages and currencies',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Always-on platform with 99.9% uptime guarantee',
    },
    {
      icon: Palette,
      title: 'Customizable',
      description: 'Personalize your dashboard and reports',
    },
    {
      icon: TrendingUp,
      title: 'Scalable',
      description: 'Grows with your business needs',
    },
    {
      icon: Settings,
      title: 'Easy Integration',
      description: 'Connect with your favorite tools and platforms',
    },
  ];

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            Powerful Features for Growth
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="block mt-2 text-red-600">
              Supercharge Your Campaigns
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Powerful tools and features designed to help you manage, analyze, and optimize your marketing campaigns with ease.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
            <button className="px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200 font-semibold">
                Talk to Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform Capabilities
            </h2>
            <p className="text-xl text-gray-600">
              Built for performance, designed for simplicity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformCapabilities.map((capability, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white transition-all border border-gray-100"
              >
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <capability.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {capability.title}
                </h3>
                <p className="text-gray-600">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-red-600 overflow-hidden">
        {/* Red Circle Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-red-700 rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90">
            Join thousands of businesses already using MotionBooster
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <Link href="/register">
              <button className="bg-white text-red-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl">
                Get Started Free
              </button>
            </Link>
            <Link href="/contact">
              <button className="bg-transparent text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/10 transition-colors border-2 border-white">
                Contact Sales
              </button>
            </Link>
          </div>
          <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
            No credit card required • 14-day free trial • Cancel anytime
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
