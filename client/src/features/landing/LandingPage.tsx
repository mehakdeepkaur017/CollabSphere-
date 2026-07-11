import * as React from "react"
import { motion, useScroll } from "framer-motion"
import { LandingNav } from "./components/LandingNav"
import { LandingHero } from "./components/LandingHero"
import { LandingBento } from "./components/LandingBento"
import { LandingAbout } from "./components/LandingAbout"
import { LandingFooter } from "./components/LandingFooter"
import { AnimatedBackground } from "@/components/shared/AnimatedBackground"
import { CursorGlow } from "@/components/shared/CursorGlow"
import { LayoutGroup } from "framer-motion"

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  
  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    }
  }, []);

  return (
    <LayoutGroup>
      <div className="relative min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground dark">
        <AnimatedBackground />
        <CursorGlow />

      <LandingNav />

      <main className="relative z-10 flex flex-col items-center">
        <LandingHero />
        <LandingBento />
        <LandingAbout />
      </main>

      <LandingFooter />
    </div>
    </LayoutGroup>
  )
}
