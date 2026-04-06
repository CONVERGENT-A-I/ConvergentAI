import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black py-16 md:py-16 px-8 md:px-12 lg:px-24">
      <div className="max-w-[1600px] mx-auto w-full">

        {/* Separation line at the top */}
        <div className="w-full h-px bg-white/15 mb-12" />

        {/* Footer content - Grouped into Left and Right sections */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
          
          {/* Left: Logo and Headquarters */}
          <div className="flex flex-col md:flex-row items-center md:items-center gap-10 md:gap-16">
            {/* Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity shrink-0">
              <Image
                src="/footer_logo.png"
                alt="ConvergentAI"
                width={600}
                height={200}
                className="h-40 md:h-64 w-auto object-contain"
              />
            </Link>

            {/* Headquarters */}
            <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mb-1">Headquarters:</span>
              <span className="text-white text-base md:text-xl font-semibold">Chattanooga, Tennessee</span>
              <Link
                href="mailto:info@convergentai.tech"
                className="text-zinc-400 text-base md:text-lg font-medium hover:text-brand-green transition-colors duration-200"
              >
                info@convergentai.tech
              </Link>
            </div>
          </div>

          {/* Middle: Social Icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <Link href="https://facebook.com" target="_blank" aria-label="Facebook"
              className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
              </svg>
            </Link>
            {/* X */}
            <Link href="https://x.com" target="_blank" aria-label="X"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            {/* LinkedIn */}
            <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn"
              className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-opacity">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Link>
          </div>

          {/* Right: Copyright */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1.5 shrink-0">
            <span className="text-zinc-300 text-base md:text-xl font-semibold tracking-wide">
              © 2026 ConvergentAI · All Rights Reserved.
            </span>
            <span className="text-zinc-500 text-base md:text-lg font-medium">
              Built for the Modern Credit Union.
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
