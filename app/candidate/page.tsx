import { CandidateDashboard } from "@/components/candidate-dashboard";
import { SiteHeader } from "@/components/site-header";

export default function CandidatePage() {
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><CandidateDashboard /></main></>;
}
