// POST /api/edit/upscale
// PRD Reference: Section 4.3 (upscaling), 8.3 (credit deduction)
import { NextRequest } from "next/server";
import { requireAuth, parseBody, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { UpscaleSchema } from "@/utils/validation";
import { deductCredits, refundCredits } from "@/lib/supabase/credits";
import { createUpscale } from "@/lib/replicate/client";
import { createAdminClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);
    const body = await parseBody(req, UpscaleSchema);

    const creditsCost = body.scale === 4 ? CREDIT_COSTS.EDIT_UPSCALE_4X : CREDIT_COSTS.EDIT_UPSCALE_2X;

    const { creditsRemaining } = await deductCredits({
        userId: user.id,
        amount: creditsCost,
        type: "editing",
        description: `Image upscale ${body.scale}x`,
    });

    const admin = createAdminClient();
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
        await refundCredits({ userId: user.id, amount: creditsCost, type: "refund", description: "Job creation failed — refund" });
        throw new ApiError("INTERNAL_ERROR", "Failed to create upscale job");
    }

    try {
        const { predictionId } = await createUpscale(body);
        // @ts-ignore
        await admin.from("generation_jobs").update({ replicate_prediction_id: predictionId, status: "processing" }).eq("id", job.id);
    } catch (err) {
        await refundCredits({
            userId: user.id, amount: creditsCost,
            type: "refund",
            description: "Upscale failed — Replicate API error", referenceId: job.id,
        });
        // @ts-ignore
        await admin.from("generation_jobs").update({ status: "failed", error_message: String(err) }).eq("id", job.id);
        throw new ApiError("GENERATION_FAILED", "Something went wrong. Your credit has been refunded.");
    }

    return apiSuccess({
        jobId: job.id,
        creditsCost,
        creditsRemaining,
        estimatedSeconds: 30,
    });
});
