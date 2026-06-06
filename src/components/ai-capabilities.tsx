"use client";

import { motion, Variants } from "framer-motion";

export default function AICapabilities() {
  const capabilities = [
    {
      title: "Fast Response Times",
      description: "Respond the moment customers are ready to ask a question, compare options, or take the next step.",
    },
    {
      title: "Natural Voice and Visual Timing",
      description: "Create smooth avatar conversations with coordinated voice, expression, and pacing for an easy-to-follow experience.",
    },
    {
      title: "Low Latency",
      description: "Reduce awkward pauses so voice and avatar interactions feel fluid, responsive, and natural.",
    },
    {
      title: "Brand-Aligned Personas",
      description: "Choose voice, appearance, tone, and behavior settings that reflect your institution’s brand, community, and customer expectations.",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 0.8
      } 
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 70,
        damping: 18,
        duration: 1
      } 
    },
  };

  return (
    <section id="capabilities" className="bg-bg-primary py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header - Styled to match Platform Capabilities */}
        <motion.div variants={headerVariants} className="mb-20 md:mb-32 flex flex-col items-center text-center gap-5">
           <div className="w-20 h-1 bg-brand-teal opacity-50 rounded-full" />
           <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-2">
             Core Capabilities
           </h2>
           <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30">
             Conversational AI for Trusted Financial Interactions
           </div>
        </motion.div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 items-stretch">
          {capabilities.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className="group relative bg-bg-card border border-border-subtle p-10 md:p-12 rounded-[2.5rem] flex flex-col items-start text-left transition-all duration-500 hover:border-brand-teal/45 hover:bg-[#0D2654] h-full overflow-hidden shadow-2xl"
            >
              {/* Subtle Glow Effect on Hover */}
              <div className="absolute -inset-px bg-brand-teal/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />

              {/* Title - Large and Brand Teal */}
              <h3 className="relative z-10 text-brand-teal text-2xl md:text-3xl xl:text-4xl font-black leading-tight tracking-tight mb-8">
                {item.title}
              </h3>

              {/* Description - Refined Fluid Typography */}
              <p className="relative z-10 text-text-secondary font-medium leading-[1.7] opacity-90 [font-size:clamp(1rem,1.15vw,1.15rem)]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
