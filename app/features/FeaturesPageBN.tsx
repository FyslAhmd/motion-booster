'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicPageLoadingSkeleton } from '@/components/ui/PublicPageLoadingSkeleton';
import {
  BarChart3,
  Bell,
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
  RefreshCw,
  Eye,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function FeaturesPageBN() {
  const [pageLoading, setPageLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const timer = window.setTimeout(() => setPageLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <PublicPageLoadingSkeleton variant='features' />;
  }

  const categories = [
    { id: 'all', name: 'সব ফিচার' },
    { id: 'analytics', name: 'অ্যানালিটিক্স' },
    { id: 'automation', name: 'অটোমেশন' },
    { id: 'collaboration', name: 'সহযোগিতা' },
    { id: 'security', name: 'নিরাপত্তা' },
  ];

  const features = [
    {
      category: 'analytics',
      icon: BarChart3,
      title: 'রিয়েল-টাইম অ্যানালিটিক্স ড্যাশবোর্ড',
      description: 'লাইভ ডেটা আপডেটের মাধ্যমে ক্যাম্পেইন মনিটর করুন। পারফরম্যান্স, খরচ ও ROI সম্পর্কে তাৎক্ষণিক ইনসাইটস পান।',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      benefits: [
        'লাইভ ক্যাম্পেইন পারফরম্যান্স ট্র্যাকিং',
        'কাস্টম মেট্রিক ভিজ্যুয়ালাইজেশন',
        'ঐতিহাসিক ডেটা তুলনা',
        'বিভিন্ন ফরম্যাটে রিপোর্ট এক্সপোর্ট',
      ],
    },
    {
      category: 'analytics',
      icon: PieChart,
      title: 'উন্নত ডেটা ভিজ্যুয়ালাইজেশন',
      description: 'জটিল ডেটাকে সহজবোধ্য চার্ট ও গ্রাফে রূপান্তর করুন। সম্পূর্ণ বিশ্লেষণের জন্য একাধিক চার্ট টাইপ।',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      benefits: [
        'ইন্টারেক্টিভ চার্ট ও গ্রাফ',
        'কাস্টমাইজযোগ্য ড্যাশবোর্ড',
        'অডিয়েন্স ডেমোগ্রাফিক বিশ্লেষণ',
        'প্লেসমেন্ট পারফরম্যান্স ইনসাইটস',
      ],
    },
    {
      category: 'analytics',
      icon: Target,
      title: 'ক্যাম্পেইন পারফরম্যান্স ট্র্যাকিং',
      description: 'গুরুত্বপূর্ণ সব ক্যাম্পেইন মেট্রিক ট্র্যাক করুন। ইমপ্রেশন থেকে কনভার্সন পর্যন্ত বিস্তারিত তথ্য পান।',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      benefits: [
        'মাল্টি-ক্যাম্পেইন তুলনা',
        'ROI এবং ROAS হিসাব',
        'ক্লিক-থ্রু রেট মনিটরিং',
        'কনভার্সন ফানেল বিশ্লেষণ',
      ],
    },
    {
      category: 'automation',
      icon: Zap,
      title: 'অটোমেটেড রিপোর্টিং',
      description: 'রিপোর্ট শিডিউল করে অটো-জেনারেট করুন। ম্যানুয়াল কাজ ছাড়া ইনবক্সেই ইনসাইটস পান।',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      benefits: [
        'দৈনিক/সাপ্তাহিক/মাসিক রিপোর্ট',
        'ইমেইল ডেলিভারি শিডিউল',
        'কাস্টম রিপোর্ট টেমপ্লেট',
        'PDF ও CSV এক্সপোর্ট',
      ],
    },
    {
      category: 'automation',
      icon: Bell,
      title: 'স্মার্ট নোটিফিকেশন',
      description: 'ইন্টেলিজেন্ট অ্যালার্টের মাধ্যমে সবসময় আপডেট থাকুন। গুরুত্বপূর্ণ ক্যাম্পেইন পরিবর্তনের নোটিফিকেশন পান।',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      benefits: [
        'বাজেট থ্রেশহোল্ড অ্যালার্ট',
        'পারফরম্যান্স অস্বাভাবিকতা শনাক্তকরণ',
        'ক্যাম্পেইন স্ট্যাটাস আপডেট',
        'কাস্টম নোটিফিকেশন রুল',
      ],
    },
    {
      category: 'automation',
      icon: RefreshCw,
      title: 'অটো ডেটা সিঙ্ক',
      description: 'Meta Marketing API-এর সাথে নির্বিঘ্ন ইন্টিগ্রেশন। আপনার ডেটা সবসময় স্বয়ংক্রিয়ভাবে আপডেট থাকবে।',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      benefits: [
        'রিয়েল-টাইম ডেটা সিঙ্ক্রোনাইজেশন',
        'মাল্টি-অ্যাকাউন্ট সাপোর্ট',
        'স্বয়ংক্রিয় ডেটা রিফ্রেশ',
        'ম্যানুয়াল আপডেটের প্রয়োজন নেই',
      ],
    },
    {
      category: 'collaboration',
      icon: MessageSquare,
      title: 'টিম চ্যাট ইন্টিগ্রেশন',
      description: 'টিম ও এজেন্সির সাথে রিয়েল-টাইমে যোগাযোগ করুন। ফাইল, আইডিয়া ও আপডেট দ্রুত শেয়ার করুন।',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      benefits: [
        'রিয়েল-টাইম মেসেজিং',
        'ফাইল শেয়ারিং (PDF, ছবি, ডক)',
        'ভয়েস মেসেজ রেকর্ডিং',
        'কথোপকথনের হিস্ট্রি',
      ],
    },
    {
      category: 'collaboration',
      icon: Users,
      title: 'মাল্টি-ইউজার অ্যাক্সেস',
      description: 'টিম সদস্য ও ক্লায়েন্টদের সাথে নিরাপদে কাজ করুন। রোল-ভিত্তিক অ্যাক্সেস কন্ট্রোল পাওয়া যাবে।',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      benefits: [
        'রোল-ভিত্তিক পারমিশন',
        'টিম সদস্য আমন্ত্রণ',
        'অ্যাক্টিভিটি ট্র্যাকিং',
        'শেয়ার্ড ওয়ার্কস্পেস',
      ],
    },
    {
      category: 'collaboration',
      icon: FileText,
      title: 'শেয়ার্ড রিপোর্ট ও নোট',
      description: 'স্টেকহোল্ডারদের সাথে রিপোর্ট তৈরি ও শেয়ার করুন। ভালো সমন্বয়ের জন্য নোট ও কমেন্ট যোগ করুন।',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      benefits: [
        'শেয়ারযোগ্য রিপোর্ট লিংক',
        'সহযোগী এনোটেশন',
        'ভার্সন হিস্ট্রি',
        'অ্যাক্সেস কন্ট্রোল ম্যানেজমেন্ট',
      ],
    },
    {
      category: 'security',
      icon: Shield,
      title: 'এন্টারপ্রাইজ-গ্রেড নিরাপত্তা',
      description: 'ব্যাংক-লেভেল এনক্রিপশনে আপনার ডেটা সুরক্ষিত থাকে। নিরাপত্তাকে আমরা সর্বোচ্চ গুরুত্ব দিই।',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      benefits: [
        'এন্ড-টু-এন্ড এনক্রিপশন',
        'SOC 2 Type II সার্টিফায়েড',
        'নিয়মিত সিকিউরিটি অডিট',
        'ডেটা ব্যাকআপ ও রিকভারি',
      ],
    },
    {
      category: 'security',
      icon: Lock,
      title: 'টু-ফ্যাক্টর অথেনটিকেশন',
      description: 'অ্যাকাউন্টে অতিরিক্ত সুরক্ষা যোগ করুন। সংবেদনশীল ক্যাম্পেইন ডেটা নিরাপদ রাখুন।',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      benefits: [
        'SMS ও অ্যাপ-ভিত্তিক 2FA',
        'বায়োমেট্রিক অথেনটিকেশন',
        'সেশন ম্যানেজমেন্ট',
        'লগইন অ্যাক্টিভিটি মনিটরিং',
      ],
    },
    {
      category: 'security',
      icon: Eye,
      title: 'অডিট লগস',
      description: 'অ্যাকাউন্টের সব কার্যক্রম ট্র্যাক করুন। স্বচ্ছতা ও জবাবদিহিতা নিশ্চিত করুন।',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      benefits: [
        'বিস্তারিত অ্যাক্টিভিটি লগ',
        'ইউজার অ্যাকশন ট্র্যাকিং',
        'অডিট রিপোর্ট এক্সপোর্ট',
        'কমপ্লায়েন্স প্রস্তুত',
      ],
    },
  ];

  const platformCapabilities = [
    {
      icon: Smartphone,
      title: 'সম্পূর্ণ রেসপনসিভ',
      description: 'মোবাইল, ট্যাবলেট বা ডেস্কটপ - সব ডিভাইস থেকে ব্যবহারযোগ্য',
    },
    {
      icon: Globe,
      title: 'মাল্টি-ল্যাঙ্গুয়েজ',
      description: 'একাধিক ভাষা ও কারেন্সির সাপোর্ট',
    },
    {
      icon: Clock,
      title: '২৪/৭ প্রাপ্যতা',
      description: '৯৯.৯% আপটাইম গ্যারান্টিসহ সবসময় সচল প্ল্যাটফর্ম',
    },
    {
      icon: Palette,
      title: 'কাস্টমাইজযোগ্য',
      description: 'আপনার প্রয়োজন অনুযায়ী ড্যাশবোর্ড ও রিপোর্ট সাজান',
    },
    {
      icon: TrendingUp,
      title: 'স্কেলেবল',
      description: 'আপনার ব্যবসার চাহিদার সাথে সাথে বড় হতে সক্ষম',
    },
    {
      icon: Settings,
      title: 'সহজ ইন্টিগ্রেশন',
      description: 'আপনার পছন্দের টুল ও প্ল্যাটফর্মের সাথে যুক্ত করুন',
    },
  ];

  const filteredFeatures = activeCategory === 'all'
    ? features
    : features.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-white pt-10 md:pt-40">
      {/* Hero Section */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center page-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            প্রবৃদ্ধির জন্য শক্তিশালী ফিচার
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
            আপনার যা কিছু দরকার
            <span className="block mt-2 text-red-600 text-3xl lg:text-5xl">
              ক্যাম্পেইনকে দ্রুত এগিয়ে নিতে
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 text-wave">
            সহজে মার্কেটিং ক্যাম্পেইন ম্যানেজ, বিশ্লেষণ ও অপ্টিমাইজ করার জন্য দরকারি সব টুল ও ফিচার।
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
            <button className="px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2">
                ফ্রি ট্রায়াল শুরু করুন
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="p-3">
        <div className="max-w-7xl mx-auto page-reveal page-delay-1">
          <div className="overflow-x-auto no-scrollbar">
            <div className="mx-auto flex w-max min-w-full flex-nowrap gap-3 md:w-full md:justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all ${
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
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-4 hover:shadow-2xl transition-all duration-300 border border-gray-100 group ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
                style={{ animationDelay: `${index * 70}ms` }}
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
      <section className="pt-10 pb-16 md:pt-12 md:pb-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 page-reveal page-delay-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              প্ল্যাটফর্ম সক্ষমতা
            </h2>
            <p className="text-xl text-gray-600 text-wave">
              পারফরম্যান্সের জন্য তৈরি, সরলতার জন্য ডিজাইন
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformCapabilities.map((capability, index) => (
              <div
                key={index}
                className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white transition-all border border-gray-100 ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
                style={{ animationDelay: `${index * 80}ms` }}
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

    </div>
  );
}
