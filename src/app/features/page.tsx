import Navbar from "@/components/navbar";
import FeaturesHero from "@/components/features-hero";
import FeaturesGrid from "@/components/features-grid";
import NumberedFeatures from "@/components/numbered-features";
import FeatureDetails from "@/components/feature-details";
import BranchSegment from "@/components/branch-segment";
import CaseStudies from "@/components/case-studies";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export default function FeaturesPage() {
  return (
    <div className={`${outfit.variable} font-sans min-h-screen bg-black`}>
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
