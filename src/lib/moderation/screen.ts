// ─────────────────────────────────────────────────────────────────
//  Content Moderation
//  All prompts MUST pass through this check before being sent to
//  any AI model. PRD Section 12.3: content moderation requirement.
//  Uses OpenAI Moderation API as a lightweight, fast screener.
// ─────────────────────────────────────────────────────────────────

interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

/** Screen a prompt for policy violations before generation. */
export async function moderatePrompt(prompt: string): Promise<ModerationResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: prompt }),
    });

    if (!response.ok) {
      // If moderation API is down, fail open with a warning log
      console.warn("[moderation] API unavailable, allowing prompt through");
      return { flagged: false, categories: [] };
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return { flagged: false, categories: [] };

    const flaggedCategories = Object.entries(result.categories as Record<string, boolean>)
      .filter(([, flagged]) => flagged)
      .map(([cat]) => cat);

    return {
      flagged: result.flagged,
      categories: flaggedCategories,
    };
  } catch (err) {
    console.error("[moderation] Error:", err);
    // Fail open — don't block generation if moderation errors
    return { flagged: false, categories: [] };
  }
}

/** Hard-coded blocklist for obvious violations (fast path before API call). */
const BLOCKLIST_PATTERNS = [
  /\b(nude|naked|nsfw|porn|xxx|hentai|explicit)\b/i,
  /\b(child|minor|underage|loli|shota)\b.*\b(sex|nude|naked)\b/i,
  /\b(gore|decapitat|dismember|torture)\b/i,
];

export function quickScreenPrompt(prompt: string): boolean {
  return BLOCKLIST_PATTERNS.some(pattern => pattern.test(prompt));
}
