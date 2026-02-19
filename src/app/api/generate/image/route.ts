// POST /api/generate/image
// PRD Reference: Section 11.2, 3.6 (generation states), 8.3 (credit deduction)
import { NextRequest } from "next/server";
import { requireAuth, parseBody, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { GenerateImageSchema } from "@/utils/validation";
import { deductCredits } from "@/lib/supabase/credits";
import { createImageGeneration } from "@/lib/replicate/client";
import { moderatePrompt, quickScreenPrompt } from "@/lib/moderation/screen";
import { createAdminClient } from "@/lib/supabase/server";
import { CREDIT_COSTS } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
  // 1. Authenticate
  const user = await requireAuth(req);

  // 2. Validate request body
  const body = await parseBody(req, GenerateImageSchema);

  // 3. Calculate credit cost
  const creditCostMap: Record<number, number> = { 1: CREDIT_COSTS.IMAGE_SINGLE, 2: CREDIT_COSTS.IMAGE_BATCH_2, 4: CREDIT_COSTS.IMAGE_BATCH_4 };
  const creditsCost = creditCostMap[body.count as 1 | 2 | 4] || CREDIT_COSTS.IMAGE_SINGLE;

  // 4. Moderate prompt — quick screen first (no API call)
  if (quickScreenPrompt(body.prompt)) {
    // Deduct 1 credit for blocked content (PRD Section 8.7)
    await deductCredits({
      userId: user.id,
      amount: 1,
      type: "generation",
      description: "Content policy violation — prompt blocked",
    });
    throw new ApiError("CONTENT_POLICY_VIOLATION", "Your prompt was flagged by our content filter. 1 credit has been used. Please revise your prompt.");
  }

  // 5. Full moderation API check
  const modResult = await moderatePrompt(body.prompt);
  if (modResult.flagged) {
    await deductCredits({
      userId: user.id,
      amount: 1,
      type: "generation",
      description: `Content policy violation — categories: ${modResult.categories.join(", ")}`,
    });
    throw new ApiError("CONTENT_POLICY_VIOLATION", "Your prompt was flagged by our content filter. 1 credit has been used. Please revise your prompt.");
  }

  // 6. Deduct credits (optimistic — before generation starts)
  const { creditsRemaining } = await deductCredits({
    userId: user.id,
    amount: creditsCost,
    type: "generation",
    description: `AI image generation — ${body.style}, ${body.aspectRatio}, count: ${body.count}`,
  });

  // 7. Create generation job record
  const admin = createAdminClient() as any;
  // @ts-ignore
  const { data: job, error: jobError } = await (admin.from("generation_jobs").insert({
    user_id: user.id,
    type: "image",
    status: "pending",
    prompt: body.prompt,
    style_preset: body.style,
    aspect_ratio: body.aspectRatio,
    credits_cost: creditsCost,
  })
    .select("id")
    .single() as any);

  if (jobError || !job) {
    // Refund if job creation fails
    const { refundCredits } = await import("@/lib/supabase/credits");
    await refundCredits({ userId: user.id, amount: creditsCost, type: "refund", description: "Job creation failed — refund" });
    throw new ApiError("INTERNAL_ERROR", "Failed to create generation job");
  }

  // 8. Trigger async Replicate prediction
  try {
    const { predictionId } = await createImageGeneration({
      prompt: body.prompt,
      style: body.style,
      aspectRatio: body.aspectRatio,
      count: body.count,
      seed: body.seed,
      negativePrompt: body.negativePrompt,
      enhancePrompt: body.enhancePrompt,
    });

    // Update job with Replicate prediction ID
    // @ts-ignore
    await admin.from("generation_jobs").update({ replicate_prediction_id: predictionId, status: "processing" }).eq("id", job.id);

  } catch (err) {
    // Replicate API failed — refund credits, mark job as failed
    const { refundCredits } = await import("@/lib/supabase/credits");
    await refundCredits({
      userId: user.id, amount: creditsCost,
      type: "refund",
      description: "Generation failed — Replicate API error", referenceId: job.id,
    });
    // @ts-ignore
    await admin.from("generation_jobs").update({ status: "failed", error_message: String(err) }).eq("id", job.id);
    throw new ApiError("GENERATION_FAILED", "Something went wrong. Your credit has been refunded. Please try again.");
  }

  // 9. Return job ID for frontend to subscribe to via Realtime
  return apiSuccess({
    jobId: job.id,
    creditsCost,
    creditsRemaining,
    estimatedSeconds: 15, // P50 estimate
  });
});
