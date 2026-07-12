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
7. **www redirect fixed, robots.txt investigated and deprioritized.** The
   `www` redirect rule's broken `wildcard_replace()` expression was replaced
   with a static redirect. The stale `robots.txt` sitemap URL survived a
   targeted purge, a full zone purge, and toggling the Manage Robots.txt
   setting — concluded to be a frozen snapshot inside Cloudflare's AI Crawl
   Control feature with no exposed fix; parked as low-impact.
8. **Visual refresh**: phone-frame bezels added to all screenshots (not just
   the hero image), full dark mode with a header toggle (follows OS
   preference by default, persisted via `localStorage` on explicit choice),
   and a mobile hamburger menu replacing the wrapping nav. See "Dark mode /
   hamburger menu implementation" below for what this actually touched and
   how it was verified.

## Dark mode / hamburger menu implementation (2026-07-10)

**Architecture**: all color is now driven by CSS custom properties in
`src/styles/global.css` — fixed brand colors stay constant across themes;
semantic tokens (`--ink`, `--surface`, `--heading`, `--link`, etc.) flip via
`@media (prefers-color-scheme: dark)` for the OS-default case and
`:root[data-theme='dark'|'light']` for an explicit toggle choice (which always
wins over the OS setting). A ~30-line script in `Header.astro` applies the
attribute on load and on toggle click, and persists explicit choices to
`localStorage`.

**A real bug caught before shipping**: Astro's build was **inlining** the
toggle script directly into the HTML (`<script type="module">` with no `src`)
rather than emitting it as an external file — small scripts fall under Vite's
default asset-inlining threshold. The site's CSP (`script-src 'self'`) would
have silently blocked this inline script in the browser, breaking both the
theme toggle and the hamburger menu on the live site while the build itself
reported success. Fixed by setting `vite.build.assetsInlineLimit: 0` in
`astro.config.mjs`, forcing all scripts to be emitted as external, hashed,
same-origin files. Verified by inspecting the built HTML directly
(`grep -o '<script[^>]*>' dist/index.html`) before and after.

**Contrast was checked mathematically, not just visually assumed.** WCAG
relative-luminance contrast ratios were computed for every text/background
combination introduced or affected by dark mode. This caught one real
pre-existing-color-now-broken issue: the link color (brand `--teal-600`,
unchanged since it wasn't originally theme-aware) only achieved 3.67:1
contrast against the new dark page background — failing WCAG AA for normal
text (needs 4.5:1). Added dedicated `--link`/`--link-hover` tokens with
dark-mode-specific values (`#5fb3b8` / `#7bd0d4`) that clear 6.3–9.9:1 against
both dark surfaces. All other text/background pairs introduced by dark mode
were verified ≥8:1. (One pre-existing, unrelated, borderline issue was found
and left as-is: white text on the `.button--sage:hover` state is 3.71:1,
under the 4.5:1 normal-text threshold though over the 3:1 large-text one —
affects both themes equally, not a dark-mode regression, minor.)

**Header breakpoint was derived, not guessed.** Adding the theme toggle to
the header increases the desktop nav's minimum width. A rough calculation
(brand + toggle + 3 nav links + CTA button + container padding) estimated
~771px needed — comfortably inside the original 640px mobile breakpoint,
which would have caused the desktop nav to visibly crowd or wrap in the
640–771px range. Raised to 860px (nav shows ≥861px) to give real margin;
iPad-portrait (768px) now cleanly gets the hamburger menu instead of a
cramped nav bar.

**Verification method and its limits**: build correctness, CSP compliance,
and color contrast were all verified directly against the compiled build
output (reading `dist/_astro/*.css` and `dist/_astro/*.js`, and computing
contrast ratios programmatically) and by manually tracing the toggle script's
logic. **Live browser interaction testing (actually clicking the toggle and
hamburger, visually inspecting both themes) could not be completed** — the
Claude in Chrome extension was unreachable for the whole session. This is a
real gap: static analysis catches logic and contrast errors but can't catch
things like a click target being visually misaligned or a transition looking
janky. Recommend an actual click-through in both themes, at a few
breakpoints, before considering this fully done.

## Current live state

**⚠️ As of 2026-07-10 18:35 UTC, `https://practicingpresence.app` is serving a
stale, frozen edge-cache snapshot** — see "Stuck edge cache" in Known open
issues below. The underlying deployment is 100% correct and fully verified
(see "Dark mode / hamburger menu implementation" above and the deployment
checks below), confirmed by hitting the Pages project's raw `.pages.dev` URL
directly, bypassing the zone's cache entirely. This is a Cloudflare
platform-side caching anomaly, not a problem with the code or the deploy.
**Before trusting anything served at the custom domain, re-check
`cf-cache-status` and the ETag against what's below — if the ETag still
reads `3af2fb23a51413e1b0360e7c15147441`, the cache still hasn't cleared.**

| Check | Result | Verified via |
| --- | --- | --- |
| Deployment content (latest commit) | Correct — theme toggle, hamburger menu, phone-frames all present | Direct `presence-app-website.pages.dev` fetch, bypassing zone cache |
| `https://practicingpresence.app` | 200, but **stale content** (frozen since ~13:55 UTC, predates even the domain-rename commit) | Repeated `curl` with cache-busting query strings; same ETag every time |
| TLS certificate | Was valid (Google Trust Services) before the 18:34 UTC domain detach/reattach; re-verify after reattach fully settles | — |
| HTTP → HTTPS redirect | 301, working (as of last check before the cache issue was found) | `curl` |
| 404 handling | Correct 404 status on unknown paths (as of last check) | `curl` |
| Security headers | All present and correct on every response seen so far, stale or fresh (CSP, HSTS, X-Frame-Options, Permissions-Policy, COOP/CORP, Referrer-Policy) | `curl -I`, checked repeatedly through the cache investigation |
| `npm audit` | 0 vulnerabilities | `npm audit`, last run 2026-07-10 |
| Inline scripts/styles in build output | None (only the static JSON-LD block, which is data not script) | `grep` across all `dist/*.html` |
| Secrets in repo or git history | None found | `git grep` + `git log -p` |
| Responsive (320px–1920px, all 4 pages) | No horizontal scroll or overflow anywhere | Browser automation (pre-dark-mode content only — see caveat below) |
| Dark mode / hamburger interactions | Logic and CSS verified via compiled build output + manual tracing | **Not** verified via live browser click-through — Claude in Chrome was unreachable all session |

### Stuck edge cache — full investigation trail (2026-07-10)

Discovered when the post-deploy live check showed content that predated the
push. Confirmed via `curl` with unique cache-busting query strings and
`Cache-Control: no-cache` request headers — none of which affect Cloudflare's
own edge cache decision (that's normal; client request headers don't bypass
Cloudflare's cache, only origin/zone-side purges do). The response's own
`ETag` (`3af2fb23a51413e1b0360e7c15147441`) never changed across the entire
investigation, confirming it's a single frozen cached object being
consistently re-served, not propagation lag or random edge-node variance.

Tried, in order, all with no effect on the served content:
1. Targeted `Custom Purge` for `/robots.txt` (this was the *original* stale
   content discovery, from earlier in the same session)
2. Targeted `Custom Purge` for `https://practicingpresence.app/`
3. Full zone `Purge Everything`
4. Checked **Rules → Cache Rules** — empty, nothing configured
5. Checked **Rules → Page Rules** — empty, nothing configured
6. Checked for an "Always Online" toggle — not present/not found in this
   dashboard
7. Full zone `Purge Everything` a second time
8. **Complete custom-domain detach/reattach** on the Pages project (DELETE
   then POST via the Pages API — gets a brand new `domain_id`, so this is a
   genuinely fresh provisioning, not reuse of old state). This specifically
   rules out the staleness being tied to the Pages↔domain routing binding,
   since that binding was fully destroyed and recreated and the exact same
   ETag still came back.

The origin (Cloudflare Pages) sends `Cache-Control: public, max-age=0,
must-revalidate` on every response — instructing the edge not to cache
without revalidating. The edge cache ignoring this, and surviving 5 separate
purge operations plus a full domain rebind, is not normal Cloudflare
behavior and looks like a genuine platform-side bug or stuck internal state
specific to this zone, not something fixable via any dashboard setting or
API call available on a free-tier account.

**Decision (2026-07-10, Brian)**: no paid Cloudflare plan (so no direct
support chat access); rather than pursue the community/support form
immediately, wait and re-check the next day in case it self-clears (some
Cloudflare cache anomalies do resolve on their own over longer TTL windows
even when purges don't touch them).

**To re-check**: `curl -sD - "https://practicingpresence.app/?cb=$(date +%s)" -o /dev/null | grep -i etag` —
if the ETag differs from `3af2fb23a51413e1b0360e7c15147441`, the cache has
cleared; re-verify the full page content and all interactive features from
there.

### Update (2026-07-12): full zone deletion/recreation attempted, did not fix it

Waited a full day (per the decision above); the ETag was unchanged, so tried
the most drastic self-service option available: **fully deleted the
`practicingpresence.app` zone and recreated it** (new nameservers issued,
updated at the registrar (Namecheap), zone confirmed Active — same zone ID
was reissued by Cloudflare, suggesting a soft-delete/reactivation rather than
a truly from-scratch zone, though the nameserver/DNS layer was genuinely
cycled). Also fully detached and reattached the Pages custom domain a second
time afterward (new `domain_id` both times, confirmed via API — a genuinely
fresh binding each time).

**Result: no effect.** Same byte-for-byte content, same ETag
(`3af2fb23a51413e1b0360e7c15147441`), confirmed via multiple independent
vantage points — not just repeated `curl` calls with cache-busting query
strings and forced fresh DNS resolution (`--resolve`), but also a
third-party fetch proxy (allorigins.win) entirely unrelated to this
session's network path, which returned the identical stale content. This
rules out the staleness being any kind of local/session-side artifact — it
is genuinely Cloudflare's infrastructure serving frozen content to everyone,
survived a full zone rebuild.

**Filed with Cloudflare community support**: 2026-07-12,
https://community.cloudflare.com/t/edge-cache-serving-frozen-stale-content-survived-full-zone-deletion-recreation/939328
— includes exact repro steps (curl commands comparing the custom domain vs.
the Pages project's own `.pages.dev` subdomain, which correctly serves fresh
content), a Ray ID (`a19f41439cb4b002-ORD`) for Cloudflare to trace
internally, and the full list of remediation attempts above. No paid plan,
so this is the community form rather than a direct ticket — response time
unknown. **Check this thread for replies before doing anything else on this
issue.** (Note: the forum itself sits behind a Cloudflare bot-check page, so
it can't be fetched/monitored programmatically — a human needs to check it.)

## Known open issues

0. **Stuck edge cache serving stale content at the custom domain — ACTIVE,
   HIGHEST PRIORITY.** See the full "Stuck edge cache" investigation and its
   2026-07-12 update above. Survived a full zone deletion/recreation.
   **Filed with Cloudflare community support 2026-07-12**:
   https://community.cloudflare.com/t/edge-cache-serving-frozen-stale-content-survived-full-zone-deletion-recreation/939328
   — check that thread for replies (can't be monitored programmatically,
   sits behind a bot-check page) before trying anything further yourself.
   Check the ETag first thing next session either way.
1. ~~`www.practicingpresence.app` redirects with an empty `Location` header.~~
   **Resolved 2026-07-10.** The broken `wildcard_replace()`-based rule was
   replaced with a static redirect (Hostname equals `www.practicingpresence.app`
   → static target `https://practicingpresence.app`, 301). Verified: 301 with
   correct `Location` header, follows through to 200.
2. **`robots.txt` serves a stale, frozen sitemap URL — deprioritized, likely
   not fixable from the dashboard.** Live `/robots.txt` shows
   `Sitemap: https://presence.app/sitemap-index.xml` (the old, wrong domain)
   underneath Cloudflare's injected "AI Crawl Control" / Content Signals
   block, even though the actual origin `public/robots.txt` has said
   `practicingpresence.app` since 2026-07-10. Investigated thoroughly:
   - Targeted `Custom Purge` of the URL: no effect.
   - Full zone `Purge Everything`: no effect — response still showed
     `cf-cache-status: HIT` with an unchanged ETag afterward, meaning this
     isn't in the normal CDN cache at all.
   - Toggling the "Manage Robots.txt" setting off/on: no effect (same ETag
     before and after).
   - No dashboard UI could be found to directly edit the injected content or
     force a re-fetch from origin.

   Conclusion: this looks like a one-time snapshot Cloudflare's AI Crawl
   Control feature took of the origin `robots.txt` (probably when the feature
   was first enabled on the zone), served indefinitely thereafter,
   independent of both normal cache and the live origin content. No
   user-facing fix was found. Brian has decided to **deprioritize** this —
   impact is low (a sitemap pointer to an unrelated, non-functional domain;
   doesn't block crawling, search engines discover the sitemap via other
   means, e.g. direct Search Console submission). If revisited: contacting
   Cloudflare support directly is the most likely path to an actual fix,
   since the behavior isn't exposed as a dashboard setting.
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
