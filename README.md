# FLUXMEDIA — AI Automation & Social Media Management

Production-ready agency website + CMS built with **Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Lucide, Zod** and a **Supabase-compatible data layer**.

> Less manual work. Better systems. Stronger online presence.

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — the site runs without it
npm run dev                    # http://localhost:3000
```

Admin panel: **/admin** — default dev password `fluxmedia-admin` (set `ADMIN_PASSWORD` in `.env.local`).

## What's inside

| Area | Routes |
|---|---|
| Public | `/` `/automations` `/automations/[slug]` `/social-media` `/social` `/about` `/contact` `/request` `/request/social-media?package=…` `/privacy` `/terms` |
| Admin | `/admin` `/admin/login` `/admin/automations(/new,/[id])` `/admin/categories` `/admin/social` (`/page-content` `/packages(/new,/[id])` `/clients` `/content` `/calendar` `/inbox` `/analytics` `/reports` `/accounts`) `/admin/social-links` `/admin/requests(/[id])` `/admin/messages` `/admin/media` `/admin/navigation` `/admin/settings` |
| API | `POST /api/submit` (requests + contact, Zod-validated, rate-limited) · `POST/DELETE /api/auth` · `/api/admin/[collection]` (CRUD + reorder, session-protected) · `/api/admin/media/upload` |

- **Languages:** EN / FR / AR with full RTL (`dir="rtl"`, logical CSS properties, mirrored icons).
- **Theme:** dark (default) / light toggle, persisted in a cookie.
- **CMS principle:** everything a business owner should change is editable in Admin and persisted — package name/price/features/visibility/order, Social Media page content, FAQs, social links, navigation, automations, categories, settings. Changes appear on the public site immediately (dynamic rendering + `revalidatePath`).

## Data layer

`lib/db.ts` exposes `getDb()` / `mutateDb()` over a JSON store at `data/db.json` (auto-seeded from `lib/seed.ts`). This mirrors the Supabase schema in `supabase/schema.sql` one-to-one (multilingual fields are JSONB `{en,fr,ar}`), so the project works out-of-the-box and can be pointed at Supabase by wiring `lib/supabase.ts` queries into the same `getDb`/`mutateDb` contract.

To move to Supabase:
1. Run `supabase/schema.sql` in the SQL editor.
2. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Replace the JSON read/write in `lib/db.ts` with Supabase queries (the shapes already match).

## Security

- Admin routes are protected by an edge `middleware.ts` + HMAC-signed, httpOnly session cookie verified in every admin page and API handler (`lib/auth.ts`).
- Login is rate-limited; form submissions are rate-limited and validated with Zod; a honeypot field is accepted.
- No service-role keys are exposed to the client. `.env` / `.env.local` are git-ignored; `.env.example` documents all variables.

## Honesty notes

- No fabricated clients, testimonials or statistics appear on the public site.
- The admin social workspace (overview, inbox, analytics, reports) uses clearly labelled **demo data** and does not pretend to send messages or connect to platform APIs.
