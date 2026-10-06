import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import SimulatorSection from "@/components/sections/SimulatorSection";
import DifferentialsSection from "@/components/sections/DifferentialsSection";
import NextStepSection from "@/components/sections/NextStepSection";
import Footer from "@/components/layout/Footer";

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
        <NextStepSection />
        <Footer />
      </main>
    </div>
  );
}
