// ─────────────────────────────────────────────────────────────────
//  CreativeAI — Core Types
//  Generated from PRD Section 2.4, 7.1, 8.4, and 6.1 data models.
//  Keep this file in sync with Supabase schema.
// ─────────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────────

export type Plan = "free" | "spark" | "glow" | "pro";

export type GenerationStatus = "pending" | "processing" | "complete" | "failed";

export type MediaType = "image" | "video";

export type GallerySource = "generation" | "editing" | "video" | "template";

export type CreditTransactionType =
  | "generation"
  | "editing"
  | "video"
  | "refund"
  | "monthly_grant"
  | "topup"
  | "rollover";

export type TemplateCategory =
  | "social_post"
  | "thumbnail"
  | "wallpaper"
  | "avatar"
  | "artistic"
  | "seasonal";

export type StylePreset =
  | "photorealistic"
  | "anime"
  | "digital_art"
  | "oil_painting"
  | "cinematic"
  | "watercolor"
  | "pixel_art"
  | "3d_render";

export type AspectRatio = "1:1" | "2:3" | "3:2" | "16:9" | "9:16";

export type EnhancementType = "auto" | "face" | "colorize" | "cartoon" | "deblur";

export type TopupPackage = "sm" | "md" | "lg";

// ── Database row types (mirrors Supabase tables) ──────────────────

export interface DbUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  credits_remaining: number;
  credits_monthly_allowance: number;
  credits_rollover_balance: number;
  billing_cycle_start: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  preferred_style: StylePreset | null;
  onboarding_complete: boolean;
  created_at: string;
  last_seen_at: string;
}

export interface DbGalleryItem {
  id: string;
  user_id: string;
  type: MediaType;
  output_url: string;
  thumbnail_url: string;
  prompt: string;
  negative_prompt: string | null;
  style_preset: StylePreset | null;
  aspect_ratio: AspectRatio | null;
  model_used: string;
  seed: number | null;
  source: GallerySource;
  is_favorite: boolean;
  collection_id: string | null;
  created_at: string;
}

export interface DbCreditTransaction {
  id: string;
  user_id: string;
  amount: number; // negative = deducted, positive = added
  balance_after: number;
  type: CreditTransactionType;
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface DbTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  thumbnail_url: string;
  prompt: string;
  negative_prompt: string | null;
  style_preset: StylePreset;
  aspect_ratio: AspectRatio;
  is_featured: boolean;
  is_free: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface DbGenerationJob {
  id: string;
  user_id: string;
  type: MediaType;
  status: GenerationStatus;
  prompt: string | null;
  style_preset: StylePreset | null;
  aspect_ratio: AspectRatio | null;
  motion_prompt: string | null;
  duration_seconds: number | null;
  credits_cost: number;
  output_url: string | null;
  thumbnail_url: string | null;
  gallery_item_id: string | null;
  error_message: string | null;
  replicate_prediction_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── API Request / Response shapes ─────────────────────────────────

export interface GenerateImageRequest {
  prompt: string;
  style: StylePreset;
  aspectRatio: AspectRatio;
  count: 1 | 2 | 4;
  seed?: number;
  negativePrompt?: string;
  enhancePrompt: boolean;
}

export interface GenerateVideoRequest {
  sourceImageUrl: string;
  motionPrompt: string;
  duration: 3 | 5;
}

export interface GenerationJobResponse {
  jobId: string;
  creditsCost: number;
  creditsRemaining: number;
  estimatedSeconds: number;
}

export interface JobStatusResponse {
  status: GenerationStatus;
  outputUrl?: string;
  thumbnailUrl?: string;
  galleryItemId?: string;
  error?: string;
}

export interface CreditBalanceResponse {
  total: number;
  monthly: number;
  rollover: number;
  topup: number;
}

export interface UploadResponse {
  tempUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

// ── UI State types ─────────────────────────────────────────────────

export interface GenerationState {
  status: "idle" | "submitting" | "queued" | "generating" | "complete" | "error";
  jobId: string | null;
  outputUrl: string | null;
  thumbnailUrl: string | null;
  galleryItemId: string | null;
  errorMessage: string | null;
  queuePosition: number | null;
}

export interface CreditBalance {
  total: number;
  monthly: number;
  rollover: number;
  topup: number;
}

export interface UserSession {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: Plan;
  credits: CreditBalance;
  onboardingComplete: boolean;
}

// ── Constants matching PRD specs ───────────────────────────────────

export const CREDIT_COSTS = {
  IMAGE_SINGLE: 1,
  IMAGE_BATCH_2: 2,
  IMAGE_BATCH_4: 4,
  IMAGE_VARIATIONS: 2,
  EDIT_BG_REMOVE: 2,
  EDIT_BG_REMOVE_WITH_AI: 3,
  EDIT_INPAINT: 3,
  EDIT_UPSCALE_2X: 2,
  EDIT_UPSCALE_4X: 4,
  EDIT_ENHANCE: 1,
  VIDEO_3S: 5,
  VIDEO_5S: 8,
} as const;

export const PLAN_CREDITS: Record<Plan, number | null> = {
  free:  25,
  spark: 150,
  glow:  500,
  pro:   null, // unlimited (null = no limit)
};

export const PLAN_VIDEO_CLIPS: Record<Plan, number | null> = {
  free:  0,
  spark: 10,
  glow:  40,
  pro:   120,
};

export const GALLERY_LIMITS: Record<Plan, number | null> = {
  free:  50,
  spark: 500,
  glow:  2000,
  pro:   null, // unlimited
};

export const COLLECTION_LIMITS: Record<Plan, number | null> = {
  free:  3,
  spark: 10,
  glow:  25,
  pro:   null, // unlimited
};

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "1:1":  { width: 1024, height: 1024 },
  "2:3":  { width: 832,  height: 1216 },
  "3:2":  { width: 1216, height: 832  },
  "16:9": { width: 1344, height: 768  },
  "9:16": { width: 768,  height: 1344 },
};

export const LOW_CREDIT_THRESHOLD = 20;

export const TOPUP_PACKAGES: Record<TopupPackage, { price: number; creditsForFree: number; creditsForPaid: number }> = {
  sm: { price: 2,  creditsForFree: 20,  creditsForPaid: 30  },
  md: { price: 5,  creditsForFree: 60,  creditsForPaid: 80  },
  lg: { price: 10, creditsForFree: 140, creditsForPaid: 180 },
};
