"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";

export default function ScheduleDemo() {
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    creditUnion: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    /* Outer section — distinct dark grey background */
    <section id="schedule-demo" className="bg-[#0A0A0A] py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Inner bordered container — the "card" with gradient border */}
        <div className="relative rounded-[2.5rem] overflow-hidden p-px"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,153,0.25) 0%, rgba(255,255,255,0.06) 40%, rgba(0,255,153,0.1) 100%)",
          }}
        >
          {/* Inner background */}
          <div className="relative bg-[#0D0D0D] rounded-[2.5rem] px-10 md:px-16 lg:px-20 py-16 md:py-20 overflow-hidden">

            {/* Subtle ambient glow top-left */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />
            {/* Subtle ambient glow bottom-right */}
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Left — Headline + Description */}
              <div className="flex flex-col justify-center">
                <motion.h2
                  variants={itemVariants}
                  className="font-black text-white tracking-tight leading-[1.05] mb-8"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
                >
                  Eliminate Mortgage{" "}
                  <span className="text-brand-green">Leakage</span>{" "}
                  Today
                </motion.h2>

                <motion.div variants={itemVariants} className="w-16 h-1 bg-brand-green rounded-full mb-8" />

                <motion.p 
                  variants={itemVariants}
                  className="text-zinc-400 font-medium leading-relaxed mb-5"
                  style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.2rem)" }}
                >
                  Schedule your executive demo to see how AI intent-capture
                  turns visitors into funded loans.
                </motion.p>
                <motion.p 
                  variants={itemVariants}
                  className="text-zinc-500 font-medium leading-relaxed"
                  style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.1rem)" }}
                >
                  Stop losing opportunities to competitors. Our 24/7
                  AI-driven assistants ensure your institution is always
                  the first to respond.
                </motion.p>
              </div>

              {/* Right — Form */}
              <motion.div variants={itemVariants} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-black/60 border border-white/10 group-hover:border-white/20 focus:border-brand-green/60 text-white placeholder-zinc-500 font-medium rounded-xl px-5 py-4 outline-none transition-colors duration-200"
                    style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)" }}
                  />
                </div>

                {/* Work Email */}
                <div className="group">
                  <input
                    type="email"
                    name="workEmail"
                    placeholder="Work Email"
                    value={formData.workEmail}
                    onChange={handleChange}
                    className="w-full bg-black/60 border border-white/10 group-hover:border-white/20 focus:border-brand-green/60 text-white placeholder-zinc-500 font-medium rounded-xl px-5 py-4 outline-none transition-colors duration-200"
                    style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)" }}
                  />
                </div>

                {/* Credit Union / CUSO Name */}
                <div className="group">
                  <input
                    type="text"
                    name="creditUnion"
                    placeholder="Credit Union / CUSO Name"
                    value={formData.creditUnion}
                    onChange={handleChange}
                    className="w-full bg-black/60 border border-white/10 group-hover:border-white/20 focus:border-brand-green/60 text-white placeholder-zinc-500 font-medium rounded-xl px-5 py-4 outline-none transition-colors duration-200"
                    style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)" }}
                  />
                </div>

                {/* Submit Button */}
                <a
                  href="https://warpme.neetocal.com/meeting-with-david-patten-19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative mt-2 w-full bg-brand-green text-black px-6 py-4 rounded-2xl text-sm md:text-base font-black uppercase tracking-widest hover:shadow-[0_0_50px_rgba(0,255,153,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center"
                >
                  Schedule a Demo
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>

                <p className="text-zinc-600 text-xs text-center mt-1">
                  No commitment required. Response within 24 hours.
                </p>
              </motion.div>

            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
