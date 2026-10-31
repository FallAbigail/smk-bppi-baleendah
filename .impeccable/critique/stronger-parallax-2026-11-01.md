# Stronger desktop parallax with bounded rendering work — 1 November 2026

The user found the previous parallax too subtle and requested more visible depth while protecting UX/performance. Mobile reveal/progress behavior stays the same. The implementation still uses no blur and adds no dependency.

## Behavior

The previous fixed 24px offset spread across the full viewport produced about 26px movement over the tested scroll range. Desktop photos now move at a relative scroll factor of 0.22, capped at 18% of frame height with a 56–112px bound. Image overscan matches the cap plus 2px safety padding and changes only with frame size. The frame, captions, controls and photo rotation/scale remain stable; only the photo's vertical position follows scrolling.

Actual before/after Chrome samples at photo top positions 760, 450 and 150px:

| Width | Previous travel | New travel |
| --- | --- | --- |
| 1024px | 25.8px | 96.3px |
| 1440px | 26.0px | 97.4px |

This is approximately 3.7× the measured displacement, not a claim about subjective perception or every photo. Opened before/after/final screenshots for visual inspection. The stronger travel requires a larger fixed photo crop; the full image remains available through the existing gallery lightbox.

## Performance work

- Desktop CSS custom properties are written to the image itself, reducing style invalidation of caption/control siblings.
- Photos beyond a 120px viewport margin are not updated. A will-change:translate hint is applied only near the viewport and removed afterward; a live check recorded six active photos out of eleven and verified an exited photo returned to will-change:auto.
- Geometry reads remain batched before writes in one event-scheduled RAF. Repeated identical progress values are not written. No new continuous animation loop is introduced.
- Overscan does not animate with scrolling. During wheel tests its write count was zero; idle tests recorded zero shift, overscan or progress writes.

A preliminary 4× CPU-throttled browser test recorded two 50/54ms tasks, so the image-local style and active-layer optimizations above were applied. Repeating the same instrumentation after those changes recorded zero long tasks in both normal and 4× CPU-throttled runs. Observed frame intervals: normal median 6.9ms/p95 7.3ms; throttled median 6.9ms/p95 13.8ms. These are local Chrome observations with warmed images and instrumentation, not physical low-end phone measurements or a universal frame-rate guarantee.

## Verification passes

1. **Visual movement and coverage:** before/after measurements at 1024/1440; inspected screenshots; stronger motion exceeds 3× baseline; same frame dimensions; photo bounds cover every frame at five scroll positions; no image filter/backdrop blur.
2. **Performance and layers:** normal and 4× CPU tests with actual mouse wheel; zero idle property updates, zero scroll-time overscan writes, zero post-optimization long tasks; active compositor hints verified to stop for distant photos.
3. **Regression and edge states:** reran the previous browser suites at 390/1440. Hero return scrolling three times, full-viewport lightbox, Escape/body scroll restoration, review filter, gallery category changes, PPDB text and route cleanup passed. Runtime reduced motion, keyboard photo focus, four viewport/orientation changes, three fast-scroll cycles, reload/back, mobile navigation, admin exclusion, a short page and a deliberately failed image also passed. No runtime page errors.

Evidence is in `.impeccable/critique/evidence/stronger-parallax-2026-11-01/`. TypeScript/Vite build, diff whitespace check and scoped detector passed. No records were submitted and no backend behavior changed. Public servers remain on 5173/3001.

final result: passed
