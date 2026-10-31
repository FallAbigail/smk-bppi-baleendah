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


# Homepage map and admissions order — 2026-11-01

User confirmed mobile and desktop scope. Homepage now renders SchoolLocation immediately before one CTA, followed by the shared footer. The CTA itself is unchanged. Map frame height is 85% of its previous computed height, including the pre-existing phone CSS override.

Actual Chrome measurements, checked in light/dark themes with no page errors or horizontal overflow:

| Width | Before | After |
| --- | --- | --- |
| 390 / 640 px | 352 px | 299.19 px |
| 768 px | 432 px | 367.19 px |
| 1024 / 1440 px | 512 px | 435.19 px |

The small fractional rounding is browser subpixel rounding. Browser assertions verified exactly one admissions section, DOM order location → admissions, and direct adjacency at all five widths. Existing CTA, map URLs, heading, address, link behavior and footer styles remain unchanged.

Evidence: `.impeccable/critique/evidence/location-order-2026-11-01/`. Opened actual mobile and desktop renders. The final mobile captures show the Google map loaded with the school pin; initial desktop layout capture shows the iframe's lazy-loading background. A separate mobile load check returned HTTP 200 and rendered Google Maps. Provider-specific text waits were unreliable on desktop and do not establish desktop map tile readiness; the layout/height checks passed independently.

Validation: TypeScript/Vite build passed; diff whitespace check passed; scoped Impeccable layout detector returned no findings. No map loading logic was changed.

final result: passed (requested order and height changes)


# Mobile navigation redesign — 2026-11-01

Preview: http://127.0.0.1:5173/kontak — open the hamburger below 1024px.
Reference and implementation screenshots: `.impeccable/critique/evidence/mobile-navbar-2026-11-01/`.

## Visual comparison

Opened the user reference and actual light/dark renders together in the same comparison input. The reference composition is retained: brand and close at the top, open vertical navigation with right chevrons, one full-width CTA, generous remaining space, and social links at the bottom. School identity replaces the reference brand: the real logo/name, existing Inter font, navy/blue colors and existing school destinations. Seven real routes replace the reference's four generic links, and the CTA opens online admissions. Theme and language controls remain available. The light panel is white; dark mode uses the existing school surface. There are no invented submenus or placeholder destinations.

Actual viewport checks: 320 × 568, 390 × 844, 768 × 1024, 1024 × 844 and 1440 × 844 in light and dark themes. The supplied reference is a narrow raster; typography and touch targets are adapted to the real school content rather than copied as literal pixels. At 390px the social row sits at the panel bottom. At shorter heights the full panel scrolls, keeping every control reachable. Also checked landscape 568 × 320.

## Interaction checks

Passed in installed Chrome through Playwright against the real local app:
- Hamburger opens a native modal dialog covering the viewport, with seven visible primary routes and minimum 44px targets. No horizontal dialog overflow.
- Close button receives initial focus; Tab and Shift+Tab wrap inside the menu. Native modal behavior makes the underlying page inert.
- Escape and close button dismiss the menu and restore the opener's focus; body scrolling and Lenis resume afterward.
- Short-screen menu scroll reaches the social links while the page behind retains its scroll position. After closing, mouse wheel scrolling moves the page again.
- Program and PPDB links navigate to the actual pages and close the menu; returning home and selecting the current home route also closes it.
- Switching to English updates labels; changing theme keeps the menu open and updates the colors.
- Resizing an open mobile menu to desktop closes it and releases scroll locking.
- At 1024px and 1440px the desktop header exactly matches the before-change visible text, height and visible links/buttons' labels, destinations, sizes, fonts and colors in both themes. No desktop CSS was changed.
- No page errors occurred during the viewport matrix. The dev server stopped before a supplementary scroll check; restarted API on 3001 and web on 5173, then completed that check successfully.

## Source and build checks

The mobile dialog is portaled to the document body so the closed navbar's blur/positioning cannot clip it. Native top-layer semantics plus explicit keyboard wrapping keep the panel accessible. Effects restore previous body overflow and Lenis state and close on desktop resize. Static routes and social links stay outside render, keys are stable, icons are decorative, controls have accessible names, and no data writes or backend behavior were introduced. Desktop markup/styles and closed navbar presentation are retained.

`npm run build` and `git diff --check` passed. Impeccable detector reported only seven existing advisories: six for the user-requested Inter font and one unrelated admin accent. No change was made to those established styles.

final result: passed


# Review rating dropdown stacking fix — 2026-11-01

Reproduced the supplied defect in actual Chrome: after the entrance animation settled, `document.elementFromPoint` at the center of the 1-star option returned the following review article rather than its button. The form's retained reveal transform creates a stacking context, trapping the dropdown's z-30 below the later review cards. Giving the form a positioned z-10 raises that entire context above the cards. No spacing, typography, colors or page structure changed. The mobile toolbar retains its existing z-20.

Opened before/after browser captures together: `.impeccable/critique/evidence/review-filter-2026-11-01/`. After the fix, all six filter rows are visually complete and hit-test to their own button at left, center and right points.

Browser verification passed at widths 390, 768, 1024 and 1440, each in light and dark themes with normal motion enabled. Clicked 1 star and verified the real GET /api/reviews?rating=1 request returned HTTP 200, the panel closed and reopening showed the selected rating. Reset to all ratings, Escape with restored trigger focus, and outside-click dismissal passed. No review data was written; no page errors occurred. TypeScript/Vite build, diff whitespace check and scoped Impeccable detector passed.

final result: passed
