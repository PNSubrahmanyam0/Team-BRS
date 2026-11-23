import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { encryptEmployeeId } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationSchema } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * A deliberately disabled-by-default registration endpoint. Before enabling,
 * configure CAPTCHA/rate-limiting at the edge and Supabase OTP verification.
 * Service-role access is server-only; no secret reaches the browser.
 */
export async function POST(request: Request) {
  if (process.env.REGISTRATION_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Registration is not enabled in this environment yet." },
      { status: 503 },
    );
  }

  const organizationId = process.env.BRS_ORGANIZATION_ID;
  if (!organizationId) {
    return NextResponse.json({ error: "Registration organization is not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const rawPayload = formData.get("payload");
  const resume = formData.get("resume");
  if (typeof rawPayload !== "string" || !(resume instanceof File)) {
    return NextResponse.json({ error: "Profile details and a resume are required." }, { status: 422 });
  }
  if (
    resume.size === 0 ||
    resume.size > 10 * 1024 * 1024 ||
    !["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(resume.type)
  ) {
    return NextResponse.json({ error: "Resume must be a PDF or DOCX file up to 10 MB." }, { status: 422 });
  }

  let rawData: unknown;
  try {
    rawData = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }
  const payload = registrationSchema.safeParse(rawData);
  if (!payload.success) {
    return NextResponse.json({ error: "Please correct the highlighted fields.", issues: payload.error.flatten() }, { status: 422 });
  }

  try {
    const values = payload.data;
    const supabase = createAdminClient();
    const { data: existing, error: lookupError } = await supabase
      .from("candidates")
      .select("id")
      .eq("organization_id", organizationId)
      .or(`email.eq.${values.email},mobile.eq.${values.mobile}`)
      .limit(1);
    if (lookupError) throw lookupError;
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "A profile already uses this email or mobile number. Verify with OTP to access it instead." },
        { status: 409 },
      );
    }

    const employeeIdEncrypted = values.employeeId ? encryptEmployeeId(values.employeeId) : null;
    const { data: candidate, error: insertError } = await supabase
      .from("candidates")
      .insert({
        organization_id: organizationId,
        // The database trigger replaces this required placeholder atomically.
        candidate_code: "",
        employment_type: values.employmentType,
        full_name: values.fullName,
        email: values.email.toLocaleLowerCase(),
        mobile: values.mobile,
        current_location: values.currentLocation,
        preferred_locations: values.preferredLocations,
        preferred_job_roles: values.preferredJobRoles,
        key_skills: values.keySkills,
        highest_qualification: values.highestQualification ?? null,
        graduation_year: values.graduationYear ?? null,
        total_experience_months: values.totalExperienceMonths ?? 0,
        relevant_experience_months: 0,
        current_job_role: values.currentRole ?? null,
        employee_id_encrypted: employeeIdEncrypted,
        current_company: values.currentCompany ?? null,
        current_ctc: values.currentCtc ?? null,
        expected_ctc: values.expectedCtc ?? null,
        notice_period: values.noticePeriodDays === undefined ? null : `${values.noticePeriodDays} days`,
        last_working_day: values.lastWorkingDay ?? null,
        certifications: values.certifications ?? null,
        projects: values.projects ?? null,
        registration_status: "completed",
        profile_status: "pending",
        recruitment_status: "pending_vacancy_assignment",
        profile_completion: 90,
        consent_status: "granted",
      })
        .select("id, candidate_code")
      .single();
    if (insertError) throw insertError;

    const extension = resume.name.toLocaleLowerCase().endsWith(".docx") ? "docx" : "pdf";
    const fileBytes = Buffer.from(await resume.arrayBuffer());
    const storagePath = `${organizationId}/${candidate.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(storagePath, fileBytes, {
      contentType: resume.type,
      upsert: false,
    });
    if (uploadError) {
      await supabase.from("candidates").delete().eq("id", candidate.id);
      throw uploadError;
    }
    const { error: resumeError } = await supabase.from("resumes").insert({
      candidate_id: candidate.id,
      storage_path: storagePath,
      original_filename: resume.name,
      mime_type: resume.type,
      file_size: resume.size,
      file_hash: createHash("sha256").update(fileBytes).digest("hex"),
      version_number: 1,
      extraction_status: "pending",
      parsed_data: {},
      is_current: true,
    });
    if (resumeError) {
      await supabase.storage.from("resumes").remove([storagePath]);
      await supabase.from("candidates").delete().eq("id", candidate.id);
      throw resumeError;
    }

    const { error: consentError } = await supabase.from("candidate_consents").insert([
      { candidate_id: candidate.id, consent_type: "privacy_processing", consent_version: "v1", granted: true, source: "registration" },
      { candidate_id: candidate.id, consent_type: "job_alerts", consent_version: "v1", granted: values.jobAlertConsent, source: "registration" },
    ]);
    if (consentError) {
      await supabase.from("resumes").delete().eq("candidate_id", candidate.id);
      await supabase.storage.from("resumes").remove([storagePath]);
      await supabase.from("candidates").delete().eq("id", candidate.id);
      throw consentError;
    }

    return NextResponse.json({ id: candidate.id, candidateCode: candidate.candidate_code, next: "verify_contact" }, { status: 201 });
  } catch (error) {
    console.error("Candidate registration failed", error);
    return NextResponse.json({ error: "We could not save your registration. Please try again later." }, { status: 500 });
  }
}
