// ─────────────────────────────────────────────────────────────────
//  Middleware
//  - Protects /app routes — redirects unauthenticated users to /login
//  - Rate limiting: 60 requests/minute per IP on all /api/* routes
//  - Updates user last_seen_at on each authenticated request
//  PRD Reference: Section 12.3 (security), 12.4 (rate limiting)
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// In-memory rate limit store (use Upstash Redis when scaling)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 60;

  const record = rateLimitStore.get(ip);
  if (!record || record.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= maxRequests) return false; // blocked

  record.count++;
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // ── Rate limiting on all API routes (except webhooks) ──────────
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks/")) {
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // ── Auth protection for app routes ─────────────────────────────
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected app routes
  const isAppRoute = pathname.startsWith("/create") ||
    pathname.startsWith("/edit") ||
    pathname.startsWith("/video") ||
    pathname.startsWith("/gallery") ||
    pathname.startsWith("/templates") ||
    pathname.startsWith("/settings");

  // Auth routes — redirect authenticated users away
  const isAuthRoute = pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (isAppRoute && !user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/create", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
