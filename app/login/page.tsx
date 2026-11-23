import { signIn } from "./actions";
import Link from "next/link";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="min-h-screen grid place-items-center p-5">
    <section className="panel w-full max-w-md p-8 shadow-sm">
      <div className="mb-8"><div className="text-xs font-bold tracking-[.2em] text-blue-700">BRS CAREER DREAM JOB'S</div><h1 className="mt-2 text-3xl font-bold">Recruiter Portal</h1><p className="muted mt-2 text-sm">Sign in to manage candidates, vacancies and recruitment activity.</p></div>
      {params.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
      <form action={signIn} className="space-y-4">
        <label className="block text-sm font-medium">Email address<input className="field mt-1" name="email" type="email" autoComplete="username" required placeholder="admin@company.com" /></label>
        <label className="block text-sm font-medium">Password<input className="field mt-1" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></label>
        <button className="btn w-full" type="submit">Sign in</button>
      </form>
      <p className="mt-4 text-right text-sm"><Link className="font-semibold text-blue-700 underline" href="/auth/forgot-password">Forgot password?</Link></p>
      <div className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600"><p className="font-semibold text-slate-800">Are you a candidate?</p><p className="mt-1"><Link className="font-semibold text-blue-700 underline" href="/candidate/login">Candidate sign in</Link> or <Link className="font-semibold text-blue-700 underline" href="/register">create your profile</Link>.</p><p className="mt-2"><Link className="font-semibold text-blue-700 underline" href="/preview">View the safe dashboard preview</Link></p></div>
      <p className="muted mt-6 text-xs">Administrator accounts are provisioned securely through Supabase Auth.</p>
    </section>
  </main>;
}
