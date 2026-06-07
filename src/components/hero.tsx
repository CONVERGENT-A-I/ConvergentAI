"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";

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
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center pt-44 md:pt-52 pb-20 px-8 md:px-12 lg:px-24 overflow-hidden">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--bg-secondary)_0%,_var(--bg-primary)_100%)] -z-10" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <motion.div
        className="max-w-7xl mx-auto flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Hero Trust Anchor */}
        <motion.div variants={itemVariants} className="mb-10">
          <Link href="/security" className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-brand-teal/30 transition-all cursor-pointer backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-brand-teal opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <span className="text-xs md:text-sm text-text-muted group-hover:text-white transition-colors">
              Review our <span className="font-semibold text-text-primary group-hover:text-brand-teal transition-colors">Security & Compliance Standards</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all text-brand-teal" />
          </Link>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 variants={itemVariants} className="text-fluid-h1 font-black text-white mb-8 tracking-tight">
          Turn Customer Interest <br />
          <span className="text-brand-teal">Into Action with 24/7 Support</span>
        </motion.h1>

        {/* Subheadline / Description */}
        <motion.p variants={itemVariants} className="text-fluid-p text-text-secondary max-w-4xl mb-12 font-medium balance">
          ConvergentAI helps banks, credit unions, and mortgage lenders turn customer intent into action with
          instant answers, guided next steps, and seamless access to the right human expert at the moment
          support is needed, in any language.
        </motion.p>

        {/* Call to Action Button */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <Link
            href="https://convergentai.neetocal.com/meeting-with-david-patten"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block bg-button-primary-bg text-button-primary-text px-8 md:px-12 py-4 md:py-6 rounded-2xl text-base md:text-xl font-black uppercase tracking-widest hover:bg-button-primary-hover active:bg-button-primary-active hover:shadow-[0_0_50px_rgba(34,197,204,0.4)] transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Schedule a Demo
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>

        {/* Trusted By Banner (Mockup for maturity) */}
        <motion.div variants={itemVariants} className="mt-20 md:mt-32 pt-12 border-t border-white/10 w-full max-w-5xl opacity-90 flex flex-col items-center gap-8 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-text-secondary">MORTGAGE GUIDANCE ALIGNED WITH INDUSTRY STANDARDS</span>
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
