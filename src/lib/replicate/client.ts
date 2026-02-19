// ─────────────────────────────────────────────────────────────────
//  Replicate API Wrapper
//  Handles image and video generation with automatic fallback.
//  PRD Reference: Sections 3, 5, 10
// ─────────────────────────────────────────────────────────────────
import Replicate from "replicate";
import type { StylePreset, AspectRatio } from "@/types";
import { ASPECT_RATIO_DIMENSIONS } from "@/types";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// ── Model IDs (update as new versions release) ────────────────────
const MODELS = {
  // Primary image model
  FLUX_DEV: "black-forest-labs/flux-dev",
  FLUX_SCHNELL: "black-forest-labs/flux-schnell", // faster, lower quality
  SDXL: "stability-ai/sdxl:39ed52f2319f9de471f4f1f9e",

  // Editing models
  BG_REMOVE: "lucataco/remove-bg:95fcc2a26d3899cd6c2691723",
  INPAINT_FLUX: "black-forest-labs/flux-fill-pro",
  UPSCALE: "nightmareai/real-esrgan:42fed1c4974146d4d2414e234",
  FACE_RESTORE: "tencentarc/gfpgan:9283608cc6b7be6b65a8e44983",
  COLORIZE: "arielreplicate/deoldify_image:0da600fab0c4",

  // Video models
  SVD: "stability-ai/stable-video-diffusion:3f0457e4619d",
} as const;

// ── Style preset → model config mapping (PRD Section 3.3) ────────
const STYLE_CONFIGS: Record<StylePreset, {
  model: string;
  guidance: number;
  promptSuffix: string;
  negativeDefault: string;
}> = {
  photorealistic: {
    model: MODELS.FLUX_DEV,
    guidance: 7,
    promptSuffix: "photorealistic, DSLR, sharp focus, highly detailed, 8k",
    negativeDefault: "painting, illustration, drawing, blurry, watermark",
  },
  anime: {
    model: MODELS.FLUX_DEV,
    guidance: 8,
    promptSuffix: "anime style, cel shaded, vibrant colors, Studio Ghibli quality",
    negativeDefault: "realistic, photo, 3d render, blurry",
  },
  digital_art: {
    model: MODELS.FLUX_DEV,
    guidance: 7.5,
    promptSuffix: "digital art, concept art, highly detailed, trending on ArtStation",
    negativeDefault: "photo, realistic, blurry, ugly",
  },
  oil_painting: {
    model: MODELS.SDXL,
    guidance: 8,
    promptSuffix: "oil painting, canvas texture, impasto, masterpiece, brush strokes",
    negativeDefault: "digital, photo, 3d, blurry",
  },
  cinematic: {
    model: MODELS.FLUX_DEV,
    guidance: 7,
    promptSuffix: "cinematic, film grain, anamorphic lens, movie still, dramatic lighting",
    negativeDefault: "illustration, anime, blurry, oversaturated",
  },
  watercolor: {
    model: MODELS.SDXL,
    guidance: 6.5,
    promptSuffix: "watercolor painting, soft edges, wet on wet technique, delicate washes",
    negativeDefault: "digital, photo, sharp, 3d, blurry",
  },
  pixel_art: {
    model: MODELS.SDXL,
    guidance: 9,
    promptSuffix: "pixel art, 16-bit, retro game sprite, clean pixels",
    negativeDefault: "realistic, blurry, photo, smooth",
  },
  "3d_render": {
    model: MODELS.FLUX_DEV,
    guidance: 7,
    promptSuffix: "octane render, 3D CGI, physically based rendering, high poly",
    negativeDefault: "painting, 2d, flat, blurry, photo",
  },
};

// ── Prompt enhancement suffix (PRD Section 3.2) ───────────────────
const ENHANCE_SUFFIX = ", highly detailed, sharp focus, professional quality, award winning";

// ─────────────────────────────────────────────────────────────────
//  Image Generation
// ─────────────────────────────────────────────────────────────────
export interface ImageGenerationParams {
  prompt: string;
  style: StylePreset;
  aspectRatio: AspectRatio;
  count?: 1 | 2 | 4;
  seed?: number;
  negativePrompt?: string;
  enhancePrompt?: boolean;
}

export interface GenerationResult {
  predictionId: string;
  status: "starting" | "processing";
}

export async function createImageGeneration(
  params: ImageGenerationParams
): Promise<GenerationResult> {
  const config = STYLE_CONFIGS[params.style];
  const dims = ASPECT_RATIO_DIMENSIONS[params.aspectRatio];

  let finalPrompt = params.prompt;
  if (params.enhancePrompt !== false) {
    finalPrompt += ENHANCE_SUFFIX;
  }
  finalPrompt += ", " + config.promptSuffix;

  const negativePrompt = params.negativePrompt
    ? `${params.negativePrompt}, ${config.negativeDefault}`
    : config.negativeDefault;

  const prediction = await replicate.predictions.create({
    model: config.model,
    input: {
      prompt: finalPrompt,
      negative_prompt: negativePrompt,
      width: dims.width,
      height: dims.height,
      guidance_scale: config.guidance,
      num_outputs: params.count ?? 1,
      ...(params.seed ? { seed: params.seed } : {}),
    },
    // Webhook for async completion notification
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
    webhook_events_filter: ["completed"],
  });

  return {
    predictionId: prediction.id,
    status: prediction.status as "starting" | "processing",
  };
}

/** Polls a prediction until complete. Used as fallback if webhooks fail. */
export async function pollPrediction(predictionId: string) {
  const prediction = await replicate.predictions.get(predictionId);
  return {
    status: prediction.status,
    outputUrls: prediction.output as string[] | null,
    error: prediction.error,
  };
}

// ─────────────────────────────────────────────────────────────────
//  Video Generation
// ─────────────────────────────────────────────────────────────────
export async function createVideoGeneration(params: {
  sourceImageUrl: string;
  motionPrompt: string;
  duration: 3 | 5;
}): Promise<GenerationResult> {
  // SVD generates clips based on an input image + motion guidance
  const numFrames = params.duration === 3 ? 14 : 25; // ~24fps

  const prediction = await replicate.predictions.create({
    model: MODELS.SVD,
    input: {
      input_image: params.sourceImageUrl,
      video_length: numFrames,
      sizing_strategy: "maintain_aspect_ratio",
      frames_per_second: 8,
      motion_bucket_id: getMotionBucketId(params.motionPrompt),
      cond_aug: 0.02,
    },
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
    webhook_events_filter: ["completed"],
  });

  return {
    predictionId: prediction.id,
    status: prediction.status as "starting" | "processing",
  };
}

/**
 * Maps a motion preset description to SVD's motion_bucket_id (0–255).
 * Higher = more motion.
 */
function getMotionBucketId(motionPrompt: string): number {
  const prompt = motionPrompt.toLowerCase();
  if (prompt.includes("shake")) return 200;
  if (prompt.includes("zoom in")) return 100;
  if (prompt.includes("zoom out")) return 110;
  if (prompt.includes("pan")) return 90;
  if (prompt.includes("float")) return 60;
  if (prompt.includes("breathe")) return 30;
  if (prompt.includes("fire")) return 180;
  return 80; // default — gentle movement
}

// ─────────────────────────────────────────────────────────────────
//  Background Removal
// ─────────────────────────────────────────────────────────────────
export async function createBgRemoval(imageUrl: string): Promise<GenerationResult> {
  const prediction = await replicate.predictions.create({
    model: MODELS.BG_REMOVE,
    input: { image: imageUrl },
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
    webhook_events_filter: ["completed"],
  });
  return { predictionId: prediction.id, status: "processing" };
}

// ─────────────────────────────────────────────────────────────────
//  Inpainting
// ─────────────────────────────────────────────────────────────────
export async function createInpaint(params: {
  imageUrl: string;
  maskUrl: string;
  prompt: string;
}): Promise<GenerationResult> {
  const prediction = await replicate.predictions.create({
    model: MODELS.INPAINT_FLUX,
    input: {
      image: params.imageUrl,
      mask: params.maskUrl,
      prompt: params.prompt,
      strength: 0.85,
    },
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
    webhook_events_filter: ["completed"],
  });
  return { predictionId: prediction.id, status: "processing" };
}

// ─────────────────────────────────────────────────────────────────
//  Upscaling
// ─────────────────────────────────────────────────────────────────
export async function createUpscale(params: {
  imageUrl: string;
  scale: 2 | 4;
}): Promise<GenerationResult> {
  const prediction = await replicate.predictions.create({
    model: MODELS.UPSCALE,
    input: {
      image: params.imageUrl,
      scale: params.scale,
      face_enhance: false,
    },
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
    webhook_events_filter: ["completed"],
  });
  return { predictionId: prediction.id, status: "processing" };
}
// ─────────────────────────────────────────────────────────────────
//  Enhancement
// ─────────────────────────────────────────────────────────────────
export async function createEnhance(params: {
  imageUrl: string;
  enhancementType: "auto" | "face" | "colorize" | "cartoon" | "deblur";
}): Promise<GenerationResult> {
  let model: string = MODELS.FACE_RESTORE;
  let input: any = { image: params.imageUrl };

  if (params.enhancementType === "colorize") {
    model = MODELS.COLORIZE;
    input = { image_url: params.imageUrl };
  } else if (params.enhancementType === "face") {
    model = MODELS.FACE_RESTORE;
    input = { img: params.imageUrl, upscale: 1 };
  }

  const prediction = await replicate.predictions.create({
    model,
    input,
    webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
    webhook_events_filter: ["completed"],
  });

  return { predictionId: prediction.id, status: "processing" };
}
