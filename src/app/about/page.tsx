import Navbar from "@/components/navbar";
import AboutHero from "@/components/about-hero";
import AboutLeadership from "@/components/about-leadership";

export default function About() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="flex flex-col w-full overflow-hidden">
        <AboutHero />
        <AboutLeadership />
        {/* Additional about sections can be added here later */}
      </main>
    </div>
  );
}
