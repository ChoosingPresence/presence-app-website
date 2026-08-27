# Content Guide — where everything lives

## Copy

| Content                                  | File                          |
| ---------------------------------------- | ----------------------------- |
| Hero headline, features, free messaging  | `src/pages/index.astro`       |
| Tutorial steps + playlist embed          | `src/pages/tutorials.astro`   |
| Practice of Presence, book, affiliations | `src/pages/about.astro`       |
| Privacy statements                       | `src/pages/privacy.astro`     |
| Footer blurb + affiliation links         | `src/components/Footer.astro` |

## Key links (single source)

| Link                | Where defined                                              |
| ------------------- | ---------------------------------------------------------- |
| App Store           | `src/components/StoreBadges.astro` (`APP_STORE_URL`)       |
| Google Play         | `src/components/StoreBadges.astro` (`PLAY_STORE_URL`)      |
| YouTube playlist    | `src/pages/tutorials.astro` (`PLAYLIST_ID`)                |
| Book (Amazon)       | `https://amzn.to/4zIfBcv` — used in `index.astro` + `about.astro` (ASIN 1618521268) |
| ChoosingPresence.org, BrianMueller.com, BriansPoems.com, Illuman.org | `Footer.astro` + `about.astro` |

## Images

**App screenshots live in `src/assets/screens/`**, not `public/`. That routes
them through Astro's image pipeline, which emits WebP at multiple widths with
`srcset` automatically — roughly a 90% size reduction (a 190KB JPEG becomes a
20KB WebP at display size). Import them and use `<Image>`; never hardcode a
path to them.

Everything else stays in `public/images/` (referenced by plain URL):

- `app-icon.png` — app icon (from the app repo's `apple-icon.png`)
- `choosing-presence-book.jpg` — book cover, 370×600
- `og-image.jpg` — 1200×630 social-share image

To refresh screenshots after an app release, source them from
`Assets/screenshots/` (iOS/iPhone, iOS/iPad, Android/Pixel Phone,
Android/Pixel Tablet) and resize — phones to 900px wide, tablets to 1200px:

```bash
sips -s format jpeg -s formatOptions 88 --resampleWidth 900 "<screenshot>.png" \
  --out src/assets/screens/iphone-<name>.jpg
```

Astro handles everything downstream from there.

## Device frames

`src/components/DeviceFrame.astro` draws a CSS frame around a screenshot:

```astro
<DeviceFrame device="iphone" label="What this screen shows">
  <Image src={shot} alt="…" widths={[240, 480]} sizes="240px" />
</DeviceFrame>
```

`device` is `iphone` (Dynamic Island), `ipad` (even bezel, camera dot) or
`pixel` (punch-hole camera). **Always match the frame to the device the
screenshot actually came from** — an iPad capture in a phone frame looks wrong
and misrepresents the app.

Size it by setting a width on the frame from the parent, and scale the bezel
and corner radii to match with `--frame-scale` (1 = hero size; go lower for
smaller frames, or the bezels look like thick rubber rims).

> **Gotcha:** the class you pass lands on DeviceFrame's own root element, which
> carries *that component's* Astro scope hash — not the calling page's. A plain
> `.my-class { width: … }` rule in the page's `<style>` will silently not
> apply. Wrap it: `.parent :global(.my-class) { width: … }`.

## Store badges

`public/images/badges/app-store.svg` and `google-play.svg` are Apple's and
Google's **official** badge artworks, unmodified — both vendors require their
own asset rather than a recreation, so don't redraw them.

Neither artwork has built-in padding (both fill their viewBox edge to edge), so
matching the CSS **height** matches the visual height. `StoreBadges.astro` sets
`height: 44px; width: auto` and lets each width follow its own aspect ratio:

| Badge | Source viewBox | Aspect | At 44px tall |
| --- | --- | --- | --- |
| App Store | 119.66 × 40 | 2.9916 : 1 | 132 × 44 |
| Google Play | 239.17 × 70.87 | 3.3748 : 1 | 148 × 44 |

Never set a width on both to "make them match" — that distorts one of them and
breaks the vendors' brand rules. Height is the single source of truth.

## Style / brand

- Palette and typography: `src/styles/global.css` (`:root` custom properties)
- Colors come from the app itself: teal `#1c5a5e` / `#2e7d82`, sage `#96bfa7`
  (the app-icon background), leaf `#d8df9a`, cream `#f7faf4`
- Headings use Quicksand, body uses Open Sans (both self-hosted). The app uses
  Gotham Rounded, whose license doesn't cover web embedding — Quicksand is the
  closest free match.

## Dark mode

- Driven entirely by CSS custom properties in `src/styles/global.css`. Fixed
  brand colors (`--teal-*`, `--sage`, `--leaf`, `--cream`, `--white`) stay the
  same in both themes; *semantic* tokens (`--ink`, `--ink-muted`, `--surface`,
  `--surface-card`, `--heading`, `--accent`, `--link`, `--link-hover`,
  `--border-subtle`, `--shadow`, and the hero/tint gradient stops) flip.
- Default follows the OS (`prefers-color-scheme`); an explicit toggle click
  sets `data-theme="light"` or `"dark"` on `<html>`, persisted in
  `localStorage`, which always wins over the OS setting. Toggle logic lives in
  `src/components/Header.astro`'s `<script>` block.
- **Any new color you add must go through a CSS variable**, not a hardcoded
  hex — otherwise it won't adapt, and may end up unreadable in one theme. If
  you add a new semantic token, define it in `:root` (light default) AND in
  both the `@media (prefers-color-scheme: dark)` block and the
  `:root[data-theme='dark']` block in `global.css` (same values in both).
- Check contrast when picking dark-mode colors — WCAG AA needs ≥4.5:1 for
  normal text, ≥3:1 for large/bold text. A quick way to check a pair:
  ```bash
  python3 -c "
  def lum(h):
      h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
      f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
      r,g,b=f(r),f(g),f(b); return .2126*r+.7152*g+.0722*b
  l1,l2=lum('#FOREGROUND'),lum('#BACKGROUND')
  print((max(l1,l2)+.05)/(min(l1,l2)+.05))
  "
  ```

## Header (nav, theme toggle, mobile menu)

- `src/components/Header.astro` renders both the desktop nav (`.nav-desktop`,
  visible ≥861px) and a separate mobile dropdown (`#mobile-nav`, opened by the
  hamburger button below 861px) — they're two separate markup blocks, not one
  nav reflowed by CSS, to keep each simple. Nav links are defined once in the
  `navItems` array and mapped into both.
- The 861px breakpoint has real headroom above the ~771px estimated minimum
  width the desktop nav needs (brand + theme toggle + 3 links + CTA button) —
  don't drop it much lower without checking the nav doesn't wrap.

## Facts the site asserts (keep true)

Verified against app **v1.8.6** on 2026-08-27. The app is the source of truth —
when it changes, these change. A July 2026 audit found the site had drifted
badly on the three practices, so re-check this list against real screenshots
whenever the app ships a feature release.

- 100% free, no account/sign-up, no ads, no in-app purchases
- Maintained by B:Drive Communications, LLC
- Companion to *Choosing Presence* by Jim Heaney; book proceeds go to charity
- **Morning Practice** — 15 min, 20 min, or open-ended. (There is no 10-minute
  option; there was in versions before 1.8.6.)
- **Three Breaths (for presence)** — taken whenever unease or anxiety begins to
  build, with the intention of connecting with God's spiritual energy, and as
  an hourly discipline from 8am to 8pm.
- **Three Questions (hourly renewal)** — *am I present now? how do I feel
  inside? do I have a sense of calm or peace within at some level?* Asked one
  per breath, to gauge spiritual progress. **This is an hourly practice, not an
  evening or end-of-day reflection** — the site described it wrongly for months.
- **Choosing Presence Videos** — a library of conversation films inside the app.
- Notification window defaults to **8:00 am – 8:00 pm**.
- App Store rating shown on the homepage: **4.6 from 124 ratings**. Hardcoded in
  `index.astro` (both the visible line and the JSON-LD `aggregateRating`);
  re-check it occasionally.
