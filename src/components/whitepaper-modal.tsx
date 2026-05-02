"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import AppIcon from "../app/icon.png";

export type WhitepaperType = "security-architecture" | "ai-governance" | null;

interface WhitepaperModalProps {
  type: WhitepaperType;
  onClose: () => void;
}

export default function WhitepaperModal({ type, onClose }: WhitepaperModalProps) {
  if (!type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 shrink-0 bg-black/40">
            <div className="flex items-center gap-3">
              <Image src={AppIcon} alt="ConvergentAI Logo" width={20} height={20} className="w-5 h-5 object-contain" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {type === 'security-architecture' ? 'Security Architecture' : 'AI Governance'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar text-zinc-300">
            {type === 'security-architecture' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Security Architecture & Data Sovereignty</h1>
                  <p className="text-lg text-brand-green/80">Technical Infrastructure and Security Controls for Community Banks and Credit Unions</p>
                </div>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Executive Summary</h2>
                  <p className="leading-relaxed">
                    ConvergentAI provides a high-fidelity voice and avatar engagement layer engineered for the rigorous security requirements of community financial institutions (CFIs). This document outlines the "Security-First" architecture that allows banks and credit unions to deploy advanced Conversational AI while maintaining strict adherence to GLBA, FFIEC, and NCUA standards.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. The Inherited Trust Model</h2>
                  <p className="mb-4 leading-relaxed">
                    ConvergentAI leverages a "Defense-in-Depth" strategy by building on a foundation of SOC 2 Type II compliant infrastructure:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                    <li><strong className="text-white">Infrastructure Layer (Google Cloud Platform):</strong> Enterprise-grade physical security and network hardening.</li>
                    <li><strong className="text-white">Media Layer (LiveKit):</strong> Secure WebRTC signaling and encrypted real-time media routing.</li>
                    <li><strong className="text-white">Telephony Backbone:</strong> Encrypted SIP trunking utilizing TLS 1.3 and SRTP to ensure voice data is never exposed in the clear.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Data Sovereignty & Logical Isolation</h2>
                  <ul className="list-disc pl-5 space-y-4 leading-relaxed">
                    <li>
                      <strong className="text-white block mb-1">Multi-Tenant Isolation:</strong> 
                      Using a Cell-Based Architecture, each institution is deployed into a logically isolated VPC. This ensures that a community bank’s data is never co-mingled with another institution's data.
                    </li>
                    <li>
                      <strong className="text-white block mb-1">Zero-Training Policy:</strong> 
                      We guarantee that account holder voice recordings and transcripts are never used to train global AI models. All machine learning is confined to the institution’s private, secure environment.
                    </li>
                  </ul>
                </section>
              </div>
            )}

            {type === 'ai-governance' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Responsible AI Governance</h1>
                  <p className="text-lg text-brand-green/80">Navigating FFIEC, NCUA, and GLBA Standards in AI-Driven Voice Automation</p>
                </div>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Introduction: Regulatory-Ready AI</h2>
                  <p className="leading-relaxed">
                    As regulators (FDIC, OCC, and NCUA) increase oversight of "High-Risk" AI applications in 2026, financial institutions require more than a chatbot—they require a documented governance framework. ConvergentAI is designed to meet these third-party risk management (TPRM) expectations.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Automated Privacy Protection (DLP)</h2>
                  <p className="mb-4 leading-relaxed">
                    To satisfy GLBA and UDAAP requirements, ConvergentAI integrates automated Data Loss Prevention (DLP):
                  </p>
                  <ul className="list-disc pl-5 space-y-4 leading-relaxed">
                    <li>
                      <strong className="text-white block mb-1">Real-Time PII Scrubbing:</strong>
                      Our engine automatically identifies and redacts Social Security Numbers, Account Numbers, and other Non-public Personal Information (NPI) from transcripts before they are committed to long-term storage.
                    </li>
                    <li>
                      <strong className="text-white block mb-1">Audit-Ready Logging:</strong>
                      We maintain a tamper-evident audit trail of AI interactions, allowing compliance officers to review logs without exposing sensitive account holder data.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Mitigating Operational & Algorithmic Risk</h2>
                  <ul className="list-disc pl-5 space-y-4 leading-relaxed">
                    <li>
                      <strong className="text-white block mb-1">Hallucination Guardrails:</strong>
                      Our models utilize "Grounded Reasoning," meaning the AI only speaks from a verified knowledge base provided by the bank or credit union.
                    </li>
                    <li>
                      <strong className="text-white block mb-1">Refusal Triggers:</strong>
                      The AI is hard-coded to refuse requests for unauthorized financial advice or speculative interest rates, protecting the institution from compliance violations.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Human-in-the-Loop (HITL) Oversight</h2>
                  <p className="mb-4 leading-relaxed">We empower the institution to maintain total control:</p>
                  <ul className="list-disc pl-5 space-y-4 leading-relaxed">
                    <li>
                      <strong className="text-white block mb-1">Master Dashboard:</strong>
                      Real-time monitoring of all active AI sessions.
                    </li>
                    <li>
                      <strong className="text-white block mb-1">Instant Handoff:</strong>
                      A seamless transition to a human representative if the AI detects sentiment distress or a complex regulatory inquiry.
                    </li>
                  </ul>
                </section>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
