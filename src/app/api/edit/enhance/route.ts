// POST /api/edit/enhance
// PRD Reference: Section 4.4 (enhancement), 8.3 (credit deduction)
import { NextRequest } from "next/server";
import { requireAuth, parseBody, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { EnhanceSchema } from "@/utils/validation";
import { deductCredits, refundCredits } from "@/lib/supabase/credits";
import { createEnhance } from "@/lib/replicate/client";
import { createAdminClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);
    const body = await parseBody(req, EnhanceSchema);

    const creditsCost = CREDIT_COSTS.EDIT_ENHANCE;

    const { creditsRemaining } = await deductCredits({
        userId: user.id,
        amount: creditsCost,
        type: "editing",
        description: `Image enhancement: ${body.enhancementType}`,
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
        throw new ApiError("INTERNAL_ERROR", "Failed to create enhancement job");
    }

    try {
        const { predictionId } = await createEnhance(body);
        // @ts-ignore
        await admin.from("generation_jobs").update({ replicate_prediction_id: predictionId, status: "processing" }).eq("id", job.id);
    } catch (err) {
        await refundCredits({
            userId: user.id, amount: creditsCost,
            type: "refund",
            description: "Enhancement failed — Replicate API error", referenceId: job.id,
        });
        // @ts-ignore
        await admin.from("generation_jobs").update({ status: "failed", error_message: String(err) }).eq("id", job.id);
        throw new ApiError("GENERATION_FAILED", "Something went wrong. Your credit has been refunded.");
    }

    return apiSuccess({
        jobId: job.id,
        creditsCost,
        creditsRemaining,
        estimatedSeconds: 15,
    });
});
