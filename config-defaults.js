/* ============================================================
   DONNA · shipped default configuration (do not mutate)
   Loaded into CONFIG on init; restored on reset.
   ============================================================ */

function _src(name) {
  return { name, status: name === "Smartsheet" ? "planned" : "live" };
}

const _ALL_INTEGRATED = [
  "ServiceNow", "MSP Ticketing", "SuccessFactors", "MSP Tracker",
  "HAM", "SAM", "Procurement", "Finance Systems", "Excel", "Smartsheet",
].map(_src);

const DEFAULT_CONFIG = {
  MODULES: [
    {
      id: "overview", label: "Overview", enabled: true, order: 1,
      sources: [_src("Smartsheet"), _src("ServiceNow")],
      help: {
        whatItIs: "Your single-page summary of how the TSA separation is going right now.",
        whyItMatters: "Gives you one trusted answer before a governance call — who is over the user commitment, what is chargeable, and what needs action.",
        whatItsDoing: "Pulls headcount, billing, service and exception figures together from live connected systems. Green means on track; amber is a watch item; red needs a decision.",
        dataSourceNote: "Aggregates live feeds from ServiceNow and other integrated systems. Smartsheet will add demand and governance registers when it goes live.",
        inputKeys: ["workforceCurrent", "tsaBaseline", "workforceAboveBaseline", "billingOutTsa", "serviceResolvedInSla", "exceptions"],
      },
    },
    {
      id: "workforce", label: "Workforce vs TSA", enabled: true, order: 2,
      sources: [_src("ServiceNow"), _src("MSP Ticketing")],
      help: {
        whatItIs: "Shows who is using TSA services compared to the agreed user commitment.",
        whyItMatters: "Helps you spot overages early — extra users can mean extra monthly charges that need agreeing with Vestacy.",
        whatItsDoing: "Joins permanent staff and contingent workers, classifies joiners as replacement hires or net new, and highlights when you are above the baseline.",
        dataSourceNote: "Headcount and movement data flow live from ServiceNow and MSP Ticketing into DONNA's unified model.",
        inputKeys: ["workforceCurrent", "workforceJoiners", "workforceLeavers", "workforceAboveBaseline", "workforceMovers"],
      },
    },
    {
      id: "hardware", label: "EUC & Hardware", enabled: true, order: 3,
      sources: [_src("SuccessFactors"), _src("MSP Tracker"), _src("ServiceNow")],
      help: {
        whatItIs: "Tracks laptops, BYOD and whether each person’s device matches their onboarding record.",
        whyItMatters: "Replaces manual hardware checks — mismatches flag where a charge might apply or where data quality needs fixing.",
        whatItsDoing: "Links onboarding records to the hardware asset register. Pending requests turn amber when they exceed your threshold; mismatches show in red.",
        dataSourceNote: "SuccessFactors and MSP Tracker supply onboarding; ServiceNow links service requests to device fulfilment.",
        inputKeys: ["hardwareLaptopsIssued", "hardwareByod", "hardwarePendingRequests", "hardwareValidation"],
      },
    },
    {
      id: "software", label: "Software & Licensing", enabled: true, order: 4,
      sources: [_src("HAM"), _src("ServiceNow")],
      help: {
        whatItIs: "A register of software licences — standard, non-standard and right-to-use.",
        whyItMatters: "Non-standard software is often chargeable to Vestacy; this view shows what was approved and what is still waiting.",
        whatItsDoing: "Classifies each licence, tracks monthly and cumulative cost, and flags items awaiting approval if they exceed your warning threshold.",
        dataSourceNote: "HAM holds device-linked software; ServiceNow captures software requests and approvals.",
        inputKeys: ["softwareStandardCost", "softwareNonStandardCost", "softwareItems"],
      },
    },
    {
      id: "service", label: "Service Activity", enabled: true, order: 5,
      sources: [_src("SAM"), _src("ServiceNow"), _src("Procurement")],
      help: {
        whatItIs: "A monthly summary of IT service desk performance.",
        whyItMatters: "Governance calls need to know if service is improving and whether aged tickets are a risk.",
        whatItsDoing: "Shows incidents, requests, SLA attainment and aged items. Colours reflect the SLA targets you set in Calibrate.",
        dataSourceNote: "ServiceNow is the primary ticket feed; SAM and Procurement add software and supply-chain context.",
        inputKeys: ["serviceIncidents", "serviceRequests", "serviceResolvedInSla", "serviceAged"],
      },
    },
    {
      id: "demand", label: "Demand & Approvals", enabled: true, order: 6,
      sources: [_src("Finance Systems"), _src("Procurement"), _src("Smartsheet")],
      help: {
        whatItIs: "A single register of demands raised during the TSA — from any connected system.",
        whyItMatters: "Anything outside TSA scope needs costing and approval before work starts; this prevents surprises on the invoice.",
        whatItsDoing: "Lists each demand with owner, stage, scope flag and estimated cost. Items outside TSA scope are highlighted.",
        dataSourceNote: "Finance Systems and Procurement supply cost data; Smartsheet will host the governance register when live.",
        inputKeys: ["demandRows"],
      },
    },
    {
      id: "billing", label: "Billing & Exceptions", enabled: true, order: 7,
      sources: [_src("Smartsheet"), _src("ServiceNow"), _src("Excel")],
      help: {
        whatItIs: "Matches invoice lines back to the people, assets or demands that evidence each charge.",
        whyItMatters: "Separates the base TSA fee from chargeable extras so you can explain every line on the monthly invoice.",
        whatItsDoing: "Shows invoice breakdown, market split and the exception log. Chargeable share turns amber when it exceeds your configured percentage.",
        dataSourceNote: "Finance Systems feed invoice lines; ServiceNow and Excel registers provide cross-check evidence.",
        inputKeys: ["billingMonthTotal", "billingOutTsa", "billingLines", "exceptions"],
      },
    },
    {
      id: "report", label: "Monthly Report", enabled: true, order: 8,
      sources: [_src("Finance Systems"), _src("SuccessFactors")],
      help: {
        whatItIs: "The draft monthly TSA pack and governance actions list.",
        whyItMatters: "Saves hours assembling the governance slide deck — Donna drafts the narrative; your team reviews before sending.",
        whatItsDoing: "Auto-populates each section from the other modules and drafts plain-English commentary for the Reckitt ↔ Vestacy call.",
        dataSourceNote: "Draws narrative and actions from Finance Systems and SuccessFactors position data across all modules.",
        inputKeys: ["reportNarrative", "reportActions"],
      },
    },
    {
      id: "arch", label: "Architecture", enabled: true, order: 9,
      sources: _ALL_INTEGRATED,
      help: {
        whatItIs: "A diagram of how DONNA sits above your existing systems without replacing them.",
        whyItMatters: "Helps stakeholders see that DONNA reads from systems of record and can be stood down cleanly when the TSA ends.",
        whatItsDoing: "Shows data flowing from all connected source systems through DONNA's rules engine to the monthly outputs.",
        dataSourceNote: "Illustrates every integrated system — all live today except Smartsheet, which is planned for go-live in ~3 months.",
        inputKeys: ["architecture"],
      },
    },
  ],

  CARDS: {
    overview: [
      { id: "liveSync", label: "Live Sync", builtin: "liveSync", section: "kpi", sources: ["smartsheet"], order: 0, enabled: true, hint: "Shows that Smartsheet is connected and data is refreshing automatically. Green pulse means live." },
      { id: "workforceCurrent", label: "Users consuming TSA", builtin: "workforceCurrent", inputKey: "workforceCurrent", section: "kpi", sources: ["both"], order: 1, enabled: true, hint: "Total Vestacy users on TSA services. Above the commitment baseline turns amber then red based on your thresholds." },
      { id: "billingOutTsa", label: "Chargeable outside base", builtin: "billingOutTsa", inputKey: "billingOutTsa", section: "kpi", sources: ["both"], order: 2, enabled: true, hint: "Extra charges outside the agreed monthly TSA fee — users over commitment, non-standard software, hardware, etc." },
      { id: "serviceSla", label: "Service within SLA", builtin: "serviceSla", inputKey: "serviceResolvedInSla", section: "kpi", sources: ["both"], order: 3, enabled: true, hint: "Percentage of tickets resolved within SLA. Green at or above your target; amber below." },
      { id: "exceptionsCount", label: "Open exceptions", builtin: "exceptionsCount", inputKey: "exceptions", section: "kpi", sources: ["both"], order: 4, enabled: true, hint: "Cross-system mismatches and data gaps that need a human decision before governance." },
      { id: "connectedSheets", label: "Connected Sheets", builtin: "connectedSheets", section: "kpi", sources: ["smartsheet"], order: 5, enabled: true, hint: "How many Smartsheet registers DONNA is reading from — demand, validation and actions." },
      { id: "consumptionChart", label: "Consumption vs commitment", builtin: "consumptionChart", section: "secondary", sources: ["both"], order: 0, enabled: true, hint: "Month-by-month view of users against the TSA commitment line." },
      { id: "monthSummary", label: "What changed this month", builtin: "monthSummary", section: "secondary", sources: ["both"], order: 1, enabled: true, hint: "Donna’s plain-English summary of the biggest movements this month." },
      { id: "recentChanges", label: "Recent changes", builtin: "recentChanges", section: "secondary", sources: ["smartsheet"], order: 2, enabled: true, hint: "Live activity feed from Smartsheet — who changed what and when." },
    ],
  },

  INPUTS: [
    { key: "months", label: "Reporting months", sourceField: "RPT_Months", smartsheetField: "rpt_months", dataPath: "months" },
    { key: "tsaBaseline", label: "TSA user commitment", sourceField: "TSA_Baseline_Users", smartsheetField: "tsa_baseline_users", dataPath: "tsa.baseline" },
    { key: "tsaCostPerUser", label: "Cost per user (£/mo)", sourceField: "TSA_Cost_Per_User", smartsheetField: "tsa_cost_per_user", dataPath: "tsa.costPerUser" },
    { key: "tsaEndDate", label: "TSA end date", sourceField: "TSA_End_Date", smartsheetField: "tsa_end_date", dataPath: "tsa.endDate" },
    { key: "workforceCurrent", label: "Users consuming TSA", sourceField: "WS_Current_Users", smartsheetField: "ws_current_users", dataPath: "workforce.current" },
    { key: "workforcePermanent", label: "Permanent headcount", sourceField: "WS_Permanent", smartsheetField: "ws_permanent", dataPath: "workforce.permanent" },
    { key: "workforceContingent", label: "Contingent headcount", sourceField: "WS_Contingent", smartsheetField: "ws_contingent", dataPath: "workforce.contingent" },
    { key: "workforceJoiners", label: "Joiners (month)", sourceField: "WS_Joiners", smartsheetField: "ws_joiners", dataPath: "workforce.joiners" },
    { key: "workforceLeavers", label: "Leavers (month)", sourceField: "WS_Leavers", smartsheetField: "ws_leavers", dataPath: "workforce.leavers" },
    { key: "workforceReplacements", label: "Replacement hires", sourceField: "WS_Replacements", smartsheetField: "ws_replacements", dataPath: "workforce.replacements" },
    { key: "workforceNetNew", label: "Net-new joiners", sourceField: "WS_Net_New", smartsheetField: "ws_net_new", dataPath: "workforce.netNew" },
    { key: "workforceAboveBaseline", label: "Users above commitment", sourceField: "WS_Above_Baseline", smartsheetField: "ws_above_baseline", dataPath: "workforce.aboveBaseline" },
    { key: "workforceTrendUsers", label: "User trend series", sourceField: "WS_Trend_Users", smartsheetField: "ws_trend_users", dataPath: "workforce.trend.users" },
    { key: "workforceTrendBaseline", label: "Baseline trend series", sourceField: "WS_Trend_Baseline", smartsheetField: "ws_trend_baseline", dataPath: "workforce.trend.baseline" },
    { key: "workforceTrendJoiners", label: "Joiner trend series", sourceField: "WS_Trend_Joiners", smartsheetField: "ws_trend_joiners", dataPath: "workforce.trend.joiners" },
    { key: "workforceTrendLeavers", label: "Leaver trend series", sourceField: "WS_Trend_Leavers", smartsheetField: "ws_trend_leavers", dataPath: "workforce.trend.leavers" },
    { key: "workforceMovers", label: "Movement register", sourceField: "WS_Movers", smartsheetField: "ws_movers", dataPath: "workforce.movers" },
    { key: "hardwareLaptopsIssued", label: "Laptops issued", sourceField: "HW_Laptops_Issued", smartsheetField: "hw_laptops", dataPath: "hardware.laptopsIssued" },
    { key: "hardwareByod", label: "BYOD users", sourceField: "HW_BYOD", smartsheetField: "hw_byod", dataPath: "hardware.byod" },
    { key: "hardwarePendingRequests", label: "Pending HW requests", sourceField: "HW_Pending", smartsheetField: "hw_pending", dataPath: "hardware.pendingRequests" },
    { key: "hardwareChargeableMonth", label: "Chargeable devices (month)", sourceField: "HW_Chargeable_Mo", smartsheetField: "hw_chargeable", dataPath: "hardware.chargeableThisMonth" },
    { key: "hardwareMix", label: "Estate mix breakdown", sourceField: "HW_Mix", smartsheetField: "hw_mix", dataPath: "hardware.mix" },
    { key: "hardwareValidation", label: "Onboarding ↔ HW validation", sourceField: "HW_Reconciled", smartsheetField: "hw_reconciled", dataPath: "hardware.validation" },
    { key: "softwareStandardCost", label: "Standard software cost", sourceField: "SW_Standard_Cost", smartsheetField: "sw_standard", dataPath: "software.standardCost" },
    { key: "softwareNonStandardCost", label: "Non-standard cost (month)", sourceField: "SW_NonStd_Cost", smartsheetField: "sw_nonstd", dataPath: "software.nonStandardCost" },
    { key: "softwareCumulative", label: "Cumulative non-standard", sourceField: "SW_NonStd_Cum", smartsheetField: "sw_nonstd_cum", dataPath: "software.cumulativeNonStandard" },
    { key: "softwareTrendNonStd", label: "Non-standard trend", sourceField: "SW_NonStd_Trend", smartsheetField: "sw_nonstd_trend", dataPath: "software.trend.nonStandard" },
    { key: "softwareItems", label: "Software register", sourceField: "SW_Register", smartsheetField: "sw_register", dataPath: "software.items" },
    { key: "serviceIncidents", label: "Incidents (month)", sourceField: "SVC_Incidents", smartsheetField: "svc_incidents", dataPath: "service.incidents" },
    { key: "serviceRequests", label: "Service requests (month)", sourceField: "SVC_Requests", smartsheetField: "svc_requests", dataPath: "service.requests" },
    { key: "serviceResolvedInSla", label: "Resolved within SLA", sourceField: "SVC_SLA_Pct", smartsheetField: "svc_sla_pct", dataPath: "service.resolvedInSla" },
    { key: "serviceOpen", label: "Open items", sourceField: "SVC_Open", smartsheetField: "svc_open", dataPath: "service.open" },
    { key: "serviceAged", label: "Aged items", sourceField: "SVC_Aged", smartsheetField: "svc_aged", dataPath: "service.aged" },
    { key: "serviceTrendIncidents", label: "Incident trend", sourceField: "SVC_Trend_Inc", smartsheetField: "svc_trend_inc", dataPath: "service.trend.incidents" },
    { key: "serviceTrendRequests", label: "Request trend", sourceField: "SVC_Trend_Req", smartsheetField: "svc_trend_req", dataPath: "service.trend.requests" },
    { key: "serviceTrendAged", label: "Aged trend", sourceField: "SVC_Trend_Aged", smartsheetField: "svc_trend_aged", dataPath: "service.trend.aged" },
    { key: "serviceRecurring", label: "Recurring issue clusters", sourceField: "SVC_Recurring", smartsheetField: "svc_recurring", dataPath: "service.recurring" },
    { key: "demandRows", label: "Demand register rows", sourceField: "DMD_Register", smartsheetField: "dmd_register", dataPath: "demand.rows" },
    { key: "billingMonthTotal", label: "Invoice total (month)", sourceField: "FIN_Month_Total", smartsheetField: "fin_month_total", dataPath: "billing.monthTotal" },
    { key: "billingInTsa", label: "Base TSA charge", sourceField: "FIN_In_TSA", smartsheetField: "fin_in_tsa", dataPath: "billing.inTsa" },
    { key: "billingOutTsa", label: "Chargeable outside base", sourceField: "FIN_Out_TSA", smartsheetField: "fin_out_tsa", dataPath: "billing.outTsa" },
    { key: "billingLines", label: "Invoice line items", sourceField: "FIN_Lines", smartsheetField: "fin_lines", dataPath: "billing.lines" },
    { key: "billingMarkets", label: "Market breakdown", sourceField: "FIN_Markets", smartsheetField: "fin_markets", dataPath: "billing.markets" },
    { key: "exceptions", label: "Exception log", sourceField: "EXC_Log", smartsheetField: "exc_log", dataPath: "exceptions" },
    { key: "reportNarrative", label: "Monthly narrative", sourceField: "RPT_Narrative", smartsheetField: "rpt_narrative", dataPath: "report.narrative" },
    { key: "reportActions", label: "Governance actions", sourceField: "RPT_Actions", smartsheetField: "rpt_actions", dataPath: "report.actions" },
    { key: "architecture", label: "Architecture model", sourceField: "ARCH_Model", smartsheetField: "arch_model", dataPath: "architecture" },
  ],

  CALIBRATION: {
    reportingPeriod: "May 2026",
    chartRangeLabel: "Jan – May 2026",
    workforce: { commitmentAmberPct: 100, commitmentRedPct: 102, replacementWindowDays: 60 },
    service: { slaTargetPct: 94, slaAmberPct: 90, agedItemDays: 20, agedWarnCount: 15 },
    hardware: { pendingWarnCount: 10, deviceCharge: 612 },
    software: { pendingApprovalWarn: 2 },
    billing: { outTsaWarnPct: 10 },
  },

  CALIBRATION_HINTS: {
    "workforce.commitmentAmberPct": "Lower this and more items flag amber sooner when headcount nears the commitment.",
    "workforce.commitmentRedPct": "When usage % reaches this, the dashboard shows red — the agreed danger zone.",
    "service.slaTargetPct": "Green SLA performance is measured against this target percentage.",
    "service.slaAmberPct": "Below this, SLA tiles turn amber as a warning.",
    "hardware.pendingWarnCount": "Pending laptop requests above this number show in amber.",
    "billing.outTsaWarnPct": "Chargeable share of invoice above this % triggers a warning colour.",
  },

  LAYOUT: {
    baseline: {
      kpi: { cols: 2, cards: ["workforceCurrent", "billingOutTsa", "serviceSla", "exceptionsCount"] },
      secondary: { cols: 2, cards: ["consumptionChart", "monthSummary"] },
      showExceptions: true,
    },
    smartsheet: {
      kpi: { cols: 3, cards: ["liveSync", "workforceCurrent", "billingOutTsa", "serviceSla", "exceptionsCount", "connectedSheets"] },
      secondary: { cols: 3, cards: ["consumptionChart", "monthSummary", "recentChanges"] },
      showExceptions: true,
    },
  },

  SMARTSHEET_FEED: {
    connectedSheets: 12,
    activity: [
      { who: "D. Marsh", what: "Moved DMD-0042 to In review", ago: "2m ago" },
      { who: "Murphy", what: "Validated HW row for P. Mehta", ago: "8m ago" },
      { who: "L. Brandt", what: "Updated Tableau approval status", ago: "14m ago" },
      { who: "Donna M.", what: "Flagged 38-user overage for June GovCo", ago: "22m ago" },
      { who: "B. Kowalski", what: "Added DMD-0044 from Excel register", ago: "31m ago" },
    ],
  },

  CONNECTIONS: {
    help: "DONNA reads live from the connected systems below. Smartsheet is the one system being added — when it goes live in ~3 months, this is the exact slot it plugs into. Nothing else in DONNA needs to change.",
    systems: [
      { name: "ServiceNow", status: "live", connector: "API · hourly" },
      { name: "MSP Ticketing", status: "live", connector: "API · hourly" },
      { name: "SuccessFactors", status: "live", connector: "Daily extract" },
      { name: "MSP Tracker", status: "live", connector: "Weekly sync" },
      { name: "HAM", status: "live", connector: "Daily sync" },
      { name: "SAM", status: "live", connector: "Daily sync" },
      { name: "Procurement", status: "live", connector: "Daily sync" },
      { name: "Finance Systems", status: "live", connector: "Monthly extract" },
      { name: "Excel", status: "live", connector: "Connected register" },
      { name: "Smartsheet", status: "planned", connector: "API · on change", eta: "Going live ~3 months" },
    ],
    smartsheet: { sheetId: "", syncFrequency: "hourly" },
  },

  GUIDE: {
    title: "How DONNA works",
    intro: "DONNA is your TSA run-and-control dashboard for the Reckitt ↔ Vestacy separation. It sits above your existing systems as a live integration layer — it reads from them but never writes back — and gives you one place to see position, charges and exceptions during the ~18-month TSA period.",
    sections: [
      {
        heading: "What DONNA is",
        body: "A practical intelligence layer for the divestiture period. It brings workforce, hardware, software, service, demand and billing into one view so you can run monthly governance with confidence — without building a new platform.",
      },
      {
        heading: "Where data comes from",
        body: "DONNA already draws live from ServiceNow, SuccessFactors, HAM, SAM, Finance Systems and other connected registers. Smartsheet is being added in ~3 months for demand and governance workflows — use the preview toggle to see how the dashboard will look when it goes live. No rebuild required.",
      },
      {
        heading: "How to make it yours",
        body: "Open Calibrate to rename or reorder tabs, add cards, re-point input mappings, and tune amber/red thresholds. Everything saves automatically in this browser. Export your setup as a file to move it to another machine or share with a colleague.",
      },
    ],
    tryThis: [
      "Read the ⓘ help on any page to understand what you are looking at.",
      "Open Connections to see every system DONNA reads from.",
      "Toggle Show planned Smartsheet integration to preview the future layout.",
      "Lower the commitment red threshold and watch workforce tiles change colour.",
      "Export configuration, refresh the page, then Import to restore your setup.",
    ],
  },

  CALIBRATE_HELP: {
    modules: "Turn tabs on or off, rename them, and reorder the left menu. Add your own modules for extra views — each can carry its own help text.",
    cards: "Choose a module, then edit its cards: rename metrics, pick which data field feeds them, and add plain-English hints shown on ⓘ icons.",
    inputs: "This is where each number on the dashboard connects to fields in your source systems. Change a mapping here when a connector's field name changes — no code required.",
    calibration: "Tune amber and red thresholds, reporting period labels and charge assumptions. The dashboard recolours live as you adjust sliders.",
    connections: "See every system DONNA is connected to. Smartsheet is planned for ~3 months — configure the stub here so go-live is a single connection step.",
    persistence: "Your changes are saved automatically in this browser. Export to keep a portable copy.",
  },
};
