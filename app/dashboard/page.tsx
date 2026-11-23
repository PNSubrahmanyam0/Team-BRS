import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";
const cards = [
  { key: "candidates", label: "Total candidates", href: "/candidates" },
  { key: "vacancies", label: "Active vacancies", href: "/vacancies" },
  { key: "companies", label: "Companies", href: "/companies" },
  { key: "applications", label: "Applications", href: "/candidates" }
] as const;
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name,email,role,organization_id,status").eq("id", user.id).maybeSingle();
  if (!profile || !["owner","admin","recruiter"].includes(profile.role) || !profile.organization_id) {
    return <main className="min-h-screen grid place-items-center p-6"><section className="panel max-w-lg p-8"><h1 className="text-xl font-bold">Admin access is not configured</h1><p className="muted mt-3 text-sm">Your account is signed in, but it has not yet been assigned the BRS administrator role and organization. Complete the secure one-time setup in Supabase before opening the admin dashboard.</p><p className="mt-4 text-xs text-slate-500">Signed in as {user.email}</p><a className="mt-5 inline-block text-sm font-semibold text-blue-700" href="/login">Return to login</a></section></main>;
  }
  const org = profile.organization_id;
  const results = await Promise.all([
    supabase.from("candidates").select("id",{count:"exact",head:true}).eq("organization_id",org),
    supabase.from("vacancies").select("id",{count:"exact",head:true}).eq("organization_id",org).eq("status","active"),
    supabase.from("companies").select("id",{count:"exact",head:true}).eq("organization_id",org),
    supabase.from("applications").select("id",{count:"exact",head:true}).eq("organization_id",org)
  ]);
  const counts = results.map(x => x.count ?? 0);
  return <AdminShell email={user.email ?? ""}>
    <div className="mb-8"><p className="text-sm font-medium text-blue-700">BRS AI RECRUITER</p><h1 className="mt-1 text-3xl font-bold">Dashboard overview</h1><p className="muted mt-2">Your recruitment operations at a glance.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card,i)=><a key={card.key} href={card.href} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-sm"><p className="muted text-sm">{card.label}</p><p className="mt-3 text-3xl font-bold">{counts[i]}</p></a>)}</div>
    <section className="panel mt-6 p-6"><h2 className="text-lg font-semibold">Phase 1 workspace</h2><p className="muted mt-2 text-sm">Candidate and vacancy management are being brought online first. Resume file upload will be enabled after the dedicated Google Drive authorization is configured.</p><div className="mt-4 flex flex-wrap gap-3"><a className="btn" href="/candidates/new">Add candidate</a><a className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold" href="/vacancies/new">Add vacancy</a></div></section>
  </AdminShell>;
}