"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function createCandidate(formData: FormData) {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 const {data:profile}=await supabase.from("profiles").select("role,organization_id").eq("id",user.id).maybeSingle();
 if(!profile || !["owner","admin","recruiter"].includes(profile.role) || !profile.organization_id) throw new Error("Not authorized");
 const employment=String(formData.get("employment_type")||"");
 const fullName=String(formData.get("full_name")||"").trim();
 const email=String(formData.get("email")||"").trim().toLowerCase();
 const mobile=String(formData.get("mobile")||"").trim();
 if(!["fresher","experienced"].includes(employment) || !fullName || !email || !mobile) throw new Error("Complete the required fields.");
 const candidateCode="BRS-"+new Date().getFullYear()+"-"+crypto.randomUUID().slice(0,8).toUpperCase();
 const row:any={organization_id:profile.organization_id,candidate_code:candidateCode,employment_type:employment,full_name:fullName,email,mobile,current_location:String(formData.get("current_location")||""),preferred_locations:String(formData.get("preferred_locations")||"").split(",").map(x=>x.trim()).filter(Boolean),preferred_job_roles:String(formData.get("preferred_job_roles")||"").split(",").map(x=>x.trim()).filter(Boolean),consent_status:"pending",registration_status:"started"};
 if(employment==="experienced"){row.total_experience_months=Number(formData.get("total_experience_months")||0);row.current_job_role=String(formData.get("current_job_role")||"");row.current_company=String(formData.get("current_company")||"");row.employee_id_encrypted=null;row.current_ctc=Number(formData.get("current_ctc")||0)||null;row.expected_ctc=Number(formData.get("expected_ctc")||0)||null;row.notice_period=String(formData.get("notice_period")||"");row.last_working_day=String(formData.get("last_working_day")||"")||null;}
 else {row.highest_qualification=String(formData.get("highest_qualification")||"");row.graduation_year=Number(formData.get("graduation_year")||0)||null;row.key_skills=String(formData.get("key_skills")||"").split(",").map(x=>x.trim()).filter(Boolean);row.certifications=String(formData.get("certifications")||"");row.projects=String(formData.get("projects")||"");}
 const {error}=await supabase.from("candidates").insert(row);
 if(error) throw new Error(error.message);
 revalidatePath("/candidates"); revalidatePath("/dashboard"); redirect("/candidates");
}