"use client"

import { useState, useEffect } from "react"
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | undefined>()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
      setIsAuthenticated(true)
      try {
        const parsed = JSON.parse(user)
        setCurrentPlan(parsed.plan)
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <a href="#generador" className="skip-to-content">
        Saltar al generador
      </a>
      <MinimalNavbar />
      <HeroSection isAuthenticated={isAuthenticated} />
      <SocialProofBar isAuthenticated={isAuthenticated} />
      <ProblemSection />
      <GeneratorSection />
      <HowItWorksSection />
      <DemoCardSection />
      <PricingSection currentPlan={currentPlan} />
      <FAQSection />
    </div>
  )
}
