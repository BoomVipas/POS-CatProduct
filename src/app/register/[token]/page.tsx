import Link from "next/link";
import { RegisterClient } from "./RegisterClient";

/**
 * Customer Portal landing page (Wave 40b — demo mode).
 *
 * Renders against a token from the URL. The token IS the credential.
 * Demo mode reads/writes localStorage; when Wave 40a (PR #5) merges
 * + Supabase wires up, this becomes a server-component fetch using
 * the admin Supabase client to validate the token before render.
 *
 * Per VISION.md: this page must work without auth. The customer scans
 * a QR or follows a share link from the seller's receipt; they never
 * sign in. Token validation + claim are the only writes; both go
 * through the server-side claim_registration_token RPC in production.
 */
export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 8) {
    return (
      <div className="theme-public">
        <main className="mx-auto w-full max-w-md px-5 py-12 sm:py-16">
          <div className="rise rise-1 mb-6 text-center">
            <span className="kicker kicker-gold">Cat Booth Portal</span>
          </div>
          <div className="rise rise-2 relative">
            <div className="panel-lift p-7 sm:p-8 text-center">
              <span className="panel-tag mono">Link</span>
              <div className="mt-2 flex justify-center">
                <span className="chip chip-danger">Invalid link</span>
              </div>
              <h1 className="headline letterpress mt-5 text-4xl text-accent-deep">
                This <span className="underline-grow">link</span>
                <br />
                doesn&apos;t look right.
              </h1>
              <p className="mx-auto mt-5 max-w-[42ch] text-[0.95rem] leading-relaxed text-text-soft">
                The registration link is malformed. Ask the booth staff for a
                new one — they can re-issue it from the receipt screen.
              </p>
              <div className="fleuron mt-7"><span>※</span></div>
              <div className="mt-5 flex justify-center">
                <Link href="/" className="btn-accent btn-xl">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="theme-public">
      <RegisterClient token={token} />
    </div>
  );
}

export const dynamic = "force-dynamic";
