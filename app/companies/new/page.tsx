import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,hasSupabaseConfiguration} from "@/lib/supabase/server";
import {AdminShell} from "@/components/admin-shell";
import {createCompany} from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCompany(){
 if(!hasSupabaseConfiguration())redirect("/login?error=Supabase%20is%20not%20configured");
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:p}=await s.from("profiles").select("email,role,organization_id").eq("id",user.id).maybeSingle();if(!p||!["owner","admin","recruiter"].includes(p.role)||!p.organization_id)redirect("/dashboard");
 return <AdminShell email={p.email??user.email??""}><Link href="/companies" className="text-sm text-blue-700">← Companies</Link><h1 className="mb-2 mt-3 text-3xl font-bold">Add company</h1><p className="muted mb-6 text-sm">New employers start as unverified. Verify the employer before activating vacancies.</p><form action={createCompany} className="panel max-w-2xl space-y-4 p-6"><label className="block text-sm">Company name *<input name="company_name" required className="field mt-1"/></label><label className="block text-sm">Industry<input name="industry" className="field mt-1"/></label><label className="block text-sm">Contact person<input name="contact_name" className="field mt-1"/></label><label className="block text-sm">Contact email<input name="contact_email" type="email" className="field mt-1"/></label><label className="block text-sm">Contact phone<input name="contact_phone" className="field mt-1"/></label><button className="btn">Save company</button></form></AdminShell>;
}
