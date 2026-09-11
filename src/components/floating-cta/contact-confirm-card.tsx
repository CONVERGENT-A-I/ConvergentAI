'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Mail, Phone } from 'lucide-react';

export interface ContactConfirmCardProps {
  isVisible: boolean;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  mobile?: string | null;
  onConfirm?: () => void;
  onCorrect?: () => void;
}

export function ContactConfirmCard({
  isVisible,
  firstName,
  lastName,
  email,
  mobile,
  onCorrect,
}: ContactConfirmCardProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || '—';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="contact-confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key="contact-confirm-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0b0f19]/95 border border-[#00b4d8]/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,180,216,0.2)] text-white backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/30 flex items-center justify-center mb-3">
                <ShieldCheck className="w-7 h-7 text-[#00b4d8]" />
              </div>
              <h3 className="text-lg font-bold tracking-wide text-white">
                Confirm Your Details
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Please review your information before we send your verification code.
              </p>
            </div>

            {/* Info rows - 3 rows matching voice read-back */}
            <div className="space-y-3 mb-2">
              <InfoRow
                icon={<User className="w-4 h-4 text-[#00b4d8]" />}
                label="Full Name"
                value={fullName}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4 text-[#00b4d8]" />}
                label="Email"
                value={email || '—'}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4 text-[#00b4d8]" />}
                label="Phone"
                value={mobile || '—'}
              />
            </div>

            {/* Subtle voice-primary hint - no buttons */}
            <p
              id="contact-confirm-hint"
              onClick={onCorrect}
              className="text-center text-xs text-gray-500 mt-4 cursor-pointer hover:text-gray-400 transition-colors"
            >
              Something doesn&apos;t look right? Just say so and I&apos;ll fix it.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111827]/80 border border-gray-800">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
