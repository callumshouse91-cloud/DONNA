# DONNA · TSA Run & Control Intelligence Layer

**D**ivestiture **O**perations **N**avigator & **N**otification **A**ssistant
*(yes — it's named after Donna. Triple-click the logo.)*

A demo-format build of the AI intelligence layer that sits **above** the existing run systems
(SuccessFactors, MSP onboarding, HAM, SAM, ServiceNow, Smartsheet, Finance/billing) to help
Reckitt and Vestacy manage the c.18-month TSA separation period. All data is **mock / illustrative**.

Built in Reckitt brand language (magenta→orange gradient, slate ink, condensed display type,
rounded white cards) with the same shell pattern as the SmartCo portfolio build — tabs on the left.

---

## Running it

No build step, no dependencies, no node_modules.

**Option A (quickest):** double-click `index.html`.

**Option B (Cursor):** open this folder in Cursor → right-click `index.html` → *Open with Live Server*
(or run `npx serve .` in the terminal).

> **Avoiding the folder-in-folder problem:** this zip has the files at its **root** (no wrapper folder).
> Create an empty folder called `donna`, then extract the zip *into* it ("Extract Here" inside that
> folder). You'll get `donna/index.html` — not `donna/donna/index.html`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Shell: left tab sidebar, top bar, view container |
| `styles.css` | Reckitt brand tokens + all component styles |
| `data.js` | The mock dataset — **edit this to change every number on screen** |
| `charts.js` | Tiny dependency-free SVG charts (line, bars, donut) |
| `app.js` | Tab renderers, architecture diagram, interactions |
| `branding/` | **Reckitt brand kit for future work** — logo extractions (pink/white/slate, full lockup + mark only), gradient swatch, `brand.json` tokens and drop-in `brand-tokens.css`. See `branding/README.md` |

---

## The 90-second demo script (architecture-led)

Open on the **Architecture** tab. Timings are a guide.

**0:00 – 0:15 · The problem.**
"During the TSA, the truth about who's consuming what is scattered across seven systems —
HR in SuccessFactors, contingent workers in the MSP tracker, laptops in HAM, licences in SAM,
tickets in ServiceNow, demand in Smartsheet and Excel, money in Finance extracts. Today, joining
that up for the monthly report is a manual job."

**0:15 – 0:40 · How it's wired.** *(point at the diagram — flows are animating left to right)*
"DONNA sits above those systems — read-only, it never writes back. Each source lands on its own
cadence: daily extracts from SuccessFactors and HAM, hourly API pulls from ServiceNow, a monthly
billing file." *(click SuccessFactors, then HAM — the detail panel shows feed, frequency, key fields)*
"Stage one standardises everything into one model. Stage two is the important bit — **entity
linking**: identity resolution joins a person to their hardware, their software, their tickets
and their invoice lines. One graph."

**0:40 – 1:05 · The rules engine.**
"On top of that graph sits the TSA rules engine. It knows the commitment is 1,250 users, so it
flags the 38 we're over. It knows the 60-day replacement-hire rule, so a backfill doesn't count
against the baseline but a net-new joiner does. It classifies software as standard or
non-standard, and prices every exception." *(flick to **Workforce** or **Billing** to show it live)*

**1:05 – 1:30 · The output.** *(flick to **Monthly Report**)*
"Everything converges here: the AI layer drafts the monthly narrative, the pack sections
self-populate, exceptions arrive with the evidence already attached — which system disagreed
with which — and governance actions are owned and dated. The monthly report goes from days of
collation to a review job. And in 18 months when the TSA ends, DONNA switches off cleanly —
it's a run capability, not another platform."

---

## Requirement → screen mapping

| Requirement (notes / TSA reporting xlsx) | Where it lives |
|---|---|
| 1. Consolidate TSA data into one view | Overview |
| 2. Track workforce vs TSA commitments (joiners, leavers, replacements, overage, £/person) | Workforce vs TSA |
| 3. Link people → hardware/software/access (incl. Murphy's manual hardware check) | EUC & Hardware → "Onboarding ↔ hardware validation" |
| 4. Standard vs non-standard software, RTU, approvals, monthly + cumulative cost | Software & Licensing |
| 5. Summarise ServiceNow activity, trends, aged & recurring | Service Activity |
| 6. Demand & approval tracking (SNOW / Smartsheet / Excel, in/out of scope) | Demand & Approvals |
| 7. Chargeable activity & exceptions (incl. system mismatches) | Billing & Exceptions + Overview |
| 8. Monthly TSA reporting support (narrative draft, pack, actions) | Monthly Report |
| Market / BU / cost-centre reporting (xlsx) | Billing & Exceptions → "By market" |
| Governance & actions (xlsx) | Monthly Report → actions log |
| Architecture / wiring story for the demo | Architecture |

## Where to take it next (after the demo)

- Swap `data.js` for real connectors (SuccessFactors OData, ServiceNow REST, HAM/SAM extracts,
  Smartsheet API, finance file drops) behind a small ingestion service.
- Persist the linked entity model (person ↔ asset ↔ licence ↔ ticket ↔ invoice line).
- Wire the narrative block to an LLM call with the month's computed facts as context.
- Smartsheet remains the human-in-the-loop surface — confirm with the client what they are
  configuring there before committing the demand/validation integration.
