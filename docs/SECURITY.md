# Security Posture & Self-Audit

The site is intentionally a **fully static site with zero client-side
JavaScript** shipped by us, no cookies, no forms, no user data, and no
third-party scripts. That removes almost the entire web attack surface
(no XSS sinks, no CSRF, no session handling, no server code to exploit).

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
- The JSON-LD `<script type="application/ld+json">` block is data, not
  executable script; CSP does not block it and search engines read it.
- If you ever add inline `style=""` attributes or inline `<script>` tags,
  the CSP will (correctly) block them — add hashes or keep everything external.

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
- `package-lock.json` is committed; run `npm audit` before releases.
- No secrets exist in this repo (no API keys, no tokens). Cloudflare deploys
  via Git integration, so no deploy credentials are stored locally either.

## Self-audit checklist (run before each release)

- [ ] `npm audit` — no high/critical findings
- [ ] `npm run build` succeeds with no warnings
- [ ] `curl -sI https://practicingpresence.app` shows all headers above
- [ ] Test CSP: browser console shows no CSP violations on any page
- [ ] Confirm no unexpected network requests (DevTools → Network: only
      practicingpresence.app assets, plus youtube-nocookie.com on /tutorials/)
- [ ] Mozilla Observatory (https://observatory.mozilla.org) — grade A/A+
