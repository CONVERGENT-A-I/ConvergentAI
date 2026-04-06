"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import f3 from "../../public/f3.png";
import f4 from "../../public/f4.png";
import f5 from "../../public/f5.png";

export default function CaseStudies() {
  const cases = [
    {
      image: f3,
      title: "Mortgage Acceleration Rollout",
      stat: "+25% digital mortgage completions"
    },
    {
      image: f4,
      title: "AI BranchPortal Expansion",
      stat: "+35% engagement in non-business hours"
    },
    {
      image: f5,
      title: "Regional CUSO Member Growth",
      stat: "+20% cross-sell conversion rate"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
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

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: 60 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 50,
        damping: 12,
        duration: 1
      } 
    },
  };

  return (
    <section className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Centered Header */}
        <motion.div variants={textVariants} className="flex flex-col items-center text-center gap-6 mb-20 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase max-w-4xl">
            Real Impact for <br className="hidden md:block" /> Credit Unions & CUSOs
          </h2>
        </motion.div>

        {/* 3-Column Responsive Case Study Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {cases.map((cs, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group flex flex-col items-start gap-6 bg-zinc-900/20 rounded-[2.5rem] border border-white/5 p-4 pb-10 transition-all duration-700 hover:border-brand-green/20 hover:bg-zinc-900/40"
            >
              {/* Premium Image Container */}
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-[2rem] bg-white border border-white/10 transition-all duration-700 group-hover:shadow-[0_0_40px_rgba(0,255,153,0.05)]">
                <Image
                  src={cs.image}
                  alt={cs.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Case Study Details */}
              <div className="px-6 space-y-4">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/50">
                  Case Study
                </span>

                <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  {cs.title}
                </h3>

                <p className="text-brand-green font-bold text-sm md:text-base tracking-wide">
                  {cs.stat}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
