"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-[100]">
      <div className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-16 md:py-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="relative z-[200] hover:opacity-80 transition-opacity">
          <Image
            src="/footer_logo_for_nav.png"
            alt="ConvergentAI Logo"
            width={400}
            height={100}
            className="h-20 md:h-32 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-12">
          {[
            { name: "Home", href: "/" },
            { name: "About Us", href: "/about" },
            { name: "Features", href: "/features" },
            { name: "AI Voice & Avatars", href: "/ai" },
          ].map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative py-1 text-xs xl:text-sm font-bold tracking-[0.15em] uppercase transition-colors duration-300
                  ${isActive ? "text-brand-green" : "text-white/60 hover:text-brand-green"}
                  after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-green 
                  after:origin-left after:scale-x-0 after:transition-transform after:duration-300 
                  hover:after:scale-x-100
                `}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Schedule a Meeting Button */}
        <div className="hidden md:block">
          <Link
            href="https://convergentai.neetocal.com/meeting-with-david-patten"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-green text-black px-6 py-3 xl:px-9 xl:py-4 rounded-full text-xs xl:text-sm font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,153,0.6)] transition-all transform hover:scale-105 active:scale-95"
          >
            Schedule a Meeting
          </Link>
        </div>

        {/* Mobile Menu Button - Bulletproof Standard Implementation */}
        <button
          type="button"
          className="md:hidden relative z-[200] p-4 -mr-4 text-white hover:bg-white/10 active:bg-white/20 active:scale-95 rounded-full transition-all cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
          aria-expanded={isMenuOpen}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          {/* Backdrop Blur Layer */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-lg animate-in fade-in duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Card */}
          <div className="absolute top-28 left-6 right-6 bg-zinc-900 border border-white/10 rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
            {[
              { name: "Home", href: "/" },
              { name: "About Us", href: "/about" },
              { name: "Features", href: "/features" },
              { name: "AI Voice & Avatars", href: "/ai" },
            ].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-2xl font-black tracking-tight transition-colors duration-300
                    ${isActive ? "text-brand-green" : "text-white hover:text-brand-green"}
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/"
              className="mt-2 bg-brand-green text-black px-8 py-5 rounded-2xl text-center font-black uppercase tracking-wider text-base hover:opacity-90 active:scale-95 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Schedule a Meeting
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
