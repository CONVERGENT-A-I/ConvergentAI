import Navbar from "@/components/navbar";
import FeaturesHero from "@/components/features-hero";
import FeaturesGrid from "@/components/features-grid";
import NumberedFeatures from "@/components/numbered-features";
import FeatureDetails from "@/components/feature-details";
import BranchSegment from "@/components/branch-segment";
import CaseStudies from "@/components/case-studies";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="flex flex-col w-full px-6 md:px-10 lg:px-16 overflow-hidden">
        <FeaturesHero />
        <FeaturesGrid />
        <NumberedFeatures />
        <FeatureDetails />
        <BranchSegment />
        <CaseStudies />
      </main>
    </div>
  );
}
