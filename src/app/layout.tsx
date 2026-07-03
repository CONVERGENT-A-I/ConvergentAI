import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/footer";
import BackendConnectionTest from "@/components/backend-connection-test";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ConvergentAI",
  description: "Stop Mortgage Leakage with 24/7 Phygital Applicant Engagement",
  icons: {
    icon: "/newassets/ConvergentAI_logo_package/ConvergentAI_favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Termly Cookie Consent */}
        <Script
          src="https://app.termly.io/resource-blocker/f99cb3c5-d5a4-4ed3-9c93-1ccc32223251?autoBlock=on"
          strategy="afterInteractive"
        />

        {process.env.NODE_ENV === "development" && <BackendConnectionTest />}
        {children}
        <Footer />
      </body>
    </html>
  );
}
