"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { splitCommaList } from "@/lib/utils";
import type { EmploymentType } from "@/lib/types";

const steps = ["Category", "Personal", "Details", "Resume", "Review"];
type FormState = Record<string, string | boolean>;

const initialValues: FormState = {
  employmentType: "",
  fullName: "",
  email: "",
  mobile: "+91",
  currentLocation: "",
  preferredLocations: "",
  preferredJobRoles: "",
  keySkills: "",
  highestQualification: "",
  graduationYear: "",
  certifications: "",
  projects: "",
  totalExperienceMonths: "",
  currentCompany: "",
  employeeId: "",
  currentRole: "",
  currentCtc: "",
  expectedCtc: "",
  noticePeriodDays: "",
  lastWorkingDay: "",
  privacyConsent: false,
  jobAlertConsent: false,
};

function Field({ label, hint, children, required = false }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return <label className="block"><span className="field-label">{label}{required && <span className="text-red-600"> *</span>}</span>{children}{hint && <span className="field-help">{hint}</span>}</label>;
}

export function CandidateRegistration() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>(initialValues);
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const employmentType = values.employmentType as EmploymentType | "";
  const isExperienced = employmentType === "experienced";
  const isFresher = employmentType === "fresher";
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const profilePreview = useMemo(() => ({
    name: String(values.fullName || "Your name"),
    role: splitCommaList(String(values.preferredJobRoles))[0] || "Preferred role",
    location: splitCommaList(String(values.preferredLocations))[0] || "Preferred location",
  }), [values]);

  const update = (field: string, value: string | boolean) => setValues((current) => ({ ...current, [field]: value }));
  const textInput = (field: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input value={String(values[field] ?? "")} onChange={(event) => update(field, event.target.value)} className="block w-full" {...props} />
  );

  function validateCurrentStep() {
    const requiredByStep: Record<number, string[]> = {
      0: ["employmentType"],
      1: ["fullName", "email", "mobile", "currentLocation", "preferredLocations"],
      2: isFresher ? ["highestQualification", "graduationYear", "keySkills", "preferredJobRoles"] : ["totalExperienceMonths", "currentCompany", "currentRole", "currentCtc", "expectedCtc", "noticePeriodDays", "keySkills", "preferredJobRoles"],
      3: [],
      4: ["privacyConsent"],
    };
    const empty = requiredByStep[step].find((field) => !values[field]);
    if (empty) {
      setError("Please complete every required field before continuing.");
      return false;
    }
    if (step === 3 && !resume) {
      setError("Please attach your updated PDF or DOCX resume.");
      return false;
    }
    setError("");
    return true;
  }

  function next() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function selectResume(file?: File) {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Use a PDF or DOCX resume up to 10 MB.");
      return;
    }
    setError("");
    setResume(file);
  }

  async function submit() {
    if (!validateCurrentStep() || !resume) return;
    setSending(true);
    setError("");
    const numeric = (field: string) => values[field] === "" ? undefined : Number(values[field]);
    const payload = {
      ...values,
      employmentType,
      preferredLocations: splitCommaList(String(values.preferredLocations)),
      preferredJobRoles: splitCommaList(String(values.preferredJobRoles)),
      keySkills: splitCommaList(String(values.keySkills)),
      totalExperienceMonths: numeric("totalExperienceMonths"),
      employeeId: values.employeeId || undefined,
      highestQualification: values.highestQualification || undefined,
      graduationYear: numeric("graduationYear"),
      currentCompany: values.currentCompany || undefined,
      currentRole: values.currentRole || undefined,
      currentCtc: numeric("currentCtc"),
      expectedCtc: numeric("expectedCtc"),
      noticePeriodDays: numeric("noticePeriodDays"),
      lastWorkingDay: values.lastWorkingDay || undefined,
      certifications: values.certifications || undefined,
      projects: values.projects || undefined,
    };
    const form = new FormData();
    form.set("payload", JSON.stringify(payload));
    form.set("resume", resume);
    try {
      const response = await fetch("/api/candidates", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "We could not submit your profile.");
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not submit your profile.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return <section className="panel mx-auto max-w-2xl text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={30} /></span><h2 className="mt-5 text-2xl font-black text-ink">Profile received</h2><p className="mx-auto mt-3 max-w-lg text-slate-600">We saved your profile. Verify your email with the one-time code to claim your dashboard. If no verified role matches today, we will retain your profile only according to your consent and notification preferences.</p><Button className="mt-6" onClick={() => window.location.assign("/candidate/login")}>Verify and access dashboard</Button></section>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
      <section className="panel">
        <div className="mb-8"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Candidate registration</p><h1 className="mt-1 text-2xl font-black text-ink">Build your employment profile</h1></div><span className="text-sm font-bold text-slate-500">{progress}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div><ol className="mt-3 hidden justify-between text-xs font-medium text-slate-500 sm:flex">{steps.map((label, index) => <li key={label} className={index <= step ? "text-brand-700" : ""}>{index + 1}. {label}</li>)}</ol></div>
        {step === 0 && <div><h2 className="text-xl font-bold text-ink">Which best describes you?</h2><p className="mt-2 text-sm leading-6 text-slate-600">We only ask for the details relevant to your employment category.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{(["fresher", "experienced"] as const).map((type) => <button key={type} type="button" onClick={() => update("employmentType", type)} className={`rounded-2xl border-2 p-5 text-left transition ${employmentType === type ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-brand-300"}`}><span className="text-lg font-bold capitalize text-ink">{type}</span><p className="mt-2 text-sm leading-6 text-slate-600">{type === "fresher" ? "I am starting my career or have no prior full-time work experience." : "I have professional work experience to include."}</p></button>)}</div></div>}
        {step === 1 && <div className="space-y-5"><div><h2 className="text-xl font-bold text-ink">Personal details</h2><p className="mt-1 text-sm text-slate-600">We use your contact details only for profile verification and the updates you allow.</p></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" required>{textInput("fullName", { autoComplete: "name", placeholder: "Your full name" })}</Field><Field label="Email address" required>{textInput("email", { type: "email", autoComplete: "email", placeholder: "name@example.com" })}</Field><Field label="Mobile number" required hint="Use country code, e.g. +91.">{textInput("mobile", { type: "tel", autoComplete: "tel" })}</Field><Field label="Current location" required>{textInput("currentLocation", { placeholder: "Hyderabad" })}</Field></div><Field label="Preferred job locations" required hint="Separate locations with commas. Include Remote if appropriate.">{textInput("preferredLocations", { placeholder: "Hyderabad, Bengaluru, Remote" })}</Field></div>}
        {step === 2 && <div className="space-y-5"><div><h2 className="text-xl font-bold text-ink">{isExperienced ? "Professional details" : "Education and skills"}</h2><p className="mt-1 text-sm text-slate-600">Fields marked required are used to assess the eligibility of future opportunities.</p></div>{isFresher && <div className="grid gap-5 sm:grid-cols-2"><Field label="Highest qualification" required>{textInput("highestQualification", { placeholder: "B.Tech Computer Science" })}</Field><Field label="Graduation year" required>{textInput("graduationYear", { type: "number", min: 1950, max: 2034, placeholder: "2026" })}</Field></div>}{isExperienced && <><div className="grid gap-5 sm:grid-cols-2"><Field label="Total work experience (months)" required>{textInput("totalExperienceMonths", { type: "number", min: 0, placeholder: "24" })}</Field><Field label="Current / previous company" required>{textInput("currentCompany", { placeholder: "Company name" })}</Field><Field label="Current / preferred job role" required>{textInput("currentRole", { placeholder: "Frontend Developer" })}</Field><Field label="Employee ID" hint="Optional. Encrypted on the server and visible only to authorized staff.">{textInput("employeeId", { autoComplete: "off" })}</Field><Field label="Current CTC (₹ / year)" required>{textInput("currentCtc", { type: "number", min: 0, placeholder: "650000" })}</Field><Field label="Expected CTC (₹ / year)" required>{textInput("expectedCtc", { type: "number", min: 0, placeholder: "850000" })}</Field><Field label="Notice period (days)" required>{textInput("noticePeriodDays", { type: "number", min: 0, max: 365, placeholder: "30" })}</Field><Field label="Last working day" hint="If applicable.">{textInput("lastWorkingDay", { type: "date" })}</Field></div></>}<Field label="Key skills" required hint="Separate skills with commas.">{textInput("keySkills", { placeholder: "React, TypeScript, Excel" })}</Field><Field label="Preferred job roles" required hint="Separate roles with commas.">{textInput("preferredJobRoles", { placeholder: "Frontend Developer, React Developer" })}</Field>{isFresher && <div className="grid gap-5 sm:grid-cols-2"><Field label="Certifications" hint="Optional.">{textInput("certifications", { placeholder: "AWS Cloud Practitioner" })}</Field><Field label="Projects" hint="Optional.">{textInput("projects", { placeholder: "Campus portal project" })}</Field></div>}</div>}
        {step === 3 && <div><h2 className="text-xl font-bold text-ink">Upload your updated resume</h2><p className="mt-1 text-sm text-slate-600">PDF or DOCX only, up to 10 MB. Your resume is stored in a private bucket and is never published through a public link.</p><label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-brand-500 hover:bg-brand-50"><UploadCloud className="text-brand-600" size={32} /><span className="mt-3 font-bold text-ink">Choose a resume file</span><span className="mt-1 text-sm text-slate-500">PDF or DOCX · Maximum 10 MB</span><input className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => selectResume(event.target.files?.[0])} /></label>{resume && <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><FileText className="shrink-0 text-emerald-700" /><div className="min-w-0"><p className="truncate font-semibold text-emerald-950">{resume.name}</p><p className="text-sm text-emerald-800">{(resume.size / 1024 / 1024).toFixed(2)} MB · ready to upload</p></div><button type="button" onClick={() => setResume(null)} className="ml-auto text-sm font-bold text-emerald-800 underline">Replace</button></div>}</div>}
        {step === 4 && <div className="space-y-5"><div><h2 className="text-xl font-bold text-ink">Review and consent</h2><p className="mt-1 text-sm text-slate-600">Confirm details are accurate. We do not overwrite the information you provide with automated extraction.</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><p className="font-bold text-ink">{profilePreview.name}</p><p className="mt-1 text-slate-600">{employmentType === "experienced" ? "Experienced candidate" : "Fresher"} · {profilePreview.role} · {profilePreview.location}</p><p className="mt-2 text-slate-500">Resume: {resume?.name ?? "Not selected"}</p></div><label className="flex gap-3 rounded-xl border border-slate-200 p-4 text-sm"><input type="checkbox" checked={Boolean(values.privacyConsent)} onChange={(event) => update("privacyConsent", event.target.checked)} /><span><strong className="text-ink">I confirm my details are accurate and accept the privacy notice.</strong><br /><span className="text-slate-600">I consent to BRS processing this profile and resume for recruitment services.</span></span></label><label className="flex gap-3 rounded-xl border border-slate-200 p-4 text-sm"><input type="checkbox" checked={Boolean(values.jobAlertConsent)} onChange={(event) => update("jobAlertConsent", event.target.checked)} /><span><strong className="text-ink">Send job-related updates where permitted.</strong><br /><span className="text-slate-600">You may change notification preferences or opt out later.</span></span></label><p className="flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 shrink-0" size={16} /> This development deployment does not send WhatsApp messages or collect payments.</p></div>}
        {error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5"><Button variant="secondary" onClick={() => { setError(""); setStep((current) => Math.max(current - 1, 0)); }} disabled={step === 0}><ChevronLeft size={17} /> Back</Button>{step < steps.length - 1 ? <Button onClick={next}>Continue <ChevronRight size={17} /></Button> : <Button onClick={submit} disabled={sending}>{sending ? "Saving securely…" : "Submit profile"}</Button>}</div>
      </section>
      <aside className="h-fit rounded-2xl border border-brand-100 bg-brand-50 p-5"><p className="eyebrow">Before you start</p><h2 className="mt-2 font-bold text-ink">What happens next</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><strong>1. Verify ownership.</strong><br />Use a one-time code for email or mobile; no password is created for you.</li><li><strong>2. Check extracted details.</strong><br />You will be able to review differences between your resume and profile.</li><li><strong>3. See verified recommendations.</strong><br />No active suitable vacancy? Your profile remains in the pending queue subject to your consent.</li></ul></aside>
    </div>
  );
}
