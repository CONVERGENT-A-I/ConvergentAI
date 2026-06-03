"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileDown, Loader2, CheckCircle2, User, Briefcase, Building2, Mail, Phone } from "lucide-react";
import Image from "next/image";

interface WhitepaperGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhitepaperGateModal({ isOpen, onClose }: WhitepaperGateModalProps) {
  const [form, setForm] = useState({
    name: "",
    title: "",
    organization: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.organization.trim()) newErrors.organization = "Organization is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setServerError("");

    try {
      const res = await fetch("/api/whitepaper-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setServerError(err.message || "Failed to submit. Please try again.");
    }
  };

  const handleClose = () => {
    // Reset state on close
    if (status !== "submitting") {
      setForm({ name: "", title: "", organization: "", email: "", phone: "" });
      setErrors({});
      setStatus("idle");
      setServerError("");
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on type
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const fields = [
    { key: "name", label: "Full Name", placeholder: "Jane Smith", icon: User, required: true },
    { key: "title", label: "Title", placeholder: "VP of Lending", icon: Briefcase, required: true },
    { key: "organization", label: "Institution / Organization", placeholder: "First Community Credit Union", icon: Building2, required: true },
    { key: "email", label: "Email", placeholder: "jane@example.com", icon: Mail, type: "email", required: true },
    { key: "phone", label: "Phone (optional)", placeholder: "(555) 123-4567", icon: Phone, type: "tel", required: false },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/5 shrink-0 bg-black/40">
            <div className="flex items-center gap-3">
              <Image src="/newassets/ConvergentAI_logo_package/ConvergentAI_favicon.svg" alt="ConvergentAI Logo" width={20} height={20} className="w-5 h-5 object-contain" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Download Whitepaper
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8 gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-green/15 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-brand-green" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-white tracking-tight">Thank You!</h4>
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xs">
                      Click the button below to download your copy.
                    </p>
                  </div>
                  <a
                    href="/api/whitepaper-download"
                    download="The Phygital Imperative.docx"
                    className="mt-4 inline-flex items-center gap-2.5 bg-brand-green text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,26,91,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Now
                  </a>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Title & description */}
                  <div className="mb-7 space-y-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                        <FileDown className="w-5 h-5 text-brand-green" />
                      </div>
                      <h4 className="text-lg font-black text-white tracking-tight">The Phygital Imperative</h4>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                      Fill in your details below to download the full whitepaper on bridging digital and physical touchpoints in mortgage lending.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                          {field.label}
                          {field.required && <span className="text-brand-green ml-1">*</span>}
                        </label>
                        <div className="relative">
                          <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                          <input
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            value={form[field.key as keyof typeof form]}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border text-white text-sm font-medium placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green/40 transition-all ${
                              errors[field.key] ? "border-red-500/60" : "border-white/10 hover:border-white/20"
                            }`}
                          />
                        </div>
                        {errors[field.key] && (
                          <p className="mt-1 text-xs font-semibold text-red-400">{errors[field.key]}</p>
                        )}
                      </div>
                    ))}

                    {/* Server Error */}
                    {serverError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                        {serverError}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2.5 bg-brand-green text-white px-7 py-3.5 rounded-full text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,26,91,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          Download Whitepaper
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
