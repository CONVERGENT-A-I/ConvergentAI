'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

export interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: (code: string) => void;
  targetDestination?: string; // e.g. "mobile number ending in 4567"
}

export function OtpVerificationModal({
  isOpen,
  onClose,
  onVerifySuccess,
  targetDestination = 'your mobile number',
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg(null);
      setIsSuccess(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto-advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (cleanVal && index === 5 && newDigits.every((d) => d !== '')) {
      submitCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      if (pasted.length === 6) {
        submitCode(pasted);
      } else {
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      }
    }
  };

  const submitCode = (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    // Check against mock code 123456
    setTimeout(() => {
      if (code === '123456') {
        setIsSuccess(true);
        setTimeout(() => {
          setIsVerifying(false);
          onVerifySuccess(code);
        }, 600);
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid verification code. Please enter 123456.');
      }
    }, 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="otp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          key="otp-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0b0f19]/95 border border-[#00b4d8]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,180,216,0.25)] text-white backdrop-blur-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/30 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-[#00b4d8]" />
            </div>

            <h3 className="text-lg font-bold tracking-wide text-white">One-Time Verification</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              We sent a 6-digit code to <span className="text-gray-200 font-semibold">{targetDestination}</span>.
            </p>

            {/* Dev Mock Helper Toast */}
            <div className="mt-3 px-3 py-1.5 bg-[#131b2e] border border-[#00b4d8]/30 rounded-lg text-[11px] text-[#00b4d8] font-mono flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Demo Mode Code: <strong>123456</strong></span>
            </div>

            {/* 6 Digit Input Grid */}
            <div className="flex gap-2.5 my-6" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isVerifying || isSuccess}
                  className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all duration-200 outline-none ${
                    digit
                      ? 'bg-[#131b2e] border-[#00b4d8] text-[#00b4d8] shadow-[0_0_15px_rgba(0,180,216,0.3)]'
                      : 'bg-[#111827] border-gray-800 text-white focus:border-[#00b4d8]/80'
                  }`}
                />
              ))}
            </div>

            {errorMsg && <p className="text-xs text-red-400 mb-4 font-medium">{errorMsg}</p>}

            {/* Submit Button */}
            <button
              onClick={() => submitCode()}
              disabled={isVerifying || isSuccess || digits.some((d) => !d)}
              className="w-full py-3 bg-[#00b4d8] hover:bg-[#0096c7] disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00b4d8]/20"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verifying...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Verified!</span>
                </>
              ) : (
                <span>Confirm & Continue</span>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
