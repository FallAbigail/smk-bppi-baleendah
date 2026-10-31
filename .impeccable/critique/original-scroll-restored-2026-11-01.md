# Original section handoff restored — 1 November 2026

User requested the original disappearing section scroll effect before the recent motion experiments, with no separate image effects.

Restored ScrollSection/useSlideTransition and CSS from facb3d5, the commit before those experiments. Desktop section opacity again follows entering/leaving scroll position, with its original small scale/vertical handoff. Original phone readability overrides remain: these keep section opacity at 1 and remove section transforms below 768px, as in that snapshot. Removed the newer page/section motion engine, mobile progress line and newer route choreography. Restored the earlier page-reveal wiring and contact-page entrance.

Kept safeguards for known regressions: the global reveal scanner skips hero/admin and image-bearing units, cleans its attributes on route teardown, and falls back visibly if IntersectionObserver is unavailable. Gallery image cards have no separate initial photo fade. Image assets, source URLs, crop and individual scroll transforms remain unchanged. The existing gallery lightbox portal is retained so the restored section transform cannot constrain its viewport overlay. Hero/carousel geometry and the fix preventing vanished hero cards remain intact.

Three actual installed-Chrome verification rounds passed (responsive viewport emulation, not physical-device testing):

1. 390/1440: restored section handoff measured at entering, reading, leaving and returning positions. Desktop gallery opacity sampled approximately 0.23 → 1 → 0.11 → 1. Phone computed opacity/transform follow the original readability override. No direct image clip/translation effects or new photo/progress markers.
2. 390/1440: three home reverse-scroll cycles retain hero cards; gallery lightbox covers the viewport; Escape, 1-star filter hit testing, navbar navigation, contact form input and PPDB status remain usable. No records submitted.
3. Reduced motion, three fast reverse cycles, three viewport changes, browser back and admin exclusion passed. The history check explicitly placed the section in its reading position after the existing hero settle, rather than asserting full opacity while a scroll-linked fade was intentionally partly outside the viewport.

Screenshots were visually inspected. Build, scoped detector ([]) and whitespace checks passed. Local servers remain on 5173/3001. Evidence: evidence/original-scroll-restored-2026-11-01/.

final result: passed
