// POST /api/gallery/[id]/favorite
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { createAdminClient } from "@/lib/supabase/server";

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireAuth(req);
    const id = params.id;

    const admin = createAdminClient();

    // Get current state
    // @ts-ignore
    const { data: item, error: fetchError } = await (admin
        .from("gallery_items")
        .select("is_favorite, user_id")
        .eq("id", id)
        .single() as any);

    if (fetchError || !item) throw new ApiError("NOT_FOUND", "Item not found");
    if (item.user_id !== user.id) throw new ApiError("UNAUTHORIZED", "Forbidden");

    // @ts-ignore
    const { error: updateError } = await (admin.from("gallery_items") as any)
        .update({ is_favorite: !item.is_favorite })
        .eq("id", id);

    if (updateError) throw new ApiError("INTERNAL_ERROR", "Failed to update favorite");

    return apiSuccess({ isFavorite: !item.is_favorite });
});
