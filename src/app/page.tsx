import {
  Navbar,
  Hero,
  StatsSection,
  HowItWorks,
  Features,
  Pricing,
  Testimonials,
  FinalCTA,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsSection />
        <HowItWorks />
        <Features />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
