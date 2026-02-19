// ─────────────────────────────────────────────────────────────────
//  Supabase Browser Client
//  - createClient() → browser client (anon key)
// ─────────────────────────────────────────────────────────────────
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser / client-side Supabase client (anon key) */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
