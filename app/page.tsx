import { Hero, Features, Companies, HowItWorks, DashboardPreview, Automate, Testimonials, FAQ, CTA } from '@/components/sections';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Companies />
      <HowItWorks />
      <DashboardPreview />
      <Automate />
      <Testimonials />
      <FAQ />
      <CTA />
    </main>
  );
}
