"use client"

import MinimalNavbar from "@/components/MinimalNavbar"
import {
  HeroSection,
  SocialProofBar,
  ProblemSection,
  HowItWorksSection,
  DemoCardSection,
  GeneratorSection,
  PricingSection,
  FAQSection,
} from "@/features/landing"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <a href="#generador" className="skip-to-content">
        Saltar al generador
      </a>
      <MinimalNavbar />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <GeneratorSection />
      <HowItWorksSection />
      <DemoCardSection />
      <PricingSection />
      <FAQSection />
    </div>
  )
}
