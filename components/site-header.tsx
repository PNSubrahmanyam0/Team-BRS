import Link from "next/link";
import { BriefcaseBusiness, LogIn } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-ink">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white"><BriefcaseBusiness size={19} /></span>
          <span>BRS <span className="text-brand-600">AI Recruiter</span></span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link className="hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 sm:block" href="/register">Register</Link>
          <Link className="hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 sm:block" href="/candidate">Candidate portal</Link>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-700" href="/candidate/login">
            <LogIn size={16} /> Candidate sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
