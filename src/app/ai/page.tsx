import { Metadata } from "next";
import Navbar from "@/components/navbar";
import AIHero from "@/components/ai-hero";
import AICapabilities from "@/components/ai-capabilities";
import AIRealism from "@/components/ai-realism";
import AIConnection from "@/components/ai-connection";
import AIUseCases from "@/components/ai-use-cases";
import AICTA from "@/components/ai-cta";

export const metadata: Metadata = {
  title: "AI Virtual Assistants | ConvergentAI",
  description: "Experience ConvergentAI's hyper-realistic, low-latency virtual assistants designed to capture borrower intent and accelerate loan processing 24/7.",
};

export default function AIPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex flex-col w-full overflow-hidden">
        <AIHero />
        <AICapabilities />
        <AIRealism />
        <AIConnection />
        <AIUseCases />
        <AICTA />
        {/* Additional sections will be added here later */}
      </main>
    </div>
  );
}
