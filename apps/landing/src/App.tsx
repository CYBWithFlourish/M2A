import Navbar from './components/Navbar';
import HeroSection from './sections/HeroSection';
import ProblemSection from './sections/ProblemSection';
import SolutionSection from './sections/SolutionSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FeaturesSection from './sections/FeaturesSection';
import ArchitectureSection from './sections/ArchitectureSection';
import DatasetsSection from './sections/DatasetsSection';
import CommunitySection from './sections/CommunitySection';
import CTASection from './sections/CTASection';
import FooterSection from './sections/FooterSection';

export default function App() {
  return (
    <div className="bg-surface text-foreground">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ArchitectureSection />
      <DatasetsSection />
      <CommunitySection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
