import { CategorySlider, PopularCourses, AchievementStats, Portfolio, CompanyMarquee, Features, Testimonials, FAQ, HeroSlider, HeaderBanner, HomePageGsap } from '@/components/sections';
import { FloatingSocialButtons } from '@/components/ui/FloatingSocialButtons';
import { FloatingCallButton } from '@/components/ui/FloatingCallButton';
import { WelcomeModal } from '@/components/ui/WelcomeModal';

export default function Home() {
  return (
    <main className="home-motion-root min-h-screen pb-10 sm:pb-12 lg:pb-0">
      <HomePageGsap />
      <WelcomeModal />
      <FloatingSocialButtons />
      <FloatingCallButton />
      {/* Mobile: HeroSlider, Desktop: HeaderBanner */}
      <div className="home-block home-hero-mobile lg:hidden">
        <HeroSlider />
      </div>
      <div className="home-block home-hero-desktop hidden lg:block">
        <HeaderBanner />
      </div>
      <div className="home-block home-block-categories">
        <CategorySlider />
      </div>
      <div className="home-block home-block-popular">
        <PopularCourses />
      </div>
      <div className="home-block home-block-company">
        <CompanyMarquee />
      </div>
      <div className="home-block home-block-achievements">
        <AchievementStats />
      </div>
      <div className="home-block home-block-portfolio">
        <Portfolio />
      </div>
      <div className="home-block home-block-features">
        <Features />
      </div>
      <div className="home-block home-block-testimonials">
        <Testimonials />
      </div>
      <div className="home-block home-block-faq">
        <FAQ />
      </div>
    </main>
  );
}
