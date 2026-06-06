"use client";

import { motion, Variants } from "framer-motion";

export default function FeatureDetails() {
  const details = [
    {
      title: (
        <>
          AI Voice & <br />
          <span className="text-brand-teal tracking-tighter">Human-Like</span> <br />
          Avatars
        </>
      ),
      description: (
        <>
          <p className="mb-6">
            <span className="text-white font-bold">ConvergentAI’s</span> conversational AI layer supports voice, chat, and avatar-based engagement for customers who need immediate answers or guided next steps. The platform can serve as a digital concierge, product guide, appointment scheduler, routing assistant, and first-response layer for high-intent inquiries.
          </p>
          <p>
            For mortgage conversations, responses can use approved institutional content aligned with relevant <span className="text-brand-teal font-bold">Fannie Mae, Freddie Mac, HUD,</span> and <span className="text-brand-teal font-bold">S.A.F.E. Act</span> requirements, with configurable guardrails, escalation paths, and human oversight to support responsible customer engagement.
          </p>
        </>
      )
    },
    {
      title: (
        <>
          Workflow <br />
          <span className="text-brand-teal tracking-tighter">Orchestration</span>
        </>
      ),
      description: (
        <>
          <p>
            <span className="text-white font-bold">ConvergentAI</span> reduces the friction that causes high-intent customers to drop off between digital research and human support. Intelligent routing uses availability, role, product expertise, and follow-up rules to direct high-intent conversations to the right specialist with context intact.
          </p>
        </>
      )
    },
    {
      title: (
        <>
          Secure <br />
          <span className="text-brand-teal tracking-tighter">Integrations</span>
        </>
      ),
      description: (
        <>
          <p>
            <span className="text-white font-bold">ConvergentAI</span> connects with the systems financial institutions already use, including CRM, contact center, loan origination, scheduling, and secure communication platforms. These integrations help teams verify information, manage customer interactions, support secure document workflows, and keep qualified customers moving through their journey with less friction.
          </p>
        </>
      )
    },
    {
      title: (
        <>
          Lending Team <br />
          <span className="text-brand-teal tracking-tighter">Experience Tools</span>
        </>
      ),
      description: (
        <>
          <p>
            Give Mortgage Loan Originators and lending specialists the tools to continue customer conversations smoothly, including secure co-browsing, digital eSign support, <span className="text-white font-bold">Loan Origination System</span> visibility, and multiperson video communication.
          </p>
        </>
      )
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 15,
        duration: 0.8
      }
    },
  };

  return (
    <section className="bg-bg-primary py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div
        className="max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-24 md:mb-32 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-1 bg-brand-teal opacity-50" />
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2">
            Platform Capabilities
          </h2>
          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30">
            Technical Deep-Dive
          </div>
        </motion.div>

        {/* Feature Detail Rows */}
        <div className="flex flex-col gap-24 md:gap-40">
          {details.map((detail, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-12 md:gap-24"
            >
              {/* Left Side: Impactful Title */}
              <div className="flex flex-col gap-8">
                <h3 className="text-white font-black leading-[1] tracking-tighter" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                  {detail.title}
                </h3>
              </div>

              {/* Right Side: Detailed Description with Inline Accent */}
              <div className="flex flex-col gap-6 relative">
                {/* Horizontal Accent Line */}
                <div className="w-16 h-px bg-brand-teal/40 mb-2 md:mb-4" />

                <div className="text-text-secondary font-medium leading-[1.7] text-pretty" style={{ fontSize: "clamp(1rem, 1.25vw, 1.35rem)" }}>
                  {detail.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
