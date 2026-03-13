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
      <div className="lg:hidden">
        <HeroSlider />
      </div>
      <div className="hidden lg:block">
        <HeaderBanner />
      </div>
      <CategorySlider />
      <PopularCourses />
      <CompanyMarquee />
      <AchievementStats />
      <Portfolio />
      <Features />
      <Testimonials />
      <FAQ />
    </main>
  );
}
