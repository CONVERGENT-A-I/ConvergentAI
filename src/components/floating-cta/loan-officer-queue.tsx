import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Headset, Loader2, Phone } from "lucide-react";

export function LoanOfficerQueueUI() {
  const beams = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      maxHeight: 20 + Math.random() * 25,
      duration: 0.8 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F19] to-[#01142e]">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#00b4d8]/20 animate-[ping_3s_ease-in-out_infinite]" />
        <div className="absolute inset-[-20px] rounded-full border border-[#00b4d8]/10 animate-[ping_4s_ease-in-out_infinite]" />
        <div className="h-24 w-24 rounded-full border-2 border-[#00b4d8]/40 bg-black/60 flex items-center justify-center backdrop-blur-md shadow-[0_0_50px_rgba(0,180,216,0.2)]">
          <Headset className="w-10 h-10 text-[#00b4d8] animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        Connecting to Loan Officer
      </h3>
      <div className="flex items-center gap-2 mb-8">
        <Loader2 className="w-4 h-4 text-[#00b4d8]/70 animate-spin" />
        <p className="text-[#00b4d8]/70 text-sm max-w-xs text-center font-medium">
          You're in the queue...
        </p>
      </div>

      {/* Decorative equalizer for hold music */}
      <div className="flex items-center justify-center gap-1.5 opacity-80 mb-12">
        {beams.map((beam) => (
          <motion.div
            key={`eq-${beam.id}`}
            className="w-1.5 bg-[#00b4d8] rounded-full"
            animate={{
              height: [10, beam.maxHeight],
            }}
            transition={{
              duration: beam.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="flex justify-center opacity-40">
        <p className="text-[10px] text-[#00b4d8] uppercase tracking-[0.3em] font-bold">
          Your call is important to us
        </p>
      </div>
    </div>
  );
}

interface LoanOfficerLiveUIProps {
  mloName: string | null;
  callSeconds: number;
}

export function LoanOfficerLiveUI({ mloName, callSeconds }: LoanOfficerLiveUIProps) {
  const formatTime = (totalSeconds: number) => {
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;
    return `${hh > 0 ? hh.toString().padStart(2, "0") + ":" : ""}${mm
      .toString()
      .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  };

  const displayName = mloName ? mloName.replace("sip_", "") : "Loan Officer";
  const initials = displayName.substring(0, 2).toUpperCase();

  const beams = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      maxHeight: 15 + Math.random() * 30,
      duration: 0.4 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center bg-gradient-to-br from-[#0B0F19] to-[#01142e]">
      <div className="w-full bg-[#00b4d8]/10 border-b border-[#00b4d8]/20 py-2.5 px-4 flex items-center justify-center gap-2 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse shadow-[0_0_8px_rgba(0,180,216,0.8)]" />
        <span className="text-[#00b4d8] text-[11px] font-bold uppercase tracking-[0.2em]">
          Live Call
        </span>
        <span className="text-[#00b4d8]/50 mx-2">•</span>
        <span className="text-[#00b4d8]/90 font-mono text-sm tracking-wide">
          {formatTime(callSeconds)}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Active rings */}
            <div className="absolute inset-[-10px] rounded-full border border-[#00b4d8]/30 animate-[ping_2s_ease-in-out_infinite]" />
            <div className="absolute inset-[-20px] rounded-full border border-[#00b4d8]/10 animate-[ping_3s_ease-in-out_infinite]" />
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#00b4d8]/20 to-[#023e8a]/20 border-2 border-[#00b4d8]/50 flex items-center justify-center shadow-[0_0_40px_rgba(0,180,216,0.25)] backdrop-blur-md">
              <span className="text-3xl font-black text-[#00b4d8] tracking-tighter">
                {initials}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#0B0F19] rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-[#00b4d8] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,180,216,0.5)]">
                <Phone className="w-3 h-3 text-[#0B0F19]" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {displayName}
            </h2>
            <p className="text-[#00b4d8]/80 text-sm font-medium mt-1">
              Licensed Mortgage Loan Officer
            </p>
          </div>
        </div>

        {/* Audio Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-[200px]">
          {beams.map((beam) => (
            <motion.div
              key={`live-eq-${beam.id}`}
              className="w-1.5 bg-[#00b4d8] rounded-full"
              animate={{
                height: [4, beam.maxHeight],
              }}
              transition={{
                duration: beam.duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
