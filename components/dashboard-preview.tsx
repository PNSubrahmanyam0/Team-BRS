"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { CandidateDashboard } from "@/components/candidate-dashboard";
import { demoCandidate } from "@/lib/demo-data";

type View = "admin" | "candidate";

export function DashboardPreview() {
  const [view, setView] = useState<View>("admin");
  const candidate = {
    candidateCode: demoCandidate.candidateCode,
    employmentType: demoCandidate.employmentType,
    fullName: demoCandidate.fullName,
    keySkills: demoCandidate.keySkills,
    preferredJobRoles: demoCandidate.preferredJobRoles,
    preferredLocations: demoCandidate.preferredLocations,
    profileCompletion: demoCandidate.profileCompletion,
    recruitmentStatus: "pending_vacancy_assignment",
    totalExperienceMonths: demoCandidate.totalExperienceMonths,
  };

  return <>
    <section className="mb-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <strong>Safe preview only.</strong> The records shown here are fictional development data. No real candidate, resume, payment, or company data is displayed.
    </section>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button type="button" onClick={() => setView("admin")} className={`rounded-lg px-4 py-2 text-sm font-bold ${view === "admin" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Admin dashboard</button>
        <button type="button" onClick={() => setView("candidate")} className={`rounded-lg px-4 py-2 text-sm font-bold ${view === "candidate" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Candidate dashboard</button>
      </div>
      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <Link className="text-blue-700 underline" href="/login">Admin sign in</Link>
        <Link className="text-blue-700 underline" href="/candidate/login">Candidate sign in</Link>
      </div>
    </div>
    {view === "admin" ? <AdminDashboard /> : <CandidateDashboard candidate={candidate} currentResume={{ filename: "demo-resume.pdf", extractionStatus: "review_pending", uploadedAt: "2026-11-24T09:00:00.000Z" }} applicationCount={1} />}
  </>;
}
