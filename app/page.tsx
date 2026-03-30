'use client';

import { CategorySlider, PopularCourses, AchievementStats, Portfolio, CompanyMarquee, Features, Testimonials, FAQ, HeroSlider, HeaderBanner } from '@/components/sections';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { useLanguage } from '@/lib/lang/LanguageContext';

export default function Home() {
  const { language } = useLanguage();
  const isBN = language === 'BN';

  return (
    <main className="home-page min-h-screen bg-white pb-10 sm:pb-12 lg:pb-0 pt-0 md:pt-10">
      <WelcomeModal />
      {/* Mobile: HeroSlider, Desktop: HeaderBanner */}
      <div className="px-4 py-4 md:px-8 md:py-6 home-hero-mobile lg:hidden page-reveal">
        <HeroSlider />
      </div>
      <div className="home-hero-desktop hidden lg:block page-reveal">
        <HeaderBanner />
      </div>
      <div className="home-block-categories page-reveal page-delay-1">
        <CategorySlider />
      </div>
      <div className="lg:hidden mt-3 px-4 sm:px-6 pb-2 text-center page-reveal page-delay-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-[1.2] text-gray-900 text-wave">
          <span className="block whitespace-nowrap text-[18px] sm:text-[22px]">
            {isBN ? 'আপনার ব্যবসার পরিচিতি বৃদ্ধি করুন' : 'Grow your business identity with'}
          </span>
          <span className="mt-1 block text-red-500">Motion Booster</span>
        </h2>
        <p className="mt-2.5 text-[13px] leading-relaxed text-gray-600 text-wave">
          {isBN
            ? 'আমরা কাস্টমাইজড ডিজিটাল মার্কেটিং, আকর্ষণীয় গ্রাফিক ডিজাইন, ডায়নামিক অ্যানিমেশন, দক্ষ ওয়েব ও অ্যাপ ডেভেলপমেন্টসহ সম্পূর্ণ ডিজিটাল সমাধান প্রদান করি, যাতে আপনার ব্র্যান্ড ডিজিটাল জগতে আরও শক্তিশালীভাবে এগিয়ে যেতে পারে।'
            : 'We provide a complete suite of digital solutions, including tailored digital marketing, eye-catching graphic design, dynamic animation, as well as expert web and app development - all designed to elevate your brand in the digital world.'}
        </p>
      </div>
      <div className="home-block-popular page-reveal page-delay-2">
        <PopularCourses />
      </div>
      <div className="home-block-company card-reveal-left page-delay-2">
        <CompanyMarquee />
      </div>
      <div className="home-block-achievements card-reveal-right page-delay-3">
        <AchievementStats />
      </div>
      <div className="home-block-testimonials page-reveal page-delay-3">
        <Testimonials />
      </div>
      <div className="home-block-portfolio card-reveal-left page-delay-4">
        <Portfolio />
      </div>
      <div className="home-block-features card-reveal-right page-delay-4">
        <Features />
      </div>
      <div className="home-block-faq page-reveal page-delay-5">
        <FAQ />
      </div>
    </main>
  );
}
