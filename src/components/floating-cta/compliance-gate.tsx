"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";

interface ComplianceGateProps {
  complianceChecked: boolean;
  setComplianceChecked: (checked: boolean) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onAgree: () => void;
}

export function ComplianceGate({
  complianceChecked,
  setComplianceChecked,
  isSubmitting,
  onCancel,
  onAgree,
}: ComplianceGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8"
    >
      <div className="max-w-2xl w-full bg-[#0d1220]/95 border border-white/20 rounded-3xl p-5 sm:p-6 md:p-10 shadow-[0_0_60px_rgba(0,180,216,0.3),0_0_0_1px_rgba(0,180,216,0.08)] flex flex-col gap-4 sm:gap-6 overflow-hidden max-h-[96%]">
        <div className="text-center space-y-1 sm:space-y-2 shrink-0">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
            Commitment to Transparency & AI Use
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            Please review and accept our terms to get started.
          </p>
        </div>

        <div
          className="flex-1 min-h-[100px] overflow-y-auto custom-scrollbar bg-black/40 rounded-xl p-3 sm:p-4 border border-white/5 text-gray-300 text-xs md:text-sm leading-relaxed max-h-[300px]"
          style={{ scrollbarWidth: "thin" }}
        >
          <h4 className="font-bold text-white mb-2">
            Terms and Conditions for ConvergentAI
          </h4>
          <p className="mb-4">
            1. Introduction: By using our AI assistant, you agree to these terms. Our
            assistant uses real-time voice and video processing to provide mortgage-related
            information.
          </p>
          <p className="mb-4">
            2. Data Privacy: We value your privacy. Conversations are recorded and processed
            to improve our service and for regulatory compliance. Your personal data is handled
            according to our Privacy Policy.
          </p>
          <p className="mb-4">
            3. No Financial Advice: The information provided by the AI assistant is for
            informational purposes only and does not constitute financial, legal, or
            professional advice. Always consult with a qualified professional for mortgage
            decisions.
          </p>
          <p className="mb-4">
            4. User Responsibility: You are responsible for the information you provide and the
            actions you take based on the AI's responses.
          </p>
          <p className="mb-4">
            5. Recording Disclosure: This session may be recorded for quality assurance and
            compliance purposes. By continuing, you consent to such recording.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 shrink-0 mt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={complianceChecked}
                onChange={(e) => setComplianceChecked(e.target.checked)}
              />
              <div
                className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${
                  complianceChecked
                    ? "bg-[#00b4d8] border-[#00b4d8]"
                    : "bg-white/5 border-white/20 group-hover:border-[#00b4d8]/50"
                }`}
              >
                {complianceChecked && (
                  <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                )}
              </div>
            </div>
            <span className="text-gray-300 text-xs md:text-sm font-medium select-none">
              I have read and agree to the compliance terms above
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-6 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!complianceChecked || isSubmitting}
              onClick={onAgree}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                complianceChecked && !isSubmitting
                  ? "bg-white text-black hover:bg-[#00b4d8] hover:text-white shadow-[0_10px_20px_rgba(0,180,216,0.2)]"
                  : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Get started
                  <ArrowRight
                    className={`h-4 w-4 transition-transform ${
                      complianceChecked ? "group-hover:translate-x-1" : ""
                    }`}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
