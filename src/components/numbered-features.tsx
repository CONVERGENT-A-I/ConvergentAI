"use client";

import { motion, Variants } from "framer-motion";

export default function NumberedFeatures() {
  const items = [
    {
      number: "01",
      title: "Unified Hybrid Journeys",
      description: "Effortlessly bridge digital research with branch engagement. ConvergentAI preserves member context, creating friction-free paths from screen to person."
    },
    {
      number: "02",
      title: "AI-Powered 24/7 Support",
      description: "Scale member services without increasing staffing overhead. Our lifelike AI avatars handle discovery and routing around the clock with consistent empathy."
    },
    {
      number: "03",
      title: "Intelligent Workflow Routing",
      description: "Equip your loan officers with advanced co-browsing and eSign tools. ConvergentAI automates routine workflows, focusing MLOs on high-value interactions."
    },
    {
      number: "04",
      title: "Enterprise Banking Security",
      description: "Built for the highest stakes, our platform adheres to Fannie Mae and Freddie Mac requirements, ensuring total data compliance and member safety."
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
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        type: "spring",
        stiffness: 70,
        damping: 15,
        duration: 0.8
      } 
    },
  };

  return (
    <section className="bg-black py-20 px-8 md:px-12 lg:px-24 border-t border-white/5 overflow-hidden">
      <motion.div 
        className="max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 md:gap-x-24 md:gap-y-32">
          {items.map((item, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="flex flex-col gap-6 group" 
            >
              <div className="flex flex-col gap-4">
                {/* Clear, Non-Overlapping Number */}
                <div className="text-brand-green font-black text-3xl md:text-4xl tracking-tighter transition-all duration-500 group-hover:scale-110 origin-left">
                  {item.number}
                  <div className="h-1 w-12 bg-brand-green mt-2 opacity-50 group-hover:w-24 transition-all duration-700" />
                </div>
                
                {/* Large Brand-Green Heading */}
                <h3 className="text-brand-green font-black leading-[1.1] tracking-tighter" style={{ fontSize: "clamp(2.25rem, 4.5vw, 4rem)" }}>
                  {item.title}
                </h3>
              </div>
              
              {/* High-Contrast White Description */}
              <p className="text-white font-medium leading-[1.6] max-w-xl opacity-90" style={{ fontSize: "clamp(1.1rem, 1.35vw, 1.45rem)" }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
