import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Supabase client — only instantiated when credentials are configured.
 * When absent, the app transparently runs on the built-in local CMS
 * adapter (lib/db.ts) so the project works out of the box.
 * The production schema lives in supabase/schema.sql.
 */
export function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const hasSupabase = () => Boolean(supabase());
