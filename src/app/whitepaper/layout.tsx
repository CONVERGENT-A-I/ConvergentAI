import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Phygital Imperative — ConvergentAI Whitepaper",
  description:
    "Download ConvergentAI's whitepaper on bridging digital and physical touchpoints to eliminate mortgage drop-off and capture borrower intent 24/7.",
  openGraph: {
    title: "The Phygital Imperative — ConvergentAI",
    description:
      "Discover how financial institutions are bridging digital and physical touchpoints to eliminate mortgage drop-off.",
    type: "article",
  },
};

export default function WhitepaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
