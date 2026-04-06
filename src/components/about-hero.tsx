"use client";

import { motion, Variants } from "framer-motion";

export default function AboutHero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  return (
    <section className="relative min-h-[100vh] w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-24 overflow-hidden pt-32 pb-40">
      {/* Background depth - matching the premium convergent style */}
      <div className="absolute inset-0 bg-black -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,153,0.08),transparent_70%)] -z-10" />
      
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-60" />

      <motion.div 
        className="max-w-7xl mx-auto flex flex-col items-center text-center w-full z-10 flex-grow justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Refined Badge */}
        <motion.div variants={itemVariants} className="mb-10 p-1.5 rounded-full bg-zinc-900/50 border border-white/5 backdrop-blur-md px-5 flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
           <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/60">Our Mission</span>
        </motion.div>

        {/* Main Headline - High-impact, black-weight typography */}
        <motion.h1 variants={itemVariants} className="font-black text-white mb-10 tracking-tighter text-balance w-full"
            style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: "1.05" }}>
          Empowering CUSOs & <br className="hidden md:block" /> Credit Unions <br className="hidden md:block" />
          <span className="text-brand-green">Through AI Innovation</span>
        </motion.h1>
        
        {/* Refined Subtitle */}
        <motion.p variants={itemVariants} className="text-zinc-400 font-medium max-w-[900px] mx-auto text-balance leading-relaxed opacity-90"
           style={{ fontSize: "clamp(1.1rem, 1.35vw, 1.45rem)" }}>
          We leverage conversational intelligence to help mortgage lenders and credit unions 
          scale personalized engagement to millions, acting as one unified phygital experience 
          that builds trust and drives conversion.
        </motion.p>
      </motion.div>

      {/* Refined Scroll Indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 hover:opacity-80 transition-opacity duration-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-[10px] text-brand-green uppercase tracking-[0.5em] font-black">Scroll</span>
        <div className="w-[1.5px] h-20 bg-gradient-to-b from-brand-green via-brand-green/20 to-transparent" />
      </motion.div>
    </section>
  );
}
