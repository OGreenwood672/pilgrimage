import { createClient } from "@supabase/supabase-js";

/**
 * Creates an elevated Supabase client with the secret key for administrative server tasks.
 * ONLY use in server environments (API routes, server actions).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!supabaseUrl || !secretKey) {
    console.warn(
      "[Supabase Admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in environment.",
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

