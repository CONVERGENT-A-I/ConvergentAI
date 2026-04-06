"use client";

import { LucideIcon, Zap, Shield, MessageSquare, Cpu, Users, Smartphone } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <div className="group relative bg-zinc-900/30 border border-white/5 p-8 md:p-12 rounded-[2.5rem] flex flex-col items-start transition-all duration-500 hover:border-brand-green/30 hover:bg-zinc-900/50 h-full overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -inset-px bg-brand-green/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
      
      {/* Icon */}
      <div className="relative z-10 w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-8 border border-brand-green/20 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-7 h-7 text-brand-green" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className="relative z-10 text-white text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-4">
        {title}
      </h3>
      <p className="relative z-10 text-zinc-400 font-medium leading-[1.6] [font-size:clamp(1rem,1.1vw,1.15rem)]">
        {description}
      </p>

      {/* Subtle Bottom Accent */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-green transition-all duration-700 group-hover:w-full opacity-50" />
    </div>
  );
}

export default function FeaturesGrid() {
  const features = [
    {
      title: "Phygital Member Journeys",
      description: "Seamlessly transition members from digital research to in-branch completion with unified data and context.",
      icon: Smartphone,
    },
    {
      title: "AI-Powered BranchPortal",
      description: "Reduce staffing overhead with conversational avatars that handle routine inquiries and guide product discovery.",
      icon: Users,
    },
    {
      title: "eMortgage Acceleration",
      description: "Boost online completions by over 25% and provide members with exceptional experiences.",
      icon: Zap,
    },
    {
      title: "Secure Omnichannel Messaging",
      description: "Enterprise-grade protection across all channels, ensuring member data remains private and compliant with CUSO & credit union standards.",
      icon: Shield,
    },
    {
      title: "AI Voice & Human-Like Avatars",
      description: "Deliver natural, 24/7 member service with AI-powered voice and lifelike avatars that feel human, reduce wait times, and keep members engaged across channels.",
      icon: MessageSquare,
    },
    {
      title: "Seamless Infrastructure Integration",
      description: "Seamless integration with your existing contact center infrastructure, with minimal IT lift.",
      icon: Cpu,
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
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 80,
        damping: 18,
        duration: 0.8
      } 
    },
  };

  return (
    <section className="bg-black py-20 md:py-32 overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
