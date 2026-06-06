"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import ai2 from "../../public/ai2.png";

export default function AIRealism() {
  const points = [
    {
      title: "Custom Personas",
      description:
        "Choose from a range of diverse AI faces, voices, and communication styles to create a brand-appropriate customer experience. You can even explore AI avatar experiences based on approved staff roles or brand ambassadors for specific use cases with appropriate consent, governance, and disclosure.",
    },
    {
      title: "Familiar Representation",
      description:
        "Create AI guides that reflect your institution’s service culture and help customers feel comfortable asking questions.",
    },
    {
      title: "Behavioral Controls",
      description:
        "Adjust tone, pacing, escalation rules, and response patterns so conversations feel clear, respectful, and helpful.",
    },
    {
      title: "Consistent & Governed",
      description:
        "Support approved messaging and escalation paths across channels so customers receive consistent guidance no matter when they connect.",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: -60, scale: 0.9 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        duration: 1,
      },
    },
  };

  const textContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const textItemVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  return (
    <section
      id="realism"
      className="bg-bg-primary py-24 md:py-32 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden"
    >
      <motion.div
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Side: Avatar Grid Placeholder -> Now ai2 Image */}
          <motion.div
            variants={imageVariants}
            className="relative aspect-square md:aspect-square lg:aspect-square rounded-[2.5rem] bg-zinc-950/50 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden"
          >
            <Image
              src={ai2}
              alt="Avatar Portfolio"
              fill
              className="object-cover"
            />

            {/* Decorative Corner Accents (optional, keeping for aesthetic) */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-brand-teal/30" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-brand-teal/30" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-brand-teal/30" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-brand-teal/30" />
          </motion.div>

          {/* Right Side: Content */}
          <motion.div
            variants={textContainerVariants}
            className="flex flex-col items-start text-left"
          >
            <motion.h2
              variants={textItemVariants}
              className="text-white font-black tracking-tighter leading-[1.1] mb-8"
              style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)" }}
            >
              Build AI Agents That Reflect <br className="hidden xl:block" />
              <span className="text-brand-teal">Your Brand and Service Standards</span>
            </motion.h2>

            <motion.p
              variants={textItemVariants}
              className="text-text-secondary font-medium leading-relaxed mb-12 opacity-90"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.2rem)" }}
            >
              ConvergentAI helps financial institutions create AI voice and avatar experiences that feel helpful, professional, and aligned with the way your organization serves customers. Configure the experience to support your brand standards, communication style, and approved customer journeys.
            </motion.p>

            {/* Bullet Points */}
            <ul className="grid grid-cols-1 gap-8">
              {points.map((point, index) => (
                <motion.li
                  variants={textItemVariants}
                  key={index}
                  className="flex gap-5 items-start group"
                >
                  <div className="mt-1 shrink-0 p-1 rounded-lg bg-brand-teal/10 border border-brand-teal/20 group-hover:bg-brand-teal/20 transition-colors">
                    <CheckCircle2
                      className="w-5 h-5 text-brand-teal"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg md:text-xl mb-1.5 tracking-tight leading-tight">
                      {point.title}
                    </h4>
                    <p className="text-text-muted font-medium leading-relaxed text-sm md:text-base opacity-80">
                      {point.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
