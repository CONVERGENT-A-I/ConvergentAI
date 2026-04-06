"use client";

import { motion, Variants } from "framer-motion";

export default function Outcomes() {
  const metrics = [
    {
      title: "Bounce rate reduction:",
      stat: "15–30%",
    },
    {
      title: "Application start lift:",
      stat: "40–80%",
    },
    {
      title: "Closed loan volume lift:",
      stat: "20–40% as a result",
    },
    {
      title: "Faster lead-to-contact speeds",
      stat: "drive more funded loans",
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
    <section className="bg-black min-h-[100svh] flex flex-col justify-center py-20 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Section Headline */}
        <motion.h2 variants={itemVariants} className="text-white text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter mb-8 text-balance">
          Driving Measurable Outcomes <br />
          for CUSOs and Credit Unions
        </motion.h2>

        {/* Subheader */}
        <motion.p variants={itemVariants} className="text-zinc-400 text-lg md:text-xl lg:text-2xl font-medium max-w-4xl mx-auto mb-20 md:mb-24 balance opacity-80">
          The ConvergentAI platform delivers quantifiable performance lifts across
          every stage of the member journey.
        </motion.p>

        {/* Metrics Box */}
        <motion.div variants={itemVariants} className="relative group mx-auto">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 bg-brand-green/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative bg-zinc-950/20 border-2 border-brand-green/60 rounded-[2.5rem] p-12 md:p-16 lg:p-24 overflow-hidden">
            {/* Grid for metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 lg:gap-20 items-stretch">
              {metrics.map((metric, index) => (
                <motion.div variants={itemVariants} key={index} className="flex flex-col gap-4 text-center lg:text-left max-w-[320px] mx-auto lg:mx-0">
                  <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-black leading-[1.2] tracking-tighter text-balance">
                    {metric.title} <br className="hidden lg:block" />
                    <span className="text-brand-green italic font-bold">
                      {metric.stat}
                    </span>
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
