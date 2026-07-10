# Deployment — Cloudflare Pages

The site is a fully static Astro build. Cloudflare Pages serves `dist/` on its
global CDN and applies `public/_headers` to every response.

## Current live setup (as of 2026-07-10)

| | |
| --- | --- |
| **Live URL** | https://practicingpresence.app |
| **Cloudflare account** | A dedicated account, separate from any personal Cloudflare login. Account ID/credentials are intentionally not recorded in this public repo — ask Brian for access. There is no persistent CLI session for it on any machine; deploying requires a fresh scoped API token each time (see below). |
| **Pages project** | `presence-app-website` |
| **Zone** | `practicingpresence.app`, already on Cloudflare DNS |
| **Deploy method** | **Git integration is connected** (confirmed 2026-07-10). Pushing to `main` on GitHub automatically builds (`npm run build`) and deploys via Cloudflare's pipeline — no manual step needed. Direct-upload (`wrangler pages deploy`) still works as a manual fallback (see below). |

> **Note on the domain:** the site was originally scoped for `presence.app`, but
> that domain is registered on AWS Route 53 and was never connected to
> Cloudflare. `practicingpresence.app` is the domain actually set up in
> Cloudflare and is the one this project uses. If `presence.app` is ever moved
> to this Cloudflare account, treat it as a new custom-domain addition, not a
> rename.

## Deploying

**Normal path: just push to `main`.** Git integration is connected — Cloudflare
clones the repo, runs `npm run build`, and deploys `dist/` automatically on
every push. Check progress and history in the dashboard under the
`presence-app-website` project's **Deployments** tab, or via
`GET /accounts/{account_id}/pages/projects/presence-app-website` (field
`latest_deployment`) with a suitably-scoped API token.

## Manual direct-upload (fallback only)

Only needed if Git integration is ever disconnected, or to test a build before
pushing. Ask Brian for a Cloudflare API token for the deploy account, scoped
to at minimum **Account → Cloudflare Pages → Edit**. He can create one at My
Profile → API Tokens while logged into that account.

```bash
export CLOUDFLARE_API_TOKEN="<token>"
npm run deploy
# = astro build + wrangler pages deploy dist --branch=main
```

`wrangler.jsonc` in the repo root pins the project name (`presence-app-website`)
and output directory, so you don't need `--project-name`. Account resolution
comes from the token itself — this works automatically as long as the token
is scoped to only the one deploy account (the normal case). Pages' config
schema doesn't allow `account_id` in `wrangler.jsonc` once
`pages_build_output_dir` is set (tested directly, wrangler 4.110.0), so if a
token is ever scoped to multiple accounts, pass `CLOUDFLARE_ACCOUNT_ID`
explicitly instead (ask Brian for the value).

> **Known Wrangler bug (v4.110.0):** `wrangler pages project create
> --production-branch <x>` triggers a broken "Pages-to-Workers delegation"
> path that ignores `CLOUDFLARE_ACCOUNT_ID` and fails with a confusing
> `Authentication error [code: 10000]`. The project already exists, so this
> shouldn't come up again — but if you ever need to recreate it, create it via
> a direct API call instead:
> ```bash
> curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
>   -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" \
>   -d '{"name":"presence-app-website","production_branch":"main"}'
> ```
> `wrangler pages deploy` (uploading, not creating) works fine.

## Git integration setup (already done — for reference)

Connected 2026-07-10. Kept here in case it's ever disconnected and needs
redoing. It requires authorizing a GitHub App, which only a human can do in a
browser — it can't be scripted or done via API token.

1. Dashboard (deploy account — ask Brian) → **Workers & Pages** →
   **presence-app-website** → **Settings** → **Builds & deployments**
2. **Connect to Git** → choose **GitHub** → authorize the Cloudflare Pages App
   → grant access to `ChoosingPresence/presence-app-website`
3. Build settings (confirmed live, auto-detected correctly):
   - **Framework preset:** Astro (auto-detected)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set environment variable `NODE_VERSION=22` (or rely on `.nvmrc`)
4. Set **Production branch** to `main`. Save.

Verified working: pushing the `docs/AUDIT.md` commit on 2026-07-10 triggered
an automatic build (clone → build → deploy, all stages succeeded in ~30s) with
no manual action needed. PR previews are enabled too (`preview_deployment_setting: "all"`).

## Custom domain (already done for practicingpresence.app)

For reference, this is how the custom domain was attached (already complete —
only needed again if the domain is ever detached or a new one is added):

1. Confirm the target domain's zone is on the same Cloudflare account.
2. Pages project → **Custom domains** → **Set up a custom domain** → enter the
   domain. Cloudflare creates the required DNS record automatically when the
   zone is on the same account.
3. Check **Rules → Redirect Rules** on the zone for anything scoped to "All
   incoming requests" — a misconfigured `www`-redirect rule with no hostname
   condition previously caused an infinite redirect loop on the apex domain
   here. Any redirect rule should be scoped with a `Hostname equals www.…`
   condition, never left unscoped.
4. Under the zone's **SSL/TLS** settings, confirm **Full (strict)** and enable
   **Always Use HTTPS**.

> Note: `.app` is an HSTS-preloaded TLD — every `.app` domain requires HTTPS by
> design, which Cloudflare provides automatically. The site also sends its own
> `Strict-Transport-Security` header.

## Known open issues

- **`www.practicingpresence.app`** redirects with an empty `Location` header —
  the redirect rule's `wildcard_replace()` expression isn't evaluating
  correctly. Needs a fix in Rules → Redirect Rules (Cloudflare dashboard);
  requires Zone-level Rules edit access.
- **`robots.txt`** served live shows a stale cached sitemap URL from an old
  build, even after redeploys — likely Cloudflare's "Managed robots.txt"
  (AI-bot-blocking overlay) feature caching the origin response separately
  from normal edge cache. Fix: purge cache for `/robots.txt` specifically, or
  wait for its own TTL. Requires a token with **Cache Purge** permission.

## Post-deploy checklist

- [ ] `https://practicingpresence.app` loads with a valid certificate
- [ ] Security headers present: `curl -sI https://practicingpresence.app | grep -iE 'content-security|frame|referrer|transport'`
- [ ] `https://practicingpresence.app/sitemap-index.xml` responds, `/robots.txt` responds (verify sitemap URL inside isn't stale — see known issue above)
- [ ] App Store / Google Play / Amazon / affiliate links resolve
- [ ] Tutorials page plays the YouTube playlist
- [ ] `npm audit` — 0 vulnerabilities
- [ ] Lighthouse (mobile) — aim for 95+ across the board
