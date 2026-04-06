"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function Hero() {
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
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center pt-52 md:pt-72 pb-20 px-8 md:px-12 lg:px-24 overflow-hidden">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111111_0%,_#000000_100%)] -z-10" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <motion.div 
        className="max-w-7xl mx-auto flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Main Headline */}
        <motion.h1 variants={itemVariants} className="text-fluid-h1 font-black text-white mb-8 tracking-tight">
          Stop Mortgage Leakage <br />
          <span className="text-brand-green">with 24/7 Phygital</span> <br />
          <span className="inline-block">Member Engagement</span>
        </motion.h1>

        {/* Subheadline / Description */}
        <motion.p variants={itemVariants} className="text-fluid-p text-zinc-400 max-w-3xl mb-12 font-medium balance">
          Recover lost opportunities with AI voice and human-like avatars trained
          to answer member mortgage questions accurately using Fannie Mae,
          Freddie Mac, and HUD guidelines.
        </motion.p>

        {/* Call to Action Button */}
        <motion.div variants={itemVariants}>
          <Link
            href="https://warpme.neetocal.com/meeting-with-david-patten-19"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block bg-brand-green text-black px-8 md:px-12 py-4 md:py-6 rounded-2xl text-base md:text-xl font-black uppercase tracking-widest hover:shadow-[0_0_50px_rgba(0,255,153,0.6)] transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Schedule a Demo
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>

        {/* Trusted By Banner (Mockup for maturity) */}
        <motion.div variants={itemVariants} className="mt-20 md:mt-32 pt-12 border-t border-white/10 w-full max-w-5xl opacity-90 flex flex-col items-center gap-8 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-zinc-300">Industry Standard AI Intelligence</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-100 transition-opacity duration-500">
            <span className="text-white font-black text-lg md:text-2xl tracking-tighter italic drop-shadow-md">Fannie Mae</span>
            <span className="text-white font-black text-lg md:text-2xl tracking-tighter italic drop-shadow-md">Freddie Mac</span>
            <span className="text-white font-black text-lg md:text-2xl tracking-tighter italic drop-shadow-md">HUD Guidelines</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
