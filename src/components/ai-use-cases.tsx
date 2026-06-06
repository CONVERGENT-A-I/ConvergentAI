"use client";

import { motion, Variants } from "framer-motion";

export default function AIUseCases() {
  const cases = [
    {
      title: "Mortgage & Home Equity Q&A",
      benefit: "Keep every mortgage and home equity conversation moving forward to reduce application abandonment and capture more customers.",
    },
    {
      title: "Guided Applicant Onboarding",
      benefit: "Give every customer personalized support as they begin applications, schedule appointments, or prepare for a specialist conversation from any location.",
    },
    {
      title: "24/7 Customer Engagement",
      benefit: "Capture interest when branches and contact centers are closed, routing qualified conversations for timely follow-up.",
    },
    {
      title: "Enhance cross-selling",
      benefit: "Identify customer needs through natural conversation and connect relevant opportunities to the right product team or specialist.",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  // Sticky headline: dramatic slide from left 
  const stickyVariants: Variants = {
    hidden: { opacity: 0, x: -80, rotate: -2 },
    show: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 55,
        damping: 15,
        duration: 1,
      },
    },
  };

  // Cards: stagger bounce up from slightly right
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60, x: 40, scale: 0.93 },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 65,
        damping: 16,
        duration: 1,
      },
    },
  };

  return (
    <section id="use-cases" className="bg-bg-primary py-24 md:py-32 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
      <motion.div
        className="max-w-[1600px] mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[0.35fr_0.65fr] gap-16 lg:gap-24 items-start">

          {/* Left Side: Sticky Headline — dramatic slide + faint rotation */}
          <motion.div
            variants={stickyVariants}
            className="lg:sticky lg:top-40 flex flex-col items-start gap-8"
          >
            <h2 className="text-white font-black tracking-tighter leading-[1.05]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Strategic <br />
              Use Cases & <br />
              <span className="text-brand-teal">Business Benefits</span>
            </h2>
            <p className="text-text-secondary font-medium leading-relaxed max-w-md opacity-90 text-pretty"
              style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.3rem)" }}>
              Moving potential customers from uncertainty to confident next steps
            </p>
          </motion.div>

          {/* Right Side: Stacked Benefit Cards — stagger bounce up */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-4 md:gap-6"
          >
            {cases.map((useCase, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.02, x: 6 }}
                className="group relative bg-bg-card border border-border-subtle p-7 md:p-9 rounded-[2rem] transition-all duration-500 hover:border-brand-teal/45 hover:bg-[#0D2654] overflow-hidden"
              >
                {/* Subtle Glow Effect on Hover */}
                <div className="absolute -inset-px bg-brand-teal/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />

                {/* Animated left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-brand-teal scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

                <h3 className="relative z-10 text-white text-xl md:text-2xl xl:text-3xl font-black mb-3 tracking-tight">
                  {useCase.title}
                </h3>

                <p className="relative z-10 text-brand-teal font-medium leading-[1.6] [font-size:clamp(0.95rem,1.1vw,1.15rem)] opacity-90">
                  {useCase.benefit}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
