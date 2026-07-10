# Deployment — Cloudflare Pages

The site is a fully static Astro build. Cloudflare Pages serves `dist/` on its
global CDN and applies `public/_headers` to every response.

## One-time setup (Git integration — recommended)

1. In the [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages**
   → **Create** → **Pages** → **Connect to Git**.
2. Select the GitHub repo `ChoosingPresence/presence-app-website`.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set environment variable `NODE_VERSION=22` (or rely on `.nvmrc`)
4. Deploy. Every push to `main` now deploys automatically; pull requests get
   preview URLs.

## Custom domain (presence.app)

1. Add the `presence.app` zone to the same Cloudflare account (if not already).
2. In the Pages project → **Custom domains** → **Set up a custom domain** →
   enter `presence.app`. Cloudflare creates the CNAME record automatically
   when the zone is on the same account.
3. Optionally add `www.presence.app` as a second custom domain, then create a
   **Bulk Redirect** (or Redirect Rule) from `www.presence.app/*` to
   `https://presence.app/$1` (301).
4. Under the zone's **SSL/TLS** settings, confirm **Full (strict)** and enable
   **Always Use HTTPS**.

> Note: `.app` is an HSTS-preloaded TLD — every `.app` domain requires HTTPS by
> design, which Cloudflare provides automatically. The site also sends its own
> `Strict-Transport-Security` header.

## Alternative: direct upload from the command line

```bash
npm run deploy
# = astro build + npx wrangler pages deploy dist --project-name=presence-app-website
```

Requires `wrangler login` once. Git integration is preferred so the GitHub repo
stays the source of truth.

## Post-deploy checklist

- [ ] `https://presence.app` loads with a valid certificate
- [ ] Security headers present: `curl -sI https://presence.app | grep -iE 'content-security|frame|referrer|transport'`
- [ ] `https://presence.app/sitemap-index.xml` and `/robots.txt` respond
- [ ] App Store / Google Play / Amazon / affiliate links resolve
- [ ] Tutorials page plays the YouTube playlist
- [ ] Lighthouse (mobile) — aim for 95+ across the board
