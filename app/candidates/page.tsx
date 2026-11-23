import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfiguration } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
 if (!hasSupabaseConfiguration()) redirect("/login?error=Supabase%20is%20not%20configured");
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 const {data:profile}=await supabase.from("profiles").select("email,role,organization_id").eq("id",user.id).maybeSingle();
 if(!profile || !["owner","admin","recruiter"].includes(profile.role) || !profile.organization_id) redirect("/dashboard");
 const {data:candidates,error}=await supabase.from("candidates").select("id,candidate_code,full_name,email,mobile,employment_type,current_location,recruitment_status,created_at").eq("organization_id",profile.organization_id).order("created_at",{ascending:false}).limit(100);
 return <AdminShell email={profile.email ?? user.email ?? ""}><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-bold">Candidates</h1><p className="muted mt-1 text-sm">Manage Fresher and Experienced candidate profiles.</p></div><Link className="btn" href="/candidates/new">Add candidate</Link></div><section className="panel overflow-hidden"><div className="border-b p-4 font-semibold">Candidate records</div>{error?<p className="p-5 text-sm text-red-600">{error.message}</p>:!candidates?.length?<p className="muted p-8 text-center text-sm">No candidates yet. Add your first candidate to begin.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Candidate","Type","Location","Status","Contact"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{candidates.map(c=><tr key={c.id} className="border-t"><td className="px-4 py-3"><div className="font-semibold">{c.full_name}</div><div className="text-xs text-slate-500">{c.candidate_code}</div></td><td className="px-4 py-3 capitalize">{c.employment_type}</td><td className="px-4 py-3">{c.current_location ?? "—"}</td><td className="px-4 py-3">{c.recruitment_status.replaceAll("_"," ")}</td><td className="px-4 py-3">{c.mobile}<div className="text-xs text-slate-500">{c.email}</div></td></tr>)}</tbody></table></div>}</section></AdminShell>;
}
