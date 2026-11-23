"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
export async function createCompany(fd:FormData){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:p}=await s.from("profiles").select("role,organization_id").eq("id",user.id).maybeSingle();
 if(!p||!["owner","admin","recruiter"].includes(p.role)||!p.organization_id)throw new Error("Not authorized");
 const company_name=String(fd.get("company_name")||"").trim();if(!company_name)throw new Error("Company name is required.");
 const {error}=await s.from("companies").insert({organization_id:p.organization_id,company_name,industry:String(fd.get("industry")||""),contact_name:String(fd.get("contact_name")||""),contact_email:String(fd.get("contact_email")||""),contact_phone:String(fd.get("contact_phone")||""),verification_status:"unverified",status:"active"});
 if(error)throw new Error(error.message);revalidatePath("/companies");redirect("/companies");
}