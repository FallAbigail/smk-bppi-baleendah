# Section scroll correction — 1 November 2026

The user clarified that scroll effects belong to complete sections on desktop and mobile, rather than the images. This supersedes the photo-motion implementation documented in the earlier two scroll reports.

## Implementation

- Removed photo masking, overscan and image translation from gallery and campus photography. Source URLs, image files and existing hover behavior remain unchanged.
- Desktop informational sections translate vertically at 0.18 of scroll distance, capped at 64px in either direction. Smaller, closely packed accordion sections are capped at 6px. No scroll blur, scaling or rotation.
- Mobile sections receive a short, once-only entrance (up to 24px rise, cubic ease-out and an already-visible opacity floor). They become fully visible before reaching the reading area, and stay visible on reverse scroll. The existing reading progress line remains.
- Geometry subtracts the applied translation to prevent position feedback. Reads precede writes, work is scheduled by events in one RAF, unchanged values are skipped, and observers/listeners/styles clean up on navigation. No new dependency or perpetual animation loop.
- Native registration/status sections are explicitly excluded whether PPDB is open or closed. Focused inputs and keyboard controls hold their current section position. Hero/facility carousel behavior is excluded.
- Gallery lightbox now renders into document.body so a translated section cannot constrain its fixed viewport overlay.

## Browser verification: three completed rounds

Actual installed Chrome through Playwright, with mobile/tablet viewport emulation; not physical phone testing. Screenshots were opened and visually reviewed.

1. **Motion and image invariance, 390/768/1440:** desktop section displacement measured 82px between sampled positions. Mobile entrance reaches opacity 1 / translate none in the reading area and never re-hides on reverse scroll. Gallery image source, crop, size and position relative to its card remain unchanged. Mobile progress matches native scroll ratio. Hero and nested facility section are excluded.
2. **Interaction, 390/1440:** three home down/up cycles retain visible hero cards; mobile program tabs and desktop dropdown options work; gallery lightbox fills the viewport, Escape restores scrolling; the 1-star review filter option passes a hit test; gallery categories return 4/11 items; information accordion opens; PPDB status inputs remain usable and static; contact/admin cleanup is correct. The first PPDB check revealed that the closed application card lacked a form and was accidentally eligible; explicit exclusion fixed it and this round passed again. Test harness was also corrected to use visible mobile program tabs and scroll an expanded information accordion trigger into view after its preceding panel collapses.
3. **Edge cases and actual gestures:** runtime reduced motion restores original styles while retaining progress; keyboard lightbox opening/closing restores focus; four viewport/orientation changes, three fast reverse cycles, reload/back, mobile navigation and admin exclusion pass. Dark-theme actual CDP touch and mouse-wheel gestures at 4x CPU throttling move sections correctly. No runtime page errors.

Follow-up: campus image also retains its frame-relative position, size and source at two scroll positions on both 390/1440.

## Performance evidence and limits

No section style writes occurred during the settled idle observation. Final gesture runs recorded zero long tasks on the emulated mobile viewport and one 98ms task on desktop at 4x CPU throttle. A separate paired desktop experiment with warmed gallery images repeated the same wheel sequence with section motion enabled/disabled/enabled/disabled: all four runs recorded zero long tasks. Earlier exploratory runs overlapped development reloads and had higher task counts; those were not used as proof of smoothness. These observations do not guarantee performance on every device or cold network.

TypeScript/Vite build passed; scoped Impeccable detector returned []; git diff --check passed. No backend records were submitted. Local servers stay on 5173/3001.

Evidence: evidence/section-scroll-2026-11-01/ (measurements and screenshots).

final result: passed
