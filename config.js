/* ============================================================
   DONNA · single configuration surface
   Modules, Excel input mappings, and calibration thresholds.
   Edit here (or in-session via the Calibrate panel) — not in views.
   ============================================================ */

const CONFIG = {
  MODULES: [
    { id: "overview",  label: "Overview",             enabled: true,  order: 1 },
    { id: "workforce", label: "Workforce vs TSA",     enabled: true,  order: 2 },
    { id: "hardware",  label: "EUC & Hardware",       enabled: true,  order: 3 },
    { id: "software",  label: "Software & Licensing", enabled: true,  order: 4 },
    { id: "service",   label: "Service Activity",     enabled: true,  order: 5 },
    { id: "demand",    label: "Demand & Approvals",   enabled: true,  order: 6 },
    { id: "billing",   label: "Billing & Exceptions", enabled: true,  order: 7 },
    { id: "report",    label: "Monthly Report",       enabled: true,  order: 8 },
    { id: "arch",      label: "Architecture",         enabled: true,  order: 9 },
  ],

  INPUTS: [
    { key: "months",                  label: "Reporting months",           sourceField: "RPT_Months",           source: "excel", dataPath: "months" },
    { key: "tsaBaseline",             label: "TSA user commitment",        sourceField: "TSA_Baseline_Users",   source: "excel", dataPath: "tsa.baseline" },
    { key: "tsaCostPerUser",          label: "Cost per user (£/mo)",       sourceField: "TSA_Cost_Per_User",    source: "excel", dataPath: "tsa.costPerUser" },
    { key: "tsaEndDate",              label: "TSA end date",               sourceField: "TSA_End_Date",         source: "excel", dataPath: "tsa.endDate" },
    { key: "workforceCurrent",        label: "Users consuming TSA",        sourceField: "WS_Current_Users",     source: "excel", dataPath: "workforce.current" },
    { key: "workforcePermanent",      label: "Permanent headcount",        sourceField: "WS_Permanent",         source: "excel", dataPath: "workforce.permanent" },
    { key: "workforceContingent",     label: "Contingent headcount",       sourceField: "WS_Contingent",        source: "excel", dataPath: "workforce.contingent" },
    { key: "workforceJoiners",        label: "Joiners (month)",            sourceField: "WS_Joiners",           source: "excel", dataPath: "workforce.joiners" },
    { key: "workforceLeavers",        label: "Leavers (month)",            sourceField: "WS_Leavers",           source: "excel", dataPath: "workforce.leavers" },
    { key: "workforceReplacements",   label: "Replacement hires",          sourceField: "WS_Replacements",      source: "excel", dataPath: "workforce.replacements" },
    { key: "workforceNetNew",         label: "Net-new joiners",            sourceField: "WS_Net_New",           source: "excel", dataPath: "workforce.netNew" },
    { key: "workforceAboveBaseline",  label: "Users above commitment",     sourceField: "WS_Above_Baseline",    source: "excel", dataPath: "workforce.aboveBaseline" },
    { key: "workforceTrendUsers",     label: "User trend series",          sourceField: "WS_Trend_Users",       source: "excel", dataPath: "workforce.trend.users" },
    { key: "workforceTrendBaseline",  label: "Baseline trend series",      sourceField: "WS_Trend_Baseline",    source: "excel", dataPath: "workforce.trend.baseline" },
    { key: "workforceTrendJoiners",   label: "Joiner trend series",        sourceField: "WS_Trend_Joiners",     source: "excel", dataPath: "workforce.trend.joiners" },
    { key: "workforceTrendLeavers",   label: "Leaver trend series",        sourceField: "WS_Trend_Leavers",     source: "excel", dataPath: "workforce.trend.leavers" },
    { key: "workforceMovers",         label: "Movement register",          sourceField: "WS_Movers",            source: "excel", dataPath: "workforce.movers" },
    { key: "hardwareLaptopsIssued",   label: "Laptops issued",             sourceField: "HW_Laptops_Issued",    source: "excel", dataPath: "hardware.laptopsIssued" },
    { key: "hardwareByod",            label: "BYOD users",                 sourceField: "HW_BYOD",              source: "excel", dataPath: "hardware.byod" },
    { key: "hardwarePendingRequests", label: "Pending HW requests",        sourceField: "HW_Pending",           source: "excel", dataPath: "hardware.pendingRequests" },
    { key: "hardwareChargeableMonth", label: "Chargeable devices (month)", sourceField: "HW_Chargeable_Mo",     source: "excel", dataPath: "hardware.chargeableThisMonth" },
    { key: "hardwareMix",             label: "Estate mix breakdown",       sourceField: "HW_Mix",               source: "excel", dataPath: "hardware.mix" },
    { key: "hardwareValidation",      label: "Onboarding ↔ HW validation", sourceField: "HW_Reconciled",        source: "excel", dataPath: "hardware.validation" },
    { key: "softwareStandardCost",    label: "Standard software cost",     sourceField: "SW_Standard_Cost",     source: "excel", dataPath: "software.standardCost" },
    { key: "softwareNonStandardCost", label: "Non-standard cost (month)",  sourceField: "SW_NonStd_Cost",       source: "excel", dataPath: "software.nonStandardCost" },
    { key: "softwareCumulative",      label: "Cumulative non-standard",    sourceField: "SW_NonStd_Cum",        source: "excel", dataPath: "software.cumulativeNonStandard" },
    { key: "softwareTrendNonStd",     label: "Non-standard trend",         sourceField: "SW_NonStd_Trend",      source: "excel", dataPath: "software.trend.nonStandard" },
    { key: "softwareItems",           label: "Software register",          sourceField: "SW_Register",          source: "excel", dataPath: "software.items" },
    { key: "serviceIncidents",        label: "Incidents (month)",          sourceField: "SVC_Incidents",        source: "excel", dataPath: "service.incidents" },
    { key: "serviceRequests",         label: "Service requests (month)",   sourceField: "SVC_Requests",         source: "excel", dataPath: "service.requests" },
    { key: "serviceResolvedInSla",    label: "Resolved within SLA",        sourceField: "SVC_SLA_Pct",          source: "excel", dataPath: "service.resolvedInSla" },
    { key: "serviceOpen",             label: "Open items",                 sourceField: "SVC_Open",             source: "excel", dataPath: "service.open" },
    { key: "serviceAged",             label: "Aged items",                 sourceField: "SVC_Aged",             source: "excel", dataPath: "service.aged" },
    { key: "serviceTrendIncidents",   label: "Incident trend",             sourceField: "SVC_Trend_Inc",        source: "excel", dataPath: "service.trend.incidents" },
    { key: "serviceTrendRequests",    label: "Request trend",              sourceField: "SVC_Trend_Req",        source: "excel", dataPath: "service.trend.requests" },
    { key: "serviceTrendAged",        label: "Aged trend",                 sourceField: "SVC_Trend_Aged",       source: "excel", dataPath: "service.trend.aged" },
    { key: "serviceRecurring",        label: "Recurring issue clusters",   sourceField: "SVC_Recurring",        source: "excel", dataPath: "service.recurring" },
    { key: "demandRows",              label: "Demand register rows",       sourceField: "DMD_Register",         source: "excel", dataPath: "demand.rows" },
    { key: "billingMonthTotal",       label: "Invoice total (month)",      sourceField: "FIN_Month_Total",      source: "excel", dataPath: "billing.monthTotal" },
    { key: "billingInTsa",            label: "Base TSA charge",            sourceField: "FIN_In_TSA",           source: "excel", dataPath: "billing.inTsa" },
    { key: "billingOutTsa",           label: "Chargeable outside base",    sourceField: "FIN_Out_TSA",          source: "excel", dataPath: "billing.outTsa" },
    { key: "billingLines",            label: "Invoice line items",         sourceField: "FIN_Lines",            source: "excel", dataPath: "billing.lines" },
    { key: "billingMarkets",          label: "Market breakdown",           sourceField: "FIN_Markets",          source: "excel", dataPath: "billing.markets" },
    { key: "exceptions",              label: "Exception log",              sourceField: "EXC_Log",              source: "excel", dataPath: "exceptions" },
    { key: "reportNarrative",         label: "Monthly narrative",          sourceField: "RPT_Narrative",        source: "excel", dataPath: "report.narrative" },
    { key: "reportActions",           label: "Governance actions",         sourceField: "RPT_Actions",          source: "excel", dataPath: "report.actions" },
    { key: "architecture",            label: "Architecture model",         sourceField: "ARCH_Model",           source: "excel", dataPath: "architecture" },
  ],

  CALIBRATION: {
    reportingPeriod: "May 2026",
    chartRangeLabel: "Jan – May 2026",
    workforce: {
      commitmentAmberPct: 100,
      commitmentRedPct: 102,
      replacementWindowDays: 60,
    },
    service: {
      slaTargetPct: 94,
      slaAmberPct: 90,
      agedItemDays: 20,
      agedWarnCount: 15,
    },
    hardware: {
      pendingWarnCount: 10,
      deviceCharge: 612,
    },
    software: {
      pendingApprovalWarn: 2,
    },
    billing: {
      outTsaWarnPct: 10,
    },
  },

  /** Per-source dashboard layout — card set and grid density change on toggle. */
  LAYOUT: {
    excel: {
      lastUpload: "14 May 2026, 09:42",
      kpi: {
        cols: 2,
        cards: ["workforceCurrent", "billingOutTsa", "serviceSla", "exceptionsCount"],
      },
      secondary: {
        cols: 2,
        cards: ["consumptionChart", "monthSummary"],
      },
      manualTags: ["workforceCurrent", "billingOutTsa"],
      showExceptions: true,
    },
    smartsheet: {
      kpi: {
        cols: 3,
        cards: ["liveSync", "workforceCurrent", "billingOutTsa", "serviceSla", "exceptionsCount", "connectedSheets"],
      },
      secondary: {
        cols: 3,
        cards: ["consumptionChart", "monthSummary", "recentChanges"],
      },
      manualTags: [],
      showExceptions: true,
    },
  },

  /** Smartsheet-only feed mock (not in Excel export). */
  SMARTSHEET_FEED: {
    connectedSheets: 12,
    activity: [
      { who: "D. Marsh",   what: "Moved DMD-0042 to In review",           ago: "2m ago" },
      { who: "Murphy",     what: "Validated HW row for P. Mehta",          ago: "8m ago" },
      { who: "L. Brandt",  what: "Updated Tableau approval status",        ago: "14m ago" },
      { who: "Donna M.",   what: "Flagged 38-user overage for June GovCo", ago: "22m ago" },
      { who: "B. Kowalski",what: "Added DMD-0044 from Excel register",     ago: "31m ago" },
    ],
  },
};

/** Resolve a configured input key → value from getData(). */
function resolveInput(key) {
  const entry = CONFIG.INPUTS.find(i => i.key === key);
  if (!entry) return undefined;
  return entry.dataPath.split(".").reduce((o, p) => o?.[p], getData());
}

/** Dot-path read from CONFIG.CALIBRATION, e.g. getCal("service.slaTargetPct"). */
function getCal(path) {
  return path.split(".").reduce((o, p) => o?.[p], CONFIG.CALIBRATION);
}

/** Enabled modules sorted by order. */
function getActiveModules() {
  return CONFIG.MODULES.filter(m => m.enabled).sort((a, b) => a.order - b.order);
}

/** Layout definition for the active data source. */
function getSourceLayout() {
  return CONFIG.LAYOUT[DATA_SOURCE] || CONFIG.LAYOUT.excel;
}

let _onConfigChange = null;

function onConfigChange(fn) {
  _onConfigChange = fn;
}

function notifyConfigChange() {
  if (typeof _onConfigChange === "function") _onConfigChange();
}
