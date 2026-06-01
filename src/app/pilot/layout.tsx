import { Metadata } from "next";

export const metadata: Metadata = {
  title: "90-Day Pilot Program | ConvergentAI",
  description: "Deploy ConvergentAI under a risk-free 90-day sandbox program. Prove ROI and applicant engagement value with zero core integration and full air-gap security.",
};

export default function PilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
