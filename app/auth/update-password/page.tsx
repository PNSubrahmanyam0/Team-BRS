"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

type RecoveryState = "checking" | "ready" | "invalid";

export default function UpdatePasswordPage() {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function establishRecoverySession() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (active) setRecoveryState("invalid");
          return;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (active) setRecoveryState(session ? "ready" : "invalid");
    }

    establishRecoverySession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) setRecoveryState("ready");
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 12) {
      setMessage("Use at least 12 characters for the new password.");
      return;
    }
    if (password !== confirmation) {
      setMessage("The password confirmation does not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated. You can now sign in with the new password.");
      setPassword("");
      setConfirmation("");
    } catch {
      setMessage("The recovery link is expired or invalid. Request a new recovery email and try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center p-5"><section className="panel w-full max-w-md p-8 shadow-sm"><div className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700"><KeyRound size={25} /></div><p className="mt-5 text-xs font-bold tracking-[.18em] text-blue-700">ACCOUNT RECOVERY</p><h1 className="mt-2 text-3xl font-bold">Choose a new password</h1>{recoveryState === "checking" ? <p className="muted mt-4 text-sm">Checking your recovery link…</p> : recoveryState === "invalid" ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"><p className="font-semibold">This recovery link is invalid or has expired.</p><p className="mt-1">Request a fresh password-recovery email, then open its newest link in this browser.</p><Link className="mt-3 inline-block font-semibold underline" href="/auth/forgot-password">Request a new link</Link></div> : <><p className="muted mt-2 text-sm leading-6">Use a new password with at least 12 characters. This recovery session can be used once.</p><form className="mt-6 space-y-5" onSubmit={updatePassword}><label className="block text-sm font-medium">New password<input className="field mt-1" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} required /></label><label className="block text-sm font-medium">Confirm new password<input className="field mt-1" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={12} required /></label><Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button></form>{message && <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">{message}</p>}</>}<p className="mt-6 text-sm"><Link className="inline-flex items-center gap-1 font-semibold text-blue-700 underline" href="/login"><ArrowLeft size={15} /> Back to staff sign in</Link></p><p className="mt-5 flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 shrink-0" size={15} /> The password is sent directly to Supabase Auth over its authenticated session. This app never stores it.</p></section></main>;
}
