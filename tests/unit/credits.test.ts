// tests/unit/credits.test.ts
// PRD Reference: Section 8, Section 3.9, Section 13.1
import { describe, it, expect } from "vitest";
import { CREDIT_COSTS, PLAN_CREDITS, TOPUP_PACKAGES, LOW_CREDIT_THRESHOLD } from "@/types";

describe("Credit cost constants — PRD Section 3.9 & 4.7", () => {
  it("IMAGE_SINGLE costs 1 credit", () => {
    expect(CREDIT_COSTS.IMAGE_SINGLE).toBe(1);
  });
  it("IMAGE_BATCH_2 costs 2 credits", () => {
    expect(CREDIT_COSTS.IMAGE_BATCH_2).toBe(2);
  });
  it("IMAGE_BATCH_4 costs 4 credits", () => {
    expect(CREDIT_COSTS.IMAGE_BATCH_4).toBe(4);
  });
  it("IMAGE_VARIATIONS costs 2 credits", () => {
    expect(CREDIT_COSTS.IMAGE_VARIATIONS).toBe(2);
  });
  it("EDIT_BG_REMOVE costs 2 credits", () => {
    expect(CREDIT_COSTS.EDIT_BG_REMOVE).toBe(2);
  });
  it("EDIT_BG_REMOVE_WITH_AI costs 3 credits", () => {
    expect(CREDIT_COSTS.EDIT_BG_REMOVE_WITH_AI).toBe(3);
  });
  it("EDIT_INPAINT costs 3 credits", () => {
    expect(CREDIT_COSTS.EDIT_INPAINT).toBe(3);
  });
  it("EDIT_UPSCALE_2X costs 2 credits", () => {
    expect(CREDIT_COSTS.EDIT_UPSCALE_2X).toBe(2);
  });
  it("EDIT_UPSCALE_4X costs 4 credits", () => {
    expect(CREDIT_COSTS.EDIT_UPSCALE_4X).toBe(4);
  });
  it("EDIT_ENHANCE costs 1 credit", () => {
    expect(CREDIT_COSTS.EDIT_ENHANCE).toBe(1);
  });
  it("VIDEO_3S costs 5 credits", () => {
    expect(CREDIT_COSTS.VIDEO_3S).toBe(5);
  });
  it("VIDEO_5S costs 8 credits", () => {
    expect(CREDIT_COSTS.VIDEO_5S).toBe(8);
  });
});

describe("Plan credit allocations — PRD Section 8.1", () => {
  it("Free plan gets 25 credits", () => {
    expect(PLAN_CREDITS.free).toBe(25);
  });
  it("Spark plan gets 150 credits", () => {
    expect(PLAN_CREDITS.spark).toBe(150);
  });
  it("Glow plan gets 500 credits", () => {
    expect(PLAN_CREDITS.glow).toBe(500);
  });
  it("Pro plan is unlimited (null)", () => {
    expect(PLAN_CREDITS.pro).toBeNull();
  });
});

describe("Top-up packages — PRD Section 8.5", () => {
  it("sm package: $2, 20 credits for free, 30 for paid", () => {
    expect(TOPUP_PACKAGES.sm.price).toBe(2);
    expect(TOPUP_PACKAGES.sm.creditsForFree).toBe(20);
    expect(TOPUP_PACKAGES.sm.creditsForPaid).toBe(30);
  });
  it("md package: $5, 60 credits for free, 80 for paid", () => {
    expect(TOPUP_PACKAGES.md.price).toBe(5);
    expect(TOPUP_PACKAGES.md.creditsForFree).toBe(60);
    expect(TOPUP_PACKAGES.md.creditsForPaid).toBe(80);
  });
  it("lg package: $10, 140 credits for free, 180 for paid", () => {
    expect(TOPUP_PACKAGES.lg.price).toBe(10);
    expect(TOPUP_PACKAGES.lg.creditsForFree).toBe(140);
    expect(TOPUP_PACKAGES.lg.creditsForPaid).toBe(180);
  });
});

describe("Low credit threshold — PRD Section 8.2", () => {
  it("Low credit warning triggers at 20", () => {
    expect(LOW_CREDIT_THRESHOLD).toBe(20);
  });
  it("19 credits should be below threshold", () => {
    expect(19 < LOW_CREDIT_THRESHOLD).toBe(true);
  });
  it("20 credits should be at threshold (warning shows)", () => {
    expect(20 < LOW_CREDIT_THRESHOLD).toBe(false);
  });
});
