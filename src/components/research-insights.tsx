"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { TrendingDown, Clock, Zap, PhoneOff, Layers, Trophy, Cpu, TrendingUp, FileDown } from "lucide-react";
import WhitepaperGateModal from "./whitepaper-gate-modal";

export default function ResearchInsights() {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const insights = [
    {
      label: "68% Drop-off Rate",
      text: "The majority of potential customers abandon their online applications for financial services.",
      icon: TrendingDown,
    },
    {
      label: "Weekend & Evening Opportunities",
      text: "Busy customers often research mortgage, home equity, and financial products after hours.",
      icon: Clock,
    },
    {
      label: "Speed-to-Lead Advantage",
      text: "The chances of contacting a lead drop 100x in 30 minutes. Fast engagement is crucial.",
      icon: Zap,
    },
    {
      label: "Missed Connections",
      text: "Leads lose momentum when loan officers are unable to connect at their moment of interest.",
      icon: PhoneOff,
    },
  ];

  const values = [
    {
      label: "Scalable Deployment",
      text: "Built for financial institutions of all sizes.",
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
    <section className="bg-bg-secondary flex flex-col pt-12 md:pt-20 pb-24 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Main Headline */}
        <motion.h2 variants={itemVariants} className="text-fluid-h1 font-black text-white mb-8 tracking-tight leading-[1.1] text-balance">
          Stop Losing Mortgage Opportunities to <span className="text-brand-teal">Faster Competitors</span>
        </motion.h2>

        {/* Subheader */}
        <motion.p variants={itemVariants} className="text-text-secondary text-lg md:text-xl font-medium max-w-4xl mb-20 md:mb-24 text-balance opacity-80">
          Today’s busy mortgage applicants research on their own schedule, not yours. With ConvergentAI, you’ll be available with answers when they’re ready to start building a relationship.
        </motion.p>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 mb-24 border-b border-white/10 pb-20">
          {insights.map((insight, index) => (
            <motion.div variants={itemVariants} key={index} className="flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 group-hover:border-brand-blue/40 transition-colors">
                <insight.icon className="w-6 h-6 text-brand-blue" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white text-xl md:text-2xl font-black tracking-tight">{insight.label}</h3>
                <p className="text-text-secondary text-base md:text-lg font-medium leading-relaxed opacity-80">{insight.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          {values.map((value, index) => (
            <motion.div variants={itemVariants} key={index} className="flex gap-5 items-start group">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-brand-teal/30 transition-colors">
                <value.icon className="w-5 h-5 text-brand-periwinkle group-hover:text-brand-teal transition-colors" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white text-base md:text-lg font-bold tracking-tight">{value.label}</h4>
                <p className="text-text-muted text-sm md:text-base font-medium leading-relaxed">{value.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Footer Box */}
        <motion.div variants={itemVariants} className="relative p-8 md:p-12 bg-bg-card border-l-4 border-brand-blue border-y border-y-border-subtle border-r border-r-border-subtle rounded-r-[2rem] rounded-l-sm overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-32 h-full bg-brand-blue/5 blur-3xl -z-10" />
          
          <p className="text-white text-lg md:text-xl lg:text-2xl font-bold leading-relaxed tracking-tight text-balance">
            ConvergentAI eliminates mortgage leakage by capturing Applicant intent 24/7 directly on your website. 
            Our AI assistant guides Applicants through complex next steps and instantly routes hot opportunities to your MLOs and branches. 
            By ensuring your institution is always the first to respond, we secure Applicant loyalty and keep mortgage production inside your institution.
          </p>
        </motion.div>

        {/* Whitepaper Download Card */}
        <motion.div
          variants={itemVariants}
          className="relative mt-16 p-8 md:p-10 rounded-2xl border border-border-subtle bg-bg-card backdrop-blur-sm overflow-hidden group hover:border-brand-teal/40 transition-colors duration-500"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-teal/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            {/* Icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center group-hover:bg-brand-blue/20 group-hover:border-brand-blue/40 transition-all duration-500">
              <FileDown className="w-7 h-7 text-brand-blue" />
            </div>

            {/* Text */}
            <div className="flex-1 space-y-2">
              <h3 className="text-white text-xl md:text-2xl font-black tracking-tight">
                The Phygital Imperative
              </h3>
              <p className="text-text-secondary text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                Download our whitepaper on bridging digital and physical touchpoints to eliminate mortgage drop-off and build lasting Applicant relationships.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={() => setIsGateOpen(true)}
              className="flex-shrink-0 inline-flex items-center gap-2.5 bg-button-primary-bg text-button-primary-text px-7 py-3.5 rounded-full text-sm font-black uppercase tracking-widest hover:bg-button-primary-hover active:bg-button-primary-active hover:shadow-[0_0_30px_rgba(34,197,204,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Download
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Lead Capture Gate Modal */}
      <WhitepaperGateModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} />
    </section>
  );
}
