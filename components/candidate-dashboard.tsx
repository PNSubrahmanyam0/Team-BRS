import { BriefcaseBusiness, CircleCheck, FileText, MapPin, UserRound } from "lucide-react";

type CandidateDashboardProps = {
  candidate: {
    candidateCode: string;
    employmentType: string;
    fullName: string;
    keySkills: string[];
    preferredJobRoles: string[];
    preferredLocations: string[];
    profileCompletion: number;
    recruitmentStatus: string;
    totalExperienceMonths: number | null;
  };
  currentResume: {
    extractionStatus: string;
    filename: string;
    uploadedAt: string;
  } | null;
  applicationCount: number;
};

const displayStatus = (status: string) => status.replaceAll("_", " ");

export function CandidateDashboard({ candidate, currentResume, applicationCount }: CandidateDashboardProps) {
  const experience = candidate.totalExperienceMonths
    ? `${Math.floor(candidate.totalExperienceMonths / 12)}y ${candidate.totalExperienceMonths % 12}m`
    : candidate.employmentType === "fresher"
      ? "Fresher"
      : "Needs review";

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white shadow-card">
        <p className="text-sm font-semibold text-brand-100">Candidate dashboard</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black">Welcome, {candidate.fullName}</h1>
            <p className="mt-2 text-brand-100">{candidate.candidateCode} · Your profile is {candidate.profileCompletion}% complete.</p>
          </div>
          <span className="inline-flex w-fit items-center rounded-xl bg-white/15 px-4 py-2 text-sm font-bold capitalize">{displayStatus(candidate.recruitmentStatus)}</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<CircleCheck />} label="Profile status" value={`${candidate.profileCompletion}% complete`} note="Keep your details accurate" />
        <Stat icon={<BriefcaseBusiness />} label="Applications" value={String(applicationCount)} note="Verified roles only" />
        <Stat icon={<UserRound />} label="Experience" value={experience} note="Based on your profile" />
        <Stat icon={<FileText />} label="Resume" value={currentResume ? "On file" : "Needs upload"} note={currentResume ? displayStatus(currentResume.extractionStatus) : "Contact BRS for assistance"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <article className="panel p-5">
          <p className="eyebrow">Profile summary</p>
          <h2 className="mt-1 text-xl font-black text-ink">Your preferences</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm font-semibold text-slate-500">Preferred roles</dt><dd className="mt-2 font-medium text-slate-800">{candidate.preferredJobRoles.length ? candidate.preferredJobRoles.join(", ") : "Not set"}</dd></div>
            <div><dt className="text-sm font-semibold text-slate-500">Preferred locations</dt><dd className="mt-2 flex flex-wrap gap-2">{candidate.preferredLocations.length ? candidate.preferredLocations.map((location) => <span key={location} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700"><MapPin size={13} />{location}</span>) : "Not set"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-sm font-semibold text-slate-500">Skills</dt><dd className="mt-2 flex flex-wrap gap-2">{candidate.keySkills.length ? candidate.keySkills.map((skill) => <span key={skill} className="rounded-full bg-brand-50 px-2.5 py-1 text-sm font-medium text-brand-700">{skill}</span>) : "Not set"}</dd></div>
          </dl>
        </article>

        <aside className="panel p-5">
          <p className="eyebrow">Current resume</p>
          <h2 className="mt-1 text-xl font-black text-ink">Document status</h2>
          {currentResume ? <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="truncate font-bold text-slate-800">{currentResume.filename}</p><p className="mt-2 text-sm text-slate-600">Uploaded {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(currentResume.uploadedAt))}</p><p className="mt-1 text-sm capitalize text-slate-600">Review status: {displayStatus(currentResume.extractionStatus)}</p></div> : <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">There is no current resume on file. Resume replacement will be available after the candidate self-service workflow is approved.</p>}
          <p className="mt-5 text-xs leading-5 text-slate-500">For privacy, BRS never shows a public resume URL. Authorized access uses short-lived links only.</p>
        </aside>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <article className="panel p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{label}</p><span className="text-brand-600">{icon}</span></div><p className="mt-3 text-xl font-black text-ink">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></article>;
}
