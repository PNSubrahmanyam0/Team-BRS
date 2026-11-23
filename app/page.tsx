import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfiguration } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!hasSupabaseConfiguration()) redirect("/login?error=Supabase%20is%20not%20configured");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? "/dashboard" : "/login");
}
