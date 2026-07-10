# Security Posture & Self-Audit

The site is a **static site with a single small first-party script** (theme
toggle + mobile menu, `src/components/Header.astro`; no third-party scripts,
no cookies, no forms, no user data, no analytics/tracking). That keeps the
attack surface minimal — no XSS sinks beyond that one script, no CSRF, no
session handling, no server code to exploit.

The toggle script only touches `data-theme`/`aria-*` attributes and
`localStorage`; it makes no network requests and doesn't read or render any
user-supplied or remote content, so it introduces no new injection surface.

## Headers (public/_headers)

Served by Cloudflare Pages on every response:

| Header | Value / intent |
| --- | --- |
| `Content-Security-Policy` | `default-src 'none'` baseline; only self-hosted images/CSS/fonts; `frame-src` limited to `youtube-nocookie.com`; `frame-ancestors 'none'`; `base-uri 'self'` |
| `Strict-Transport-Security` | 1 year, includeSubDomains, preload (`.app` TLD is HSTS-preloaded anyway) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` (legacy complement to frame-ancestors) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, mic, geolocation, payment, etc. all disabled |
| `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` | `same-origin` |

Notes:

- `style-src 'self'` works because `astro.config.mjs` sets
  `build.inlineStylesheets: 'never'` — don't remove that without revisiting CSP.
- `script-src 'self'` works because `astro.config.mjs` also sets
  `vite.build.assetsInlineLimit: 0`. Without it, Vite inlines small `<script>`
  tags (like the header's) directly into the HTML as `<script type="module">`
  with no `src` — which the CSP then blocks outright, silently breaking the
  feature (confirmed by testing: the theme/menu toggle script was inlined and
  would have been blocked before this setting was added). Don't remove either
  setting without re-verifying the built HTML has no inline `<script>` or
  `style=""` — `grep -o '<script[^>]*>' dist/*.html` should show only
  `src="..."` scripts and the one `application/ld+json` data block.
- The JSON-LD `<script type="application/ld+json">` block is data, not
  executable script; CSP does not block it and search engines read it.
- If you ever add inline `style=""` attributes, the CSP will (correctly)
  block them — keep everything in external stylesheets.

## Third parties

- **YouTube embed** (tutorials page only): privacy-enhanced
  `youtube-nocookie.com`, `loading="lazy"`, restricted `allow` list. No cookies
  until the visitor presses play.
- **Fonts**: self-hosted via Fontsource npm packages — no Google Fonts CDN calls.
- **Outbound links**: all external anchors carry `rel="noopener"`.

## Supply chain

- 4 runtime-free dependencies (Astro, sitemap integration, two font packages);
  everything is build-time only — nothing they ship runs in visitors' browsers
  except generated CSS/fonts.
- `package-lock.json` is committed; run `npm audit` before releases (last run:
  2026-07-10, 0 vulnerabilities).
- No secrets exist in this repo (no API keys, no tokens, checked against full
  git history). Deploys go through Cloudflare Pages' Git integration (push to
  `main` auto-deploys) — no deploy credentials are stored locally or in the
  repo at all. See [docs/DEPLOYMENT.md](DEPLOYMENT.md).

## Self-audit checklist (run before each release)

- [ ] `npm audit` — no high/critical findings
- [ ] `npm run build` succeeds with no warnings
- [ ] `grep -o '<script[^>]*>' dist/*.html` — every result either has a
      `src="..."` attribute or is `type="application/ld+json"`; no bare
      `<script type="module">` with inline code (see CSP note above)
- [ ] `curl -sI https://practicingpresence.app` shows all headers above
- [ ] Test CSP: browser console shows no CSP violations on any page
- [ ] Confirm no unexpected network requests (DevTools → Network: only
      practicingpresence.app assets, plus youtube-nocookie.com on /tutorials/)
- [ ] Mozilla Observatory (https://observatory.mozilla.org) — grade A/A+
