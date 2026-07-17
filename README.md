# StockFlow — 6-Hour MVP

A minimal multi-tenant inventory tracker: sign up, add products, watch a
dashboard flag what's running low. Built to the Phase 1 MVP PRD scope —
no integrations, no multi-warehouse, no purchase orders.

## Stack

- **Next.js 14** (App Router) — one project for both frontend and API routes
- **Prisma + SQLite** — zero-config local DB (swap to Postgres for prod in one line)
- **JWT session cookie** (via `jose`) + **bcrypt** password hashing
- **Tailwind CSS**

## Local setup

```bash
npm install
cp .env.example .env        # then edit JWT_SECRET to any random string
npx prisma db push          # creates dev.db with the schema
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/signup`.

## Project structure

```
app/
  api/auth/{signup,login,logout}/route.ts   # auth endpoints
  api/products/route.ts                     # list (with ?q= search) + create
  api/products/[id]/route.ts                # get / update / delete one product
  api/products/[id]/adjust/route.ts         # inline +/- N units
  api/settings/route.ts                     # get/update default low-stock threshold
  login/, signup/                           # auth pages
  dashboard/                                # summary + low-stock list
  products/, products/new/, products/[id]/edit/
  settings/
components/                                 # Nav, ProductForm, ProductsTable, SettingsForm
lib/db.ts                                   # Prisma client singleton
lib/auth.ts                                 # session cookie sign/verify
prisma/schema.prisma                        # Organization, User, Product
```

## How multi-tenancy works

Every `Product` row has an `organizationId`. Every API route reads the
caller's `organizationId` from their session cookie (never from the
request body) and filters/writes with it, so one org can never see or
touch another org's data.

## Deploying

The easiest path is **Vercel**:

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Because SQLite doesn't persist on serverless, either:
   - swap `provider` in `prisma/schema.prisma` to `"postgresql"` and add a
     free Postgres `DATABASE_URL` (Neon, Supabase, Railway all work), or
   - deploy instead to a platform with a persistent disk (Render, Railway,
     Fly.io) and keep SQLite.
4. Set `DATABASE_URL` and `JWT_SECRET` as environment variables in the
   platform's dashboard.
5. Run `npx prisma migrate deploy` (or `db push`) once against the
   production database before/at first deploy.

## Suggested commit sequence

If you're using this as a starting point, commit in stages rather than
one big dump — it's part of what's being evaluated:

1. `chore: project scaffold + Prisma schema`
2. `feat: signup/login/logout with session cookies`
3. `feat: product CRUD API + list/create/edit pages`
4. `feat: inline stock adjustment`
5. `feat: dashboard summary + low-stock list`
6. `feat: settings page for default low-stock threshold`
7. `polish: validation, empty states, styling`
