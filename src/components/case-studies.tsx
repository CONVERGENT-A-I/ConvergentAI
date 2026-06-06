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
      title: "Digital Mortgage Completion",
      description: "AI-guided mortgage support can help applicants move through digital next steps with less friction, faster answers, and clearer access to lending help.",
    },
    {
      image: f4,
      title: "After-Hours Engagement",
      description: "Always-available AI engagement can help capture customer interest when branches and contact centers are closed, keeping high-intent conversations from going cold.",
    },
    {
      image: f5,
      title: "Cross-Sell Conversion",
      description: "Conversational engagement can help identify relevant customer needs and route qualified opportunities to the right product team or specialist.",
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
    <section className="bg-bg-primary py-24 md:py-32 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
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
            Real Impact for <br className="hidden md:block" /> Financial Institutions
          </h2>
        </motion.div>

        {/* 3-Column Responsive Case Study Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {cases.map((cs, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group flex flex-col items-start gap-6 bg-bg-card rounded-[2.5rem] border border-border-subtle p-4 pb-10 transition-all duration-700 hover:border-brand-teal/45 hover:bg-[#0D2654]"
            >
              {/* Premium Image Container */}
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-[2rem] bg-white border border-white/10 transition-all duration-700 group-hover:shadow-[0_0_40px_rgba(34,197,204,0.05)]">
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
                <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                  {cs.title}
                </h3>
                <p className="text-text-secondary font-medium leading-relaxed text-sm md:text-base opacity-80 text-pretty">
                  {cs.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
