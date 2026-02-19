// POST /api/edit/inpaint
// PRD Reference: Section 4.1 (inpainting), 8.3 (credit deduction)
import { NextRequest } from "next/server";
import { requireAuth, parseBody, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { InpaintSchema } from "@/utils/validation";
import { deductCredits, refundCredits } from "@/lib/supabase/credits";
import { createInpaint } from "@/lib/replicate/client";
import { createAdminClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);
    const body = await parseBody(req, InpaintSchema);

    const creditsCost = CREDIT_COSTS.EDIT_INPAINT;

    const { creditsRemaining } = await deductCredits({
        userId: user.id,
        amount: creditsCost,
        type: "editing",
        description: "Image inpainting",
    });

    const admin = createAdminClient();
    // @ts-ignore
    const { data: job, error: jobError } = await (admin.from("generation_jobs").insert({
        user_id: user.id,
        type: "image",
        status: "pending",
        credits_cost: creditsCost,
        prompt: body.prompt,
    })
        .select("id")
        .single() as any);

    if (jobError || !job) {
        await refundCredits({ userId: user.id, amount: creditsCost, type: "refund", description: "Job creation failed — refund" });
        throw new ApiError("INTERNAL_ERROR", "Failed to create inpainting job");
    }

    try {
        const { predictionId } = await createInpaint(body);
        // @ts-ignore
        await admin.from("generation_jobs").update({ replicate_prediction_id: predictionId, status: "processing" }).eq("id", job.id);
    } catch (err) {
        await refundCredits({
            userId: user.id, amount: creditsCost,
            type: "refund",
            description: "Inpainting failed — Replicate API error", referenceId: job.id,
        });
        // @ts-ignore
        await admin.from("generation_jobs").update({ status: "failed", error_message: String(err) }).eq("id", job.id);
        throw new ApiError("GENERATION_FAILED", "Something went wrong. Your credit has been refunded.");
    }

    return apiSuccess({
        jobId: job.id,
        creditsCost,
        creditsRemaining,
        estimatedSeconds: 20,
    });
});
