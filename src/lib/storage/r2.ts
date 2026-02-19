// ─────────────────────────────────────────────────────────────────
//  Cloudflare R2 Storage Client
//  Handles uploading generated images and videos to R2 and returns
//  public CDN URLs. PRD Reference: Section 10.1
// ─────────────────────────────────────────────────────────────────
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const CDN_BASE = process.env.CLOUDFLARE_CDN_BASE_URL!;

/** Upload a file buffer to R2 and return the public CDN URL. */
export async function uploadToR2({
  key,
  buffer,
  contentType,
}: {
  key: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable", // 1 year — outputs never change
  }));
  return `${CDN_BASE}/${key}`;
}

/** Upload from a URL (fetch + pipe to R2). */
export async function uploadUrlToR2({
  sourceUrl,
  key,
  contentType,
}: {
  sourceUrl: string;
  key: string;
  contentType: string;
}): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Failed to fetch source: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadToR2({ key, buffer, contentType });
}

/** Delete an object from R2 (used when gallery item is deleted). */
export async function deleteFromR2(key: string): Promise<void> {
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Generate a short-lived signed URL for private access (e.g., download links).
 * Expires in 60 seconds — user must download within that window.
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    R2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 60 }
  );
}

// ── Key generation helpers ─────────────────────────────────────────

/** e.g. outputs/images/{userId}/{jobId}.png */
export function imageKey(userId: string, jobId: string): string {
  return `outputs/images/${userId}/${jobId}.png`;
}

/** e.g. outputs/images/{userId}/{jobId}_thumb.webp */
export function thumbnailKey(userId: string, jobId: string): string {
  return `outputs/thumbnails/${userId}/${jobId}.webp`;
}

/** e.g. outputs/videos/{userId}/{jobId}.mp4 */
export function videoKey(userId: string, jobId: string): string {
  return `outputs/videos/${userId}/${jobId}.mp4`;
}

/** e.g. outputs/videos/{userId}/{jobId}_thumb.webp */
export function videoThumbnailKey(userId: string, jobId: string): string {
  return `outputs/thumbnails/${userId}/${jobId}_video.webp`;
}
