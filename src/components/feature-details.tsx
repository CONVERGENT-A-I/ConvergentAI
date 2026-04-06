"use client";

import { motion, Variants } from "framer-motion";

export default function FeatureDetails() {
  const details = [
    {
      title: (
        <>
          AI Voice & <br />
          <span className="text-brand-green tracking-tighter">Human-Like</span> <br />
          Avatars
        </>
      ),
      description: (
        <>
          The core intelligence layer of <span className="text-white font-bold">ConvergentAI</span>, featuring AI-powered voice and lifelike avatars that deliver natural, <span className="text-brand-green font-bold text-base md:text-lg">24/7</span> member service. Our engine facilitates virtual receptionist duties, intelligent call routing, and automated scheduling for callbacks and meetings, alongside proactive outbound calls to promote refinancing or provide loan status updates. It ensures consistent, empathetic guidance across every phygital touchpoint, reducing wait times while maintaining a human feel that keeps members engaged during high-stakes banking journeys. Responses to mortgage customer questions are grounded in <span className="text-brand-green font-bold">Freddie Mac and Fannie Mae</span> guidelines and operate under strict guardrails, regulations, and <span className="text-brand-green font-bold">S.A.F.E.</span> requirements.
        </>
      )
    },
    {
      title: (
        <>
          Workflow <br />
          <span className="text-brand-green tracking-tighter">Orchestration</span>
        </>
      ),
      description: (
        <>
          A unified orchestration layer that bridges the gap between digital research and physical branch engagement. By automating the hand-off between <span className="text-white font-bold">AI avatars and human loan officers</span>, we eliminate the friction points where <span className="text-brand-green font-bold">CUSO and Credit Union</span> members typically drop off, maximizing application completion rates through intelligent routing.
        </>
      )
    },
    {
      title: (
        <>
          Secure <br />
          <span className="text-white tracking-tighter tracking-tight italic">Integrations</span>
        </>
      ),
      description: (
        <>
          Our platform integrates seamlessly with existing <span className="text-brand-green font-bold">core systems and CRMs</span> to perform adaptive security checks and soft credit pulls. Designed at the enterprise grade, this architecture ensures every omnichannel message and member document is handled with total data integrity and regulatory compliance.
        </>
      )
    },
    {
      title: (
        <>
          MLO <br />
          <span className="text-brand-green tracking-tighter italic">Experience Tools</span>
        </>
      ),
      description: (
        <>
          Equip <span className="text-brand-green font-bold italic">MLOs</span> with tools that elevate every member interaction and drive online conversions — including <span className="text-white font-bold uppercase tracking-widest text-xs md:text-sm">digital eSign, secure co-browse,</span> seamless mortgage application integration into your LOS and multiperson HD quality video communication.
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
    <section className="bg-black py-24 md:py-32 px-8 md:px-12 lg:px-24 overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-24 md:mb-32 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-1 bg-brand-green opacity-50" />
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
                <div className="w-16 h-px bg-brand-green/40 mb-2 md:mb-4" />

                <p className="text-zinc-400 font-medium leading-[1.7] text-pretty" style={{ fontSize: "clamp(1rem, 1.25vw, 1.35rem)" }}>
                  {detail.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
