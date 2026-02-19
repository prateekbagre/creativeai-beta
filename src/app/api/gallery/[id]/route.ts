// DELETE /api/gallery/[id]
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { createAdminClient } from "@/lib/supabase/server";

export const DELETE = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await requireAuth(req);
    const id = params.id;

    const admin = createAdminClient();

    // Verify ownership
    // @ts-ignore
    const { data: item, error: fetchError } = await (admin
        .from("gallery_items")
        .select("user_id")
        .eq("id", id)
        .single() as any);

    if (fetchError || !item) throw new ApiError("NOT_FOUND", "Item not found");
    if (item.user_id !== user.id) throw new ApiError("UNAUTHORIZED", "Forbidden");

    // @ts-ignore
    const { error: deleteError } = await (admin.from("gallery_items") as any)
        .delete()
        .eq("id", id);

    if (deleteError) throw new ApiError("INTERNAL_ERROR", "Failed to delete item");

    return apiSuccess({ deleted: true });
});
