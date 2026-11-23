"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Building2, LayoutDashboard, LogOut, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/vacancies", label: "Vacancies", icon: BriefcaseBusiness },
  { href: "/companies", label: "Companies", icon: Building2 }
];
export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const path = usePathname();
  async function logout() { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/login"; }
  return <div className="min-h-screen md:flex">
    <aside className="w-full border-b border-slate-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-8"><div className="text-xs font-bold tracking-widest text-blue-700">BRS CAREER DREAM JOB'S</div><div className="mt-1 text-xl font-bold">AI Recruiter</div></div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col">{links.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${path===href ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={18}/>{label}</Link>)}</nav>
      <div className="mt-8 border-t pt-4"><div className="truncate text-xs text-slate-500">{email}</div><button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-slate-600"><LogOut size={16}/> Sign out</button></div>
    </aside>
    <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
  </div>;
}