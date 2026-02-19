// ─────────────────────────────────────────────────────────────────
//  API Route Helpers
//  Shared utilities for every API route:
//  - requireAuth()    → validates JWT, returns user
//  - apiError()       → standardised error response
//  - apiSuccess()     → standardised success response
//  - parseBody()      → validates request body against Zod schema
//  PRD Reference: Section 11.8 (error codes), Section 12.3 (security)
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import type { ZodSchema } from "zod";
import type { Plan } from "@/types";

// ── Standard error codes from PRD Section 11.8 ────────────────────
export const ERROR_CODES = {
  INSUFFICIENT_CREDITS: { code: "INSUFFICIENT_CREDITS", status: 402 },
  PLAN_NOT_SUPPORTED: { code: "PLAN_NOT_SUPPORTED", status: 403 },
  UNAUTHORIZED: { code: "UNAUTHORIZED", status: 401 },
  NOT_FOUND: { code: "NOT_FOUND", status: 404 },
  CONTENT_POLICY_VIOLATION: { code: "CONTENT_POLICY_VIOLATION", status: 422 },
  GENERATION_TIMEOUT: { code: "GENERATION_TIMEOUT", status: 504 },
  GENERATION_FAILED: { code: "GENERATION_FAILED", status: 500 },
  UPLOAD_TOO_LARGE: { code: "UPLOAD_TOO_LARGE", status: 413 },
  UPLOAD_INVALID_FORMAT: { code: "UPLOAD_INVALID_FORMAT", status: 415 },
  GALLERY_FULL: { code: "GALLERY_FULL", status: 507 },
  RATE_LIMIT_EXCEEDED: { code: "RATE_LIMIT_EXCEEDED", status: 429 },
  INVALID_INPUT: { code: "INVALID_INPUT", status: 400 },
  INTERNAL_ERROR: { code: "INTERNAL_ERROR", status: 500 },
} as const;

export interface AuthenticatedUser {
  id: string;
  email: string;
  plan: Plan;
  creditsRemaining: number;
  stripeCustomerId: string | null;
}

/** Validates the request JWT and returns the authenticated user. Throws on failure. */
export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError("UNAUTHORIZED", "Authentication required");
  }

  const admin = createAdminClient();
  // @ts-ignore
  const { data: profile } = await (admin
    .from("users") as any)
    .select("plan, credits_remaining, stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw new ApiError("UNAUTHORIZED", "User profile not found");
  }

  return {
    id: user.id,
    email: profile.email ?? user.email ?? "",
    plan: profile.plan as Plan,
    creditsRemaining: profile.credits_remaining,
    stripeCustomerId: profile.stripe_customer_id,
  };
}

/** Validates a request body against a Zod schema. Throws on validation failure. */
export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError("INVALID_INPUT", "Request body must be valid JSON");
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new ApiError("INVALID_INPUT", `${firstError.path.join(".")}: ${firstError.message}`);
  }
  return result.data;
}

/** Standardised success response. */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Custom API error class. */
export class ApiError extends Error {
  public readonly code: keyof typeof ERROR_CODES;
  public readonly httpStatus: number;

  constructor(code: keyof typeof ERROR_CODES, message: string) {
    super(message);
    this.code = code;
    this.httpStatus = ERROR_CODES[code].status;
  }
}

/**
 * Wraps an API route handler with error handling.
 * Usage: export const POST = withErrorHandling(async (req) => { ... })
 */
export function withErrorHandling(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.code, message: err.message },
          { status: err.httpStatus }
        );
      }

      // Unexpected error — log and return 500
      console.error("[API Error]", err);
      return NextResponse.json(
        { error: "INTERNAL_ERROR", message: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  };
}

/** PRD Section 5.1 — checks if a plan supports video generation. */
export function requireVideoPlan(plan: Plan): void {
  if (plan === "free") {
    throw new ApiError("PLAN_NOT_SUPPORTED", "Video creation requires a paid plan. Upgrade to Spark or above.");
  }
}
