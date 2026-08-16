import Image from "next/image";
import Link from "next/link";
import FooterWhitepaperLink from "./footer-whitepaper-link";

export default function Footer() {
  return (
    <footer className="bg-bg-primary px-6 py-14 md:px-10 md:py-16 lg:px-16 xl:px-24">
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Separation line at the top */}
        <div className="w-full h-px bg-border-subtle mb-12" />

        {/* Footer content: big brand mark + balanced columns across breakpoints */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6 md:gap-x-8 md:gap-y-12 xl:gap-x-10 xl:gap-y-10 items-start">
          {/* Brand (logo only) */}
          <div className="flex flex-col items-center md:col-span-3 xl:col-span-1 md:max-w-3xl md:mx-auto xl:max-w-none xl:mx-0 text-center xl:text-left xl:items-start gap-5 md:gap-6">
            {/* Logo — primary element */}
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity shrink-0 flex justify-center xl:justify-start"
            >
              <Image
                src="/newassets/ConvergentAI_logo_package/ConvergentAI_primary_logo_reverse_1100px.png"
                alt="ConvergentAI"
                width={1100}
                height={260}
                className="h-24 w-auto sm:h-28 md:h-32 xl:h-28 object-contain"
              />
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex flex-col items-center md:items-center xl:items-start text-center xl:text-left gap-4">
            <span className="text-text-muted text-sm font-bold uppercase tracking-[0.2em]">
              Follow
            </span>
            <div className="flex items-center gap-4">
              {/* LinkedIn */}
              <Link
                href="https://www.linkedin.com/company/convergentai-tech/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
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
            <span className="text-text-muted text-sm font-bold uppercase tracking-[0.2em] mb-1">
              Trust
            </span>
            <Link
              href="/security"
              className="text-text-secondary text-sm md:text-base font-medium hover:text-brand-teal transition-colors"
            >
              Security & Trust Center
            </Link>
            <Link
              href="/privacy"
              className="text-text-secondary text-sm md:text-base font-medium hover:text-brand-teal transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/termsandconditions"
              className="text-text-secondary text-sm md:text-base font-medium hover:text-brand-teal transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="https://app.termly.io/dsar/1acd48eb-09ac-4991-bd12-43b98d86a2d7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary text-sm md:text-base font-medium hover:text-brand-teal transition-colors"
            >
              Data Subject Access Request (DSAR)
            </Link>

            <span className="text-text-muted text-sm font-bold uppercase tracking-[0.2em] mt-4 mb-1">
              Resources
            </span>
            <FooterWhitepaperLink />
          </div>

          {/* Right: Copyright */}
          <div className="flex flex-col items-center md:items-center xl:items-end text-center xl:text-right gap-1.5 xl:justify-self-end">
            <span className="text-text-secondary text-base md:text-lg xl:text-xl font-semibold tracking-wide">
              © 2026 ConvergentAI · All Rights Reserved.
            </span>
            <span className="text-text-muted text-sm md:text-base xl:text-lg font-medium">
              Built for fast response, trusted guidance, and human connection in financial services.
            </span>

            {/* Headquarters (moved here per client feedback) */}
            <div className="mt-5 flex flex-col items-center xl:items-end gap-1">
              <span className="text-text-muted text-xs font-bold uppercase tracking-[0.2em]">
                Headquarters
              </span>
              <span className="text-white text-sm md:text-base font-semibold">
                Chattanooga, Tennessee
              </span>
              <Link
                href="https://mail.google.com/mail/?view=cm&fs=1&to=info@convergentai.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary text-sm md:text-base font-medium hover:text-brand-teal transition-colors duration-200"
              >
                info@convergentai.tech
              </Link>
            </div>
          </div>
        </div>

        {/* Milestone 5: Trust Badges and Regulatory Disclosure */}
        <div className="mt-16 pt-12 border-t border-border-subtle flex flex-col gap-10">
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
              <div className="w-auto h-8 bg-white/10 rounded flex items-center justify-center font-bold text-[8px]">
                SignalWire
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                ISO 27001
              </span>
            </div>
          </div>

          {/* Disclosure Text */}
          <div className="max-w-4xl space-y-4">
            <p className="text-text-muted text-[11px] md:text-xs leading-relaxed text-center md:text-left italic">
              ConvergentAI is designed to support regulated financial institution environments with secure transmission protocols, AES-256 encryption where applicable, logical tenant isolation, audit trails, configurable data handling controls, human oversight, and responsible AI governance. Infrastructure and communications providers may maintain independent certifications, including SOC 2 Type II and ISO 27001. ConvergentAI is actively pursuing its own SOC 2 Type 1 attestation.
            </p>
            <p className="text-text-muted text-[11px] md:text-xs leading-relaxed text-center md:text-left italic">
              ConvergentAI is a technology provider and does not directly offer financial services, banking products, lending products, rates, approvals, underwriting decisions, or financial advice. Customer interactions, product disclosures, compliance obligations, and data governance remain subject to each institution’s policies, approvals, and regulatory requirements.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
