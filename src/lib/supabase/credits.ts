// ─────────────────────────────────────────────────────────────────
//  Credit Service
//  Centralises all credit deduction, refund, grant, and top-up
//  logic. All functions use the admin client (service role) so they
//  can atomically update credits + insert transaction records.
//  PRD Reference: Section 8
// ─────────────────────────────────────────────────────────────────
import { createAdminClient } from "@/lib/supabase/server";
import type { CreditTransactionType, Plan } from "@/types";
import { PLAN_CREDITS } from "@/types";

interface DeductCreditsParams {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  referenceId?: string;
}

interface GrantCreditsParams {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  referenceId?: string;
}

/** Deducts credits from a user. Returns updated balance or throws if insufficient. */
export async function deductCredits({
  userId, amount, type, description, referenceId,
}: DeductCreditsParams): Promise<{ creditsRemaining: number }> {
  const admin = createAdminClient();

  // Fetch current balance
  // @ts-ignore
  const { data: user, error: fetchError } = await (admin
    .from("users") as any)
    .select("credits_remaining, plan")
    .eq("id", userId)
    .single();

  if (fetchError || !user) throw new Error("User not found");

  // Pro plan = unlimited (null allowance)
  const isUnlimited = PLAN_CREDITS[user.plan as Plan] === null;
  if (!isUnlimited && user.credits_remaining < amount) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const newBalance = isUnlimited ? user.credits_remaining : user.credits_remaining - amount;

  // Update balance
  // @ts-ignore
  const { error: updateError } = await (admin
    .from("users") as any)
    .update({ credits_remaining: newBalance })
    .eq("id", userId);

  if (updateError) throw new Error("Failed to deduct credits");

  // Log transaction
  // @ts-ignore
  await (admin.from("credit_transactions") as any).insert({
    user_id: userId,
    amount: -amount,
    balance_after: newBalance,
    type,
    reference_id: referenceId ?? null,
    description,
  });

  return { creditsRemaining: newBalance };
}

/** Refunds credits to a user (on generation failure). */
export async function refundCredits({
  userId, amount, type = "refund", description, referenceId,
}: GrantCreditsParams): Promise<{ creditsRemaining: number }> {
  const admin = createAdminClient();

  // @ts-ignore
  const { data: user, error } = await (admin
    .from("users") as any)
    .select("credits_remaining")
    .eq("id", userId)
    .single();

  if (error || !user) throw new Error("User not found");

  const newBalance = user.credits_remaining + amount;

  // @ts-ignore
  await (admin.from("users") as any).update({ credits_remaining: newBalance }).eq("id", userId);
  // @ts-ignore
  await (admin.from("credit_transactions") as any).insert({
    user_id: userId,
    amount: +amount,
    balance_after: newBalance,
    type,
    reference_id: referenceId ?? null,
    description,
  });

  return { creditsRemaining: newBalance };
}

/** Grants top-up credits after a successful Stripe payment. */
export async function grantTopupCredits({
  userId, amount, referenceId,
}: { userId: string; amount: number; referenceId: string }) {
  return refundCredits({
    userId,
    amount,
    type: "topup",
    description: `Credit top-up — ${amount} credits purchased`,
    referenceId,
  });
}

/**
 * Runs the monthly credit refresh cycle for a single user.
 * PRD Section 8.6 rollover logic.
 */
export async function runMonthlyCreditCycle(userId: string) {
  const admin = createAdminClient();

  // @ts-ignore
  const { data: user } = await (admin
    .from("users") as any)
    .select("plan, credits_remaining, credits_monthly_allowance, credits_rollover_balance")
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");

  const plan = user.plan as Plan;
  const monthlyGrant = PLAN_CREDITS[plan];

  if (plan === "free") {
    // Hard reset — no rollover
    // @ts-ignore
    await (admin.from("users") as any).update({
      credits_remaining: 25,
      credits_rollover_balance: 0,
      billing_cycle_start: new Date().toISOString(),
    }).eq("id", userId);

    // @ts-ignore
    await (admin.from("credit_transactions") as any).insert({
      user_id: userId,
      amount: 25 - user.credits_remaining, // net change
      balance_after: 25,
      type: "monthly_grant",
      description: "Monthly free plan credit reset",
    });
  } else if (monthlyGrant !== null) {
    // Paid — add new grant on top of current balance (rollover)
    const rolloverAmount = user.credits_remaining;
    const newBalance = user.credits_remaining + monthlyGrant;

    // @ts-ignore
    await (admin.from("users") as any).update({
      credits_remaining: newBalance,
      credits_rollover_balance: rolloverAmount,
      billing_cycle_start: new Date().toISOString(),
    }).eq("id", userId);

    // Log rollover record
    if (rolloverAmount > 0) {
      // @ts-ignore
      await (admin.from("credit_transactions") as any).insert({
        user_id: userId,
        amount: 0, // no net change — already in balance
        balance_after: user.credits_remaining,
        type: "rollover",
        description: `${rolloverAmount} credits rolled over from previous cycle`,
      });
    }

    // Log monthly grant
    // @ts-ignore
    await (admin.from("credit_transactions") as any).insert({
      user_id: userId,
      amount: monthlyGrant,
      balance_after: newBalance,
      type: "monthly_grant",
      description: `Monthly ${plan} plan credit grant — ${monthlyGrant} credits`,
    });
  }
}

/** Returns the detailed credit breakdown for a user. */
export async function getCreditBalance(userId: string) {
  const admin = createAdminClient();
  // @ts-ignore
  const { data, error } = await (admin
    .from("users") as any)
    .select("credits_remaining, credits_monthly_allowance, credits_rollover_balance, plan")
    .eq("id", userId)
    .single();

  if (error || !data) throw new Error("Could not fetch credit balance");

  const topup = Math.max(
    0,
    data.credits_remaining - data.credits_monthly_allowance - data.credits_rollover_balance
  );

  return {
    total: data.credits_remaining,
    monthly: data.credits_monthly_allowance,
    rollover: data.credits_rollover_balance,
    topup,
  };
}
