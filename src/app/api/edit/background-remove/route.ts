// POST /api/edit/background-remove
// PRD Reference: Section 4.2 (bg removal), 8.3 (credit deduction)
import { NextRequest } from "next/server";
import { requireAuth, parseBody, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { BgRemoveSchema } from "@/utils/validation";
import { deductCredits } from "@/lib/supabase/credits";
import { createBgRemoval } from "@/lib/replicate/client";
import { createAdminClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);
    const body = await parseBody(req, BgRemoveSchema);

    const creditsCost = CREDIT_COSTS.EDIT_BG_REMOVE;

    const { creditsRemaining } = await deductCredits({
        userId: user.id,
        amount: creditsCost,
        type: "editing",
        description: "Background removal",
    });

    const admin = createAdminClient() as any;
    // @ts-ignore
    const { data: job, error: jobError } = await (admin.from("generation_jobs").insert({
        user_id: user.id,
        type: "image",
        status: "pending",
        credits_cost: creditsCost,
    })
        .select("id")
        .single() as any);

    if (jobError || !job) {
        const { refundCredits } = await import("@/lib/supabase/credits");
        await refundCredits({ userId: user.id, amount: creditsCost, type: "refund", description: "Job creation failed — refund" });
        throw new ApiError("INTERNAL_ERROR", "Failed to create editing job");
    }

    try {
        const { predictionId } = await createBgRemoval(body.imageUrl);
        // @ts-ignore
        await admin.from("generation_jobs").update({ replicate_prediction_id: predictionId, status: "processing" }).eq("id", job.id);
    } catch (err) {
        const { refundCredits } = await import("@/lib/supabase/credits");
        await refundCredits({
            userId: user.id, amount: creditsCost,
            type: "refund",
            description: "Editing failed — Replicate API error", referenceId: job.id,
        });
        // @ts-ignore
        await admin.from("generation_jobs").update({ status: "failed", error_message: String(err) }).eq("id", job.id);
        throw new ApiError("GENERATION_FAILED", "Something went wrong. Your credit has been refunded.");
    }

    return apiSuccess({
        jobId: job.id,
        creditsCost,
        creditsRemaining,
        estimatedSeconds: 10,
    });
});
