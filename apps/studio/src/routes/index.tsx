import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing-navbar";
import HeroSection from "@/sections/HeroSection";
import ProblemSection from "@/sections/ProblemSection";
import SolutionSection from "@/sections/SolutionSection";
import HowItWorksSection from "@/sections/HowItWorksSection";
import FeaturesSection from "@/sections/FeaturesSection";
import ArchitectureSection from "@/sections/ArchitectureSection";
import DatasetsSection from "@/sections/DatasetsSection";
import CTASection from "@/sections/CTASection";
import FooterSection from "@/sections/FooterSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "M2A — On-Chain Automation Platform & Verifiable Dataset Generation" },
      { name: "description", content: "Visual workflow builder on Sui, Walrus, and MemWal. Build automations that generate verifiable, privacy-safe datasets every time they run." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-surface text-foreground">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ArchitectureSection />
      <DatasetsSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
