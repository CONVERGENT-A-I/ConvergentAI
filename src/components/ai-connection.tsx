"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import ai3 from "../../public/ai3.png";

export default function AIConnection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 1,
      },
    },
  };

  const leftVariants: Variants = {
    hidden: { opacity: 0, x: -70 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 55,
        damping: 15,
        duration: 1,
      },
    },
  };

  const rightVariants: Variants = {
    hidden: { opacity: 0, x: 70, scale: 0.92 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 45,
        damping: 15,
        duration: 1.1,
        delay: 0.15,
      },
    },
  };

  return (
    <section id="connection" className="bg-bg-primary py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header */}
        <motion.div variants={headerVariants} className="mb-20 md:mb-32 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-1 bg-brand-teal opacity-50 rounded-full" />
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-2">
            The Science of Human Connection
          </h2>
          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30">
            Cognitive Empathy & Trust
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Narrative — slides in from left */}
          <motion.div variants={leftVariants} className="flex flex-col gap-10">
            <p className="text-text-secondary font-medium leading-[1.8] [font-size:clamp(1.1rem,1.3vw,1.35rem)] text-pretty">
              True communication happens on many levels. Tone, timing, facial expression, and conversational context play a major role in making applicants feel supported, confident, and ready to take the next step. ConvergentAI layers more of those natural signals into digital engagement through AI voice and avatar experiences designed for clear explanations, natural back-and-forth conversations, and guided next steps.
            </p>

            <p className="text-text-secondary font-medium leading-[1.8] [font-size:clamp(1.1rem,1.3vw,1.35rem)] text-pretty">
              The result is a personalized digital experience where AI agents respond quickly, handle routine questions and next-step guidance, preserve momentum, and connect applicants to human experts at the moment their expertise matters most.
            </p>
          </motion.div>

          {/* Right: Info Card — scales + slides from right */}
          <motion.div
            variants={rightVariants}
            className="bg-bg-card border border-border-subtle p-5 md:p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Image */}
            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-bg-primary/40 mb-10 border border-white/5">
              <div className="absolute inset-0 flex items-center justify-center bg-bg-primary">
                <Image
                  src={ai3}
                  alt="Human Connection Interface"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card Content */}
            <div className="px-4 pb-2">
              <h3 className="text-brand-teal font-black text-xl md:text-2xl mb-6 leading-[1.2] tracking-tight uppercase">
                BEYOND WORDS: <br />
                COMMUNICATION THAT <br />
                FEELS HUMAN
              </h3>
              <p className="text-text-secondary font-medium leading-relaxed [font-size:clamp(0.95rem,1.15vw,1.15rem)] opacity-90">
                Mortgage applicants hesitate when the next step feels unclear or the stakes feel too high. ConvergentAI’s voice and avatar experiences use natural pacing, tone, and guided conversation flows to answer common questions, reduce confusion, and help applicants keep moving toward the right human expert when personal guidance is needed.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
