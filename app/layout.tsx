import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BRS AI Recruiter",
  description: "Recruitment management portal for BRS Career Dream Job's."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}