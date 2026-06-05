"use client";

import { motion, Variants } from "framer-motion";
import { Home, UserPlus, Target, ShieldCheck } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Mortgage Acceleration",
      description: "Prevent drop-off with AI assistance that provides immediate answers, guided next steps, and seamless handoff to lending specialists.",
      icon: Home,
    },
    {
      title: "Elevated Customer Experience",
      description: "Reduce friction by giving customers a responsive, continuous conversational experience between digital and in-branch touchpoints.",
      icon: UserPlus,
    },
    {
      title: "Cross-Sell Growth",
      description: "Identify relevant needs during natural conversations and route qualified opportunities to the right product team or specialist.",
      icon: Target,
    },
    {
      title: "Compliance & Security",
      description: "Support 50-state Mortgage Loan Originator licensing, S.A.F.E. Act compliance, and emerging AI regulations with end-to-end encryption & audit trails.",
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
    <section id="features" className="bg-bg-primary flex flex-col pt-4 md:pt-8 pb-16 px-8 md:px-12 lg:px-24 overflow-hidden">
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
              className="group relative bg-bg-card border border-border-subtle p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:border-brand-teal/45 hover:bg-[#0D2654] h-full"
            >
              {/* Subtle Glow Effect on Hover */}
              <div className="absolute -inset-px bg-brand-teal/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

              {/* Icon Container - Increased Size */}
              <div className="relative z-10 w-20 h-20 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-8 border border-brand-blue/20">
                  <feature.icon className="w-10 h-10 text-brand-blue group-hover:text-brand-teal transition-colors duration-300" strokeWidth={1.5} />
              </div>

              {/* Headline */}
              <h3 className="relative z-10 text-white text-2xl md:text-3xl font-black leading-tight tracking-tighter mb-6 text-balance">
                {feature.title}
              </h3>

              {/* Description with Fluid Typography - Increased Scale and Balancing */}
              <p className="relative z-10 text-text-secondary font-medium leading-[1.6] opacity-80 text-balance [font-size:clamp(1rem,1.25vw,1.25rem)]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
