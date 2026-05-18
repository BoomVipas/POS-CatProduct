import Link from "next/link";

const REPO_DOC = (file: string) =>
  `https://github.com/visanchan/meowmeow_sandbox/blob/main/pos-for-sell/docs/${file}`;

export const metadata = {
  title: "Founder Learning Path — MochiPOS",
  description:
    "5-level curriculum for the MochiPOS founder. Web basics → Next.js → Supabase → Deployment → SaaS architecture.",
};

type Status = "in-progress" | "locked" | "done";

export default function LearnPage() {
  return (
    <div className="theme-public">
      <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <header className="rise rise-1">
          <p className="kicker kicker-gold">Founder learning path</p>
          <h1 className="headline letterpress mt-5 text-5xl text-accent-deep sm:text-5xl">
            <span className="underline-grow">Learn</span> how MochiPOS is built,
            one level at a time.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-text-soft">
            You don&apos;t need to become a full-time engineer. You need to read
            this repo, guide AI agents, review work, and make architectural calls.
            That&apos;s what this curriculum builds — using booth analogies and
            real MochiPOS files, never abstract textbook examples.
          </p>
        </header>

        <div className="rise rise-2">
          <ResumeCallout />
        </div>

        {/* ── Section 1 — Navigation map ─────────────────────────── */}
        <div className="fleuron" aria-hidden="true">
          <span>※</span>
        </div>

        <section className="rise rise-3 panel-quiet relative mt-4 px-6 py-8 sm:px-9 sm:py-10">
          <p className="kicker">Chapter one</p>
          <h2 className="headline-upright mt-3 text-3xl text-accent-deep sm:text-4xl">
            Demo navigation map
          </h2>
          <p className="mt-4 max-w-[62ch] text-text-soft">
            MochiPOS has four audiences and four surfaces. When you run{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-sm text-accent-deep">
              npm run dev
            </code>
            , each URL below opens the section for that audience. Demo data is
            mocked — no real database needed.
          </p>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            <SurfaceTile
              audience="future sellers"
              title="Public marketing"
              body="Where new pet brands sign up. Today this is the first screen you see when you open the dev server — easy to mistake for the whole app."
              links={[
                { href: "/", label: "/" },
                { href: "/apply", label: "/apply" },
              ]}
            />
            <SurfaceTile
              audience="sellers at the booth"
              title="Cashier app"
              body="The heart of the product. Cashier rings up sales, manages inventory, closes the day. Start here."
              links={[
                { href: "/app/pos", label: "/app/pos", primary: true },
                { href: "/app/dashboard", label: "/app/dashboard" },
                { href: "/app/customers", label: "/app/customers" },
                { href: "/app/send-later", label: "/app/send-later" },
                { href: "/app/stock-count", label: "/app/stock-count" },
                { href: "/app/close-day", label: "/app/close-day" },
                { href: "/app/setup/products", label: "/app/setup/products" },
              ]}
            />
            <SurfaceTile
              audience="you (the founder)"
              title="Platform admin"
              body="Approve seller applications, manage workspaces, watch the audit log."
              links={[
                { href: "/admin/applications", label: "/admin/applications" },
                { href: "/admin/workspaces", label: "/admin/workspaces" },
                { href: "/admin/invite-codes", label: "/admin/invite-codes" },
                { href: "/admin/audit-log", label: "/admin/audit-log" },
              ]}
            />
            <SurfaceTile
              audience="pet owners (customers)"
              title="Customer-facing"
              body="What the customer sees: scan QR at the booth to browse the menu (/qr-menu), or after a purchase claim a pet profile via the token link on their receipt (/register/[token])."
              links={[{ href: "/qr-menu", label: "/qr-menu" }]}
            />
          </ul>
        </section>

        {/* ── Section 2 — The 5 levels ───────────────────────────── */}
        <div className="fleuron" aria-hidden="true">
          <span>※</span>
        </div>

        <section className="rise rise-4 panel-quiet relative mt-4 px-6 py-8 sm:px-9 sm:py-10">
          <p className="kicker">Chapter two</p>
          <h2 className="headline-upright mt-3 text-3xl text-accent-deep sm:text-4xl">
            The 5 levels
          </h2>
          <p className="mt-4 max-w-[62ch] text-text-soft">
            Tackle them in order. Each ends with one hands-on exercise inside
            this repo.
          </p>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            <LevelTile
              n={1}
              status="in-progress"
              title="Web app basics"
              body="Frontend vs backend, database, hosting, API. The 5 ideas every level builds on. Booth analogy: cashier, manager, file cabinet, warehouse, intercom."
              exercise="Open DevTools Network tab, watch the frontend↔backend conversation."
              duration="10 min"
            />
            <LevelTile
              n={2}
              status="locked"
              title="Next.js structure"
              body="Pages, layouts, server vs client components, server actions, env vars. How src/app/ folders become URLs."
              exercise="Read /apply end-to-end. Identify which file is server vs client."
              duration="15 min"
            />
            <LevelTile
              n={3}
              status="locked"
              title="Supabase basics"
              body="Tables, columns, primary/foreign keys, Postgres functions, RLS. Why money is satang. Why create_order is a database function, not JavaScript."
              exercise="Read schema.sql + rls-policies.sql for one table. Optional: sign up for Supabase, run schema in SQL editor."
              duration="20 min"
            />
            <LevelTile
              n={4}
              status="locked"
              title="Deployment flow"
              body="GitHub branch → PR → Vercel preview → merge → production. Env vars per environment. The biggest unlock for the project."
              exercise="Provision Supabase + Vercel. Deploy your first change. ~60 min."
              duration="60 min"
            />
            <LevelTile
              n={5}
              status="locked"
              title="SaaS architecture"
              body="Tenant, workspace_id, RLS, audit logs, the 3 layers of tenant defense. Why no seller can ever see another seller's data."
              exercise="Trace tenant rule across schema, RLS, RPCs. Try to leak data — watch RLS block it."
              duration="30 min"
            />
            <LevelTile
              n="★"
              status="locked"
              title="Bonus — ship a mini feature"
              body="Add one small feature to /app/setup/products (duplicate button, sort toggle, inline edit). End-to-end: branch, plan, implement, PR, review, merge, deploy."
              exercise="Pick one feature. Use the AI workflow from LEARNING_AI_WORKFLOW.md."
              duration="2-4 hr"
            />
          </ul>
        </section>

        {/* ── Pull quote ─────────────────────────────────────────── */}
        <div className="fleuron" aria-hidden="true">
          <span>※</span>
        </div>

        <blockquote className="rise rise-5 mt-4 border-l-4 border-gold pl-6 sm:pl-8">
          <p className="font-display text-2xl italic leading-snug text-accent-deep sm:text-3xl">
            The goal isn&apos;t to memorize but to recognize: when an AI agent
            says &ldquo;edit `src/app/app/pos/CartPanel.tsx`,&rdquo; you can
            immediately think &mdash; OK, that&apos;s a client component used
            in the POS page.
          </p>
          <footer className="kicker mt-4">
            The single rule of this curriculum
          </footer>
        </blockquote>

        {/* ── Section 3 — Reference docs ─────────────────────────── */}
        <div className="fleuron" aria-hidden="true">
          <span>※</span>
        </div>

        <section className="rise rise-6 panel-quiet relative mt-4 px-6 py-8 sm:px-9 sm:py-10">
          <p className="kicker">Chapter three</p>
          <h2 className="headline-upright mt-3 text-3xl text-accent-deep sm:text-4xl">
            Reference docs
          </h2>
          <p className="mt-4 max-w-[62ch] text-text-soft">
            Open these whenever you&apos;re lost or curious. They&apos;re for
            lookup, not start-to-finish reading.
          </p>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            <DocTile
              file="LEARNING.md"
              title="Curriculum (master)"
              body="The 5 levels in full detail. Concepts, anchors, exercises, success criteria. Includes the scavenger hunt and the cheat sheet."
            />
            <DocTile
              file="LEARNING_REPO_MAP.md"
              title="Repo map"
              body="Annotated tour of every key folder. Open when an AI agent says 'edit X' and you need to find it."
            />
            <DocTile
              file="LEARNING_GLOSSARY.md"
              title="Glossary"
              body="~80 technical terms in plain language, alphabetical. Tenant, RLS, RPC, hydration, JWT, satang, slug, etc."
            />
            <DocTile
              file="LEARNING_FLOWS.md"
              title="Sequence diagrams"
              body="What happens when you click — for 7 main flows: apply, auth gate, sale, customer portal claim, returning customer, admin approval, login."
            />
            <DocTile
              file="LEARNING_ERRORS.md"
              title="Reading errors"
              body="What error messages mean, by category: TS errors, hydration mismatch, RLS denials, build failures, Vercel errors. Open when something breaks."
            />
            <DocTile
              file="LEARNING_AI_WORKFLOW.md"
              title="Working with AI"
              body="Trigger phrases, prompt anatomy, when to plan vs implement, 10 common AI failure modes specific to this stack, ready-to-use templates."
            />
            <DocTile
              file="LEARNING_TYPESCRIPT.md"
              title="Reading TypeScript"
              body="10-minute cheat sheet. Read TS without learning to write it. Ten patterns + three real examples from MochiPOS."
            />
            <DocTile
              file="ROADMAP.md"
              title="Strategic roadmap"
              body="Where MochiPOS is going. Beachhead, vertical modules, Google Auth + invite, three-level data philosophy, six-month plan, pricing."
            />
          </ul>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href="/" className="btn-link">
            ← Marketing home
          </Link>
          <a
            href={REPO_DOC("LEARNING.md")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-link"
          >
            Open LEARNING.md on GitHub →
          </a>
        </footer>
      </main>
    </div>
  );
}

function ResumeCallout() {
  return (
    <section className="panel relative mt-10 px-6 py-7 sm:px-8 sm:py-8">
      <span className="panel-tag">Today</span>
      <h2 className="headline-upright mt-2 text-2xl text-accent-deep sm:text-3xl">
        Level 1 — exercise pending
      </h2>
      <p className="mt-4 max-w-[62ch] text-text-soft">
        You&apos;ve been taught the 5 ideas of web app basics: frontend,
        backend, database, hosting, API. Now do the 10-minute DevTools
        exercise so the picture becomes concrete.
      </p>
      <ol className="mt-5 space-y-2.5 text-sm text-text-soft">
        <li className="flex gap-3">
          <span className="num mono font-bold text-accent-strong">1.</span>
          <span>
            In Terminal inside{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              pos-for-sell/
            </code>
            , run{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              npm run dev
            </code>
            .
          </span>
        </li>
        <li className="flex gap-3">
          <span className="num mono font-bold text-accent-strong">2.</span>
          <span>
            Open{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              http://localhost:3000
            </code>{" "}
            in your browser.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="num mono font-bold text-accent-strong">3.</span>
          <span>
            Press{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              F12
            </code>
            , click the <strong>Network</strong> tab, clear it.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="num mono font-bold text-accent-strong">4.</span>
          <span>
            Click around{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              /apply
            </code>
            ,{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              /app
            </code>
            ,{" "}
            <code className="mono rounded bg-soft px-1.5 py-0.5 text-xs text-accent-deep">
              /app/pos
            </code>
            .
          </span>
        </li>
        <li className="flex gap-3">
          <span className="num mono font-bold text-accent-strong">5.</span>
          <span>
            Click any row to see Headers (request) and Response (server&apos;s
            reply). That IS the frontend↔backend conversation.
          </span>
        </li>
      </ol>
      <p className="mt-5 text-sm text-muted">
        When you&apos;re done, tell Claude what you saw. Then Level 2 unlocks.
      </p>
    </section>
  );
}

function LevelTile({
  n,
  status,
  title,
  body,
  exercise,
  duration,
}: {
  n: number | string;
  status: Status;
  title: string;
  body: string;
  exercise: string;
  duration: string;
}) {
  return (
    <li>
      <article className="panel-quiet h-full p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="num mono flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold-soft text-base font-bold text-accent-deep">
            {n}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="headline-upright text-xl text-accent-deep">
                {title}
              </h3>
              <StatusBadge status={status} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-soft">{body}</p>
            <div className="mt-3 rounded-[var(--radius-md)] border border-line-soft bg-soft/40 px-3 py-2 text-xs text-text-soft">
              <span className="kicker mr-1 text-accent-strong">Exercise</span>{" "}
              {exercise}
              <span className="num mono ml-2 text-muted">({duration})</span>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    "in-progress": { label: "in progress", cls: "chip chip-warn" },
    locked: { label: "locked", cls: "chip chip-neutral" },
    done: { label: "done", cls: "chip chip-ok" },
  };
  const cfg = map[status];
  return <span className={cfg.cls}>{cfg.label}</span>;
}

function SurfaceTile({
  audience,
  title,
  body,
  links,
}: {
  audience: string;
  title: string;
  body: string;
  links: { href: string; label: string; primary?: boolean }[];
}) {
  return (
    <li>
      <article className="panel-quiet h-full p-5 sm:p-6">
        <p className="kicker">For {audience}</p>
        <h3 className="headline-upright mt-2 text-xl text-accent-deep">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-soft">{body}</p>
        <ul className="mono mt-4 flex flex-wrap gap-1.5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  link.primary
                    ? "inline-block rounded-[var(--radius-md)] border border-accent bg-gold-soft px-2 py-1 text-[11px] font-bold text-accent-deep transition-colors hover:bg-gold/30"
                    : "inline-block rounded-[var(--radius-md)] border border-line bg-panel px-2 py-1 text-[11px] font-bold text-text-soft transition-colors hover:border-accent hover:text-accent-strong"
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </li>
  );
}

function DocTile({
  file,
  title,
  body,
}: {
  file: string;
  title: string;
  body: string;
}) {
  return (
    <li>
      <a
        href={REPO_DOC(file)}
        target="_blank"
        rel="noopener noreferrer"
        className="panel-quiet block h-full p-5 transition-colors hover:border-accent sm:p-6"
      >
        <h3 className="headline-upright text-xl text-accent-deep">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-soft">{body}</p>
        <p className="mono mt-3 text-[11px] font-bold uppercase tracking-wider text-muted">
          docs/{file}
        </p>
      </a>
    </li>
  );
}
