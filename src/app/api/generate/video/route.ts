// POST /api/generate/video
// PRD Reference: Section 5 (AI Video Clips), 8.3 (credit deduction)
import { NextRequest } from "next/server";
import { requireAuth, parseBody, apiSuccess, ApiError, withErrorHandling, requireVideoPlan } from "@/utils/api";
import { GenerateVideoSchema } from "@/utils/validation";
import { deductCredits, refundCredits } from "@/lib/supabase/credits";
import { createVideoGeneration } from "@/lib/replicate/client";
import { createAdminClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);

    // PRD Section 5.1: Video is only for paid plans
    requireVideoPlan(user.plan);

    const body = await parseBody(req, GenerateVideoSchema);

    const creditsCost = body.duration === 5 ? CREDIT_COSTS.VIDEO_5S : CREDIT_COSTS.VIDEO_3S;

    const { creditsRemaining } = await deductCredits({
        userId: user.id,
        amount: creditsCost,
        type: "video",
        description: `AI Video Generation (${body.duration}s)`,
    });

    const admin = createAdminClient() as any;
    // @ts-ignore
    const { data: job, error: jobError } = await (admin.from("generation_jobs").insert({
        user_id: user.id,
        type: "video",
        status: "pending",
        credits_cost: creditsCost,
        motion_prompt: body.motionPrompt,
        duration_seconds: body.duration,
    })
        .select("id")
        .single() as any);

    if (jobError || !job) {
        await refundCredits({ userId: user.id, amount: creditsCost, type: "refund", description: "Job creation failed — refund" });
        throw new ApiError("INTERNAL_ERROR", "Failed to create video job");
    }

    try {
        const { predictionId } = await createVideoGeneration(body);
        // @ts-ignore
        await admin.from("generation_jobs").update({ replicate_prediction_id: predictionId, status: "processing" }).eq("id", job.id);
    } catch (err) {
        await refundCredits({
            userId: user.id, amount: creditsCost,
            type: "refund",
            description: "Video generation failed — Replicate API error", referenceId: job.id,
        });
        // @ts-ignore
        await admin.from("generation_jobs").update({ status: "failed", error_message: String(err) }).eq("id", job.id);
        throw new ApiError("GENERATION_FAILED", "Something went wrong. Your credit has been refunded.");
    }

    return apiSuccess({
        jobId: job.id,
        creditsCost,
        creditsRemaining,
        estimatedSeconds: body.duration === 5 ? 60 : 40,
    });
});
