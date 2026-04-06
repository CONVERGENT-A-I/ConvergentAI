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
    <section id="connection" className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header */}
        <motion.div variants={headerVariants} className="mb-20 md:mb-32 flex flex-col items-center text-center gap-5">
          <div className="w-20 h-1 bg-brand-green opacity-50 rounded-full" />
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
            <p className="text-zinc-400 font-medium leading-[1.8] [font-size:clamp(1.1rem,1.3vw,1.35rem)] text-pretty">
              At ConvergentAI, we believe that true communication is about more than words—it is the
              nuanced signals of tone, timing, and facial expressions that build lasting trust.
              Your members read these visual contexts instinctively, looking for connection
              where a standard script often fails to reach. Our AI voice technology and lifelike
              avatars are specifically engineered to carry these markers, ensuring your members
              feel deeply understood, not just responded to.
            </p>

            <p className="text-zinc-400 font-medium leading-[1.8] [font-size:clamp(1.1rem,1.3vw,1.35rem)] text-pretty">
              When members feel genuinely heard—through clear explanations, natural back-and-forth,
              and human-like signals such as tone and expression—they move forward with confidence
              in their mortgage decisions and are far less likely to abandon applications. This direct
              connection fosters a level of trust that only human-like interaction can provide.
              ConvergentAI enables your institution to deliver this caliber of communication at scale,
              ensuring every member feels truly understood.
            </p>
          </motion.div>

          {/* Right: Info Card — scales + slides from right */}
          <motion.div
            variants={rightVariants}
            className="bg-[#0A1120] backdrop-blur-2xl border border-white/5 p-5 md:p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Image */}
            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black/40 mb-10 border border-white/5">
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
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
              <h3 className="text-brand-green font-black text-xl md:text-2xl mb-6 leading-[1.2] tracking-tight uppercase">
                BEYOND WORDS: <br />
                COMMUNICATION THAT <br />
                FEELS HUMAN
              </h3>
              <p className="text-zinc-400 font-medium leading-relaxed [font-size:clamp(0.95rem,1.15vw,1.15rem)] opacity-90">
                Members don&apos;t just want quick answers—they want to feel like someone is actually with
                them in the moment. ConvergentAI&apos;s voice and human-like avatars mirror natural pacing,
                tone, and expression so conversations feel less like talking to a script and more like
                sitting with a knowledgeable mortgage guide.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
