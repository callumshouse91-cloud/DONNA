/* ============================================================
   DONNA · TSA Run & Control — app shell + views
   ============================================================ */

const gbp = n => "£" + Math.abs(n).toLocaleString("en-GB") + (n < 0 ? " cr" : "");
const num = n => n.toLocaleString("en-GB");
const inp = resolveInput;

let currentTab = "overview";

function commitmentPct(current, baseline) {
  return baseline ? (current / baseline) * 100 : 0;
}
function commitmentRagClass(pct) {
  if (pct >= getCal("workforce.commitmentRedPct")) return "down";
  if (pct >= getCal("workforce.commitmentAmberPct")) return "warn";
  return "up";
}
function slaRagClass(pct) {
  if (pct >= getCal("service.slaTargetPct")) return "up";
  if (pct >= getCal("service.slaAmberPct")) return "warn";
  return "down";
}
function isHighSeverity(sev) { return sev === "high"; }

/* ---------------- icons (inline, feather-style) ---------------- */
const I = {
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  workforce:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.5 3.4-5.5 6.5-5.5s5.8 2 6.5 5.5"/><circle cx="17.5" cy="9.5" r="2.5"/><path d="M16 14.7c2.7.2 4.9 2 5.5 4.8"/></svg>',
  hardware: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="11" rx="1.5"/><path d="M2 19.5h20"/></svg>',
  software: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8.5 9.5 6 12l2.5 2.5M15.5 9.5 18 12l-2.5 2.5M13 7.5l-2 9"/></svg>',
  service:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4c-1.2-.05-2.4-.4-3.4-.9L3 21l2-5.6a8.4 8.4 0 1 1 16-3.9z"/></svg>',
  demand:   '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/></svg>',
  billing:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21z"/><path d="M9.5 8h5M9.5 12h5"/></svg>',
  report:   '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg>',
  arch:     '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="5.5" cy="6" r="2.2"/><circle cx="5.5" cy="18" r="2.2"/><circle cx="18.5" cy="12" r="2.2"/><path d="M7.5 6.8 16.4 11M7.5 17.2 16.4 13"/></svg>',
};

/* ---------------- navigation (from CONFIG.MODULES) ---------------- */
const MODULE_UI = {
  overview:  { icon: I.overview, group: "Run & Control" },
  workforce: { icon: I.workforce },
  hardware:  { icon: I.hardware },
  software:  { icon: I.software },
  service:   { icon: I.service },
  demand:    { icon: I.demand },
  billing:   { icon: I.billing, pill: () => inp("exceptions").length },
  report:    { icon: I.report, group: "Outputs" },
  arch:      { icon: I.arch, group: "How it's wired" },
};

const nav = document.getElementById("nav");

function buildNav() {
  nav.innerHTML = "";
  let lastGroup = null;
  getActiveModules().forEach(m => {
    const ui = MODULE_UI[m.id] || {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
    };
    if (ui.group && ui.group !== lastGroup) {
      const lb = document.createElement("div");
      lb.className = "nav-label";
      lb.textContent = ui.group;
      nav.appendChild(lb);
      lastGroup = ui.group;
    }
    const b = document.createElement("button");
    b.className = "nav-item";
    b.dataset.tab = m.id;
    b.innerHTML = `${ui.icon || ""}<span class="txt">${m.label}</span>${ui.pill ? `<span class="pill">${ui.pill()}</span>` : ""}`;
    b.onclick = () => setTab(m.id);
    nav.appendChild(b);
  });
  const periodEl = document.querySelector(".period-pill strong");
  if (periodEl) periodEl.textContent = getCal("reportingPeriod");
}

function firstActiveTab() {
  const active = getActiveModules();
  return active.length ? active[0].id : null;
}

function isLiveSource() { return isSmartsheetPreview(); }

function cardHintFor(moduleId, cardId) {
  const c = (CONFIG.CARDS[moduleId] || []).find(x => x.id === cardId);
  return cardHintBtn(c?.hint);
}

function renderGenericCard(card) {
  if (!card.inputKey) return "";
  const val = inp(card.inputKey);
  let display = "—";
  if (typeof val === "number") {
    display = card.inputKey.includes("billing") || card.inputKey.toLowerCase().includes("cost") ? gbp(val) : num(val);
  } else if (Array.isArray(val)) display = String(val.length);
  else if (val != null) display = String(val);
  return `<div class="card kpi card-enter">
    ${kpiChrome(card.id)}
    <div class="kpi-label">${card.label} ${cardHintBtn(card.hint)}</div>
    <div class="kpi-value grad">${display}</div>
    <div class="kpi-meta">Mapped to <code>${card.inputKey}</code></div>
  </div>`;
}

function renderCustomModule(moduleId) {
  const mod = getModule(moduleId);
  const cards = getModuleCards(moduleId).filter(cardVisibleForSource);
  const kpis = cards.filter(c => c.section === "kpi");
  const kpiHtml = kpis.length
    ? kpis.map(c => c.builtin ? "" : renderGenericCard(c)).filter(Boolean).join("")
    : `<div class="empty-state card">No cards yet — open <b>Calibrate</b> to add a metric card to this module.</div>`;
  return `
    ${pageHead(moduleId, mod?.label || "Custom", "view", mod?.help?.whatItIs || "A view you configured in Calibrate.")}
    <div class="grid layout-grid kpis" style="--kpi-cols:${isLiveSource() ? 3 : 2}">${kpiHtml}</div>`;
}

function setTab(id, opts = {}) {
  const enabled = id && getActiveModules().some(m => m.id === id);
  if (!enabled) id = firstActiveTab();
  currentTab = id || "";
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.tab === id));
  document.querySelectorAll(".nav-item .pill").forEach(p => {
    const tabId = p.closest(".nav-item")?.dataset.tab;
    const ui = MODULE_UI[tabId];
    if (ui?.pill) p.textContent = ui.pill();
  });
  const viewEl = document.getElementById("view");
  if (!id) {
    viewEl.innerHTML = `<div class="empty-state card">No modules enabled — open <b>Calibrate</b> to turn a tab on.</div>`;
    return;
  }
  const render = VIEWS[id] || (() => renderCustomModule(id));
  viewEl.innerHTML = render();
  wireCardHints(viewEl);
  if (opts.sourceFadeIn) viewEl.classList.add("source-fade-in");
  if (id === "arch") wireArchitecture(opts.restartFlows);
  wireViewChrome(id, opts);
  if (!opts.silent) window.scrollTo({ top: 0 });
}

function applyConfig() {
  buildNav();
  setTab(currentTab, { restartFlows: currentTab === "arch", silent: true });
  if (calPanelOpen) renderCalPanel();
}

function kpiChrome(cardId) {
  if (isSmartsheetPreview()) return `<span class="kpi-live-dot" title="Live feed"></span>`;
  return "";
}

let liveSyncInterval = null;

function stopLiveSync() {
  if (liveSyncInterval) { clearInterval(liveSyncInterval); liveSyncInterval = null; }
}

function wireLiveSync() {
  stopLiveSync();
  const el = document.getElementById("liveSyncStatus");
  if (!el || !isLiveSource()) return;
  let secs = 0;
  const tick = () => {
    el.textContent = secs === 0 ? "Auto-synced just now" : `Auto-synced ${secs}s ago`;
    secs = secs >= 9 ? 0 : secs + 3;
  };
  tick();
  liveSyncInterval = setInterval(tick, 3000);
}

function runKpiNudge() {
  document.querySelectorAll("[data-kpi-nudge]").forEach(el => {
    const base = el.dataset.base;
    const bump = el.dataset.bump;
    const fmt = el.dataset.fmt;
    const show = v => fmt === "gbp" ? gbp(Number(v)) : fmt === "num" ? num(Number(v)) : v;
    el.textContent = show(bump);
    el.classList.add("kpi-nudge");
    setTimeout(() => {
      el.textContent = show(base);
      setTimeout(() => el.classList.remove("kpi-nudge"), 400);
    }, 550);
  });
}

function wireViewChrome(tabId, opts = {}) {
  if (isSmartsheetPreview()) {
    wireLiveSync();
    if (opts.fromSourceSwitch) runKpiNudge();
  } else {
    stopLiveSync();
  }
  if (opts.sourceFadeIn) {
    const viewEl = document.getElementById("view");
    setTimeout(() => viewEl.classList.remove("source-fade-in"), 450);
  }
}

function switchSourceView() {
  const viewEl = document.getElementById("view");
  viewEl.classList.add("source-fade-out");
  setTimeout(() => {
    viewEl.classList.remove("source-fade-out");
    setTab(currentTab, {
      restartFlows: true,
      silent: true,
      fromSourceSwitch: true,
      sourceFadeIn: true,
    });
  }, 340);
}

function updateIntegrationUI() {
  const liveCount = getLiveSystemCount();
  document.body.classList.toggle("ss-preview-on", isSmartsheetPreview());
  const toggle = document.getElementById("smartsheetPreviewToggle");
  if (toggle) toggle.checked = isSmartsheetPreview();
  const status = document.getElementById("connectorStatus");
  if (status) {
    if (isSmartsheetPreview()) {
      status.innerHTML = `<span class="live-dot" style="display:inline-block;vertical-align:-1px;margin-right:4px;width:7px;height:7px"></span><b>${liveCount + 1}</b> systems connected · Smartsheet preview on`;
    } else {
      status.innerHTML = `<b>${liveCount}</b> systems connected · live`;
    }
  }
}

function restartFlowAnimation() {
  document.querySelectorAll(".flow").forEach(p => {
    p.style.animation = "none";
    void p.getBBox();
    p.style.animation = "";
  });
}

/* ---------------- shared fragments ---------------- */
const cardTitle = (t, right = "", hint = "") =>
  `<div class="card-title"><span class="tick"></span>${t}${hint}${right ? `<span class="right">${right}</span>` : ""}</div>`;

const sevBadge = s => s === "high" ? '<span class="badge red">High</span>'
                  : s === "med"  ? '<span class="badge amber">Medium</span>'
                  : '<span class="badge grey">Low</span>';

const flaggedRow = sev => isHighSeverity(sev) ? "flagged" : "";

function overviewData() {
  const baseline = inp("tsaBaseline");
  const wCurrent = inp("workforceCurrent");
  const above = inp("workforceAboveBaseline");
  const outTsa = inp("billingOutTsa");
  const slaPct = Math.round(inp("serviceResolvedInSla") * 100);
  const exceptions = inp("exceptions");
  const commitPct = commitmentPct(wCurrent, baseline);
  return { baseline, wCurrent, above, outTsa, slaPct, exceptions, commitPct };
}

const OVERVIEW_CARDS = {
  liveSync() {
    return `<div class="card kpi live-sync-card card-enter">
      <div class="live-sync-head"><span class="live-dot"></span> Live Sync</div>
      <div class="kpi-value live-on">ON</div>
      <div class="kpi-meta live-sync-meta" id="liveSyncStatus">Auto-synced just now</div>
    </div>`;
  },
  connectedSheets() {
    return `<div class="card kpi card-enter">
      ${kpiChrome("connectedSheets")}
      <div class="kpi-label">Connected Sheets</div>
      <div class="kpi-value grad">${CONFIG.SMARTSHEET_FEED.connectedSheets}</div>
      <div class="kpi-meta">Demand · validation · governance</div>
    </div>`;
  },
  workforceCurrent(d) {
    return `<div class="card kpi card-enter">
      ${kpiChrome("workforceCurrent")}
      <div class="kpi-label">Users consuming TSA ${cardHintFor("overview", "workforceCurrent")}</div>
      <div class="kpi-value grad" data-kpi-nudge data-base="${d.wCurrent}" data-bump="${d.wCurrent + 2}" data-fmt="num">${num(d.wCurrent)}</div>
      <div class="kpi-meta">vs commitment ${num(d.baseline)} · <b class="${commitmentRagClass(d.commitPct)}">+${d.above} above</b></div>
    </div>`;
  },
  billingOutTsa(d) {
    return `<div class="card kpi card-enter">
      ${kpiChrome("billingOutTsa")}
      <div class="kpi-label">Chargeable outside base ${cardHintFor("overview", "billingOutTsa")}</div>
      <div class="kpi-value" data-kpi-nudge data-base="${d.outTsa}" data-bump="${d.outTsa + 340}" data-fmt="gbp">${gbp(d.outTsa)}</div>
      <div class="kpi-meta">${getCal("reportingPeriod")} invoice · 4 charge categories</div>
    </div>`;
  },
  serviceSla(d) {
    return `<div class="card kpi card-enter">
      ${kpiChrome("serviceSla")}
      <div class="kpi-label">Service within SLA</div>
      <div class="kpi-value ${slaRagClass(d.slaPct)}">${d.slaPct}%</div>
      <div class="kpi-meta"><b class="up">Improving</b> · target ${getCal("service.slaTargetPct")}%</div>
    </div>`;
  },
  exceptionsCount(d) {
    return `<div class="card kpi card-enter">
      ${kpiChrome("exceptionsCount")}
      <div class="kpi-label">Open exceptions</div>
      <div class="kpi-value">${d.exceptions.length}</div>
      <div class="kpi-meta">2 high · cross-system mismatches</div>
    </div>`;
  },
  consumptionChart(d) {
    return `<div class="card card-enter">
      ${cardTitle("Consumption vs TSA commitment", getCal("chartRangeLabel"))}
      ${Charts.line({ labels: inp("months"), series: [
        { name:"Users", values: inp("workforceTrendUsers"), color:"#E4007C" },
        { name:"Commitment", values: inp("workforceTrendBaseline"), color:"#9AA7B3", dash:"5 6" },
      ]})}
      <div class="legend"><span><i style="background:#E4007C"></i>Vestacy users</span><span><i style="background:#9AA7B3"></i>TSA commitment (${num(d.baseline)})</span></div>
    </div>`;
  },
  monthSummary() {
    return `<div class="card card-enter">
      ${cardTitle("What changed this month")}
      <div class="ai-block"><div class="ai-tag">DONNA summary</div>
        Consumption crossed the TSA commitment in April and is now <b>38 users over</b> (+3.0%). Of May's 24 joiners, DONNA classified <b>9 as replacement hires</b> and <b>15 as net new</b> — only the net-new count drives the overage. Service performance improved again, while <b>£22.3k</b> of chargeable activity sits outside the base charge. Two cross-system mismatches need validation before the June governance call.
      </div>
      <div class="note mt">Every number above links to source records — click any tab on the left to drill into the evidence.</div>
    </div>`;
  },
  recentChanges() {
    const items = CONFIG.SMARTSHEET_FEED.activity.map(a => `
      <li><span class="who">${a.who}</span><span class="what">${a.what}</span><span class="ago">${a.ago}</span></li>`).join("");
    return `<div class="card card-enter">
      ${cardTitle("Recent changes", "live activity feed")}
      <ul class="activity-feed">${items}</ul>
    </div>`;
  },
};

/* ---------------- views ---------------- */
const VIEWS = {

  /* ===== OVERVIEW ===== */
  overview() {
    const d = overviewData();
    const layout = getSourceLayout();
    const filterId = id => {
      const c = CONFIG.CARDS.overview?.find(x => x.id === id);
      return !c || (c.enabled !== false && cardVisibleForSource(c));
    };
    const kpiHtml = layout.kpi.cards.filter(filterId).map(id => {
      const def = CONFIG.CARDS.overview?.find(c => c.id === id);
      if (def && !def.builtin && def.inputKey) return renderGenericCard(def);
      return OVERVIEW_CARDS[id] ? OVERVIEW_CARDS[id](d) : "";
    }).join("");
    const secHtml = layout.secondary.cards.filter(filterId).map(id => OVERVIEW_CARDS[id] ? OVERVIEW_CARDS[id](d) : "").join("");
    const exceptionsHtml = layout.showExceptions ? `
    <div class="card mt card-enter">
      ${cardTitle("Exceptions requiring action", "auto-detected across systems")}
      <table>
        <tr><th>Severity</th><th>Exception</th><th>Detected between</th><th>Next action</th></tr>
        ${inp("exceptions").map(e => `
          <tr class="${flaggedRow(e.sev)}">
            <td>${sevBadge(e.sev)}</td>
            <td><b>${e.what}</b><br><span style="color:var(--ink-soft)">${e.detail}</span></td>
            <td><span class="badge teal">${e.src}</span></td>
            <td>${e.action}</td>
          </tr>`).join("")}
      </table>
    </div>` : "";
    return `
    ${pageHead("overview", "TSA position", "at a glance", `One trusted view across SuccessFactors, MSP onboarding, HAM, SAM, ServiceNow, Smartsheet and Finance — what's happening, what's changed, what's chargeable and what needs action for the Reckitt ↔ Vestacy separation.`)}

    <div class="grid layout-grid kpis" style="--kpi-cols:${layout.kpi.cols}">${kpiHtml}</div>

    <div class="grid layout-grid secondary mt" style="--sec-cols:${layout.secondary.cols}">${secHtml}</div>
    ${exceptionsHtml}`;
  },

  /* ===== WORKFORCE ===== */
  workforce() {
    const baseline = inp("tsaBaseline");
    const costPerUser = inp("tsaCostPerUser");
    const wCurrent = inp("workforceCurrent");
    const above = inp("workforceAboveBaseline");
    const commitPct = commitmentPct(wCurrent, baseline);
    const rag = commitmentRagClass(commitPct);
    return `
    ${pageHead("workforce", "Workforce", "vs TSA commitment", `SuccessFactors (permanent) joined with MSP onboarding data (contingent) to show who is consuming TSA services — and whether each joiner is a replacement hire or net new against the baseline.`)}

    <div class="grid layout-grid kpis" style="--kpi-cols:${isLiveSource() ? 3 : 2}">
      <div class="card kpi card-enter">${kpiChrome("workforceCurrent")}<div class="kpi-label">Current users</div><div class="kpi-value grad">${num(wCurrent)}</div>
        <div class="kpi-meta">${num(inp("workforcePermanent"))} permanent · ${num(inp("workforceContingent"))} contingent</div></div>
      <div class="card kpi card-enter">${kpiChrome("workforceJoiners")}<div class="kpi-label">Joiners (${getCal("reportingPeriod")})</div><div class="kpi-value">${inp("workforceJoiners")}</div>
        <div class="kpi-meta"><b>${inp("workforceReplacements")} replacement</b> · ${inp("workforceNetNew")} net new</div></div>
      <div class="card kpi card-enter">${kpiChrome("workforceLeavers")}<div class="kpi-label">Leavers (${getCal("reportingPeriod")})</div><div class="kpi-value">${inp("workforceLeavers")}</div>
        <div class="kpi-meta">Assets reconciled via HAM</div></div>
      <div class="card kpi card-enter"><div class="kpi-label">Charge exposure</div><div class="kpi-value">${gbp(above * costPerUser)}</div>
        <div class="kpi-meta">${above} over × £${costPerUser}/user/mo</div></div>
    </div>

    <div class="grid cols-2 mt">
      <div class="card">
        ${cardTitle("Joiners vs leavers")}
        ${Charts.bars({ labels: inp("months"), series: [
          { name:"Joiners", values: inp("workforceTrendJoiners"), color:"#E4007C" },
          { name:"Leavers", values: inp("workforceTrendLeavers"), color:"#FF8A3C" },
        ]})}
        <div class="legend"><span><i style="background:#E4007C"></i>Joiners</span><span><i style="background:#FF8A3C"></i>Leavers</span></div>
      </div>
      <div class="card">
        ${cardTitle("How DONNA classifies a joiner")}
        <div class="ai-block"><div class="ai-tag">Replacement-hire logic</div>
          When a joiner appears in SuccessFactors or the MSP tracker, DONNA looks for a leaver in the same role family and cost centre within a rolling <b>${getCal("workforce.replacementWindowDays")}-day</b> window. A match is tagged <b>replacement hire</b> (no impact on the baseline); no match is tagged <b>net new</b> and counts toward the commitment. The classification is shown on every record so it can be challenged at governance.
        </div>
        <div class="mt" style="display:flex;align-items:center;gap:14px">
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink-soft)"><span>Commitment used</span><b>${num(wCurrent)} / ${num(baseline)}</b></div>
            <div class="bar-wrap" style="margin-top:6px"><div class="bar-fill" style="width:${Math.min(100, commitPct)}%"></div></div>
            <div style="font-size:11px;color:var(--${rag === "down" ? "red" : rag === "warn" ? "amber" : "green"});margin-top:6px;font-weight:600">${commitPct.toFixed(0)}% — ${above} users above the agreed threshold</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt">
      ${cardTitle("This month's movements", "linked to onboarding & hardware")}
      <table>
        <tr><th>Person</th><th>Population</th><th>Movement</th><th>Classification</th><th>Hardware</th><th>Source</th></tr>
        ${inp("workforceMovers").map(m => `
        <tr>
          <td><b>${m.name}</b></td>
          <td>${m.type}</td>
          <td>${m.movement === "Joiner" ? '<span class="badge green">Joiner</span>' : '<span class="badge grey">Leaver</span>'}</td>
          <td>${m.class === "Net new" ? '<span class="badge pink">Net new</span>' : m.class === "Replacement hire" ? '<span class="badge teal">Replacement</span>' : "—"}</td>
          <td>${m.hw}</td>
          <td><span class="badge grey">${m.src}</span></td>
        </tr>`).join("")}
      </table>
    </div>`;
  },

  /* ===== HARDWARE ===== */
  hardware() {
    const pending = inp("hardwarePendingRequests");
    const chargeable = inp("hardwareChargeableMonth");
    const deviceCharge = getCal("hardware.deviceCharge");
    const mix = inp("hardwareMix");
    const check = v => v ? "✓" : "—";
    return `
    ${pageHead("hardware", "EUC &", "hardware", `HAM allocation joined to onboarding records: who received a laptop, who is BYOD, whether the device is Reckitt- or Vestacy-provided, and where a charge should apply. The validation view below replaces the manual check Murphy runs today.`)}

    <div class="grid kpis">
      <div class="card kpi"><div class="kpi-label">Laptops issued</div><div class="kpi-value">${num(inp("hardwareLaptopsIssued"))}</div><div class="kpi-meta">Reckitt-provided estate</div></div>
      <div class="card kpi"><div class="kpi-label">BYOD users</div><div class="kpi-value">${num(inp("hardwareByod"))}</div><div class="kpi-meta">No device charge applies</div></div>
      <div class="card kpi"><div class="kpi-label">Pending requests</div><div class="kpi-value ${pending >= getCal("hardware.pendingWarnCount") ? "warn" : ""}">${pending}</div><div class="kpi-meta">${getCal("hardware.pendingWarnCount")}+ days · linked SNOW incidents</div></div>
      <div class="card kpi"><div class="kpi-label">Chargeable devices (${getCal("reportingPeriod")})</div><div class="kpi-value grad">${chargeable}</div><div class="kpi-meta">New-joiner hardware · ${gbp(chargeable * deviceCharge)}</div></div>
    </div>

    <div class="grid cols-2 mt">
      <div class="card" style="display:flex;gap:18px;align-items:center">
        <div>${Charts.donut({ items: mix, centerTop: num(mix.reduce((a,b)=>a+b.value,0)), centerBottom: "tracked users" })}</div>
        <div style="flex:1">
          ${cardTitle("Estate mix")}
          ${mix.map(m => `<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:5px 0;border-bottom:1px solid #F0F3F6">
            <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${m.color};margin-right:8px"></i>${m.label}</span><b>${num(m.value)}</b></div>`).join("")}
        </div>
      </div>
      <div class="card">
        ${cardTitle("Why this view exists")}
        <div class="ai-block"><div class="ai-tag">From the requirements</div>
          Hardware checks are currently manual. DONNA joins each onboarding record to HAM so the reconciliation is produced automatically — <b>onboarded → requested → issued / BYOD → charge</b> — and only the mismatches need a human decision. One mismatch is open this month: a device issued with no onboarding record behind it.
        </div>
      </div>
    </div>

    <div class="card mt">
      ${cardTitle("Onboarding ↔ hardware validation", "the Murphy view")}
      <table>
        <tr><th>User</th><th>Onboarded</th><th>HW requested</th><th>Issued</th><th>BYOD</th><th>Provider</th><th>Month</th><th class="num">Charge</th><th>Status</th></tr>
        ${inp("hardwareValidation").map(v => `
        <tr class="${v.status === "mismatch" ? "flagged" : ""}">
          <td><b>${v.user}</b></td>
          <td>${check(v.onboarded)}</td><td>${check(v.requested)}</td><td>${check(v.issued)}</td><td>${check(v.byod)}</td>
          <td>${v.provider}</td><td>${v.month}</td>
          <td class="num">${v.charge ? gbp(v.charge) : "—"}</td>
          <td>${v.status === "ok" ? '<span class="badge green">OK</span>'
              : v.status === "charge" ? '<span class="badge pink">Chargeable</span>'
              : v.status === "pending" ? '<span class="badge amber">Pending</span>'
              : '<span class="badge red">Mismatch</span>'}</td>
        </tr>`).join("")}
      </table>
    </div>`;
  },

  /* ===== SOFTWARE ===== */
  software() {
    const pendingCount = inp("softwareItems").filter(it => it.approved === "Pending").length;
    const pendingWarn = pendingCount >= getCal("software.pendingApprovalWarn");
    return `
    ${pageHead("software", "Software &", "licensing", `SAM allocation classified against the TSA catalogue: standard provision, right-to-use continuations, and non-standard requests with their approval status and cost impact — by month and cumulatively.`)}

    <div class="grid kpis">
      <div class="card kpi"><div class="kpi-label">Standard (in TSA)</div><div class="kpi-value">${gbp(inp("softwareStandardCost"))}</div><div class="kpi-meta">No additional charge</div></div>
      <div class="card kpi"><div class="kpi-label">Non-standard (${getCal("reportingPeriod")})</div><div class="kpi-value grad">${gbp(inp("softwareNonStandardCost"))}</div><div class="kpi-meta">Chargeable to Vestacy</div></div>
      <div class="card kpi"><div class="kpi-label">Cumulative non-standard</div><div class="kpi-value">${gbp(inp("softwareCumulative"))}</div><div class="kpi-meta">Since TSA start</div></div>
      <div class="card kpi"><div class="kpi-label">Awaiting approval</div><div class="kpi-value ${pendingWarn ? "warn" : ""}">${pendingCount}</div><div class="kpi-meta">threshold ≥ ${getCal("software.pendingApprovalWarn")}</div></div>
    </div>

    <div class="grid cols-2 mt">
      <div class="card">
        ${cardTitle("Non-standard software cost", "monthly, £")}
        ${Charts.line({ labels: inp("months"), series: [
          { name:"Non-standard", values: inp("softwareTrendNonStd"), color:"#FF8A3C" },
        ], yFmt: v => "£" + (v/1000).toFixed(1) + "k"})}
      </div>
      <div class="card">
        ${cardTitle("How an exception is evidenced")}
        <div class="ai-block"><div class="ai-tag">Worked example</div>
          A Vestacy user requests software outside the standard catalogue → DONNA flags it as <b>non-standard</b>, records the <b>request month</b>, tracks the <b>approval</b> in Smartsheet/SNOW, prices the <b>monthly and cumulative cost</b> from SAM, and matches it to the <b>invoice line</b> — so when billing shows a charge, the who/when/why is already attached.
        </div>
      </div>
    </div>

    <div class="card mt">
      ${cardTitle("Software register", "standard · non-standard · right-to-use")}
      <table>
        <tr><th>User / group</th><th>Software</th><th>Class</th><th>Requested</th><th>Approval</th><th class="num">£ / month</th><th class="num">Cumulative</th><th>Chargeable</th></tr>
        ${inp("softwareItems").map(it => `
        <tr class="${it.approved === "Pending" ? "flagged" : ""}">
          <td><b>${it.user}</b></td><td>${it.sw}</td>
          <td>${it.cls === "Standard" ? '<span class="badge green">Standard</span>' : it.cls === "Right-to-use" ? '<span class="badge purple">Right-to-use</span>' : '<span class="badge pink">Non-standard</span>'}</td>
          <td>${it.requested}</td>
          <td>${it.approved === "Approved" || it.approved === "Auto" ? `<span class="badge green">${it.approved}</span>` : it.approved === "Pending" ? '<span class="badge amber">Pending</span>' : '<span class="badge red">Rejected</span>'}</td>
          <td class="num">${it.monthly ? gbp(it.monthly) : "—"}</td>
          <td class="num">${it.cum ? gbp(it.cum) : "—"}</td>
          <td>${it.chargeable ? "Yes" : "No"}</td>
        </tr>`).join("")}
      </table>
    </div>`;
  },

  /* ===== SERVICE ===== */
  service() {
    const slaPct = Math.round(inp("serviceResolvedInSla") * 100);
    const aged = inp("serviceAged");
    const agedDays = getCal("service.agedItemDays");
    const agedWarn = aged >= getCal("service.agedWarnCount");
    return `
    ${pageHead("service", "Service", "activity", `ServiceNow summarised for the month: incidents, service requests and demand, resolution performance, aged items and recurring issues — with the month-on-month movement the governance call needs.`)}

    <div class="grid kpis">
      <div class="card kpi"><div class="kpi-label">Incidents (${getCal("reportingPeriod")})</div><div class="kpi-value">${inp("serviceIncidents")}</div><div class="kpi-meta"><b class="up">▼ 3.7%</b> vs prior month</div></div>
      <div class="card kpi"><div class="kpi-label">Service requests</div><div class="kpi-value">${inp("serviceRequests")}</div><div class="kpi-meta"><b class="warn">▲ 2.6%</b> — joiner driven</div></div>
      <div class="card kpi"><div class="kpi-label">Resolved in SLA</div><div class="kpi-value grad ${slaRagClass(slaPct)}">${slaPct}%</div><div class="kpi-meta">Target ${getCal("service.slaTargetPct")}% · open: ${inp("serviceOpen")}</div></div>
      <div class="card kpi"><div class="kpi-label">Aged > ${agedDays} days</div><div class="kpi-value ${agedWarn ? "warn" : ""}">${aged}</div><div class="kpi-meta">warn ≥ ${getCal("service.agedWarnCount")}</div></div>
    </div>

    <div class="grid cols-2 mt">
      <div class="card">
        ${cardTitle("Volume trend", "incidents & requests")}
        ${Charts.line({ labels: inp("months"), series: [
          { name:"Incidents", values: inp("serviceTrendIncidents"), color:"#6C2D82" },
          { name:"Requests",  values: inp("serviceTrendRequests"),  color:"#4FB3E8" },
        ]})}
        <div class="legend"><span><i style="background:#6C2D82"></i>Incidents</span><span><i style="background:#4FB3E8"></i>Service requests</span></div>
      </div>
      <div class="card">
        ${cardTitle("Aged items trend")}
        ${Charts.bars({ labels: inp("months"), series: [
          { name:"Aged", values: inp("serviceTrendAged"), color:"#FF4F58" },
        ]})}
        <div class="note mt">Service performance is <b>improving month-on-month</b>: falling incidents and aged items with SLA attainment held at ${getCal("service.slaTargetPct")}%.</div>
      </div>
    </div>

    <div class="card mt">
      ${cardTitle("Recurring issues", "auto-clustered from ticket text")}
      <table>
        <tr><th>Issue cluster</th><th class="num">Tickets (${getCal("reportingPeriod")})</th><th>Direction</th><th>Note</th></tr>
        ${inp("serviceRecurring").map(r => `
        <tr>
          <td><b>${r.issue}</b></td>
          <td class="num">${r.count}</td>
          <td>${r.dir === "down" ? '<span class="badge green">Falling</span>' : r.dir === "up" ? '<span class="badge red">Rising</span>' : '<span class="badge grey">Flat</span>'}</td>
          <td style="color:var(--ink-soft)">${r.note}</td>
        </tr>`).join("")}
      </table>
    </div>`;
  },

  /* ===== DEMAND ===== */
  demand() {
    const rows = inp("demandRows");
    const open = rows.filter(r => r.stage !== "Approved").length;
    const outside = rows.filter(r => r.scope === "Outside TSA");
    return `
    ${pageHead("demand", "Demand &", "approvals", `Demand raised during the TSA period — whether it arrives via ServiceNow, Smartsheet or legacy Excel templates — tracked through approval with cost and TSA-scope flags, ready for monthly governance.`)}

    <div class="grid kpis">
      <div class="card kpi"><div class="kpi-label">New demands (${getCal("reportingPeriod")})</div><div class="kpi-value">${rows.length}</div><div class="kpi-meta">3 sources, one register</div></div>
      <div class="card kpi"><div class="kpi-label">Awaiting decision</div><div class="kpi-value warn">${open}</div><div class="kpi-meta">For next governance</div></div>
      <div class="card kpi"><div class="kpi-label">Outside TSA scope</div><div class="kpi-value grad">${outside.length}</div><div class="kpi-meta">${gbp(outside.reduce((a,b)=>a+b.cost,0))} estimated</div></div>
      <div class="card kpi"><div class="kpi-label">Capture gaps</div><div class="kpi-value">1</div><div class="kpi-meta">Excel-only record (DMD-0044)</div></div>
    </div>

    <div class="card mt">
      ${cardTitle("Demand register", "ServiceNow · Smartsheet · Excel")}
      <table>
        <tr><th>ID</th><th>Demand</th><th>Owner</th><th>Captured in</th><th>Stage</th><th>TSA scope</th><th class="num">Est. cost</th></tr>
        ${rows.map(r => `
        <tr class="${r.flag ? "flagged" : ""}">
          <td><b>${r.id}</b></td><td>${r.title}</td><td>${r.owner}</td>
          <td><span class="badge grey">${r.source}</span></td>
          <td>${r.stage === "Approved" ? '<span class="badge green">Approved</span>' : r.stage === "Awaiting approval" ? '<span class="badge amber">Awaiting approval</span>' : `<span class="badge grey">${r.stage}</span>`}</td>
          <td>${r.scope === "Outside TSA" ? '<span class="badge pink">Outside TSA</span>' : '<span class="badge teal">Inside TSA</span>'}</td>
          <td class="num">${gbp(r.cost)}</td>
        </tr>`).join("")}
      </table>
      <div class="note mt">Anything <b>outside TSA scope</b> is automatically flagged, costed and carried into the Billing & Exceptions view and the monthly governance pack.</div>
    </div>`;
  },

  /* ===== BILLING ===== */
  billing() {
    const bTotal = inp("billingMonthTotal");
    const outTsa = inp("billingOutTsa");
    const outPct = bTotal ? ((outTsa / bTotal) * 100).toFixed(1) : 0;
    const outWarn = parseFloat(outPct) >= getCal("billing.outTsaWarnPct");
    return `
    ${pageHead("billing", "Billing &", "exceptions", `Every invoice line matched back to the user, asset, licence or demand that evidences it — separating the base TSA charge from chargeable activity, with market and cost-centre cuts for reporting.`)}

    <div class="grid kpis">
      <div class="card kpi"><div class="kpi-label">${getCal("reportingPeriod")} invoice total</div><div class="kpi-value">${gbp(bTotal)}</div><div class="kpi-meta">All TSA services</div></div>
      <div class="card kpi"><div class="kpi-label">Base TSA charge</div><div class="kpi-value">${gbp(inp("billingInTsa"))}</div><div class="kpi-meta">Per agreed schedule</div></div>
      <div class="card kpi"><div class="kpi-label">Chargeable outside base</div><div class="kpi-value grad ${outWarn ? "warn" : ""}">${gbp(outTsa)}</div><div class="kpi-meta">${outPct}% of invoice · warn ≥ ${getCal("billing.outTsaWarnPct")}%</div></div>
      <div class="card kpi"><div class="kpi-label">Lines on hold</div><div class="kpi-value warn">1</div><div class="kpi-meta">Approval evidence pending</div></div>
    </div>

    <div class="grid cols-2 mt">
      <div class="card">
        ${cardTitle("Invoice breakdown", getCal("reportingPeriod"))}
        <table>
          <tr><th>Line</th><th>Evidence basis</th><th>Scope</th><th class="num">Amount</th></tr>
          ${inp("billingLines").map(l => `
          <tr>
            <td><b>${l.line}</b></td>
            <td style="color:var(--ink-soft)">${l.basis}</td>
            <td>${l.scope === "Chargeable" ? '<span class="badge pink">Chargeable</span>' : '<span class="badge teal">Inside TSA</span>'}</td>
            <td class="num">${l.amount < 0 ? "−" + gbp(l.amount) : gbp(l.amount)}</td>
          </tr>`).join("")}
        </table>
      </div>
      <div class="card">
        ${cardTitle("By market", "users & cost")}
        <table>
          <tr><th>Market</th><th class="num">Users</th><th class="num">Cost</th><th>Share</th></tr>
          ${inp("billingMarkets").map(m => `
          <tr>
            <td><b>${m.market}</b></td>
            <td class="num">${num(m.users)}</td>
            <td class="num">${gbp(m.cost)}</td>
            <td style="width:30%"><div class="bar-wrap"><div class="bar-fill" style="width:${Math.round(m.cost/bTotal*100)}%"></div></div></td>
          </tr>`).join("")}
        </table>
        <div class="note mt">Market / business-unit / cost-centre cuts come from joining Finance extracts to SuccessFactors org data.</div>
      </div>
    </div>

    <div class="card mt">
      ${cardTitle("Exception log", "chargeable activity & data gaps")}
      <table>
        <tr><th>Severity</th><th>Exception</th><th>Detected between</th><th>Action</th></tr>
        ${inp("exceptions").map(e => `
          <tr class="${flaggedRow(e.sev)}">
          <td>${sevBadge(e.sev)}</td>
          <td><b>${e.what}</b><br><span style="color:var(--ink-soft)">${e.detail}</span></td>
          <td><span class="badge teal">${e.src}</span></td>
          <td>${e.action}</td>
        </tr>`).join("")}
      </table>
    </div>`;
  },

  /* ===== REPORT ===== */
  report() {
    const narrative = inp("reportNarrative");
    const actions = inp("reportActions");
    return `
    ${pageHead("report", "Monthly TSA", "report", `DONNA assembles the monthly pack — performance summary, service and billing positions, workforce vs commitment, exceptions and actions — and drafts the narrative for the Reckitt ↔ Vestacy governance call. Humans review; nothing is sent unchecked.`)}

    <div class="grid cols-2">
      <div class="card">
        ${cardTitle("Draft narrative", "generated · awaiting review")}
        <div class="ai-block"><div class="ai-tag">DONNA draft — ${getCal("reportingPeriod")}</div>
          ${narrative.split("\n\n").map(p => `<p style="margin-bottom:10px">${p}</p>`).join("")}
        </div>
      </div>
      <div>
        <div class="card">
          ${cardTitle("Pack contents", "every section auto-populated")}
          <table>
            ${[
              ["Overall TSA performance summary","Overview"],
              ["Key actions Vestacy ↔ Reckitt","Governance log"],
              ["Service performance & trends","Service Activity"],
              ["Tickets, incidents & SR summary","Service Activity"],
              ["Billing & invoice summary","Billing & Exceptions"],
              ["Items charged outside TSA","Billing & Exceptions"],
              ["EUC, laptop & software summary","Hardware / Software"],
              ["Workforce vs commitment","Workforce"],
              ["Exceptions, risks & escalations","Exception log"],
            ].map(([a,b]) => `<tr><td><b>${a}</b></td><td><span class="badge grey">${b}</span></td></tr>`).join("")}
          </table>
        </div>
        <div class="card mt">
          ${cardTitle("Governance actions", "owned & dated")}
          <table>
            <tr><th>Action</th><th>Owner</th><th>Due</th><th>Status</th></tr>
            ${actions.map(a => `
            <tr><td>${a.action}</td><td><b>${a.owner}</b></td><td>${a.due}</td>
            <td>${a.status === "Open" ? '<span class="badge amber">Open</span>' : '<span class="badge teal">In progress</span>'}</td></tr>`).join("")}
          </table>
        </div>
      </div>
    </div>`;
  },

  /* ===== ARCHITECTURE ===== */
  arch() {
    return `
    ${pageHead("arch", "How DONNA", "is wired", `The intelligence layer sits above the run systems — it doesn't replace them. Seven sources land into one model, identity resolution links people to everything they consume, the TSA rules engine decides what's chargeable, and the AI layer drafts the narrative. Click any source to see its feed.`)}

    <div class="arch-wrap">
      <div class="card arch-svg-card"><div id="archSvg"></div></div>
      <div class="card arch-detail" id="archDetail"></div>
    </div>

    <div class="grid cols-3 mt">
      ${inp("architecture").core.map(c => `
      <div class="card flat">
        ${cardTitle(c.name)}
        <p style="font-size:12.5px;line-height:1.6;color:var(--ink-soft)">${c.desc}</p>
      </div>`).join("")}
    </div>

    <div class="card mt">
      ${cardTitle("Design positioning", "from the brief")}
      <p style="font-size:12.5px;line-height:1.7;color:var(--ink-soft)">
        DONNA is deliberately a <b>practical run capability for the c.18-month separation period</b>, not a long-term strategic platform.
        It reads from the systems of record — it never writes back — so it can be stood up quickly, and stood down cleanly when the TSA with Vestacy ends in ${inp("tsaEndDate")}.
        Smartsheet will host demand registers and governance actions when it goes live — the preview toggle shows how that enriches the dashboard.
      </p>
    </div>`;
  },
};

/* ---------------- architecture diagram ---------------- */
function wireArchitecture(restartFlows = false) {
  const A = inp("architecture");
  const ingest = getIngestMeta();
  const ingestColor = isSmartsheetPreview() ? "#00A3A1" : "#E4007C";
  const W = 980, H = 600;
  const srcX = 16, srcW = 168, srcH = 52, srcGap = 17;
  const ingestH = 48, ingestGap = 14;
  const srcY0 = 30 + ingestH + ingestGap + 8;
  const coreX = 300, coreW = 380, coreY = 48, coreH = 452;
  const outX = 748, outW = 216, outH = 64, outGap = 28, outY0 = 140;
  const ingestY = 38;
  const ingestEntryY = coreY + 56;

  let s = `<svg class="arch-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  // defs
  s += `<defs>
    <linearGradient id="rkgrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E4007C"/><stop offset="0.55" stop-color="#FF4F58"/><stop offset="1" stop-color="#FF8A3C"/>
    </linearGradient>
  </defs>`;

  // column labels
  const colLabel = (x, t) => `<text x="${x}" y="20" font-family="Oswald" font-size="11" letter-spacing="1.5" fill="#9AA7B3">${t}</text>`;
  s += colLabel(srcX, "SOURCE SYSTEMS") + colLabel(coreX, "DONNA INTELLIGENCE LAYER") + colLabel(outX, "OUTPUTS");

  // primary data-ingestion node (swaps with source toggle)
  const ingestCy = ingestY + ingestH / 2;
  s += `<path id="flow-primary" class="flow" d="M ${srcX + srcW} ${ingestCy} C ${srcX + srcW + 75} ${ingestCy}, ${coreX - 75} ${ingestEntryY}, ${coreX} ${ingestEntryY}"
        fill="none" stroke="${ingestColor}" stroke-width="2.8" opacity="0.85"/>`;
  s += `<g class="arch-node arch-ingest" data-src="primary">
    <rect x="${srcX}" y="${ingestY}" width="${srcW}" height="${ingestH}" rx="11" fill="#FFF9F4" stroke="${ingestColor}" stroke-width="2" style="filter:drop-shadow(0 4px 10px rgba(62,76,94,.12))"/>
    <rect x="${srcX}" y="${ingestY}" width="5" height="${ingestH}" rx="2.5" fill="${ingestColor}"/>
    <text x="${srcX + 16}" y="${ingestY + 16}" class="arch-ingest-label" font-family="Poppins" font-size="8.5" fill="#9AA7B3">DATA INGESTION</text>
    <text x="${srcX + 16}" y="${ingestY + 33}" font-family="Oswald" font-size="12.5" font-weight="600" fill="#3E4C5E" letter-spacing="0.4">${ingest.label.toUpperCase()}</text>
    <text x="${srcX + 16}" y="${ingestY + 44}" font-size="9" fill="#9AA7B3">${ingest.connector}</text>
  </g>`;

  // core container
  s += `<rect x="${coreX}" y="${coreY}" width="${coreW}" height="${coreH}" rx="20" fill="#FFF4F9" stroke="url(#rkgrad)" stroke-width="1.6"/>`;

  // core stages stacked
  const stageH = 86, stageGap = 18, stageX = coreX + 26, stageW = coreW - 52;
  const stageY = i => coreY + 28 + i * (stageH + stageGap);
  A.core.forEach((c, i) => {
    const y = stageY(i);
    s += `<rect x="${stageX}" y="${y}" width="${stageW}" height="${stageH}" rx="12" fill="#fff" stroke="#F3CEE2"/>`;
    s += `<text x="${stageX + 16}" y="${y + 26}" font-family="Oswald" font-size="13.5" font-weight="600" fill="#3E4C5E" letter-spacing="0.5">${(i+1)}. ${c.name.toUpperCase()}</text>`;
    // wrap description crudely
    const words = c.desc.split(" ");
    let lineTxt = "", lines = [];
    words.forEach(wd => { if ((lineTxt + wd).length > 46) { lines.push(lineTxt); lineTxt = ""; } lineTxt += wd + " "; });
    lines.push(lineTxt);
    lines.slice(0, 3).forEach((ln, li) => {
      s += `<text x="${stageX + 16}" y="${y + 44 + li * 14}" font-size="10.5" fill="#71808F">${ln.trim()}</text>`;
    });
    if (i < A.core.length - 1) {
      const cx = stageX + stageW / 2;
      s += `<path d="M ${cx} ${y + stageH} l 0 ${stageGap - 6} m -5 -7 l 5 7 l 5 -7" fill="none" stroke="#E4007C" stroke-width="2" stroke-linecap="round"/>`;
    }
  });

  // sources + flows into the core (entry points spread down the left edge)
  A.sources.forEach((src, i) => {
    const y = srcY0 + i * (srcH + srcGap);
    const cy = y + srcH / 2;
    const entryY = coreY + 56 + i * ((coreH - 112) / (A.sources.length - 1));
    // flow path (drawn first so nodes sit on top)
    s += `<path id="flow-${src.id}" class="flow" d="M ${srcX + srcW} ${cy} C ${srcX + srcW + 75} ${cy}, ${coreX - 75} ${entryY}, ${coreX} ${entryY}"
          fill="none" stroke="${src.color}" stroke-width="2" opacity="0.55"/>`;
    s += `<g class="arch-node ${src.id === "ss" && isSmartsheetPreview() ? "arch-active" : ""}" data-src="${src.id}">
      <rect x="${srcX}" y="${y}" width="${srcW}" height="${srcH}" rx="11" fill="#fff" stroke="#E3E8EE" stroke-width="1.5" style="filter:drop-shadow(0 3px 8px rgba(62,76,94,.10))"/>
      <rect x="${srcX}" y="${y}" width="5" height="${srcH}" rx="2.5" fill="${src.color}"/>
      <text x="${srcX + 16}" y="${y + 22}" font-family="Oswald" font-size="12.5" font-weight="600" fill="#3E4C5E" letter-spacing="0.4">${src.name.toUpperCase()}</text>
      <text x="${srcX + 16}" y="${y + 39}" font-size="9.5" fill="#9AA7B3">${src.feeds.length > 34 ? src.feeds.slice(0, 33) + "…" : src.feeds}</text>
    </g>`;
  });

  // outputs + flows
  A.outputs.forEach((o, i) => {
    const y = outY0 + i * (outH + outGap);
    const cy = y + outH / 2;
    const fromY = stageY(3) + stageH / 2 - 40 + i * 40;
    s += `<path class="flow" d="M ${coreX + coreW} ${fromY} C ${coreX + coreW + 50} ${fromY}, ${outX - 50} ${cy}, ${outX} ${cy}" fill="none" stroke="url(#rkgrad)" stroke-width="2.2" opacity="0.8"/>`;
    s += `<rect x="${outX}" y="${y}" width="${outW}" height="${outH}" rx="12" fill="url(#rkgrad)" style="filter:drop-shadow(0 5px 12px rgba(228,0,124,.3))"/>`;
    s += `<text x="${outX + outW / 2}" y="${cy + 4}" text-anchor="middle" font-family="Oswald" font-size="11.5" font-weight="600" fill="#fff" letter-spacing="0.5">${o.name.toUpperCase()}</text>`;
  });

  s += `</svg>`;
  document.getElementById("archSvg").innerHTML = s;

  const detail = document.getElementById("archDetail");
  function showSource(id) {
    if (id === "primary") {
      const m = getIngestMeta();
      document.querySelectorAll(".arch-node").forEach(n => n.classList.toggle("sel", n.dataset.src === id));
      document.querySelectorAll(".flow[id^='flow-']").forEach(p => {
        const on = p.id === "flow-primary";
        p.setAttribute("stroke-width", on ? 3.5 : 2);
        p.setAttribute("opacity", on ? 1 : 0.3);
      });
      detail.innerHTML = `
        <span class="sys-type" style="color:${ingestColor}">Integration layer</span>
        <h4>${m.label}</h4>
        <p style="font-size:12px;color:var(--ink-soft);line-height:1.6">
          DONNA ingests live feeds from ${getLiveSystemCount()} connected systems${isSmartsheetPreview() ? " plus Smartsheet (preview)" : ""}.
          ${m.connector} — everything downstream stays the same when Smartsheet goes live.
        </p>
        <dl>
          <dt>Connector</dt><dd>${m.connector}</dd>
          <dt>Sync</dt><dd>${m.sync}</dd>
          <dt>Status</dt><dd>Active</dd>
        </dl>`;
      return;
    }
    const src = A.sources.find(x => x.id === id);
    const ssLive = id === "ss" && isSmartsheetPreview();
    document.querySelectorAll(".arch-node").forEach(n => n.classList.toggle("sel", n.dataset.src === id));
    document.querySelectorAll(".flow[id^='flow-']").forEach(p => {
      p.setAttribute("stroke-width", p.id === "flow-" + id ? 3.5 : 2);
      p.setAttribute("opacity", p.id === "flow-" + id ? 1 : 0.3);
    });
    detail.innerHTML = `
      <span class="sys-type" style="color:${src.color}">Source system</span>
      <h4>${src.name}${ssLive ? ' <span class="badge green">Live</span>' : id === "ss" ? ' <span class="badge grey">Planned</span>' : ""}</h4>
      <p style="font-size:12px;color:var(--ink-soft);line-height:1.6">${src.role}</p>
      <dl>
        <dt>Feeds</dt><dd>${src.feeds}</dd>
        <dt>Frequency</dt><dd>${src.freq}</dd>
      </dl>
      <div style="font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);font-weight:700;margin-top:14px">Key fields joined</div>
      <ul>${src.keys.map(k => `<li>${k}</li>`).join("")}</ul>`;
  }
  document.querySelectorAll(".arch-node").forEach(n => n.addEventListener("click", () => showSource(n.dataset.src)));
  showSource("primary");
  if (restartFlows) restartFlowAnimation();
}

/* ---------------- Smartsheet preview toggle ---------------- */
document.getElementById("smartsheetPreviewToggle").addEventListener("change", e => {
  setSmartsheetPreview(e.target.checked);
});

onSmartsheetPreviewChange(() => {
  updateIntegrationUI();
  switchSourceView();
});

/* ---------------- easter egg ---------------- */
let brandClicks = 0, brandTimer;
document.getElementById("brand").addEventListener("click", () => {
  brandClicks++;
  clearTimeout(brandTimer);
  brandTimer = setTimeout(() => (brandClicks = 0), 900);
  if (brandClicks >= 3) {
    brandClicks = 0;
    const t = document.getElementById("toast");
    t.textContent = "Good morning, Donna 👋 — yes, it's named after you.";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3200);
  }
});

/* ---------------- boot ---------------- */
if (isSmartsheetPreview()) document.body.classList.add("ss-preview-on");
wireHelpUi();
wireCalibrateUi();
calBackdrop.addEventListener("click", closeCalPanel);
updateIntegrationUI();
buildNav();
setTab("overview");
showWelcomeIfNeeded();
