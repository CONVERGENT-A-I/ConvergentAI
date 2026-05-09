"use client";

import React from "react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Shield, Lock, Server, CheckCircle2, FileText, ArrowRight, EyeOff, Cpu, Layers, Activity, Landmark, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import WhitepaperModal, { WhitepaperType } from "@/components/whitepaper-modal";

export default function SecurityCenter() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const [activeWhitepaper, setActiveWhitepaper] = useState<WhitepaperType>(null);

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
          <div className="inline-flex flex-col md:flex-row items-start md:items-center gap-0.5 md:gap-2 px-3 md:px-4 py-2 md:py-1.5 rounded-xl md:rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 w-fit">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              <span>Designed for Regulatory Compliance</span>
            </div>
            <span className="pl-[22px] md:pl-0 opacity-90">(FFIEC/NCUA/FDIC)</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8">
            Engineered for <span className="text-brand-green">Financial Integrity.</span><br />
            Compliant by Design.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-3xl">
            ConvergentAI operates on a strictly audited, Security-First Architecture. We leverage the rigorous controls of our Tier-1 infrastructure partners while maintaining our own custom safeguards built for Credit Unions, Community Banks, and Regulatory Frameworks (NCUA/FFIEC).
          </p>
        </motion.section>

        {/* Shared Responsibility Diagram */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <div className="flex items-center gap-4 mb-8">
            <Shield className="w-8 h-8 text-brand-green" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Designed for Regulatory Compliance</h2>
          </div>
          <p className="text-lg text-zinc-400 font-medium mb-12 max-w-3xl leading-relaxed">
            Our Shared Responsibility model ensures that while ConvergentAI secures the AI intelligence layer, you maintain full control over your data governance, fully supported by our compliance-ready infrastructure.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Institution Layer */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Landmark className="w-8 h-8 text-blue-500" />
                </div>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Financial Institution</h3>
              <p className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-4">FDIC & NCUA Insured</p>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>Applicant Data Governance</li>
                <li>Access Control Policies</li>
                <li>Audit Log Review</li>
              </ul>
            </div>

            {/* Connection / Data Tunnel */}
            <div className="flex flex-col items-center justify-center py-4 lg:py-0">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-brand-green/40 uppercase tracking-[0.3em] lg:mb-0 mb-2">Secure Data Tunnel</span>
                
                {/* Desktop Horizontal Tunnel (hidden on mobile) */}
                <div className="hidden lg:flex items-center gap-0 text-brand-green/50 relative">
                  {/* Moving Particle 1 */}
                  <motion.div 
                    className="absolute w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_10px_#00FF99]"
                    animate={{ x: [-80, 80], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Moving Particle 2 */}
                  <motion.div 
                    className="absolute w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_10px_#00FF99]"
                    animate={{ x: [-80, 80], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                  />
                  
                  <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />
                  <div className="w-10 h-10 rounded-full border border-brand-green/30 flex items-center justify-center bg-brand-green/5 backdrop-blur-sm z-10">
                    <Lock className="w-4 h-4 text-brand-green" />
                  </div>
                  <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-brand-green/30 to-transparent" />
                </div>

                {/* Mobile Vertical Tunnel (hidden on desktop) */}
                <div className="flex lg:hidden flex-col items-center gap-0 text-brand-green/50 relative">
                  {/* Moving Particle 1 */}
                  <motion.div 
                    className="absolute w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_10px_#00FF99]"
                    animate={{ y: [-40, 40], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Moving Particle 2 */}
                  <motion.div 
                    className="absolute w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_10px_#00FF99]"
                    animate={{ y: [-40, 40], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                  />
                  
                  <div className="w-[2px] h-12 bg-gradient-to-b from-transparent via-brand-green/30 to-transparent" />
                  <div className="w-10 h-10 rounded-full border border-brand-green/30 flex items-center justify-center bg-brand-green/5 backdrop-blur-sm z-10 my-[-4px]">
                    <Lock className="w-4 h-4 text-brand-green" />
                  </div>
                  <div className="w-[2px] h-12 bg-gradient-to-b from-transparent via-brand-green/30 to-transparent" />
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-500">TLS 1.3</div>
                  <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-500">mTLS</div>
                </div>
              </div>
            </div>

            {/* ConvergentAI Layer */}
            <div className="p-8 rounded-3xl bg-brand-green/5 border border-brand-green/20 flex flex-col items-center text-center relative overflow-hidden group hover:bg-brand-green/[0.08] transition-all duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-32 h-32 text-brand-green" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_20px_rgba(0,255,153,0.1)] group-hover:shadow-[0_0_30px_rgba(0,255,153,0.2)] transition-all">
                <Server className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">ConvergentAI Platform</h3>
              <p className="text-sm font-medium text-brand-green uppercase tracking-widest mb-4 relative z-10">Tier-1 Security Engine</p>
              <ul className="text-sm text-zinc-400 space-y-3 relative z-10 text-left w-full max-w-[200px] mx-auto">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> PII Redaction (DLP)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> AES-256 Encryption</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Ephemeral Data Ops</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Inherited Compliance Table */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <div className="flex items-center gap-4 mb-8">
            <Layers className="w-8 h-8 text-brand-green" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Inherited Compliance Architecture</h2>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <table className="w-full text-left border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-6 text-sm font-bold tracking-widest text-zinc-500 uppercase">Layer</th>
                  <th className="p-6 text-sm font-bold tracking-widest text-zinc-500 uppercase">Provider</th>
                  <th className="p-6 text-sm font-bold tracking-widest text-zinc-500 uppercase">Certifications & Standards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 block md:table-row-group">
                <tr className="hover:bg-white/[0.02] transition-colors flex flex-col md:table-row">
                  <td className="p-4 md:p-6 border-b md:border-none border-white/5 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">Layer</span>
                    <span className="font-semibold text-white">Infrastructure & Compute</span>
                  </td>
                  <td className="p-4 md:p-6 border-b md:border-none border-white/5 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">Provider</span>
                    <span className="font-medium text-zinc-300">Google Cloud (GCP)</span>
                  </td>
                  <td className="p-4 md:p-6 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-2">Certifications & Standards</span>
                    <div className="flex flex-wrap gap-2">
                      {['SOC 2 Type II', 'ISO 27001', 'PCI-DSS', 'HIPAA'].map(cert => (
                        <span key={cert} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors flex flex-col md:table-row">
                  <td className="p-4 md:p-6 border-b md:border-none border-white/5 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">Layer</span>
                    <span className="font-semibold text-white">Real-Time Media Processing</span>
                  </td>
                  <td className="p-4 md:p-6 border-b md:border-none border-white/5 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">Provider</span>
                    <span className="font-medium text-zinc-300">LiveKit</span>
                  </td>
                  <td className="p-4 md:p-6 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-2">Certifications & Standards</span>
                    <div className="flex flex-wrap gap-2">
                      {['SOC 2 Type II'].map(cert => (
                        <span key={cert} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors flex flex-col md:table-row">
                  <td className="p-4 md:p-6 border-b md:border-none border-white/5 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">Layer</span>
                    <span className="font-semibold text-white">Telephony Backbone (SIP)</span>
                  </td>
                  <td className="p-4 md:p-6 border-b md:border-none border-white/5 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">Provider</span>
                    <span className="font-medium text-zinc-300">Telnyx</span>
                  </td>
                  <td className="p-4 md:p-6 block md:table-cell">
                    <span className="md:hidden text-[10px] font-bold tracking-widest text-zinc-500 uppercase block mb-2">Certifications & Standards</span>
                    <div className="flex flex-wrap gap-2">
                      {['SOC 2 Type II', 'Licensed Carrier'].map(cert => (
                        <span key={cert} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Core Security Pillars */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-12">Core Security Pillars</h2>
          {/* Tablet should behave like mobile (stacked), expand on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-brand-green/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Server className="w-7 h-7 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Logical Tenant Isolation</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Known as "The Vault," every institution's deployment exists in a logically isolated environment within secure GCP VPCs, ensuring absolute "Zero-Leak" boundaries between organizations.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-brand-green/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <EyeOff className="w-7 h-7 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Zero-Training Policy</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Applicant voice recordings, PII, and transcripts are <strong className="text-white">never</strong> used to train global LLM models. All data processing is strictly ephemeral or stays localized within your private tenant.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-brand-green/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7 text-brand-green" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Military-Grade Encryption</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Data in transit is secured via TLS 1.3 for SIP signaling and SRTP for voice media. Data at rest is encrypted using AES-256 bit encryption with Google-managed cryptographic keys, adhering strictly to FFIEC and FDIC data protection standards.
              </p>
            </div>
          </div>
        </motion.section>

        {/* AI Governance Framework */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Cpu className="w-8 h-8 text-brand-green" />
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">AI Governance Framework</h2>
            </div>
            <p className="text-lg text-zinc-400 font-medium mb-8 leading-relaxed">
              We don't just secure the infrastructure; we actively govern the intelligence. Our proprietary framework ensures AI behavior remains within strict financial guidelines.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-green shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Real-Time PII Redaction</h4>
                  <p className="text-zinc-400">Deep integration with Google Cloud DLP automatically scrubs SSNs, account numbers, and sensitive entities from transcripts before they are stored or processed, ensuring compliance with GLBA and bank-specific privacy rules.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-green shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Bias & Hallucination Guardrails</h4>
                  <p className="text-zinc-400">Models are stress-tested against financial-specific datasets. Hard-coded "refusal" triggers prevent the AI from offering unapproved financial advice or rate guarantees.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-brand-green shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Human-in-the-Loop Oversight</h4>
                  <p className="text-zinc-400">A Master Dashboard allows your staff to monitor active interactions in real-time, review transcripts, and instantly take control of any call if human intervention is required.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="relative h-full min-h-[450px] rounded-3xl bg-zinc-900 border border-white/10 p-8 flex flex-col justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/10 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col gap-4">
              {/* Input Box */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50" />
                <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Insecure Input</span>
                <span className="text-white text-sm font-medium">"My SSN is 123-45-..."</span>
              </div>
              
              {/* Connector 1 */}
              <div className="mx-auto w-[2px] h-10 bg-white/5 relative">
                <motion.div 
                  className="absolute top-0 left-[-4px] w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#fff]"
                  animate={{ y: [0, 40], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              {/* DLP Engine */}
              <div className="p-6 rounded-2xl bg-[#0a1f16] border border-brand-green/30 flex flex-col items-center justify-center gap-2 shadow-[0_0_40px_rgba(0,255,153,0.1)] relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent w-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-green animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-brand-green font-bold tracking-wider">DLP ENCRYPTION ENGINE</h4>
                    <p className="text-[10px] text-brand-green/60 font-mono">SCRUBBING • ENCRYPTING • ANONYMIZING</p>
                  </div>
                </div>
              </div>

              {/* Connector 2 (The Secure Tunnel) */}
              <div className="mx-auto w-8 h-12 bg-brand-green/5 border-x border-brand-green/20 relative group">
                <div className="absolute inset-0 bg-brand-green/5 blur-sm" />
                <motion.div 
                  className="absolute top-0 left-[50%] translate-x-[-50%] flex flex-col items-center"
                  animate={{ y: [0, 48], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                >
                  <div className="w-3 h-3 rounded-full bg-brand-green shadow-[0_0_15px_#00FF99]" />
                  <Lock className="w-3 h-3 text-brand-green mt-1" />
                </motion.div>
              </div>

              {/* Output Box */}
              <div className="p-4 rounded-xl bg-[#051109] border border-brand-green/20 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-green" />
                <div className="flex flex-col">
                  <span className="text-brand-green text-[10px] font-mono uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SECURED OUTPUT
                  </span>
                  <span className="text-zinc-400 text-sm italic font-medium">"My SSN is [REDACTED]"</span>
                </div>
                <div className="px-2 py-1 rounded bg-brand-green/10 border border-brand-green/30 text-[10px] font-bold text-brand-green tracking-tighter">
                  AES-256
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SOC 2 Roadmap */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32 p-10 md:p-16 rounded-3xl bg-white/[0.02] border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-6">Our SOC 2 Journey</h2>
            <p className="text-lg text-zinc-400 font-medium mb-10 leading-relaxed">
              We are actively pursuing our SOC 2 Type 1 attestation and are currently in the readiness assessment stage. We have dedicated internal resources to ensure our security controls meet the AICPA’s standards, with a target completion date of Q3 2026.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-brand-green shadow-[0_0_10px_#00FF99] animate-pulse" />
              <span className="text-brand-green font-bold tracking-widest uppercase text-sm">Status: Audit in Progress (2026)</span>
            </div>
          </div>
        </motion.section>

        {/* Milestone 4: Governance Resources */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Governance & Compliance Resources</h2>
            <p className="text-xl text-zinc-400 font-medium max-w-3xl mx-auto">
              Authority-building documentation designed to streamline the vetting process for Risk Officers and IT Auditors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Technical Architecture & Security */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-start gap-6 hover:border-brand-green/30 transition-colors group">
              <FileText className="w-10 h-10 text-brand-green" />
              <div>
                <h3 className="text-xl font-bold mb-2">Security Architecture & Data Sovereignty</h3>
                <p className="text-zinc-400 text-sm mb-4">A deep dive into our bank-grade infrastructure. Learn how we utilize logical tenant isolation, AES-256 encryption, and inherited SOC 2 Type II controls to protect your institution’s data.</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-2 py-1 rounded">Target: CIOs & CISOs</span>
                </div>
              </div>
              <button onClick={() => setActiveWhitepaper('security-architecture')} className="mt-auto flex items-center gap-2 text-brand-green font-bold text-sm hover:underline">
                Read Whitepaper <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Card 2: AI Governance & Compliance */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-start gap-6 hover:border-brand-green/30 transition-colors group">
              <CheckCircle2 className="w-10 h-10 text-brand-green" />
              <div>
                <h3 className="text-xl font-bold mb-2">Responsible AI Governance Framework</h3>
                <p className="text-zinc-400 text-sm mb-4">Explore our proactive approach to regulatory compliance. This whitepaper outlines our automated PII redaction (DLP), hallucination guardrails, and alignment with NCUA and FFIEC standards.</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-2 py-1 rounded">Target: Compliance Officers & Legal</span>
                </div>
              </div>
              <button onClick={() => setActiveWhitepaper('ai-governance')} className="mt-auto flex items-center gap-2 text-brand-green font-bold text-sm hover:underline">
                Read Framework <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Card 3: Implementation Roadmap */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-start gap-6 hover:border-brand-green/30 transition-colors group">
              <Layers className="w-10 h-10 text-brand-green" />
              <div>
                <h3 className="text-xl font-bold mb-2">The 90-Day AI Pilot Blueprint</h3>
                <p className="text-zinc-400 text-sm mb-4">Innovation without the friction. Review our phased roadmap for deploying human-like avatars in a secure sandbox environment, designed to prove ROI while minimizing operational risk.</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-2 py-1 rounded">Target: CEOs & VPs of AX</span>
                </div>
              </div>
              <Link href="/pilot" className="mt-auto flex items-center gap-2 text-brand-green font-bold text-sm hover:underline">
                Explore Blueprint <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Try it out CTA */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mt-32 p-10 md:p-16 rounded-3xl bg-brand-green/10 border border-brand-green/20 relative overflow-hidden text-center"
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-6 text-white">How do we try it?</h2>
            <p className="text-lg text-brand-green/80 font-medium mb-10 leading-relaxed">
              Ready to see ConvergentAI in action? Experience our secure, zero-leak environment firsthand.
            </p>
            <Link 
              href="/pilot"
              className="inline-flex items-center justify-center gap-3 bg-brand-green text-black px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-[0_0_30px_rgba(0,255,153,0.6)] transition-all transform hover:-translate-y-1"
            >
              Explore the 90-Day Pilot Program
              <ArrowRight className="w-5 h-5 transition-transform" />
            </Link>
          </div>
        </motion.section>

      </main>

      {/* Render the Whitepaper Modal globally for this page */}
      <WhitepaperModal type={activeWhitepaper} onClose={() => setActiveWhitepaper(null)} />
    </div>
  );
}
