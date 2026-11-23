"use client";

import { useState } from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

export function OtpLogin() {
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"request" | "verify">("request");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contact }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "We could not send a verification code.");
      setPhase("verify");
      setMessage(body.message || "If that email is registered, a verification code will arrive shortly.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not send a code. Check the configuration and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({ email: contact, token: code, type: "email" });
      if (error) throw error;
      const claim = await fetch("/api/auth/claim", { method: "POST" });
      const body = await claim.json();
      if (!claim.ok) throw new Error(body.error || "We could not open your profile.");
      window.location.assign(body.next || "/candidate");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not verify that code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <section className="panel mx-auto max-w-md"><div className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700"><ShieldCheck size={25} /></div><p className="eyebrow mt-5">Secure sign-in</p><h1 className="mt-1 text-2xl font-black text-ink">Access your profile</h1><p className="mt-2 text-sm leading-6 text-slate-600">Enter the email registered with BRS. We verify ownership with a one-time code; an email address alone is never accepted as proof of identity.</p>{phase === "request" ? <form className="mt-6 space-y-5" onSubmit={requestCode}><label className="block"><span className="field-label">Registered email address</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input required type="email" autoComplete="email" value={contact} onChange={(event) => setContact(event.target.value)} className="block w-full pl-9" placeholder="name@example.com" /></div></label><Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send verification code"} <ArrowRight size={16} /></Button></form> : <form className="mt-6 space-y-5" onSubmit={verifyCode}><div className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-900">Code sent to <strong>{contact}</strong>. Check your inbox and enter the code here.</div><label className="block"><span className="field-label">One-time verification code</span><input required inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, ""))} className="block w-full text-center text-lg tracking-[0.4em]" placeholder="123456" maxLength={8} /></label><Button type="submit" className="w-full" disabled={loading}>{loading ? "Verifying…" : "Verify and open profile"} <ArrowRight size={16} /></Button><button type="button" onClick={() => { setPhase("request"); setCode(""); setMessage(""); }} className="w-full text-sm font-bold text-brand-700 underline">Use a different email</button></form>}{message && <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}<p className="mt-5 text-xs leading-5 text-slate-500">Email OTP is feature-flagged until Supabase Auth, CAPTCHA, a transactional email provider, rate limiting, and redirect settings have been tested. Mobile OTP will be added only after an approved SMS provider is configured.</p></section>;
}
