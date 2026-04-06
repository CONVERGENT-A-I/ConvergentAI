"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import f1 from "../../public/f1.png";
import f2 from "../../public/f2.png";

export default function BranchSegment() {
  const images = [
    {
      src: f1,
      alt: "In-Branch AI Avatar Powered Wall System",
      caption: "IN-BRANCH AI AVATAR POWERED WALL SYSTEM"
    },
    {
      src: f2,
      alt: "Select Employee Group (SEG) Smartbanking Platform",
      caption: "SELECT EMPLOYEE GROUP (SEG) SMARTBANKING PLATFORM"
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

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 50,
        damping: 15,
        duration: 1
      } 
    },
  };

  return (
    <section className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Centered Header Section */}
        <motion.div variants={textVariants} className="flex flex-col items-center text-center gap-6 mb-20 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
            BranchPortal & SEG Programs
          </h2>
          <p className="max-w-4xl text-zinc-400 font-medium leading-[1.6] [font-size:clamp(1rem,1.35vw,1.45rem)]">
            ConvergentAI's BranchPortal brings AI-powered avatars and guidance into the branch, while SEG programs extend personalized mortgage and member education tools to select employer groups. These solutions drive measurable value for credit unions and CUSOs by bridging the gap between digital efficiency and physical member service.
          </p>
        </motion.div>

        {/* 2-Column Responsive Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {images.map((img, index) => (
            <motion.div
              key={index}
              variants={imageVariants}
              className="group flex flex-col gap-6"
            >
              {/* Premium Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 transition-all duration-700 group-hover:border-brand-green/30 group-hover:shadow-[0_0_40px_rgba(0,255,153,0.1)]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Green All-Caps Caption */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(0,255,153,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-brand-green font-black text-xs md:text-sm tracking-[0.2em] uppercase text-center">
                  {img.caption}
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(0,255,153,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
