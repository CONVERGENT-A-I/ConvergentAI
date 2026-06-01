import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Trust Center | ConvergentAI",
  description: "Learn about ConvergentAI's bank-grade security architecture, automated PII redaction (DLP), logical vault isolation, SOC2 readiness, and regulatory compliance.",
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
