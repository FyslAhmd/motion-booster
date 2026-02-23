import { HeaderBanner, CategorySlider, PopularCourses, AchievementStats, Features, Testimonials, FAQ } from '@/components/sections';
import { FloatingSocialButtons } from '@/components/ui/FloatingSocialButtons';
import { FloatingCallButton } from '@/components/ui/FloatingCallButton';
import { WelcomeModal } from '@/components/ui/WelcomeModal';

export default function Home() {
  return (
    <main className="min-h-screen pb-16 lg:pb-0">
      <WelcomeModal />
      <FloatingSocialButtons />
      <FloatingCallButton />
      <HeaderBanner />
      <CategorySlider />
      <PopularCourses />
      <AchievementStats />
      <Features />
      <Testimonials />
      <FAQ />
    </main>
  );
}
