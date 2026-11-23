import Link from "next/link";
import { OtpLogin } from "@/components/otp-login";
import { SiteHeader } from "@/components/site-header";

export default function CandidateLoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <OtpLogin />
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-slate-600">
          New to BRS? <Link className="font-bold text-brand-700 underline" href="/register">Create your candidate profile</Link>.
        </p>
        <p className="mx-auto mt-3 max-w-md text-center text-xs text-slate-500">
          BRS team member? <Link className="font-semibold text-brand-700 underline" href="/login">Use the recruiter portal</Link>.
        </p>
      </main>
    </>
  );
}
