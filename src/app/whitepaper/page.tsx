"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileDown,
  Loader2,
  CheckCircle2,
  User,
  Briefcase,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/navbar";

export default function WhitepaperPage() {
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

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-52 md:pt-60 pb-20 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-1/4 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-green/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 text-sm font-semibold hover:text-brand-green transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 border border-brand-green/20">
                <BookOpen className="w-4 h-4 text-brand-green" />
                <span className="text-brand-green text-xs font-bold uppercase tracking-widest">Whitepaper</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                The Phygital{" "}
                <span className="text-brand-green">Imperative</span>
              </h1>

              {/* Description */}
              <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                Discover how forward-thinking financial institutions are bridging digital and physical 
                touchpoints to eliminate mortgage drop-off and build lasting relationships with applicants.
              </p>

              {/* Key takeaways */}
              <div className="space-y-4 pt-2">
                <h3 className="text-white text-sm font-bold uppercase tracking-widest">What You&apos;ll Learn</h3>
                {[
                  "Why 90% of applicants abandon digital mortgage flows",
                  "The Phygital framework for 24/7 borrower engagement",
                  "How AI-driven voice and avatar technology captures intent",
                  "Strategies to outpace competitors with instant response",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-brand-green" />
                    </div>
                    <p className="text-zinc-300 text-sm md:text-base font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="relative"
            >
              <div className="relative p-8 md:p-10 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-sm overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-green/8 rounded-full blur-[100px] pointer-events-none" />

                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-12 gap-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-brand-green/15 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-brand-green" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-black text-white tracking-tight">Thank You!</h4>
                      <p className="text-zinc-400 text-base font-medium leading-relaxed max-w-sm">
                        Click the button below to download your copy.
                      </p>
                    </div>
                    <a
                      href="/api/whitepaper-download"
                      download="The Phygital Imperative.docx"
                      className="mt-4 inline-flex items-center gap-2.5 bg-brand-green text-black px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,153,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      <FileDown className="w-4 h-4" />
                      Download Now
                    </a>
                    <Link
                      href="/"
                      className="mt-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      Back to Home
                    </Link>
                  </motion.div>
                ) : (
                  <div className="relative space-y-6">
                    {/* Form header */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-lg bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                          <FileDown className="w-5 h-5 text-brand-green" />
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight">Download the Whitepaper</h3>
                      </div>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                        Fill in your details to receive the full article.
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
                        className="w-full mt-2 inline-flex items-center justify-center gap-2.5 bg-brand-green text-black px-7 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,153,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
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

                    {/* Trust note */}
                    <p className="text-center text-zinc-600 text-[11px] font-medium">
                      We respect your privacy. Your information will never be shared.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
