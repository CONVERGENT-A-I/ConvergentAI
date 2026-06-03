"use client";

import React from "react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Rocket, Target, ShieldCheck, Box, LineChart, ArrowRight, CheckCircle2, Database, Lock } from "lucide-react";
import Link from "next/link";

export default function PilotProgram() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-green/30">
      <Navbar />

      <main className="pt-52 md:pt-72 pb-24 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-4xl mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-bold tracking-widest uppercase mb-6">
            <Rocket className="w-3.5 h-3.5" />
            90-Day Pilot Program
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8">
            Low Risk. <span className="text-brand-green">High Reward.</span><br />
            Execution-Focused.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-3xl">
            Overcome &quot;Audit Friction&quot; with our structured 90-day implementation roadmap. We prove the ROI of 24/7 Phygital Applicant Engagement without compromising your institution&apos;s security posture.
          </p>
        </motion.section>

        {/* The 90-Day Roadmap */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <div className="flex items-center gap-4 mb-12">
            <Target className="w-8 h-8 text-brand-green" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">The 90-Day Roadmap</h2>
          </div>
          
          {/* Tablet should behave like mobile (stacked), expand on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                phase: "Phase 1: Setup (Days 1-30)",
                title: "Environment & Training",
                desc: "We establish your secure, logically isolated 'Vault' in GCP. The AI is trained specifically on your public mortgage guidelines, Fannie Mae/Freddie Mac policies, and integrated with our zero-leak DLP engine.",
                items: ["Tenant Provisioning", "Knowledge Base Integration", "Security Auditing"]
              },
              {
                phase: "Phase 2: Deployment (Days 31-60)",
                title: "The Sandbox Strategy",
                desc: "Soft launch the AI assistant in a controlled environment. Applicants can ask general mortgage questions, run scenarios, and interact with the AI without any live PII exposure or backend system integration.",
                items: ["Controlled Traffic", "No Live PII Exposed", "Initial Analytics"]
              },
              {
                phase: "Phase 3: Expansion (Days 61-90)",
                title: "Measurement & ROI",
                desc: "Scale the deployment based on Phase 2 data. We measure lead capture rates, call deflection, and Applicant satisfaction, presenting a clear ROI case for long-term integration.",
                items: ["Volume Scaling", "Performance Review", "ROI Reporting"]
              }
            ].map((step, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-brand-green/30 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-8xl font-black text-brand-green">{idx + 1}</span>
                </div>
                <div className="relative z-10">
                  <div className="text-brand-green text-sm font-bold tracking-widest uppercase mb-4">{step.phase}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed mb-6">
                    {step.desc}
                  </p>
                  <ul className="space-y-3">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-brand-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* The Sandbox Strategy */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
               <Box className="w-8 h-8 text-brand-green" />
               <h2 className="text-2xl md:text-4xl font-bold tracking-tight">The &quot;Sandbox&quot; Strategy</h2>
            </div>
            <p className="text-lg text-zinc-400 font-medium mb-8 leading-relaxed">
              We know that touching live core systems or processing PII requires rigorous auditing. That&apos;s why our pilot is designed to operate completely outside your secure perimeter initially.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-brand-green shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">No PII Required</h4>
                  <p className="text-zinc-400">The AI handles top-of-funnel inquiries—rates, eligibility, and process questions—without ever asking for or needing sensitive Applicant data.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <ShieldCheck className="w-6 h-6 text-brand-green shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Zero Core Integration</h4>
                  <p className="text-zinc-400">The pilot runs independently of your institutional core. No API access to Applicant data is needed to prove the engagement value.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="relative h-full min-h-[450px] rounded-3xl bg-black border border-white/10 p-8 flex flex-col justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-green/10 via-transparent to-transparent opacity-40" />
             
             <div className="relative z-10 flex flex-col items-center gap-2">
                
                {/* ConvergentAI Sandbox */}
                <div className="w-full rounded-2xl bg-[#0a1f16] border border-brand-green/30 p-5 relative overflow-hidden group">
                   <motion.div 
                     className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent w-full"
                     animate={{ x: ['-100%', '100%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   />
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                            <Box className="w-5 h-5 text-brand-green animate-pulse" />
                         </div>
                         <div className="text-left">
                            <h4 className="text-brand-green font-bold tracking-wider text-sm">PUBLIC CLOUD SANDBOX</h4>
                            <p className="text-[10px] text-brand-green/60 font-mono uppercase">AI Engine & Public Guidelines</p>
                         </div>
                      </div>
                      <div className="hidden sm:block px-3 py-1 rounded bg-brand-green/10 border border-brand-green/20 text-[10px] font-bold text-brand-green tracking-widest">
                         ACTIVE
                      </div>
                   </div>
                </div>

                {/* Air Gap / Separation */}
                <div className="w-full flex flex-col items-center justify-center py-6 relative">
                   <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/20" />
                   <div className="relative z-10 bg-black px-4 py-2 rounded-full border border-red-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                      <Lock className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400 tracking-widest uppercase">Strict Air-Gap Separation</span>
                   </div>
                   {/* Dotted lines going down but stopping */}
                   <div className="absolute top-0 bottom-1/2 left-[20%] w-px bg-gradient-to-b from-brand-green/30 to-transparent" />
                   <div className="absolute top-0 bottom-1/2 right-[20%] w-px bg-gradient-to-b from-brand-green/30 to-transparent" />
                </div>

                {/* Credit Union Core */}
                <div className="w-full rounded-2xl bg-[#0d1220] border border-blue-500/20 p-5 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
                   <div className="flex items-center justify-between relative z-10 opacity-70">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Database className="w-5 h-5 text-blue-400" />
                         </div>
                         <div className="text-left">
                            <h4 className="text-blue-400 font-bold tracking-wider text-sm">SECURE BANKING CORE</h4>
                            <p className="text-[10px] text-blue-400/60 font-mono uppercase">PII & Account Data</p>
                         </div>
                      </div>
                      <div className="hidden sm:block px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-widest">
                         ISOLATED
                      </div>
                   </div>
                </div>

             </div>
             
             <div className="relative z-10 text-center mt-10">
               <p className="text-sm text-zinc-400">Zero backend integration required. Deploy the AI assistant instantly without touching internal networks.</p>
             </div>
          </div>
        </motion.section>

        {/* Success Metrics */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <LineChart className="w-8 h-8 text-brand-green" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-center">Clear Success Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { value: "24/7", label: "Availability", desc: "Instant answers outside business hours." },
               { value: "< 1s", label: "Response Time", desc: "Human-like latency in voice and video." },
               { value: "15% - 30%", label: "Lead Capture", desc: "Expected increase in mortgage leads." },
               { value: "100%", label: "Compliance", desc: "Adherence to configured guardrails." }
             ].map((metric, i) => (
               <div key={i} className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 text-center">
                  <div className="text-4xl font-black text-brand-green mb-2">{metric.value}</div>
                  <div className="text-lg font-bold text-white mb-2">{metric.label}</div>
                  <div className="text-sm text-zinc-400">{metric.desc}</div>
               </div>
             ))}
          </div>
        </motion.section>

        {/* Security Objection CTA */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="p-10 md:p-16 rounded-3xl bg-brand-green/10 border border-brand-green/20 relative overflow-hidden text-center"
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-6 text-white">Is it secure?</h2>
            <p className="text-lg text-brand-green/80 font-medium mb-10 leading-relaxed">
              We understand that deploying AI in a financial institution requires absolute certainty. Review our comprehensive security architecture designed for Credit Unions and Community Banks.
            </p>
            <Link 
              href="/security"
              className="inline-flex items-center justify-center gap-3 bg-brand-green text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-[0_0_30px_rgba(0,26,91,0.6)] transition-all transform hover:-translate-y-1"
            >
              Review Security & Trust Center
              <ArrowRight className="w-5 h-5 transition-transform" />
            </Link>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
