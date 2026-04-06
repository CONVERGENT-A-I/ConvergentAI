"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import a1 from "../../public/a1.png";
import a2 from "../../public/a2.png";


const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function AboutLeadership() {
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
    <section id="leadership" className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >

        {/* Section Header - Matching Platform Capabilities Pattern */}
        <motion.div variants={itemVariants} className="mb-20 md:mb-32 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-1 bg-brand-green opacity-50 rounded-full" />
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-2">
            The Leadership
          </h2>
          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30">
            Phygital Innovation Experts
          </div>
        </motion.div>

        {/* Narrative Intro */}
        <motion.div variants={itemVariants} className="mb-24 text-center max-w-4xl mx-auto">
          <p className="text-zinc-400 font-medium leading-[1.8] [font-size:clamp(1.1rem,1.4vw,1.45rem)] opacity-90 mx-auto max-w-[850px] text-pretty">
            Our leadership team brings 30+ years of combined mortgage and technology experience
            together with modern AI and phygital design. We understand how to empower branches,
            contact centers, and digital teams to work as one.
          </p>
        </motion.div>

        {/* Team Grid - Circular Style */}
        <div className="flex flex-col md:flex-row gap-20 md:gap-32 lg:gap-48 w-full justify-center items-center">

          {/* David Patten - Founder & CEO */}
          <motion.div variants={itemVariants} className="group flex flex-col items-center text-center">
            <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] mb-10">
              {/* Premium Background Glow Effect */}
              <div className="absolute -inset-4 bg-brand-green/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100" />

              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/10 group-hover:border-brand-green/50 shadow-2xl transition-all duration-700 hover:scale-[1.03] z-10">
                <Image
                  src={a1}
                  alt="David Patten"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 relative z-20">
              <h3 className="text-white font-black tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}>
                David Patten
              </h3>
              <p className="font-black tracking-[0.2em] uppercase text-[10px] md:text-xs text-brand-green">
                Founder & CEO
              </p>
              <a
                href="https://linkedin.com/in/davidpatten"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-brand-green hover:text-black hover:border-brand-green transition-all duration-300"
              >
                <LinkedinIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>

          {/* Elisa Llamido - COO */}
          <motion.div variants={itemVariants} className="group flex flex-col items-center text-center">
            <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] mb-10">
              {/* Premium Background Glow Effect */}
              <div className="absolute -inset-4 bg-brand-green/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100" />

              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/10 group-hover:border-brand-green/50 shadow-2xl transition-all duration-700 hover:scale-[1.03] z-10">
                <Image
                  src={a2}
                  alt="Elisa Llamido"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 relative z-20">
              <h3 className="text-white font-black tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}>
                Elisa Llamido
              </h3>
              <p className="font-black tracking-[0.2em] uppercase text-[10px] md:text-xs text-brand-green">
                COO
              </p>
              <a
                href="https://linkedin.com/in/elisallamido"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-brand-green hover:text-black hover:border-brand-green transition-all duration-300"
              >
                <LinkedinIcon className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </section>
  );
}
