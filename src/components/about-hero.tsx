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
    <section className="relative min-h-[100vh] w-full flex flex-col px-8 md:px-12 lg:px-24 overflow-hidden pt-44 md:pt-52 pb-6 md:pb-8">
      {/* Background depth - matching the premium convergent style */}
      <div className="absolute inset-0 bg-bg-primary -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,204,0.08),transparent_70%)] -z-10" />
      
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-60" />

      <motion.div
        className="max-w-7xl mx-auto flex flex-col flex-1 justify-start items-center text-center w-full z-10 min-h-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Badge — same spacing + chrome as Features “Core Pillars” */}
        <motion.div variants={itemVariants} className="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse shadow-[0_0_8px_rgba(34,197,204,0.8)]" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/50">Our Mission</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="font-black text-white mb-10 tracking-tighter text-balance w-full"
            style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: "1.05" }}>
          Technology That Strengthens <br className="hidden md:block" />
          <span className="text-brand-teal">Financial Relationships</span>
        </motion.h1>
        
        {/* Refined Subtitle */}
        <motion.div 
          variants={itemVariants} 
          className="text-text-secondary font-medium max-w-[1000px] mx-auto leading-relaxed opacity-90 space-y-6 text-center"
          style={{ fontSize: "clamp(1rem, 1.15vw, 1.25rem)" }}
        >
          <p className="text-pretty">
            ConvergentAI helps banks, credit unions, and mortgage lenders respond to customers wherever they are, whenever they show interest. Our AI voice, chat, and avatar experiences provide immediate guidance, answer questions within set guidelines, and connect customers to the right human expert when needed. The result is faster engagement that enhances the relationship-driven service financial institutions are built on.
          </p>
          <p className="text-pretty">
            Until now, there’s been a disconnect. Customers expect answers the moment they have a question, but financial decisions still require trust, context, and human connection. ConvergentAI was created to close that gap.
          </p>
          <p className="text-brand-teal font-black text-pretty">
            We believe technology should strengthen relationships, not replace them.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll cue in document flow so it never overlaps the copy */}
      <motion.div
        className="relative z-10 shrink-0 flex flex-col items-center gap-4 pt-6 md:pt-8 px-4 opacity-40 hover:opacity-80 transition-opacity duration-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-[10px] text-brand-teal uppercase tracking-[0.5em] font-black">Scroll</span>
        <div className="w-[1.5px] h-20 bg-gradient-to-b from-brand-teal via-brand-teal/20 to-transparent" />
      </motion.div>
    </section>
  );
}
