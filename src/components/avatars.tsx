"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import h1 from "../../public/h1.png";
import h2 from "../../public/h2.png";
import h3 from "../../public/h3.png";

export default function Avatars() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
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
    <section id="avatars" className="bg-black min-h-[100svh] flex flex-col justify-center py-20 md:py-28 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Top Grid - Avatar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-8 md:mb-10">
          {/* BranchPortal Card */}
          <motion.div variants={itemVariants} className="group cursor-pointer">
            <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-700 hover:border-brand-green/40">
              <Image
                src={h1}
                alt="BranchPortal AI Avatar System"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>
            <p className="mt-10 text-brand-green text-sm md:text-lg font-black uppercase tracking-[0.25em]">
              BRANCHPORTAL: AN AI-POWERED AVATAR SYSTEM
            </p>
          </motion.div>

          {/* At-Home Engagement Card */}
          <motion.div variants={itemVariants} className="group cursor-pointer">
            <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-700 hover:border-brand-green/40">
              <Image
                src={h2}
                alt="At-Home 24/7 Digital AI Engagement"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>
            <p className="mt-10 text-brand-green text-sm md:text-lg font-black uppercase tracking-[0.25em]">
              AT-HOME: 24/7 DIGITAL AI ENGAGEMENT
            </p>
          </motion.div>
        </div>

        {/* Professional Separation Line - More Prominent */}
        <motion.div variants={itemVariants} className="w-full h-px bg-white/20 mb-16 md:mb-20" />

        {/* Bottom Grid - Features / Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-20 mb-24 items-start">
          <motion.div variants={itemVariants} className="space-y-6 max-w-[400px]">
            <h2 className="text-white text-2xl md:text-3xl lg:text-[2.25rem] font-black leading-[1.3] tracking-tighter text-balance">
              Increase completed applications and reduce applicant abandonment.
            </h2>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6 max-w-[400px]">
            <h2 className="text-white text-2xl md:text-3xl lg:text-[2.25rem] font-black leading-[1.3] tracking-tighter text-balance">
              Accurate AI guidance trained on Fannie Mae, Freddie Mac, and HUD guidelines.
            </h2>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-6 max-w-[400px]">
            <h2 className="text-white text-2xl md:text-3xl lg:text-[2.25rem] font-black leading-[1.3] tracking-tighter text-balance">
              Connect to real MLOs fast when a human handoff is needed.
            </h2>
          </motion.div>
        </div>

        {/* Bottom CTA Box - Increased size and font */}
        <motion.div variants={itemVariants} className="flex justify-center md:justify-end">
          <a
            href="#schedule-demo"
            className="group relative inline-flex items-center justify-center border border-zinc-700 hover:border-brand-green px-8 md:px-16 py-4 md:py-8 rounded-2xl transition-all overflow-hidden"
          >
            <span className="relative z-10 text-brand-green text-base md:text-lg font-black uppercase tracking-widest group-hover:!text-black transition-colors duration-300 text-center">
              Have Questions? Click Here
            </span>
            <div className="absolute inset-0 z-0 bg-brand-green transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
