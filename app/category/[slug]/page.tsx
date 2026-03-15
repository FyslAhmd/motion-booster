import { categoryData } from '@/lib/courseData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight, ChevronRight } from 'lucide-react';

const OFFER_CARD_BG_COLORS = [
  'bg-red-50',
  'bg-orange-50',
  'bg-yellow-50',
  'bg-green-50',
  'bg-blue-50',
  'bg-indigo-50',
  'bg-purple-50',
  'bg-pink-50',
  'bg-teal-50',
  'bg-cyan-50',
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categoryData.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section
        className="relative pt-8 pb-10 sm:pt-12 sm:pb-12 md:pt-22 md:pb-20 lg:pt-32 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fef6f3 0%, #fde8e4 30%, #fbd5d0 60%, #f9c4be 100%)',
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-125 h-125 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ff6b6b 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ff8079 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        
        {/* Dotted Pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #ff1e1e 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Floating Shapes */}
        <div className="absolute top-20 right-[15%] w-16 h-16 rounded-2xl rotate-12 opacity-10" style={{ background: 'linear-gradient(214.38deg, #ff8079, #ff1e1e)' }} />
        <div className="absolute bottom-16 right-[25%] w-10 h-10 rounded-full opacity-10" style={{ background: 'linear-gradient(214.38deg, #ff8079, #ff1e1e)' }} />
        <div className="absolute top-32 left-[10%] w-12 h-12 rounded-xl -rotate-12 opacity-10" style={{ background: 'linear-gradient(214.38deg, #ff8079, #ff1e1e)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-gray-500 hover:text-red-500 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/service" className="text-gray-500 hover:text-red-500 transition-colors">Services</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-red-500 font-semibold">{category.title}</span>
          </div>

          <div className="max-w-3xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold mb-4"
              style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
            >
              ✓ Our Services
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {category.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6 max-w-2xl">
              {category.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-3xl font-bold text-gray-900">{category.services.length}+</div>
                <div className="text-sm text-gray-500 font-medium">Services Offered</div>
              </div>
              <div className="w-px bg-gray-300" />
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500 font-medium">Projects Completed</div>
              </div>
              <div className="w-px bg-gray-300" />
              <div>
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-500 font-medium">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Services List */}
      <section className="pt-10 pb-14 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What We Offer</h2>
            <p className="text-gray-600 text-lg">Everything you need under {category.title}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {category.services.map((service, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 rounded-2xl p-5 shadow-sm hover:shadow-md border border-white/60 transition-all duration-300 group ${OFFER_CARD_BG_COLORS[index % OFFER_CARD_BG_COLORS.length]}`}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                  {service}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #fef6f3 0%, #fde8e4 50%, #fbd5d0 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Interested in our {category.title} services? Contact us today for a free consultation and quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-lg"
              style={{ background: 'linear-gradient(214.38deg, #ff8079 -2.24%, #ff1e1e 59.38%)' }}
            >
              Get a Free Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/service"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl border-2 border-gray-200 hover:border-red-200 transition-all shadow-sm hover:shadow-md text-lg"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function generateStaticParams() {
  return categoryData.map((category) => ({
    slug: category.slug,
  }));
}
