# Claude — Execution Protocol (pos-for-sell)

This is the **Cat Booth POS SaaS** project. It is co-located in the same git repo as `meowmeow_pos_event.html` but is a **distinct project** with its own protocol, batch namespace (`DD-XX`), and architecture.

When working anywhere inside `pos-for-sell/`, **this file overrides the root `CLAUDE.md`**. The "Working with this user" section in the root `CLAUDE.md` still applies here — read it for tone and assumed capabilities.

## System at a glance

### What this product is

A multi-tenant SaaS POS for cat-product booth sellers in Thailand. Two layers share one Next.js app: the **POS App** (seller-facing, under `/app/*`) and the **Customer Portal** (customer-facing, under `/register/[token]`). The two are connected by a 16-char single-use registration token issued at checkout.

### Project structure

- `src/app/` — Next.js App Router. Route groups: `/` (landing), `/login`, `/register`, `/apply`, `/learn`, `/qr-menu`, `/app/*` (tenant), `/admin/*` (platform admin).
- `src/components/` — UI primitives + `Money` + `LanguageSwitcher`.
- `src/lib/` — `supabase`, `auth`, `pos` (cart/calc), `email`, `i18n`, `money`, `sku`, `promptpay`, `image`, `csv`, `invite-code`, demo seed.
- `src/proxy.ts` — Next 16 middleware (session refresh).
- `database/` — `schema.sql`, `rls-policies.sql`, `seed.sql`, `functions/` (8 `SECURITY DEFINER` RPCs).
- `tests/lib/` — 34 vitest specs. `tests/e2e/` — 3 playwright specs.
- `docs/` — see Read-first list below.

### User flow (end-to-end)

1. Visitor lands on `/` → applies via `/apply` (DD-14 form, public, rate-limited).
2. Admin reviews at `/admin/applications` → approves → invite email sent via Resend.
3. Applicant redeems at `/register/[token]` → workspace + owner row created.
4. Owner adds catalog at `/app/setup/products`.
5. Cashier takes orders at `/app/pos` → `create_order` RPC writes `orders` + `order_items` + `payment_records` + `event_inventory` atomically.
6. At checkout a registration token is issued → customer scans QR → claims profile + pet info at customer-side `/register/[token]`.
7. Owner reviews at `/app/dashboard`, `/app/close-day`, `/app/correction`, `/app/audit-log`.

### Demo mode

If `NEXT_PUBLIC_SUPABASE_URL` is unset, `/app/*` and `/admin/*` render against mock data. This is the fastest way to explore the UI without a Supabase setup.

## Read first, every session

1. [docs/ROADMAP.md](docs/ROADMAP.md) — **canonical** strategic direction (May 2026): beachhead market, vertical-module strategy, Google Auth + invite-only pilot, three-level data philosophy, six-month plan, pricing intent. Wins over older planning docs where they overlap.
2. [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md) — pilot-mechanics overview: hard requirements, non-goals, success criteria. Read after ROADMAP for the operational layer.
3. [docs/BATCH_PLAN.md](docs/BATCH_PLAN.md) — all ~100 planned batches in order, by phase.
4. [TASKS.md](TASKS.md) — live status board (which batch is claimed/in-progress/done).
5. [docs/DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) — meowmeow visual language carried over.
6. [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — table list and RLS approach.

## Stack (do not change without batch)

- Next.js 16 (App Router, src dir)
- React 19, TypeScript 5
- Tailwind CSS 4
- Supabase (Postgres, Auth, Storage, RLS)
- Resend (transactional email)
- Vercel (hosting)
- npm (package manager)

## Sister project — MeowMeow Event POS

Several SaaS features port field-proven patterns from the **MeowMeow Event POS** (single-file app at the repo root). When implementing a wave that names a meowmeow analog — sample bucket (Wave 39a/b ↔ meowmeow Batch DD), Send Later (Wave 16/17), free-gift promo, bill correction, void audit — consult the source docs to understand *why* the pattern works under real booth conditions:

- [`../readme.md`](../readme.md) — meowmeow product direction, behavior rules, current shape (look for the relevant section: Send Later, Inventory, Correction Center, Free Gift Rules).
- [`../TASKS.md`](../TASKS.md) — meowmeow batch history (the Done section names which batches shipped each pattern, e.g. Batch DD for sample bucket, Batch EE for bill-correction allowance).
- [`../meowmeow_pos_event.html`](../meowmeow_pos_event.html) — the source app itself; grep it for the feature name to find the live implementation.

Treat meowmeow as a source of validated patterns, **not** a target for edits — its protocol is at [`../CLAUDE.md`](../CLAUDE.md) and its batch naming (`batch/<letter>`) is distinct from this project's `pos/DD-XX` / `pos/wave-NN`. Do not edit meowmeow files from a SaaS batch (and vice versa).

## Hard rules

1. **No localStorage for business data.** All orders, products, payments, inventory go to Supabase. localStorage is only allowed for ephemeral UI state (selected day, expanded panels, draft cart that has not been confirmed).
2. **Every business table has `workspace_id`.** Every query and every RLS policy filters by it. Never write a SELECT/UPDATE/DELETE on a business table without a workspace filter.
3. **RLS is on for every business table.** Even server-side queries use the user's session token, not the service role, unless an admin route explicitly opts in.
4. **Service role key is server-only.** Never imported by anything in `src/app/` that renders on the client. Lives in `src/lib/supabase/admin.ts` and is used only inside Server Actions / Route Handlers / admin pages.
5. **Money is integers, in the smallest unit (THB satang).** No floats for prices, totals, fees.
6. **Orders are written through a Postgres function** that updates `orders`, `order_items`, `payment_records`, and `event_inventory` in one transaction. The client never decrements stock directly.
7. **Audit log on every admin/correction/refund action.** `audit_logs` row written in the same transaction as the change.
8. **Email goes through `lib/email/resend.ts`.** No direct fetch to Resend in components.
9. **Visual language matches meowmeow.** Cream/brown palette, large radii, tabular numerics. See `docs/DESIGN_TOKENS.md`.

## Batch flow

Two naming conventions are in use — pick based on which kind of work you're starting:

- **DD-XX** (DD-01 through DD-100, plus DD-101..210 in `BATCH_PLAN_VOL2.md`) — the original upfront-planned batches from the 100-batch plan.
  - Branch: `pos/DD-XX-short-slug` (the `pos/` prefix keeps SaaS branches visually distinct from `batch/...` branches that target `meowmeow_pos_event.html`).
  - Commit prefix: `[DD-XX] one-line summary`.
  - PR title: `pos: DD-XX <one-line summary>`.
- **Wave NN** (post-DD-100 organic work) — feature-cohesive multi-batch work driven by competitor research, meowmeow field findings, and the strategic correction in `../VISION.md`. Used for everything from Wave 12 onwards.
  - Branch: `pos/wave-NN-short-slug` (or `pos/wave-NNa-...` when a wave is split).
  - Commit prefix: `[Wave NN] one-line summary` (or `[Wave NNa] ...`).
  - PR title: includes Wave NN.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) "DD-XX vs Wave NN naming" for the convention details and [`docs/BATCH_PLAN.md`](docs/BATCH_PLAN.md) "Post-DD-100 Waves" section for the full shipped list.

Common rules for both conventions:

- **One implementation batch at a time.** Finish or hand off before claiming another.
- **Update [TASKS.md](TASKS.md) before editing.** Set `Owner: claude`, `Status: in-progress`, `Branch: ...`, `Claimed: <YYYY-MM-DD HH:MM>`.

## Working rules

- Server components by default. `"use client"` only when interactivity requires it.
- Forms use Server Actions, not bespoke API routes, unless there's a reason (webhooks, third-party callbacks, signed URLs).
- All public-facing forms must be rate-limited (Supabase Edge function or app-level check).
- All admin pages live under `/admin/...` and are gated by an admin-role check in middleware.
- Multi-tenant data must always render via the user's session — never via the service role on a client-facing page.
- Tests live under `pos-for-sell/tests/`. Smoke first, unit later.
- README is updated as part of any batch that changes externally-visible behavior.
- Do not edit files outside `pos-for-sell/` from within this project's batches, except to add a pointer in the root README.

## Handoff back to Codex/user

At the end of a batch, report:

- What changed (files + behavior).
- Migrations or env additions required.
- Manual checks performed.
- Any risk or assumption still open.
- Whether docs/TASKS were updated.

For high-risk batches (anything touching auth, RLS, payments, money totals, inventory atomicity, refunds, or email sending), request review before merge.

## When in doubt

- If the implementation reveals a bigger structural issue, stop and add a new batch instead of expanding scope.
- If a stale claim sits >24h with no branch activity, mark `Status: stale` and reassign with confirmation.
- Merge conflicts: never auto-resolve heuristically. Surface and recommend.

## Author note

The initial 100-batch plan in `docs/BATCH_PLAN.md` was drafted by Claude in solo mode at the user's explicit request to plan and execute end-to-end. Codex review of phase boundaries (especially Phase 4 → Phase 5 → Phase 6 inventory atomicity) is welcome before those phases begin implementation.
