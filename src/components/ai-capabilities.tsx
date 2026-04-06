"use client";

import { motion, Variants } from "framer-motion";

export default function AICapabilities() {
  const capabilities = [
    {
      title: "Fast Response Times",
      description: "AI that thinks as fast as your members. Ensure no-lag interactions during critical mortgage queries and member service requests.",
    },
    {
      title: "Precise Lip Sync",
      description: "Visual realism that builds trust. Our avatars mirror human speech patterns with pixel-perfect synchronization for authentic rapport.",
    },
    {
      title: "Low Latency",
      description: "Natural flow, no awkward pauses. Conversational speed that matches human expectations for frictionless member engagement.",
    },
    {
      title: "Unmatched Realism",
      description: "Choose the face and voice that resonate with your brand. Build video agents with unmatched realism that members can speak with instantly.",
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
    <section id="capabilities" className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header - Styled to match Platform Capabilities */}
        <motion.div variants={headerVariants} className="mb-20 md:mb-32 flex flex-col items-center text-center gap-5">
           <div className="w-20 h-1 bg-brand-green opacity-50 rounded-full" />
           <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-2">
             Core Capabilities
           </h2>
           <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30">
             Next-Gen Conversational AI
           </div>
        </motion.div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 items-stretch">
          {capabilities.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className="group relative bg-zinc-950/40 border border-white/5 p-10 md:p-12 rounded-[2.5rem] flex flex-col items-start text-left transition-all duration-500 hover:border-brand-green/30 hover:bg-zinc-900/40 h-full overflow-hidden shadow-2xl"
            >
              {/* Subtle Glow Effect on Hover */}
              <div className="absolute -inset-px bg-brand-green/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />

              {/* Title - Large and Brand Green */}
              <h3 className="relative z-10 text-brand-green text-2xl md:text-3xl xl:text-4xl font-black leading-tight tracking-tight mb-8">
                {item.title}
              </h3>

              {/* Description - Refined Fluid Typography */}
              <p className="relative z-10 text-zinc-400 font-medium leading-[1.7] opacity-90 [font-size:clamp(1rem,1.15vw,1.15rem)]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
