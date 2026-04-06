"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import ai1 from "../../public/ai1.png";

export default function AIHero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const leftVariants: Variants = {
    hidden: { opacity: 0, x: -80 },
    show: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 0.8
      } 
    },
  };

  const rightVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, x: 80 },
    show: { 
      opacity: 1, 
      scale: 1, 
      x: 0, 
      transition: { 
        type: "spring",
        stiffness: 50,
        damping: 15,
        duration: 1,
        delay: 0.2
      } 
    },
  };

  return (
    <section id="ai-hero" className="relative min-h-[90svh] flex items-center pt-32 md:pt-44 pb-24 md:pb-32 px-6 md:px-10 lg:px-24 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111111_0%,_#000000_100%)] -z-10" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <motion.div 
        className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Left Side: Content */}
        <motion.div variants={leftVariants} className="flex flex-col items-start text-left space-y-10">

          {/* Badge - Consistent Styling */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">

          </div>


          <h1 className="font-black text-white leading-[1.05] tracking-tight text-balance"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
            Grow Mortgage Volume <br className="hidden xl:block" />
            with <span className="text-brand-green">AI Voice & Avatars</span>
          </h1>

          <p className="text-zinc-400 max-w-xl font-medium leading-relaxed opacity-90"
            style={{ fontSize: "clamp(1rem, 1.25vw, 1.25rem)" }}>
            Elevate member engagement with realistic video agents and
            interactions for mortgage and beyond. Boost conversions with human-like
            conversational intelligence.
          </p>

          <Link
            href="https://warpme.neetocal.com/meeting-with-david-patten-19"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-brand-green text-black px-10 py-5 md:px-12 md:py-6 rounded-2xl text-sm md:text-base font-black uppercase tracking-[0.2em] hover:shadow-[0_0_50px_rgba(0,255,153,0.6)] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl"
          >
            Schedule a Demo
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>

        {/* Right Side: Professional Video Agent Mockup */}
        <motion.div variants={rightVariants} className="relative aspect-video lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          {/* Texture for depth using current logo */}
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <Image
              src={ai1}
              alt="AI Video Agent Frame"
              fill
              className="object-cover"
            />
          </div>

          {/* Video Agent Overlay Card (Glassmorphism) */}


          {/* Decorative elements */}

        </motion.div>
      </motion.div>
    </section>
  );
}
