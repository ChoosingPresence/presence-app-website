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

## Facts the site asserts (keep true)

- 100% free, no account/sign-up, no ads, no in-app purchases
- Maintained by B:Drive Communications, LLC
- Companion to *Choosing Presence* by Jim Heaney; book proceeds go to charity
- Morning Practice 10–20 min; hourly Three Breaths reminders; Three Questions
