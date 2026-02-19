// POST /api/billing/checkout
// PRD Reference: Section 8.4 (Stripe Checkout)
import { NextRequest } from "next/server";
import { requireAuth, apiSuccess, ApiError, withErrorHandling } from "@/utils/api";
import { stripe, getPriceIdForPlan } from "@/lib/stripe/client";
import { TOPUP_PACKAGES } from "@/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
    const user = await requireAuth(req);
    const body = (await req.json()) as any;

    const { type, planId, packageId } = body;

    let lineItems: any[] = [];
    let metadata: any = { userId: user.id, type };

    if (type === "subscription") {
        const priceId = getPriceIdForPlan(planId);
        if (!priceId) throw new ApiError("INVALID_INPUT", "Invalid plan selected");

        lineItems = [{ price: priceId, quantity: 1 }];
        metadata.plan = planId;
    } else if (type === "topup") {
        const pkg = TOPUP_PACKAGES[packageId as keyof typeof TOPUP_PACKAGES];
        if (!pkg) throw new ApiError("INVALID_INPUT", "Invalid top-up package");

        const credits = user.plan === "free" ? pkg.creditsForFree : pkg.creditsForPaid;

        lineItems = [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: `${credits} AI Credits`,
                    description: `Top-up package for CreativeAI`,
                },
                unit_amount: pkg.price * 100, // Stripe uses cents
            },
            quantity: 1,
        }];
        metadata.packageId = packageId;
        metadata.credits = credits;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: type === "subscription" ? "subscription" : "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=cancelled`,
        customer_email: user.email,
        metadata,
    });

    return apiSuccess({ url: session.url });
});
