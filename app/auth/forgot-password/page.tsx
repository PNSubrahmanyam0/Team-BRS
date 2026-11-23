"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      // Deliberately do not disclose whether this email belongs to a BRS user.
      setMessage("If that email has a BRS account, a password-recovery link has been sent. Check your inbox and spam folder.");
    } catch {
      setMessage("We could not request a recovery email. Check the address and try again later.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center p-5"><section className="panel w-full max-w-md p-8 shadow-sm"><div className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheck size={25} /></div><p className="mt-5 text-xs font-bold tracking-[.18em] text-blue-700">ACCOUNT RECOVERY</p><h1 className="mt-2 text-3xl font-bold">Reset your password</h1><p className="muted mt-2 text-sm leading-6">Enter your staff email address. If it is registered, Supabase will send a one-time recovery link.</p><form className="mt-6 space-y-5" onSubmit={requestReset}><label className="block text-sm font-medium">Email address<div className="relative mt-1"><Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="field pl-9" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="admin@company.com" /></div></label><Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send password recovery link"}</Button></form>{message && <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">{message}</p>}<p className="mt-6 text-sm"><Link className="inline-flex items-center gap-1 font-semibold text-blue-700 underline" href="/login"><ArrowLeft size={15} /> Back to staff sign in</Link></p></section></main>;
}
