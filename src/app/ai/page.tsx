import Navbar from "@/components/navbar";
import AIHero from "@/components/ai-hero";
import AICapabilities from "@/components/ai-capabilities";
import AIRealism from "@/components/ai-realism";
import AIConnection from "@/components/ai-connection";
import AIUseCases from "@/components/ai-use-cases";
import AICTA from "@/components/ai-cta";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export default function AIPage() {
  return (
    <div className={`${outfit.variable} font-sans min-h-screen bg-black text-white`}>
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
