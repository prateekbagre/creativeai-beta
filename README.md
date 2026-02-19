# CreativeAI — Phase 1 MVP

> AI Creative Studio for Individual Creators  
> Built with Next.js 14 · TypeScript · Supabase · Tailwind CSS · Replicate · Stripe

---

## Quick Start

```bash
git clone <your-repo>
cd creativeai
npm install
cp .env.example .env.local
# Fill in all values in .env.local (see Environment Setup below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
creativeai/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Login, signup, verify-email pages
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── verify-email/page.tsx
│   │   ├── (app)/                   # Authenticated app shell
│   │   │   ├── layout.tsx           # Sidebar + TopBar + auth guard
│   │   │   ├── create/page.tsx      # AI Image Generation (Feature 1)
│   │   │   ├── edit/page.tsx        # Image Editing (Feature 2)
│   │   │   ├── video/page.tsx       # Short Video Clips (Feature 3)
│   │   │   ├── templates/page.tsx   # Template Library (Feature 4)
│   │   │   ├── gallery/page.tsx     # Personal Gallery (Feature 5)
│   │   │   └── settings/
│   │   │       ├── billing/page.tsx
│   │   │       └── credits/page.tsx
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   ├── image/route.ts   # POST — image generation
│   │   │   │   ├── video/route.ts   # POST — video generation
│   │   │   │   └── variations/route.ts
│   │   │   ├── edit/
│   │   │   │   ├── background-remove/route.ts
│   │   │   │   ├── inpaint/route.ts
│   │   │   │   ├── upscale/route.ts
│   │   │   │   └── enhance/route.ts
│   │   │   ├── upload/
│   │   │   │   ├── image/route.ts
│   │   │   │   └── mask/route.ts
│   │   │   ├── gallery/route.ts
│   │   │   ├── credits/
│   │   │   │   ├── balance/route.ts
│   │   │   │   ├── transactions/route.ts
│   │   │   │   └── topup/route.ts
│   │   │   ├── billing/
│   │   │   │   ├── portal/route.ts
│   │   │   │   └── checkout/route.ts
│   │   │   ├── templates/route.ts
│   │   │   └── webhooks/
│   │   │       ├── stripe/route.ts  # Stripe events
│   │   │       └── replicate/route.ts # Generation completion
│   │   ├── layout.tsx               # Root layout (fonts, metadata)
│   │   └── globals.css              # Design tokens + Tailwind
│   │
│   ├── components/
│   │   ├── ui/                      # Reusable primitives (Button, Input, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Desktop nav
│   │   │   ├── MobileNav.tsx        # Mobile bottom tabs
│   │   │   └── TopBar.tsx           # Credit display + user menu
│   │   └── features/
│   │       ├── generate/            # Generation screen components
│   │       ├── edit/                # Editing screen components
│   │       ├── video/               # Video screen components
│   │       ├── gallery/             # Gallery components
│   │       ├── templates/           # Template library components
│   │       └── credits/             # Credit display + topup
│   │
│   ├── hooks/
│   │   └── useGenerationStore.ts    # Zustand store + Realtime subscription
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser, server, admin clients
│   │   │   └── credits.ts           # All credit logic (deduct, refund, rollover)
│   │   ├── replicate/
│   │   │   └── client.ts            # Image/video/editing generation
│   │   ├── storage/
│   │   │   └── r2.ts                # Cloudflare R2 uploads
│   │   ├── stripe/
│   │   │   └── client.ts            # Checkout, portal, webhooks
│   │   ├── email/                   # Resend transactional emails
│   │   └── moderation/
│   │       └── screen.ts            # Prompt content moderation
│   │
│   ├── types/
│   │   ├── index.ts                 # All types + constants (CREDIT_COSTS, etc.)
│   │   └── supabase.ts              # Auto-generated from: npm run db:types
│   │
│   ├── utils/
│   │   ├── api.ts                   # requireAuth, apiError, withErrorHandling
│   │   └── validation.ts            # Zod schemas for all API routes
│   │
│   ├── middleware.ts                 # Auth guards + rate limiting
│   └── styles/                      # Any additional global styles
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Full DB schema (all tables + RLS)
│   └── seed/
│       └── 002_seed_templates.sql   # 50 launch templates
│
├── tests/
│   ├── unit/
│   │   └── credits.test.ts          # Credit cost + plan constant tests
│   ├── integration/                 # API route integration tests
│   └── e2e/
│       └── critical-flows.spec.ts   # 5 mandatory E2E flows (PRD Section 13.2)
│
├── .env.example                     # All required env vars documented
├── tailwind.config.ts               # Full design system (PRD Section 9)
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Set up each service and fill in values:

| Service | Sign Up At | Variables to Fill |
|---------|-----------|-------------------|
| Supabase | supabase.com | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Replicate | replicate.com | `REPLICATE_API_TOKEN` |
| Fal.ai | fal.ai | `FAL_API_KEY` |
| Stripe | stripe.com | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, + 3 Price IDs |
| Cloudflare R2 | cloudflare.com/r2 | 5 R2 variables |
| Resend | resend.com | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| PostHog | posthog.com | `NEXT_PUBLIC_POSTHOG_KEY` |
| Sentry | sentry.io | `SENTRY_DSN` |

---

## Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations + seed
supabase db push

# Generate TypeScript types from schema
npm run db:types
```

---

## Running Tests

```bash
npm test               # Unit tests (Vitest)
npm run test:coverage  # With coverage report
npm run test:e2e       # E2E tests (Playwright)
```

---

## Development Workflow

```bash
npm run dev          # Start dev server at localhost:3000
npm run type-check   # TypeScript validation
npm run lint         # ESLint
npm run build        # Production build
```

---

## Key PRD References

| What you're implementing | PRD Section |
|--------------------------|-------------|
| AI Image Generation | Section 3 |
| Image Editing | Section 4 |
| Short Video Clips | Section 5 |
| Template Library | Section 6 |
| Personal Gallery | Section 7 |
| Credit System | Section 8 |
| Design System & Colors | Section 9 |
| Tech Stack | Section 10 |
| API Endpoints | Section 11 |
| Non-Functional Requirements | Section 12 |
| Testing Requirements | Section 13 |

---

## Deployment

- **Frontend**: Push to `main` branch → Vercel auto-deploys
- **Database**: `supabase db push` from CI/CD or manually
- **Webhooks**: Set Stripe webhook URL to `https://yourdomain.com/api/webhooks/stripe`

---

*PRD Version 1.0 · Phase 1 MVP · CreativeAI*
