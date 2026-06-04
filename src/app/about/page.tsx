import { Metadata } from "next";
import Navbar from "@/components/navbar";
import AboutHero from "@/components/about-hero";
import AboutLeadership from "@/components/about-leadership";

export const metadata: Metadata = {
  title: "About Us | ConvergentAI",
  description: "Learn more about ConvergentAI and our mission to transform mortgage lending with interactive, real-time AI technology.",
};

export default function About() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="flex flex-col w-full overflow-hidden">
        <AboutHero />
        <AboutLeadership />
        {/* Additional about sections can be added here later */}
      </main>
    </div>
  );
}
