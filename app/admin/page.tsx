import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8"><p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Development preview only. This route must be protected by authenticated owner/admin/recruiter role checks before deployment.</p><AdminDashboard /></main>;
}
