// GET /api/gallery
// PRD Reference: Section 7 (Personal Gallery)
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "40");
    const isFavorite = searchParams.get("favorites") === "true";

    const admin = createAdminClient();
    // @ts-ignore
    let query = admin.from("gallery_items")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

    if (isFavorite) {
        query = query.eq("is_favorite", true);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await (query
        .order("created_at", { ascending: false })
        .range(from, to) as any);

    if (error) {
        console.error(error);
        throw new ApiError("INTERNAL_ERROR", "Failed to fetch gallery");
    }

    return apiSuccess({
        items: data,
        total: count ?? 0,
        page,
        hasMore: (count ?? 0) > to + 1,
    });
});
