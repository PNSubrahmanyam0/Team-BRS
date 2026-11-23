import {redirect} from "next/navigation";
import {createClient,hasSupabaseConfiguration} from "@/lib/supabase/server";
import {AdminShell} from "@/components/admin-shell";

export const dynamic = "force-dynamic";

export default async function Companies(){
 if(!hasSupabaseConfiguration())redirect("/login?error=Supabase%20is%20not%20configured");
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:p}=await s.from("profiles").select("email,role,organization_id").eq("id",user.id).maybeSingle();if(!p||!["owner","admin","recruiter"].includes(p.role)||!p.organization_id)redirect("/dashboard");
 const {data,error}=await s.from("companies").select("id,company_name,industry,verification_status,status").eq("organization_id",p.organization_id).order("company_name");
 return <AdminShell email={p.email??user.email??""}><div className="flex items-end justify-between gap-3"><div><h1 className="text-3xl font-bold">Companies</h1><p className="muted mt-1 text-sm">Employer directory and verification status.</p></div><a href="/companies/new" className="btn">Add company</a></div><section className="panel mt-6 overflow-x-auto">{error?<p className="p-5 text-red-600">{error.message}</p>:!data?.length?<p className="muted p-8 text-center text-sm">No companies added yet. Company create/edit workflow is the next module.</p>:<table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Company</th><th className="p-4">Industry</th><th className="p-4">Verification</th><th className="p-4">Status</th></tr></thead><tbody>{data.map(c=><tr key={c.id} className="border-t"><td className="p-4 font-medium">{c.company_name}</td><td className="p-4">{c.industry??"—"}</td><td className="p-4">{c.verification_status}</td><td className="p-4">{c.status}</td></tr>)}</tbody></table>}</section></AdminShell>;
}
