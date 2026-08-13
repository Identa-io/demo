# Geena demos

Three small fictional companies, each built on **Connect with Geena** — and one public reference
integration. The demos sell the UX; this repo sells the code: everything a partner needs is in
`src/lib/geena/` (~2 files) plus one redirect and one callback route.

| Demo      | Scenario                                   | Proves                                                                                                                               |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Vinst** | opening an account with a fund platform    | KYC-grade autofill: identity, payout account and tax residency arrive from the vault, current on every visit                         |
| **Resa**  | travel insurance for you and your children | family data without "child 1 / child 2" forms — per-person pricing over exactly the children you chose to cover                      |
| **Vagn**  | renting a car with a real account          | passwordless login (Geena is the whole auth stack), a licence shared without attachments, and a revocation that actually ends access |

## How a demo connects

```
"Continue with Geena" clicked
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
  └─ granting happens in the person's own Geena; the demos deep-link to it
```

Integration rules this repo models on purpose:

- **Tokens never reach the browser.** The client secret, the code exchange, and every
  `/partner/v1` call live in the coordinator (`src/app/api/*`); the browser holds an opaque
  session id.
- **Token refresh is single-flight.** Geena's refresh rotation is strict single-use and reuse
  revokes the whole family — two parallel refreshes log your user out. See `liveTokens()`.
- **Logout ≠ disconnect.** Vagn's logout ends the app session and touches nothing at Geena;
  disconnect (`/oauth/revoke`) tears the connection down. Two buttons, two meanings.
- **Cookies are host-only.** Each demo is its own origin; a `Domain=` cookie would undo that.
- **Slot ids are never hard-coded** — they are minted at publish and read from `status`.
- **Sensitive identifiers render masked** (account numbers, tax ids) — a review screen needs
  recognition, not exposure.

## Running it

Requirements: Node 20+, a Geena environment (the public site runs against test), and one
organization + OAuth app + published manifest per demo.

1. **Create the three orgs and apps** on the Geena dashboard (_Organization → Apps → New app_).
   The `client_id` is the slug you choose; the secret is shown **exactly once** — put it in
   `.env` in the same breath. Each app's `allowedOrigins` must contain the origin the demo runs
   on (`http://vinst.localhost:3005` for dev, `https://vinst.demo.test.geena.eu` deployed).
2. **Publish the manifests.** The authoring inputs are checked in under `manifests/` — import
   them in the studio (Manifests → Import JSON) or via `manifestCreate`, then publish. They
   carry `initiation: BOTH` (the "Continue with Geena" button may open them) and the full verb
   set (`fill`/`edit`/`keep`; the licence slot skips `edit` — file stores have no delegated
   write). The default seeded business plan is a plain ask, so a platform admin must put the
   three demo orgs on a plan whose capability covers these targets and verbs — otherwise the
   ceremony refuses with a capability error. Copy each published manifest id into `.env`.
3. Configure and run:

```bash
cp .env.example .env   # fill in secrets + manifest ids
npm install
npm run dev            # http://localhost:3005
```

The landing page lists the demos path-style (`/vinst`); the subdomain shape also works locally
out of the box — `http://vinst.localhost:3005` — since browsers resolve `*.localhost` without
any hosts-file setup. Deployed, each demo lives on its own subdomain and the middleware
(`src/middleware.ts`) does the mapping.

## Layout

```
manifests/            the three asks, verbatim (authoring input for the studio)
src/lib/geena/        the reference client: oauth.ts (ceremony, refresh, revoke),
                      partner.ts (status, slots, files)
src/lib/session.ts    server-side session store — the only place tokens live
src/app/api/          the coordinator: start, callback, data, file proxy, revoke,
                      vagn login/logout, backstage
src/app/{vinst,resa,vagn}/   the three brands
src/components/       the Geena button (identical everywhere — on purpose) +
                      the backstage drawer (manifest, connection ids, API log)
```

Every page has a **Backstage** button (bottom right): the manifest the demo opens, the live
`request_id`, and every upstream call this session made — method, path, status, latency. The
demos sell the UX; backstage sells the integration.

All brands are fictional; all figures (fund returns, premiums, rental prices) are illustrative.
No payments happen, and nothing is stored beyond an in-memory demo session (a real partner would
persist tokens encrypted — the comments say so where it matters).
