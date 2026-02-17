import { Hero, Companies, Upgrade, Features, Automate, Testimonials, FAQ, CTA } from '@/components/sections';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Companies />
      <Upgrade />
      <Automate />
      <Testimonials />
      <FAQ />
      <CTA />
    </main>
  );
}
