import Link from "next/link";
import { DashboardPreview } from "@/components/dashboard-preview";

export const metadata = { title: "BRS AI Recruiter — Dashboard preview" };

export default function DashboardPreviewPage() {
  return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8"><Link href="/" className="font-black text-slate-950">BRS <span className="text-brand-600">AI Recruiter</span></Link><p className="text-sm text-slate-500">Admin and candidate experience preview</p></div></header><section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8"><p className="eyebrow">Development preview</p><h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Two dashboards. One recruitment workflow.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Admin users manage candidates, companies, vacancies, matching, and recruitment work. Candidates see only their own permitted profile, resume status, applications, and recommendations.</p><div className="mt-9"><DashboardPreview /></div></section></main>;
}
