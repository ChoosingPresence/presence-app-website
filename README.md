# practicingpresence.app — Practicing Presence Website

Marketing and information website for **Practicing Presence — A Christian Way**,
the free Christian mindfulness app for iOS and Android. Live at
[practicingpresence.app](https://practicingpresence.app), hosted on **Cloudflare Pages**.

The site does **not** host or serve the app itself. It provides:

- An overview of the app and its practices (Morning Practice, Three Breaths, Three Questions)
- Download links to the [App Store](https://apps.apple.com/us/app/practicing-presence/id1467007716) and [Google Play](https://play.google.com/store/apps/details?id=com.zeek.practicingpresence)
- Video [tutorials](https://www.youtube.com/playlist?list=PL1qzXPAmdoCVqr6hoYGO9zuvayxHs63hv)
- The app's connection to [Choosing Presence](https://www.choosingpresence.org) and the Practice of Presence
- A clear statement that the app is **100% free** — no account, no ads, no in-app purchases

Maintained by **B:Drive Communications, LLC**.

## Tech stack

| Piece      | Choice                       | Why                                                            |
| ---------- | ---------------------------- | -------------------------------------------------------------- |
| Framework  | [Astro 5](https://astro.build) (static output) | Zero JS by default, fast, SEO-friendly, easy content pages |
| Hosting    | Cloudflare Pages             | Free tier, global CDN, `_headers` support for security headers |
| Fonts      | Quicksand + Open Sans (self-hosted via Fontsource) | Free lookalikes for the app's Gotham Rounded; no external font CDN |
| Styling    | Plain scoped CSS + custom properties | No framework needed at this size; palette matches the app |

## Development

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build to ./dist
npm run preview    # preview the production build locally
```

Requires Node 20+ (see `.nvmrc`).

## Project structure

```
public/
  _headers            Cloudflare Pages security + caching headers
  images/             App icon, screenshots, book cover, OG image
src/
  components/         Header, Footer, StoreBadges
  layouts/            BaseLayout (SEO meta, fonts, header/footer)
  pages/              index, tutorials, about, privacy, 404
  styles/global.css   Brand palette + shared styles
docs/                 Deployment, content, security, audit, and roadmap docs
wrangler.jsonc         Cloudflare Pages project name + build output dir
```

## Deployment

**Live at https://practicingpresence.app**, hosted on Cloudflare Pages. Deploys
are currently **direct-upload only** (`npm run deploy`) — pushing to GitHub
does not auto-deploy yet; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for
exact steps, the known Wrangler CLI bug workaround, and how to connect Git
integration. (Cloudflare account credentials/IDs are intentionally not
documented in this public repo — ask Brian for deploy access.)

## Editing content

See [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md) for where each piece of
copy, link, and image lives.

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for the security posture and
self-audit notes (strict CSP, no third-party scripts, no cookies).

## Project history & roadmap

- [docs/AUDIT.md](docs/AUDIT.md) — how this site was built and deployed, what
  went wrong along the way, current verified live status, and known open issues
- [docs/ROADMAP.md](docs/ROADMAP.md) — prioritized suggestions for future work

---

© B:Drive Communications, LLC. All rights reserved. See [LICENSE](LICENSE).
