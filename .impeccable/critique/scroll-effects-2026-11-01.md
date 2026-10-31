# Responsive scroll effects — 1 November 2026

User choice: mobile uses Image Reveal + Scroll Progress (references 1 + 6); desktop uses photo parallax only, without blur. Requested three direct browser verification passes and fixes for discovered problems.

## Motion direction and scope

Photo frames carry the scroll effect; text, controls and section containers remain stable. Mobile reveals gallery/campus photos from the center as they enter the viewport, while a 3px blue line reports page scroll progress. Desktop uses a bounded vertical photo offset to suggest depth. The frame keeps its dimensions; 28px image bleed on either side covers the maximum 24px offset. Logos, teacher portraits and lightbox images are outside the photo effect. The existing hero carousel/wave composition is retained; its outer fade/scale handoff is removed.

References selected by the user:
- [Image Reveal](https://examples.motion.dev/react/scroll-image-reveal)
- [Scroll Progress](https://examples.motion.dev/react/scroll-linked)
- [Parallax](https://motion.dev/examples/react-parallax)

New effects apply to the gallery preview, complete gallery page and campus photo in the admissions CTA. The mobile progress line covers public routes and is absent in admin. Desktop never shows that line. Existing interaction feedback for menus, gallery filtering and lightboxes is retained.

## Implementation and resolved risks

- Replaced the old global stagger reveal and section-wide opacity/scale/translation with opt-in photo motion. This removes the transform stacking/containing-block risk for fixed gallery overlays and avoids making text disappear during scrolling. Dead reveal and slide-transition hooks/CSS were removed.
- One scheduled animation frame batches geometry reads before style writes. Styles live on photo hosts as CSS custom properties, leaving hover transforms and React layout state separate. No library or 3D dependency was added.
- Main-route mutations, image loads/errors, document/main size changes, nested scroll, viewport changes and back/forward restoration schedule updates. Cleanup disconnects observers/listeners and removes previous effect properties.
- Reduced-motion mode keeps photos fully visible and stationary while preserving the useful progress indicator. Changing the preference or breakpoint clears old masks/offsets. A keyboard-focused gallery image also becomes fully visible.
- Photos remain uncropped by default. Unloaded/failed images are not assigned a mask or parallax mode, preserving the existing frame, caption and accessible image alternative. Progress remains finite on pages without a scroll range.
- The gallery category badge still had an existing 4px backdrop blur in a live desktop measurement. Desktop blur was explicitly disabled on gallery/campus photo overlays; follow-up browser assertions confirmed none on those overlays and on the animated images.

## Three direct browser passes

All passes ran the actual localhost application in installed Chrome through Playwright, with screenshots opened for visual inspection. Mobile measurements are emulated viewports; an additional CDP touchStart/touchMove/touchEnd sequence exercised native Chromium touch scrolling.

### 1 — Appearance and motion

Passed 320, 390, 768, 1024 and 1440px in light/dark themes (10 cases). Verified mobile reveal changes from a nonzero inset to zero as the photo enters; desktop offset changes with scroll, with no image filter or mask. Frame dimensions stay constant and the enlarged image covers its frame. Progress matches the actual document scroll ratio, reaches 1 at bottom and returns to 0 at top. No horizontal overflow or page errors. Evidence: round1.json and mobile entry screenshot.

### 2 — Interaction and return scrolling

Passed at 390 and 1440px. Entered home through its real navigation link and performed three down/up cycles at each size; hero cards remained visible and its outer frame had no fade/scale transform. Gallery lightbox bounds matched the full viewport, its image had no scroll mask, Escape closed it and body scrolling resumed. The review rating dropdown's 1-star option remained clickable. Gallery category filters mounted the expected 4/11 photo frames and the new photos received the correct effect. PPDB status text stayed fully opaque and old route photo states were absent. No page errors. Evidence: round2.json and lightbox screenshot.

### 3 — Edge states and actual input

Passed runtime reduced-motion changes, keyboard photo focus, four breakpoint/orientation changes, three fast scroll cycles, reload, browser back, mobile navigation, admin exclusion and a very short page. A deliberately failed gallery image kept its frame/caption with no stale crop/translation. An explicit Chromium touch drag changed mobile reveal/progress; a real mouse-wheel event changed desktop parallax without blur. No page errors in these checks. Evidence: round3.json, gestures.json and fallback/touch screenshots.

The high-level CDP synthesizeScrollGesture helper did not move the page in this headless setup; explicit touch events were used successfully instead. Lightbox assertions wait for its existing exit animation. A direct automated jump from the fresh homepage initially landed in the pre-existing hero settle pause; the follow-up waits for that pause and continues scrolling before checking the lazy campus image. These were test-harness adjustments; they were not reported as product fixes.

## Final follow-up

After removing the legacy overlay blur, checked campus/gallery photos at 390 and 1440px again. The four program overlays are present, the first program link is hit-testable and navigates to its actual program page. Campus photo motion has the correct mode; desktop photo overlays compute backdrop-filter:none. Final screenshots were inspected. Evidence: final-followup.json.

TypeScript/Vite production build and diff whitespace checks passed. The design detector reported the same six existing Inter advisories (font explicitly requested by user) and unrelated admin accent advisory; no new finding was introduced. No form, review or registration data was submitted. The public web/API servers remain on 5173/3001.

final result: passed
