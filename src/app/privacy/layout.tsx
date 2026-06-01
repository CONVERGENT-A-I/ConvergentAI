import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ConvergentAI",
  description: "Read ConvergentAI's Privacy Policy to understand how we collect, process, and protect your personal information and maintain bank-grade security standards.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
