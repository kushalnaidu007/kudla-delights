# Kudla Delights

A Next.js + PostgreSQL storefront for Mangalorean snacks in the UK.

## Features
- Product catalog with add-to-cart
- Checkout with Stripe
- UK-only shipping with flat rate + free shipping threshold
- Customer accounts required for purchase (browsing is open)
- Admin inventory management at `/admin`
- Category management and product image gallery support
- Product detail pages with customer reviews
- Admin order management with fulfillment status
- Order confirmation email via SMTP

## Setup
1. Install dependencies

```bash
npm install
```

2. Configure environment variables in `.env`

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

3. Run Prisma migration

```bash
npm run prisma:migrate
```

If you are using Prisma 7, this project uses the Postgres driver adapter (`pg`). Make sure `DATABASE_URL` is set before running migrations.

4. Seed the admin account

```bash
npm run db:seed
```

5. Start dev server

```bash
npm run dev
```

## Admin access
- Visit `/admin`
- Admin login is not linked from the public site
- The admin user is seeded from `.env`

## Stripe webhooks
Use the Stripe CLI to forward webhooks in development:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then update `STRIPE_WEBHOOK_SECRET` with the printed signing secret.
