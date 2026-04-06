"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function AICTA() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  // Separator line draws across left-to-right
  const lineVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    show: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // Headline rises up with spring bounce
  const headlineVariants: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 55,
        damping: 14,
        duration: 0.9,
      },
    },
  };

  // Button pops into existence
  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 18,
        duration: 0.6,
        delay: 0.1,
      },
    },
  };

  return (
    <section className="relative bg-[#001B3A] pt-16 pb-20 md:pt-24 md:pb-28 px-8 overflow-hidden">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col items-center">
        {/* Separator line — draws in */}
        <motion.div
          variants={lineVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="h-[2px] bg-brand-green/30 w-[92%] max-w-[1400px] mb-20 md:mb-28 origin-left"
        />

        <motion.div
          className="max-w-[1200px] mx-auto text-center flex flex-col items-center gap-10 md:gap-14"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h2
            variants={headlineVariants}
            className="text-white font-black tracking-tighter leading-[1.1] max-w-4xl"
            style={{ fontSize: "clamp(2.5rem, 4.8vw, 4.2rem)" }}
          >
            Deploy AI Voice & Avatars for Your Members
          </motion.h2>

          <motion.div variants={buttonVariants}>
            <Link
              href="https://warpme.neetocal.com/meeting-with-david-patten-19"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-10 py-5 bg-brand-green hover:bg-[#00FF99] text-black font-black text-lg md:text-xl rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_40px_rgba(0,255,153,0.4)] active:scale-95 inline-block"
            >
              Schedule Demo
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,153,0.03),transparent_70%)] pointer-events-none" />
    </section>
  );
}
