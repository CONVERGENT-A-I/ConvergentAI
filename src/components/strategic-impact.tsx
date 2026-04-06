"use client";

import { motion, Variants } from "framer-motion";

export default function StrategicImpact() {
  const impacts = [
    {
      title: "Maximize Growth",
      description: "Drive higher conversion with AI-guided mortgage and home equity applications.",
    },
    {
      title: "Unified Experience",
      description: "Seamlessly integrate digital engagement with your branch and contact center.",
    },
    {
      title: "Lasting Loyalty",
      description: "Build trust by instantly connecting members to human experts when they need it most.",
    },
  ];

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
    <section className="bg-black min-h-[100svh] flex flex-col justify-center py-24 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >

        {/* Main Headline — fluid clamp keeps it on one line as long as possible, wraps gracefully on small screens */}
        <motion.h2
          variants={itemVariants}
          className="font-black text-white mb-6 tracking-tight leading-[1.1] w-full"
          style={{ fontSize: "clamp(2rem, 5.5vw, 5.5rem)" }}
        >
          Strategic Impact for Credit Unions
        </motion.h2>

        {/* Wider Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-zinc-400 font-medium mb-16 max-w-[1000px] mx-auto leading-relaxed"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)" }}
        >
          ConvergentAI unifies digital and physical touchpoints to eliminate drop-off rates and
          secure member loyalty across every banking product line.
        </motion.p>

        {/* Prominent Divider */}
        <motion.div variants={itemVariants} className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-16" />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 mb-20">
          {impacts.map((impact, index) => (
            <motion.div variants={itemVariants} key={index} className="flex flex-col items-center gap-4">
              {/* Sub-heading with number badge + green label */}
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 rounded-full border border-brand-green/50 flex items-center justify-center text-brand-green text-xs font-black shrink-0">
                  0{index + 1}
                </span>
                <h3
                  className="text-brand-green font-black tracking-tight uppercase"
                  style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.875rem)" }}
                >
                  {impact.title}
                </h3>
              </div>
              <p className="text-zinc-300 font-medium leading-relaxed max-w-[380px]"
                style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.125rem)" }}
              >
                {impact.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Second prominent divider */}
        <motion.div variants={itemVariants} className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-16" />

        {/* Strategic Summary Footer Text */}
        <motion.div variants={itemVariants} className="max-w-[1200px] mx-auto">
          <p className="text-zinc-400 font-medium leading-relaxed opacity-80 text-balance"
            style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.25rem)" }}
          >
            Drive growth across your entire portfolio including mortgage, wealth management, SBA loans,
            insurance, and auto loans. Unified LiveAgent and ConvergentAI provide the strategic outcomes
            needed to scale additional lines of business with zero-latency digital engagement.
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
}
