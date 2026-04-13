"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import AppIcon from "../app/icon.png";

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
  isStreaming?: boolean;
}

function formatMsgTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function TypewriterText({ text, onUpdate, onComplete }: { text: string; onUpdate?: () => void; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const words = useRef(text.split(" "));
  const currentIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex.current < words.current.length) {
        setDisplayText(prev => {
          const next = prev + (currentIndex.current === 0 ? "" : " ") + words.current[currentIndex.current];
          currentIndex.current++;
          return next;
        });
        onUpdate?.();
      } else {
        clearInterval(interval);
        setIsFinished(true);
        onComplete?.();
      }
    }, 45);

    return () => clearInterval(interval);
  }, [text, onUpdate, onComplete]);

  return (
    <>
      {displayText}
      {!isFinished && (
        <span className="inline-block w-2 h-4 ml-1 bg-[#00b4d8] animate-pulse rounded-sm align-middle" style={{ animationDuration: '0.6s' }} />
      )}
    </>
  );
}

export default function LiveChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'ai', text: "Hi! I'm Ailana, your AI mortgage assistant. How can I help you today?", time: formatMsgTime(), isStreaming: false },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, time: formatMsgTime() }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "Thank you for reaching out! Our AI agent is being connected and will respond to your mortgage queries shortly.",
        time: formatMsgTime(),
        isStreaming: true
      }]);
    }, 1600);
  };

  const handleStreamComplete = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStreaming: false } : m));
  };

  const handleUpdateScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Only auto-scroll if the user is already within 100px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden rounded-[inherit]">
      {/* Dynamic Background Ambience */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-60 bg-[#00b4d8] opacity-[0.06] blur-[120px] rounded-full pointer-events-none z-0" style={{ transform: 'translateZ(0)', willChange: 'transform' }} />
      <div className="absolute bottom-10 right-[-10%] w-3/4 h-3/4 bg-[#560bad] opacity-[0.04] blur-[140px] rounded-full pointer-events-none z-0" style={{ transform: 'translateZ(0)', willChange: 'transform' }} />
      
      {/*! Watermarked Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.20, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative flex items-center justify-center w-[250px] h-[250px] md:w-[350px] md:h-[350px]"
        >
          {/* Spinning Logo Core */}
          <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
             className="relative w-full h-full z-10"
             style={{ willChange: "transform" }}
          >
            <Image src={AppIcon} alt="ConvergentAI Background" fill className="object-contain z-10" />
            
            {/* Glow Bullets Shooting Out */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute inset-0 pointer-events-none z-0"
                style={{ transform: `rotate(${i * 60}deg)` }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -150], 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.2]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeOut",
                    delay: 0 // Synchronized uniform burst
                  }}
                  className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[3px] h-[30px] md:w-[4px] md:h-[40px] rounded-full bg-white shadow-[0_0_12px_2px_#00b4d8,0_0_20px_4px_#a855f7]"
                  style={{ willChange: "transform, opacity" }}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-gradient-to-r from-[#0a0a0a] to-[#0f111a] shrink-0 relative z-10 shadow-md">
        <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-[#00b4d8]/40 shrink-0 shadow-[0_0_15px_rgba(0,180,216,0.3)]">
          <Image src="/friendly_ai_avatar_v2.png" alt="Ailana AI" fill className="object-cover" />
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-extrabold text-sm md:text-base leading-none tracking-tight">Ailana AI</p>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/20 uppercase">Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </div>
            <span className="text-gray-400 text-[10px] md:text-xs font-medium">Active now</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          <span className="text-[9px] md:text-[10px] text-gray-300 font-semibold tracking-widest uppercase">Secure</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-5 py-6 space-y-6 relative z-10" 
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent', transform: 'translateZ(0)', willChange: 'transform' }}
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
            {msg.role === 'ai' && (
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[#00b4d8]/40 shrink-0 mt-1 shadow-[0_0_10px_rgba(0,180,216,0.2)]">
                <Image src="/friendly_ai_avatar_v2.png" alt="AI" fill className="object-cover" />
              </div>
            )}
            <div className={`flex flex-col gap-1 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-5 py-3.5 text-sm md:text-[15px] leading-relaxed relative ${msg.role === 'user'
                ? 'bg-gradient-to-br from-[#00b4d8] via-[#023e8a] to-[#560bad] text-white rounded-[24px] rounded-tr-[4px] shadow-[0_8px_20px_rgba(0,180,216,0.25)] border border-white/10'
                : 'bg-[#161a2b] border border-[#00b4d8]/20 text-gray-100 rounded-[24px] rounded-tl-[4px] shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                }`}>
                {msg.role === 'ai' && (
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00b4d8]/40 to-transparent opacity-50" />
                )}
                {msg.role === 'ai' && msg.isStreaming ? (
                  <TypewriterText
                    text={msg.text}
                    onUpdate={handleUpdateScroll}
                    onComplete={() => handleStreamComplete(msg.id)}
                  />
                ) : (
                  msg.text
                )}
              </div>
              <span className="text-[10px] text-gray-500 font-medium px-2 mt-0.5">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-end">
            <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[#00b4d8]/40 shrink-0 shadow-[0_0_10px_rgba(0,180,216,0.2)]">
              <Image src="/friendly_ai_avatar_v2.png" alt="AI" fill className="object-cover" />
            </div>
            <div className="px-5 py-3.5 rounded-[24px] rounded-tl-[4px] bg-[#161a2b] border border-[#00b4d8]/20 flex gap-2 items-center shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
              <span className="h-2 w-2 rounded-full bg-[#00b4d8] animate-bounce shadow-[0_0_8px_rgba(0,180,216,0.6)]" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-[#a855f7] animate-bounce shadow-[0_0_8px_rgba(168,85,247,0.6)]" style={{ animationDelay: '160ms' }} />
              <span className="h-2 w-2 rounded-full bg-[#00b4d8] animate-bounce shadow-[0_0_8px_rgba(0,180,216,0.6)]" style={{ animationDelay: '320ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-5 py-4 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex gap-3 items-end shrink-0 relative z-10">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask Ailana a question..."
          rows={1}
          className="flex-1 bg-[#181b2a] border border-white/10 hover:border-white/20 focus:border-[#00b4d8]/60 focus:bg-[#1f2336] focus:shadow-[0_0_20px_rgba(0,180,216,0.15)] text-white placeholder-gray-500 text-[14px] md:text-[15px] rounded-2xl px-5 py-3.5 outline-none resize-none transition-all duration-300 leading-relaxed"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00b4d8] to-[#560bad] text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:grayscale transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,180,216,0.5)] active:scale-90 group"
        >
          <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
