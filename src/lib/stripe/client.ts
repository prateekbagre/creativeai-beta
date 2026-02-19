import Stripe from "stripe";

// Initialize only if key is present to avoid crashing during build
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
  typescript: true,
});

/** Resolves the plan ID to a Stripe Price ID */
export const getPriceIdForPlan = (plan: string) => {
  switch (plan.toLowerCase()) {
    case "spark": return process.env.STRIPE_PRICE_SPARK;
    case "glow": return process.env.STRIPE_PRICE_GLOW;
    case "pro": return process.env.STRIPE_PRICE_PRO;
    default: return null;
  }
};
