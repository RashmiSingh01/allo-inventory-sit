# allo-inventory

Take home exercise for Allo Engineering.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + Postgres (Supabase)
- Tailwind

## Setup

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## How expiry works

A Vercel cron job hits `/api/cron/release-expired` every minute. It looks for any PENDING reservations past their `expiresAt` and releases them so stock goes back to available.

## Concurrency

The reserve endpoint uses a conditional SQL UPDATE inside a Prisma transaction. The WHERE clause checks available units atomically so two simultaneous requests can't both reserve the last unit.

## Trade-offs

- No Redis — the SQL approach is enough for this scale
- No auth — reservations are open by URL
- Error messages are basic, would improve them with more time
