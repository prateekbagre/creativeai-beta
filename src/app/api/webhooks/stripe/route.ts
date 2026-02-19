// POST /api/webhooks/stripe
// PRD Reference: Section 8.4 (webhook integration)
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { grantTopupCredits } from "@/lib/supabase/credits";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { userId, type, credits } = session.metadata;

    if (type === "topup") {
      await grantTopupCredits({
        userId,
        amount: parseInt(credits),
        referenceId: session.id,
      });
    } else if (type === "subscription") {
      const plan = session.metadata.plan;
      const admin = createAdminClient();
      // Update user plan
      // @ts-ignore
      await (admin.from("users") as any)
        .update({ plan, stripe_customer_id: session.customer })
        .eq("id", userId);
      // Initial grant happens in credits.ts -> runMonthlyCreditCycle or manually here
      // PRD says: "Immediately grants allowance on first sub"
      const { runMonthlyCreditCycle } = await import("@/lib/supabase/credits");
      await runMonthlyCreditCycle(userId);
    }
  }

  return NextResponse.json({ received: true });
}
