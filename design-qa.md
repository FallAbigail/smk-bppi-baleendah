# Mobile footer design QA

Source: user-supplied Rerun footer screenshot, preserved at `.impeccable/critique/evidence/mobile-footer-2026-11-01/reference.png`.
Preview: http://127.0.0.1:5173/kontak (footer is shared across public pages).

## Reference comparison

Opened the reference and actual Chrome renders together in the same image comparison input. The mobile implementation follows the reference composition: brand and description, a horizontal social row, a compact information CTA, and four open link groups in a two-column grid. The old mobile accordion, contact cards and map background are removed.

Intentional differences: existing school logo, school content and social destinations replace Rerun branding; announcements replace newsletter signup because this site has no subscription backend. Existing Inter typography and school navy colors are retained. Body text is 14px, with 44px minimum link targets, so the footer is taller and easier to use than the narrow supplied raster. Dark mode follows existing school tokens. No invented school facts or fake newsletter form were added.

Evidence directory: `.impeccable/critique/evidence/mobile-footer-2026-11-01/`.
- `mobile-light.png` and `mobile-dark.png`: 390px-wide footer captures, rendered with a 390 × 1400 viewport so fixed navigation does not cover the footer brand during element capture.
- Desktop before/after captures: 1440px wide; the footer remains 456px high.
- Reference is 247px wide; screenshots are compared by composition, spacing hierarchy, text wrapping, typography, colors and assets, not literal pixel dimensions.

## Browser verification

Passed in real headless Chrome via Playwright against the running local application:
- Widths 320, 360, 390, 430, 768, 1024 and 1440 in both light and dark themes; no horizontal page overflow.
- Below 1024px: four visible navigation groups, two columns, four social links, no accordion, all footer links at least 44px tall, desktop footer hidden.
- At 1024px and 1440px: mobile footer hidden; existing desktop footer visible.
- At 1440px: exact before/after comparisons passed for normalized visible text, footer dimensions and every visible link's text, destination, accessible label, width, height, font size and color. Visual review confirmed the existing map, columns and bottom row remain. Pixel captures include transient scroll-to-top visibility and minor font rasterization differences; no claim of byte-identical screenshots.
- Clicked Program Keahlian, Cek status pendaftaran and Lihat pengumuman; verified target routes and anchor elements.
- English announcements heading renders correctly. Existing phone/mail/social/map links are reused with appropriate protocols and external-link attributes; external apps were not launched.
- No page errors occurred. Native in-app browser automation was unavailable due a kernel-assets path error; verification used installed Chrome instead.

## Code checks

- `npm run build`: passed (TypeScript and Vite).
- `git diff --check`: passed.
- React review: static link data stays outside the component, stable keys, semantic nav/headings, icon-only links have accessible names, decorative logo has empty alt, keyboard focus styling provided, hidden desktop/mobile trees use display:none.
- Impeccable detector: seven existing advisory warnings (six Inter font warnings, one admin accent warning). Inter is explicitly requested by the user; unrelated desktop/admin styling was preserved.

## Findings

No blocking mobile footer findings remain. Desktop styles and behavior are preserved. The information CTA links to the existing announcements section rather than introducing unsupported subscription behavior.

final result: passed
