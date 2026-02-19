// tests/e2e/critical-flows.spec.ts
// PRD Reference: Section 13.2 — 5 mandatory E2E test scenarios
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = "test@creativeai-e2e.com";
const TEST_PASSWORD = "Test123456!";

// ── E2E-01: New user sign-up and first generation ─────────────────
test("E2E-01: New user can sign up and generate first image", async ({ page }) => {
  await page.goto(`${BASE_URL}/`);

  // Click Get Started Free
  await page.getByRole("link", { name: /get started free/i }).click();
  await expect(page).toHaveURL(/\/signup/);

  // Fill sign up form
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign up/i }).click();

  // Onboarding should appear
  await expect(page.getByText(/welcome to creativeai/i)).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: /let's create/i }).click();
  await page.getByRole("button", { name: /next/i }).click();
  await page.getByRole("button", { name: /start creating/i }).click();

  // Should be on /create page
  await expect(page).toHaveURL(/\/create/);

  // Type a prompt and generate
  await page.getByPlaceholder(/describe what you want/i).fill("A cute orange cat sitting on a cloud");
  await page.getByRole("button", { name: /generate/i }).click();

  // Credit should be deducted
  await expect(page.getByText("24")).toBeVisible({ timeout: 30000 });

  // Image should appear
  await expect(page.getByTestId("generation-output")).toBeVisible({ timeout: 30000 });
});

// ── E2E-02: Free user upgrades to Spark ──────────────────────────
test("E2E-02: Free user can upgrade to Spark plan", async ({ page }) => {
  // Start authenticated as a free user with 0 credits
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(process.env.E2E_FREE_USER_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_FREE_USER_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/create/);

  // Navigate to billing
  await page.goto(`${BASE_URL}/settings/billing`);
  await page.getByRole("button", { name: /upgrade.*spark/i }).click();

  // Stripe checkout (test mode)
  await expect(page).toHaveURL(/checkout\.stripe\.com/);
  await page.getByTestId("cardNumberField").fill("4242424242424242");
  await page.getByTestId("cardExpiryField").fill("12/28");
  await page.getByTestId("cardCvcField").fill("424");
  await page.getByRole("button", { name: /pay/i }).click();

  // Should redirect back to billing page with success
  await expect(page).toHaveURL(/\/settings\/billing\?success=true/, { timeout: 15000 });
  await expect(page.getByText(/spark/i)).toBeVisible();

  // Credit balance should show 150
  await expect(page.getByText("150")).toBeVisible({ timeout: 10000 });

  // Video section should be unlocked
  await page.goto(`${BASE_URL}/video`);
  await expect(page.getByTestId("video-generator")).toBeVisible();
  await expect(page.getByTestId("video-locked")).not.toBeVisible();
});

// ── E2E-03: Credit refund on generation failure ───────────────────
test("E2E-03: Credits are refunded when generation fails", async ({ page }) => {
  // NOTE: In CI, mock Replicate to return 500 via environment variable
  // REPLICATE_FORCE_FAIL=true causes the API wrapper to throw

  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(process.env.E2E_PAID_USER_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_PAID_USER_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/create/);

  // Record initial credit balance
  const balanceEl = page.getByTestId("credit-balance");
  const initialBalance = parseInt(await balanceEl.textContent() ?? "0", 10);

  // Trigger a generation (will fail in CI via mock)
  await page.getByPlaceholder(/describe/i).fill("A mountain landscape at sunset");
  await page.getByRole("button", { name: /generate/i }).click();

  // Error state should appear
  await expect(page.getByTestId("generation-error")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/credit has been refunded/i)).toBeVisible();

  // Credit balance should be restored to initial
  const finalBalance = parseInt(await balanceEl.textContent() ?? "0", 10);
  expect(finalBalance).toBe(initialBalance);
});

// ── E2E-04: Image editing — background removal ────────────────────
test("E2E-04: User can remove background from an image", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(process.env.E2E_PAID_USER_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_PAID_USER_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/create/);

  // Generate an image first
  await page.getByPlaceholder(/describe/i).fill("A red apple on a white table");
  await page.getByRole("button", { name: /generate/i }).click();
  await expect(page.getByTestId("generation-output")).toBeVisible({ timeout: 30000 });

  // Click "Edit Image"
  await page.getByRole("button", { name: /edit image/i }).click();
  await expect(page).toHaveURL(/\/edit/);

  // Record balance before editing
  const balanceBefore = parseInt(await page.getByTestId("credit-balance").textContent() ?? "0", 10);

  // Click Background Removal
  await page.getByRole("button", { name: /remove background/i }).click();
  await expect(page.getByTestId("editing-processing")).toBeVisible();

  // Result should appear within 15 seconds
  await expect(page.getByTestId("editing-result")).toBeVisible({ timeout: 15000 });

  // 2 credits deducted
  const balanceAfter = parseInt(await page.getByTestId("credit-balance").textContent() ?? "0", 10);
  expect(balanceBefore - balanceAfter).toBe(2);

  // Download button should be present
  await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
});

// ── E2E-05: Template → generation flow ───────────────────────────
test("E2E-05: User can use a template to pre-populate generation", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(process.env.E2E_FREE_USER_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_FREE_USER_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/create/);

  // Navigate to Templates
  await page.goto(`${BASE_URL}/templates`);
  await expect(page.getByTestId("template-grid")).toBeVisible();

  // Click a free template
  const firstFreeTemplate = page.getByTestId("template-card").first();
  const templateTitle = await firstFreeTemplate.getByTestId("template-title").textContent();
  await firstFreeTemplate.getByRole("button", { name: /use template/i }).click();

  // Should be on /create with pre-populated fields
  await expect(page).toHaveURL(/\/create/);
  const promptValue = await page.getByPlaceholder(/describe/i).inputValue();
  expect(promptValue.length).toBeGreaterThan(10);

  // Generate
  await page.getByRole("button", { name: /generate/i }).click();
  await expect(page.getByTestId("generation-output")).toBeVisible({ timeout: 30000 });
});
