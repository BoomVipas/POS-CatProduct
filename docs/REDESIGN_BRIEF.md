# Frontend Redesign Brief — May 2026

This document is the **single source of truth** for the 29-page frontend
redesign. Every page must follow it. Parallel agents read this brief before
touching any file.

## Concept

**"Letterpress on warm market paper."** A refined, editorial take on the
existing meowmeow booth-paper aesthetic. Cream canvas, warm brown ink, gold
accent, hand-pressed serif headlines on a real paper-grain texture. Confident,
artisanal, calm. Built for booth operators at Thai pet markets — but feels
like a magazine cover, not an app dashboard.

## Three families, one system

All 29 pages share **the same tokens, fonts, primitives, and palette**.
Only density and ornamentation vary by family.

| Family    | Where               | Density | Ornament | Hero type             |
| --------- | ------------------- | ------- | -------- | --------------------- |
| `public`  | `/`, `/learn`, `/apply*`, `/login`, `/register*`, `/qr-menu` | low (generous whitespace) | high (fleurons, kickers, italic Fraunces hero) | display, 5xl–7xl Fraunces italic |
| `app`     | `/app/*`            | high (information-dense) | medium (kickers + section underlines, calmer) | h1 Fraunces upright, 2xl–4xl |
| `admin`   | `/admin/*`          | highest (table-first)    | low (just page titles)                          | h1 Fraunces upright, 2xl |

Apply the family scope by wrapping the family's root layout in
`<div className="theme-public">` / `theme-app` / `theme-admin`.

## Type system

| Role                | Font                  | Tailwind class         |
| ------------------- | --------------------- | ---------------------- |
| Hero display        | Fraunces italic       | `headline` (+ size)    |
| Section title       | Fraunces upright      | `headline-upright`     |
| Body / UI           | Inter Tight           | (default `font-sans`)  |
| Numerics (price, SKU, count) | JetBrains Mono | `mono` or `num`        |
| Eyebrow / kicker    | Inter Tight 600 caps  | `kicker` (+ `kicker-gold` for gold rules) |

**Never** use Arial, Roboto, Inter, Space Grotesk, system-ui directly. Always
go through `font-sans` / `font-display` / `font-mono` so the token system
holds.

## Palette (use tokens, never hex)

| Token                       | Hex      | Use                                  |
| --------------------------- | -------- | ------------------------------------ |
| `bg-bg` / canvas            | #f6f0e6  | page canvas (already on body)        |
| `bg-panel`                  | #fffaf3  | card surface                         |
| `bg-panel-strong`           | #fffdf9  | elevated surface                     |
| `bg-soft`                   | #efe5d6  | subtle alternate surface             |
| `text-text` / `text-text-soft` | #2b231d / #4a3f33 | primary copy        |
| `text-muted` / `text-faint` | #7c6c58 / #a89579 | secondary / hint copy       |
| `text-accent` / `text-accent-strong` / `text-accent-deep` | #8d6236 / #6e4b27 / #4a3019 | brand brown ramp |
| `bg-gold` / `bg-gold-soft`  | #c59a54 / #e9d6ab | accent highlight                 |
| `border-line` / `border-line-strong` | #ddcfbe / #c5b39a | borders          |
| `chip-ok` / `warn` / `danger` / `info` / `gold` / `neutral` | — | status chips |

## Shared primitives (already in globals.css)

Use these instead of inventing new ones:

- `.panel` / `.panel-lift` / `.panel-quiet` — card surfaces (largest radius)
- `.panel-tag` — paper-sticker label (absolute-positioned)
- `.btn-accent` + size: `.btn-sm` / `.btn-md` / `.btn-lg` / `.btn-xl`
- `.btn-ghost` — secondary action
- `.btn-link` — inline link with gold underline
- `.field` + `.field-label` — form inputs
- `.chip` + variant: `chip-ok` / `chip-warn` / `chip-danger` / `chip-info` / `chip-neutral` / `chip-gold`
- `.tbl` — data tables
- `.kicker` / `.kicker-gold` — eyebrow rows
- `.fleuron` — decorative section divider
- `.letterpress` — pressed-into-paper text shadow (apply to hero headlines)
- `.underline-grow` — animated gold underline on first render
- `.rise` + `.rise-1` ... `.rise-6` — staggered entrance on page load
- `.mono` / `.num` / `.tabular` — tabular numerics

## Layout rules

- Public: max-width 64rem (or 72rem for the landing). Asymmetric:
  headline left-aligned and oversized; supporting copy below in a narrower
  measure. Use overlap and one piece of generous negative space.
- App: max-width 96rem. Top bar already provided by `/app/layout.tsx`.
  Pages start with a kicker + h1 row, then content. Information-dense; favor
  tables and tight panels over hero blocks.
- Admin: max-width 96rem. Same shape as App but tighter still; tables
  fill the page; minimal hero.

## Motion rules

- One coordinated page-load reveal using `.rise .rise-1` ... `.rise-6`. Stop
  there. No scattered hover micro-interactions.
- Hero gold underline via `.underline-grow`.
- All motion honors `prefers-reduced-motion` (already wired in globals).

## Hard constraints (do not break)

1. **Preserve all functionality.** Server actions, i18n hooks, form schema,
   data fetching, props — keep exactly as-is. You are only changing
   *presentation*: JSX structure, className composition, copy ornaments,
   ordering of visual elements.
2. **i18n.** Continue using `t.<namespace>.<key>` exactly as the file does.
   Do not invent new keys; if a new label is genuinely needed, leave a TODO
   comment instead of inventing copy.
3. **Imports.** Keep all existing imports (`getDict`, `LanguageSwitcher`,
   `createClient`, etc.). Do not break server/client component boundaries.
4. **Accessibility.** Buttons remain `<button>` / `<a>`. Labels remain
   associated. Color contrast ≥ 4.5:1 for body text.
5. **No new dependencies.** Use only what's in `package.json`.
6. **No emojis** unless the source file already uses one.
7. **No new fonts.** Fraunces + Inter Tight + JetBrains Mono only, via the
   tokens.
8. **Tabular nums** on every price, count, SKU, order number, date.
9. **Print** still works on `/app/pos/success/[orderId]` — preserve `.no-print`
   markers and the receipt structure.

## House style

- Lead with a kicker (`.kicker-gold` for hero pages), then a big Fraunces
  italic headline (`.headline` + `.letterpress`), then a single
  paragraph of refined body copy.
- One primary CTA per page. Secondary action as `.btn-ghost` next to it.
- Status messaging uses chips, never plain colored text.
- Numbers ALWAYS in `.mono` or `.num`.
- Long text columns max ~62ch.
- Section breaks use `<div className="fleuron"><span>※</span></div>`.

## Family-specific guidance

### `theme-public`

- Hero headline is the page's anchor — make it large (text-6xl to text-7xl on
  desktop), italic, letterpressed, with the `.underline-grow` gold underline
  on a key word.
- Use one big asymmetric layout — headline left, image / illustration / list
  to the right or overlapping below.
- Wrap content in `.rise .rise-1` etc. for staggered entrance.
- Add at least one editorial detail: `panel-tag` sticker, fleuron divider,
  numbered list with mono numerals, or pull-quote.

### `theme-app`

- Operators use these many times a day. Calm > flashy. NO hero illustrations.
- Page header: `<header>` block with kicker + Fraunces upright h1 +
  short subtitle + right-aligned actions. One row.
- Body: `panel` or `panel-quiet` blocks containing tables, forms, or KPI
  tiles.
- Sticky bottom action bars when there's a primary action with cart-like state.
- Avoid `.rise` on data-heavy pages — it makes them feel slow.

### `theme-admin`

- Visually quietest. Tables fill the page. Panels are `.panel-quiet`.
- One-line kicker + Fraunces upright h1 + filters row.
- Status chips do the visual work — no big illustrations.

## File-touch policy

For each page, touch only:
- the page's own `page.tsx` (and any sibling client components like
  `Form.tsx`, `List.tsx`, `Workspace.tsx` in the same directory)
- nothing outside the page's directory unless you are explicitly told to

Do not edit globals.css, layout.tsx, or files under `src/lib/`, `src/components/`
(unless those are explicitly listed as part of your chunk).

## Done criteria for each page

- All existing functionality intact (forms submit, server actions wired,
  i18n lookups unchanged).
- Visual aesthetic matches the family rules above.
- Page uses tokens / primitives from globals.css — no hardcoded hex.
- No new TypeScript or ESLint errors introduced.
- Numerics use `.mono` / `.num`.
- Headlines use `.headline` or `.headline-upright` (never raw
  `font-display`).
