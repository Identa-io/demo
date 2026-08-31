# Geena journey

One user journey across three small fictional companies, each built on **Connect with Geena** —
and one public reference integration. The journey sells the UX; this repo sells the code:
everything a partner needs is in `src/lib/geena/` (~2 files) plus one redirect and one callback
route.

The chapters are walked **in order** (5–10 minutes end to end), and each proves one thing:

| Chapter | Demo         | Scenario                                    | Proves                                                                                                                                  |
| ------- | ------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **1**   | **Yield**    | opening an account at a fund platform       | "Type it once": KYC-grade data typed into YOUR vault, not their form — fill in place, update in place, the org reads the current version |
| **2**   | **Signalio** | subscribing to market research              | "Never type it again": every ask already in the vault — zero typing, zero passwords — and a deliberately minimal manifest                |
| **3**   | **Cover**    | travel insurance for you and your children  | The new shapes: family subjects without "child 1 / child 2" forms, per-person pricing, and a file slot with a switching discount         |

Every demo is exactly three happy-path screens: a **landing** (one "Connect with Geena" button),
a **form stage** (what the vault resolves, plus the demo's own choices), and a **finish** screen
whose handoff card advances the journey. Chapter-finish CTAs route through the hub
(`/?done=yield&next=signalio`) so progress lands in a hub-origin cookie — the demos are separate
origins with host-only cookies, on purpose.

## How a demo connects

```
"Connect with Geena" clicked
  ├─ /api/auth/start        mints state + PKCE verifier (server-side), 302 →
  │     GET {GEENA}/oauth/authorize?client_id&redirect_uri&state
  │         &code_challenge (S256) &manifest_id=<this demo's manifest>
  ├─ Geena's hosted ceremony (sign in / sign up THERE, one consent screen;
  │     return visits with an active connection skip consent entirely)
  ├─ /api/auth/callback     checks state, exchanges the code + verifier →
  │     tokens **and request_id** (no out-of-band request discovery)
  ├─ /api/data              GET /partner/v1/requests/{id}/status, then values
  │     for granted slots — always the CURRENT version; pending slots stay a
  │     status word (indistinguishable from refused — the oracle rule)
  └─ pending slots fill in-app through /partner/v1 (candidates → attach/create),
      every act user-present and receipted; the demos also deep-link to the
      person's own Geena
```

Integration rules this repo models on purpose:

- **Tokens never reach the browser.** The client secret, the code exchange, and every
  `/partner/v1` call live in the coordinator (`src/app/api/*`); the browser holds an opaque
  session id.
- **Token refresh is single-flight.** Geena's refresh rotation is strict single-use and reuse
  revokes the whole family — two parallel refreshes log your user out. See `liveTokens()`.
- **Disconnect is real.** `/oauth/revoke` tears the whole connection down — Cover's traveller
  list and Signalio's mandate data are gone from the org's side, not archived.
- **Cookies are host-only.** Each demo is its own origin; a `Domain=` cookie would undo that.
  (The journey-progress cookie lives on the HUB origin for the same reason.)
- **Slot ids are never hard-coded** — they are minted at publish and read from `status`.
- **Sensitive identifiers render masked** (IBANs, document numbers, tax ids) — a review screen
  needs recognition, not exposure.

## Running it

Requirements: Node 20+, a Geena environment (the public site runs against test), and one
organization + OAuth app + published manifest per demo.

1. **Create the three orgs and apps** on the Geena dashboard (_Organization → Apps → New app_).
   The `client_id` is the slug you choose; the secret is shown **exactly once** — put it in
   `.env` in the same breath. Each app's `allowedOrigins` must contain the **exact origin** the
   demo runs on — scheme + host + port, no path, matched as a string. For local dev register
   both `http://localhost:3005` (path-style browsing) and `http://yield.localhost:3005`
   (subdomain-style); deployed, add `https://yield.demo.test.geena.eu`. Getting this wrong is
   the classic first failure: `/oauth/authorize` answers "invalid redirect_uri for this
   client". Origins are editable afterwards by a platform admin (_Admin → Partners_).
2. **Publish the manifests.** The authoring inputs are checked in under `manifests/` — import
   them in the studio (Manifests → Import JSON) or via `manifestCreate`, then publish. They
   carry `initiation: BOTH` (the "Connect with Geena" button may open them) and the full verb
   set (`fill`/`edit`/`keep`; Cover's policy-file slot skips `edit` — file stores have no
   delegated write). The default seeded business plan is a plain ask, so a platform admin must
   put the three demo orgs on a plan whose capability covers these targets and verbs — note
   that Yield's `PersonIdentityDocument` is new relative to the old demo set — otherwise the
   ceremony refuses with a capability error. Copy each published manifest id into `.env`.
3. Configure and run:

```bash
cp .env.example .env   # fill in secrets + manifest ids
npm install
npm run dev            # http://localhost:3005
```

The hub lists the chapters path-style (`/yield`); the subdomain shape also works locally out of
the box — `http://yield.localhost:3005` — since browsers resolve `*.localhost` without any
hosts-file setup. Deployed, each demo lives on its own subdomain and the middleware
(`src/middleware.ts`) does the mapping (and records journey progress on the hub).

## The journey's data math

Chapter 1 seeds the vault with 8 data points (name, birth date, ID document, email, phone,
address, IBAN, tax residency). Chapter 2's four asks are a strict subset — zero typing, by
construction. Chapter 3 prefills the policyholder from the same vault; only the children (two
data points each) and one optional file are new. Re-running the journey makes chapter 3
zero-typing too — the children are vault data by then. Keep the manifests aligned with this
overlap when editing them: the subset relation IS the demo.

## Layout

```
manifests/            the three asks, verbatim (authoring input for the studio)
src/lib/geena/        the reference client: oauth.ts (ceremony, refresh, revoke),
                      partner.ts (status, slots, candidates, files, subjects)
src/lib/session.ts    server-side session store — the only place tokens live
src/app/api/          the coordinator: start, callback, data, fill surface, subjects,
                      file proxy, revoke, backstage
src/app/{yield,signalio,cover}/   the three chapters — landing, form stage, finish each
src/components/       the Geena button (identical everywhere — on purpose), the journey
                      bar + the backstage drawer (manifest, connection ids, API log)
```

Every page has a **Backstage** button (bottom right): the manifest the demo opens, the live
`request_id`, and every upstream call this session made — method, path, status, latency. The
journey sells the UX; backstage sells the integration.

All brands are fictional; all figures (fund returns, subscription prices, premiums) are
illustrative. No payments happen, and nothing is stored beyond an in-memory demo session (a real
partner would persist tokens encrypted — the comments say so where it matters).
