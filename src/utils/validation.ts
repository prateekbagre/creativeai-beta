// ─────────────────────────────────────────────────────────────────
//  API Validation Schemas (Zod)
//  All API route inputs validated against these schemas.
//  PRD Reference: Section 12.3 — all inputs validated with Zod.
// ─────────────────────────────────────────────────────────────────
import { z } from "zod";

// ── Shared enums ──────────────────────────────────────────────────
const StylePresetEnum = z.enum([
  "photorealistic", "anime", "digital_art", "oil_painting",
  "cinematic", "watercolor", "pixel_art", "3d_render",
]);

const AspectRatioEnum = z.enum(["1:1", "2:3", "3:2", "16:9", "9:16"]);

// ── Image Generation ─────────────────────────────────────────────
export const GenerateImageSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters")
    .max(500, "Prompt cannot exceed 500 characters")
    .trim(),
  style: StylePresetEnum,
  aspectRatio: AspectRatioEnum,
  count: z.union([z.literal(1), z.literal(2), z.literal(4)]).default(1),
  seed: z.number().int().positive().optional(),
  negativePrompt: z.string().max(300).optional(),
  enhancePrompt: z.boolean().default(true),
});

export const GenerateVariationsSchema = z.object({
  sourceJobId: z.string().uuid(),
});

// ── Image Editing ─────────────────────────────────────────────────
export const BgRemoveSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
});

export const InpaintSchema = z.object({
  imageUrl: z.string().url(),
  maskUrl: z.string().url(),
  prompt: z
    .string()
    .min(3, "Please describe what should replace the masked area")
    .max(300),
});

export const UpscaleSchema = z.object({
  imageUrl: z.string().url(),
  scale: z.union([z.literal(2), z.literal(4)]),
});

export const EnhanceSchema = z.object({
  imageUrl: z.string().url(),
  enhancementType: z.enum(["auto", "face", "colorize", "cartoon", "deblur"]),
});

// ── Video Generation ─────────────────────────────────────────────
export const GenerateVideoSchema = z.object({
  sourceImageUrl: z.string().url("Invalid source image URL"),
  motionPrompt: z
    .string()
    .min(3)
    .max(150, "Motion prompt cannot exceed 150 characters"),
  duration: z.union([z.literal(3), z.literal(5)]),
});

// ── Gallery ──────────────────────────────────────────────────────
export const GalleryQuerySchema = z.object({
  type: z.enum(["all", "image", "video"]).default("all"),
  sort: z.enum(["newest", "oldest", "favorites"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export const UpdateGalleryItemSchema = z.object({
  isFavorite: z.boolean().optional(),
  collectionId: z.string().uuid().nullable().optional(),
});

export const BulkDeleteSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(50),
});

// ── Credits ───────────────────────────────────────────────────────
export const TopupSchema = z.object({
  packageSize: z.enum(["sm", "md", "lg"]),
});

// ── Billing ───────────────────────────────────────────────────────
export const CreateCheckoutSchema = z.object({
  plan: z.enum(["spark", "glow", "pro"]),
});

// ── Templates ────────────────────────────────────────────────────
export const TemplateQuerySchema = z.object({
  category: z.enum(["all","social_post","thumbnail","wallpaper","avatar","artistic","seasonal"]).default("all"),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(60).default(40),
});
