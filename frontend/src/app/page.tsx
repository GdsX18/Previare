import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import SimulatorSection from "@/components/sections/SimulatorSection";
import DifferentialsSection from "@/components/sections/DifferentialsSection";
import TeamSection from "@/components/sections/TeamSection";
import FaqSection from "@/components/sections/FaqSection";
import NextStepSection from "@/components/sections/NextStepSection";
import Footer from "@/components/layout/Footer";
import FloatingContactPill from "@/components/ui/FloatingContactPill";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-transparent text-white">
      {/* Floating Minimalist Navigation */}
      <Navbar />

      {/* Editorial Monumental Flow */}
      <main id="main-content" className="relative z-10 bg-transparent">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <SimulatorSection />
        <DifferentialsSection />
        {/* Só renderiza quando a banca (lib/siteConfig.ts) estiver preenchida */}
        <TeamSection />
        {/* Capítulo "decidir": objeções respondidas, depois a escolha do próximo passo */}
        <FaqSection />
        <NextStepSection />
        <Footer />
      </main>

      {/* Atalho persistente para o atendimento, após o Hero */}
      <FloatingContactPill />
    </div>
  );
}
