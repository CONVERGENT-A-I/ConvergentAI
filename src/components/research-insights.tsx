"use client";

import { motion, Variants } from "framer-motion";
import { TrendingDown, Clock, Zap, PhoneOff, Layers, Trophy, Cpu, TrendingUp } from "lucide-react";

export default function ResearchInsights() {
  const insights = [
    {
      label: "90% Drop-off Rate",
      text: "Most members leave your site without completing a single mortgage application.",
      icon: TrendingDown,
    },
    {
      label: "24/7 Intent",
      text: "60% of mortgage and home equity research happens while your branches are closed.",
      icon: Clock,
    },
    {
      label: "First-Response Rule",
      text: "78% of borrowers choose the first lender to respond, regardless of brand loyalty.",
      icon: Zap,
    },
    {
      label: "Delayed Connections",
      text: "Members only successfully reach a loan officer 10% of the time during business hours.",
      icon: PhoneOff,
    },
  ];

  const values = [
    {
      label: "Scalable Deployment",
      text: "Built for credit unions and CUSOs of all sizes.",
      icon: Layers,
    },
    {
      label: "Market Advantage",
      text: "Outpace competitors with instant digital engagement.",
      icon: Trophy,
    },
    {
      label: "Operational Efficiency",
      text: "Reduce labor costs with AI-guided self-service.",
      icon: Cpu,
    },
    {
      label: "Revenue Growth",
      text: "Capture more mortgage and home equity opportunities.",
      icon: TrendingUp,
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
    <section className="bg-black flex flex-col pt-12 md:pt-20 pb-24 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Main Headline */}
        <motion.h2 variants={itemVariants} className="text-fluid-h1 font-black text-white mb-20 tracking-tight leading-[1.1] text-balance">
          Why Your Members Research Mortgages With You—And <span className="text-brand-green">Finish Elsewhere</span>
        </motion.h2>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 mb-24 border-b border-white/10 pb-20">
          {insights.map((insight, index) => (
            <motion.div variants={itemVariants} key={index} className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20 group-hover:border-brand-green/40 transition-colors">
                <insight.icon className="w-6 h-6 text-brand-green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white text-xl md:text-2xl font-black tracking-tight">{insight.label}</h3>
                <p className="text-zinc-400 text-base md:text-lg font-medium leading-relaxed opacity-80">{insight.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          {values.map((value, index) => (
            <motion.div variants={itemVariants} key={index} className="flex gap-5 items-start group">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-brand-green/30 transition-colors">
                <value.icon className="w-5 h-5 text-brand-green/60 group-hover:text-brand-green transition-colors" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white text-base md:text-lg font-bold tracking-tight">{value.label}</h4>
                <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed">{value.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Footer Box */}
        <motion.div variants={itemVariants} className="relative p-8 md:p-12 bg-[#0D0D0D] border-l-4 border-brand-green border-y border-y-white/5 border-r border-r-white/5 rounded-r-[2rem] rounded-l-sm overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-32 h-full bg-brand-green/5 blur-3xl -z-10" />
          
          <p className="text-white text-lg md:text-xl lg:text-2xl font-bold leading-relaxed tracking-tight text-balance">
            ConvergentAI eliminates mortgage leakage by capturing member intent 24/7 directly on your website. 
            Our AI assistant guides members through complex next steps and instantly routes hot opportunities to your MLOs and branches. 
            By ensuring your credit union is always the first to respond, we secure member loyalty and keep mortgage production inside your institution.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
