"use client";

import { motion, Variants } from "framer-motion";
import { Home, UserPlus, Target, ShieldCheck } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Mortgage Acceleration",
      description: "Achieve higher funded mortgages with AI assistance that prevents application drop-off and automates key documentation steps.",
      icon: Home,
    },
    {
      title: "Elevated MX Scores",
      description: "Boost Member Experience (MX) scores by providing seamless, friction-free transitions between digital and in-branch touchpoints.",
      icon: UserPlus,
    },
    {
      title: "Cross-Sell Growth",
      description: "Identify and capture cross-sell opportunities in real-time with AI monitors that analyze member engagement across channels.",
      icon: Target,
    },
    {
      title: "Compliance & Security",
      description: "Support 50-state MLO licensing, S.A.F.E. Act compliance, and emerging AI regulations with end-to-end encryption and audit trails.",
      icon: ShieldCheck,
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
    <section id="features" className="bg-black flex flex-col pt-4 md:pt-8 pb-16 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Responsive Grid: 1 col mobile, 2 col tablet/laptop, 4 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 items-stretch">
          {features.map((feature, index) => (
            <motion.div
              variants={itemVariants}
              key={index}
              className="group relative bg-zinc-950/40 border border-white/5 p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:border-brand-green/30 hover:bg-zinc-900/40 h-full"
            >
              {/* Subtle Glow Effect on Hover */}
              <div className="absolute -inset-px bg-brand-green/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

              {/* Icon Container - Increased Size */}
              <div className="relative z-10 w-20 h-20 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-8 border border-brand-green/20">
                  <feature.icon className="w-10 h-10 text-brand-green" strokeWidth={1.5} />
              </div>

              {/* Headline */}
              <h3 className="relative z-10 text-white text-2xl md:text-3xl font-black leading-tight tracking-tighter mb-6 text-balance">
                {feature.title}
              </h3>

              {/* Description with Fluid Typography - Increased Scale and Balancing */}
              <p className="relative z-10 text-zinc-400 font-medium leading-[1.6] opacity-80 text-balance [font-size:clamp(1rem,1.25vw,1.25rem)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
