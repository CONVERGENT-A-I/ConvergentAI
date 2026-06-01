import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ConvergentAI",
  description: "Review the ConvergentAI terms and conditions governing your access to and use of our virtual assistant services and digital platforms.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
