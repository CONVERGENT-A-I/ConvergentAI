import Navbar from "@/components/navbar";
import AboutHero from "@/components/about-hero";
import AboutLeadership from "@/components/about-leadership";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function About() {
  return (
    <div className={`${outfit.variable} font-sans min-h-screen bg-black`}>
      <Navbar />
      <main className="flex flex-col w-full overflow-hidden">
        <AboutHero />
        <AboutLeadership />
        {/* Additional about sections can be added here later */}
      </main>
    </div>
  );
}
