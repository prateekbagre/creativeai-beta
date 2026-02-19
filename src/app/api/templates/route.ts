// GET /api/templates
// PRD Reference: Section 6 (Template Library)
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { TemplateQuerySchema } from "@/utils/validation";
import { createAdminClient } from "@/lib/supabase/server";

export const GET = withErrorHandling(async (req: NextRequest) => {
    await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const query = {
        category: searchParams.get("category") || "all",
        search: searchParams.get("search") || "",
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "40"),
    };

    const admin = createAdminClient();
    let dbQuery = admin
        .from("templates")
        .select("*", { count: "exact" });

    if (query.category !== "all") {
        dbQuery = dbQuery.eq("category", query.category);
    }

    if (query.search) {
        dbQuery = dbQuery.ilike("title", `%${query.search}%`);
    }

    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;

    // @ts-ignore
    const { data, error, count } = await (dbQuery
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .range(from, to) as any);

    if (error) {
        console.error(error);
        throw new ApiError("INTERNAL_ERROR", "Failed to catch templates");
    }

    return apiSuccess({
        items: data,
        total: count ?? 0,
        page: query.page,
        hasMore: (count ?? 0) > to + 1,
    });
});
