import { CategorySlider, PopularCourses, AchievementStats, Portfolio, CompanyMarquee, Features, Testimonials, FAQ, HeroSlider, HeaderBanner } from '@/components/sections';
import { FloatingSocialButtons } from '@/components/ui/FloatingSocialButtons';
import { FloatingCallButton } from '@/components/ui/FloatingCallButton';
import { WelcomeModal } from '@/components/ui/WelcomeModal';

export default function Home() {
  return (
    <main className="min-h-screen pb-10 sm:pb-12 lg:pb-0">
      <WelcomeModal />
      <FloatingSocialButtons />
      <FloatingCallButton />
      {/* Mobile: HeroSlider, Desktop: HeaderBanner */}
      <div className="home-hero-mobile lg:hidden page-reveal">
        <HeroSlider />
      </div>
      <div className="home-hero-desktop hidden lg:block page-reveal">
        <HeaderBanner />
      </div>
      <div className="home-block-categories page-reveal page-delay-1">
        <CategorySlider />
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
