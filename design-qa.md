# CTA Design QA

## Design direction

- Keep the admissions message and actions on the left, with a rounded school-photo card on the right at wide sizes.
- Stack the text and photo card on narrow screens. The photo caption identifies SMK BPPI Baleendah and its location.
- Use a real school photo found through the browser, not generated artwork or a CSS illustration. The chosen photo is from the [PPDB SMK BPPI 2025 page](https://s.id/smk_bppi_2023); it shows the same school building from a different angle than the supplied reference.

## Visual checks

- Desktop: captured and inspected at 1480 × 715. The two-column layout is balanced, the school photo loads, and the caption remains inside the card. Screenshot: `C:/Users/falzz/AppData/Local/Temp/profile-sekolah-cta-photo-desktop.png`.
- Mobile: captured and inspected at 390 × 844. The content stacks cleanly, both actions remain readable, and the full card fits without horizontal overflow. Screenshot: `C:/Users/falzz/AppData/Local/Temp/profile-sekolah-cta-photo-mobile.png`.
- The image loaded at 2847 × 2133 in the browser preview.

## Implementation checks

- [x] Preserve the admissions text and both navigation actions.
- [x] Replace the program diagram with a school-photo card.
- [x] Add English translation for the photo caption.
- [x] Inspect desktop and mobile browser renders.
- [x] `npm run build` succeeds.
- [x] `git diff --check` passes.

final result: passed
