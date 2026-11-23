import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Links an OTP-verified Auth user to its previously registered BRS candidate. */
export async function POST() {
  try {
    const sessionClient = await createClient();
    const { data: auth, error: authError } = await sessionClient.auth.getUser();
    if (authError || !auth.user) return NextResponse.json({ error: "A verified session is required." }, { status: 401 });

    const admin = createAdminClient();
    const { data: candidate, error: candidateError } = await admin
      .from("candidates")
      .select("id, candidate_code, organization_id, full_name, email, mobile, user_id")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (candidateError) throw candidateError;
    if (!candidate) return NextResponse.json({ error: "No candidate profile is linked to this verified account." }, { status: 404 });

    return NextResponse.json({ candidateId: candidate.id, candidateCode: candidate.candidate_code, next: "/candidate" });
  } catch (error) {
    console.error("Candidate account claim failed", error);
    return NextResponse.json({ error: "We could not open your profile. Please try again." }, { status: 500 });
  }
}
