"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
export async function createVacancy(fd:FormData){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:p}=await s.from("profiles").select("role,organization_id").eq("id",user.id).maybeSingle();
 if(!p||!["owner","admin","recruiter"].includes(p.role)||!p.organization_id)throw new Error("Not authorized");
 const company_id=String(fd.get("company_id")||"");const job_title=String(fd.get("job_title")||"").trim();
 if(!company_id||!job_title)throw new Error("Company and job title are required.");
 const {error}=await s.from("vacancies").insert({organization_id:p.organization_id,company_id,job_title,location:String(fd.get("location")||""),domain:String(fd.get("domain")||""),work_mode:String(fd.get("work_mode")||""),shift:String(fd.get("shift")||""),job_description:String(fd.get("job_description")||""),package_min:Number(fd.get("package_min")||0)||null,package_max:Number(fd.get("package_max")||0)||null,experience_min_months:Number(fd.get("experience_min_months")||0)||null,experience_max_months:Number(fd.get("experience_max_months")||0)||null,mandatory_skills:String(fd.get("mandatory_skills")||"").split(",").map(x=>x.trim()).filter(Boolean),preferred_skills:String(fd.get("preferred_skills")||"").split(",").map(x=>x.trim()).filter(Boolean),employer_verification_status:"pending",status:"draft",created_by:user.id});
 if(error)throw new Error(error.message);revalidatePath("/vacancies");revalidatePath("/dashboard");redirect("/vacancies");
}