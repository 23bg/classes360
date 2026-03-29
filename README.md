# Classes360 WWW

Classes360 is a production SaaS platform for coaching institutes. This repository powers the web application and dashboard experiences including admission CRM workflows, student operations, billing, and platform automation.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + MongoDB
- next-intl localization
- shadcn/ui component system
- Razorpay billing integration
- WhatsApp operational alerting

## Key Modules

- Leads and enquiry management
- Student and course operations
- Fees, payments, and billing dashboard
- Institute domain and branding controls
- Help center and in-app AI assistant (Imrabo)

## Recent Platform Updates

- Optional institute WhatsApp sender support with fallback to Classes360 shared sender
- Billing and usage flow aligned to monthly alert limits and overage logic
- Settings pages for WhatsApp integration and notification toggles
- Imrabo assistant upgraded with helpDocs-based retrieval and guarded AI prompts

## Local Development

Install dependencies and start the app:

```bash
pnpm install
pnpm dev
```

Run quality checks:

```bash
pnpm test
pnpm build

# optional bundle report
pnpm analyze
```

Performance conventions and regression guardrails are documented in `docs/release/PERFORMANCE_GUARDRAILS.md`.

## Environment
Create environment files for local and production values as required by `src/lib/config/env.ts`.

Important variables include:

- `DATABASE_URL`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `GEMINI_API_KEY`

## Deployment

The app is designed for Vercel deployment with Cloudflare-managed DNS and supports custom domain routing for institute experiences.
