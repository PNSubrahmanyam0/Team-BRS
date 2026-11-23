import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOtpClient } from "@/lib/supabase/otp";

const requestSchema = z.object({ email: z.string().trim().email().max(254) });
const genericReply = { message: "If that email is registered, a verification code will arrive shortly." };

/**
 * Creates the corresponding Auth account only for a previously registered
 * candidate, then asks Supabase Auth to send an email OTP. This response never
 * discloses whether an address has a BRS profile.
 *
 * This endpoint is feature-flagged: CAPTCHA and durable edge rate limiting are
 * deployment controls, not something a per-instance in-memory limiter can
 * safely substitute for.
 */
export async function POST(request: Request) {
  if (process.env.AUTH_OTP_ENABLED !== "true") {
    return NextResponse.json({ error: "OTP sign-in is not enabled in this environment yet." }, { status: 503 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid registered email address." }, { status: 422 });
  const email = parsed.data.email.toLocaleLowerCase();

  try {
    const admin = createAdminClient();
    const { data: candidate, error: candidateError } = await admin
      .from("candidates")
      .select("id, user_id, organization_id, full_name, email, mobile")
      .ilike("email", email)
      .maybeSingle();
    if (candidateError) throw candidateError;

    if (!candidate) return NextResponse.json(genericReply, { status: 202 });

    if (!candidate.user_id) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: candidate.email,
        email_confirm: false,
        user_metadata: { full_name: candidate.full_name },
      });
      if (createError) {
        // Do not expose an auth-account collision or other internal detail to
        // the requester. Staff can resolve an unlinked profile in the admin UI.
        console.error("Candidate OTP account creation failed", createError);
        return NextResponse.json(genericReply, { status: 202 });
      }
      const userId = created.user.id;
      const { error: linkError } = await admin.from("candidates").update({ user_id: userId }).eq("id", candidate.id).is("user_id", null);
      if (linkError) throw linkError;
      const { error: profileError } = await admin.from("profiles").upsert({
        id: userId,
        organization_id: candidate.organization_id,
        full_name: candidate.full_name,
        email: candidate.email,
        mobile: candidate.mobile,
        role: "candidate",
        status: "active",
      });
      if (profileError) throw profileError;
    }

    const otp = createOtpClient();
    const { error: otpError } = await otp.auth.signInWithOtp({
      email: candidate.email,
      options: { shouldCreateUser: false },
    });
    if (otpError) throw otpError;
    return NextResponse.json(genericReply, { status: 202 });
  } catch (error) {
    console.error("Candidate OTP request failed", error);
    // Maintain anti-enumeration behavior for ordinary failures. Monitoring has
    // the server-side error; users receive a safe retry response.
    return NextResponse.json(genericReply, { status: 202 });
  }
}
