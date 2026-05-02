import { Suspense } from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import FloatingCTA from "@/components/floating-cta";
import BackendConnectionTest from "@/components/backend-connection-test";

import ErrorBoundary from "@/components/error-boundary";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ConvergentAI",
  description: "Stop Mortgage Leakage with 24/7 Phygital Account Holder Engagement",
  icons: {
    icon: "/favicon.png",
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
      className={`${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <BackendConnectionTest />
        {children}
        <Suspense fallback={null}>
          <ErrorBoundary>
            <FloatingCTA />
          </ErrorBoundary>
        </Suspense>
        <Footer />
      </body>
    </html>
  );
}
