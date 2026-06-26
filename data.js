/* ============================================================
   DONNA · mock dataset (all figures illustrative, demo only)
   Period: Jan – May 2026 · Reporting month: May 2026
   ============================================================ */

let DATA_SOURCE = "excel"; // "excel" | "smartsheet"

const SOURCE_META = {
  excel: {
    label: "Excel export",
    connector: "Manual upload",
    sync: "Last refreshed manually",
    status: "current",
  },
  smartsheet: {
    label: "Smartsheet API",
    connector: "Live sync",
    sync: "Auto-synced",
    status: "planned",
  },
};

const _DATA = {
  months: ["Jan", "Feb", "Mar", "Apr", "May"],

  tsa: {
    baseline: 1250,            // agreed user commitment in the TSA
    costPerUser: 142,          // £/month per user where applicable
    endDate: "Nov 2027",       // c.18 month run
  },

  workforce: {
    current: 1288,
    permanent: 1012,
    contingent: 276,
    joiners: 24,
    leavers: 17,
    replacements: 9,           // of the 24 joiners, 9 backfill leavers
    netNew: 15,                // incremental, count against baseline
    aboveBaseline: 38,
    trend: {                   // total Vestacy users consuming TSA services
      users:    [1231, 1244, 1259, 1281, 1288],
      baseline: [1250, 1250, 1250, 1250, 1250],
      joiners:  [18, 21, 26, 31, 24],
      leavers:  [11, 8, 11, 9, 17],
    },
    movers: [
      { name: "A. Okafor",   type: "Permanent",  movement: "Joiner",      class: "Replacement hire", hw: "Laptop issued",  src: "SuccessFactors" },
      { name: "J. Lindqvist",type: "Contingent", movement: "Joiner",      class: "Net new",          hw: "BYOD",           src: "MSP onboarding" },
      { name: "P. Mehta",    type: "Permanent",  movement: "Joiner",      class: "Net new",          hw: "Laptop issued",  src: "SuccessFactors" },
      { name: "S. Carvalho", type: "Permanent",  movement: "Leaver",      class: "—",                hw: "Laptop returned",src: "SuccessFactors" },
      { name: "T. Nguyen",   type: "Contingent", movement: "Joiner",      class: "Net new",          hw: "Pending request",src: "MSP onboarding" },
      { name: "R. Whitfield",type: "Permanent",  movement: "Joiner",      class: "Replacement hire", hw: "BYOD",           src: "SuccessFactors" },
      { name: "M. Duarte",   type: "Contingent", movement: "Leaver",      class: "—",                hw: "No asset held",  src: "MSP onboarding" },
    ],
  },

  hardware: {
    laptopsIssued: 941,
    byod: 287,
    pendingRequests: 14,
    chargeableThisMonth: 11,   // new joiner devices outside provision
    mix: [
      { label: "Reckitt-provided laptop", value: 941, color: "#E4007C" },
      { label: "BYOD",                    value: 287, color: "#FF8A3C" },
      { label: "Vestacy-provided",        value: 46,  color: "#6C2D82" },
      { label: "Pending / unresolved",    value: 14,  color: "#9AA7B3" },
    ],
    validation: [ // the "Murphy view" – onboarding vs hardware reconciliation
      { user: "J. Lindqvist", onboarded: true,  requested: false, issued: false, byod: true,  provider: "—",       month: "May", charge: 0,   status: "ok" },
      { user: "P. Mehta",     onboarded: true,  requested: true,  issued: true,  byod: false, provider: "Reckitt", month: "May", charge: 612, status: "charge" },
      { user: "T. Nguyen",    onboarded: true,  requested: true,  issued: false, byod: false, provider: "Reckitt", month: "May", charge: 0,   status: "pending" },
      { user: "R. Whitfield", onboarded: true,  requested: false, issued: false, byod: true,  provider: "—",       month: "May", charge: 0,   status: "ok" },
      { user: "A. Okafor",    onboarded: true,  requested: true,  issued: true,  byod: false, provider: "Reckitt", month: "Apr", charge: 612, status: "charge" },
      { user: "K. Aldridge",  onboarded: false, requested: true,  issued: true,  byod: false, provider: "Reckitt", month: "May", charge: 612, status: "mismatch" },
    ],
  },

  software: {
    standardCost: 18420,
    nonStandardCost: 4310,
    cumulativeNonStandard: 16890,
    openExceptions: 6,
    items: [
      { user: "L. Brandt",   sw: "Adobe Creative Cloud",   cls: "Non-standard", requested: "May", approved: "Approved",  monthly: 52,  cum: 156,  chargeable: true  },
      { user: "P. Mehta",    sw: "Tableau Creator",        cls: "Non-standard", requested: "May", approved: "Pending",   monthly: 70,  cum: 70,   chargeable: true  },
      { user: "Vestacy IT",  sw: "Postman Enterprise ×12", cls: "Non-standard", requested: "Apr", approved: "Approved",  monthly: 228, cum: 456,  chargeable: true  },
      { user: "S. Romero",   sw: "M365 E3",                cls: "Standard",     requested: "May", approved: "Auto",      monthly: 0,   cum: 0,    chargeable: false },
      { user: "J. Lindqvist",sw: "Figma Professional",     cls: "Non-standard", requested: "May", approved: "Rejected",  monthly: 0,   cum: 0,    chargeable: false },
      { user: "Finance team",sw: "SAP RTU (continued)",    cls: "Right-to-use", requested: "Jan", approved: "Approved",  monthly: 1840,cum: 9200, chargeable: true  },
      { user: "R. Whitfield",sw: "Miro Business",          cls: "Non-standard", requested: "Apr", approved: "Approved",  monthly: 16,  cum: 32,   chargeable: true  },
    ],
    trend: { nonStandard: [2160, 2740, 3300, 3920, 4310] },
  },

  service: {
    incidents: 184, requests: 312, demands: 9, open: 73, aged: 12,
    resolvedInSla: 0.94,
    trend: {
      incidents: [212, 198, 205, 191, 184],
      requests:  [268, 285, 297, 304, 312],
      aged:      [21, 18, 16, 14, 12],
    },
    recurring: [
      { issue: "VPN drops · Vestacy split-tunnel profile", count: 31, dir: "down", note: "Fix deployed 12 May, monitoring" },
      { issue: "SAP access re-provisioning after role moves", count: 19, dir: "flat", note: "Process gap — raised in governance" },
      { issue: "Laptop build delays for new joiners", count: 11, dir: "up", note: "Links to 14 pending HAM requests" },
    ],
  },

  demand: {
    rows: [
      { id: "DMD-0041", title: "Vestacy data-room extension (legal hold)", owner: "C. Adeyemi",  source: "ServiceNow", stage: "Awaiting approval", scope: "Outside TSA", cost: 18500, flag: true  },
      { id: "DMD-0042", title: "Additional Smartsheet licences ×25",       owner: "D. Marsh",    source: "Smartsheet", stage: "In review",         scope: "Inside TSA",  cost: 3400,  flag: false },
      { id: "DMD-0043", title: "Payroll interface change (cutover prep)",  owner: "H. Osei",     source: "ServiceNow", stage: "Approved",          scope: "Outside TSA", cost: 27200, flag: true  },
      { id: "DMD-0044", title: "Meeting-room AV refresh · Hull site",      owner: "B. Kowalski", source: "Excel",      stage: "Draft",             scope: "Inside TSA",  cost: 6100,  flag: false },
      { id: "DMD-0045", title: "Non-standard SW catalogue uplift",         owner: "L. Brandt",   source: "Smartsheet", stage: "Awaiting approval", scope: "Outside TSA", cost: 4310,  flag: true  },
    ],
  },

  billing: {
    monthTotal: 198640,
    inTsa: 176300,
    outTsa: 22340,
    lines: [
      { line: "TSA base service charge (per-user)", basis: "1,250 users × £142", amount: 177500, scope: "Inside TSA" },
      { line: "Users above commitment",             basis: "38 users × £142",    amount: 5396,   scope: "Chargeable" },
      { line: "Non-standard software",              basis: "6 approved items",   amount: 4310,   scope: "Chargeable" },
      { line: "New joiner hardware",                basis: "11 devices × £612",  amount: 6732,   scope: "Chargeable" },
      { line: "Out-of-scope demand (approved)",     basis: "DMD-0043",           amount: 5902,   scope: "Chargeable" },
      { line: "Credit · early server decommission", basis: "Agreed Apr GovCo",   amount: -1200,  scope: "Inside TSA" },
    ],
    markets: [
      { market: "UK & Ireland", users: 512, cost: 79180 },
      { market: "DACH",         users: 304, cost: 46920 },
      { market: "North America",users: 286, cost: 44510 },
      { market: "ASEAN",        users: 186, cost: 28030 },
    ],
  },

  exceptions: [
    { sev: "high", what: "38 users above TSA commitment", detail: "Net new joiners exceed baseline by 3.0% — additional charge exposure £5,396/mo.", src: "SuccessFactors ↔ TSA schedule", action: "Confirm at June GovCo" },
    { sev: "high", what: "Onboarding/asset mismatch — K. Aldridge", detail: "Laptop issued in HAM but no onboarding record in SuccessFactors or MSP tracker.", src: "HAM ↔ SuccessFactors", action: "Murphy to validate" },
    { sev: "med",  what: "Unapproved software billed", detail: "Tableau Creator (P. Mehta) appears on the May invoice but approval is still pending.", src: "Billing ↔ SAM", action: "Hold line, chase approval" },
    { sev: "med",  what: "14 hardware requests pending > 10 days", detail: "Linked to recurring 'laptop build delay' incidents — joiner experience risk.", src: "HAM ↔ ServiceNow", action: "Escalate to EUC lead" },
    { sev: "low",  what: "2 demands raised outside governance", detail: "DMD-0044 captured in Excel only — not yet mirrored to Smartsheet.", src: "Excel ↔ Smartsheet", action: "Add to register" },
  ],

  report: {
    narrative:
`Overall the TSA remained green in May 2026. Service performance improved for a third consecutive month — incidents fell 3.7% to 184 while resolution within SLA held at 94%, and aged items reduced from 14 to 12.

The workforce position is the key watch item. Vestacy consumption reached 1,288 users against a commitment of 1,250 (+38, +3.0%). Of 24 May joiners, 9 were replacement hires and 15 were net new. At the agreed rate this creates £5,396/month of additional charge exposure, which should be confirmed at the June governance call.

Chargeable activity outside the base service totalled £22,340: users above commitment (£5,396), non-standard software (£4,310), new joiner hardware (£6,732) and the approved out-of-scope payroll demand DMD-0043 (£5,902). One invoice line (Tableau Creator) is held pending approval evidence.

Two data-quality exceptions require action: one onboarding/asset mismatch (laptop issued without an onboarding record) and one demand tracked in Excel only. Both are assigned with owners in the actions log.`,
    actions: [
      { action: "Confirm 38-user overage and charge treatment", owner: "Donna M.", due: "12 Jun", status: "Open" },
      { action: "Validate Aldridge HAM/SuccessFactors mismatch", owner: "Murphy",  due: "07 Jun", status: "Open" },
      { action: "Evidence approval for Tableau invoice line",    owner: "L. Brandt", due: "10 Jun", status: "Open" },
      { action: "Migrate DMD-0044 from Excel to Smartsheet",     owner: "B. Kowalski", due: "14 Jun", status: "Open" },
      { action: "Review laptop build SLA with EUC vendor",       owner: "EUC Lead", due: "20 Jun", status: "In progress" },
    ],
  },

  /* ------------- architecture model ------------- */
  architecture: {
    sources: [
      { id:"sf",  name:"SuccessFactors", color:"#E4007C", feeds:"Permanent employees, joiners & leavers",
        freq:"Daily extract", keys:["Employee ID","Status / movement","Org & cost centre","Market"],
        role:"System of record for the permanent population. Joiner/leaver events anchor the workforce position vs the TSA baseline." },
      { id:"msp", name:"MSP Onboarding", color:"#FF4F58", feeds:"Contingent workers & onboarding lists",
        freq:"Weekly file", keys:["Worker ID","Engagement dates","Agency","Onboarding status"],
        role:"Covers the contingent population SuccessFactors doesn't. Joined to SF on identity to avoid double counting." },
      { id:"ham", name:"HAM", color:"#FF8A3C", feeds:"Hardware & laptop allocation",
        freq:"Daily sync", keys:["Asset tag","Assigned user","Provider (Reckitt/Vestacy)","Issue date"],
        role:"Links every person to their device — issued, BYOD or pending — and drives new-joiner hardware charges." },
      { id:"sam", name:"SAM", color:"#F2A93B", feeds:"Software & licence allocation",
        freq:"Daily sync", keys:["Licence ID","Assigned user","Standard / non-standard","Monthly cost"],
        role:"Classifies software against the TSA catalogue and prices non-standard or right-to-use exceptions." },
      { id:"snow",name:"ServiceNow", color:"#6C2D82", feeds:"Tickets, incidents, SRs & demand",
        freq:"API · hourly", keys:["Ticket no.","Type & priority","State / age","Linked user & CI"],
        role:"Service performance, trends and aged items — plus demand records raised through the SNOW catalogue." },
      { id:"ss",  name:"Smartsheet", color:"#00A3A1", feeds:"Demand register, validation & actions",
        freq:"API · on change", keys:["Demand ID","Approval stage","Owner","Manual validation flags"],
        role:"The human-in-the-loop layer: manual validation (e.g. hardware checks) and the governance actions log." },
      { id:"fin", name:"Finance / Billing", color:"#4FB3E8", feeds:"Billing & invoice extracts",
        freq:"Monthly extract", keys:["Invoice line","Amount","Cost centre / market","TSA scope flag"],
        role:"Every invoice line is matched back to the user, asset or demand that evidences it." },
    ],
    core: [
      { id:"ing",  name:"Ingest & Standardise", desc:"Scheduled pulls and file drops landed to one model; field mapping and currency/format normalisation." },
      { id:"link", name:"Entity Linking", desc:"Identity resolution joins person ↔ hardware ↔ software ↔ tickets ↔ invoice lines into a single graph." },
      { id:"rules",name:"TSA Rules Engine", desc:"Baseline & threshold checks, replacement-vs-net-new logic, standard/non-standard classification, chargeability." },
      { id:"ai",   name:"AI Narrative & Anomaly", desc:"Drafts the monthly summary, flags month-on-month changes, surfaces mismatches between systems." },
    ],
    outputs: [
      { id:"o1", name:"Monthly TSA Report" },
      { id:"o2", name:"Exceptions & Charges" },
      { id:"o3", name:"Governance Pack" },
    ],
  },
};

/** Single accessor — UI reads through here; upstream connector is swappable. */
function getData() {
  return _DATA;
}

function getSourceMeta(source = DATA_SOURCE) {
  return SOURCE_META[source];
}

let _onDataSourceChange = null;

function onDataSourceChange(fn) {
  _onDataSourceChange = fn;
}

function setDataSource(source) {
  if (source !== "excel" && source !== "smartsheet") return;
  if (source === DATA_SOURCE) return;
  DATA_SOURCE = source;
  if (typeof savePersistedConfig === "function") savePersistedConfig();
  if (typeof _onDataSourceChange === "function") _onDataSourceChange(source);
}
