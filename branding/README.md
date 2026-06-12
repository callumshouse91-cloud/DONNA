# Reckitt branding kit (for DONNA and future apps)

Everything in this folder was extracted or sampled from the supplied
**"Focus On Digital Science"** investor deck PDF — supplied for **branding use only**,
not as business data for the build.

## Contents

| Path | What it is |
|---|---|
| `logos/reckitt-logo-pink.png` | Full lockup, Reckitt pink, transparent — use on white/light |
| `logos/reckitt-logo-white.png` | Full lockup, white, transparent — use on gradient/dark |
| `logos/reckitt-logo-slate.png` | Full lockup, slate ink — muted/footer contexts |
| `logos/reckitt-logomark-*.png` | Spiral **mark only** (pink / white / slate) — the pink one is used in the DONNA topbar |
| `logos/reckitt-logo-on-gradient.png` | Original extraction reference from the deck's closing slide |
| `reckitt-gradient-swatch.png` | The magenta→coral→orange brand sweep as an image asset |
| `brand.json` | Machine-readable tokens: palette (incl. raw sampled values), type, components, logo manifest |
| `brand-tokens.css` | Drop-in CSS custom properties + signature devices for the next app |

## Notes & caveats

- **Logos are 400dpi raster extractions** (~1,250px wide) with generated alpha — perfect for
  screens and demos. For print or large-format, get the vector originals from the Reckitt brand team.
- **Fonts:** the deck's display/body faces are licensed and can't be extracted from a PDF.
  Oswald + Poppins (Google Fonts) are the closest free stand-ins and are what DONNA uses;
  swap them for the licensed faces if this graduates beyond demo.
- **Gradient:** exact stops vary slide-to-slide in the deck; `brand.json` records the raw
  sampled corner values and the harmonised CSS gradient used across the UI.
