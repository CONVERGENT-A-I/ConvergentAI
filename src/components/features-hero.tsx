"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function FeaturesHero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 70,
        damping: 20,
        duration: 0.8 
      } 
    },
  };

  return (
    <section id="features-hero" className="relative min-h-[70svh] flex items-center justify-center pt-44 md:pt-52 pb-20 px-8 md:px-12 lg:px-24 overflow-hidden">
      {/* Background radial gradient for depth - Matching Home Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111111_0%,_#000000_100%)] -z-10" />
      
      {/* Subtle Grid Pattern - Matching Home Hero */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <motion.div 
        className="max-w-7xl mx-auto flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Core Pillars Badge */}
        <motion.div variants={itemVariants} className="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
           <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_rgba(0,255,153,0.8)]" />
           <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/50">Core Pillars</span>
        </motion.div>

        {/* Impactful Centered Headline */}
        <motion.h1 variants={itemVariants} className="text-fluid-h1 font-black text-white mb-10 tracking-tight leading-[1.05]">
          The Future of <br className="hidden md:block" />
          <span className="text-brand-green">Phygital Member Services</span>
        </motion.h1>

        {/* Subheadline / Description */}
        <motion.div variants={itemVariants} className="max-w-3xl space-y-8">
          <p className="text-fluid-p text-zinc-400 font-medium balance">
            ConvergentAI orchestrates enterprise-grade omnichannel experiences, 
            merging physical branch presence with digital speed to serve the modern member 24/7.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8 opacity-60">
             <div className="h-px w-12 bg-white/20 hidden md:block" />
             <p className="text-xs md:text-sm font-bold tracking-widest text-zinc-500 uppercase">
                Optimized Engagement Across All Banking Products
             </p>
             <div className="h-px w-12 bg-white/20 hidden md:block" />
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
