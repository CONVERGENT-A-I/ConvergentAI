import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Avatars from "@/components/avatars";
import Outcomes from "@/components/outcomes";
import Features from "@/components/features";
import ResearchInsights from "@/components/research-insights";
import StrategicImpact from "@/components/strategic-impact";
import LiveAgentDashboard from "@/components/live-agent-dashboard";
import ScheduleDemo from "@/components/schedule-demo";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export default function Home() {
  return (
    <div className={`${outfit.variable} font-sans min-h-screen bg-black`}>
      <main>
        <Hero />
        <Avatars />
        <Outcomes />
        <Features />
        <ResearchInsights />
        <StrategicImpact />
        <LiveAgentDashboard />
        <ScheduleDemo />
      </main>
      <Navbar />
    </div>
  );
}
