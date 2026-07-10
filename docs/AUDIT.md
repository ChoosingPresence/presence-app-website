# Project Audit — 2026-07-10

A record of what was built, how it got deployed, what went wrong along the
way, and the current verified state. Written so a future session (human or
AI) can pick this project up without re-deriving any of this from scratch.

## What this project is

A static marketing/information site for **Practicing Presence**, a free
Christian mindfulness app by B:Drive Communications, LLC. The site doesn't
host the app — it explains it, links to the App Store/Google Play, embeds
tutorial videos, and connects visitors to Choosing Presence and the book
*Choosing Presence* by Jim Heaney.

## Timeline of this build

1. **Scaffolded** as an Astro 5 (later upgraded to 7) static site, using brand
   assets pulled directly from the app's own repo (`GitHub Repo/practicing-presence-app-main/assets/`)
   — the app icon, book cover, and five simulator screenshots. Palette and
   type derived from those assets (Quicksand substituting for the app's
   licensed Gotham Rounded, which isn't cleared for web embedding).
2. **Repo created** at `github.com/ChoosingPresence/presence-app-website`,
   public, under the `ChoosingPresence` GitHub account (separate from the
   personal `b-drive-us` account also used on this machine).
3. **Domain confusion, resolved**: the original brief specified `presence.app`.
   That domain turned out to be registered on **AWS Route 53** and was never
   connected to Cloudflare in any way. Separately, `practicingpresence.app`
   *was* already registered and active on Cloudflare, under a distinct
   Cloudflare account that Brian had set up independently (account details
   kept out of this public repo — see private project notes). Once confirmed
   with Brian, all site config and copy were repointed to
   `practicingpresence.app` — that is the domain in use.
4. **Cloudflare Pages project created and deployed** via direct API calls and
   `wrangler pages deploy` (not the dashboard's Git-integration flow — see
   "Known issues" below). A scoped, short-lived Cloudflare API token was used
   for each action and never written to disk or committed.
5. **A misconfigured Redirect Rule was found and fixed**: a "Redirect from WWW
   to root" rule was scoped to "All incoming requests" instead of just the
   `www` hostname, which caused the apex domain to redirect to itself in an
   infinite loop and blocked Cloudflare's automatic custom-domain DNS
   verification. Brian fixed the rule's condition directly in the dashboard;
   the apex domain came up immediately after.
6. **Verified live**, then this audit pass: security review, responsive review
   across 320px–1920px, documentation corrected to match reality (it
   previously described a Git-integration deploy flow that was never actually
   connected), and `wrangler.jsonc` added for reproducible future deploys.

## Current live state (verified 2026-07-10)

| Check | Result |
| --- | --- |
| `https://practicingpresence.app` | 200, correct content |
| TLS certificate | Valid, Google Trust Services, issued 2026-07-10, expires 2026-10-08 |
| HTTP → HTTPS redirect | 301, working |
| 404 handling | Correct 404 status on unknown paths |
| Security headers | All present and correct (CSP, HSTS, X-Frame-Options, Permissions-Policy, COOP/CORP, Referrer-Policy) |
| `npm audit` | 0 vulnerabilities |
| Inline scripts/styles in build output | None (only the static JSON-LD block, which is data not script) |
| Secrets in repo or git history | None found |
| Responsive (320px–1920px, all 4 pages) | No horizontal scroll or overflow anywhere; verified via browser automation, not just visual inspection |

## Known open issues (not yet fixed)

1. **`www.practicingpresence.app` redirects with an empty `Location` header.**
   The redirect rule's `wildcard_replace(http.request.full_uri, "https://www.*", "https://${1}")`
   expression isn't evaluating correctly — it's fixed in scope (only fires for
   `www`) but the target URL it produces is empty. Needs a look at the actual
   rule expression in the dashboard. Not blocking — the apex domain (the
   canonical URL used everywhere) works correctly.
2. **`robots.txt` serves a stale cached sitemap URL.** Even after redeploying
   with the corrected domain, the live `/robots.txt` shows an old sitemap URL
   underneath Cloudflare's own injected "Managed robots.txt" content-signals
   block. This looks like a caching layer specific to that Cloudflare feature,
   separate from normal edge cache — a `purge_cache` API call needs **Cache
   Purge** permission, which wasn't granted on the working token. Cosmetic
   only; doesn't affect crawling (search engines discover sitemaps via other
   means too).
3. ~~Git integration is not connected.~~ **Resolved 2026-07-10.** Brian
   connected it via the dashboard (required a human to authorize the GitHub
   App — can't be done via API/CLI). Verified working: the very next push
   (this audit's commit) auto-triggered a full clone → build → deploy cycle
   that succeeded in ~30 seconds. See docs/DEPLOYMENT.md.

## Notable technical gotchas discovered (for future reference)

- **Wrangler 4.110.0 bug**: `wrangler pages project create --production-branch <x>`
  triggers a broken internal "Pages-to-Workers delegation" codepath that
  silently ignores `CLOUDFLARE_ACCOUNT_ID` and hardcodes a stale account ID,
  producing an opaque `Authentication error [code: 10000]`. Worked around by
  creating the project via a direct Cloudflare API `POST` call instead;
  `wrangler pages deploy` (the actual file upload) is unaffected.
- **Cloudflare Pages `wrangler.jsonc` schema**: once `pages_build_output_dir`
  is set, the Pages config validator explicitly **rejects** an `account_id`
  field (confirmed by testing — it works fine without `pages_build_output_dir`,
  but throws `Configuration file for Pages projects does not support "account_id"`
  once it's added). Account resolution instead relies on the API token being
  scoped to exactly one account, or `CLOUDFLARE_ACCOUNT_ID` passed explicitly.
- **Astro 7 whitespace collapsing**: line breaks immediately before/after an
  inline element (`<a>`, `<em>`, `<strong>`) get collapsed away entirely in
  the rendered output, producing "AndThree questions" instead of "And three
  questions". Fixed throughout with explicit `&#32;` at those boundaries.
- **Cloudflare API token scoping is easy to get wrong via the dashboard.** In
  this session it took three attempts to get "Account Resources" bound
  correctly on a custom token — an unbound Account/Zone Resources selector
  produces a token that verifies as "active" but returns empty results for
  everything, which looks identical to a permissions problem from the outside.

## Cloudflare account reference

- **Pages project**: `presence-app-website`
- **Zone**: `practicingpresence.app`
- Account credentials, account ID, and zone ID are intentionally **not**
  recorded in this public repo — ask Brian for access. No persistent CLI
  login exists for this account on any machine; every session that needs to
  deploy or manage it requires a fresh, scoped API token from Brian (see
  docs/DEPLOYMENT.md for the exact scopes to request).
