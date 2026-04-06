"use client";

import { motion, Variants } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "Unified Member Timeline",
    description: "View every digital touchpoint and AI interaction across all channels in one chronological member journey.",
  },
  {
    title: "Real-time Co-browsing & E-sign Support",
    description: "Instantly join member sessions to guide them through complex e-sign workflows and document uploads.",
  },
  {
    title: "Integrated Multimodal Dashboard",
    description: "Manage cross-channel chat, voice, and video interactions within a single, unified agent view.",
  },
  {
    title: "Mortgage Pipeline Visibility",
    description: "Monitor LOS application status and pipeline health directly alongside live communications.",
  },
  {
    title: "Instant AI-to-Human Handoff",
    description: "Seamlessly transition high-intent members from AI assistants to expert MLOs at the critical moment.",
  },
];

export default function LiveAgentDashboard() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  return (
    <section className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="font-black text-white tracking-tight leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
            >
              Human Expertise in the Digital Mortgage Final Mile
            </motion.h2>

            {/* Sub-description */}
            <motion.p 
              variants={itemVariants}
              className="text-zinc-400 font-medium leading-relaxed mb-12"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.2rem)" }}
            >
              The Unified LiveAgent Dashboard provides MLOs with deep member context and real-time
              collaboration tools to drive loan production and ensure successful eMortgage closings.
            </motion.p>

            {/* Feature List */}
            <ul className="space-y-6 mb-12">
              {features.map((feature, index) => (
                <motion.li variants={itemVariants} key={index} className="flex gap-4 items-start group">
                  <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-1" strokeWidth={2} />
                  <div>
                    <span className="text-white font-bold block mb-0.5"
                      style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.1rem)" }}
                    >
                      {feature.title}
                    </span>
                    <span className="text-zinc-500 font-medium leading-relaxed"
                      style={{ fontSize: "clamp(0.85rem, 1vw, 1rem)" }}
                    >
                      {feature.description}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <motion.div variants={itemVariants}>
              <a
                href="https://my-solution-app.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block bg-brand-green text-black px-4 md:px-6 py-3 md:py-4 rounded-2xl text-xs md:text-sm font-black uppercase tracking-wide hover:shadow-[0_0_40px_rgba(0,255,153,0.5)] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                View LiveAgent Dashboard
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </motion.div>
          </div>

          {/* Right: Stacked Image Mockups */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            {/* Top Image — full width */}
            <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 w-full">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200"
                alt="Unified LiveAgent Dashboard — full view"
                className="w-full h-auto object-cover opacity-90"
                loading="lazy"
              />
            </div>
            {/* Bottom Image — smaller, centered under the first */}
            <div className="rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 w-2/3 mx-auto">
              <img
                src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800"
                alt="LiveAgent mortgage intent scoring panel"
                className="w-full h-auto object-cover opacity-90"
                loading="lazy"
              />
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
