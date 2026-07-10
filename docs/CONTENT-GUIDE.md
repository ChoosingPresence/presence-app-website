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
| Book (Amazon)       | `https://amzn.to/3Tdmv8V` — used in `index.astro` + `about.astro` |
| ChoosingPresence.org, BrianMueller.com, BriansPoems.com, Illuman.org | `Footer.astro` + `about.astro` |

## Images

All in `public/images/`:

- `app-icon.png` — app icon (from the app repo's `apple-icon.png`)
- `screens/*.jpg` — simulator screenshots, resized to 640px wide
- `choosing-presence-book.jpg` — book cover
- `og-image.jpg` — 1200×630 social-share image

To refresh screenshots, drop new PNGs in the parent `Screenshots/` folder and
re-run (from the repo root):

```bash
sips -s format jpeg -s formatOptions 82 --resampleWidth 640 "<screenshot>.png" --out public/images/screens/<name>.jpg
```

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

## Phone screenshot frame

- `.phone-frame` (global utility class in `global.css`) draws the device
  bezel around any screenshot — used for the homepage hero image and the
  screenshot gallery (`.phone-frame--sm` modifier for the smaller gallery
  size). Wrap any new screenshot image in `<div class="phone-frame">...`
  (or `phone-frame phone-frame--sm` for thumbnail-sized ones) rather than
  styling borders/shadows directly on the `<img>`.

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

- 100% free, no account/sign-up, no ads, no in-app purchases
- Maintained by B:Drive Communications, LLC
- Companion to *Choosing Presence* by Jim Heaney; book proceeds go to charity
- Morning Practice 10–20 min; hourly Three Breaths reminders; Three Questions
