import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BRS AI Recruiter",
  description: "Candidate and recruitment workflow platform for BRS Career Dream Job's."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
