// ─────────────────────────────────────────────────────────────────
//  Supabase Server Client helpers
//  - createServerClient()  → server component client (anon key + cookies)
//  - createAdminClient()   → service role client (bypasses RLS — SERVER ONLY)
// ─────────────────────────────────────────────────────────────────
import { createServerClient as _createServerClient } from "@supabase/ssr";
import { createClient as _createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Server component / API route client — reads cookies for session */
export async function createServerClient() {
    const cookieStore = await cookies();
    return _createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch { }
            },
        },
    });
}

/**
 * Admin / service-role client — bypasses RLS.
 * ⚠️  SERVER-SIDE ONLY. Never import in client components.
 * Use only in: API routes, webhooks, cron jobs.
 */
export function createAdminClient() {
    if (!SUPABASE_SERVICE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Admin client cannot be created.");
    }
    return _createAdminClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}
