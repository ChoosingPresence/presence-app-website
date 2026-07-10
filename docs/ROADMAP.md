# Roadmap

Suggestions for future work, roughly prioritized. Nothing here is committed —
just a starting point for prioritization conversations.

## P0 — Finish what's already in motion

1. **Fix the `www.practicingpresence.app` redirect** — currently returns an
   empty `Location` header (see docs/AUDIT.md). Low effort, visible bug.
2. **Connect Git integration** in the Cloudflare dashboard so pushes to `main`
   auto-deploy (docs/DEPLOYMENT.md has the exact steps). Right now every
   content change requires someone to run a manual deploy with a fresh API
   token — that's real friction for anyone editing copy later.
3. **Purge the cached `robots.txt`** (or wait out its TTL) so the sitemap URL
   inside it isn't stale.
4. **Revoke** any Cloudflare API tokens created for manual deploys once no
   longer needed — they're short-lived by design, but tidy up regardless.

## P1 — Near-term, low effort / high value

5. **Add privacy-friendly analytics.** There's currently zero visibility into
   whether anyone visits the site or clicks through to the App Store. [Cloudflare
   Web Analytics](https://www.cloudflare.com/web-analytics/) is free, cookieless,
   and doesn't require touching the CSP (it's opt-in server-side beaconing, no
   third-party script needed in the strictest configurations) — fits the
   site's "no tracking" privacy stance better than Google Analytics would.
6. **Submit the sitemap** to Google Search Console and Bing Webmaster Tools
   once robots.txt is confirmed correct — right now nothing is actively
   telling search engines this site exists.
7. **Run an automated accessibility audit** (Lighthouse or axe DevTools). A
   manual pass during this audit looked solid — semantic headings, alt text
   on all images, a skip link, visible focus states via default browser
   outlines — but nothing's been run against WCAG AA formally yet.
8. **Add `/.well-known/security.txt`** — a two-minute addition
   ([securitytxt.org](https://securitytxt.org)) that gives security
   researchers a clear contact path, consistent with the site's existing
   security-conscious posture.
9. **PWA-style home screen icons.** `apple-touch-icon.png` and `favicon.png`
   exist; a proper `manifest.json` (name, theme color, icon set) would let
   visitors "Add to Home Screen" on the *website* cleanly on Android, and is
   a small, cheap addition to `BaseLayout.astro`.

## P2 — Content & engagement

10. **Surface the App Store rating.** The app has 4.7★ from 112 ratings on
    iOS — that's real social proof currently invisible on the site. A small
    "4.7★ on the App Store" badge near the download buttons would help
    conversion. (Needs periodic manual updates unless pulled from an API —
    keep it simple, hardcode and revisit occasionally.)
11. **"What's new" / release notes.** The app updates periodically; a short
    changelog section (even just linking to App Store release notes) gives
    return visitors and search engines fresh content to index.
12. **Testimonials.** If Brian has app-store reviews or user feedback worth
    quoting, a short testimonials section on the home page would strengthen
    trust alongside the existing "100% free" messaging.
13. **FAQ section** with `FAQPage` structured data — natural questions like
    "Is this really free?", "Do I need an account?", "Is this Catholic,
    Protestant, ecumenical?", "How is this different from other meditation
    apps?" would help both visitors and search/AI-answer visibility.

## P3 — Longer-term / infrastructure polish

14. **CI on pull requests.** A small GitHub Action running `npm run build`
    and `npm audit` on every PR would catch build breaks and dependency
    issues before merge — especially valuable once Git integration means
    merges go live automatically.
15. **Lighthouse CI** in that same GitHub Action to catch performance,
    accessibility, or SEO regressions automatically rather than relying on
    manual spot-checks.
16. **Dark mode.** The palette (`src/styles/global.css`) is deep enough to
    support a `prefers-color-scheme: dark` variant without a redesign, if
    it's worth the effort for this kind of contemplative-use-at-night app.
17. **`www` as a real custom domain** (once the redirect rule is fixed)
    rather than relying solely on the Redirect Rule — gives it its own
    certificate and Pages custom-domain status rather than depending on a
    zone-level rule.

## Explicitly not recommended (given the site's current values)

- **Third-party analytics/ad scripts** (Google Analytics, Meta Pixel, etc.) —
  would require loosening the CSP and contradicts the "no tracking" stance
  stated on the privacy page. Cloudflare Web Analytics (P1 above) is the
  better fit.
- **A CMS or database backend** — the site is five pages of largely stable
  content; a static site keeps the security surface minimal (see
  docs/SECURITY.md) and there's no evidence of a content-velocity problem
  that would justify the added complexity and attack surface.
- **Building a custom newsletter/signup form** — collecting emails directly
  would need its own privacy policy updates, storage, and spam handling.
  Linking to Choosing Presence's existing list (if one exists) achieves the
  same goal without taking on that responsibility here.
