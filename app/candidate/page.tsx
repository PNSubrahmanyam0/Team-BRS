import { CandidateDashboard } from "@/components/candidate-dashboard";
import { SiteHeader } from "@/components/site-header";
import { createClient, hasSupabaseConfiguration } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CandidatePage() {
  if (!hasSupabaseConfiguration()) redirect("/candidate/login");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/candidate/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "candidate" || profile.status !== "active") {
    return <CandidateAccessNotice />;
  }

  const { data: candidate } = await supabase
    .from("candidates")
    .select("id, candidate_code, employment_type, full_name, key_skills, preferred_job_roles, preferred_locations, profile_completion, recruitment_status, total_experience_months")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!candidate) return <CandidateAccessNotice />;

  const [{ data: currentResume }, { count: applicationCount }] = await Promise.all([
    supabase
      .from("resumes")
      .select("original_filename, uploaded_at, extraction_status")
      .eq("candidate_id", candidate.id)
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("candidate_id", candidate.id),
  ]);

  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><CandidateDashboard candidate={{
    candidateCode: candidate.candidate_code,
    employmentType: candidate.employment_type,
    fullName: candidate.full_name,
    keySkills: candidate.key_skills,
    preferredJobRoles: candidate.preferred_job_roles,
    preferredLocations: candidate.preferred_locations,
    profileCompletion: candidate.profile_completion,
    recruitmentStatus: candidate.recruitment_status,
    totalExperienceMonths: candidate.total_experience_months,
  }} currentResume={currentResume ? {
    extractionStatus: currentResume.extraction_status,
    filename: currentResume.original_filename,
    uploadedAt: currentResume.uploaded_at,
  } : null} applicationCount={applicationCount ?? 0} /></main></>;
}

function CandidateAccessNotice() {
  return <><SiteHeader /><main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-2xl place-items-center px-4 py-10"><section className="panel p-7 text-center"><h1 className="text-2xl font-black text-ink">Candidate access needs review</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your signed-in account is not yet linked to an active BRS candidate profile. Please contact BRS rather than creating another profile.</p></section></main></>;
}
