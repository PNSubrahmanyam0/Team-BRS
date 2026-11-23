import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,hasSupabaseConfiguration} from "@/lib/supabase/server";
import {AdminShell} from "@/components/admin-shell";

export const dynamic = "force-dynamic";

export default async function Vacancies(){
 if(!hasSupabaseConfiguration())redirect("/login?error=Supabase%20is%20not%20configured");
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:p}=await s.from("profiles").select("email,role,organization_id").eq("id",user.id).maybeSingle();if(!p||!["owner","admin","recruiter"].includes(p.role)||!p.organization_id)redirect("/dashboard");
 const {data:jobs,error}=await s.from("vacancies").select("id,job_title,location,status,package_min,package_max,companies(company_name)").eq("organization_id",p.organization_id).order("created_at",{ascending:false});
 return <AdminShell email={p.email??user.email??""}><div className="mb-6 flex items-end justify-between"><div><h1 className="text-3xl font-bold">Vacancies</h1><p className="muted mt-1 text-sm">Manage hiring opportunities.</p></div><Link className="btn" href="/vacancies/new">Add vacancy</Link></div><section className="panel overflow-x-auto">{error?<p className="p-5 text-red-600">{error.message}</p>:!jobs?.length?<p className="muted p-8 text-center text-sm">No vacancies added yet.</p>:<table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Role</th><th className="p-4">Company</th><th className="p-4">Location</th><th className="p-4">Status</th></tr></thead><tbody>{jobs.map((j:any)=><tr key={j.id} className="border-t"><td className="p-4 font-semibold">{j.job_title}</td><td className="p-4">{j.companies?.company_name??"—"}</td><td className="p-4">{j.location??"—"}</td><td className="p-4 capitalize">{j.status.replaceAll("_"," ")}</td></tr>)}</tbody></table>}</section></AdminShell>;
}
