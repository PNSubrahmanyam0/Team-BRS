import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Public-key client for requesting an OTP. It is deliberately separate from
 * the service-role client: use this only for Auth's normal end-user flows.
 */
export function createOtpClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error("Supabase OTP configuration is missing.");
  }
  return createClient<Database>(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
