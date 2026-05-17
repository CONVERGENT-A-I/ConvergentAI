import Image from "next/image";
import Link from "next/link";
import FooterWhitepaperLink from "./footer-whitepaper-link";

export default function Footer() {
  return (
    <footer className="bg-black px-6 py-14 md:px-10 md:py-16 lg:px-16 xl:px-24">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Separation line at the top */}
        <div className="w-full h-px bg-white/15 mb-12" />

        {/* Footer content: big brand mark + balanced columns across breakpoints */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6 md:gap-x-8 md:gap-y-12 xl:gap-x-10 xl:gap-y-10 items-start">
          {/* Brand (logo only) */}
          <div className="flex flex-col items-center md:col-span-3 xl:col-span-1 md:max-w-3xl md:mx-auto xl:max-w-none xl:mx-0 text-center xl:text-left xl:items-start gap-5 md:gap-6">
            {/* Logo — primary element */}
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity shrink-0 w-full flex justify-center xl:justify-start"
            >
              <Image
                src="/footer_logo.png"
                alt="ConvergentAI"
                width={1200}
                height={400}
                className="h-44 w-auto sm:h-48 md:h-56 lg:h-60 xl:h-56 max-w-[min(100%,34rem)] xl:max-w-none object-contain object-center xl:object-left"
              />
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex flex-col items-center md:items-center xl:items-start text-center xl:text-left gap-4">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em]">
              Follow
            </span>
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <Link
                href="https://facebook.com"
                target="_blank"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  className="w-4 h-4 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                </svg>
              </Link>
              {/* X */}
              <Link
                href="https://x.com"
                target="_blank"
                aria-label="X"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              {/* LinkedIn */}
              <Link
                href="https://linkedin.com"
                target="_blank"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <svg
                  className="w-4 h-4 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Trust, Legal & Resources */}
          <div className="flex flex-col items-center md:items-center xl:items-start text-center xl:text-left gap-3">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mb-1">
              Trust
            </span>
            <Link
              href="/security"
              className="text-zinc-300 text-sm md:text-base font-medium hover:text-brand-green transition-colors"
            >
              Security & Trust Center
            </Link>
            <Link
              href="/privacy"
              className="text-zinc-300 text-sm md:text-base font-medium hover:text-brand-green transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/dpa"
              className="text-zinc-300 text-sm md:text-base font-medium hover:text-brand-green transition-colors"
            >
              Data Processing Agreement
            </Link>

            <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] mt-4 mb-1">
              Resources
            </span>
            <FooterWhitepaperLink />
          </div>

          {/* Right: Copyright */}
          <div className="flex flex-col items-center md:items-center xl:items-end text-center xl:text-right gap-1.5 xl:justify-self-end">
            <span className="text-zinc-300 text-base md:text-lg xl:text-xl font-semibold tracking-wide">
              © 2026 ConvergentAI · All Rights Reserved.
            </span>
            <span className="text-zinc-500 text-sm md:text-base xl:text-lg font-medium">
              Built for Modern Financial Institutions.
            </span>

            {/* Headquarters (moved here per client feedback) */}
            <div className="mt-5 flex flex-col items-center xl:items-end gap-1">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                Headquarters
              </span>
              <span className="text-white text-sm md:text-base font-semibold">
                Chattanooga, Tennessee
              </span>
              <Link
                href="mailto:info@convergentai.tech"
                className="text-zinc-400 text-sm md:text-base font-medium hover:text-brand-green transition-colors duration-200"
              >
                info@convergentai.tech
              </Link>
            </div>
          </div>
        </div>

        {/* Milestone 5: Trust Badges and Regulatory Disclosure */}
        <div className="mt-16 pt-12 border-t border-white/10 flex flex-col gap-10">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 opacity-40 hover:opacity-70 transition-opacity grayscale">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">
                GCP
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                SOC 2 TYPE II
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">
                LIVEKIT
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                SOC 2 TYPE II
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">
                TELNYX
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                ISO 27001
              </span>
            </div>
          </div>

          {/* Disclosure Text */}
          <div className="max-w-4xl">
            <p className="text-zinc-500 text-[11px] md:text-xs leading-relaxed text-center md:text-left italic">
              ConvergentAI is a technology provider and does not directly offer
              financial services. Our AI solutions are designed to comply with
              FFIEC, FDIC, and NCUA regulatory standards. All infrastructure is
              hosted on SOC 2 Type II certified data centers with military-grade
              AES-256 encryption.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
