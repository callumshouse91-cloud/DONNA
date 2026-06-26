/* ============================================================
   DONNA · shipped default configuration (do not mutate)
   Loaded into CONFIG on init; restored on reset.
   ============================================================ */

const DEFAULT_CONFIG = {
  MODULES: [
    {
      id: "overview", label: "Overview", enabled: true, order: 1,
      help: {
        whatItIs: "Your single-page summary of how the TSA separation is going right now.",
        whyItMatters: "Gives you one trusted answer before a governance call — who is over the user commitment, what is chargeable, and what needs action.",
        whatItsDoing: "Pulls headcount, billing, service and exception figures together. Green means on track; amber is a watch item; red needs a decision. Numbers come from the input mappings you can edit in Calibrate.",
        dataSourceNote: "Today these metrics are read from your Excel export columns. When Smartsheet is connected, the same cards read live — you only change the source toggle.",
        inputKeys: ["workforceCurrent", "tsaBaseline", "workforceAboveBaseline", "billingOutTsa", "serviceResolvedInSla", "exceptions"],
      },
    },
    {
      id: "workforce", label: "Workforce vs TSA", enabled: true, order: 2,
      help: {
        whatItIs: "Shows who is using TSA services compared to the agreed user commitment.",
        whyItMatters: "Helps you spot overages early — extra users can mean extra monthly charges that need agreeing with Vestacy.",
        whatItsDoing: "Joins permanent staff (SuccessFactors) and contingent workers (MSP tracker), classifies joiners as replacement hires or net new, and highlights when you are above the baseline.",
        dataSourceNote: "Headcount and movement data map to Excel fields like WS_Current_Users and WS_Joiners — re-point these in Calibrate if your spreadsheet column names differ.",
        inputKeys: ["workforceCurrent", "workforceJoiners", "workforceLeavers", "workforceAboveBaseline", "workforceMovers"],
      },
    },
    {
      id: "hardware", label: "EUC & Hardware", enabled: true, order: 3,
      help: {
        whatItIs: "Tracks laptops, BYOD and whether each person’s device matches their onboarding record.",
        whyItMatters: "Stops manual hardware checks — mismatches flag where a charge might apply or where data quality needs fixing.",
        whatItsDoing: "Links onboarding to the hardware asset register (HAM). Pending requests turn amber when they exceed your threshold; mismatches show in red.",
        dataSourceNote: "Device counts and validation rows map to HW_* Excel columns today; Smartsheet will use the paired smartsheet field names.",
        inputKeys: ["hardwareLaptopsIssued", "hardwareByod", "hardwarePendingRequests", "hardwareValidation"],
      },
    },
    {
      id: "software", label: "Software & Licensing", enabled: true, order: 4,
      help: {
        whatItIs: "A register of software licences — standard, non-standard and right-to-use.",
        whyItMatters: "Non-standard software is often chargeable to Vestacy; this view shows what was approved and what is still waiting.",
        whatItsDoing: "Classifies each licence, tracks monthly and cumulative cost, and flags items awaiting approval if they exceed your warning threshold.",
        dataSourceNote: "Costs and register rows map to SW_* fields in your Excel export.",
        inputKeys: ["softwareStandardCost", "softwareNonStandardCost", "softwareItems"],
      },
    },
    {
      id: "service", label: "Service Activity", enabled: true, order: 5,
      help: {
        whatItIs: "A monthly summary of IT service desk performance from ServiceNow.",
        whyItMatters: "Governance calls need to know if service is improving and whether aged tickets are a risk.",
        whatItsDoing: "Shows incidents, requests, SLA attainment and aged items. Colours reflect the SLA targets you set in Calibrate.",
        dataSourceNote: "Ticket volumes and SLA % map to SVC_* Excel columns.",
        inputKeys: ["serviceIncidents", "serviceRequests", "serviceResolvedInSla", "serviceAged"],
      },
    },
    {
      id: "demand", label: "Demand & Approvals", enabled: true, order: 6,
      help: {
        whatItIs: "A single register of demands raised during the TSA — from ServiceNow, Smartsheet or Excel.",
        whyItMatters: "Anything outside TSA scope needs costing and approval before work starts; this prevents surprises on the invoice.",
        whatItsDoing: "Lists each demand with owner, stage, scope flag and estimated cost. Items outside TSA scope are highlighted.",
        dataSourceNote: "Demand rows map to the DMD_Register field in Excel.",
        inputKeys: ["demandRows"],
      },
    },
    {
      id: "billing", label: "Billing & Exceptions", enabled: true, order: 7,
      help: {
        whatItIs: "Matches invoice lines back to the people, assets or demands that evidence each charge.",
        whyItMatters: "Separates the base TSA fee from chargeable extras so you can explain every line on the monthly invoice.",
        whatItsDoing: "Shows invoice breakdown, market split and the exception log. Chargeable share turns amber when it exceeds your configured percentage.",
        dataSourceNote: "Invoice totals and lines map to FIN_* Excel fields.",
        inputKeys: ["billingMonthTotal", "billingOutTsa", "billingLines", "exceptions"],
      },
    },
    {
      id: "report", label: "Monthly Report", enabled: true, order: 8,
      help: {
        whatItIs: "The draft monthly TSA pack and governance actions list.",
        whyItMatters: "Saves hours assembling the governance slide deck — Donna drafts the narrative; your team reviews before sending.",
        whatItsDoing: "Auto-populates each section from the other modules and drafts plain-English commentary for the Reckitt ↔ Vestacy call.",
        dataSourceNote: "Narrative and actions map to RPT_Narrative and RPT_Actions in Excel.",
        inputKeys: ["reportNarrative", "reportActions"],
      },
    },
    {
      id: "arch", label: "Architecture", enabled: true, order: 9,
      help: {
        whatItIs: "A diagram of how DONNA sits above your existing systems without replacing them.",
        whyItMatters: "Helps stakeholders see that DONNA reads from systems of record and can be stood down cleanly when the TSA ends.",
        whatItsDoing: "Shows data flowing from source systems through DONNA’s rules engine to the monthly outputs. The ingestion node changes label when you switch Excel ↔ Smartsheet.",
        dataSourceNote: "Illustrative only — the diagram reflects your active data source, not live connection status.",
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
    excel: {
      lastUpload: "14 May 2026, 09:42",
      kpi: { cols: 2, cards: ["workforceCurrent", "billingOutTsa", "serviceSla", "exceptionsCount"] },
      secondary: { cols: 2, cards: ["consumptionChart", "monthSummary"] },
      manualTags: ["workforceCurrent", "billingOutTsa"],
      showExceptions: true,
    },
    smartsheet: {
      kpi: { cols: 3, cards: ["liveSync", "workforceCurrent", "billingOutTsa", "serviceSla", "exceptionsCount", "connectedSheets"] },
      secondary: { cols: 3, cards: ["consumptionChart", "monthSummary", "recentChanges"] },
      manualTags: [],
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
    excel: {
      status: "Active",
      connector: "Manual upload",
      help: "Your Excel export is uploaded manually. When you receive a new file, upload it and DONNA refreshes from the mapped columns.",
    },
    smartsheet: {
      status: "Planned · not yet connected",
      connector: "Live API sync",
      sheetId: "",
      syncFrequency: "hourly",
      help: "When Smartsheet goes live in ~3 months, you enter the Sheet ID here and turn on sync. The dashboard layout, cards and thresholds stay exactly as you configured them — only this connection changes.",
    },
  },

  GUIDE: {
    title: "How DONNA works",
    intro: "DONNA is your TSA run-and-control dashboard for the Reckitt ↔ Vestacy separation. It sits above your existing systems — it reads from them but never writes back — and gives you one place to see position, charges and exceptions during the ~18-month TSA period.",
    sections: [
      {
        heading: "What DONNA is",
        body: "A practical intelligence layer for the divestiture period. It brings workforce, hardware, software, service, demand and billing into one view so you can run monthly governance with confidence — without building a new platform.",
      },
      {
        heading: "Where data comes from",
        body: "Today DONNA reads from an Excel export you upload (manual snapshot). In a few months you will switch to Smartsheet live sync — that is a single toggle at the top, not a rebuild. The same cards, thresholds and layout stay; only the connector changes.",
      },
      {
        heading: "How to make it yours",
        body: "Open Calibrate (gear icon) to rename or reorder tabs, add cards, re-point which Excel column feeds each metric, and tune amber/red thresholds. Everything saves automatically in this browser. Export your setup as a file to move it to another machine or share with a colleague.",
      },
    ],
    tryThis: [
      "Read the ⓘ help on any page to understand what you are looking at.",
      "Open Calibrate → Modules and hide a tab you do not need.",
      "Lower the commitment red threshold and watch workforce tiles change colour.",
      "Toggle Excel ↔ Smartsheet to see the layout and live tiles transform.",
      "Export configuration, refresh the page, then Import to restore your setup.",
    ],
  },

  CALIBRATE_HELP: {
    modules: "Turn tabs on or off, rename them, and reorder the left menu. Add your own modules for extra views — each can carry its own help text.",
    cards: "Choose a module, then edit its cards: rename metrics, pick which data field feeds them, and add plain-English hints shown on ⓘ icons.",
    inputs: "This is where each number on the dashboard connects to your spreadsheet. Change the Excel column name here when your export layout changes — no code required.",
    calibration: "Tune amber and red thresholds, reporting period labels and charge assumptions. The dashboard recolours live as you adjust sliders.",
    connections: "See which data source is active today and configure the Smartsheet slot ready for go-live. The source toggle at the top previews the future layout.",
    persistence: "Your changes are saved automatically in this browser. Export to keep a portable copy.",
  },
};
