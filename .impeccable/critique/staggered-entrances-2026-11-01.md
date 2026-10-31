# Fade-up and staggered route entrances — 1 November 2026

The user selected fade-up plus stagger in place of section parallax, and requested gradual, sequential content entrances when navigating through the navbar. This supersedes the section-parallax behavior in the previous scroll report.

## Final behavior

- Desktop and mobile use once-only entrances for section headings, copy, list/card units and action links. The DOM reading order determines the sequence within each section. Returning upward does not replay or hide already visited content; a new route gets a fresh sequence.
- Noninteractive text rises 18px on desktop / 12px on mobile while fading from an already-visible opacity floor. Entrances use a decelerating cubic curve, 500ms desktop / 420ms mobile, 60ms stagger spacing and at most 220ms delay. Interactive panels and links fade without moving their hit targets.
- Section wrappers retain their normal layout. Images have no new individual animation, crop, scale, rotation or offset. Hero and facility-carousel motion is excluded. Mobile reading progress remains. Existing program-selection transitions retain ownership of their content; gallery card entrances now have a single owner instead of two overlapping initial fades.
- Navbar navigation runs the sequence on the incoming page, including lazy-loaded routes. Current-viewport targets are seeded before paint, avoiding the full-opacity frame that an asynchronous observer alone can permit. Scrolled content is triggered through IntersectionObserver, including clipped horizontal rails.
- Completed or interrupted animations are canceled back to original document styles; no opacity-zero class or permanent transformed wrapper remains. Focus/pointer interaction reveals a target immediately. PPDB operational sections, dialogs, live feedback and admin remain excluded. Missing animation APIs and reduced motion show content normally.
- No dependency, blur or persistent scroll animation loop was added. Progress updates are event-scheduled; finished entrance targets are unobserved. Route cleanup releases animations, observers, attributes and listeners.

## Three final Chrome verification rounds

Actual installed Chrome via Playwright; responsive viewports are emulated, not physical-device tests. Screenshots were opened for visual inspection. All rounds were repeated on the final source after action links joined the sequence.

1. **Navbar and visual sequence, 390/1440:** real navbar/menu clicks to Tentang, Program, Ekskul, Galeri, Informasi and Kontak all produced multiple, staggered entrances, including their heading. Recorded delays were bounded to 220ms. Home About content enters, stays visible when revisited, and has no section parallax. No horizontal overflow or runtime page errors.
2. **Interaction, 390/1440:** three down/up home cycles retain visible hero cards. Mobile jurusan tabs and desktop dropdown options work; the gallery lightbox fills the viewport and Escape restores scrolling; the 1-star rating option remains hit-testable; gallery filters return 4/11 cards. Image translate/clip remain unchanged. Focusing and filling the contact form immediately settles its entrance, with no spatial movement. PPDB operational cards remain static. No data was submitted.
3. **Edge cases:** runtime reduced motion, four viewport/orientation changes, three fast reverse-scroll cycles, browser back/reload, admin exclusion, missing IntersectionObserver and missing Element.animate all pass. Frame-by-frame sampling of the new Program heading confirms its first frame starts in its entrance state and finishes fully visible. Repeated navigation during active entrances leaves no stuck animation.

## Additional gesture/performance check

Dark theme at 390/1440, actual CDP touch or mouse wheel, 4x CPU throttle, warmed gallery images: both runs recorded zero long tasks; all screen-visible content was fully opaque with original translation after settling; idle observation recorded zero content style/reveal-attribute writes. Gallery images were deliberately requested eagerly in this synthetic warming step only; production loading attributes were not changed. Pending targets in the observer's bottom inset are intentionally fully visible by default. These measurements do not establish performance on every physical phone, network or cold cache.

During verification the harness was corrected for mobile navbar labels/duplicate home links, unique animation logging, and pending-but-visible targets below the observer threshold. Product safeguards added before the final passes address pre-paint flash, observer-boundary interruption and white-space pointer clicks accidentally completing future content.

TypeScript/Vite build passed, scoped Impeccable detector returned [], and git diff --check passed. React review: no render-time DOM work, no animation-driven React state, complete effect cleanup, keyboard/pointer cancellation and no new package dependency. Local servers remain on 5173/3001.

Evidence: evidence/staggered-entrances-2026-11-01/.

final result: passed
